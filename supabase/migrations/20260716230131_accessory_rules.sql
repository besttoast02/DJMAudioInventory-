-- Smart Accessory Rules
CREATE TABLE model_accessory_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_model_id UUID NOT NULL REFERENCES product_models(id) ON DELETE CASCADE,
    accessory_model_id UUID NOT NULL REFERENCES product_models(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    quantity_multiplier NUMERIC DEFAULT 1.0, -- e.g., 1 stand per 1 speaker
    condition_description TEXT, -- e.g., "Only required if deployed on floor"
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: We already have required_accessory_model_id in model_deployment_modes for mode-specific requirements
