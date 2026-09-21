"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Layers, Plus, Trash2 } from "lucide-react";

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  
  const [pkg, setPkg] = useState<any>(null);
  const [activeVersion, setActiveVersion] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [newItemId, setNewItemId] = useState<string>("");
  const [newItemQty, setNewItemQty] = useState<number>(1);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const { data: pkgData, error: pkgError } = await supabase
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
                quantity,
                catalog_items (
                  id,
                  rental_products (
                    product_models ( model_name, manufacturers(name) )
                  )
                )
              )
            )
          `)
          .eq("id", id)
          .single();

        if (pkgError) throw pkgError;
        
        if (pkgData) {
          setPkg(pkgData);
          const version = pkgData.package_versions?.find((v: any) => v.is_active);
          setActiveVersion(version);
          if (version) {
            setComponents(version.package_components || []);
          }
        }

        // Fetch catalog items
        const { data: catItems } = await supabase
          .from("catalog_items")
          .select(`
            id,
            item_type,
            name,
            rental_products ( product_models ( manufacturer, model_number, name ) ),
            labor_services ( title )
          `)
          .eq("is_active", true);
        if (catItems) setCatalogItems(catItems);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load package details.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchPackage();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("packages")
        .update({
          name: pkg.name,
          description: pkg.description
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      // Update components if there's an active version
      if (activeVersion) {
        // First delete all existing components
        await supabase
          .from("package_components")
          .delete()
          .eq("package_version_id", activeVersion.id);
          
        // Insert new components
        if (components.length > 0) {
          const compsToInsert = components.map(c => ({
            package_version_id: activeVersion.id,
            catalog_item_id: c.catalog_items?.id || c.catalog_item_id,
            quantity: c.quantity
          }));
          const { error: compsError } = await supabase
            .from("package_components")
            .insert(compsToInsert);
          
          if (compsError) throw compsError;
        }
      }
      
      router.push("/admin/packages");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update package");
      }
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const handleAddComponent = () => {
    if (!newItemId || !activeVersion) return;
    
    // Check if item already exists in components
    const existingIndex = components.findIndex(c => (c.catalog_items?.id || c.catalog_item_id) === newItemId);
    
    const newComponents = [...components];
    
    if (existingIndex >= 0) {
      newComponents[existingIndex].quantity += newItemQty;
    } else {
      const selectedItem = catalogItems.find(c => c.id === newItemId);
      newComponents.push({
        id: "temp-" + Date.now(),
        catalog_item_id: newItemId,
        package_version_id: activeVersion.id,
        quantity: newItemQty,
        catalog_items: selectedItem
      });
    }
    
    setComponents(newComponents);
    setNewItemId("");
    setNewItemQty(1);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center">
        <Link href="/admin/packages" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Packages
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Package
            </h1>
            <p className="text-gray-500 mt-1">Manage bundle details and view included items.</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={pkg?.name || ""}
                  onChange={(e) => setPkg({ ...pkg, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={pkg?.description || ""}
                  onChange={(e) => setPkg({ ...pkg, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Details</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Package Components</h3>
        </div>
        
        <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex gap-4">
          <select
            value={newItemId}
            onChange={(e) => setNewItemId(e.target.value)}
            className="flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an item to add...</option>
            {catalogItems.map((item) => {
              let label = item.name;
              if (item.item_type === "rental_product" && item.rental_products?.[0]?.product_models) {
                const mod = item.rental_products[0].product_models;
                label = `${mod.manufacturer} ${mod.model_number} - ${mod.name}`;
              } else if (item.item_type === "labor_service" && item.labor_services?.[0]?.title) {
                label = `Labor: ${item.labor_services[0].title}`;
              }
              return (
                <option key={item.id} value={item.id}>
                  {label}
                </option>
              );
            })}
          </select>
          <input
            type="number"
            min="1"
            value={newItemQty}
            onChange={(e) => setNewItemQty(parseInt(e.target.value))}
            className="w-24 px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddComponent}
            disabled={!newItemId}
            className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {components.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No items in this package yet.
            </div>
          ) : (
            components.map((comp) => {
              const item = comp.catalog_items;
              let label = item?.name || "Unknown Item";
              const subtitle = item?.item_type === "rental_product" ? "Rental Product" : item?.item_type === "labor_service" ? "Labor Service" : "Item";
              
              if (item?.item_type === "rental_product" && item?.rental_products?.[0]?.product_models) {
                const model = item.rental_products[0].product_models;
                label = `${model.manufacturer || ""} ${model.model_number || ""} - ${model.name || label}`;
              } else if (item?.item_type === "labor_service" && item?.labor_services?.[0]?.title) {
                label = item.labor_services[0].title;
              }

              return (
                <div key={comp.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {subtitle} &middot; Quantity: {comp.quantity}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveComponent(comp.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
