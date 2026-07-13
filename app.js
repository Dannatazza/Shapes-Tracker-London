const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "london-supermarket-stock-logs";
const LEGACY_STORAGE_KEY = "waitrose-london-stock-logs";
const PRODUCTS = [
  "Arnott's Shapes Chicken",
  "Arnott's Shapes BBQ",
  "Arnott's Shapes Pizza",
];

let stores = [
  {
    id: "waitrose-kings-road",
    brand: "Waitrose",
    name: "Waitrose King's Road",
    address: "196 King's Road, Chelsea",
    lat: 51.4877,
    lng: -0.168,
  },
  {
    id: "waitrose-canary-wharf",
    brand: "Waitrose",
    name: "Waitrose Canary Wharf",
    address: "Canada Square, Canary Wharf",
    lat: 51.5049,
    lng: -0.0195,
  },
  {
    id: "waitrose-bloomsbury",
    brand: "Waitrose",
    name: "Waitrose Bloomsbury",
    address: "The Brunswick, Bloomsbury",
    lat: 51.5243,
    lng: -0.1238,
  },
  {
    id: "waitrose-bayswater",
    brand: "Waitrose",
    name: "Waitrose Bayswater",
    address: "Porchester Road, Bayswater",
    lat: 51.5145,
    lng: -0.1885,
  },
  {
    id: "waitrose-wandsworth",
    brand: "Waitrose",
    name: "Waitrose Wandsworth",
    address: "Southside Shopping Centre, Wandsworth",
    lat: 51.4558,
    lng: -0.1939,
  },
  {
    id: "waitrose-balham",
    brand: "Waitrose",
    name: "Waitrose Balham",
    address: "Balham High Road",
    lat: 51.4431,
    lng: -0.1513,
  },
  {
    id: "waitrose-finchley-road",
    brand: "Waitrose",
    name: "Waitrose Finchley Road",
    address: "Finchley Road, Swiss Cottage",
    lat: 51.5432,
    lng: -0.1748,
  },
  {
    id: "waitrose-westfield-stratford",
    brand: "Waitrose",
    name: "Waitrose Stratford City",
    address: "Westfield Stratford City",
    lat: 51.5433,
    lng: -0.0077,
  },
  {
    id: "waitrose-highbury",
    brand: "Waitrose",
    name: "Waitrose Highbury Corner",
    address: "Highbury Corner, Islington",
    lat: 51.546,
    lng: -0.1036,
  },
  {
    id: "waitrose-dulwich",
    brand: "Waitrose",
    name: "Waitrose East Dulwich",
    address: "Lordship Lane, East Dulwich",
    lat: 51.4566,
    lng: -0.0757,
  },
  {
    id: "waitrose-richmond",
    brand: "Waitrose",
    name: "Waitrose Richmond",
    address: "Sheen Road, Richmond",
    lat: 51.4613,
    lng: -0.3035,
  },
  {
    id: "waitrose-westfield-white-city",
    brand: "Waitrose",
    name: "Waitrose White City",
    address: "Westfield London, White City",
    lat: 51.5076,
    lng: -0.2219,
  },
  {
    id: "morrisons-camden",
    brand: "Morrisons",
    name: "Morrisons Camden",
    address: "Camden Goods Yard, Chalk Farm Road",
    lat: 51.5417,
    lng: -0.148,
  },
  {
    id: "morrisons-peckham",
    brand: "Morrisons",
    name: "Morrisons Peckham",
    address: "Aylesham Centre, Rye Lane",
    lat: 51.4716,
    lng: -0.0692,
  },
  {
    id: "morrisons-holloway",
    brand: "Morrisons",
    name: "Morrisons Holloway",
    address: "Seven Sisters Road, Holloway",
    lat: 51.5594,
    lng: -0.1165,
  },
  {
    id: "morrisons-stratford",
    brand: "Morrisons",
    name: "Morrisons Stratford",
    address: "The Grove, Stratford",
    lat: 51.5421,
    lng: 0.0013,
  },
  {
    id: "morrisons-acton",
    brand: "Morrisons",
    name: "Morrisons Acton",
    address: "King Street, Acton",
    lat: 51.5085,
    lng: -0.2675,
  },
  {
    id: "morrisons-chingford",
    brand: "Morrisons",
    name: "Morrisons Chingford",
    address: "South Chingford",
    lat: 51.6072,
    lng: -0.0178,
  },
  {
    id: "morrisons-erith",
    brand: "Morrisons",
    name: "Morrisons Erith",
    address: "James Watt Way, Erith",
    lat: 51.4805,
    lng: 0.1748,
  },
  {
    id: "morrisons-wimbledon",
    brand: "Morrisons",
    name: "Morrisons Wimbledon",
    address: "The Broadway, Wimbledon",
    lat: 51.4204,
    lng: -0.2047,
  },
];

