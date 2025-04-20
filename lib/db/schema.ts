import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  role: {
    type: String,
    enum: ['CLIENT', 'COUNSELOR'],
    default: 'CLIENT'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const counselorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  specializations: [String],
  languages: [String],
  bio: String,
  experience: Number,
  hourlyRate: Number,
  availability: [{
    day: String,
    slots: [{
      startTime: String,
      endTime: String
    }]
  }]
});

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: Date,
  startTime: String,
  endTime: String,
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  notes: String
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Counselor = mongoose.models.Counselor || mongoose.model('Counselor', counselorSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema); 