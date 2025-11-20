import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { fetchGSTINNumbers } from "../services/gstinnumberservices";
import {
  uploadB2BSheet,
  processGstr2bImport,
  fetchProcessedFile,
} from "../services/gstr2bservice";

const columnMap = {
  gstin: "gstin",
  tradeName: "tradeName",
  invoiceNumber: "invoiceNumber",
  invoiceType: "invoiceType",
  invoiceDate: "invoiceDate",
  invoiceValue: "invoiceValue",
  placeOfSupply: "placeOfSupply",
  reverseCharge: "reverseCharge",
  taxableValue: "taxableValue",
  integratedTax: "igst",
  centralTax: "cgst",
  stateTax: "sgst",
  cess: "cess",
  gstrPeriod: "gstrPeriod",
  gstrFilingDate: "gstrFilingDate",
  itcAvailability: "itcAvailability",
  reason: "reason",
  taxRatePercent: "taxRatePercent",
  source: "source",
  irn: "irn",
  irnDate: "irnDate",
};

const slabConfig = [
  { slab: "5%", igst: 5, cgst: 2.5, sgst: 2.5 },
  { slab: "12%", igst: 12, cgst: 6, sgst: 6 },
  { slab: "18%", igst: 18, cgst: 9, sgst: 9 },
  { slab: "28%", igst: 28, cgst: 14, sgst: 14 },
];

const gstr2bHeaders = [
  { key: "gstin", label: "GSTIN of supplier" },
  { key: "tradeName", label: "Trade/Legal name" },
  { key: "invoiceNumber", label: "Invoice number" },
  { key: "invoiceType", label: "Invoice type" },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "invoiceValue", label: "Invoice Value (₹)" },
  { key: "placeOfSupply", label: "Place of supply" },
  { key: "reverseCharge", label: "Supply Attract Reverse Charge" },
  { key: "taxableValue", label: "Taxable Value (₹)" },
  { key: "igst", label: "Integrated Tax (₹)" },
  { key: "cgst", label: "Central Tax (₹)" },
  { key: "sgst", label: "State/UT Tax (₹)" },
  { key: "cess", label: "Cess (₹)" },
  { key: "gstrPeriod", label: "GSTR-1/1A/IFF/GSTR-5 Period" },
  { key: "gstrFilingDate", label: "GSTR-1/1A/IFF/GSTR-5 Filing Date" },
  { key: "itcAvailability", label: "ITC Availability" },
  { key: "reason", label: "Reason" },
  { key: "taxRatePercent", label: "Applicable % of Tax Rate" },
  { key: "source", label: "Source" },
  { key: "irn", label: "IRN" },
  { key: "irnDate", label: "IRN Date" },
];

const outputColumns = [
  "Sr no.",
  "Date",
  "Vch No",
  "VCH Type",
  "Reference No.",
  "Reference Date",
  "Supplier Name",
  "GST Registration Type",
  "GSTIN/UIN",
  "State",
  "Supplier State",
  "Supplier Amount",
  "Supplier Dr/Cr",
  "Ledger Name 5%",
  "Ledger Amount 5%",
  "Ledger amount cr/dr 5%",
  "Ledger Name 12%",
  "Ledger Amount 12%",
  "Ledger amount Cr/Dr 12%",
  "Ledger Name 18%",
  "Ledger Amount 18%",
  "Ledger amount cr/dr 18%",
  "Ledger Name 28%",
  "Ledger Amount 28%",
  "Ledger amount cr/dr 28%",
  "IGST Rate 5%",
  "CGST Rate 5%",
  "SGST/UTGST Rate 5%",
  "IGST Rate 12%",
  "CGST Rate 12%",
  "SGST/UTGST Rate 12%",
  "IGST Rate 18%",
  "CGST Rate 18%",
  "SGST/UTGST Rate 18%",
  "IGST Rate 28%",
  "CGST Rate 28%",
  "SGST/UTGST Rate 28%",
  "GRO Amount",
  "Round Off Dr",
  "Round Off Cr",
  "Invoice Amount",
  "Change Mode",
];

