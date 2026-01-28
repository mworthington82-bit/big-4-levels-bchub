import { LearningPathway, QuizQuestion } from '@/types/learning';

// Quiz questions for MS Teams & Forms - Explorer
const teamsExplorerQuiz: QuizQuestion[] = [
  {
    id: 'te1',
    question: 'What is the main purpose of using MS Teams announcements in your class team?',
    options: [
      'To replace all other forms of communication',
      'To send important reminders and updates to all students',
      'To grade student assignments',
      'To create interactive videos'
    ],
    correctAnswer: 1,
    explanation: 'Announcements are ideal for sharing important information with the entire class efficiently.'
  },
  {
    id: 'te2',
    question: 'In MS Forms, what is the benefit of creating a simple quiz for your students?',
    options: [
      'It can only be used for summative assessment',
      'It provides instant feedback and helps check understanding quickly',
      'It replaces all paper-based work',
      'It is only useful for Maths subjects'
    ],
    correctAnswer: 1,
    explanation: 'Forms quizzes provide immediate feedback and allow quick checks for learning.'
  },
  {
    id: 'te3',
    question: 'How does organising content with Classwork in Teams support teaching and learning?',
    options: [
      'It keeps resources organised and easy for students to find',
      'It automatically marks all work',
      'It creates lesson plans',
      'It only works for online lessons'
    ],
    correctAnswer: 0,
    explanation: 'Classwork helps structure and organise resources, making navigation easier for students.'
  },
  {
    id: 'te4',
    question: 'Which of these is an example of using MS Teams to support accessibility?',
    options: [
      'Only sharing resources via email',
      'Using the immersive reader and live captions features',
      'Limiting file types to PDFs only',
      'Removing all visual content'
    ],
    correctAnswer: 1,
    explanation: 'Immersive reader and live captions are powerful accessibility tools built into Teams.'
  },
  {
    id: 'te5',
    question: 'What is one way MS Forms can support formative assessment?',
    options: [
      'By providing end-of-year exam results only',
      'By giving quick feedback on student understanding during a lesson',
      'By replacing all written assessments',
      'By grading students automatically without teacher input'
    ],
    correctAnswer: 1,
    explanation: 'Forms is excellent for quick formative checks that inform teaching decisions in real-time.'
  }
];

// Quiz questions for MS Teams & Forms - Practitioner
const teamsPractitionerQuiz: QuizQuestion[] = [
  {
    id: 'tp1',
    question: 'What is the main advantage of using Breakout Rooms in MS Teams for teaching?',
    options: [
      'They replace the need for whole-class instruction',
      'They enable small group collaboration and discussion during online or hybrid lessons',
      'They only work for revision sessions',
      'They prevent students from asking questions'
    ],
    correctAnswer: 1,
    explanation: 'Breakout Rooms facilitate collaborative learning by allowing students to work in smaller groups before returning to the main session.'
  },
  {
    id: 'tp2',
    question: 'How does using Rubrics in Teams Assignments benefit both teachers and students?',
    options: [
      'They only work for written essays',
      'They provide clear success criteria and enable consistent, transparent feedback',
      'They automatically grade all work',
      'They replace the need for written feedback'
    ],
    correctAnswer: 1,
    explanation: 'Rubrics make expectations clear and ensure consistent assessment standards whilst saving marking time.'
  },
  {
    id: 'tp3',
    question: 'What is the main advantage of using structured channels in Teams?',
    options: [
      'Only storing files for the teacher',
      'Organised spaces for different topics, resources, and discussions',
      'Replacing all paper-based work',
      'Only for online lessons'
    ],
    correctAnswer: 1,
    explanation: 'Structured channels help organise your Team with dedicated spaces for different topics, making it easier for students to find resources and engage in focused discussions.'
  },
  {
    id: 'tp4',
    question: 'What is the key benefit of using branching in MS Forms quizzes?',
    options: [
      'It makes quizzes shorter',
      'It creates personalised pathways based on student responses, enabling adaptive assessment',
      'It only works for multiple choice questions',
      'It prevents students from going back to previous questions'
    ],
    correctAnswer: 1,
    explanation: 'Branching creates adaptive assessments that respond to individual student answers, providing differentiated feedback and pathways.'
  },
  {
    id: 'tp5',
    question: 'How can you use Forms response analytics to improve your teaching?',
    options: [
      'Analytics are only useful for summative assessment',
      'By identifying common misconceptions and adjusting your teaching in response',
      'By sharing all student scores publicly',
      'Analytics only show completion rates'
    ],
    correctAnswer: 1,
    explanation: 'Response analytics reveal patterns in student understanding, allowing you to address gaps and adapt your teaching responsively.'
  }
];

