CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Kullanıcılar
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    is_sms_verified BOOLEAN DEFAULT false,
    email_verify_token VARCHAR(255),
    email_verify_token_created_at TIMESTAMP,
    email_verify_code VARCHAR(6),
    email_verify_code_created_at TIMESTAMP,
    sms_verify_code VARCHAR(6),
    sms_verify_code_created_at TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Şifre sıfırlama token'ları
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Planlar
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL CHECK (name IN ('pro', 'premium')),
    duration VARCHAR(20) NOT NULL CHECK (duration IN ('monthly', 'yearly')),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2), -- Yıllık planlar için orijinal fiyat (indirim öncesi)
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(name, duration)
);

-- Abonelikler
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT, -- NULL olabilir (trial için)
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    is_trial BOOLEAN DEFAULT false,
    trial_end_date TIMESTAMP,
    start_date TIMESTAMP NOT NULL DEFAULT now(),
    end_date TIMESTAMP,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Plan verilerini ekle
INSERT INTO plans (name, duration, price, original_price) VALUES
    ('pro', 'monthly', 199.00, NULL),
    ('pro', 'yearly', 1910.40, 2388.00), -- 199 * 12 * 0.8 = 1910.40 (20% indirim)
    ('premium', 'monthly', 289.00, NULL),
    ('premium', 'yearly', 2774.40, 3468.00); -- 289 * 12 * 0.8 = 2774.40 (20% indirim)

