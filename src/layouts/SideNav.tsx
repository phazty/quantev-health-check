import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronLeft, ChevronRight, Moon, Sun, Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/stores/uiStore";
import { useUserStore } from "@/stores/userStore";
import { WebSocketIndicator } from "@/components/primitives/WebSocketIndicator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "./NavigationConfig";
import { ROLE_LABELS } from "@/types/user";

export function SideNav() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, toggleTheme, theme, notifications } = useUIStore();
  const { currentUser } = useUserStore();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const collapsed = sidebarCollapsed;

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        className={cn(
          "flex flex-col h-screen bg-navy border-r border-white/5 transition-all duration-200 ease-in-out flex-shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-14 flex items-center border-b border-white/5 flex-shrink-0",
          collapsed ? "justify-center px-0" : "px-4 gap-2"
        )}>
          <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-white font-semibold text-sm tracking-tight">Quantev</span>
              <span className="text-slate-500 text-[10px] tracking-widest uppercase">Health Check</span>
            </div>
          )}
        </div>

        {/* Main nav */}
        <div className="flex-1 flex flex-col gap-0.5 py-3 px-2 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return collapsed ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center h-9 w-9 mx-auto rounded-md transition-colors border-l-2",
                      isActive
                        ? "bg-orange/15 text-orange border-orange"
                        : "text-slate-400 border-transparent hover:bg-navy-lighter/50 hover:text-slate-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-slate-400 text-[10px]">{item.description}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 h-9 px-2.5 rounded-md transition-colors border-l-2 text-sm font-medium",
                  isActive
                    ? "bg-orange/10 text-white border-orange"
                    : "text-slate-400 border-transparent hover:bg-navy-lighter/40 hover:text-slate-200"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-0.5 py-3 px-2 border-t border-white/5 flex-shrink-0">
          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={unreadCount > 0 ? `Notifications — ${unreadCount} unread` : "Notifications"}
                className={cn(
                  "relative flex items-center gap-2.5 h-9 rounded-md transition-colors text-slate-400 hover:bg-navy-lighter/40 hover:text-slate-200",
                  collapsed ? "justify-center w-9 mx-auto" : "px-2.5"
                )}
              >
                <Bell className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Notifications</span>}
                {unreadCount > 0 && (
                  <span className={cn(
                    "absolute bg-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    collapsed ? "-top-0.5 -right-0.5 w-4 h-4" : "top-1 right-1 min-w-[16px] h-4 px-1"
                  )}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}</TooltipContent>}
          </Tooltip>

          {/* WebSocket status */}
          <WebSocketIndicator collapsed={collapsed} className="rounded-md hover:bg-navy-lighter/40" />

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="navy-ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className={cn("mx-auto", !collapsed && "w-full justify-start px-2.5 gap-2.5")}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {!collapsed && <span className="text-sm font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Toggle theme</TooltipContent>}
          </Tooltip>

          {/* User profile */}
          <div className={cn(
            "flex items-center gap-2 mt-1 rounded-md px-2 py-2 border-t border-white/5 pt-3",
            collapsed && "justify-center"
          )}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.avatarInitials}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-medium truncate leading-none">{currentUser.name}</span>
                <span className="text-slate-500 text-[10px] leading-none mt-0.5 truncate">
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 -right-3 w-6 h-6 bg-navy-light border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-navy-lighter transition-colors shadow-md"
          style={{ position: "absolute" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </nav>
    </TooltipProvider>
  );
}
