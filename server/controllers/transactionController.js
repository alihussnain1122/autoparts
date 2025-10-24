// controllers/transactionController.js
import Transaction from '../models/Transaction.js';

const transactionController = {
  getTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.find().populate('orderId');
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getTransactionById: async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id).populate('orderId');
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json(transaction);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createTransaction: async (req, res) => {
    try {
      const transaction = await Transaction.create(req.body);
      res.status(201).json(transaction);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateTransaction: async (req, res) => {
    try {
      const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json(transaction);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteTransaction: async (req, res) => {
    try {
      const transaction = await Transaction.findByIdAndDelete(req.params.id);
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

export default transactionController;