const ledgerKeyMap = {
  "5%": {
    ledgerName: "Ledger Name 5%",
    ledgerAmount: "Ledger Amount 5%",
    ledgerCrDr: "Ledger amount cr/dr 5%",
    igst: "IGST Rate 5%",
    cgst: "CGST Rate 5%",
    sgst: "SGST/UTGST Rate 5%",
  },
  "12%": {
    ledgerName: "Ledger Name 12%",
    ledgerAmount: "Ledger Amount 12%",
    ledgerCrDr: "Ledger amount Cr/Dr 12%",
    igst: "IGST Rate 12%",
    cgst: "CGST Rate 12%",
    sgst: "SGST/UTGST Rate 12%",
  },
  "18%": {
    ledgerName: "Ledger Name 18%",
    ledgerAmount: "Ledger Amount 18%",
    ledgerCrDr: "Ledger amount cr/dr 18%",
    igst: "IGST Rate 18%",
    cgst: "CGST Rate 18%",
    sgst: "SGST/UTGST Rate 18%",
  },
  "28%": {
    ledgerName: "Ledger Name 28%",
    ledgerAmount: "Ledger Amount 28%",
    ledgerCrDr: "Ledger amount cr/dr 28%",
    igst: "IGST Rate 28%",
    cgst: "CGST Rate 28%",
    sgst: "SGST/UTGST Rate 28%",
  },
};

const taxKeys = [
  "IGST Rate 5%",
  "CGST Rate 5%",
  "SGST/UTGST Rate 5%",
  "IGST Rate 12%",
  "CGST Rate 12%",
  "SGST/UTGST Rate 12%",
  "IGST Rate 18%",
  "CGST Rate 18%",
  "SGST/UTGST Rate 18%",
  "IGST Rate 28%",
  "CGST Rate 28%",
  "SGST/UTGST Rate 28%",
];

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const pick = (row, label) => {
  if (!row || !label) return "";
  if (Array.isArray(label)) {
    for (const key of label) {
      if (row[key] !== undefined && row[key] !== null) return row[key];
    }
    return "";
  }
  return row[label] ?? "";
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toISOString().split("T")[0];
};

const sanitizeFileName = (value) =>
  (value || "company")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

