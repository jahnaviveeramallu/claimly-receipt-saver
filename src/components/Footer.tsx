import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer className="border-t bg-gradient-soft mt-24">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div className="md:col-span-2">
        <Logo />
        <p className="mt-3 text-sm text-muted-foreground max-w-xs">
          Turn receipts into refunds and warranties — automatically.
        </p>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3 text-sm">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#features" className="hover:text-foreground">Features</a></li>
          <li><a href="#how" className="hover:text-foreground">How it works</a></li>
          <li><a href="/dashboard" className="hover:text-foreground">Dashboard</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">About</a></li>
          <li><a href="#" className="hover:text-foreground">Privacy</a></li>
          <li><a href="#" className="hover:text-foreground">Terms</a></li>
        </ul>
      </div>
    </div>
    <div className="container border-t py-6 text-xs text-muted-foreground flex justify-between">
      <span>© {new Date().getFullYear()} Claimly. All rights reserved.</span>
      <span>Made with care.</span>
    </div>
  </footer>
);
