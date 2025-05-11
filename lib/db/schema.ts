import mongoose, { Schema } from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: String,
  phoneNumber: String,
  role: {
    type: String,
    enum: ['CLIENT', 'COUNSELOR'],
    default: 'CLIENT'
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const clientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    address: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String
    },
    nationalIdUrl: { type: String, required: true }
  },
  preferences: {
    preferredLanguages: [String],
    counselingType: [String], // e.g., ['individual', 'group', 'family']
    preferredGender: { type: String, enum: ['Male', 'Female', 'No Preference'] }
  },
  medicalHistory: {
    currentMedications: [String],
    previousCounseling: Boolean,
    previousCounselingDetails: String,
    relevantHealthConditions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const counselorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  personalInfo: {
    fullName: String,
    phoneNumber: String,
    address: String,
    dateOfBirth: Date,
  },
  professionalInfo: {
    specializations: [String],
    languages: [String],
    yearsOfExperience: Number,
    licenseNumber: String,
    licenseUrl: String,
    resumeUrl: String,
  },
  workPreferences: {
    hourlyRate: Number,
    availability: [
      {
        day: String,
        slots: [
          {
            startTime: String,
            endTime: String,
          },
        ],
      },
    ],
  },
  imageUrl: String,
  reviews: [
    {
      rating: Number,
      comment: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatRoomSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastMessage: {
    type: String,
  },
  lastMessageDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counselor",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  sessionType: {
    type: String,
    enum: ["video", "chat"],
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentReference: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const counselorApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }
  },
  professionalInfo: {
    education: [{
      degree: String,
      institution: String,
      graduationYear: Number,
      certificateUrl: String
    }],
    specializations: [String],
    languages: [String],
    yearsOfExperience: Number,
    licenseNumber: String,
    licenseUrl: String,
    resumeUrl: String
  },
  workPreferences: {
    hourlyRate: { type: Number, required: true },
    availability: [{
      day: String,
      slots: [{
        startTime: String,
        endTime: String
      }]
    }]
  },
  documents: {
    identificationUrl: { type: String, required: true },
    photographUrl: { type: String, required: true },
    workExperienceUrl: { type: String, required: true },
    professionalLicenseUrl: { type: String, required: true },
    educationalCredentialsUrl: { type: String, required: true },
    cvUrl: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewNotes: String
});

const AppointmentSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  counselor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['CONFIRMED', 'COMPLETED', 'CANCELLED'], 
    default: 'CONFIRMED' 
  },
  notes: { type: String },
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const ClientProfile = mongoose.models.ClientProfile || mongoose.model('ClientProfile', clientProfileSchema);
export const Counselor = mongoose.models.Counselor || mongoose.model('Counselor', counselorSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);
export const CounselorApplication = mongoose.models.CounselorApplication || mongoose.model('CounselorApplication', counselorApplicationSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema); 