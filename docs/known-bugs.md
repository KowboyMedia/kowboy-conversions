# Known bugs

- 1 · `[conversions]` The `cookielawinfo` consent (CookieYes's older banner) never gives a yes on a real site: that banner pre-sets its "non-necessary" cookie to yes before any answer, and its "Accept all" does not set `viewed_cookie_policy`. Seen on one client site on 2026-11-26. Fixing it needs a signal that only a real click on "Accept all" gives; until then do not use `cookielawinfo`.
