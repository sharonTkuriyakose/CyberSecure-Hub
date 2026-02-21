const jwt = require('jsonwebtoken');

/**
 * FIXED: Ensures the payload matches req.user = decoded.user
 */
const generateToken = (id) => {
  return jwt.sign(
    { 
      user: { 
        id: id 
      } 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

module.exports = generateToken;