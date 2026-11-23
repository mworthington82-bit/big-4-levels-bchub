// @ts-nocheck
// Recording Big 4 session attendance (23 November 2026). Shared by the Big 4 admin
// upload (bulk-attendance-upload) and the ThreadWorks hub's upload (hub-attendance),
// so a session uploaded in either place is recorded exactly the same way.
// Moved here unchanged from bulk-attendance-upload/index.ts.

export const VALID_MODULES = new Set([
  "teams_explorer","forms_explorer","canva_explorer","edpuzzle_explorer","copilot_explorer",
  "teams_practitioner","forms_practitioner","canva_practitioner","edpuzzle_practitioner","copilot_practitioner",
  "immersive_practitioner",
]);

export const EXPLORER_TOOLS = ["teams","forms","canva","edpuzzle","copilot"] as const;
export const PRACTITIONER_TOOLS = ["teams","forms","canva","edpuzzle","copilot"] as const;

export const MODULE_LABEL: Record<string,{ tool: string; level: string; label: string }> = {
  teams_explorer: { tool: "teams", level: "explorer", label: "MS Teams Explorer" },
  forms_explorer: { tool: "forms", level: "explorer", label: "MS Forms Explorer" },
  canva_explorer: { tool: "canva", level: "explorer", label: "Canva Explorer" },
  edpuzzle_explorer: { tool: "edpuzzle", level: "explorer", label: "Edpuzzle Explorer" },
  copilot_explorer: { tool: "copilot", level: "explorer", label: "Microsoft Copilot Explorer" },
  teams_practitioner: { tool: "teams", level: "practitioner", label: "MS Teams Practitioner" },
  forms_practitioner: { tool: "forms", level: "practitioner", label: "MS Forms Practitioner" },
  canva_practitioner: { tool: "canva", level: "practitioner", label: "Canva Practitioner" },
  edpuzzle_practitioner: { tool: "edpuzzle", level: "practitioner", label: "Edpuzzle Practitioner" },
  copilot_practitioner: { tool: "copilot", level: "practitioner", label: "Microsoft Copilot Practitioner" },
  immersive_practitioner: { tool: "immersive", level: "practitioner", label: "Immersive Room Practitioner" },
};

/**
 * Records (or, with dryRun, previews) attendance rows. `admin` is a service-role
 * client. Throws if the database refuses; the caller turns that into a 500.
 */
