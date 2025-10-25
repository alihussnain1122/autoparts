import { useState, useEffect } from 'react';
import { partsAPI, suppliersAPI, vehiclesAPI } from '../axios/api';

const Parts = () => {
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    supplier: '',
    compatibleVehicles: [],
    description: '',
  });

  useEffect(() => {
    fetchParts();
    fetchSuppliers();
    fetchVehicles();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await partsAPI.getAll();
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const partData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        compatibleVehicles: formData.compatibleVehicles,
      };
      
      if (editingPart) {
        await partsAPI.update(editingPart._id, partData);
      } else {
        await partsAPI.create(partData);
      }
      
      setShowModal(false);
      setEditingPart(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        supplier: '',
        compatibleVehicles: [],
        description: '',
      });
      fetchParts();
    } catch (error) {
      console.error('Error saving part:', error);
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      category: part.category || '',
      price: part.price.toString(),
      stock: part.stock.toString(),
      supplier: part.supplier?._id || '',
      compatibleVehicles: part.compatibleVehicles?.map(v => typeof v === 'object' ? v._id : v) || [],
      description: part.description || '',
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPart(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      supplier: '',
      compatibleVehicles: [],
      description: '',
    });
  };

  const handleVehicleChange = (vehicleId, isChecked) => {
    if (isChecked) {
      setFormData({
        ...formData,
        compatibleVehicles: [...formData.compatibleVehicles, vehicleId]
      });
    } else {
      setFormData({
        ...formData,
        compatibleVehicles: formData.compatibleVehicles.filter(id => id !== vehicleId)
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await partsAPI.delete(id);
        fetchParts();
      } catch (error) {
        console.error('Error deleting part:', error);
      }
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Parts</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add New Part
        </button>
      </div>

      {/* Parts Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compatible Vehicles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => (
              <tr key={part._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {part.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${part.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    part.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {part.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.supplier?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.compatibleVehicles?.length > 0 
                    ? part.compatibleVehicles.map(v => {
                        if (typeof v === 'object' && v.name) {
                          return `${v.name}${v.model ? ` - ${v.model}` : ''}`;
                        }
                        return v; // fallback to ID if not populated
                      }).join(', ')
                    : 'None'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(part)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(part._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {parts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No parts found. Add your first part!
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPart ? 'Edit Part' : 'Add New Part'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compatible Vehicles</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {vehicles.length > 0 ? (
                      vehicles.map((vehicle) => (
                        <div key={vehicle._id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`vehicle-${vehicle._id}`}
                            checked={formData.compatibleVehicles.includes(vehicle._id)}
                            onChange={(e) => handleVehicleChange(vehicle._id, e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor={`vehicle-${vehicle._id}`} className="text-sm text-gray-700">
                            {vehicle.name} - {vehicle.model || 'No Model'}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No vehicles available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select which vehicles this part is compatible with</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {editingPart ? 'Update Part' : 'Add Part'}
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

export default Parts;