import type { Row } from "@/services/db";
import type { Product } from "@/lib/mockData";

export const productFromRow = (r: Row<"products">): Product => ({
  id: r.id,
  name: r.name,
  store: r.store,
  price: Number(r.price),
  currency: r.currency,
  purchaseDate: r.purchase_date,
  warrantyMonths: r.warranty_months,
  returnDays: r.return_days,
  category: r.category ?? "General",
  image: r.image_url ?? undefined,
});
