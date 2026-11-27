# Everpost — Christmas and New Year invitation maker

Everpost lets a host personalise a holiday card, send one guest link and receive replies. On the public GitHub Pages edition, guests can send their RSVPs and wishes by WhatsApp or copy them into a direct message. No account is needed. The single design in this release is **The Evergreen Letter**.

## Public GitHub Pages edition

The new site publishes at [Everpost on GitHub Pages](https://muhammadzainrasheed.github.io/christmas-new-year-invitation-maker/). GitHub serves the checked-in static files from the root of `main`. There is no external hosting or database connection on this edition.

Use **Create my invitation**, enter the details, and copy the generated guest link. Hosts may add their WhatsApp number before sharing. The invitation details travel in the URL fragment, so the link works on a fresh device without an account. Guests prepare a reply, then send it in WhatsApp or copy it into their own message. The host reads replies in that conversation. The social preview uses the common Everpost image and title. A specific invitation's details become visible when the guest opens it.

To publish an update, edit the source files, run `npm run build:pages` and `npm test`, then commit the updated source and generated HTML/assets to `main`. The default build targets this repository's project URL. To generate a copy for another project, set `PAGES_URL` and optionally `PAGES_OUTPUT`. For the static site, the public routes include `/invite/` and `/share/` under the project path.

The sections below document the optional server-backed edition for developers. The GitHub Pages deployment works independently of that edition.

## Run it

Use Node.js 22.13 or later (Node 24 was tested). There are no application packages to install.

```sh
npm start
```

Open the local address printed by the server. The server prepares the artwork and initialises SQLite at `.data/everpost.sqlite`. Keep that directory on persistent storage when using the Node adapter. For a production Node installation, terminate HTTPS at a reverse proxy and set `PUBLIC_ORIGIN` to the real HTTPS origin. The Cloudflare configuration below uses D1.

```sh
npm test
npm run build
```

## Pages and guest flow

| Address | Purpose |
| --- | --- |
| `/` | Home, three steps, design summary, guest features, FAQ, about and contact links |
| `/christmas-invitations` | The Evergreen Letter design and selection |
| `/create` | Six invitation details and a live preview. The date/time control includes the event time zone |
| `/sample` | Working guest demo. Sample submissions are acknowledged in the tab |
| `/i/<slug>` | Guest invitation. Envelope, card, save the date, countdown, venue, programme, RSVP, wishes and closing |
| `/host/<slug>#key=…` | Host-only sharing, PNG download, optional contact number and replies. Copy and keep this full link |
| `/contact`, `/privacy`, `/terms` | Support and site information |

The host may enable call and WhatsApp buttons after creating the invitation. A number must include its country code. The programme uses the host’s actual start time and event message. A guest can change a reply from the same tab. A separate device can send a fresh reply. PNGs are 1500 × 2100 pixels. Files for Apple Calendar and Outlook use UTC and escape invitation text. Google Calendar uses the same instant. If clocks move backwards, the editor uses the first occurrence of a repeated local time. Times skipped by daylight saving are rejected.

## Optional server deployment reference

The handoff branch is `everpost-v1` in `muhammadzainrasheed/christmas-new-year-invitation-maker`. The repository owner controls the GitHub and Cloudflare accounts.

1. In Cloudflare Workers & Pages, create a **Pages** project with **Connect to Git**. Choose the repository above. Set production branch to `everpost-v1`, or to `main` after merging the implementation there.
2. Select no framework preset. Use the repository root, build command `npm run build`, output directory `dist` and build environment variable `NODE_VERSION=24`. No install command or runtime package is required.
3. Create a D1 database for invitations. Apply `schema.sql` in its console before accepting invitations. From an authenticated workstation the equivalent is `npx wrangler d1 execute <actual-database-name> --remote --file=schema.sql`.
4. In the Pages project settings, add a **D1 database binding** named exactly `DB` and select that database for production. If branch previews are enabled, give preview its own database, apply the same schema and bind it there. Redeploy after setting bindings. Set the compatibility date to `2026-01-01` or a newer date verified with this app.
5. Open the assigned HTTPS `pages.dev` URL. Without a custom domain, leave `PUBLIC_ORIGIN` unset. Page metadata, guest links, calendar UIDs and the sitemap use the request origin. Create a real test invitation and read a guest reply through its host link before launch.
6. Future pushes to the chosen production branch trigger a Pages build. The custom-domain step is deferred by the owner. No DNS change is required for a `pages.dev` launch. When a domain is available, associate it in Pages, follow Cloudflare’s displayed DNS instructions, verify HTTPS, then set `PUBLIC_ORIGIN` to its HTTPS origin and rebuild.

Keep a record of the actual assigned Pages URL, D1 database name/ID, branch, account and custom-domain DNS changes in the owner’s private deployment notes. Avoid putting host links, credentials or support messages in this public repository.

Cloudflare documentation: [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/), [D1 bindings](https://developers.cloudflare.com/pages/functions/bindings/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Operate and update

- **Copy and layout.** Edit `src/pages.mjs` and `public/assets/style.css`. FAQ text and the design identifier are in `src/design.mjs`. The sample advances to the next Christmas after the current sample event begins.
- **Data and hosting.** The standard Fetch API handler in `src/service.mjs` serves both the Node/SQLite adapter and the Cloudflare Pages/D1 adapter. Hosts authenticate with a high-entropy private link. Only its hash is stored server-side. Event creation and reply retries use idempotency keys.
- **Support.** Contact requests are saved in the `support` table. The operator can read `SELECT ticket, email, message, created_at FROM support ORDER BY created_at DESC;` in their private D1 console and reply through their own email. This release does not send support email automatically.
- **Removal.** Verify the host’s authority privately. Use parameterised queries or the authenticated database console to delete that invitation and its associated replies. Database backups and retention are the operator’s responsibility.
- **Artwork and fonts.** Original stationery photography-style art and wreath files are included as base64 source in `media/`. Builds decode these once into ordinary WebP, JPEG and font files. Browsers request binary files. DM Sans and DM Serif Text are self-hosted. Their licenses are in `licenses/`.
- **Version scope.** One Christmas design also accepts New Year wording. Additional designs, accounts, an account-wide dashboard and payments are future work. The host view is scoped to one invitation.

## SEO and acceptance

See [the itemised launch and SEO checks](ACCEPTANCE.md) for measured results and the checks that need a live domain or physical phones.
