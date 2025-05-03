"use client";

import { type JSX } from "react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

/**
 * LayoutWithConditionalNavbar conditionally renders the Navbar based on the current route.
 * Hides Navbar on /admin, /sign-in, /sign-up, and /redirect routes.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @returns {JSX.Element} The layout with conditional Navbar and footer.
 */
export default function LayoutWithConditionalNavbar({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const hideNavbarRoutes = ["/admin", "/sign-in", "/sign-up", "/redirect"];
  const showNavbar = !hideNavbarRoutes.some((route) =>
    pathname.startsWith(route)
  );
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      {children}
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-gray-500">
          2025 VoteGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
