-- =====================================================
-- DEPRECATED: This file is superseded by Liquibase migrations.
-- Schema and seed data are now managed via:
--   db/changelog/db.changelog-master.xml
--   db/changelog/changes/001-initial-schema.sql
--   db/changelog/changes/002-seed-data.sql
-- This file is retained as a reference only.
-- =====================================================
-- LuxuryStay Hotel Management Platform - Database Schema
-- MySQL 8.0+
-- =====================================================

CREATE DATABASE IF NOT EXISTS luxurystay;
USE luxurystay;

-- Roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500)
);

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expiry DATETIME,
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    loyalty_points INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- User-Roles mapping
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Amenities table
CREATE TABLE amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Hotels table
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20),
    latitude DOUBLE,
    longitude DOUBLE,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    rating DECIMAL(3,1) NOT NULL DEFAULT 0,
    total_reviews INT NOT NULL DEFAULT 0,
    starting_price DECIMAL(10,2),
    logo_url VARCHAR(500),
    manager_id BIGINT,
    star_rating INT NOT NULL DEFAULT 5,
    policies VARCHAR(2000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_city (city),
    INDEX idx_rating (rating),
    INDEX idx_active (active)
);

-- Hotel images
CREATE TABLE hotel_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Hotel amenities mapping
CREATE TABLE hotel_amenities (
    hotel_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Rooms table
CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INT NOT NULL,
    max_children INT DEFAULT 2,
    bed_count INT NOT NULL,
    bed_type VARCHAR(100),
    floor INT,
    room_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    cleaning_status VARCHAR(50) DEFAULT 'CLEAN',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    size DOUBLE DEFAULT 0,
    view VARCHAR(200),
    weekend_price DECIMAL(10,2),
    holiday_price DECIMAL(10,2),
    room_number INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_hotel (hotel_id),
    INDEX idx_type (room_type),
    INDEX idx_status (room_status),
    INDEX idx_price (price_per_night)
);

-- Room images
CREATE TABLE room_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room amenities mapping
CREATE TABLE room_amenities (
    room_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INT NOT NULL,
    children_count INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    service_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    coupon_code VARCHAR(50),
    special_requests VARCHAR(1000),
    cancellation_reason VARCHAR(500),
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_hotel (hotel_id),
    INDEX idx_status (status),
    INDEX idx_dates (check_in_date, check_out_date),
    INDEX idx_reference (booking_reference)
);

-- Booking rooms
CREATE TABLE booking_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- Payments table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(100) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    stripe_payment_intent_id VARCHAR(500),
    razorpay_order_id VARCHAR(500),
    transaction_id VARCHAR(500),
    payment_details VARCHAR(1000),
    refund_amount DECIMAL(10,2),
    refunded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Reviews table
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    room_id BIGINT,
    booking_id BIGINT,
    rating DECIMAL(3,1) NOT NULL,
    comment TEXT NOT NULL,
    review_image VARCHAR(500),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    likes INT DEFAULT 0,
    reply VARCHAR(1000),
    replied_by BIGINT,
    reported BOOLEAN DEFAULT FALSE,
    report_reason VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_hotel (hotel_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
);

-- Wishlists table
CREATE TABLE wishlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_hotel (user_id, hotel_id)
);

-- Coupons table
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    percentage_discount BOOLEAN NOT NULL DEFAULT FALSE,
    max_discount DECIMAL(10,2),
    min_booking_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INT NOT NULL DEFAULT 0,
    used_count INT NOT NULL DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active_dates (active, start_date, end_date)
);

-- Coupon usage tracking
CREATE TABLE coupon_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, `read`)
);

-- Employees table
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    position VARCHAR(50) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    join_date DATE NOT NULL,
    shift VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    address VARCHAR(500),
    emergency_contact VARCHAR(20),
    emergency_contact_name VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user (user_id)
);

-- Attendance table
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    date DATE NOT NULL,
    clock_in TIME,
    clock_out TIME,
    status VARCHAR(20) DEFAULT 'PRESENT',
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_date (employee_id, date)
);

-- Housekeeping table
CREATE TABLE housekeeping (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    employee_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'DIRTY',
    notes VARCHAR(500),
    inspection_required BOOLEAN DEFAULT FALSE,
    inspection_passed BOOLEAN DEFAULT FALSE,
    inspection_notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Maintenance table
CREATE TABLE maintenance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    reported_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'PENDING',
    resolved_at DATETIME,
    resolution_notes VARCHAR(1000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Audit logs table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity),
    INDEX idx_created (created_at)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(200),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- Settings table
CREATE TABLE settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description VARCHAR(200),
    type VARCHAR(50) DEFAULT 'STRING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Seed Data
-- =====================================================

-- Roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'System administrator with full access'),
('ROLE_MANAGER', 'Hotel manager with hotel-level access'),
('ROLE_RECEPTION', 'Reception staff with booking management access'),
('ROLE_HOUSEKEEPING', 'Housekeeping staff with room status access'),
('ROLE_STAFF', 'General hotel staff'),
('ROLE_CUSTOMER', 'Customer with booking and profile access');

