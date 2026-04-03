const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Bus = require('../models/Bus');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');

// --- ROUTE & STOP MANAGEMENT ---
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find({ organizationId: req.user.orgId }).populate('stops');
        res.json(routes);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.createRoute = async (req, res) => {
    const { name, startLocation, endLocation } = req.body;
    try {
        const newRoute = new Route({ organizationId: req.user.orgId, name, startLocation, endLocation });
        await newRoute.save();
        res.json(newRoute);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.addStopToRoute = async (req, res) => {
    const { name, latitude, longitude, order } = req.body;
    try {
        const newStop = new Stop({ organizationId: req.user.orgId, name, latitude, longitude, order, routeId: req.params.id });
        await newStop.save();
        await Route.findByIdAndUpdate(req.params.id, { $push: { stops: newStop._id } });
        res.json(newStop);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.assignRoute = async (req, res) => {
    const { busId, routeId } = req.body;
    try {
        const bus = await Bus.findOneAndUpdate({ _id: busId, organizationId: req.user.orgId }, { $set: { route: routeId } }, { new: true });
        res.json({ msg: 'Route assigned to bus successfully', bus });
    } catch (err) { res.status(500).send('Server error'); }
};

// --- STUDENT & FACULTY MANAGEMENT ---
exports.createMember = async (req, res) => {
    const { name, email, password, role, rollNumber, employeeId, assignedBus, seatNumber } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User exists' });
        user = new User({ organizationId: req.user.orgId, name, email, password, role, rollNumber, employeeId, assignedBus, seatNumber });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.json(user);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({ organizationId: req.user.orgId, role: req.params.role }).populate('assignedBus');
        res.json(users);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.updateUser = async (req, res) => {
    const { name, email, contactNumber, rollNumber, employeeId } = req.body;
    try {
        const updateData = { name, email };
        if (contactNumber) updateData.contactNumber = contactNumber;
        if (rollNumber) updateData.rollNumber = rollNumber;
        if (employeeId) updateData.employeeId = employeeId;
        const user = await User.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.orgId }, { $set: updateData }, { new: true });
        res.json(user);
    } catch (err) { res.status(500).send('Server error during user update'); }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, organizationId: req.user.orgId });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role === 'driver') await Bus.updateMany({ driverId: user._id }, { $unset: { driverId: 1 } });
        if (['student', 'faculty'].includes(user.role) && user.assignedBus) {
             const pullTarget = user.role === 'faculty' ? { faculty: user._id } : { students: user._id };
             await Bus.findByIdAndUpdate(user.assignedBus, { $pull: pullTarget });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User formally removed from all systems' });
    } catch (err) { res.status(500).send('Server error'); }
};

// --- BUS MANAGEMENT ---
exports.getBuses = async (req, res) => {
    try {
        const buses = await Bus.find({ organizationId: req.user.orgId }).populate('driverId route students faculty');
        res.json(buses);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.createBus = async (req, res) => {
    const { busNumber, driverName, driverUsername, driverPassword, driverContact, routeId } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(driverPassword, salt);
        const newDriver = new User({ organizationId: req.user.orgId, name: driverName, email: `${driverUsername}@bus.com`, username: driverUsername, password: hashedPassword, role: 'driver', contactNumber: driverContact });
        await newDriver.save();
        const newBus = new Bus({ organizationId: req.user.orgId, busNumber, driverId: newDriver._id, route: routeId || null });
        await newBus.save();
        res.json({ bus: newBus, driver: newDriver });
    } catch (err) { 
        const detailedMsg = err.code === 11000 ? `Duplicate error: that username or email is already taken. Please choose another.` : `Server error: ${err.message}`;
        res.status(500).json({ msg: detailedMsg }); 
    }
};

exports.updateBus = async (req, res) => {
    const { busNumber, driverName, driverContact, routeId } = req.body;
    try {
        const bus = await Bus.findOne({ _id: req.params.id, organizationId: req.user.orgId });
        if (!bus) return res.status(404).json({ msg: 'Bus not found' });
        bus.busNumber = busNumber || bus.busNumber;
        if (routeId !== undefined) bus.route = routeId || null;
        await bus.save();
        if (bus.driverId) await User.findByIdAndUpdate(bus.driverId, { $set: { name: driverName, contactNumber: driverContact } });
        res.json({ msg: 'Bus and Driver updated successfully' });
    } catch (err) { res.status(500).json({ msg: 'Server error during update' }); }
};

exports.deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findOne({ _id: req.params.id, organizationId: req.user.orgId });
        if (!bus) return res.status(404).json({ msg: 'Bus not found' });
        if (bus.driverId) await User.findByIdAndDelete(bus.driverId);
        await Bus.findByIdAndDelete(bus._id);
        res.json({ msg: 'Bus and associated driver permanently deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error during deletion' }); }
};

