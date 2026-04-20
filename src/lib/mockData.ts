export type ReceiptStatus = "active" | "expiring" | "expired";

export interface Product {
  id: string;
  name: string;
  store: string;
  price: number;
  currency: string;
  purchaseDate: string; // ISO
  warrantyMonths: number;
  returnDays: number;
  category: string;
  image?: string;
}

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Sony WH-1000XM5 Headphones",
    store: "Amazon",
    price: 349.99,
    currency: "$",
    purchaseDate: daysAgo(5),
    warrantyMonths: 12,
    returnDays: 30,
    category: "Electronics",
  },
  {
    id: "p2",
    name: "Dyson V15 Vacuum Cleaner",
    store: "Best Buy",
    price: 749.0,
    currency: "$",
    purchaseDate: daysAgo(25),
    warrantyMonths: 24,
    returnDays: 30,
    category: "Home",
  },
  {
    id: "p3",
    name: "Apple iPad Air (M2)",
    store: "Apple Store",
    price: 599.0,
    currency: "$",
    purchaseDate: daysAgo(180),
    warrantyMonths: 12,
    returnDays: 14,
    category: "Electronics",
  },
  {
    id: "p4",
    name: "Nike Pegasus 41 Running Shoes",
    store: "Nike.com",
    price: 140.0,
    currency: "$",
    purchaseDate: daysAgo(400),
    warrantyMonths: 6,
    returnDays: 60,
    category: "Apparel",
  },
  {
    id: "p5",
    name: "Instant Pot Duo 7-in-1",
    store: "Flipkart",
    price: 89.99,
    currency: "$",
    purchaseDate: daysAgo(330),
    warrantyMonths: 12,
    returnDays: 30,
    category: "Kitchen",
  },
];

export const getDates = (p: Product) => {
  const purchase = new Date(p.purchaseDate);
  const warrantyEnd = new Date(purchase);
  warrantyEnd.setMonth(warrantyEnd.getMonth() + p.warrantyMonths);
  const returnEnd = new Date(purchase);
  returnEnd.setDate(returnEnd.getDate() + p.returnDays);
  return { purchase, warrantyEnd, returnEnd };
};

export const getStatus = (p: Product): ReceiptStatus => {
  const { warrantyEnd } = getDates(p);
  const now = new Date();
  const daysLeft = Math.floor((warrantyEnd.getTime() - now.getTime()) / 86400000);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "active";
};

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