// Quiz questions for Canva - Explorer
const canvaExplorerQuiz: QuizQuestion[] = [
  {
    id: 'ce1',
    question: 'What is the main advantage of using Canva templates for creating learning materials?',
    options: [
      'They require advanced design skills',
      'They save time and provide professionally designed starting points',
      'They can only be used once',
      'They are only available in one subject area'
    ],
    correctAnswer: 1,
    explanation: 'Canva templates provide professional designs that staff can quickly customise without design expertise.'
  },
  {
    id: 'ce2',
    question: 'How can Canva support visual learning for students?',
    options: [
      'By making all resources text-only',
      'By creating engaging, visually appealing materials that aid understanding',
      'By removing all images',
      'By only creating certificates'
    ],
    correctAnswer: 1,
    explanation: 'Visual materials help engage students and support different learning preferences.'
  },
  {
    id: 'ce3',
    question: 'What is one way to share a Canva creation with students?',
    options: [
      'Print only',
      'Share via link or QR code',
      'Email individual files to each student',
      'Post on social media only'
    ],
    correctAnswer: 1,
    explanation: 'Links and QR codes make sharing quick, accessible, and suitable for digital or blended learning.'
  },
  {
    id: 'ce4',
    question: 'How does using Canva support consistency across the college?',
    options: [
      'Everyone creates completely unique materials',
      'Staff can use branded templates maintaining professional standards',
      'It prevents all creativity',
      'Only one person can use it'
    ],
    correctAnswer: 1,
    explanation: 'Branded templates ensure consistency whilst still allowing creative flexibility.'
  },
  {
    id: 'ce5',
    question: 'What type of learning activity could you create with Canva?',
    options: [
      'Only posters',
      'Starter activities, worksheets, presentations, and interactive materials',
      'Just certificates',
      'Only social media posts'
    ],
    correctAnswer: 1,
    explanation: 'Canva is versatile and can create many types of educational materials.'
  }
];

// Quiz questions for Edpuzzle - Explorer
const edpuzzleExplorerQuiz: QuizQuestion[] = [
  {
    id: 'ee1',
    question: 'What is the main benefit of using Edpuzzle in teaching?',
    options: [
      'It replaces all face-to-face teaching',
      'It turns passive video watching into active learning with embedded questions',
      'It only works for science subjects',
      'It removes the need for teacher feedback'
    ],
    correctAnswer: 1,
    explanation: 'Edpuzzle transforms videos into interactive learning experiences with embedded checks for understanding.'
  },
  {
    id: 'ee2',
    question: 'How can Edpuzzle support independent learning?',
    options: [
      'Students must watch with the teacher',
      'Students can access videos at their own pace, rewatching as needed',
      'Videos can only be watched once',
      'It prevents students from pausing'
    ],
    correctAnswer: 1,
    explanation: 'Edpuzzle allows self-paced learning with the ability to pause, rewind, and review.'
  },
  {
    id: 'ee3',
    question: 'What insight does Edpuzzle provide to teachers?',
    options: [
      'No tracking information',
      'Analytics showing which students watched and how they answered questions',
      'Only final grades',
      'Student email addresses'
    ],
    correctAnswer: 1,
    explanation: 'Edpuzzle provides valuable analytics on engagement and understanding.'
  },
  {
    id: 'ee4',
    question: 'How does Edpuzzle support differentiation?',
    options: [
      'All students must watch identical content',
      'Teachers can assign different videos to different students based on need',
      'It prevents any customisation',
      'Only works with one learning style'
    ],
    correctAnswer: 1,
    explanation: 'Different videos or video segments can be assigned to support varied learning needs.'
  },
  {
    id: 'ee5',
    question: 'What is one way to use Edpuzzle following the LEAD model?',
    options: [
      'Only for homework',
      'As a Launch activity to introduce new concepts with embedded questions',
      'Never in lessons',
      'Only for revision'
    ],
    correctAnswer: 1,
    explanation: 'Edpuzzle works excellently in the Launch phase to engage students with new content.'
  }
];

