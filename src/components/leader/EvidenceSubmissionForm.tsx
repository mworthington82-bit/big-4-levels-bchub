import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Link, FileText, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EvidenceSubmissionFormProps {
  tool: 'teams' | 'forms' | 'canva' | 'edpuzzle' | 'copilot';
  toolDisplayName: string;
  onSuccess: () => void;
  userId: string;
}

const DEPARTMENTS = [
  'Apprenticeships',
  'Adult Skills',
  'Construction',
  'Engineering & Motor Vehicle',
  'PLW',
  'Science and Digital',
  '14-16 Provision',
  'Early Years, Education and Social Care',
  'Professional & Creative',
  'LDI',
  'Other'
];

const EvidenceSubmissionForm = ({ tool, toolDisplayName, onSuccess, userId }: EvidenceSubmissionFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidenceType, setEvidenceType] = useState<'video_link' | 'file_upload' | 'case_study'>('video_link');
  
  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [impactReflection, setImpactReflection] = useState('');
  
  // Video link
  const [videoLink, setVideoLink] = useState('');
  
  // File upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Case study
  const [caseStudyWhat, setCaseStudyWhat] = useState('');
  const [caseStudyWhy, setCaseStudyWhy] = useState('');
  const [caseStudyHow, setCaseStudyHow] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('leader-evidence')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Bucket is private — issue a long-lived signed URL (1 year)
      const { data, error: signError } = await supabase.storage
        .from('leader-evidence')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);
      if (signError || !data?.signedUrl) throw signError ?? new Error('Could not sign URL');

      return data.signedUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title || !fullName || !email || !department || !impactReflection) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@bradfordcollege.ac.uk')) {
      toast({
        title: "Invalid email",
        description: "Please use your Bradford College email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let fileUrl: string | null = null;

      if (evidenceType === 'file_upload' && file) {
        fileUrl = await uploadFile(file);
        if (!fileUrl) {
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from('leader_evidence').insert({
        user_id: userId,
        tool: tool,
        evidence_type: evidenceType,
        title,
        description,
        video_link: evidenceType === 'video_link' ? videoLink : null,
        file_url: fileUrl,
        case_study_what: evidenceType === 'case_study' ? caseStudyWhat : null,
        case_study_why: evidenceType === 'case_study' ? caseStudyWhy : null,
        case_study_how: evidenceType === 'case_study' ? caseStudyHow : null,
        impact_reflection: impactReflection,
        department,
        full_name: fullName,
        email
      });

      if (error) throw error;

      toast({
        title: "Evidence submitted!",
        description: "Your evidence has been successfully submitted.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setVideoLink('');
      setFile(null);
      setCaseStudyWhat('');
      setCaseStudyWhy('');
      setCaseStudyHow('');
      setImpactReflection('');
      
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your evidence. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl">Submit Evidence for {toolDisplayName}</CardTitle>
        <CardDescription>
          Share your innovative use of {toolDisplayName} to inspire colleagues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Bradford College Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bradfordcollege.ac.uk"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your evidence"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context about your evidence"
              rows={3}
            />
          </div>

          {/* Evidence Type Selection */}
          <Tabs value={evidenceType} onValueChange={(v) => setEvidenceType(v as typeof evidenceType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="video_link" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Video Link
              </TabsTrigger>
              <TabsTrigger value="file_upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="case_study" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Case Study
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video_link" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  Share a link to your video (YouTube, Microsoft Stream, OneDrive, etc.)
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="videoLink">Video URL</Label>
                <Input
                  id="videoLink"
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </TabsContent>

            <TabsContent value="file_upload" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  Upload documents (Word, PDF, PowerPoint), images, screenshots, or video files
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.mov,.webm"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="case_study" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  Write a short case study describing your practice
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caseStudyWhat">What was done?</Label>
                  <Textarea
                    id="caseStudyWhat"
                    value={caseStudyWhat}
                    onChange={(e) => setCaseStudyWhat(e.target.value)}
                    placeholder="Describe the activity or lesson..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseStudyWhy">Why was the tool used?</Label>
                  <Textarea
                    id="caseStudyWhy"
                    value={caseStudyWhy}
                    onChange={(e) => setCaseStudyWhy(e.target.value)}
                    placeholder="Explain the pedagogical reasoning..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseStudyHow">How did it support teaching and learning?</Label>
                  <Textarea
                    id="caseStudyHow"
                    value={caseStudyHow}
                    onChange={(e) => setCaseStudyHow(e.target.value)}
                    placeholder="Describe the impact on teaching and learning..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Impact Reflection - Required */}
          <div className="space-y-2 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <Label htmlFor="impactReflection" className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              Impact Reflection (Required)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              What impact did this digital practice have on student engagement, learning, accessibility, or outcomes?
            </p>
            <Textarea
              id="impactReflection"
              value={impactReflection}
              onChange={(e) => setImpactReflection(e.target.value)}
              placeholder="Reflect on the impact of your practice..."
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Submitting...'}
              </>
            ) : (
              'Submit Evidence'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EvidenceSubmissionForm;
