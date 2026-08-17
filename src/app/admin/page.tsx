import { supabaseAdmin } from "@/lib/supabase-admin";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle, Package } from "lucide-react";

export const revalidate = 0; // Always dynamic

export default async function AdminDashboardPage() {
  // Fetch high-level stats
  const [rentalsRes, itemsRes] = await Promise.all([
    supabaseAdmin.from("rentals").select("*").order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("items").select("id", { count: 'exact', head: true })
  ]);

  const rentals = rentalsRes.data || [];
  const totalItems = itemsRes.count || 0;
  
  const pendingRentals = rentals.filter(r => r.status === "pending").length;
  const approvedRentals = rentals.filter(r => r.status === "approved").length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Requests</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingRentals}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Events</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{approvedRentals}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inventory Items</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Recent Rentals List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Requests & Events</h2>
          <Link href="/admin/rentals" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {rentals.map((rental) => (
            <div key={rental.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{rental.event_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {rental.client_name} • {format(new Date(rental.event_date), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  rental.status === "pending" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" :
                  rental.status === "approved" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                }`}>
                  {rental.status}
                </span>
              </div>
            </div>
          ))}
          {rentals.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No recent requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
