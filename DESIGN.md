# JMD.media Design Standards

JMD.media is a photography site built around looking closely. These standards preserve an image-led experience as new galleries are added. They separate the agreed direction from implementation recommendations and decisions still open. Updated 4 November 2026.

# Agreed design direction

## Brand and gallery structure

- Use **JMD.media** as the site brand and **Look Up!** as its expressive line. Keep the exclamation mark; capitalization and an elegant typographic treatment remain under review, so all caps is not required. Show the actual ink/light logo assets visibly in the header, using the appropriate version for the background.
- Keep the brand distinct from a gallery title. The current gallery is **Life Might Surprise You**.
- Each future gallery has its own title, chosen featured photograph, and collection. The design must accommodate more galleries without making the current presentation feel like an empty directory.
- Keep all **27 photographs** in the current collection. Do not announce the total photograph count in the public interface; individual image numbers remain.
- **At the edge** is the current featured photograph. It appears in both the opening hero and the collection, and supplies the imagery for the gallery share card. Its hero appearance does not remove it from the collection. Place it at **number 8** in the collection, moved from number 6. Reference its stable image identifier or asset rather than its changing position.

## Image hierarchy and gallery wall

The photographs lead. Present the collection as a closely spaced photographic wall with restrained framing and quiet interface elements. Keep titles and other text subtle but legible. Avoid large text panels, oversized captions, or decorative structures that compete with the work. Place a tiny, subtle title and number beneath each wall image, with readable contrast.

The hero is an introduction to the gallery, not a substitute for browsing the collection. Preserve the character of each photograph and use its orientation intentionally rather than forcing every image into the same shape. The opening sequence is JMD.media, Look Up!, Life Might Surprise You, the featured photograph, then the wall. Do not add introductory prose or a category table of contents. Use a discreet separator around the featured presentation and left-align its copy.

## Photo viewer and writing

Clicking or tapping any photograph enlarges it in the full photo viewer. Preserve its aspect ratio and maximize the photograph in the available viewing area. Sequential browsing and returning to the wall should be intuitive, with minimal buttons and no instructional copy.

Place the number, title, description, and optional Josh note below the image, accessible by scrolling. Do not use fixed text chrome that shrinks the photograph. Keep all descriptions and annotations off-image.

Descriptions identify or explain the work. Optional personal annotations are Josh’s first-person voice and should remain distinct from descriptive text. Do not invent personal memories, motives, experiences, atmospheric filler, or unsupported geographic claims. Preserve approved bio copy and captions. An image can stand without an annotation.

## Approved About copy

Josh Daynard photographs the character in living things, familiar places and beautiful machines. His work moves between intimate nature studies, expansive skies and unguarded human moments, following light and curiosity rather than a single category.

Preserve this copy without an appended location.

## Navigation and contact

Use only two content menu destinations: **About** and **Inquiries**. Treat the theme switch as a quiet utility, not another content destination. Instagram can live within About or contact information. Do not add category navigation, a table of contents, or a section-navigation replacement above the photographs. The opening flows directly into the image wall.

About is a separate page that opens in the same tab, not a modal or a section at the bottom of the image wall. Use the approved bio and the temporary portrait. Provide a clear return to the gallery that preserves scroll position and gallery context. Browser Back and Forward and direct links should behave sensibly.

Inquiries is its own simple page with a general, open invitation to contact Josh for any reason. Preserve Instagram. Never display Josh’s email address. Route inquiries privately through a server-side form or server-side configuration, keeping the raw recipient out of public client code wherever practical. Do not embed the email address in this shareable specification.

Use the same header and same-tab gallery return behavior as About, preserving scroll position and gallery context with sensible browser Back, Forward, and direct links. Existing public repository history may retain an earlier address, so removing it from the current site does not guarantee secrecy.

Do not use print-focused wording or present sales, prices, checkout, or payments in this version. This general-contact direction supersedes earlier print-inquiry planning. Any future selling experience is a separate decision.

## Devices and themes

The design must work across phones, tablets including iPad mini, and desktop screens. Treat portrait and landscape layouts as real viewing conditions, not merely scaled versions of the desktop. On phones, every gallery photograph occupies its own row at the full available content width, with its aspect ratio preserved. No paired image rows. The user is reviewing the phone experience; desktop and tablet composition remain subject to their intent rather than inheriting a phone-only decision.

Support device theme choices without making the theme interface compete with the photographs. Text, controls, logos, and viewer surfaces need to remain clear in each supported appearance.

## Share card

The share card is image-dominant and uses **At the edge** for the current gallery. Brand and gallery identification should be secondary to the photograph. Future galleries should use their own chosen featured image. Use only a neutral charcoal or the site’s white/light-neutral background. Never use a green card background or apply a green tint. Green that naturally appears within the photograph is fine. This card palette does not force the site into light mode: retain device preference and the theme switch. Josh’s approval of the final card remains pending. Do not put a logo on the share card: no logo overlay or logo panel. Keep At the edge photo-dominant and put branding in share metadata. Photo impact is paramount.

The site controls its share image and metadata, but recipient apps choose the card layout, crop, image size, and whether a preview appears. Judge the source image on its own and test actual previews where possible. Do not promise identical rendering in every messaging or social app.

