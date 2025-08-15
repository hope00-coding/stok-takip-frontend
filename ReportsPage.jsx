import React, { useState, useEffect } from 'react';
import { FiBarChart, FiPieChart, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { productsAPI } from '../services/api';

const ReportsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('stock');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stok miktarına göre ürünler (Bar Chart)
  const stockData = products
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      stok: product.quantity,
      kategori: product.category
    }));

  // Kategori bazında ürün sayısı (Pie Chart)
  const categoryData = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count
  }));

  // Stok değeri bazında ürünler
  const valueData = products
    .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
    .slice(0, 10)
    .map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      değer: (product.price * product.quantity).toFixed(2),
      kategori: product.category
    }));

  // Düşük stok ürünleri
  const lowStockProducts = products.filter(product => product.quantity < 10);

  // Toplam istatistikler
  const totalStats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, product) => sum + product.quantity, 0),
    totalValue: products.reduce((sum, product) => sum + (product.price * product.quantity), 0),
    lowStockCount: lowStockProducts.length,
    averagePrice: products.length > 0 ? (products.reduce((sum, product) => sum + product.price, 0) / products.length).toFixed(2) : 0
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  const exportChartData = () => {
    let dataToExport = [];
    
    switch (selectedChart) {
      case 'stock':
        dataToExport = stockData;
        break;
      case 'category':
        dataToExport = pieData;
        break;
      case 'value':
        dataToExport = valueData;
        break;
      default:
        dataToExport = stockData;
    }

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapor_${selectedChart}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-600">Stok sisteminizin detaylı analizi ve raporları</p>
        </div>
        <button
          onClick={exportChartData}
          className="btn btn-outline flex items-center space-x-2"
        >
          <FiDownload className="h-5 w-5" />
          <span>Veri İndir</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiBarChart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Stok</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalStock.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiPieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Değer</p>
              <p className="text-2xl font-bold text-gray-900">₺{totalStats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-red-500">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FiBarChart className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Düşük Stok</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiTrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ortalama Fiyat</p>
              <p className="text-2xl font-bold text-gray-900">₺{totalStats.averagePrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Grafik Türü:</label>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="stock">Stok Miktarı</option>
              <option value="category">Kategori Dağılımı</option>
              <option value="value">Stok Değeri</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Zaman Aralığı:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Hafta</option>
              <option value="month">Ay</option>
              <option value="quarter">Çeyrek</option>
              <option value="year">Yıl</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedChart === 'stock' && 'En Yüksek Stok Miktarına Sahip Ürünler'}
            {selectedChart === 'category' && 'Kategori Bazında Ürün Dağılımı'}
            {selectedChart === 'value' && 'En Yüksek Stok Değerine Sahip Ürünler'}
          </h3>
          
          <ResponsiveContainer width="100%" height={400}>
            {selectedChart === 'stock' && (
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stok" fill="#3b82f6" />
              </BarChart>
            )}
            
            {selectedChart === 'category' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
            
            {selectedChart === 'value' && (
              <BarChart data={valueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="değer" fill="#10b981" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Additional Info */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiBarChart className="h-5 w-5 text-red-500 mr-2" />
              Düşük Stok Uyarıları
            </h3>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{product.quantity}</p>
                      <p className="text-xs text-gray-500">adet kaldı</p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{lowStockProducts.length - 5} ürün daha...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiTrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Tüm ürünlerde yeterli stok bulunuyor!</p>
              </div>
            )}
          </div>

          {/* Category Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiPieChart className="h-5 w-5 text-blue-500 mr-2" />
              Kategori Özeti
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-semibold text-gray-900">{count} ürün</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 