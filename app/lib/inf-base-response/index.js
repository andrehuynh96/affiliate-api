
function infBaseResponse(req, res, next) {
  return function infBaseResponse(req, res, next) {
    // TODO: include extended data like paging, rate limit, ...
    function success(data, statusCode) {
      res.status(statusCode).send({
        data: data
      });
    }

    function failure(message, statusCode, code, data) {
      var resData = {
        message: message,
        error: "error",
        code: code
      };
      if (data) {
        resData = { ...resData, ...data };
      }
      res.status(statusCode).send(resData);
    }

    res.success = success;
    res.failure = failure;

    res.ok = data => {
      success(data, 200);
    };

    res.badRequest = (message = "Bad Request", code = "", data = {}) => {
      failure(message, 400, code, data);
    };

    res.notFound = (message = "Not Found", code = "", data = {}) => {
      failure(message, 404, code, data);
    };

    res.serverInternalError = (message = "Server Internal Error", code = "", data = {}) => {
      if (message == "Server Internal Error") {
        message = res.__('SERVER_ERROR');
        code = "SERVER_ERROR";
      }

      failure(message, 500, code, data);
    };

    res.forbidden = (message = "Forbidden", code = "", data = {}) => {
      failure(message, 403, code, data);
    };

    res.unauthorized = (message = "Unauthorized", code = "", data = {}) => {
      if (message == "Unauthorized") {
        message = res.__('UNAUTHORIZED');
        code = "UNAUTHORIZED";
      }
      failure(message, 401, code, data);
    };

    next();
  };
}

module.exports = infBaseResponse;
