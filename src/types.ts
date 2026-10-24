export type SecurityPosition = 'Security Supervisor' | 'Unarmed Security Guard';

export interface RegistrationFormData {
  // Position
  position: SecurityPosition;
  
  // Personal Details
  fullName: string;
  fatherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  qualification: string;
  
  // Address Details
  villageTown: string;
  postOffice: string;
  district: string;
  pinCode: string;
  
  // Contact Details
  contactNumber: string;
  aadhaarNumber: string;
  email?: string;
  
  // Experience & License
  experienceYears: string;
  isExServicemen: 'Yes' | 'No';
  exServicemenDetails?: string;
  drivingLicenseNo: string;
  drivingLicenseValidUpTo: string;
  
  // Declaration
  acceptedDeclaration: boolean;
}

export interface PaymentDetails {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  paymentGateway: 'Cashfree Payments';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paidAt: string;
  bankRefNo: string;
  upiIdOrCardLast4?: string;
}

export interface ApplicationRecord {
  registrationId: string;
  createdAt: string;
  formData: RegistrationFormData;
  payment: PaymentDetails;
  smsSent: boolean;
  smsTimestamp?: string;
}