// --- ASSIGNMENTS ---
exports.assignStudent = async (req, res) => {
    const { studentId, busId, seatNumber } = req.body;
    try {
        const student = await User.findOne({ _id: studentId, role: 'student', organizationId: req.user.orgId });
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        const bus = await Bus.findOne({ _id: busId, organizationId: req.user.orgId });
        if (!bus) return res.status(404).json({ msg: 'Bus not found' });
        if (student.assignedBus && student.assignedBus.toString() !== busId.toString()) await Bus.findByIdAndUpdate(student.assignedBus, { $pull: { students: student._id } });
        student.assignedBus = bus._id;
        if (seatNumber) student.seatNumber = seatNumber;
        await student.save();
        if (!bus.students.includes(student._id)) { bus.students.push(student._id); await bus.save(); }
        res.json({ msg: 'Student securely assigned to bus', bus, student });
    } catch (err) { res.status(500).json({ msg: 'Server error during assignment' }); }
};

exports.removeStudent = async (req, res) => {
    const { studentId, busId } = req.body;
    try {
        await User.findByIdAndUpdate(studentId, { $unset: { assignedBus: 1, seatNumber: 1 } });
        await Bus.findByIdAndUpdate(busId, { $pull: { students: studentId } });
        res.json({ msg: 'Student unassigned successfully' });
    } catch (err) { res.status(500).json({ msg: 'Server error during unassign' }); }
};

exports.assignFaculty = async (req, res) => {
    const { facultyId, busId, seatNumber } = req.body;
    try {
        const faculty = await User.findOne({ _id: facultyId, role: 'faculty', organizationId: req.user.orgId });
        if (!faculty) return res.status(404).json({ msg: 'Faculty not found' });
        const bus = await Bus.findOne({ _id: busId, organizationId: req.user.orgId });
        if (!bus) return res.status(404).json({ msg: 'Bus not found' });
        if (faculty.assignedBus && faculty.assignedBus.toString() !== busId.toString()) await Bus.findByIdAndUpdate(faculty.assignedBus, { $pull: { faculty: faculty._id } });
        faculty.assignedBus = bus._id;
        if (seatNumber) faculty.seatNumber = seatNumber;
        await faculty.save();
        if (!bus.faculty.includes(faculty._id)) { bus.faculty.push(faculty._id); await bus.save(); }
        res.json({ msg: 'Faculty securely assigned to bus', bus, faculty });
    } catch (err) { res.status(500).json({ msg: 'Server error during faculty assignment' }); }
};

exports.removeFaculty = async (req, res) => {
    const { facultyId, busId } = req.body;
    try {
        await User.findByIdAndUpdate(facultyId, { $unset: { assignedBus: 1, seatNumber: 1 } });
        await Bus.findByIdAndUpdate(busId, { $pull: { faculty: facultyId } });
        res.json({ msg: 'Faculty unassigned successfully' });
    } catch (err) { res.status(500).json({ msg: 'Server error during faculty unassign' }); }
};

// --- COMPLAINTS MANAGEMENT ---
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ organizationId: req.user.orgId }).populate('studentId', 'name rollNumber email').sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) { res.status(500).send('Server error'); }
};

exports.updateComplaint = async (req, res) => {
    const { status, adminResponse } = req.body;
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $set: { status: status || 'resolved', adminResponse: adminResponse } }, { new: true });
        res.json(complaint);
    } catch (err) { res.status(500).send('Server error'); }
};
