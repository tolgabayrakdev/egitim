CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Kullanıcılar
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('professional','participant')),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    is_sms_verified BOOLEAN DEFAULT false,
    bio TEXT,
    specialty VARCHAR(255),
    profile_image_url TEXT,
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

-- 2. Paketler (1-1 Koçluk Paketleri)
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INT, -- Paket süresi (gün cinsinden)
    price NUMERIC,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 3. Davetler
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- davet eden profesyonel
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,        -- davet edilen paket
    email VARCHAR(255) NOT NULL,                                    -- davet edilen e-posta
    token VARCHAR(255) UNIQUE NOT NULL,                             -- doğrulama token
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMP,                                          -- kabul zamanı
    created_at TIMESTAMP DEFAULT now()
);

-- 4. Koçluk İlişkileri (1-1 Koçluk)
CREATE TABLE coaching_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
    started_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT unique_coaching_relationship UNIQUE (professional_id, participant_id, package_id)
);

-- 5. Görevler / Tasklar
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_relationship_id UUID NOT NULL REFERENCES coaching_relationships(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Görevi atayan (professional)
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Görevi alan (participant)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','submitted','completed','overdue','cancelled')),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 6. Görev Gönderimleri (Task Submissions)
CREATE TABLE task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Participant
    submission_text TEXT,
    attachment_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','approved','needs_revision')),
    feedback TEXT, -- Professional'dan gelen geri bildirim
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Professional
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 7. Abonelik / Ödeme
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('free','pro','premium')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active','cancelled','past_due')),
    start_date DATE NOT NULL,
    end_date DATE,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 8. Aktivite / Loglar
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
);
