package com.luxurystay.controller;

import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.Room;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.RoomRepository;
import com.luxurystay.service.OpenRouterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AIAssistantController {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final OpenRouterService openRouterService;

    @SuppressWarnings("unchecked")
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> request) {
        String message = ((String) request.getOrDefault("message", "")).trim();
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");

        // Try OpenRouter AI first
        String aiResponse = openRouterService.chat(message, history);
        String response = aiResponse != null ? aiResponse : generateResponse(message.toLowerCase());

        return ResponseEntity.ok(Map.of("response", response, "timestamp", String.valueOf(System.currentTimeMillis())));
    }

    private String generateResponse(String message) {
        // Hotel recommendations
        if (message.contains("recommend") || message.contains("suggest") || message.contains("best")) {
            List<Hotel> hotels = hotelRepository.findTopRated(org.springframework.data.domain.PageRequest.of(0, 3));
            if (!hotels.isEmpty()) {
                StringBuilder sb = new StringBuilder("Here are our top-rated hotels:\n\n");
                for (Hotel h : hotels) {
                    sb.append(String.format("🏨 %s (%s) - \u2605%.1f from $%.0f/night\n", h.getName(), h.getCity(), h.getRating() != null ? h.getRating().doubleValue() : 0.0, h.getStartingPrice() != null ? h.getStartingPrice().doubleValue() : 0.0));
                }
                sb.append("\nWould you like to know more about any of these?");
                return sb.toString();
            }
            return "I'd be happy to recommend hotels! What destination are you interested in?";
        }

        // Room inquiries
        if (message.contains("room") || message.contains("suite") || message.contains("stay")) {
            List<Room> rooms = roomRepository.findAllAvailable();
            Map<String, Long> typeCounts = rooms.stream()
                .collect(Collectors.groupingBy(r -> r.getRoomType().name(), Collectors.counting()));
            StringBuilder sb = new StringBuilder("We have the following room types available:\n\n");
            for (Map.Entry<String, Long> entry : typeCounts.entrySet()) {
                sb.append(String.format("🛏️ %s - %d available\n", entry.getKey().replace("_", " "), entry.getValue()));
            }
            sb.append("\nPrices start from $").append(rooms.stream().mapToDouble(r -> r.getPricePerNight().doubleValue()).min().orElse(0))
              .append("/night. Would you like to book one?");
            return sb.toString();
        }

        // Price inquiries
        if (message.contains("price") || message.contains("cost") || message.contains("budget")) {
            List<Room> rooms = roomRepository.findAllAvailable();
            double min = rooms.stream().mapToDouble(r -> r.getPricePerNight().doubleValue()).min().orElse(0);
            double max = rooms.stream().mapToDouble(r -> r.getPricePerNight().doubleValue()).max().orElse(0);
            return String.format("Our rooms range from $%.0f to $%.0f per night.\n\n" +
                "💰 Budget-friendly options start around $%.0f\n" +
                "👑 Premium suites go up to $%.0f\n\n" +
                "What's your budget? I can help find the perfect room!", min, max, min, max);
        }

        // Destination inquiries
        if (message.contains("destination") || message.contains("where") || message.contains("location")) {
            List<String> cities = hotelRepository.findDistinctCities();
            return String.format("Our hotels are located in:\n\n%s\n\n" +
                "Each destination offers unique experiences! Which one interests you?",
                cities.stream().map(c -> "📍 " + c).collect(Collectors.joining("\n")));
        }

        // Booking help
        if (message.contains("book") || message.contains("reserve") || message.contains("reservation")) {
            return "I'd love to help you book a stay! Here's how:\n\n" +
                "1️⃣ Browse our hotels at /hotels\n" +
                "2️⃣ Select your dates and room type\n" +
                "3️⃣ Complete the booking with secure payment\n\n" +
                "Do you have a specific hotel or destination in mind?";
        }

        // Cancellation policy
        if (message.contains("cancel") || message.contains("refund")) {
            return "Our cancellation policy:\n\n" +
                "✅ Free cancellation up to 24 hours before check-in\n" +
                "⚠️ Late cancellations may incur a fee\n" +
                "💳 Refunds are processed within 5-7 business days\n\n" +
                "Need to cancel a booking? Visit your dashboard at /dashboard";
        }

        // Amenities
        if (message.contains("amenity") || message.contains("facilit") || message.contains("pool") || message.contains("spa")) {
            return "Our hotels offer world-class amenities:\n\n" +
                "🏊 Swimming Pools & Infinity Pools\n" +
                "💆 Spa & Wellness Centers\n" +
                "🍽️ Fine Dining Restaurants\n" +
                "🏋️ Fitness Centers\n" +
                "🚗 Valet Parking\n" +
                "📶 High-Speed Wi-Fi\n" +
                "🛎️ 24/7 Concierge Service\n\n" +
                "Would you like to know about amenities at a specific hotel?";
        }

        // Check-in/out
        if (message.contains("check-in") || message.contains("check out") || message.contains("checkin")) {
            return "Check-in & Check-out Information:\n\n" +
                "🕐 Check-in: 3:00 PM\n" +
                "🕐 Check-out: 11:00 AM\n\n" +
                "Early check-in and late check-out may be available upon request. " +
                "Contact the front desk for availability.";
        }

        // Payment
        if (message.contains("payment") || message.contains("pay") || message.contains("credit card")) {
            return "We accept multiple payment methods:\n\n" +
                "💳 Credit/Debit Cards (Visa, Mastercard, Amex)\n" +
                "📱 Razorpay\n" +
                "🔒 Stripe\n" +
                "🏦 Bank Transfer\n\n" +
                "All transactions are secured with 256-bit encryption.";
        }

        // Greeting
        if (message.contains("hello") || message.contains("hi") || message.contains("hey") || message.equals("help")) {
            return "Hello! Welcome to LuxuryStay! 🏨\n\n" +
                "I'm your AI hotel assistant. I can help you with:\n\n" +
                "🔍 Finding hotels and destinations\n" +
                "🛏️ Room recommendations and pricing\n" +
                "📅 Booking assistance\n" +
                "❓ Cancellation policies\n" +
                "💳 Payment information\n" +
                "🏊 Amenities information\n\n" +
                "What would you like to know?";
        }

        // Thank you
        if (message.contains("thank") || message.contains("thanks")) {
            return "You're welcome! 😊 Is there anything else I can help you with? I'm here to make your luxury stay experience perfect!";
        }

        // Default response
        return "I'm here to help! I can assist you with:\n\n" +
            "🏨 Hotel recommendations and searches\n" +
            "🛏️ Room types, availability, and pricing\n" +
            "📅 Booking and reservation assistance\n" +
            "❓ Policies and frequently asked questions\n" +
            "💳 Payment methods and security\n\n" +
            "Please ask me anything about your luxury stay!";
    }
}
