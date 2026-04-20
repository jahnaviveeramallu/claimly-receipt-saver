import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`}>
    <img src={logo} alt="Claimly logo" className="h-9 w-9 object-contain transition-transform group-hover:scale-110" />
    <span className="font-display text-xl font-bold tracking-tight">Claimly</span>
  </Link>
);
