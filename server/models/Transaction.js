import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  type: { type: String, enum: ["Sale", "Purchase", "Expense"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: String
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
