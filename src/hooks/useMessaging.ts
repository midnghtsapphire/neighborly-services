import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
  last_message?: Message;
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: participantData, error: participantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map(p => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id);

          const participantsWithProfiles = await Promise.all(
            (participants || []).map(async (p) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", p.user_id)
                .single();
              return { user_id: p.user_id, profile };
            })
          );

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            participants: participantsWithProfiles,
            last_message: lastMessage || undefined,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const findOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Find existing conversation
      const { data: myConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      const { data: theirConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId);

      const myConvIds = new Set(myConversations?.map(c => c.conversation_id) || []);
      const existingConvId = theirConversations?.find(c => myConvIds.has(c.conversation_id))?.conversation_id;

      if (existingConvId) {
        return existingConvId;
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: newConv.id, user_id: user.id },
          { conversation_id: newConv.id, user_id: otherUserId },
        ]);

      if (participantsError) throw participantsError;

      return newConv.id;
    } catch (error) {
      console.error("Error finding/creating conversation:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations,
    findOrCreateConversation,
  };
};

export const useConversation = (conversationId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState<{
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const messagesWithSenders = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", msg.sender_id)
            .single();
          return { ...msg, sender: profile };
        })
      );

      setMessages(messagesWithSenders);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherParticipant = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId);

      const otherUserId = participants?.find(p => p.user_id !== user.id)?.user_id;

      if (otherUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        setOtherParticipant({
          user_id: otherUserId,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
        });
      }
    } catch (error) {
      console.error("Error fetching other participant:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return false;

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchOtherParticipant();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single();
          
          setMessages(prev => [...prev, { ...newMessage, sender: profile }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return {
    messages,
    loading,
    otherParticipant,
    sendMessage,
    fetchMessages,
  };
};
