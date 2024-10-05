const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');




// Define the Doctor schema
const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    availabilityFrom: { type: String, required: true }, // You can change to a Date type if needed
    availabilityTo: { type: String, required: true },   // You can change to a Date type if needed
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
