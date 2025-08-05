import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  role: string;
  content: string;
  specialist?: string;
  metadata?: any;
  createdAt: string;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const specialist = message.specialist || message.role;

  const getSpecialistInfo = (specialist: string) => {
    const specialists = {
      user: { name: "You", color: "bg-blue-100", textColor: "text-blue-600", icon: "👤" },
      coordinator: { name: "AI Coordinator", color: "bg-gradient-to-r from-orange-100 to-pink-100", textColor: "text-orange-600", icon: "🧠" },
      code_ai: { name: "Code AI Specialist", color: "bg-blue-50", textColor: "text-blue-600", icon: "💻" },
      design_ai: { name: "Design AI Specialist", color: "bg-purple-50", textColor: "text-purple-600", icon: "🎨" },
      writing_ai: { name: "Writing AI Specialist", color: "bg-green-50", textColor: "text-green-600", icon: "✍️" },
      analysis_ai: { name: "Analysis AI Specialist", color: "bg-amber-50", textColor: "text-amber-600", icon: "📊" },
    };
    return specialists[specialist as keyof typeof specialists] || specialists.user;
  };

  const specialistInfo = getSpecialistInfo(specialist);
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-start space-x-3 chat-bubble ${isUser ? '' : 'flex-row-reverse'}`}>
      <Avatar className={`w-8 h-8 flex-shrink-0 ${specialistInfo.color}`}>
        <AvatarFallback className={`${specialistInfo.color} ${specialistInfo.textColor} text-sm`}>
          {specialistInfo.icon}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 ${isUser ? '' : 'text-right'}`}>
        <Card className={`max-w-md ${isUser ? '' : 'ml-auto'} ${
          isUser 
            ? 'bg-gray-100' 
            : specialist === 'coordinator'
              ? 'bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200'
              : specialist === 'code_ai'
                ? 'bg-blue-50 border-blue-200'
                : specialist === 'design_ai'
                  ? 'bg-purple-50 border-purple-200'
                  : specialist === 'writing_ai'
                    ? 'bg-green-50 border-green-200'
                    : specialist === 'analysis_ai'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50'
        }`}>
          <CardContent className={`p-4 ${isUser ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl rounded-tr-sm'}`}>
            <div className={isUser ? '' : 'text-left'}>
              {!isUser && (
                <div className={`font-medium mb-2 ${specialistInfo.textColor}`}>
                  {specialistInfo.name}
                </div>
              )}
              <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
              {message.metadata?.type === 'code' && (
                <div className="mt-3 bg-gray-900 rounded-lg p-3 text-sm text-green-400 font-mono overflow-x-auto">
                  <div className="text-gray-500 text-xs mb-2">// Example code output</div>
                  <div>const component = () =&gt; {`{`}</div>
                  <div>  return &lt;div&gt;Hello World&lt;/div&gt;;</div>
                  <div>{`}`};</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
