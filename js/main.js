/* ===================== Mehre — Site Logic =====================
   Handles: currency switching, cart (localStorage), WhatsApp order
   links, product rendering, mobile nav, and small UI interactions.
================================================================== */

/* ---------- Config ---------- */
/* WHATSAPP_NUMBER, STORE_NAME and CURRENCIES are loaded at runtime from
   content/settings.json (editable via the admin dashboard) — see loadSettings(). */
let WHATSAPP_NUMBER = "923711626229";
let STORE_NAME = "Mehre";
let CURRENCIES = {
  PKR: { symbol: "Rs", rate: 1 },
  USD: { symbol: "$", rate: 278 },
  GBP: { symbol: "£", rate: 355 },
  EUR: { symbol: "€", rate: 300 },
  AED: { symbol: "AED ", rate: 76 },
  SAR: { symbol: "SAR ", rate: 74 }
};

async function loadSettings() {
  try {
    const res = await fetch("content/settings.json", { cache: "no-store" });
    const settings = await res.json();
    if (settings.whatsappNumber) WHATSAPP_NUMBER = settings.whatsappNumber;
    if (settings.storeName) STORE_NAME = settings.storeName;
    if (settings.currencies) CURRENCIES = settings.currencies;
  } catch (e) {
    /* keep defaults above if settings.json can't be loaded */
  }
}

const CART_KEY = "mehre_cart";
const CURRENCY_KEY = "mehre_currency";

/* ---------- Currency helpers ---------- */
function getCurrentCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || "PKR";
}
function setCurrentCurrency(code) {
  localStorage.setItem(CURRENCY_KEY, code);
}
function formatPrice(pkrAmount, currencyCode) {
  const code = currencyCode || getCurrentCurrency();
  const c = CURRENCIES[code] || CURRENCIES.PKR;
  const converted = pkrAmount / c.rate;
  const decimals = code === "PKR" ? 0 : 2;
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${c.symbol}${formatted}`;
}
function applyCurrencyToPage() {
  const code = getCurrentCurrency();
  document.querySelectorAll("[data-price-pkr]").forEach(el => {
    const amount = parseFloat(el.getAttribute("data-price-pkr"));
    if (!isNaN(amount)) el.textContent = formatPrice(amount, code);
  });
  document.querySelectorAll(".currency-select").forEach(sel => {
    sel.value = code;
  });
}

/* ---------- Cart helpers ---------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.size === item.size);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}
function updateCartQty(index, qty) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].qty = Math.max(1, qty);
    saveCart(cart);
  }
}
function cartTotalPKR() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}
function updateCartCount() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ---------- WhatsApp helpers ---------- */
function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function buildProductWaMessage(product, size, qty) {
  const price = formatPrice(product.price * qty);
  return `Hi ${STORE_NAME}! I'd like to order:\n\n` +
    `• ${product.name} (${product.brand})\n` +
    `  Size: ${size} | Qty: ${qty}\n` +
    `  Price: ${price}\n\n` +
    `Please confirm availability and delivery details.`;
}
function buildCartWaMessage() {
  const cart = getCart();
  if (cart.length === 0) return `Hi ${STORE_NAME}! I'd like to place an order.`;
  let msg = `Hi ${STORE_NAME}! I'd like to order the following:\n\n`;
  cart.forEach(i => {
    msg += `• ${i.name} — Size: ${i.size} | Qty: ${i.qty} | ${formatPrice(i.price * i.qty)}\n`;
  });
  msg += `\nTotal: ${formatPrice(cartTotalPKR())}\n\nPlease confirm availability, delivery cost, and payment details.`;
  return msg;
}

