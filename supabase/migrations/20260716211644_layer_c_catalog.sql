-- Layer C: Commercial Catalog

-- Unified Catalog Items
CREATE TABLE catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_kind TEXT NOT NULL, -- rental_product, labor_service, managed_service, package, delivery_fee, damage_waiver, discount, custom_fee
    name TEXT NOT NULL,
    description TEXT,
    customer_description TEXT,
    internal_description TEXT,
    tax_category TEXT,
    revenue_category TEXT,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rental Products (The promise, mapping to models or configs)
CREATE TABLE rental_products (
    catalog_item_id UUID PRIMARY KEY REFERENCES catalog_items(id) ON DELETE CASCADE,
    product_model_id UUID REFERENCES product_models(id),
    system_configuration_id UUID REFERENCES system_configurations(id),
    fulfillment_quantity INTEGER DEFAULT 1,
    substitution_group_id UUID, -- References equipment_categories or a new substitution_groups table
    customer_selectable BOOLEAN DEFAULT true,
    requires_operator BOOLEAN DEFAULT false,
    default_setup_minutes INTEGER,
    default_strike_minutes INTEGER
);

-- Labor Services
CREATE TABLE labor_services (
    catalog_item_id UUID PRIMARY KEY REFERENCES catalog_items(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- dj, foh_engineer, stagehand, lighting_operator, etc.
    minimum_hours NUMERIC,
    overtime_threshold_hours NUMERIC,
    overtime_multiplier NUMERIC DEFAULT 1.5,
    travel_policy TEXT,
    equipment_included TEXT,
    default_preparation_minutes INTEGER,
    default_setup_strike_minutes INTEGER
);

-- Managed Services
CREATE TABLE managed_services (
    catalog_item_id UUID PRIMARY KEY REFERENCES catalog_items(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- dj_performance, complete_ceremony, full_production
    deliverables TEXT
);

-- Rate Cards
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Standard retail, Preferred client, Internal costing
    description TEXT,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate Card Prices
CREATE TABLE rate_card_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    duration_type TEXT NOT NULL, -- hour, half_day, full_day, weekend, week, custom_period, flat_event
    duration_quantity NUMERIC DEFAULT 1,
    price_cents INTEGER NOT NULL,
    minimum_charge_cents INTEGER,
    included_hours NUMERIC,
    overtime_rate_cents INTEGER,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_to TIMESTAMPTZ,
    location_id UUID, -- For region-specific pricing
    day_of_week_rule TEXT, -- e.g., 'weekend_only'
    minimum_quantity INTEGER,
    maximum_quantity INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Packages
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Package Versions (Immutable once quoted)
CREATE TABLE package_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Package Components
CREATE TABLE package_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_version_id UUID NOT NULL REFERENCES package_versions(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    included_quantity INTEGER DEFAULT 1,
    included_hours NUMERIC,
    is_required BOOLEAN DEFAULT true,
    is_customer_visible BOOLEAN DEFAULT true,
    default_price_behavior TEXT, -- included, extra_charge, discounted
    internal_estimated_cost_cents INTEGER,
    sort_order INTEGER DEFAULT 0
);

-- Package Rules / Options
CREATE TABLE package_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_version_id UUID NOT NULL REFERENCES package_versions(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL, -- requirement, exclusion, limit
    description TEXT
);
