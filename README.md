# JMD.media · LOOK UP!

A static, photo-first site. All 27 original full-size photographs, thumbnails, and logo assets remain unchanged.

## Run

Node 18+ is sufficient for the build; there are no runtime package dependencies.

```
node build.cjs
python3 -m http.server 8768 --directory dist
```

Open http://localhost:8768. Vercel runs the same build through `vercel.json`.

## Content

`gallery-data.js` stores galleries and stable photo IDs. The array order controls display numbering, not asset filenames. Photo 06 (`At the edge`) is the featured image and eighth gallery item. Add future galleries to `galleries`; choose the current gallery in `gallery.js`. Do not automatically invent photographer notes. `note: null` omits the optional note. Approved notes and original descriptions flow below the full image without shrinking its viewport-sized stage.

Descriptions are restored from the earlier public preview where verified; the four newer photos retain their current descriptions. PDF selection rationale and editing cautions are not public captions. The recalled fallen-flower quotation is unconfirmed and is intentionally not published as Josh’s verbatim words.

## Social previews

The build resolves OG/Twitter image URLs against `VERCEL_URL`, or an explicit `SITE_URL`, or the verified existing production domain `https://jmd-media.vercel.app`. The card uses the unmodified `06.webp` photograph, not the canopy or spillway. The social image is versioned in metadata. Social apps choose their own crop, caching, card frame and theme. They cannot reliably adapt a shared static image to each recipient’s light/dark setting. Preview protection can prevent social crawlers from fetching a preview deployment; do not weaken protection automatically.

## Verification

`node --check gallery.js`, `node --check gallery-data.js`, `node --check build.cjs`, and `node build.cjs` require only Node.

The optional browser regression suite uses Playwright and Chromium: with the server running at port 8768, run `node tests/gallery.spec.cjs`. It covers desktop, phone, iPad mini portrait/landscape, small phone, keyboard/focus, rapid next/previous, actual CDP touch gestures and theme persistence. Install Playwright via its official package registry in an environment that supports browser execution. The script accepts `CHROMIUM_PATH` for the executable and `BASE_URL` for an alternate test server.

Review `DESIGN.md` before design or content changes. Main and production are not changed by the preview branch.

## About navigation

About is a separate same-tab `about.html` page containing the approved bio and temporary portrait. Its return link restores saved gallery scroll from this tab when available. Direct visits fall back to the gallery top. Browser Back/Forward uses normal document history. Refresh and deep links work with static hosting, without client-side routing rules. No portrait or About panel remains beneath the gallery. Inquiries is its own same-tab `inquiries.html` page, with an open invitation to contact Josh, a private contact form, Instagram, and the same contextual return. There is no print-focused copy, sales, or checkout.

## Private inquiry delivery: configuration required

The `/api/contact` Vercel Node function keeps recipient details and credentials server-side. Configure `RESEND_API_KEY`, `CONTACT_TO` (Josh’s chosen recipient address), and `CONTACT_FROM` (a verified sending address) in the intended Vercel environment. This implementation uses Resend; it does not create an account, API key, verified domain, or paid subscription. No live email has been sent or delivery verified. Without all three settings the endpoint returns unavailable and the page explains this honestly, retaining Instagram as an alternative.

The provider receives the visitor’s name, reply email and message when the visitor submits the form. Recipient email is absent from shipped HTML/JavaScript. Existing public repository history may still contain the prior public address; this change is not a secrecy guarantee.

Validation, a honeypot, origin checks, and a warm-instance throttle are included. The in-memory throttle is not a distributed abuse limit. Before public launch, verify provider/domain configuration, add suitable durable provider/WAF protection, and authorize a real delivery test. No external service configuration, security settings, or test email is performed by this source change.

## Viewer caption refinement

The image stage remains `100dvh - 106px - safe-area insets`, unchanged from the phone-reviewed version. Close now shares the bottom controls row, reclaiming the previous 48px top bar. The short description has 13px text with 1.4 line height and compact spacing, aiming to fit typical one/two-line descriptions with the number/title in the remaining space. Longer descriptions, larger accessibility text, unusually narrow viewports, and optional notes can scroll below; no overlay or automatic font shrinking is used. Actual iPhone/iPad rendering still requires browser/device verification.

Footer uses `© 2026 Josh Daynard` for the site/gallery, following the requested standard notice. This is not a claim that every individual image was first published in 2026, nor an ownership transfer.
