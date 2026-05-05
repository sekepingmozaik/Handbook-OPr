// data.js — Data default DCS PLTU Interaktif
// Dimuat jika localStorage kosong

const DEFAULT_DATA = {
  layouts: [
    {
      id: "layout_001",
      name: "Turbine Main",
      image: null,
      width: 1920,
      height: 1080,
      created: "2025-06-03"
    },
    {
      id: "layout_002",
      name: "Boiler Main",
      image: null,
      width: 1920,
      height: 1080,
      created: "2025-06-03"
    },
    {
      id: "layout_003",
      name: "Extraction System",
      image: null,
      width: 1920,
      height: 1080,
      created: "2025-06-03"
    }
  ],
  hotspots: [
    { id: "hs_001", layoutId: "layout_001", x: 540, y: 560, name: "CONDENSER", kks: "12-CND-001", type: "Equipment", description: "Mengubah uap bekas menjadi air dengan proses kondensasi. Tekanan operasi: 0.05 bar, Temperatur: 33°C.", color: "#00FF7F", icon: "equipment" },
    { id: "hs_002", layoutId: "layout_001", x: 200, y: 300, name: "HP Valve", kks: "10-HV-101", type: "Valve", description: "High Pressure Valve untuk sistem utama. Tekanan operasi: 165 bar, Temperatur: 540°C.", color: "#FF4444", icon: "valve" },
    { id: "hs_003", layoutId: "layout_001", x: 400, y: 300, name: "IP Valve", kks: "10-IV-101", type: "Valve", description: "Intermediate Pressure Valve. Tekanan operasi: 40 bar, Temperatur: 540°C.", color: "#FF8800", icon: "valve" },
    { id: "hs_004", layoutId: "layout_001", x: 600, y: 300, name: "LP Valve", kks: "10-LV-101", type: "Valve", description: "Low Pressure Valve. Tekanan operasi: 8 bar, Temperatur: 300°C.", color: "#FFFF00", icon: "valve" },
    { id: "hs_005", layoutId: "layout_001", x: 350, y: 450, name: "DEAERATOR", kks: "13-DEA-001", type: "Equipment", description: "Menghilangkan gas terlarut dalam air umpan boiler. Level operasi: 50-70%, Tekanan: 6 bar.", color: "#00AAFF", icon: "equipment" },
    { id: "hs_006", layoutId: "layout_001", x: 750, y: 450, name: "HP TURBINE", kks: "10-HPT-001", type: "Equipment", description: "High Pressure Turbine. Daya output: 100 MW, Kecepatan: 3000 RPM.", color: "#FF44FF", icon: "equipment" },
    { id: "hs_007", layoutId: "layout_001", x: 950, y: 450, name: "IP TURBINE", kks: "10-IPT-001", type: "Equipment", description: "Intermediate Pressure Turbine. Daya output: 150 MW, Kecepatan: 3000 RPM.", color: "#FF44FF", icon: "equipment" },
    { id: "hs_008", layoutId: "layout_001", x: 1150, y: 450, name: "LP TURBINE", kks: "10-LPT-001", type: "Equipment", description: "Low Pressure Turbine. Daya output: 100 MW, Kecepatan: 3000 RPM.", color: "#FF44FF", icon: "equipment" },
    { id: "hs_009", layoutId: "layout_001", x: 1350, y: 450, name: "GENERATOR", kks: "10-GEN-001", type: "Equipment", description: "Generator utama. Kapasitas: 350 MW, Tegangan: 20 kV, Frekuensi: 50 Hz.", color: "#00FFFF", icon: "equipment" },
    { id: "hs_010", layoutId: "layout_001", x: 800, y: 700, name: "CEP", kks: "12-CEP-001", type: "Equipment", description: "Condensate Extraction Pump. Flow: 800 m³/h, Head: 250 m.", color: "#AAFFAA", icon: "equipment" },
    { id: "hs_011", layoutId: "layout_002", x: 300, y: 200, name: "DRUM", kks: "10-DRM-001", type: "Equipment", description: "Steam drum boiler utama. Tekanan: 175 bar, Level operasi: 50±50mm.", color: "#00FF7F", icon: "equipment" },
    { id: "hs_012", layoutId: "layout_002", x: 600, y: 350, name: "PRIMARY SH", kks: "10-PSH-001", type: "Equipment", description: "Primary Superheater. Temperatur outlet: 450°C, Tekanan: 165 bar.", color: "#FF6600", icon: "equipment" },
    { id: "hs_013", layoutId: "layout_002", x: 800, y: 400, name: "ECONOMIZER", kks: "10-ECO-001", type: "Equipment", description: "Economizer untuk pemanasan awal air umpan. Temperatur inlet: 250°C, outlet: 310°C.", color: "#00CCFF", icon: "equipment" },
    { id: "hs_014", layoutId: "layout_002", x: 1000, y: 300, name: "FINAL SH", kks: "10-FSH-001", type: "Equipment", description: "Final Superheater. Temperatur outlet: 540°C, Tekanan: 165 bar.", color: "#FF2200", icon: "equipment" },
    { id: "hs_015", layoutId: "layout_002", x: 400, y: 600, name: "BURNER A", kks: "10-BRN-A01", type: "Equipment", description: "Burner A sistem pembakaran. Kapasitas: 25 ton/jam batubara.", color: "#FF8800", icon: "equipment" },
    { id: "hs_016", layoutId: "layout_002", x: 700, y: 600, name: "BURNER B", kks: "10-BRN-B01", type: "Equipment", description: "Burner B sistem pembakaran. Kapasitas: 25 ton/jam batubara.", color: "#FF8800", icon: "equipment" },
    { id: "hs_017", layoutId: "layout_002", x: 1200, y: 500, name: "AIR HEATER", kks: "10-AHT-001", type: "Equipment", description: "Air Heater untuk pemanasan udara pembakaran. Temperatur udara outlet: 320°C.", color: "#FFAA00", icon: "equipment" },
    { id: "hs_018", layoutId: "layout_002", x: 200, y: 450, name: "REHEATER", kks: "10-RHT-001", type: "Equipment", description: "Reheater untuk pemanasan ulang uap. Temperatur outlet: 540°C, Tekanan: 40 bar.", color: "#FF4488", icon: "equipment" },
    { id: "hs_019", layoutId: "layout_003", x: 400, y: 500, name: "DEAERATOR", kks: "13-DEA-001", type: "Equipment", description: "Deaerator pada sistem ekstraksi. Level: 50-70%, Tekanan: 6 bar.", color: "#00AAFF", icon: "equipment" },
    { id: "hs_020", layoutId: "layout_003", x: 700, y: 500, name: "BFPA", kks: "13-BFP-A01", type: "Equipment", description: "Boiler Feed Pump A. Flow: 400 m³/h, Head: 2000 m, Daya: 3.5 MW.", color: "#FF44FF", icon: "equipment" },
    { id: "hs_021", layoutId: "layout_003", x: 1000, y: 500, name: "BFPB", kks: "13-BFP-B01", type: "Equipment", description: "Boiler Feed Pump B. Flow: 400 m³/h, Head: 2000 m, Daya: 3.5 MW.", color: "#FF44FF", icon: "equipment" },
    { id: "hs_022", layoutId: "layout_003", x: 200, y: 300, name: "HP HTR 1", kks: "13-HPH-001", type: "Equipment", description: "High Pressure Heater 1. Tekanan: 40 bar, Temperatur: 250°C.", color: "#FF6600", icon: "equipment" },
    { id: "hs_023", layoutId: "layout_003", x: 500, y: 300, name: "HP HTR 2", kks: "13-HPH-002", type: "Equipment", description: "High Pressure Heater 2. Tekanan: 20 bar, Temperatur: 200°C.", color: "#FF6600", icon: "equipment" },
    { id: "hs_024", layoutId: "layout_003", x: 800, y: 300, name: "LP HTR 1", kks: "13-LPH-001", type: "Equipment", description: "Low Pressure Heater 1. Tekanan: 4 bar, Temperatur: 120°C.", color: "#FFAA00", icon: "equipment" },
    { id: "hs_025", layoutId: "layout_003", x: 1100, y: 300, name: "LP HTR 2", kks: "13-LPH-002", type: "Equipment", description: "Low Pressure Heater 2. Tekanan: 2 bar, Temperatur: 90°C.", color: "#FFAA00", icon: "equipment" },
    { id: "hs_026", layoutId: "layout_003", x: 1400, y: 500, name: "GLAND COND", kks: "13-GLC-001", type: "Equipment", description: "Gland Condenser untuk sistem seal uap. Tekanan: vakum, Temperatur: 50°C.", color: "#00CCFF", icon: "equipment" },
    { id: "hs_027", layoutId: "layout_003", x: 300, y: 700, name: "EXT VALVE 1", kks: "13-EXV-001", type: "Valve", description: "Extraction Valve 1 dari HP Turbine. Tekanan: 40 bar.", color: "#FF4444", icon: "valve" },
    { id: "hs_028", layoutId: "layout_003", x: 700, y: 700, name: "EXT VALVE 2", kks: "13-EXV-002", type: "Valve", description: "Extraction Valve 2 dari IP Turbine. Tekanan: 8 bar.", color: "#FF8800", icon: "valve" }
  ],
  equipment: [
    { id: "eq_001", name: "HP Valve", kks: "10-HV-101", type: "Valve", description: "High Pressure Valve untuk sistem utama" },
    { id: "eq_002", name: "IP Valve", kks: "10-IV-101", type: "Valve", description: "Intermediate Pressure Valve" },
    { id: "eq_003", name: "LP Valve", kks: "10-LV-101", type: "Valve", description: "Low Pressure Valve" },
    { id: "eq_004", name: "Condenser", kks: "12-CND-001", type: "Equipment", description: "Mengubah uap bekas menjadi air dengan proses kondensasi" },
    { id: "eq_005", name: "Deaerator", kks: "13-DEA-001", type: "Equipment", description: "Menghilangkan gas terlarut dalam air umpan boiler" },
    { id: "eq_006", name: "DRUM", kks: "10-DRM-001", type: "Equipment", description: "Steam drum boiler utama" },
    { id: "eq_007", name: "Primary SH", kks: "10-PSH-001", type: "Equipment", description: "Primary Superheater" },
    { id: "eq_008", name: "Economizer", kks: "10-ECO-001", type: "Equipment", description: "Economizer untuk pemanasan awal air umpan" },
    { id: "eq_009", name: "BFPA", kks: "13-BFP-A01", type: "Equipment", description: "Boiler Feed Pump A" },
    { id: "eq_010", name: "BFPB", kks: "13-BFP-B01", type: "Equipment", description: "Boiler Feed Pump B" },
    { id: "eq_011", name: "HP Turbine", kks: "10-HPT-001", type: "Equipment", description: "High Pressure Turbine, daya 100 MW" },
    { id: "eq_012", name: "IP Turbine", kks: "10-IPT-001", type: "Equipment", description: "Intermediate Pressure Turbine, daya 150 MW" },
    { id: "eq_013", name: "LP Turbine", kks: "10-LPT-001", type: "Equipment", description: "Low Pressure Turbine, daya 100 MW" },
    { id: "eq_014", name: "Generator", kks: "10-GEN-001", type: "Equipment", description: "Generator utama 350 MW, 20 kV, 50 Hz" },
    { id: "eq_015", name: "CEP", kks: "12-CEP-001", type: "Equipment", description: "Condensate Extraction Pump" },
    { id: "eq_016", name: "Final SH", kks: "10-FSH-001", type: "Equipment", description: "Final Superheater, temperatur outlet 540°C" },
    { id: "eq_017", name: "Burner A", kks: "10-BRN-A01", type: "Equipment", description: "Burner A sistem pembakaran" },
    { id: "eq_018", name: "Burner B", kks: "10-BRN-B01", type: "Equipment", description: "Burner B sistem pembakaran" },
    { id: "eq_019", name: "Air Heater", kks: "10-AHT-001", type: "Equipment", description: "Air Heater untuk pemanasan udara pembakaran" },
    { id: "eq_020", name: "Reheater", kks: "10-RHT-001", type: "Equipment", description: "Reheater untuk pemanasan ulang uap" },
    { id: "eq_021", name: "HP Heater 1", kks: "13-HPH-001", type: "Equipment", description: "High Pressure Heater 1" },
    { id: "eq_022", name: "HP Heater 2", kks: "13-HPH-002", type: "Equipment", description: "High Pressure Heater 2" },
    { id: "eq_023", name: "LP Heater 1", kks: "13-LPH-001", type: "Equipment", description: "Low Pressure Heater 1" },
    { id: "eq_024", name: "LP Heater 2", kks: "13-LPH-002", type: "Equipment", description: "Low Pressure Heater 2" },
    { id: "eq_025", name: "Gland Condenser", kks: "13-GLC-001", type: "Equipment", description: "Gland Condenser untuk sistem seal uap" },
    { id: "eq_026", name: "Ext Valve 1", kks: "13-EXV-001", type: "Valve", description: "Extraction Valve 1 dari HP Turbine" },
    { id: "eq_027", name: "Ext Valve 2", kks: "13-EXV-002", type: "Valve", description: "Extraction Valve 2 dari IP Turbine" }
  ],
  procedures: {
    startup: [
      { step: 1, title: "Persiapan Awal", description: "Periksa semua valve dalam posisi normal. Pastikan tidak ada alarm aktif di DCS. Lakukan walkthrough lapangan untuk memastikan kondisi fisik peralatan." },
      { step: 2, title: "Cek Level & Tekanan", description: "Pastikan level air di drum (±0 mm), deaerator (50-70%), dan kondensor dalam batas normal. Cek tekanan nitrogen pada akumulator." },
      { step: 3, title: "Start Auxiliary System", description: "Start auxiliary system secara berurutan: lube oil pump (tekanan min 2 bar), seal oil pump, cooling water pump (CWP), dan condensate extraction pump (CEP)." },
      { step: 4, title: "Purging Boiler", description: "Lakukan purging boiler selama minimal 5 menit dengan airflow >30% untuk membersihkan sisa gas di furnace sebelum penyalaan." },
      { step: 5, title: "Penyalaan Burner", description: "Nyalakan igniter, kemudian buka fuel valve secara bertahap. Pantau flame detector. Naikkan beban burner sesuai kurva pemanasan." },
      { step: 6, title: "Pemanasan Boiler", description: "Naikkan tekanan boiler secara bertahap sesuai kurva pemanasan (pressure raising curve). Pantau temperatur metal drum dan pipa. Buka drain valve secara berkala." },
      { step: 7, title: "Buka Steam Valve", description: "Setelah tekanan mencapai 10 bar, buka bypass valve HP turbine secara bertahap. Pantau tekanan dan temperatur uap masuk turbin." },
      { step: 8, title: "Rolling Turbine", description: "Naikkan putaran turbin secara bertahap: 500 RPM → 1000 RPM → 1500 RPM → 3000 RPM. Pantau vibrasi dan temperatur bearing di setiap tahap." },
      { step: 9, title: "Sinkronisasi Generator", description: "Setelah putaran stabil 3000 RPM, lakukan sinkronisasi generator dengan jaringan. Pastikan tegangan, frekuensi, dan sudut fasa sesuai sebelum menutup breaker." },
      { step: 10, title: "Loading", description: "Naikkan beban secara bertahap sesuai kurva loading: 10% → 25% → 50% → 75% → 100%. Pantau semua parameter di setiap tahap loading." }
    ],
    shutdown: [
      { step: 1, title: "Turunkan Beban", description: "Turunkan beban secara bertahap sesuai prosedur unloading: 100% → 75% → 50% → 25% → 10%. Pantau semua parameter di setiap tahap." },
      { step: 2, title: "Lepas dari Jaringan", description: "Lepas generator dari jaringan (trip breaker) setelah beban mencapai minimum (5-10 MW). Pastikan tidak ada gangguan pada jaringan saat pelepasan." },
      { step: 3, title: "Trip Turbine", description: "Trip turbine dan tutup semua steam valve secara otomatis. Pastikan semua valve menutup sempurna. Aktifkan turning gear segera setelah turbin berhenti." },
      { step: 4, title: "Matikan Burner", description: "Matikan burner secara bertahap. Tutup fuel valve dan lakukan post-purging selama 5 menit untuk membersihkan sisa bahan bakar di furnace." },
      { step: 5, title: "Cooling Down Boiler", description: "Turunkan tekanan boiler secara bertahap. Jaga laju penurunan tekanan tidak melebihi 1 bar/menit. Pantau temperatur metal drum dan pipa." },
      { step: 6, title: "Cooling Down Turbine", description: "Biarkan turbin cooling down dengan turning gear beroperasi. Pantau temperatur casing dan rotor. Turning gear harus tetap beroperasi sampai temperatur turun ke batas aman (<150°C)." },
      { step: 7, title: "Tutup Valve Boiler", description: "Tutup semua valve boiler secara bertahap setelah tekanan turun ke 0. Buka drain valve untuk mengosongkan sistem dari air dan uap sisa." },
      { step: 8, title: "Stop Auxiliary", description: "Stop auxiliary system secara berurutan setelah temperatur turun ke batas aman: cooling water pump, seal oil pump, lube oil pump (terakhir, setelah turbin benar-benar berhenti)." },
      { step: 9, title: "Isolasi Sistem", description: "Isolasi semua sistem dan pasang tag/lock (LOTO - Lock Out Tag Out) sesuai prosedur keselamatan. Dokumentasikan semua tindakan dalam log book." }
    ]
  },
  adminPassword: "admin123"
};
