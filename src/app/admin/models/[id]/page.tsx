"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Package, DollarSign, Users, Lightbulb, CheckSquare, CloudRain, Wrench, FileText, Trash2 } from "lucide-react";

export default function EditProductModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  
  const [modelData, setModelData] = useState<any>(null);
  const [catalogItemId, setCatalogItemId] = useState<string | null>(null);
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
  
  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  
  // Specs
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
  
  // Coverage Profile
  const [coverageId, setCoverageId] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<any>({
    estimated_min_crowd: 0,
    estimated_max_crowd: 0,
    max_throw_distance_ft: 0,
    target_spl_db: 0,
  });
  
  // Deployment Modes
  const [deploymentModes, setDeploymentModes] = useState<any[]>([]);
  const [selectedModes, setSelectedModes] = useState<Record<string, boolean>>({});
  
  // Accessories
  const [allModels, setAllModels] = useState<any[]>([]);
  const [accessoryRules, setAccessoryRules] = useState<any[]>([]);
  
  // Rate Cards
  const [rates, setRates] = useState({
    full_day: 0,
    full_week: 0
  });

  useEffect(() => {
    async function fetchModel() {
      try {
        const { data, error } = await supabase
          .from("product_models")
          .select(`
            id,
            category_id,
            model_name,
            manual_storage_path,
            manufacturers ( name ),
            rental_products (
              catalog_items (
                id,
                rate_card_prices (
                  id,
                  price_cents,
                  duration_type
                )
              )
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setModelData(data);
          setCategoryId(data.category_id || "");
          setManualUrl(data.manual_storage_path || "");
          
          const rentalProd = data.rental_products?.[0];
          const rawCatalogItem = rentalProd?.catalog_items;
          const catalogItem = Array.isArray(rawCatalogItem) ? rawCatalogItem[0] : rawCatalogItem;
          
          if (catalogItem) {
            setCatalogItemId(catalogItem.id);
            const ratePrices = catalogItem.rate_card_prices || [];
            
            const daily = ratePrices.find((r: any) => r.duration_type === "full_day");
            const weekly = ratePrices.find((r: any) => r.duration_type === "full_week");
            
            setRates({
              full_day: daily ? daily.price_cents : 0,
              full_week: weekly ? weekly.price_cents : 0
            });
          }
        }
        
        // Fetch categories for the tree
        const { data: catData } = await supabase
          .from("equipment_categories")
          .select("*")
          .order("name");
          
        if (catData) setCategories(catData);

        // Fetch speaker specs
        const { data: specsData } = await supabase
          .from("speaker_specs")
          .select("*")
          .eq("product_model_id", id)
          .single();
          
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
        const { data: lightData } = await supabase
          .from("lighting_fixture_specs")
          .select("*")
          .eq("product_model_id", id)
          .single();
          
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
        const { data: covData } = await supabase
          .from("coverage_profiles")
          .select("*")
          .eq("product_model_id", id)
          .limit(1)
          .single();
          
        if (covData) {
          setCoverageId(covData.id);
          setCoverage({
            estimated_min_crowd: covData.estimated_min_crowd || 0,
            estimated_max_crowd: covData.estimated_max_crowd || 0,
            max_throw_distance_ft: covData.max_throw_distance_ft || 0,
            target_spl_db: covData.target_spl_db || 0,
          });
        }
        
        // Fetch environment profile
        const { data: envData } = await supabase
          .from("model_environment_profiles")
          .select("*")
          .eq("product_model_id", id)
          .single();
          
        if (envData) {
          setEnvironmentProfile({
            manufacturer_outdoor_approved: envData.manufacturer_outdoor_approved || false,
            requires_weather_cover: envData.requires_weather_cover || false,
            ip_rating: envData.ip_rating || "",
          });
        }
        
        // Fetch maintenance plan
        const { data: maintData } = await supabase
          .from("maintenance_plans")
          .select("*")
          .eq("target_type", "model")
          .eq("target_id", id)
          .limit(1)
          .single();
          
        if (maintData) {
          setMaintenancePlanId(maintData.id);
          setMaintenancePlan({
            interval_value: maintData.interval_value || 0,
            trigger_type: maintData.trigger_type || "calendar_interval"
          });
        }
        
        // Fetch all deployment modes
        const { data: dmData } = await supabase
          .from("deployment_modes")
          .select("*")
          .order("name");
        if (dmData) setDeploymentModes(dmData);
        
        // Fetch existing model_deployment_modes
        const { data: mdmData } = await supabase
          .from("model_deployment_modes")
          .select("deployment_mode_id")
          .eq("product_model_id", id);
          
        if (mdmData) {
          const modeMap: Record<string, boolean> = {};
          mdmData.forEach((m) => {
            modeMap[m.deployment_mode_id] = true;
          });
          setSelectedModes(modeMap);
        }

        // Fetch all models for accessories dropdown
        const { data: allModelsData } = await supabase
          .from("product_models")
          .select("id, name, manufacturer, model_number")
          .order("name");
        if (allModelsData) setAllModels(allModelsData);

        // Fetch existing accessory rules
        const { data: rulesData } = await supabase
          .from("model_accessory_rules")
          .select("*")
          .eq("product_model_id", id);
        if (rulesData) setAccessoryRules(rulesData);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load model details.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchModel();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogItemId) {
      setError("This model is not linked to a catalog item. Cannot update prices.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      // Update the category and manual url
      const { error: catUpdateError } = await supabase
        .from("product_models")
        .update({ 
          category_id: categoryId || null,
          manual_storage_path: manualUrl
        })
        .eq("id", id);
      
      if (catUpdateError) throw catUpdateError;

      // Save speaker specs if it's a speaker category
      if (isSpeakerCategory()) {
        const { error: specsError } = await supabase
          .from("speaker_specs")
          .upsert({
            product_model_id: id,
            continuous_rms_power_watts: speakerSpecs.continuous_rms_power_watts,
            peak_power_watts: speakerSpecs.peak_power_watts,
            maximum_spl_db: speakerSpecs.maximum_spl_db,
            horizontal_dispersion_deg: speakerSpecs.horizontal_dispersion_deg,
            vertical_dispersion_deg: speakerSpecs.vertical_dispersion_deg,
            weight_lbs: speakerSpecs.weight_lbs
          });
        if (specsError) throw specsError;
      }
      
      // Save lighting specs if it's a lighting category
      if (isLightingCategory()) {
        const { error: lightError } = await supabase
          .from("lighting_fixture_specs")
          .upsert({
            product_model_id: id,
            fixture_type: lightingSpecs.fixture_type,
            power_consumption_watts: lightingSpecs.power_consumption_watts,
            lumens: lightingSpecs.lumens,
            ip_rating: lightingSpecs.ip_rating,
            weight_lbs: lightingSpecs.weight_lbs
          });
        if (lightError) throw lightError;
      }

      // Save Coverage Profile
      if (isSpeakerCategory()) {
        const covPayload = {
          product_model_id: id,
          estimated_min_crowd: coverage.estimated_min_crowd,
          estimated_max_crowd: coverage.estimated_max_crowd,
          max_throw_distance_ft: coverage.max_throw_distance_ft,
          target_spl_db: coverage.target_spl_db,
          organization_id: "61306565-9c0b-4ef8-bb6d-6bb9bd380a11" // TODO: dynamic org ID
        };
        
        if (coverageId) {
          const { error: covError } = await supabase
            .from("coverage_profiles")
            .update(covPayload)
            .eq("id", coverageId);
          if (covError) throw covError;
        } else {
          const { error: covError } = await supabase
            .from("coverage_profiles")
            .insert(covPayload);
          if (covError) throw covError;
        }
      }
      
      // Upsert Environment Profile
      const { error: envError } = await supabase
        .from("model_environment_profiles")
        .upsert({
          product_model_id: id,
          manufacturer_outdoor_approved: environmentProfile.manufacturer_outdoor_approved,
          requires_weather_cover: environmentProfile.requires_weather_cover,
          ip_rating: environmentProfile.ip_rating
        });
      if (envError) throw envError;

      // Upsert Maintenance Plan
      const maintPayload = {
        organization_id: "61306565-9c0b-4ef8-bb6d-6bb9bd380a11", // TODO: dynamic org ID
        target_type: "model",
        target_id: id,
        name: `${modelData?.model_name || "Model"} Standard Maintenance`,
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
      
      // Save Deployment Modes
      await supabase.from("model_deployment_modes").delete().eq("product_model_id", id);
      
      const modesToInsert = Object.keys(selectedModes)
        .filter((modeId) => selectedModes[modeId])
        .map((modeId) => ({
          product_model_id: id,
          deployment_mode_id: modeId,
          is_manufacturer_approved: true
        }));
        
      if (modesToInsert.length > 0) {
        const { error: mdmError } = await supabase
          .from("model_deployment_modes")
          .insert(modesToInsert);
        if (mdmError) throw mdmError;
      }

      // Save Accessory Rules
      await supabase.from("model_accessory_rules").delete().eq("product_model_id", id);
      const rulesToInsert = accessoryRules.filter(r => r.accessory_model_id).map(rule => ({
        product_model_id: id,
        accessory_model_id: rule.accessory_model_id,
        is_required: rule.is_required,
        quantity_multiplier: rule.quantity_multiplier,
        condition_description: rule.condition_description
      }));
      
      if (rulesToInsert.length > 0) {
        const { error: rulesError } = await supabase.from("model_accessory_rules").insert(rulesToInsert);
        if (rulesError) throw rulesError;
      }

      // First get the standard rate card ID
      const { data: rcData, error: rcError } = await supabase
        .from("rate_cards")
        .select("id")
        .eq("name", "Standard Retail")
        .limit(1)
        .single();
        
      if (rcError) throw rcError;
      const rateCardId = rcData.id;

      // Upsert Daily Rate
      const { error: dailyErr } = await supabase
        .from("rate_card_prices")
        .upsert({
          rate_card_id: rateCardId,
          catalog_item_id: catalogItemId,
          duration_type: "full_day",
          price_cents: rates.full_day
        }, { onConflict: "rate_card_id, catalog_item_id, duration_type" });
        
      if (dailyErr) throw dailyErr;

      // Upsert Weekly Rate
      const { error: weeklyErr } = await supabase
        .from("rate_card_prices")
        .upsert({
          rate_card_id: rateCardId,
          catalog_item_id: catalogItemId,
          duration_type: "full_week",
          price_cents: rates.full_week
        }, { onConflict: "rate_card_id, catalog_item_id, duration_type" });

      if (weeklyErr) throw weeklyErr;
      
      router.push("/admin/models");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update prices.");
      }
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

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

  const addAccessoryRule = () => {
    setAccessoryRules([
      ...accessoryRules,
      {
        id: "temp-" + Date.now(),
        accessory_model_id: "",
        is_required: false,
        quantity_multiplier: 1,
        condition_description: ""
      }
    ]);
  };

  const updateAccessoryRule = (index: number, field: string, value: any) => {
    const newRules = [...accessoryRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setAccessoryRules(newRules);
  };

  const removeAccessoryRule = (index: number) => {
    const newRules = [...accessoryRules];
    newRules.splice(index, 1);
    setAccessoryRules(newRules);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center">
        <Link href="/admin/models" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Models
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {modelData?.manufacturers?.name} {modelData?.model_name}
            </h1>
            <p className="text-gray-500 mt-1">Manage standard retail pricing and specifications.</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    Proper categorization (e.g. Audio → Speaker → PA Speaker) unlocks specific technical specification fields and deployment rules for this model.
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
                  <p className="text-xs text-gray-500 mt-2">Link to the manufacturer&apos;s manual or documentation.</p>
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
                    id="outdoor_approved"
                    checked={environmentProfile.manufacturer_outdoor_approved}
                    onChange={(e) => setEnvironmentProfile({ ...environmentProfile, manufacturer_outdoor_approved: e.target.checked })}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="outdoor_approved" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manufacturer Outdoor Approved (Weatherproof)
                  </label>
                </div>
                <div className="flex items-center space-x-3 mt-6">
                  <input
                    type="checkbox"
                    id="requires_cover"
                    checked={environmentProfile.requires_weather_cover}
                    onChange={(e) => setEnvironmentProfile({ ...environmentProfile, requires_weather_cover: e.target.checked })}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="requires_cover" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <DollarSign className="w-5 h-5 text-blue-500" />
                Standard Retail Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Rate ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={rates.full_day / 100}
                      onChange={(e) => setRates({ ...rates, full_day: Math.round(parseFloat(e.target.value) * 100) })}
                      className="w-full pl-8 px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weekly Rate ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={rates.full_week / 100}
                      onChange={(e) => setRates({ ...rates, full_week: Math.round(parseFloat(e.target.value) * 100) })}
                      className="w-full pl-8 px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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

            <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Accessories & Dependencies
                  </h3>
                  <p className="text-sm text-gray-500">Define required or optional accessories for this product model.</p>
                </div>
                <button
                  type="button"
                  onClick={addAccessoryRule}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                >
                  + Add Accessory
                </button>
              </div>
              
              {accessoryRules.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 text-gray-500">
                  No accessories defined.
                </div>
              ) : (
                <div className="space-y-4">
                  {accessoryRules.map((rule, index) => (
                    <div key={rule.id || index} className="p-4 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Accessory Model</label>
                        <select
                          value={rule.accessory_model_id || ""}
                          onChange={(e) => updateAccessoryRule(index, "accessory_model_id", e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a model...</option>
                          {allModels.map(m => (
                            <option key={m.id} value={m.id}>{m.manufacturer} {m.model_number} - {m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-24">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Qty</label>
                        <input
                          type="number"
                          value={rule.quantity_multiplier}
                          onChange={(e) => updateAccessoryRule(index, "quantity_multiplier", parseFloat(e.target.value))}
                          step="0.5"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-full md:w-32 flex items-center mt-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.is_required}
                            onChange={(e) => updateAccessoryRule(index, "is_required", e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Required</span>
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Condition (Optional)</label>
                        <input
                          type="text"
                          value={rule.condition_description || ""}
                          onChange={(e) => updateAccessoryRule(index, "condition_description", e.target.value)}
                          placeholder="e.g. Only when ground stacked"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end mb-1">
                        <button
                          type="button"
                          onClick={() => removeAccessoryRule(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/models")}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 mr-4 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Pricing</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
