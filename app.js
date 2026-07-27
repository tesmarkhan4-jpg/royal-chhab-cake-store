/* ==========================================================================
   Royal Chhab Custom Cakes - Real-Time Multi-Page Sync Engine & Gmail Receipts
   Location: Near RHC Hospital, Chhab, Punjab, Pakistan
   ========================================================================== */

// Shared Storage & Sync Channel
const SYNC_CHANNEL_NAME = 'luxecakes_sync_channel';
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL_NAME) : null;

// Audio Loop Timers & Splash State
let adminAudioInterval = null;
let riderAudioInterval = null;
let leafletMapInstances = {};
let currentSplashStep = 1;
let currentHeroSlide = 0;
let heroAutoplayTimer = null;

// Initial Sample Rider Fleet Roster
const DEFAULT_RIDERS = [
  { id: 'RD-7892', name: 'Zohaib Khan', phone: '0301-5557892', email: 'zohaibkhan@gmail.com', vehicle: 'Motorbike', status: 'Online', trips: 14, earnings: 4200 },
  { id: 'RD-3410', name: 'Tariq Mehmood', phone: '0333-8883410', email: 'tariq@gmail.com', vehicle: 'Express Scooter', status: 'Online', trips: 8, earnings: 2400 }
];

// Initial Mock Product Reviews
const DEFAULT_PRODUCT_REVIEWS = [
  { productId: 'prod-101', author: 'Faris Ali', rating: 5, comment: 'Exceptional dark cocoa flavor, gold flakes look spectacular. Very luxury cake!', date: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  { productId: 'prod-101', author: 'Amna Nawaz', rating: 4, comment: 'Super moist and chocolatey. Highly recommend for birthday surprises.', date: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { productId: 'prod-102', author: 'Zafar Hayat', rating: 5, comment: 'The combination of strawberry compote and pistachio cream is so delicious and light.', date: Date.now() - 5 * 24 * 60 * 60 * 1000 },
  { productId: 'prod-103', author: 'Hina Baig', rating: 5, comment: 'Ordered for my daughter wedding. Absolutely stunning tiered cake, everyone loved it!', date: Date.now() - 6 * 24 * 60 * 60 * 1000 },
  { productId: 'prod-105', author: 'Tariq Mehmood', rating: 5, comment: 'Best cupcakes in Chhab! The mango passionfruit flavor is unreal.', date: Date.now() - 1 * 24 * 60 * 60 * 1000 },
  { productId: 'prod-107', author: 'Asma Raza', rating: 4, comment: 'Beautiful lemon drizzle, loved the tangy sweetness. Great for afternoon tea!', date: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  { productId: 'prod-110', author: 'Bilal Khan', rating: 5, comment: 'The Belgian chocolate fondant is pure perfection. Rich, dark and fudgy.', date: Date.now() - 7 * 24 * 60 * 60 * 1000 }
];

// Initial Mock General Storefront Testimonials
const DEFAULT_GENERAL_FEEDBACK = [
  { author: "Kamil Shah", rating: 5, comment: "Ordered custom fondant tier cake for my brother's wedding near RHC Hospital. The delivery was on-time and the chocolate cake tasted heavenly!", date: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  { author: "Sania Malik", rating: 5, comment: "Their strawberry pistachio torte is a masterpiece. The online status tracker worked perfectly, bakes were fresh. Royal Chhab is definitely the best bakery in Punjab!", date: Date.now() - 24 * 60 * 60 * 1000 },
  { author: "Ahsan Butt", rating: 5, comment: "Placed an order at night, cake was ready by morning. The red velvet was absolutely divine with cream cheese frosting. Will order again!", date: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { author: "Nadia Rasheed", rating: 4, comment: "The lemon drizzle and rose water cake was something I had never tasted before. Unique, fragrant and beautifully presented.", date: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  { author: "Usman Ghani", rating: 5, comment: "10/10 experience. The cupcake box with mango passionfruit was the star of our office party. Everyone asked where we got it!", date: Date.now() - 5 * 24 * 60 * 60 * 1000 },
  { author: "Mariam Iqbal", rating: 5, comment: "Fastest delivery in Chhab! The live baking countdown was so cool â€” my kids loved watching it. Cake was flawless.", date: Date.now() - 6 * 24 * 60 * 60 * 1000 }
];

// Initial Pakistani Payment Systems
const DEFAULT_PAYMENT_METHODS = [
  { id: 'pay-cod', name: 'Cash on Delivery / Pickup', accountName: 'Cash', accountNumber: 'N/A', instructions: 'Pay cash directly upon cake delivery or store pickup in Chhab.', isCOD: true },
  { id: 'pay-1', name: 'EasyPaisa', accountName: 'Faheem Ahmed', accountNumber: '0300-1234567', instructions: 'Transfer the total amount to our EasyPaisa account and upload the receipt screenshot.', isCOD: false },
  { id: 'pay-2', name: 'Meezan Bank Transfer', accountName: 'Royal Chhab Cakes', accountNumber: 'PK73MEZN001290382718', instructions: 'Transfer the total amount to our Meezan Bank account and upload the receipt screenshot.', isCOD: false }
];

// Application State
let appState = {
  activeAdminTab: 'orders',
  adminOrderFilter: 'all',
  categoryFilter: 'all',
  cart: [],
  products: [],
  orders: [],
  riders: [],
  reviews: [],
  generalFeedback: [],
  paymentMethods: [],
  riderOnline: true,
  activeRiderJobId: null,
  rejectedJobs: [],
  aiImageLoaded: false,
  aiOriginalImage: null,
  storeOpen: true,
  deliveryFee: 5,
  fulfillmentType: 'delivery',
  storeAddress: 'Near RHC Hospital, Main Road, Chhab, Punjab, Pakistan',
  currentUser: null,
  currentRider: null,
  users: []
};

// ============================================================================
// ROYAL CHHAB FULL PRODUCT CATALOG â€” 20 Products (5 per Category) â€” Prices in Â£GBP
// ============================================================================
const DEFAULT_PRODUCTS = [

  // â”€â”€ SIGNATURE ARTISANAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'prod-101',
    name: 'Royal Dark Chocolate Truffle',
    category: 'Signature',
    price: 28,
    prepTimeMinutes: 40,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    description: 'Triple-layer 70% dark cocoa sponge infused with hazelnut praline and edible gold leaf flakes. A regal indulgence.'
  },
  {
    id: 'prod-104',
    name: 'Salted Caramel Macaron Torte',
    category: 'Signature',
    price: 32,
    prepTimeMinutes: 30,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
    description: 'Rich salted caramel sponge topped with house-baked French macarons, caramel drizzle and edible pearls.'
  },
  {
    id: 'prod-107',
    name: 'Lemon Drizzle & Rose Water Cake',
    category: 'Signature',
    price: 25,
    prepTimeMinutes: 35,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?auto=format&fit=crop&w=600&q=80',
    description: 'Zesty organic lemon sponge soaked in rose water syrup, finished with candied lemon peel and dried rose petals.'
  },
  {
    id: 'prod-108',
    name: 'Belgian Chocolate Fondant Cake',
    category: 'Signature',
    price: 35,
    prepTimeMinutes: 45,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
    description: 'Sinfully rich Belgian dark chocolate fondant cake with a molten centre and bitter cocoa glaze. Served warm.'
  },
  {
    id: 'prod-109',
    name: 'Pistachio & Cardamom Opera Cake',
    category: 'Signature',
    price: 42,
    prepTimeMinutes: 50,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    description: 'Elegant layered opera cake with Iranian pistachio cream, cardamom-scented ganache and gold mirror glaze finish.'
  },

  // â”€â”€ BIRTHDAY DELIGHTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'prod-102',
    name: 'Strawberry & Pistachio Special Torte',
    category: 'Birthday',
    price: 24,
    prepTimeMinutes: 35,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    description: 'Fluffy vanilla bean cake filled with organic strawberry compote and crushed Iranian pistachios. A crowd favourite.'
  },
  {
    id: 'prod-106',
    name: 'Classic Red Velvet Birthday Cake',
    category: 'Birthday',
    price: 22,
    prepTimeMinutes: 35,
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80',
    description: 'Moist red velvet sponge with smooth cream cheese frosting, fresh berry garnish and custom message inscription.'
  },
  {
    id: 'prod-110',
    name: 'Rainbow Confetti Celebration Cake',
    category: 'Birthday',
    price: 20,
    prepTimeMinutes: 30,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=600&q=80',
    description: 'Fun-filled rainbow confetti sponge with vanilla buttercream and a vivid sprinkle cascade. Perfect for kids.'
  },
  {
    id: 'prod-111',
    name: 'Mango & Coconut Tropical Birthday',
    category: 'Birthday',
    price: 24,
    prepTimeMinutes: 35,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Light coconut sponge layered with fresh Chaunsa mango cream and toasted coconut flakes. Tropical bliss.'
  },
  {
    id: 'prod-112',
    name: 'Chocolate Hazelnut Drip Cake',
    category: 'Birthday',
    price: 26,
    prepTimeMinutes: 40,
    image: 'https://images.unsplash.com/photo-1549040855-3d9d93ac1a89?auto=format&fit=crop&w=600&q=80',
    description: 'Decadent chocolate sponge with Nutella filling, hazelnut praline crunch and glossy chocolate drip finish.'
  },

  // â”€â”€ BOUTIQUE WEDDING CAKES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'prod-103',
    name: 'Royal Chhab Grand Wedding Tier Cake',
    category: 'Wedding',
    price: 75,
    prepTimeMinutes: 60,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    description: 'Tiered Madagascar vanilla cake with handcrafted buttercream roses, sugar orchids and champagne glaze.'
  },
  {
    id: 'prod-113',
    name: 'Pearl White Fondant Wedding Cake',
    category: 'Wedding',
    price: 85,
    prepTimeMinutes: 75,
    image: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=600&q=80',
    description: 'Immaculate pearl white fondant three-tier cake with hand-piped lace detail and cascading sugar flowe£'
  },
  {
    id: 'prod-114',
    name: 'Blush Rose Gold Bridal Cake',
    category: 'Wedding',
    price: 95,
    prepTimeMinutes: 90,
    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
    description: 'Romantic blush pink and rose gold five-tier wedding cake with hand-sugar roses and edible gold leaf.'
  },
  {
    id: 'prod-115',
    name: 'Minimalist Naked Wedding Cake',
    category: 'Wedding',
    price: 65,
    prepTimeMinutes: 60,
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=600&q=80',
    description: 'Rustic semi-naked cake with vanilla cream cheese frosting, fresh botanicals, figs and seasonal berries.'
  },
  {
    id: 'prod-116',
    name: 'Black Tie Luxury Wedding Cake',
    category: 'Wedding',
    price: 110,
    prepTimeMinutes: 90,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    description: 'Dramatic black fondant five-tier showstopper with gold geometric patterns, hand-painted details and champagne cake inside.'
  },

  // â”€â”€ GOURMET CUPCAKES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'prod-105',
    name: 'Artisanal Gourmet Cupcake Box (Ã—6)',
    category: 'Cupcakes',
    price: 16,
    prepTimeMinutes: 20,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
    description: 'Assorted artisan cupcakes: Velvet Rose, Dark Cocoa, Salted Caramel, Mango Passionfruit. Perfect gift boxes.'
  },
  {
    id: 'prod-117',
    name: 'Red Velvet Cream Cheese Cupcakes (Ã—6)',
    category: 'Cupcakes',
    price: 14,
    prepTimeMinutes: 20,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    description: 'Classic red velvet cupcakes crowned with swirls of tangy cream cheese frosting and edible glitter hearts.'
  },
  {
    id: 'prod-118',
    name: 'Chocolate Fudge Frosted Cupcakes (Ã—6)',
    category: 'Cupcakes',
    price: 15,
    prepTimeMinutes: 20,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?auto=format&fit=crop&w=600&q=80',
    description: 'Triple-chocolate cupcakes with dark fudge ganache frosting, Oreo crumble and chocolate chip topping.'
  },
  {
    id: 'prod-119',
    name: 'Lemon & Blueberry Swirl Cupcakes (Ã—6)',
    category: 'Cupcakes',
    price: 14,
    prepTimeMinutes: 20,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    description: 'Zesty lemon sponge cupcakes with blueberry compote centre and lemon curd buttercream swirl on top.'
  },
  {
    id: 'prod-120',
    name: 'Luxury Unicorn Cupcake Party Box (Ã—12)',
    category: 'Cupcakes',
    price: 28,
    prepTimeMinutes: 25,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=600&q=80',
    description: 'Magical rainbow unicorn cupcake party box with multicolour buttercream swirls, edible horns and star sprinkles. Kids love it!'
  }
];

// Initialize Application on Page Load
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  initBroadcastListener();
  renderCurrentPage();
  checkSplashOnboarding();
  startCountdownTimerLoop();
  checkContinuousAudioAlerts();
  initializeGoogleAuth();
  
  if (document.body.dataset.page === 'customer') {
    startHeroAutoplay();
  }
});

function renderCurrentPage() {
  const page = document.body.dataset.page;
  updatePendingBadges();

  if (page === 'customer') {
    renderStorefrontCatalog();
    updateCartUI();
    updateActiveOrdersIndicator();
    renderCustomerAuthWidget();
    renderGeneralFeedback();
  } else if (page === 'admin') {
    renderAdminOrders();
    renderAdminProducts();
    renderAdminRiders();
    renderAdminPayments();
    renderAdminUsers();
  } else if (page === 'rider') {
    renderRiderPortal();
    const badge = document.getElementById('rider-dispatch-badge');
    if (badge) badge.style.display = 'none';
  }
}

// ============================================================================
// MODERN 3-STEP SPLASH ONBOARDING CAROUSEL
// ============================================================================
function checkSplashOnboarding() {
  const page = document.body.dataset.page;
  const onboarded = localStorage.getItem('luxecakes_onboarded');
  
  if (page === 'customer' && !appState.currentUser && !onboarded) {
    const splashModal = document.getElementById('onboarding-splash-modal');
    if (splashModal) splashModal.classList.add('active');
  }
}

