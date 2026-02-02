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
    url: 'https://www.youtube.com/watch?v=vwZgJH07XSA',
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
  {
    id: 'teams-10',
    tool: 'teams',
    title: 'How to Schedule a Message',
    description: 'Learn how to schedule messages in Microsoft Teams',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=SC73i2SMulg',
    function: 'Schedule messages',
    level: 'explorer',
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
    title: 'MS Forms Tips and Tricks',
    description: 'Helpful tips and tricks for getting the most out of MS Forms',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=PUhwt9misLg',
    function: 'Tips and tricks',
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
    id: 'canva-2b',
    tool: 'canva',
    title: 'Sharing with Links and QR Codes',
    description: 'Easily share your designs with students',
    type: 'link',
    url: 'https://ior.ad/bcIz',
    function: 'Publish and share with students',
    level: 'explorer',
  },
  {
    id: 'canva-4',
    tool: 'canva',
    title: 'Creating Interactive Activities with Canva Code',
    description: 'Build engaging interactive learning experiences',
    type: 'link',
    url: 'https://www.iorad.com/player/2670491/Canva---How-to-create-activities-in-Cava-Code',
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
    url: 'https://www.youtube.com/watch?v=UufZ8W3yxZE',
    function: 'Create a class',
    level: 'explorer',
  },
  {
    id: 'edpuzzle-2',
    tool: 'edpuzzle',
    title: 'Edpuzzle - How to Create an Assignment',
    description: 'Learn how to create and assign videos to students',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=3p2mXusm5Tg',
    function: 'Create an assignment',
    level: 'explorer',
  },
  {
    id: 'edpuzzle-3',
    tool: 'edpuzzle',
    title: 'Tracking Student Progress',
    description: 'Monitor who has watched and completed videos',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=YaYbvkgrT_c',
    function: 'Check completion',
    level: 'explorer',
  },
  {
    id: 'edpuzzle-4',
    tool: 'edpuzzle',
    title: 'Edpuzzle - How to Edit an Activity',
    description: 'Learn how to edit and customise video activities',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=XlLVsha1WY4',
    function: 'Edit activities',
    level: 'practitioner',
  },

  // Microsoft Copilot Resources
  {
    id: 'copilot-1',
    tool: 'copilot',
    title: 'Getting Started with Microsoft Copilot',
    description: 'Access and navigate the Copilot interface',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=JbOJliF-Cn4',
    function: 'Access Copilot',
    level: 'explorer',
  },
  {
    id: 'copilot-2',
    tool: 'copilot',
    title: 'Writing Effective Prompts',
    description: 'Craft prompts that get the results you need',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=9b0LOSjq39w',
    function: 'Write simple prompts',
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
    type: 'link',
    url: 'https://www.iorad.com/player/2670513/M365-Cloud---Creating-an-agent-on-CoPilot',
    function: 'Create and use Copilot Agents',
    level: 'practitioner',
    pdfUrl: '/resources/M365_Cloud_Creating_an_agent_on_CoPilot.pdf',
  },
  {
    id: 'copilot-6',
    tool: 'copilot',
    title: 'Microsoft 365 Copilot: Create a Quiz with AI',
    description: 'Use Copilot to generate quizzes quickly and effectively',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=5jJ6m0XPl6g',
    function: 'Create quizzes with AI',
    level: 'explorer',
  },

  // Immersive Room Resources
  {
    id: 'immersive-1',
    tool: 'immersive',
    title: 'Introduction to Immersive Learning',
    description: 'Explore the immersive room with a 360° view and discover what the room has to offer',
    type: 'link',
    url: 'https://www.thinglink.com/video/1959585229274350436',
    function: 'Attend an introduction session',
    level: 'practitioner',
  },
  {
    id: 'immersive-2',
    tool: 'immersive',
    title: 'Book the Immersive Room',
    description: 'Complete the booking form to reserve the immersive room for your learners',
    type: 'link',
    url: 'https://forms.office.com/pages/responsepage.aspx?id=7ACxezLnGEGVoPw4WOs6XsPATjPLlsFLkgDBsoQJl3tUMVVJTlQ4MDdWN0syNlJUS1M5R1pETllKTyQlQCNjPTEu&route=shorturl',
    function: 'Book and deliver a session',
    level: 'practitioner',
  },
  {
    id: 'immersive-3',
    tool: 'immersive',
    title: 'Staff Guidelines for Immersive Room',
    description: 'Essential guidelines for staff using the immersive learning space. Before using the room, book a training session with Clark Mitton (c.mitton@bradfordcollege.ac.uk) or Monika Worthington (m.worthington@bradfordcollege.ac.uk)',
    type: 'pdf',
    url: '/resources/Immersive_Room_Staff_Guidelines.pdf',
    function: 'Design a session using available tools',
    level: 'practitioner',
    pdfUrl: '/resources/Immersive_Room_Staff_Guidelines.pdf',
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