/* ---------- Product rendering ---------- */
function productCardHTML(p) {
  const oldPriceHTML = p.oldPrice
    ? `<span class="old" data-price-pkr="${p.oldPrice}">${formatPrice(p.oldPrice)}</span>`
    : "";
  return `
  <div class="product-card" data-category="${p.category}">
    <a href="product.html?id=${p.id}">
      <div class="product-thumb">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
        ${p.oldPrice ? '<span class="product-tag">Sale</span>' : ""}
      </div>
    </a>
    <div class="product-body">
      <span class="product-cat">${p.category} · ${p.brand}</span>
      <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="product-price">${oldPriceHTML}<span data-price-pkr="${p.price}">${formatPrice(p.price)}</span></div>
    </div>
    <div class="product-actions">
      <a class="btn btn-outline" href="product.html?id=${p.id}">View</a>
      <button class="btn btn-gold" onclick="quickAddToCart(${p.id})">Add to Cart</button>
    </div>
  </div>`;
}
function quickAddToCart(id) {
  const p = getProductById(id);
  if (!p) return;
  addToCart({ id: p.id, name: p.name, price: p.price, size: p.sizes[0], qty: 1, image: p.images[0] });
  showToast(`${p.name} added to cart`);
}
function renderProductGrid(container, products) {
  if (!container) return;
  container.innerHTML = products.map(productCardHTML).join("");
}

/* ---------- Toast ---------- */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------- Mobile nav ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.main-nav");
  const overlay = document.querySelector(".nav-overlay");
  if (!toggle || !nav) return;
  const close = () => { nav.classList.remove("open"); overlay && overlay.classList.remove("open"); };
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    overlay && overlay.classList.toggle("open");
  });
  overlay && overlay.addEventListener("click", close);
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

/* ---------- WhatsApp float + header links ---------- */
function wireWhatsAppLinks() {
  document.querySelectorAll("[data-wa-link]").forEach(el => {
    el.href = waLink(`Hi ${STORE_NAME}! I have a question about your dresses.`);
  });
}

/* ---------- Currency select wiring ---------- */
function wireCurrencySelects() {
  document.querySelectorAll(".currency-select").forEach(sel => {
    sel.value = getCurrentCurrency();
    sel.addEventListener("change", () => {
      setCurrentCurrency(sel.value);
      applyCurrencyToPage();
    });
  });
}

