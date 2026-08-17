import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { Plus, Package, QrCode } from "lucide-react";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const { data: assets, error } = await supabaseAdmin
    .from("assets")
    .select(`
      id,
      asset_tag,
      serial_number,
      inventory_status,
      product_models (
        model_name,
        manufacturers ( name ),
        equipment_categories ( name )
      )
    `);

  if (error) {
    console.error(error);
    return <div>Error loading inventory</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Physical Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage physical gear, track status, and view asset tags.</p>
        </div>
        <Link 
          href="/admin/inventory/new" 
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Receive Asset</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Model & Brand
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Asset Tag / SN
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
            {assets?.map((asset: any) => {
              const model = asset.product_models;
              const manufacturerName = model?.manufacturers?.name || "Unknown";
              const categoryName = model?.equipment_categories?.name || "Unknown";

              return (
                <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{model?.model_name || "Unknown Model"}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{manufacturerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-gray-300 font-mono">
                      <QrCode className="w-4 h-4 text-gray-400" />
                      <span>{asset.asset_tag || "No Tag"}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{asset.serial_number || 'No SN'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wide ${
                      asset.inventory_status === "available" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" :
                      asset.inventory_status === "checked_out" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400" :
                      asset.inventory_status === "reserved" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" :
                      asset.inventory_status === "maintenance_due" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" :
                      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                    }`}>
                      {asset.inventory_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/inventory/${asset.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold mr-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {assets?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

