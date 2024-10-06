const express = require("express");
const UR = express.Router();
const User = require("../../models/UserSchema"); // Assuming the model is in models/User.js
const jwt = require("jsonwebtoken");
const authAuth = require("../../utils/userAuth");
const DoctorSchema = require("../../models/DoctorSchema");
const sendOTP = require("../../utils/otpSender");
const otpGenerator = require("otp-generator");
const path = require("path");
const UserSchema = require("../../models/UserSchema");
const OTP_LENGTH = 6;
const OTP_CONFIG = {
  upperCaseAlphabets: false,
  specialChars: false,
};

const JWT_SECRET = process.env.JWT_SECRET;

UR.post("/signup", async (req, res) => {
  const { name, email, password, address, bloodGroup, phoneNumber } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user but don't save immediately
    user = new User({
      name,
      email,
      password,
      address,
      bloodGroup,
      phoneNumber,
      otp: otpGenerator.generate(OTP_LENGTH, OTP_CONFIG), // Generate OTP
    });

    // Send OTP via email
    await sendOTP(email, user.otp);

    // Save user in the database
    await user.save();

    res.status(201).json({
      msg: "Signup successful! Please check your email for OTP to verify your account.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

UR.post("/verify/otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Clear OTP and mark user as verified
    user.otp = undefined; // Clear OTP after successful verification
    user.verified = true; // Clear OTP after successful verification
    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        address: user.address,
        bloodGroup: user.bloodGroup,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Login Route
UR.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isVerified = await user.verified;
    if (!isVerified) {
      return res.status(400).json({ msg: "Verify your aaccount" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        address: user.address,
        bloodGroup: user.bloodGroup,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

UR.get("/profile", authAuth, async (req, res) => {
  try {
    // Fetch the user by their ID (decoded from the JWT token)
    const user = await User.findById(req.user).select("-password"); // Exclude password from response

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

UR.post("/doctor", async (req, res) => {
  const { search } = req.body;
  try {
    const doctor = await DoctorSchema.find({ search });
    res.json(doctor);
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

UR.post("/book/appointment", async (req, res) => {
  const { doctorId, userId, date, time } = req.body;

  try {
    // 1. Check if the doctor exists
    const doctor = await DoctorSchema.findById(doctorId);
    const user = await UserSchema.findById(userId);
    if (!doctor || !user) {
      return res.status(404).json({ message: "Doctor or User not found" });
    }

    // 2. Check if the requested time falls within the doctor's availability
    const availableFrom = new Date(`1970-01-01T${doctor.availabilityFrom}`);
    const availableTo = new Date(`1970-01-01T${doctor.availabilityTo}`);
    const requestedTime = new Date(`1970-01-01T${time}`);

    if (requestedTime < availableFrom || requestedTime > availableTo) {
      return res.status(400).json({
        message: "Requested time is outside the doctor's availability",
      });
    }

    // 3. Check if the doctor already has an appointment booked within 10 minutes of the requested time
    const existingAppointment = doctor.appointments.find((appointment) => {
      const appointmentTime = new Date(`1970-01-01T${appointment.time}`);
      const timeDifference =
        Math.abs(appointmentTime - requestedTime) / (1000 * 60); // Difference in minutes

      return (
        appointment.date.toISOString().split("T")[0] ===
          new Date(date).toISOString().split("T")[0] && timeDifference < 10
      ); // Check if the time difference is less than 10 minutes
    });

    if (existingAppointment) {
      return res.status(400).json({
        message:
          "This time slot is too close to another appointment (less than 10 minutes gap)",
      });
    }
    console.log({
      key: process.env.UPIKEY,
      client_txn_id: userId,
      amount: `${doctor.fee}`,
      p_info: "Appoinment with " + doctor.name,
      customer_name: user.name,
      customer_email: user.email,
      customer_mobile: user.phoneNumber,
      redirect_url: "/appoinments?pyt=true",
      udf1: "user defined field 1 (max 25 char)",
      udf2: "user defined field 2 (max 25 char)",
      udf3: "user defined field 3 (max 25 char)",
    });
    const d = Date.now()

    const pay = await fetch("https://api.ekqr.in/api/create_order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      },
      body: JSON.stringify({
        key: process.env.UPIKEY,
        client_txn_id: String(d),
        amount: `${doctor.fee}`,
        p_info: "Appoinment with " + doctor.name,
        customer_name: user.name,
        customer_email: user.email,
        customer_mobile: user.phoneNumber,
        redirect_url: "https://7a5b-2409-40f4-ab-3fd0-5cb6-58c5-380d-4e6d.ngrok-free.app/appoinment",
        udf1: "user defined field 1 (max 25 char)",
        udf2: "user defined field 2 (max 25 char)",
        udf3: "user defined field 3 (max 25 char)",
      }),
    });
    const payRes = await pay.json();
    console.log(payRes);
    setTimeout(async() => {
        const check = await fetch("https://api.ekqr.in/api/check_order_status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
              "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            },
            body: JSON.stringify({
              key: process.env.UPIKEY,
              client_txn_id: String(d)
            }),
          });
        console.log(check);
        if(check.status){
            return
        }
        
    }, 1000);
      
  
    doctor.appointments.push({
      userId,
      date: new Date(date),
      time,
    });
    user.appointments.push({
      DocId: doctorId,
      date: new Date(date),
      time,
    });

    // 6. Save the doctor document (with the new appointment)
    await doctor.save();
    await user.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      payRes
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});
UR.post("/appointments", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Doctor or User not found" });
    }

    res.status(201).json({
      appointment: {
        userId,
        doctorId,
        date: new Date(date),
        time,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = UR;
