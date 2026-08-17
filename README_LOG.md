# Log: Codebase Performance Optimizations & Migration Fixes

## August 14, 2026

We completed a codebase optimization pass to improve page load speed/LCP and dynamic bundling, and resolved TypeScript compilation blocks to finalize the migration build.

### Changes Implemented:

1. **V2 Next.js Image Optimization**:
   - Updated `next.config.ts` to register `images.unsplash.com` remote patterns.
   - Migrated HTML `<img>` elements to optimized Next.js `<Image>` components in:
     - `src/components/templates/ServicePageTemplate.tsx` (Service subpages)
     - `src/components/sections/Hero.tsx` (Main hero banner with priority load)
     - `src/components/sections/CaseStudies.tsx` (Lazy-loaded card grid)

2. **Root Layout Dynamic Bundling**:
   - Created `src/components/layout/ClientChatbot.tsx` as a Client Component wrapper.
   - Refactored `src/app/layout.tsx` to statically load the ClientChatbot wrapper, which dynamically imports the heavy AI Chatbot with `{ ssr: false }`, significantly reducing initial HTML weight and server-side render blocks.

3. **TypeScript Compilation Fixes**:
   - Removed duplicate `residual_value_cents` property initialization in `src/app/admin/inventory/[id]/page.tsx`.
   - Cast/normalized relational arrays queried from Supabase into single objects where single records are expected in:
     - `src/app/admin/inventory/[id]/page.tsx` (for `product_models` and `manufacturers`).
     - `src/app/admin/models/[id]/page.tsx` (for `catalog_items`).
