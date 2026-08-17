import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";

export const revalidate = 0;

export default async function AdminPackagesPage() {
  const { data: packages, error } = await supabase
    .from("packages")
    .select(`
      id,
      name,
      description,
      package_versions (
        id,
        is_active,
        package_components (
          id,
          catalog_items ( id )
        )
      )
    `)
    .order("name");

  if (error) {
    console.error(error);
    return <div>Error loading packages</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Packages</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage bundled rental products and services.</p>
        </div>
        <Link 
          href="/admin/packages/new" 
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Package</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Package Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Items Included
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {packages?.map((pkg: any) => {
              const activeVersion = pkg.package_versions?.find((v: any) => v.is_active);
              const itemCount = activeVersion?.package_components?.length || 0;

              return (
                <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <span>{pkg.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {pkg.description || "No description provided."}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {itemCount} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/packages/${pkg.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {packages?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No service packages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
