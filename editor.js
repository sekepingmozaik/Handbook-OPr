// editor.js — Logic Editor DCS PLTU Interaktif
// Handles: login, drag hotspot, upload image, CRUD hotspot/equipment/layout

var edState = {
  data: null,
  currentLayoutId: null,
  selectedHotspotId: null,
  currentTool: 'select',
  pendingShape: 'default',
  isDragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
  originalData: null
};

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem('dcs_pltu_data');
  if (saved) {
    try { edState.data = JSON.parse(saved); }
    catch(e) { edState.data = JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  } else {
    edState.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  edState.originalData = JSON.parse(JSON.stringify(edState.data));
  document.getElementById('loginModal').style.display = 'flex';
  document.getElementById('passwordInput').focus();
});

// ── UTILITY ────────────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function genId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.floor(Math.random()*10000);
}

function showToast(msg, isError) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '') + ' show';
  setTimeout(function() { t.className = 'toast' + (isError ? ' error' : ''); }, 2800);
}

function saveData() {
  try {
    localStorage.setItem('dcs_pltu_data', JSON.stringify(edState.data));
  } catch(e) {
    showToast('Gagal simpan: storage penuh!', true);
  }
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function checkLogin() {
  var input = document.getElementById('passwordInput').value;
  var correct = edState.data.adminPassword || 'admin123';
  if (input === correct) {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('editorLayout').style.display = 'grid';
    initEditor();
  } else {
    var err = document.getElementById('loginError');
    err.textContent = 'Password salah. Coba lagi.';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
    setTimeout(function() { err.textContent = ''; }, 3000);
  }
}

function changePassword() {
  var np = document.getElementById('newPassword').value.trim();
  var cp = document.getElementById('confirmPassword').value.trim();
  if (!np) { showToast('Password tidak boleh kosong', true); return; }
  if (np !== cp) { showToast('Konfirmasi password tidak cocok', true); return; }
  if (np.length < 4) { showToast('Password minimal 4 karakter', true); return; }
  edState.data.adminPassword = np;
  saveData();
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  showToast('Password berhasil diubah');
}

// ── INIT EDITOR ────────────────────────────────────────────────────────────
function initEditor() {
  if (edState.data.layouts.length > 0) {
    edState.currentLayoutId = edState.data.layouts[0].id;
  }
  renderLayoutList();
  renderHotspotList();
  renderEquipmentList();
  loadEditorLayout(edState.currentLayoutId);
  setupCanvasEvents();
}

// ── TOOL SELECTION ─────────────────────────────────────────────────────────
function setTool(tool) {
  edState.currentTool = tool;
  ['select','add','move'].forEach(function(t) {
    var btn = document.getElementById('tool' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle('active', t === tool);
  });
  var wrapper = document.getElementById('canvasWrapper');
  if (tool === 'add') {
    wrapper.style.cursor = 'crosshair';
    document.getElementById('canvasHint').textContent = 'Klik pada canvas untuk menempatkan hotspot baru';
  } else if (tool === 'move') {
    wrapper.style.cursor = 'move';
    document.getElementById('canvasHint').textContent = 'Drag hotspot untuk memindahkan posisi';
  } else {
    wrapper.style.cursor = 'default';
    document.getElementById('canvasHint').textContent = 'Klik hotspot untuk memilih dan edit properti';
  }
}

// ── LAYOUT LIST ────────────────────────────────────────────────────────────
function renderLayoutList() {
  var list = document.getElementById('layoutList');
  list.innerHTML = edState.data.layouts.map(function(l) {
    var active = l.id === edState.currentLayoutId ? ' active' : '';
    return '<div class="sidebar-list-item' + active + '" onclick="selectLayout(\'' + l.id + '\')">' +
      '<span class="item-dot" style="background:var(--accent-blue)"></span>' +
      '<span class="item-name">' + escHtml(l.name) + '</span>' +
      '<button onclick="event.stopPropagation();deleteLayout(\'' + l.id + '\')" ' +
        'style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:0.8rem;padding:0 0.2rem" title="Hapus">✕</button>' +
    '</div>';
  }).join('');
}

function selectLayout(id) {
  edState.currentLayoutId = id;
  edState.selectedHotspotId = null;
  renderLayoutList();
  renderHotspotList();
  loadEditorLayout(id);
  renderLayoutInfo();
}

function addLayout() {
  var name = prompt('Nama layout baru:');
  if (!name || !name.trim()) return;
  var layout = {
    id: genId('layout'),
    name: name.trim(),
    image: null,
    width: 1920,
    height: 1080,
    created: new Date().toISOString().slice(0,10)
  };
  edState.data.layouts.push(layout);
  selectLayout(layout.id);
  showToast('Layout "' + layout.name + '" ditambahkan');
}

function deleteLayout(id) {
  if (edState.data.layouts.length <= 1) {
    showToast('Minimal harus ada 1 layout', true); return;
  }
  if (!confirm('Hapus layout ini? Semua hotspot di layout ini juga akan dihapus.')) return;
  edState.data.layouts = edState.data.layouts.filter(function(l) { return l.id !== id; });
  edState.data.hotspots = edState.data.hotspots.filter(function(h) { return h.layoutId !== id; });
  if (edState.currentLayoutId === id) {
    edState.currentLayoutId = edState.data.layouts[0].id;
    edState.selectedHotspotId = null;
  }
  renderLayoutList();
  renderHotspotList();
  loadEditorLayout(edState.currentLayoutId);
  showToast('Layout dihapus');
}

// ── LOAD EDITOR LAYOUT ─────────────────────────────────────────────────────
function loadEditorLayout(layoutId) {
  if (!layoutId) return;
  var layout = edState.data.layouts.find(function(l) { return l.id === layoutId; });
  if (!layout) return;

  var canvas = document.getElementById('editorCanvas');
  var bg     = document.getElementById('canvasBg');

  canvas.style.width  = layout.width  + 'px';
  canvas.style.height = layout.height + 'px';

  if (layout.image) {
    bg.style.backgroundImage    = 'url(' + layout.image + ')';
    bg.style.backgroundSize     = 'contain';
    bg.style.backgroundRepeat   = 'no-repeat';
    bg.style.backgroundPosition = 'top left';
    bg.style.width  = layout.width  + 'px';
    bg.style.height = layout.height + 'px';
    bg.innerHTML = '';
  } else {
    bg.style.backgroundImage = 'none';
    bg.style.width  = layout.width  + 'px';
    bg.style.height = layout.height + 'px';
    bg.innerHTML =
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:var(--bg-secondary)">' +
        '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,170,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,170,255,0.05) 1px,transparent 1px);background-size:60px 60px;pointer-events:none"></div>' +
        '<div style="font-family:var(--font-mono);font-size:1.5rem;color:var(--accent-green);letter-spacing:3px;text-shadow:0 0 20px rgba(0,255,136,0.5)">' + escHtml(layout.name) + '</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">Klik "Upload Gambar" untuk menambahkan gambar layout</div>' +
      '</div>';
  }

  renderEditorHotspots(layoutId);
  renderLayoutInfo();
}

function renderLayoutInfo() {
  var layout = edState.data.layouts.find(function(l) { return l.id === edState.currentLayoutId; });
  var info = document.getElementById('layoutInfo');
  if (!layout) { info.innerHTML = '<p class="no-selection">Pilih layout</p>'; return; }
  var hsCount = edState.data.hotspots.filter(function(h) { return h.layoutId === layout.id; }).length;
  info.innerHTML =
    '<div class="form-group"><label>Nama Layout</label>' +
      '<input type="text" id="layoutNameInput" value="' + escHtml(layout.name) + '" ' +
        'onchange="updateLayoutName(this.value)">' +
    '</div>' +
    '<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.5rem">' +
      '<div>ID: <span style="color:var(--accent-orange);font-family:var(--font-mono)">' + layout.id + '</span></div>' +
      '<div>Ukuran: ' + layout.width + ' × ' + layout.height + ' px</div>' +
      '<div>Hotspot: ' + hsCount + ' titik</div>' +
      '<div>Dibuat: ' + layout.created + '</div>' +
    '</div>';
}

function updateLayoutName(val) {
  var layout = edState.data.layouts.find(function(l) { return l.id === edState.currentLayoutId; });
  if (layout && val.trim()) {
    layout.name = val.trim();
    renderLayoutList();
  }
}

// ── UPLOAD IMAGE ───────────────────────────────────────────────────────────
function showUploadDialog() {
  if (!edState.currentLayoutId) { showToast('Pilih layout terlebih dahulu', true); return; }
  document.getElementById('fileInput').click();
}

function handleFileUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar', true); return; }

  var reader = new FileReader();
  reader.onload = function(e) {
    var layout = edState.data.layouts.find(function(l) { return l.id === edState.currentLayoutId; });
    if (!layout) return;

    // Get image dimensions
    var img = new Image();
    img.onload = function() {
      layout.image  = e.target.result;
      layout.width  = img.naturalWidth  || 1920;
      layout.height = img.naturalHeight || 1080;
      loadEditorLayout(edState.currentLayoutId);
      showToast('Gambar berhasil diupload');
    };
    img.src = e.target.result;
  };
  reader.onerror = function() { showToast('Gagal membaca file', true); };
  reader.readAsDataURL(file);

  // Reset input so same file can be re-selected
  event.target.value = '';
}

// ── HOTSPOT LIST ───────────────────────────────────────────────────────────
function renderHotspotList() {
  var list = document.getElementById('hotspotList');
  var hotspots = edState.data.hotspots.filter(function(h) {
    return h.layoutId === edState.currentLayoutId;
  });
  var count = document.getElementById('hotspotCount');
  if (count) count.textContent = '(' + hotspots.length + ')';

  if (hotspots.length === 0) {
    list.innerHTML = '<p class="no-selection">Belum ada hotspot</p>';
    return;
  }

  list.innerHTML = hotspots.map(function(h) {
    var active = h.id === edState.selectedHotspotId ? ' active' : '';
    return '<div class="sidebar-list-item' + active + '" onclick="selectHotspot(\'' + h.id + '\')">' +
      '<span class="item-dot" style="background:' + h.color + ';box-shadow:0 0 4px ' + h.color + '"></span>' +
      '<div style="flex:1;overflow:hidden">' +
        '<div class="item-name">' + escHtml(h.name) + '</div>' +
        '<div class="item-kks">' + escHtml(h.kks) + '</div>' +
      '</div>' +
      '<button onclick="event.stopPropagation();deleteHotspotById(\'' + h.id + '\')" ' +
        'style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:0.8rem;padding:0 0.2rem" title="Hapus">✕</button>' +
    '</div>';
  }).join('');
}

function selectHotspot(id) {
  edState.selectedHotspotId = id;
  renderHotspotList();
  renderHotspotProperties(id);
  // Highlight on canvas
  document.querySelectorAll('.editor-hotspot').forEach(function(el) {
    el.classList.toggle('selected', el.dataset.id === id);
  });
}

// ── RENDER EDITOR HOTSPOTS ─────────────────────────────────────────────────
function buildHotspotInner(h) {
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
           '<div class="hotspot-label">' + escHtml(h.name) + '</div>';
  }
  return '<div class="hotspot-ring"></div>' +
         '<div class="hotspot-dot"></div>' +
         '<div class="hotspot-label">' + escHtml(h.name) + '</div>';
}

