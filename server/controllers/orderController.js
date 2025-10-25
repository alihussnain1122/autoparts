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
      const orderItems = [];

      // Validate stock availability but don't reduce it yet (order starts as Pending)
      for (const item of items) {
        const part = await Part.findById(item.partId);
        if (!part) return res.status(404).json({ message: 'Part not found' });
        
        // Just validate that we have enough stock, but don't reduce it
        if (part.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${part.name}. Available: ${part.stock}, Required: ${item.quantity}` });
        }

        totalAmount += item.price * item.quantity;

        // Create order item in the format expected by the Order model
        orderItems.push({
          part: item.partId,
          quantity: item.quantity,
          price: item.price
        });
      }

      // Create order with customer field (not customerId) and parts field (not items)
      // Order starts as "Pending" so stock is not reduced yet
      const order = await Order.create({ 
        customer: customerId, 
        parts: orderItems, 
        totalAmount, 
        status: 'Pending' 
      });

      // Auto-create transaction with pending status
      await Transaction.create({
        order: order._id,
        type: 'Sale',
        amount: totalAmount,
        status: 'pending', // Start as pending since order starts as Pending
        description: `Sale order ${order._id}`,
      });

      res.status(201).json(order);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getAllOrders: async (req, res) => {
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
                { orderDate: { $gte: today } }
              ]
            };
            break;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            dateFilter = {
              $or: [
                { createdAt: { $gte: yesterday, $lt: today } },
                { orderDate: { $gte: yesterday, $lt: today } }
              ]
            };
            break;
          case 'weekly':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = {
              $or: [
                { createdAt: { $gte: weekAgo } },
                { orderDate: { $gte: weekAgo } }
              ]
            };
            break;
          case 'monthly':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFilter = {
              $or: [
                { createdAt: { $gte: monthAgo } },
                { orderDate: { $gte: monthAgo } }
              ]
            };
            break;
          case 'all':
          default:
            dateFilter = {};
            break;
        }
      }

      const orders = await Order.find(dateFilter);
      res.json(orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json(order);
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const { status } = req.body;
      
      // Validate status if provided
      if (status && !["Pending", "Processing", "Completed", "Cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      // Get the current order to check previous status
      const currentOrder = await Order.findById(req.params.id);
      if (!currentOrder) return res.status(404).json({ message: 'Order not found' });
      
      const previousStatus = currentOrder.status;
      
      // Update the order
      const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // Handle stock adjustments when status changes
      if (status && status !== previousStatus) {
        console.log(`Order status changing from ${previousStatus} to ${status}`);
        console.log(`Order parts:`, currentOrder.parts);
        
        // If changing FROM Completed TO Cancelled - restore stock
        if (previousStatus === 'Completed' && status === 'Cancelled') {
          console.log('Restoring stock for cancelled order');
          for (const item of currentOrder.parts) {
            console.log(`Restoring ${item.quantity} units of part ${item.part}`);
            await Part.findByIdAndUpdate(item.part, {
              $inc: { stock: item.quantity }
            });
          }
        }
        
        // If changing FROM Cancelled TO Completed - reduce stock
        else if (previousStatus === 'Cancelled' && status === 'Completed') {
          console.log('Reducing stock for re-completed order');
          for (const item of currentOrder.parts) {
            const part = await Part.findById(item.part);
            if (part.stock < item.quantity) {
              return res.status(400).json({ 
                message: `Insufficient stock for ${part.name}. Available: ${part.stock}, Required: ${item.quantity}` 
              });
            }
            await Part.findByIdAndUpdate(item.part, {
              $inc: { stock: -item.quantity }
            });
          }
        }
        
        // If changing FROM Pending/Processing TO Completed - reduce stock for first time
        else if ((previousStatus === 'Pending' || previousStatus === 'Processing') && status === 'Completed') {
          console.log('Reducing stock for first-time completion');
          for (const item of currentOrder.parts) {
            const part = await Part.findById(item.part);
            if (part.stock < item.quantity) {
              return res.status(400).json({ 
                message: `Insufficient stock for ${part.name}. Available: ${part.stock}, Required: ${item.quantity}` 
              });
            }
            await Part.findByIdAndUpdate(item.part, {
              $inc: { stock: -item.quantity }
            });
          }
        }
        
        // Update corresponding transaction status
        let transactionStatus;
        
        switch (status) {
          case 'Completed':
            transactionStatus = 'success';
            break;
          case 'Cancelled':
            transactionStatus = 'failed';
            break;
          case 'Pending':
          case 'Processing':
          default:
            transactionStatus = 'pending';
            break;
        }
        
        console.log(`Updating transaction status to ${transactionStatus} for order ${order._id}`);
        
        // Update the transaction associated with this order
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { order: order._id },
          { status: transactionStatus },
          { new: true }
        );
        
        console.log(`Transaction update result:`, updatedTransaction ? `Status: ${updatedTransaction.status}` : 'No transaction found');
      }
      
      res.json(order);
    } catch (err) {
      console.error("Error updating order:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      // Validate status
      if (!status || !["Pending", "Processing", "Completed", "Cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      // Get the current order to check previous status
      const currentOrder = await Order.findById(req.params.id);
      if (!currentOrder) return res.status(404).json({ message: 'Order not found' });
      
      const previousStatus = currentOrder.status;
      
      // Update the order status
      const order = await Order.findByIdAndUpdate(
        req.params.id, 
        { status }, 
        { new: true }
      );
      
      // Handle stock adjustments when status changes
      if (status !== previousStatus) {
        console.log(`Order status changing from ${previousStatus} to ${status}`);
        console.log(`Order parts:`, currentOrder.parts);
        
        // If changing FROM Completed TO Cancelled - restore stock
        if (previousStatus === 'Completed' && status === 'Cancelled') {
          console.log('Restoring stock for cancelled order');
          for (const item of currentOrder.parts) {
            console.log(`Restoring ${item.quantity} units of part ${item.part}`);
            await Part.findByIdAndUpdate(item.part, {
              $inc: { stock: item.quantity }
            });
          }
        }
        
        // If changing FROM Cancelled TO Completed - reduce stock
        else if (previousStatus === 'Cancelled' && status === 'Completed') {
          console.log('Reducing stock for re-completed order');
          for (const item of currentOrder.parts) {
            const part = await Part.findById(item.part);
            if (part.stock < item.quantity) {
              return res.status(400).json({ 
                message: `Insufficient stock for ${part.name}. Available: ${part.stock}, Required: ${item.quantity}` 
              });
            }
            await Part.findByIdAndUpdate(item.part, {
              $inc: { stock: -item.quantity }
            });
          }
        }
        
        // If changing FROM Pending/Processing TO Completed - reduce stock for first time
        else if ((previousStatus === 'Pending' || previousStatus === 'Processing') && status === 'Completed') {
          console.log('Reducing stock for first-time completion');
          for (const item of currentOrder.parts) {
            const part = await Part.findById(item.part);
            if (part.stock < item.quantity) {
              return res.status(400).json({ 
                message: `Insufficient stock for ${part.name}. Available: ${part.stock}, Required: ${item.quantity}` 
              });
            }
            await Part.findByIdAndUpdate(item.part, {
              $inc: { stock: -item.quantity }
            });
          }
        }
        
        // Update corresponding transaction status
        let transactionStatus;
        
        switch (status) {
          case 'Completed':
            transactionStatus = 'success';
            break;
          case 'Cancelled':
            transactionStatus = 'failed';
            break;
          case 'Pending':
          case 'Processing':
          default:
            transactionStatus = 'pending';
            break;
        }
        
        console.log(`Updating transaction status to ${transactionStatus} for order ${order._id}`);
        
        // Update the transaction associated with this order
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { order: order._id },
          { status: transactionStatus },
          { new: true }
        );
        
        console.log(`Transaction update result:`, updatedTransaction ? `Status: ${updatedTransaction.status}` : 'No transaction found');
        
        res.json({ 
          message: `Order status updated to ${status}`, 
          order,
          transactionStatus: updatedTransaction?.status || 'No transaction found',
          stockUpdated: previousStatus === 'Completed' && status === 'Cancelled' ? 'Stock restored' :
                       (previousStatus === 'Cancelled' && status === 'Completed') || 
                       ((previousStatus === 'Pending' || previousStatus === 'Processing') && status === 'Completed') ? 'Stock reduced' : 'No stock change'
        });
      } else {
        res.json({ 
          message: `Order status remains ${status}`, 
          order 
        });
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({ message: err.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      console.error("Error deleting order:", err);
      res.status(500).json({ message: err.message });
    }
  }
};

export default orderController;