// Quiz questions for Microsoft Copilot - Explorer
const copilotExplorerQuiz: QuizQuestion[] = [
  {
    id: 'co1',
    question: 'What is Microsoft Copilot designed to help teachers with?',
    options: [
      'Replace teachers entirely',
      'Save time by generating lesson plans, resources, and quiz questions using AI',
      'Only write emails',
      'Grade all student work automatically'
    ],
    correctAnswer: 1,
    explanation: 'Copilot is a time-saving tool that assists with planning and resource creation.'
  },
  {
    id: 'co2',
    question: 'What makes a good prompt when using Copilot?',
    options: [
      'Very vague instructions',
      'Clear, specific instructions with context about subject and level',
      'Single word requests',
      'Always asking the same question'
    ],
    correctAnswer: 1,
    explanation: 'Specific, contextualised prompts produce better, more relevant results.'
  },
  {
    id: 'co3',
    question: 'How should staff use AI-generated content from Copilot?',
    options: [
      'Copy and paste without reviewing',
      'Review, adapt, and personalise to fit students and context',
      'Never edit the output',
      'Only share with other staff'
    ],
    correctAnswer: 1,
    explanation: 'AI is a starting point - professional judgement is essential to adapt content appropriately.'
  },
  {
    id: 'co4',
    question: 'What is one way Copilot can support lesson planning?',
    options: [
      'It teaches the lesson for you',
      'It can generate learning objectives, activities, and differentiation ideas',
      'It only creates worksheets',
      'It replaces schemes of work'
    ],
    correctAnswer: 1,
    explanation: 'Copilot can assist with various aspects of planning, saving valuable preparation time.'
  },
  {
    id: 'co5',
    question: 'Why is it important to reference sources when Copilot summarises information?',
    options: [
      'References are not needed',
      'To ensure accuracy and model good academic practice for students',
      'Only for research papers',
      'Copilot always provides perfect information'
    ],
    correctAnswer: 1,
    explanation: 'Checking sources ensures accuracy and demonstrates professional standards.'
  }
];

// Quiz questions for Canva - Practitioner
const canvaPractitionerQuiz: QuizQuestion[] = [
  {
    id: 'cp1',
    question: 'What is the main advantage of creating original designs from scratch in Canva rather than only using templates?',
    options: [
      'Original designs take less time to create',
      'You can fully tailor materials to your specific curriculum and learner needs',
      'Templates are not available at Practitioner level',
      'Original designs are automatically accessible'
    ],
    correctAnswer: 1,
    explanation: 'Creating from scratch allows complete customisation to match your curriculum, learning objectives, and specific student needs.'
  },
  {
    id: 'cp2',
    question: 'How can Canva Code be used to enhance learning activities?',
    options: [
      'It only creates static documents',
      'It enables interactive elements like clickable buttons, animations, and gamified activities',
      'It replaces the need for any other digital tools',
      'It is only used for coding courses'
    ],
    correctAnswer: 1,
    explanation: 'Canva Code adds interactivity to designs, allowing you to create engaging, game-like learning activities.'
  },
  {
    id: 'cp3',
    question: 'What is a key consideration when adapting Canva resources for accessibility?',
    options: [
      'Use as many fonts as possible for variety',
      'Ensure sufficient colour contrast, clear fonts, and alternative text for images',
      'Accessibility only applies to printed materials',
      'All Canva templates are automatically accessible'
    ],
    correctAnswer: 1,
    explanation: 'Accessible design includes proper contrast, readable fonts, alt text, and considering diverse learner needs.'
  },
  {
    id: 'cp4',
    question: 'How does creating differentiated Canva resources support inclusive teaching?',
    options: [
      'All students receive identical materials regardless of need',
      'You can create multiple versions with varied complexity, scaffolding, or visual support',
      'Differentiation is only needed for written work',
      'Canva cannot be used for differentiated resources'
    ],
    correctAnswer: 1,
    explanation: 'Canva makes it easy to duplicate and adapt designs for different learner needs and ability levels.'
  },
  {
    id: 'cp5',
    question: 'What makes an interactive Canva activity effective for learning?',
    options: [
      'Using as many animations as possible',
      'Clear learning objectives, appropriate challenge level, and meaningful feedback opportunities',
      'Making activities as long as possible',
      'Only using text-based content'
    ],
    correctAnswer: 1,
    explanation: 'Effective interactive activities are purposeful, appropriately challenging, and support learning goals.'
  }
];

