-- Enable UUID extension for better order numbers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add enum types if not exists
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'cart',
        'favorite',
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'none',
        'pending',
        'packed',
        'shipped',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'none',
        'pending',
        'processing',
        'completed',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status 
ON orders(buyer_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_product_id 
ON orders(product_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
ON messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_order_id 
ON messages(order_id);

CREATE INDEX IF NOT EXISTS idx_products_status_category 
ON products(status, category);

CREATE INDEX IF NOT EXISTS idx_products_farmer_id 
ON products(farmer_id);

-- Add trigger for order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || 
                            TO_CHAR(NEW.order_date, 'YYYYMMDD') || '-' || 
                            LPAD(NEW.id::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating farmer rating
CREATE OR REPLACE FUNCTION update_farmer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE farmers
    SET avg_rating = (
        SELECT AVG(r.rating)::NUMERIC(3,2)
        FROM reviews r
        JOIN orders o ON r.order_id = o.id
        WHERE o.farmer_id = NEW.farmer_id
    )
    WHERE id = NEW.farmer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_order_number ON orders;
CREATE TRIGGER trigger_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

DROP TRIGGER IF EXISTS trigger_farmer_rating ON reviews;
CREATE TRIGGER trigger_farmer_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_farmer_rating();

DROP TRIGGER IF EXISTS trigger_product_stock ON orders;
CREATE TRIGGER trigger_product_stock
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.status NOT IN ('cart', 'favorite'))
EXECUTE FUNCTION update_product_stock();

-- Insert sample buyer data (optional)
INSERT INTO users (email, phone, password_hash, role, full_name, is_verified)
VALUES 
    ('buyer@example.com', '+251911223344', '$2a$12$hashhashhashhashhashhash', 'buyer', 'Sample Buyer', true)
ON CONFLICT (email) DO NOTHING;

-- Insert buyer profile
INSERT INTO buyers (user_id, company_name, business_type, location, buyer_type, preferred_regions)
SELECT id, 'Coffee Importers Ltd', 'importer', 'Addis Ababa', 'wholesale', ARRAY['Yirgacheffe', 'Sidamo', 'Harar']
FROM users WHERE email = 'buyer@example.com'
ON CONFLICT (user_id) DO NOTHING;