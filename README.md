# Kowboy conversions

One small script for any website: it counts three steps of each form in Microsoft Clarity, so a
site's forms can be compared before and after a change (such as adding the Kowboy chat).

| Clarity event | When |
| --- | --- |
| `<name>_form_open` | A button that opens the form is clicked (only when `open` is set). |
| `<name>_form_start` | The visitor first types or ticks something in the form. |
| `<name>_form_submit` | The site confirms the form was sent. |

Each event carries the tag `<name>_form_page` with the page's path.

## Install on a site

Before `</head>` (or as one Custom HTML tag in the site's Tag Manager):

```html
<script data-cookieconsent="ignore">
  window.kowboyConversions = {
    clarity: 'PROJECT_ID', // leave out when the site already loads Clarity
    consent: 'cookiebot', // or 'cookieyes': Clarity loads only after its yes to statistics
    forms: [
      { name: 'valuation', open: '.valuation-button', form: '#valuation-form', submit: { event: 'wpcf7mailsent' } },
      { name: 'contact', form: '#contact-form', submit: { shown: '.contact-thanks' } },
    ],
  };
</script>
<script data-cookieconsent="ignore" defer src="https://cdn.jsdelivr.net/gh/KowboyMedia/kowboy-conversions@2/kowboy-conversions.js"></script>
```

- `form`: a CSS selector for the form (inside an open shadow root works too).
- `submit`: either `event`, a DOM event the site fires on success (Contact Form 7: `wpcf7mailsent`),
  or `shown`, a selector for the confirmation that becomes visible.
- The script sets no cookies and sends nothing itself. Clarity is loaded only after the site's
  cookie banner gets the visitor's yes to statistics: tracking by script needs consent even
  without cookies (EDPB guidelines 2/2023, 2024). A site without a banner gets no Clarity.
  Until the yes, the form events wait in the page.

## Read the numbers in Clarity

- Number A (share of visitors who start): sessions with `<name>_form_start` ÷ all sessions.
- Number B (share of starters who finish): sessions with `<name>_form_submit` ÷ sessions with
  `<name>_form_start`.
- One Clarity project per site; per page, filter by the page or the `<name>_form_page` tag.

## Develop

`npm install`, then `npm test` (Playwright, in the installed Google Chrome).
