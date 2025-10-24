// controllers/stockController.js
import Part from '../models/Part.js';

const stockController = {
  getAllStock: async (req, res) => {
    try {
      const parts = await Part.find().select('name stock price category');
      res.json(parts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getStockById: async (req, res) => {
    try {
      const part = await Part.findById(req.params.id);
      if (!part) return res.status(404).json({ message: 'Part not found' });
      res.json({
        id: part._id,
        name: part.name,
        stock: part.stock,
        price: part.price,
        category: part.category
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { stock } = req.body;
      const part = await Part.findByIdAndUpdate(
        req.params.id, 
        { stock }, 
        { new: true }
      );
      if (!part) return res.status(404).json({ message: 'Part not found' });
      res.json(part);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  restockItem: async (req, res) => {
    try {
      const { partId, quantity } = req.body;
      const part = await Part.findById(partId);
      if (!part) return res.status(404).json({ message: 'Part not found' });
      
      part.stock += quantity;
      await part.save();
      
      res.json({
        message: 'Stock updated successfully',
        part: {
          id: part._id,
          name: part.name,
          newStock: part.stock
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

export default stockController;