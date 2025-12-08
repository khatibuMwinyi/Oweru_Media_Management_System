import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Rentals from "./pages/Rentals";
import PropertySales from "./pages/PropertySales";
import LandsAndPlots from "./pages/LandsAndPlots";
import PropertyServices from "./pages/PropertyServices";
import Investment from "./pages/Investment";
import ConstructionPropertyManagement from "./pages/ConstructionPropertyManagement";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

          <main className="p-2 sm:p-4 md:p-6 flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/property-sales" element={<PropertySales />} />
              <Route
                path="/construction-property-management"
                element={<ConstructionPropertyManagement />}
              />
              <Route path="/lands-and-plots" element={<LandsAndPlots />} />
              <Route path="/property-services" element={<PropertyServices />} />
              <Route path="/investment" element={<Investment />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
