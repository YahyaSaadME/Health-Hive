const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Appointment schema
const AppointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },  // Example: '10:00 AM'
    // status: { type: String, default: 'Pending' }  // Appointment status
}, { timestamps: true });

// Define the Doctor schema
const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    availabilityFrom: { type: String, required: true }, // You can change to a Date type if needed
    availabilityTo: { type: String, required: true },   // You can change to a Date type if needed
    hospital:{type:String},
    address:{type:String},
    fee:{type:Number},
    ratings:{type:Number},
    degrees:{type:String},
    appointments: [AppointmentSchema]  // Array to store appointments for this doctor
}, { timestamps: true });

// Hash password before saving the doctor model
DoctorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match doctor entered password with hashed password
DoctorSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', DoctorSchema);
