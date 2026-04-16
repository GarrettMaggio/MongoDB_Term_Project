const userModel = require('../models/userModel');

function meApi(req, res) {
  const user = userModel.findById(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ id: user.id, username: user.username, displayName: user.displayName });
}

module.exports = { meApi };
