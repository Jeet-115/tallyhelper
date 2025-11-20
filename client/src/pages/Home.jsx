import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 text-slate-900 p-6">
      <section className="text-center max-w-lg space-y-4">
        <h1 className="text-3xl font-bold">Tally Helper</h1>
        <p className="text-slate-600">
          Manage company masters effortlessly. Create, update, and track key
          organizational details from a single dashboard.
        </p>
      </section>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate("/company-masters")}
          className="px-5 py-3 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition-colors"
        >
          Manage Company Masters
        </button>
        <button
          onClick={() => navigate("/company-selector")}
          className="px-5 py-3 rounded-md border border-indigo-200 text-indigo-700 font-medium shadow hover:bg-indigo-50 transition-colors"
        >
          Generate Purchase Register
        </button>
      </div>
    </main>
  );
};

export default Home;

