var NetworkError = (function () {
    function NetworkError(method, url) {
        this.name = 'NetworkError';
        this.message = this.name + " with request: " + method + " " + url;
    }
    return NetworkError;
})();
exports.NetworkError = NetworkError;
/**
Example:

new Request('POST', '/api/reservations').sendData({venue_id: 100}, (err, response) => {
  if (err) throw err;
  console.log('got response', res);
});
*/
var Request = (function () {
    /**
    XMLHttpRequest doesn't expose method and url after setting them, so we need
    to keep track of them in the Request instance for error reporting purposes.
    */
    function Request(method, url, responseType) {
        var _this = this;
        if (responseType === void 0) { responseType = ''; }
        this.xhr = new XMLHttpRequest();
        this.xhr.open(method, url);
        this.xhr.responseType = responseType;
        this.xhr.onreadystatechange = function (event) {
            var readyState = _this.xhr.readyState;
            if (readyState == 2) {
                var content_type = _this.xhr.getResponseHeader('content-type');
                if (content_type == 'application/json') {
                    _this.xhr.responseType = 'json';
                }
            }
        };
        this.xhr.onerror = function (event) {
            _this.callback(new NetworkError(method, url));
        };
        // onload is better than onreadystatechange() { if (readyState == 4) ... }
        //   since onload will not be called if there is an error.
        this.xhr.onload = function (event) {
            if (_this.xhr.status >= 400) {
                var error = new Error(_this.xhr.response);
                return _this.callback(error);
            }
            _this.callback(null, _this.xhr.response);
        };
    }
    Request.prototype.send = function (callback) {
        this.callback = callback;
        try {
            // this might raise an error without even trying the server if we break
            // some kind of cross-origin request rule.
            this.xhr.send();
        }
        catch (exc) {
            setTimeout(function () { return callback(exc); }, 0);
        }
        return this;
    };
    Request.prototype.sendData = function (data, callback) {
        this.callback = callback;
        try {
            this.xhr.send(data);
        }
        catch (exc) {
            setTimeout(function () { return callback(exc); }, 0);
        }
        return this;
    };
    return Request;
})();
exports.Request = Request;