function goToSplashStep(step) {
  currentSplashStep = step;
  [1, 2, 3].forEach(s => {
    const stepEl = document.getElementById(`splash-step-${s}`);
    const dotEl = document.getElementById(`dot-${s}`);
    if (stepEl) stepEl.style.display = s === step ? 'block' : 'none';
    if (dotEl) dotEl.className = s === step ? 'dot active' : 'dot';
  });

  const btnNext = document.getElementById('splash-btn-next');
  const btnStart = document.getElementById('splash-btn-start');

  if (step === 3) {
    if (btnNext) btnNext.style.display = 'none';
    if (btnStart) btnStart.style.display = 'inline-flex';
  } else {
    if (btnNext) btnNext.style.display = 'inline-flex';
    if (btnStart) btnStart.style.display = 'none';
  }
}

function nextSplashStep() {
  if (currentSplashStep < 3) {
    goToSplashStep(currentSplashStep + 1);
  }
}

function finishSplashOnboarding(openAuth = false) {
  localStorage.setItem('luxecakes_onboarded', 'true');
  const splashModal = document.getElementById('onboarding-splash-modal');
  if (splashModal) splashModal.classList.remove('active');

  if (openAuth) {
    openCustomerAuthModal();
  } else {
    showToast('Welcome to Royal Chhab Custom Cakes Store!', 'success');
  }
}

// ============================================================================
// STORAGE & REAL-TIME BROADCAST ENGINE
// ============================================================================
function loadStateFromStorage() {
  const CATALOG_VERSION = 'v5-fixed';
  const savedCatalogVersion = localStorage.getItem('luxecakes_catalog_version');
  const savedProducts = localStorage.getItem('luxecakes_products');
  if (savedProducts && savedCatalogVersion === CATALOG_VERSION) {
    appState.products = JSON.parse(savedProducts);
  } else {
    // Seed/upgrade to full 20-product catalog
    appState.products = DEFAULT_PRODUCTS;
    saveProductsToStorage();
    localStorage.setItem('luxecakes_catalog_version', CATALOG_VERSION);
  }

  const savedOrders = localStorage.getItem('luxecakes_orders');
  if (savedOrders) {
    appState.orders = JSON.parse(savedOrders);
  } else {
    appState.orders = [];
  }

  const savedRiders = localStorage.getItem('luxecakes_riders');
  if (savedRiders) {
    appState.riders = JSON.parse(savedRiders);
  } else {
    appState.riders = DEFAULT_RIDERS;
    saveRidersToStorage();
  }

  const savedFee = localStorage.getItem('luxecakes_delivery_fee');
  if (savedFee) {
    appState.deliveryFee = parseInt(savedFee) || 300;
  }

  const savedUser = localStorage.getItem('luxecakes_current_user');
  if (savedUser) {
    appState.currentUser = JSON.parse(savedUser);
  }

  const savedRider = localStorage.getItem('luxecakes_current_rider');
  if (savedRider) {
    appState.currentRider = JSON.parse(savedRider);
  }

  const savedReviews = localStorage.getItem('luxecakes_reviews');
  if (savedReviews) {
    appState.reviews = JSON.parse(savedReviews);
  } else {
    appState.reviews = DEFAULT_PRODUCT_REVIEWS;
    saveReviewsToStorage();
  }

  const savedFeedback = localStorage.getItem('luxecakes_general_feedback');
  if (savedFeedback) {
    appState.generalFeedback = JSON.parse(savedFeedback);
  } else {
    appState.generalFeedback = DEFAULT_GENERAL_FEEDBACK;
    saveFeedbackToStorage();
  }

  const savedPayments = localStorage.getItem('luxecakes_payment_methods');
  if (savedPayments) {
    appState.paymentMethods = JSON.parse(savedPayments);
  } else {
    appState.paymentMethods = DEFAULT_PAYMENT_METHODS;
    savePaymentMethodsToStorage();
  }

  const savedUsers = localStorage.getItem('luxecakes_users');
  if (savedUsers) {
    appState.users = JSON.parse(savedUsers);
  } else {
    // Seed initial mock users from testimonials and reviews
    appState.users = [
      { name: 'Faheem Ahmed', email: 'faheemkhan101992@gmail.com', provider: 'Google', joinedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
      { name: 'Kamil Shah', email: 'kamilshah@gmail.com', provider: 'Google', joinedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { name: 'Sania Malik', email: 'sania@gmail.com', provider: 'Google', joinedAt: Date.now() - 24 * 60 * 60 * 1000 }
    ];
    saveUsersToStorage();
  }
}

function saveUsersToStorage() {
  localStorage.setItem('luxecakes_users', JSON.stringify(appState.users));
  broadcastStateChange('users_updated');
}

function saveProductsToStorage() {
  localStorage.setItem('luxecakes_products', JSON.stringify(appState.products));
  broadcastStateChange('products_updated');
}

function saveOrdersToStorage() {
  localStorage.setItem('luxecakes_orders', JSON.stringify(appState.orders));
  broadcastStateChange('orders_updated');
}

function saveRidersToStorage() {
  localStorage.setItem('luxecakes_riders', JSON.stringify(appState.riders));
  broadcastStateChange('riders_updated');
}

function saveReviewsToStorage() {
  localStorage.setItem('luxecakes_reviews', JSON.stringify(appState.reviews));
  broadcastStateChange('reviews_updated');
}

function saveFeedbackToStorage() {
  localStorage.setItem('luxecakes_general_feedback', JSON.stringify(appState.generalFeedback));
  broadcastStateChange('feedback_updated');
}

function savePaymentMethodsToStorage() {
  localStorage.setItem('luxecakes_payment_methods', JSON.stringify(appState.paymentMethods));
  broadcastStateChange('payments_updated');
}

function broadcastStateChange(type, payload = {}) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

function initBroadcastListener() {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      const { type } = event.data;
      loadStateFromStorage();
      renderCurrentPage();
      checkContinuousAudioAlerts();

      if (type === 'new_order_placed' && document.body.dataset.page === 'admin') {
        showToast('ðŸ”” NEW ORDER PLACED! Soft chime alert playing continuously...', 'danger');
      } else if (type === 'rider_dispatched' && document.body.dataset.page === 'rider' && appState.riderOnline) {
        showToast('ðŸ›µ NEW RIDER DISPATCH ALERT! Courier siren alarm active.', 'danger');
      } else if (type === 'settings_updated') {
        updateCartUI();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'luxecakes_orders' || e.key === 'luxecakes_products' || e.key === 'luxecakes_riders' || e.key === 'luxecakes_delivery_fee' || e.key === 'luxecakes_reviews' || e.key === 'luxecakes_general_feedback' || e.key === 'luxecakes_payment_methods') {
      loadStateFromStorage();
      renderCurrentPage();
      checkContinuousAudioAlerts();
    }
  });
}

function updatePendingBadges() {
  const bakingCount = appState.orde£filter(o => o.status === 'Baking & Prepping' || o.status === 'New Order').length;
  const dispatchCount = appState.orde£filter(o => o.status === 'Dispatching Rider').length;

  const adminBadge = document.getElementById('admin-pending-count');
  if (adminBadge) adminBadge.textContent = bakingCount;

  const riderBadge = document.getElementById('rider-dispatch-badge');
  if (riderBadge) {
    riderBadge.style.display = dispatchCount > 0 ? 'inline-block' : 'none';
    riderBadge.textContent = dispatchCount;
  }
}

// ============================================================================
// CUSTOMER & RIDER AUTHENTICATION & SOCIAL LOGINS (GOOGLE & FACEBOOK)
// ============================================================================
function openCustomerAuthModal() {
  document.getElementById('customer-auth-modal').classList.add('active');
}

function closeCustomerAuthModal() {
  document.getElementById('customer-auth-modal').classList.remove('active');
}

function switchAuthTab(tab) {
  const signinTab = document.getElementById('auth-tab-signin');
  const signupTab = document.getElementById('auth-tab-signup');
  const signinForm = document.getElementById('form-auth-signin');
  const signupForm = document.getElementById('form-auth-signup');

  if (tab === 'signup') {
    signinTab.classList.remove('active');
    signupTab.classList.add('active');
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
  } else {
    signupTab.classList.remove('active');
    signinTab.classList.add('active');
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
  }
}

function handleCustomerLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById('login-identifier').value;
  appState.currentUser = {
    name: identifier.includes('@') ? identifier.split('@')[0] : 'Faheem Ahmed',
    email: identifier.includes('@') ? identifier : 'faheemkhan101992@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    provider: 'Email'
  };
  localStorage.setItem('luxecakes_current_user', JSON.stringify(appState.currentUser));
  localStorage.setItem('luxecakes_onboarded', 'true');
  closeCustomerAuthModal();
  renderCustomerAuthWidget();
  showToast(`Welcome back, ${appState.currentUser.name}! You stay signed in.`, 'success');
}

function handleCustomerRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email')?.value || 'faheemkhan101992@gmail.com';
  appState.currentUser = {
    name: name,
    email: email,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    provider: 'Direct'
  };
  localStorage.setItem('luxecakes_current_user', JSON.stringify(appState.currentUser));
  localStorage.setItem('luxecakes_onboarded', 'true');
  closeCustomerAuthModal();
  renderCustomerAuthWidget();
  showToast(`Account created! Welcome to Royal Chhab, ${name}.`, 'success');
}

function handleSocialAuth(provider) {
  const name = provider === 'Google' ? 'Faheem Ahmed (Google User)' : 'Faheem Ahmed (Facebook User)';
  appState.currentUser = {
    name: name,
    email: 'faheemkhan101992@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    provider: provider
  };
  localStorage.setItem('luxecakes_current_user', JSON.stringify(appState.currentUser));
  localStorage.setItem('luxecakes_onboarded', 'true');
  closeCustomerAuthModal();
  renderCustomerAuthWidget();
  showToast(`Successfully authenticated via ${provider}!`, 'success');
}

function handleCustomerLogout() {
  appState.currentUser = null;
  localStorage.removeItem('luxecakes_current_user');
  renderCustomerAuthWidget();
  showToast('Logged out of Royal Chhab account.', 'info');
}

