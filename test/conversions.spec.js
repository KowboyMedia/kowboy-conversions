// Each acceptance criterion in docs/strategy.md as a named test, in a real browser. Clarity's own
// script is never fetched: its address answers with nothing, and the calls queue on its stub.
const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const script = readFileSync(join(__dirname, '..', 'kowboy-conversions.js'), 'utf8');

/** A page with the given body, the settings and the script, and the Clarity calls it made. */
async function open(page, { body, settings, before = '' }) {
  await page.route('https://www.clarity.ms/**', (route) => route.fulfill({ body: '' }));
  await page.route('https://site.test/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><head><script></script></head><body>${body}
        <script>${before}</script>
        <script>window.kowboyConversions = ${JSON.stringify(settings)};</script>
        <script>${script}</script></body></html>`,
    }),
  );
  await page.goto('https://site.test/salj/');
}

/** The calls on Clarity's queue, as arrays. */
const calls = (page) => page.evaluate(() => (window.clarity.q || window.__calls || []).map((c) => [...c]));
const recorder = 'window.__calls = []; window.clarity = function () { window.__calls.push(arguments); };';
const events = async (page) => (await calls(page)).filter((c) => c[0] === 'event').map((c) => c[1]);

const form = `<button id="open">Boka värdering</button>
  <form id="lead"><input name="name"><input name="email"><button>Skicka</button></form>
  <p id="thanks" hidden>Tack!</p>`;

test('AC1: open, start and submit are counted for a form, each with its page', async ({ page }) => {
  await open(page, {
    body: form,
    before: recorder,
    settings: { forms: [{ name: 'valuation', open: '#open', form: '#lead', submit: { event: 'sent' } }] },
  });
  await page.click('#open');
  await page.fill('[name=name]', 'A');
  await page.evaluate(() => document.querySelector('#lead').dispatchEvent(new Event('sent', { bubbles: true })));
  expect(await calls(page)).toEqual([
    ['set', 'valuation_form_page', '/salj/'], ['event', 'valuation_form_open'],
    ['set', 'valuation_form_page', '/salj/'], ['event', 'valuation_form_start'],
    ['set', 'valuation_form_page', '/salj/'], ['event', 'valuation_form_submit'],
  ]);
});

test('AC2: start is counted once per filling, and again after a submit', async ({ page }) => {
  await open(page, { body: form, before: recorder, settings: { forms: [{ name: 'valuation', form: '#lead', submit: { shown: '#thanks' } }] } });
  await page.fill('[name=name]', 'A');
  await page.fill('[name=email]', 'a@example.com');
  await page.evaluate(() => { document.querySelector('#thanks').hidden = false; });
  await page.evaluate(() => { document.querySelector('#thanks').hidden = true; });
  await page.fill('[name=name]', 'B');
  await expect.poll(() => events(page)).toEqual(['valuation_form_start', 'valuation_form_submit', 'valuation_form_start']);
});

test('AC3: a form inside an open shadow root is counted', async ({ page }) => {
  await open(page, {
    body: '<div id="host"></div>',
    before: `${recorder} document.querySelector('#host').attachShadow({ mode: 'open' }).innerHTML = '<form id="inner"><input name="name"></form>';`,
    settings: { forms: [{ name: 'contact', form: '#inner', submit: { event: 'done' } }] },
  });
  await page.locator('#host input').fill('A');
  await page.evaluate(() =>
    document.querySelector('#host').shadowRoot.querySelector('#inner').dispatchEvent(new Event('done', { bubbles: true, composed: true })),
  );
  expect(await events(page)).toEqual(['contact_form_start', 'contact_form_submit']);
});

test('AC4: Clarity is loaded only after the banner\'s yes, then told the consent', async ({ page }) => {
  await open(page, { body: form, settings: { clarity: 'abc123', consent: 'cookieyes', forms: [] } });
  const tag = page.locator('script[src="https://www.clarity.ms/tag/abc123"]');
  expect(await tag.count()).toBe(0);
  await page.evaluate(() =>
    document.dispatchEvent(new CustomEvent('cookieyes_consent_update', { detail: { accepted: ['analytics'] } })),
  );
  expect(await tag.count()).toBe(1);
  expect(await calls(page)).toEqual([['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }]]);
});

test('AC10: with a Clarity ID but no banner, Clarity is never loaded and the console says why', async ({ page }) => {
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text()));
  await open(page, { body: form, settings: { clarity: 'abc123', forms: [{ name: 'valuation', form: '#lead' }] } });
  await page.fill('[name=name]', 'A');
  expect(await page.locator('script[src*="clarity.ms"]').count()).toBe(0);
  expect(warnings.join()).toContain("Clarity needs the cookie banner's yes");
});

test('AC5: Cookiebot statistics consent becomes Clarity analytics consent', async ({ page }) => {
  await open(page, { body: '', before: recorder, settings: { consent: 'cookiebot', forms: [] } });
  await page.evaluate(() => {
    window.Cookiebot = { consent: { statistics: true } };
    window.dispatchEvent(new Event('CookiebotOnAccept'));
  });
  expect(await calls(page)).toEqual([['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }]]);
});

test('AC6: CookieYes analytics consent becomes Clarity analytics consent', async ({ page }) => {
  await open(page, { body: '', before: recorder, settings: { consent: 'cookieyes', forms: [] } });
  await page.evaluate(() =>
    document.dispatchEvent(new CustomEvent('cookieyes_consent_update', { detail: { accepted: ['necessary', 'analytics'] } })),
  );
  expect(await calls(page)).toEqual([['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }]]);
});

test('AC7: without settings nothing is counted and the console says why', async ({ page }) => {
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text()));
  await page.route('https://site.test/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: `<script>${recorder}</script><script>${script}</script>` }),
  );
  await page.goto('https://site.test/');
  expect(warnings.join()).toContain('window.kowboyConversions.forms is missing');
  expect(await calls(page)).toEqual([]);
});

test('AC8: calls made before the site loads Clarity wait in its queue', async ({ page }) => {
  await open(page, { body: form, settings: { forms: [{ name: 'valuation', form: '#lead', submit: { event: 'sent' } }] } });
  await page.fill('[name=name]', 'A');
  expect(await page.evaluate(() => window.clarity.q.map((c) => [...c]))).toEqual([
    ['set', 'valuation_form_page', '/salj/'],
    ['event', 'valuation_form_start'],
  ]);
});

test('AC9: a form with a wrong selector is skipped and named, the others still count', async ({ page }) => {
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text()));
  await open(page, {
    body: form,
    before: recorder,
    settings: { forms: [{ name: 'broken', form: '#lead[' }, { name: 'valuation', form: '#lead' }] },
  });
  await page.fill('[name=name]', 'A');
  expect(warnings.join()).toContain('"#lead[" is not a valid CSS selector');
  expect(await events(page)).toEqual(['valuation_form_start']);
});
