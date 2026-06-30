import { User, IUserDocument } from '../models/User';
import { IUserUpdatePayload, UserRole } from '@civicmind/shared';
import { logger } from '../utils/logger';

export async function getUserProfile(userId: string): Promise<IUserDocument | null> {
  return User.findById(userId).populate('department');
}

export async function registerUser(payload: {
  firebaseUid: string;
  email: string;
  displayName: string;
  phone?: string;
  role?: UserRole;
  address?: string;
}): Promise<IUserDocument> {
  const existingUser = await User.findOne({ firebaseUid: payload.firebaseUid });
  if (existingUser) {
    logger.info(`User registration skipped: ${payload.email} already exists`);
    return existingUser;
  }

  const newUser = await User.create({
    firebaseUid: payload.firebaseUid,
    email: payload.email,
    displayName: payload.displayName,
    phone: payload.phone,
    role: payload.role || 'citizen',
    address: payload.address,
    reputationScore: 10, // Default signup bonus points
  });

  logger.info(`Successfully registered new user database profile: ${newUser.email}`);
  return newUser;
}

export async function updateUserProfile(
  userId: string,
  payload: IUserUpdatePayload
): Promise<IUserDocument | null> {
  return User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).populate('department');
}

export async function getLeaderboardData(): Promise<IUserDocument[]> {
  return User.find({ role: 'citizen', isActive: true })
    .sort({ reputationScore: -1 })
    .limit(25)
    .select('displayName reputationScore issuesReported issuesResolved role avatarUrl');
}

export async function listAllUsers(query: any): Promise<IUserDocument[]> {
  return User.find(query).populate('department');
}

export async function updateUserRole(userId: string, role: UserRole): Promise<IUserDocument | null> {
  return User.findByIdAndUpdate(userId, { $set: { role } }, { new: true });
}
