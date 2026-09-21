-- Layer D: Events and Estimates
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CRM: Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_type TEXT, -- individual, corporate, agency, venue
    name TEXT NOT NULL,
    billing_address TEXT,
    tax_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT
);

-- Venues
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    website TEXT,
    parking_instructions TEXT,
    loading_dock_info TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE venue_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT, -- manager, coordinator, security
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false
);

-- Event Requests
CREATE TABLE event_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    venue_id UUID REFERENCES venues(id),
    request_source TEXT, -- website, referral, phone
    event_type TEXT, -- wedding, corporate, birthday, concert
    target_date DATE,
    guest_count INTEGER,
    status TEXT NOT NULL DEFAULT 'draft_request', -- draft_request, pending_approval, closed_won, closed_lost
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- Estimates
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_request_id UUID REFERENCES event_requests(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estimate Versions (Immutable snapshotted quotes)
CREATE TABLE estimate_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, client_approved, rejected, superseded
    valid_until DATE,
    total_cents INTEGER NOT NULL DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Estimate Lines (The snapshotted quoted items)
CREATE TABLE estimate_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_version_id UUID NOT NULL REFERENCES estimate_versions(id) ON DELETE CASCADE,
    source_catalog_item_id UUID REFERENCES catalog_items(id),
    source_package_version_id UUID REFERENCES package_versions(id),
    item_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    rate_cents INTEGER NOT NULL,
    duration_type TEXT,
    duration_quantity NUMERIC,
    unit_price_cents INTEGER NOT NULL,
    discount_cents INTEGER DEFAULT 0,
    tax_treatment TEXT,
    line_total_cents INTEGER NOT NULL,
    internal_cost_estimate_cents INTEGER,
    sort_order INTEGER DEFAULT 0
);

-- Events (Operational phase)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    estimate_version_id UUID REFERENCES estimate_versions(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    venue_id UUID REFERENCES venues(id),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'deposit_paid', -- allocated, in_progress, completed, invoiced, paid_in_full, cancelled
    event_start TIMESTAMPTZ,
    event_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event Segments
CREATE TABLE event_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    segment_type TEXT NOT NULL, -- load_in, setup, performance, breakdown, load_out
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    notes TEXT
);

-- Event Status History
CREATE TABLE event_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory Pool Reservations (Stage 1 Allocation)
CREATE TABLE inventory_pool_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rental_product_id UUID NOT NULL REFERENCES catalog_items(id), -- Only items of kind 'rental_product'
    quantity INTEGER NOT NULL,
    possession_start TIMESTAMPTZ NOT NULL,
    possession_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asset Reservations (Stage 2 Allocation)
CREATE TABLE asset_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id),
    inventory_pool_reservation_id UUID REFERENCES inventory_pool_reservations(id),
    possession_start TIMESTAMPTZ NOT NULL,
    possession_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'reserved', -- reserved, active, fulfilled, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Exclusion constraint to prevent overlapping reservations for the same asset would go here
    EXCLUDE USING gist (
        asset_id WITH =,
        tstzrange(possession_start, possession_end) WITH &&
    )
);

-- Crew Assignments
CREATE TABLE crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- auth.users
    role TEXT NOT NULL,
    call_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned', -- assigned, confirmed, checked_in, completed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Outbox and Receipts (For integrations)
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    available_after TIMESTAMPTZ DEFAULT now(),
    attempt_count INTEGER DEFAULT 0,
    processed_at TIMESTAMPTZ,
    failure_reason TEXT
);

CREATE TABLE webhook_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    external_event_id TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT now(),
    processing_status TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    last_error TEXT,
    UNIQUE (provider, external_event_id)
);
