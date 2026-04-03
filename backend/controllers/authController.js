const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerOrg = async (req, res) => {
    const { orgName, adminName, email, password } = req.body;
    try {
        let org = await Organization.findOne({ name: orgName });
        if (org) return res.status(400).json({ msg: 'Organization already exists' });

        org = new Organization({ name: orgName, slug: orgName.toLowerCase().replace(/ /g, '-') });
        await org.save();

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Admin email already exists' });

        user = new User({ organizationId: org._id, name: adminName, email, password, role: 'admin' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id, orgId: org._id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, orgName: org.name } });
        });
    } catch (err) { res.status(500).send('Server error'); }
};

exports.login = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        let user = await User.findOne({ $or: [{ email: email }, { username: username || email }] }).populate('organizationId');
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, orgId: user.organizationId._id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, orgName: user.organizationId.name } });
        });
    } catch (err) { res.status(500).send('Server error'); }
};
