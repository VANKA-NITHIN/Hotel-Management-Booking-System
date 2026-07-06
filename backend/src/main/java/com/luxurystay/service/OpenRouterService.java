package com.luxurystay.service;

import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.Room;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenRouterService {

    @Value("${openrouter.api-key:}")
    private String apiKey;

    @Value("${openrouter.model:meta-llama/llama-4-maverick:free}")
    private String model;

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String chat(String userMessage, List<Map<String, String>> history) {
        if (!isAvailable()) {
            return null; // Fallback to keyword-based
        }

        try {
            String systemPrompt = buildSystemPrompt();

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            // Add conversation history (last 10 messages max)
            if (history != null) {
                int start = Math.max(0, history.size() - 10);
                messages.addAll(history.subList(start, history.size()));
            }

            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", messages);
            body.put("max_tokens", 500);
            body.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("HTTP-Referer", "https://luxurystay.com");
            headers.set("X-Title", "LuxuryStay AI Assistant");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(OPENROUTER_URL, request, Map.class);

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }

            return null;
        } catch (Exception e) {
            log.error("OpenRouter API call failed: {}", e.getMessage());
            return null;
        }
    }

    private String buildSystemPrompt() {
        StringBuilder sb = new StringBuilder();
        sb.append("You are LuxuryStay's AI hotel concierge assistant. You help guests find hotels, ");
        sb.append("recommend rooms, answer questions about policies, amenities, pricing, and bookings.\n\n");
        sb.append("Be warm, professional, and concise. Use emojis sparingly. Format responses with line breaks for readability.\n\n");

        // Inject live hotel data
        try {
            List<Hotel> hotels = hotelRepository.findAllActive();
            if (!hotels.isEmpty()) {
                sb.append("AVAILABLE HOTELS:\n");
                for (Hotel h : hotels) {
                    sb.append(String.format("- %s in %s, %s | Rating: %.1f | From $%.0f/night\n",
                            h.getName(), h.getCity(), h.getCountry(),
                            h.getRating() != null ? h.getRating().doubleValue() : 0.0,
                            h.getStartingPrice() != null ? h.getStartingPrice().doubleValue() : 0.0));
                }
                sb.append("\n");
            }

            List<Room> rooms = roomRepository.findAllAvailable();
            if (!rooms.isEmpty()) {
                Map<String, Long> types = rooms.stream()
                        .collect(Collectors.groupingBy(r -> r.getRoomType().name(), Collectors.counting()));
                double minPrice = rooms.stream().mapToDouble(r -> r.getPricePerNight().doubleValue()).min().orElse(0);
                double maxPrice = rooms.stream().mapToDouble(r -> r.getPricePerNight().doubleValue()).max().orElse(0);
                sb.append(String.format("ROOMS: %d available. Types: %s. Price range: $%.0f-$%.0f/night\n\n",
                        rooms.size(), types, minPrice, maxPrice));
            }
        } catch (Exception e) {
            log.warn("Could not load hotel data for AI context: {}", e.getMessage());
        }

        sb.append("POLICIES:\n");
        sb.append("- Check-in: 3:00 PM, Check-out: 11:00 AM\n");
        sb.append("- Free cancellation up to 24 hours before check-in\n");
        sb.append("- Payment: Visa, Mastercard, Amex, Razorpay, Stripe\n");
        sb.append("- Loyalty: 1 point per dollar, tiers: Bronze/Silver/Gold/Platinum\n\n");
        sb.append("When users ask to book, direct them to browse hotels at /hotels. ");
        sb.append("For account issues, direct to /dashboard or /settings.\n");

        return sb.toString();
    }
}
