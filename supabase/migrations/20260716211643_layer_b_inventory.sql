-- Layer B: Physical Inventory

-- Storage Locations
CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors (Where equipment was purchased)
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assets (Physical Units)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_model_id UUID NOT NULL REFERENCES product_models(id),
    asset_tag TEXT,
    serial_number TEXT,
    ownership_type TEXT NOT NULL DEFAULT 'owned', -- owned, leased, subrented
    purchase_date DATE,
    in_service_date DATE,
    purchase_price_cents INTEGER,
    purchase_vendor_id UUID REFERENCES vendors(id),
    warranty_expiration_date DATE,
    current_location_id UUID REFERENCES storage_locations(id),
    inventory_status TEXT NOT NULL DEFAULT 'available', -- available, reserved, checked_out, in_service, maintenance_due, under_repair, quarantined, lost, sold, retired
    condition_grade TEXT NOT NULL DEFAULT 'new', -- new, excellent, good, fair, poor, broken
    is_rentable BOOLEAN DEFAULT true,
    is_sellable BOOLEAN DEFAULT false,
    sale_asking_price_cents INTEGER,
    retired_at TIMESTAMPTZ,
    retirement_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Asset Identifiers (RFID, Old tags, Barcodes)
CREATE TABLE asset_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    identifier_type TEXT NOT NULL, -- barcode, rfid, qr_code
    identifier_value TEXT NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

-- Asset Status History
CREATE TABLE asset_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID, -- Usually references auth.users(id)
    reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- Asset Location History
CREATE TABLE asset_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    previous_location_id UUID REFERENCES storage_locations(id),
    new_location_id UUID REFERENCES storage_locations(id),
    moved_by UUID,
    moved_at TIMESTAMPTZ DEFAULT now()
);

-- Asset Attachments (Manuals, receipts, photos)
CREATE TABLE asset_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    attachment_type TEXT NOT NULL, -- receipt, condition_photo, manual, warranty
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT
);

-- Asset Usage Sessions
CREATE TABLE asset_usage_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    event_id UUID, -- References events(id) from Layer D
    checked_out_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    operating_hours NUMERIC,
    use_count INTEGER DEFAULT 1,
    transport_cycles INTEGER DEFAULT 1,
    deployment_environment TEXT,
    weather_exposure TEXT,
    operator_id UUID,
    condition_before TEXT,
    condition_after TEXT,
    damage_reported BOOLEAN DEFAULT false,
    notes TEXT
);

-- Condition Inspections (Routine or post-event)
CREATE TABLE condition_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    inspected_at TIMESTAMPTZ DEFAULT now(),
    inspector_id UUID,
    condition_grade TEXT NOT NULL,
    passed_inspection BOOLEAN NOT NULL,
    notes TEXT
);

-- Damage Incidents
CREATE TABLE damage_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    usage_session_id UUID REFERENCES asset_usage_sessions(id),
    reported_at TIMESTAMPTZ DEFAULT now(),
    reporter_id UUID,
    severity TEXT, -- minor, major, critical
    description TEXT,
    repair_estimate_cents INTEGER,
    was_customer_billed BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ
);

-- Maintenance Plans
CREATE TABLE maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- model, category, specific_asset
    target_id UUID NOT NULL, -- UUID of the model, category, or asset
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- calendar_interval, operating_hours, transport_cycles, event_count
    interval_value NUMERIC NOT NULL, -- e.g., 6 (months), 2000 (hours)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Maintenance Plan Tasks
CREATE TABLE maintenance_plan_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Maintenance Logs
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_plan_id UUID REFERENCES maintenance_plans(id),
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL, -- scheduled, break_fix, cosmetic
    technician_id UUID,
    work_performed TEXT NOT NULL,
    parts_used TEXT,
    labor_hours NUMERIC,
    internal_cost_cents INTEGER,
    external_cost_cents INTEGER,
    condition_before TEXT,
    condition_after TEXT,
    passed_inspection BOOLEAN,
    return_to_service_date DATE,
    documentation_path TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Financial Profiles (Depreciation)
CREATE TABLE asset_financial_profiles (
    asset_id UUID PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
    original_cost_basis_cents INTEGER NOT NULL,
    residual_value_cents INTEGER DEFAULT 0,
    accounting_depreciation_method TEXT DEFAULT 'straight_line',
    useful_life_months INTEGER,
    expected_lifetime_events INTEGER,
    expected_lifetime_operating_hours INTEGER,
    expected_lifetime_transport_cycles INTEGER,
    default_repair_threshold_cents INTEGER,
    replacement_cost_estimate_cents INTEGER
);

-- Valuation Snapshots
CREATE TABLE valuation_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    book_value_cents INTEGER,
    operational_value_cents INTEGER,
    market_value_cents INTEGER,
    assessor_id UUID,
    notes TEXT
);
