import { Clock, Layers, Award } from "lucide-react";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import formsLogo from "@/assets/forms-logo.jpg";
import { Tool, Level } from "@/types/learning";

interface ModuleHeroBannerProps {
  tool: Tool;
  level: Level;
  brandColor: string;
}

const logoMap: Record<string, string> = {
  teams: teamsLogo,
  canva: canvaLogo,
  edpuzzle: edpuzzleLogo,
  copilot: copilotLogo,
};

const toolNames: Record<string, { full: string; goldWord: string; rest: string }> = {
  teams: { full: 'MS Teams & Forms', goldWord: 'Teams', rest: 'MS  & Forms' },
  canva: { full: 'Canva', goldWord: 'Canva', rest: '' },
  edpuzzle: { full: 'Edpuzzle', goldWord: 'Edpuzzle', rest: '' },
  copilot: { full: 'Microsoft Copilot', goldWord: 'Copilot', rest: 'Microsoft ' },
};

const moduleNumbers: Record<string, number> = {
  teams: 1,
  canva: 2,
  edpuzzle: 3,
  copilot: 4,
};

const ModuleHeroBanner = ({ tool, level, brandColor }: ModuleHeroBannerProps) => {
  const names = toolNames[tool];
  const moduleNum = moduleNumbers[tool];
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{ backgroundColor: brandColor }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/[0.06]" />
      <div className="absolute bottom-[-30px] left-[20%] w-28 h-28 rounded-full bg-white/[0.04]" />

      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 py-8 md:py-10">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
            Module {moduleNum} · {levelLabel} Level
          </p>

          {/* Heading with gold keyword */}
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {names.rest && <>{names.rest}</>}
            <span style={{ color: '#F5A623' }}>{names.goldWord}</span>
          </h2>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" />
              ~15 min
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" />
              5 sections
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Award className="h-3.5 w-3.5" />
              Badge on completion
            </span>
          </div>
        </div>

        {/* Right logos */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-6">
          <div className="h-16 w-16 rounded-xl bg-white p-2.5 shadow-lg">
            <img src={logoMap[tool]} alt={`${names.full} logo`} className="h-full w-full object-contain" />
          </div>
          {tool === 'teams' && (
            <div className="h-16 w-16 rounded-xl bg-white p-2.5 shadow-lg">
              <img src={formsLogo} alt="MS Forms logo" className="h-full w-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleHeroBanner;