/* ---------- Footer year ---------- */
function setFooterYear() {
  document.querySelectorAll(".footer-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Page content rendering (home / about / delivery) ---------- */
async function loadHomeContent() {
  const heroVisual = document.querySelector(".hero-visual");
  if (!heroVisual) return;
  try {
    const res = await fetch("content/home.json", { cache: "no-store" });
    const c = await res.json();
    const eyebrow = document.querySelector(".hero .eyebrow");
    const heading = document.querySelector(".hero h1");
    const lead = document.querySelector(".hero .lead");
    const img = document.querySelector(".hero-visual img");
    if (eyebrow && c.heroEyebrow) eyebrow.textContent = c.heroEyebrow;
    if (heading && c.heroHeading) heading.innerHTML = c.heroHeading;
    if (lead && c.heroText) lead.textContent = c.heroText;
    if (img && c.heroImage) { img.src = c.heroImage; img.alt = c.heroHeading ? c.heroHeading.replace(/<br\s*\/?>/gi, " ") : ""; }

    const testimonialGrid = document.querySelector(".testimonial-grid");
    if (testimonialGrid && Array.isArray(c.testimonials)) {
      testimonialGrid.innerHTML = c.testimonials.map(t => `
        <div class="testimonial">
          <div class="stars">★★★★★</div>
          <p>"${t.quote}"</p>
          <div class="name">— ${t.name}</div>
        </div>`).join("");
    }
  } catch (e) { /* keep static HTML fallback */ }
}

async function loadAboutContent() {
  const storyHeading = document.getElementById("about-heading");
  if (!storyHeading) return;
  try {
    const res = await fetch("content/about.json", { cache: "no-store" });
    const c = await res.json();
    if (c.heading) storyHeading.textContent = c.heading;
    const paraWrap = document.getElementById("about-paragraphs");
    if (paraWrap && Array.isArray(c.paragraphs)) {
      paraWrap.innerHTML = c.paragraphs.map(p => `<p>${p}</p>`).join("");
    }
    const cardsWrap = document.getElementById("about-cards");
    if (cardsWrap && Array.isArray(c.cards)) {
      cardsWrap.innerHTML = c.cards.map(card => `
        <div class="info-card">
          <h3>${card.icon} ${card.title}</h3>
          <p>${card.text}</p>
        </div>`).join("");
    }
  } catch (e) { /* keep static HTML fallback */ }
}

async function loadDeliveryContent() {
  const countryWrap = document.getElementById("delivery-countries");
  if (!countryWrap) return;
  try {
    const res = await fetch("content/delivery.json", { cache: "no-store" });
    const c = await res.json();
    const introEl = document.getElementById("delivery-intro");
    if (introEl && c.intro) introEl.textContent = c.intro;
    if (Array.isArray(c.countries)) {
      countryWrap.innerHTML = c.countries.map(co => `<span class="country-chip">${co}</span>`).join("");
    }
    const ratesBody = document.getElementById("delivery-rates-body");
    if (ratesBody && Array.isArray(c.timelines)) {
      ratesBody.innerHTML = c.timelines.map(t => `<tr><td>${t.region}</td><td>${t.time}</td></tr>`).join("");
    }
    const chargesWrap = document.getElementById("delivery-charges");
    if (chargesWrap && Array.isArray(c.charges)) {
      chargesWrap.innerHTML = c.charges.map(ch => `
        <div class="info-card">
          <h3>${ch.icon} ${ch.title}</h3>
          <p>${ch.text}</p>
        </div>`).join("");
    }
    const customsEl = document.getElementById("delivery-customs");
    if (customsEl && c.customsNote) customsEl.textContent = c.customsNote;
  } catch (e) { /* keep static HTML fallback */ }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  await loadProducts();

  initMobileNav();
  wireCurrencySelects();
  wireWhatsAppLinks();
  setFooterYear();
  updateCartCount();

  // Homepage
  await loadHomeContent();
  const featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid) renderProductGrid(featuredGrid, PRODUCTS.filter(p => p.featured));

  // About page
  await loadAboutContent();

  // Delivery page
  await loadDeliveryContent();

  // Shop page grid (with category filter)
  const shopGrid = document.getElementById("shop-grid");
  if (shopGrid) {
    renderProductGrid(shopGrid, PRODUCTS);
    applyCurrencyToPage();
    document.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.getAttribute("data-filter");
        const filtered = cat === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
        renderProductGrid(shopGrid, filtered);
        applyCurrencyToPage();
      });
    });
  }

  // Product detail page
  const pdpRoot = document.getElementById("pdp-root");
  if (pdpRoot) initProductDetailPage();

  // Cart page
  const cartRoot = document.getElementById("cart-root");
  if (cartRoot) initCartPage();

  applyCurrencyToPage();
});

