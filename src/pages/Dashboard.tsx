import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { ProductCard } from "@/components/ProductCard";
import { ClaimDialog } from "@/components/ClaimDialog";
import { AddProductDialog } from "@/components/AddProductDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getStatus, Product, fmtDate } from "@/lib/mockData";
import { productFromRow } from "@/lib/adapters";
import { db, type Row } from "@/services/db";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { LogOut, Search, Receipt, ShieldCheck, AlertTriangle, DollarSign, Settings, Plus, FileText } from "lucide-react";

type Filter = "all" | "active" | "expiring" | "expired";

const claimStatusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (s) {
    case "resolved": return "default";
    case "rejected": return "destructive";
    case "in_progress":
    case "sent": return "secondary";
    default: return "outline";
  }
};

const Dashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [active, setActive] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => db.list("products"),
    enabled: !!user,
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["receipts"],
    queryFn: () => db.list("receipts"),
    enabled: !!user,
  });

  const { data: claims = [] } = useQuery({
    queryKey: ["claims"],
    queryFn: () => db.list("claims"),
    enabled: !!user,
  });

  const products: Product[] = useMemo(() => rows.map(productFromRow), [rows]);
  const productById = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

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

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${products.length})` },
    { id: "active", label: "Active" },
    { id: "expiring", label: "Expiring" },
    { id: "expired", label: "Expired" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Your dashboard</h1>
            <p className="text-muted-foreground mt-1">Track receipts, warranties and claims — all in one place.</p>
          </div>
          <Button variant="hero" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </div>

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

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="rounded-full">
            <TabsTrigger value="products" className="rounded-full">Products</TabsTrigger>
            <TabsTrigger value="receipts" className="rounded-full">Receipts ({receipts.length})</TabsTrigger>
            <TabsTrigger value="claims" className="rounded-full">Claims ({claims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <ReceiptUpload />

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

            {isLoading ? (
              <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">Loading…</div>
            ) : filtered.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} onClaim={setActive} index={i} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                No products yet. Tap "Add product" to start tracking.
              </div>
            )}
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <ReceiptUpload />
            {(() => {
              const all = receipts as Row<"receipts">[];
              const isWarranty = (r: Row<"receipts">) =>
                r.notes?.toLowerCase().includes("[warranty]") ||
                (r.notes?.toLowerCase().includes("warranty") && !r.notes?.toLowerCase().includes("[expense]"));
              const warrantyReceipts = all.filter(isWarranty);
              const expenseReceipts = all.filter((r) => !isWarranty(r));

              const renderCard = (r: Row<"receipts">, hasWarranty: boolean) => (
                <div key={r.id} className="rounded-2xl bg-card border p-4 shadow-soft">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${hasWarranty ? "bg-success/10" : "bg-lavender/10"}`}>
                      <FileText className={`h-5 w-5 ${hasWarranty ? "text-success" : "text-lavender"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{r.merchant}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(new Date(r.purchase_date))}
                      </div>
                    </div>
                    <div className="font-display font-semibold">
                      {r.currency}{Number(r.total).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {hasWarranty ? (
                      <Badge variant="default" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Warranty
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="h-3 w-3" /> Expense
                      </Badge>
                    )}
                    {r.notes && (
                      <span className="text-xs text-muted-foreground truncate">
                        {r.notes.replace(/^\[(warranty|expense)\]\s*/i, "")}
                      </span>
                    )}
                  </div>
                </div>
              );

              if (all.length === 0) {
                return (
                  <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                    No receipts uploaded yet.
                  </div>
                );
              }

              return (
                <div className="space-y-8">
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-success" />
                      <h2 className="font-display text-xl font-semibold">Warranty Tracking</h2>
                      <Badge variant="secondary">{warrantyReceipts.length}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Receipts with detected warranty info.</p>
                    {warrantyReceipts.length ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {warrantyReceipts.map((r) => renderCard(r, true))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No warranty receipts yet.
                      </div>
                    )}
                  </section>

                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-lavender" />
                      <h2 className="font-display text-xl font-semibold">Expense Tracking</h2>
                      <Badge variant="secondary">{expenseReceipts.length}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Payment receipts without warranty info — track your spending.</p>
                    {expenseReceipts.length ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expenseReceipts.map((r) => renderCard(r, false))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No expense-only receipts yet.
                      </div>
                    )}
                  </section>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            {claims.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                No claims yet. Open any product and tap "Generate claim".
              </div>
            ) : (
              <div className="space-y-3">
                {(claims as Row<"claims">[]).map((c) => {
                  const p = c.product_id ? productById.get(c.product_id) : null;
                  return (
                    <div key={c.id} className="rounded-2xl bg-card border p-4 shadow-soft">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{p?.name ?? "Unknown product"}</span>
                            <Badge variant="outline" className="capitalize">{c.type}</Badge>
                            <Badge variant={claimStatusVariant(c.status)} className="capitalize">
                              {c.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.reason}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {fmtDate(new Date(c.created_at))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <ClaimDialog product={active} onClose={() => setActive(null)} />
      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

export default Dashboard;
