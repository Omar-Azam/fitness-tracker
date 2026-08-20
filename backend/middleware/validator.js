const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Middleware to validate registration request payload
 */
export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (username.trim().length > 30) {
    return res.status(400).json({ error: 'Username cannot exceed 30 characters' });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  next();
};

/**
 * Middleware to validate login request payload
 */
export const validateLogin = (req, res, next) => {
  const { email, username, emailOrUsername, password } = req.body;
  const identifier = emailOrUsername || email || username;

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return res.status(400).json({ error: 'Email or username is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

/**
 * Middleware to validate profile update payload
 */
export const validateUpdateProfile = (req, res, next) => {
  const { preferences } = req.body;

  if (preferences) {
    if (preferences.units && !['metric', 'imperial'].includes(preferences.units)) {
      return res.status(400).json({ error: 'Units must be either "metric" or "imperial"' });
    }

    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      return res.status(400).json({ error: 'Theme must be "light", "dark", or "system"' });
    }

    if (
      preferences.notificationsEnabled !== undefined &&
      typeof preferences.notificationsEnabled !== 'boolean'
    ) {
      return res.status(400).json({ error: 'notificationsEnabled must be a boolean' });
    }
  }

  next();
};
