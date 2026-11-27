# Acceptance and SEO record

## Functional checks

| Test | Result |
| --- | --- |
| Create an invitation from the home page | 14 seconds in a scripted Chromium browser interaction from Create to the private sharing screen. A first-time human usability test is still open |
| Independent guest view | A separate guest tab opened the new link without signing in. The guest URL contained no host key. Private/incognito and second physical phone remain live launch checks |
| Guest to host round trip | Submitted one RSVP for three people and one wish. Both appeared on refresh in the private host view |
| Runtime portability | Node/SQLite end-to-end checks passed. Cloudflare Wrangler compiled the Pages Worker. The local Cloudflare runtime with a D1 binding passed create, guest open, RSVP, wish and private host readback |
| Download | Chromium triggered the PNG download from the private host screen. Calendar tests checked UTC event start and escaped venue text |
| Validation and retries | Five automated suites covered empty fields, past dates, DST gaps and overlaps, fractional time-zone offsets, retry deduplication, changed attendance, contact submissions and private data isolation |
| Responsive layout | Checked home, editor, opened sample, design, privacy, terms and contact at frame widths of 320, 360, 390, 430 and 768 pixels. All 35 layouts fit. Mobile menu expanded successfully |
| Guest animation | Tap-to-open envelope, staged scroll reveals, system reduced-motion support and user-controlled audio. Audio starts after the music button is pressed |
| Performance | A 390-pixel local Chromium run requested about 292 kB of decoded home resources including images and fonts. The repeat navigation load event was 56 ms. These are local measurements. Mobile-data latency and field Core Web Vitals require a live deployment |
| External actions | The generated WhatsApp URL contains the guest URL, Google Calendar contains the event instant and time zone, and directions include the venue. Live WhatsApp unfurl, installed calendar, physical Android/iPhone and mobile-data checks are open |

## SEO checklist

| Requirement | Implementation or outstanding check |
| --- | --- |
| Keyword plan | Home targets “Christmas party invitation maker” and New Year invitations. The design page targets online Christmas invitations. Editor targets creating a holiday invitation. Guest features and FAQ cover invitations with RSVP |
| Unique titles and descriptions | The seven public routes get distinct server-rendered metadata. Actual events use the supplied event title and host for their social title |
| Headings and content | One H1 per public page verified in tests. Sections have descriptive headings, visible copy and native FAQ disclosures |
| Readable URLs | Marketing pages use descriptive paths. A private-intent guest URL combines a readable event title with an unpredictable suffix so unrelated events remain separate |
| Social previews | Absolute Open Graph URLs, title, description and 1200 × 630 JPEG. Twitter large-image card. Actual in-app WhatsApp unfurl requires public hosting |
| Structured data | Home emits WebSite, Organization and FAQPage JSON-LD. FAQ entries are generated from the same source as visible answers |
| Images and accessibility | Named WebP assets and responsive sources, descriptive alternative text for the hero, empty alt text for ornamental wreaths, dimensions reserved; visible focus and labelled inputs |
| Indexing and HTTPS | Public routes are in the generated sitemap and have origin-aware canonical tags. Robots file links to sitemap. Guest and host pages emit noindex; host/API paths are excluded from crawling. Live HTTPS verification follows Pages deployment |
| Mobile performance | No external scripts, remote fonts or animation libraries. Map loads after an explicit request. Fonts and imagery are served locally; production field measurements pending |
| Internal links | Navigation and footer connect the studio, design, editor, sample, help and policy pages. Missing routes return a 404 status with a home link |
| Seasonal calendar | Keep Christmas pages indexed before November and New Year content before December. For the current season, submit the sitemap as soon as the site is live. Refresh date examples and wording before each autumn |
| Search Console and analytics | After site ownership is available, verify the public property in Google Search Console, submit the live sitemap, and enable Cloudflare Web Analytics for the chosen hostname. No analytics beacon or verification token is fabricated |

## Live launch sign-off

Record the real Pages URL and actual binding, verify creation and replies against its production database, then open the guest link on an Android phone and an iPhone. Share it through WhatsApp and inspect the preview, open the calendar file and directions, and measure a cold first visit on mobile data. The owner has deferred a custom domain. DNS changes and custom-domain HTTPS verification can follow when a domain is selected.
