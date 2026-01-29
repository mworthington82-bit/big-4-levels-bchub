import { Tool, Level } from '@/types/learning';

export interface LearningObjective {
  id: string;
  text: string;
  icon?: string;
  description?: string;
}

export interface ToolObjectives {
  tool: Tool | 'immersive';
  toolName: string;
  objectives: LearningObjective[];
}

export interface LevelObjectives {
  level: Level;
  tools: ToolObjectives[];
}

export const learningObjectives: Record<Level, ToolObjectives[]> = {
  explorer: [
    {
      tool: 'teams',
      toolName: 'MS Teams',
      objectives: [
        { id: 'te1', text: 'Send announcements', icon: '📢', description: 'Post important updates to your class channel that all students can see and respond to' },
        { id: 'te2', text: 'Upload and share files', icon: '📁', description: 'Share documents, presentations, and resources directly with your students through Teams' },
        { id: 'te3', text: 'Use chat with students', icon: '💬', description: 'Communicate with individual students or groups using the built-in chat feature' },
        { id: 'te4', text: 'Create assignments', icon: '📝', description: 'Set up coursework, homework, and projects with due dates and instructions' },
        { id: 'te5', text: 'Mark work and give feedback', icon: '✅', description: 'Review submitted work, add grades, and provide constructive feedback to students' },
        { id: 'te6', text: 'Organise content using Classwork', icon: '📚', description: 'Structure your teaching materials into modules and topics for easy student access' },
      ],
    },
    {
      tool: 'teams',
      toolName: 'MS Forms',
      objectives: [
        { id: 'fe1', text: 'Create a simple quiz or survey', icon: '📋', description: 'Build quick knowledge checks or gather student feedback using Forms' },
        { id: 'fe2', text: 'Share a Form (link or via Teams)', icon: '🔗', description: 'Distribute your quizzes and surveys directly to students through various channels' },
        { id: 'fe3', text: 'View basic results', icon: '📊', description: 'See response summaries and identify areas where students may need support' },
      ],
    },
    {
      tool: 'edpuzzle',
      toolName: 'Edpuzzle',
      objectives: [
        { id: 'ee1', text: 'Create a class', icon: '👥', description: 'Set up your virtual classroom and add students to track their progress' },
        { id: 'ee2', text: 'Assign a pre-made video', icon: '🎬', description: 'Choose from thousands of ready-made educational videos with embedded questions' },
        { id: 'ee3', text: 'Check if students have watched or completed it', icon: '👁️', description: 'Monitor which students have viewed the video and their completion status' },
      ],
    },
    {
      tool: 'copilot',
      toolName: 'Microsoft Copilot',
      objectives: [
        { id: 'ce1', text: 'Access Copilot', icon: '🤖', description: 'Learn how to open and start using Microsoft Copilot for education' },
        { id: 'ce2', text: 'Write simple prompts', icon: '✍️', description: 'Craft clear instructions to get useful responses from the AI assistant' },
        { id: 'ce3', text: 'Generate learning objectives', icon: '🎯', description: 'Use AI to create clear, measurable learning outcomes for your lessons' },
        { id: 'ce4', text: 'Generate a basic lesson plan', icon: '📖', description: 'Get AI assistance to structure your teaching sessions effectively' },
        { id: 'ce5', text: 'Generate a short summary of a topic', icon: '📄', description: 'Create concise overviews of complex topics for student revision' },
        { id: 'ce6', text: 'Generate a simple starter or quiz', icon: '❓', description: 'Quickly create engaging lesson starters and knowledge checks' },
      ],
    },
    {
      tool: 'canva',
      toolName: 'Canva (incl. Canva Code)',
      objectives: [
        { id: 'ca1', text: 'Use a provided template', icon: '🎨', description: 'Start with professional pre-made designs and customise them for your needs' },
        { id: 'ca2', text: 'Create a simple starter activity', icon: '🚀', description: 'Design engaging warm-up activities to capture student attention' },
        { id: 'ca3', text: 'Publish and share with students (link or QR code)', icon: '📱', description: 'Make your designs accessible to students via shareable links or scannable codes' },
      ],
    },
  ],
  practitioner: [
    {
      tool: 'teams',
      toolName: 'MS Teams',
      objectives: [
        { id: 'tp1', text: 'Run live lessons using Teams meetings', icon: '🎥', description: 'Deliver interactive online lessons with video, audio, and screen sharing' },
        { id: 'tp2', text: 'Use Breakout Rooms', icon: '👥', description: 'Split students into smaller groups for collaborative activities during live sessions' },
        { id: 'tp3', text: 'Create and apply Rubrics', icon: '📊', description: 'Design consistent marking criteria and apply them to assignments for fair assessment' },
        { id: 'tp4', text: 'Give feedback in different formats', icon: '💬', description: 'Provide audio, video, and written feedback to suit different learning needs' },
        { id: 'tp5', text: 'Create and manage structured channels', icon: '📁', description: 'Organise your Team with dedicated spaces for different topics or units' },
      ],
    },
    {
      tool: 'teams',
      toolName: 'MS Forms',
      objectives: [
        { id: 'fp1', text: 'Create branching quizzes', icon: '🔀', description: 'Design adaptive assessments that change questions based on student responses' },
        { id: 'fp2', text: 'Design formative assessments', icon: '📝', description: 'Build low-stakes checks for learning to monitor student understanding' },
        { id: 'fp3', text: 'Analyse responses to inform next steps', icon: '📈', description: 'Use response data to identify gaps and adjust your teaching approach' },
        { id: 'fp4', text: 'Share Forms via Teams or links', icon: '🔗', description: 'Integrate assessments seamlessly into your Teams classroom workflow' },
      ],
    },
    {
      tool: 'edpuzzle',
      toolName: 'Edpuzzle',
      objectives: [
        { id: 'ep1', text: 'Add questions, notes, or voiceovers to videos', icon: '🎤', description: 'Enhance videos with interactive elements and personalised narration' },
        { id: 'ep2', text: 'Track learner progress using analytics', icon: '📊', description: 'Monitor detailed statistics on student engagement and quiz performance' },
        { id: 'ep3', text: 'Embed Edpuzzle into Teams', icon: '🔗', description: 'Integrate video assignments directly into your existing digital classroom' },
      ],
    },
    {
      tool: 'canva',
      toolName: 'Canva (incl. Canva Code)',
      objectives: [
        { id: 'cp1', text: 'Create basic designs', icon: '🎨', description: 'Build visually appealing resources from scratch using Canva\'s design tools' },
        { id: 'cp2', text: 'Build interactive learning activities using Canva Code', icon: '💻', description: 'Use Canva\'s coding feature to create engaging, interactive student experiences' },
        { id: 'cp3', text: 'Adapt activities for different learners', icon: '🎯', description: 'Modify resources to meet diverse learning needs and accessibility requirements' },
      ],
    },
    {
      tool: 'copilot',
      toolName: 'Microsoft Copilot',
      objectives: [
        { id: 'cpp1', text: 'Write detailed prompts', icon: '✍️', description: 'Master prompt engineering to get more accurate and useful AI responses' },
        { id: 'cpp2', text: 'Generate differentiated resources', icon: '📚', description: 'Create materials at different levels to support all students in your class' },
        { id: 'cpp3', text: 'Create and use Copilot Agents', icon: '🤖', description: 'Build custom AI assistants tailored to your specific teaching needs' },
      ],
    },
    {
      tool: 'immersive' as Tool,
      toolName: 'Immersive Learning',
      objectives: [
        { id: 'ip1', text: 'Attend an introduction session', icon: '👋', description: 'Book a short training session with Clark Mitton (c.mitton@bradfordcollege.ac.uk) or Monika Worthington (m.worthington@bradfordcollege.ac.uk) before using the room to teach' },
        { id: 'ip2', text: 'Design a session using available tools and themes', icon: '🎭', description: 'Plan an immersive learning experience using available resources and settings - no headset required' },
        { id: 'ip3', text: 'Book and deliver a session to your learners', icon: '📅', description: 'Reserve the space using the booking form and facilitate an engaging immersive lesson' },
        { id: 'ip4', text: 'Embed into wider learning objectives', icon: '🎯', description: 'Connect immersive sessions to curriculum objectives or soft skills development plans - put all 4 apps from this training into practice' },
      ],
    },
  ],
  leader: [
    {
      tool: 'teams',
      toolName: 'MS Teams',
      objectives: [
        { id: 'tl1', text: 'Mentor and support colleagues with Teams', icon: '🤝', description: 'Guide fellow educators in developing their Teams skills through coaching and support' },
        { id: 'tl2', text: 'Lead departmental digital initiatives', icon: '🚀', description: 'Champion and coordinate digital transformation projects within your department' },
        { id: 'tl3', text: 'Share best practice examples', icon: '⭐', description: 'Document and present successful strategies for others to learn from' },
      ],
    },
    {
      tool: 'canva',
      toolName: 'Canva',
      objectives: [
        { id: 'cl1', text: 'Create advanced interactive resources', icon: '🎨', description: 'Design sophisticated, multi-layered learning materials with complex interactions' },
        { id: 'cl2', text: 'Train colleagues on Canva use', icon: '👨‍🏫', description: 'Deliver workshops and one-to-one support to upskill your team' },
        { id: 'cl3', text: 'Develop departmental templates', icon: '📋', description: 'Create branded, reusable templates that ensure consistency across your department' },
      ],
    },
    {
      tool: 'edpuzzle',
      toolName: 'Edpuzzle',
      objectives: [
        { id: 'el1', text: 'Create custom video content', icon: '🎬', description: 'Record and produce original educational videos tailored to your curriculum' },
        { id: 'el2', text: 'Support colleagues with implementation', icon: '🤝', description: 'Help other staff members integrate Edpuzzle effectively into their teaching' },
        { id: 'el3', text: 'Analyse department-wide engagement', icon: '📊', description: 'Review analytics across multiple classes to identify trends and opportunities' },
      ],
    },
    {
      tool: 'copilot',
      toolName: 'Microsoft Copilot',
      objectives: [
        { id: 'col1', text: 'Advanced prompt engineering', icon: '🔧', description: 'Master complex prompting techniques for sophisticated AI-assisted resource creation' },
        { id: 'col2', text: 'Create and share Copilot Agents', icon: '🤖', description: 'Build and deploy custom AI agents that colleagues can use in their teaching' },
        { id: 'col3', text: 'Lead AI integration initiatives', icon: '🚀', description: 'Drive strategic adoption of AI tools across your educational setting' },
      ],
    },
  ],
};

export const getObjectivesForToolAndLevel = (
  tool: Tool,
  level: Level
): LearningObjective[] => {
  const levelObjectives = learningObjectives[level];
  const toolObjectives = levelObjectives.find(
    (t) => t.tool === tool || (tool === 'teams' && t.toolName.includes('Forms'))
  );
  return toolObjectives?.objectives || [];
};

export const getAllObjectivesForLevel = (level: Level): ToolObjectives[] => {
  return learningObjectives[level];
};
