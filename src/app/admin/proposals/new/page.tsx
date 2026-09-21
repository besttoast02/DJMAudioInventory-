import { supabaseAdmin } from "@/lib/supabase-admin";
import ProposalBuilder from "./ProposalBuilder";

export const revalidate = 0; // Always fetch fresh inventory

export default async function NewProposalPage() {
  // Fetch all items from the inventory to pass to the client builder
  const { data: inventory, error } = await supabaseAdmin
    .from("items")
    .select("barcode, name, category, daily_rate, brand, model")
    .order("name");

  if (error) {
    console.error("Error fetching inventory for proposal builder:", error);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Create New Proposal</h1>
        <p className="text-gray-400 mt-2">
          Construct a custom DJ or Audio Engineering setup, assign it to a client, and generate a 3D proposal link.
        </p>
      </div>

      <ProposalBuilder inventory={inventory || []} />
    </div>
  );
}
