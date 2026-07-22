import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

interface PriceCalendarProps {
  basePrice: number;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  className?: string;
}

export function PriceCalendar({
  basePrice,
  onSelectDates,
  selectedCheckIn,
  selectedCheckOut,
  className = '',
}: PriceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Calculate prices for each day in current month
  const dayPrices = Array.from({ length: daysInMonth }, (_, idx) => {
    const dayNum = idx + 1;
    const dateObj = new Date(year, month, dayNum);
    const dayOfWeek = dateObj.getDay();

    // Surcharges & Discounts logic
    let multiplier = 1.0;
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      // Friday & Saturday weekend surge (+20%)
      multiplier = 1.2;
    } else if (dayOfWeek === 2 || dayOfWeek === 3) {
      // Tuesday & Wednesday midweek discount (-10%)
      multiplier = 0.9;
    }

    // Holiday / Peak season bump (e.g. Dec/Jul or specific days)
    if (month === 11 || month === 6 || dayNum === 15 || dayNum === 25) {
      multiplier += 0.15;
    }

    const price = Math.round(basePrice * multiplier);
    const dateStr = dateObj.toISOString().split('T')[0] || '';

    return {
      day: dayNum,
      dateStr,
      price,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayOfWeek,
    };
  });

  const lowestPrice = Math.min(...dayPrices.map((d) => d.price));
  const highestPrice = Math.max(...dayPrices.map((d) => d.price));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dateStr: string) => {
    if (!onSelectDates) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      onSelectDates(dateStr, '');
    } else if (selectedCheckIn && !selectedCheckOut) {
      if (new Date(dateStr) > new Date(selectedCheckIn)) {
        onSelectDates(selectedCheckIn, dateStr);
      } else {
        onSelectDates(dateStr, '');
      }
    }
  };

  return (
    <div className={`bg-bg-surface border border-border-base rounded-2xl p-6 shadow-sm ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-serif font-bold text-text-base flex items-center gap-2">
            Dynamic Rate Calendar
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs text-text-muted">Prices adjust based on demand and day of the week</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg border border-border-base hover:bg-bg-surface-hover text-text-base transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-text-base min-w-[110px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-border-base hover:bg-bg-surface-hover text-text-base transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Highlights Summary Bar */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-bg-surface-hover rounded-xl border border-border-base/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-text-muted block font-medium uppercase tracking-wider">Cheapest Rate</span>
            <span className="text-sm font-bold text-emerald-600">${lowestPrice} / night</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-text-muted block font-medium uppercase tracking-wider">Peak Rate</span>
            <span className="text-sm font-bold text-amber-600">${highestPrice} / night</span>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="text-xs font-bold text-text-muted uppercase py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 bg-transparent rounded-lg" />
        ))}

        {/* Days */}
        {dayPrices.map(({ day, dateStr, price }) => {
          const isCheapest = price === lowestPrice;
          const isPeak = price === highestPrice;
          const isSelected = dateStr === selectedCheckIn || dateStr === selectedCheckOut;
          const isInRange =
            selectedCheckIn &&
            selectedCheckOut &&
            new Date(dateStr) >= new Date(selectedCheckIn as string) &&
            new Date(dateStr) <= new Date(selectedCheckOut as string);

          let bgClass = 'bg-bg-surface-hover border-border-base hover:border-primary/50';
          if (isSelected) {
            bgClass = 'bg-primary text-white border-primary shadow-sm';
          } else if (isInRange) {
            bgClass = 'bg-primary/10 border-primary/30 text-text-base';
          } else if (isCheapest) {
            bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:border-emerald-500';
          } else if (isPeak) {
            bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-700 hover:border-amber-500';
          }

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between transition-all text-start relative overflow-hidden group ${bgClass}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-text-base'}`}>{day}</span>
                {isCheapest && !isSelected && (
                  <span className="text-[9px] font-bold px-1 rounded bg-emerald-500 text-white">LOW</span>
                )}
                {isPeak && !isSelected && (
                  <span className="text-[9px] font-bold px-1 rounded bg-amber-500 text-white">PEAK</span>
                )}
              </div>
              <div className={`text-xs font-extrabold ${isSelected ? 'text-white' : isCheapest ? 'text-emerald-600' : isPeak ? 'text-amber-600' : 'text-text-muted'}`}>
                ${price}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
