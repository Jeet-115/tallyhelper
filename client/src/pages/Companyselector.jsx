import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCompanyMasters } from "../services/companymasterservices";

const Companyselector = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const { data } = await fetchCompanyMasters();
        setCompanies(data || []);
      } catch (err) {
        console.error("Failed to load company masters:", err);
        setError("Unable to load companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const handleSelect = (company) => {
    navigate("/company-processor", { state: { company } });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        Loading companies...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-rose-600">
        {error}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">
            Step 1
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Select a company to continue
          </h1>
          <p className="text-slate-600">
            Pick a company master to bind uploaded invoices and generated Excel
            reports.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <button
              key={company._id}
              onClick={() => handleSelect(company)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-indigo-400 hover:shadow transition-all"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Company Name
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {company.companyName}
                </h2>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {company.address ? <p>{company.address}</p> : null}
                <p>
                  {company.state}, {company.country} - {company.pincode}
                </p>
                <p>GSTIN: {company.gstin || "—"}</p>
                <p>Email: {company.email || "—"}</p>
              </div>
            </button>
          ))}
        </div>

        {!companies.length ? (
          <p className="text-center text-slate-500">
            No companies found. Create one first.
          </p>
        ) : null}
      </section>
    </main>
  );
};

export default Companyselector;

