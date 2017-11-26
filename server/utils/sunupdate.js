require('../config/config');

const request = require("request");
const moment = require('moment');

const {mongoose} = require('../db/mongoose');

var {Setting} = require('../models/settings');

var sunUpdate = () => {

  Setting.find({}).then((doc) => {

    var lat = doc[0].latitude;
    var lng = doc[0].longitude;

    requestJSON(lat, lng, (json) => {

      Setting.findOneAndUpdate({

        id: 1

      }, {

        $set: {

          sunset: json.results.sunset,
          sunrise: json.results.sunrise,
          modified: moment().valueOf()

        }

      }, function(err, result) {

        if (err) {

          console.log("Error writing sunrise/sunset to database");

        }

      });

    });

  }, (e) => {

    console.log(e);

  });

};

module.exports = {sunUpdate};

function requestJSON(lat, lng, callback) {

  var options = { method: 'GET',
                  url: 'https://api.sunrise-sunset.org/json',
                  qs:
                    { lat,
                      lng,
                      date: 'today',
                      formatted: '0' }
                };

  request(options, function (error, response, body) {

    if (error) throw new Error(error);

    var json = JSON.parse(body);

    callback(json);

  });

}