-- Default Admin User (password: Admin@12345)
INSERT INTO users (first_name, last_name, email, password, role, enabled, email_verified, loyalty_points) VALUES
('Admin', 'User', 'admin@luxurystay.com', '$2a$10$EqKcp1WFKAr0YJRGO.sOKeEGmEHjvO8dO0tBjOsB5VH2D2VqCxCZm', 'ROLE_ADMIN', TRUE, TRUE, 0);

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Common Amenities
INSERT INTO amenities (name, icon) VALUES
('Free Wi-Fi', 'wifi'), ('Swimming Pool', 'waves'), ('Spa & Wellness', 'sparkles'),
('Fitness Center', 'dumbbell'), ('Restaurant', 'utensils-crossed'), ('Bar/Lounge', 'wine'),
('Room Service', 'concierge-bell'), ('Parking', 'car'), ('Airport Shuttle', 'plane'),
('Business Center', 'briefcase'), ('Laundry Service', 'shirt'), ('24-Hour Front Desk', 'clock'),
('Elevator', 'arrow-up'), ('Pet Friendly', 'heart'), ('Garden', 'flower-2'),
('Balcony', 'sun'), ('Sea View', 'waves'), ('In-Room Safe', 'shield'),
('Air Conditioning', 'snowflake'), ('Mini Bar', 'coffee'), ('Television', 'tv'),
('Jacuzzi', 'bath'), ('Tennis Court', 'circle-dot'), ('Concierge', 'star');

