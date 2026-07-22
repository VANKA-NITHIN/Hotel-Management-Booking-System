import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

export interface CurrencyDetails {
  code: CurrencyCode;
  symbol: string;
  rate: number; // exchange rate relative to 1 USD
  label: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CURRENCIES: Record<CurrencyCode, CurrencyDetails> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP (£)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, label: 'INR (₹)' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, label: 'JPY (¥)' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  currencyDetails: CurrencyDetails;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('preferred_currency') as CurrencyCode;
    return saved && CURRENCIES[saved] ? saved : 'USD';
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('preferred_currency', code);
  };

  const currencyDetails = CURRENCIES[currency];

  const convertPrice = (amountInUSD: number): number => {
    return Math.round(amountInUSD * currencyDetails.rate);
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertPrice(amountInUSD);
    if (currency === 'INR') {
      return `${currencyDetails.symbol}${converted.toLocaleString('en-IN')}`;
    }
    if (currency === 'JPY') {
      return `${currencyDetails.symbol}${converted.toLocaleString('ja-JP')}`;
    }
    return `${currencyDetails.symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currencyDetails,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
