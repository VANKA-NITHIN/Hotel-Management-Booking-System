import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelApi, roomApi, bookingApi, reviewApi, wishlistApi, adminApi, notificationApi, employeeApi, housekeepingApi, authApi, contactApi, newsletterApi } from '../api';
import type { Hotel, Room } from '../types';

// Hotels
export function useHotels(page = 0, size = 12) {
  return useQuery({
    queryKey: ['hotels', page, size],
    queryFn: () => hotelApi.getAll(page, size),
  });
}

export function useHotel(id: number) {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelApi.getById(id),
    enabled: !!id,
  });
}

export function useFeaturedHotels() {
  return useQuery({
    queryKey: ['featuredHotels'],
    queryFn: () => hotelApi.getFeatured(),
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelApi.getDestinations(),
  });
}

export function useSearchHotels(params: {
  city?: string; minPrice?: number; maxPrice?: number;
  minRating?: number; sort?: string; page?: number; size?: number;
}) {
  return useQuery({
    queryKey: ['searchHotels', params],
    queryFn: () => hotelApi.search(params),
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hotelApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels'] }),
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Hotel> }) => hotelApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', variables.id] });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hotelApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels'] }),
  });
}

// Rooms
export function useRooms(hotelId: number, params?: {
  roomType?: string; minPrice?: number; maxPrice?: number;
  maxGuests?: number; page?: number; size?: number;
}) {
  return useQuery({
    queryKey: ['rooms', hotelId, params],
    queryFn: () => roomApi.getByHotel(hotelId, params),
    enabled: !!hotelId,
  });
}

export function useAllRooms(hotelId: number) {
  return useQuery({
    queryKey: ['rooms', 'all', hotelId],
    queryFn: () => roomApi.getAllByHotel(hotelId),
    enabled: !!hotelId,
  });
}

export function useAvailableRooms(hotelId: number, checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: ['availableRooms', hotelId, checkIn, checkOut],
    queryFn: () => roomApi.getAvailable(hotelId, checkIn, checkOut),
    enabled: !!hotelId && !!checkIn && !!checkOut,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hotelId, data }: { hotelId: number; data: Partial<Room> }) => roomApi.create(hotelId, data),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['rooms', variables.hotelId] }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hotelId, roomId, data }: { hotelId: number; roomId: number; data: Partial<Room> }) => roomApi.update(hotelId, roomId, data),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['rooms', variables.hotelId] }),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hotelId, roomId }: { hotelId: number; roomId: number }) => roomApi.delete(hotelId, roomId),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['rooms', variables.hotelId] }),
  });
}

// Bookings
export function useMyBookings(page = 0, size = 10) {
  return useQuery({
    queryKey: ['myBookings', page, size],
    queryFn: () => bookingApi.getMyBookings(page, size),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => bookingApi.cancel(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
  });
}

// Reviews
export function useHotelReviews(hotelId: number) {
  return useQuery({
    queryKey: ['hotelReviews', hotelId],
    queryFn: () => reviewApi.getHotelReviews(hotelId),
    enabled: !!hotelId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.create,
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['hotelReviews', variables.hotelId] }),
  });
}

// Wishlist
export function useWishlist(enabled = true) {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get(),
    enabled,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hotelId: number) => wishlistApi.toggle(hotelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

// Admin
export function useDashboardStats(hotelId?: number) {
  return useQuery({
    queryKey: ['dashboardStats', hotelId],
    queryFn: () => adminApi.getDashboard(), // We'll pass hotelId if needed
  });
}

export function useMonthlyStats(hotelId?: number) {
  return useQuery({
    queryKey: ['monthlyStats', hotelId],
    queryFn: () => adminApi.getMonthlyStats(),
  });
}

export function useAdminBookings(page = 0, size = 20, status?: string) {
  return useQuery({
    queryKey: ['adminBookings', page, size, status],
    queryFn: () => adminApi.getAllBookings(page, size, status),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBookings'] }),
  });
}

export function useAllUsers(page = 0, size = 20, search?: string) {
  return useQuery({
    queryKey: ['allUsers', page, size, search],
    queryFn: () => adminApi.getAllUsers(page, size, search),
  });
}

// Employees
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeApi.getAll(),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => employeeApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

// Housekeeping
export function useHousekeeping(hotelId: number, status?: string) {
  return useQuery({
    queryKey: ['housekeeping', hotelId, status],
    queryFn: () => housekeepingApi.getByHotel(hotelId, status),
    enabled: !!hotelId,
  });
}

export function useUpdateHousekeepingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => housekeepingApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping'] }),
  });
}

// Notifications
export function useNotifications(page = 0, size = 20, enabled = true) {
  return useQuery({
    queryKey: ['notifications', page, size],
    queryFn: () => notificationApi.getAll(page, size),
    enabled,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled,
    refetchInterval: enabled ? 30000 : undefined,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// User Preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.updatePreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

// Contact
export function useSubmitContact() {
  return useMutation({
    mutationFn: contactApi.submit,
  });
}

// Newsletter
export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: newsletterApi.subscribe,
  });
}
