export type UserRole = 'citizen' | 'officer' | 'admin';
export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number];
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
    department?: string;
    badge?: string;
    assignedArea?: GeoPolygon;
    address?: string;
    location?: GeoPoint;
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
//# sourceMappingURL=user.d.ts.map