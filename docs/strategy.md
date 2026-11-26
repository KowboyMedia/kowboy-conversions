# Strategy

## Purpose

Kowboy sells a chat that helps visitors book viewings, register interest, ask for a free valuation,
save a search profile and contact the broker. To prove its value, each client site's forms are
counted before and after the chat, per site, with the same code everywhere and only counts of
form steps, never what visitors type.

## Features

1. Counts a form's open, start and submit as Clarity events, tagged with the page.
2. Loads Clarity when the site does not, only after the site's cookie banner says yes to statistics.
3. Reads Cookiebot's, CookieYes's (new or older banner) or WordPress's consent standard's (Complianz) answer and passes it to Clarity.

## Parts, data, technology, hosting

- One part: the script, plain JavaScript with no dependencies, so any site can load it.
- Data: none stored by the script. Clarity (Microsoft) holds the events, one project per site.
- Hosting: this public GitHub repository, served by jsDelivr from version tags. A site gets a new
  version when a `v1.x.y` tag is pushed; there is no staging other than the tests.

## Acceptance criteria

1. Open, start and submit are counted for a form, each with its page.
2. Start is counted once per filling, and again after a submit.
3. A form inside an open shadow root is counted.
4. Clarity is loaded only after the banner's yes, then told the consent.
5. Cookiebot statistics consent becomes Clarity analytics consent.
6. CookieYes analytics consent becomes Clarity analytics consent.
7. Without settings nothing is counted and the console says why.
8. Calls made before the site loads Clarity wait in its queue.
9. A form with a wrong selector is skipped and named, the others still count.
10. With a Clarity ID but no banner, Clarity is never loaded and the console says why.
11. WordPress consent (Complianz) statistics "allow" becomes Clarity analytics consent.
12. A stored WordPress consent "allow" counts at load, nothing else does.
13. A confirmation inside the form's shadow root counts, one outside it does not.
14. The older CookieYes banner gives a yes only after "Accept all" sets its cookies.
15. A stored older-banner yes counts at load; no answer yet counts as nothing.

## Out of scope

- A total across all clients (Clarity cannot combine projects): accepted without it (Pavan, 2026-11-24).
- Anything a visitor types, and any personal data.
- Installing on the sites: done per site, with each site's own approval.
