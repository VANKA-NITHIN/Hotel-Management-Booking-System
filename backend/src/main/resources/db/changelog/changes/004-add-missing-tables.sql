-- Add destinations table
CREATE TABLE destinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    image_url VARCHAR(500),
    description TEXT,
    featured BOOLEAN DEFAULT TRUE
);
