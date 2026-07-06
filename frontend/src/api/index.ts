import api from './client';
import type {
  AuthResponse, User, Hotel, Room, Booking, PagedResponse,
  ChartDataPoint, DashboardStats, Notification, Coupon, Employee, Review, Housekeeping
} from '../types';

// Auth API
export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  refreshToken: (token: string) =>
    api.post<AuthResponse>('/auth/refresh', token),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  getMe: () => api.get<User>('/auth/me'),
  updateProfile: (data: { firstName: string; lastName: string; phone?: string }) =>
    api.put<User>('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Hotel API
export const hotelApi = {
  getAll: (page = 0, size = 12) =>
    api.get<PagedResponse<Hotel>>('/hotels', { params: { page, size } }),
  getById: (id: number) => api.get<Hotel>(`/hotels/${id}`),
  search: (params: {
    city?: string; minPrice?: number; maxPrice?: number;
    minRating?: number; sort?: string; page?: number; size?: number
  }) => api.get<PagedResponse<Hotel>>('/hotels/search', { params }),
  getFeatured: () => api.get<Hotel[]>('/hotels/featured'),
  getDestinations: () => api.get<string[]>('/hotels/destinations'),
  create: (data: Partial<Hotel>) => api.post<Hotel>('/hotels', data),
  update: (id: number, data: Partial<Hotel>) => api.put<Hotel>(`/hotels/${id}`, data),
  delete: (id: number) => api.delete(`/hotels/${id}`),
};

// Room API
export const roomApi = {
  getByHotel: (hotelId: number, params?: {
    roomType?: string; minPrice?: number; maxPrice?: number;
    maxGuests?: number; page?: number; size?: number
  }) => api.get<PagedResponse<Room>>(`/hotels/${hotelId}/rooms`, { params }),
  getById: (hotelId: number, roomId: number) =>
    api.get<Room>(`/hotels/${hotelId}/rooms/${roomId}`),
  getAllByHotel: (hotelId: number) =>
    api.get<Room[]>(`/hotels/${hotelId}/rooms/all`),
  getAvailable: (hotelId: number, checkIn: string, checkOut: string) =>
    api.get<Room[]>(`/hotels/${hotelId}/rooms/available`, { params: { checkIn, checkOut } }),
  create: (hotelId: number, data: Partial<Room>) =>
    api.post<Room>(`/hotels/${hotelId}/rooms`, data),
  update: (hotelId: number, roomId: number, data: Partial<Room>) =>
    api.put<Room>(`/hotels/${hotelId}/rooms/${roomId}`, data),
  delete: (hotelId: number, roomId: number) =>
    api.delete(`/hotels/${hotelId}/rooms/${roomId}`),
};

// Booking API
export const bookingApi = {
  create: (data: Partial<Booking>) => api.post<Booking>('/bookings', data),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`),
  getByReference: (ref: string) => api.get<Booking>(`/bookings/reference/${ref}`),
  getMyBookings: (page = 0, size = 10) =>
    api.get<PagedResponse<Booking>>('/bookings/my-bookings', { params: { page, size } }),
  checkAvailability: (hotelId: number, checkIn: string, checkOut: string) =>
    api.get<boolean>('/bookings/check-availability', { params: { hotelId, checkIn, checkOut } }),
  cancel: (id: number, reason?: string) =>
    api.put<Booking>(`/bookings/${id}/cancel`, { reason }),
};

// Payment API
export const paymentApi = {
  createIntent: (data: { bookingId: number; amount: number; currency?: string }) =>
    api.post<{ paymentIntentId: string; clientSecret: string }>('/payments/create-intent', data),
  confirm: (paymentIntentId: string) =>
    api.post('/payments/confirm', { paymentIntentId }),
};

// Review API
export const reviewApi = {
  getHotelReviews: (hotelId: number) =>
    api.get<Review[]>(`/reviews/hotel/${hotelId}`),
  getMyReviews: () => api.get<Review[]>('/reviews/my-reviews'),
  create: (data: Partial<Review>) => api.post<Review>('/reviews', data),
  like: (id: number) => api.post(`/reviews/${id}/like`),
  report: (id: number, reason: string) =>
    api.post(`/reviews/${id}/report`, { reason }),
};

// Wishlist API
export const wishlistApi = {
  get: () => api.get<Hotel[]>('/wishlist'),
  toggle: (hotelId: number) => api.post('/wishlist', { hotelId }),
  check: (hotelId: number) =>
    api.get<{ wishlisted: boolean }>(`/wishlist/check/${hotelId}`),
};

// Notification API
export const notificationApi = {
  getAll: (page = 0, size = 20) =>
    api.get<PagedResponse<Notification>>('/notifications', { params: { page, size } }),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAllAsRead: () => api.put('/notifications/read-all'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),
  getMonthlyStats: () => api.get<ChartDataPoint[]>('/admin/monthly-stats'),
  getAllBookings: (page = 0, size = 20, status?: string) =>
    api.get<PagedResponse<Booking>>('/admin/bookings', { params: { page, size, status } }),
  updateBookingStatus: (id: number, status: string) =>
    api.put<Booking>(`/admin/bookings/${id}/status`, { status }),
  getAllUsers: (page = 0, size = 20, search?: string) =>
    api.get<PagedResponse<User>>('/auth/admin/users', { params: { page, size, search } }),
};

// Amenity API
export const amenityApi = {
  getAll: () => api.get<{ id: number; name: string; icon?: string }[]>('/amenities'),
};

// Coupon API
export const couponApi = {
  getAll: () => api.get<Coupon[]>('/coupons'),
  validate: (code: string) => api.get(`/coupons/validate/${code}`),
  create: (data: Partial<Coupon>) => api.post<Coupon>('/coupons', data),
};

// Employee API
export const employeeApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: number) => api.get<Employee>(`/employees/${id}`),
  create: (data: Record<string, unknown>) => api.post<Employee>('/employees', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<Employee>(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

// Housekeeping API
export const housekeepingApi = {
  getByHotel: (hotelId: number, status?: string) =>
    api.get<Housekeeping[]>(`/housekeeping/hotel/${hotelId}`, { params: { status } }),
  updateStatus: (id: number, status: string) =>
    api.put(`/housekeeping/${id}/status`, { status }),
};

// Razorpay API
export const razorpayApi = {
  createOrder: (data: { amount: number; currency?: string }) =>
    api.post<{ orderId: string; amount: string; currency: string; keyId: string }>('/payments/razorpay/create-order', data),
  verifyPayment: (data: { orderId: string; paymentId: string; signature: string }) =>
    api.post('/payments/razorpay/verify', data),
};

// AI Chat API
export const aiApi = {
  chat: (message: string, history?: Array<{ role: string; content: string }>) =>
    api.post<{ response: string; timestamp: string }>('/ai/chat', { message, history }),
};

