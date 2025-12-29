import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/adminPage/RequireAuth";
import RequireRole from "./components/adminPage/RequireRole";
import AdminLayout from "./components/adminPage/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Rentals from "./pages/admin/Rentals";
import PropertySales from "./pages/admin/PropertySales";
import LandsAndPlots from "./pages/admin/LandsAndPlots";
import PropertyServices from "./pages/admin/PropertyServices";
import Investment from "./pages/admin/Investment";
import ConstructionPropertyManagement from "./pages/admin/ConstructionPropertyManagement";
import PostManagement from "./pages/admin/PostManagement";
import ModeratorDashboard from "./pages/admin/ModeratorDashboard";
import Contacts from "./pages/admin/Contacts";
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
            {/* Admin-only area */}
            <Route
              path="dashboard"
              element={
                <RequireRole roles={["admin"]}>
                  <Dashboard />
                </RequireRole>
              }
            />
            <Route
              path="posts"
              element={
                <RequireRole roles={["admin"]}>
                  <PostManagement />
                </RequireRole>
              }
            />
            <Route
              path="rentals"
              element={
                <RequireRole roles={["admin"]}>
                  <Rentals />
                </RequireRole>
              }
            />
            <Route
              path="property-sales"
              element={
                <RequireRole roles={["admin"]}>
                  <PropertySales />
                </RequireRole>
              }
            />
            <Route
              path="construction-property-management"
              element={
                <RequireRole roles={["admin"]}>
                  <ConstructionPropertyManagement />
                </RequireRole>
              }
            />
            <Route
              path="lands-and-plots"
              element={
                <RequireRole roles={["admin"]}>
                  <LandsAndPlots />
                </RequireRole>
              }
            />
            <Route
              path="property-services"
              element={
                <RequireRole roles={["admin"]}>
                  <PropertyServices />
                </RequireRole>
              }
            />
            <Route
              path="investment"
              element={
                <RequireRole roles={["admin"]}>
                  <Investment />
                </RequireRole>
              }
            />

            {/* Contacts - Admin and Moderator */}
            <Route
              path="contacts"
              element={
                <RequireRole roles={["admin", "moderator"]}>
                  <Contacts />
                </RequireRole>
              }
            />

            {/* Moderator-only area */}
            <Route
              path="moderation"
              element={
                <RequireRole roles={["moderator"]}>
                  <ModeratorDashboard />
                </RequireRole>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
