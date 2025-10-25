import { useState, useEffect } from 'react';
import { stockAPI, partsAPI } from '../axios/api';

const Stock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [restockData, setRestockData] = useState({
    partId: '',
    quantity: '',
  });
  const [updateData, setUpdateData] = useState({
    stock: '',
  });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await stockAPI.getAll();
      setStock(response.data);
    } catch {
      // If stock API doesn't work, fallback to parts API
      try {
        const partsResponse = await partsAPI.getAll();
        setStock(partsResponse.data);
      } catch (partsError) {
        console.error('Error fetching stock/parts:', partsError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await stockAPI.restock({
        partId: restockData.partId,
        quantity: parseInt(restockData.quantity),
      });
      setShowRestockModal(false);
      setRestockData({ partId: '', quantity: '' });
      fetchStock();
    } catch (error) {
      console.error('Error restocking:', error);
      alert('Error restocking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await stockAPI.update(selectedPart._id, {
        stock: parseInt(updateData.stock),
      });
      setShowUpdateModal(false);
      setSelectedPart(null);
      setUpdateData({ stock: '' });
      fetchStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock: ' + (error.response?.data?.message || error.message));
    }
  };

  const openUpdateModal = (part) => {
    setSelectedPart(part);
    setUpdateData({ stock: part.stock.toString() });
    setShowUpdateModal(true);
  };

  const getStockStatus = (stock) => {
    if (stock <= 5) return { color: 'bg-red-100 text-red-800', text: 'Critical' };
    if (stock <= 10) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low' };
    if (stock <= 20) return { color: 'bg-blue-100 text-blue-800', text: 'Medium' };
    return { color: 'bg-green-100 text-green-800', text: 'Good' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
        <button 
          onClick={() => setShowRestockModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          Restock Items
        </button>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
          <p className="text-2xl font-bold text-gray-900">{stock.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
          <p className="text-2xl font-bold text-red-600">
            {stock.filter(item => item.stock <= 10).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Critical Stock</h3>
          <p className="text-2xl font-bold text-red-800">
            {stock.filter(item => item.stock <= 5).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold text-green-600">
            ${stock.reduce((total, item) => total + (item.price * item.stock), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stock.map((item) => {
              const status = getStockStatus(item.stock);
              return (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${((item.price || 0) * item.stock).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUpdateModal(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setRestockData({ partId: item._id, quantity: '' });
                        setShowRestockModal(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {stock.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No stock items found.
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restock Item</h3>
              <form onSubmit={handleRestock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Part</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={restockData.partId}
                    onChange={(e) => setRestockData({ ...restockData, partId: e.target.value })}
                  >
                    <option value="">Select a part to restock</option>
                    {stock.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} (Current: {item.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={restockData.quantity}
                    onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowRestockModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Restock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateModal && selectedPart && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Stock for {selectedPart.name}
              </h3>
              <form onSubmit={handleUpdateStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Stock: {selectedPart.stock}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mt-2">New Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={updateData.stock}
                    onChange={(e) => setUpdateData({ stock: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;