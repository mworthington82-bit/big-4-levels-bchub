// ─────────────────────────────────────────────────────────────────────────────
// ActivityPlanner — TEMPORARILY DISABLED (DPIA remediation)
//
// The previous implementation routed free-text staff content (including
// learner-description fields) to an external AI service (Lovable AI Gateway →
// Google Gemini) via the `plan-activity` edge function. Pending confirmation
// of an appropriate Article 28/46 transfer mechanism with Bradford College's
// DPO, the feature is hidden from the UI and replaced with a placeholder.
//
// The full original implementation is preserved in version control and can be
// re-enabled by restoring this file from the prior commit and re-enabling the
// `plan-activity` edge function.
// ─────────────────────────────────────────────────────────────────────────────
import { Sparkles } from "lucide-react";

const ActivityPlanner = () => (
  <div
    className="relative bg-white rounded-2xl shadow-sm border border-[#D0D7E2] p-8 text-center"
    style={{ borderLeft: "4px solid #F5A623" }}
  >
    <div className="mx-auto w-12 h-12 rounded-xl bg-[#FEF6E8] flex items-center justify-center mb-4">
      <Sparkles className="w-6 h-6 text-[#854F0B]" />
    </div>
    <h2 className="font-bold text-[#1F3864] text-lg md:text-xl mb-2">
      Activity Planner
    </h2>
    <p className="text-sm text-[#5F6B7D] max-w-md mx-auto">
      This feature is coming soon. We are reviewing how learner-related text is
      processed before re-enabling it.
    </p>
  </div>
);

export default ActivityPlanner;
