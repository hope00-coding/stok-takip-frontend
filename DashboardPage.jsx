import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPackage, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiDollarSign,
  FiShoppingCart
} from 'react-icons/fi';
import { productsAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    totalValue: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      const products = response.data;

      // İstatistikleri hesapla
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
      const lowStockProducts = products.filter(product => product.quantity < 10).length;
      const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

      setStats({
        totalProducts,
        totalStock,
        lowStockProducts,
        totalValue
      });

      // Düşük stok ürünleri
      setLowStockProducts(
        products
          .filter(product => product.quantity < 10)
          .sort((a, b) => a.quantity - b.quantity)
          .slice(0, 5)
      );

      // Son eklenen ürünler
      setRecentProducts(
        products
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );

    } catch (error) {
      console.error('Dashboard verisi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#ffffff' }}>{value}</p>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
              {changeType === 'up' ? (
                <FiArrowUp style={{ height: '1rem', width: '1rem', color: '#34d399', marginRight: '0.25rem' }} />
              ) : (
                <FiArrowDown style={{ height: '1rem', width: '1rem', color: '#f87171', marginRight: '0.25rem' }} />
              )}
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: changeType === 'up' ? '#34d399' : '#f87171' 
              }}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: '9999px', 
          background: color === 'bg-blue-500' ? '#3b82f6' : 
                     color === 'bg-green-500' ? '#10b981' : 
                     color === 'bg-red-500' ? '#ef4444' : 
                     color === 'bg-purple-500' ? '#8b5cf6' : '#6b7280'
        }}>
          <Icon style={{ height: '2rem', width: '2rem', color: '#ffffff' }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Dashboard yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={FiPackage}
          color="bg-blue-500"
          change="+12%"
          changeType="up"
        />
        <StatCard
          title="Toplam Stok"
          value={stats.totalStock.toLocaleString()}
          icon={FiShoppingCart}
          color="bg-green-500"
          change="+8%"
          changeType="up"
        />
        <StatCard
          title="Düşük Stok"
          value={stats.lowStockProducts}
          icon={FiAlertTriangle}
          color="bg-red-500"
          change="+3"
          changeType="up"
        />
        <StatCard
          title="Toplam Değer"
          value={`₺${stats.totalValue.toLocaleString()}`}
          icon={FiDollarSign}
          color="bg-purple-500"
          change="+15%"
          changeType="up"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Düşük Stok Uyarıları */}
        <div className="card">
          <div style={{ borderBottom: '1px solid #4b5563', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <FiAlertTriangle style={{ height: '1.25rem', width: '1.25rem', color: '#f87171', marginRight: '0.5rem' }} />
              Düşük Stok Uyarıları
            </h3>
          </div>
          <div>
            {lowStockProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {lowStockProducts.map((product) => (
                  <div key={product.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem', 
                    background: 'rgba(127, 29, 29, 0.2)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid rgba(239, 68, 68, 0.3)' 
                  }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#ffffff' }}>{product.name}</p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{product.category}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f87171' }}>{product.quantity}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>adet kaldı</p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/products"
                  className="modern-link"
                  style={{ display: 'block', textAlign: 'center' }}
                >
                  Tüm ürünleri görüntüle →
                </Link>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <FiTrendingUp style={{ height: '3rem', width: '3rem', color: '#34d399', margin: '0 auto 1rem auto' }} />
                <p style={{ color: '#9ca3af' }}>Tüm ürünlerde yeterli stok bulunuyor!</p>
              </div>
            )}
          </div>
        </div>

        {/* Son Eklenen Ürünler */}
        <div className="card">
          <div style={{ borderBottom: '1px solid #4b5563', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <FiPackage style={{ height: '1.25rem', width: '1.25rem', color: '#60a5fa', marginRight: '0.5rem' }} />
              Son Eklenen Ürünler
            </h3>
          </div>
          <div>
            {recentProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentProducts.map((product) => (
                  <div key={product.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem', 
                    background: 'rgba(55, 65, 81, 0.3)', 
                    borderRadius: '0.5rem',
                    transition: 'background-color 0.2s'
                  }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#ffffff' }}>{product.name}</p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#ffffff' }}>₺{product.price}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{product.quantity} adet</p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/products"
                  className="modern-link"
                  style={{ display: 'block', textAlign: 'center' }}
                >
                  Tüm ürünleri görüntüle →
                </Link>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <FiPackage style={{ height: '3rem', width: '3rem', color: '#9ca3af', margin: '0 auto 1rem auto' }} />
                <p style={{ color: '#9ca3af' }}>Henüz ürün eklenmemiş</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Hızlı İşlemler</h3>
        <div className="grid grid-cols-3 gap-4">
          <Link
            to="/products/add"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1rem', 
              background: 'rgba(30, 58, 138, 0.2)', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
          >
            <FiPlus style={{ height: '1.5rem', width: '1.5rem', color: '#60a5fa', marginRight: '0.75rem' }} />
            <div>
              <p style={{ fontWeight: '500', color: '#93c5fd' }}>Yeni Ürün Ekle</p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(147, 197, 253, 0.7)' }}>Stok sistemine yeni ürün ekleyin</p>
            </div>
          </Link>
          
          <Link
            to="/stock-update"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1rem', 
              background: 'rgba(6, 78, 59, 0.2)', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(34, 197, 94, 0.3)',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
          >
            <FiTrendingUp style={{ height: '1.5rem', width: '1.5rem', color: '#34d399', marginRight: '0.75rem' }} />
            <div>
              <p style={{ fontWeight: '500', color: '#6ee7b7' }}>Stok Güncelle</p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(110, 231, 183, 0.7)' }}>Mevcut stok miktarlarını güncelleyin</p>
            </div>
          </Link>
          
          <Link
            to="/reports"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1rem', 
              background: 'rgba(88, 28, 135, 0.2)', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
          >
            <FiDollarSign style={{ height: '1.5rem', width: '1.5rem', color: '#a78bfa', marginRight: '0.75rem' }} />
            <div>
              <p style={{ fontWeight: '500', color: '#c4b5fd' }}>Raporları Görüntüle</p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(196, 181, 253, 0.7)' }}>Detaylı stok raporlarını inceleyin</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 