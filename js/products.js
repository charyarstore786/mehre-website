/* ===================== Mehre — Product Catalog =====================
   Product data is fetched at runtime from content/products.json so it
   can be edited via the admin dashboard (Decap CMS) without touching code.
====================================================================== */

let PRODUCTS = [];

async function loadProducts() {
  try {
    const res = await fetch("content/products.json", { cache: "no-store" });
    PRODUCTS = await res.json();
  } catch (e) {
    PRODUCTS = [];
  }
}

/* Helper: find product by id */
function getProductById(id) {
  return PRODUCTS.find(p => String(p.id) === String(id));
}