function renderEditorHotspots(layoutId) {
  var layer = document.getElementById('canvasHotspots');
  var hotspots = edState.data.hotspots.filter(function(h) { return h.layoutId === layoutId; });

  layer.innerHTML = hotspots.map(function(h) {
    var sel = h.id === edState.selectedHotspotId ? ' selected' : '';
    var shapeClass = h.shape === 'manual-valve' ? ' shape-manual-valve' : '';
    return '<div class="editor-hotspot' + sel + shapeClass + '" data-id="' + h.id + '" ' +
           'style="left:' + h.x + 'px;top:' + h.y + 'px;--hcolor:' + h.color + '">' +
             buildHotspotInner(h) +
           '</div>';
  }).join('');

  // Attach drag events to each hotspot
  layer.querySelectorAll('.editor-hotspot').forEach(function(el) {
    attachHotspotDrag(el);
  });
}

// ── HOTSPOT DRAG ───────────────────────────────────────────────────────────
function attachHotspotDrag(el) {
  var id = el.dataset.id;

  // Mouse drag
  el.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    selectHotspot(id);

    if (edState.currentTool === 'select' || edState.currentTool === 'move') {
      edState.isDragging = true;
      var rect = document.getElementById('editorCanvas').getBoundingClientRect();
      var h = edState.data.hotspots.find(function(hs) { return hs.id === id; });
      edState.dragOffsetX = e.clientX - rect.left - h.x;
      edState.dragOffsetY = e.clientY - rect.top  - h.y;
      el.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  // Touch drag
  el.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    selectHotspot(id);

    if (edState.currentTool === 'select' || edState.currentTool === 'move') {
      edState.isDragging = true;
      var rect = document.getElementById('editorCanvas').getBoundingClientRect();
      var h = edState.data.hotspots.find(function(hs) { return hs.id === id; });
      edState.dragOffsetX = e.touches[0].clientX - rect.left - h.x;
      edState.dragOffsetY = e.touches[0].clientY - rect.top  - h.y;
      e.preventDefault();
    }
  }, { passive: false });
}

