import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: String,
  email: String,
  contact: String,
  address: String,
  suppliedParts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Part" }]
}, { timestamps: true });

export default mongoose.model("Supplier", supplierSchema);
