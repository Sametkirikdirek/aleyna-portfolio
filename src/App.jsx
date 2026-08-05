import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ColorModeProvider } from "./context/ColorModeContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import WritingsPage from "./pages/WritingsPage";
import WritingDetailPage from "./pages/WritingDetailPage";
import AIWorkPage from "./pages/AIWorkPage";
import ContactPage from "./pages/ContactPage";

// Admin
import LoginPage from "./admin/LoginPage";
import Dashboard from "./admin/Dashboard";
import ProtectedRoute from "./admin/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ColorModeProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Genel Site Rotaları ── */}
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="writings" element={<WritingsPage />} />
              <Route path="writings/:id" element={<WritingDetailPage />} />
              <Route path="ai-work" element={<AIWorkPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* ── Gizli Admin Rotaları ── */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* /admin → doğrudan dashboard'a yönlendir */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Routes>
        </BrowserRouter>
      </ColorModeProvider>
    </AuthProvider>
  );
}

export default App;