function setupCanvasEvents() {
  var canvas  = document.getElementById('editorCanvas');
  var wrapper = document.getElementById('canvasWrapper');

  // Mouse move for drag
  document.addEventListener('mousemove', function(e) {
    if (!edState.isDragging || !edState.selectedHotspotId) return;
    var rect = canvas.getBoundingClientRect();
    var x = Math.round(e.clientX - rect.left - edState.dragOffsetX);
    var y = Math.round(e.clientY - rect.top  - edState.dragOffsetY);
    moveHotspot(edState.selectedHotspotId, x, y);
  });

  // Touch move for drag
  document.addEventListener('touchmove', function(e) {
    if (!edState.isDragging || !edState.selectedHotspotId) return;
    var rect = canvas.getBoundingClientRect();
    var x = Math.round(e.touches[0].clientX - rect.left - edState.dragOffsetX);
    var y = Math.round(e.touches[0].clientY - rect.top  - edState.dragOffsetY);
    moveHotspot(edState.selectedHotspotId, x, y);
    e.preventDefault();
  }, { passive: false });

  // Mouse up
  document.addEventListener('mouseup', function() {
    if (edState.isDragging) {
      edState.isDragging = false;
      document.querySelectorAll('.editor-hotspot').forEach(function(el) {
        el.style.cursor = 'move';
      });
    }
  });

  // Touch end
  document.addEventListener('touchend', function() {
    edState.isDragging = false;
  });

  // Click on canvas to add hotspot
  canvas.addEventListener('click', function(e) {
    if (edState.currentTool !== 'add') return;
    if (e.target.closest('.editor-hotspot')) return;
    var rect = canvas.getBoundingClientRect();
    var x = Math.round(e.clientX - rect.left);
    var y = Math.round(e.clientY - rect.top);
    createHotspotAt(x, y, edState.pendingShape || 'default');
  });

  // Click on canvas background to deselect
  canvas.addEventListener('click', function(e) {
    if (edState.currentTool === 'add') return;
    if (!e.target.closest('.editor-hotspot')) {
      edState.selectedHotspotId = null;
      renderHotspotList();
      document.querySelectorAll('.editor-hotspot').forEach(function(el) {
        el.classList.remove('selected');
      });
      document.getElementById('hotspotProperties').innerHTML =
        '<p class="no-selection">Pilih hotspot untuk edit</p>';
    }
  });
}

