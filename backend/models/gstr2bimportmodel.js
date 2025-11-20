import mongoose from "mongoose";

const gstr2BImportSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: true,
    },
    companySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    sheetName: {
      type: String,
      required: true,
      default: "B2B",
    },
    rows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    sourceFileName: {
      type: String,
      trim: true,
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

