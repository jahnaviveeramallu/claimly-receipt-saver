import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { db } from "@/services/db";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  store: z.string().trim().min(1, "Store is required").max(80),
  price: z.coerce.number().min(0, "Price must be ≥ 0").max(1_000_000),
  currency: z.string().trim().min(1).max(4),
  purchase_date: z.string().min(1, "Purchase date is required"),
  warranty_months: z.coerce.number().int().min(0).max(240),
  return_days: z.coerce.number().int().min(0).max(365),
  category: z.string().trim().max(60).optional(),
});

const today = () => new Date().toISOString().slice(0, 10);

export const AddProductDialog = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState("$");
  const [category, setCategory] = useState("Electronics");

  const mut = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      db.create("products", {
        name: values.name,
        store: values.store,
        price: values.price,
        currency: values.currency,
        purchase_date: values.purchase_date,
        warranty_months: values.warranty_months,
        return_days: values.return_days,
        category: values.category ?? null,
        user_id: user!.id,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get("name"),
      store: fd.get("store"),
      price: fd.get("price"),
      currency,
      purchase_date: fd.get("purchase_date"),
      warranty_months: fd.get("warranty_months"),
      return_days: fd.get("return_days"),
      category,
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    mut.mutate(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add a product</DialogTitle>
          <DialogDescription>Track warranty and return windows for a new purchase.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <Field label="Product name" id="name" error={errors.name}>
            <Input id="name" name="name" placeholder="Sony WH-1000XM5" className="rounded-xl" />
          </Field>

          <Field label="Store" id="store" error={errors.store}>
            <Input id="store" name="store" placeholder="Amazon" className="rounded-xl" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price" id="price" error={errors.price} className="col-span-2">
              <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue="0" className="rounded-xl" />
            </Field>
            <Field label="Currency" id="currency">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["$", "€", "£", "¥", "₹", "A$", "C$"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Purchase date" id="purchase_date" error={errors.purchase_date}>
            <Input id="purchase_date" name="purchase_date" type="date" defaultValue={today()} className="rounded-xl" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Warranty (months)" id="warranty_months" error={errors.warranty_months}>
              <Input id="warranty_months" name="warranty_months" type="number" min="0" max="240" defaultValue="12" className="rounded-xl" />
            </Field>
            <Field label="Return window (days)" id="return_days" error={errors.return_days}>
              <Input id="return_days" name="return_days" type="number" min="0" max="365" defaultValue="30" className="rounded-xl" />
            </Field>
          </div>

          <Field label="Category" id="category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Electronics", "Home", "Kitchen", "Apparel", "Beauty", "Sports", "Books", "Other"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={mut.isPending}>
              {mut.isPending ? "Saving…" : "Save product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({
  label, id, children, error, className,
}: { label: string; id: string; children: React.ReactNode; error?: string; className?: string }) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);
