# SAGERPRO logo-preserving edition

IMPORTANT: Keep your existing GitHub `images/sagerpro-logo.jpg` and `CNAME` file in place. This ZIP intentionally does not contain either one. Its pages refer to the already-uploaded `images/sagerpro-logo.jpg`, displaying it in the header and at 320px in the homepage hero.

When uploading these extracted files, replace index.html/styles.css/script.js where prompted, but do not delete the images folder or CNAME. If your actual filename differs, correct the two image paths in `index.html`.

---

# SAGERPRO — Education Updates & Original Analysis

A no-hosting-cost, static newsroom website for https://sagerpro.net/ using GitHub Pages. The site contains:

- Automatic third-party **headline and source-link aggregation** (DepEd, CHED, selected HEIs), **not** a republication of article bodies.
- Search and category filters.
- Original editorial sample drafts with individual article pages.
- Clearly labeled long-term plans for research journals, conferences, and CPD.
- Mobile-responsive design.

## Install in existing BernSGP/SAGERPRO repository

1. **Back up your existing files first.** Download a ZIP of the existing repository using GitHub's green **Code → Download ZIP** button.
2. Unzip the SAGERPRO website package. **Upload the contents of this package** (including `data/`, `config/`, `scripts/` and `.github/workflows/`) to the **root of the existing repository's `main` branch**. The existing `index.html`, `styles.css` and `script.js` are replaced. `article.html`, `favicon.svg`, `.github/`, `data/`, `config/`, and `scripts/` are added.
3. **Do not delete or replace your existing `CNAME` file.** Verify it still contains `sagerpro.net`.
4. **Change Settings → Pages → Build and deployment → Source to `GitHub Actions`** (not “Deploy from a branch”). This is essential: commits created using a workflow token do not trigger branch-based Pages rebuilds. The supplied workflow deploys the actual files on every push and after each scheduled news update. Keep the custom domain set to `sagerpro.net`.
5. Go to **Actions → Publish SAGERPRO and refresh education updates → Run workflow → Run workflow** to load news initially. The scheduler then runs four times daily (best effort, not guaranteed to the minute).
6. If the action cannot push, check **Settings → Actions → General → Workflow permissions** and allow **Read and write permissions** if your repository/organization permits. Also check branch protection rules. The action declares `contents: write`, `pages: write`, and `id-token: write`.
7. Check https://sagerpro.net/ and open a headline to follow its source.

If browser upload cannot preserve nested folders, create each path manually in GitHub (e.g. choose **Add file → Create new file**, type `.github/workflows/update-news.yml`, and paste in the supplied content). Alternatively edit all files using GitHub's web editor at `https://github.dev/BernSGP/SAGERPRO`.

## Update the monitored sources

Edit **`config/sources.json`**. Each source has:

- `name`: how you want the source identified in the feed metadata
- `category`: `DepEd`, `CHED`, or `Higher Education` (used by filters)
- `query`: Google News RSS search query (example `site:adnu.edu.ph when:30d`)
- `enabled`: `true`/`false`
- `limit`: maximum items collected from the source per refresh

**Important:** This program uses an **unofficial Google News search RSS endpoint** to discover relevant site-indexed articles. Coverage is incomplete; some government advisories may not appear at all; feeds can break or block automated requests. A publisher RSS feed or official API is preferable when verified and available. The primary source sites are linked independently on the homepage. All third-party news cards link outward and attribute the publisher. Always check original sources for binding policies or dates. Avoid treating this as an exhaustive official notice system.

## Publish your own articles

Edit **`data/articles.json`**. Each article has a `slug`, `title`, `category`, `summary`, `date`, `status`, and `blocks` of types `h2` and `p`.

The included articles are **sample drafts**, deliberately marked as editorial previews. Review and rewrite them for SAGERPRO before treating them as actual published work. Once approved, change `status` from `sample-draft` to `published` and set the accurate publication date. They will automatically appear on the homepage and have their own address, such as:

`https://sagerpro.net/article.html?slug=from-policy-to-practice`

For future articles, duplicate an object in `data/articles.json` and give it a new unique slug. Ensure the JSON remains syntactically valid (commas and double-quoted strings).

## Future features / limitations

This is a static site: it does **not** yet support journal manuscript submissions, peer-review workflows, CPD learner accounts, registration payments, certificate issuance, or online conference registration. Those require additional services and careful privacy/security and possible regulatory work. No accreditation, approval, or official institutional affiliation is claimed.

The GitHub Action runs every ~6 hours by schedule, but GitHub may delay/drop schedules and can disable schedules in public repositories after 60 days without activity. Use the manual trigger to recover. The website only refreshes when the action successfully commits news data.

## Privacy, attribution, and editing

Do not add personal information, secret credentials, or private research materials to this public repository. Article bodies here are original example content only. Do not copy full articles from third-party sources without permission; the aggregator collects headlines, attribution, dates, and links only.
