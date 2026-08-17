import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for use in Server Components and API routes.
 * 
 * This module is marked with `server-only` to guarantee it never leaks
 * the Supabase SDK into client JavaScript bundles. All admin dashboard
 * pages and server-side data-fetching should import from here instead
 * of `@/lib/supabase`.
 *
 * Falls back to the anon key when a service role key is not available.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
