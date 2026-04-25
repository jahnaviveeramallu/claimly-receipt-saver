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
    const tId = toast.loading("Uploading receipt…");
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("receipts")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      await db.create("receipts", {
        user_id: user.id,
        merchant: file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Unknown",
        total: 0,
        currency: "$",
        purchase_date: new Date().toISOString().slice(0, 10),
        file_url: path,
      });

      toast.success("Receipt uploaded", { id: tId });
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
      <h3 className="font-display font-semibold text-lg">Upload a receipt</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Drag & drop or click to browse — PNG, JPG, WEBP or PDF (max 10 MB)
      </p>
    </div>
  );
};
