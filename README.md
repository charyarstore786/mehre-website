# Mehre — Branded Dresses Website

A multi-page e-commerce storefront for **Mehre**, a Pakistan-based branded dress
label selling to Pakistan and international customers, with multi-currency
pricing, delivery information, and WhatsApp-based ordering.

## Pages

- `index.html` — Home (hero, featured products, USPs, testimonials)
- `shop.html` — Full catalog with category filters
- `product.html` — Product detail (`product.html?id=1`), size/qty selection, add to cart, buy now via WhatsApp
- `cart.html` — Cart (localStorage-based), checkout via WhatsApp
- `about.html` — Brand story
- `delivery.html` — Countries served, delivery timelines, customs/payment info
- `contact.html` — Contact form (opens WhatsApp with the message pre-filled)

## How Ordering Works

There is **no payment gateway integrated**. Real payment processors
(Stripe/PayPal) generally can't settle directly to a Pakistani bank account,
so the site follows the common model for Pakistani fashion brands selling
internationally: customers browse, see prices converted to their currency,
then click **"Order via WhatsApp"**, which opens a pre-filled WhatsApp
message with their order details. Payment method and final total (incl.
delivery) are confirmed directly with the customer over WhatsApp.

## Products & Photos

`js/products.js` currently lists 10 real dresses sourced from the photos in
`Photos/` (originals kept there; the two best shots per dress were copied
into `images/` as `p1`…`p10`). Prices, descriptions, categories and sizes are
estimates — adjust to your actual pricing and stock. To add a new dress: drop
its photos in `images/`, then add an entry to the `PRODUCTS` array in
`js/products.js` with a unique `id` and an `images: [hero, detail]` array.

## Key Things to Update Before Launch

- **WhatsApp number**: `js/main.js` → `WHATSAPP_NUMBER` (currently `923711626229`)
- **Prices & descriptions**: `js/products.js` — verify against real stock/pricing
- **Exchange rates**: `js/main.js` → `CURRENCIES` object. These are indicative fixed rates (PKR per unit of currency) — update periodically, or wire up a live FX API.
- **Contact details**: WhatsApp number, email, and address appear in every page footer — update all 7 files, or convert the header/footer to a shared include if the site grows.
- **Social links**: placeholder `#` links for Instagram/Facebook in the footer.

## Currencies Supported

PKR (base), USD, GBP, EUR, AED, SAR — selectable from the header dropdown, persisted per-visitor via `localStorage`.

## Running Locally

This is a static site (no build step). Since browsers block JS module/script
loading for some setups when opened directly as a `file://` path, serve it
with any static server, for example:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Tech

Plain HTML/CSS/JS — no framework or backend. Cart and currency preference are stored in the browser's `localStorage`. Fonts via Google Fonts (Playfair Display + Poppins).
