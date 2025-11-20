import mongoose from "mongoose";

const gstr2BImportSchema = new mongoose.Schema(
  {
    sheetName: {
      type: String,
      required: true,
      default: "B2B",
    },
    rows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const GSTR2BImport =
  mongoose.models.GSTR2BImport ||
  mongoose.model("GSTR2BImport", gstr2BImportSchema);

export default GSTR2BImport;

