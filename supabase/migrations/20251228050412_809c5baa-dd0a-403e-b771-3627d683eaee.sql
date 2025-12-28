-- Add new service categories to the enum
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'music_lessons';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'life_coaching';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'recovery_coaching';