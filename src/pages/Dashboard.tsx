import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { ProductCard } from "@/components/ProductCard";
import { ClaimDialog } from "@/components/ClaimDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockProducts, getStatus, Product } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { LogOut, Search, Receipt, ShieldCheck, AlertTriangle, DollarSign } from "lucide-react";

type Filter = "all" | "active" | "expiring" | "expired";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [active, setActive] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const total = products.length;
    const expiring = products.filter((p) => getStatus(p) === "expiring").length;
    const activeCount = products.filter((p) => getStatus(p) === "active").length;
    const value = products.reduce((s, p) => s + p.price, 0);
    return { total, expiring, activeCount, value };
  }, [products]);

  const filtered = products.filter((p) => {
    const matchFilter = filter === "all" || getStatus(p) === filter;
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.store.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  const handleUpload = () => {
    const sample: Product = {
      id: `p${Date.now()}`,
      name: "New Scanned Product",
      store: "Amazon",
      price: Math.round(Math.random() * 400 + 30),
      currency: "$",
      purchaseDate: new Date().toISOString(),
      warrantyMonths: 12,
      returnDays: 30,
      category: "Electronics",
    };
    setProducts([sample, ...products]);
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${products.length})` },
    { id: "active", label: "Active" },
    { id: "expiring", label: "Expiring" },
    { id: "expired", label: "Expired" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-8">
        {/* greeting */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Your dashboard</h1>
            <p className="text-muted-foreground mt-1">Track receipts, warranties and claims — all in one place.</p>
          </div>
        </div>

        {/* stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Receipt, label: "Receipts tracked", value: stats.total, color: "text-primary", bg: "bg-primary/10" },
            { icon: ShieldCheck, label: "Active warranties", value: stats.activeCount, color: "text-success", bg: "bg-success/10" },
            { icon: AlertTriangle, label: "Expiring soon", value: stats.expiring, color: "text-warning", bg: "bg-warning/10" },
            { icon: DollarSign, label: "Total value", value: `$${stats.value.toFixed(0)}`, color: "text-lavender", bg: "bg-lavender/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card border p-5 shadow-soft">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* upload */}
        <ReceiptUpload onUpload={handleUpload} />

        {/* filters & search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f.id ? "bg-foreground text-background" : "bg-card border hover:bg-accent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 rounded-full"
            />
          </div>
        </div>

        {/* product grid */}
        {filtered.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onClaim={setActive} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            No products match your filters yet.
          </div>
        )}
      </main>

      <ClaimDialog product={active} onClose={() => setActive(null)} />
    </div>
  );
};

export default Dashboard;
