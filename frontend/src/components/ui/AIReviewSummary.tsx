import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import type { Review } from '../../types';

interface AIReviewSummaryProps {
  reviews: Review[];
  hotelName: string;
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export function AIReviewSummary({ reviews, hotelName }: AIReviewSummaryProps) {
  const [summary, setSummary] = useState<{ pros: string[]; cons: string[]; summary: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reviews.length === 0) {
      setSummary({
        pros: [],
        cons: [],
        summary: "There are no reviews for this hotel yet. Be the first to leave one!"
      });
      setIsLoading(false);
      return;
    }

    const generateSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!OPENROUTER_API_KEY) {
          throw new Error("OpenRouter API key is missing.");
        }

        const reviewsText = reviews
          .slice(0, 20) // Limit to top 20 reviews to save tokens
          .map(r => `Rating: ${r.rating}/5, Comment: "${r.comment}"`)
          .join('\n');

        const prompt = `
          You are an AI that summarizes hotel reviews.
          Analyze these reviews for ${hotelName}:
          
          ${reviewsText}
          
          Return a strict JSON object with this exact schema:
          {
            "summary": "A 2-sentence overarching summary of the general vibe.",
            "pros": ["pro 1", "pro 2", "pro 3"],
            "cons": ["con 1", "con 2"]
          }
          Only output valid JSON. No markdown formatting like \`\`\`json.
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
            // Remove markdown code blocks if the LLM ignores instructions
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            console.error("Failed to parse JSON:", content);
            throw new Error("Failed to parse AI response.");
        }

        setSummary(parsed);
      } catch (err: any) {
        console.error(err);
        setError("Failed to generate AI summary.");
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [reviews, hotelName]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border-base rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] shadow-sm">
        <Loader2 className="w-8 h-8 text-secondary animate-spin mb-4" />
        <p className="text-sm font-medium text-text-muted flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Reading reviews and generating summary...
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return null; // Fail silently or show an error state if preferred
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface-hover rounded-2xl p-6 sm:p-8 border border-border-base relative overflow-hidden shadow-sm"
    >
      <div className="absolute top-0 end-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shrink-0 shadow-sm text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-text-base leading-tight">AI Review Summary</h3>
          <p className="text-xs font-medium text-text-muted">Generated from verified guest reviews</p>
        </div>
      </div>

      <p className="text-sm text-text-base leading-relaxed mb-6 font-medium relative z-10 italic border-s-2 border-secondary ps-4 py-1">
        "{summary.summary}"
      </p>

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          <div className="bg-bg-surface p-4 rounded-xl border border-border-base">
            <h4 className="text-sm font-bold text-text-base flex items-center gap-2 mb-3">
              <ThumbsUp className="w-4 h-4 text-success" /> What guests loved
            </h4>
            <ul className="space-y-2">
              {summary.pros.map((pro, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bg-surface p-4 rounded-xl border border-border-base">
            <h4 className="text-sm font-bold text-text-base flex items-center gap-2 mb-3">
              <ThumbsDown className="w-4 h-4 text-error" /> Needs improvement
            </h4>
            <ul className="space-y-2">
              {summary.cons.map((con, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-error mt-0.5">•</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}
