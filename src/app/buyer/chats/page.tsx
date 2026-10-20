"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, RefreshCw, ChevronDown, User } from "lucide-react";
import { useBuyerTheme } from "../theme-context";
import EmptyState from "../components/EmptyState";

interface Conversation {
  farmerId: number;
  farmerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderNumber?: string;
}

export default function BuyerChatsPage() {
  const { dark } = useBuyerTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/buyer/chats");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load chats");
      setConversations(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const toggleOpen = (farmerId: number) => {
    setOpenId((prev) => (prev === farmerId ? null : farmerId));
    setReply("");
    setTimeout(() => replyRef.current?.focus(), 50);
  };

  const sendMessage = async (conv: Conversation) => {
    const text = reply.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await fetch("/api/buyer/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId: conv.farmerId, message: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setConversations((prev) =>
        prev.map((c) =>
          c.farmerId === conv.farmerId
            ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString(), unreadCount: 0 }
            : c
        )
      );
      setReply("");
      showToast("Message sent");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingText}`}>Chats</h1>
          <p className={`mt-1 ${mutedText}`}>Talk directly with the farmers you buy from</p>
        </div>
        <button
          onClick={fetchChats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className={mutedText}>Loading conversations...</p>
        </div>
      ) : error ? (
        <div className={`p-10 rounded-2xl border text-center ${cardBorder}`}>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={fetchChats}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Conversations start when you contact a farmer about an order. Place an order to get connected."
          action={{ label: "Browse Products", href: "/buyer" }}
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conv, index) => {
            const isOpen = openId === conv.farmerId;
            return (
              <motion.div
                key={conv.farmerId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className={`rounded-2xl border shadow-sm overflow-hidden ${cardBorder}`}
              >
                <button
                  onClick={() => toggleOpen(conv.farmerId)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-amber-50/60 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`font-semibold truncate ${headingText}`}>{conv.farmerName}</span>
                      <span className={`text-xs shrink-0 ${mutedText}`}>{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <p className={`text-sm truncate ${mutedText}`}>{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                        {conv.orderNumber && (
                          <span
                            className={`hidden sm:inline-block text-xs px-2 py-0.5 rounded-full ${
                              dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {conv.orderNumber}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ${mutedText}`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`border-t ${dark ? "border-gray-700" : "border-gray-100"}`}
                    >
                      <div className="p-4">
                        <div className={`rounded-xl p-4 mb-3 ${dark ? "bg-gray-900/60" : "bg-amber-50"}`}>
                          <p className={`text-xs font-semibold mb-1 ${mutedText}`}>
                            {conv.farmerName} · last message
                          </p>
                          <p className={`text-sm ${headingText}`}>{conv.lastMessage}</p>
                        </div>
                        <label htmlFor={`reply-${conv.farmerId}`} className="sr-only">
                          Write a reply
                        </label>
                        <textarea
                          id={`reply-${conv.farmerId}`}
                          ref={replyRef}
                          rows={2}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(conv);
                            }
                          }}
                          placeholder={`Reply to ${conv.farmerName}...`}
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                            dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
                          }`}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => sendMessage(conv)}
                            disabled={sending || !reply.trim()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl bg-gray-900 text-white text-sm font-medium"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
