import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { deriveEffectiveLevel } from "@/lib/progression";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

const emblemMap: Record<string, string> = {
  Explorer: emblemExplorer,
  Practitioner: emblemPractitioner,
  Leader: emblemLeader,
};

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `Last updated ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
  } catch {
    return "—";
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { profile, loading } = useStaffProfile();

  const level = profile ? deriveEffectiveLevel(profile) : "Explorer";
  const initials = getInitials(profile?.name);

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-64px)] bg-muted/20 py-10 px-4">
        <div className="max-w-[480px] mx-auto bg-card rounded-2xl border border-border shadow-sm p-8">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold mb-3"
                  style={{ background: "#1F3864", border: "1.5px solid rgba(255,255,255,0.3)" }}
                  aria-hidden
                >
                  {initials}
                </div>
                <h1 className="text-xl font-bold text-foreground">{profile?.name || "—"}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{profile?.department || "—"}</p>
              </div>

              <dl className="divide-y divide-border border-y border-border">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-muted-foreground">Level</dt>
                  <dd className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <img src={emblemMap[level]} alt="" className="h-5 w-5" />
                    {level}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-muted-foreground">Explorer</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {profile?.explorer_evidenced_count ?? 0} of 5 evidenced
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-muted-foreground">Practitioner</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {profile?.practitioner_evidenced_count ?? 0} of 5 evidenced
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-muted-foreground">Data updated</dt>
                  <dd className="text-sm font-semibold text-foreground">{formatDate(profile?.data_uploaded_at)}</dd>
                </div>
              </dl>

              <button
                onClick={() => navigate("/journey")}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-[#1F3864] text-white text-sm font-semibold hover:bg-[#1F3864]/90 transition-colors"
              >
                Back to my journey <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Profile;
