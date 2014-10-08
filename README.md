# imraising-tracker
[![Build Status](https://secure.travis-ci.org/Schmoopiie/imraising-tracker.png?branch=master)](https://travis-ci.org/Schmoopiie/imraising-tracker)

ImRaising is a trademark or registered trademark of ImRaising LLC in the U.S. and/or other countries. "imraising-tracker" is not operated by, sponsored by, or affiliated with ImRaising LLC in any way.

## Install

Either add the library as a dependency in your ``package.json`` or install the library globally:

```bash
$ npm install -g imraising-tracker
```

## How it works

**Javascript**
```javascript
var imraising = require('imraising-tracker');

var client = new imraising({
    key: 'your_advanced_key' // https://imraising.tv/dashboard/settings/
});

client.addListener('donation.add', function(data) {
    var message  = data.message || '';
    var nickname = data.nickname || '';
    var amount   = data.amount.display.total || 0.00;
    var currency = data.amount.display.currency || 'USD';

    console.log(nickname + ' ('+amount+' '+currency+'): '+message);
});

client.addListener('donation.delete', function(data) {
    console.log('Deleted donation id: '+data._id);
});
```

## Events

**donation.add**
- A new donation was added, either manually or through PayPal
- You will receive the following information in the event data:
```javascript
{
  "_id":      "ffffffffffffffffffffffff",
  "nickname": String,
  "message":  String,                     // Optional
  "time":     "1970-01-01T00:00:00.000Z", // ISO-8601 Date
  "amount": {
      "display": {
          "total":    "Float",
          "currency": "XTS"
      }
  }
}
```
**donation.delete**
- A donation was deleted, either by a refund/chargeback or by the user deleting it from the dashboard
- If your application keeps a log of donations this event should be handled.
- You will only receive the donation id in the event data:
```javascript
{
  "_id":      "ffffffffffffffffffffffff"
}
```

## Retrieve donations

Available options:
- ``offset``: non-negative integer (optional) 
- ``limit``: non-negative non-zero integer <= 100 (optional)

Specify how many donations to request, must be less than or equal to 100.

- ``startDate``: ISO-8601 Date (optional) 
- ``endDate``: ISO-8601 Date (optional) 
- ``sort``: string (optional)

A field to sort by, valid fields are: nickname, amount, time. Placing a - infront will sort in reverse order.

```javascript
client.getDonations({limit:10}).then(function (data) {
    console.log(data);
}, function (err) {
    console.log(err);
});
```

## Retrieve top donors

Available options:
- ``offset``: non-negative integer (optional) 
- ``limit``: non-negative non-zero integer <= 100 (optional)

Specify how many top donors to request, must be less than or equal to 100, default is 10.

- ``startDate``: ISO-8601 Date (optional) 
- ``endDate``: ISO-8601 Date (optional) 

A field to sort by, valid fields are: nickname, amount, time. Placing a - infront will sort in reverse order.

```javascript
client.getTopDonors({limit:10}).then(function (data) {
    console.log(data);
}, function (err) {
    console.log(err);
});
```

## Generate a test donation

This allows you to broadcast a test donation into the system, it does not save the donation and the donation will not appear in the report. However, it will trigger all widgets, ImRaising Sync, and all other systems listening to ``/listen``. The donation will be broadcast with the currency code ``XTS`` (testing code) and may be ignored by some systems like the Dashboard.

```javascript
client.testDonation();
```

## Contributing Guidelines

Please review the [guidelines for contributing](https://github.com/Schmoopiie/imraising-tracker/blob/master/CONTRIBUTING.md) to this repository.

## License

The MIT License (MIT)

Copyright (c) 2014 Schmoopiie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.