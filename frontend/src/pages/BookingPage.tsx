import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Users, MapPin, ArrowLeft, CheckCircle, Shield, CreditCard, Lock, Info, Star, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useHotel, useCreateBooking } from '../hooks/useApi';
import { bookingSchema, type BookingFormData } from '../validation/schemas';
import { BookingSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { razorpayApi } from '../api';
import { loadRazorpay } from '../utils/razorpay';
import { usePageTitle } from '../hooks/usePageTitle';
import { useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

export default function BookingPage() {
  usePageTitle('Secure Checkout');
  const [searchParams] = useSearchParams();
  const hotelId = Number(searchParams.get('hotelId')) || 1;
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const { data: hotelData, isLoading } = useHotel(hotelId);
  const createBooking = useCreateBooking();
  const hotel = hotelData?.data;

  const [step, setStep] = usePersistentState(`booking_step_${hotelId}`, 1);
  const [couponDiscount, setCouponDiscount] = usePersistentState(`booking_discount_${hotelId}`, 0);

  const savedForm = sessionStorage.getItem(`booking_form_${hotelId}`);
  const initialForm = savedForm ? JSON.parse(savedForm) : null;

  const { register, watch, formState: { errors }, trigger, getValues, reset } = useForm<BookingFormData>({
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

  const pricePerNight = hotel?.startingPrice || 450;
  const subtotal = pricePerNight * nights;
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
      // 1. Create order on backend
      const orderResponse = await razorpayApi.createOrder({
        amount: total,
        currency: 'USD',
      });

      const orderData = orderResponse.data;

      // 2. Load Razorpay script
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // 3. Initialize Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LuxuryStay',
        description: `Booking at ${hotel?.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            await razorpayApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            // Create booking record
            await createBooking.mutateAsync({
              hotelId,
              checkInDate: data.checkIn,
              checkOutDate: data.checkOut,
              guestCount: data.guests,
              totalAmount: total,
              specialRequests: data.specialRequests,
            } as any);

            toast.success('Booking confirmed successfully!');
            setStep(4);
            // Clear storage upon successful booking
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
          color: '#0f172a',
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-gray-100 shadow-elevated">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-8">
            Thank you for choosing LuxuryStay. Your booking reference has been sent to your email.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-8 space-y-2 border border-gray-100">
            <p className="text-sm"><span className="text-gray-500">Hotel:</span> <span className="font-medium text-gray-900">{hotel?.name}</span></p>
            <p className="text-sm"><span className="text-gray-500">Dates:</span> <span className="font-medium text-gray-900">{watchCheckIn} to {watchCheckOut}</span></p>
            <p className="text-sm"><span className="text-gray-500">Guests:</span> <span className="font-medium text-gray-900">{watch('guests')} Adults</span></p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">View My Bookings</button>
            <button onClick={() => navigate('/')} className="btn-ghost w-full">Return Home</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container-section">
        {/* Step Indicator */}
        <div className="max-w-3xl mx-auto mb-10 mt-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-secondary rounded-full -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  step > num ? 'bg-secondary text-white' : step === num ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                <span className={`text-xs font-medium ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>
                  {num === 1 ? 'Dates' : num === 2 ? 'Details' : 'Payment'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                    <h2 className="text-xl font-bold text-gray-900">Your Stay Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Check-in Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="date" {...register('checkIn')} className={`input-field pl-10 ${errors.checkIn ? 'input-error' : ''}`} min={new Date().toISOString().split('T')[0]} />
                      </div>
                      {errors.checkIn && <p className="text-danger text-xs mt-1">{errors.checkIn.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Check-out Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="date" {...register('checkOut')} className={`input-field pl-10 ${errors.checkOut ? 'input-error' : ''}`} min={watchCheckIn || new Date().toISOString().split('T')[0]} />
                      </div>
                      {errors.checkOut && <p className="text-danger text-xs mt-1">{errors.checkOut.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Adults</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select {...register('guests', { valueAsNumber: true })} className="input-field pl-10">
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Children</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select {...register('children', { valueAsNumber: true })} className="input-field pl-10">
                          {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button onClick={handleNext} className="btn-primary">
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                    <h2 className="text-xl font-bold text-gray-900">Guest Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">First Name</label>
                      <input type="text" {...register('firstName')} className={`input-field ${errors.firstName ? 'input-error' : ''}`} placeholder="John" />
                      {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Last Name</label>
                      <input type="text" {...register('lastName')} className={`input-field ${errors.lastName ? 'input-error' : ''}`} placeholder="Doe" />
                      {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
                      <input type="email" {...register('email')} className={`input-field ${errors.email ? 'input-error' : ''}`} placeholder="john@example.com" />
                      {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                      <input type="tel" {...register('phone')} className={`input-field ${errors.phone ? 'input-error' : ''}`} placeholder="+1 (555) 000-0000" />
                      {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Special Requests (Optional)</label>
                      <textarea {...register('specialRequests')} rows={3} className="input-field resize-none" placeholder="Allergies, late arrival, extra pillows..."></textarea>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                    <button onClick={handleNext} className="btn-primary">Proceed to Payment <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <button onClick={() => setStep(2)} className="p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                    <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                  </div>

                  <div className="bg-success-light/30 border border-success-light rounded-xl p-4 mb-6 flex gap-3">
                    <Shield className="w-5 h-5 text-success shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-success-dark">Secure Payment</p>
                      <p className="text-xs text-success-dark/70">All card information is fully encrypted, secure, and protected.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-secondary transition-colors relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4"><div className="w-4 h-4 rounded-full border-4 border-secondary"></div></div>
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Pay with Razorpay</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-8">Credit Card, Debit Card, Netbanking, UPI</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                    <button onClick={handlePayment} className="btn-primary bg-green-600 hover:bg-green-700 border-none">
                      <Lock className="w-4 h-4 mr-1" /> Pay ${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Order Summary</h3>
              
              <div className="flex gap-4 mb-6">
                <img src={hotel?.logoUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop'} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 text-secondary fill-secondary" />
                    <span className="text-xs font-bold">{hotel?.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{hotel?.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {hotel?.city}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-medium text-gray-900">{watchCheckIn || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-medium text-gray-900">{watchCheckOut || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium text-gray-900">{watch('guests')} Adults{watch('children') > 0 ? `, ${watch('children')} Children` : ''}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>${pricePerNight} × {nights} nights</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">Taxes (10%) <Info className="w-3 h-3 text-gray-400" /></span>
                  <span>${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">Service Fee (5%) <Info className="w-3 h-3 text-gray-400" /></span>
                  <span>${serviceCharge.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success font-medium">
                    <span>Discount</span>
                    <span>-${couponDiscount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                )}
              </div>

              {step < 3 && (
                <div className="mb-6 pt-6 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Have a coupon?</p>
                  <div className="flex gap-2">
                    <input type="text" {...register('couponCode')} placeholder="e.g. LUXURY20" className="input-field text-sm uppercase flex-1 py-2" />
                    <button type="button" onClick={handleApplyCoupon} className="btn-secondary py-2 px-4 text-sm shrink-0">Apply</button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-end justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Total Amount</span>
                  <span className="text-xs text-gray-400">Includes all taxes and fees</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
