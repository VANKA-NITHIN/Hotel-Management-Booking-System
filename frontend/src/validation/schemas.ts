import { z } from 'zod';

// Booking form schema
export const bookingSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests'),
  children: z.number().min(0).max(4, 'Maximum 4 children'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  specialRequests: z.string().max(1000, 'Special requests too long').optional(),
  couponCode: z.string().max(50).optional(),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return new Date(data.checkOut) > new Date(data.checkIn);
  }
  return true;
}, { message: 'Check-out must be after check-in', path: ['checkOut'] });

export type BookingFormData = z.infer<typeof bookingSchema>;

// Profile update schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Hotel search schema
export const hotelSearchSchema = z.object({
  city: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(1).max(5).optional(),
  sort: z.enum(['price_low', 'price_high', 'rating', 'name', '']).optional(),
});

export type HotelSearchFormData = z.infer<typeof hotelSearchSchema>;

// Review schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Maximum rating is 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review too long'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Coupon validation schema
export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50),
});

export type CouponFormData = z.infer<typeof couponSchema>;

// Employee schema
export const employeeSchema = z.object({
  userId: z.number().min(1, 'User is required'),
  hotelId: z.number().min(1, 'Hotel is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.number().min(0, 'Salary must be positive'),
  shift: z.string().optional(),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(20).optional(),
  emergencyContactName: z.string().max(200).optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// Hotel management schema (admin)
export const hotelManageSchema = z.object({
  name: z.string().min(1, 'Hotel name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(1, 'Address is required').max(300),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  zipCode: z.string().max(20).optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20),
  email: z.string().email('Invalid email').max(150),
  starRating: z.number().min(1).max(5).optional(),
  startingPrice: z.number().min(0).optional(),
  policies: z.string().max(2000).optional(),
});

export type HotelManageFormData = z.infer<typeof hotelManageSchema>;

// Room management schema (admin)
export const roomManageSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  roomType: z.enum(['LUXURY_SUITE', 'DELUXE', 'EXECUTIVE', 'STANDARD', 'FAMILY_ROOM', 'VILLA', 'PENTHOUSE']),
  pricePerNight: z.number().min(0.01, 'Price must be greater than 0'),
  maxGuests: z.number().min(1, 'At least 1 guest').max(20),
  bedCount: z.number().min(1, 'At least 1 bed').max(10),
  bedType: z.string().max(100).optional(),
  floor: z.number().min(0).optional(),
  size: z.number().min(0).optional(),
  view: z.string().max(200).optional(),
  roomNumber: z.number().min(0).optional(),
});

export type RoomManageFormData = z.infer<typeof roomManageSchema>;
