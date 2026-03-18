export interface InclusionStatement {
  text: string;
  level: 'explorer' | 'practitioner' | 'leader';
}

export interface ToolInclusionData {
  tool: string;
  color: string;
  icon: string;
  statements: InclusionStatement[];
  spotlight: string;
}

export const inclusionChecklist: ToolInclusionData[] = [
  {
    tool: "MS Teams & Microsoft Forms",
    color: "bg-tool-teams/10 border-tool-teams/30",
    icon: "🟦",
    spotlight: "MS Teams creates a consistent, organised digital classroom that every learner can navigate independently — reducing anxiety, supporting routine, and ensuring no student is disadvantaged by missed information. MS Forms gives every student an equal, private voice.",
    statements: [
      { text: "Thanks to MS Teams, I can now make sure all my students know exactly where to find their learning materials, regardless of their ability or confidence level", level: "explorer" },
      { text: "Thanks to MS Teams, I can now send clear announcements so no learner misses important information", level: "explorer" },
      { text: "Thanks to MS Forms, I can now check understanding quickly and quietly — without putting any student on the spot in class", level: "explorer" },
      { text: "Thanks to MS Forms, I can now give every student an equal voice through anonymous feedback and surveys", level: "explorer" },
      { text: "Thanks to branching in MS Forms, I can now create personalised question pathways so students are not overwhelmed by questions that are not relevant to them", level: "practitioner" },
      { text: "Thanks to MS Teams Assignments, I can now give every student individual written, audio, or video feedback tailored to their needs", level: "practitioner" },
      { text: "Thanks to Teams Insights, I can now identify students who are disengaging early and intervene before they fall behind", level: "practitioner" },
      { text: "Thanks to Breakout Rooms, I can now create smaller, safer spaces where quieter or less confident students participate more freely", level: "practitioner" },
      { text: "Thanks to MS Teams, I can now design a fully structured digital classroom where every student — regardless of need — knows what to do, where to find support, and how to make progress independently", level: "leader" },
      { text: "Thanks to MS Forms data, I can now make evidence-based decisions about which students need additional support and adapt my teaching responsively", level: "leader" },
    ],
  },
  {
    tool: "Edpuzzle",
    color: "bg-tool-edpuzzle/10 border-tool-edpuzzle/30",
    icon: "🟩",
    spotlight: "Edpuzzle removes the pressure of real-time learning by letting students pause, rewatch, and respond at their own pace. It is particularly powerful for ESOL learners, students with processing difficulties, and anyone who needs more time to engage with content confidently.",
    statements: [
      { text: "Thanks to Edpuzzle, I can now let students watch and rewatch video content at their own pace — removing the pressure of keeping up in real time", level: "explorer" },
      { text: "Thanks to Edpuzzle, I can now add captions and pauses so students with literacy difficulties or ESOL needs can access video content more effectively", level: "explorer" },
      { text: "Thanks to Edpuzzle, I can now check whether students have engaged with content before the lesson, so I can plan support accordingly", level: "explorer" },
      { text: "Thanks to Edpuzzle questions, I can now give students immediate feedback as they learn — without waiting until the end of a lesson or unit", level: "practitioner" },
      { text: "Thanks to Edpuzzle analytics, I can now see exactly where individual students are struggling in a video and target my support precisely", level: "practitioner" },
      { text: "Thanks to Edpuzzle, I can now set pre-lesson tasks that allow students with additional needs to prepare in advance and arrive more confident", level: "practitioner" },
      { text: "Thanks to Edpuzzle, I can now create fully scaffolded flipped learning experiences where every learner accesses content at the right level and pace for them", level: "leader" },
      { text: "Thanks to Edpuzzle, I can now evidence how individual learners with SEND or ESOL needs are accessing and engaging with content over time", level: "leader" },
    ],
  },
  {
    tool: "Canva",
    color: "bg-tool-canva/10 border-tool-canva/30",
    icon: "🟨",
    spotlight: "Canva makes it straightforward to design resources that are visually clear, logically structured, and accessible by default. Used well, it reduces cognitive overload and gives all learners — including those with dyslexia, ESOL needs, or low literacy — a better chance of accessing learning.",
    statements: [
      { text: "Thanks to Canva, I can now create visually clear, well-structured resources that are easier for all learners to read and navigate", level: "explorer" },
      { text: "Thanks to Canva templates, I can now produce consistent, professional materials that reduce cognitive overload for students", level: "explorer" },
      { text: "Thanks to Canva, I can now use colour, icons, and images to support learners who struggle with text-heavy resources", level: "explorer" },
      { text: "Thanks to Canva, I can now design resources that apply accessibility principles — clear fonts, strong contrast, logical layout — as standard", level: "practitioner" },
      { text: "Thanks to Canva Code, I can now create interactive resources that allow students to engage actively rather than passively", level: "practitioner" },
      { text: "Thanks to Canva, I can now produce differentiated versions of the same resource quickly, so all learners access content at the right level", level: "practitioner" },
      { text: "Thanks to Canva, I can now support students to create their own resources — building confidence, creativity, and digital skills simultaneously", level: "leader" },
      { text: "Thanks to Canva, I can now share accessible, reusable resource templates with colleagues across the department so inclusive design becomes consistent college-wide", level: "leader" },
    ],
  },
  {
    tool: "Copilot",
    color: "bg-[hsl(207,100%,42%)]/10 border-[hsl(207,100%,42%)]/30",
    icon: "🟪",
    spotlight: "Copilot is one of the most powerful inclusion tools available to teachers right now. It can generate differentiated, scaffolded, and adapted resources in seconds — meaning personalised support for every learner is no longer limited by planning time.",
    statements: [
      { text: "Thanks to Copilot, I can now generate simplified versions of complex texts for ESOL or SEND learners in seconds", level: "explorer" },
      { text: "Thanks to Copilot, I can now create vocabulary lists, key word glossaries, and reading aids quickly to support language learners", level: "explorer" },
      { text: "Thanks to Copilot, I can now produce lesson plans that already consider differentiation from the start, rather than adding it as an afterthought", level: "explorer" },
      { text: "Thanks to Copilot, I can now generate scaffolded and extended versions of the same task so every learner is working at the right level of challenge", level: "practitioner" },
      { text: "Thanks to Copilot, I can now create personalised resources for individual learners with specific needs without it taking hours of additional planning time", level: "practitioner" },
      { text: "Thanks to Copilot, I can now use AI responsibly with students to support their creativity and critical thinking, building skills they will need beyond college", level: "practitioner" },
      { text: "Thanks to Copilot, I can now model ethical, creative, and inclusive AI use to students — helping them become confident, responsible digital citizens", level: "leader" },
      { text: "Thanks to Copilot Agents, I can now automate the creation of differentiated resources across a whole scheme of work, ensuring consistency of inclusion throughout", level: "leader" },
    ],
  },
  {
    tool: "Immersive Room & VR",
    color: "bg-[hsl(340,70%,50%)]/10 border-[hsl(340,70%,50%)]/30",
    icon: "🟧",
    spotlight: "Immersive learning is especially impactful for learners who struggle in traditional classroom environments. It reduces anxiety, builds contextual language for ESOL learners, and creates memorable, multisensory experiences that reach students other approaches sometimes miss.",
    statements: [
      { text: "Thanks to the Immersive Room, I can now create multisensory learning experiences that engage learners who do not respond well to traditional classroom delivery", level: "explorer" },
      { text: "Thanks to immersive learning, I can now reduce anxiety around unfamiliar topics by letting students experience them in a safe, low-stakes environment", level: "explorer" },
      { text: "Thanks to the Immersive Room, I can now support students with low confidence or communication difficulties to practise real-world scenarios without real-world pressure", level: "practitioner" },
      { text: "Thanks to VR, I can now give every student — regardless of background or prior experience — access to environments and contexts they may never otherwise encounter", level: "practitioner" },
      { text: "Thanks to immersive learning, I can now support ESOL learners in building situational vocabulary through visual, contextual, and interactive experiences", level: "practitioner" },
      { text: "Thanks to the Immersive Room, I can now design learning experiences that are genuinely transformative for students whose barriers to learning are rooted in confidence, language, or limited life experience", level: "leader" },
      { text: "Thanks to immersive technology, I can now evidence the impact of experiential learning on student wellbeing, engagement, and progress in ways that traditional teaching cannot", level: "leader" },
    ],
  },
];

