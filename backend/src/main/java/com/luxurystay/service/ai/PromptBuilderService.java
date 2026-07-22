package com.luxurystay.service.ai;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class PromptBuilderService {

    private static final String BASE_SYSTEM_PROMPT = """
        You are the LuxuryStay AI Concierge. You are a helpful, professional, and sophisticated hotel booking agent. 
        Your goal is to help users find hotels, answer travel questions, and provide luxurious service.
        
        Keep your responses concise, elegant, and professional. Use formatting like bullet points when listing items.
        If the user is logged in, use their context to provide personalized answers.
        """;

    public String buildSystemPrompt(Map<String, Object> userContext) {
        StringBuilder prompt = new StringBuilder(BASE_SYSTEM_PROMPT);
        
        prompt.append("\n\n--- User Context ---\n");
        if (Boolean.TRUE.equals(userContext.get("isAuthenticated"))) {
            prompt.append("User Name: ").append(userContext.get("firstName")).append(" ").append(userContext.get("lastName")).append("\n");
            prompt.append("Loyalty Points: ").append(userContext.get("loyaltyPoints")).append("\n");
            prompt.append("Wallet Balance: $").append(userContext.get("walletBalance")).append("\n");
            prompt.append("Upcoming Bookings: ").append(userContext.get("upcomingBookingsCount")).append("\n");
            
            if (Boolean.TRUE.equals(userContext.get("isCorporate"))) {
                prompt.append("Corporate Account: Yes (").append(userContext.get("companyName")).append(")\n");
                prompt.append("Corporate Role: ").append(userContext.get("companyRole")).append("\n");
            }
        } else {
            prompt.append("User is currently browsing as a guest (Not logged in).\n");
        }
        
        prompt.append("\n--- Instructions ---\n");
        prompt.append("- Tailor recommendations based on the user's loyalty points and wallet balance if they ask.\n");
        prompt.append("- If they are a corporate user, prioritize business-friendly amenities.\n");
        
        return prompt.toString();
    }
}
