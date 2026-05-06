// app.js — FIXED VERSION (STABLE + MOBILE READY)

// ── STATE ─────────────────────────────────────
var state = {
  data: null,
  currentLayoutId: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  panStart: { x: 0, y: 0 },
  lastTouchDist: 0,
  lastTouchZoom: 1
};

let lastTap = 0;

// ── INIT ──────────────────────────────────────
function init() {
  var saved = localStorage.getItem('dcs_pltu_data');

  if (saved) {
    try {
      state.data = JSON.parse(saved);
    } catch (e) {
      state.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } else {
    state.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  renderLayoutTabs();

  if (state.data.layouts && state.data.layouts.length > 0) {
    loadLayout(state.data.layouts[0].id);
  }

  setupPanZoom();
}

// ── SAVE ──────────────────────────────────────
function saveData() {
  try {
    localStorage.setItem('dcs_pltu_data', JSON.stringify(state.data));
  } catch (e) {
    console.warn('Save gagal:', e);
  }
}

// ── LAYOUT TABS ───────────────────────────────
function renderLayoutTabs() {
  var el = document.getElementById('layoutTabs');
  if (!el) return;

  el.innerHTML = (state.data.layouts || []).map(function(l) {
    return `
      <button class="layout-tab ${l.id === state.currentLayoutId ? 'active' : ''}"
        onclick="loadLayout('${l.id}')">
        ${escHtml(l.name)}
      </button>
    `;
  }).join('');
}

// ── LOAD LAYOUT ───────────────────────────────
function loadLayout(id) {
  state.currentLayoutId = id;

  var layout = state.data.layouts.find(l => l.id === id);
  if (!layout) return;

  var bg = document.getElementById('mapBg');
  var container = document.getElementById('mapContainer');

  container.style.width = layout.width + 'px';
  container.style.height = layout.height + 'px';

  if (layout.image) {
    bg.style.backgroundImage = `url(${layout.image})`;
    bg.style.backgroundSize = 'contain';
    bg.style.backgroundRepeat = 'no-repeat';
    bg.style.backgroundPosition = 'center';
    bg.innerHTML = '';
  } else {
    bg.style.backgroundImage = 'none';
    bg.innerHTML = `<div class="map-placeholder">${escHtml(layout.name)}</div>`;
  }

  renderHotspots(id);
  renderLayoutTabs();
  zoomReset();
}

// ── HOTSPOT RENDER ────────────────────────────
function renderHotspots(layoutId) {
  var layer = document.getElementById('hotspotsLayer');
  if (!layer) return;

  var list = (state.data.hotspots || []).filter(h => h.layoutId === layoutId);

  layer.innerHTML = list.map(h => `
    <div class="hotspot ${h.type || 'equipment'}"
      style="left:${h.x}px; top:${h.y}px;"
      onclick="handleHotspotClick(event,'${h.id}')"
      title="${escHtml(h.name)}">
      
      <div class="hotspot-dot"></div>
      ${h.name ? `<div class="hotspot-label">${escHtml(h.name)}</div>` : ''}
    </div>
  `).join('');
}

// ── HOTSPOT CLICK FIX ─────────────────────────
function handleHotspotClick(e, id) {
  e.stopPropagation();
  showPopup(id);
}

// ── POPUP ─────────────────────────────────────
function showPopup(id) {
  var h = state.data.hotspots.find(x => x.id === id);
  if (!h) return;

  document.getElementById('popupName').textContent = h.name || '-';
  document.getElementById('popupKks').textContent = 'KKS: ' + (h.kks || '-');
  document.getElementById('popupDesc').textContent = h.description || '-';

  document.getElementById('popupOverlay').classList.add('active');
  document.getElementById('popupCard').classList.add('active');
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
  document.getElementById('popupCard').classList.remove('active');
}

// ── ZOOM ──────────────────────────────────────
function zoomIn() {
  state.zoom = Math.min(state.zoom * 1.2, 5);
  applyTransform();
}

function zoomOut() {
  state.zoom = Math.max(state.zoom / 1.2, 0.2);
  applyTransform();
}

function zoomReset() {
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  applyTransform();
}

function applyTransform() {
  var c = document.getElementById('mapContainer');
  if (!c) return;

  c.style.transform = `translate(${state.panX}px,${state.panY}px) scale(${state.zoom})`;
}

// ── PAN + TOUCH ───────────────────────────────
function setupPanZoom() {
  var wrap = document.getElementById('mapWrapper');
  if (!wrap) return;

  // MOUSE
  wrap.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    if (e.target.closest('.hotspot')) return;

    state.isDragging = true;
    state.dragStart = { x: e.clientX, y: e.clientY };
    state.panStart = { x: state.panX, y: state.panY };
  });

  document.addEventListener('mousemove', function(e) {
    if (!state.isDragging) return;

    state.panX = state.panStart.x + (e.clientX - state.dragStart.x);
    state.panY = state.panStart.y + (e.clientY - state.dragStart.y);
    applyTransform();
  });

  document.addEventListener('mouseup', function() {
    state.isDragging = false;
  });

  // WHEEL
  wrap.addEventListener('wheel', function(e) {
    e.preventDefault();

    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, { passive: false });

  // TOUCH
  wrap.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1 && e.target.closest('.hotspot')) return;

    if (e.touches.length === 1) {
      state.isDragging = true;
      state.dragStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      state.panStart = { x: state.panX, y: state.panY };
    }

    if (e.touches.length === 2) {
      state.lastTouchDist = getDist(e.touches);
      state.lastTouchZoom = state.zoom;
    }
  }, { passive: false });

  wrap.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && state.isDragging) {
      state.panX = state.panStart.x + (e.touches[0].clientX - state.dragStart.x);
      state.panY = state.panStart.y + (e.touches[0].clientY - state.dragStart.y);
      applyTransform();
    }

    if (e.touches.length === 2) {
      var dist = getDist(e.touches);
      var scale = dist / state.lastTouchDist;
      state.zoom = Math.min(Math.max(state.lastTouchZoom * scale, 0.2), 5);
      applyTransform();
    }
  }, { passive: false });

  wrap.addEventListener('touchend', function() {
    let now = Date.now();

    if (now - lastTap < 300) zoomIn();
    lastTap = now;

    state.isDragging = false;
  });
}

// ── UTILS ─────────────────────────────────────
function getDist(t) {
  var dx = t[0].clientX - t[1].clientX;
  var dy = t[0].clientY - t[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── START ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
