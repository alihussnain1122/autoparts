import Vehicle from "../models/Vehicle.js";
import Part from "../models/Part.js";

const vehicleController = {
  // GET all vehicles
  getVehicles: async (req, res) => {
    try {
      const vehicles = await Vehicle.find().populate("parts");
      res.json(vehicles);
    } catch (err) {
      res.status(500).json({ message: "Error fetching vehicles", error: err.message });
    }
  },

  // GET single vehicle
  getVehicleById: async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id).populate("parts");
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      res.json(vehicle);
    } catch (err) {
      res.status(500).json({ message: "Error fetching vehicle", error: err.message });
    }
  },

  // ADD new vehicle
  addVehicle: async (req, res) => {
    try {
      const vehicle = new Vehicle(req.body);
      await vehicle.save();
      res.json(vehicle);
    } catch (err) {
      res.status(400).json({ message: "Error adding vehicle", error: err.message });
    }
  },

  // UPDATE vehicle
  updateVehicle: async (req, res) => {
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      res.json(vehicle);
    } catch (err) {
      res.status(400).json({ message: "Error updating vehicle", error: err.message });
    }
  },

  // Link part to vehicle
  addPartToVehicle: async (req, res) => {
    try {
      const { vehicleId, partId } = req.body;

      const vehicle = await Vehicle.findById(vehicleId);
      const part = await Part.findById(partId);

      if (!vehicle || !part)
        return res.status(404).json({ message: "Vehicle or Part not found" });

      vehicle.parts.push(partId);
      await vehicle.save();

      part.compatibleVehicles.push(vehicleId);
      await part.save();

      res.json({ message: "Part linked to vehicle", vehicle });
    } catch (err) {
      res.status(400).json({ message: "Error linking part to vehicle", error: err.message });
    }
  },

  // DELETE vehicle
  deleteVehicle: async (req, res) => {
    try {
      const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      res.json({ message: "Vehicle deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: "Error deleting vehicle", error: err.message });
    }
  }
};

export default vehicleController;
