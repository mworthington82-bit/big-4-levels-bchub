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
      <label className="block text-sm font-semibold text-[#1F3864] mb-2">
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
          dragOver ? "border-[#F5A623] bg-[#F5A623]/5" : "border-slate-300 bg-white"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <UploadCloud className="w-10 h-10 mx-auto mb-3 text-[#1F3864]" />
        <p className="text-slate-700 mb-3">
          Drag and drop your .csv file here
        </p>
        <label className="inline-flex items-center px-4 py-2 rounded-lg bg-[#F5A623] text-[#1F3864] font-semibold cursor-pointer hover:brightness-95">
          Browse files
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Accepts .csv files only · Updates go live immediately · Uploads happen every Monday
      </p>
    </div>
  );
};

export default UploadZone;
