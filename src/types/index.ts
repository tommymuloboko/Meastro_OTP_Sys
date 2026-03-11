export type UserRole = 'customer' | 'station_manager' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  siteId?: string;       // for station managers
  companyName?: string;  // for customers
}

export type VehicleType =
  | 'Sedan'
  | 'SUV'
  | 'Truck'
  | 'Bus'
  | 'Motorcycle'
  | 'Van'
  | 'Tanker'
  | 'Pickup'
  | 'Other';

export type FuelType = 'Petrol' | 'Diesel' | 'Kerosene' | 'LPG';

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'dispensing'
  | 'completed';

export interface FuelOrder {
  id: string;
  customerId: string;
  customerName: string;
  siteId: string;
  driverName: string;
  driverPhone: string;
  vehicleRegNumber: string;
  vehicleType: VehicleType;
  tankCapacity: number;       // in litres
  fuelVolumeAllocated: number; // in litres
  fuelType: FuelType;
  otp: string;
  otpActive: boolean;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  completedAt?: string;
}

export interface NewOrderFormData {
  siteId: string;
  driverName: string;
  driverPhone: string;
  vehicleRegNumber: string;
  vehicleType: VehicleType;
  tankCapacity: number;
  fuelVolumeAllocated: number;
  fuelType: FuelType;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  managerId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  createdAt: string;
}

export type PaymentTransactionType = 'Account Payment' | 'AR Receipt';
export type PaymentMethod = 'Cash' | 'Check' | 'Credit Card';

export interface Payment {
  id: string;
  dateTime: string;
  customerName: string;
  customerId: string;
  transactionType: PaymentTransactionType;
  amountReceived: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  balanceAfter: number;
}
