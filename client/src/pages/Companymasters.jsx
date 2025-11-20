import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  fetchCompanyMasters,
  createCompanyMaster,
  updateCompanyMaster,
  deleteCompanyMaster,
} from "../services/companymasterservices";

const initialFormState = {
  companyName: "",
  mailingName: "",
  address: "",
  state: "",
  country: "",
  pincode: "",
  telephone: "",
  mobile: "",
  email: "",
  tanNumber: "",
  gstin: "",
};

const Companymasters = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const formTitle = useMemo(
    () => (selectedId ? "Update Company Master" : "Create Company Master"),
    [selectedId]
  );

  const setAlert = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3500);
  };

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await fetchCompanyMasters();
      setCompanies(data || []);
    } catch (error) {
      console.error("Failed to load company masters:", error);
      setAlert("error", error?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (selectedId) {
        await updateCompanyMaster(selectedId, formData);
        setAlert("success", "Company master updated successfully");
      } else {
        await createCompanyMaster(formData);
        setAlert("success", "Company master created successfully");
      }
      resetForm();
      await loadCompanies();
    } catch (error) {
      console.error("Failed to save company master:", error);
      setAlert(
        "error",
        error?.response?.data?.message || "Operation could not be completed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setSelectedId(company._id);
    setFormData({
      companyName: company.companyName || "",
      mailingName: company.mailingName || "",
      address: company.address || "",
      state: company.state || "",
      country: company.country || "",
      pincode: company.pincode || "",
      telephone: company.telephone || "",
      mobile: company.mobile || "",
      email: company.email || "",
      tanNumber: company.tanNumber || "",
      gstin: company.gstin || "",
    });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteCompanyMaster(confirmDeleteId);
      setAlert("success", "Company master deleted successfully");
      setConfirmDeleteId(null);
      if (selectedId === confirmDeleteId) {
        resetForm();
      }
      await loadCompanies();
    } catch (error) {
      console.error("Failed to delete company master:", error);
      setAlert(
        "error",
        error?.response?.data?.message || "Failed to delete company master"
      );
    }
  };

  const formFields = [
    { label: "Company Name", name: "companyName", required: true },
    { label: "Mailing Name", name: "mailingName" },
    { label: "Address", name: "address" },
    { label: "State", name: "state" },
    { label: "Country", name: "country" },
    { label: "Pincode", name: "pincode" },
    { label: "Telephone", name: "telephone" },
    { label: "Mobile", name: "mobile" },
    { label: "Email", name: "email", type: "email" },
    { label: "TAN Number", name: "tanNumber" },
    { label: "GSTIN/UIN", name: "gstin" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            Company Masters
          </h1>
          <p className="text-slate-600">
            Create, update, and review company master records.
          </p>
        </header>

        {status.message ? (
          <div
            className={`rounded-md px-4 py-2 text-sm ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{formTitle}</h2>
            {selectedId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-slate-500 underline"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            {formFields.map(({ label, name, type = "text", required }) => (
              <label key={name} className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">
                  {label} {required ? "*" : ""}
                </span>
                <input
                  type={type}
                  name={name}
                  required={required}
                  value={formData[name]}
                  onChange={handleChange}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            ))}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {saving ? "Saving..." : selectedId ? "Update Company" : "Create Company"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Existing Company Masters
            </h2>
            <button
              onClick={loadCompanies}
              disabled={loading}
              className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-3 py-2">Company Name</th>
                  <th className="px-3 py-2">Mailing Name</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">GSTIN / TAN</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length ? (
                  companies.map((company) => (
                    <tr
                      key={company._id}
                      className="border-t border-slate-100 text-slate-700"
                    >
                      <td className="px-3 py-3 font-medium">
                        <div className="flex flex-col">
                          <span>{company.companyName}</span>
                          <span className="text-xs text-slate-500">
                            {company.address}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">{company.mailingName}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col text-xs">
                          <span>Tel: {company.telephone || "N/A"}</span>
                          <span>Mobile: {company.mobile || "N/A"}</span>
                          <span>Email: {company.email || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <span>{company.state}</span>,{" "}
                        <span>{company.country}</span>
                        <div>Pincode: {company.pincode || "N/A"}</div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div>GSTIN: {company.gstin || "N/A"}</div>
                        <div>TAN: {company.tanNumber || "N/A"}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-3 text-sm">
                          <button
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={() => handleEdit(company)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-rose-600 hover:text-rose-800"
                            onClick={() => setConfirmDeleteId(company._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      {loading
                        ? "Loading company masters..."
                        : "No company masters found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete Company Master"
        message="Are you sure you want to delete this company master? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </main>
  );
};

export default Companymasters;

