import React, { useEffect, useMemo, useState } from "react";
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

import { listProducts, createProduct, deleteProduct, patchProductStock } from "./api/products.js";

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

// Card bileşenleri
function Card({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ title, children }) {
  return (
    <div className="card__header">
      <div className="card__title">{title}</div>
      {children && <div className="card__actions">{children}</div>}
    </div>
  );
}

// Button bileşeni
function Button({ children, variant = "primary", size = "md", onClick, className = "", disabled, ...props }) {
  const baseClass = "btn";
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function App() {
  const [active, setActive] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Arama/filtre state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hepsi");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Modal state'leri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Stok güncelleme için state'ler
  const [selectedProductForStock, setSelectedProductForStock] = useState("");
  const [stockDelta, setStockDelta] = useState("");
  const [stockNote, setStockNote] = useState("");

  // Form state'leri
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    cost: "",
    price: "",
    stock: "",
    reorderPoint: "",
    location: "",
    unit: "Adet",
    barcode: "",
  });

  // Veri yükleme
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await listProducts(searchTerm, selectedCategory, showOnlyLowStock);
      setItems(products);
    } catch (err) {
      setError(err.message);
      console.error("Ürünler yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadProducts();
  }, []);

  // Arama/filtre değişikliklerinde yeniden yükle
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, showOnlyLowStock]);

  // Kategoriler (dinamik)
  const categories = useMemo(() => {
    const cats = ["Hepsi", ...new Set(items.map(item => item.category).filter(Boolean))];
    return cats;
  }, [items]);

  // Ürün ekleme
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...newProduct,
        cost: parseFloat(newProduct.cost) || 0,
        price: parseFloat(newProduct.price) || 0,
        stock: parseInt(newProduct.stock) || 0,
        reorderPoint: parseInt(newProduct.reorderPoint) || 0,
      };

      await createProduct(productData);
      
      // Başarı durumunda modal'ı kapat ve listeyi yenile
      setIsAddModalOpen(false);
      setNewProduct({
        name: "",
        category: "",
        cost: "",
        price: "",
        stock: "",
        reorderPoint: "",
        location: "",
        unit: "Adet",
        barcode: "",
      });
      await loadProducts();
    } catch (error) {
      console.error("Ürün eklenirken hata:", error);
      alert("Ürün eklenirken hata oluştu: " + error.message);
    }
  };

  // Stok güncelleme
  const handleStockUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedProductForStock || !stockDelta) {
      alert("Lütfen ürün ve miktar seçin");
      return;
    }

    try {
      const delta = parseInt(stockDelta);
      if (isNaN(delta)) {
        alert("Geçerli bir miktar girin");
        return;
      }

      await patchProductStock(selectedProductForStock, {
        delta: delta,
        note: stockNote || undefined
      });

      // Başarı durumunda modal'ı kapat ve listeyi yenile
      setIsStockModalOpen(false);
      setSelectedProductForStock("");
      setStockDelta("");
      setStockNote("");
      await loadProducts();
    } catch (error) {
      console.error("Stok güncellenirken hata:", error);
      alert("Stok güncellenirken hata oluştu: " + error.message);
    }
  };

  // Ürün silme
  const handleDeleteProduct = async (productId) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      await loadProducts(); // Listeyi yenile
    } catch (error) {
      console.error("Ürün silinirken hata:", error);
      alert("Ürün silinirken hata oluştu: " + error.message);
    }
  };

  // Hesaplanan değerler
  const totalProducts = items.length;
  const totalStock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
  const lowStockItems = items.filter(item => item.stock <= (item.reorderPoint || 0));
  const criticalStockItems = items.filter(item => item.stock === 0);
  const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * (item.stock || 0), 0);

  // Grafik verisi
  const chartData = useMemo(() => {
    const categoryData = {};
    items.forEach(item => {
      const cat = item.category || "Diğer";
      if (!categoryData[cat]) {
        categoryData[cat] = { category: cat, stok: 0, ihtiyac: 0 };
      }
      categoryData[cat].stok += item.stock || 0;
      categoryData[cat].ihtiyac += Math.max(0, (item.reorderPoint || 0) - (item.stock || 0));
    });
    return Object.values(categoryData);
  }, [items]);

  const renderContent = () => {
    if (active === "dashboard") {
      return (
        <div className="content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <div className="page-actions">
              <Button onClick={() => setIsStockModalOpen(true)}>
                <Upload className="icon" />
                Stok Güncelle
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="icon" />
                Yeni Ürün Ekle
              </Button>
            </div>
          </div>

          {loading && <div className="loading">Yükleniyor...</div>}
          {error && <div className="error">Hata: {error}</div>}

          <div className="stats">
            <Card>
              <div className="stat">
                <div className="stat__icon stat__icon--primary">
                  <Box className="icon" />
                </div>
                <div className="stat__data">
                  <div className="stat__value">{totalProducts}</div>
                  <div className="stat__label">Toplam Ürün</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="stat">
                <div className="stat__icon stat__icon--success">
                  <PackageCheck className="icon" />
                </div>
                <div className="stat__data">
                  <div className="stat__value">{totalStock}</div>
                  <div className="stat__label">Toplam Stok</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="stat">
                <div className="stat__icon stat__icon--warning">
                  <AlertTriangle className="icon" />
                </div>
                <div className="stat__data">
                  <div className="stat__value">{lowStockItems.length}</div>
                  <div className="stat__label">Düşük Stok</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="stat">
                <div className="stat__icon stat__icon--danger">
                  <PackageX className="icon" />
                </div>
                <div className="stat__data">
                  <div className="stat__value">{criticalStockItems.length}</div>
                  <div className="stat__label">Kritik Stok</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="stat">
                <div className="stat__icon stat__icon--info">
                  <ShoppingCart className="icon" />
                </div>
                <div className="stat__data">
                  <div className="stat__value">₺{totalValue.toLocaleString("tr-TR")}</div>
                  <div className="stat__label">Toplam Değer</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid">
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
                <button 
                  className="link" 
                  onClick={() => setActive('products')}
                  style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)'}}
                >
                  Tüm ürünleri görüntüle →
                </button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Kategori Bazlı Stok & İhtiyaç" />
              <div className="chart">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stok" fill="var(--primary)" name="Mevcut Stok" />
                    <Bar dataKey="ihtiyac" fill="var(--danger)" name="İhtiyaç" />
                    <ReferenceLine y={0} stroke="#000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {lowStockItems.length > 0 && (
            <Card>
              <CardHeader title="Dikkat Edilmesi Gereken Ürünler" />
              <div className="card__body">
                <div className="alerts">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="alert alert--warning">
                      <AlertTriangle className="icon" />
                      <div>
                        <strong>{item.name}</strong> - Stok: {item.stock}, Minimum: {item.reorderPoint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      );
    }

    if (active === "products") {
      return (
        <div className="content">
          <div className="page-header">
            <h1 className="page-title">Ürünler</h1>
            <div className="page-actions">
              <Button variant="outline" onClick={() => setIsFiltersModalOpen(true)}>
                <Filter className="icon" />
                Gelişmiş Filtreler
              </Button>
              <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
                <Download className="icon" />
                CSV Dışa Aktar
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="icon" />
                Yeni Ürün Ekle
              </Button>
            </div>
          </div>

          <div className="filters">
            <div className="filter-group">
              <div className="search-box">
                <Search className="icon" />
                <input
                  type="text"
                  placeholder="Ürün ara (ID, isim, kategori, lokasyon...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={showOnlyLowStock}
                  onChange={(e) => setShowOnlyLowStock(e.target.checked)}
                />
                <span>Sadece kritik stok</span>
              </label>
            </div>
          </div>

          {loading && <div className="loading">Yükleniyor...</div>}
          {error && <div className="error">Hata: {error}</div>}

          <Card>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ürün Adı</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Min. Stok</th>
                    <th>Maliyet</th>
                    <th>Fiyat</th>
                    <th>Lokasyon</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={item.stock <= item.reorderPoint ? "text-danger" : ""}>
                          {item.stock}
                        </span>
                      </td>
                      <td>{item.reorderPoint}</td>
                      <td>₺{item.cost?.toLocaleString("tr-TR")}</td>
                      <td>₺{item.price?.toLocaleString("tr-TR")}</td>
                      <td>{item.location}</td>
                      <td>
                        <div className="action-buttons">
                          <Button size="sm" onClick={() => {
                            setSelectedProductForStock(item.id);
                            setIsStockModalOpen(true);
                          }}>
                            Stok
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteProduct(item.id)}>
                            Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      );
    }

    if (active === "reports") {
      return (
        <div className="content">
          <div className="page-header">
            <h1 className="page-title">Raporlar</h1>
          </div>

          <div className="reports-grid">
            <Card>
              <div className="report-item">
                <h3>Stok Raporu</h3>
                <p>Detaylı stok analizi ve trends</p>
                <Button variant="outline">Raporu Görüntüle</Button>
              </div>
            </Card>

            <Card>
              <div className="report-item">
                <h3>Satış Raporu</h3>
                <p>Satış performansı ve gelir analizi</p>
                <Button variant="outline">Raporu Görüntüle</Button>
              </div>
            </Card>

            <Card>
              <div className="report-item">
                <h3>Kategori Analizi</h3>
                <p>Kategori bazlı performans metrikleri</p>
                <Button variant="outline">Raporu Görüntüle</Button>
              </div>
            </Card>

            <Card>
              <div className="report-item">
                <h3>Kritik Stok Raporu</h3>
                <p>Düşük stok ve yeniden sipariş önerileri</p>
                <Button variant="outline">Raporu Görüntüle</Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (active === "settings") {
      return (
        <div className="content">
          <div className="page-header">
            <h1 className="page-title">Ayarlar</h1>
          </div>

          <Card>
            <CardHeader title="Genel Ayarlar" />
            <div className="card__body">
              <div className="settings-list">
                <div className="setting-item">
                  <label>Şirket Adı</label>
                  <input type="text" className="input" placeholder="Şirket adını girin" />
                </div>
                
                <div className="setting-item">
                  <label>Para Birimi</label>
                  <select className="select">
                    <option>TRY (₺)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <label>Kritik Stok Uyarı Eşiği</label>
                  <input type="number" className="input" placeholder="Varsayılan minimum stok" />
                </div>
                
                <div className="setting-item">
                  <label>Otomatik Yedekleme</label>
                  <label className="checkbox">
                    <input type="checkbox" />
                    <span>Günlük otomatik yedekleme aktif</span>
                  </label>
                </div>
              </div>
              
              <div style={{marginTop: '20px'}}>
                <Button>Ayarları Kaydet</Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return <div className="content">Sayfa bulunamadı</div>;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__icon">
            <Warehouse className="icon" />
          </div>
          <div className="brand__title">Stok Takip</div>
        </div>

        <nav className="nav">
          <button 
            className={`nav__item ${active === "dashboard" ? "nav__item--active" : ""}`}
            onClick={() => setActive("dashboard")}
          >
            <Layers className="icon" />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav__item ${active === "products" ? "nav__item--active" : ""}`}
            onClick={() => setActive("products")}
          >
            <Box className="icon" />
            <span>Ürünler</span>
          </button>
          <button 
            className={`nav__item ${active === "reports" ? "nav__item--active" : ""}`}
            onClick={() => setActive("reports")}
          >
            <FileBarChart2 className="icon" />
            <span>Raporlar</span>
          </button>
          <button 
            className={`nav__item ${active === "settings" ? "nav__item--active" : ""}`}
            onClick={() => setActive("settings")}
          >
            <Settings className="icon" />
            <span>Ayarlar</span>
          </button>
        </nav>

        <div className="sidebar__footer">
          <button className="nav__item">
            <LogOut className="icon" />
            <span>Çıkış</span>
          </button>
        </div>
      </aside>

      <main className="main">
        {renderContent()}
      </main>

      {/* Ürün Ekleme Modalı */}
      <Modal
        title="Yeni Ürün Ekle"
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddSubmit}>
              Ürün Ekle
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Ürün Adı *</label>
                <input
                  type="text"
                  className="input"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kategori *</label>
                <input
                  type="text"
                  className="input"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Maliyet</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, cost: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Satış Fiyatı</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Başlangıç Stok</label>
                <input
                  type="number"
                  className="input"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Minimum Stok</label>
                <input
                  type="number"
                  className="input"
                  value={newProduct.reorderPoint}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, reorderPoint: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lokasyon</label>
                <input
                  type="text"
                  className="input"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Birim</label>
                <select
                  className="select"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                >
                  <option value="Adet">Adet</option>
                  <option value="Kg">Kg</option>
                  <option value="Lt">Lt</option>
                  <option value="M">M</option>
                  <option value="Kutu">Kutu</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Barkod</label>
              <input
                type="text"
                className="input"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Stok Güncelle Modalı */}
      <Modal
        title="Stok Güncelle"
        open={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsStockModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleStockUpdate}>
              Güncelle
            </Button>
          </>
        }
      >
        <form onSubmit={handleStockUpdate}>
          <div className="form">
            <div className="form-group">
              <label>Ürün Seçin *</label>
              <select
                className="select"
                value={selectedProductForStock}
                onChange={(e) => setSelectedProductForStock(e.target.value)}
                required
              >
                <option value="">-- Ürün seçin --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Mevcut: {item.stock})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Stok Değişikliği *</label>
              <input
                type="number"
                className="input"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                placeholder="Örn: +10 (artış) veya -5 (azalış)"
                required
              />
              <small className="help-text">Pozitif sayı stok artışı, negatif sayı stok azalışı</small>
            </div>
            
            <div className="form-group">
              <label>Not</label>
              <textarea
                className="textarea"
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
                placeholder="Stok hareketi için not (opsiyonel)"
                rows="3"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Gelişmiş Filtreler Modalı */}
      <Modal
        title="Gelişmiş Filtreler"
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFiltersModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={() => setIsFiltersModalOpen(false)}>
              Filtreleri Uygula
            </Button>
          </>
        }
      >
        <div className="form">
          <div className="form-group">
            <label>Fiyat Aralığı</label>
            <div className="form-row">
              <input type="number" className="input" placeholder="Min fiyat" />
              <input type="number" className="input" placeholder="Max fiyat" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Stok Aralığı</label>
            <div className="form-row">
              <input type="number" className="input" placeholder="Min stok" />
              <input type="number" className="input" placeholder="Max stok" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Lokasyon</label>
            <input type="text" className="input" placeholder="Lokasyon ara" />
          </div>
          
          <div className="form-group">
            <label>Özel Durumlar</label>
            <div className="checkbox-group">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Sadece stoğu bitmiş ürünler</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" />
                <span>Sadece kritik stok seviyesindeki ürünler</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" />
                <span>Sadece yeni eklenen ürünler (son 7 gün)</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* CSV Dışa Aktar Modalı */}
      <Modal
        title="CSV Dışa Aktar"
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={() => {
              // CSV export logic burada olacak
              alert("CSV dışa aktarma özelliği yakında eklenecek!");
              setIsExportModalOpen(false);
            }}>
              Dışa Aktar
            </Button>
          </>
        }
      >
        <div className="form">
          <div className="form-group">
            <label>Dışa aktarılacak veriler</label>
            <div className="checkbox-group">
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span>Tüm ürün bilgileri</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span>Stok seviyeleri</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" />
                <span>Fiyat bilgileri</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" />
                <span>Lokasyon bilgileri</span>
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Dosya formatı</label>
            <select className="select">
              <option>CSV (Excel uyumlu)</option>
              <option>CSV (UTF-8)</option>
              <option>Tab-separated values</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;