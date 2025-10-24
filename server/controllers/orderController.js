// controllers/orderController.js
import Order from '../models/Order.js';
import Part from '../models/Part.js';
import Transaction from '../models/Transaction.js';

const orderController = {
  placeOrder: async (req, res) => {
    try {
      const { customerId, items } = req.body; 
      // items = [{ partId, quantity, price }]

      let totalAmount = 0;

      for (const item of items) {
        const part = await Part.findById(item.partId);
        if (!part) return res.status(404).json({ message: 'Part not found' });
        if (part.stock < item.quantity)
          return res.status(400).json({ message: `Insufficient stock for ${part.name}` });

        part.stock -= item.quantity;
        await part.save();
        totalAmount += item.price * item.quantity;
      }

      const order = await Order.create({ customerId, items, totalAmount, status: 'completed' });

      // Auto-create transaction
      await Transaction.create({
        orderId: order._id,
        amount: totalAmount,
        status: 'success',
      });

      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find().populate('customerId').populate('items.partId');
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('customerId').populate('items.partId');
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

export default orderController;
