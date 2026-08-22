export const handlePublicFeed = (req, res) => {
  return res.status(200).json({
    success: true,
    tier: 'PUBLIC_TIER',
    data: { message: 'Public Placement Bulletin Data', items: ['TCS Drive', 'Infosys Drive'] }
  });
};

export const handleSensitiveLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Credentials required' } });
  }

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token: 'mock-jwt-token-for-user-101'
  });
};

export const handleUserDashboard = (req, res) => {
  return res.status(200).json({
    success: true,
    tier: 'AUTHENTICATED_USER_TIER',
    user: req.user,
    data: { applications_active: 3, interviews_scheduled: 1 }
  });
};