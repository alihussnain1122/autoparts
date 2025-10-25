import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehiclesAPI, partsAPI, customersAPI, ordersAPI, transactionsAPI } from '../axios/api';
import Loading from '../components/Loading';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalParts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockParts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [vehiclesRes, partsRes, customersRes, ordersRes, transactionsRes] = await Promise.all([
        vehiclesAPI.getAll(),
        partsAPI.getAll(),
        customersAPI.getAll(),
        ordersAPI.getAll(period === 'all' ? null : period),
        transactionsAPI.getAll(period === 'all' ? null : period),
      ]);

      const lowStock = partsRes.data.filter(part => part.stock < 10).length;
      const totalRevenue = transactionsRes.data.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

      setStats({
        totalVehicles: vehiclesRes.data.length,
        totalParts: partsRes.data.length,
        totalCustomers: customersRes.data.length,
        totalOrders: ordersRes.data.length,
        lowStockParts: lowStock,
        totalTransactions: transactionsRes.data.length,
        totalRevenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const colors = getColorClasses(color);
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className={`${colors.bg} p-3 rounded-full`}>
            <div className={colors.text}>{icon}</div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-64">
        <Loading text="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to AutoParts Manager</p>
          </div>
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
          }
        />
        <StatCard
          title="Total Parts"
          value={stats.totalParts}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
            </svg>
          }
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12a5 5 0 005-5c0-2.76-2.24-5-5-5s-5 2.24-5 5a5 5 0 005 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          }
        />
        <StatCard
          title={`Orders ${period === 'all' ? '(All Time)' : `(${period.charAt(0).toUpperCase() + period.slice(1)})`}`}
          value={stats.totalOrders}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
          }
        />
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={`Transactions ${period === 'all' ? '(All Time)' : `(${period.charAt(0).toUpperCase() + period.slice(1)})`}`}
          value={stats.totalTransactions}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 10a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z"></path>
            </svg>
          }
        />
        <StatCard
          title={`Revenue ${period === 'all' ? '(All Time)' : `(${period.charAt(0).toUpperCase() + period.slice(1)})`}`}
          value={`$${stats.totalRevenue.toFixed(2)}`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
            </svg>
          }
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockParts}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/vehicles')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path>
            </svg>
            Add New Vehicle
          </button>
          <button 
            onClick={() => navigate('/parts')}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path>
            </svg>
            Add New Part
          </button>
          <button 
            onClick={() => navigate('/customers')}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path>
            </svg>
            Add New Customer
          </button>
          <button 
            onClick={() => navigate('/orders')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg text-center transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path>
            </svg>
            Create New Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;