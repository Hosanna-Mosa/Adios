/** Shape of GET /drivers/profile. */
export type Status = "valid" | "expired" | "pending";

export interface BankAccountInfo {
  accountNumber: string;
  ifsc: string;
  verified: boolean;
  isDefault: boolean;
}

export interface ProfileResponse {
  account: {
    id: string;
    name: string;
    username: string | null;
    email: string | null;
    phone: string;
    profilePic: string | null;
    role: string;
    defaultLocation: { type: string; coordinates: number[] } | null;
    addresses: { label: string; receiverName?: string; addressLine: string; phone: string }[];
    createdAt: string;
    updatedAt: string;
  };
  driver: {
    id: string;
    status: string;
    isAvailable: boolean;
    currentLocation: { type: string; coordinates: number[] } | null;
    onboardingStatus: string;
    onboardingCompletedAt: string | null;
    gender: string | null;
    vehicleType: string | null;
    aadhaarNumber: string | null;
    aadhaarVerified: boolean;
    panNumber: string | null;
    panImage: string | null;
    dlNumber: string | null;
    dlExpiry: string | null;
    dlFrontImage: string | null;
    dlBackImage: string | null;
    bankAccountNumber: string | null;
    bankIfsc: string | null;
    bankVerified: boolean;
    bankAccounts?: BankAccountInfo[];
    selfieImage: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  verification: {
    identity: boolean;
    drivingLicense: Status;
    bank: boolean;
    selfie: boolean;
    documentsComplete: boolean;
  };
  vehicle: {
    type: string | null;
    label: string;
    insuranceStatus: Status;
  };
  stats: {
    completedTrips: number;
    rating: number;
    acceptanceRate: number;
  };
}

export const emptyProfile: ProfileResponse | null = null;
