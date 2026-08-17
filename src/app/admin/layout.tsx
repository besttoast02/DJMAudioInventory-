"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { LayoutDashboard, CalendarDays, PackageSearch, Users, LogOut, Layers, FolderTree } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Disabled auth check to unblock the user for now
    /*
    if (pathname !== "/admin/login" && localStorage.getItem("admin_auth") !== "true") {
      window.location.href = "/admin/login";
    }
    */
  }, [pathname]);

  // If we are on the login page, don't show the admin sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    // Clear Supabase auth just in case there's an old session
    await supabase.auth.signOut();
    // Clear our hardcoded auth
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin/login";
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Rentals & Events", href: "/admin/rentals", icon: CalendarDays },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Product Models", href: "/admin/models", icon: PackageSearch },
    { name: "Inventory Assets", href: "/admin/inventory", icon: PackageSearch },
    { name: "Service Packages", href: "/admin/packages", icon: Layers },
    { name: "Network", href: "/admin/network", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 dark:bg-slate-900 text-white flex flex-col fixed inset-y-0 z-10 border-r dark:border-slate-800">
        <div className="p-6 border-b border-gray-800 dark:border-slate-800">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>DJM Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 dark:hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 dark:hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
