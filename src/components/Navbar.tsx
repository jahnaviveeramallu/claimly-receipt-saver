import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/#features", label: "Features" },
    { to: "/#how", label: "How it works" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.to} href={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup" className="hidden sm:inline-flex">
              <Button variant="hero" size="sm">Get started</Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container py-4 flex flex-col gap-3">
              {links.map((l) => (
                <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-2">
                  {l.label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Log in</Button></Link>
                <Link to="/signup" className="flex-1"><Button variant="hero" className="w-full">Sign up</Button></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
