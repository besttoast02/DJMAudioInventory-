import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import { ProposalClient } from "./ProposalClient";

export const revalidate = 0; // Ensure proposals are always fresh

interface ProposalPageProps {
  params: {
    id: string; // The rental ID
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  // Wait for dynamic params in Next.js 16+
  const { id } = await params;

  // Fetch the rental/proposal metadata
  const { data: proposal, error: proposalError } = await supabaseAdmin
    .from("rentals")
    .select("*")
    .eq("id", id)
    .single();

  if (proposalError || !proposal) {
    console.error("Proposal not found:", proposalError);
    notFound();
  }

  // Fetch the items associated with this proposal
  // Note: this assumes the `rental_items` table connects `rentals` to `items`.
  const { data: rentalItems, error: itemsError } = await supabaseAdmin
    .from("rental_items")
    .select(`
      quantity,
      item_barcode,
      items (
        barcode,
        name,
        category,
        daily_rate,
        type,
        brand,
        model
      )
    `)
    .eq("rental_id", id);

  if (itemsError) {
    console.error("Error fetching proposal items:", itemsError);
    // Continue anyway, it just might have no items
  }

  // Flatten the response for the client component
  // @ts-ignore (ignoring complex Supabase join types for now)
  const formattedItems = (rentalItems || []).map((ri: any) => ({
    barcode: ri.items.barcode,
    name: ri.items.name,
    category: ri.items.category,
    daily_rate: ri.items.daily_rate,
    quantity: ri.quantity
  }));

  return (
    <main className="min-h-screen bg-gray-950 pb-20">
      <ProposalClient 
        proposalId={proposal.id}
        eventName={proposal.event_name}
        clientName={proposal.client_name}
        eventDate={proposal.event_date}
        items={formattedItems}
      />
    </main>
  );
}
