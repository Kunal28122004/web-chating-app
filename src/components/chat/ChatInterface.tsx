import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Search, Plus, Settings, LogOut, Users, MoreVertical, Menu, X } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { ChatMessage } from "./ChatMessage";
import { UserProfile } from "./UserProfile";
import { MessageStats } from "./MessageStats";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file";
}

interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  isGroup: boolean;
  name?: string;
}

interface ChatInterfaceProps {
  currentUser: User;
  onLogout: () => void;
}

export function ChatInterface({ currentUser, onLogout }: ChatInterfaceProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats and set up real-time subscriptions
  useEffect(() => {
    loadChats();
    setupRealtimeSubscriptions();
  }, [currentUser]);

  const loadChats = async () => {
    try {
      // For now, create mock data until we implement real chat functionality
      const mockChats: Chat[] = [
        {
          id: "1",
          participants: [
            currentUser,
            {
              id: "mock-user-1",
              name: "Alice Johnson",
              email: "alice@example.com",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
              status: "online"
            }
          ],
          messages: [
            {
              id: "1",
              senderId: "mock-user-1",
              senderName: "Alice Johnson",
              content: "Hey there! How are you doing?",
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              type: "text"
            },
            {
              id: "2",
              senderId: currentUser.id,
              senderName: currentUser.name,
              content: "I'm doing great! Thanks for asking. How about you?",
              timestamp: new Date(Date.now() - 1000 * 60 * 25),
              type: "text"
            }
          ],
          isGroup: false
        }
      ];
      
      setChats(mockChats);
      if (mockChats.length > 0 && !isMobile) {
        setSelectedChat(mockChats[0]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Set up real-time subscriptions for messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload);
          // Handle new message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: message.trim(),
      timestamp: new Date(),
      type: "text"
    };

    // Optimistic update
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? updatedChat : chat
    ));
    setSelectedChat(updatedChat);
    setMessage("");

    // TODO: Send message to Supabase when implementing real chat
    // try {
    //   await supabase
    //     .from('messages')
    //     .insert([{
    //       chat_id: selectedChat.id,
    //       sender_id: currentUser.id,
    //       content: message.trim(),
    //       type: 'text'
    //     }]);
    // } catch (error) {
    //   console.error('Error sending message:', error);
    // }
  };

  const getChatPartner = (chat: Chat) => {
    return chat.participants.find(p => p.id !== currentUser.id);
  };

  const filteredChats = chats.filter(chat => {
    const partner = getChatPartner(chat);
    return partner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-chat-background relative">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed left-0 top-0 z-50 h-full' : 'relative'} 
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'w-80' : 'w-80 lg:w-96'}
        bg-sidebar-bg border-r border-border flex flex-col transition-transform duration-300
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 p-0 mr-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-primary/20">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">{currentUser.name}</h2>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(true)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 mb-2 h-10 sm:h-12 hover:bg-primary/10 text-sm"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm">New Chat</span>
            </Button>
            
            {filteredChats.map((chat) => {
              const partner = getChatPartner(chat);
              const lastMessage = chat.messages[chat.messages.length - 1];
              
              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
                    selectedChat?.id === chat.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={partner?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                          {partner?.name.split(' ').map(n => n[0]).join('') || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 border-2 border-sidebar-bg rounded-full ${
                        partner?.status === 'online' ? 'bg-green-500' :
                        partner?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                          {partner?.name || chat.name || 'Unknown'}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {lastMessage.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(true)}
                      className="h-8 w-8 p-0 mr-2"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  )}
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={getChatPartner(selectedChat)?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                      {getChatPartner(selectedChat)?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {getChatPartner(selectedChat)?.name || 'Unknown User'}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {getChatPartner(selectedChat)?.status === 'online' ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                  <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-2 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {selectedChat.messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === currentUser.id}
                    senderAvatar={
                      msg.senderId === currentUser.id 
                        ? currentUser.avatar 
                        : getChatPartner(selectedChat)?.avatar
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-background/50 text-sm sm:text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 h-9 w-9 sm:h-10 sm:w-10 p-0"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              {isMobile && (
                <Button
                  variant="outline"
                  onClick={() => setSidebarOpen(true)}
                  className="mb-6"
                >
                  <Menu className="mr-2 h-4 w-4" />
                  Open Chats
                </Button>
              )}
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Icons.MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to ChatApp</h2>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {isMobile ? "Tap 'Open Chats' to see your conversations" : "Select a conversation to start chatting"}
              </p>
              {!isMobile && (
                <Button className="bg-gradient-to-r from-primary to-primary-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <UserProfile
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={(updates) => {
            // Handle profile updates
            console.log('Profile updates:', updates);
          }}
        />
      )}

      {/* Stats Modal */}
      {showStats && (
        <MessageStats
          onClose={() => setShowStats(false)}
          stats={{
            totalMessages: selectedChat?.messages.length || 0,
            totalChats: chats.length,
            activeUsers: chats.filter(chat => 
              getChatPartner(chat)?.status === 'online'
            ).length
          }}
        />
      )}
    </div>
  );
}