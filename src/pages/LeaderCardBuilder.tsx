import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { usePageTitle } from "@/lib/usePageTitle";
import {
  AUDIENCES, LEADER_TOOLS, LeaderCard, signPhotos,
} from "@/lib/leaders";
import { CardPreview } from "@/components/leaders/LeaderPieces";
import { ShareCardPanel } from "@/components/leaders/ShareCardPanel";

const MAX = 140;

const FIELDS = [
  { key: "intent", label: "Intent — why you tried it", hint: "What problem in your teaching were you trying to solve?" },
  { key: "implementation", label: "Implementation — what you actually did", hint: "The practical steps, in plain terms." },
  { key: "impact", label: "Impact — what changed for your learners", hint: "Include anyone who usually struggles to access it." },
] as const;

const LeaderCardBuilder = () => {
  usePageTitle("Create your Leaders card");
  const navigate = useNavigate();
  const { profile, email, loading } = useStaffProfile();
  const [shareCount, setShareCount] = useState<number | null>(null);
  const [existing, setExisting] = useState<LeaderCard | null>(null);
  const [form, setForm] = useState({ name: "", department: "", tool: "teams", intent: "", implementation: "", impact: "" });
  const [audiences, setAudiences] = useState<string[]>([]);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const [{ data: sh }, { data: card }] = await Promise.all([
        supabase.from("leader_shares").select("tool, declared_at").ilike("staff_email", email).eq("approved", true),
        supabase.from("leader_cards").select("*").ilike("staff_email", email).maybeSingle(),
      ]);
      setShareCount(new Set((sh ?? []).map((r: any) => r.tool)).size);
      setCompleted((sh ?? []).reduce((m: string | null, r: any) => (!m || r.declared_at > m ? r.declared_at : m), null));
      if (card) {
        const c = card as LeaderCard;
        setExisting(c);
        setForm({ name: c.name, department: c.department ?? "", tool: c.tool, intent: c.intent, implementation: c.implementation, impact: c.impact });
        setAudiences(c.audiences ?? []);
        if (c.photo_url) {
          setPhotoPath(c.photo_url);
          const m = await signPhotos([c.photo_url]);
          setPhotoPreview(m[c.photo_url] ?? null);
        }
      }
    })();
  }, [email]);

  useEffect(() => {
    if (profile && !existing) setForm((f) => ({ ...f, name: f.name || profile.name || "", department: f.department || profile.department || "" }));
  }, [profile, existing]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAudience = (a: string) =>
    setAudiences((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : cur.length >= 3 ? cur : [...cur, a]));

  const onPhoto = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) {
      toast({ title: "Photo not added", description: "Use an image under 5 MB.", variant: "destructive" });
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!email) return;
    if (!form.name.trim() || !form.intent.trim() || !form.implementation.trim() || !form.impact.trim()) {
      toast({ title: "Almost there", description: "Fill in your name and all three answers.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      let path = photoPath;
      if (photoFile) {
        const { data: u } = await supabase.auth.getUser();
        const ext = photoFile.name.split(".").pop() || "jpg";
        path = `${u.user?.id}/photo-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("leader-photos").upload(path, photoFile, { upsert: true });
        if (upErr) throw upErr;
      }
      const row = {
        staff_email: email.toLowerCase(),
        name: form.name.trim(),
        department: form.department.trim() || null,
        tool: form.tool,
        intent: form.intent.trim(),
        implementation: form.implementation.trim(),
        impact: form.impact.trim(),
        audiences,
        photo_url: path,
      };
      const res = existing
        ? await supabase.from("leader_cards").update(row).eq("id", existing.id).select().single()
        : await supabase.from("leader_cards").insert({ ...row, published: true }).select().single();
      if (res.error) throw res.error;
      const card = res.data as LeaderCard;
      setExisting(card);
      setPhotoPath(path);
      setPhotoFile(null);
      setSavedId(card.id);
      toast({ title: "Your card is on the board" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      toast({ title: "Could not save your card", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading || shareCount === null) {
    return <AppShell><div className="lb-page min-h-full p-10 text-center">Loading…</div></AppShell>;
  }

  if (shareCount < 6) {
    return (
      <AppShell>
        <div className="lb-page min-h-full px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="font-display text-3xl font-bold">Not quite yet</h1>
            <p className="mt-3 lb-muted">You can create your card once you have shared on all six Padlets. You have {shareCount} of 6 so far.</p>
            <button className="lb-btn mt-6" onClick={() => navigate("/new/journey")}>Back to my journey</button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="lb-page min-h-full px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{existing ? "Edit your Leaders card" : "Create your Leaders card"}</h1>
          <p className="mt-2 lb-muted">Your card goes on the Big 4 Leaders board for colleagues to see. You can remove it at any time from your profile.</p>

          {savedId && (
            <div className="mt-6 max-w-2xl">
              <ShareCardPanel card={{ ...form, audiences, photo: photoPreview, completed }} />
            </div>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-2 items-start">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c-name" className="block text-sm font-semibold mb-1">Name</label>
                  <input id="c-name" className="lb-input" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} />
                </div>
                <div>
                  <label htmlFor="c-dept" className="block text-sm font-semibold mb-1">Department</label>
                  <input id="c-dept" className="lb-input" value={form.department} onChange={(e) => set("department", e.target.value)} maxLength={80} />
                </div>
              </div>
              <div>
                <label htmlFor="c-tool" className="block text-sm font-semibold mb-1">Which tool are you recommending?</label>
                <select id="c-tool" className="lb-input" value={form.tool} onChange={(e) => set("tool", e.target.value)}>
                  {LEADER_TOOLS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>

              <fieldset className="space-y-4">
                <legend className="font-display text-xl font-bold mb-1">The one thing I'd try</legend>
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label htmlFor={`c-${f.key}`} className="block text-sm font-semibold mb-1">{f.label}</label>
                    <textarea
                      id={`c-${f.key}`}
                      className="lb-input resize-none"
                      rows={2}
                      maxLength={MAX}
                      placeholder={f.hint}
                      aria-describedby={`c-${f.key}-count`}
                      value={form[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                    <p id={`c-${f.key}-count`} className="text-xs text-right lb-muted">{form[f.key].length} / {MAX}</p>
                  </div>
                ))}
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold mb-2">Who did this help most? <span className="font-normal lb-muted">(optional, up to three)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map((a) => {
                    const on = audiences.includes(a);
                    return (
                      <button key={a} type="button" className="lb-pill" aria-pressed={on} disabled={!on && audiences.length >= 3} onClick={() => toggleAudience(a)}>
                        {on ? "✓ " : ""}{a}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="c-photo" className="block text-sm font-semibold mb-1">Photo (optional)</label>
                <input id="c-photo" type="file" accept="image/*" className="lb-input" onChange={(e) => onPhoto(e.target.files?.[0] ?? null)} aria-describedby="c-photo-note" />
                <p id="c-photo-note" className="text-xs lb-muted mt-1">No photo? Your initials are used instead.</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" className="lb-btn" disabled={busy} onClick={save}>Add to the board</button>
              </div>
            </form>

            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold mb-2">Live preview</p>
              <CardPreview {...form} audiences={audiences} photo={photoPreview} completed={completed} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default LeaderCardBuilder;
