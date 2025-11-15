-- Notlar tablosu - Profesyonellerin katılımcılar hakkında notlar tutması için
CREATE TABLE IF NOT EXISTS coaching_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coaching_relationship_id UUID REFERENCES coaching_relationships(id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_coaching_notes_professional ON coaching_notes(professional_id);
CREATE INDEX IF NOT EXISTS idx_coaching_notes_participant ON coaching_notes(participant_id);
CREATE INDEX IF NOT EXISTS idx_coaching_notes_relationship ON coaching_notes(coaching_relationship_id);

