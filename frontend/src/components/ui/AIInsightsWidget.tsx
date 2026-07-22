import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import type { Booking, Hotel } from '../../types';

interface AIInsightsWidgetProps {
  hotel: Hotel;
  bookings: Booking[];
  reviews: any[];
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export function AIInsightsWidget({ hotel, bookings, reviews }: AIInsightsWidgetProps) {
  const [insights, setInsights] = useState<{ positive: string[]; negative: string[]; action_items: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hotel) return;

    const generateInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!OPENROUTER_API_KEY) {
          throw new Error("OpenRouter API key is missing.");
        }

        const recentBookings = bookings.slice(0, 50);
        const revenue = recentBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

        const prompt = `
          You are an expert hospitality AI consultant. 
          Analyze this data for ${hotel.name}:
          - Total recent bookings: ${recentBookings.length}
          - Total recent revenue: $${revenue}
          - Average rating: ${avgRating}/5
          - Number of reviews: ${reviews.length}
          
          Provide actionable business insights. Return a strict JSON object with this exact schema:
          {
            "positive": ["A good trend or metric"],
            "negative": ["An area of concern"],
            "action_items": ["A specific action the manager should take"]
          }
          Only output valid JSON. No markdown formatting.
        `;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) throw new Error('API Request Failed');

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        let parsed;
        try {
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            throw new Error("Failed to parse AI response.");
        }

        setInsights(parsed);
      } catch (err: any) {
        console.error(err);
        setError("Failed to generate AI insights.");
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [hotel, bookings, reviews]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border-base rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] shadow-sm">
        <Loader2 className="w-8 h-8 text-secondary animate-spin mb-4" />
        <p className="text-sm font-medium text-text-muted flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Analyzing property data...
        </p>
      </div>
    );
  }

  if (error || !insights) {
    return null; 
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface-hover rounded-2xl p-6 sm:p-8 border border-border-base relative overflow-hidden shadow-sm mb-8"
    >
      <div className="absolute top-0 end-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shrink-0 shadow-sm text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-text-base leading-tight">AI Business Insights</h3>
          <p className="text-xs font-medium text-text-muted">Real-time analysis for {hotel.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-bg-surface p-5 rounded-xl border border-border-base">
          <h4 className="text-sm font-bold text-text-base flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" /> Strengths
          </h4>
          <ul className="space-y-3">
            {insights.positive.map((item, i) => (
              <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                <span className="text-success mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-bg-surface p-5 rounded-xl border border-border-base">
          <h4 className="text-sm font-bold text-text-base flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-error" /> Areas of Concern
          </h4>
          <ul className="space-y-3">
            {insights.negative.map((item, i) => (
              <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                <span className="text-error mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-primary/5 p-5 rounded-xl border border-primary/20">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" /> Recommended Actions
          </h4>
          <ul className="space-y-3">
            {insights.action_items.map((item, i) => (
              <li key={i} className="text-sm text-primary-800 flex items-start gap-2 font-medium">
                <span className="text-primary mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
