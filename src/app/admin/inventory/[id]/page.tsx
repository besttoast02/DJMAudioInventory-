"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2, Box, DollarSign, Wrench, Users, Package, Lightbulb, CheckSquare, CloudRain, FileText } from "lucide-react";

export default function EditInventoryAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"general" | "financials" | "maintenance" | "model_specs">("general");
  const [modelInfo, setModelInfo] = useState<Record<string, any> | null>(null);
  
  // General
  const [formData, setFormData] = useState({
    asset_tag: "",
    serial_number: "",
    inventory_status: "available",
    condition_grade: "new",
  });

  // Financials
  const [financialData, setFinancialData] = useState({
    original_cost_basis_cents: 0,
    residual_value_cents: 0,
    useful_life_months: 60,
    replacement_cost_estimate_cents: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });

  // Model Specs (Cross-layer)
  const [productModelId, setProductModelId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [manualUrl, setManualUrl] = useState<string>("");
  
  // Environment & Weather
  const [environmentProfile, setEnvironmentProfile] = useState<any>({
    manufacturer_outdoor_approved: false,
    requires_weather_cover: false,
    ip_rating: ""
  });
  
  // Maintenance Plan
  const [maintenancePlanId, setMaintenancePlanId] = useState<string | null>(null);
  const [maintenancePlan, setMaintenancePlan] = useState<any>({
    interval_value: 0,
    trigger_type: "calendar_interval"
  });
  
  const [speakerSpecs, setSpeakerSpecs] = useState<any>({
    continuous_rms_power_watts: 0,
    peak_power_watts: 0,
    maximum_spl_db: 0,
    horizontal_dispersion_deg: 0,
    vertical_dispersion_deg: 0,
    weight_lbs: 0,
  });
  
  const [lightingSpecs, setLightingSpecs] = useState<any>({
    fixture_type: "",
    power_consumption_watts: 0,
    lumens: 0,
    ip_rating: "",
    weight_lbs: 0,
  });
  
  const [coverageId, setCoverageId] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<any>({
    estimated_min_crowd: 0,
    estimated_max_crowd: 0,
    max_throw_distance_ft: 0,
    target_spl_db: 0,
  });
  
  const [deploymentModes, setDeploymentModes] = useState<any[]>([]);
  const [selectedModes, setSelectedModes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check role for Financials access
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("admin_role") === "admin");
    }

    async function fetchAsset() {
      try {
        const { data, error } = await supabase
          .from("assets")
          .select(`
            id,
            asset_tag,
            serial_number,
            inventory_status,
            condition_grade,
            purchase_date,
            product_model_id,
            product_models (
              model_name,
              category_id,
              manual_storage_path,
              manufacturers ( name )
            ),
            asset_financial_profiles (
              original_cost_basis_cents,
              residual_value_cents,
              useful_life_months,
              replacement_cost_estimate_cents
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            asset_tag: data.asset_tag || "",
            serial_number: data.serial_number || "",
            inventory_status: data.inventory_status,
            condition_grade: data.condition_grade || "new",
          });
          const rawPm = data.product_models;
          const pm = Array.isArray(rawPm) ? rawPm[0] : rawPm;
          
          if (pm) {
            const manufacturers = Array.isArray(pm.manufacturers) 
              ? pm.manufacturers[0] 
              : pm.manufacturers;
            
            setModelInfo({
              ...pm,
              manufacturers
            });
            setCategoryId(pm.category_id || "");
            setManualUrl(pm.manual_storage_path || "");
          } else {
            setModelInfo(null);
            setCategoryId("");
            setManualUrl("");
          }
          setProductModelId(data.product_model_id);
          
          if (data.asset_financial_profiles && data.asset_financial_profiles.length > 0) {
            setFinancialData({
              original_cost_basis_cents: data.asset_financial_profiles[0].original_cost_basis_cents,
              residual_value_cents: data.asset_financial_profiles[0].residual_value_cents || 0,
              useful_life_months: data.asset_financial_profiles[0].useful_life_months || 60,
              replacement_cost_estimate_cents: data.asset_financial_profiles[0].replacement_cost_estimate_cents || 0,
              purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : new Date().toISOString().split('T')[0],
            });
          }
          
          const pId = data.product_model_id;
          if (pId) {
            // Fetch categories for the tree
            const { data: catData } = await supabase.from("equipment_categories").select("*").order("name");
            if (catData) setCategories(catData);

            // Fetch speaker specs
            const { data: specsData } = await supabase.from("speaker_specs").select("*").eq("product_model_id", pId).single();
            if (specsData) {
              setSpeakerSpecs({
                continuous_rms_power_watts: specsData.continuous_rms_power_watts || 0,
                peak_power_watts: specsData.peak_power_watts || 0,
                maximum_spl_db: specsData.maximum_spl_db || 0,
                horizontal_dispersion_deg: specsData.horizontal_dispersion_deg || 0,
                vertical_dispersion_deg: specsData.vertical_dispersion_deg || 0,
                weight_lbs: specsData.weight_lbs || 0,
              });
            }

            // Fetch lighting specs
            const { data: lightData } = await supabase.from("lighting_fixture_specs").select("*").eq("product_model_id", pId).single();
            if (lightData) {
              setLightingSpecs({
                fixture_type: lightData.fixture_type || "",
                power_consumption_watts: lightData.power_consumption_watts || 0,
                lumens: lightData.lumens || 0,
                ip_rating: lightData.ip_rating || "",
                weight_lbs: lightData.weight_lbs || 0,
              });
            }

            // Fetch coverage profile
            const { data: covData } = await supabase.from("coverage_profiles").select("*").eq("product_model_id", pId).limit(1).single();
            if (covData) {
              setCoverageId(covData.id);
              setCoverage({
                estimated_min_crowd: covData.estimated_min_crowd || 0,
                estimated_max_crowd: covData.estimated_max_crowd || 0,
                max_throw_distance_ft: covData.max_throw_distance_ft || 0,
                target_spl_db: covData.target_spl_db || 0,
              });
            }

            // Fetch deployment modes
            const { data: dmData } = await supabase.from("deployment_modes").select("*").order("name");
            if (dmData) setDeploymentModes(dmData);
            
            const { data: mdmData } = await supabase.from("model_deployment_modes").select("deployment_mode_id").eq("product_model_id", pId);
            if (mdmData) {
              const modeMap: Record<string, boolean> = {};
              mdmData.forEach((m) => {
                modeMap[m.deployment_mode_id] = true;
              });
              setSelectedModes(modeMap);
            }
            // Fetch environment profile
            const { data: envData } = await supabase.from("model_environment_profiles").select("*").eq("product_model_id", pId).single();
            if (envData) {
              setEnvironmentProfile({
                manufacturer_outdoor_approved: envData.manufacturer_outdoor_approved || false,
                requires_weather_cover: envData.requires_weather_cover || false,
                ip_rating: envData.ip_rating || "",
              });
            }

            // Fetch maintenance plan
            const { data: maintData } = await supabase.from("maintenance_plans").select("*").eq("target_type", "model").eq("target_id", pId).limit(1).single();
            if (maintData) {
              setMaintenancePlanId(maintData.id);
              setMaintenancePlan({
                interval_value: maintData.interval_value || 0,
                trigger_type: maintData.trigger_type || "calendar_interval"
              });
            }
          }
        }
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load asset details.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchAsset();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Update basic details
      const { error: updateError } = await supabase
        .from("assets")
        .update({
          asset_tag: formData.asset_tag,
          serial_number: formData.serial_number || null,
          inventory_status: formData.inventory_status,
          condition_grade: formData.condition_grade,
          purchase_date: financialData.purchase_date
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      // Upsert financial data
      const { error: financialError } = await supabase
        .from("asset_financial_profiles")
        .upsert({
          asset_id: id,
          original_cost_basis_cents: financialData.original_cost_basis_cents,
          residual_value_cents: financialData.residual_value_cents,
          useful_life_months: financialData.useful_life_months,
          replacement_cost_estimate_cents: financialData.replacement_cost_estimate_cents
        });

      if (financialError) throw financialError;
      
      if (productModelId) {
        // Update the category and manual url
        const { error: catUpdateError } = await supabase
          .from("product_models")
          .update({ 
            category_id: categoryId || null,
            manual_storage_path: manualUrl
          })
          .eq("id", productModelId);
        if (catUpdateError) throw catUpdateError;

        // Save speaker specs
        if (isSpeakerCategory()) {
          const { error: specsError } = await supabase
            .from("speaker_specs")
            .upsert({
              product_model_id: productModelId,
              continuous_rms_power_watts: speakerSpecs.continuous_rms_power_watts,
              peak_power_watts: speakerSpecs.peak_power_watts,
              maximum_spl_db: speakerSpecs.maximum_spl_db,
              horizontal_dispersion_deg: speakerSpecs.horizontal_dispersion_deg,
              vertical_dispersion_deg: speakerSpecs.vertical_dispersion_deg,
              weight_lbs: speakerSpecs.weight_lbs
            });
          if (specsError) throw specsError;
          
          // Save Coverage Profile
          const covPayload = {
            product_model_id: productModelId,
            estimated_min_crowd: coverage.estimated_min_crowd,
            estimated_max_crowd: coverage.estimated_max_crowd,
            max_throw_distance_ft: coverage.max_throw_distance_ft,
            target_spl_db: coverage.target_spl_db,
            organization_id: "61306565-9c0b-4ef8-bb6d-6bb9bd380a11" // TODO: dynamic org ID
          };
          if (coverageId) {
            const { error: covError } = await supabase.from("coverage_profiles").update(covPayload).eq("id", coverageId);
            if (covError) throw covError;
          } else {
            const { error: covError } = await supabase.from("coverage_profiles").insert(covPayload);
            if (covError) throw covError;
          }
        }

        // Save lighting specs
        if (isLightingCategory()) {
          const { error: lightError } = await supabase
            .from("lighting_fixture_specs")
            .upsert({
              product_model_id: productModelId,
              fixture_type: lightingSpecs.fixture_type,
              power_consumption_watts: lightingSpecs.power_consumption_watts,
              lumens: lightingSpecs.lumens,
              ip_rating: lightingSpecs.ip_rating,
              weight_lbs: lightingSpecs.weight_lbs
            });
          if (lightError) throw lightError;
        }

        // Save Deployment Modes
        await supabase.from("model_deployment_modes").delete().eq("product_model_id", productModelId);
        const modesToInsert = Object.keys(selectedModes)
          .filter((modeId) => selectedModes[modeId])
          .map((modeId) => ({
            product_model_id: productModelId,
            deployment_mode_id: modeId,
            is_manufacturer_approved: true
          }));
          
        if (modesToInsert.length > 0) {
          const { error: mdmError } = await supabase.from("model_deployment_modes").insert(modesToInsert);
          if (mdmError) throw mdmError;
        }

        // Upsert Environment Profile
        const { error: envError } = await supabase
          .from("model_environment_profiles")
          .upsert({
            product_model_id: productModelId,
            manufacturer_outdoor_approved: environmentProfile.manufacturer_outdoor_approved,
            requires_weather_cover: environmentProfile.requires_weather_cover,
            ip_rating: environmentProfile.ip_rating
          });
        if (envError) throw envError;

        // Upsert Maintenance Plan
        const maintPayload = {
          organization_id: "61306565-9c0b-4ef8-bb6d-6bb9bd380a11",
          target_type: "model",
          target_id: productModelId,
          name: `${modelInfo?.model_name || "Model"} Standard Maintenance`,
          trigger_type: maintenancePlan.trigger_type,
          interval_value: maintenancePlan.interval_value
        };
        
        if (maintenancePlanId) {
          const { error: maintError } = await supabase.from("maintenance_plans").update(maintPayload).eq("id", maintenancePlanId);
          if (maintError) throw maintError;
        } else {
          const { error: maintError } = await supabase.from("maintenance_plans").insert(maintPayload);
          if (maintError) throw maintError;
        }
      }
      
      router.push("/admin/inventory");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update asset");
      }
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this physical asset? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      router.push("/admin/inventory");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to delete asset. It may be attached to existing reservations.");
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const calculateCurrentValue = () => {
    const original = financialData.original_cost_basis_cents || 0;
    const residual = financialData.residual_value_cents || 0;
    const monthsLife = financialData.useful_life_months || 1;
    const purchaseDate = financialData.purchase_date;
    
    if (!purchaseDate) return original;
    
    const start = new Date(purchaseDate);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    if (monthsElapsed <= 0) return original;
    if (monthsElapsed >= monthsLife) return residual;
    
    const depreciationPerMonth = (original - residual) / monthsLife;
    return original - (depreciationPerMonth * monthsElapsed);
  };

  const currentValue = calculateCurrentValue();

  const calculateDegradationScore = () => {
    // Score starts at 100
    // Age factor
    const monthsLife = financialData.useful_life_months || 1;
    const purchaseDate = financialData.purchase_date;
    let ageScore = 100;
    
    if (purchaseDate) {
      const start = new Date(purchaseDate);
      const now = new Date();
      const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      ageScore = Math.max(0, 100 - ((monthsElapsed / monthsLife) * 100));
    }

    // Condition factor multiplier
    const conditionMultipliers: Record<string, number> = {
      'new': 1.0,
      'excellent': 0.95,
      'good': 0.85,
      'fair': 0.60,
      'poor': 0.30,
      'broken': 0.0
    };
    
    const multiplier = conditionMultipliers[formData.condition_grade] ?? 1.0;
    return Math.round(ageScore * multiplier);
  };
  
  const degradationScore = calculateDegradationScore();

  const calculateNextMaintenance = () => {
    if (!maintenancePlan.interval_value) return null;
    const purchaseDate = financialData.purchase_date;
    if (!purchaseDate) return null;
    
    const start = new Date(purchaseDate);
    const now = new Date();
    
    // Add interval until we are in the future
    let nextDate = new Date(start);
    while (nextDate <= now) {
      nextDate.setMonth(nextDate.getMonth() + maintenancePlan.interval_value);
    }
    return nextDate.toLocaleDateString();
  };
  const nextMaintenanceDate = calculateNextMaintenance();

  // Build category hierarchy options
  const buildCategoryOptions = (parentId: string | null = null, depth = 0): React.ReactNode[] => {
    return categories
      .filter((c) => c.parent_category_id === parentId)
      .flatMap((c) => [
        <option key={c.id} value={c.id}>
          {"\u00A0".repeat(depth * 4)} {depth > 0 ? "└─ " : ""} {c.name}
        </option>,
        ...buildCategoryOptions(c.id, depth + 1),
      ]);
  };

  // Check if category is a speaker or sub-category of speaker
  const isSpeakerCategory = () => {
    if (!categoryId) return false;
    const check = (cid: string): boolean => {
      const cat = categories.find(c => c.id === cid);
      if (!cat) return false;
      if (cat.category_code?.includes("AUDIO-SPK")) return true;
      if (cat.parent_category_id) return check(cat.parent_category_id);
      return false;
    };
    return check(categoryId);
  };
  
  const isLightingCategory = () => {
    if (!categoryId) return false;
    const check = (cid: string): boolean => {
      const cat = categories.find(c => c.id === cid);
      if (!cat) return false;
      if (cat.category_code?.includes("LIGHTING") || cat.name?.includes("Lighting")) return true;
      if (cat.parent_category_id) return check(cat.parent_category_id);
      return false;
    };
    return check(categoryId);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/inventory" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inventory
        </Link>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center space-x-1 text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          <span className="text-sm font-medium">Delete Asset</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Header section */}
        <div className="p-8 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Box className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelInfo?.manufacturers?.name} {modelInfo?.model_name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-sm text-gray-700 dark:text-gray-300">
                  {formData.asset_tag}
                </span>
                <span>•</span>
                <span>{formData.inventory_status.replace('_', ' ').toUpperCase()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 px-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "general" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              General Specs
            </div>
          </button>
          <button
            onClick={() => setActiveTab("model_specs")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "model_specs" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Model Specs
            </div>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("financials")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "financials" 
                  ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Profile
              </div>
            </button>
          )}
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "maintenance" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance Schedule
            </div>
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white font-mono shadow-sm"
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
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white font-mono shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Physical Status
                    </label>
                    <select
                      value={formData.inventory_status}
                      onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                    >
                      <option value="available">Available in Warehouse</option>
                      <option value="checked_out">Checked Out (On Rent)</option>
                      <option value="maintenance_due">Needs Maintenance</option>
                      <option value="decommissioned">Decommissioned</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condition Grade
                    </label>
                    <select
                      value={formData.condition_grade}
                      onChange={(e) => setFormData({ ...formData, condition_grade: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                    >
                      <option value="new">New / Mint</option>
                      <option value="excellent">Excellent (Light signs of wear)</option>
                      <option value="good">Good (Normal cosmetic wear)</option>
                      <option value="fair">Fair (Heavy cosmetic wear)</option>
                      <option value="poor">Poor (Damaged but functional)</option>
                      <option value="broken">Broken (Needs repair)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Physical Condition & Degradation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Calculated heuristically based on the unit's age relative to its useful life, multiplied by the current manually assessed condition grade.</p>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            degradationScore > 80 ? 'bg-green-500' :
                            degradationScore > 50 ? 'bg-blue-500' :
                            degradationScore > 25 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, degradationScore))}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white w-24 text-right">
                      {degradationScore}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAdmin && activeTab === "financials" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Track the purchase price, expected depreciation, and replacement value of this specific unit. This data is used for ROI calculations and sale/liquidation reporting.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Purchase Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={financialData.original_cost_basis_cents / 100}
                        onChange={(e) => setFinancialData({ ...financialData, original_cost_basis_cents: Math.round(parseFloat(e.target.value) * 100) })}
                        className="w-full pl-8 px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Replacement Cost Estimate ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={financialData.replacement_cost_estimate_cents / 100}
                        onChange={(e) => setFinancialData({ ...financialData, replacement_cost_estimate_cents: Math.round(parseFloat(e.target.value) * 100) })}
                        className="w-full pl-8 px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sale / Residual Value ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={financialData.residual_value_cents / 100}
                        onChange={(e) => setFinancialData({ ...financialData, residual_value_cents: Math.round(parseFloat(e.target.value) * 100) })}
                        className="w-full pl-8 px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={financialData.purchase_date}
                      onChange={(e) => setFinancialData({ ...financialData, purchase_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Useful Life (Months)
                    </label>
                    <input
                      type="number"
                      value={financialData.useful_life_months}
                      onChange={(e) => setFinancialData({ ...financialData, useful_life_months: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Depreciation Calculator UI */}
                <div className="mt-8 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Live Depreciation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Original Cost</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">${(financialData.original_cost_basis_cents / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Estimated Value</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${(currentValue / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Residual Value</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">${(financialData.residual_value_cents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-6 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, 
                          ((financialData.original_cost_basis_cents - currentValue) / 
                          (financialData.original_cost_basis_cents - financialData.residual_value_cents || 1)) * 100
                        ))}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Straight-line depreciation progress based on useful life of {financialData.useful_life_months} months.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === "maintenance" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">Standard Maintenance Interval: {maintenancePlan.interval_value || "None"} Months</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Maintenance schedules are defined by the underlying Product Model. Below are the specific maintenance logs for this physical unit.
                    </p>
                  </div>
                  {nextMaintenanceDate && (
                    <div className="text-right ml-4 shrink-0 bg-white dark:bg-slate-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">Next Due</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{nextMaintenanceDate}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                  <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-gray-900 dark:text-white font-medium">No Maintenance Logs</h3>
                  <p className="text-gray-500 text-sm mt-1">This unit has not been flagged for maintenance yet.</p>
                  <button type="button" className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                    Log Maintenance Activity
                  </button>
                </div>
              </div>
            )}

            {activeTab === "model_specs" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    ⚠️ You are editing the global Product Model. Changes made here will affect ALL physical assets of this model type.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Equipment Classification
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Equipment Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
                      >
                        <option value="">Select a category...</option>
                        {buildCategoryOptions()}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Proper categorization unlocks specific technical specification fields and deployment rules for this model.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-1 text-gray-500" />
                        PDF Manual URL
                      </label>
                      <input
                        type="url"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://manufacturer.com/manual.pdf"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">Link to the manufacturer's manual or documentation.</p>
                    </div>
                  </div>
                </div>

                {isSpeakerCategory() && (
                  <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Loudspeaker Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Continuous RMS Power (W)
                        </label>
                        <input
                          type="number"
                          value={speakerSpecs.continuous_rms_power_watts}
                          onChange={(e) => setSpeakerSpecs({ ...speakerSpecs, continuous_rms_power_watts: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Peak Power (W)
                        </label>
                        <input
                          type="number"
                          value={speakerSpecs.peak_power_watts}
                          onChange={(e) => setSpeakerSpecs({ ...speakerSpecs, peak_power_watts: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum SPL (dB)
                        </label>
                        <input
                          type="number"
                          value={speakerSpecs.maximum_spl_db}
                          onChange={(e) => setSpeakerSpecs({ ...speakerSpecs, maximum_spl_db: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Horizontal Dispersion (°)
                        </label>
                        <input
                          type="number"
                          value={speakerSpecs.horizontal_dispersion_deg}
                          onChange={(e) => setSpeakerSpecs({ ...speakerSpecs, horizontal_dispersion_deg: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vertical Dispersion (°)
                        </label>
                        <input
                          type="number"
                          value={speakerSpecs.vertical_dispersion_deg}
                          onChange={(e) => setSpeakerSpecs({ ...speakerSpecs, vertical_dispersion_deg: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={speakerSpecs.weight_lbs}
                          onChange={(e) => setSpeakerSpecs({ ...speakerSpecs, weight_lbs: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isSpeakerCategory() && (
                  <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Audience Coverage & Capability
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estimated Minimum Crowd
                        </label>
                        <input
                          type="number"
                          value={coverage.estimated_min_crowd}
                          onChange={(e) => setCoverage({ ...coverage, estimated_min_crowd: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estimated Maximum Crowd
                        </label>
                        <input
                          type="number"
                          value={coverage.estimated_max_crowd}
                          onChange={(e) => setCoverage({ ...coverage, estimated_max_crowd: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Throw Distance (ft)
                        </label>
                        <input
                          type="number"
                          value={coverage.max_throw_distance_ft}
                          onChange={(e) => setCoverage({ ...coverage, max_throw_distance_ft: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target SPL (dB)
                        </label>
                        <input
                          type="number"
                          value={coverage.target_spl_db}
                          onChange={(e) => setCoverage({ ...coverage, target_spl_db: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isLightingCategory() && (
                  <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                      Lighting Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fixture Type
                        </label>
                        <input
                          type="text"
                          value={lightingSpecs.fixture_type}
                          onChange={(e) => setLightingSpecs({ ...lightingSpecs, fixture_type: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Power Consumption (W)
                        </label>
                        <input
                          type="number"
                          value={lightingSpecs.power_consumption_watts}
                          onChange={(e) => setLightingSpecs({ ...lightingSpecs, power_consumption_watts: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lumens
                        </label>
                        <input
                          type="number"
                          value={lightingSpecs.lumens}
                          onChange={(e) => setLightingSpecs({ ...lightingSpecs, lumens: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          IP Rating
                        </label>
                        <input
                          type="text"
                          value={lightingSpecs.ip_rating}
                          onChange={(e) => setLightingSpecs({ ...lightingSpecs, ip_rating: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={lightingSpecs.weight_lbs}
                          onChange={(e) => setLightingSpecs({ ...lightingSpecs, weight_lbs: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-blue-500" />
                    Environment & Weather Ratings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        IP Rating
                      </label>
                      <input
                        type="text"
                        value={environmentProfile.ip_rating}
                        onChange={(e) => setEnvironmentProfile({ ...environmentProfile, ip_rating: e.target.value })}
                        placeholder="e.g. IP65"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-3 mt-6">
                      <input
                        type="checkbox"
                        id="outdoor_approved_asset"
                        checked={environmentProfile.manufacturer_outdoor_approved}
                        onChange={(e) => setEnvironmentProfile({ ...environmentProfile, manufacturer_outdoor_approved: e.target.checked })}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="outdoor_approved_asset" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Manufacturer Outdoor Approved (Weatherproof)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 mt-6">
                      <input
                        type="checkbox"
                        id="requires_cover_asset"
                        checked={environmentProfile.requires_weather_cover}
                        onChange={(e) => setEnvironmentProfile({ ...environmentProfile, requires_weather_cover: e.target.checked })}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="requires_cover_asset" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Requires Weather Cover
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-500" />
                    Recommended Maintenance Schedule
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Set the baseline maintenance plan that will be applied to all physical units of this model.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maintenance Interval (Months)
                      </label>
                      <input
                        type="number"
                        value={maintenancePlan.interval_value}
                        onChange={(e) => setMaintenancePlan({ ...maintenancePlan, interval_value: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">Set to 0 if no scheduled maintenance is required.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                    Supported Deployment Modes
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Select the physical deployment and rigging configurations supported by this model.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deploymentModes.map((mode) => (
                      <label key={mode.id} className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={!!selectedModes[mode.id]}
                          onChange={(e) => setSelectedModes({ ...selectedModes, [mode.id]: e.target.checked })}
                          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">{mode.name}</span>
                          <span className="block text-xs text-gray-500">{mode.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/inventory")}
                className="px-6 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 mr-4 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Save Asset Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
