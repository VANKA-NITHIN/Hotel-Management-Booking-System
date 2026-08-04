import { useState, useRef, useCallback } from 'react';
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
  const callbackRef = useRef(onFinalTranscript);
  callbackRef.current = onFinalTranscript;

  const getRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser' }));
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    
    const lang = i18n.language || 'en-US';
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
    
    recognition.continuous = false;
    recognition.interimResults = true;
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

      if (finalTranscript) {
        setState(prev => ({
          ...prev,
          interimTranscript: '',
          transcript: finalTranscript,
          confidence
        }));
        callbackRef.current(finalTranscript, confidence);
      } else {
        setState(prev => ({
          ...prev,
          interimTranscript,
        }));
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'An error occurred during speech recognition';
      if (event.error === 'no-speech') errorMessage = 'No speech detected. Please try again.';
      if (event.error === 'audio-capture') errorMessage = 'No microphone found. Please check your microphone.';
      if (event.error === 'not-allowed') errorMessage = 'Microphone permission denied. Please allow microphone access.';
      if (event.error === 'network') errorMessage = 'Network error. Please check your connection.';

      setState(prev => ({ ...prev, isListening: false, error: errorMessage }));
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error(errorMessage);
      }
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [i18n.language]);

  const startListening = useCallback(() => {
    // Clear any previous recognition instance to avoid stale state
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }

    const recognition = getRecognition();
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    try {
      recognition.start();
    } catch (e: any) {
      // Already started error — stop and restart
      if (e.message?.includes('already started')) {
        recognition.stop();
        setTimeout(() => {
          try { recognition.start(); } catch (_) { /* ignore */ }
        }, 100);
      } else {
        console.error('Failed to start speech recognition', e);
        setState(prev => ({ ...prev, error: 'Failed to start speech recognition. Please try again.' }));
      }
    }
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) { /* ignore */ }
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isListening: false,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetState,
  };
};
