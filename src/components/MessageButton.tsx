import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";

interface MessageButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const MessageButton = ({
  userId,
  variant = "outline",
  size = "default",
  className,
}: MessageButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { findOrCreateConversation } = useMessaging();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userId === user.id) {
      toast({
        title: "Cannot message yourself",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const conversationId = await findOrCreateConversation(userId);
    setLoading(false);

    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    } else {
      toast({
        title: "Error",
        description: "Could not start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        <>
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </>
      )}
    </Button>
  );
};

export default MessageButton;