function renderCustomerAuthWidget() {
  const widget = document.getElementById('customer-auth-widget');
  if (!widget) return;

  if (appState.currentUser) {
    widget.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.6rem; background:var(--bg-card); border:1px solid var(--border-subtle); padding:0.3rem 0.8rem 0.3rem 0.4rem; border-radius:var(--radius-full);">
        <img src="${appState.currentUser.avatar}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
        <span style="font-size:0.88rem; font-weight:700; color:var(--primary-rose);">${appState.currentUser.name}</span>
        <button onclick="handleCustomerLogout()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.85rem;" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;

    const custNameInput = document.getElementById('cust-name');
    const custEmailInput = document.getElementById('cust-email');
    if (custNameInput && !custNameInput.value) custNameInput.value = appState.currentUser.name;
    if (custEmailInput && !custEmailInput.value) custEmailInput.value = appState.currentUser.email || 'faheemkhan101992@gmail.com';
  } else {
    widget.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="openCustomerAuthModal()">
        <i class="fa-solid fa-user-lock"></i> Sign In / Register
      </button>
    `;
  }
}

// RIDER AUTHENTICATION
function openRiderAuthModal() {
  document.getElementById('rider-auth-modal').classList.add('active');
}

function closeRiderAuthModal() {
  document.getElementById('rider-auth-modal').classList.remove('active');
}

function toggleRiderAuthTab(tab) {
  const signinBtn = document.getElementById('rider-tab-signin-btn');
  const signupBtn = document.getElementById('rider-tab-signup-btn');
  const signinForm = document.getElementById('rider-signin-form-container');
  const signupForm = document.getElementById('rider-signup-form-container');

  if (tab === 'signin') {
    if (signinBtn) {
      signinBtn.classList.add('active');
      signinBtn.style.color = '#10b981';
      signinBtn.style.borderBottom = '3px solid #10b981';
    }
    if (signupBtn) {
      signupBtn.classList.remove('active');
      signupBtn.style.color = 'var(--text-muted)';
      signupBtn.style.borderBottom = 'none';
    }
    if (signinForm) signinForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
  } else {
    if (signupBtn) {
      signupBtn.classList.add('active');
      signupBtn.style.color = '#10b981';
      signupBtn.style.borderBottom = '3px solid #10b981';
    }
    if (signinBtn) {
      signinBtn.classList.remove('active');
      signinBtn.style.color = 'var(--text-muted)';
      signinBtn.style.borderBottom = 'none';
    }
    if (signinForm) signinForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
  }
}

function handleRiderLogin(e) {
  e.preventDefault();
  const phoneOrId = document.getElementById('rider-login-phone').value.trim();
  const rider = appState.ride£find(r => r.phone === phoneOrId || r.id === phoneOrId);

  if (!rider) {
    showToast('Rider account not found. Please Sign Up/Register first!', 'danger');
    return;
  }

  appState.currentRider = rider;
  localStorage.setItem('luxecakes_current_rider', JSON.stringify(rider));
  closeRiderAuthModal();
  renderRiderPortal();
  showToast(`Courier Logged In: ${rider.name} (${rider.id})`, 'success');
}

function handleRiderRegister(e) {
  e.preventDefault();
  const name = document.getElementById('rider-reg-name').value.trim();
  const phone = document.getElementById('rider-reg-phone').value.trim();
  const email = document.getElementById('rider-reg-email').value.trim();
  const vehicle = document.getElementById('rider-reg-vehicle').value;

  // Check if phone or email already registered
  const existingRider = appState.ride£find(r => r.phone === phone || r.email.toLowerCase() === email.toLowerCase());
  if (existingRider) {
    showToast('Rider account with this phone or email already exists!', 'danger');
    return;
  }

  const newRider = {
    id: 'RD-' + Math.floor(1000 + Math.random() * 9000),
    name: name,
    phone: phone,
    email: email,
    vehicle: vehicle,
    status: 'Online',
    trips: 0,
    earnings: 0
  };

  appState.ride£push(newRider);
  saveRidersToStorage();

  appState.currentRider = newRider;
  localStorage.setItem('luxecakes_current_rider', JSON.stringify(newRider));

  closeRiderAuthModal();
  renderRiderPortal();
  showToast(`Rider registration successful! Welcome ${name}.`, 'success');
}

function handleRiderLogout() {
  appState.currentRider = null;
  localStorage.removeItem('luxecakes_current_rider');
  location.reload();
}

// ============================================================================
// REAL GOOGLE IDENTITY SERVICES AUTHENTICATION INTEGRATION
// ============================================================================
function initializeGoogleAuth() {
  if (typeof google !== 'undefined') {
    const page = document.body.dataset.page;
    const client_id = localStorage.getItem('luxecakes_google_client_id') || '58809129371-p9fo8c3u06qqsi8gcan86pqem930lnok.apps.googleusercontent.com';
    
    if (page === 'customer') {
      const container = document.getElementById('google-signin-btn-container');
      if (container) {
        google.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleCredentialResponse
        });
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '320'
        });
      }
    } else if (page === 'rider') {
      const container = document.getElementById('rider-google-signin-btn-container');
      if (container) {
        google.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleCredentialResponseRider
        });
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '320'
        });
      }
    }
  } else {
    setTimeout(initializeGoogleAuth, 500);
  }
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode error:", e);
    return null;
  }
}

function handleGoogleCredentialResponse(response) {
  const payload = decodeJwt(response.credential);
  if (payload) {
    appState.currentUser = {
      name: payload.name,
      email: payload.email,
      avatar: payload.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      provider: 'Google'
    };
    localStorage.setItem('luxecakes_current_user', JSON.stringify(appState.currentUser));
    localStorage.setItem('luxecakes_onboarded', 'true');

    // Register user in list if not already present
    const emailLower = payload.email.toLowerCase();
    const userExists = appState.use£find(u => u.email.toLowerCase() === emailLower);
    if (!userExists) {
      appState.use£push({
        name: payload.name,
        email: payload.email,
        provider: 'Google',
        joinedAt: Date.now()
      });
      saveUsersToStorage();
    }

    closeCustomerAuthModal();
    renderCustomerAuthWidget();
    showToast(`Welcome back, ${appState.currentUser.name}! You signed in with Google.`, 'success');
    
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'AUTH_STATE_CHANGE', user: appState.currentUser });
    }
  } else {
    showToast('Google Sign-In authentication failed.', 'danger');
  }
}

function handleGoogleCredentialResponseRider(response) {
  const payload = decodeJwt(response.credential);
  if (payload) {
    const email = payload.email.toLowerCase();
    let rider = appState.ride£find(r => (r.email && r.email.toLowerCase() === email) || r.phone === email);
    
    if (!rider) {
      showToast('This Google account is not registered as a Rider. Please register yourself first!', 'danger');
      return;
    }

    appState.currentRider = rider;
    localStorage.setItem('luxecakes_current_rider', JSON.stringify(rider));
    closeRiderAuthModal();
    renderRiderPortal();
    showToast(`Courier Logged In via Google: ${rider.name} (${rider.id})`, 'success');
  } else {
    showToast('Rider Google Sign-In failed.', 'danger');
  }
}

function simulateGoogleLogin() {
  const mockJwt = createMockGoogleJwt("Faheem Ahmed", "faheemkhan101992@gmail.com", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80");
  handleGoogleCredentialResponse({ credential: mockJwt });
}

function simulateGoogleLoginRider() {
  const mockJwt = createMockGoogleJwt("Zohaib Khan", "zohaibkhan@gmail.com", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80");
  handleGoogleCredentialResponseRider({ credential: mockJwt });
}

function createMockGoogleJwt(name, email, picture) {
  const header = { alg: "RS256", kid: "mock" };
  const payload = {
    iss: "https://accounts.google.com",
    sub: "mock-uid-5893",
    email: email,
    email_verified: true,
    name: name,
    picture: picture
  };
  const b64H = btoa(JSON.stringify(header));
  const b64P = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${b64H}.${b64P}.signature`;
}

// ============================================================================
// CONTINUOUS AUDIO SYNTHESIZER LOOPS (WEB AUDIO API)
// ============================================================================
function checkContinuousAudioAlerts() {
  const page = document.body.dataset.page;

  if (page === 'admin') {
    const unacceptedCount = appState.orde£filter(o => o.status === 'New Order').length;
    if (unacceptedCount > 0) {
      startAdminContinuousAlert();
    } else {
      stopAdminContinuousAlert();
    }
  } else if (page === 'rider' && appState.riderOnline) {
    const activeDispatches = appState.orde£filter(o => o.status === 'Dispatching Rider' && o.fulfillmentType !== 'pickup' && !appState.rejectedJobs.includes(o.id));
    if (activeDispatches.length > 0) {
      startRiderContinuousAlert();
    } else {
      stopRiderContinuousAlert();
    }
  }
}

function playAdminSoftChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  } catch (e) {}
}

function startAdminContinuousAlert() {
  const indicator = document.getElementById('admin-audio-indicator');
  if (indicator) indicator.style.display = 'inline-flex';

  if (!adminAudioInterval) {
    playAdminSoftChime();
    adminAudioInterval = setInterval(playAdminSoftChime, 1600);
  }
}

function stopAdminContinuousAlert() {
  const indicator = document.getElementById('admin-audio-indicator');
  if (indicator) indicator.style.display = 'none';

  if (adminAudioInterval) {
    clearInterval(adminAudioInterval);
    adminAudioInterval = null;
  }
}

function playRiderSirenAlarm() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    [0, 0.22].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(784, now + delay);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + delay + 0.12);

      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    });
  } catch (e) {}
}

function startRiderContinuousAlert() {
  const indicator = document.getElementById('rider-audio-indicator');
  if (indicator) indicator.style.display = 'inline-flex';

  if (!riderAudioInterval) {
    playRiderSirenAlarm();
    riderAudioInterval = setInterval(playRiderSirenAlarm, 1300);
  }
}

function stopRiderContinuousAlert() {
  const indicator = document.getElementById('rider-audio-indicator');
  if (indicator) indicator.style.display = 'none';

  if (riderAudioInterval) {
    clearInterval(riderAudioInterval);
    riderAudioInterval = null;
  }
}

function testRiderAudio() {
  playRiderSirenAlarm();
  showToast('ðŸ”Š Courier Siren Chime Sound Tested!', 'success');
}

