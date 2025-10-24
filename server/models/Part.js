import mongoose from "mongoose";

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  stock: { type: Number, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  compatibleVehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],
  nutsBolts: [{ type: mongoose.Schema.Types.ObjectId, ref: "NutBolt" }]
}, { timestamps: true });

export default mongoose.model("Part", partSchema);
