export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: string;
  enabled: boolean;
  emailVerified: boolean;
  loyaltyPoints: number;
  createdAt?: string;
  emailBookings?: boolean;
  emailPromotions?: boolean;
  pushBookings?: boolean;
  pushPromotions?: boolean;
  referralCode?: string;
  referredByCode?: string;
  
  // Corporate Fields
  companyId?: number;
  companyRole?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  travelBudget?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber: string;
  email: string;
  rating: number;
  totalReviews: number;
  startingPrice: number;
  logoUrl?: string;
  starRating: number;
  policies?: string;
  active: boolean;
  images?: HotelImage[];
  amenities?: Amenity[];
}

export interface HotelImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Room {
  id: number;
  hotelId: number;
  name: string;
  description: string;
  roomType: string;
  pricePerNight: number;
  maxGuests: number;
  maxChildren: number;
  bedCount: number;
  bedType?: string;
  floor: number;
  size: number;
  view?: string;
  status: string;
  cleaningStatus: string;
  active: boolean;
  roomNumber: number;
  weekendPrice?: number;
  holidayPrice?: number;
  amenities?: string[];
  images?: string[];
}

export interface Booking {
  id: number;
  bookingReference: string;
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  childrenCount: number;
  status: string;
  totalAmount: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  couponCode?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  hotelName?: string;
  guestName?: string;
  user?: User;
  hotel?: Hotel;
}

export interface Company {
  id: number;
  name: string;
  companyCode: string;
  taxId: string;
  contactEmail: string;
  status: string;
  industry?: string;
  website?: string;
  employeeLimit?: number;
  companySize?: string;
  country?: string;
  timeZone?: string;
  preferredCurrency?: string;
  billingAddress?: string;
  createdAt: string;
}

export interface CompanyInvitation {
  id: number;
  companyId: number;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string;
  createdByUserName: string;
  createdAt: string;
}

export interface CorporateAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  totalBookings: number;
  monthlySpend: number;
  averageBookingValue: number;
  spendByDepartment: { department: string; spend: number }[];
  topDestinations: { destination: string; bookingCount: number }[];
}

export type CheckInStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'CHECKED_IN';

export interface CheckIn {
  id?: number;
  bookingId: number;
  status: CheckInStatus;
  submittedAt?: string;
  verifiedAt?: string;
  termsAccepted: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialRequests?: string;
  qrToken?: string;
}

export type TransactionType = 'BOOKING_PAYMENT' | 'REFUND' | 'CASHBACK' | 'REWARD_CREDIT' | 'REWARD_REDEMPTION' | 'COUPON_CREDIT' | 'PROMOTIONAL_BONUS' | 'ROOM_SERVICE_CHARGE' | 'RESTAURANT_CHARGE' | 'SPA_CHARGE' | 'ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface WalletTransaction {
  id?: number;
  walletId: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  referenceId?: string;
  description?: string;
  timestamp: string;
}

export interface Wallet {
  id?: number;
  userId: number;
  balance: number;
  rewardPoints: number;
  loyaltyTier: string;
  tierProgress: number;
  transactions: WalletTransaction[];
}

export interface Referral {
  id: number;
  referredUserName: string;
  status: string;
  rewardPoints: number;
  createdAt: string;
}

export interface ReferralMetrics {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number;
}

export interface Amenity {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Payment {
  id: number;
  paymentId: string;
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface Review {
  id?: number;
  hotelId: number;
  roomId?: number;
  bookingId?: number;
  rating: number;
  cleanlinessRating?: number;
  serviceRating?: number;
  locationRating?: number;
  valueRating?: number;
  comment: string;
  photos?: string[];
  userName?: string;
  userImage?: string;
  roomName?: string;
  createdAt?: string;
  verified?: boolean;
  likes?: number;
  reply?: string;
  repliedByName?: string;
}

export interface ReviewAnalytics {
  hotelId: number;
  totalReviews: number;
  averageRating: number;
  averageCleanliness: number;
  averageService: number;
  averageLocation: number;
  averageValue: number;
  ratingDistribution: Record<number, number>;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardStats {
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  totalCustomers: number;
  totalEmployees: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeBookings: number;
  occupancyRate: number;
  averageRating: number;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  bookings: number;
  occupancy: number;
  totalRooms: number;
}

export interface Notification {
  id: string | number;
  title?: string;
  message: string;
  type: 'BOOKING_NEW' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'ROOM_UPDATE' | 'SYSTEM_ALERT' | string;
  read: boolean;
  link?: string;
  referenceId?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountAmount: number;
  percentageDiscount: boolean;
  maxDiscount?: number;
  minBookingAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Employee {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  hotelId: number;
  position: string;
  salary: number;
  joinDate: string;
  shift?: string;
  active: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface Housekeeping {
  id: number;
  roomId: number;
  roomName: string;
  assignedToId?: number;
  assignedToName?: string;
  status: string;
  notes?: string;
  inspectionRequired: boolean;
  inspectionPassed: boolean;
  inspectionNotes?: string;
}
