const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AppointmentSchema = new mongoose.Schema(
  {
    DocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // Example: '10:00 AM'
    // status: { type: String, default: 'Pending' }  // Appointment status
  },
  { timestamps: true }
);

// Define the User schema
const ChatSchema = new mongoose.Schema(
  {
    cause: [{ type: String }],
    consultationPriority: { type: String },
    medicine: [{ type: String }],
    diet: [{ type: String }],
    specialist: { type: String },
    prompt: { type: String },
  },
  { timestamps: true } // This adds createdAt and updatedAt to each chat
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    dob: { type: Date },
    otp: { type: String },
    verified: { type: Boolean, default: false },
    appointments: [AppointmentSchema], // Array to store appointments for this doctor
    chats: [ChatSchema], // Chat schema with timestamps
  },
  { timestamps: true } // This adds timestamps for the user document itself
);

// Hash password before saving the user model
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
