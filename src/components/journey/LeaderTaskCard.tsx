// Leader-only task card shown on /journey in place of the previous
// Evidence Gallery / Mentor Directory preview cards.
// Links go to the per-tool Padlet URLs used elsewhere in the app.

const PADLET_LINKS: { label: string; url: string }[] = [
  {
    label: "MS Teams Padlet",
    url: "https://padlet.com/m_worthington1/ms-teams-microsoft-forms-leader-level-sharing-best-practice-gks2w9j29p4m30np",
  },
  {
    label: "MS Forms Padlet",
    url: "https://padlet.com/m_worthington1/ms-teams-microsoft-forms-leader-level-sharing-best-practice-gks2w9j29p4m30np",
  },
  {
    label: "Canva Padlet",
    url: "https://padlet.com/m_worthington1/canva-leader-level-sharing-best-practice-hedtqgi5d39rabrd",
  },
  {
    label: "Edpuzzle Padlet",
    url: "https://padlet.com/m_worthington1/edpuzzle-leader-level-sharing-best-practice-spyzi6v7k5iepolu",
  },
  {
    label: "Microsoft Copilot Padlet",
    url: "https://padlet.com/m_worthington1/microsoft-copilot-leader-level-sharing-best-practice-vbbh9q3jed0zj0tf",
  },
  {
    label: "Immersive Room Padlet",
    url: "https://padlet.com/m_worthington1/immersive-learning-leader-level-sharing-best-practice-h4686ht9wq9dpui7",
  },
];

const LeaderTaskCard = () => {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-[#1F3864] text-white"
      style={{ padding: "24px" }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 bg-[#F5A623]"
        style={{ width: "6px" }}
      />
      <div className="pl-3">
        <h3
          className="font-display font-bold text-[#F5A623]"
          style={{ fontSize: "20px" }}
        >
          Your next step as a Leader — required
        </h3>
        <div
          className="mt-3 text-white space-y-3"
          style={{ fontSize: "14px", lineHeight: 1.7 }}
        >
          <p>
            As a Bradford College Big 4 Leader, your role is to share your
            practice with colleagues across the college. This is an expected
            part of reaching Leader level.
          </p>
          <p>
            Choose a tool below and contribute to its Padlet. It could be a
            lesson activity that worked well, a practical tip, a short video,
            or a lesson plan. You can share as many times as you like across
            any tool.
          </p>
          <p>
            For each contribution, tell your colleagues: what you did, how you
            did it, and what difference it made for your learners.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {PADLET_LINKS.map((p) => (
            <a
              key={p.label}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-[#1F3864] border border-[#1F3864] px-4 py-2 text-sm font-semibold hover:bg-[#F4F6FB] transition-colors"
              style={{ borderRadius: "10px" }}
            >
              {p.label} →
            </a>
          ))}
        </div>

        <p
          className="mt-4 font-bold text-[#F5A623]"
          style={{ fontSize: "13px" }}
        >
          Your contributions are visible to all Bradford College staff and
          help build a culture of sharing.
        </p>
      </div>
    </div>
  );
};

export default LeaderTaskCard;
