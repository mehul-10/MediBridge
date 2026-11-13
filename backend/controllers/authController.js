
const User = require("../models/User");
const Patient = require("../models/Patient");
const jwt = require("jsonwebtoken");
const { createAuditLog } = require("../services/auditLogService");

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user and retrieve password hash
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Retrieve linked patient profile
    let patientId = null;

    if (user.role === "patient") {
      const patient = await Patient.findOne({
        userId: user._id,
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found. Please contact support.",
        });
      }

      patientId = patient.patientId;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Record successful login
    await createAuditLog({
      userId: user._id,
      action: "LOGIN",
      resourceType: "User",
      resourceId: user._id,
      description: "User logged in successfully.",
      outcome: "SUCCESS",
      ipAddress: req.ip || "",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        patientId,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    // Record successful logout
    await createAuditLog({
      userId: req.user._id,
      action: "LOGOUT",
      resourceType: "User",
      resourceId: req.user._id,
      description: "User logged out successfully.",
      outcome: "SUCCESS",
      ipAddress: req.ip || "",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to logout.",
    });
  }
};

module.exports = {
  loginUser,
  logoutUser,
};
