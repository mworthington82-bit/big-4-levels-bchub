import { Check, Loader2 } from "lucide-react";

export type StepStatus = "pending" | "active" | "done";

export interface Step {
  label: string;
  status: StepStatus;
}

interface Props {
  fileName: string;
  fileSize: number;
  steps: Step[];
}

const formatSize = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

const ProcessingStatus = ({ fileName, fileSize, steps }: Props) => {
  const done = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-semibold text-[#1F3864]">{fileName}</div>
        <div className="text-xs text-slate-500">{formatSize(fileSize)}</div>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#F5A623] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.status === "done" ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : s.status === "active" ? (
              <Loader2 className="w-4 h-4 text-[#F5A623] animate-spin" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
            )}
            <span
              className={
                s.status === "done"
                  ? "text-slate-700"
                  : s.status === "active"
                  ? "text-[#1F3864] font-medium"
                  : "text-slate-400"
              }
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProcessingStatus;
