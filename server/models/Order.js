import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  parts: [{
    part: { type: mongoose.Schema.Types.ObjectId, ref: "Part" },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: { type: String, default: "Pending" }, // Pending / Completed / Cancelled
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