// ============================================================================
// FREE INTERACTIVE LEAFLET.JS OPENSTREETMAP TRACKER
// ============================================================================
function renderInteractiveLeafletMap(containerId, pickupLat = 32.9680, pickupLng = 71.9170, deliveryLat = 32.9720, deliveryLng = 71.9210) {
  if (typeof L === 'undefined') return;

  const container = document.getElementById(containerId);
  if (!container) return;

  if (leafletMapInstances[containerId]) {
    leafletMapInstances[containerId].remove();
  }

  const map = L.map(containerId).setView([pickupLat, pickupLng], 14);
  leafletMapInstances[containerId] = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const pickupMarker = L.marker([pickupLat, pickupLng]).addTo(map);
  pickupMarker.bindPopup("<b>ðŸ‘‘ Royal Chhab Custom Cakes Kitchen</b><br>Near RHC Hospital, Chhab").openPopup();

  const deliveryMarker = L.marker([deliveryLat, deliveryLng]).addTo(map);
  deliveryMarker.bindPopup("<b>ðŸ¡ Customer Delivery Destination</b><br>Chhab Vicinity");

  const routeLine = L.polyline([
    [pickupLat, pickupLng],
    [deliveryLat, deliveryLng]
  ], { color: '#a83250', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
}

// ============================================================================
// STOREFRONT PAGE LOGIC
// ============================================================================
function scrollToCatalog() {
  const el = document.getElementById('catalog-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function filterCategory(cat, el) {
  appState.categoryFilter = cat;
  document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderStorefrontCatalog();
}

function renderStorefrontCatalog() {
  const container = document.getElementById('catalog-section');
  if (!container) return;

  if (!appState.products || appState.products.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:3rem; color:var(--text-muted);">Loading menu...</p>';
    return;
  }

  const categories = [
    { id: 'Signature', name: 'Signature Artisanal Masterpieces', sub: "Chef's premium selections with luxury cake finishes", filter: 'Signature' },
    { id: 'Birthday', name: 'Celebration Birthday Delights', sub: 'Make birthdays unforgettable with soft, moist sponges', filter: 'Birthday' },
    { id: 'Wedding', name: 'Boutique Tiered Wedding Cakes', sub: 'Elegantly designed tiered masterpieces for your big day', filter: 'Wedding' },
    { id: 'Cupcakes', name: 'Gourmet Cupcake Selection', sub: 'Bite-sized luxury treats crafted for high tea celebrations', filter: 'Cupcakes' }
  ];

  container.innerHTML = categories.map(cat => {
    const products = appState.products.filter(p => p.category === cat.filter);
    if (products.length === 0) return '';

    const cardsHtml = products.map(p => {
      const ratingData = getProductAverageRating(p.id);
      const fullStar = '&#9733;';
      const emptyStar = '&#9734;';
      const filled = ratingData.count > 0 ? Math.round(ratingData.average) : 0;
      const starsHtml = ratingData.count > 0
        ? `<div class="product-rating-stars" onclick="openProductDetailsModal('${p.id}')" style="cursor:pointer;" title="View Details &amp; Reviews">
             ${fullStar.repeat(filled)}${emptyStar.repeat(5 - filled)} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">(${ratingData.count})</span>
           </div>`
        : `<div class="product-rating-stars" onclick="openProductDetailsModal('${p.id}')" style="cursor:pointer; opacity:0.5;" title="Be the first to review">
             ${emptyStar.repeat(5)} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">(0)</span>
           </div>`;

      return `
        <div class="product-card">
          <div class="product-img-wrapper" onclick="openProductDetailsModal('${p.id}')" style="cursor:pointer;" title="View Details &amp; Reviews">
            <span class="product-badge">${p.category}</span>
            <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'">
          </div>
          <div class="product-info">
            <h4 class="product-title" onclick="openProductDetailsModal('${p.id}')" style="cursor:pointer;">${p.name}</h4>
            ${starsHtml}
            <p class="product-desc" style="font-size:0.85rem; color:var(--text-muted); line-height:1.4; height:50px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; margin-bottom:1rem;">${p.description}</p>
            <div class="product-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
              <span class="product-price" style="font-size:1.15rem; font-weight:700; color:var(--primary-rose);">&pound;${p.price.toLocaleString()}</span>
              <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}')">
                <i class="fa-solid fa-plus"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="catalog-category-row">
        <div class="category-row-header">
          <div class="category-row-title-box">
            <h3>${cat.name}</h3>
            <p>${cat.sub}</p>
          </div>
          <div class="slider-nav-controls">
            <button class="slider-nav-btn" onclick="slideCatalog('${cat.id}', -1)" title="Scroll Left"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="slider-nav-btn" onclick="slideCatalog('${cat.id}', 1)" title="Scroll Right"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="slider-container">
          <div class="slider-track" id="track-${cat.id}">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

        </div>
      `;
    }).join('');

    return `
      <div class="catalog-category-row">
        <div class="category-row-header">
          <div class="category-row-title-box">
            <h3>${cat.name}</h3>
            <p>${cat.sub}</p>
          </div>
          <div class="slider-nav-controls">
            <button class="slider-nav-btn" onclick="slideCatalog('${cat.id}', -1)" title="Scroll Left"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="slider-nav-btn" onclick="slideCatalog('${cat.id}', 1)" title="Scroll Right"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="slider-container">
          <div class="slider-track" id="track-${cat.id}">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function slideCatalog(catId, direction) {
  const track = document.getElementById(`track-${catId}`);
  if (track) {
    const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 28 : 320;
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.toggle('active');
}

function addToCart(productId) {
  const prod = appState.products.find(p => p.id === productId);
  if (!prod) return;

  const existing = appState.cart.find(item => item.id === productId && !item.isCustom);
  if (existing) {
    existing.quantity++;
  } else {
    appState.cart.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      prepTimeMinutes: prod.prepTimeMinutes,
      image: prod.image,
      quantity: 1,
      isCustom: false
    });
  }

  updateCartUI();
  showToast(`Added "${prod.name}" to basket!`, 'success');
}

function updateCartQuantity(index, delta) {
  appState.cart[index].quantity += delta;
  if (appState.cart[index].quantity <= 0) {
    appState.cart.splice(index, 1);
  }
  updateCartUI();
}

function toggleFulfillmentType(type) {
  appState.fulfillmentType = type;

  const deliveryTab = document.getElementById('tab-fulfillment-delivery');
  const pickupTab = document.getElementById('tab-fulfillment-pickup');
  const deliveryBox = document.getElementById('fulfillment-delivery-box');
  const pickupBox = document.getElementById('fulfillment-pickup-box');
  const custAddrInput = document.getElementById('cust-address');

  if (type === 'pickup') {
    if (deliveryTab) deliveryTab.classList.remove('active');
    if (pickupTab) pickupTab.classList.add('active');
    if (deliveryBox) deliveryBox.style.display = 'none';
    if (pickupBox) pickupBox.style.display = 'block';
    if (custAddrInput) custAddrInput.removeAttribute('required');
  } else {
    if (pickupTab) pickupTab.classList.remove('active');
    if (deliveryTab) deliveryTab.classList.add('active');
    if (pickupBox) pickupBox.style.display = 'none';
    if (deliveryBox) deliveryBox.style.display = 'block';
    if (custAddrInput) custAddrInput.setAttribute('required', 'true');
  }

  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count');
  if (!container || !countBadge) return;
  
  const totalCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
  countBadge.textContent = totalCount;

  if (appState.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-job-state">
        <i class="fa-solid fa-basket-shopping fa-3x" style="color:var(--primary-rose);"></i>
        <p>Your basket is currently empty.</p>
        <span>Explore Royal Chhab cakes or design a custom cake!</span>
      </div>
    `;
  } else {
    container.innerHTML = appState.cart.map((item, idx) => `
      <div class="job-detail-box" style="display:flex; align-items:center; gap:0.8rem; padding:0.88rem;">
        <img src="${item.image}" style="width:56px; height:56px; border-radius:10px; object-fit:cover;">
        <div style="flex-grow:1;">
          <h5 style="font-size:0.95rem; margin-bottom:2px;">${item.name}</h5>
          <span style="color:var(--primary-rose); font-weight:700; font-size:0.9rem;">£ ${item.price.toLocaleString()}</span>
          ${item.customText ? `<div style="font-size:0.78rem; color:var(--text-muted);">Text: "${item.customText}"</div>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <button class="btn btn-outline btn-sm" style="padding:2px 8px;" onclick="updateCartQuantity(${idx}, -1)">-</button>
          <span style="font-weight:700; font-size:0.9rem;">${item.quantity}</span>
          <button class="btn btn-outline btn-sm" style="padding:2px 8px;" onclick="updateCartQuantity(${idx}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = (subtotal > 0 && appState.fulfillmentType === 'delivery') ? appState.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const elSub = document.getElementById('cart-subtotal');
  const elFee = document.getElementById('cart-delivery-fee');
  const elTot = document.getElementById('cart-total');
  const elPayTot = document.getElementById('pay-modal-total');
  const elCheckoutFeeDisplay = document.getElementById('display-checkout-fee');

  if (elSub) elSub.textContent = `£ ${subtotal.toLocaleString()}`;
  if (elFee) elFee.textContent = appState.fulfillmentType === 'pickup' ? '£ 0 (Free Pickup)' : `£ ${appState.deliveryFee.toLocaleString()}`;
  if (elTot) elTot.textContent = `£ ${total.toLocaleString()}`;
  if (elPayTot) elPayTot.textContent = `£ ${total.toLocaleString()}`;
  if (elCheckoutFeeDisplay) elCheckoutFeeDisplay.textContent = `£ ${appState.deliveryFee.toLocaleString()}`;
}

// CUSTOM CAKE BUILDER
function openCustomCakeModal() {
  const modal = document.getElementById('custom-cake-modal');
  if (modal) modal.classList.add('active');
  calculateCustomPrice();
  populateCustomDeliveryDays();
}

function closeCustomCakeModal() {
  const modal = document.getElementById('custom-cake-modal');
  if (modal) modal.classList.remove('active');
}

function populateCustomDeliveryDays() {
  const select = document.getElementById('custom-delivery-day');
  const warning = document.getElementById('custom-cake-lead-warning');
  if (!select) return;

  const leadDays = parseInt(localStorage.getItem('luxecakes_custom_lead_days')) || 2;
  
  if (warning) {
    warning.innerHTML = `<i class="fa-solid fa-circle-info"></i> Please book your custom order at least ${leadDays} days in advance.`;
  }

  select.innerHTML = '';
  for (let i = leadDays; i <= leadDays + 5; i++) {
    const option = document.createElement('option');
    option.value = i;
    const targetDate = new Date(Date.now() + (i * 24 * 60 * 60 * 1000));
    const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    option.textContent = `In ${i} Days (${dateStr}) ${i === leadDays ? '(Minimum Lead Time)' : ''}`;
    select.appendChild(option);
  }
}

function updateCustomCakePreviewText(val) {
  const preview = document.getElementById('cake-text-preview');
  if (preview) preview.textContent = val.trim() || 'Happy Birthday!';
}

function calculateCustomPrice() {
  const sizeSelect = document.getElementById('custom-size');
  if (!sizeSelect) return;

  const basePrice = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price')) || 3200;
  const frosting = document.getElementById('custom-frosting').value;
  let addon = frosting.includes('Gold Leaf') ? 500 : 0;

  const total = basePrice + addon;
  document.getElementById('custom-total-price').textContent = `£ ${total.toLocaleString()}`;
  
  let prep = 40;
  if (sizeSelect.value === '2-tier') prep = 55;
  if (sizeSelect.value === '3-tier') prep = 75;
  document.getElementById('custom-prep-time').textContent = `${prep} Minutes`;
}

function addCustomCakeToCart() {
  const sizeSelect = document.getElementById('custom-size');
  const sizeText = sizeSelect.options[sizeSelect.selectedIndex].text.split(' - ')[0];
  const flavor = document.getElementById('custom-flavor').value;
  const frosting = document.getElementById('custom-frosting').value;
  const text = document.getElementById('custom-text').value;
  const notes = document.getElementById('custom-notes').value;
  const price = parseInt(document.getElementById('custom-total-price').textContent.replace(/[^\d]/g, '')) || 3200;

  let prep = 40;
  if (sizeSelect.value === '2-tier') prep = 55;
  if (sizeSelect.value === '3-tier') prep = 75;

  const daysSelect = document.getElementById('custom-delivery-day');
  const daysLead = daysSelect ? daysSelect.value : 2;
  const daysText = daysSelect ? daysSelect.options[daysSelect.selectedIndex].text : `${daysLead} Days`;

  appState.cart.push({
    id: 'custom-' + Date.now(),
    name: `Custom Cake (${sizeText})`,
    price: price,
    prepTimeMinutes: prep,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    quantity: 1,
    isCustom: true,
    customText: text || 'Custom Message',
    details: `${flavor} Sponge, ${frosting}. Delivery target: ${daysText}. Notes: ${notes || 'None'}`
  });

  closeCustomCakeModal();
  updateCartUI();
  toggleCartDrawer();
  showToast('Custom cake added to basket!', 'success');
}

// CHECKOUT & AUTOMATED EMAIL RECEIPT DISPATCH VIA GMAIL SMTP
function openCheckoutModal() {
  if (appState.cart.length === 0) {
    showToast('Your basket is empty!', 'danger');
    return;
  }
  toggleCartDrawer();
  document.getElementById('checkout-modal').classList.add('active');
  toggleFulfillmentType(appState.fulfillmentType);
  renderCheckoutPaymentMethods();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.remove('active');
}

function renderCheckoutPaymentMethods() {
  const tabs = document.getElementById('checkout-payment-tabs');
  if (!tabs) return;

  tabs.innerHTML = appState.paymentMethods.map((m, idx) => `
    <label class="payment-tab ${idx === 0 ? 'active' : ''}">
      <input type="radio" name="pay-method" value="${m.id}" ${idx === 0 ? 'checked' : ''} onchange="toggleCheckoutPaymentDetails('${m.id}')" style="display:none;">
      <i class="fa-solid ${m.isCOD ? 'fa-hand-holding-dollar' : 'fa-credit-card'}"></i> ${m.name}
    </label>
  `).join('');

  if (appState.paymentMethods.length > 0) {
    toggleCheckoutPaymentDetails(appState.paymentMethods[0].id);
  }
}

function toggleCheckoutPaymentDetails(paymentId) {
  const box = document.getElementById('checkout-payment-details-box');
  if (!box) return;

  document.querySelectorAll('#checkout-payment-tabs .payment-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  const radio = document.querySelector(`input[name="pay-method"][value="${paymentId}"]`);
  if (radio) {
    radio.checked = true;
    radio.closest('.payment-tab').classList.add('active');
  }

  const method = appState.paymentMethods.find(m => m.id === paymentId);
  if (!method) return;

  let html = `
    <div style="font-size:0.92rem; color:var(--text-main); margin-bottom:0.8rem;">
      <strong>Instructions:</strong> ${method.instructions}
    </div>
  `;

  if (!method.isCOD) {
    html += `
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); padding:0.8rem 1.1rem; border-radius:var(--radius-md); font-size:0.88rem; margin-bottom:0.8rem;">
        <strong>Account Name:</strong> ${method.accountName}<br>
        <strong>Account Number / IBAN:</strong> <code style="font-weight:700; color:var(--primary-rose);">${method.accountNumber}</code>
      </div>
      <div class="form-group mb-0">
        <label style="color:var(--primary-rose); font-weight:700;"><i class="fa-solid fa-cloud-arrow-up"></i> Upload Payment Receipt Screenshot (JPEG/PNG) *</label>
        <input type="file" id="checkout-receipt-file" class="form-control" accept="image/*" required onchange="handleReceiptFileSelect(this)">
        <div id="receipt-preview-container" style="margin-top:0.6rem; display:none;">
          <img id="receipt-preview-img" style="max-width:160px; max-height:160px; object-fit:contain; border:1px solid var(--border-subtle); border-radius:var(--radius-sm);">
        </div>
      </div>
    `;
  } else {
    html += `
      <div style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-circle-info"></i> Direct verification. No transaction screenshot required.</div>
    `;
  }

  box.innerHTML = html;
}

function handleReceiptFileSelect(input) {
  const container = document.getElementById('receipt-preview-container');
  const img = document.getElementById('receipt-preview-img');
  if (!container || !img) return;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      container.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function handlePaymentSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('cust-name').value;
  const phone = document.getElementById('cust-phone').value;
  const email = document.getElementById('cust-email')?.value || 'faheemkhan101992@gmail.com';
  const address = appState.fulfillmentType === 'pickup' 
    ? 'Bakery Store Self Pickup (Near RHC Hospital, Chhab)' 
    : document.getElementById('cust-address').value;

  const payMethodVal = document.querySelector('input[name="pay-method"]:checked').value;
  const selectedMethod = appState.paymentMethods.find(m => m.id === payMethodVal);

  let receiptBase64 = null;
  if (selectedMethod && !selectedMethod.isCOD) {
    const fileInput = document.getElementById('checkout-receipt-file');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      try {
        receiptBase64 = await convertFileToBase64(fileInput.files[0]);
      } catch (err) {
        showToast('Failed to parse screenshot file.', 'danger');
        return;
      }
    } else {
      showToast('Please upload a screenshot of your payment receipt!', 'danger');
      return;
    }
  }

  const defaultPrep = parseInt(localStorage.getItem('luxecakes_default_prep_time')) || 40;
  const defaultDelivery = parseInt(localStorage.getItem('luxecakes_default_delivery_time')) || 30;
  const maxPrepMinutes = Math.max(...appState.cart.map(item => item.prepTimeMinutes || defaultPrep));
  const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = appState.fulfillmentType === 'pickup' ? 0 : appState.deliveryFee;
  const total = subtotal + deliveryFee;

  const requiresApproval = selectedMethod && !selectedMethod.isCOD;
  const status = requiresApproval ? 'Pending Payment Approval' : 'New Order';

  const newOrder = {
    id: 'CHB-' + Math.floor(1000 + Math.random() * 9000),
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    deliveryAddress: address,
    fulfillmentType: appState.fulfillmentType,
    deliveryFee: deliveryFee,
    items: [...appState.cart],
    totalAmount: total,
    paymentMethod: selectedMethod ? selectedMethod.name : 'COD',
    paymentReceipt: receiptBase64,
    status: status,
    createdAt: Date.now(),
    prepTimeMinutes: maxPrepMinutes,
    deliveryTimeMinutes: defaultDelivery,
    targetFinishTime: Date.now() + (maxPrepMinutes * 60 * 1000),
    assignedRider: null
  };

  appState.orde£unshift(newOrder);
  saveOrdersToStorage();
  broadcastStateChange('new_order_placed', { orderId: newOrder.id });

  appState.cart = [];
  updateCartUI();
  closeCheckoutModal();

  playCustomerSuccessSound();
  if (requiresApproval) {
    showToast(`âŒ› Receipt submitted! Order #${newOrder.id} pending verification.`, 'info');
  } else {
    showToast(`ðŸŽ‰ Order #${newOrder.id} Placed! Kitchen notified.`, 'success');
  }
  openOrderTrackerModal();

  // AUTOMATED EMAIL RECEIPT DISPATCH VIA GMAIL SMTP
  if (!requiresApproval) {
    try {
      const res = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`âœ‰ï¸ Official Receipt emailed to ${email} via Gmail SMTP!`, 'success');
      }
    } catch (err) {
      console.log('Receipt email dispatch info:', err);
    }
  }
}

function openOrderTrackerModal() {
  document.getElementById('order-tracker-modal').classList.add('active');
  renderCustomerOrderTracker();
}

function closeOrderTrackerModal() {
  document.getElementById('order-tracker-modal').classList.remove('active');
}

function updateActiveOrdersIndicator() {
  const activeOrders = appState.orde£filter(o => o.status !== 'Delivered');
  const dot = document.getElementById('active-orders-dot');
  if (dot) dot.style.display = activeOrde£length > 0 ? 'block' : 'none';
}

function renderCustomerOrderTracker() {
  const body = document.getElementById('order-tracker-body');
  if (!body) return;

  if (appState.orde£length === 0) {
    body.innerHTML = `
      <div class="empty-job-state">
        <i class="fa-solid fa-clock-rotate-left fa-3x" style="color:var(--primary-rose);"></i>
        <p>No active or previous orders found.</p>
      </div>
    `;
    return;
  }

  body.innerHTML = appState.orde£map(order => {
    const remainingMs = Math.max(0, order.targetFinishTime - Date.now());
    const remainingSecs = Math.floor(remainingMs / 1000);
    const mins = Math.floor(remainingSecs / 60);
    const secs = remainingSecs % 60;
    const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const emailMsg = order.status === 'Pending Payment Approval' 
      ? `<div style="font-size:0.82rem; color:var(--accent-gold); font-weight:600;"><i class="fa-solid fa-hourglass-half"></i> Awaiting Admin Payment Approval. Receipt will be emailed upon approval.</div>`
      : `<div style="font-size:0.82rem; color:var(--accent-mint); font-weight:600;"><i class="fa-solid fa-envelope-circle-check"></i> Email Receipt Dispatched to: ${order.customerEmail || 'faheemkhan101992@gmail.com'}</div>`;

    return `
      <div class="job-detail-box mb-3">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div>
            <strong style="font-size:1.1rem; color:var(--primary-rose);">Order #${order.id}</strong>
            <span class="badge badge-gold" style="margin-left:0.5rem;">${order.fulfillmentType === 'pickup' ? 'ðŸª Store Pickup' : 'ðŸšš Home Delivery'}</span>
          </div>
          <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
        </div>

        <div style="margin-bottom:0.75rem;">
          <div style="font-size:0.88rem; color:var(--text-muted);">Items: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
          <div style="font-size:0.88rem; font-weight:600;">Address / Option: ${order.deliveryAddress}</div>
          ${order.deliveryTimeMinutes && order.status !== 'Pending Payment Approval' ? `
            <div style="font-size:0.88rem; color:var(--text-main); font-weight:600;"><i class="fa-solid fa-truck-fast" style="color:var(--accent-gold); margin-right:0.3rem;"></i>Est. Delivery Time: ${order.deliveryTimeMinutes} Minutes</div>
          ` : ''}
          ${emailMsg}
        </div>

        ${order.status === 'Pending Payment Approval' ? `
          <div style="background:var(--primary-rose-light); padding:0.85rem; border-radius:10px; border:1px solid var(--border-subtle); display:flex; align-items:center; gap:0.6rem; color:var(--primary-rose); font-size:0.9rem;">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Payment receipt screenshot undergoing review. Once confirmed by the Admin near RHC Hospital kitchen, baking and delivery preparation will begin!</span>
          </div>
        ` : ''}

        ${(order.status === 'Baking & Prepping' || order.status === 'New Order') && order.status !== 'Pending Payment Approval' ? `
          <div style="background:var(--primary-rose-light); padding:0.85rem; border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:0.88rem; color:var(--primary-rose); font-weight:600;"><i class="fa-solid fa-fire"></i> Kitchen Baking Countdown:</span>
            <span class="countdown-timer-badge"><i class="fa-solid fa-stopwatch"></i> ${formattedTimer}</span>
          </div>
        ` : ''}

        ${order.status === 'Out for Delivery' || order.status === 'Rider Accepted' ? `
          <div style="background:rgba(16,185,129,0.12); border:1px solid var(--accent-mint); padding:0.85rem; border-radius:10px; margin-top:0.8rem;">
            <strong style="color:var(--accent-mint);"><i class="fa-solid fa-motorcycle"></i> Courier Out For Delivery in Chhab!</strong>
            <div id="cust-map-${order.id}" class="leaflet-map-box"></div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  appState.orde£forEach(order => {
    if (order.status === 'Out for Delivery' || order.status === 'Rider Accepted') {
      setTimeout(() => renderInteractiveLeafletMap(`cust-map-${order.id}`), 200);
    }
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending Payment Approval': return 'badge-rider-alert';
    case 'New Order': return 'badge-rider-alert';
    case 'Baking & Prepping': return 'badge-danger';
    case 'Ready for Pickup': return 'badge-admin-orders';
    case 'Dispatching Rider': return 'badge-rider-alert';
    case 'Rider Accepted': return 'badge-primary';
    case 'Out for Delivery': return 'badge-gold';
    case 'Delivered': return 'badge-online';
    case 'Cancelled': return 'badge-danger';
    default: return 'badge-primary';
  }
}

// ============================================================================
// ADMIN PORTAL PAGE LOGIC
// ============================================================================
function switchAdminTab(tabId, el) {
  appState.activeAdminTab = tabId;
  document.querySelectorAll('.admin-nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

  el.classList.add('active');
  document.getElementById(`admin-tab-${tabId}`).classList.add('active');

  if (tabId === 'ai-studio' && !appState.aiImageLoaded) {
    loadSampleToAI('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
  }
}

function filterAdminOrders(statusFilter, el) {
  appState.adminOrderFilter = statusFilter;
  document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderAdminOrders();
}

function renderAdminOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const totalOrders = appState.orde£length;
  const totalRevenue = appState.orde£reduce((sum, o) => sum + o.totalAmount, 0);
  const bakingCount = appState.orde£filter(o => o.status === 'Baking & Prepping' || o.status === 'New Order').length;
  const deliveredCount = appState.orde£filter(o => o.status === 'Delivered').length;

  const elRev = document.getElementById('stat-total-revenue');
  const elOrd = document.getElementById('stat-total-orders');
  const elPrep = document.getElementById('stat-active-prep');
  const elDeliv = document.getElementById('stat-delivered-count');

  if (elRev) elRev.textContent = `£ ${totalRevenue.toLocaleString()}`;
  if (elOrd) elOrd.textContent = totalOrders;
  if (elPrep) elPrep.textContent = bakingCount;
  if (elDeliv) elDeliv.textContent = deliveredCount;

  const countBadge = document.getElementById('admin-tab-order-count');
  if (countBadge) countBadge.textContent = totalOrders;

  const filteredOrders = appState.adminOrderFilter === 'all'
    ? appState.orders
    : appState.orde£filter(o => o.status === appState.adminOrderFilter);

  if (filteredOrde£length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No orders found matching filter "${appState.adminOrderFilter}".</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredOrde£map(order => {
    const remainingMs = Math.max(0, order.targetFinishTime - Date.now());
    const remainingSecs = Math.floor(remainingMs / 1000);
    const mins = Math.floor(remainingSecs / 60);
    const secs = remainingSecs % 60;
    const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const isPickup = order.fulfillmentType === 'pickup';

    return `
      <tr>
        <td>
          <a href="javascript:void(0)" onclick="viewOrderInvoice('${order.id}')" style="color:var(--accent-gold); font-weight:700; text-decoration:underline;">
            #${order.id}
          </a>
        </td>
        <td>
          <div style="font-weight:700;">${order.customerName}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${order.customerPhone}</div>
          <span class="badge ${isPickup ? 'badge-primary' : 'badge-gold'}" style="font-size:0.7rem;">${isPickup ? 'ðŸª Store Pickup' : 'ðŸšš Home Delivery'}</span>
          <div style="font-size:0.8rem; margin-top:0.25rem;">Method: <strong>${order.paymentMethod || 'COD'}</strong></div>
          ${order.paymentReceipt ? `
            <div style="margin-top:0.25rem;">
              <a href="#" onclick="viewReceiptImage('${order.id}'); return false;" style="color:var(--primary-rose); font-weight:700; font-size:0.78rem; display:inline-flex; align-items:center; gap:0.25rem;">
                <i class="fa-solid fa-image"></i> View Receipt
              </a>
            </div>
          ` : ''}
        </td>
        <td><div style="font-size:0.82rem;">${order.deliveryAddress}</div></td>
        <td>
          <div style="font-size:0.85rem;">${order.items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}</div>
        </td>
        <td><strong style="color:var(--accent-gold);">£ ${order.totalAmount.toLocaleString()}</strong></td>
        <td>
          ${order.status === 'Pending Payment Approval' ? `
            <span style="font-size:0.78rem; color:var(--text-muted); font-weight:700;"><i class="fa-solid fa-hourglass-half"></i> Pending Verify</span>
          ` : `
            <span class="countdown-timer-badge ${remainingSecs === 0 ? 'done' : ''}">
              <i class="fa-solid fa-stopwatch"></i> ${remainingSecs > 0 ? formattedTimer : 'READY'}
            </span>
            <button class="btn btn-sm btn-outline mt-1" style="padding:0.2rem 0.4rem; font-size:0.75rem; display:block;" onclick="openAdjustTimeModal('${order.id}')" title="Adjust prep & delivery times">
              <i class="fa-solid fa-clock"></i> Adjust Time
            </button>
          `}
        </td>
        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            ${order.status === 'Pending Payment Approval' ? `
              <button class="btn btn-sm btn-online" onclick="adminApprovePayment('${order.id}')" title="Approve payment & accept order">
                <i class="fa-solid fa-check"></i> Approve
              </button>
              <button class="btn btn-sm btn-danger" onclick="adminRejectPayment('${order.id}')" title="Reject payment & cancel order">
                <i class="fa-solid fa-xmark"></i> Reject
              </button>
            ` : ''}

            ${order.status === 'New Order' ? `
              <button class="btn btn-sm btn-gold" onclick="adminAcceptNewOrder('${order.id}')">
                <i class="fa-solid fa-check"></i> Accept Order & Stop Alarm
              </button>
            ` : ''}

            ${order.status === 'Baking & Prepping' ? `
              <button class="btn btn-sm btn-outline" onclick="adminMarkReady('${order.id}')">
                <i class="fa-solid fa-circle-check"></i> Mark Ready
              </button>
            ` : ''}

            ${order.status === 'Ready for Pickup' && !isPickup ? `
              <button class="btn btn-sm btn-gold" onclick="adminDispatchRider('${order.id}')">
                <i class="fa-solid fa-motorcycle"></i> Dispatch Rider
              </button>
            ` : ''}

            ${order.status === 'Ready for Pickup' && isPickup ? `
              <button class="btn btn-sm btn-online" onclick="adminMarkDelivered('${order.id}')">
                <i class="fa-solid fa-store"></i> Customer Picked Up
              </button>
            ` : ''}

            <button class="btn btn-sm btn-outline" title="View Map & Receipt" onclick="viewOrderInvoice('${order.id}')">
              <i class="fa-solid fa-map-location-dot"></i>
            </button>

            <button class="btn btn-sm btn-danger" title="Cancel/Delete Order" onclick="adminDeleteOrder('${order.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ADMIN RIDER FLEET MANAGEMENT
function renderAdminRiders() {
  const tbody = document.getElementById('admin-riders-tbody');
  const countBadge = document.getElementById('admin-tab-rider-count');
  if (countBadge) countBadge.textContent = appState.ride£length;
  if (!tbody) return;

  if (appState.ride£length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No riders currently in fleet. Click "Add New Rider" above!</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.ride£map(r => `
    <tr>
      <td><strong style="color:var(--text-main); font-size:0.95rem;">${r.name}</strong></td>
      <td><span class="badge badge-gold">${r.id}</span></td>
      <td>
        <a href="tel:${r.phone}" style="color:var(--accent-mint); font-weight:700; text-decoration:underline;">
          <i class="fa-solid fa-phone"></i> ${r.phone}
        </a>
      </td>
      <td><span style="font-size:0.85rem;"><i class="fa-solid fa-motorcycle"></i> ${r.vehicle}</span></td>
      <td><span class="badge ${r.status === 'Online' ? 'badge-online' : 'badge-danger'}">${r.status}</span></td>
      <td><strong>${r.trips || 0} Trips</strong></td>
      <td><strong style="color:var(--accent-gold);">£ ${(r.earnings || 0).toLocaleString()}</strong></td>
      <td>
        <button class="btn btn-sm btn-danger" title="Remove Rider from Fleet" onclick="adminDeleteRider('${r.id}')">
          <i class="fa-solid fa-user-minus"></i> Remove
        </button>
      </td>
    </tr>
  `).join('');
}

function openAddRiderModal() {
  document.getElementById('add-rider-modal').classList.add('active');
}

function closeAddRiderModal() {
  document.getElementById('add-rider-modal').classList.remove('active');
}

function handleAddRiderSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-rider-name').value;
  const phone = document.getElementById('new-rider-phone').value;
  const vehicle = document.getElementById('new-rider-vehicle').value;

  const newRider = {
    id: 'RD-' + Math.floor(1000 + Math.random() * 9000),
    name: name,
    phone: phone,
    vehicle: vehicle,
    status: 'Online',
    trips: 0,
    earnings: 0
  };

  appState.ride£push(newRider);
  saveRidersToStorage();
  closeAddRiderModal();
  renderAdminRiders();
  showToast(`Rider "${name}" (${newRider.id}) added to Chhab fleet!`, 'success');
}

function adminDeleteRider(riderId) {
  const rider = appState.ride£find(r => r.id === riderId);
  if (confirm(`Are you sure you want to remove rider "${rider?.name || riderId}" from the fleet?`)) {
    appState.riders = appState.ride£filter(r => r.id !== riderId);
    saveRidersToStorage();
    renderAdminRiders();
    showToast(`Rider #${riderId} removed from roster.`, 'danger');
  }
}

function adminAcceptNewOrder(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Baking & Prepping';
    saveOrdersToStorage();
    checkContinuousAudioAlerts();
    renderAdminOrders();
    showToast(`Order #${orderId} Accepted! Kitchen baking countdown active.`, 'success');
  }
}

function adminMarkReady(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Ready for Pickup';
    saveOrdersToStorage();
    renderAdminOrders();
    showToast(`Order #${orderId} marked Ready for Pickup!`, 'success');
  }
}

function adminMarkDelivered(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Delivered';
    saveOrdersToStorage();
    renderAdminOrders();
    showToast(`Order #${orderId} completed / picked up by customer!`, 'success');
    sendFollowupEmail(order);
  }
}

function adminDispatchRider(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Dispatching Rider';
    saveOrdersToStorage();
    renderAdminOrders();
    broadcastStateChange('rider_dispatched', { orderId });
    showToast(`ðŸ›µ Dispatch siren broadcast sent to Chhab riders for Order #${orderId}!`, 'success');
  }
}

function adminDeleteOrder(orderId) {
  if (confirm(`Are you sure you want to delete Order #${orderId}?`)) {
    appState.orders = appState.orde£filter(o => o.id !== orderId);
    saveOrdersToStorage();
    checkContinuousAudioAlerts();
    renderAdminOrders();
    showToast(`Order #${orderId} deleted.`, 'danger');
  }
}

function viewOrderInvoice(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (!order) return;

  const modalBody = document.getElementById('admin-order-modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="background:#ffffff; color:#000; padding:1.5rem; border-radius:12px;" id="printable-invoice">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #a83250; padding-bottom:1rem; margin-bottom:1rem;">
        <div>
          <h2 style="color:#a83250; margin:0; font-size:1.5rem;">Royal Chhab Custom Cakes</h2>
          <span style="font-size:0.85rem; color:#666;">Near RHC Hospital, Chhab, Punjab, Pakistan &bull; WhatsApp: 0300-ROYAL-CHHAB</span>
        </div>
        <div style="text-align:right;">
          <h3 style="margin:0; color:#d4a359;">INVOICE #${order.id}</h3>
          <span style="font-size:0.8rem; color:#666;">Date: ${new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1rem; font-size:0.9rem;">
        <div style="background:#f9ece6; padding:0.9rem; border-radius:8px;">
          <strong>CUSTOMER DETAILS:</strong><br>
          Name: ${order.customerName}<br>
          Phone: ${order.customerPhone}<br>
          Email: <strong>${order.customerEmail || 'faheemkhan101992@gmail.com'}</strong><br>
          Fulfillment: <strong>${order.fulfillmentType === 'pickup' ? 'ðŸª Bakery Store Self Pickup' : 'ðŸšš Express Home Delivery'}</strong><br>
          Address: ${order.deliveryAddress}
        </div>
        <div style="background:#f9ece6; padding:0.9rem; border-radius:8px;">
          <strong>ORDER SUMMARY:</strong><br>
          Payment Method: ${order.paymentMethod}<br>
          Status: <strong style="color:#a83250;">${order.status}</strong><br>
          Assigned Rider: ${order.assignedRider || 'N/A (Store Pickup / Unassigned)'}
        </div>
      </div>

      <div style="margin-bottom:1rem;">
        <strong style="color:#a83250;"><i class="fa-solid fa-map-location-dot"></i> Interactive Delivery Route Map (Chhab):</strong>
        <div id="admin-map-${order.id}" class="leaflet-map-box"></div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:1.5rem; font-size:0.9rem;">
        <thead>
          <tr style="background:#a83250; color:#fff; text-align:left;">
            <th style="padding:8px;">Item Description</th>
            <th style="padding:8px;">Qty</th>
            <th style="padding:8px;">Price</th>
            <th style="padding:8px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr style="border-bottom:1px solid #ddd;">
              <td style="padding:8px;">
                <strong>${item.name}</strong>
                ${item.details ? `<br><small style="color:#555;">${item.details}</small>` : ''}
                ${item.customText ? `<br><small style="color:#a83250;">Inscription: "${item.customText}"</small>` : ''}
              </td>
              <td style="padding:8px;">${item.quantity}</td>
              <td style="padding:8px;">£ ${item.price.toLocaleString()}</td>
              <td style="padding:8px; text-align:right;">£ ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align:right; font-size:1.1rem; margin-top:1rem; border-top:2px solid #ddd; padding-top:0.8rem;">
        Subtotal: £ ${(order.totalAmount - (order.deliveryFee || 0)).toLocaleString()}<br>
        Delivery Fee: £ ${(order.deliveryFee || 0).toLocaleString()}<br>
        <strong style="font-size:1.3rem; color:#a83250;">Grand Total: £ ${order.totalAmount.toLocaleString()}</strong>
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
      <button class="btn btn-outline" onclick="closeAdminOrderModal()">Close</button>
      <button class="btn btn-gold" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Kitchen Receipt</button>
    </div>
  `;

  document.getElementById('admin-order-modal').classList.add('active');
  setTimeout(() => renderInteractiveLeafletMap(`admin-map-${order.id}`), 200);
}

function closeAdminOrderModal() {
  document.getElementById('admin-order-modal').classList.remove('active');
}

// STORE SETTINGS & DELIVERY FEE RATE ADJUSTMENT BY ADMIN
function openStoreSettingsModal() {
  const feeInput = document.getElementById('setting-delivery-fee');
  const addrInput = document.getElementById('setting-store-address');
  const prepInput = document.getElementById('setting-prep-time');
  const delivInput = document.getElementById('setting-delivery-time');
  const leadInput = document.getElementById('setting-lead-days');
  const googleClientInput = document.getElementById('setting-google-client-id');

  if (feeInput) feeInput.value = appState.deliveryFee;
  if (addrInput) addrInput.value = appState.storeAddress;
  if (prepInput) prepInput.value = localStorage.getItem('luxecakes_default_prep_time') || 40;
  if (delivInput) delivInput.value = localStorage.getItem('luxecakes_default_delivery_time') || 30;
  if (leadInput) leadInput.value = localStorage.getItem('luxecakes_custom_lead_days') || 2;
  if (googleClientInput) googleClientInput.value = localStorage.getItem('luxecakes_google_client_id') || '';

  document.getElementById('store-settings-modal').classList.add('active');
}

function closeStoreSettingsModal() {
  document.getElementById('store-settings-modal').classList.remove('active');
}

function saveStoreSettings(e) {
  e.preventDefault();
  const feeVal = parseInt(document.getElementById('setting-delivery-fee').value);
  if (!isNaN(feeVal) && feeVal >= 0) {
    appState.deliveryFee = feeVal;
    localStorage.setItem('luxecakes_delivery_fee', feeVal);
  }
  
  appState.storeAddress = document.getElementById('setting-store-address').value;

  const prepVal = parseInt(document.getElementById('setting-prep-time').value);
  const delivVal = parseInt(document.getElementById('setting-delivery-time').value);
  if (!isNaN(prepVal)) localStorage.setItem('luxecakes_default_prep_time', prepVal);
  if (!isNaN(delivVal)) localStorage.setItem('luxecakes_default_delivery_time', delivVal);

  const leadVal = parseInt(document.getElementById('setting-lead-days').value);
  if (!isNaN(leadVal)) localStorage.setItem('luxecakes_custom_lead_days', leadVal);

  const googleClientInput = document.getElementById('setting-google-client-id');
  if (googleClientInput) {
    localStorage.setItem('luxecakes_google_client_id', googleClientInput.value.trim());
  }

  closeStoreSettingsModal();
  broadcastStateChange('settings_updated');
  updateCartUI();
  showToast(`Store settings updated! Express Delivery Fee set to £ ${appState.deliveryFee}.`, 'success');
}

// ADJUST ORDER TIME IN REAL-TIME
function openAdjustTimeModal(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (!order) return;

  const orderIdInput = document.getElementById('adjust-order-id');
  const prepInput = document.getElementById('adjust-prep-time');
  const deliveryInput = document.getElementById('adjust-delivery-time');

  if (orderIdInput) orderIdInput.value = orderId;
  if (prepInput) prepInput.value = order.prepTimeMinutes || 40;
  if (deliveryInput) deliveryInput.value = order.deliveryTimeMinutes || 30;

  const modal = document.getElementById('adjust-order-time-modal');
  if (modal) modal.classList.add('active');
}

function closeAdjustTimeModal() {
  const modal = document.getElementById('adjust-order-time-modal');
  if (modal) modal.classList.remove('active');
}

function handleAdjustTimeSubmit(e) {
  e.preventDefault();
  const orderId = document.getElementById('adjust-order-id').value;
  const prepTime = parseInt(document.getElementById('adjust-prep-time').value);
  const deliveryTime = parseInt(document.getElementById('adjust-delivery-time').value);

  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.prepTimeMinutes = prepTime;
    order.deliveryTimeMinutes = deliveryTime;
    order.targetFinishTime = order.createdAt + (prepTime * 60 * 1000);

    saveOrdersToStorage();
    closeAdjustTimeModal();
    renderAdminOrders();
    showToast(`Order #${orderId} times updated: Prep ${prepTime}m, Delivery ${deliveryTime}m!`, 'success');
  } else {
    showToast('Failed to locate order.', 'danger');
  }
}

function toggleStoreOpenStatus() {
  appState.storeOpen = !appState.storeOpen;
  const badge = document.getElementById('admin-store-status-badge');
  if (badge) {
    badge.className = appState.storeOpen ? 'badge badge-online' : 'badge badge-danger';
    badge.innerHTML = appState.storeOpen ? '<i class="fa-solid fa-circle"></i> Kitchen Open & Accepting Orders' : '<i class="fa-solid fa-circle-xmark"></i> Kitchen Busy / Closed';
  }
  showToast(appState.storeOpen ? 'Kitchen Status: OPEN' : 'Kitchen Status: BUSY/CLOSED', appState.storeOpen ? 'success' : 'danger');
}

function triggerBroadcastRiderAlert() {
  broadcastStateChange('rider_dispatched', { manualTest: true });
  showToast('ðŸ›µ Broadcast Siren Alert sent to all active riders!', 'success');
}

function renderAdminProducts() {
  const grid = document.getElementById('admin-product-grid');
  if (!grid) return;

  const countBadge = document.getElementById('admin-tab-product-count');
  if (countBadge) countBadge.textContent = appState.products.length;

  grid.innerHTML = appState.products.map(p => `
    <div class="job-detail-box" style="display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1.1rem;">
      <div style="display:flex; align-items:center; gap:1rem;">
        <img src="${p.image}" style="width:58px; height:58px; border-radius:12px; object-fit:cover;">
        <div>
          <strong style="font-size:1rem; color:var(--text-main);">${p.name}</strong>
          <div style="font-size:0.82rem; color:var(--text-muted);">${p.category} &bull; <strong style="color:var(--accent-gold);">£ ${p.price.toLocaleString()}</strong> &bull; ${p.prepTimeMinutes || 35}m prep</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${p.description.substring(0, 48)}...</div>
        </div>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-sm btn-outline" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openAddProductModal() {
  document.getElementById('edit-prod-id').value = '';
  document.getElementById('product-modal-title').innerHTML = '<i class="fa-solid fa-plus-circle" style="color:var(--accent-gold);"></i> Add New Product to Storefront';
  document.getElementById('add-product-form').reset();
  document.getElementById('add-product-modal').classList.add('active');
}

function editProduct(prodId) {
  const p = appState.products.find(item => item.id === prodId);
  if (!p) return;

  document.getElementById('edit-prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-image').value = p.image;
  document.getElementById('prod-desc').value = p.description;

  document.getElementById('product-modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color:var(--accent-gold);"></i> Edit Store Product';
  document.getElementById('add-product-modal').classList.add('active');
}

function closeAddProductModal() {
  document.getElementById('add-product-modal').classList.remove('active');
}

function handleAddProductSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-prod-id').value;
  const name = document.getElementById('prod-name').value;
  const price = parseInt(document.getElementById('prod-price').value);
  const category = document.getElementById('prod-category').value;
  const image = document.getElementById('prod-image').value;
  const desc = document.getElementById('prod-desc').value;

  if (editId) {
    const p = appState.products.find(item => item.id === editId);
    if (p) {
      p.name = name;
      p.price = price;
      p.category = category;
      p.image = image;
      p.description = desc;
      showToast(`Product "${name}" updated!`, 'success');
    }
  } else {
    const newProd = {
      id: 'prod-' + Date.now(),
      name,
      price,
      category,
      image,
      description: desc || 'Handcrafted fresh daily at Royal Chhab Custom Cakes.',
      prepTimeMinutes: 35
    };
    appState.products.unshift(newProd);
    showToast(`Product "${name}" saved to catalog!`, 'success');
  }

  saveProductsToStorage();
  closeAddProductModal();
  renderAdminProducts();
}

function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    appState.products = appState.products.filter(p => p.id !== id);
    saveProductsToStorage();
    renderAdminProducts();
    showToast('Product deleted.', 'danger');
  }
}

// ============================================================================
// AI PRODUCT IMAGE ENHANCER STUDIO
// ============================================================================
function loadAIStudioImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    loadSampleToAI(event.target.result);
  };
  reader.readAsDataURL(file);
}

function loadSampleToAI(imgSrc) {
  const canvas = document.getElementById('ai-canvas');
  const placeholder = document.getElementById('ai-placeholder-msg');
  if (!canvas || !placeholder) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    appState.aiOriginalImage = img;
    appState.aiImageLoaded = true;
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    updateAIStudio();
  };
  img.src = imgSrc;
}

function updateAIStudio() {
  if (!appState.aiOriginalImage) return;

  const canvas = document.getElementById('ai-canvas');
  const ctx = canvas.getContext('2d');
  const img = appState.aiOriginalImage;

  canvas.width = 600;
  canvas.height = 600;

  const brightness = document.getElementById('slider-brightness').value;
  const contrast = document.getElementById('slider-contrast').value;
  const saturation = document.getElementById('slider-saturation').value;
  const bloom = document.getElementById('slider-bloom').value;
  const bgType = document.getElementById('select-ai-bg').value;

  document.getElementById('val-brightness').textContent = `${brightness}%`;
  document.getElementById('val-contrast').textContent = `${contrast}%`;
  document.getElementById('val-saturation').textContent = `${saturation}%`;
  document.getElementById('val-bloom').textContent = `${bloom}px`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStudioBackground(ctx, canvas.width, canvas.height, bgType);

  ctx.save();
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) drop-shadow(0 15px 25px rgba(0,0,0,0.35))`;

  ctx.beginPath();
  ctx.arc(300, 300, 240, 0, Math.PI * 2);
  ctx.clip();

  const scale = Math.max(500 / img.width, 500 / img.height);
  const x = 300 - (img.width * scale) / 2;
  const y = 300 - (img.height * scale) / 2;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

  ctx.restore();

  if (parseInt(bloom) > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${bloom}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
}

function drawStudioBackground(ctx, w, h, type) {
  let grad;
  switch (type) {
    case 'warm-bakery':
      grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 350);
      grad.addColorStop(0, '#f9ece6');
      grad.addColorStop(0.6, '#f3d9ce');
      grad.addColorStop(1, '#e5beaf');
      break;
    case 'marble-luxury':
      grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#f4ece8');
      grad.addColorStop(1, '#e2d5ce');
      break;
    case 'dark-gourmet':
      grad = ctx.createRadialGradient(w/2, h/2, 30, w/2, h/2, 350);
      grad.addColorStop(0, '#381822');
      grad.addColorStop(0.7, '#240d15');
      grad.addColorStop(1, '#11040a');
      break;
    case 'pastel-pink':
      grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#fce4ec');
      grad.addColorStop(0.5, '#f8bbd0');
      grad.addColorStop(1, '#f48fb1');
      break;
    default:
      grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f7ede8');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  if (type === 'warm-bakery' || type === 'dark-gourmet') {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    [ [100, 100, 40], [500, 120, 60], [120, 480, 50], [480, 450, 45] ].forEach(([bx, by, br]) => {
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function applyAIPreset(preset) {
  const b = document.getElementById('slider-brightness');
  const c = document.getElementById('slider-contrast');
  const s = document.getElementById('slider-saturation');
  const bloom = document.getElementById('slider-bloom');

  if (!b || !c || !s || !bloom) return;

  if (preset === 'auto') {
    b.value = 115; c.value = 120; s.value = 125; bloom.value = 10;
  } else if (preset === 'vivid') {
    b.value = 120; c.value = 135; s.value = 145; bloom.value = 5;
  } else if (preset === 'gourmet') {
    b.value = 110; c.value = 115; s.value = 120; bloom.value = 18;
  } else if (preset === 'studio') {
    b.value = 105; c.value = 110; s.value = 105; bloom.value = 0;
  }

  updateAIStudio();
  showToast(`Applied AI Preset: ${preset.toUpperCase()}`, 'success');
}

function saveAIStudioToCatalog() {
  const canvas = document.getElementById('ai-canvas');
  if (!canvas || !appState.aiImageLoaded) {
    showToast('Please load an image to enhance first!', 'danger');
    return;
  }

  const enhancedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
  const input = document.getElementById('prod-image');
  if (input) input.value = enhancedDataUrl;
  openAddProductModal();
  showToast('âœ¨ Enhanced photo copied! Save product to Chhab catalog.', 'success');
}

// ============================================================================
// RIDER APP PAGE LOGIC
// ============================================================================
function toggleRiderOnlineState(el) {
  appState.riderOnline = el.checked;
  const tag = document.getElementById('rider-status-tag');
  if (tag) {
    tag.textContent = appState.riderOnline ? 'Online & Searching' : 'Offline';
    tag.className = appState.riderOnline ? 'badge badge-online' : 'badge badge-danger';
  }
  showToast(appState.riderOnline ? 'ðŸ›µ Rider Status: ONLINE' : 'Rider Status: OFFLINE', appState.riderOnline ? 'success' : 'danger');
  renderRiderPortal();
  checkContinuousAudioAlerts();
}

function renderRiderPortal() {
  if (!appState.currentRider) {
    setTimeout(openRiderAuthModal, 100);
    return;
  }

  // Update header text to match logged in rider details
  const nameEl = document.getElementById('rider-display-name');
  const idEl = document.getElementById('rider-display-id');
  const phoneEl = document.getElementById('rider-display-phone');
  
  if (nameEl) nameEl.textContent = appState.currentRider.name;
  if (idEl) idEl.textContent = appState.currentRider.id;
  if (phoneEl) phoneEl.textContent = appState.currentRider.phone;

  const availableList = document.getElementById('rider-available-list');
  const activeJobBody = document.getElementById('rider-active-job-body');
  const alertBox = document.getElementById('rider-alert-box');
  const alertActions = document.getElementById('rider-alert-actions');
  const jobStatusBadge = document.getElementById('rider-job-status-badge');

  if (!availableList || !activeJobBody) return;

  const readyOrders = appState.orde£filter(o => o.status === 'Dispatching Rider' && o.fulfillmentType !== 'pickup' && !appState.rejectedJobs.includes(o.id));
  const countEl = document.getElementById('rider-available-count');
  if (countEl) countEl.textContent = `${readyOrde£length} Available`;

  if (readyOrde£length > 0 && appState.riderOnline) {
    const alertJob = readyOrders[0];
    if (alertBox) alertBox.style.display = 'block';
    if (alertActions) {
      alertActions.innerHTML = `
        <button class="btn btn-gold btn-sm" onclick="riderAcceptJob('${alertJob.id}')">
          <i class="fa-solid fa-check"></i> Accept Job (£ ${appState.deliveryFee})
        </button>
        <button class="btn btn-danger btn-sm" onclick="riderRejectJob('${alertJob.id}')">
          <i class="fa-solid fa-xmark"></i> Decline / Reject
        </button>
      `;
    }
  } else {
    if (alertBox) alertBox.style.display = 'none';
  }

  if (readyOrde£length === 0) {
    availableList.innerHTML = `
      <div class="empty-job-state py-4">
        <i class="fa-solid fa-radar fa-2x mb-2"></i>
        <p>No dispatch orders waiting in Chhab right now.</p>
        <span>When Admin dispatches a cake, it will alert here instantly!</span>
      </div>
    `;
  } else {
    availableList.innerHTML = readyOrde£map(order => `
      <div class="job-detail-box mb-3">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <strong style="color:var(--accent-gold);">Order #${order.id}</strong>
          <span class="badge badge-gold">£ ${appState.deliveryFee} Earnings</span>
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem;">
          <i class="fa-solid fa-store"></i> Pickup: Royal Chhab Kitchen (Near RHC Hospital, Chhab)<br>
          <i class="fa-solid fa-location-dot"></i> Delivery Vicinity: ${order.deliveryAddress.substring(0, 28)}...
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-gold btn-sm w-100" onclick="riderAcceptJob('${order.id}')">
            <i class="fa-solid fa-check"></i> Accept Delivery
          </button>
          <button class="btn btn-outline btn-sm" onclick="riderRejectJob('${order.id}')">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
        </div>
      </div>
    `).join('');
  }

  const activeJob = appState.orde£find(o => o.id === appState.activeRiderJobId || (o.assignedRider === '#RD-7892' && o.status !== 'Delivered'));

  if (!activeJob) {
    if (jobStatusBadge) jobStatusBadge.textContent = 'No Active Job';
    activeJobBody.innerHTML = `
      <div class="empty-job-state">
        <i class="fa-solid fa-motorcycle fa-3x"></i>
        <p>You have no active accepted deliveries right now.</p>
        <span>Keep your status ONLINE above to receive siren sound notifications!</span>
      </div>
    `;
  } else {
    appState.activeRiderJobId = activeJob.id;
    if (jobStatusBadge) jobStatusBadge.textContent = activeJob.status;

    const isPickedUp = activeJob.status === 'Out for Delivery';

    activeJobBody.innerHTML = `
      <div class="job-detail-box">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
          <strong>Order #${activeJob.id}</strong>
          <span class="badge badge-online">Earnings: £ ${appState.deliveryFee}</span>
        </div>

        <!-- Step 1: Pickup Address in Chhab -->
        <div class="job-address-step">
          <div class="step-icon pickup"><i class="fa-solid fa-store"></i></div>
          <div>
            <strong style="font-size:0.85rem; color:var(--accent-gold);">STEP 1: PICKUP ADDRESS</strong>
            <div style="font-size:0.92rem; font-weight:600;">Royal Chhab Custom Cakes Kitchen</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Near RHC Hospital, Main Road, Chhab, Punjab, Pakistan</div>
          </div>
        </div>

        <!-- Step 2: Customer Delivery Address -->
        <div class="job-address-step mt-2">
          <div class="step-icon delivery"><i class="fa-solid fa-house-user"></i></div>
          <div>
            <strong style="font-size:0.85rem; color:var(--accent-mint);">STEP 2: DELIVERY ADDRESS IN CHHAB</strong>
            ${isPickedUp ? `
              <div style="font-size:0.95rem; font-weight:700; color:#fff;">${activeJob.deliveryAddress}</div>
              <div style="font-size:0.82rem; color:var(--text-muted);">Customer: ${activeJob.customerName} (${activeJob.customerPhone})</div>
            ` : `
              <div style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">
                <i class="fa-solid fa-lock"></i> Locked until cake is picked up from bakery.
              </div>
            `}
          </div>
        </div>

        <!-- Leaflet GPS Interactive Route Map -->
        <div style="margin:1rem 0;">
          <div style="font-size:0.82rem; color:var(--accent-mint); font-weight:600; margin-bottom:0.3rem;">
            <i class="fa-solid fa-map-location-dot"></i> Interactive Leaflet GPS Navigation Route (Chhab):
          </div>
          <div id="rider-map-${activeJob.id}" class="leaflet-map-box"></div>
        </div>

        <!-- Actions -->
        ${!isPickedUp ? `
          <button class="btn btn-gold w-100 mt-2" onclick="riderMarkPickedUp('${activeJob.id}')">
            <i class="fa-solid fa-box-open"></i> Picked Up Order from Bakery (Reveal Customer Address)
          </button>
        ` : `
          <button class="btn btn-success w-100 mt-2" onclick="riderMarkDelivered('${activeJob.id}')">
            <i class="fa-solid fa-circle-check"></i> Mark Cake Delivered to Customer
          </button>
        `}
      </div>
    `;

    setTimeout(() => renderInteractiveLeafletMap(`rider-map-${activeJob.id}`), 200);
  }
}

function riderAcceptJob(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Rider Accepted';
    order.assignedRider = appState.currentRider ? appState.currentRider.name : '#RD-7892';
    appState.activeRiderJobId = orderId;

    const riderObj = appState.ride£find(r => r.id === (appState.currentRider?.id || 'RD-7892'));
    if (riderObj) {
      riderObj.status = 'On Delivery';
      saveRidersToStorage();
    }

    saveOrdersToStorage();
    stopRiderContinuousAlert();
    renderRiderPortal();
    showToast(`Job #${orderId} Accepted! GPS map routed to Royal Chhab Kitchen.`, 'success');
  }
}

function riderRejectJob(orderId) {
  appState.rejectedJobs.push(orderId);
  stopRiderContinuousAlert();
  renderRiderPortal();
  showToast(`Job #${orderId} Declined/Rejected.`, 'danger');
}

function riderMarkPickedUp(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Out for Delivery';
    saveOrdersToStorage();
    renderRiderPortal();
    showToast('ðŸ“¦ Cake Picked Up! Customer address revealed.', 'success');
  }
}

function riderMarkDelivered(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (order) {
    order.status = 'Delivered';
    appState.activeRiderJobId = null;

    const riderObj = appState.ride£find(r => r.id === (appState.currentRider?.id || 'RD-7892'));
    if (riderObj) {
      riderObj.status = 'Online';
      riderObj.trips = (riderObj.trips || 0) + 1;
      riderObj.earnings = (riderObj.earnings || 0) + appState.deliveryFee;
      saveRidersToStorage();
    }

    saveOrdersToStorage();
    renderRiderPortal();
    playCustomerSuccessSound();
    showToast(`ðŸŽ‰ Order Successfully Delivered in Chhab! £ ${appState.deliveryFee} added.`, 'success');
    sendFollowupEmail(order);
  }
}

async function sendFollowupEmail(order) {
  try {
    const res = await fetch('/api/send-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();
    if (data.success) {
      showToast(`âœ‰ï¸ Auto follow-up feedback email sent to ${order.customerEmail || 'customer'}!`, 'success');
    }
  } catch (err) {
    console.log('Follow-up feedback email dispatch error:', err);
  }
}

// ============================================================================
// COUNTDOWN TICK LOOP
// ============================================================================
function startCountdownTimerLoop() {
  setInterval(() => {
    let updated = false;
    appState.orde£forEach(order => {
      if (order.status === 'Baking & Prepping') {
        const remaining = order.targetFinishTime - Date.now();
        if (remaining <= 0) {
          order.status = 'Ready for Pickup';
          updated = true;
        }
      }
    });

    if (updated) {
      saveOrdersToStorage();
    }

    const page = document.body.dataset.page;
    if (page === 'admin') renderAdminOrders();
    if (page === 'customer' && document.getElementById('order-tracker-modal')?.classList.contains('active')) {
      renderCustomerOrderTracker();
    }
  }, 1000);
}

// TOAST SYSTEM
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// PRODUCT DETAILS & REVIEWS ECOSYSTEM
// ============================================================================
function openProductDetailsModal(productId) {
  const prod = appState.products.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById('product-details-modal');
  const body = document.getElementById('product-details-modal-body');
  if (!modal || !body) return;

  const productReviews = appState.reviews.filter(r => r.productId === productId);
  const ratingData = getProductAverageRating(productId);
  const averageStars = ratingData.count > 0 ? 'â˜…'.repeat(Math.round(ratingData.average)) + 'â˜†'.repeat(5 - Math.round(ratingData.average)) : 'â˜†â˜†â˜†â˜†â˜†';
  const defaultName = appState.currentUser ? appState.currentUser.name : '';

  body.innerHTML = `
    <!-- Left Column: Product Info -->
    <div style="padding-right: 1.5rem; border-right: 1px solid var(--border-subtle); display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <img src="${prod.image}" style="width:100%; height:260px; object-fit:cover; border-radius:var(--radius-md); box-shadow:var(--shadow-sm); margin-bottom:1rem;">
        <h4 style="font-size:1.4rem; color:var(--primary-rose); font-weight:700; margin-bottom:0.5rem;">${prod.name}</h4>
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.8rem;">
          <span style="color:var(--accent-gold); font-size:1.15rem;">${averageStars}</span>
          <strong style="font-size:0.9rem; color:var(--text-main);">${ratingData.count > 0 ? ratingData.average.toFixed(1) + ' / 5.0' : 'No ratings'}</strong>
          <span style="font-size:0.85rem; color:var(--text-muted);">(${ratingData.count} reviews)</span>
        </div>
        <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:1.2rem; line-height:1.5;">${prod.description}</p>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface); padding:0.8rem 1.2rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-top:1rem;">
        <span style="font-size:1.35rem; font-weight:700; color:var(--primary-rose);">£ ${prod.price.toLocaleString()}</span>
        <button class="btn btn-primary btn-sm" onclick="addToCart('${prod.id}'); closeProductDetailsModal();">
          <i class="fa-solid fa-basket-shopping"></i> Add to Basket
        </button>
      </div>
    </div>

    <!-- Right Column: Reviews & Form -->
    <div style="display:flex; flex-direction:column; padding-left: 0.5rem; max-height: 480px; overflow-y: auto;">
      <h4 style="font-size:1.15rem; color:var(--primary-rose); font-weight:700; margin-bottom:0.8rem;">Customer Review History</h4>
      
      <div class="reviews-list-container">
        ${productReviews.length === 0 ? `
          <div style="text-align:center; padding:2rem 0; color:var(--text-muted); font-size:0.88rem;">
            <i class="fa-regular fa-comment-dots fa-2x mb-2" style="display:block;"></i>
            Be the first to review this cake!
          </div>
        ` : productReviews.map(r => `
          <div class="review-item">
            <div class="review-header">
              <span class="review-author" style="font-weight:700;">${r.author}</span>
              <span class="review-rating" style="color:var(--accent-gold);">${'â˜…'.repeat(r.rating)}${'â˜†'.repeat(5 - r.rating)}</span>
            </div>
            <p class="review-comment" style="margin: 0.2rem 0; font-size:0.88rem;">${r.comment}</p>
            <span class="review-date" style="font-size:0.75rem; color:var(--text-muted);">${new Date(r.date).toLocaleDateString()}</span>
          </div>
        `).join('')}
      </div>

      <!-- Submit Review Form -->
      <div style="background:var(--bg-surface); padding:1.2rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
        <h5 style="font-weight:700; color:var(--text-main); margin-bottom:0.6rem; font-size:0.95rem;">Write Product Review</h5>
        <form onsubmit="handleProductReviewSubmit(event, '${prod.id}')">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <label style="font-size:0.82rem; font-weight:600; color:var(--text-muted); margin:0;">Your Rating:</label>
            <div class="star-rating-form">
              <input type="radio" id="star5-${prod.id}" name="rating" value="5" required><label for="star5-${prod.id}">â˜…</label>
              <input type="radio" id="star4-${prod.id}" name="rating" value="4"><label for="star4-${prod.id}">â˜…</label>
              <input type="radio" id="star3-${prod.id}" name="rating" value="3"><label for="star3-${prod.id}">â˜…</label>
              <input type="radio" id="star2-${prod.id}" name="rating" value="2"><label for="star2-${prod.id}">â˜…</label>
              <input type="radio" id="star1-${prod.id}" name="rating" value="1"><label for="star1-${prod.id}">â˜…</label>
            </div>
          </div>
          <div class="form-group mb-2">
            <input type="text" id="review-name-${prod.id}" class="form-control" required placeholder="Your Name" value="${defaultName}" style="padding: 0.5rem 0.8rem; font-size: 0.88rem;">
          </div>
          <div class="form-group mb-2">
            <textarea id="review-comment-${prod.id}" class="form-control" rows="2" required placeholder="What did you think of the flavor, sponge, and decor?" style="padding: 0.5rem 0.8rem; font-size: 0.88rem;"></textarea>
          </div>
          <button type="submit" class="btn btn-gold btn-sm w-100" style="padding: 0.55rem;">
            <i class="fa-solid fa-check"></i> Submit Review
          </button>
        </form>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeProductDetailsModal() {
  const modal = document.getElementById('product-details-modal');
  if (modal) modal.classList.remove('active');
}

function handleProductReviewSubmit(e, productId) {
  e.preventDefault();
  const name = document.getElementById(`review-name-${productId}`).value.trim();
  const comment = document.getElementById(`review-comment-${productId}`).value.trim();
  const ratingInput = e.target.querySelector('input[name="rating"]:checked');
  
  if (!ratingInput) {
    showToast('Please select a star rating!', 'danger');
    return;
  }
  const rating = parseInt(ratingInput.value);

  const newReview = {
    productId: productId,
    author: name,
    rating: rating,
    comment: comment,
    date: Date.now()
  };

  appState.reviews.push(newReview);
  saveReviewsToStorage();
  
  openProductDetailsModal(productId);
  renderStorefrontCatalog();
  showToast('Thank you! Your product review has been published.', 'success');
}

function getProductAverageRating(productId) {
  const productReviews = appState.reviews.filter(r => r.productId === productId);
  if (productReviews.length === 0) return { average: 0, count: 0 };
  const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: total / productReviews.length,
    count: productReviews.length
  };
}

// ============================================================================
// GENERAL STOREFRONT TESTIMONIALS
// ============================================================================
function renderGeneralFeedback() {
  const grid = document.getElementById('general-testimonials-grid');
  if (!grid) return;

  if (appState.generalFeedback.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No storefront reviews yet. Be the first to share your feedback below!</div>`;
    return;
  }

  // Display only top 3 testimonials on home page
  const limited = appState.generalFeedback.slice(0, 3);

  grid.innerHTML = limited.map(f => `
    <div class="testimonial-card">
      <i class="fa-solid fa-quote-right quote-icon"></i>
      <div class="rating">${'â˜…'.repeat(f.rating)}${'â˜†'.repeat(5 - f.rating)}</div>
      <p class="comment">"${f.comment}"</p>
      <div class="author">- ${f.author}</div>
    </div>
  `).join('');

  const nameInput = document.getElementById('feedback-name');
  if (nameInput && appState.currentUser && !nameInput.value) {
    nameInput.value = appState.currentUser.name;
  }
}

function openAllReviewsModal() {
  const modal = document.getElementById('all-reviews-modal');
  const statsContainer = document.getElementById('reviews-modal-stats-container');
  const listContainer = document.getElementById('reviews-modal-list');

  if (!modal || !listContainer) return;

  // Calculate statistics
  const totalReviews = appState.generalFeedback.length;
  const averageRating = totalReviews > 0 
    ? appState.generalFeedback.reduce((sum, f) => sum + f.rating, 0) / totalReviews
    : 0;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  appState.generalFeedback.forEach(f => {
    if (starCounts[f.rating] !== undefined) {
      starCounts[f.rating]++;
    }
  });

  if (statsContainer) {
    const barsHtml = [5, 4, 3, 2, 1].map(stars => {
      const count = starCounts[stars] || 0;
      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return `
        <div class="rating-bar-row">
          <span style="width:50px; font-weight:600;">${stars} Stars</span>
          <div class="rating-bar-bg">
            <div class="rating-bar-fill" style="width:${percent}%"></div>
          </div>
          <span style="width:30px; text-align:right; color:var(--text-muted);">${count}</span>
        </div>
      `;
    }).join('');

    statsContainer.innerHTML = `
      <div class="reviews-stats-row">
        <div class="reviews-stats-score">
          <h2>${averageRating.toFixed(1)}</h2>
          <div style="color:var(--accent-gold); font-size:1.25rem; margin-bottom:0.3rem;">
            ${'â˜…'.repeat(Math.round(averageRating))}${'â˜†'.repeat(5 - Math.round(averageRating))}
          </div>
          <span style="font-size:0.85rem; color:var(--text-muted);">${totalReviews} Store Reviews</span>
        </div>
        <div style="display:flex; flex-direction:column; justify-content:center; flex-grow:1;">
          ${barsHtml}
        </div>
      </div>
    `;
  }

  // Populate list
  listContainer.innerHTML = appState.generalFeedback.map(f => {
    const dateStr = f.date 
      ? new Date(f.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Recent';

    return `
      <div style="padding:1.2rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); margin-bottom:1rem; position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--primary-rose-light); color:var(--primary-rose); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.95rem; font-family:sans-serif;">
              ${f.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong style="color:var(--text-main); font-size:0.92rem; display:block;">${f.author}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</span>
            </div>
          </div>
          <div style="color:var(--accent-gold); font-size:0.9rem;">
            ${'â˜…'.repeat(f.rating)}${'â˜†'.repeat(5 - f.rating)}
          </div>
        </div>
        <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5; margin:0; font-style:italic;">"${f.comment}"</p>
      </div>
    `;
  }).join('');

  modal.classList.add('active');
}

function closeAllReviewsModal() {
  const modal = document.getElementById('all-reviews-modal');
  if (modal) modal.classList.remove('active');
}

function handleGeneralFeedbackSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('feedback-name').value.trim();
  const rating = parseInt(document.getElementById('feedback-rating').value);
  const comment = document.getElementById('feedback-comment').value.trim();

  const newFeedback = {
    author: name,
    rating: rating,
    comment: comment,
    date: Date.now()
  };

  appState.generalFeedback.unshift(newFeedback);
  saveFeedbackToStorage();
  
  document.getElementById('feedback-comment').value = '';
  
  renderGeneralFeedback();
  showToast('Thank you! Your feedback has been posted.', 'success');
}

// ============================================================================
// ADMIN PAYMENT SYSTEMS MANAGEMENT
// ============================================================================
function renderAdminPayments() {
  const tbody = document.getElementById('admin-payments-tbody');
  const countBadge = document.getElementById('admin-tab-payment-count');
  if (countBadge) countBadge.textContent = appState.paymentMethods.length;
  if (!tbody) return;

  if (appState.paymentMethods.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">No payment methods configured. Click "Add Payment Method" above!</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.paymentMethods.map(m => `
    <tr>
      <td><strong style="color:var(--text-main); font-size:0.95rem;">${m.name}</strong></td>
      <td>${m.accountName}</td>
      <td><code style="font-weight:700; color:var(--primary-rose); font-size:0.9rem;">${m.accountNumber}</code></td>
      <td style="max-width:300px; font-size:0.85rem; color:var(--text-muted);">${m.instructions}</td>
      <td>
        ${m.isCOD ? `<span style="font-size:0.82rem; color:var(--text-muted);">System Standard (No Delete)</span>` : `
          <button class="btn btn-sm btn-danger" onclick="adminDeletePayment('${m.id}')">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

function openAddPaymentModal() {
  document.getElementById('add-payment-modal').classList.add('active');
}

function closeAddPaymentModal() {
  document.getElementById('add-payment-modal').classList.remove('active');
  document.getElementById('add-payment-form').reset();
}

function handleAddPaymentSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-pay-name').value.trim();
  const accName = document.getElementById('new-pay-account-name').value.trim();
  const accNum = document.getElementById('new-pay-account-number').value.trim();
  const inst = document.getElementById('new-pay-instructions').value.trim();

  const newMethod = {
    id: 'pay-' + Date.now(),
    name: name,
    accountName: accName,
    accountNumber: accNum,
    instructions: inst,
    isCOD: false
  };

  appState.paymentMethods.push(newMethod);
  savePaymentMethodsToStorage();
  closeAddPaymentModal();
  renderAdminPayments();
  showToast(`Custom payment method "${name}" added!`, 'success');
}

function adminDeletePayment(paymentId) {
  const method = appState.paymentMethods.find(m => m.id === paymentId);
  if (!method) return;
  if (method.isCOD) return;

  if (confirm(`Are you sure you want to delete payment method "${method.name}"?`)) {
    appState.paymentMethods = appState.paymentMethods.filter(m => m.id !== paymentId);
    savePaymentMethodsToStorage();
    renderAdminPayments();
    showToast(`Payment method "${method.name}" deleted.`, 'danger');
  }
}

// ============================================================================
// ADMIN RECEIPT APPROVAL & VERIFICATION
// ============================================================================
async function adminApprovePayment(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (!order) return;

  order.status = 'New Order';
  // Restart preparation finish countdown timer from the moment payment is approved
  order.createdAt = Date.now();
  order.targetFinishTime = Date.now() + (order.prepTimeMinutes * 60 * 1000);

  saveOrdersToStorage();
  renderAdminOrders();
  showToast(`Payment Approved for Order #${orderId}! Sent to Kitchen pipeline.`, 'success');

  // Trigger automated SMTP receipt email dispatch
  try {
    const res = await fetch('/api/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();
    if (data.success) {
      showToast(`âœ‰ï¸ Receipt email dispatched to ${order.customerEmail}!`, 'success');
    }
  } catch (err) {
    console.log('Receipt email dispatch error:', err);
  }
}

function adminRejectPayment(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (!order) return;

  if (confirm(`Reject payment receipt and cancel Order #${orderId}?`)) {
    order.status = 'Cancelled';
    saveOrdersToStorage();
    renderAdminOrders();
    showToast(`Order #${orderId} payment rejected and order cancelled.`, 'danger');
  }
}

function viewReceiptImage(orderId) {
  const order = appState.orde£find(o => o.id === orderId);
  if (!order || !order.paymentReceipt) return;

  // Render a responsive full-screen lightbox overlay
  const overlay = document.createElement('div');
  overlay.id = 'receipt-lightbox';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:3000; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;';
  overlay.onclick = () => overlay.remove();

  const label = document.createElement('div');
  label.textContent = `Receipt Screenshot for Order #${order.id} - Click anywhere to close`;
  label.style.cssText = 'color:white; font-size:1.15rem; font-weight:bold; margin-bottom:1rem; font-family:sans-serif; text-shadow:0 2px 4px rgba(0,0,0,0.5);';

  const img = document.createElement('img');
  img.src = order.paymentReceipt;
  img.style.cssText = 'max-width:90%; max-height:80%; object-fit:contain; border:3px solid white; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.5);';

  overlay.appendChild(label);
  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

// ============================================================================
// ADMIN REGISTERED CUSTOMERS / USERS SECTION
// ============================================================================
function renderAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  const totalBadge = document.getElementById('admin-total-users-badge');
  const countBadge = document.getElementById('admin-tab-users-count');

  if (totalBadge) totalBadge.textContent = `Total Users: ${appState.use£length}`;
  if (countBadge) countBadge.textContent = appState.use£length;
  if (!tbody) return;

  if (appState.use£length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No users registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.use£map(u => {
    // Match their email against orders to calculate total orders and spent
    const userOrders = appState.orde£filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());
    const totalSpent = userOrde£reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const joinDateFormatted = new Date(u.joinedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:34px; height:34px; border-radius:50%; background:var(--primary-rose); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem; font-family:sans-serif;">
              ${u.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong style="color:var(--text-main); font-size:0.95rem;">${u.name}</strong>
            </div>
          </div>
        </td>
        <td><code>${u.email}</code></td>
        <td><span class="badge badge-online" style="background:#4f46e5; font-size:0.75rem;"><i class="fa-brands fa-google"></i> ${u.provider || 'Google'}</span></td>
        <td style="color:var(--text-muted); font-size:0.85rem;">${joinDateFormatted}</td>
        <td style="text-align:center; font-weight:700; color:var(--text-main);">${userOrde£length}</td>
        <td style="text-align:right; font-weight:700; color:var(--accent-gold);">£ ${totalSpent.toLocaleString()}</td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// STOREFRONT HERO BANNER SLIDER CONTROLLER
// ============================================================================
function showHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide-wrapper');
  const dots = document.querySelectorAll('.hero-slider-dot');
  if (slides.length === 0) return;

  if (index >= slides.length) currentHeroSlide = 0;
  else if (index < 0) currentHeroSlide = slides.length - 1;
  else currentHeroSlide = index;

  slides.forEach((slide, i) => {
    if (i === currentHeroSlide) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  dots.forEach((dot, i) => {
    if (i === currentHeroSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  startHeroAutoplay();
}

function moveHeroSlide(direction) {
  showHeroSlide(currentHeroSlide + direction);
}

function setHeroSlide(index) {
  showHeroSlide(index);
}

function startHeroAutoplay() {
  if (heroAutoplayTimer) clearInterval(heroAutoplayTimer);
  heroAutoplayTimer = setInterval(() => {
    moveHeroSlide(1);
  }, 5000);
}

