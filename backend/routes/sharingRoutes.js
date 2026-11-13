
const express = require("express");
const router = express.Router();

const {
  grantAccess,
  getMySharingPermissions,
  revokeAccess,
} = require("../controllers/sharingController");

const { protect } = require("../middleware/authMiddleware");

// All sharing routes require authentication.
router.use(protect);

// Only patient accounts can manage their sharing permissions.
router.use((req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Only patients can manage sharing permissions.",
    });
  }

  next();
});

// Grant access to a healthcare professional.
router.post("/", grantAccess);

// Get permissions granted by the logged-in patient.
router.get("/my-permissions", getMySharingPermissions);

// Revoke an existing permission.
router.delete("/:id", revokeAccess);

module.exports = router;
