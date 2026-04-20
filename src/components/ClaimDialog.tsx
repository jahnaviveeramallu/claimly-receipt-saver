import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Product, fmtDate, getDates } from "@/lib/mockData";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  product: Product | null;
  onClose: () => void;
}

const buildRefund = (p: Product) => {
  const { purchase } = getDates(p);
  return `Subject: Refund request — ${p.name} (Order from ${p.store})

Hello ${p.store} Support Team,

I am writing to request a refund for the following purchase:

• Product: ${p.name}
• Purchase date: ${fmtDate(purchase)}
• Amount: ${p.currency}${p.price.toFixed(2)}
• Store: ${p.store}

The product did not meet expectations and I would like to return it for a full refund. As this purchase is still within the ${p.returnDays}-day return window, I would appreciate your assistance in processing this request promptly.

Please confirm the next steps for return shipping and refund processing.

Thank you for your time and support.

Best regards,
[Your Name]`;
};

const buildWarranty = (p: Product) => {
  const { purchase, warrantyEnd } = getDates(p);
  return `Subject: Warranty claim — ${p.name}

Hello ${p.store} Customer Service,

I'm submitting a warranty claim for a product I purchased that is currently malfunctioning.

• Product: ${p.name}
• Purchase date: ${fmtDate(purchase)}
• Warranty valid until: ${fmtDate(warrantyEnd)}
• Amount paid: ${p.currency}${p.price.toFixed(2)}

The product has developed a fault and is no longer functioning as expected. As it is well within the manufacturer's warranty period, I would like to request a repair or replacement under warranty.

Please advise on the documentation required and the next steps to process this claim.

Thank you for your assistance.

Best regards,
[Your Name]`;
};

export const ClaimDialog = ({ product, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"refund" | "warranty">("refund");

  useEffect(() => { setCopied(false); setTab("refund"); }, [product]);

  if (!product) return null;
  const text = tab === "refund" ? buildRefund(product) : buildWarranty(product);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Claim copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-generated claim
          </DialogTitle>
          <DialogDescription>For <span className="font-medium text-foreground">{product.name}</span></DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "refund" | "warranty")}>
          <TabsList className="grid grid-cols-2 w-full rounded-full">
            <TabsTrigger value="refund" className="rounded-full">Refund request</TabsTrigger>
            <TabsTrigger value="warranty" className="rounded-full">Warranty claim</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4">
            <pre className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap font-sans max-h-[400px] overflow-auto border">
              {text}
            </pre>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="hero" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy claim"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
