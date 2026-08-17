import { supabaseAdmin } from "@/lib/supabase-admin";
import { format } from "date-fns";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminRentalsPage() {
  const { data: rentals, error } = await supabaseAdmin
    .from("events")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading events</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rentals & Events</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Event / Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {rentals?.map((rental: any) => (
              <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900 dark:text-white">{rental.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{rental.clients?.name || "Unknown Client"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {rental.event_start ? format(new Date(rental.event_start), "MMM d, yyyy") : "TBD"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wide ${
                    rental.status === "inquiry" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400" :
                    rental.status === "deposit_paid" || rental.status === "contract_signed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" :
                    rental.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" :
                    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400"
                  }`}>
                    {rental.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/rentals/${rental.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {rentals?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No rentals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
