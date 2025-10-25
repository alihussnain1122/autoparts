// controllers/transactionController.js
import Transaction from '../models/Transaction.js';

const transactionController = {
  getTransactions: async (req, res) => {
    try {
      const { period } = req.query;
      let dateFilter = {};

      if (period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (period) {
          case 'today':
            dateFilter = {
              $or: [
                { createdAt: { $gte: today } },
                { date: { $gte: today } }
              ]
            };
            break;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            dateFilter = {
              $or: [
                { createdAt: { $gte: yesterday, $lt: today } },
                { date: { $gte: yesterday, $lt: today } }
              ]
            };
            break;
          case 'weekly':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = {
              $or: [
                { createdAt: { $gte: weekAgo } },
                { date: { $gte: weekAgo } }
              ]
            };
            break;
          case 'monthly':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFilter = {
              $or: [
                { createdAt: { $gte: monthAgo } },
                { date: { $gte: monthAgo } }
              ]
            };
            break;
          case 'all':
          default:
            dateFilter = {};
            break;
        }
      }

      const transactions = await Transaction.find(dateFilter);
      res.json(transactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getTransactionById: async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id).populate('order');
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json(transaction);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      res.status(500).json({ message: err.message });
    }
  },

  createTransaction: async (req, res) => {
    try {
      console.log('Creating new transaction with data:', req.body);
      
      const transaction = await Transaction.create(req.body);
      
      console.log(`Transaction created successfully:`, {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        order: transaction.order
      });
      
      res.status(201).json(transaction);
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateTransaction: async (req, res) => {
    try {
      console.log(`Updating transaction ${req.params.id} with data:`, req.body);
      
      // Get the current transaction first
      const currentTransaction = await Transaction.findById(req.params.id);
      if (!currentTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      const previousStatus = currentTransaction.status;
      console.log(`Transaction status changing from ${previousStatus} to ${req.body.status || 'unchanged'}`);
      
      const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      console.log(`Transaction updated successfully:`, {
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        type: transaction.type
      });
      
      res.json(transaction);
    } catch (err) {
      console.error("Error updating transaction:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateTransactionStatus: async (req, res) => {
    try {
      const { status } = req.body;
      console.log(`Updating transaction ${req.params.id} status to ${status}`);
      
      // Validate status
      const validStatuses = ['pending', 'success', 'failed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      // Get the current transaction first
      const currentTransaction = await Transaction.findById(req.params.id);
      if (!currentTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      const previousStatus = currentTransaction.status;
      console.log(`Transaction status changing from ${previousStatus} to ${status}`);
      
      const transaction = await Transaction.findByIdAndUpdate(
        req.params.id, 
        { status }, 
        { new: true }
      );
      
      console.log(`Transaction status updated successfully:`, {
        id: transaction._id,
        previousStatus,
        newStatus: transaction.status
      });
      
      res.json({ 
        message: `Transaction status updated to ${status}`,
        transaction,
        previousStatus
      });
    } catch (err) {
      console.error("Error updating transaction status:", err);
      res.status(500).json({ message: err.message });
    }
  },

  deleteTransaction: async (req, res) => {
    try {
      const transaction = await Transaction.findByIdAndDelete(req.params.id);
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).json({ message: err.message });
    }
  }
};

export default transactionController;