-- Sample Hotels
INSERT INTO hotels (name, description, address, city, state, country, zip_code, phone_number, email, rating, total_reviews, starting_price, logo_url, star_rating, policies) VALUES
('The Grand Palazzo', 'Experience unparalleled luxury at The Grand Palazzo, where timeless elegance meets modern sophistication. Our 5-star hotel offers breathtaking views, world-class dining, and personalized service.', '123 Via della Conciliazione', 'Rome', 'Lazio', 'Italy', '00193', '+39 06 1234567', 'info@grandpalazzo.com', 4.9, 328, 450.00, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop', 5, 'Check-in: 3:00 PM | Check-out: 11:00 AM. No smoking. Pets allowed with prior notice.'),
('Oceanic Paradise Resort', 'A breathtaking oceanfront resort offering pristine beaches, crystal-clear waters, and world-class amenities. Your tropical paradise awaits.', '45 Beach Road', 'Maldives', 'North Malé Atoll', 'Maldives', '20066', '+960 777 8888', 'reservations@oceanicparadise.mv', 4.8, 256, 680.00, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop', 5, 'Check-in: 2:00 PM | Check-out: 12:00 PM. Complimentary airport transfer included.'),
('Sakura Imperial', 'Traditional Japanese hospitality meets modern luxury. Experience authentic ryokan culture with contemporary comforts in the heart of Tokyo.', '1-2-3 Ginza', 'Tokyo', 'Chuo', 'Japan', '104-0061', '+81 3 1234 5678', 'stay@sakura-imperial.jp', 4.7, 189, 380.00, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop', 5, 'Check-in: 3:00 PM | Check-out: 11:00 AM. Onsen access included.'),
('Alpine Luxury Lodge', 'Nestled in the Swiss Alps, our lodge offers stunning mountain views, world-class skiing, and a cozy retreat after a day on the slopes.', '15 Bergweg', 'Zurich', 'Zurich', 'Switzerland', '8001', '+41 44 123 4567', 'alpine@luxurylodge.ch', 4.9, 210, 520.00, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop', 5, 'Check-in: 4:00 PM | Check-out: 11:00 AM. Ski storage available.'),
('Manhattan Sky Suites', 'Elevate your stay in the city that never sleeps. Our rooftop suites offer panoramic views of the iconic New York skyline.', '350 5th Avenue', 'New York', 'New York', 'USA', '10118', '+1 212 555 0100', 'suites@manhattanskyny.com', 4.6, 345, 420.00, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop', 5, 'Check-in: 3:00 PM | Check-out: 12:00 PM. Valet parking available.'),
('Bali Serenity Resort', 'Find your inner peace at our tropical sanctuary. Lush gardens, infinity pools, and traditional Balinese spa treatments await.', 'Jl. Raya Seminyak', 'Bali', 'Bali', 'Indonesia', '80361', '+62 361 123 4567', 'hello@baliserenity.id', 4.8, 198, 290.00, 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&h=500&fit=crop', 5, 'Check-in: 2:00 PM | Check-out: 12:00 PM. Free shuttle to beach.');

-- Sample Rooms
INSERT INTO rooms (hotel_id, name, description, room_type, price_per_night, max_guests, bed_count, bed_type, floor, room_status, active, size, view, room_number) VALUES
(1, 'Presidential Suite', 'The epitome of luxury with panoramic city views, private terrace, and butler service.', 'LUXURY_SUITE', 1200.00, 4, 2, 'King', 20, 'AVAILABLE', TRUE, 120, 'City', 2001),
(1, 'Deluxe Ocean View', 'Elegant room with stunning ocean panorama and premium amenities.', 'DELUXE', 650.00, 3, 1, 'King', 15, 'AVAILABLE', TRUE, 65, 'Ocean', 1501),
(1, 'Executive Room', 'Perfect blend of comfort and functionality for business travelers.', 'EXECUTIVE', 450.00, 2, 1, 'Queen', 10, 'AVAILABLE', TRUE, 45, 'Garden', 1001),
(1, 'Family Villa', 'Spacious villa perfect for family getaways with private pool.', 'FAMILY_ROOM', 890.00, 6, 3, 'Mixed', 5, 'AVAILABLE', TRUE, 95, 'Pool', 501),
(2, 'Beachfront Villa', 'Private beachfront villa with direct ocean access and outdoor shower.', 'VILLA', 1500.00, 4, 2, 'King', 1, 'AVAILABLE', TRUE, 150, 'Beach', 101),
(2, 'Overwater Bungalow', 'Iconic overwater bungalow with glass floor and sunset views.', 'LUXURY_SUITE', 980.00, 2, 1, 'King', 1, 'AVAILABLE', TRUE, 80, 'Ocean', 201),
(2, 'Garden Suite', 'Tropical garden suite with private terrace and outdoor bathtub.', 'DELUXE', 520.00, 2, 1, 'Queen', 2, 'AVAILABLE', TRUE, 55, 'Garden', 301),
(3, 'Imperial Suite', 'Traditional tatami room with modern luxury and garden views.', 'LUXURY_SUITE', 880.00, 2, 1, 'King', 8, 'AVAILABLE', TRUE, 75, 'Garden', 801),
(3, 'Cherry Blossom Room', 'Elegant room with cherry blossom artwork and city views.', 'DELUXE', 480.00, 2, 1, 'Double', 5, 'AVAILABLE', TRUE, 40, 'City', 501),
(4, 'Alpine Penthouse', 'Spectacular penthouse with floor-to-ceiling mountain views.', 'PENTHOUSE', 1800.00, 4, 2, 'King', 12, 'AVAILABLE', TRUE, 200, 'Mountain', 1201),
(4, 'Mountain View Suite', 'Cozy suite with fireplace and panoramic alpine views.', 'LUXURY_SUITE', 780.00, 2, 1, 'King', 8, 'AVAILABLE', TRUE, 65, 'Mountain', 801),
(5, 'Skyline Suite', 'Iconic suite with floor-to-ceiling windows and Central Park views.', 'LUXURY_SUITE', 1200.00, 3, 1, 'King', 50, 'AVAILABLE', TRUE, 85, 'City', 5001),
(5, 'Manhattan Studio', 'Modern studio with kitchenette and city views.', 'STANDARD', 380.00, 2, 1, 'Queen', 20, 'AVAILABLE', TRUE, 35, 'City', 2001),
(6, 'Garden Paradise Villa', 'Private villa surrounded by tropical gardens with private pool.', 'VILLA', 680.00, 4, 2, 'King', 1, 'AVAILABLE', TRUE, 120, 'Garden', 101),
(6, 'Bamboo Bungalow', 'Eco-friendly bamboo bungalow with traditional Balinese design.', 'DELUXE', 320.00, 2, 1, 'Queen', 2, 'AVAILABLE', TRUE, 45, 'Garden', 201);

-- Default Settings
INSERT INTO settings (`key`, value, description, type) VALUES
('site_name', 'LuxuryStay', 'Website name', 'STRING'),
('site_description', 'Luxury Hotel Management & Online Booking Platform', 'Website description', 'STRING'),
('currency', 'USD', 'Default currency', 'STRING'),
('tax_rate', '10', 'Tax rate percentage', 'NUMBER'),
('service_charge_rate', '5', 'Service charge percentage', 'NUMBER'),
('min_booking_advance_hours', '24', 'Minimum hours before check-in for booking', 'NUMBER'),
('cancellation_policy_hours', '24', 'Hours before check-in for free cancellation', 'NUMBER'),
('loyalty_points_per_dollar', '1', 'Loyalty points earned per dollar spent', 'NUMBER');
