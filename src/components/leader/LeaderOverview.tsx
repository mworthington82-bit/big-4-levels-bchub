import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Crown, Users, Lightbulb, Monitor, Share2, GraduationCap, Sparkles, Target } from "lucide-react";

const LeaderOverview = () => {
  const coreFocusAreas = [
    {
      icon: Monitor,
      title: "Blended & Flipped Learning Hub",
      description: "Use MS Teams as a well-organised hub for blended and flipped learning",
      elaboration: {
        overview: "Transform your MS Teams environment into a dynamic learning hub that seamlessly combines in-person and online learning experiences.",
        keyPoints: [
          "Structure channels effectively with clear naming conventions and organised folders for resources, assignments, and discussions",
          "Create pre-class materials including video content, reading materials, and preparatory quizzes that students access before sessions",
          "Design in-class activities that build on pre-learning, maximising face-to-face time for discussion, collaboration, and hands-on practice",
          "Use Teams features like Loop components, Whiteboard, and breakout rooms to facilitate interactive group work",
          "Implement post-class resources and reflection activities to consolidate learning"
        ],
        impact: "Students arrive prepared, class time becomes more valuable for deeper learning, and all resources remain accessible for revision."
      }
    },
    {
      icon: Users,
      title: "Student Digital Confidence",
      description: "Ensure students are confident, independent, and engaged in using digital platforms",
      elaboration: {
        overview: "Develop students who can navigate digital tools independently and use technology as a natural extension of their learning journey.",
        keyPoints: [
          "Model digital best practices by demonstrating confident use of tools during lessons and showing your thinking process",
          "Create scaffolded activities that gradually increase student independence with digital platforms",
          "Encourage peer support by pairing digitally confident students with those who need additional guidance",
          "Provide clear instructions and video tutorials that students can revisit independently",
          "Celebrate student digital achievements and showcase exemplary digital work to inspire others"
        ],
        impact: "Students develop transferable digital skills essential for further education and employment, becoming self-directed learners."
      }
    },
    {
      icon: Sparkles,
      title: "AI-Enhanced Learning",
      description: "Use Copilot and other AI tools with students to enhance creativity, critical thinking, and learning",
      elaboration: {
        overview: "Integrate AI tools thoughtfully into teaching and learning to amplify human capabilities while developing critical evaluation skills.",
        keyPoints: [
          "Use Microsoft Copilot to help students brainstorm ideas, overcome writer's block, and explore topics from multiple perspectives",
          "Teach students to craft effective prompts that yield useful, relevant responses from AI tools",
          "Develop critical evaluation skills by having students fact-check, verify, and improve AI-generated content",
          "Use AI as a personalised tutor for students who need additional explanation or practice in specific areas",
          "Explore subject-specific AI applications such as code generation, language translation, or data analysis"
        ],
        impact: "Students become discerning users of AI who understand both its potential and limitations, preparing them for an AI-augmented workplace."
      }
    },
    {
      icon: Target,
      title: "Immersive Learning",
      description: "Design and deliver immersive lessons independently, including confident use of VR headsets",
      elaboration: {
        overview: "Create memorable learning experiences using virtual reality, augmented reality, and 360-degree content that transport students beyond the classroom.",
        keyPoints: [
          "Identify curriculum topics that benefit most from immersive experiences - virtual field trips, simulations, or visualising abstract concepts",
          "Master the technical setup and troubleshooting of VR headsets to ensure smooth lesson delivery",
          "Design activities that combine VR experiences with reflection, discussion, and follow-up tasks",
          "Create inclusive experiences by providing alternative activities for students who cannot use VR",
          "Develop or curate 360-degree content using tools like ThingLink to create interactive virtual environments"
        ],
        impact: "Students engage with content in ways that create lasting memories and deeper understanding, particularly for concepts that are difficult to experience in traditional classrooms."
      }
    },
    {
      icon: Share2,
      title: "Share & Collaborate",
      description: "Share digital resources, strategies, and success stories across teams",
      elaboration: {
        overview: "Contribute to a culture of collective improvement by actively sharing what works and learning from colleagues across the college.",
        keyPoints: [
          "Document successful digital strategies with clear instructions that colleagues can adapt for their own contexts",
          "Present at team meetings, TeachMeets, or staff development sessions to share innovative practices",
          "Create reusable templates, resources, and guides that save colleagues time and effort",
          "Engage with cross-curricular collaboration to discover how digital approaches work in different subject areas",
          "Use the college's sharing platforms to contribute resources and respond to colleagues' questions"
        ],
        impact: "Good practice spreads rapidly, reducing duplication of effort and raising the overall standard of digital teaching across the college."
      }
    },
    {
      icon: GraduationCap,
      title: "Mentor & Coach",
      description: "Mentor, coach, or support colleagues in their digital development",
      elaboration: {
        overview: "Take an active role in supporting colleagues' digital development through formal and informal mentoring relationships.",
        keyPoints: [
          "Offer one-to-one support to colleagues who are developing their confidence with specific digital tools",
          "Use coaching approaches that build independence rather than creating reliance on your expertise",
          "Provide constructive feedback on colleagues' digital resources and lesson designs",
          "Champion digital innovation within your team by advocating for new approaches and supporting experimentation",
          "Identify and nurture emerging digital leaders who can continue to support others"
        ],
        impact: "Colleagues develop faster with personalised support, and a sustainable culture of peer learning reduces dependence on centralised training."
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-12 h-12 text-accent" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Leader Level
          </h1>
        </div>
        <h2 className="text-xl md:text-2xl text-accent font-semibold">
          Championing Digital Innovation
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          At Leader Level, staff demonstrate confident, purposeful use of digital tools and actively 
          support others to develop their practice. This level focuses on sharing what works, 
          embedding innovation into curriculum planning, and contributing to a culture of 
          collaborative digital excellence across the college.
        </p>
      </div>

      {/* Core Focus Areas */}
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Lightbulb className="w-6 h-6 text-accent" />
            Core Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {coreFocusAreas.map((area, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-4 bg-muted/50 data-[state=open]:bg-muted/80"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <area.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{area.title}</h3>
                      <p className="text-sm text-muted-foreground font-normal">{area.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pl-14 space-y-4">
                    <p className="text-foreground leading-relaxed">
                      {area.elaboration.overview}
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Key Practices:</h4>
                      <ul className="space-y-2">
                        {area.elaboration.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-accent mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <h4 className="font-semibold text-accent mb-1">Impact:</h4>
                      <p className="text-foreground text-sm">{area.elaboration.impact}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderOverview;
