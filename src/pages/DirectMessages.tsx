import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronLeft, Search, MessagesSquare, Clock, Plus, Check, CheckCheck } from 'lucide-react';
import { useSearchParams, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import PageMeta from '../components/common/PageMeta';
import { Modal } from '../components/ui/modal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const DirectMessages = () => {
  const { authFetch, showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedNewChatRef = useRef(false);

  // Grouping state
  const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>({});
  const [isolatedUserId, setIsolatedUserId] = useState<string | null>(null);

  // New Chat Modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const searchRequestIdRef = useRef(0);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isSendingNewChat, setIsSendingNewChat] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await authFetch(`${API_URL}/contact?type=DIRECT_MESSAGE&limit=500`);
      if (res.ok) {
        const result = await res.json();
        let directMessages = result?.data?.items || [];

        // Sort by latest update (either latest reply or creation date)
        directMessages.sort((a: any, b: any) => {
          const aLast = a.replies?.length ? new Date(a.replies[a.replies.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
          const bLast = b.replies?.length ? new Date(b.replies[b.replies.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
          return bLast - aLast;
        });

        setMessages(directMessages);
      }
    } catch (error: any) {
      console.error('Error fetching direct messages:', error);
      showToast('Failed to load your messages', 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [authFetch, showToast]);

  const triggerTyping = async (id: string, isTyping: boolean) => {
    try {
      await authFetch(`${API_URL}/contact/${id}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      });
    } catch (e) { }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const enquiryIdParam = searchParams.get("id");
    if (enquiryIdParam && messages.length > 0) {
      setActiveMessageId(enquiryIdParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, messages, setSearchParams]);

  useEffect(() => {
    if (location.state?.newChatUser && messages.length > 0 && !hasInitializedNewChatRef.current) {
      hasInitializedNewChatRef.current = true;
      const userToChat = location.state.newChatUser;
      const targetUserId = userToChat.user?.id || userToChat.userId || userToChat.id;
      const existingThread = messages.find(msg => msg.userId === targetUserId || msg.user?.id === targetUserId);

      setIsolatedUserId(targetUserId);
      setExpandedUserIds(prev => ({ ...prev, [targetUserId]: true }));

      if (existingThread) {
        setActiveMessageId(existingThread.id);
      } else {
        setIsNewChatModalOpen(true);
        setSelectedUsers([userToChat]);
        setNewChatSearch('');
        setUsersPage(1);
        fetchUsersList('', 1, false);
      }

      // Clear the state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, messages]);

  useEffect(() => {
    if (activeMessageId) {
      // Mark as read
      authFetch(`${API_URL}/contact/${activeMessageId}/read`, { method: "PATCH" })
        .then(() => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === activeMessageId) {
              return {
                ...msg,
                replies: msg.replies?.map((r: any) => {
                  const isAdmin = r.senderRole === 'ADMIN' || r.sender?.role === 'ADMIN';
                  if (!isAdmin) return { ...r, isRead: true };
                  return r;
                })
              };
            }
            return msg;
          }));
        }).catch(console.error);
    }
  }, [activeMessageId, authFetch]);

  useEffect(() => {
    if (activeMessageId && chatEndRef.current) {
      setTimeout(() => {
        if (chatEndRef.current) {
          const container = chatEndRef.current.parentElement;
          if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
          }
        }
      }, 300);
    }
  }, [activeMessageId, messages]);

  useEffect(() => {
    const handleNewChatReply = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { enquiryId, reply } = customEvent.detail;

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === enquiryId) {
            if (msg.replies?.some((r: any) => r.id === reply.id)) return msg;
            return {
              ...msg,
              replies: [...(msg.replies || []), reply]
            };
          }
          return msg;
        })
      );
    };

    const handleChatRead = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { threadId } = customEvent.detail;
      setMessages(prev => prev.map(msg => {
        if (msg.id === threadId) {
          return {
            ...msg,
            replies: msg.replies?.map((r: any) => ({ ...r, isRead: true }))
          };
        }
        return msg;
      }));
    };

    const handleChatTyping = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { threadId, isTyping } = customEvent.detail;
      setTypingUsers(prev => ({ ...prev, [threadId]: isTyping }));
    };

    window.addEventListener('ws_chat_read', handleChatRead);
    window.addEventListener('ws_chat_typing', handleChatTyping);
    window.addEventListener('ws_new_chat_reply', handleNewChatReply);
    return () => {
      window.removeEventListener('ws_chat_read', handleChatRead);
      window.removeEventListener('ws_chat_typing', handleChatTyping);
      window.removeEventListener('ws_new_chat_reply', handleNewChatReply);
    };
  }, []);

  const handleSendReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await authFetch(`${API_URL}/contact/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText('');
        fetchMessages(true);
      } else {
        showToast('Failed to send reply', 'error');
      }
    } catch (error: any) {
      console.error('Error sending reply:', error);
      showToast('Failed to send reply', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };


  const fetchUsersList = async (search: string = '', page: number = 1, append: boolean = false) => {
    const currentRequestId = ++searchRequestIdRef.current;
    if (page === 1) setIsUsersLoading(true);
    else setIsFetchingMore(true);

    try {
      const resT = await authFetch(`${API_URL}/users/talents?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      const resE = await authFetch(`${API_URL}/users/employers?page=${page}&limit=20&search=${encodeURIComponent(search)}`);

      if (currentRequestId !== searchRequestIdRef.current && page === 1) return;

      let list: any[] = [];
      let hasMore = false;
      
      if (resT.ok) {
        const json = await resT.json();
        const items = json.data?.items || json.items || [];
        list.push(...items);
        if (json.data?.meta?.hasNextPage || items.length === 20) hasMore = true;
      }
      if (resE.ok) {
        const json = await resE.json();
        const items = json.data?.items || json.items || [];
        list.push(...items);
        if (json.data?.meta?.hasNextPage || items.length === 20) hasMore = true;
      }
      
      if (append) {
        setUsersList(prev => {
          const newMap = new Map(prev.map(u => [u.id || u.user?.id, u]));
          list.forEach(u => newMap.set(u.id || u.user?.id, u));
          return Array.from(newMap.values());
        });
      } else {
        setUsersList(list);
      }
      setHasMoreUsers(hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      if (currentRequestId === searchRequestIdRef.current || page !== 1) {
        if (page === 1) setIsUsersLoading(false);
        setIsFetchingMore(false);
      }
    }
  };

  const handleOpenNewChat = () => {
    setIsNewChatModalOpen(true);
    setSelectedUsers([]);
    setNewChatMessage('');
    setUsersPage(1);
    fetchUsersList('', 1, false);
  };

  const handleUserListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!isFetchingMore && hasMoreUsers && !isUsersLoading) {
        const nextPage = usersPage + 1;
        setUsersPage(nextPage);
        fetchUsersList(newChatSearch, nextPage, true);
      }
    }
  };

  const handleStartNewChat = async () => {
    if (selectedUsers.length === 0 || !newChatMessage.trim()) return;
    setIsSendingNewChat(true);
    try {
      const promises = selectedUsers.map(user =>
        authFetch(`${API_URL}/contact/direct`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId || user.user?.id || user.id, message: newChatMessage.trim() }),
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every(res => res.ok);

      if (allSuccess) {
        showToast('Chat sessions started!', 'success');
        setIsNewChatModalOpen(false);
        fetchMessages();
      } else {
        showToast('Failed to start some chats', 'error');
        fetchMessages();
      }
    } catch (e) {
      showToast('Failed to start chats', 'error');
    } finally {
      setIsSendingNewChat(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.user?.talentProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.user?.employerProfile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedUsers = useMemo(() => {
    const groups: Record<string, { user: any; sessions: any[] }> = {};
    filteredMessages.forEach(msg => {
      const uid = msg.userId || msg.user?.id || 'unknown';
      // If we are isolating a user, skip others
      if (isolatedUserId && uid !== isolatedUserId) return;

      if (!groups[uid]) {
        groups[uid] = { user: msg.user, sessions: [] };
      }
      groups[uid].sessions.push(msg);
    });

    return Object.values(groups).sort((a, b) => {
      const aTime = a.sessions[0].replies?.length ? new Date(a.sessions[0].replies[a.sessions[0].replies.length - 1].createdAt).getTime() : new Date(a.sessions[0].createdAt).getTime();
      const bTime = b.sessions[0].replies?.length ? new Date(b.sessions[0].replies[b.sessions[0].replies.length - 1].createdAt).getTime() : new Date(b.sessions[0].createdAt).getTime();
      return bTime - aTime;
    });
  }, [filteredMessages, isolatedUserId]);

  const activeMessage = messages.find(m => m.id === activeMessageId);

  return (
    <>
      <PageMeta
        title="Chats"
        description="Admin chats interface"
      />
      <PageBreadcrumb pageTitle="Chats" />

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex overflow-hidden h-[calc(100vh-200px)] min-h-[500px]">

        {/* Sidebar */}
        <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 transition-transform ${activeMessageId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users or chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <button
              onClick={handleOpenNewChat}
              className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shrink-0"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-2" />
              </div>
            ) : groupedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                <MessagesSquare className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">No messages found</p>
                {isolatedUserId && (
                  <button
                    onClick={() => setIsolatedUserId(null)}
                    className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {isolatedUserId && (
                  <div className="mb-2 px-2 flex justify-between items-center bg-brand-50 dark:bg-brand-500/10 p-2 rounded-lg border border-brand-100 dark:border-brand-500/20">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Filtered User</span>
                    <button onClick={() => setIsolatedUserId(null)} className="text-[10px] font-bold text-brand-500 hover:underline">
                      View All Users
                    </button>
                  </div>
                )}
                {groupedUsers.map((group) => {
                  const uName = group.user?.talentProfile?.fullName || group.user?.employerProfile?.companyName || group.user?.email || group.sessions[0]?.fullName || 'User';
                  const isExpanded = expandedUserIds[group.user?.id] || false;

                  return (
                    <div key={group.user?.id || 'unknown'} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedUserIds(prev => ({ ...prev, [group.user?.id]: !prev[group.user?.id] }))}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{uName}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group.user?.role || 'USER'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                            {group.sessions.length}
                          </span>
                          <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-gray-900">
                          {group.sessions.map(msg => {
                            const isActive = msg.id === activeMessageId;
                            const lastReply = msg.replies && msg.replies.length > 0 ? msg.replies[msg.replies.length - 1] : null;
                            const previewText = lastReply ? lastReply.message : msg.message;

                            // Check for unread replies
                            const unreadCount = msg.replies?.filter((r: any) => {
                              const isAdmin = r.senderRole === 'ADMIN' || r.sender?.role === 'ADMIN';
                              return !isAdmin && !r.isRead;
                            }).length || 0;

                            return (
                              <button
                                key={msg.id}
                                onClick={() => setActiveMessageId(msg.id)}
                                className={`w-full text-left p-3 transition-all flex flex-col gap-1 ${isActive ? 'bg-brand-50/50 dark:bg-brand-500/10 relative' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                              >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />}
                                <div className="flex justify-between items-start">
                                  <span className={`text-[11px] font-bold ${isActive ? 'text-brand-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {msg.subject ? msg.subject.replace(/Direct Message/gi, 'Chat') : 'Chat'}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {unreadCount > 0 && (
                                      <span className="bg-brand-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center">
                                        {unreadCount}
                                      </span>
                                    )}
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap font-medium">
                                      {new Date(lastReply ? lastReply.createdAt : msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-1 leading-relaxed">
                                  {previewText}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#F8FAFC] dark:bg-gray-900/50 relative ${!activeMessageId ? 'hidden md:flex' : 'flex'}`}>
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-brand-500 bg-white dark:bg-gray-900">
              <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading conversation...</p>
            </div>
          ) : !activeMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-gray-900">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <MessagesSquare className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chats</h3>
              <p className="text-sm">Select a user and chat session from the left to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-[70px] px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveMessageId(null)}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {activeMessage.user?.talentProfile?.fullName || activeMessage.user?.employerProfile?.companyName || activeMessage.user?.email || activeMessage.fullName || 'User'}
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                        {activeMessage.user?.role || 'USER'}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Session Started {new Date(activeMessage.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* Replies List */}
                {activeMessage.replies?.map((reply: any, idx: number) => {
                  const isAdmin = reply.senderRole?.toUpperCase() === 'ADMIN' || reply.sender?.role?.toUpperCase() === 'ADMIN' || (reply as any).sender_role?.toUpperCase() === 'ADMIN';
                  const senderName = isAdmin
                    ? `You`
                    : (reply.sender?.talentProfile?.fullName || reply.sender?.employerProfile?.companyName || 'User');

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={reply.id || idx}
                      className={`flex gap-3 max-w-[85%] ${!isAdmin ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm select-none ${!isAdmin
                        ? 'bg-gray-900 text-white'
                        : 'bg-brand-500 text-white'
                        }`}>
                        {senderName.charAt(0)}
                      </div>

                      <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {isAdmin ? 'You' : (activeMessage.user?.talentProfile?.fullName || activeMessage.user?.employerProfile?.companyName || 'User')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`w-fit max-w-[100%] rounded-2xl px-5 py-3 shadow-sm text-left break-words ${isAdmin
                            ? 'bg-brand-500 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-sm'
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                        </div>
                        {isAdmin && (
                          <div className="mt-1 pr-1 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            {reply.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-brand-500" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            {reply.isRead ? 'Read' : 'Sent'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing Indicator */}
                {typingUsers[activeMessage.id] && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-4 px-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-end gap-3 max-w-4xl mx-auto relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      const target = e.target;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                      if (!typingTimeoutRef.current) {
                        triggerTyping(activeMessage.id, true).catch(() => { });
                      } else {
                        clearTimeout(typingTimeoutRef.current);
                      }
                      typingTimeoutRef.current = setTimeout(() => {
                        triggerTyping(activeMessage.id, false).catch(() => { });
                        typingTimeoutRef.current = null;
                      }, 2000);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply(activeMessage.id);
                        setTimeout(() => {
                          if (e.target instanceof HTMLTextAreaElement) {
                            e.target.style.height = 'auto';
                          }
                        }, 0);
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    style={{ minHeight: '52px', maxHeight: '150px' }}
                    className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm font-medium transition-colors resize-none overflow-y-auto [&::-webkit-scrollbar]:w-[4px]"
                  />
                  <button
                    disabled={isSendingReply || !replyText.trim()}
                    onClick={(e) => {
                      handleSendReply(activeMessage.id);
                      const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                      if (textarea) textarea.style.height = 'auto';
                    }}
                    className="h-[52px] w-[52px] rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none transition-all shrink-0"
                  >
                    {isSendingReply ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 ml-1" />
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">Press Enter to send, Shift + Enter for new line</p>
              </div>
            </>
          )}
        </div>

      </div>

      <Modal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} className="max-w-2xl w-[90vw] p-6 bg-white dark:bg-gray-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Start New Chat</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search User</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={newChatSearch}
                onChange={(e) => {
                  setNewChatSearch(e.target.value);
                  setUsersPage(1);
                  fetchUsersList(e.target.value, 1, false);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div 
            className="max-h-72 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-lg"
            onScroll={handleUserListScroll}
          >
            {(() => {
              if (isUsersLoading && usersList.length === 0 && selectedUsers.length === 0) {
                return <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>;
              }
              
              const getUserId = (obj: any) => obj?.userId || obj?.user?.id || obj?.id;
              
              const combinedList = [
                ...selectedUsers.map(su => {
                  const freshUser = usersList.find(u => getUserId(u) === getUserId(su));
                  return { ...(freshUser || su), _isSelected: true };
                }),
                ...usersList.filter(u => !selectedUsers.some(su => getUserId(su) === getUserId(u))).map(u => ({ ...u, _isSelected: false }))
              ];

              if (combinedList.length === 0) {
                return <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found</div>;
              }

              return combinedList.map(u => {
                const name = u.fullName || 
                             (u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : null) ||
                             u.companyName || 
                             u.user?.fullName || 
                             (u.user?.firstName || u.user?.lastName ? `${u.user?.firstName || ''} ${u.user?.lastName || ''}`.trim() : null) ||
                             u.user?.email || 
                             u.email || 
                             'Unknown';
                const email = u.workEmail || u.businessEmail || u.user?.email || u.email || '';
                const role = u.user?.role || u.role || 'USER';
                const isSelected = u._isSelected;

                return (
                  <label
                    key={getUserId(u) || Math.random()}
                    className={`w-full text-left p-3 text-sm flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${isSelected ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, u]);
                        } else {
                          setSelectedUsers(prev => prev.filter(su => getUserId(su) !== getUserId(u)));
                        }
                      }}
                    />
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{email}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/20 px-2 py-0.5 rounded-full shrink-0">{role}</span>
                  </label>
                );
              });
            })()}
            {isFetchingMore && (
              <div className="p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-700">
                Loading more...
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder="Type your first message..."
              rows={3}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsNewChatModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleStartNewChat}
              disabled={selectedUsers.length === 0 || !newChatMessage.trim() || isSendingNewChat}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSendingNewChat && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Start Chat {selectedUsers.length > 0 && `(${selectedUsers.length})`}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DirectMessages;
