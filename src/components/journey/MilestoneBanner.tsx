import { IconAward } from "@tabler/icons-react";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";

interface Props {
  variant: "explorer" | "practitioner";
}

const COPY = {
  explorer: {
    heading: "Explorer complete",
    body: "You have finished your Explorer pathway. Your Practitioner modules are ready below — start whenever you are ready.",
    pill: "Practitioner unlocked",
    emblem: emblemExplorer,
    label: "Explorer",
  },
  practitioner: {
    heading: "Practitioner complete",
    body: "You have finished your Practitioner pathway. Leader level is unlocked — your Leader Hub is on its way.",
    pill: "Leader unlocked",
    emblem: emblemPractitioner,
    label: "Practitioner",
  },
};

const MilestoneBanner = ({ variant }: Props) => {
  const c = COPY[variant];
  return (
    <div className="relative overflow-hidden rounded-lg bg-[#1F3864] text-white p-5 flex flex-col md:flex-row md:items-center gap-4">
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#F5A623]" aria-hidden />
      <div className="flex items-start gap-3 flex-1 pl-3">
        <IconAward size={28} stroke={1.75} className="text-[#F5A623] shrink-0 mt-0.5" aria-hidden />
        <div>
          <h3 className="font-bold text-base md:text-lg inline-flex items-center gap-2">
            <img src={c.emblem} alt="" aria-hidden className="h-5 w-5" />
            {c.heading}
          </h3>
          <p className="text-sm text-white/85 mt-1 max-w-2xl leading-relaxed">{c.body}</p>
        </div>
      </div>
      <span className="self-start md:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAF3DE] text-[#3B6D11] shrink-0">
        {c.pill}
      </span>
    </div>
  );
};

export default MilestoneBanner;