# Current typography

The current source assigns **Newsreader** to display typography, **Hanken Grotesk** to body text, and **IBM Plex Mono** to utility text. These are the working type families, not a newly approved replacement font system.

Use display type for gallery identity and selected titles, body type for readable explanatory copy, and monospaced type sparingly for navigation or small utility labels. Small type must remain readable; quiet does not mean faint or tiny.

Implementation reference: the current redesign’s index.html loads these three families and defines the display, body, and mono variables. Font weights, final sizes, line heights, and spacing remain subject to visual testing.

# Current color palette

These values are the current prototype palette, verified in the redesign source on 4 November 2026. They are a starting point for implementation, not final approved brand colors. Keep neutral surfaces and subdued interface color so photographs retain visual priority. Check contrast in actual contexts before release.

| Role | Light | Dark |
| --- | --- | --- |
| Page background | #E9EBED | #121417 |
| Raised surface | #F4F5F6 | #1A1D21 |
| Primary text | #16181B | #EBE8E3 |
| Secondary text | #5B6068 | #92959B |
| Rule or border | #CFD3D8 | #2B2F34 |
| Accent | #A4502B | #D98A62 |
| Viewer scrim | rgba(233,235,237,0.97) | rgba(8,9,11,0.96) |

Use the accent sparingly for focus or small details. Do not recolor the photographs to match the interface. Changing this palette requires updating the source tokens and this reference together.

# Recommended implementation criteria

These criteria translate the design direction into testable behavior. They are implementation recommendations rather than additional editorial or brand decisions.

- **Viewer:** preserve the complete photograph with a contain-style fit and maximize the image area. Keep previous, next, and close controls minimal and discoverable; support keyboard and touch browsing without instructional text or dependence on hidden gestures. Let the details scroll below the image instead of reserving fixed caption space. Restore the visitor’s place on closing.
- **Accessibility:** maintain readable contrast, visible keyboard focus, meaningful image text alternatives, and sufficiently large touch targets. Do not make important controls hover-only. Respect reduced-motion settings.
- **Responsive layout:** use a fluid image wall and adjust columns and gaps at content-driven breakpoints. Check that titles, menus, and viewer descriptions do not clip, overlap, or push essential controls off screen. On phone widths, enforce one full-width photograph per row without pairs; preserve each image’s aspect ratio.
- **Themes:** offer System, Light, and Dark behavior, remember an explicit choice, and follow the device appearance in System mode. Exact labels and control treatment can remain discreet.
- **Image delivery:** use responsive image sizes, reserve image dimensions to prevent layout jumps, and prioritize the featured image while loading later gallery images efficiently.
- **Gallery data:** represent each gallery with a stable identifier, title, featured-image reference, ordered collection, and share metadata. Reuse each photograph’s record across hero and collection so titles, descriptions, and annotations do not drift.
- **Share metadata:** provide a reachable social image and accurate gallery title and description. Keep the photograph’s main subject safe under common crops. Validate both fetched metadata and actual app behavior when available.

# Open decisions and provisional details

- **Watermark:** undecided. Do not treat a watermark’s presence, absence, position, or opacity as approved. Keep original photographs intact so either choice remains possible.
- **Exact visual values:** final gaps, type sizes, palette values, breakpoints, hero proportions, and share-card composition still need review. Existing prototype values are not permanent standards.
- **Future galleries and access:** make it easy to add named galleries with their own featured images and collections. Some may later be hidden/unlisted or password-protected. Hiding a gallery from the index or search is not security. Real password protection requires server-side access enforcement for both pages and image assets; public GitHub or static image URLs are unsuitable for private originals. Discovery layout, authorization approach, and exact scope remain undecided. Do not implement restricted access now. Keep the current two-destination content menu unless that direction changes.
- **Editorial content:** future gallery names, featured images, sequence, descriptions, and Josh’s annotations are chosen per gallery.
- **Commerce:** any later selling experience is a separate decision, not part of the current scope.
- **Future inquiry email:** plan a configurable address or alias at JMD.media; the exact address is undecided. This intermediary should receive and filter inquiries before optional forwarding to Josh’s iCloud inbox. It must be possible to change or disable the alias. This is not set up yet and does not guarantee that all spam will be stopped. No DNS or mail configuration is part of the current work. Timing is tentative, possibly about a month away, and no setup has been scheduled.

# Review before release

- Confirm JMD.media, Look Up!, and Life Might Surprise You have distinct roles and correct spelling. Verify the chosen typography without assuming all caps.
- Confirm all 27 current photographs are present, including At the edge in the collection as well as the hero.
- Inspect the image wall, viewer, About, and Inquiries on phone, iPad mini, and desktop, including tablet rotation.
- Check light, dark, and system behavior; keyboard focus; touch controls; long descriptions; and reduced motion.
- Confirm descriptions and annotations remain off-image, and personal annotations accurately reflect Josh’s words.
- Check the share image and metadata, then inspect recipient-app previews without assuming consistent rendering.
- Record the watermark decision before calling its treatment final.
- Keep future-gallery support intact and avoid adding unapproved store or payment features.