function moveHotspot(id, x, y) {
  var layout = edState.data.layouts.find(function(l) { return l.id === edState.currentLayoutId; });
  if (layout) {
    x = Math.max(22, Math.min(x, layout.width  - 22));
    y = Math.max(22, Math.min(y, layout.height - 22));
  }
  var h = edState.data.hotspots.find(function(hs) { return hs.id === id; });
  if (!h) return;
  h.x = x;
  h.y = y;

  // Update DOM position directly (no full re-render for smooth drag)
  var el = document.querySelector('.editor-hotspot[data-id="' + id + '"]');
  if (el) {
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
  }

  // Update position display in properties panel
  var px = document.getElementById('propX');
  var py = document.getElementById('propY');
  if (px) px.value = x;
  if (py) py.value = y;
}

// ── ADD / DELETE HOTSPOT ───────────────────────────────────────────────────
function toggleShapePicker() {
  var dd = document.getElementById('shapePickerDropdown');
  dd.classList.toggle('open');
  // Close on outside click
  if (dd.classList.contains('open')) {
    setTimeout(function() {
      document.addEventListener('click', function closeDD(e) {
        if (!document.getElementById('shapePickerWrap').contains(e.target)) {
          dd.classList.remove('open');
          document.removeEventListener('click', closeDD);
        }
      });
    }, 10);
  }
}