const elements = {
  selectedStoreName: document.querySelector("#selected-store-name"),
  selectedStoreAddress: document.querySelector("#selected-store-address"),
  selectedStoreStatus: document.querySelector("#selected-store-status"),
  flavourFieldset: document.querySelector("#flavour-fieldset"),
  flavourInputs: document.querySelectorAll("input[name='flavour']"),
  logButton: document.querySelector("#log-button"),
  popupTemplate: document.querySelector("#popup-template"),
};

// Try to load stores and recent logs from a central backend.
// Priority: Supabase (client-side) if configured via config.js, otherwise project server API (/api), else use embedded data/localStorage.
async function initFromServer() {
  // Helper to fetch from Supabase REST API
  async function fetchFromSupabaseStores() {
    const url = `${window.SUPABASE_URL}/rest/v1/stores?select=*`;
    const headers = {
      apikey: window.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
    };
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error('Supabase stores fetch failed');
    return resp.json();
  }

  async function fetchFromSupabaseLogs() {
    const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
    // loggedAt=gte.<iso>
    const q = `loggedAt=gte.${encodeURIComponent(since)}&order=loggedAt.desc`;
    const url = `${window.SUPABASE_URL}/rest/v1/logs?select=*&${q}`;
    const headers = {
      apikey: window.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
    };
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error('Supabase logs fetch failed');
    return resp.json();
  }

  try {
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      // Use Supabase
      try {
        const [supStores, supLogs] = await Promise.all([fetchFromSupabaseStores(), fetchFromSupabaseLogs()]);
        if (Array.isArray(supStores) && supStores.length) stores = supStores;
        if (Array.isArray(supLogs)) {
          state.logs = supLogs.map((l) => ({ ...l, loggedAt: l.loggedAt }));
          saveLogs(state.logs);
          updateRecentLogsCache();
        }
        return;
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to server API', e);
      }
    }

    // fallback to server endpoints (when hosted with our Express server)
    const storesResp = await fetch('/api/stores');
    if (storesResp.ok) {
      const serverStores = await storesResp.json();
      if (Array.isArray(serverStores) && serverStores.length) {
        stores = serverStores;
      }
    }

    const logsResp = await fetch('/api/logs?hours=24');
    if (logsResp.ok) {
      const serverLogs = await logsResp.json();
      if (Array.isArray(serverLogs)) {
        state.logs = serverLogs;
        saveLogs(state.logs); // keep local cache in sync
        updateRecentLogsCache();
      }
    }
  } catch (err) {
    // network unavailable, continue with embedded data and localStorage
    // console.warn('server unavailable, using local data');
  }
}

// Global handler to log unhandled promise rejections for debugging
window.addEventListener('unhandledrejection', (event) => {
  try {
    console.error('Unhandled promise rejection:', event.reason);
  } catch (e) {
    // ignore
  }
});


const state = {
  logs: loadLogs(),
  selectedStoreId: null,
  markers: new Map(),
  recentLogsCache: null,
};

// populate initial recent-logs cache (function declared later)
updateRecentLogsCache();

const map = L.map("map", {
  scrollWheelZoom: true,
}).setView([51.5072, -0.1276], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map);

stores.forEach((store) => {
  const marker = L.marker([store.lat, store.lng], {
    icon: createStoreIcon(store, false),
    title: store.name,
  }).addTo(map);

  marker.on("click", () => selectStore(store.id));

  // Ensure popup content is refreshed when opened so recent logs display correctly
  marker.on('popupopen', () => {
    const popup = marker.getPopup();
    if (popup) popup.setContent(createPopup(store));
  });

  // Safari sometimes doesn't bubble clicks from inner divs to the marker.
  // Attach a click handler directly to the rendered marker element when it's added to the map.
  marker.on('add', () => {
    const el = marker.getElement();
    if (el) {
      const inner = el.querySelector('.store-marker');
      if (inner) {
        inner.addEventListener('click', (ev) => {
          console.info('marker-inner clicked', store.id);
          ev.stopPropagation();
          // visual debug flash
          inner.classList.add('debug-clicked');
          setTimeout(() => inner.classList.remove('debug-clicked'), 400);
          try {
            selectStore(store.id);
          } catch (e) {
            console.error('selectStore call failed from inner click', e);
          }
        });
      }
    }
  });

  state.markers.set(store.id, marker);
});

