# httprequest

[XMLHttpRequest](http://www.w3.org/TR/XMLHttpRequest/) wrapper.

Example:

    import {Request} from 'httprequest';
    new Request('POST', '/api/reservations').sendData({venue_id: 100}, (err, response) => {
      if (err) throw err;
      console.log('got response', res);
    });


## License

Copyright 2015 Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/#2015).
