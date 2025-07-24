import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, BarChart3, AlertTriangle } from "lucide-react";

interface SessionStats {
  total_sessions: number;
  total_messages: number;
  recent_sessions_24h: number;
}

interface SessionManagerProps {
  onRefresh: () => void;
}

const SessionManager = ({ onRefresh }: SessionManagerProps) => {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/session_stats/");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setShowStats(true);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupOldSessions = async () => {
    if (!confirm("This will delete all sessions older than 30 days. This action cannot be undone. Continue?")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/cleanup_sessions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_old: 30 }),
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully cleaned up ${data.deleted_count} old sessions.`);
        onRefresh();
        if (stats) {
          fetchStats(); // Refresh stats
        }
      } else {
        alert("Failed to cleanup sessions");
      }
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
      alert("Error cleaning up sessions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={fetchStats}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          View Stats
        </Button>
        
        <Button
          onClick={cleanupOldSessions}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
        >
          <Trash2 className="h-4 w-4" />
          Cleanup Old Sessions
        </Button>
      </div>

      {showStats && stats && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-3">Session Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_sessions}</div>
              <div className="text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.total_messages}</div>
              <div className="text-gray-600">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.recent_sessions_24h}</div>
              <div className="text-gray-600">Active (24h)</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Session Management:</strong> Sessions are automatically cleaned up after 30 days of inactivity. 
            You can manually cleanup old sessions using the button above.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManager; 