export interface ConfidenceSkill {
  id: string;
  text: string;
  category: string;
}

export const confidenceSkills: ConfidenceSkill[] = [
  { id: "c1", text: "I design resources that are visually clear and accessible for all learners", category: "Resource Design" },
  { id: "c2", text: "I use digital tools to differentiate tasks for different ability levels", category: "Differentiation" },
  { id: "c3", text: "I provide multiple ways for students to access content (text, video, audio, interactive)", category: "Multi-modal Learning" },
  { id: "c4", text: "I use data and analytics from digital tools to identify students who need additional support", category: "Data-Informed Practice" },
  { id: "c5", text: "I create safe, low-pressure digital spaces for quieter or less confident learners to participate", category: "Safe Spaces" },
  { id: "c6", text: "I use AI tools responsibly to personalise learning for individual students", category: "AI for Inclusion" },
  { id: "c7", text: "I design learning experiences that consider SEND, ESOL, and additional learning needs from the start", category: "Inclusive Planning" },
  { id: "c8", text: "I support students to use digital tools independently, building their confidence and digital skills", category: "Student Empowerment" },
  { id: "c9", text: "I share inclusive practice and accessible resources with colleagues", category: "Sharing Practice" },
  { id: "c10", text: "I use immersive or experiential technology to engage learners who struggle in traditional settings", category: "Immersive Learning" },
];

export const confidenceScale = [
  { value: 1, label: "Not yet part of my practice" },
  { value: 2, label: "I am starting to explore this" },
  { value: 3, label: "I do this sometimes" },
  { value: 4, label: "I do this confidently" },
  { value: 5, label: "I model this for others" },
];
