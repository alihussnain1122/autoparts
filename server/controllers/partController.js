import Part from "../models/Part.js";
import Supplier from "../models/Supplier.js";

const partController = {
  // GET all parts
  getParts: async (req, res) => {
    try {
      const parts = await Part.find()
        .populate("supplier", "name company email contact phone")
        .populate("compatibleVehicles", "name model type");
      res.json(parts);
    } catch (err) {
      console.error("Error fetching parts:", err);
      res.status(500).json({ message: "Error fetching parts", error: err.message });
    }
  },

  // GET single part
  getPartById: async (req, res) => {
    try {
      const part = await Part.findById(req.params.id)
        .populate("supplier", "name company email contact phone")
        .populate("compatibleVehicles", "name model type");
      if (!part) return res.status(404).json({ message: "Part not found" });
      res.json(part);
    } catch (err) {
      console.error("Error fetching part:", err);
      res.status(500).json({ message: "Error fetching part", error: err.message });
    }
  },

  // ADD new part
  addPart: async (req, res) => {
    try {
      const part = new Part(req.body);
      await part.save();

      // add reference to supplier if present
      if (part.supplier) {
        await Supplier.findByIdAndUpdate(part.supplier, {
          $push: { suppliedParts: part._id },
        });
      }

      // Return populated part
      const populatedPart = await Part.findById(part._id)
        .populate("supplier", "name company email contact phone")
        .populate("compatibleVehicles", "name model type");

      res.json(populatedPart);
    } catch (err) {
      console.error("Error adding part:", err);
      res.status(400).json({ message: "Error adding part", error: err.message });
    }
  },

  // UPDATE part
  updatePart: async (req, res) => {
    try {
      const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate("supplier", "name company email contact phone")
        .populate("compatibleVehicles", "name model type");
      if (!part) return res.status(404).json({ message: "Part not found" });
      res.json(part);
    } catch (err) {
      console.error("Error updating part:", err);
      res.status(400).json({ message: "Error updating part", error: err.message });
    }
  },

  // DELETE part
  deletePart: async (req, res) => {
    try {
      const part = await Part.findByIdAndDelete(req.params.id);
      if (!part) return res.status(404).json({ message: "Part not found" });
      res.json({ message: "Part deleted successfully" });
    } catch (err) {
      console.error("Error deleting part:", err);
      res.status(400).json({ message: "Error deleting part", error: err.message });
    }
  }
};

export default partController;
