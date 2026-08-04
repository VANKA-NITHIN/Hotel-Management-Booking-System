-- Add missing columns to reviews table for detailed ratings
ALTER TABLE reviews ADD COLUMN cleanliness_rating DECIMAL(3,1) DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN service_rating DECIMAL(3,1) DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN location_rating DECIMAL(3,1) DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN value_rating DECIMAL(3,1) DEFAULT NULL;

-- Create review_photos table for @ElementCollection
CREATE TABLE IF NOT EXISTS review_photos (
    review_id BIGINT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
