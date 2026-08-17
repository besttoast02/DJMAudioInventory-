"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Tags } from "lucide-react";

export default function NewProductModelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [manufacturers, setManufacturers] = useState<Record<string, any>[]>([]);
  const [categories, setCategories] = useState<Record<string, any>[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [formData, setFormData] = useState({
    model_name: "",
    manufacturer_id: "",
    category_id: "",
    daily_rate_cents: 0,
  });

  useEffect(() => {
    async function loadLookups() {
      const [mRes, cRes] = await Promise.all([
        supabase.from('manufacturers').select('id, name').order('name'),
        supabase.from('equipment_categories').select('id, name').order('name')
      ]);
      
      if (mRes.data) {
        setManufacturers(mRes.data);
        if (mRes.data.length > 0) setFormData(p => ({ ...p, manufacturer_id: mRes.data[0].id }));
      }
      
      if (cRes.data) {
        setCategories(cRes.data);
        if (cRes.data.length > 0) setFormData(p => ({ ...p, category_id: cRes.data[0].id }));
      }
      
      setLoadingLookups(false);
    }
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Hardcoded ORG_ID and STANDARD_RATE_CARD_ID for MVP
      const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const STANDARD_RATE_CARD_ID = 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      // 1. Insert Product Model
      const { data: modelData, error: modelError } = await supabase
        .from("product_models")
        .insert([{
          organization_id: ORG_ID,
          category_id: formData.category_id,
          manufacturer_id: formData.manufacturer_id,
          model_name: formData.model_name,
          display_name: formData.model_name,
        }])
        .select()
        .single();

      if (modelError) throw modelError;

      // 2. Insert Catalog Item
      const { data: catalogData, error: catalogError } = await supabase
        .from("catalog_items")
        .insert([{
          organization_id: ORG_ID,
          item_kind: 'rental_product',
          name: formData.model_name,
          customer_description: formData.model_name,
        }])
        .select()
        .single();
        
      if (catalogError) throw catalogError;

      // 3. Link Catalog to Model
      const { error: rentalError } = await supabase
        .from("rental_products")
        .insert([{
          catalog_item_id: catalogData.id,
          product_model_id: modelData.id
        }]);

      if (rentalError) throw rentalError;

      // 4. Insert Rate Card Price
      const { error: rateError } = await supabase
        .from("rate_card_prices")
        .insert([{
          rate_card_id: STANDARD_RATE_CARD_ID,
          catalog_item_id: catalogData.id,
          duration_type: 'full_day',
          price_cents: formData.daily_rate_cents
        }]);

      if (rateError) throw rateError;
      
      router.push("/admin/models");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create product model");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/models" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Product Models
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Product Model</h1>
            <p className="text-gray-500 dark:text-gray-400">Define a new equipment model and its rental pricing.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model Name
              </label>
              <input
                type="text"
                required
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                placeholder="e.g. CDJ-3000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manufacturer
              </label>
              {loadingLookups ? (
                <div className="py-2 text-sm text-gray-500">Loading...</div>
              ) : (
                <select
                  required
                  value={formData.manufacturer_id}
                  onChange={(e) => setFormData({ ...formData, manufacturer_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                >
                  {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              {loadingLookups ? (
                <div className="py-2 text-sm text-gray-500">Loading...</div>
              ) : (
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-xl border border-gray-100 dark:border-slate-800 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard Daily Rate (Cents)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.daily_rate_cents}
                onChange={(e) => setFormData({ ...formData, daily_rate_cents: Number(e.target.value) })}
                className="w-full md:w-1/2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                placeholder="e.g. 15000 for $150.00"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/models")}
              className="px-6 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 mr-4 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingLookups}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Create Model & Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
