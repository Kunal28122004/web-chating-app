import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file";
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  senderAvatar?: string;
}

export function ChatMessage({ message, isOwn, senderAvatar }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] message-bubble",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-auto flex-shrink-0">
        <AvatarImage src={senderAvatar} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {message.senderName.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "rounded-2xl px-3 py-2 sm:px-4 sm:py-2 max-w-xs sm:max-w-sm break-words",
        isOwn 
          ? "bg-chat-bubble-sent text-primary-foreground rounded-br-sm" 
          : "bg-chat-bubble-received text-foreground rounded-bl-sm"
      )}>
        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
        <p className={cn(
          "text-xs mt-1 opacity-70",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}