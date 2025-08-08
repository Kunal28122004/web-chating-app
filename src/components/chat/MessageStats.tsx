import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, TrendingUp, Clock } from "lucide-react";

interface StatsData {
  totalMessages: number;
  totalChats: number;
  activeUsers: number;
  averageResponseTime?: number;
  messagesThisWeek?: number;
  favoriteContact?: string;
}

interface MessageStatsProps {
  onClose: () => void;
  stats: StatsData;
}

export function MessageStats({ onClose, stats }: MessageStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const statCards = [
    {
      title: "Total Messages",
      value: formatNumber(stats.totalMessages),
      icon: MessageCircle,
      description: "Messages sent and received",
      color: "text-primary"
    },
    {
      title: "Active Chats",
      value: stats.totalChats.toString(),
      icon: Users,
      description: "Ongoing conversations",
      color: "text-green-500"
    },
    {
      title: "Online Friends",
      value: stats.activeUsers.toString(),
      icon: TrendingUp,
      description: "Currently online",
      color: "text-blue-500"
    },
    {
      title: "Avg. Response",
      value: stats.averageResponseTime ? `${stats.averageResponseTime}m` : "N/A",
      icon: Clock,
      description: "Average response time",
      color: "text-orange-500"
    }
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Message Statistics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">This Week</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Messages This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">
                      {formatNumber(stats.messagesThisWeek || 0)}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      +12%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compared to last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Most Active Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <span className="text-lg font-semibold">
                      {stats.favoriteContact || "Alice Johnson"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(stats.totalMessages * 0.3)} messages exchanged
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            
            <div className="space-y-3">
              {[
                { time: "2 hours ago", activity: "Started chat with Bob Smith", type: "chat" },
                { time: "1 day ago", activity: "Sent 15 messages to Alice Johnson", type: "message" },
                { time: "3 days ago", activity: "Joined the platform", type: "milestone" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'chat' ? 'bg-primary' :
                    item.type === 'message' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.activity}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}