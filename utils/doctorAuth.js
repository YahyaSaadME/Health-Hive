const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_DOCT;

const doctorAuth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ','');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded)
        
        req.user = decoded.id;
        
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = doctorAuth;
