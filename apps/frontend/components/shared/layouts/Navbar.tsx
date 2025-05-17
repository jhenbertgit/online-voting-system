"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { type JSX } from "react";
import { X, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

/**
 * Navbar is the main top navigation bar for SecureVote.
 * Features responsive navigation, mobile menu, and authentication buttons.
 * @returns {JSX.Element} The navigation bar.
 */
export default function Navbar(): JSX.Element {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Navbar scroll effect with requestAnimationFrame for performance
  useEffect(() => {
    let animationFrameId: number;
    let lastScrollY = window.scrollY;
    const SCROLL_THRESHOLD = 10;

    const handleScroll = () => {
      // Only proceed if we don't have an animation frame already scheduled
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Schedule the update for the next animation frame
      animationFrameId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Only update state if scroll position has meaningfully changed
        if (Math.abs(currentScrollY - lastScrollY) > 1) {
          setIsScrolled(currentScrollY > SCROLL_THRESHOLD);
          lastScrollY = currentScrollY;
        }
      });
    };

    // Use passive event listener for better scrolling performance
    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", handleScroll, opts);

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("scroll", handleScroll, opts);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
          : "bg-background/80"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ShieldCheckIcon
            className="h-6 w-6 text-blue-600"
            aria-hidden="true"
          />
          <span>VoteGuard</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "transition-colors hover:text-blue-600",
                pathname === link.href ? "text-blue-600" : "text-foreground/60"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <SignedOut>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Register</Link>
            </Button>
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton
            afterSwitchSessionUrl="/"
            showName
            appearance={{
              elements: {
                rootBox: "flex items-center gap-3 w-full",
                avatarBox: "h-10 w-10",
                username: "text-base font-semibold text-gray-700",
              },
            }}
          />
        </SignedIn>

        {/* Mobile Hamburger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Toggle menu">
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              {/* Mobile Nav Links */}
              <nav className="mt-8 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 text-lg font-medium transition-colors",
                      pathname === link.href
                        ? "text-blue-600"
                        : "text-foreground/80 hover:text-blue-600"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <SignedOut>
                <div className="mt-auto pb-8 space-y-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/sign-up">Register</Link>
                  </Button>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="mt-auto pb-8">
                  <UserButton afterSwitchSessionUrl="/" />
                </div>
              </SignedIn>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/**
 * ShieldCheckIcon renders a shield with a checkmark for the VoteGuard logo.
 * @param props - SVG props.
 * @returns {JSX.Element} The SVG icon.
 */
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
