import { Clock, Check, XCircle } from 'lucide-react';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface BookingTimelineProps {
  status: BookingStatus;
  className?: string;
}

const steps = [
  { id: 'PENDING', label: 'Booking Placed', description: 'Waiting for payment' },
  { id: 'CONFIRMED', label: 'Confirmed', description: 'Payment received' },
  { id: 'CHECKED_IN', label: 'Checked In', description: 'Enjoy your stay' },
  { id: 'COMPLETED', label: 'Completed', description: 'Checkout successful' },
];

export function BookingTimeline({ status, className = '' }: BookingTimelineProps) {
  const getStepStatus = (stepId: string, currentStatus: BookingStatus) => {
    if (currentStatus === 'CANCELLED') {
      return stepId === 'PENDING' ? 'completed' : 'cancelled';
    }
    
    const currentIndex = steps.findIndex(s => s.id === currentStatus);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Connecting Line */}
      <div className="absolute top-5 left-6 right-6 h-0.5 bg-border-base hidden sm:block" />
      
      <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-4 relative z-10">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id, status);
          
          return (
            <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 text-left sm:text-center group">
              {/* Vertical line for mobile */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[1.125rem] top-10 bottom-[-1.5rem] w-0.5 bg-border-base sm:hidden -z-10" />
              )}
              
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors
                ${stepStatus === 'completed' ? 'bg-success text-white border-success' : ''}
                ${stepStatus === 'current' ? 'bg-bg-surface text-primary border-primary shadow-sm' : ''}
                ${stepStatus === 'upcoming' ? 'bg-bg-surface text-text-muted border-border-strong' : ''}
                ${stepStatus === 'cancelled' && index > 0 ? 'bg-danger text-white border-danger' : ''}
              `}>
                {stepStatus === 'completed' && <Check className="w-5 h-5" />}
                {stepStatus === 'current' && <Clock className="w-5 h-5 animate-pulse-soft" />}
                {stepStatus === 'upcoming' && <div className="w-2.5 h-2.5 rounded-full bg-border-strong group-hover:bg-text-muted transition-colors" />}
                {stepStatus === 'cancelled' && <XCircle className="w-5 h-5" />}
              </div>
              
              <div>
                <h4 className={`text-sm font-bold ${
                  stepStatus === 'current' ? 'text-primary' : 
                  stepStatus === 'completed' ? 'text-text-base' : 
                  stepStatus === 'cancelled' && index > 0 ? 'text-danger' : 'text-text-muted'
                }`}>
                  {status === 'CANCELLED' && index === 1 ? 'Cancelled' : step.label}
                </h4>
                <p className="text-xs text-text-muted mt-0.5 sm:mx-auto max-w-[120px]">
                  {status === 'CANCELLED' && index === 1 ? 'Booking was cancelled' : step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