function addHotspotWithShape(shape) {
  document.getElementById('shapePickerDropdown').classList.remove('open');
  if (!edState.currentLayoutId) { showToast('Pilih layout terlebih dahulu', true); return; }
  edState.pendingShape = shape;
  // Langsung tambah di tengah canvas
  var layout = edState.data.layouts.find(function(l) { return l.id === edState.currentLayoutId; });
  createHotspotAt(Math.round(layout.width / 2), Math.round(layout.height / 2), shape);
}

function addHotspot() {
  addHotspotWithShape('default');
}

function createHotspotAt(x, y, shape) {
  if (!edState.currentLayoutId) return;
  shape = shape || 'default';
  var isValve = shape === 'manual-valve';
  var h = {
    id: genId('hs'),
    layoutId: edState.currentLayoutId,
    x: x,
    y: y,
    name: isValve ? 'Manual Valve' : 'Hotspot Baru',
    kks: 'XX-XXX-000',
    type: isValve ? 'Valve' : 'Equipment',
    description: isValve ? 'Manual valve.' : 'Deskripsi peralatan.',
    color: isValve ? '#ffffff' : '#00FF88',
    shape: shape,
    icon: isValve ? 'valve' : 'equipment'
  };
  edState.data.hotspots.push(h);
  renderEditorHotspots(edState.currentLayoutId);
  renderHotspotList();
  selectHotspot(h.id);
  setTool('select');
  showToast('Hotspot ditambahkan — edit properti di panel kanan');
}

function deleteSelected() {
  if (!edState.selectedHotspotId) { showToast('Pilih hotspot yang akan dihapus', true); return; }
  deleteHotspotById(edState.selectedHotspotId);
}

function deleteHotspotById(id) {
  if (!confirm('Hapus hotspot ini?')) return;
  edState.data.hotspots = edState.data.hotspots.filter(function(h) { return h.id !== id; });
  if (edState.selectedHotspotId === id) {
    edState.selectedHotspotId = null;
    document.getElementById('hotspotProperties').innerHTML =
      '<p class="no-selection">Pilih hotspot untuk edit</p>';
  }
  renderEditorHotspots(edState.currentLayoutId);
  renderHotspotList();
  showToast('Hotspot dihapus');
}

