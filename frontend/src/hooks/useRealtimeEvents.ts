import { useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import type { EventEnvelope } from '../contexts/WebSocketContext';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useRealtimeEvents = () => {
  const { subscribe, status } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== 'Connected') return;

    const subscriptions = [
      subscribe('/topic/bookings', (message) => {
        try {
          const event: EventEnvelope = JSON.parse(message.body);
          
          if (event.eventType === 'BOOKING_CREATED') {
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
            toast.success(`New booking created: ${event.payload?.bookingReference || event.entityId}`);
          }
          else if (event.eventType === 'BOOKING_UPDATED') {
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
          }
          else if (event.eventType === 'BOOKING_CANCELLED') {
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            toast.error(`Booking cancelled: ${event.payload?.bookingReference || event.entityId}`);
          }
        } catch (e) {
          console.error('Error processing booking event', e);
        }
      }),

      subscribe('/topic/housekeeping', (message) => {
        try {
          const event: EventEnvelope = JSON.parse(message.body);
          
          if (event.eventType === 'ROOM_STATUS_CHANGED') {
            queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
            // Don't toast on every room status change to avoid spam, but cache is updated.
          }
        } catch (e) {
          console.error('Error processing housekeeping event', e);
        }
      }),

      subscribe('/user/queue/bookings', (message) => {
        try {
          const event: EventEnvelope = JSON.parse(message.body);
          queryClient.invalidateQueries({ queryKey: ['userBookings'] });
          
          if (event.eventType === 'BOOKING_UPDATED') {
            toast.success(`Your booking status was updated!`);
          }
        } catch (e) {
          console.error('Error processing user booking event', e);
        }
      }),

      subscribe('/user/queue/notifications', (message) => {
        try {
          const event: EventEnvelope = JSON.parse(message.body);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          toast(event.payload || 'New notification', { icon: '🔔' });
        } catch (e) {
          console.error('Error processing user notification event', e);
        }
      })
    ];

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
    };
  }, [subscribe, status, queryClient]);
};
