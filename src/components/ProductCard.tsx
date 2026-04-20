import { Product, getDates, getStatus, fmtDate } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, ShieldCheck, RotateCcw, Store } from "lucide-react";
import { motion } from "framer-motion";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success",
  expiring: "bg-warning/15 text-warning",
  expired: "bg-destructive/15 text-destructive",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
};

interface Props {
  product: Product;
  onClaim: (p: Product) => void;
  index?: number;
}

export const ProductCard = ({ product, onClaim, index = 0 }: Props) => {
  const status = getStatus(product);
  const { purchase, warrantyEnd, returnEnd } = getDates(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group rounded-2xl bg-card border p-5 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-base truncate">{product.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Store className="h-3 w-3" />
            <span>{product.store}</span>
            <span>•</span>
            <span>{product.category}</span>
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      <div className="text-2xl font-display font-bold text-gradient-brand mb-4">
        {product.currency}{product.price.toFixed(2)}
      </div>

      <div className="space-y-2 text-sm border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Purchased</span>
          <span className="font-medium">{fmtDate(purchase)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Warranty until</span>
          <span className="font-medium">{fmtDate(warrantyEnd)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" /> Return by</span>
          <span className="font-medium">{fmtDate(returnEnd)}</span>
        </div>
      </div>

      <Button onClick={() => onClaim(product)} variant="hero" size="sm" className="w-full mt-5">
        <Sparkles className="h-4 w-4" />
        Generate claim
      </Button>
    </motion.div>
  );
};
