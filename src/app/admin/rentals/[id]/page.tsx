import { supabaseAdmin } from "@/lib/supabase-admin";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RentalActions } from "./RentalActions";

export const revalidate = 0;

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: rental, error } = await supabaseAdmin
    .from("rentals")
    .select(`
      *,
      rental_items (
        id,
        items (
          id,
          name,
          brand,
          category,
          rate_daily
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !rental) {
    return <div>Rental not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/rentals" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Rentals
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{rental.event_name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {format(new Date(rental.event_date), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div>
            <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-full uppercase tracking-wide ${
              rental.status === "pending" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400" :
              rental.status === "approved" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" :
              "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
            }`}>
              {rental.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Client Details</h3>
            <p className="font-medium text-gray-900 dark:text-white">{rental.client_name}</p>
            <p className="text-gray-600 dark:text-gray-300">{rental.client_phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Venue</h3>
            <p className="font-medium text-gray-900 dark:text-white">{rental.venue}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Notes & Services Requested</h3>
          <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
            {rental.notes || "No additional notes provided."}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Gear List</h3>
          {rental.rental_items && rental.rental_items.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Brand</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Rate/Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {rental.rental_items.map((ri: { id: number, items: { name: string, brand: string, rate_daily: number } }) => (
                    <tr key={ri.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{ri.items.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{ri.items.brand}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">${ri.items.rate_daily}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No gear attached to this request.</p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Actions</h3>
          <RentalActions rentalId={rental.id} currentStatus={rental.status} />
        </div>
      </div>
    </div>
  );
}
