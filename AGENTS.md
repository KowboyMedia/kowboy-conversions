# AGENTS.md - Kowboy conversions

One script, `kowboy-conversions.js`, that client websites load to count their forms' open, start
and submit in Microsoft Clarity. README.md says how a site installs it.

- Part and tag: `[conversions]`, the script. There is one part.
- Commands: `npm install`, `npm test` (Playwright in the installed Chrome; CI runs the same).
- Checks that block: the tests, none skipped. Everything else is a warning.
- Design: none.
- **This repository is public** (jsDelivr serves the script from it). Never write a client's
  name, address, Clarity ID or settings here: each site's settings live on that site.
- Sites load the script by major version (`@2`). A change that breaks an existing site's settings
  is a new major version (`v3.0.0`); anything else is a new `v2.x.y` tag.
