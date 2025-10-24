import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: String,
  type: String,
  engineNumber: String,
  parts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Part" }], // linked parts
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);
