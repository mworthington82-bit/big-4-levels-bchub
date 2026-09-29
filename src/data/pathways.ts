import { LearningPathway, QuizQuestion } from '@/types/learning';

// Quiz questions for MS Teams & Forms - Explorer

// Quiz questions for MS Teams & Forms - Practitioner

// Quiz questions for Canva Code - Explorer

// Quiz questions for Edpuzzle - Explorer

// Quiz questions for Microsoft Copilot - Explorer

// Quiz questions for Canva - Practitioner

// Quiz questions for Edpuzzle - Practitioner

// Quiz questions for Microsoft Copilot - Practitioner

export const learningPathways: Record<string, LearningPathway> = {
  'teams-explorer': {
    tool: 'teams',
    level: 'explorer',
    intro: {
      title: 'MS Teams & Forms - Explorer Level',
      description: 'Microsoft Teams is your digital classroom hub, bringing together communication, content, and assignments in one place. MS Forms complements this by enabling quick checks for learning and gathering feedback.',
      whyItMatters: [
        'Students access all resources in one organised space, reducing confusion',
        'Communication becomes clearer and more inclusive for all learners',
        'Quick formative assessment helps you respond to student needs immediately',
        'Supports blended learning and flexibility for students with different circumstances'
      ]
    },
    mainContent: {
      howToUse: 'At Explorer level, focus on building confidence with core Teams functions that streamline your daily teaching. Use Teams to share resources, set assignments, communicate with your class, and provide feedback. Integrate Forms for quick quizzes or exit tickets to check understanding.',
      examples: [
        'For checks on learning: Post a quick MS Forms quiz in Teams after introducing a new concept to gauge understanding before moving on',
        'For accessibility & inclusion: Use Immersive Reader in Teams to support students with reading difficulties or EAL learners',
        'For organisation: Create a Classwork structure in Teams with clear folders (e.g., Week 1, Homework, Revision) so students always know where to find materials',
        'For communication: Send an announcement before each lesson with a reminder of what to bring or prepare, setting high expectations',
        'For feedback: Use the assignment feature to provide written or audio feedback directly on student work, supporting their progress'
      ]
    },
    benefits: {
      students: [
        'Access resources anytime, anywhere - supporting independent learning',
        'Receive timely, clear communication from their teacher',
        'Get feedback quickly on their work, knowing what to improve',
        'Experience more inclusive learning through accessibility features'
      ],
      staff: [
        'Save time by having all resources and communication in one place',
        'Organise and reuse materials efficiently',
        'Track assignment submissions and provide feedback digitally',
        'Gain insights into student understanding through Forms analytics'
      ],
      college: [
        'Consistent approach to digital learning across departments',
        'Improved accessibility and inclusion for all learners',
        'Better communication and engagement with students',
        'Stronger evidence of formative assessment practice'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'teams-practitioner': {
    tool: 'teams',
    level: 'practitioner',
    intro: {
      title: 'MS Teams & Forms - Practitioner Level',
      description: 'At Practitioner level, you will deepen your use of MS Teams and Forms to create more engaging, personalised, and responsive learning experiences. Move beyond the basics to use advanced features that support blended learning, differentiation, and meaningful formative assessment.',
      whyItMatters: [
        'Breakout Rooms enable collaborative small-group work during online and hybrid lessons',
        'Structured Teams channels provide organised spaces for content delivery and student collaboration',
        'Rubrics in Assignments ensure consistent, transparent assessment with clear success criteria',
        'Branching Forms create adaptive assessments that respond to individual student needs'
      ]
    },
    mainContent: {
      howToUse: 'At Practitioner level, focus on using advanced Teams features to enhance engagement and personalisation. Master running online lessons with Breakout Rooms, implement Rubrics for consistent feedback, create structured channels for organised learning, and create branching Forms for adaptive formative assessment. Analyse response data to inform your teaching decisions.',
      examples: [
        'For collaborative learning: Use Breakout Rooms to facilitate small group discussions during a Teams meeting, then bring students back to share their findings with the whole class',
        'For consistent assessment: Create a Rubric in Teams Assignments that clearly outlines success criteria at different levels, helping students understand expectations before they begin',
        'For channel organisation: Structure your Teams channels with clear naming conventions, dedicated spaces for resources, discussions, and assignments to support organised learning',
        'For adaptive assessment: Design a branching Form that directs students to different follow-up questions based on their answers, providing differentiated feedback pathways',
        'For varied feedback: Provide audio or video feedback on assignments alongside written comments, making feedback more personal and accessible',
        'For responsive teaching: Analyse Forms response data to identify common misconceptions, then address these in your next lesson'
      ]
    },
    benefits: {
      students: [
        'Experience more interactive and collaborative online learning through Breakout Rooms',
        'Understand expectations clearly through transparent Rubrics',
        'Have organised access to resources through well-structured Teams channels',
        'Receive differentiated feedback through adaptive assessments'
      ],
      staff: [
        'Deliver more engaging online and hybrid lessons with advanced features',
        'Save marking time whilst improving feedback quality with Rubrics',
        'Track individual student progress effectively through Teams assignments and analytics',
        'Create responsive assessments that adapt to student understanding'
      ],
      college: [
        'Enhanced quality of blended and online learning provision',
        'Consistent assessment practices across departments',
        'Improved student engagement and personalisation',
        'Evidence-based teaching informed by analytics'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },
  
  'canva-explorer': {
    tool: 'canva',
    level: 'explorer',
    intro: {
      title: 'Canva Code - Explorer Level',
      description: 'Canva Code is a powerful feature within Canva that lets you create interactive, personalised lesson activities for your students. No coding experience is needed \u2014 you will learn how to turn your ideas into engaging, clickable experiences that make learning feel fun and tailored to every learner.',
      whyItMatters: [
        'Interactive starter activities boost student engagement from the very first minute',
        'Adaptive learning pathways let students progress based on their own responses and choices',
        'Supports blended learning — students can access activities on any device, anytime',
        'No coding experience required — the interface guides you step by step'
      ]
    },
    mainContent: {
      howToUse: 'At Explorer level, you will learn the basics of Canva Code: how to open the Code panel, add simple interactive elements like buttons and input fields, and create your first personalised starter activity. Use Canva Code to build engaging starter activities, support adaptive learning pathways, and enhance blended learning — all without any coding experience.',
      examples: [
        'Vocational Scenario Simulators: A construction or engineering tutor could build an interactive "what would you do?" scenario tool where students are presented with a real workplace problem (e.g., a faulty wiring situation) and choose from multiple responses. The app gives instant feedback on their decision, explaining why it was right or wrong — mimicking real on-the-job decision-making without the risk.',
        'Personalised Revision Flashcard Builders: A health and social care tutor could create a flashcard app where students type in their own key terms and definitions, and the app turns them into a randomised quiz they can keep revisiting. Because students input their own content, it feels relevant to their own notes and learning style rather than generic revision.',
        'Industry Maths Calculators: A catering or hospitality tutor could build a food costing calculator where students enter ingredients and quantities, and the tool calculates portion costs, profit margins, and selling prices. This makes functional maths feel directly relevant to their career, rather than abstract.',
        'Exam Technique Timers: An English or Science tutor could build a timed exam practice tool where students select a question type, the app sets the recommended time, and guides them through a structured response framework (e.g., Point, Evidence, Explain). It coaches students on pacing themselves under pressure — a skill that\'s just as important as the content knowledge itself.',
        'Apprenticeship Portfolio Checklists: A work-based learning coordinator could create an interactive progress tracker where apprentices tick off completed evidence criteria against their qualification standards. The app highlights gaps, reminds them what\'s outstanding, and gives them a visual sense of how close they are to completion — great for keeping apprentices motivated between workplace visits.',
        'GCSE Resit Diagnostic Tools: A maths resit tutor could build a quick diagnostic quiz where students answer 10 questions covering different topics, and the app automatically tells them which areas they\'re strong in and which need the most work. Rather than giving every student the same revision plan, it instantly points each student toward their personal priority areas.'
      ]
    },
    benefits: {
      students: [
        'Activities feel personalised and relevant to them as individuals',
        'Interactive elements make learning more engaging than static handouts',
        'Accessible on any device — phones, tablets, or laptops',
        'Instant feedback helps students check their own understanding'
      ],
      staff: [
        'Create interactive resources without any coding knowledge',
        'Reuse and adapt activities across different classes and topics',
        'Increase engagement from the very start of lessons',
        'Stand out with professional, modern learning experiences'
      ],
      college: [
        'Innovative use of technology enhancing the student experience',
        'Staff developing future-ready digital skills',
        'Consistent, high-quality interactive resources across departments',
        'Demonstrates commitment to personalised learning approaches'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'edpuzzle-explorer': {
    tool: 'edpuzzle',
    level: 'explorer',
    intro: {
      title: 'Edpuzzle - Explorer Level',
      description: 'Edpuzzle transforms video content into interactive learning experiences. By embedding questions into videos, you ensure students actively engage rather than passively watch, whilst gaining insights into their understanding.',
      whyItMatters: [
        'Turns passive watching into active learning with checks for understanding',
        'Provides analytics showing who watched and how well they understood',
        'Supports independent and blended learning approaches',
        'Supports adaptive teaching and learning by allowing students to learn at their own pace'
      ],
      externalLinks: []
    },
    mainContent: {
      howToUse: 'At Explorer level, start by finding and assigning pre-made interactive videos from Edpuzzle\'s library. Create a class, assign videos, and track basic engagement (who watched, who completed). Focus on using this as a tool for independent learning or flipped classroom approaches.',
      examples: [
        'For Launch (LEAD): Assign an Edpuzzle video to introduce a new topic, with questions embedded to check initial understanding before the lesson',
        'For independent learning: Set an interactive video for homework, allowing students to pause, rewind, and learn at their own pace',
        'For adaptive learning: Assign different videos to different students based on their starting points or learning needs, allowing each learner to progress at the right level',
        'For checking understanding: Use analytics to identify which students need additional support on specific concepts',
        'For engagement: Choose visually engaging, age-appropriate videos that bring topics to life beyond the textbook'
      ]
    },
    benefits: {
      students: [
        'Learn at their own pace with the ability to pause and rewind',
        'Receive immediate feedback on embedded questions',
        'Access high-quality video content that enhances understanding',
        'Develop independent learning skills through self-paced work'
      ],
      staff: [
        'Track student engagement and understanding through analytics',
        'Save lesson time by setting pre-learning via video',
        'Access thousands of ready-made interactive videos',
        'Identify gaps in understanding quickly and respond appropriately'
      ],
      college: [
        'Support blended and flexible learning approaches',
        'Improve independent learning skills across students',
        'Enhance use of technology to support teaching and learning',
        'Provide evidence of formative assessment practice'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'copilot-explorer': {
    tool: 'copilot',
    level: 'explorer',
    intro: {
      title: 'Microsoft Copilot - Explorer Level',
      description: 'At Explorer level, Microsoft Copilot is all about resource creation. Learn how to upload your lesson plan and a brief class profile — without including any individual student names — and use Copilot to generate teaching resources that are tailored to your curriculum content and your learners\' needs. From differentiated activities and scaffolded tasks to vocabulary support and simplified texts, Copilot can transform your planning time and ensure every learner has access to resources pitched at the right level for them.',
      whyItMatters: [
        'Saves valuable planning time that can be spent on teaching and student support',
        'Helps generate ideas when you need fresh approaches or inspiration',
        'Creates draft resources that you can adapt and personalise',
        'Supports consistency and high expectations through quality starting points'
      ],
    },
    mainContent: {
      howToUse: 'At Explorer level, learn to access Microsoft Copilot and write simple, clear prompts. Focus on using it for basic planning tasks: generating learning objectives, creating simple lesson plan outlines, drafting starter activities, or producing quiz questions. Always review and adapt the output to suit your students and context.',
      examples: [
        'For planning: Prompt Copilot with "Create a lesson plan on photosynthesis for Level 2 BTEC Science students, including a starter, main activities, and plenary"',
        'For assessment: Ask "Generate 5 multiple choice questions on Pythagoras\' theorem for GCSE Maths students, with answers"',
        'For differentiation: Request "Summarise the causes of World War 1 in three versions: foundation, core, and higher level"',
        'For time-saving: Use "Create learning objectives for a unit on business finance following Bloom\'s Taxonomy"',
        'For variety: Prompt "Suggest 3 creative starter activities to introduce the topic of climate change"'
      ]
    },
    benefits: {
      students: [
        'Benefit from well-structured lessons planned more efficiently',
        'Access resources adapted to their level and needs',
        'Experience varied activities created with AI support',
        'Receive clearer learning objectives aligned to curriculum standards'
      ],
      staff: [
        'Save significant planning time each week',
        'Generate ideas and inspiration when needed',
        'Create consistent, high-quality lesson frameworks',
        'Reduce workload whilst maintaining teaching quality'
      ],
      college: [
        'Improved efficiency across teaching staff',
        'More time for staff to focus on teaching and student support',
        'Enhanced consistency in lesson planning and resources',
        'Embracing AI to work smarter, not harder'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'canva-practitioner': {
    tool: 'canva',
    level: 'practitioner',
    intro: {
      title: 'Canva - Practitioner Level',
      description: 'At Practitioner level, you will use Canva to create professional-quality presentations, quizzes, posters, and learning materials using templates. Focus on adapting designs for your subject, making resources accessible, and building a consistent visual identity for your teaching materials.',
      whyItMatters: [
        'Templates help you create polished, professional resources quickly',
        'Presentations and posters can be tailored precisely to your curriculum',
        'Accessible design ensures all learners can benefit from your resources',
        'Consistent visual materials support your professional teaching identity'
      ]
    },
    mainContent: {
      howToUse: 'At Practitioner level, use Canva\'s template library to create presentations, quizzes, posters, and other teaching materials. Customise templates with your subject content, college branding, and accessibility features like proper contrast and readable fonts. Build a library of go-to templates that you can reuse and adapt across topics.',
      examples: [
        'For presentations: Use a Canva template to create a visually engaging lesson presentation with consistent branding, clear headings, and embedded images',
        'For quizzes: Design an interactive quiz poster or worksheet using Canva templates, with clear questions and visual answer options',
        'For posters: Create classroom display posters for key vocabulary, processes, or success criteria using professional templates',
        'For accessibility: Adapt a template with high contrast colours, dyslexia-friendly fonts, and clear visual hierarchy for students with additional needs',
        'For consistency: Build a set of branded templates for your department that all staff can use for handouts, slides, and displays',
        'For student resources: Create revision guides, knowledge organisers, or infographics using templates tailored to your topic'
      ]
    },
    benefits: {
      students: [
        'Access professionally designed learning materials tailored to their course',
        'Benefit from clear, visually consistent resources across lessons',
        'Experience inclusive materials that work for different learning preferences',
        'Engage with well-designed presentations, posters, and revision resources'
      ],
      staff: [
        'Create professional-quality resources quickly using templates',
        'Build a reusable library of presentations and materials for your subject',
        'Develop valuable design skills transferable across all teaching',
        'Maintain consistent, branded materials across your department'
      ],
      college: [
        'Professional, high-quality learning resources across departments',
        'Improved accessibility and inclusion in teaching materials',
        'Staff developing confident digital design skills',
        'Consistent visual identity in teaching and learning materials'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'edpuzzle-practitioner': {
    tool: 'edpuzzle',
    level: 'practitioner',
    intro: {
      title: 'Edpuzzle - Practitioner Level',
      description: 'At Practitioner level, you will move beyond using pre-made videos to customising and creating your own interactive video content. Master adding voiceovers, notes, and strategic questions whilst using analytics to inform your teaching decisions.',
      whyItMatters: [
        'Custom voiceovers allow you to personalise any video to your specific context and students',
        'Strategic question placement maximises engagement and checks understanding at key moments',
        'Analytics reveal patterns in student learning that inform responsive teaching',
        'Integration with Teams creates seamless learning workflows'
      ]
    },
    mainContent: {
      howToUse: 'At Practitioner level, customise existing videos by adding your own voiceover narration, inserting notes at key moments, and strategically placing questions to check understanding. Use Edpuzzle analytics to identify where students struggle and adjust your teaching accordingly. Integrate Edpuzzle assignments within MS Teams for a streamlined student experience.',
      examples: [
        'For personalisation: Record your own voiceover on a YouTube video, adding context specific to your curriculum and students whilst keeping engaging visuals',
        'For responsive teaching: After reviewing analytics showing 70% of students rewatched a section, address that concept in more depth in your next lesson',
        'For vocabulary support: Add notes at moments when key terminology appears, providing definitions or explanations without interrupting the video',
        'For formative assessment: Place open-ended questions at critical points asking students to predict, explain, or connect to prior learning',
        'For integration: Embed Edpuzzle assignments as tabs within your Teams channel so students access everything in one place',
        'For differentiation: Create two versions of an interactive video - one with more scaffolding questions and notes for students who need additional support'
      ]
    },
    benefits: {
      students: [
        'Experience personalised video content tailored to their course',
        'Receive additional support through notes and voiceover explanations',
        'Benefit from teaching responsive to identified learning gaps',
        'Access videos seamlessly within their familiar Teams environment'
      ],
      staff: [
        'Transform any video into personalised teaching content',
        'Gain actionable insights from detailed engagement analytics',
        'Create seamless workflows integrating video with other resources',
        'Identify and address misconceptions quickly through data'
      ],
      college: [
        'Data-informed teaching practices across departments',
        'Personalised learning at scale through customised video',
        'Efficient use of existing video content with added value',
        'Evidence of responsive, analytics-driven teaching approaches'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'copilot-practitioner': {
    tool: 'copilot',
    level: 'practitioner',
    intro: {
      title: 'Microsoft Copilot - Practitioner Level',
      description: 'At Practitioner level, you will develop sophisticated prompting techniques to get more from Copilot, create differentiated resources efficiently, and begin exploring Copilot Agents for customised AI assistance in your teaching.',
      whyItMatters: [
        'Advanced prompting produces significantly better, more usable outputs first time',
        'Differentiated resources can be generated efficiently at multiple levels simultaneously',
        'Copilot Agents provide customised AI assistants for specific teaching purposes',
        'Responsible AI use models good practice for students developing their own AI literacy'
      ]
    },
    mainContent: {
      howToUse: 'At Practitioner level, craft detailed prompts that include context, audience, format, and success criteria. Generate differentiated resources at foundation, core, and higher levels in single prompts. Explore creating Copilot Agents customised to your subject or teaching needs. Always review outputs critically and model responsible AI use.',
      examples: [
        'For advanced prompting: "Create a lesson plan on photosynthesis for Level 2 BTEC Applied Science. Include: 3 differentiated learning objectives, a 5-minute starter using images, 2 practical activities with risk assessments, and an exit ticket. Format as a table."',
        'For differentiation: "Write an explanation of supply and demand for A-Level Economics students in three versions: foundation (300 words, simple vocabulary, real-world examples), core (400 words, key terminology defined), and higher (500 words, including evaluation of limitations)"',
        'For Copilot Agents: Create an agent trained on your scheme of work that can answer student questions about assessment criteria and deadlines',
        'For assessment: "Generate a marking rubric for a 1500-word essay on climate change impacts, with descriptors for fail, pass, merit, and distinction grades"',
        'For student support: Create a revision guide agent that students can query for explanations and practice questions on specific topics',
        'For responsible use: Demonstrate to students how to verify AI outputs by fact-checking and cross-referencing sources'
      ]
    },
    benefits: {
      students: [
        'Access resources precisely matched to their ability level',
        'Benefit from well-structured, consistent learning materials',
        'Develop AI literacy through seeing responsible use modelled',
        'Receive personalised support through Copilot Agents'
      ],
      staff: [
        'Produce high-quality differentiated resources in minutes',
        'Create custom AI assistants for routine tasks and queries',
        'Develop valuable AI skills transferable across education',
        'Significantly reduce time on repetitive planning tasks'
      ],
      college: [
        'Staff skilled in advanced, responsible AI use',
        'Efficient resource creation across all departments',
        'Innovation in AI-assisted teaching and learning',
        'Students developing AI literacy for future employment'
      ]
    },
    quiz: [] /* knowledge checks now run through the module sign-off */
  },

  'edpuzzle-leader': {
    tool: 'edpuzzle',
    level: 'leader',
    intro: {
      title: 'Edpuzzle Leader',
      description: 'As a Leader, you champion innovative video-based learning practices, mentor colleagues in using Edpuzzle effectively, and contribute to shaping the college\'s approach to interactive video content.',
      whyItMatters: [
        'Model excellence in creating engaging, interactive video lessons',
        'Lead professional development and share best practices',
        'Drive innovation in digital teaching strategies',
        'Support colleagues in developing their Edpuzzle skills'
      ],
    },
    mainContent: {
      howToUse: 'At Leader level, create sophisticated interactive video lessons, share best practices with colleagues, and lead training sessions on effective Edpuzzle implementation.',
      examples: [
        'Create comprehensive video lesson series for your subject area',
        'Mentor colleagues in developing their Edpuzzle skills',
        'Share innovative use cases in staff meetings or training sessions',
        'Analyse engagement data to inform teaching strategies'
      ]
    },
    benefits: {
      students: [
        'Access to high-quality, interactive video content',
        'Benefit from innovative teaching approaches',
        'Experience engaging, self-paced learning'
      ],
      staff: [
        'Learn from a leader in video-based pedagogy',
        'Access to mentoring and support',
        'Gain practical examples and templates'
      ],
      college: [
        'Enhanced reputation for digital innovation',
        'Improved teaching quality across departments',
        'Strong professional development culture'
      ]
    },
    quiz: []
  },
  'copilot-leader': {
    tool: 'copilot',
    level: 'leader',
    intro: {
      title: 'Microsoft Copilot Leader',
      description: 'As a Copilot Leader, you exemplify advanced AI-assisted teaching practices, guide colleagues in responsible AI use, and help shape the college\'s AI integration strategy.',
      whyItMatters: [
        'Champion responsible and effective AI use in education',
        'Lead innovation in AI-assisted teaching and learning',
        'Mentor staff in developing AI literacy',
        'Contribute to college-wide AI strategy and policies'
      ],
    },
    mainContent: {
      howToUse: 'At Leader level, develop advanced prompting techniques, create AI-enhanced teaching resources, and lead professional development on AI integration in education.',
      examples: [
        'Design sophisticated prompt frameworks for different teaching scenarios',
        'Lead workshops on responsible AI use in education',
        'Create AI-enhanced curriculum materials and share with colleagues',
        'Develop college guidelines for AI use in teaching and assessment'
      ]
    },
    benefits: {
      students: [
        'Access to innovative, AI-enhanced learning experiences',
        'Development of AI literacy skills',
        'High-quality, personalised learning resources'
      ],
      staff: [
        'Expert guidance on AI integration',
        'Practical training and support',
        'Access to proven AI teaching strategies'
      ],
      college: [
        'Leadership in AI-enhanced education',
        'Responsible AI use framework',
        'Improved efficiency and teaching quality'
      ]
    },
    quiz: []
  }
};

// Helper function to get pathway data
export const getPathway = (tool: string, level: string): LearningPathway | null => {
  const key = `${tool}-${level}`;
  return learningPathways[key] || null;
};
