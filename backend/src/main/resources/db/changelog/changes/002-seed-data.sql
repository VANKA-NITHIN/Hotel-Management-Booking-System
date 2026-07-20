-- LuxuryStay Hotel Management Platform - Seed Data

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
INSERT INTO hotels (name, description, address, city, state, country, zip_code, phone_number, email, rating, total_reviews, starting_price, logo_url, star_rating, policies, latitude, longitude) VALUES
('The Grand Palazzo', 'Experience unparalleled luxury at The Grand Palazzo, where timeless elegance meets modern sophistication. Our 5-star hotel offers breathtaking views, world-class dining, and personalized service.', '123 Via della Conciliazione', 'Rome', 'Lazio', 'Italy', '00193', '+39 06 1234567', 'info@grandpalazzo.com', 4.9, 328, 450.00, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop', 5, 'Check-in: 3:00 PM | Check-out: 11:00 AM. No smoking. Pets allowed with prior notice.', 41.9028, 12.4964),
('Oceanic Paradise Resort', 'A breathtaking oceanfront resort offering pristine beaches, crystal-clear waters, and world-class amenities. Your tropical paradise awaits.', '45 Beach Road', 'Maldives', 'North Malé Atoll', 'Maldives', '20066', '+960 777 8888', 'reservations@oceanicparadise.mv', 4.8, 256, 680.00, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop', 5, 'Check-in: 2:00 PM | Check-out: 12:00 PM. Complimentary airport transfer included.', 4.1755, 73.5093),
('Sakura Imperial', 'Traditional Japanese hospitality meets modern luxury. Experience authentic ryokan culture with contemporary comforts in the heart of Tokyo.', '1-2-3 Ginza', 'Tokyo', 'Chuo', 'Japan', '104-0061', '+81 3 1234 5678', 'stay@sakura-imperial.jp', 4.7, 189, 380.00, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop', 5, 'Check-in: 3:00 PM | Check-out: 11:00 AM. Onsen access included.', 35.6762, 139.6503),
('Alpine Luxury Lodge', 'Nestled in the Swiss Alps, our lodge offers stunning mountain views, world-class skiing, and a cozy retreat after a day on the slopes.', '15 Bergweg', 'Zurich', 'Zurich', 'Switzerland', '8001', '+41 44 123 4567', 'alpine@luxurylodge.ch', 4.9, 210, 520.00, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop', 5, 'Check-in: 4:00 PM | Check-out: 11:00 AM. Ski storage available.', 47.3769, 8.5417),
('Manhattan Sky Suites', 'Elevate your stay in the city that never sleeps. Our rooftop suites offer panoramic views of the iconic New York skyline.', '350 5th Avenue', 'New York', 'New York', 'USA', '10118', '+1 212 555 0100', 'suites@manhattanskyny.com', 4.6, 345, 420.00, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop', 5, 'Check-in: 3:00 PM | Check-out: 12:00 PM. Valet parking available.', 40.7128, -74.0060),
('Bali Serenity Resort', 'Find your inner peace at our tropical sanctuary. Lush gardens, infinity pools, and traditional Balinese spa treatments await.', 'Jl. Raya Seminyak', 'Bali', 'Bali', 'Indonesia', '80361', '+62 361 123 4567', 'hello@baliserenity.id', 4.8, 198, 290.00, 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&h=500&fit=crop', 5, 'Check-in: 2:00 PM | Check-out: 12:00 PM. Free shuttle to beach.', -8.4095, 115.1889);

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
INSERT INTO settings (setting_key, setting_value, description, type) VALUES
('site_name', 'LuxuryStay', 'Website name', 'STRING'),
('site_description', 'Luxury Hotel Management & Online Booking Platform', 'Website description', 'STRING'),
('currency', 'USD', 'Default currency', 'STRING'),
('tax_rate', '10', 'Tax rate percentage', 'NUMBER'),
('service_charge_rate', '5', 'Service charge percentage', 'NUMBER'),
('min_booking_advance_hours', '24', 'Minimum hours before check-in for booking', 'NUMBER'),
('cancellation_policy_hours', '24', 'Hours before check-in for free cancellation', 'NUMBER'),
('loyalty_points_per_dollar', '1', 'Loyalty points earned per dollar spent', 'NUMBER');
