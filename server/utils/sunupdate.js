require('../config/config');

const request = require('request');
const moment = require('moment');
const fs = require('fs');

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

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('../app.log', date + " " + time + " ");

          fs.appendFileSync('../app.log', "Error writing sunrise/sunset to database\n" + err + "\n");

        }

        result = null;
        json = null;

      });

    });

    doc = null;

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

    if (error) {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('../app.log', date + " " + time + " ");

      fs.appendFileSync('../app.log', "Error retrieving sunrise/sunset times\n" + error + "\n");

    }

    var json = JSON.parse(body);

    callback(json);

    json = null;

  });

}
