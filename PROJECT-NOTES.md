# Mehre Website — Project Notes

Record so that every computer / session has the same picture. Update this file whenever setup changes.

## Where things live

| What | Where |
|---|---|
| GitHub repo | https://github.com/charyarstore786/mehre-website (branch `main`) |
| Vercel project | `mehre-website` (team `usman786`) |
| Live site | https://mehre-website.vercel.app |
| Other Vercel domains | `mehre-website-usman786.vercel.app`, `mehre-website-git-main-usman786.vercel.app` |
| Local folder (this PC) | `C:\Users\User\Desktop\Ammara website` |

Note: an older link used `charyar786` — that user does not exist. The correct GitHub account is **`charyarstore786`**.

## Deployment

- Vercel is connected to the GitHub repo. Every push to `main` auto-deploys to production.
- Other branches (e.g. `tmp-crops`) only create preview deployments.
- Latest production deployment when this note was written: commit `ecc4bff` — "New studio backgrounds on product photos (p8 set kept original background)" — state READY (2026-10-11).
- `vercel.json` only sets security headers; there is no build step.

## Workflow (any computer)

```bash
git clone https://github.com/charyarstore786/mehre-website.git   # first time only
git pull                       # always pull before starting work
# ...make changes...
git add -A
git commit -m "describe the change"
git push                       # Vercel deploys automatically
```

## Run locally

Static site, no build. Any static server works:

```bash
npx serve -l 5173 .            # Node (used on this PC; Python is not installed here)
python -m http.server 5173     # if Python is available
```

Open http://localhost:5173

## Site structure

- Pages: `index.html`, `shop.html`, `product.html`, `cart.html`, `about.html`, `delivery.html`, `contact.html`, `404.html`
- `content/*.json` — editable content (products, home, about, delivery, settings) managed via the admin CMS
- `admin/` — Decap CMS admin panel
- `api/` — serverless functions
- `js/`, `css/`, `images/` — assets
- See `README.md` for ordering flow (WhatsApp, no payment gateway), currencies and pre-launch checklist.

## Housekeeping

- The `tmp-crops` branch holds temporary face crops ("to be deleted") and can be removed once no longer needed.
