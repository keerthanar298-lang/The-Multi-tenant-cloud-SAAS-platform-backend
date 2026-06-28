const Tenant = require("../models/Tenant");
const jwt = require("jsonwebtoken");
const { getOrSetCache, invalidateCache } = require("../utils/cache");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "fallback_secret_key_change_me",
    {
      expiresIn: "30d",
    },
  );
};

// @desc    Register a new tenant
// @route   POST /api/tenants/register
// @access  Public
const registerTenant = async (req, res) => {
  try {
    const {
      fullName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password,
      aadharCardNumber,
      panCardNumber,
      permanentAddress,
      city,
      state,
      pincode,
      apartmentName,
      floorNumber,
      flatNumber,
      ownerName,
      rentAmount,
      securityDeposit,
      leaseStartDate,
      leaseEndDate,
      numberOfMembers,
      familyMemberNames,
      emergencyContactPerson,
      emergencyContactNumber,
      vehicleType,
      vehicleNumber,
      parkingSlotNumber,
      occupation,
      companyName,
      remarks,
    } = req.body;

    // Check if tenant already exists
    const tenantExists = await Tenant.findOne({ email });
    if (tenantExists) {
      return res
        .status(400)
        .json({ message: "Tenant with this email already exists" });
    }

    // Get file URLs from Cloudinary uploads
    let profilePhoto = "";
    let aadharCardPhoto = "";
    let panCardPhoto = "";
    let agreementUpload = "";

    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.aadharCardPhoto && req.files.aadharCardPhoto[0]) {
        aadharCardPhoto = req.files.aadharCardPhoto[0].path;
      }
      if (req.files.panCardPhoto && req.files.panCardPhoto[0]) {
        panCardPhoto = req.files.panCardPhoto[0].path;
      }
      if (req.files.agreementUpload && req.files.agreementUpload[0]) {
        agreementUpload = req.files.agreementUpload[0].path;
      }
    }

    // Parse familyMemberNames if it's a JSON string
    let parsedFamilyMemberNames = [];
    if (familyMemberNames) {
      try {
        parsedFamilyMemberNames =
          typeof familyMemberNames === "string"
            ? JSON.parse(familyMemberNames)
            : familyMemberNames;
      } catch (e) {
        // If it's a comma-separated string
        parsedFamilyMemberNames = familyMemberNames
          .split(",")
          .map((name) => name.trim());
      }
    }

    const tenant = await Tenant.create({
      fullName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password,
      profilePhoto,
      aadharCardNumber,
      panCardNumber,
      aadharCardPhoto,
      panCardPhoto,
      permanentAddress,
      city,
      state,
      pincode,
      apartmentName,
      floorNumber,
      flatNumber,
      ownerName,
      rentAmount: rentAmount ? Number(rentAmount) : 0,
      securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
      leaseStartDate,
      leaseEndDate,
      numberOfMembers: numberOfMembers ? Number(numberOfMembers) : 0,
      familyMemberNames: parsedFamilyMemberNames,
      emergencyContactPerson,
      emergencyContactNumber,
      vehicleType,
      vehicleNumber,
      parkingSlotNumber,
      occupation,
      companyName,
      agreementUpload,
      remarks,
    });

    await invalidateCache("tenants:all");

    if (tenant) {
      const tenantResponse = tenant.toObject();
      delete tenantResponse.password;
      tenantResponse.token = generateToken(tenant._id);
      res.status(201).json(tenantResponse);
    } else {
      res.status(400).json({ message: "Invalid tenant data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Login tenant & get token
// @route   POST /api/tenants/login
// @access  Public
const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const tenant = await Tenant.findOne({ email });

    if (!tenant) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if tenant account is inactive
    if (tenant.status === "inactive") {
      return res
        .status(403)
        .json({
          message:
            "Your account is inactive. Please contact the administrator.",
        });
    }

    if (await tenant.matchPassword(password)) {
      const tenantResponse = tenant.toObject();
      delete tenantResponse.password;
      tenantResponse.token = generateToken(tenant._id);
      res.json(tenantResponse);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private (Bearer Token required)
const getAllTenants = async (req, res) => {
  try {
    const tenants = await getOrSetCache("tenants:all", async () => {
      return await Tenant.find().select("-password");
    });
    res.json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update tenant details by email
// @route   PATCH /api/tenants/update/:email
// @access  Private (Bearer Token required)
const updateTenant = async (req, res) => {
  try {
    const { email } = req.params;

    const tenant = await Tenant.findOne({ email });

    if (!tenant) {
      return res
        .status(404)
        .json({ message: "Tenant not found with this email" });
    }

    // All updatable fields (email cannot be changed)
    const updatableFields = [
      "fullName",
      "gender",
      "dateOfBirth",
      "phoneNumber",
      "aadharCardNumber",
      "panCardNumber",
      "permanentAddress",
      "city",
      "state",
      "pincode",
      "apartmentName",
      "floorNumber",
      "flatNumber",
      "ownerName",
      "rentAmount",
      "securityDeposit",
      "leaseStartDate",
      "leaseEndDate",
      "numberOfMembers",
      "emergencyContactPerson",
      "emergencyContactNumber",
      "vehicleType",
      "vehicleNumber",
      "parkingSlotNumber",
      "occupation",
      "companyName",
      "remarks",
      "status",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Convert number fields
        if (
          ["rentAmount", "securityDeposit", "numberOfMembers"].includes(field)
        ) {
          tenant[field] = Number(req.body[field]);
        } else {
          tenant[field] = req.body[field];
        }
      }
    });

    // Handle familyMemberNames
    if (req.body.familyMemberNames) {
      try {
        tenant.familyMemberNames =
          typeof req.body.familyMemberNames === "string"
            ? JSON.parse(req.body.familyMemberNames)
            : req.body.familyMemberNames;
      } catch (e) {
        tenant.familyMemberNames = req.body.familyMemberNames
          .split(",")
          .map((name) => name.trim());
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        tenant.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.aadharCardPhoto && req.files.aadharCardPhoto[0]) {
        tenant.aadharCardPhoto = req.files.aadharCardPhoto[0].path;
      }
      if (req.files.panCardPhoto && req.files.panCardPhoto[0]) {
        tenant.panCardPhoto = req.files.panCardPhoto[0].path;
      }
      if (req.files.agreementUpload && req.files.agreementUpload[0]) {
        tenant.agreementUpload = req.files.agreementUpload[0].path;
      }
    }

    const updatedTenant = await tenant.save();
    const tenantResponse = updatedTenant.toObject();
    delete tenantResponse.password;

    await invalidateCache("tenants:all");
    res.json(tenantResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update tenant details by tenantId
// @route   PATCH /api/tenants/update-by-id/:tenantId
// @access  Private (Bearer Token required)
const updateTenantById = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findOne({ tenantId });

    if (!tenant) {
      return res
        .status(404)
        .json({ message: "Tenant not found with this tenant ID" });
    }

    // All updatable fields (tenantId and email cannot be changed)
    const updatableFields = [
      "fullName",
      "gender",
      "dateOfBirth",
      "phoneNumber",
      "email",
      "aadharCardNumber",
      "panCardNumber",
      "permanentAddress",
      "city",
      "state",
      "pincode",
      "apartmentName",
      "floorNumber",
      "flatNumber",
      "ownerName",
      "rentAmount",
      "securityDeposit",
      "leaseStartDate",
      "leaseEndDate",
      "numberOfMembers",
      "emergencyContactPerson",
      "emergencyContactNumber",
      "vehicleType",
      "vehicleNumber",
      "parkingSlotNumber",
      "occupation",
      "companyName",
      "remarks",
      "status",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Convert number fields
        if (
          ["rentAmount", "securityDeposit", "numberOfMembers"].includes(field)
        ) {
          tenant[field] = Number(req.body[field]);
        } else {
          tenant[field] = req.body[field];
        }
      }
    });

    // Handle familyMemberNames
    if (req.body.familyMemberNames) {
      try {
        tenant.familyMemberNames =
          typeof req.body.familyMemberNames === "string"
            ? JSON.parse(req.body.familyMemberNames)
            : req.body.familyMemberNames;
      } catch (e) {
        tenant.familyMemberNames = req.body.familyMemberNames
          .split(",")
          .map((name) => name.trim());
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        tenant.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.aadharCardPhoto && req.files.aadharCardPhoto[0]) {
        tenant.aadharCardPhoto = req.files.aadharCardPhoto[0].path;
      }
      if (req.files.panCardPhoto && req.files.panCardPhoto[0]) {
        tenant.panCardPhoto = req.files.panCardPhoto[0].path;
      }
      if (req.files.agreementUpload && req.files.agreementUpload[0]) {
        tenant.agreementUpload = req.files.agreementUpload[0].path;
      }
    }

    const updatedTenant = await tenant.save();
    const tenantResponse = updatedTenant.toObject();
    delete tenantResponse.password;

    await invalidateCache("tenants:all");
    res.json(tenantResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Migrate existing tenants to have 'active' status
// @route   Called on server startup
// @access  Internal
const migrateExistingTenantStatus = async () => {
  try {
    const result = await Tenant.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } },
    );
    if (result.modifiedCount > 0) {
      console.log(
        `Migration: Updated ${result.modifiedCount} existing tenant(s) with status 'active'`,
      );
    }
  } catch (error) {
    console.error("Migration error:", error);
  }
};

// @desc    Get tenant profile
// @route   GET /api/tenants/profile
// @access  Private (Bearer Token required)
const getTenantProfile = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user._id).select("-password");
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Change tenant password
// @route   PATCH /api/tenants/change-password
// @access  Private (Bearer Token required)
const changePasswordTenant = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const tenant = await Tenant.findById(req.user._id);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const isMatch = await tenant.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    tenant.password = newPassword;
    await tenant.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerTenant,
  loginTenant,
  getAllTenants,
  updateTenant,
  updateTenantById,
  migrateExistingTenantStatus,
  getTenantProfile,
  changePasswordTenant,
};