/* ---------- Product detail page logic ---------- */
function initProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id"));
  const notFound = document.getElementById("pdp-not-found");
  const root = document.getElementById("pdp-root");

  if (!product) {
    root.style.display = "none";
    if (notFound) notFound.style.display = "block";
    const relatedSection = document.getElementById("related-section");
    if (relatedSection) relatedSection.style.display = "none";
    return;
  }

  document.title = `${product.name} — Mehre`;
  const gallery = document.getElementById("pdp-gallery");
  gallery.innerHTML = `<img src="${product.images[0]}" alt="${product.name}" id="pdp-main-img">`;
  const thumbWrap = document.getElementById("pdp-thumbs");
  if (thumbWrap) {
    thumbWrap.innerHTML = product.images.map((src, idx) =>
      `<button type="button" class="pdp-thumb${idx === 0 ? " active" : ""}" data-src="${src}"><img src="${src}" alt="${product.name} view ${idx + 1}"></button>`
    ).join("");
    thumbWrap.querySelectorAll(".pdp-thumb").forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById("pdp-main-img").src = btn.getAttribute("data-src");
        thumbWrap.querySelectorAll(".pdp-thumb").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }
  document.getElementById("pdp-cat").textContent = `${product.category} · ${product.brand}`;
  document.getElementById("pdp-title").textContent = product.name;
  document.getElementById("pdp-desc").textContent = product.description;
  document.getElementById("breadcrumb-name").textContent = product.name;

  const priceEl = document.getElementById("pdp-price");
  priceEl.innerHTML = (product.oldPrice ? `<span class="old" data-price-pkr="${product.oldPrice}">${formatPrice(product.oldPrice)}</span>` : "") +
    `<span data-price-pkr="${product.price}">${formatPrice(product.price)}</span>`;

  const sizeWrap = document.getElementById("pdp-sizes");
  let selectedSize = product.sizes[0];
  sizeWrap.innerHTML = product.sizes.map((s, idx) =>
    `<button type="button" class="size-btn${idx === 0 ? " active" : ""}" data-size="${s}">${s}</button>`
  ).join("");
  sizeWrap.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      sizeWrap.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.getAttribute("data-size");
    });
  });

  const qtyInput = document.getElementById("pdp-qty");
  document.getElementById("pdp-qty-minus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1") - 1);
  });
  document.getElementById("pdp-qty-plus").addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value || "1") + 1;
  });

  document.getElementById("pdp-add-cart").addEventListener("click", () => {
    const qty = Math.max(1, parseInt(qtyInput.value || "1"));
    addToCart({ id: product.id, name: product.name, price: product.price, size: selectedSize, qty, image: product.images[0] });
    showToast(`${product.name} (${selectedSize}) added to cart`);
  });

  document.getElementById("pdp-buy-now").addEventListener("click", (e) => {
    e.preventDefault();
    const qty = Math.max(1, parseInt(qtyInput.value || "1"));
    window.open(waLink(buildProductWaMessage(product, selectedSize, qty)), "_blank");
  });

  // Related products (same category, excluding current)
  const relatedGrid = document.getElementById("related-grid");
  if (relatedGrid) {
    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    renderProductGrid(relatedGrid, related.length ? related : PRODUCTS.filter(p => p.id !== product.id).slice(0, 4));
  }

  applyCurrencyToPage();
}

/* ---------- Cart page logic ---------- */
function initCartPage() {
  const tbody = document.getElementById("cart-body");
  const emptyState = document.getElementById("cart-empty");
  const filledState = document.getElementById("cart-filled");

  function render() {
    const cart = getCart();
    if (cart.length === 0) {
      emptyState.style.display = "block";
      filledState.style.display = "none";
      return;
    }
    emptyState.style.display = "none";
    filledState.style.display = "grid";

    tbody.innerHTML = cart.map((item, idx) => `
      <tr>
        <td>
          <div class="cart-item-info">
            <div class="cart-thumb"><img src="${item.image}" alt="${item.name}"></div>
            <div>
              <div style="font-weight:600;">${item.name}</div>
              <div class="muted" style="font-size:.8rem;">Size: ${item.size}</div>
              <button class="cart-remove" data-idx="${idx}">Remove</button>
            </div>
          </div>
        </td>
        <td><span data-price-pkr="${item.price}">${formatPrice(item.price)}</span></td>
        <td><input type="number" min="1" class="cart-qty" data-idx="${idx}" value="${item.qty}"></td>
        <td><span data-price-pkr="${item.price * item.qty}">${formatPrice(item.price * item.qty)}</span></td>
      </tr>
    `).join("");

    document.getElementById("cart-subtotal").setAttribute("data-price-pkr", cartTotalPKR());
    document.getElementById("cart-subtotal").textContent = formatPrice(cartTotalPKR());
    document.getElementById("cart-total").setAttribute("data-price-pkr", cartTotalPKR());
    document.getElementById("cart-total").textContent = formatPrice(cartTotalPKR());

    tbody.querySelectorAll(".cart-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        removeFromCart(parseInt(btn.getAttribute("data-idx")));
        render();
      });
    });
    tbody.querySelectorAll(".cart-qty").forEach(input => {
      input.addEventListener("change", () => {
        updateCartQty(parseInt(input.getAttribute("data-idx")), parseInt(input.value || "1"));
        render();
      });
    });
    applyCurrencyToPage();
  }

  const checkoutBtn = document.getElementById("cart-checkout-wa");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (getCart().length === 0) return;
      window.open(waLink(buildCartWaMessage()), "_blank");
    });
  }

  render();
}