elements.logButton.addEventListener("click", () => {
  if (state.selectedStoreId) {
    logAvailability(state.selectedStoreId);
  }
});

// If the page is served via file:// (e.g., opened directly), skip server fetches
// because browsers block cross-origin requests from file:// origins.
if (location.protocol === 'file:') {
  // Render using embedded data and any localStorage cache
  render();
} else {
  // Running over HTTP(S) — attempt to initialize from the server then render
  initFromServer().finally(() => render());
}

function selectStore(storeId) {
  try {
    console.info('selectStore called', storeId);
    state.selectedStoreId = storeId;
    resetFlavourInputs();
    render();

    const store = getStore(storeId);
    const marker = state.markers.get(storeId);

    // Build popup content and try to bind/open safely
    const popupContent = createPopup(store);
    try {
      // Unbind any existing popup to avoid stale state
      try { marker.unbindPopup(); } catch (e) {}
      marker.bindPopup(popupContent);
      marker.openPopup();
    } catch (err) {
      console.error('Failed to open popup on marker:', err);
      // Fallback: attempt open after a short delay in case Safari needs layout
      setTimeout(() => {
        try {
          marker.openPopup();
        } catch (e) {
          console.error('Fallback openPopup failed', e);
        }
      }, 50);
    }
  } catch (err) {
    console.error('selectStore error', err);
  }
}

async function logAvailability(storeId) {
  const store = getStore(storeId);
  const selectedProducts = getSelectedProducts();

  if (!selectedProducts.length) {
    setStatusPill(elements.selectedStoreStatus, "Select at least one flavour to log", "neutral");
    return;
  }

  const loggedAt = new Date().toISOString();
  const newLogs = selectedProducts.map((product) => ({
    id: `${storeId}-${product}-${Date.now()}`,
    product,
    storeId,
    storeName: store.name,
    loggedAt,
  }));

  state.logs.unshift(...newLogs);
  resetFlavourInputs();

  // Try to post logs to a central backend. Prefer Supabase if configured, then project server, else fallback to localStorage.
  let persisted = false;
  if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    try {
      const url = `${window.SUPABASE_URL}/rest/v1/logs`;
      const headers = {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        apikey: window.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
      };
      const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(newLogs) });
      if (!resp.ok) throw new Error('supabase insert failed');
      persisted = true;
    } catch (e) {
      console.warn('Supabase insert failed, falling back to server/local', e);
    }
  }

  if (!persisted) {
    try {
      const resp = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLogs),
      });

      if (!resp.ok) throw new Error('server error');
      persisted = true;
    } catch (err) {
      // server failed, persist locally
      saveLogs(state.logs);
    }
  }

  // keep local cache up to date
  updateRecentLogsCache();
  render();

  const marker = state.markers.get(storeId);
  const popup = marker.getPopup();
  if (popup) {
    popup.setContent(createPopup(store));
    marker.openPopup();
  } else {
    marker.bindPopup(createPopup(store)).openPopup();
  }
}

function render() {
  // ensure recent cache is up to date for fast repeated queries
  updateRecentLogsCache();

  stores.forEach((store) => {
    const marker = state.markers.get(store.id);
    marker.setIcon(createStoreIcon(store, isStoreInStock(store.id)));

    const popup = marker.getPopup();
    if (popup) {
      // reuse existing popup instance to avoid unneeded re-binding
      popup.setContent(createPopup(store));
    } else {
      marker.bindPopup(createPopup(store));
    }
  });

  renderSelectedStore();
}

function renderSelectedStore() {
  const store = getStore(state.selectedStoreId);

  if (!store) {
    elements.selectedStoreName.textContent = "Choose a store";
    elements.selectedStoreAddress.textContent = "Pick any marker on the map to log availability.";
    setStatusPill(elements.selectedStoreStatus, "No store selected", "neutral");
    elements.flavourFieldset.disabled = true;
    elements.logButton.disabled = true;
    return;
  }

  elements.selectedStoreName.textContent = store.name;
  elements.selectedStoreAddress.textContent = store.address;
  elements.flavourFieldset.disabled = false;
  elements.logButton.disabled = false;
  setStatusPill(elements.selectedStoreStatus, "Select in-stock flavours below", "neutral");
}


