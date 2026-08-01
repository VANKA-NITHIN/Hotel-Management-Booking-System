import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: string | null;
}

export const useVoiceSearch = (onFinalTranscript: (transcript: string, confidence: number) => void) => {
  const [state, setState] = useState<VoiceSearchState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    error: null,
  });

  const { i18n } = useTranslation();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser' }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Set language from app i18n
    const lang = i18n.language || 'en-US';
    // Mapping common generic codes to proper locales for speech API if needed
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ar': 'ar-SA',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES'
    };
    recognition.lang = langMap[lang] || lang;
    
    recognition.continuous = false; // one-shot search
    recognition.interimResults = true; // allow UI preview
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, transcript: '', interimTranscript: '', error: null }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          confidence = event.results[i][0].confidence;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setState(prev => ({
        ...prev,
        interimTranscript,
        transcript: finalTranscript,
        confidence
      }));

      if (finalTranscript) {
        onFinalTranscript(finalTranscript, confidence);
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'An error occurred during speech recognition';
      if (event.error === 'no-speech') errorMessage = 'No speech detected. Please try again.';
      if (event.error === 'audio-capture') errorMessage = 'No microphone found.';
      if (event.error === 'not-allowed') errorMessage = 'Microphone permission denied.';

      setState(prev => ({ ...prev, isListening: false, error: errorMessage }));
      if (event.error !== 'aborted') {
        toast.error(errorMessage);
      }
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [i18n.language, onFinalTranscript]);

  const startListening = () => {
    if (state.error === 'Speech recognition not supported in this browser') {
      toast.error(state.error);
      return;
    }
    
    try {
      if (state.isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (e) {
      console.error('Failed to start/stop speech recognition', e);
    }
  };

  const stopListening = () => {
    if (state.isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return {
    ...state,
    startListening,
    stopListening
  };
};
