import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole } from '@civicmind/shared';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const geoPointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

const geoPolygonSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true,
    default: 'Polygon',
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of points [[ [lng, lat], [lng, lat] ]]
    required: true,
  },
});

const UserSchema = new Schema<IUserDocument>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      required: true,
      default: 'citizen',
    },
    // Officer-specific
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    badge: {
      type: String,
      trim: true,
    },
    assignedArea: {
      type: geoPolygonSchema,
    },
    // Citizen-specific
    address: {
      type: String,
    },
    location: {
      type: geoPointSchema,
    },
    // Gamification
    reputationScore: {
      type: Number,
      required: true,
      default: 0,
    },
    issuesReported: {
      type: Number,
      required: true,
      default: 0,
    },
    issuesResolved: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ location: '2dsphere' });
UserSchema.index({ 'assignedArea.coordinates': '2dsphere' });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
export default User;
