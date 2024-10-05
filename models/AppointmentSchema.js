const mongoose = require('mongoose');

// Define the Appointment schema
const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },  // Example: '10:00 AM'
    status: { type: String, default: 'Pending' }  // Appointment status
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
