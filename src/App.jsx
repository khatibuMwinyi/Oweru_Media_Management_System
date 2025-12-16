import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Rentals from "./pages/admin/Rentals";
import PropertySales from "./pages/admin/PropertySales";
import LandsAndPlots from "./pages/admin/LandsAndPlots";
import PropertyServices from "./pages/admin/PropertyServices";
import Investment from "./pages/admin/Investment";
import ConstructionPropertyManagement from "./pages/admin/ConstructionPropertyManagement";
import PostManagement from "./pages/admin/PostManagement";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="property-sales" element={<PropertySales />} />
            <Route
              path="construction-property-management"
              element={<ConstructionPropertyManagement />}
            />
            <Route path="lands-and-plots" element={<LandsAndPlots />} />
            <Route path="property-services" element={<PropertyServices />} />
            <Route path="investment" element={<Investment />} />
          </Route>

          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
