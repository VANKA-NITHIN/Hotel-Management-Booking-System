import { describe, it, expect } from 'vitest';
import { bookingSchema, profileSchema, changePasswordSchema, hotelSearchSchema, reviewSchema, couponSchema, hotelManageSchema, roomManageSchema } from '../validation/schemas';

describe('Zod Validation Schemas', () => {
  describe('bookingSchema', () => {
    it('should validate a valid booking', () => {
      const result = bookingSchema.safeParse({
        checkIn: '2026-07-15',
        checkOut: '2026-07-18',
        guests: 2,
        children: 0,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing first name', () => {
      const result = bookingSchema.safeParse({
        checkIn: '2026-07-15',
        checkOut: '2026-07-18',
        guests: 2,
        children: 0,
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = bookingSchema.safeParse({
        checkIn: '2026-07-15',
        checkOut: '2026-07-18',
        guests: 2,
        children: 0,
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero guests', () => {
      const result = bookingSchema.safeParse({
        checkIn: '2026-07-15',
        checkOut: '2026-07-18',
        guests: 0,
        children: 0,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject checkout before checkin', () => {
      const result = bookingSchema.safeParse({
        checkIn: '2026-07-18',
        checkOut: '2026-07-15',
        guests: 2,
        children: 0,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = bookingSchema.safeParse({
        checkIn: '2026-07-15',
        checkOut: '2026-07-18',
        guests: 2,
        children: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        specialRequests: 'Late checkout please',
        couponCode: 'SAVE10',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('profileSchema', () => {
    it('should validate a valid profile', () => {
      const result = profileSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty first name', () => {
      const result = profileSchema.safeParse({
        firstName: '',
        lastName: 'Doe',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate matching passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'differentPassword',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('hotelSearchSchema', () => {
    it('should validate a valid search', () => {
      const result = hotelSearchSchema.safeParse({
        city: 'New York',
        minPrice: 100,
        maxPrice: 500,
      });
      expect(result.success).toBe(true);
    });

    it('should validate empty search', () => {
      const result = hotelSearchSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('reviewSchema', () => {
    it('should validate a valid review', () => {
      const result = reviewSchema.safeParse({
        rating: 5,
        comment: 'Amazing hotel, great service!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short comment', () => {
      const result = reviewSchema.safeParse({
        rating: 5,
        comment: 'Nice',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid rating', () => {
      const result = reviewSchema.safeParse({
        rating: 0,
        comment: 'Amazing hotel experience',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('couponSchema', () => {
    it('should validate a valid coupon code', () => {
      const result = couponSchema.safeParse({ code: 'SAVE10' });
      expect(result.success).toBe(true);
    });

    it('should reject empty coupon code', () => {
      const result = couponSchema.safeParse({ code: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('hotelManageSchema', () => {
    it('should validate a valid hotel', () => {
      const result = hotelManageSchema.safeParse({
        name: 'Grand Hotel',
        description: 'A luxurious five-star hotel in the heart of the city',
        address: '123 Main Street',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        phoneNumber: '+1234567890',
        email: 'info@grandhotel.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = hotelManageSchema.safeParse({
        name: '',
        description: 'A hotel',
        address: '123 Main Street',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        phoneNumber: '+1234567890',
        email: 'info@grandhotel.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('roomManageSchema', () => {
    it('should validate a valid room', () => {
      const result = roomManageSchema.safeParse({
        name: 'Deluxe Suite',
        description: 'Spacious deluxe suite with ocean view',
        roomType: 'DELUXE',
        pricePerNight: 250,
        maxGuests: 4,
        bedCount: 2,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid room type', () => {
      const result = roomManageSchema.safeParse({
        name: 'Deluxe Suite',
        description: 'Spacious deluxe suite with ocean view',
        roomType: 'INVALID_TYPE',
        pricePerNight: 250,
        maxGuests: 4,
        bedCount: 2,
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const result = roomManageSchema.safeParse({
        name: 'Deluxe Suite',
        description: 'Spacious deluxe suite with ocean view',
        roomType: 'DELUXE',
        pricePerNight: 0,
        maxGuests: 4,
        bedCount: 2,
      });
      expect(result.success).toBe(false);
    });
  });
});
