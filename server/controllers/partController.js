import Part from "../models/Part.js";
import Supplier from "../models/Supplier.js";

const partController = {
  // GET all parts
  getParts: async (req, res) => {
    try {
      const parts = await Part.find()
        .populate("supplier")
        .populate("compatibleVehicles")
        .populate("nutsBolts");
      res.json(parts);
    } catch (err) {
      res.status(500).json({ message: "Error fetching parts", error: err.message });
    }
  },

  // GET single part
  getPartById: async (req, res) => {
    try {
      const part = await Part.findById(req.params.id)
        .populate("supplier")
        .populate("compatibleVehicles")
        .populate("nutsBolts");
      if (!part) return res.status(404).json({ message: "Part not found" });
      res.json(part);
    } catch (err) {
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

      res.json(part);
    } catch (err) {
      res.status(400).json({ message: "Error adding part", error: err.message });
    }
  },

  // UPDATE part
  updatePart: async (req, res) => {
    try {
      const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!part) return res.status(404).json({ message: "Part not found" });
      res.json(part);
    } catch (err) {
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
      res.status(400).json({ message: "Error deleting part", error: err.message });
    }
  }
};

export default partController;