// Quiz questions for Edpuzzle - Practitioner
const edpuzzlePractitionerQuiz: QuizQuestion[] = [
  {
    id: 'ep1',
    question: 'What is the main benefit of adding your own voiceover to an Edpuzzle video?',
    options: [
      'It makes videos longer',
      'You can personalise explanations and add context specific to your students',
      'Voiceovers are required for all videos',
      'It removes the need for embedded questions'
    ],
    correctAnswer: 1,
    explanation: 'Custom voiceovers allow you to adapt content, add subject-specific explanations, and connect with your students personally.'
  },
  {
    id: 'ep2',
    question: 'How can Edpuzzle analytics inform your teaching decisions?',
    options: [
      'Analytics only show completion rates',
      'They reveal which concepts students struggle with, allowing targeted intervention',
      'Analytics are only useful for grading',
      'They automatically adjust lesson plans'
    ],
    correctAnswer: 1,
    explanation: 'Detailed analytics show where students pause, rewatch, or answer incorrectly, highlighting areas needing additional teaching.'
  },
  {
    id: 'ep3',
    question: 'What is the advantage of integrating Edpuzzle with MS Teams?',
    options: [
      'It replaces Teams entirely',
      'Students can access video assignments within their familiar learning environment',
      'Integration removes tracking capabilities',
      'It only works for live lessons'
    ],
    correctAnswer: 1,
    explanation: 'Integration creates a seamless workflow where students find interactive videos within their regular class resources.'
  },
  {
    id: 'ep4',
    question: 'How can adding notes to specific moments in an Edpuzzle video support learning?',
    options: [
      'Notes replace all questions',
      'They provide additional context, key vocabulary, or signposting without requiring a response',
      'Notes are only visible to teachers',
      'They skip sections of the video'
    ],
    correctAnswer: 1,
    explanation: 'Notes allow you to highlight important information, explain terminology, or guide attention without interrupting flow.'
  },
  {
    id: 'ep5',
    question: 'What is a best practice for creating effective embedded questions in Edpuzzle?',
    options: [
      'Add as many questions as possible',
      'Place questions at key learning moments to check understanding of concepts just covered',
      'Only use multiple choice questions',
      'Questions should all appear at the end'
    ],
    correctAnswer: 1,
    explanation: 'Strategic question placement ensures students actively process information at critical points in the video.'
  }
];

