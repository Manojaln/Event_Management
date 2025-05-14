const { HttpStatusCodeConstants } = require("../constants/HttpStatusCodeConstants");
const { ResponseConstants } = require("../constants/ResponseConstants");
const { ResponseWrapper } = require("../interfaces/ResponseWrapper");

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || HttpStatusCodeConstants.InternalServerError;
    // set the exception in the responseBody
    if(!ResponseWrapper.exception) { ResponseWrapper.exception = {} }
    ResponseWrapper.exception.code = statusCode;
    ResponseWrapper.exception.message = err.message;
    ResponseWrapper.exception.stack =  "at " + err.stack.split("at ")[1];

    // set response as null when exception occurs
    ResponseWrapper.responseData = null;
    // set the response message
    ResponseWrapper.responseMessage = ResponseConstants.FailedResponseMessage;

    // set the HTTP Response StatusCode
    res.status(statusCode);
    res.json(ResponseWrapper);
}

module.exports.errorHandler = errorHandler;
