import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ColorModeProvider } from "./context/ColorModeContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import PageLoader from "./components/ui/PageLoader";

// 🚀 Route-based Code Splitting (Sayfalar yalnızca ziyaret edildiğinde yüklenir)
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const WritingsPage = lazy(() => import("./pages/WritingsPage"));
const WritingDetailPage = lazy(() => import("./pages/WritingDetailPage"));
const AIWorkPage = lazy(() => import("./pages/AIWorkPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

// 🔒 Admin Paneli (Ağır admin bileşenleri ana siteden izole yüklenir)
const LoginPage = lazy(() => import("./admin/LoginPage"));
const Dashboard = lazy(() => import("./admin/Dashboard"));

import { Analytics } from "@vercel/analytics/react";
import ProtectedRoute from "./admin/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Analytics />
      <ColorModeProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ─── Genel Site Rotaları ─── */}
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="writings" element={<WritingsPage />} />
                <Route path="writings/:id" element={<WritingDetailPage />} />
                <Route path="ai-work" element={<AIWorkPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* ─── Gizli Admin Rotaları ─── */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* /admin ➔ doğrudan dashboard'a yönlendir */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ColorModeProvider>
    </AuthProvider>
  );
}

export default App;
