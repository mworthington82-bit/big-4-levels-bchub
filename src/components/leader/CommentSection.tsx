import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  full_name: string;
  department: string;
  comment: string;
  created_at: string;
}

interface CommentSectionProps {
  evidenceId: string;
  evidenceOwnerId: string;
  evidenceTitle: string;
}

const CommentSection = ({ evidenceId, evidenceOwnerId, evidenceTitle }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; department: string } | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetchComments();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
      }
    });

    // Set up realtime subscription for comments
    const channel = supabase
      .channel(`comments-${evidenceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evidence_comments',
          filter: `evidence_id=eq.${evidenceId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [evidenceId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('evidence_comments')
      .select('*')
      .eq('evidence_id', evidenceId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles_public' as any)
      .select('full_name, department')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setUserProfile(data as any);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !userProfile || !newComment.trim()) return;

    setLoading(true);
    try {
      // Insert comment
      const { error: commentError } = await supabase
        .from('evidence_comments')
        .insert({
          evidence_id: evidenceId,
          user_id: user.id,
          full_name: userProfile.full_name,
          department: userProfile.department,
          comment: newComment.trim()
        });

      if (commentError) throw commentError;

      // Create notification for evidence owner via SECURITY DEFINER RPC
      // (server-side validates caller, looks up owner, and uses the caller's profile name)
      if (user.id !== evidenceOwnerId) {
        const { error: notifError } = await supabase.rpc('create_evidence_notification', {
          _evidence_id: evidenceId,
          _type: 'comment',
          _message: `${userProfile.full_name} commented on your evidence: "${evidenceTitle}"`,
        });

        if (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }

      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('evidence_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      toast.success("Comment deleted");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="w-4 h-4" />
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </Button>

      {showComments && (
        <div className="mt-4 space-y-4">
          {/* Existing comments */}
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-card/50">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{comment.full_name}</span>
                      <span className="text-xs text-muted-foreground">• {comment.department}</span>
                      <span className="text-xs text-muted-foreground">
                        • {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.comment}</p>
                  </div>
                  {user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add comment form */}
          {user && userProfile ? (
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask a question or share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={loading || !newComment.trim()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Sign in to add comments and ask questions
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
