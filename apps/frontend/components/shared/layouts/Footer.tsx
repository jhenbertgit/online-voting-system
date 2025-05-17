"use client";

import Link from "next/link";
import { ShieldCheck, Code2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Footer component that displays the site footer with essential links and information.
 * @returns {React.JSX.Element} The enhanced footer component.
 */
export function Footer(): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Documentation", href: "/docs" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  const socialLinks = [
{
      name: "Message Us",
      icon: <MessageCircle className="h-4 w-4" />,
     href: "https://m.me/voteguard", // Update with actual messenger link
    },
    {
      name: "Source Code",
      icon: <Code2 className="h-4 w-4" />,
     href: "https://github.com/voteguard/voteguard", // Update with actual GitHub repository
    },
    {
      name: "Contact",
      icon: <Mail className="h-4 w-4" />,
      href: "mailto:support@voteguard.org",
    },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand and copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5" />
            <span>VoteGuard</span>
            <span>•</span>
            <span>&copy; {currentYear}</span>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap justify-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Social links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
