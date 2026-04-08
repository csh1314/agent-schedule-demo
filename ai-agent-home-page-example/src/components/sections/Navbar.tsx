import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import { NAV_LINKS } from "@/data/constants";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50 shadow-lg shadow-black/10"
          : "bg-transparent",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <a
          href="#"
          className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          AgentHub
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm text-slate-300 transition-colors duration-200 hover:text-white cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <GlowButton variant="primary" size="default">
            立即注册
          </GlowButton>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden flex-col justify-center gap-1.5 p-2 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={cn(
              "block h-0.5 w-6 bg-white transition-all duration-300",
              mobileMenuOpen && "translate-y-2 rotate-45"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-white transition-all duration-300",
              mobileMenuOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-white transition-all duration-300",
              mobileMenuOpen && "-translate-y-2 -rotate-45"
            )}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 bg-slate-900/95 backdrop-blur-lg",
          mobileMenuOpen ? "max-h-64 border-b border-slate-800/50" : "max-h-0"
        )}
      >
        <div className="flex flex-col gap-4 px-4 py-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-left text-sm text-slate-300 transition-colors duration-200 hover:text-white cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <GlowButton variant="primary" size="default" className="w-full">
            立即注册
          </GlowButton>
        </div>
      </div>
    </nav>
  );
}
