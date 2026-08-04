import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ColorModeProvider } from "./context/ColorModeContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import WritingsPage from "./pages/WritingsPage";
import AIWorkPage from "./pages/AIWorkPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="writings" element={<WritingsPage />} />
            <Route path="ai-work" element={<AIWorkPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ColorModeProvider>
  );
}

export default App;
