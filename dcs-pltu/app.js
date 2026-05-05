// app.js — Logic utama DCS PLTU Interaktif
// Handles: localStorage, layout tabs, hotspot rendering, popup, pan/zoom

// ── STATE ──────────────────────────────────────────────────────────────────
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

// ── INIT ───────────────────────────────────────────────────────────────────
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

  if (state.data.layouts.length > 0) {
    loadLayout(state.data.layouts[0].id);
  }

  setupPanZoom();
}

// ── SAVE DATA ──────────────────────────────────────────────────────────────
function saveData() {
  try {
    localStorage.setItem('dcs_pltu_data', JSON.stringify(state.data));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

// ── RENDER LAYOUT TABS ─────────────────────────────────────────────────────
function renderLayoutTabs() {
  var container = document.getElementById('layoutTabs');
  if (!container) return;
  container.innerHTML = state.data.layouts.map(function(l) {
    return '<button class="layout-tab ' + (l.id === state.currentLayoutId ? 'active' : '') +
           '" onclick="loadLayout(\'' + l.id + '\')">' + escHtml(l.name) + '</button>';
  }).join('');
}

// ── LOAD LAYOUT ────────────────────────────────────────────────────────────
function loadLayout(layoutId) {
  state.currentLayoutId = layoutId;
  var layout = state.data.layouts.find(function(l) { return l.id === layoutId; });
  if (!layout) return;

  var mapBg = document.getElementById('mapBg');
  var container = document.getElementById('mapContainer');

  // Set container size
  container.style.width  = layout.width  + 'px';
  container.style.height = layout.height + 'px';

  // Background image or placeholder
  if (layout.image) {
    mapBg.innerHTML = '';
    mapBg.style.backgroundImage  = 'url(' + layout.image + ')';
    mapBg.style.backgroundSize   = 'contain';
    mapBg.style.backgroundRepeat = 'no-repeat';
    mapBg.style.backgroundPosition = 'center';
    mapBg.style.width  = '100%';
    mapBg.style.height = '100%';
  } else {
    mapBg.style.backgroundImage = 'none';
    mapBg.style.width  = '100%';
    mapBg.style.height = '100%';
    mapBg.innerHTML =
      '<div class="map-placeholder">' +
        '<div class="placeholder-grid"></div>' +
        '<div class="placeholder-title">' + escHtml(layout.name) + '</div>' +
        '<div class="placeholder-hint">Upload gambar layout di halaman Editor</div>' +
      '</div>';
  }

  renderHotspots(layoutId);
  renderLayoutTabs();
  zoomReset();
}

// ── RENDER HOTSPOTS ────────────────────────────────────────────────────────
function buildViewerHotspotInner(h) {
  if (h.shape === 'manual-valve') {
    return '<div class="hotspot-ring"></div>' +
           '<div class="hotspot-valve-svg">' +
             '<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">' +
               '<polygon points="11,11 3,4 3,18" fill="white"/>' +
               '<polygon points="11,11 19,4 19,18" fill="white"/>' +
               '<line x1="11" y1="2" x2="11" y2="7" stroke="white" stroke-width="1.8" stroke-linecap="round"/>' +
               '<rect x="8" y="1" width="6" height="2.5" rx="1" fill="white"/>' +
             '</svg>' +
           '</div>' +
           (h.name ? '<div class="hotspot-label">' + escHtml(h.name) + '</div>' : '');
  }
  return '<div class="hotspot-ring"></div>' +
         '<div class="hotspot-dot"></div>' +
         (h.name ? '<div class="hotspot-label">' + escHtml(h.name) + '</div>' : '');
}

function renderHotspots(layoutId) {
  var layer = document.getElementById('hotspotsLayer');
  if (!layer) return;
  var hotspots = state.data.hotspots.filter(function(h) { return h.layoutId === layoutId; });

  layer.innerHTML = hotspots.map(function(h) {
    var typeClass  = (h.type  || 'equipment').toLowerCase();
    var shapeClass = h.shape === 'manual-valve' ? ' shape-manual-valve' : '';
    return '<div class="hotspot ' + typeClass + shapeClass + '" ' +
           'id="hotspot_' + h.id + '" ' +
           'style="left:' + h.x + 'px; top:' + h.y + 'px; --hcolor:' + h.color + '" ' +
           'onclick="showPopup(\'' + h.id + '\')" ' +
           'title="' + escHtml(h.name) + '">' +
             buildViewerHotspotInner(h) +
           '</div>';
  }).join('');
}

// ── SHOW POPUP ─────────────────────────────────────────────────────────────
function showPopup(hotspotId) {
  var h = state.data.hotspots.find(function(hs) { return hs.id === hotspotId; });
  if (!h) return;

  document.getElementById('popupName').textContent = h.name || '-';
  document.getElementById('popupKks').textContent  = 'KKS: ' + (h.kks || '-');
  document.getElementById('popupDesc').textContent = h.description || '-';

  var badge = document.getElementById('popupType');
  badge.textContent  = h.type || 'Equipment';
  badge.className    = 'popup-type-badge type-' + (h.type || 'equipment').toLowerCase();

  // Lokasi
  var locWrap = document.getElementById('popupLocation');
  var locText = document.getElementById('popupLocationText');
  if (h.location) {
    locText.textContent = h.location;
    locWrap.style.display = 'block';
  } else {
    locWrap.style.display = 'none';
  }

  // Gambar
  var imgWrap = document.getElementById('popupImage');
  var imgEl   = document.getElementById('popupImageEl');
  if (h.image) {
    imgEl.src = h.image;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.style.display = 'none';
    imgEl.src = '';
  }

  document.getElementById('popupOverlay').classList.add('active');
  document.getElementById('popupCard').classList.add('active');
}

// ── IMAGE VIEWER ───────────────────────────────────────────────────────────
function openPopupImgViewer() {
  var src = document.getElementById('popupImageEl').src;
  if (!src) return;
  var overlay = document.getElementById('imgViewerOverlay');
  document.getElementById('imgViewerEl').src = src;
  overlay.style.display = 'flex';
}

function closeImgViewer() {
  document.getElementById('imgViewerOverlay').style.display = 'none';
}

// ── CLOSE POPUP ────────────────────────────────────────────────────────────
function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
  document.getElementById('popupCard').classList.remove('active');
}

// Close popup on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePopup();
});

