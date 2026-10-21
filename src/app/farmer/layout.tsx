"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { 
  Menu, 
  X, 
  Leaf, 
  Sun, 
  Moon, 
  Package, 
  ShoppingBag, 
  User, 
  BarChart3,
  Home,
  Bell,
  LogOut,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { usePathname } from "next/navigation";
import { FarmerThemeProvider, useFarmerTheme } from "@/app/farmer/theme-context";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  related_order_id: number | null;
  is_read: boolean;
  created_at: string;
}

interface FarmSummary {
  farmName: string;
  region: string;
  productCount: number;
  orderCount: number;
}

/**
 * Sidebar farm card. Declared at module scope so it isn't recreated on every
 * render. Shows real counts, and nothing fake when data is absent.
 */
function FarmCard({
  farm,
  fallbackName,
  darkMode,
}: {
  farm: FarmSummary | null;
  fallbackName?: string | null;
  darkMode: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl mb-6 ${
        darkMode
          ? "bg-gradient-to-r from-emerald-900/30 to-green-900/20 border border-emerald-800/30"
          : "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate">
            {farm?.farmName || fallbackName || "Your Farm"}
          </div>
          <div className={`text-sm truncate ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
            {farm?.region || (farm ? "Region not set" : "Loading…")}
          </div>
        </div>
      </div>
      {farm && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className={darkMode ? "text-gray-400" : "text-gray-600"}>Products</div>
            <div className="font-bold">{farm.productCount} Listed</div>
          </div>
          <div>
            <div className={darkMode ? "text-gray-400" : "text-gray-600"}>Sales</div>
            <div className="font-bold">{farm.orderCount} Orders</div>
          </div>
        </div>
      )}
    </div>
  );
}

function FarmerShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { dark: darkMode, toggle: toggleDarkMode } = useFarmerTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifUserId, setNotifUserId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [farm, setFarm] = useState<FarmSummary | null>(null);
  // Anchor for relative timestamps. Kept in state so `timeAgo` stays pure
  // during render instead of calling the impure `Date.now()`.
  const [now, setNow] = useState(() => Date.now());
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (cancelled || !data.success) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        if (typeof data.userId === "number") setNotifUserId(data.userId);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [session]);

  // Keep relative timestamps ("5m ago") fresh without recomputing during render.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Real farm summary for the sidebar card. Fetched once per session rather
  // than on every route change (which re-ran the whole dashboard query on each
  // navigation), and refreshed on demand via the `farmer:data-changed` event.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const loadFarm = async () => {
      try {
        const res = await fetch("/api/farmer/dashboard");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.success) return;

        const profile = data.data?.farmerProfile;
        const stats = data.data?.stats;
        setFarm({
          farmName: profile?.farmName || profile?.farm_name || "",
          region: profile?.region || "",
          productCount: stats?.totalProducts ?? 0,
          orderCount: stats?.totalOrders ?? 0,
        });
      } catch (err) {
        // Non-fatal: the sidebar card simply keeps its last known values.
        console.error("Failed to load farm summary:", err);
      }
    };

    loadFarm();
    window.addEventListener("farmer:data-changed", loadFarm);
    return () => {
      cancelled = true;
      window.removeEventListener("farmer:data-changed", loadFarm);
    };
  }, [session]);

  // Realtime: new notifications for this user push straight into the bell
  useEffect(() => {
    if (!notifUserId) return;

    const channel = supabase
      .channel(`farmer-notifications-${notifUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${notifUserId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notifUserId]);

  // Close the notification panel when clicking outside it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(event.target as Node)) {
        setNotifPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((now - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const navItems = [
    { 
      href: "/farmer", 
      label: "Dashboard", 
      icon: Home,
      description: "Overview of your farm"
    },
    { 
      href: "/farmer/products", 
      label: "Products", 
      icon: Package,
      description: "Manage your coffee listings"
    },
    { 
      href: "/farmer/orders", 
      label: "Orders", 
      icon: ShoppingBag,
      description: "View and manage orders"
    },
    { 
      href: "/farmer/profile", 
      label: "Profile", 
      icon: User,
      description: "Your farmer profile"
    },
    { 
      href: "/farmer/insights", 
      label: "Insights", 
      icon: BarChart3,
      description: "Analytics and insights"
    },
  ];

  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900";

  const isActive = (href: string) => {
    if (href === "/farmer") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClass}`}>
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
        darkMode 
          ? "bg-gray-900/80 border-gray-800" 
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg ${
                  darkMode 
                    ? "hover:bg-gray-800 text-gray-300" 
                    : "hover:bg-gray-100 text-gray-600"
                } transition-colors`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Sidebar Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`hidden md:block p-2 rounded-lg ${
                  darkMode 
                    ? "hover:bg-gray-800 text-gray-300" 
                    : "hover:bg-gray-100 text-gray-600"
                } transition-colors`}
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  darkMode ? "bg-amber-900/30" : "bg-amber-100"
                }`}>
                  <Leaf className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Farmer Portal</h1>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Grow, Sell, Succeed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? "bg-gray-800 text-amber-400 hover:bg-gray-700" 
                    : "bg-white text-amber-600 hover:bg-amber-50 border border-gray-200"
                }`}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifPanelRef}>
                <button
                  onClick={() => setNotifPanelOpen((prev) => !prev)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl border z-50 ${
                        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                        <span className="font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className={`px-4 py-8 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b transition-colors ${
                              darkMode ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-50 hover:bg-amber-50"
                            } ${!n.is_read ? (darkMode ? "bg-gray-800/30" : "bg-amber-50/50") : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-medium text-sm">{n.title}</div>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />}
                              {n.is_read && <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />}
                            </div>
                            <div className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {n.message}
                            </div>
                            <div className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                              {timeAgo(n.created_at)}
                            </div>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Farmer Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <span className="font-bold text-white">
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "F"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">{session?.user?.name || "Farmer"}</div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Coffee Farmer</div>
                </div>
              </div>

              {/* Logout — kept in the top bar so it is reachable everywhere,
                  including on mobile where the sidebar is hidden. */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Logout"
                aria-label="Logout"
                className={`p-2 rounded-lg transition-colors text-red-500 ${
                  darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
                }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className={`sticky top-16 h-[calc(100vh-4rem)] border-r hidden md:block ${
            darkMode 
              ? "bg-gray-900/50 border-gray-800" 
              : "bg-white/50 border-gray-200"
          } backdrop-blur-sm transition-all duration-300 overflow-hidden`}
        >
          <div className="p-4">
            {/* Farmer Stats */}
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <FarmCard farm={farm} fallbackName={session?.user?.name} darkMode={darkMode} />
              </motion.div>
            )}

            {/* Navigation */}
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      active
                        ? darkMode
                          ? "bg-gradient-to-r from-amber-900/30 to-orange-900/20 text-amber-400 border border-amber-800/30"
                          : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-700 border border-amber-200"
                        : darkMode
                          ? "hover:bg-gray-800/50 text-gray-300"
                          : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {item.description}
                        </div>
                      </motion.div>
                    )}
                    {active && sidebarOpen && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Sidebar Footer — always rendered so Logout is reachable even
                when the sidebar is collapsed. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 pt-6 border-t dark:border-gray-800"
            >
              <div className="space-y-2">
                {sidebarOpen && (
                  <Link
                    href="/farmer/profile"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Logout"
                  className={`w-full flex items-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500 ${
                    sidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3"
                  }`}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Logout</span>}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className={`fixed md:hidden inset-y-0 left-0 z-50 w-64 border-r ${
                darkMode 
                  ? "bg-gray-900 border-gray-800" 
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-4">
                {/* Farmer Stats */}
                <FarmCard farm={farm} fallbackName={session?.user?.name} darkMode={darkMode} />

                {/* Navigation */}
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          active
                            ? darkMode
                              ? "bg-gradient-to-r from-amber-900/30 to-orange-900/20 text-amber-400 border border-amber-800/30"
                              : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-700 border border-amber-200"
                            : darkMode
                              ? "hover:bg-gray-800 text-gray-300"
                              : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                            {item.description}
                          </div>
                        </div>
                        {active && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile-only account actions */}
                <div className={`mt-8 pt-6 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className={`flex items-center justify-around p-2 ${
          darkMode 
            ? "bg-gray-900/95 border-t border-gray-800" 
            : "bg-white/95 border-t border-gray-200"
        } backdrop-blur-xl`}>
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1 ${
                  active
                    ? darkMode
                      ? "bg-amber-900/30 text-amber-400"
                      : "bg-amber-100 text-amber-700"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <FarmerThemeProvider>
      <FarmerShell>{children}</FarmerShell>
    </FarmerThemeProvider>
  );
}
