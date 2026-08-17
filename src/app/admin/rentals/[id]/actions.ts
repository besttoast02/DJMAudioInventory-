"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function updateRentalStatus(rentalId: number, status: string) {
  const { error } = await supabaseAdmin
    .from("rentals")
    .update({ status })
    .eq("id", rentalId);

  if (error) {
    throw new Error(error.message);
  }

  // If returning, we need to make sure the rental_items are cleared or items marked as available again.
  // In the old system, `return_rental` changed the rental status to "returned", 
  // and changed all associated `items` back to "available".
  if (status === "returned") {
    // 1. Get all rental_items for this rental
    const { data: rentalItems } = await supabaseAdmin
      .from("rental_items")
      .select("item_id")
      .eq("rental_id", rentalId);

    if (rentalItems && rentalItems.length > 0) {
      const itemIds = rentalItems.map(ri => ri.item_id);
      
      // 2. Update items table to set status = 'available'
      await supabaseAdmin
        .from("items")
        .update({ status: "available" })
        .in("id", itemIds);
    }
  }

  if (status === "approved") {
    // 1. Get all rental_items
    const { data: rentalItems } = await supabaseAdmin
      .from("rental_items")
      .select("item_id")
      .eq("rental_id", rentalId);

    if (rentalItems && rentalItems.length > 0) {
      const itemIds = rentalItems.map(ri => ri.item_id);
      
      // 2. Update items table to set status = 'rented'
      await supabaseAdmin
        .from("items")
        .update({ status: "rented" })
        .in("id", itemIds);
    }
  }

  revalidatePath("/admin/rentals");
  revalidatePath(`/admin/rentals/${rentalId}`);
}
