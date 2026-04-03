const User = require('../models/User');
const Complaint = require('../models/Complaint');

exports.getProfile = async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.id)
            .select('-password')
            .populate({
                path: 'assignedBus',
                populate: {
                    path: 'driverId',
                    select: 'name email contactNumber phone username'
                }
            })
            .populate('preferredStop');

        if (!userProfile) {
            return res.status(404).json({ msg: 'User profile not found' });
        }

        res.json(userProfile);
    } catch (err) { 
        console.error('Profile fetch error:', err.message);
        res.status(500).send('Server error'); 
    }
};

exports.raiseComplaint = async (req, res) => {
    const { title, description } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const complaint = new Complaint({ 
            organizationId: req.user.orgId, 
            studentId: req.user.id, 
            title, 
            description, 
            busId: user.assignedBus,
            status: 'pending' // strict enum
        });
        await complaint.save();
        res.json(complaint);
    } catch (err) { 
        console.error("Complaint Save Error:", err.message);
        res.status(500).send('Server error'); 
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) { res.status(500).send('Server error'); }
};
