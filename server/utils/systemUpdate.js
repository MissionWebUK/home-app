require('../config/config');

const request = require("request");
const moment = require('moment');
const fs = require('fs');
const bodyParser = require('body-parser');
const child = require('child_process').exec;

const {mongoose} = require('../db/mongoose');

var {Setting} = require('../models/settings');

const si = require('systeminformation');

var systemUpdate = () => {

  var gateway = 1;

  si.cpuTemperature()
    .then(data => {

      var boardTemp = data.main;

      si.mem()
        .then(data => {

          var memTotal = data.total;
          var memFree = data.free;
          var memUsed = data.used;
          var memAvail = data.available;

          si.osInfo()
            .then(data => {

              var platform = data.platform;
              var distro = data.distro;
              var release = data.release;
              var kernel = data.kernel;
              var hostname = data.hostname;

              si.fsSize()
                .then(data => {

                  var bootSize = data[1].size;
                  var bootUsed = data[1].used;
                  var bootName = data[1].fs;
                  var rootSize = data[0].size;
                  var rootUsed = data[0].used;
                  var rootName = data[0].fs;

                  si.currentLoad()
                    .then(data => {

                      var currentLoad = data.currentload;;
                      var avgLoad = data.avgload;

                      var patchOptions = { method: 'PATCH',
                          url: 'http://192.168.1.65:3000/system/'+gateway,
                          headers:
                           { 'content-type': 'application/json' },
                          body: {

                            avgLoad: avgLoad,
                            boardTemp: boardTemp,
                            bootName: bootName,
                            bootSize: bootSize,
                            bootUsed: bootUsed,
                            currentLoad: currentLoad,
                            distro: distro,
                            hostname: hostname,
                            kernel: kernel,
                            memAvail: memAvail,
                            memFree: memFree,
                            memTotal: memTotal,
                            memUsed: memUsed,
                            platform: platform,
                            release: release,
                            rootName: rootName,
                            rootSize: rootSize,
                            rootUsed: rootUsed

                          },
                          json: true };

                        request(patchOptions, function(error, response, body) {

                          if (error) {

                            var today = new Date();
                            var time = moment(today).format('h:mm:ss a');
                            var date = moment(today).format('MMMM Do YYYY');

                            fs.appendFileSync('../app.log', date + " " + time + " ");

                            fs.appendFileSync('../app.log', "Error getting system info" + "\n" + error + "\n");

                          }

                          response = null;
                          body = null;

                        });

                      data = null;

                    })
                    .catch(error => console.error(error));

                    data = null;

                })
                .catch(error => {

                  var today = new Date();
                  var time = moment(today).format('h:mm:ss a');
                  var date = moment(today).format('MMMM Do YYYY');

                  fs.appendFileSync('../app.log', date + " " + time + " ");

                  fs.appendFileSync('../app.log', "Error getting system info" + "\n" + error + "\n");

                });

                data = null;

            })
            .catch(error => {

              var today = new Date();
              var time = moment(today).format('h:mm:ss a');
              var date = moment(today).format('MMMM Do YYYY');

              fs.appendFileSync('../app.log', date + " " + time + " ");

              fs.appendFileSync('../app.log', "Error getting system info" + "\n" + error + "\n");

            });

            data = null;

        })
        .catch(error => {

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('../app.log', date + " " + time + " ");

          fs.appendFileSync('../app.log', "Error getting system info" + "\n" + error + "\n");

        });

        data = null;

    })
    .catch(error => {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('../app.log', date + " " + time + " ");

      fs.appendFileSync('../app.log', "Error getting system info" + "\n" + error + "\n");

    });

  child('service mongodb status', (error, stdout, stderr) => {

    if (error) {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('../app.log', date + " " + time + " ");

      fs.appendFileSync('../app.log', "Unable to get MongoDB Status" + "\n" + error + "\n");

      return;

    }

    var status = stdout.split(/\r?\n/);

    status = status[2].split(" ");

    if (status[4] != "active" || status[5] != "(running)") {

      child('service mongodb restart', (error) => {

        if (error) {

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('../app.log', date + " " + time + " ");

          fs.appendFileSync('../app.log', "Error restarting MongoDB" + "\n" + error + "\n");

          return;

        }

      });

    }

    stdout = null;
    stderr = null;

  });

};

module.exports = {systemUpdate};
