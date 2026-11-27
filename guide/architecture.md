# How the gallery runs
JMD Media | Architecture | Page 1 of 2

## From a photograph to a page
GitHub holds the site in ChristineEberle/jmd-media. The review branch is preview/josh-gallery-copy. Each photo in gallery-data.js has a stable ID, title, alt text, dimensions and optional caption or note. Its ID selects the full and smaller WebP files. Display numbers come from sequence, so moving a photo need not change its files.

## What the browser receives
The gallery, About and Inquiries are separate HTML pages. gallery.js builds the wall and viewer from the photo records. styles.css controls the wall, off-image captions, fixed viewer controls and theme-specific logo. site.js handles appearance and return navigation. The browser receives static files for normal gallery viewing.

## What runs on the server
Vercel runs node build.cjs on a Git change. The build assembles dist and writes absolute share-card URLs into the HTML so messaging apps can fetch the featured image. A separate function at /api/contact checks delivery availability and handles submissions through Resend. Recipient and credentials belong in Vercel server settings. Instagram is the current fallback.

## How a chat edit becomes visible
Little Sixteen's recorded deployment identifies a GitHub main-branch commit. JMD uses the same Git-to-Vercel pattern with a dedicated review branch and a stable, branch-linked public address. An authorized commit starts a build. Once Vercel finishes and assigns the deployment, refresh the same link. An already-open tab does not reload itself.

## Addresses
Preview: https://jmd-gallery-preview.vercel.app
Source: https://github.com/ChristineEberle/jmd-media/tree/preview/josh-gallery-copy

---
# How to make changes
JMD Media | Editorial and technical options | Page 2 of 2

## Everyday edits from chat
Recommended for captions, credits and replacement photos. Give ChatGPT the display number, current title and desired edit. For a replacement, attach the original. Have it commit to the review branch, run the gallery checks, then verify the signed-out preview. Example: “Replace #17 with this exposure; keep its order and caption.” Swami Dot Exe can use this route when its session has repository write access. Otherwise have it prepare the exact change for a connected ChatGPT session.

## Larger additions and design changes
Use a short-lived branch and pull request for a new gallery, navigation changes or a redesigned viewer. Review its build, then merge into the review branch. Add new photo records and both WebP sizes with matching IDs. A second collection also needs a gallery selection route and its own share metadata. Approve the custom-domain launch separately.

## Direct GitHub edits and recovery
A collaborator with write access can edit a caption in gallery-data.js directly on the review branch. The same deployment process applies. If the result is wrong, revert that commit and verify the new build at the same address. Keep prior versions in Git history. A browser-based editorial form is a later option if repeated bulk updates justify maintaining another interface.

## Possible second phase | ElevenLabs water agent
First decide what the water agent should help a visitor do and which material Josh approves it to discuss. Prototype on a separate preview with an explicit start/stop control, microphone permission and a text alternative. Keep credentials server-side, agree on recording and retention, and set a usage budget. Test on mobile Safari with the gallery viewer before integrating it into the public experience.
