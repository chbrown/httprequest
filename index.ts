export type RequestCallback = (error: Error, response?: any) => void

export class NetworkError extends Error {
  constructor(method: string, url: string) {
    super(`NetworkError with request: ${method} ${url}`)
  }
}

/**
Example:

new Request('POST', '/api/reservations').sendData({venue_id: 100}, (err, response) => {
  if (err) throw err
  console.log('got response', res)
})
*/
export class Request {
  xhr: XMLHttpRequest
  headers: Array<[string, string]> = []
  callback: RequestCallback
  /**
  XMLHttpRequest doesn't expose method and url after setting them, so we need
  to keep track of them in the Request instance for error reporting purposes.
  */
  constructor(private method: string,
              private url: string,
              responseType: XMLHttpRequestResponseType = '') {
    this.xhr = new XMLHttpRequest()
    this.xhr.responseType = responseType
    this.xhr.onreadystatechange = (event: Event) => {
      const readyState = this.xhr.readyState
      if (readyState == 2) { // HEADERS_RECEIVED
        const content_type = this.xhr.getResponseHeader('content-type')
        if (content_type.indexOf('application/json') === 0) {
          this.xhr.responseType = 'json'
        }
        else if (content_type.indexOf('text/xml') === 0) {
          this.xhr.responseType = 'document'
        }
      }
    }
    this.xhr.onerror = (event: Event) => {
      this.callback(new NetworkError(method, url))
    }
    // onload is better than onreadystatechange() { if (readyState == 4) ... }
    //   since onload will not be called if there is an error.
    this.xhr.onload = (event: Event) => {
      if (this.xhr.status >= 400) {
        const error = new Error(this.xhr.response)
        return this.callback(error)
      }
      this.callback(null, this.xhr.response)
    }
  }
  /**
  Add a header-value pair to be set on the XMLHttpRequest once it is opened.
  */
  addHeader(header: string, value: string): Request {
    this.headers.push([header, value])
    return this
  }
  send(callback: RequestCallback): Request {
    return this.sendData(undefined, callback)
  }
  sendJSON(object: any, callback: RequestCallback): Request {
    this.headers.push(['Content-Type', 'application/json'])
    return this.sendData(JSON.stringify(object), callback)
  }
  sendData(data: any, callback: RequestCallback): Request {
    this.callback = callback
    // delay opening until we actually need to so that custom event listeners
    // can be added by the user
    this.xhr.open(this.method, this.url)
    this.headers.forEach(([header, value]) => this.xhr.setRequestHeader(header, value))
    try {
      // this might raise an error without even trying the server if we break
      // some kind of cross-origin request rule.
      this.xhr.send(data)
    }
    catch (exc) {
      setTimeout(() => callback(exc), 0)
    }
    return this
  }
}
