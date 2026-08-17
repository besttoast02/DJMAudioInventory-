"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Box } from "lucide-react";

export default function NewInventoryAssetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [models, setModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const [formData, setFormData] = useState({
    product_model_id: "",
    asset_tag: "",
    serial_number: "",
    inventory_status: "available",
    purchase_price_cents: 0,
  });

  useEffect(() => {
    async function loadModels() {
      const { data, error } = await supabase
        .from('product_models')
        .select(`
          id,
          model_name,
          manufacturers ( name )
        `)
        .order('model_name');
        
      if (!error && data) {
        setModels(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, product_model_id: data[0].id }));
        }
      }
      setModelsLoading(false);
    }
    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      // Wait, we need an organization_id. Hardcoding for MVP since this is a single org.
      const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      // 1. Insert Asset
      const { data: assetData, error: assetError } = await supabase
        .from("assets")
        .insert([{
          organization_id: ORG_ID,
          product_model_id: formData.product_model_id,
          asset_tag: formData.asset_tag,
          serial_number: formData.serial_number || null,
          inventory_status: formData.inventory_status,
          purchase_price_cents: formData.purchase_price_cents,
          is_rentable: true
        }])
        .select()
        .single();

      if (assetError) throw assetError;
      
      // 2. Insert Financial Profile
      const { error: finError } = await supabase
        .from("asset_financial_profiles")
        .insert([{
          asset_id: assetData.id,
          original_cost_basis_cents: formData.purchase_price_cents,
          residual_value_cents: formData.purchase_price_cents
        }]);

      if (finError) throw finError;
      
      router.push("/admin/inventory");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to receive asset");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/inventory" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inventory Assets
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receive New Asset</h1>
            <p className="text-gray-500 dark:text-gray-400">Add a physical unit of an existing product model into your warehouse.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-xl border border-gray-100 dark:border-slate-800 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Product Model (What is this item?)
            </label>
            {modelsLoading ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading models...</span>
              </div>
            ) : (
              <select
                required
                value={formData.product_model_id}
                onChange={(e) => setFormData({ ...formData, product_model_id: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              >
                <option value="" disabled>-- Select a Model --</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.model_name} ({m.manufacturers?.name || 'Unknown Brand'})
                  </option>
                ))}
              </select>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Can&apos;t find the model? You need to create a new Product Model first.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Tag (Barcode)
              </label>
              <input
                type="text"
                required
                value={formData.asset_tag}
                onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white font-mono"
                placeholder="e.g. DJM-1001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white font-mono"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Status
              </label>
              <select
                value={formData.inventory_status}
                onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              >
                <option value="available">Available in Warehouse</option>
                <option value="maintenance_due">Needs Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Price (Cents)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.purchase_price_cents}
                onChange={(e) => setFormData({ ...formData, purchase_price_cents: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                placeholder="e.g. 150000 for $1500.00"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/inventory")}
              className="px-6 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 mr-4 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || modelsLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Save Asset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
