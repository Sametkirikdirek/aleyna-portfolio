import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import GlobalFallingLeaves from "./ui/GlobalFallingLeaves";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
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
