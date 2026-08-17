-- Views and Functions for DJM Audio Architecture

-- 1. v_asset_usage_totals
CREATE OR REPLACE VIEW v_asset_usage_totals AS
SELECT 
    a.id as asset_id,
    COUNT(u.id) as total_events,
    COALESCE(SUM(u.operating_hours), 0) as total_operating_hours,
    COALESCE(SUM(u.transport_cycles), 0) as total_transport_cycles
FROM assets a
LEFT JOIN asset_usage_sessions u ON a.id = u.asset_id
GROUP BY a.id;

-- 2. v_asset_remaining_life
CREATE OR REPLACE VIEW v_asset_remaining_life AS
SELECT 
    a.id as asset_id,
    a.asset_tag,
    pm.model_name,
    f.expected_lifetime_events,
    f.expected_lifetime_operating_hours,
    f.expected_lifetime_transport_cycles,
    u.total_events,
    u.total_operating_hours,
    u.total_transport_cycles,
    (f.expected_lifetime_events - u.total_events) as remaining_events,
    (f.expected_lifetime_operating_hours - u.total_operating_hours) as remaining_operating_hours,
    (f.expected_lifetime_transport_cycles - u.total_transport_cycles) as remaining_transport_cycles,
    CASE 
        WHEN f.expected_lifetime_operating_hours > 0 
        THEN GREATEST(0, (f.expected_lifetime_operating_hours - u.total_operating_hours) / f.expected_lifetime_operating_hours::NUMERIC * 100)
        ELSE NULL
    END as operational_life_percentage
FROM assets a
JOIN product_models pm ON a.product_model_id = pm.id
LEFT JOIN asset_financial_profiles f ON a.id = f.asset_id
LEFT JOIN v_asset_usage_totals u ON a.id = u.asset_id;

-- 3. v_assets_maintenance_due
CREATE OR REPLACE VIEW v_assets_maintenance_due AS
SELECT 
    a.id as asset_id,
    a.asset_tag,
    a.inventory_status,
    mp.id as maintenance_plan_id,
    mp.name as maintenance_plan_name,
    mp.trigger_type,
    mp.interval_value
FROM assets a
JOIN maintenance_plans mp ON mp.target_id = a.product_model_id OR mp.target_id = a.id
WHERE a.inventory_status = 'maintenance_due';

-- 4. v_asset_current_value (Book Value calculation)
CREATE OR REPLACE VIEW v_asset_current_value AS
SELECT 
    a.id as asset_id,
    f.original_cost_basis_cents,
    f.residual_value_cents,
    f.useful_life_months,
    a.in_service_date,
    -- Simple straight line depreciation calculation
    CASE 
        WHEN a.in_service_date IS NULL THEN f.original_cost_basis_cents
        ELSE GREATEST(
            f.residual_value_cents,
            f.original_cost_basis_cents - (
                (f.original_cost_basis_cents - f.residual_value_cents) / 
                NULLIF(f.useful_life_months, 0)::NUMERIC
            ) * (EXTRACT(YEAR FROM age(CURRENT_DATE, a.in_service_date)) * 12 + EXTRACT(MONTH FROM age(CURRENT_DATE, a.in_service_date)))
        )::INTEGER
    END as book_value_cents
FROM assets a
JOIN asset_financial_profiles f ON a.id = f.asset_id;

-- 5. v_inventory_availability
CREATE OR REPLACE VIEW v_inventory_availability AS
SELECT 
    a.id as asset_id,
    a.product_model_id,
    a.organization_id,
    a.inventory_status,
    a.is_rentable
FROM assets a
WHERE a.inventory_status IN ('available', 'reserved') 
  AND a.is_rentable = true;
