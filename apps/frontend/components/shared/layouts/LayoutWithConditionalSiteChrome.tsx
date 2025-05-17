"use client";

import React from "react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/**
 * LayoutWithConditionalSiteChrome conditionally renders the Navbar and Footer based on the current route.
 * Hides site chrome (Navbar and Footer) on /admin, /sign-in, /sign-up, and /redirect routes.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @returns {JSX.Element} The layout with conditional Navbar and footer.
 */
export default function LayoutWithConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const hideSiteChromeRoutes = ["/admin", "/sign-in", "/sign-up", "/redirect"];
  const showSiteChrome = !hideSiteChromeRoutes.some((route) =>
    pathname.startsWith(route)
  );
  return (
    <div className="min-h-screen flex flex-col">
      {showSiteChrome && <Navbar />}
      {children}
      {showSiteChrome && <Footer />}
    </div>
  );
}
