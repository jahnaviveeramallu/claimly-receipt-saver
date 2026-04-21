import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { db, type TableName } from "@/services/db";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
import { toast } from "sonner";

const TABLES: { name: TableName; label: string; searchCol: string; fields: string[] }[] = [
  { name: "products", label: "Products", searchCol: "name", fields: ["name", "store", "price", "currency", "purchase_date", "warranty_months", "return_days", "category", "image_url"] },
  { name: "receipts", label: "Receipts", searchCol: "merchant", fields: ["merchant", "total", "currency", "purchase_date", "file_url", "notes"] },
  { name: "claims", label: "Claims", searchCol: "reason", fields: ["type", "status", "reason", "message", "resolution", "amount"] },
  { name: "profiles", label: "Profiles", searchCol: "display_name", fields: ["display_name", "avatar_url"] },
];

const HIDDEN = new Set(["id", "created_at", "updated_at", "user_id"]);

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TableName>("products");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tableMeta = TABLES.find((t) => t.name === tab)!;

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [tab, query],
    queryFn: () => db.list(tab, query ? { search: { column: tableMeta.searchCol, value: query } } : {}),
    enabled: !!user,
  });

  const columns = useMemo(() => {
    if (!rows.length) return tableMeta.fields;
    return Object.keys(rows[0] as any).filter((k) => !HIDDEN.has(k));
  }, [rows, tableMeta.fields]);

  const upsertMut = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const payload: any = { ...values };
      // coerce numerics
      for (const k of Object.keys(payload)) {
        if (payload[k] === "") payload[k] = null;
      }
      if (editing) {
        return db.update(tab, editing.id, payload);
      }
      payload.user_id = user!.id;
      return db.create(tab, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tab] });
      toast.success(editing ? "Updated" : "Created");
      setEditing(null);
      setCreating(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => db.remove(tab, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tab] });
      toast.success("Deleted");
      setDeletingId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const dialogOpen = creating || !!editing;
  const dialogValues = editing ?? {};

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Logo />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" /> Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? "Manage every table across all users."
                : "You see only your own rows. Ask an admin to grant access for full control."}
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as TableName); setQuery(""); }}>
          <TabsList className="rounded-full">
            {TABLES.map((t) => (
              <TabsTrigger key={t.name} value={t.name} className="rounded-full">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABLES.map((t) => (
            <TabsContent key={t.name} value={t.name} className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search by ${t.searchCol}…`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 h-10 rounded-full"
                  />
                </div>
                {t.name !== "profiles" && (
                  <Button variant="hero" onClick={() => setCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> New {t.label.slice(0, -1)}
                  </Button>
                )}
              </div>

              <div className="rounded-2xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((c) => (
                        <TableHead key={c} className="whitespace-nowrap capitalize">
                          {c.replaceAll("_", " ")}
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-10">Loading…</TableCell></TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow><TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-10">No rows yet.</TableCell></TableRow>
                    ) : rows.map((r: any) => (
                      <TableRow key={r.id}>
                        {columns.map((c) => (
                          <TableCell key={c} className="max-w-[260px] truncate">
                            {r[c] === null || r[c] === undefined ? <span className="text-muted-foreground">—</span> : String(r[c])}
                          </TableCell>
                        ))}
                        <TableCell className="text-right space-x-1 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingId(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? `Edit ${tableMeta.label.slice(0, -1)}` : `New ${tableMeta.label.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const values: Record<string, any> = {};
              for (const f of tableMeta.fields) {
                const v = fd.get(f);
                if (v !== null) values[f] = v;
              }
              upsertMut.mutate(values);
            }}
            className="space-y-3 pt-2"
          >
            {tableMeta.fields.map((f) => (
              <div key={f} className="space-y-1.5">
                <Label htmlFor={f} className="capitalize">{f.replaceAll("_", " ")}</Label>
                <Input
                  id={f}
                  name={f}
                  defaultValue={dialogValues[f] ?? ""}
                  className="rounded-xl"
                />
              </div>
            ))}
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={upsertMut.isPending}>
                {upsertMut.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this row?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteMut.mutate(deletingId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
