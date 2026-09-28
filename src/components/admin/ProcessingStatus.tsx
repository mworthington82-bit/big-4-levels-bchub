import { Check } from "lucide-react";
import { LoaderThread } from "@/components/threadworks";

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
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-semibold text-b4-strong">{fileName}</div>
        <div className="text-xs text-muted-foreground">{formatSize(fileSize)}</div>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-b4-flame transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.status === "done" ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : s.status === "active" ? (
              <LoaderThread className="w-6" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-b4-line inline-block" />
            )}
            <span
              className={
                s.status === "done"
                  ? "text-foreground"
                  : s.status === "active"
                  ? "text-b4-strong font-medium"
                  : "text-muted-foreground/80"
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
