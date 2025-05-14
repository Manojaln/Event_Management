const { HttpStatusCodeConstants } = require("../constants/HttpStatusCodeConstants");
const { ResponseConstants } = require("../constants/ResponseConstants");
const { ResponseWrapper } = require("../interfaces/ResponseWrapper");

function responseHandler(req, res, next) {
    const statusCode = res.statusCode || HttpStatusCodeConstants.Ok;
    // set exception to null
    ResponseWrapper.exception = null;
    // set the response message
    ResponseWrapper.responseMessage = ResponseConstants.SuccessResponseMessage;
    // set the responseData
    ResponseWrapper.responseData = res.responseBody;

    // set the HTTP Response StatusCode
    res.status(statusCode);
    res.json(ResponseWrapper);
}

module.exports.responseHandler = responseHandler;