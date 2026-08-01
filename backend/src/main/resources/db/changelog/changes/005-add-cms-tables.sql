-- Add CMS tables
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255),
    link_url VARCHAR(255),
    link_text VARCHAR(255),
    active BOOLEAN DEFAULT FALSE
);

CREATE TABLE banners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    image_url VARCHAR(255),
    link_url VARCHAR(255),
    button_text VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT
);

CREATE TABLE company_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    copyright_text VARCHAR(255)
);

CREATE TABLE contact_information (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255),
    contact_value VARCHAR(255),
    label VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE currency_exchange_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_currency VARCHAR(255) DEFAULT 'USD',
    target_currency VARCHAR(255),
    rate DECIMAL(10, 4),
    last_updated DATETIME
);

CREATE TABLE faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question TEXT,
    answer TEXT,
    category VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    display_order INT
);

CREATE TABLE featured_collections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    slug VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE collection_hotels (
    collection_id BIGINT,
    hotel_id BIGINT,
    PRIMARY KEY (collection_id, hotel_id),
    FOREIGN KEY (collection_id) REFERENCES featured_collections(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

CREATE TABLE site_configuration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(255),
    config_value VARCHAR(255)
);

CREATE TABLE social_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(255),
    url VARCHAR(255),
    icon_class VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    display_order INT
);
