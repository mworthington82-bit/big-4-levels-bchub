import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link, Upload, FileText, User, Calendar, MessageSquare, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CommentSection from "./CommentSection";

interface EvidenceItem {
  id: string;
  user_id: string;
  tool: string;
  evidence_type: string;
  title: string;
  description: string | null;
  video_link: string | null;
  file_url: string | null;
  case_study_what: string | null;
  case_study_why: string | null;
  case_study_how: string | null;
  impact_reflection: string;
  department: string;
  full_name: string;
  created_at: string;
}

interface EvidenceGalleryProps {
  tool?: 'teams' | 'forms' | 'canva' | 'edpuzzle' | 'copilot';
  toolDisplayName?: string;
}

const EvidenceGallery = ({ tool, toolDisplayName }: EvidenceGalleryProps) => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvidence();

    // Set up realtime subscription for new evidence
    const channel = supabase
      .channel('evidence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leader_evidence'
        },
        () => {
          fetchEvidence();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tool]);

  const fetchEvidence = async () => {
    try {
      let query = supabase
        .from('leader_evidence_public' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (tool) {
        query = query.eq('tool', tool);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvidence((data as any) || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDepartment = (items: EvidenceItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = [];
      }
      acc[item.department].push(item);
      return acc;
    }, {} as Record<string, EvidenceItem[]>);
  };

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'video_link':
        return <Link className="w-4 h-4" />;
      case 'file_upload':
        return <Upload className="w-4 h-4" />;
      case 'case_study':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getEvidenceTypeLabel = (type: string) => {
    switch (type) {
      case 'video_link':
        return 'Video Link';
      case 'file_upload':
        return 'File Upload';
      case 'case_study':
        return 'Case Study';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <img src="/bradford-b-icon.png" alt="" className="h-10 w-10 animate-pulse" />
        <div className="text-muted-foreground">Loading evidence...</div>
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No evidence shared yet</h3>
          <p className="text-muted-foreground">
            Be the first to share your innovative practice with {toolDisplayName || 'this tool'}!
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedEvidence = groupByDepartment(evidence);
  const departments = Object.keys(groupedEvidence).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          Best Practice Library {toolDisplayName && `- ${toolDisplayName}`}
        </h3>
        <Badge variant="secondary" className="text-sm">
          {evidence.length} {evidence.length === 1 ? 'submission' : 'submissions'}
        </Badge>
      </div>

      <p className="text-muted-foreground text-sm">
        Browse evidence shared by colleagues across departments. Comment to ask questions or share your thoughts!
      </p>
      
      <Accordion type="multiple" defaultValue={departments} className="space-y-2">
        {departments.map((department) => (
          <AccordionItem key={department} value={department} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{groupedEvidence[department].length}</Badge>
                <span className="font-semibold">{department}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {groupedEvidence[department].map((item) => (
                  <Card key={item.id} className="border-border bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.full_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getEvidenceTypeIcon(item.evidence_type)}
                          {getEvidenceTypeLabel(item.evidence_type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.description && (
                        <p className="text-muted-foreground">{item.description}</p>
                      )}

                      {item.evidence_type === 'video_link' && item.video_link && (
                        <a 
                          href={item.video_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-accent hover:underline"
                        >
                          <Link className="w-4 h-4" />
                          View Video
                        </a>
                      )}

                      {item.evidence_type === 'file_upload' && item.file_url && (
                        <a 
                          href={item.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-accent hover:underline"
                        >
                          <Upload className="w-4 h-4" />
                          View File
                        </a>
                      )}

                      {item.evidence_type === 'case_study' && (
                        <div className="space-y-3 bg-card p-4 rounded-lg">
                          {item.case_study_what && (
                            <div>
                              <h4 className="font-semibold text-sm text-foreground">What was done:</h4>
                              <p className="text-sm text-muted-foreground">{item.case_study_what}</p>
                            </div>
                          )}
                          {item.case_study_why && (
                            <div>
                              <h4 className="font-semibold text-sm text-foreground">Why it was used:</h4>
                              <p className="text-sm text-muted-foreground">{item.case_study_why}</p>
                            </div>
                          )}
                          {item.case_study_how && (
                            <div>
                              <h4 className="font-semibold text-sm text-foreground">How it supported T&L:</h4>
                              <p className="text-sm text-muted-foreground">{item.case_study_how}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                        <h4 className="font-semibold text-sm text-accent mb-1">Impact Reflection:</h4>
                        <p className="text-sm text-foreground">{item.impact_reflection}</p>
                      </div>

                      {/* Comments Section */}
                      <CommentSection
                        evidenceId={item.id}
                        evidenceOwnerId={item.user_id}
                        evidenceTitle={item.title}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default EvidenceGallery;
