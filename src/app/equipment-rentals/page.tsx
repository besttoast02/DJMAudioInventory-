import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { RentalGrid } from "@/components/rentals/RentalGrid";

export const metadata: Metadata = {
  title: "DJ & Audio Equipment Rentals | DJM Audio Los Angeles",
  description: "Industry-standard gear available for rent for your own events and gigs. Speakers, subwoofers, mixers, and lighting.",
};

// Next.js ISR: Revalidate every 60 seconds so inventory updates reflect quickly
export const revalidate = 60;

export default async function EquipmentRentalsPage() {
  // Fetch available rentable items from new Layer C catalog
  const { data: catalogItems, error } = await supabase
    .from("catalog_items")
    .select(`
      id,
      name,
      rental_products (
        product_models (
          manufacturers ( name ),
          equipment_categories ( name )
        )
      ),
      rate_card_prices (
        duration_type,
        price_cents
      )
    `)
    .eq("item_kind", "rental_product")
    .eq("is_active", true);

  if (error) {
    console.error("Supabase Error:", error);
  }

  // Transform data to match what RentalGrid expects
  const items = (catalogItems || []).map((ci: Record<string, unknown>) => {
    // Find daily rate
    const rateCardPrices = ci.rate_card_prices as Record<string, unknown>[];
    const dailyRateObj = rateCardPrices?.find((r) => r.duration_type === 'full_day');
    const rateCents = dailyRateObj ? (dailyRateObj.price_cents as number) : 0;
    
    // Safely extract deeply nested relations
    const rentalProducts = ci.rental_products as Record<string, unknown>[];
    const productModel = rentalProducts?.[0]?.product_models as Record<string, unknown>;
    const brandObj = productModel?.manufacturers as Record<string, string>;
    const categoryObj = productModel?.equipment_categories as Record<string, string>;
    
    const brand = brandObj?.name || "Unknown Brand";
    const category = categoryObj?.name || "Uncategorized";

    return {
      id: ci.id as string,
      name: ci.name as string,
      brand,
      category,
      rate_cents: rateCents
    };
  }).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Equipment Rentals
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Industry-standard gear available for rent for your own events, gigs, and parties. Select the items you need to build your custom package.
          </p>
        </div>
      </section>

      {/* Inventory Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <RentalGrid items={items || []} />
        </div>
      </section>
    </main>
  );
}
