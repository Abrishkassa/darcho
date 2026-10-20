"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Coffee,
  Sun,
  Moon,
  Home,
  Package,
  ShoppingCart,
  Truck,
  Heart,
  MessageCircle,
  BarChart3,
  User,
  Bell,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { BuyerThemeProvider, useBuyerTheme } from "./theme-context";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  related_order_id: number | null;
  is_read: boolean;
  created_at: string;
}

const NAV_ITEMS = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: Home, description: "Overview of your account" },
  { href: "/buyer", label: "Browse Products", icon: Package, description: "Find coffee from farmers" },
  { href: "/buyer/cart", label: "Shopping Cart", icon: ShoppingCart, description: "Review before checkout" },
  { href: "/buyer/orders", label: "My Orders", icon: Truck, description: "Track your purchases" },
  { href: "/buyer/favorites", label: "Favorites", icon: Heart, description: "Saved products" },
  { href: "/buyer/chats", label: "Chats", icon: MessageCircle, description: "Talk to farmers" },
  { href: "/buyer/insights", label: "Insights", icon: BarChart3, description: "Market trends & analytics" },
  { href: "/buyer/profile", label: "Profile", icon: User, description: "Your account settings" },
];

// Bottom nav shows only the most-used destinations on small screens
const BOTTOM_NAV = NAV_ITEMS.filter((item) =>
  ["/buyer/dashboard", "/buyer", "/buyer/cart", "/buyer/orders", "/buyer/profile"].includes(item.href)
);

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifUserId, setNotifUserId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
          if (typeof data.userId === "number") setNotifUserId(data.userId);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    load();
  }, []);

  // Realtime: new notifications push straight into the bell
  useEffect(() => {
    if (!notifUserId) return;
    const channel = supabase
      .channel(`buyer-notifications-${notifUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${notifUserId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [notifUserId]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
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

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setPanelOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl border z-50 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-amber-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors ${
                    !n.is_read ? "bg-amber-50/50 dark:bg-gray-800/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{n.title}</div>
                    {!n.is_read ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">{n.message}</div>
                  <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">{timeAgo(n.created_at)}</div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BuyerShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { dark, toggle } = useBuyerTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Auth guard: send unauthenticated visitors to login
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Live cart badge, refreshed on navigation and when pages signal cart changes
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    const loadCart = () => {
      fetch("/api/buyer/cart")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data.success) setCartCount(data.totalItems || 0);
        })
        .catch(() => {});
    };
    loadCart();
    window.addEventListener("cart:updated", loadCart);
    return () => {
      cancelled = true;
      window.removeEventListener("cart:updated", loadCart);
    };
  }, [status, pathname]);

  const isActive = (href: string) => (href === "/buyer" ? pathname === href : pathname.startsWith(href));

  const userName = session?.user?.name || "Buyer";
  const initials = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "B";

  const navLink = (item: (typeof NAV_ITEMS)[number], compact = false) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={`w-full flex items-center gap-3 px-4 ${
          compact ? "py-3" : "py-2.5"
        } rounded-xl transition-colors duration-200 ${
          active
            ? "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-800 border border-amber-200 dark:from-amber-900/30 dark:to-orange-900/20 dark:text-amber-400 dark:border-amber-800/30"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60"
        }`}
      >
        <span className="relative">
          <Icon className="w-5 h-5 flex-shrink-0" />
          {item.href === "/buyer/cart" && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[1.1rem] h-4.5 px-1 bg-amber-600 text-white text-[10px] rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </span>
        <span className="flex-1">
          <span className="block font-medium leading-tight">{item.label}</span>
          {!compact && (
            <span className="block text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
              {item.description}
            </span>
          )}
        </span>
        {active && <ChevronRight className="w-4 h-4" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b bg-white/80 border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href="/buyer/dashboard" className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Coffee className="w-6 h-6 text-amber-600" />
                </span>
                <span className="hidden sm:block">
                  <span className="block text-lg font-bold leading-tight">Darcho Buyer</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400 leading-tight">
                    Direct trade with Ethiopian farmers
                  </span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggle}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-lg text-amber-600 bg-white hover:bg-amber-50 border border-gray-200 dark:bg-gray-800 dark:text-amber-400 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationBell />
              <Link
                href="/buyer/cart"
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors md:hidden"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="font-bold text-white text-sm">{initials}</span>
                </div>
                <div>
                  <div className="font-medium leading-tight">{userName}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Buyer account</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-[3.75rem] h-[calc(100vh-3.75rem)] w-72 shrink-0 border-r bg-white/50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800 backdrop-blur-sm hidden md:block overflow-y-auto">
          <div className="p-4 space-y-1">{NAV_ITEMS.map((item) => navLink(item))}</div>
          <div className="p-4 pt-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                aria-hidden="true"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 overflow-y-auto md:hidden"
              >
                <div className="p-4 space-y-1">
                  {NAV_ITEMS.map((item) => navLink(item))}
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-stretch p-1.5 bg-white/95 border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-800 backdrop-blur-xl">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
                  active
                    ? "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {item.href === "/buyer/cart" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-0.5 bg-amber-600 text-white text-[10px] rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[11px] mt-0.5 font-medium">{item.label.split(" ").pop()}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BuyerThemeProvider>
      <BuyerShell>{children}</BuyerShell>
    </BuyerThemeProvider>
  );
}
