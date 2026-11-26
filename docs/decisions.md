# Decisions

One line per structural decision: date, decision, who decided.

- 2026-11-24 · `[conversions]` Clarity instead of Google Analytics 4 for Patric's "Track conversions"; the total across all clients is given up (Clarity cannot combine projects); cookies only with the site banner's consent (Pavan, in chat).
- 2026-11-24 · `[conversions]` The script lives in its own public repository and is served by jsDelivr, added to each site through its Tag Manager or head; nothing in Core (Pavan, "Go with your recommendations").
- 2026-11-24 · `[conversions]` Event names `<name>_form_open|start|submit` and the tag `<name>_form_page`, the same as the free valuation in Core's WordPress theme (agent's choice, not confirmed by the owner).
- 2026-11-25 · `[conversions]` Clarity is loaded only after the site banner's yes to statistics, never without consent: the EDPB's guidelines 2/2023 (v2.0, October 2024) put JavaScript that makes the browser send information under Article 5(3) ePrivacy, cookies or not; version 2.0.0 since a site with an ID and no banner no longer gets Clarity (Pavan: "Yes, do both").
- 2026-11-26 · `[conversions]` Question 1 answered: the five sites are in the ClickUp task "Track conversions"; their addresses stay out of this public repository (Pavan, in chat).
- 2026-11-26 · `[conversions]` 2 a: Clarity, with its session recordings (sensitive text masked), is accepted for this measurement (Pavan, "Yes, all a", answering for Patric's task).
- 2026-11-26 · `[conversions]` 4 a: a site without a cookie banner gets the free CookieYes plugin, which the script already reads. Rejected: b, leaving those sites out (Pavan).
- 2026-11-26 · `[conversions]` 5 a: a form's submit step is proven by the first real visitors' sends seen in Clarity, never by a test send into a brokerage's CRM. Rejected: b, one test send per form (Pavan).
