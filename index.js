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
        this.method = method;
        this.url = url;
        this.headers = [];
        this.xhr = new XMLHttpRequest();
        this.xhr.responseType = responseType;
        this.xhr.onreadystatechange = function (event) {
            var readyState = _this.xhr.readyState;
            if (readyState == 2) {
                var content_type = _this.xhr.getResponseHeader('content-type');
                if (content_type.indexOf('application/json') === 0) {
                    _this.xhr.responseType = 'json';
                }
                else if (content_type.indexOf('text/xml') === 0) {
                    _this.xhr.responseType = 'document';
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
    /**
    Add a header-value pair to be set on the XMLHttpRequest once it is opened.
    */
    Request.prototype.addHeader = function (header, value) {
        this.headers.push([header, value]);
        return this;
    };
    Request.prototype.send = function (callback) {
        return this.sendData(undefined, callback);
    };
    Request.prototype.sendJSON = function (object, callback) {
        this.headers.push(['Content-Type', 'application/json']);
        return this.sendData(JSON.stringify(object), callback);
    };
    Request.prototype.sendData = function (data, callback) {
        var _this = this;
        this.callback = callback;
        // delay opening until we actually need to so that custom event listeners
        // can be added by the user
        this.xhr.open(this.method, this.url);
        this.headers.forEach(function (_a) {
            var header = _a[0], value = _a[1];
            return _this.xhr.setRequestHeader(header, value);
        });
        try {
            // this might raise an error without even trying the server if we break
            // some kind of cross-origin request rule.
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
