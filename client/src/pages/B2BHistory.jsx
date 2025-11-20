import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCompanyMasters } from "../services/companymasterservices";

const B2BHistory = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyMasters()
      .then(({ data }) => {
        setCompanies(data || []);
      })
      .catch((err) => {
        console.error("Failed to load companies:", err);
        setError("Unable to load companies.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
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
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            History
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            B2B Import History
          </h1>
          <p className="text-slate-600 text-sm">
            Select a company to view its historical GSTR-2B imports and processed
            data.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <button
              key={company._id}
              onClick={() =>
                navigate(`/b2b-history/${company._id}`, {
                  state: { company },
                })
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-indigo-400 hover:shadow transition-all"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {company.companyName}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {company.address ? `${company.address}, ` : ""}
                {company.state}, {company.country}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                GSTIN: {company.gstin || "—"}
              </p>
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

export default B2BHistory;