// ── ZOOM & PAN ─────────────────────────────────────────────────────────────
function zoomIn()    { state.zoom = Math.min(state.zoom * 1.25, 5);   applyTransform(); }
function zoomOut()   { state.zoom = Math.max(state.zoom / 1.25, 0.2); applyTransform(); }
function zoomReset() { state.zoom = 1; state.panX = 0; state.panY = 0; applyTransform(); }

function applyTransform() {
  var container = document.getElementById('mapContainer');
  if (!container) return;
  container.style.transform =
    'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';
  container.style.transformOrigin = '0 0';
}

function setupPanZoom() {
  var wrapper = document.getElementById('mapWrapper');
  if (!wrapper) return;

  // ── Mouse pan ──────────────────────────────────────────────
  wrapper.addEventListener('mousedown', function(e) {
    // Don't pan when clicking hotspot
    if (e.target.closest('.hotspot')) return;
    state.isDragging = true;
    state.dragStart  = { x: e.clientX, y: e.clientY };
    state.panStart   = { x: state.panX, y: state.panY };
    wrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!state.isDragging) return;
    state.panX = state.panStart.x + (e.clientX - state.dragStart.x);
    state.panY = state.panStart.y + (e.clientY - state.dragStart.y);
    applyTransform();
  });

  document.addEventListener('mouseup', function() {
    if (state.isDragging) {
      state.isDragging = false;
      wrapper.style.cursor = 'grab';
    }
  });

  // ── Mouse wheel zoom ───────────────────────────────────────
  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();
    var rect   = wrapper.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;

    var oldZoom = state.zoom;
    if (e.deltaY < 0) {
      state.zoom = Math.min(state.zoom * 1.15, 5);
    } else {
      state.zoom = Math.max(state.zoom / 1.15, 0.2);
    }

    // Zoom toward mouse position
    var scale = state.zoom / oldZoom;
    state.panX = mouseX - scale * (mouseX - state.panX);
    state.panY = mouseY - scale * (mouseY - state.panY);
    applyTransform();
  }, { passive: false });

  // ── Touch pan & pinch zoom ─────────────────────────────────
  wrapper.addEventListener('touchstart', function(e) {
    if (e.target.closest('.hotspot')) return;
    if (e.touches.length === 1) {
      state.isDragging = true;
      state.dragStart  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      state.panStart   = { x: state.panX, y: state.panY };
    } else if (e.touches.length === 2) {
      state.isDragging = false;
      state.lastTouchDist = getTouchDist(e.touches);
      state.lastTouchZoom = state.zoom;
    }
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && state.isDragging) {
      state.panX = state.panStart.x + (e.touches[0].clientX - state.dragStart.x);
      state.panY = state.panStart.y + (e.touches[0].clientY - state.dragStart.y);
      applyTransform();
    } else if (e.touches.length === 2) {
      var dist  = getTouchDist(e.touches);
      var scale = dist / state.lastTouchDist;
      state.zoom = Math.min(Math.max(state.lastTouchZoom * scale, 0.2), 5);
      applyTransform();
    }
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('touchend', function() {
    state.isDragging = false;
  });
}

function getTouchDist(touches) {
  var dx = touches[0].clientX - touches[1].clientX;
  var dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── UTILITY ────────────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── BOOT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
