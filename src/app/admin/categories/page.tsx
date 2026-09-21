"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FolderTree, Plus, Edit2, Trash2, Loader2, Save, X, Network } from "lucide-react";

type Category = {
  id: string;
  name: string;
  category_code: string;
  parent_category_id: string | null;
  is_active: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_code: "",
    parent_category_id: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("equipment_categories")
        .select("*")
        .order("name");

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModal = (category: Category | null = null, parentId: string = "") => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        category_code: category.category_code || "",
        parent_category_id: category.parent_category_id || ""
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        category_code: "",
        parent_category_id: parentId
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        category_code: formData.category_code || null,
        parent_category_id: formData.parent_category_id || null,
        organization_id: "61306565-9c0b-4ef8-bb6d-6bb9bd380a11" // TODO: Dynamic
      };

      if (editingCategory) {
        const { error: updateError } = await supabase
          .from("equipment_categories")
          .update(payload)
          .eq("id", editingCategory.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("equipment_categories")
          .insert(payload);
        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save category");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This might fail if products are linked to it.")) {
      return;
    }
    
    try {
      const { error: delError } = await supabase
        .from("equipment_categories")
        .delete()
        .eq("id", id);

      if (delError) throw delError;
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to delete category. It may be in use.");
    }
  };

  // Build a nested tree structure for rendering
  const renderTree = (parentId: string | null = null, depth = 0) => {
    const children = categories.filter((c) => c.parent_category_id === parentId);
    
    if (children.length === 0) return null;

    return (
      <div className="space-y-2 mt-2">
        {children.map((category) => (
          <div key={category.id} className="relative">
            {/* Tree Branch line */}
            {depth > 0 && (
              <div 
                className="absolute border-l-2 border-b-2 border-gray-200 dark:border-slate-700" 
                style={{ 
                  left: '-20px', 
                  top: '-10px', 
                  height: '30px', 
                  width: '16px',
                  borderBottomLeftRadius: '8px'
                }} 
              />
            )}
            
            <div className={`flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow group ${depth > 0 ? 'ml-6' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {category.name}
                    {category.category_code && (
                      <span className="text-xs font-mono font-normal bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                        {category.category_code}
                      </span>
                    )}
                  </h4>
                </div>
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                <button 
                  onClick={() => handleOpenModal(null, category.id)}
                  className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Add Subcategory"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleOpenModal(category)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Render subcategories */}
            <div className="ml-2 border-l-2 border-gray-100 dark:border-slate-800/50">
              {renderTree(category.id, depth + 1)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FolderTree className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
            Equipment Taxonomy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Manage your equipment categories and organizational hierarchy.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Root Category</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="pb-4">
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No categories found. Create a root category to get started.</p>
              </div>
            ) : (
              renderTree(null, 0)
            )}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Audio, Speakers, Wash Lights"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.category_code}
                  onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                  placeholder="e.g. AUDIO-SPK"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parent_category_id}
                  onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">None (Root Category)</option>
                  {categories.map((cat) => (
                    // Prevent setting self or descendants as parent (simplified: just prevent self)
                    cat.id !== editingCategory?.id ? (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ) : null
                  ))}
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