export async function recordAttendance(admin, rowsIn: any[], dryRun: boolean) {

  // Validate & normalise rows
  type Row = { email: string; name?: string; module_id: string; attended_at?: string; reflection?: string };
  const rows: Row[] = [];
  const invalidRows: any[] = [];
  for (const r of rowsIn) {
    const email = String(r?.email ?? "").trim().toLowerCase();
    const module_id = String(r?.module_id ?? "").trim();
    if (!email || !module_id || !VALID_MODULES.has(module_id)) {
      invalidRows.push({ email, module_id, reason: !email ? "missing email" : "unknown module" });
      continue;
    }
    rows.push({
      email,
      name: r?.name ? String(r.name).trim() : undefined,
      module_id,
      attended_at: r?.attended_at ? String(r.attended_at) : undefined,
      reflection: r?.reflection ? String(r.reflection).trim() : undefined,
    });
  }

  // Load all referenced staff profiles
  const emails = Array.from(new Set(rows.map((r) => r.email)));
  const { data: profiles, error: profErr } = await admin
    .from("staff_profiles")
    .select("*")
    .in("email", emails);
  if (profErr) throw profErr;
  const profileByEmail = new Map<string, any>();
  for (const p of profiles ?? []) profileByEmail.set(String(p.email).toLowerCase(), p);

  const knownRows: Row[] = [];
  const unknownEmailRows: Row[] = [];
  for (const r of rows) {
    if (profileByEmail.has(r.email)) knownRows.push(r);
    else unknownEmailRows.push(r);
  }

  // Load existing completions for known emails
  const { data: existingComps } = await admin
    .from("module_completions")
    .select("staff_email,module_id,quiz_passed,completed_via")
    .in("staff_email", emails);
  const completedByEmail = new Map<string, Set<string>>();
  const passedByEmail = new Map<string, Set<string>>();
  for (const c of existingComps ?? []) {
    const e = String(c.staff_email).toLowerCase();
    if (!completedByEmail.has(e)) completedByEmail.set(e, new Set());
    const done = c.completed_via === "signed_off" ||
      (c.module_id === "immersive_practitioner" && (c.completed_via === "in_person" || c.quiz_passed));
    if (done) completedByEmail.get(e)!.add(c.module_id);
    // Already passed or signed off: attendance must leave the row exactly as it is.
    if (c.quiz_passed === true || c.completed_via === "signed_off") {
      if (!passedByEmail.has(e)) passedByEmail.set(e, new Set());
      passedByEmail.get(e)!.add(c.module_id);
    }
  }
  const alreadyPassed = new Set<string>();
  for (const r of knownRows) {
    if (passedByEmail.get(r.email)?.has(r.module_id)) alreadyPassed.add(`${r.email}::${r.module_id}`);
  }

  // Compute progression preview
  const progressionPreview: {
    email: string;
    name: string | null;
    unlocksPractitioner: boolean;
    unlocksLeader: boolean;
  }[] = [];

  // Group rows by email for progression simulation
  const rowsByEmail = new Map<string, Row[]>();
  for (const r of knownRows) {
    if (!rowsByEmail.has(r.email)) rowsByEmail.set(r.email, []);
    rowsByEmail.get(r.email)!.push(r);
  }

  for (const [email, rs] of rowsByEmail) {
    const p = profileByEmail.get(email);
    const completed = new Set(completedByEmail.get(email) ?? []);
    const profileWork = { ...p };
    for (const r of rs) {
      if (r.module_id === "immersive_practitioner") completed.add(r.module_id);
      // Tool attendance is not sign-off: the knowledge check + reflection are still needed.
    }
    const before = {
      practitioner_unlocked: !!p.practitioner_unlocked,
      leader_unlocked: !!p.leader_unlocked,
    };
    const after = computeProgression(profileWork, completed);
    progressionPreview.push({
      email,
      name: p.name ?? null,
      unlocksPractitioner: !before.practitioner_unlocked && !!after.practitioner_unlocked,
      unlocksLeader: !before.leader_unlocked && !!after.leader_unlocked,
    });
  }

  let marked = 0;
  let reflectionsSaved = 0;

  if (!dryRun && knownRows.length > 0) {
    // Upsert module_completions.
    // Attendance is NOT module completion — quiz_passed stays false so the
    // learner must still take the end-of-module test. Exception: the
    // Immersive Room has no test, so attendance IS completion.
    const upsertMap = new Map<string, any>();
    for (const r of knownRows) {
      const key = `${r.email}::${r.module_id}`;
      // Progress only: quiz_passed is never written. Immersive attendance
      // (completed_via = in_person) counts as done; tool attendance does not.
      const already = completedByEmail.get(r.email)?.has(r.module_id) || alreadyPassed.has(key);
      if (already) continue; // never downgrade a signed-off module
      upsertMap.set(key, {
        staff_email: r.email,
        module_id: r.module_id,
        completed_at: r.attended_at ?? new Date().toISOString(),
        completed_via: "in_person",
      });
    }
    const upserts = Array.from(upsertMap.values());
    if (upserts.length > 0) {
      const { error: mcErr } = await admin
        .from("module_completions")
        .upsert(upserts, { onConflict: "staff_email,module_id" });
      if (mcErr) throw mcErr;
    }
    marked = knownRows.length - alreadyPassed.size;

    // Tool attendance no longer sets *_evidenced (that now means signed off).
    for (const [email, rs] of rowsByEmail) {
      const p = profileByEmail.get(email);
      const completed = new Set(completedByEmail.get(email) ?? []);
      const profileWork: any = { ...p };
      for (const r of rs) {
        if (r.module_id === "immersive_practitioner") completed.add(r.module_id);
      }
      const prog = computeProgression(profileWork, completed);
      const patch: Record<string, any> = {};

      // Mirror simulated *_evidenced flags into the patch when they changed.
      for (const t of EXPLORER_TOOLS) {
        const f = `${t}_explorer_evidenced`;
        if (!p[f] && profileWork[f]) patch[f] = true;
      }
      for (const t of PRACTITIONER_TOOLS) {
        const f = `${t}_practitioner_evidenced`;
        if (!p[f] && profileWork[f]) patch[f] = true;
      }
      if (!p.explorer_complete && prog.explorer_complete) patch.explorer_complete = true;
      if (!p.practitioner_unlocked && prog.practitioner_unlocked) patch.practitioner_unlocked = true;
      if (!p.practitioner_complete && prog.practitioner_complete) patch.practitioner_complete = true;
      if (!p.leader_unlocked && prog.leader_unlocked) patch.leader_unlocked = true;

      if (Object.keys(patch).length > 0) {
        patch.updated_at = new Date().toISOString();
        const { error: upErr } = await admin
          .from("staff_profiles")
          .update(patch)
          .ilike("email", email);
        if (upErr) console.error("[bulk] profile update error");

        // Log progression transitions for the dashboard.
        const events: any[] = [];
        if (patch.explorer_complete) events.push({ staff_email: email, department: p.department, event: "explorer_complete" });
        if (patch.practitioner_unlocked) events.push({ staff_email: email, department: p.department, event: "practitioner_unlocked" });
        if (patch.practitioner_complete) events.push({ staff_email: email, department: p.department, event: "practitioner_complete" });
        if (patch.leader_unlocked) events.push({ staff_email: email, department: p.department, event: "leader_unlocked" });
        if (events.length > 0) {
          const { error: evErr } = await admin
            .from("progression_events")
            .upsert(events, { onConflict: "staff_email,event" });
          if (evErr) console.error("[bulk] progression_events upsert error");
        }
      }
    }

    // Insert reflections (skip duplicates by staff_email+module_id via lookup)
    const withReflection = knownRows.filter((r) => r.reflection && r.reflection.length > 0);
    if (withReflection.length > 0) {
      const { data: existingRefs } = await admin
        .from("session_reflections")
        .select("staff_email,tool,level")
        .in("staff_email", Array.from(new Set(withReflection.map((r) => r.email))));
      const existingKey = new Set(
        (existingRefs ?? []).map((r: any) =>
          `${String(r.staff_email).toLowerCase()}::${r.tool}_${r.level}`,
        ),
      );
      const toInsert = withReflection
        .map((r) => {
          const meta = MODULE_LABEL[r.module_id];
          if (!meta) return null;
          const key = `${r.email}::${r.module_id}`;
          if (existingKey.has(key)) return null;
          const profileName = profileByEmail.get(r.email)?.name ?? r.name ?? null;
          return {
            booking_name: meta.label,
            tool: meta.tool,
            level: meta.level,
            staff_email: r.email,
            staff_name: profileName,
            reflection: r.reflection!,
          };
        })
        .filter(Boolean);
      if (toInsert.length > 0) {
        const { error: refErr, count: refCount } = await admin
          .from("session_reflections")
          .insert(toInsert, { count: "exact" });
        if (refErr) console.error("[bulk] reflections insert error", refErr);
        else reflectionsSaved = refCount ?? toInsert.length;
      }
    }
  }

  return {
    dryRun,
    marked: dryRun ? knownRows.length - alreadyPassed.size : marked,
    alreadyPassed: alreadyPassed.size,
    reflectionsSaved,
    skippedUnknownEmail: unknownEmailRows.map((r) => ({ email: r.email, module_id: r.module_id })),
    skippedInvalidRows: invalidRows,
    unlockedPractitioner: progressionPreview.filter((p) => p.unlocksPractitioner),
    unlockedLeader: progressionPreview.filter((p) => p.unlocksLeader),
    totalRows: rowsIn.length,
    knownEmailRows: knownRows.length,
  };
}

export function computeProgression(profile: any, completed: Set<string>) {
  const explorerDone = EXPLORER_TOOLS.every(
    (t) => profile[`${t}_explorer_evidenced`] === true || completed.has(`${t}_explorer`),
  );
  const practitionerToolsDone = PRACTITIONER_TOOLS.every(
    (t) => profile[`${t}_practitioner_evidenced`] === true || completed.has(`${t}_practitioner`),
  );
  const immersiveOk = completed.has("immersive_practitioner");

  const explorer_complete = profile.explorer_complete || explorerDone;
  const practitioner_unlocked = profile.practitioner_unlocked || explorer_complete;
  const practitioner_complete =
    profile.practitioner_complete || (practitioner_unlocked && practitionerToolsDone && immersiveOk);
  const leader_unlocked = profile.leader_unlocked || practitioner_complete;

  return { explorer_complete, practitioner_unlocked, practitioner_complete, leader_unlocked };
}
