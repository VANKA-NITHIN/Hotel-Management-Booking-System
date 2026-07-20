import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, MapPin, ArrowLeft, CheckCircle, Shield, CreditCard, Lock, Info, Star, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useHotel, useRooms, useCreateBooking } from '../hooks/useApi';
import { bookingSchema, type BookingFormData } from '../validation/schemas';
import { BookingSkeleton } from '../components/ui/Skeleton';
import type { Room } from '../types';
import toast from 'react-hot-toast';
import { razorpayApi } from '../api';
import { loadRazorpay } from '../utils/razorpay';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePersistentState } from '../hooks/usePersistentState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { OptimizedImage } from '../components/ui/Image';

export default function BookingPage() {
  usePageTitle('Secure Checkout');
  const [searchParams] = useSearchParams();
  const hotelId = Number(searchParams.get('hotelId')) || 1;
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const { data: hotelData, isLoading } = useHotel(hotelId);
  const { data: roomsData } = useRooms(hotelId);
  const createBooking = useCreateBooking();
  const hotel = hotelData?.data;
  const allRooms = (roomsData?.data?.content || []) as Room[];

  const rawRoomIds = searchParams.get('roomId');
  const selectedRoomIds = rawRoomIds ? rawRoomIds.split(',').map(Number) : [];
  const selectedRooms = allRooms.filter(r => selectedRoomIds.includes(r.id!));

  const [step, setStep] = usePersistentState(`booking_step_${hotelId}`, 1);
  const [couponDiscount, setCouponDiscount] = usePersistentState(`booking_discount_${hotelId}`, 0);

  const savedForm = sessionStorage.getItem(`booking_form_${hotelId}`);
  const initialForm = savedForm ? JSON.parse(savedForm) : null;

  const { register, watch, formState: { errors }, trigger, getValues, setValue } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: initialForm || {
      guests: Number(searchParams.get('guests')) || 2,
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      children: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
      couponCode: '',
    },
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    sessionStorage.setItem(`booking_form_${hotelId}`, JSON.stringify(formValues));
  }, [formValues, hotelId]);

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  const nights = watchCheckIn && watchCheckOut
    ? Math.max(1, Math.ceil((new Date(watchCheckOut).getTime() - new Date(watchCheckIn).getTime()) / 86400000))
    : 1;

  // If rooms are selected, sum their prices. Otherwise fallback to hotel starting price.
  let pricePerNight = 0;
  if (selectedRooms.length > 0) {
    pricePerNight = selectedRooms.reduce((sum, room) => sum + room.pricePerNight, 0);
  } else {
    pricePerNight = hotel?.startingPrice || 450;
  }
    
  // Dynamic Pricing Calculation
  let subtotal = 0;
  let hasWeekendSurcharge = false;
  let weekendSurchargeAmount = 0;

  if (watchCheckIn && watchCheckOut && nights > 0) {
    const start = new Date(watchCheckIn);
    for (let i = 0; i < nights; i++) {
      const current = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const day = current.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      if (day === 5 || day === 6) {
        subtotal += pricePerNight * 1.2;
        weekendSurchargeAmount += pricePerNight * 0.2;
        hasWeekendSurcharge = true;
      } else {
        subtotal += pricePerNight;
      }
    }
  } else {
    subtotal = pricePerNight * nights;
  }

  const tax = subtotal * 0.10;
  const serviceCharge = subtotal * 0.05;
  const total = subtotal + tax + serviceCharge - couponDiscount;

  const handleNext = async () => {
    let fieldsToValidate: (keyof BookingFormData)[] = [];
    if (step === 1) fieldsToValidate = ['checkIn', 'checkOut', 'guests'];
    else if (step === 2) fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
  };

  const handleApplyCoupon = () => {
    const code = getValues('couponCode');
    if (code?.toUpperCase() === 'LUXURY20') {
      setCouponDiscount(subtotal * 0.20);
      toast.success('Coupon applied! 20% discount.');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handlePayment = async () => {
    const data = getValues();
    if (!isSignedIn) {
      toast.error('Please sign in to complete your booking');
      navigate('/sign-in');
      return;
    }

    try {
      const orderResponse = await razorpayApi.createOrder({
        amount: Math.round(total * 100),
        currency: 'USD',
      });

      const orderData = orderResponse.data;

      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LuxuryStay',
        description: `Booking at ${hotel?.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            await razorpayApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            await createBooking.mutateAsync({
              hotelId,
              roomIds: selectedRoomIds.length > 0 ? selectedRoomIds : undefined,
              checkInDate: data.checkIn,
              checkOutDate: data.checkOut,
              guestCount: data.guests,
              totalAmount: total,
              specialRequests: data.specialRequests,
            } as any);

            toast.success('Booking confirmed successfully!');
            setStep(4);
            sessionStorage.removeItem(`booking_form_${hotelId}`);
            sessionStorage.removeItem(`booking_step_${hotelId}`);
            sessionStorage.removeItem(`booking_discount_${hotelId}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: '#111827', // Matching dark theme
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch {
      toast.error('Failed to initiate payment');
    }
  };

  if (isLoading) return <BookingSkeleton />;

  if (step === 4) {
    return (
      <div className="min-h-screen bg-bg-surface-hover flex flex-col items-center justify-center py-20 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-bg-surface rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center border border-border-base shadow-elevated">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-base mb-3">Booking Confirmed!</h1>
          <p className="text-text-muted mb-8 text-lg">
            Thank you for choosing LuxuryStay. Your booking reference has been sent to your email.
          </p>
          <div className="bg-bg-surface-hover rounded-2xl p-6 text-left mb-10 space-y-3 border border-border-base">
            <p className="text-sm"><span className="text-text-muted inline-block w-20">Hotel:</span> <span className="font-bold text-text-base">{hotel?.name}</span></p>
            <p className="text-sm"><span className="text-text-muted inline-block w-20">Dates:</span> <span className="font-bold text-text-base">{watchCheckIn} to {watchCheckOut}</span></p>
            <p className="text-sm"><span className="text-text-muted inline-block w-20">Guests:</span> <span className="font-bold text-text-base">{watch('guests')} Adults</span></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => navigate('/dashboard')} className="flex-1">View My Bookings</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')} className="flex-1">Return Home</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-[72px] pb-24">
      <div className="container-section">
        {/* Step Indicator */}
        <div className="max-w-2xl mx-auto mb-12 mt-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border-base rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 ${
                  step > num ? 'bg-primary text-white shadow-md' : step === num ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md scale-110' : 'bg-bg-surface text-text-muted border-2 border-border-strong'
                }`}>
                  {step > num ? <Check className="w-6 h-6" /> : num}
                </div>
                <span className={`hidden sm:block text-xs font-bold uppercase tracking-wider ${step >= num ? 'text-text-base' : 'text-text-muted'}`}>
                  {num === 1 ? 'Dates' : num === 2 ? 'Details' : 'Payment'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Main Form Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-bg-surface rounded-2xl p-6 sm:p-10 border border-border-base shadow-sm">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-base">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-bg-surface-hover text-text-muted hover:text-text-base transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                    <h2 className="text-2xl font-serif font-bold text-text-base">Your Stay Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <DatePicker
                        label="Check-in Date"
                        minDate={new Date().toISOString().split('T')[0]}
                        value={watchCheckIn}
                        onChange={(e) => setValue('checkIn', e.target.value, { shouldValidate: true })}
                        error={errors.checkIn?.message}
                      />
                    </div>
                    <div>
                      <DatePicker
                        label="Check-out Date"
                        minDate={watchCheckIn || new Date().toISOString().split('T')[0]}
                        value={watchCheckOut}
                        onChange={(e) => setValue('checkOut', e.target.value, { shouldValidate: true })}
                        error={errors.checkOut?.message}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Adults</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select {...register('guests', { valueAsNumber: true })} className="w-full bg-bg-surface border border-border-base hover:border-border-strong rounded-lg pl-10 pr-4 py-3 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors">
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Children</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select {...register('children', { valueAsNumber: true })} className="w-full bg-bg-surface border border-border-base hover:border-border-strong rounded-lg pl-10 pr-4 py-3 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors">
                          {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <Button size="lg" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-bg-surface rounded-2xl p-6 sm:p-10 border border-border-base shadow-sm">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-base">
                    <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-full hover:bg-bg-surface-hover text-text-muted hover:text-text-base transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                    <h2 className="text-2xl font-serif font-bold text-text-base">Guest Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="First Name"
                        placeholder="John"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                      />
                    </div>
                    <div>
                      <Input
                        label="Last Name"
                        placeholder="Doe"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                      />
                    </div>
                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                    </div>
                    <div>
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-text-base mb-2 block">Special Requests (Optional)</label>
                      <textarea 
                        {...register('specialRequests')} 
                        rows={4} 
                        className="w-full bg-bg-surface border border-border-base hover:border-border-strong rounded-lg p-4 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors resize-none" 
                        placeholder="Allergies, late arrival, extra pillows..."
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}>Back</Button>
                    <Button size="lg" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                      Proceed to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-bg-surface rounded-2xl p-6 sm:p-10 border border-border-base shadow-sm">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-base">
                    <button onClick={() => setStep(2)} className="p-2 -ml-2 rounded-full hover:bg-bg-surface-hover text-text-muted hover:text-text-base transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                    <h2 className="text-2xl font-serif font-bold text-text-base">Payment</h2>
                  </div>

                  <div className="bg-success/10 border border-success/20 rounded-xl p-5 mb-8 flex gap-4">
                    <Shield className="w-6 h-6 text-success shrink-0" />
                    <div>
                      <p className="font-bold text-success">Secure Payment</p>
                      <p className="text-sm text-success font-medium mt-1">All card information is fully encrypted, secure, and protected.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-primary bg-primary/5 rounded-xl p-5 cursor-pointer relative overflow-hidden transition-all shadow-sm">
                      <div className="absolute top-5 right-5"><div className="w-5 h-5 rounded-full border-[5px] border-primary bg-white"></div></div>
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-6 h-6 text-primary" />
                        <span className="font-bold text-text-base text-lg">Pay with Razorpay</span>
                      </div>
                      <p className="text-sm text-text-muted font-medium ml-9">Credit Card, Debit Card, Netbanking, UPI</p>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}>Back</Button>
                    <Button 
                      size="lg" 
                      onClick={handlePayment} 
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-white border-none shadow-lg shadow-green-500/20"
                      icon={<Lock className="w-4 h-4" />}
                    >
                      Pay ${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:w-[400px] shrink-0">
            <div className="bg-bg-surface rounded-2xl border border-border-base p-6 lg:p-8 sticky top-24 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-text-base mb-6 pb-6 border-b border-border-base">Order Summary</h3>
              
              <div className="flex gap-4 mb-8">
                <OptimizedImage src={hotel?.logoUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop'} alt="" className="w-24 h-24 rounded-xl object-cover" containerClassName="w-24 h-24 rounded-xl shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                    <span className="text-xs font-bold text-text-base">{hotel?.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  <h4 className="font-bold text-text-base line-clamp-2 leading-snug">{hotel?.name}</h4>
                  <p className="text-sm text-text-muted mt-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {hotel?.city}</p>
                </div>
              </div>

              <div className="bg-bg-surface-hover rounded-xl p-5 mb-8 space-y-3 border border-border-base">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Check-in</span>
                  <span className="font-bold text-text-base">{watchCheckIn || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Check-out</span>
                  <span className="font-bold text-text-base">{watchCheckOut || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Guests</span>
                  <span className="font-bold text-text-base">{watch('guests')} Adults{watch('children') > 0 ? `, ${watch('children')} Children` : ''}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between text-text-base">
                  <span>${pricePerNight.toLocaleString()} × {nights} nights</span>
                  <span className="font-medium">${(pricePerNight * nights).toLocaleString()}</span>
                </div>
                {hasWeekendSurcharge && (
                  <div className="flex justify-between text-warning">
                    <span className="flex items-center gap-1.5">Weekend Surcharge (+20%)</span>
                    <span className="font-medium">+${weekendSurchargeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-base">
                  <span className="flex items-center gap-1.5">Taxes (10%) <Info className="w-3.5 h-3.5 text-text-muted" /></span>
                  <span className="font-medium">${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-text-base">
                  <span className="flex items-center gap-1.5">Service Fee (5%) <Info className="w-3.5 h-3.5 text-text-muted" /></span>
                  <span className="font-medium">${serviceCharge.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success font-bold bg-success/10 p-2 -mx-2 rounded-lg">
                    <span>Discount</span>
                    <span>-${couponDiscount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                )}
              </div>

              {step < 3 && (
                <div className="mb-8 pt-8 border-t border-border-base">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Have a coupon?</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. LUXURY20" 
                      {...register('couponCode')}
                      className="uppercase"
                    />
                    <Button variant="secondary" onClick={handleApplyCoupon} className="shrink-0">Apply</Button>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border-strong flex items-end justify-between">
                <div>
                  <span className="text-base font-bold text-text-base block">Total Amount</span>
                  <span className="text-xs font-medium text-text-muted mt-1 block">Includes all taxes and fees</span>
                </div>
                <span className="text-3xl font-bold text-text-base">${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
