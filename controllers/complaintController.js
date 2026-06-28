const Complaint = require('../models/Complaint');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Tenant only (Authenticated)
const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    
    // Check if user is a tenant (from middleware)
    if (req.user.role !== 'tenant') {
        return res.status(403).json({ message: 'Only tenants can create complaints' });
    }

    const tenant = await Tenant.findById(req.user._id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant record not found' });
    }

    const complaint = await Complaint.create({
      tenant: tenant._id,
      tenantName: tenant.fullName,
      flatNumber: tenant.flatNumber || 'N/A',
      category,
      description,
      status: 'Pending',
      trackingStatus: 'Waiting for manager response'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Manager/Superadmin sees all, Tenant sees their own, Employee sees assigned
const getComplaints = async (req, res) => {
  try {
    let complaints;
    if (req.user.role === 'manager' || req.user.role === 'superadmin') {
      complaints = await Complaint.find()
        .populate('assignedEmployee', 'username email phoneNumber')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'tenant') {
      complaints = await Complaint.find({ tenant: req.user._id })
        .populate('assignedEmployee', 'username email phoneNumber')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'employee') {
      complaints = await Complaint.find({ assignedEmployee: req.user._id })
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Manager responds to complaint and assigns employee
// @route   PUT /api/complaints/:id/respond
// @access  Manager/Superadmin only
const respondToComplaint = async (req, res) => {
  try {
    const { managerResponse, employeeId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Pending' && complaint.status !== 'Responded') {
      return res.status(400).json({ message: 'Complaint already in progress or completed' });
    }

    // Find assigned employee
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({ message: 'Invalid employee assigned' });
    }

    complaint.managerResponse = managerResponse;
    complaint.assignedEmployee = employeeId;
    complaint.employeeName = employee.username || employee.fullName;
    complaint.status = 'Responded';
    complaint.trackingStatus = 'Employee assigned';

    await complaint.save();

    res.status(200).json({ success: true, message: 'Manager responded and employee assigned', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Employee updates tracking status (In Progress or Work Finished)
// @route   PUT /api/complaints/:id/tracking
// @access  Assigned Employee only
const updateTrackingStatus = async (req, res) => {
  try {
    const { status, trackingStatus, appointmentDate, remarks } = req.body; 
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user is the assigned employee
    if (complaint.assignedEmployee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    if (complaint.status === 'Completed' || complaint.status === 'Permission Granted') {
        return res.status(400).json({ message: 'Work is already finished/at approval stage' });
    }

    if (status) {
        if (!['In Progress', 'Work Finished'].includes(status)) {
            // If it's something else (like 'Responded' from initial state), ignore or error.
            // Let's just allow it if it's already that status, otherwise error.
            if (complaint.status !== status) {
                return res.status(400).json({ message: 'Status must be "In Progress" or "Work Finished"' });
            }
        } else {
            complaint.status = status;
        }

        if (status === 'Work Finished') {
            complaint.workFinishedAt = Date.now();
            if (!trackingStatus) {
                complaint.trackingStatus = 'Work finished, waiting for tenant approval';
            }
        }
    }

    if (trackingStatus !== undefined) {
        complaint.trackingStatus = trackingStatus;
    }
    if (appointmentDate !== undefined) {
        complaint.appointmentDate = appointmentDate || null;
    }
    if (remarks !== undefined) {
        complaint.remarks = remarks || '';
    }

    await complaint.save();

    res.status(200).json({ success: true, message: 'Tracking status updated', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Tenant gives permission/approval
// @route   PUT /api/complaints/:id/approve
// @access  Complaint Owner (Tenant) only
const grantPermission = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user is the owner
    if (complaint.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (complaint.status !== 'Work Finished') {
      return res.status(400).json({ message: 'Work is not marked as finished yet' });
    }

    complaint.tenantPermission = true;
    complaint.status = 'Permission Granted';
    complaint.permissionGrantedAt = Date.now();
    complaint.trackingStatus = 'Tenant approved completion. Waiting for final status update by employee.';

    await complaint.save();

    res.status(200).json({ success: true, message: 'Permission granted', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Employee marks work as completed at last
// @route   PUT /api/complaints/:id/complete
// @access  Assigned Employee only
const finalizeCompletion = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user is the assigned employee
    if (complaint.assignedEmployee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (complaint.status !== 'Permission Granted') {
      return res.status(400).json({ message: 'Cannot complete until tenant gives permission' });
    }

    complaint.status = 'Completed';
    complaint.completedAt = Date.now();
    complaint.trackingStatus = 'Work is completed successfully';

    await complaint.save();

    res.status(200).json({ success: true, message: 'Status updated to Work is Completed', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    createComplaint,
    getComplaints,
    respondToComplaint,
    updateTrackingStatus,
    grantPermission,
    finalizeCompletion
};
