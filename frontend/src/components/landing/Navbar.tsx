import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo.png";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#features", badge: "06" },
  { label: "Project", href: "#how-it-works", badge: "09" },
  { label: "Dashboard", to: "/dashboard" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Logo & Brand Name */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
            <img src={logoImage} alt="ByzantineMind Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-widest text-[#e2e8f0]">
            BYZANTINE<span className="text-[#10b981]">MIND</span>
          </span>
        </Link>


        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.to ? (
              <Link key={link.label} to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
                {link.badge && (
                  <span className="font-mono-code text-[10px] text-muted-foreground/50">{link.badge}</span>
                )}
              </a>
            )
          )}
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <Search className="h-4 w-4" />
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 glow-green"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              {navLinks.map((link) =>
                link.to ? (
                  <Link key={link.label} to={link.to} className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </a>
                )
              )}
              <Link to="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}