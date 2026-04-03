const Bus = require('../models/Bus');
const GPSLog = require('../models/GPSLog');

exports.getMyBus = async (req, res) => {
    try {
        const bus = await Bus.findOne({ driverId: req.user.id })
            .populate({
                path: 'route',
                populate: { path: 'stops' } // Map route strictly with populated stops to drive Driver UI
            });
        res.json(bus || {});
    } catch (err) { res.status(500).send('Server error'); }
};

exports.updateTripStatus = async (req, res) => {
    const { status, busId } = req.body;
    try {
        const bus = await Bus.findOne({ _id: busId, organizationId: req.user.orgId });
        if (!bus) return res.status(404).json({ msg: 'Bus not found' });
        bus.status = status;
        await bus.save();
        res.json({ msg: `Trip ${status}`, status });
    } catch (err) { res.status(500).send('Server error'); }
};

exports.postLocation = async (req, res) => {
    const { busId, latitude, longitude, speed, source } = req.body;
    try {
        const log = new GPSLog({ organizationId: req.user.orgId, busId, driverId: req.user.id, latitude, longitude, speed, source });
        await log.save();
        await Bus.findByIdAndUpdate(busId, { lastLocation: { latitude, longitude, timestamp: Date.now() } });
        res.json(log);
    } catch (err) { res.status(500).send('Server error'); }
};
