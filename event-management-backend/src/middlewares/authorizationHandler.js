const jwt = require('jsonwebtoken');
const { AuthConstants } = require("../constants/AuthConstants");
const { HttpStatusCodeConstants } = require("../constants/HttpStatusCodeConstants");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const error = new Error(AuthConstants.TokenNotFound);
    error.statusCode = HttpStatusCodeConstants.Unauthorized;
    next(error);
    return;
  }

  try {
    const decodedPayload = jwt.verify(token, JWT_SECRET);
    req.decodedUser = decodedPayload;
    next();
  } catch (error) {
    console.error(`Error while decoding token - ${error}`);
    const err = new Error(AuthConstants.InvalidOrExpiredToken);
    err.statusCode = HttpStatusCodeConstants.Unauthorized;
    next(err);
  }
};

const isAdmin = (req, res, next) => {
  if (req.decodedUser.role !== 'Admin') {
    const err = new Error(AuthConstants.AdminOnly);
    err.statusCode = HttpStatusCodeConstants.Forbidden;
    next(err);
    return;
  }
  next();
};

const checkUserIdMatch = (req, res, next) => {
  const userIdFromToken = req.decodedUser.userId;
  const userIdFromRequest = req.body.userId || req.params.userId;

  // Compare user IDs
  if (userIdFromToken !== parseInt(userIdFromRequest, 10)) {
    const err = new Error(AuthConstants.UserMismatch);
    err.statusCode = HttpStatusCodeConstants.Forbidden;
    next(err);
    return;
  }
  next();
};

module.exports = { verifyToken, isAdmin, checkUserIdMatch };
