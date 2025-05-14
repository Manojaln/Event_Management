const { validationResult } = require('express-validator');
const { HttpStatusCodeConstants } = require('../constants/HttpStatusCodeConstants');

function validationErrorHandler (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(error => error.msg).join('. ');
    let error = new Error(errorMsg);
    error.statusCode = HttpStatusCodeConstants.BadRequest;
    next(error);
    return;
  }
  next();
};

module.exports.validationErrorHandler = validationErrorHandler;
