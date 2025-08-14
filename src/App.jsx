import React, { useMemo, useState } from "react";
import "./App.css";
import { motion } from "framer-motion"; 
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Search,
  PackageCheck,
  PackageX,
  AlertTriangle,
  Plus,
  Filter,
  Settings,
  Download,
  Upload,
  Warehouse,
  Box,
  ShoppingCart,
  Layers,
  FileBarChart2,
  LogOut,
  X,
} from "lucide-react";

// Basit Modal bileşeni
function Modal({ title, open, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__dialog" role="document">
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="btn btn--ghost" aria-label="Kapat" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        <div className="modal__footer">{footer}</div>
      </div>
    </div>
  );
}

// Basit UI bileşenleri (CSS ile stillenir)
function Button({ className = "", variant = "default", children, ...props }) {
  return (
    <button className={`btn ${variant ? `btn--${variant}` : ""} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ className = "", children }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function CardHeader({ title, right }) {
  return (
    <div className="card__header">
      <div className="card__title">{title}</div>
      <div>{right}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="stat">
      <div className="stat__icon"><Icon className="icon" /></div>
      <div className="stat__body">
        <div className="stat__label">{label}</div>
        <div className="stat__value">{value}</div>
        {sub && <div className="stat__sub">{sub}</div>}
      </div>
    </div>
  );
}

// --- MOCK DATA ---
const MOCK_ITEMS = [
  { id: "SKU-1001", name: "Kadın Sneaker",        category: "Ayakkabı",     stock: 42, reorderPoint: 20, location: "Depo-1", incoming: 50, price: 1299, cost: 850 },
  { id: "SKU-1002", name: "Omuz Çantası - Deri",  category: "Omuz Çantası", stock: 12, reorderPoint: 25, location: "Depo-2", incoming: 0,  price: 899,  cost: 520 },
  { id: "SKU-1003", name: "Okul Çantası 30L",     category: "Okul Çantası", stock: 0,  reorderPoint: 15, location: "Depo-1", incoming: 80, price: 749,  cost: 430 },
  { id: "SKU-1004", name: "Erkek Eşofman Altı",   category: "Eşofman",      stock: 18, reorderPoint: 12, location: "Depo-3", incoming: 0,  price: 499,  cost: 260 },
  { id: "SKU-1005", name: "Çorap 3'lü Paket",     category: "Aksesuar",     stock: 75, reorderPoint: 30, location: "Depo-2", incoming: 0,  price: 129,  cost: 60  },
];


const CATEGORIES = ["Ayakkabı", "Omuz Çantası", "Okul Çantası", "Eşofman", "Aksesuar"];


export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Hepsi");
  const [onlyLow, setOnlyLow] = useState(false);
  const [items, setItems] = useState(MOCK_ITEMS);

  // Sidebar menüsü
  const NAV_ITEMS = [
    { icon: FileBarChart2, label: "Dashboard",     key: "dashboard" },
    { icon: Layers,       label: "Ürünler",       key: "products"  },
    { icon: Plus,         label: "Ürün Ekle",     key: "create"    },
    { icon: PackageCheck, label: "Stok Güncelle", key: "stock"     },
    { icon: FileBarChart2,label: "Raporlar",      key: "reports"   },
    { icon: Settings,     label: "Ayarlar",       key: "settings"  },
  ];
  const [active, setActive] = useState("dashboard");

  // Ürün Ekle modalı & formu
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Aksesuar",
    location: "Depo-1",
    unit: "adet",
    stock: 0,
    reorderPoint: 10,
    price: 0,
    cost: 0,
    barcode: ""
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ürün adı gerekli";
    if (!form.category) e.category = "Kategori gerekli";
    if (!form.location) e.location = "Lokasyon gerekli";
    if (form.stock < 0) e.stock = "Stok negatif olamaz";
    if (form.reorderPoint < 0) e.reorderPoint = "ROP negatif olamaz";
    if (form.price < 0) e.price = "Fiyat negatif olamaz";
    if (form.cost < 0) e.cost = "Maliyet negatif olamaz";
    return e;
  }

  function handleAddSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // Benzersiz SKU türet
    const base = form.name.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6) || "SKU";
    let idx = 1; 
    let sku = `${base}-${String(items.length + idx).padStart(4, "0")}`;
    while (items.some(i => i.id === sku)) { 
      idx++; 
      sku = `${base}-${String(items.length + idx).padStart(4, "0")}`; 
    }

    const newItem = {
      id: sku,
      name: form.name.trim(),
      category: form.category,
      location: form.location,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      reorderPoint: Number(form.reorderPoint) || 0,
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      incoming: 0,
      barcode: form.barcode,
      createdAt: new Date().toISOString(),
    };

    setItems(prev => [newItem, ...prev]);
    setAddOpen(false);
    setForm({ name: "", category: "Aksesuar", location: "Depo-1", unit: "adet", stock: 0, reorderPoint: 10, price: 0, cost: 0, barcode: "" });
  }

  // Çıkış işlemi
  function handleExit() {
    try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
    if (window?.electron?.quitApp) { window.electron.quitApp(); return; }
    if (window?.electronAPI?.quit) { window.electronAPI.quit(); return; }
    window.open('', '_self');
    window.close();
    window.location.replace('about:blank');
  }

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchQuery = [it.id, it.name, it.category, it.location].some((f) =>
        f.toLowerCase().includes(query.toLowerCase())
      );
      const matchCat = category === "Hepsi" || it.category === category;
      const matchLow = !onlyLow || it.stock <= it.reorderPoint;
      return matchQuery && matchCat && matchLow;
    });
  }, [items, query, category, onlyLow]);

  const totalSku = items.length;
  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const lowStock = items.filter((i) => i.stock > 0 && i.stock <= i.reorderPoint).length;
  const outStock = items.filter((i) => i.stock === 0).length;
  const totalValue = items.reduce((s, i) => s + i.stock * (i.cost ?? i.price ?? 0), 0);

  const chartData = useMemo(() => {
    return CATEGORIES.map((c) => {
      const inCat = items.filter((i) => i.category === c);
      const total = inCat.reduce((s, i) => s + i.stock, 0);
      const need = inCat.reduce((s, i) => s + Math.max(0, i.reorderPoint - i.stock), 0);
      return { category: c, Stok: total, "Eksik (İhtiyaç)": need };
    });
  }, [items]);

  function exportCSV() {
    const header = ["id", "name", "category", "stock", "reorderPoint", "location", "incoming", "price", "cost"].join(",");
    const rows = items
      .map((i) => [i.id, i.name, i.category, i.stock, i.reorderPoint, i.location, i.incoming, i.price ?? "", i.cost ?? ""].join(","))
      .join("\n");
    const csv = header + "\n" + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stoklar.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__icon"><Warehouse className="icon" /></div>
          <div className="brand__title">Stok Takip</div>
        </div>
        <nav className="nav">
          {NAV_ITEMS.map((m) => (
            <button
              key={m.key}
              className={`nav-item ${active === m.key ? "nav-item--active" : ""}`}
              onClick={() => {
                if (m.key === "create") { setAddOpen(true); return; }
                setActive(m.key);
              }}
            >
              <m.icon className="icon" />
              <span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">v1.0.0</div>
      </aside>

      {/* TOP NAVBAR */}
      <header className="navbar">
        <div className="navbar__title">Stok Takip Sistemi</div>
        <div className="navbar__right">
          <div className="badge">Admin</div>
          {/* Üstte ekstra \"Yeni Ürün\" butonu vermiyoruz; sidebar'dan açılıyor */}
          <Button variant="primary" className="inline-flex gap-2" onClick={handleExit}>
            <LogOut className="icon" /> Çıkış
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        <div className="container">
          {/* FİLTRE BAR */}
          <Card>
            <div className="filter-bar">
              <div className="search">
                <Search className="icon search__icon" />
                <input className="input search__input" placeholder="SKU, ürün adı, kategori, lokasyon ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="filter-actions">
                <select className="input select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Hepsi</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <label className="checkbox">
                  <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
                  <span>Sadece kritik stok</span>
                </label>
                <Button className="inline-flex gap-2"><Filter className="icon" /> Gelişmiş Filtreler</Button>
                <Button className="inline-flex gap-2" onClick={exportCSV}><Download className="icon" /> Dışa Aktar</Button>
              </div>
            </div>
          </Card>

          {/* İSTATİSTİK KARTLARI */}
          <section className="stats-grid">
            <Card><Stat icon={Box} label="Toplam Ürün" value={totalSku} sub="↑ %12" /></Card>
            <Card><Stat icon={ShoppingCart} label="Toplam Stok" value={totalStock} sub="↑ %8" /></Card>
            <Card><Stat icon={AlertTriangle} label="Düşük Stok" value={lowStock + outStock} sub={`kritik: ${lowStock}, stoksuz: ${outStock}`} /></Card>
            <Card><Stat icon={FileBarChart2} label="Toplam Değer" value={`₺${totalValue.toLocaleString("tr-TR")}`} sub="Maliyet esaslı" /></Card>
          </section>

          {/* UYARILAR & SON EKLENENLER & GRAFİK */}
          <section className="grid-3">
            <Card>
              <CardHeader title="Düşük Stok Uyarıları" />
              <div className="card__body">
                {items.filter((i) => i.stock <= i.reorderPoint).length === 0 ? (
                  <div className="empty">Tüm ürünlerde yeterli stok bulunuyor!</div>
                ) : (
                  <ul className="list">
                    {items
                      .filter((i) => i.stock <= i.reorderPoint)
                      .map((i) => (
                        <li key={i.id} className="list__item">
                          <div>
                            <div className="list__title">{i.name}</div>
                            <div className="muted">{i.id} • ROP: {i.reorderPoint} • Stok: {i.stock}</div>
                          </div>
                          {i.incoming > 0 ? (
                            <span className="chip chip--soft">Yolda: {i.incoming}</span>
                          ) : (
                            <span className="chip chip--danger">Sipariş gerekli</span>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Son Eklenen Ürünler" />
              <div className="card__body">
                <ul className="list list--plain">
                  {items.slice(0, 5).map((i) => (
                    <li key={i.id} className="list__item list__item--plain">
                      <div>
                        <div className="list__title">{i.name}</div>
                        <div className="muted">{new Date(i.createdAt || Date.now()).toLocaleDateString("tr-TR")}</div>
                      </div>
                      <div className="price">₺{i.price}</div>
                    </li>
                  ))}
                </ul>
                <div className="link">Tüm ürünleri görüntüle →</div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Kategori Bazlı Stok & İhtiyaç" />
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} />
                    <Bar dataKey="Stok" fill="#ff6a00" />
                    <Bar dataKey="Eksik (İhtiyaç)" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          {/* HIZLI İŞLEMLER */}
          <section className="quick-actions">
            {[{title: "Yeni Ürün Ekle", desc: "Stok sistemine yeni ürün ekleyin", icon: Plus}, {title: "Stok Güncelle", desc: "Mevcut stok miktarlarını güncelleyin", icon: PackageCheck}, {title: "Raporları Görüntüle", desc: "Detaylı stok raporlarını inceleyin", icon: FileBarChart2}].map(({title, desc, icon: I}, idx) => (
              <Card key={title}>
                <button className={`quick ${idx===0 ? "quick--accent" : ""}`} onClick={() => idx===0 ? setAddOpen(true) : null}>
                  <div className="quick__icon"><I className="icon" /></div>
                  <div>
                    <div className="quick__title">{title}</div>
                    <div className="muted">{desc}</div>
                  </div>
                </button>
              </Card>
            ))}
          </section>
        </div>

        {/* ÜRÜN EKLE MODAL */}
        <Modal
          title="Yeni Ürün Ekle"
          open={addOpen}
          onClose={() => setAddOpen(false)}
          footer={
            <div className="modal__actions">
              <Button onClick={() => setAddOpen(false)}>Vazgeç</Button>
              <Button variant="primary" onClick={handleAddSubmit}>Kaydet</Button>
            </div>
          }
        >
          <div className="form-grid">
            <label className="form-row">
              <span>Ürün Adı</span>
              <input className={`input ${errors.name ? "input--error" : ""}`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              {errors.name && <div className="error">{errors.name}</div>}
            </label>

            <label className="form-row">
              <span>Kategori</span>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>

            <label className="form-row">
              <span>Lokasyon</span>
              <select className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                <option>Depo-1</option>
                <option>Depo-2</option>
                <option>Depo-3</option>
              </select>
            </label>

            <label className="form-row">
              <span>Birim</span>
              <select className="input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                <option>adet</option>
                <option>kutu</option>
                <option>paket</option>
              </select>
            </label>

            <label className="form-row">
              <span>Başlangıç Stok</span>
              <input type="number" className={`input ${errors.stock ? "input--error" : ""}`} value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              {errors.stock && <div className="error">{errors.stock}</div>}
            </label>

            <label className="form-row">
              <span>ROP</span>
              <input type="number" className={`input ${errors.reorderPoint ? "input--error" : ""}`} value={form.reorderPoint} onChange={e => setForm({...form, reorderPoint: e.target.value})} />
              {errors.reorderPoint && <div className="error">{errors.reorderPoint}</div>}
            </label>

            <label className="form-row">
              <span>Satış Fiyatı (₺)</span>
              <input type="number" className={`input ${errors.price ? "input--error" : ""}`} value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              {errors.price && <div className="error">{errors.price}</div>}
            </label>

            <label className="form-row">
              <span>Maliyet (₺)</span>
              <input type="number" className={`input ${errors.cost ? "input--error" : ""}`} value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
              {errors.cost && <div className="error">{errors.cost}</div>}
            </label>

            <label className="form-row form-row--full">
              <span>Barkod / SKU Notu</span>
              <input className="input" value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} placeholder="Barkod veya kısa not" />
            </label>
          </div>
        </Modal>
      </main>
    </div>
  );
}