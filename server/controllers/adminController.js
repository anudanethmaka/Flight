const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive status is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deactivating own admin account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User status updated to ${isActive ? 'active' : 'inactive'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalFlights, totalBookings, confirmedBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Flight.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ status: 'Confirmed' }),
    ]);

    const revenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      totalUsers,
      totalFlights,
      totalBookings,
      revenue,
    });
  } catch (err) {
    next(err);
  }
};
