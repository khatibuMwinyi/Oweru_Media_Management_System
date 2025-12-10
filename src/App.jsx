import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/admin/Dashboard";
import Rentals from "./pages/admin/Rentals";
import PropertySales from "./pages/admin/PropertySales";
import LandsAndPlots from "./pages/admin/LandsAndPlots";
import PropertyServices from "./pages/admin/PropertyServices";
import Investment from "./pages/admin/Investment";
import ConstructionPropertyManagement from "./pages/admin/ConstructionPropertyManagement";
import Login from "./pages/Login";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const mainClass = isAdminRoute
    ? "p-2 sm:p-4 md:p-6 flex-1 min-w-0"
    : "p-0 flex-1 min-w-0";

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">
      {isAdminRoute && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isAdminRoute ? "md:ml-64" : ""
        }`}
      >
        {isAdminRoute && (
          <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        )}

        <main className={mainClass}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/rentals" element={<Rentals />} />
            <Route path="/admin/property-sales" element={<PropertySales />} />
            <Route
              path="/admin/construction-property-management"
              element={<ConstructionPropertyManagement />}
            />
            <Route path="/admin/lands-and-plots" element={<LandsAndPlots />} />
            <Route
              path="/admin/property-services"
              element={<PropertyServices />}
            />
            <Route path="/admin/investment" element={<Investment />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
