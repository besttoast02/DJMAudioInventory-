-- Layer A: Equipment Specifications

-- Organizations (Tenant isolation)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand_logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    billing_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment Categories (Hierarchical)
CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_category_id UUID REFERENCES equipment_categories(id),
    name TEXT NOT NULL,
    category_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Manufacturers
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    support_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Models (Base capabilities)
CREATE TABLE product_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES equipment_categories(id),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    model_name TEXT NOT NULL,
    display_name TEXT,
    model_number TEXT,
    description TEXT,
    discontinued_at DATE,
    manufacturer_url TEXT,
    manual_storage_path TEXT,
    additional_specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    archived_at TIMESTAMPTZ
);

-- Extension: Speaker Specifications
CREATE TABLE speaker_specs (
    product_model_id UUID PRIMARY KEY REFERENCES product_models(id) ON DELETE CASCADE,
    continuous_rms_power_watts INTEGER,
    program_power_watts INTEGER,
    peak_power_watts INTEGER,
    amplifier_power_watts INTEGER,
    maximum_spl_db NUMERIC,
    freq_response_low_hz INTEGER,
    freq_response_high_hz INTEGER,
    freq_response_tolerance TEXT, -- e.g., "-3dB"
    horizontal_dispersion_deg INTEGER,
    vertical_dispersion_deg INTEGER,
    sensitivity TEXT,
    crossover_info TEXT,
    cabinet_type TEXT,
    is_powered BOOLEAN DEFAULT true,
    weight_lbs NUMERIC,
    dimensions_in TEXT,
    input_connections TEXT,
    output_connections TEXT
);

-- Extension: Lighting Specifications
CREATE TABLE lighting_fixture_specs (
    product_model_id UUID PRIMARY KEY REFERENCES product_models(id) ON DELETE CASCADE,
    fixture_type TEXT, -- wash, spot, beam, laser, special_fx
    light_source_type TEXT,
    power_consumption_watts INTEGER,
    lumens NUMERIC,
    pan_range_deg INTEGER,
    tilt_range_deg INTEGER,
    beam_angle_deg NUMERIC,
    dmx_channel_modes TEXT,
    dmx_connector_type TEXT,
    power_connector_type TEXT,
    ip_rating TEXT,
    outdoor_use_limitations TEXT,
    weight_lbs NUMERIC,
    rigging_points TEXT,
    included_safety_hardware TEXT
);

-- Extension: Mixing Console Specifications
CREATE TABLE mixing_console_specs (
    product_model_id UUID PRIMARY KEY REFERENCES product_models(id) ON DELETE CASCADE,
    mixer_class TEXT, -- analog, digital, controller
    input_count INTEGER,
    output_count INTEGER,
    local_preamps INTEGER,
    digital_stage_box_capacity INTEGER,
    sample_rates TEXT,
    network_protocols TEXT, -- Dante, AES50
    recording_capability TEXT,
    usb_interface_channels TEXT,
    expansion_card_type TEXT,
    power_consumption_watts INTEGER,
    rack_size_u INTEGER,
    supported_software TEXT
);

-- Deployment Modes Dictionary
CREATE TABLE deployment_modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Speaker stand", "Ground stacked", "Flown individually"
    description TEXT
);

-- Model Deployment Capabilities
CREATE TABLE model_deployment_modes (
    product_model_id UUID NOT NULL REFERENCES product_models(id) ON DELETE CASCADE,
    deployment_mode_id UUID NOT NULL REFERENCES deployment_modes(id),
    is_manufacturer_approved BOOLEAN DEFAULT true,
    required_accessory_model_id UUID REFERENCES product_models(id),
    maximum_units INTEGER,
    minimum_safety_requirements TEXT,
    instructions TEXT,
    source_document_path TEXT,
    PRIMARY KEY (product_model_id, deployment_mode_id)
);

-- Weather / Environment Profiles
CREATE TABLE model_environment_profiles (
    product_model_id UUID PRIMARY KEY REFERENCES product_models(id) ON DELETE CASCADE,
    ip_rating TEXT,
    minimum_operating_temp_f NUMERIC,
    maximum_operating_temp_f NUMERIC,
    direct_sun_rating TEXT,
    rain_exposure_policy TEXT, -- not_permitted, covered_outdoor_only, temporary_light_exposure, manufacturer_outdoor_rated, unknown
    humidity_limit TEXT,
    wind_limit TEXT,
    manufacturer_outdoor_approved BOOLEAN DEFAULT false,
    requires_weather_cover BOOLEAN DEFAULT false,
    internal_performance_rating TEXT,
    notes TEXT,
    evidence_type TEXT,
    source_document_path TEXT
);

-- System Configurations
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    intended_use TEXT,
    indoor_outdoor_suitability TEXT,
    deployment_instructions TEXT,
    verification_status TEXT, -- tested, theoretical, manufacturer_recommended
    max_recommended_audience_range TEXT,
    setup_notes TEXT,
    safety_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- System Configuration Components
CREATE TABLE system_configuration_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    product_model_id UUID NOT NULL REFERENCES product_models(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    position_or_role TEXT,
    is_required BOOLEAN DEFAULT true,
    parent_component_id UUID REFERENCES system_configuration_components(id),
    notes TEXT
);

-- Coverage Profiles (Scenarios)
CREATE TABLE coverage_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_model_id UUID REFERENCES product_models(id), -- Either model OR config must be set
    system_configuration_id UUID REFERENCES system_configurations(id),
    indoor_outdoor TEXT,
    application_type TEXT, -- speech, background_music, live_band, dj_dance
    target_spl_db NUMERIC,
    max_throw_distance_ft NUMERIC,
    audience_width_ft NUMERIC,
    audience_depth_ft NUMERIC,
    estimated_min_crowd INTEGER,
    estimated_max_crowd INTEGER,
    placement_height_ft NUMERIC,
    deployment_method TEXT,
    confidence_level TEXT,
    source_type TEXT, -- field_observed, manufacturer_spec, simulation
    notes TEXT
);
