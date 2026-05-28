import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSocket } from "../../contexts/SocketContext";

// Notification type icon mappings
const typeConfig: Record<
  string,
  { icon: string; bg: string; text: string }
> = {
  NEW_APPLICATION: {
    icon: "📋",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  APPLICATION_UPDATE: {
    icon: "🔄",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
  },
  SYSTEM_ALERT: {
    icon: "🔔",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  MESSAGE: {
    icon: "💬",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
  },
};

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = async (id: string, link?: string) => {
    await markAsRead(id);
    setIsOpen(false);
    if (link) navigate(link);
  };

  const cfg = (type: string) =>
    typeConfig[type] ?? typeConfig.SYSTEM_ALERT;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Button ── */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-orange-500 rounded-full z-10 ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {/* Bell icon */}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          id="notification-dropdown"
          className="absolute right-0 mt-3 w-[360px] sm:w-[400px] bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden max-h-[520px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <h5 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Notifications
              </h5>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold text-white bg-orange-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification list */}
          <ul className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-gray-800/60">
            {notifications.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-14 text-gray-400 dark:text-gray-500">
                <svg
                  className="w-10 h-10 mb-3 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1 opacity-60">
                  You're all caught up!
                </p>
              </li>
            ) : (
              notifications.map((notif) => {
                const c = cfg(notif.type);
                return (
                  <li key={notif.id}>
                    <button
                      onClick={() =>
                        handleNotificationClick(notif.id, notif.link)
                      }
                      className={`w-full flex gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                        !notif.isRead
                          ? "bg-orange-50/60 dark:bg-orange-900/10"
                          : ""
                      }`}
                    >
                      {/* Icon bubble */}
                      <span
                        className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-lg ${c.bg}`}
                      >
                        {c.icon}
                      </span>

                      {/* Content */}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-start justify-between gap-1 mb-0.5">
                          <span
                            className={`text-sm font-semibold leading-tight ${
                              !notif.isRead
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-orange-500" />
                          )}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                          {notif.message}
                        </span>
                        <span className="block text-[10px] font-medium text-gray-400 dark:text-gray-500">
                          {getRelativeTime(notif.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-1"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
