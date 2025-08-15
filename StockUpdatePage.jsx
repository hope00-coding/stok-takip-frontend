import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiMinus, FiSave, FiRotateCcw } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import Alert from '../components/Alert';

const StockUpdatePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockChanges, setStockChanges] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      
      // Stok değişikliklerini sıfırla
      const initialChanges = {};
      response.data.forEach(product => {
        initialChanges[product.id] = 0;
      });
      setStockChanges(initialChanges);
    } catch (error) {
      showAlert('error', 'Ürünler yüklenirken hata oluştu');
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId, change) => {
    setStockChanges(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + change
    }));
  };

  const handleQuantityInput = (productId, value) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const change = parseInt(value) - product.quantity;
      setStockChanges(prev => ({
        ...prev,
        [productId]: change
      }));
    }
  };

  const updateStock = async (productId) => {
    const change = stockChanges[productId];
    if (change === 0) return;

    try {
      setUpdating(true);
      const product = products.find(p => p.id === productId);
      const newQuantity = product.quantity + change;
      
      if (newQuantity < 0) {
        showAlert('error', 'Stok miktarı 0\'ın altına düşemez');
        return;
      }

      await productsAPI.updateQuantity(productId, newQuantity);
      
      // Ürün listesini güncelle
      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, quantity: newQuantity, lastUpdated: new Date().toISOString() }
            : p
        )
      );
      
      // Stok değişikliğini sıfırla
      setStockChanges(prev => ({
        ...prev,
        [productId]: 0
      }));
      
      showAlert('success', `${product.name} stok miktarı güncellendi`);
    } catch (error) {
      showAlert('error', 'Stok güncellenirken hata oluştu');
      console.error('Stok güncellenemedi:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateAllStock = async () => {
    const productsToUpdate = Object.entries(stockChanges)
      .filter(([_, change]) => change !== 0)
      .map(([productId, change]) => ({ productId: parseInt(productId), change }));

    if (productsToUpdate.length === 0) {
      showAlert('warning', 'Güncellenecek stok bulunamadı');
      return;
    }

    try {
      setUpdating(true);
      
      for (const { productId, change } of productsToUpdate) {
        const product = products.find(p => p.id === productId);
        const newQuantity = product.quantity + change;
        
        if (newQuantity < 0) {
          showAlert('error', `${product.name} için stok miktarı 0'ın altına düşemez`);
          return;
        }
        
        await productsAPI.updateQuantity(productId, newQuantity);
      }
      
      // Tüm ürünleri yeniden yükle
      await fetchProducts();
      showAlert('success', 'Tüm stok miktarları başarıyla güncellendi');
    } catch (error) {
      showAlert('error', 'Stok güncellenirken hata oluştu');
      console.error('Toplu stok güncelleme hatası:', error);
    } finally {
      setUpdating(false);
    }
  };

  const resetChanges = () => {
    const initialChanges = {};
    products.forEach(product => {
      initialChanges[product.id] = 0;
    });
    setStockChanges(initialChanges);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const hasChanges = Object.values(stockChanges).some(change => change !== 0);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stok Güncelleme</h1>
          <p className="text-gray-600">Ürün stok miktarlarını artırın veya azaltın</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetChanges}
            className="btn btn-outline flex items-center space-x-2"
            disabled={!hasChanges}
          >
            <FiRotateCcw className="h-5 w-5" />
            <span>Değişiklikleri Sıfırla</span>
          </button>
          <button
            onClick={updateAllStock}
            className="btn btn-success flex items-center space-x-2"
            disabled={!hasChanges || updating}
          >
            {updating ? (
              <div className="spinner w-5 h-5"></div>
            ) : (
              <FiSave className="h-5 w-5" />
            )}
            <span>Tümünü Güncelle</span>
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: '', message: '' })}
          show={alert.show}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              {[...new Set(products.map(p => p.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const change = stockChanges[product.id] || 0;
          const newQuantity = product.quantity + change;
          const isLowStock = newQuantity < 10;
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{product.quantity}</p>
                  <p className="text-sm text-gray-500">mevcut stok</p>
                </div>
              </div>

              {/* Stock Controls */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStockChange(product.id, -1)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    disabled={updating}
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                  
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => handleQuantityInput(product.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    disabled={updating}
                  />
                  
                  <button
                    onClick={() => handleStockChange(product.id, 1)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    disabled={updating}
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>

                {/* Change Display */}
                {change !== 0 && (
                  <div className={`text-center p-2 rounded-lg ${
                    change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-medium">
                      {change > 0 ? '+' : ''}{change} adet
                    </span>
                  </div>
                )}

                {/* New Quantity Preview */}
                {change !== 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Yeni stok:</p>
                    <p className={`text-lg font-bold ${
                      isLowStock ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {newQuantity} adet
                    </p>
                    {isLowStock && (
                      <p className="text-xs text-red-600">Düşük stok uyarısı!</p>
                    )}
                  </div>
                )}

                {/* Update Button */}
                {change !== 0 && (
                  <button
                    onClick={() => updateStock(product.id)}
                    className="w-full btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? (
                      <div className="spinner w-4 h-4"></div>
                    ) : (
                      <FiSave className="h-4 w-4" />
                    )}
                    Güncelle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Ürün bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default StockUpdatePage; 