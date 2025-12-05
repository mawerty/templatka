import { useState } from "react";
import { Activity, Cat, Upload, UserPlus, LogIn, Wifi, WifiOff, Trash2 } from "lucide-react";
import { useWebSocket, type WebSocketMessage } from "@/features/websockets";
import { Card, CardContent } from "@/components/ui";

type ActivityItem = {
  id: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: Date;
};

function getEventIcon(event: string) {
  switch (event) {
    case "cat_created":
      return <Cat className="h-4 w-4 text-green-500" />;
    case "cat_deleted":
      return <Trash2 className="h-4 w-4 text-red-500" />;
    case "user_registered":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case "user_logged_in":
      return <LogIn className="h-4 w-4 text-purple-500" />;
    case "file_uploaded":
      return <Upload className="h-4 w-4 text-blue-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

function getEventMessage(event: string, data: Record<string, unknown>): string {
  switch (event) {
    case "cat_created":
      return `Cat "${data.name}" was created`;
    case "cat_deleted":
      return `Cat "${data.name}" was deleted`;
    case "user_registered":
      return `User "${data.name}" registered`;
    case "user_logged_in":
      return `User "${data.name}" logged in`;
    case "file_uploaded":
      return `File "${data.filename}" was uploaded`;
    default:
      return `Event: ${event}`;
  }
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const handleMessage = (message: WebSocketMessage) => {
    if (message.type === "activity") {
      const activity: ActivityItem = {
        id: crypto.randomUUID(),
        event: message.event as string,
        data: message.data as Record<string, unknown>,
        timestamp: new Date(),
      };
      setActivities((prev) => [activity, ...prev].slice(0, 10)); // Keep last 10
    }
  };

  const { isConnected } = useWebSocket("activity-feed", {
    onMessage: handleMessage,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Activity
          </h3>
          <span className="flex items-center gap-1 text-xs">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Disconnected</span>
              </>
            )}
          </span>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet. Try creating a cat or uploading a file!
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2"
              >
                {getEventIcon(activity.event)}
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    {getEventMessage(activity.event, activity.data)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
