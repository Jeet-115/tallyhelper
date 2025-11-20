import mongoose from "mongoose";

const gstinNumberSchema = new mongoose.Schema(
  {
    stateName: { type: String, required: true, trim: true, unique: true },
    gstCode: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const GSTINNumber =
  mongoose.models.GSTINNumber ||
  mongoose.model("GSTINNumber", gstinNumberSchema);

export default GSTINNumber;

