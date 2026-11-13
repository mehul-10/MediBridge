const User = require("../models/User");
const Patient = require("../models/Patient");

// Register a new patient
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide full name, email, and password.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: "patient",
    });

    const patientId = `MB-${Date.now()}`;

    await Patient.create({
      userId: user._id,
      patientId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      patientId,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register account.",
    });
  }
};

// Development-only healthcare test account registration
const registerHealthcareUser = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        message: "This registration endpoint is disabled.",
      });
    }

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide full name, email, and password.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: "healthcare",
    });

    return res.status(201).json({
      success: true,
      message: "Healthcare test account created successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Healthcare registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create healthcare account.",
    });
  }
};

module.exports = {
  registerUser,
  registerHealthcareUser,
};