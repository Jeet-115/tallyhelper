

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Companymasters from "./pages/Companymasters.jsx";
import Companyselector from "./pages/Companyselector.jsx";
import CompanyProcessor from "./pages/CompanyProcessor.jsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/company-masters" element={<Companymasters />} />
      <Route path="/company-selector" element={<Companyselector />} />
      <Route path="/company-processor" element={<CompanyProcessor />} />
    </Routes>
  </BrowserRouter>
);

export default App;
