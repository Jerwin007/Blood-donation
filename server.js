const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// JWT Secret Key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "blood_donation_portal_secret_key_2024";

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bloodbank";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// ==================== SCHEMAS & MODELS ====================

// USER SCHEMA
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// DONOR SCHEMA
const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  email: String,
  phone: String,
  bloodGroup: String,
  age: Number,
  address: String,
  lastDonationDate: Date,
  isAvailable: { type: Boolean, default: true },
  registeredDate: { type: Date, default: Date.now }
});

const Donor = mongoose.model("Donor", donorSchema);

// REQUEST SCHEMA
const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientName: String,
  hospitalName: String,
  bloodGroup: String,
  unitsNeeded: Number,
  urgency: String,
  contactNumber: String,
  requestDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }
});

const Request = mongoose.model("Request", requestSchema);

// INVENTORY SCHEMA
const inventorySchema = new mongoose.Schema({
  bloodGroup: { type: String, unique: true },
  unitsAvailable: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

// ==================== MIDDLEWARE: JWT ====================
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ status: "error", message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ status: "error", message: "Invalid token" });
    req.user = user;
    next();
  });
};

// ==================== ROUTES ====================

// Simple test route
app.get("/", (req, res) => {
  res.send("🩸 Blood Donation Portal API is running successfully!");
});

// You can add your existing API routes here (register, login, donor, request, inventory...)
// — You already have them written, so just keep them as they are.


// ==================== START SERVER ====================
const PORT = process.env.PORT || 7000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
