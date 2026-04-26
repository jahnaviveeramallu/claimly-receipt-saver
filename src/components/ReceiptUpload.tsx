import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/services/db";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  onUploaded?: () => void;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ReceiptUpload = ({ onUploaded }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length || !user) return;
    const file = files[0];

    if (!ALLOWED.includes(file.type)) {
      toast.error("Only PNG, JPG, WEBP or PDF allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large (max 10 MB)");
      return;
    }

    setBusy(true);
    const tId = toast.loading("Uploading & analyzing receipt…");
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("receipts")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      // Try AI extraction + validation
      let parsed: {
        is_receipt?: boolean; confidence?: number | null;
        merchant?: string | null; total?: number | null; currency?: string | null;
        purchase_date?: string | null; warranty_detected?: boolean; warranty_months?: number | null;
      } = {};
      let aiAvailable = true;
      try {
        const fileBase64 = await fileToBase64(file);
        const { data, error } = await supabase.functions.invoke("parse-receipt", {
          body: { fileBase64, mimeType: file.type },
        });
        if (error) throw error;
        parsed = data ?? {};
      } catch (aiErr: any) {
        console.warn("AI parsing skipped", aiErr);
        aiAvailable = false;
      }

      // Reject invalid receipts (only when AI actually validated the image)
      if (aiAvailable && parsed.is_receipt === false) {
        // Clean up the uploaded file
        await supabase.storage.from("receipts").remove([path]).catch(() => {});
        toast.error("Invalid receipt! Please upload a valid bill or receipt.", { id: tId });
        return;
      }

      const fallbackMerchant = file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Unknown";
      const hasWarranty = !!parsed.warranty_detected;
      const section = hasWarranty ? "warranty" : "expense";
      const warrantyNote = hasWarranty
        ? `Warranty detected${parsed.warranty_months ? ` (${parsed.warranty_months} months)` : ""}`
        : "Expense only — no warranty info";

      const created = await db.create("receipts", {
        user_id: user.id,
        merchant: (parsed.merchant?.trim() || fallbackMerchant).slice(0, 120),
        total: typeof parsed.total === "number" ? parsed.total : 0,
        currency: parsed.currency?.slice(0, 4) || "$",
        purchase_date: parsed.purchase_date || new Date().toISOString().slice(0, 10),
        file_url: path,
        notes: `[${section}] ${warrantyNote}`,
      });

      const summary = `${created.merchant} — ${created.currency}${Number(created.total).toFixed(2)} • ${
        hasWarranty ? "Warranty Tracking ✓" : "Expense Tracking"
      }`;
      toast.success(summary, { id: tId });
      qc.invalidateQueries({ queryKey: ["receipts"] });
      onUploaded?.();
    } catch (e: any) {
      console.error("Receipt upload failed", e);
      toast.error(e.message ?? "Upload failed", { id: tId });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-10 text-center transition-all duration-300 ${
        drag ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/30"
      } ${busy ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 shadow-glow">
        {busy ? <FileText className="h-6 w-6 text-white animate-pulse" /> : <Upload className="h-6 w-6 text-white" />}
      </div>
      <h3 className="font-display font-semibold text-lg">
        {busy ? "Analyzing receipt…" : "Upload a receipt"}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        We'll auto-detect merchant, total and warranty — PNG, JPG, WEBP or PDF (max 10 MB)
      </p>
    </div>
  );
};
