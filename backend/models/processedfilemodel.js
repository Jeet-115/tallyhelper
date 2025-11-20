import mongoose from "mongoose";

const processedFileSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    processedRows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    mismatchedRows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "processedfiles" }
);

const ProcessedFile =
  mongoose.models.ProcessedFile ||
  mongoose.model("ProcessedFile", processedFileSchema);

export default ProcessedFile;

