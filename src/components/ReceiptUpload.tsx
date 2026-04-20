import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onUpload: () => void;
}

export const ReceiptUpload = ({ onUpload }: Props) => {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    toast.loading("Scanning receipt…", { id: "scan" });
    setTimeout(() => {
      toast.success("Receipt scanned and added!", { id: "scan" });
      setBusy(false);
      onUpload();
    }, 1400);
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
        accept="image/*,.pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 shadow-glow">
        {busy ? <FileText className="h-6 w-6 text-white animate-pulse" /> : <Upload className="h-6 w-6 text-white" />}
      </div>
      <h3 className="font-display font-semibold text-lg">Upload a receipt</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Drag & drop or click to browse — PNG, JPG or PDF
      </p>
    </div>
  );
};
