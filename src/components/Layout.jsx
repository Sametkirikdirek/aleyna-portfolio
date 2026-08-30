import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import GlobalFallingLeaves from "./ui/GlobalFallingLeaves";
import { trackPageView } from "../lib/firestore";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Gerçek sayfa ziyareti takibi (admin sayfaları hariç)
    if (!pathname.startsWith("/admin")) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <>
      <GlobalFallingLeaves />
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  );
}
