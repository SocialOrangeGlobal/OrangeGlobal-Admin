import { useState } from "react";
import { useSocket, Notification } from "../contexts/SocketContext";
import { Link, useNavigate } from "react-router";

// Notification type visual configs
const typeConfig: Record<
  string,
  { icon: string; bg: string; text: string; border: string; label: string }
> = {
  NEW_APPLICATION: {
    icon: "📋",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/30",
    label: "Application",
  },
  APPLICATION_UPDATE: {
    icon: "🔄",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/30",
    label: "Application Update",
  },
  SYSTEM_ALERT: {
    icon: "🔔",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-900/30",
    label: "System Alert",
  },
  MESSAGE: {
    icon: "💬",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-900/30",
    label: "Message",
  },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const cfg = (type: string) =>
    typeConfig[type] ?? typeConfig.SYSTEM_ALERT;

  // Filter and search logic
  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !n.isRead) ||
      (filter === "read" && n.isRead);

    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const getFormattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group notifications for metrics card
  const newAppsCount = notifications.filter(
    (n) => n.type === "NEW_APPLICATION" && !n.isRead
  ).length;
  const updatesCount = notifications.filter(
    (n) => n.type === "APPLICATION_UPDATE" && !n.isRead
  ).length;
  const alertsCount = notifications.filter(
    (n) => n.type === "SYSTEM_ALERT" && !n.isRead
  ).length;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* ── Breadcrumb & Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav className="text-xs font-semibold text-gray-500 mb-2 dark:text-gray-400">
            <Link to="/" className="hover:text-orange-500 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-gray-800 dark:text-gray-200">Notifications</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Notifications Center
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-white bg-orange-500 rounded-full animate-bounce">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with real-time activities across jobs, applications, and system alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] duration-200"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Sidebar Metrics Card ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
              Summary Activity
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Total
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {notifications.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/40 dark:border-orange-900/20">
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                  Unread
                </span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {unreadCount}
                </span>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Unread by Type
              </h4>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 text-gray-600 dark:text-gray-400">
                  <span>📋 New Candidates</span>
                  <span className="font-bold text-gray-800 dark:text-white">{newAppsCount}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-600 dark:text-gray-400">
                  <span>🔄 Job Updates</span>
                  <span className="font-bold text-gray-800 dark:text-white">{updatesCount}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-600 dark:text-gray-400">
                  <span>🔔 Alerts & System</span>
                  <span className="font-bold text-gray-800 dark:text-white">{alertsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Quick Tips Box */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-xl shadow-orange-500/10 space-y-3 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-xl"></div>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              ✨
            </div>
            <h4 className="font-bold text-sm">Real-time Connection</h4>
            <p className="text-xs text-white/90 leading-relaxed">
              Orange Global Admin Notification is fully connected to our NestJS WebSocket. You don't need to refresh, updates appear instantly as they occur.
            </p>
          </div>
        </div>

        {/* ── Main Notifications Feed ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === "all"
                    ? "bg-white dark:bg-gray-700 text-orange-500 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === "unread"
                    ? "bg-white dark:bg-gray-700 text-orange-500 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === "read"
                    ? "bg-white dark:bg-gray-700 text-orange-500 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Read
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 dark:text-gray-200 transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mb-4 text-2xl">
                  🔔
                </div>
                <h4 className="text-base font-bold text-gray-800 dark:text-white">
                  No notifications found
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search terms or changing filters to find what you need."
                    : "You are fully up to date! Future system occurrences and candidate applications will show up here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredNotifications.map((notif) => {
                  const c = cfg(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group w-full flex flex-col sm:flex-row gap-4 p-5 text-left transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        !notif.isRead
                          ? "bg-orange-50/30 dark:bg-orange-950/5 border-l-4 border-orange-500"
                          : "border-l-4 border-transparent"
                      }`}
                    >
                      {/* Left Side: Icon & Metadata */}
                      <div className="flex items-start gap-3.5 sm:w-48 shrink-0">
                        <span
                          className={`flex items-center justify-center w-11 h-11 rounded-xl text-lg shrink-0 ${c.bg} border ${c.border}`}
                        >
                          {c.icon}
                        </span>
                        <div className="space-y-0.5">
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {c.label}
                          </span>
                          <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                            {getFormattedDate(notif.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-bold leading-snug mb-1 group-hover:text-orange-500 transition-colors ${
                            !notif.isRead
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {/* Right Side: Actions / Unread Dot */}
                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
                        {!notif.isRead && (
                          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-sm shadow-orange-500/40" />
                        )}
                        
                        {notif.link && (
                          <span className="text-[11px] font-bold text-orange-500 group-hover:underline flex items-center gap-1">
                            Go to details →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
