import { Tool } from '@/types/learning';

export interface Resource {
  id: string;
  tool: Tool | 'forms' | 'immersive';
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'link';
  url: string;
  function: string;
  level?: 'explorer' | 'practitioner' | 'leader' | 'all';
  pdfUrl?: string;
}

export const resources: Resource[] = [
  // MS Teams Resources
  {
    id: 'teams-1',
    tool: 'teams',
    title: 'How to Send Announcements in Teams',
    description: 'Learn how to effectively communicate with your class using announcements',
    type: 'link',
    url: 'https://www.iorad.com/player/2667960/Teams-Microsoft---How-to-post-announcements-',
    function: 'Send announcements',
    level: 'explorer',
  },
  {
    id: 'teams-2',
    tool: 'teams',
    title: 'Uploading and Sharing Files in Teams',
    description: 'Step-by-step guide to sharing resources with students',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=mRAmivNyj90',
    function: 'Upload and share files',
    level: 'explorer',
  },
  {
    id: 'teams-4',
    tool: 'teams',
    title: 'Creating Assignments in Teams',
    description: 'Complete guide to setting up assignments and collecting work',
    type: 'link',
    url: 'https://www.iorad.com/player/2670526/Microsoft-Teams---Creating-Assignments-',
    function: 'Create assignments',
    level: 'explorer',
    pdfUrl: '/resources/Microsoft_Teams_-_Creating_Assignments.pdf',
  },
  {
    id: 'teams-5',
    tool: 'teams',
    title: 'Marking and Feedback in Teams',
    description: 'How to mark work and provide meaningful feedback',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=OzhsuSbgpcA',
    function: 'Mark work and give feedback',
    level: 'explorer',
  },
  {
    id: 'teams-6',
    tool: 'teams',
    title: 'Organising Content with Classwork',
    description: 'Structure your class team for easy navigation',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=_AX6oPTRZUw',
    function: 'Organise content using Classwork',
    level: 'explorer',
  },
  {
    id: 'teams-7',
    tool: 'teams',
    title: 'Running Live Lessons in Teams',
    description: 'Master online teaching with Teams meetings',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=02-mVLl8cD4',
    function: 'Run live lessons',
    level: 'practitioner',
  },
  {
    id: 'teams-8',
    tool: 'teams',
    title: 'Using Breakout Rooms',
    description: 'Enable collaborative small group work in online lessons',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=qaLy4apNEKE',
    function: 'Use Breakout Rooms',
    level: 'practitioner',
  },
  {
    id: 'teams-9',
    tool: 'teams',
    title: 'Creating and Applying Rubrics',
    description: 'Set clear assessment criteria for consistent marking',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=PB3LIeJZX2g',
    function: 'Create and apply Rubrics',
    level: 'practitioner',
  },

  // MS Forms Resources
  {
    id: 'forms-1',
    tool: 'forms',
    title: 'Creating Your First Quiz in Forms',
    description: 'Get started with creating quizzes and surveys',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=7CwSwEir86w',
    function: 'Create a simple quiz or survey',
    level: 'explorer',
  },
  {
    id: 'forms-2',
    tool: 'forms',
    title: 'Sharing Forms with Students',
    description: 'Different ways to share your forms via link or Teams',
    type: 'link',
    url: 'https://www.iorad.com/player/2667975/How-to-share-a-MS-Form-with-students-',
    function: 'Share a Form',
    level: 'explorer',
    pdfUrl: '/resources/How_to_share_a_MS_Form_with_students.pdf',
  },
  {
    id: 'forms-3',
    tool: 'forms',
    title: 'Viewing and Analysing Results',
    description: 'Understanding your form responses and analytics',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=8n20w8n1a94',
    function: 'View basic results',
    level: 'explorer',
  },
  {
    id: 'forms-4',
    tool: 'forms',
    title: 'Creating Branching Quizzes',
    description: 'Build adaptive assessments that respond to student answers',
    type: 'link',
    url: 'https://www.iorad.com/player/2667996/MS-Forms---branching',
    function: 'Create branching quizzes',
    level: 'practitioner',
    pdfUrl: '/resources/MS_Forms_-_branching.pdf',
  },

  // Canva Resources
  {
    id: 'canva-1',
    tool: 'canva',
    title: 'Getting Started with Canva Templates',
    description: 'How to find and use templates for education',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=zJSgUx5K6V0',
    function: 'Use a provided template',
    level: 'explorer',
  },
  {
    id: 'canva-2',
    tool: 'canva',
    title: 'Creating Starter Activities',
    description: 'Design engaging lesson starters with Canva',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=s23rLIWZeZg',
    function: 'Create a simple starter activity',
    level: 'explorer',
  },
  {
    id: 'canva-3',
    tool: 'canva',
    title: 'Sharing with Links and QR Codes',
    description: 'Easily share your designs with students',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=WuzFHOsByyg',
    function: 'Publish and share with students',
    level: 'explorer',
  },
  {
    id: 'canva-4',
    tool: 'canva',
    title: 'Creating Interactive Activities with Canva Code',
    description: 'Build engaging interactive learning experiences',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=H4JW7S9PXGU',
    function: 'Build interactive learning activities',
    level: 'practitioner',
  },

  // Edpuzzle Resources
  {
    id: 'edpuzzle-1',
    tool: 'edpuzzle',
    title: 'Creating Your First Edpuzzle Class',
    description: 'Set up your class and invite students',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=P-h8xjCdaPg',
    function: 'Create a class',
    level: 'explorer',
  },
  {
    id: 'edpuzzle-2',
    tool: 'edpuzzle',
    title: 'Assigning Pre-made Videos',
    description: 'Find and assign existing educational videos',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=OZnM6LlmMzo',
    function: 'Assign a pre-made video',
    level: 'explorer',
  },
  {
    id: 'edpuzzle-3',
    tool: 'edpuzzle',
    title: 'Tracking Student Progress',
    description: 'Monitor who has watched and completed videos',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=fxH0jhBQvzM',
    function: 'Check completion',
    level: 'explorer',
  },
  {
    id: 'edpuzzle-4',
    tool: 'edpuzzle',
    title: 'Adding Questions and Voiceovers',
    description: 'Make videos interactive with embedded content',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=qLx3JAfBjdU',
    function: 'Add questions, notes, or voiceovers',
    level: 'practitioner',
  },

  // Microsoft Copilot Resources
  {
    id: 'copilot-1',
    tool: 'copilot',
    title: 'Getting Started with Microsoft Copilot',
    description: 'Access and navigate the Copilot interface',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=vJPhDitlko4',
    function: 'Access Copilot',
    level: 'explorer',
  },
  {
    id: 'copilot-2',
    tool: 'copilot',
    title: 'Writing Effective Prompts',
    description: 'Craft prompts that get the results you need',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=XVzwbLLB4dI',
    function: 'Write simple prompts',
    level: 'explorer',
  },
  {
    id: 'copilot-3',
    tool: 'copilot',
    title: 'Generating Lesson Plans with Copilot',
    description: 'Use AI to create lesson plans quickly',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=XVzwbLLB4dI',
    function: 'Generate a basic lesson plan',
    level: 'explorer',
  },
  {
    id: 'copilot-4',
    tool: 'copilot',
    title: 'Creating Differentiated Resources',
    description: 'Use Copilot to create resources for different ability levels',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=qQeRG7fZh0c',
    function: 'Generate differentiated resources',
    level: 'practitioner',
  },
  {
    id: 'copilot-5',
    tool: 'copilot',
    title: 'Introduction to Copilot Agents',
    description: 'Create and use custom AI agents for education',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=hGRRs5CYIzY',
    function: 'Create and use Copilot Agents',
    level: 'practitioner',
  },

  // Immersive Room Resources
  {
    id: 'immersive-1',
    tool: 'immersive',
    title: 'Introduction to Immersive Learning',
    description: 'Overview of immersive learning spaces at Bradford College',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=example',
    function: 'Attend an introduction session',
    level: 'practitioner',
  },
];

export const getResourcesByTool = (tool: Tool | 'forms' | 'immersive'): Resource[] => {
  return resources.filter((r) => r.tool === tool);
};

export const searchResources = (query: string): Resource[] => {
  const lowerQuery = query.toLowerCase();
  return resources.filter(
    (r) =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description.toLowerCase().includes(lowerQuery) ||
      r.function.toLowerCase().includes(lowerQuery)
  );
};

export const toolDisplayNames: Record<string, string> = {
  teams: 'MS Teams',
  forms: 'MS Forms',
  canva: 'Canva',
  edpuzzle: 'Edpuzzle',
  copilot: 'Microsoft Copilot',
  immersive: 'Immersive Room',
};
