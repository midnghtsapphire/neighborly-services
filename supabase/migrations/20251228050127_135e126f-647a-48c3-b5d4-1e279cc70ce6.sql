-- Add new service categories to the enum
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'sewing';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'upholstery';