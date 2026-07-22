import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Camera, User, Phone, ShieldCheck, PenTool, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSubmitCheckIn } from '../../hooks/useApi';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

interface DigitalCheckInFlowProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  bookingRef: string;
  hotelName: string;
}

export function DigitalCheckInFlow({ isOpen, onClose, bookingId, bookingRef, hotelName }: DigitalCheckInFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const submitCheckIn = useSubmitCheckIn();

  // Form State
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signature, setSignature] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    submitCheckIn.mutate({
      bookingId,
      data: {
        emergencyContactName,
        emergencyContactPhone,
        specialRequests,
        termsAccepted
      }
    }, {
      onSuccess: () => {
        setStep(8); // Success Step
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base mb-2">Booking Confirmation</h4>
            <div className="p-4 bg-bg-surface-hover rounded-xl">
              <p className="text-sm font-medium text-text-muted mb-1">Hotel</p>
              <p className="text-base font-bold text-text-base">{hotelName}</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-text-muted mb-1">Booking Reference</p>
                <p className="text-base font-bold text-text-base font-mono">{bookingRef}</p>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-4">
              Welcome to the pre-arrival digital check-in process. This will take approximately 2 minutes and will give you access to a Fast-Track QR pass.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-primary-500" /> Identity Verification
            </h4>
            <p className="text-sm text-text-muted mb-4">
              Please upload a clear picture of your Government Issued ID or Passport.
            </p>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${idUploaded ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-border-strong hover:border-primary-500'}`}
              onClick={() => setIdUploaded(true)}
            >
              {idUploaded ? (
                <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-10 h-10 mb-2" />
                  <p className="font-bold">ID Verified Successfully</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-text-muted cursor-pointer">
                  <Camera className="w-10 h-10 mb-3 text-primary-400" />
                  <p className="font-medium">Click to simulate ID upload</p>
                  <p className="text-xs mt-2">Maximum file size: 5MB</p>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary-500" /> Guest Details
            </h4>
            <p className="text-sm text-text-muted mb-4">
              Please verify your primary contact information.
            </p>
            <div className="space-y-3">
              <Input label="Email Address" value="guest@example.com" disabled />
              <Input label="Phone Number" defaultValue="+1 (555) 123-4567" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-primary-500" /> Emergency Contact
            </h4>
            <div className="space-y-3">
              <Input 
                label="Full Name" 
                placeholder="Jane Doe" 
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
              <Input 
                label="Phone Number" 
                placeholder="+1 (555) 987-6543" 
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base mb-2">Special Requests</h4>
            <p className="text-sm text-text-muted mb-4">
              Do you have any final requests before your arrival? (e.g. Late check-in, dietary restrictions)
            </p>
            <textarea
              className="w-full bg-bg-surface border border-border-base rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
              placeholder="Your requests..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary-500" /> Terms & Conditions
            </h4>
            <div className="h-40 overflow-y-auto bg-bg-surface-hover p-4 rounded-xl text-xs text-text-muted space-y-2 mb-4 border border-border-base">
              <p>By proceeding, you agree to the LuxuryStay terms of service.</p>
              <p>1. Check-in time is 3:00 PM. Check-out is 11:00 AM.</p>
              <p>2. A valid credit card is required for incidentals.</p>
              <p>3. The property is completely smoke-free.</p>
              <p>4. Damages to the room will be charged to the card on file.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-primary-600 rounded border-border-strong focus:ring-primary-500"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-sm text-text-base font-medium">
                I have read and agree to the Terms & Conditions and Hotel Policies.
              </span>
            </label>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-base flex items-center gap-2 mb-2">
              <PenTool className="w-5 h-5 text-primary-500" /> Digital Signature
            </h4>
            <p className="text-sm text-text-muted mb-4">
              Please provide your digital signature to complete the check-in process.
            </p>
            <div 
              className={`border-2 border-dashed rounded-xl h-40 flex items-center justify-center cursor-pointer transition-colors ${signature ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border-strong hover:border-primary-500'}`}
              onClick={() => setSignature(true)}
            >
              {signature ? (
                <span className="font-[cursive] text-2xl text-primary-700 dark:text-primary-300">Signed Electronically</span>
              ) : (
                <span className="text-text-muted text-sm font-medium">Click here to sign</span>
              )}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-2xl font-bold text-text-base">Check-In Submitted!</h4>
            <p className="text-text-muted max-w-sm mx-auto">
              Your details have been securely sent to the hotel. Once verified by our staff, your Digital Pass will be available in your dashboard.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (step === 2 && !idUploaded) return true;
    if (step === 4 && (!emergencyContactName || !emergencyContactPhone)) return true;
    if (step === 6 && !termsAccepted) return true;
    if (step === 7 && !signature) return true;
    return false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 sm:p-8">
        {step < 8 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-600"
                initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {step < 8 ? (
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-border-base">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : handlePrev}
            >
              {step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 me-2" /> Back</>}
            </Button>
            
            {step === totalSteps ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isNextDisabled() || submitCheckIn.isPending}
              >
                {submitCheckIn.isPending ? <Spinner size="sm" className="me-2" /> : null}
                Complete Check-In
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isNextDisabled()}>
                Next <ChevronRight className="w-4 h-4 ms-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-border-base flex justify-center">
            <Button onClick={onClose} fullWidth>Return to Dashboard</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
