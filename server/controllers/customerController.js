// controllers/customerController.js
import Customer from '../models/Customer.js';

const customerController = {
  // Create a new customer
  createCustomer: async (req, res) => {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get all customers
  getAllCustomers: async (req, res) => {
    try {
      const customers = await Customer.find();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get a single customer by ID
  getCustomerById: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Update a customer by ID
  updateCustomer: async (req, res) => {
    try {
      const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Delete a customer by ID
  deleteCustomer: async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

export default customerController;