// Quiz questions for Microsoft Copilot - Practitioner
const copilotPractitionerQuiz: QuizQuestion[] = [
  {
    id: 'cop1',
    question: 'What makes an "advanced prompt" more effective than a basic prompt?',
    options: [
      'It uses more words',
      'It includes specific context, audience, format requirements, and desired outcomes',
      'Advanced prompts are shorter',
      'They always produce perfect results first time'
    ],
    correctAnswer: 1,
    explanation: 'Detailed prompts with context about level, subject, format, and purpose produce more relevant, usable outputs.'
  },
  {
    id: 'cop2',
    question: 'How can Copilot support differentiation in resource creation?',
    options: [
      'It only creates one version of any resource',
      'You can prompt for multiple versions at different levels (foundation, core, higher) in one request',
      'Differentiation must be done manually afterwards',
      'Copilot cannot adjust reading levels'
    ],
    correctAnswer: 1,
    explanation: 'Copilot can generate differentiated versions simultaneously, saving significant time on creating tiered resources.'
  },
  {
    id: 'cop3',
    question: 'What is a Microsoft Copilot Agent designed to do?',
    options: [
      'Replace teachers in the classroom',
      'Provide a customised AI assistant trained on specific content or processes you define',
      'Only answer general knowledge questions',
      'Agents cannot be created by teachers'
    ],
    correctAnswer: 1,
    explanation: 'Copilot Agents can be customised with your own instructions and knowledge to serve specific teaching purposes.'
  },
  {
    id: 'cop4',
    question: 'Why is it important to review and adapt AI-generated content before using it with students?',
    options: [
      'AI content is always perfect',
      'To ensure accuracy, appropriateness for your context, and alignment with your teaching approach',
      'Review is only needed for assessments',
      'Students prefer unedited AI content'
    ],
    correctAnswer: 1,
    explanation: 'Professional judgement is essential - AI provides a starting point that needs teacher expertise to refine and contextualise.'
  },
  {
    id: 'cop5',
    question: 'What is a responsible practice when using Copilot for teaching resources?',
    options: [
      'Share AI-generated content as your own work',
      'Check facts, verify sources, and be transparent about AI assistance where appropriate',
      'Never edit AI outputs',
      'Use AI for all assessment marking without review'
    ],
    correctAnswer: 1,
    explanation: 'Responsible AI use includes verification, fact-checking, and maintaining professional standards and transparency.'
  }
];

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
    quiz: teamsExplorerQuiz
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
    quiz: teamsPractitionerQuiz
  },
  
  'canva-explorer': {
    tool: 'canva',
    level: 'explorer',
    intro: {
      title: 'Canva - Explorer Level',
      description: 'Canva is a user-friendly design tool that enables staff to create professional, visually engaging learning materials without needing design expertise. From worksheets to presentations, Canva helps make learning more visual and appealing.',
      whyItMatters: [
        'Visual materials engage students and support different learning preferences',
        'Professional-looking resources raise expectations and standards',
        'Quick to create materials that would take hours in other software',
        'Templates ensure consistency whilst allowing creativity'
      ]
    },
    mainContent: {
      howToUse: 'At Explorer level, start by using ready-made templates to create starter activities, worksheets, or visual resources. Focus on customising templates rather than designing from scratch. Learn to share your creations via links or QR codes for easy student access.',
      examples: [
        'For starter activities: Use a Canva template to create a visual "Do Now" activity - e.g., match the image to the keyword, sparking curiosity as students settle',
        'For differentiation: Create visual knowledge organisers at different reading levels, using images and colour to support comprehension',
        'For engagement: Design visually appealing worksheets that look professional, raising expectations and student motivation',
        'For blended learning: Create infographics summarising key concepts that students can access via QR code in class or at home',
        'For celebration: Design certificates or achievement badges to recognise student progress and effort'
      ]
    },
    benefits: {
      students: [
        'Access to visually engaging materials that aid memory and understanding',
        'Resources designed with accessibility in mind (clear fonts, good contrast)',
        'Materials that look professional and value their learning',
        'Different visual formats to support varied learning preferences'
      ],
      staff: [
        'Create professional materials quickly without design skills',
        'Save time using templates that can be adapted and reused',
        'Increase student engagement through visual appeal',
        'Build a library of reusable, high-quality resources'
      ],
      college: [
        'Consistent visual standards across teaching materials',
        'Enhanced professional image of teaching quality',
        'Improved student engagement and outcomes through better resources',
        'Staff able to create branded materials efficiently'
      ]
    },
    quiz: canvaExplorerQuiz
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
        'Helps differentiate by allowing students to learn at their own pace'
      ],
      externalLinks: [
        {
          title: 'Edpuzzle Professional Development Course',
          url: 'https://edpuzzle.com/professional/courses/68cc1d00e0854d323d0d4e45',
          description: 'Complete this course to enhance your Edpuzzle skills'
        }
      ]
    },
    mainContent: {
      howToUse: 'At Explorer level, start by finding and assigning pre-made interactive videos from Edpuzzle\'s library. Create a class, assign videos, and track basic engagement (who watched, who completed). Focus on using this as a tool for independent learning or flipped classroom approaches.',
      examples: [
        'For Launch (LEAD): Assign an Edpuzzle video to introduce a new topic, with questions embedded to check initial understanding before the lesson',
        'For independent learning: Set an interactive video for homework, allowing students to pause, rewind, and learn at their own pace',
        'For differentiation: Assign different videos to different students based on their starting points or learning needs',
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
    quiz: edpuzzleExplorerQuiz
  },

  'copilot-explorer': {
    tool: 'copilot',
    level: 'explorer',
    intro: {
      title: 'Microsoft Copilot - Explorer Level',
      description: 'Microsoft Copilot uses artificial intelligence to help staff save time on planning and resource creation. From lesson plans to quiz questions, Copilot acts as a digital assistant that responds to your prompts with relevant, adaptable content.',
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
    quiz: copilotExplorerQuiz
  },

  'canva-practitioner': {
    tool: 'canva',
    level: 'practitioner',
    intro: {
      title: 'Canva - Practitioner Level',
      description: 'At Practitioner level, you will move beyond templates to create original, purposeful designs and build interactive learning activities using Canva Code. Focus on adapting resources for accessibility and differentiation whilst developing your creative design skills.',
      whyItMatters: [
        'Original designs can be precisely tailored to your curriculum and learner needs',
        'Interactive activities using Canva Code increase engagement and active learning',
        'Accessible design ensures all learners can benefit from your resources',
        'Differentiated materials support inclusive teaching for diverse classrooms'
      ]
    },
    mainContent: {
      howToUse: 'At Practitioner level, design resources from scratch rather than relying solely on templates. Learn to use Canva Code to add interactivity such as clickable elements, simple animations, and gamified activities. Focus on creating accessible designs with proper contrast, readable fonts, and alt text. Develop differentiated versions of resources for varied learner needs.',
      examples: [
        'For interactive learning: Create a "choose your own adventure" style activity using Canva Code where students click to navigate through scenarios related to your subject',
        'For gamification: Design an interactive quiz game where students click answers and receive immediate visual feedback through animations',
        'For accessibility: Develop a worksheet with high contrast colours, dyslexia-friendly fonts, and clear visual hierarchy for students with additional needs',
        'For differentiation: Create three versions of a knowledge organiser - foundation (more images, simpler text), core, and higher (extended vocabulary, deeper concepts)',
        'For engagement: Build an interactive timeline where students click on events to reveal information, supporting independent exploration',
        'For assessment: Design a peer assessment resource with clear success criteria and visual examples of different achievement levels'
      ]
    },
    benefits: {
      students: [
        'Engage with interactive, game-like learning activities',
        'Access resources designed for their specific needs and abilities',
        'Experience inclusive materials that work for different learning preferences',
        'Develop digital literacy through interacting with well-designed resources'
      ],
      staff: [
        'Create unique resources perfectly matched to your curriculum',
        'Build a library of interactive activities that increase engagement',
        'Develop valuable design skills transferable across all teaching',
        'Save time by creating differentiated resources efficiently'
      ],
      college: [
        'Innovative, high-quality learning resources across departments',
        'Improved accessibility and inclusion in teaching materials',
        'Staff developing advanced digital creation skills',
        'Enhanced student engagement through interactive content'
      ]
    },
    quiz: canvaPractitionerQuiz
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
    quiz: edpuzzlePractitionerQuiz
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
    quiz: copilotPractitionerQuiz
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
