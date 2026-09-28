import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { IconArrowLeft } from "@tabler/icons-react";

const TITLES: Record<string, string> = {
  teams_explorer: "MS Teams — Explorer",
  forms_explorer: "MS Forms — Explorer",
  canva_explorer: "Canva — Explorer",
  edpuzzle_explorer: "Edpuzzle — Explorer",
  copilot_explorer: "Microsoft Copilot — Explorer",
  teams_practitioner: "MS Teams — Practitioner",
  forms_practitioner: "MS Forms — Practitioner",
  canva_practitioner: "Canva — Practitioner",
  edpuzzle_practitioner: "Edpuzzle — Practitioner",
  copilot_practitioner: "Microsoft Copilot — Practitioner",
  immersive_practitioner: "Immersive Room — Practitioner",
};

const ModulePlaceholder = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const title = (moduleId && TITLES[moduleId]) ?? "Module";

  return (
    <AppShell>
      <div className="min-h-full bg-b4-wash">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <button
            onClick={() => navigate("/journey")}
            className="inline-flex items-center gap-1.5 text-sm text-[#185FA5] font-semibold mb-6 hover:underline"
          >
            <IconArrowLeft size={16} stroke={2} />
            Back to My Journey
          </button>
          <div className="bg-card rounded-2xl border border-b4-line p-8 md:p-12 text-center">
            <h1 className="font-bold text-b4-strong text-2xl md:text-3xl mb-3">{title}</h1>
            <p className="text-b4-muted text-base">
              This module is coming soon — content is being built.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ModulePlaceholder;
