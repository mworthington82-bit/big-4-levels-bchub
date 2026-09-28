import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const UploadZone = ({ onFile, disabled }: Props) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      const f = files[0];
      if (!f.name.toLowerCase().endsWith(".csv")) return;
      onFile(f);
    },
    [onFile]
  );

  return (
    <div>
      <label className="block text-sm font-semibold text-b4-strong mb-2">
        Upload the latest self-assessment CSV
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-b4-flame bg-b4-flame/5" : "border-b4-line bg-card"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <UploadCloud className="w-10 h-10 mx-auto mb-3 text-b4-strong" />
        <p className="text-foreground mb-3">
          Drag and drop your .csv file here
        </p>
        <label className="inline-flex items-center px-4 py-2 rounded-lg bg-b4-flame text-b4-on-flame font-semibold cursor-pointer hover:brightness-95">
          Browse files
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Accepts .csv files only · Updates go live immediately · Uploads happen every Monday
      </p>
    </div>
  );
};

export default UploadZone;
