var ess      = require('event-source-stream');
var events   = require('events');
var util     = require('util');
var request  = require('request');
var chalk    = require('chalk');
var Q        = require('q');

var error = (function() {
    var private = {
        401: 'An authentication error occured, did you remember to provide the API Key?',
        403: 'The requested API endpoint is not permitted for this authentication mode, i.e., using a Limited API Key where an Advanced API Key is required.',
        405: 'The requested HTTP method is not allowed on this URL. For example, using POST where only GET is allowed.',
        406: 'The requested content type is not acceptable, such as requesting application/json where text/event-stream is required.',
        400: 'A bad request was made, see the message for details.'
    };
    return {
        get: function(code) { return private[code] || code; }
    };
})();

var imraising = function imraising(options) {
    var self = this;
    events.EventEmitter.call(this);

    this.options = options;

    var key = (typeof this.options.key != 'undefined') ? this.options.key : '';

    if (key === '') { console.log('['+chalk.red('!')+'] '+ error.get(401)); }
    else {
        ess('https://imraising.tv/api/v1/listen?apikey='+key).on('data', function(data) {
            var data = JSON.parse(data);

            // ImRaising returns only the _id if a donation is deleted.
            var amount = data.amount.display.total || 0.00;
            if (amount === 0.00) { self.emit('donation.delete', data); }
            else { self.emit('donation.add', data); }
        });
    }
};

util.inherits(imraising, events.EventEmitter);

/**
 * This allows you to broadcast a test donation into the system,
 * it does not save the donation and the donation will not appear in the report.
 * However, it will trigger all widgets, ImRaising Sync, and all other systems
 * listening to /listen.
 *
 * The donation will be broadcast with the currency code XTS (testing code)
 * and may be ignored by some systems like the Dashboard.
 */
imraising.prototype.testDonation = function testDonation() {
    var key = (typeof this.options.key != 'undefined') ? this.options.key : '';

    if (key === '') { console.log('['+chalk.red('!')+'] '+ error.get(401)); }
    else {
        var subjects = ['I','You','Bob','John','Sue','Kate','The lizard people'];
        var verbs    = ['will search for','will get','will find','attained','found','will start interacting with','will accept','accepted'];
        var objects  = ['Billy','an apple','a Triforce','the treasure','a sheet of paper'];
        var endings  = ['.',', right?','.',', like I said.','.',', just like your momma!'];

        request.post(
            'https://imraising.tv/api/v1/donations?apikey='+this.options.key,
            { form: {
                amount: parseFloat(Math.min(1 + (Math.random() * (50)),50).toFixed(2)),
                message: subjects[Math.round(Math.random()*(subjects.length-1))]+' '+verbs[Math.round(Math.random()*(verbs.length-1))]+' '+objects[Math.round(Math.random()*(objects.length-1))]+endings[Math.round(Math.random()*(endings.length-1))]
            } },
            function (err, res) {
                if (err || res.statusCode !== 204) {
                    console.log('['+chalk.red('!')+'] '+ error.get(res.statusCode));
                }
            }
        );
    }
};

/**
 * Create a query string.
 *
 * @param data
 * @returns {string}
 */
function encodeQueryData(data) {
    var ret = [];
    for (var d in data) {
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return '&'+ret.join("&");
}

/**
 * Retrieve donations.
 *
 * @param params
 * @returns {promise|Q.promise}
 */
imraising.prototype.getDonations = function getDonations(params) {
    var key = (typeof this.options.key != 'undefined') ? this.options.key : '';
    var params = (typeof params != 'undefined') ? params : {};

    if (key === '') { console.log('['+chalk.red('!')+'] '+ error.get(401)); }
    else {
        var deferred = Q.defer();

        var query = encodeQueryData(params);
        request('https://imraising.tv/api/v1/donations?apikey='+this.options.key+query, function (err, res, body) {
            if (!err && res.statusCode === 200) { deferred.resolve(JSON.parse(body)); }
            else { deferred.reject(error.get(res.statusCode)); }
        });

        return deferred.promise;
    }
};

/**
 * Retrieve top donors.
 *
 * @param params
 * @returns {promise|Q.promise}
 */
imraising.prototype.getTopDonors = function topDonors(params) {
    var key = (typeof this.options.key != 'undefined') ? this.options.key : '';
    var params = (typeof params != 'undefined') ? params : {};

    if (key === '') { console.log('['+chalk.red('!')+'] '+ error.get(401)); }
    else {
        var deferred = Q.defer();

        var query = encodeQueryData(params);
        request('https://imraising.tv/api/v1/topDonors?apikey='+this.options.key+query, function (err, res, body) {
            if (!err && res.statusCode === 200) { deferred.resolve(JSON.parse(body)); }
            else { deferred.reject(error.get(res.statusCode)); }
        });

        return deferred.promise;
    }
};

module.exports = imraising;