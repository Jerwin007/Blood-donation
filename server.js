const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// ==================== ENVIRONMENT CONFIG ====================
const PORT = process.env.PORT || 7000;  // ✅ Render sets PORT automatically
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bloodbank";
const JWT_SECRET = process.env.JWT_SECRET || "blood_donation_portal_secret_key_2024";

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(express.json());

// ==================== MONGODB CONNECTION ====================
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });

// ==================== USER SCHEMA ====================
const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema, "users");

// ==================== DONOR SCHEMA ====================
const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  lastDonationDate: { type: Date },
  isAvailable: { type: Boolean, default: true },
  registeredDate: { type: Date, default: Date.now }
});

const Donor = mongoose.model("Donor", donorSchema, "donors");

// ==================== BLOOD REQUEST SCHEMA ====================
const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  hospitalName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  urgency: { type: String, required: true },
  contactNumber: { type: String, required: true },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }
});

const Request = mongoose.model("Request", requestSchema, "requests");

// ==================== INVENTORY SCHEMA ====================
const inventorySchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true, unique: true },
  unitsAvailable: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const Inventory = mongoose.model("Inventory", inventorySchema, "inventory");

// ==================== MIDDLEWARE: Verify JWT Token ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTHENTICATION APIs ====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, username, password, confirmPassword } = req.body;

    if (!fullName || !email || !username || !password || !confirmPassword) {
      return res.json({ status: "error", message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.json({ status: "error", message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.json({ status: "error", message: "Password must be at least 6 characters long" });
    }

    if (username.length < 3) {
      return res.json({ status: "error", message: "Username must be at least 3 characters long" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.json({ status: "error", message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.json({ status: "error", message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();

    res.json({ 
      status: "success", 
      message: "Registration successful! Please login to continue." 
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.json({ status: "error", message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail.toLowerCase() }
      ]
    });

    if (!user) {
      return res.json({ status: "error", message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: "success",
      message: "Login successful!",
      token: token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.json({ status: "error", message: err.message });
  }
});

app.get("/api/auth/verify", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/auth/update-profile", authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.json({ status: "error", message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.json({ status: "error", message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    if (fullName) user.fullName = fullName;

    await user.save();

    res.json({ 
      status: "success", 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username
      }
    });

  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.json({ status: "error", message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.json({ status: "error", message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.json({ status: "error", message: "Password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.json({ status: "error", message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.json({ status: "error", message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ status: "success", message: "Password changed successfully" });

  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ==================== DONOR APIs ====================

app.get("/api/donors/viewAll", authenticateToken, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ registeredDate: -1 });
    res.json(donors);
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/donors/add", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, age, address } = req.body;
    
    const newDonor = new Donor({
      userId: req.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      bloodGroup: bloodGroup.trim().toUpperCase(),
      age: Number(age),
      address: address.trim()
    });
    
    await newDonor.save();
    res.json({ status: "success", message: "Donor registered successfully!" });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/donors/delete", authenticateToken, async (req, res) => {
  const { id } = req.body;
  try {
    await Donor.findByIdAndDelete(id);
    res.json({ status: "success", message: "Donor deleted successfully" });
  } catch (err) {
    res.json({ status: "error", message: "Error deleting donor" });
  }
});

// ==================== BLOOD REQUEST APIs ====================

app.get("/api/requests/viewAll", authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find().sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/requests/add", authenticateToken, async (req, res) => {
  try {
    const { patientName, hospitalName, bloodGroup, unitsNeeded, urgency, contactNumber } = req.body;
    
    const newRequest = new Request({
      userId: req.user.id,
      patientName: patientName.trim(),
      hospitalName: hospitalName.trim(),
      bloodGroup: bloodGroup.trim().toUpperCase(),
      unitsNeeded: Number(unitsNeeded),
      urgency: urgency,
      contactNumber: contactNumber.trim()
    });
    
    await newRequest.save();
    res.json({ status: "success", message: "Blood request submitted successfully!" });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/requests/updateStatus", authenticateToken, async (req, res) => {
  try {
    const { id, status } = req.body;
    await Request.findByIdAndUpdate(id, { status });
    res.json({ status: "success", message: "Request status updated" });
  } catch (err) {
    res.json({ status: "error", message: "Error updating status" });
  }
});

app.post("/api/requests/delete", authenticateToken, async (req, res) => {
  const { id } = req.body;
  try {
    await Request.findByIdAndDelete(id);
    res.json({ status: "success", message: "Request deleted successfully" });
  } catch (err) {
    res.json({ status: "error", message: "Error deleting request" });
  }
});

// ==================== INVENTORY APIs ====================

app.get("/api/inventory/viewAll", authenticateToken, async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ bloodGroup: 1 });
    res.json(inventory);
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/api/inventory/update", authenticateToken, async (req, res) => {
  try {
    const { bloodGroup, unitsAvailable } = req.body;
    
    await Inventory.findOneAndUpdate(
      { bloodGroup: bloodGroup.toUpperCase() },
      { unitsAvailable: Number(unitsAvailable), lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    
    res.json({ status: "success", message: "Inventory updated successfully" });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ==================== DASHBOARD STATISTICS ====================

app.get("/api/statistics", authenticateToken, async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const availableDonors = await Donor.countDocuments({ isAvailable: true });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: "Pending" });
    const totalUnits = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$unitsAvailable" } } }
    ]);
    
    res.json({
      totalDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      totalBloodUnits: totalUnits.length > 0 ? totalUnits[0].total : 0
    });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.json({ 
    status: "success", 
    message: "🩸 Blood Donation Portal API is Running!",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {  // ✅ Bind to 0.0.0.0 for Render
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔐 JWT Authentication enabled`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI.includes('mongodb+srv') ? 'Cloud (Atlas)' : 'Local'}`);
});