// ── HOTSPOT PROPERTIES PANEL ───────────────────────────────────────────────
function renderHotspotProperties(id) {
  var h = edState.data.hotspots.find(function(hs) { return hs.id === id; });
  var panel = document.getElementById('hotspotProperties');
  if (!h) { panel.innerHTML = '<p class="no-selection">Pilih hotspot untuk edit</p>'; return; }

  // Build image preview HTML
  var imgPreview = h.image
    ? '<div style="margin-top:0.4rem;border:1px solid var(--border);border-radius:6px;overflow:hidden;max-height:120px">' +
        '<img src="' + h.image + '" style="width:100%;object-fit:contain;max-height:120px;display:block">' +
        '<button onclick="removeHotspotImage()" style="width:100%;background:rgba(255,68,68,0.1);border:none;border-top:1px solid var(--border);color:var(--accent-red);font-size:0.7rem;padding:0.25rem;cursor:pointer">✕ Hapus Gambar</button>' +
      '</div>'
    : '<div style="margin-top:0.4rem;border:1px dashed var(--border);border-radius:6px;padding:0.5rem;text-align:center;color:var(--text-dim);font-size:0.72rem">Belum ada gambar</div>';

  panel.innerHTML =
    '<div class="form-group"><label>Nama</label>' +
      '<input type="text" id="propName" value="' + escHtml(h.name) + '" oninput="updateHotspotProp(\'name\',this.value)">' +
    '</div>' +
    '<div class="form-group"><label>Kode KKS</label>' +
      '<input type="text" id="propKks" value="' + escHtml(h.kks) + '" oninput="updateHotspotProp(\'kks\',this.value)">' +
    '</div>' +
    '<div class="form-group"><label>Lokasi</label>' +
      '<input type="text" id="propLocation" value="' + escHtml(h.location || '') + '" placeholder="Contoh: Turbine Hall Lt.1" oninput="updateHotspotProp(\'location\',this.value)">' +
    '</div>' +
    '<div class="form-group"><label>Tipe</label>' +
      '<select id="propType" onchange="updateHotspotProp(\'type\',this.value)">' +
        '<option value="Equipment"' + (h.type==='Equipment'?' selected':'') + '>Equipment</option>' +
        '<option value="Valve"'    + (h.type==='Valve'    ?' selected':'') + '>Valve</option>' +
        '<option value="Sensor"'   + (h.type==='Sensor'   ?' selected':'') + '>Sensor</option>' +
      '</select>' +
    '</div>' +
    '<div class="form-group"><label>Bentuk Hotspot</label>' +
      '<select id="propShape" onchange="updateHotspotShape(this.value)">' +
        '<option value="default"'      + (!h.shape || h.shape==='default'      ?' selected':'') + '>⬤ Lingkaran (Default)</option>' +
        '<option value="manual-valve"' + (h.shape==='manual-valve'?' selected':'') + '>⧖ Manual Valve</option>' +
      '</select>' +
    '</div>' +
    '<div class="form-group"><label>Warna</label>' +
      '<input type="color" id="propColor" value="' + h.color + '" oninput="updateHotspotProp(\'color\',this.value)">' +
    '</div>' +
    '<div class="form-group"><label>Keterangan</label>' +
      '<textarea id="propDesc" rows="3" oninput="updateHotspotProp(\'description\',this.value)">' + escHtml(h.description) + '</textarea>' +
    '</div>' +
    '<div class="form-group"><label>Gambar Keterangan</label>' +
      imgPreview +
      '<button onclick="document.getElementById(\'propImageInput\').click()" ' +
        'style="margin-top:0.4rem;width:100%;background:rgba(0,170,255,0.1);border:1px solid var(--accent-blue);color:var(--accent-blue);border-radius:6px;padding:0.35rem;cursor:pointer;font-size:0.72rem;font-family:var(--font-mono)">📷 Upload Gambar</button>' +
      '<input type="file" id="propImageInput" accept="image/*" style="display:none" onchange="handleHotspotImageUpload(event)">' +
    '</div>' +
    '<div style="display:flex;gap:0.5rem">' +
      '<div class="form-group" style="flex:1"><label>X (px)</label>' +
        '<input type="number" id="propX" value="' + h.x + '" oninput="updateHotspotPos(\'x\',this.value)">' +
      '</div>' +
      '<div class="form-group" style="flex:1"><label>Y (px)</label>' +
        '<input type="number" id="propY" value="' + h.y + '" oninput="updateHotspotPos(\'y\',this.value)">' +
      '</div>' +
    '</div>' +
    '<div style="font-size:0.65rem;color:var(--text-dim);font-family:var(--font-mono)">ID: ' + h.id + '</div>';
}

function updateHotspotProp(prop, value) {
  var h = edState.data.hotspots.find(function(hs) { return hs.id === edState.selectedHotspotId; });
  if (!h) return;
  h[prop] = value;

  // Live update on canvas
  var el = document.querySelector('.editor-hotspot[data-id="' + h.id + '"]');
  if (el) {
    el.style.setProperty('--hcolor', h.color);
    var label = el.querySelector('.hotspot-label');
    if (label) label.textContent = h.name;
  }
  renderHotspotList();
}

