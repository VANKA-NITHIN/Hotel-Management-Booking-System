import { Sun, CloudRain, Cloud, CloudSun, Thermometer } from 'lucide-react';

interface WeatherWidgetProps {
  city?: string;
}

interface DayForecast {
  day: string;
  tempHigh: number;
  tempLow: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Cloudy';
  icon: typeof Sun;
}

export function WeatherWidget({ city = 'Maldives' }: WeatherWidgetProps) {
  const forecast: DayForecast[] = [
    { day: 'Today', tempHigh: 28, tempLow: 22, condition: 'Sunny', icon: Sun },
    { day: 'Tomorrow', tempHigh: 27, tempLow: 21, condition: 'Partly Cloudy', icon: CloudSun },
    { day: 'Wed', tempHigh: 26, tempLow: 20, condition: 'Rainy', icon: CloudRain },
    { day: 'Thu', tempHigh: 29, tempLow: 23, condition: 'Sunny', icon: Sun },
    { day: 'Fri', tempHigh: 28, tempLow: 22, condition: 'Cloudy', icon: Cloud },
  ];

  return (
    <div className="bg-bg-surface rounded-2xl border border-border-base p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-base">
        <div>
          <h4 className="font-serif font-bold text-base text-text-base flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-500" />
            Destination Weather — {city}
          </h4>
          <p className="text-xs text-text-muted mt-0.5">5-day atmospheric forecast & packing climate insight</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full">
          28°C / 82°F
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {forecast.map((day) => {
          const IconComp = day.icon;
          return (
            <div
              key={day.day}
              className="p-2.5 rounded-xl bg-bg-surface-hover/60 border border-border-base/40 text-center flex flex-col items-center justify-between"
            >
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{day.day}</span>
              <IconComp className="w-5 h-5 my-1 text-primary" />
              <div>
                <span className="text-xs font-extrabold text-text-base block">{day.tempHigh}°</span>
                <span className="text-[10px] text-text-muted block">{day.tempLow}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
