import CompanyMaster from "../models/companymastermodel.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error("CompanyMasterController Error:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
};

export const createCompanyMaster = asyncHandler(async (req, res) => {
  const company = await CompanyMaster.create(req.body);
  res.status(201).json(company);
});

export const getCompanyMasters = asyncHandler(async (_req, res) => {
  const companies = await CompanyMaster.find().sort({ createdAt: -1 });
  res.json(companies);
});

export const getCompanyMasterById = asyncHandler(async (req, res) => {
  const company = await CompanyMaster.findById(req.params.id);

  if (!company) {
    return res.status(404).json({ message: "Company master not found" });
  }

  res.json(company);
});

export const updateCompanyMaster = asyncHandler(async (req, res) => {
  const company = await CompanyMaster.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!company) {
    return res.status(404).json({ message: "Company master not found" });
  }

  res.json(company);
});

export const deleteCompanyMaster = asyncHandler(async (req, res) => {
  const company = await CompanyMaster.findByIdAndDelete(req.params.id);

  if (!company) {
    return res.status(404).json({ message: "Company master not found" });
  }

  res.json({ message: "Company master deleted successfully" });
});