function updateHotspotShape(shape) {
  var h = edState.data.hotspots.find(function(hs) { return hs.id === edState.selectedHotspotId; });
  if (!h) return;
  h.shape = shape;
  // Re-render canvas hotspots to apply new shape
  renderEditorHotspots(edState.currentLayoutId);
  // Re-select to restore highlight
  selectHotspot(h.id);
}

function updateHotspotPos(axis, value) {
  var val = parseInt(value, 10);
  if (isNaN(val)) return;
  var h = edState.data.hotspots.find(function(hs) { return hs.id === edState.selectedHotspotId; });
  if (!h) return;
  if (axis === 'x') moveHotspot(h.id, val, h.y);
  else              moveHotspot(h.id, h.x, val);
}

// ── HOTSPOT IMAGE UPLOAD ───────────────────────────────────────────────────
function handleHotspotImageUpload(event) {
  var file = event.target.files[0];
  if (!file || !edState.selectedHotspotId) return;
  if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar', true); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var h = edState.data.hotspots.find(function(hs) { return hs.id === edState.selectedHotspotId; });
    if (!h) return;
    h.image = e.target.result;
    renderHotspotProperties(h.id);
    showToast('Gambar berhasil diupload');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeHotspotImage() {
  var h = edState.data.hotspots.find(function(hs) { return hs.id === edState.selectedHotspotId; });
  if (!h) return;
  h.image = null;
  renderHotspotProperties(h.id);
  showToast('Gambar dihapus');
}

// ── SAVE / CANCEL ──────────────────────────────────────────────────────────
function saveAll() {
  saveData();
  edState.originalData = JSON.parse(JSON.stringify(edState.data));
  showToast('Semua perubahan berhasil disimpan!');
}

function cancelChanges() {
  if (!confirm('Batalkan semua perubahan yang belum disimpan?')) return;
  edState.data = JSON.parse(JSON.stringify(edState.originalData));
  edState.selectedHotspotId = null;
  renderLayoutList();
  renderHotspotList();
  renderEquipmentList();
  loadEditorLayout(edState.currentLayoutId);
  document.getElementById('hotspotProperties').innerHTML =
    '<p class="no-selection">Pilih hotspot untuk edit</p>';
  showToast('Perubahan dibatalkan');
}

// ── EQUIPMENT CRUD ─────────────────────────────────────────────────────────
function renderEquipmentList(filter) {
  var list = document.getElementById('equipmentList');
  var items = edState.data.equipment;
  if (filter) {
    var q = filter.toLowerCase();
    items = items.filter(function(e) {
      return e.name.toLowerCase().includes(q) ||
             e.kks.toLowerCase().includes(q)  ||
             e.type.toLowerCase().includes(q);
    });
  }

  if (items.length === 0) {
    list.innerHTML = '<p class="no-selection">Tidak ada data</p>';
    return;
  }

  list.innerHTML = items.map(function(e) {
    var color = e.type === 'Valve' ? 'var(--accent-red)' :
                e.type === 'Sensor' ? 'var(--accent-yellow)' : 'var(--accent-green)';
    return '<div class="sidebar-list-item">' +
      '<span class="item-dot" style="background:' + color + '"></span>' +
      '<div style="flex:1;overflow:hidden">' +
        '<div class="item-name">' + escHtml(e.name) + '</div>' +
        '<div class="item-kks">' + escHtml(e.kks) + '</div>' +
      '</div>' +
      '<button onclick="openEquipModal(\'' + e.id + '\')" ' +
        'style="background:none;border:none;color:var(--accent-blue);cursor:pointer;font-size:0.75rem;padding:0 0.2rem" title="Edit">✎</button>' +
      '<button onclick="deleteEquipment(\'' + e.id + '\')" ' +
        'style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:0.8rem;padding:0 0.2rem" title="Hapus">✕</button>' +
    '</div>';
  }).join('');
}

function filterEquipment() {
  var q = document.getElementById('searchEquipment').value;
  renderEquipmentList(q);
}

function openEquipModal(id) {
  var modal = document.getElementById('equipModal');
  var title = document.getElementById('equipModalTitle');
  // Reset image state
  edState._equipImgTemp = null;

  if (id) {
    var e = edState.data.equipment.find(function(eq) { return eq.id === id; });
    if (!e) return;
    document.getElementById('equipId').value       = e.id;
    document.getElementById('equipName').value     = e.name;
    document.getElementById('equipKks').value      = e.kks;
    document.getElementById('equipLocation').value = e.location || '';
    document.getElementById('equipType').value     = e.type;
    document.getElementById('equipDesc').value     = e.description;
    edState._equipImgTemp = e.image || null;
    title.textContent = 'EDIT PERALATAN';
  } else {
    document.getElementById('equipId').value       = '';
    document.getElementById('equipName').value     = '';
    document.getElementById('equipKks').value      = '';
    document.getElementById('equipLocation').value = '';
    document.getElementById('equipType').value     = 'Equipment';
    document.getElementById('equipDesc').value     = '';
    title.textContent = 'TAMBAH PERALATAN';
  }
  renderEquipImgPreview();
  modal.classList.add('active');
  document.getElementById('equipName').focus();
}

function renderEquipImgPreview() {
  var preview = document.getElementById('equipImgPreview');
  if (!preview) return;
  if (edState._equipImgTemp) {
    preview.innerHTML =
      '<div style="border:1px solid var(--border);border-radius:6px;overflow:hidden;max-height:100px">' +
        '<img src="' + edState._equipImgTemp + '" style="width:100%;object-fit:contain;max-height:100px;display:block">' +
        '<button onclick="edState._equipImgTemp=null;renderEquipImgPreview()" ' +
          'style="width:100%;background:rgba(255,68,68,0.1);border:none;border-top:1px solid var(--border);color:var(--accent-red);font-size:0.7rem;padding:0.2rem;cursor:pointer">✕ Hapus Gambar</button>' +
      '</div>';
  } else {
    preview.innerHTML = '<div style="border:1px dashed var(--border);border-radius:6px;padding:0.4rem;text-align:center;color:var(--text-dim);font-size:0.72rem">Belum ada gambar</div>';
  }
}

function handleEquipImageUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar', true); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    edState._equipImgTemp = e.target.result;
    renderEquipImgPreview();
    showToast('Gambar siap disimpan');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function closeEquipModal() {
  document.getElementById('equipModal').classList.remove('active');
}

function saveEquipment() {
  var name     = document.getElementById('equipName').value.trim();
  var kks      = document.getElementById('equipKks').value.trim();
  var location = document.getElementById('equipLocation').value.trim();
  var type     = document.getElementById('equipType').value;
  var desc     = document.getElementById('equipDesc').value.trim();
  var id       = document.getElementById('equipId').value;

  if (!name) { showToast('Nama peralatan wajib diisi', true); return; }
  if (!kks)  { showToast('Kode KKS wajib diisi', true); return; }

  if (id) {
    var e = edState.data.equipment.find(function(eq) { return eq.id === id; });
    if (e) {
      e.name     = name;
      e.kks      = kks;
      e.location = location;
      e.type     = type;
      e.description = desc;
      e.image    = edState._equipImgTemp || null;
    }
  } else {
    edState.data.equipment.push({
      id: genId('eq'), name: name, kks: kks, location: location,
      type: type, description: desc, image: edState._equipImgTemp || null
    });
  }

  edState._equipImgTemp = null;
  closeEquipModal();
  renderEquipmentList();
  showToast('Data peralatan disimpan');
}

function deleteEquipment(id) {
  if (!confirm('Hapus data peralatan ini?')) return;
  edState.data.equipment = edState.data.equipment.filter(function(e) { return e.id !== id; });
  renderEquipmentList();
  showToast('Peralatan dihapus');
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  var modal = document.getElementById('equipModal');
  if (e.target === modal) closeEquipModal();
});

// Close modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeEquipModal();
});
