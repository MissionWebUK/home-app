require('../config/config');

const request = require("request");
const moment = require('moment');
const fs = require('fs');

const {mongoose} = require('../db/mongoose');

var {Setting} = require('../models/settings');

var weatherUpdate = () => {

  Setting.find({}).then((doc) => {

    var lat = doc[0].latitude;
    var lng = doc[0].longitude;

    requestJSON(lat, lng, (json) => {

      if (typeof json.weather !== "undefined") {

        Setting.findOneAndUpdate({

          id: 1

        }, {

          $set: {

            weatherMain: json.weather[0].main,
            weatherDescription: json.weather[0].description,
            windDirection: json.wind.deg,
            windSpeed: json.wind.speed,
            topTemp: json.main.temp_max,
            bottomTemp: json.main.temp_min,
            humidity: json.main.humidity,
            modified: moment().valueOf()

          }

        }).exec().then(() => {

        }, (e) => {

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('../app.log', date + " " + time + " ");

          fs.appendFileSync('../app.log', "Error updating weather information" + "\n" + e + "\n");

        });

      }

      json = null;

    });

    doc = null;

  });

};

module.exports = {weatherUpdate};

function requestJSON(lat, lng, callback) {

  var options = { method: 'GET',

  url: 'http://api.openweathermap.org/data/2.5/weather',
  qs:
   { lat: lat,
     lon: lng,
     units: 'metric',
     appid: '87ac8d43b12ef54aefa9eb12f2553cf3' },

  headers:
   { 'content-type': 'application/json' },

  json: true };

  request(options, function (error, response, body) {

    if (error) {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('../app.log', date + " " + time + " ");

      fs.appendFileSync('../app.log', "Error getting weather information" + "\n" + error + "\n");

      callback();

      response = null;
      body = null;

    } else {

      callback(body);

      response = null;
      body = null;

    }

  });

}