const CompanyProcessor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const company = location.state?.company;

  const [sheetRows, setSheetRows] = useState([]);
  const [generatedRows, setGeneratedRows] = useState([]);
  const [fileMeta, setFileMeta] = useState({ name: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [gstStateMap, setGstStateMap] = useState({});
  const [loadingGST, setLoadingGST] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importId, setImportId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedDoc, setProcessedDoc] = useState(null);

  useEffect(() => {
    if (!company) return;
    const loadGST = async () => {
      setLoadingGST(true);
      try {
        const { data } = await fetchGSTINNumbers();
        const map = (data || []).reduce((acc, item) => {
          acc[item.gstCode.padStart(2, "0")] = item.stateName;
          return acc;
        }, {});
        setGstStateMap(map);
      } catch (error) {
        console.error("Failed to load GST state codes:", error);
        setStatus({
          type: "error",
          message: "Unable to load GST codes. State mapping may be empty.",
        });
      } finally {
        setLoadingGST(false);
      }
    };
    loadGST();
  }, [company]);

  useEffect(() => {
    if (!company) {
      const timer = setTimeout(() => navigate("/company-selector"), 2000);
      return () => clearTimeout(timer);
    }
  }, [company, navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus({ type: "", message: "" });
    const snapshot = {
      _id: company._id,
      companyName: company.companyName,
      mailingName: company.mailingName,
      address: company.address,
      state: company.state,
      country: company.country,
      pincode: company.pincode,
      gstin: company.gstin,
      email: company.email,
      telephone: company.telephone,
    };

    uploadB2BSheet(file, {
      companyId: company._id,
      companySnapshot: snapshot,
    })
      .then(({ data }) => {
        setFileMeta({ name: file.name });
        setSheetRows(data.rows || []);
        setGeneratedRows([]);
        setImportId(data._id || null);
        setProcessedDoc(null);
        setStatus({
          type: "success",
          message: `Imported ${data.rows?.length || 0} rows from B2B sheet.`,
        });
      })
      .catch((error) => {
        console.error("Failed to upload B2B sheet:", error);
        setStatus({
          type: "error",
          message:
            error?.response?.data?.message ||
            "Unable to process the B2B sheet. Please try again.",
        });
      })
      .finally(() => setUploading(false));
  };

  const determineSlab = (taxableValue, igst, cgst) => {
    if (!taxableValue) return null;
    const tolerance = 0.05; // percent tolerance

    if (igst > 0) {
      const percent = (igst / taxableValue) * 100;
      const match = slabConfig.find(
        (slab) => Math.abs(percent - slab.igst) <= tolerance
      );
      if (match) {
        return { ...match, mode: "IGST" };
      }
    } else if (cgst > 0) {
      const percent = (cgst / taxableValue) * 100;
      const match = slabConfig.find(
        (slab) => Math.abs(percent - slab.cgst) <= tolerance
      );
      if (match) {
        return { ...match, mode: "CGST_SGST" };
      }
    }

    return null;
  };

  const buildRow = (row, index) => {
    const invoiceDate = pick(row, columnMap.invoiceDate);
    const invoiceNumber = pick(row, columnMap.invoiceNumber);
    const taxableValue = toNumber(pick(row, columnMap.taxableValue));
    const invoiceValue = toNumber(pick(row, columnMap.invoiceValue));
    const integratedTax = toNumber(pick(row, columnMap.integratedTax));
    const centralTax = toNumber(pick(row, columnMap.centralTax));
    const stateTax = toNumber(pick(row, columnMap.stateTax));
    const gstin = String(pick(row, columnMap.gstin) || "").trim();
    const stateCode = gstin.slice(0, 2);
    const mappedState = gstStateMap[stateCode] || "";

    const supplierState = pick(row, columnMap.placeOfSupply);
    const slab = determineSlab(taxableValue, integratedTax, centralTax);

    const base = {
      "Sr no.": index + 1,
      Date: formatDate(invoiceDate),
      "Vch No": invoiceNumber,
      "VCH Type": "PURCHASE",
      "Reference No.": invoiceNumber,
      "Reference Date": formatDate(invoiceDate),
      "Supplier Name": pick(row, columnMap.tradeName),
      "GST Registration Type": pick(row, columnMap.invoiceType),
      "GSTIN/UIN": gstin,
      State: mappedState,
      "Supplier State": supplierState,
      "Supplier Amount": invoiceValue || taxableValue,
      "Supplier Dr/Cr": "CR",
      "Ledger Name 5%": "",
      "Ledger Amount 5%": "",
      "Ledger amount cr/dr 5%": "",
      "Ledger Name 12%": "",
      "Ledger Amount 12%": "",
      "Ledger amount Cr/Dr 12%": "",
      "Ledger Name 18%": "",
      "Ledger Amount 18%": "",
      "Ledger amount cr/dr 18%": "",
      "Ledger Name 28%": "",
      "Ledger Amount 28%": "",
      "Ledger amount cr/dr 28%": "",
      "IGST Rate 5%": "",
      "CGST Rate 5%": "",
      "SGST/UTGST Rate 5%": "",
      "IGST Rate 12%": "",
      "CGST Rate 12%": "",
      "SGST/UTGST Rate 12%": "",
      "IGST Rate 18%": "",
      "CGST Rate 18%": "",
      "SGST/UTGST Rate 18%": "",
      "IGST Rate 28%": "",
      "CGST Rate 28%": "",
      "SGST/UTGST Rate 28%": "",
      "GRO Amount": "",
      "Round Off Dr": "",
      "Round Off Cr": "",
      "Invoice Amount": "",
      "Change Mode": "Accounting Inovice",
    };

    if (slab) {
      const mapping = ledgerKeyMap[slab.slab];
      if (mapping) {
        base[mapping.ledgerName] = `Purchase ${slab.slab}`;
        base[mapping.ledgerAmount] = taxableValue;
        base[mapping.ledgerCrDr] = "DR";

        if (slab.mode === "IGST") {
          base[mapping.igst] = integratedTax;
        } else {
          base[mapping.cgst] = centralTax;
          base[mapping.sgst] = stateTax;
        }
      }
    }

    const parsedTaxes = taxKeys.reduce(
      (sum, key) => sum + toNumber(base[key]),
      0
    );
    const fallbackTaxes =
      parsedTaxes > 0 ? parsedTaxes : integratedTax + centralTax + stateTax;

    const ledgerAmount = taxableValue;
    const groAmount = parseFloat((ledgerAmount + fallbackTaxes).toFixed(2));
    const decimalPart = groAmount - Math.floor(groAmount);
    let roundOffDr = 0;
    let roundOffCr = 0;
    let invoiceAmount = groAmount;

    if (decimalPart > 0) {
      if (decimalPart >= 0.5) {
        roundOffCr = parseFloat((Math.ceil(groAmount) - groAmount).toFixed(2));
        invoiceAmount = groAmount + roundOffCr;
      } else {
        roundOffDr = parseFloat((groAmount - Math.floor(groAmount)).toFixed(2));
        invoiceAmount = groAmount - roundOffDr;
      }
    }

    base["GRO Amount"] = groAmount;
    base["Round Off Dr"] = roundOffDr || "";
    base["Round Off Cr"] = roundOffCr || "";
    base["Invoice Amount"] = invoiceAmount;
    base["Supplier Amount"] = invoiceAmount;

    return base;
  };

  const handleGenerate = () => {
    if (!sheetRows.length) {
      setStatus({ type: "error", message: "Upload a B2B sheet with data first." });
      return;
    }
    if (!company) {
      setStatus({ type: "error", message: "Company information missing." });
      return;
    }
    const rows = sheetRows.map((row, index) => buildRow(row, index));
    setGeneratedRows(rows);
    setStatus({
      type: "success",
      message: `Generated ${rows.length} rows. Download when ready.`,
    });
  };

  const handleDownloadGstr2BExcel = () => {
    if (!sheetRows.length) {
      setStatus({
        type: "error",
        message: "Upload a B2B sheet before downloading.",
      });
      return;
    }

    const worksheetRows = sheetRows.map((row) => {
      const entry = {};
      gstr2bHeaders.forEach(({ key, label }) => {
        entry[label] = row?.[key] ?? "";
      });
      return entry;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GSTR-2B");
    const filename = `${sanitizeFileName(
      company?.companyName || "company"
    )}-gstr2b.xlsx`;
    XLSX.writeFile(workbook, filename);
    setStatus({ type: "success", message: "GSTR-2B Excel downloaded." });
  };

  const handleDownloadProcessedExcel = async () => {
    if (!importId) {
      setStatus({
        type: "error",
        message: "Import a sheet before downloading processed data.",
      });
      return;
    }

    try {
      let doc = processedDoc;
      if (!doc) {
        const { data } = await fetchProcessedFile(importId);
        doc = data;
        setProcessedDoc(data);
      }

      const matchedRows = doc?.processedRows || [];
      const mismatchedRows = doc?.mismatchedRows || [];
      if (!matchedRows.length && !mismatchedRows.length) {
        setStatus({
          type: "error",
          message: "No processed rows available. Process the sheet first.",
        });
        return;
      }

      const workbook = XLSX.utils.book_new();
      if (matchedRows.length) {
        const processedSheet = XLSX.utils.json_to_sheet(matchedRows);
        XLSX.utils.book_append_sheet(workbook, processedSheet, "Processed");
      }
      if (mismatchedRows.length) {
        const mismatchedSheet = XLSX.utils.json_to_sheet(mismatchedRows);
        XLSX.utils.book_append_sheet(workbook, mismatchedSheet, "Mismatched");
      }
      const filename = `${sanitizeFileName(
        doc.company || company?.companyName || "company"
      )}-tallymap.xlsx`;
      XLSX.writeFile(workbook, filename);
      setStatus({
        type: "success",
        message: "Processed Tally Map Excel downloaded.",
      });
    } catch (error) {
      console.error("Failed to download processed file:", error);
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Unable to download processed data. Please process the sheet first.",
      });
    }
  };

  const handleProcessSheet = () => {
    if (!importId) {
      setStatus({
        type: "error",
        message: "Upload and import the sheet before processing.",
      });
      return;
    }
    setProcessing(true);
    processGstr2bImport(importId)
      .then(({ data }) => {
        setProcessedDoc(data.processed || null);
        setStatus({
          type: "success",
          message: `Processed ${data.processedCount || 0} rows successfully.`,
        });
      })
      .catch((error) => {
        console.error("Failed to process sheet:", error);
        setStatus({
          type: "error",
          message:
            error?.response?.data?.message ||
            "Unable to process the sheet. Please try again.",
        });
      })
      .finally(() => setProcessing(false));
  };

  const previewRows = useMemo(() => generatedRows.slice(0, 5), [generatedRows]);

  if (!company) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6 space-y-3">
        <p className="text-lg text-slate-700">
          No company selected. Redirecting you to selector...
        </p>
        <button
          onClick={() => navigate("/company-selector")}
          className="px-4 py-2 rounded bg-indigo-600 text-white"
        >
          Go now
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Step 2
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Prepare Purchase Register
          </h1>
          <div className="text-sm text-slate-500">
            <p>Company: {company.companyName}</p>
            <p>GSTIN: {company.gstin || "—"}</p>
            <p>State: {company.state}</p>
            {loadingGST ? (
              <p className="text-xs text-slate-400 mt-1">
                Loading GST state mapping...
              </p>
            ) : null}
          </div>
        </header>

        {status.message ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Upload GST Excel
          </h2>
          <p className="text-sm text-slate-500">
            Accepted formats: .xlsx, .xls. Ensure headers follow the latest GST
            layout.
          </p>
          <label className="mt-4 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 text-indigo-600 transition hover:bg-indigo-100">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-sm font-medium">
              {uploading
                ? "Uploading..."
                : fileMeta.name || "Click to choose file"}
            </span>
            <span className="text-xs text-indigo-500 mt-1">
              {fileMeta.name ? "Replace file" : "Max 10 MB"}
            </span>
          </label>
        </section>

        {sheetRows.length ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                B2B sheet ready
              </h3>
              <p className="text-sm text-slate-500">
                {sheetRows.length} rows imported from {fileMeta.name}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Generate custom sheet
            </button>
          </section>
        ) : null}

        {generatedRows.length ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadGstr2BExcel}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Download GSTR-2B Excel
              </button>
              <button
                onClick={handleDownloadProcessedExcel}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Download Tally Map Excel
              </button>
              <button
                onClick={handleProcessSheet}
                disabled={processing}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {processing ? "Processing..." : "Process Sheet"}
              </button>
            </div>

            {processedDoc ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                Stored {processedDoc.processedRows?.length || 0} matched rows
                and {processedDoc.mismatchedRows?.length || 0} mismatched rows
                for {processedDoc.company || "company"}.
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-slate-600">
                <thead>
                  <tr>
                    {outputColumns.slice(0, 12).map((col) => (
                      <th key={col} className="px-2 py-1 text-left font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row["Sr no."]} className="border-t border-slate-100">
                      {outputColumns.slice(0, 12).map((col) => (
                        <td key={col} className="px-2 py-1">
                          {row[col] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {generatedRows.length > 5 ? (
                <p className="mt-2 text-xs text-slate-400">
                  Showing first 5 rows out of {generatedRows.length}.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
};

export default CompanyProcessor;

