import Supplier from "../models/Supplier.js";

const supplierController = {
  //  GET all suppliers
  getSuppliers: async (req, res) => {
    try {
      const suppliers = await Supplier.find().populate("suppliedParts");
      res.json(suppliers);
    } catch (err) {
      res.status(500).json({ message: "Error fetching suppliers", error: err.message });
    }
  },

  // GET single supplier
  getSupplierById: async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.params.id).populate("suppliedParts");
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.json(supplier);
    } catch (err) {
      res.status(500).json({ message: "Error fetching supplier", error: err.message });
    }
  },

  // ADD new supplier
  addSupplier: async (req, res) => {
    try {
      const supplier = new Supplier(req.body);
      await supplier.save();
      res.json(supplier);
    } catch (err) {
      res.status(400).json({ message: "Error adding supplier", error: err.message });
    }
  },

  // UPDATE supplier
  updateSupplier: async (req, res) => {
    try {
      const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.json(supplier);
    } catch (err) {
      res.status(400).json({ message: "Error updating supplier", error: err.message });
    }
  },

  // DELETE supplier
  deleteSupplier: async (req, res) => {
    try {
      const supplier = await Supplier.findByIdAndDelete(req.params.id);
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.json({ message: "Supplier deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: "Error deleting supplier", error: err.message });
    }
  }
};

export default supplierController;
