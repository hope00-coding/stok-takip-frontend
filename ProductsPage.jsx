import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiDownload, FiFilter } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      showAlert('error', 'Ürünler yüklenirken hata oluştu');
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const response = await productsAPI.create(productData);
      setProducts(prev => [...prev, response.data]);
      setShowAddModal(false);
      showAlert('success', 'Ürün başarıyla eklendi');
    } catch (error) {
      showAlert('error', 'Ürün eklenirken hata oluştu');
      console.error('Ürün eklenemedi:', error);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      const response = await productsAPI.update(editingProduct.id, productData);
      setProducts(prev => 
        prev.map(product => 
          product.id === editingProduct.id ? response.data : product
        )
      );
      setEditingProduct(null);
      showAlert('success', 'Ürün başarıyla güncellendi');
    } catch (error) {
      showAlert('error', 'Ürün güncellenirken hata oluştu');
      console.error('Ürün güncellenemedi:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await productsAPI.delete(productId);
        setProducts(prev => prev.filter(product => product.id !== productId));
        showAlert('success', 'Ürün başarıyla silindi');
      } catch (error) {
        showAlert('error', 'Ürün silinirken hata oluştu');
        console.error('Ürün silinemedi:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Ürün Adı', 'Kategori', 'Stok', 'Fiyat', 'SKU', 'Son Güncelleme'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        product.category,
        product.quantity,
        product.price,
        product.sku,
        new Date(product.createdAt).toLocaleDateString('tr-TR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `urunler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Ürünler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Ürün Yönetimi</h1>
          <p className="text-gray-400">Stok sistemindeki tüm ürünleri yönetin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <FiPlus className="h-5 w-5" />
          <span>Yeni Ürün</span>
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="form-group">
              <input
                type="text"
                placeholder="Ürün adı veya SKU ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="btn btn-secondary"
              title="CSV olarak indir"
            >
              <FiDownload className="h-5 w-5" />
              <span className="hidden md:inline">CSV İndir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDeleteProduct}
          />
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <div className="modal-content">
            <h2 className="text-xl font-semibold mb-4">Yeni Ürün Ekle</h2>
            <ProductForm
              onSubmit={handleAddProduct}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal onClose={() => setEditingProduct(null)}>
          <div className="modal-content">
            <h2 className="text-xl font-semibold mb-4">Ürün Düzenle</h2>
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </Modal>
      )}

      {/* Alert */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: '', message: '' })}
        />
      )}
    </div>
  );
};

export default ProductsPage; 