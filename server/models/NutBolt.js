import mongoose from "mongoose";

const nutBoltSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String, // nut / bolt / washer etc.
  size: String,
  quantity: { type: Number, default: 0 },
  part: { type: mongoose.Schema.Types.ObjectId, ref: "Part" }
}, { timestamps: true });

export default mongoose.model("NutBolt", nutBoltSchema);
