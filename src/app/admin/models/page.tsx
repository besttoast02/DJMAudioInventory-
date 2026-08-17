import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { Plus, Package } from "lucide-react";

export const revalidate = 0;

export default async function AdminModelsPage() {
  const { data: models, error } = await supabaseAdmin
    .from("product_models")
    .select(`
      id,
      model_name,
      manufacturers ( name ),
      equipment_categories ( name ),
      rental_products (
        catalog_items (
          rate_card_prices ( price_cents, duration_type )
        )
      )
    `)
    .order("model_name");

  if (error) {
    console.error(error);
    return <div>Error loading models</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Models & Catalog</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Define product specifications and set rental prices.</p>
        </div>
        <Link 
          href="/admin/models/new" 
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Product Model</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Model Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Daily Rate
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {models?.map((model: Record<string, any>) => {
              const brand = model.manufacturers?.name || "Unknown";
              const category = model.equipment_categories?.name || "Unknown";
              
              // Safely extract daily rate
              const rentalProduct = model.rental_products?.[0];
              const catalogItem = rentalProduct?.catalog_items;
              const rateCardPrices = catalogItem?.rate_card_prices || [];
              const dailyRateObj = rateCardPrices.find((r: Record<string, any>) => r.duration_type === 'full_day');
              const dailyRateCents = dailyRateObj ? dailyRateObj.price_cents : 0;

              return (
                <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{model.model_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${(dailyRateCents / 100).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/models/${model.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {models?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No product models found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
