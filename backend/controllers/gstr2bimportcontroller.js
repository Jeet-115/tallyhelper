import multer from "multer";
import XLSX from "xlsx";
import GSTR2BImport from "../models/gstr2bimportmodel.js";

const upload = multer({ storage: multer.memoryStorage() });

const HEADER_SEQUENCE = [
  { key: "gstin", label: "GSTIN of supplier", type: "string" },
  { key: "tradeName", label: "Trade/Legal name", type: "string" },
  { key: "invoiceNumber", label: "Invoice number", type: "string" },
  { key: "invoiceType", label: "Invoice type", type: "string" },
  { key: "invoiceDate", label: "Invoice Date", type: "date" },
  { key: "invoiceValue", label: "Invoice Value(₹)", type: "number" },
  { key: "placeOfSupply", label: "Place of supply", type: "string" },
  { key: "reverseCharge", label: "Supply Attract Reverse Charge", type: "string" },
  { key: "taxableValue", label: "Taxable Value (₹)", type: "number" },
  { key: "igst", label: "Integrated Tax(₹)", type: "number" },
  { key: "cgst", label: "Central Tax(₹)", type: "number" },
  { key: "sgst", label: "State/UT Tax(₹)", type: "number" },
  { key: "cess", label: "Cess(₹)", type: "number" },
  { key: "gstrPeriod", label: "GSTR-1/1A/IFF/GSTR-5 Period", type: "string" },
  { key: "gstrFilingDate", label: "GSTR-1/1A/IFF/GSTR-5 Filing Date", type: "date" },
  { key: "itcAvailability", label: "ITC Availability", type: "string" },
  { key: "reason", label: "Reason", type: "string" },
  { key: "taxRatePercent", label: "Applicable % of Tax Rate", type: "number" },
  { key: "source", label: "Source", type: "string" },
  { key: "irn", label: "IRN", type: "string" },
  { key: "irnDate", label: "IRN Date", type: "date" },
];

const sanitizeString = (value) => {
  if (value === null || value === undefined) return null;
  const stringValue = String(value).trim();
  return stringValue.length ? stringValue : null;
};

export const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized =
    typeof value === "string"
      ? value.replace(/,/g, "").trim()
      : Number(value);
  const parsed =
    typeof normalized === "number" ? normalized : Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const date = new Date(
        Date.UTC(
          parsed.y,
          parsed.m - 1,
          parsed.d,
          parsed.H || 0,
          parsed.M || 0,
          parsed.S || 0
        )
      );
      return date.toISOString();
    }
  }
  const isoCandidate = new Date(value);
  return Number.isNaN(isoCandidate.getTime()) ? null : isoCandidate.toISOString();
};

const isRowEmpty = (row) =>
  !row ||
  !row.some(
    (cell) =>
      cell !== null &&
      cell !== undefined &&
      String(cell).trim().length > 0
  );

export const parseB2BSheet = (workbook) => {
  const sheet = workbook.Sheets["B2B"];
  if (!sheet) {
    throw new Error("B2B sheet not found in workbook");
  }

  const sheetRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  if (sheetRows.length <= 4) return [];

  const dataRows = sheetRows.slice(4);

  return dataRows
    .filter((row) => !isRowEmpty(row))
    .map((row) => {
      const entry = {};

      HEADER_SEQUENCE.forEach(({ key, type }, index) => {
        const cell = row[index];
        if (type === "number") {
          entry[key] = parseNumber(cell);
        } else if (type === "date") {
          entry[key] = parseDate(cell);
        } else {
          entry[key] = sanitizeString(cell);
        }
      });

      return entry;
    });
};

export const uploadMiddleware = upload.single("file");

export const importB2BSheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const rows = parseB2BSheet(workbook);

    const document = await GSTR2BImport.create({
      sheetName: "B2B",
      rows,
      uploadedAt: new Date(),
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error("importB2BSheet Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to import B2B sheet" });
  }
};

