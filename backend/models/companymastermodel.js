import mongoose from "mongoose";

const companyMasterSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    mailingName: { type: String, trim: true },
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    pincode: { type: String, trim: true },
    telephone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, trim: true },
    tanNumber: { type: String, trim: true },
    gstin: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const CompanyMaster =
  mongoose.models.CompanyMaster ||
  mongoose.model("CompanyMaster", companyMasterSchema);

export default CompanyMaster;

