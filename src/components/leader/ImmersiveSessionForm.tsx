import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Link, Loader2, CheckCircle, Glasses, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImmersiveSessionFormProps {
  sessionNumber: 1 | 2 | 3;
  onSuccess: () => void;
  userId: string;
  existingSession?: {
    id: string;
    title: string;
  } | null;
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

const ImmersiveSessionForm = ({ sessionNumber, onSuccess, userId, existingSession }: ImmersiveSessionFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidenceType, setEvidenceType] = useState<'video_link' | 'file_upload'>('video_link');
  
  // Session details
  const [title, setTitle] = useState('');
  const [learnerContext, setLearnerContext] = useState('');
  const [immersiveActivity, setImmersiveActivity] = useState('');
  const [howEnhanced, setHowEnhanced] = useState('');
  
  // Staff info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  
  // Evidence
  const [videoLink, setVideoLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [lessonPlanFile, setLessonPlanFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Impact
  const [impactReflection, setImpactReflection] = useState('');

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('leader-evidence')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('leader-evidence')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !learnerContext || !immersiveActivity || !howEnhanced || !fullName || !email || !department || !impactReflection) {
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
    setUploading(true);

    try {
      let fileUrl: string | null = null;
      let lessonPlanUrl: string | null = null;
      let photoUrls: string[] = [];

      // Upload main evidence file
      if (evidenceType === 'file_upload' && file) {
        fileUrl = await uploadFile(file, 'immersive');
      }

      // Upload lesson plan
      if (lessonPlanFile) {
        lessonPlanUrl = await uploadFile(lessonPlanFile, 'immersive-lessons');
      }

      // Upload photos
      if (photoFiles) {
        for (let i = 0; i < photoFiles.length; i++) {
          const url = await uploadFile(photoFiles[i], 'immersive-photos');
          if (url) photoUrls.push(url);
        }
      }

      setUploading(false);

      const { error } = await supabase.from('immersive_sessions').insert({
        user_id: userId,
        session_number: sessionNumber,
        title,
        learner_context: learnerContext,
        immersive_activity: immersiveActivity,
        how_enhanced: howEnhanced,
        evidence_type: evidenceType,
        video_link: evidenceType === 'video_link' ? videoLink : null,
        file_url: fileUrl,
        lesson_plan_url: lessonPlanUrl,
        photos_urls: photoUrls.length > 0 ? photoUrls : null,
        impact_reflection: impactReflection,
        department,
        full_name: fullName,
        email
      });

      if (error) throw error;

      toast({
        title: "Session submitted!",
        description: `Immersive session ${sessionNumber} has been recorded.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Session already exists",
          description: `You have already submitted session ${sessionNumber}. Please edit your existing submission or choose a different session number.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Submission failed",
          description: "There was an error submitting your session. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (existingSession) {
    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-accent" />
            <div>
              <p className="font-semibold text-foreground">Session {sessionNumber} Completed</p>
              <p className="text-sm text-muted-foreground">{existingSession.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Glasses className="w-5 h-5 text-accent" />
          Immersive Session {sessionNumber}
        </CardTitle>
        <CardDescription>
          Document your immersive learning session with VR headsets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`fullName-${sessionNumber}`}>Full Name *</Label>
              <Input
                id={`fullName-${sessionNumber}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`email-${sessionNumber}`}>Bradford College Email *</Label>
              <Input
                id={`email-${sessionNumber}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bradfordcollege.ac.uk"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`department-${sessionNumber}`}>Department *</Label>
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
            <Label htmlFor={`title-${sessionNumber}`}>Session Title *</Label>
            <Input
              id={`title-${sessionNumber}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your immersive session"
              required
            />
          </div>

          {/* Case Study Fields */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              Session Details
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor={`learnerContext-${sessionNumber}`}>Learner Context *</Label>
              <Textarea
                id={`learnerContext-${sessionNumber}`}
                value={learnerContext}
                onChange={(e) => setLearnerContext(e.target.value)}
                placeholder="Describe the learners and context..."
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`immersiveActivity-${sessionNumber}`}>Immersive Activity Used *</Label>
              <Textarea
                id={`immersiveActivity-${sessionNumber}`}
                value={immersiveActivity}
                onChange={(e) => setImmersiveActivity(e.target.value)}
                placeholder="Describe the VR/immersive activity..."
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`howEnhanced-${sessionNumber}`}>How it Enhanced Teaching & Learning *</Label>
              <Textarea
                id={`howEnhanced-${sessionNumber}`}
                value={howEnhanced}
                onChange={(e) => setHowEnhanced(e.target.value)}
                placeholder="Explain how immersive technology enhanced the learning experience..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Evidence Upload */}
          <Tabs value={evidenceType} onValueChange={(v) => setEvidenceType(v as typeof evidenceType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="video_link" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Video Link
              </TabsTrigger>
              <TabsTrigger value="file_upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video_link" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor={`videoLink-${sessionNumber}`}>Video Walkthrough/Reflection URL</Label>
                <Input
                  id={`videoLink-${sessionNumber}`}
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </TabsContent>

            <TabsContent value="file_upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor={`file-${sessionNumber}`}>Video/Reflection File</Label>
                <Input
                  id={`file-${sessionNumber}`}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".mp4,.mov,.webm,.pdf,.doc,.docx"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Additional Evidence */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`lessonPlan-${sessionNumber}`}>Lesson Plan/Activity Outline (Optional)</Label>
              <Input
                id={`lessonPlan-${sessionNumber}`}
                type="file"
                onChange={(e) => setLessonPlanFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`photos-${sessionNumber}`}>Photos/Screenshots (Optional)</Label>
              <Input
                id={`photos-${sessionNumber}`}
                type="file"
                multiple
                onChange={(e) => setPhotoFiles(e.target.files)}
                accept=".png,.jpg,.jpeg,.gif"
              />
            </div>
          </div>

          {/* Impact Reflection */}
          <div className="space-y-2 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <Label htmlFor={`impact-${sessionNumber}`} className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              Impact Reflection (Required)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              What was the impact of this immersive session on student engagement, confidence, understanding, or skills development?
            </p>
            <Textarea
              id={`impact-${sessionNumber}`}
              value={impactReflection}
              onChange={(e) => setImpactReflection(e.target.value)}
              placeholder="Reflect on the impact..."
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
                {uploading ? 'Uploading files...' : 'Submitting...'}
              </>
            ) : (
              'Submit Session'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImmersiveSessionForm;
