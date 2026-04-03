const Bus = require('../models/Bus');
const Route = require('../models/Route');

exports.getBusRoute = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus || !bus.route) return res.status(404).json({ msg: 'Bus or route not found' });
        
        const route = await Route.findById(bus.route).populate('stops');
        if (!route) return res.status(404).json({ msg: 'Route not found' });
        
        res.json(route);
    } catch (err) {
        console.error('Error fetching bus route:', err);
        res.status(500).send('Server error');
    }
};