function createPopup(store) {
  const popup = elements.popupTemplate.content.cloneNode(true);
  popup.querySelector("[data-store-name]").textContent = store.name;
  popup.querySelector("[data-store-address]").textContent = store.address;

  const status = popup.querySelector("[data-store-status]");
  if (isStoreInStock(store.id)) {
    status.textContent = "Recently logged as available";
  } else {
    status.textContent = "No recent Shapes logs";
  }

  popup.querySelector("[data-store-flavours]").append(createPopupFlavourList(store.id));

  popup.querySelector("[data-log-button]").addEventListener("click", () => {
    state.selectedStoreId = store.id;
    resetFlavourInputs();
    render();
    document.querySelector(".selected-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const wrapper = document.createElement("div");
  wrapper.append(popup);
  return wrapper;
}

function createStoreIcon(store, inStock) {
  const brandClass = store.brand.toLowerCase();
  const markerLabel = store.brand.charAt(0);

  return L.divIcon({
    className: "",
    html: `<span class="store-marker ${brandClass} ${inStock ? "in-stock" : ""}" aria-hidden="true">${markerLabel}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function getStore(storeId) {
  return stores.find((store) => store.id === storeId);
}

function isStoreInStock(storeId) {
  return getRecentProductsForStore(storeId).length > 0;
}

function updateRecentLogsCache() {
  try {
    const now = Date.now();
    state.recentLogsCache = state.logs
      .filter((log) => PRODUCTS.includes(log.product))
      .filter((log) => now - new Date(log.loggedAt).getTime() < RECENT_WINDOW_MS)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  } catch {
    state.recentLogsCache = [];
  }
}

function getRecentLogs() {
  if (state.recentLogsCache) return state.recentLogsCache;
  updateRecentLogsCache();
  return state.recentLogsCache;
}

function getRecentProductsForStore(storeId) {
  return [...new Set(getRecentLogs().filter((log) => log.storeId === storeId).map((log) => log.product))];
}

function getLatestRecentLogsForStore(storeId) {
  const latestLogs = new Map();

  getRecentLogs()
    .filter((log) => log.storeId === storeId)
    .forEach((log) => {
      if (!latestLogs.has(log.product)) {
        latestLogs.set(log.product, log);
      }
    });

  return PRODUCTS.map((product) => latestLogs.get(product)).filter(Boolean);
}

function createPopupFlavourList(storeId) {
  const latestLogs = getLatestRecentLogsForStore(storeId);

  if (!latestLogs.length) {
    const empty = document.createElement("p");
    empty.className = "popup-empty";
    empty.textContent = "No flavours have been logged here in the last 24 hours.";
    return empty;
  }

  const list = document.createElement("ul");
  list.className = "popup-flavour-list";

  latestLogs.forEach((log) => {
    const item = document.createElement("li");
    const flavourName = getFlavourName(log.product);

    item.innerHTML = `
      <span class="flavour-swatch flavour-swatch-${flavourName.toLowerCase()}" aria-hidden="true"></span>
      <span>
        <strong>${escapeHtml(flavourName)}</strong>
        <small>Logged ${formatRelativeTime(log.loggedAt)}</small>
      </span>
    `;
    list.append(item);
  });

  return list;
}

function getSelectedProducts() {
  return [...elements.flavourInputs].filter((input) => input.checked).map((input) => input.value);
}

function resetFlavourInputs() {
  elements.flavourInputs.forEach((input) => {
    input.checked = false;
  });
}

function getFlavourName(product) {
  return product.replace("Arnott's Shapes ", "");
}

function loadLogs() {
  try {
    const logs =
      JSON.parse(localStorage.getItem(STORAGE_KEY)) ??
      JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)) ??
      [];

    if (!localStorage.getItem(STORAGE_KEY) && logs.length) {
      saveLogs(logs);
    }

    return logs;
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function setStatusPill(element, text, status) {
  element.textContent = text;
  element.className = `pill pill-${status}`;
}

function formatRelativeTime(date) {
  const elapsedMs = Date.now() - new Date(date).getTime();
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);
  return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}
