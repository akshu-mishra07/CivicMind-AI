// ============================================
// USER TYPES
// ============================================

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface IUser {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;

  // Officer-specific
  department?: string;
  badge?: string;
  assignedArea?: GeoPolygon;

  // Citizen-specific
  address?: string;
  location?: GeoPoint;

  // Gamification
  reputationScore: number;
  issuesReported: number;
  issuesResolved: number;

  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserCreatePayload {
  email: string;
  displayName: string;
  phone?: string;
  role?: UserRole;
  address?: string;
}

export interface IUserUpdatePayload {
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
}
