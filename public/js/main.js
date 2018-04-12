/*
*
*
*
*     Sanders Smart Home
*     Home Controller app
*           V0.1
*
*
*
*/

// Connect the Web Socket

var socket = io();

// Toggle Switch function

$(function(){

  $(".toggle").change(function(event) {

    var id = "#" + event.target.id;

    if ($(id).data().dest) {

      if ($(id).is(':checked')) {

        socket.emit('saveValue', {
          value: 1,
          destination: $(id).data().dest,
          sensor: $(id).data().sensor,
          type: 2
        })
      } else {

        socket.emit('saveValue', {
          value: 0,
          destination: $(id).data().dest,
          sensor: $(id).data().sensor,
          type: 2
        })
      }
    }
  });
});

// Slider Function

$(function() {

  $( ".slider-vertical" ).slider({
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    value: 60,
    slide: function( event, ui ) {

      var id = "#" + event.target.parentElement.id;
      var textId = "#" + (event.target.parentElement.id+1);

      $(textId).val( ui.value );

    }

  }).mouseup(function(event) {

    var id = "#" + event.target.parentElement.id;
    var percent = $(id).slider( "value" );

    if ($(id).data().dest) {

      socket.emit('saveValue', {
        value: percent,
        destination: $(id).data().dest,
        sensor: $(id).data().sensor,
        type: 3
      })
    }

    var percentHtml = "<p>"+percent+"&#37;</p>";
    var textId = "#" + (event.target.parentElement.id+1);

    $(textId).html(percentHtml);

  });
});

// Colour Picker Function

$(function() {

  $(".picker").change(function(event) {

    var id = "#" + event.target.id;

    if ($(id).data().dest) {

      var colour = $(id).val();

      socket.emit('saveValue', {
        value: colour,
        destination: $(id).data().dest,
        sensor: $(id).data().sensor,
        type: 40
      })
    }
  });
});

// Clock Function

function startTime() {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');
    var htmlTime = '<h2>'+time+'</h2>';
    var htmlDate = '<h3>'+date+'</h3>';

    $('#clock').html(htmlTime);
    $('#date').html(htmlDate);

    var t = setTimeout(startTime, 500);

}

// When the Web Socket Connects

socket.on('connect', function () {

  // Request Settings from the Server

  socket.emit('settings', {}, function (settings) {

    if (settings.settings) {

      var sunrise = moment(settings.settings.sunrise).format('h:mm a');
      var sunset = moment(settings.settings.sunset).format('h:mm a');
      var windDirection = settings.settings.windDirection;
      var windSpeed = settings.settings.windSpeed;
      var weather = settings.settings.weatherMain;

      // Print the Sunset / Sunrise times

      var sunriseHtml = '<p style="font-size: 15px;">'+sunrise+'</p>';
      var sunsetHtml = '<p style="font-size: 15px;">'+sunset+'</p>';

      // Print the Weather information

      if (windDirection > 330 || windDirection < 30) {
        windDirection = 'N';
      } else if (windDirection >= 30 && windDirection < 60) {
        windDirection = 'NE';
      } else if (windDirection >= 60 && windDirection < 120) {
        windDirection = 'E';
      } else if (windDirection >= 120 && windDirection < 150) {
        windDirection = 'SE';
      } else if (windDirection >= 150 && windDirection < 210) {
        windDirection = 'S';
      } else if (windDirection >= 210 && windDirection < 240) {
        windDirection = 'SW';
      } else if (windDirection >= 240 && windDirection < 300) {
        windDirection = 'W';
      } else if (windDirection >= 300 && windDirection < 330) {
        windDirection = 'NW';
      }

      var windDirectionHtml = '<p style="font-size: 10px; text-align: center;">'+windDirection+'</p>';
      windSpeed = Math.round(windSpeed * 2.24).toFixed(2);
      var windSpeedHtml = '<p style="font-size: 10px; text-align: center;">'+windSpeed+' mph</p>';

      if (weather == 'Thunderstorm') {
        $('#weather').addClass("thunderstorm");
      } else if (weather == 'Drizzle') {
        $('#weather').addClass("drizzle");
      } else if (weather == 'Rain') {
        $('#weather').addClass("rain");
      } else if (weather == 'Snow') {
        $('#weather').addClass("snow");
      } else if (weather == 'Atmosphere') {
        $('#weather').addClass("atmosphere");
      } else if (weather == 'Clear') {
        $('#weather').addClass("clear");
      } else if (weather == 'Clouds') {
        $('#weather').addClass("clouds");
      } else if (weather == 'Extreme') {
        $('#weather').addClass("extreme");
      } else if (weather == 'Additional') {
        $('#weather').addClass("additional");
      }

      $('#sunrise').html(sunriseHtml);
      $('#sunset').html(sunsetHtml);
      $('#windDirection').html(windDirectionHtml);
      $('#windSpeed').html(windSpeedHtml);

      // Build table of sensors

      if($('#table').length) {

        var tableHtml = '<table class="table table-condensed table-hover">'+
                          '<tr>'+
                            '<th>Node</th>'+
                            '<th>Sensor</th>'+
                            '<th>Type</th>'+
                            '<th>Current Value</th>'+
                            '<th>Last Updated</th>'+
                          '</tr>';

        socket.emit('sensors', {}, function (sensors) {

          if (sensors.sensors[0]) {

            for (var i=0; i<sensors.sensors.length; i++) {

              for (var j=0; j<sensors.sensors[i].sensors.length; j++) {

                var node = sensors.sensors[i].name;
                var sensor = sensors.sensors[i].sensors[j].name;
                var sensorType = sensors.sensors[i].sensors[j].type;
                var currentValue = sensors.sensors[i].sensors[j].currentValue;
                var lastUpdated = moment(sensors.sensors[i].sensors[j].valueUpdated).format('h:mm:ss a DD/MM/YY');

                if (sensorType != 17) {

                  tableHtml = tableHtml +
                              '<tr>'+
                                '<td>'+node+'</td>'+
                                '<td>'+sensor+'</td>'+
                                '<td>'+sensorType+'</td>'+
                                '<td>'+currentValue+'</td>'+
                                '<td>'+lastUpdated+'</td>'+
                              '</tr>';

                }
              }
            }
          } else {
            console.log(sensors);
          }

          tableHtml = tableHtml +
                      '</table>';

          $('#table').html(tableHtml);

        });

      }

      // Run through each of the dashboard sections

      var numSections = settings.settings.dashboards[0].section.length;

      for (var i = 0; i<numSections; i++) {

        var id = settings.settings.dashboards[0].section[i].id;

        // If Read Only disable

        var readOnly = settings.settings.dashboards[0].section[i].readOnly;

        if (readOnly == true) {

          var htmlId = "#" + id;

          $(htmlId).prop('disabled', true);

        }

        if (settings.settings.dashboards[0].section[i].destination) {

          // If it's a toggle switch update the value and display

          if (settings.settings.dashboards[0].section[i].type == 'toggle' || settings.settings.dashboards[0].section[i].type == 'toggleRO') {

            var htmlId = "#" + id;
            var destination = settings.settings.dashboards[0].section[i].destination;
            var sensor = settings.settings.dashboards[0].section[i].sensor;

            if ($(htmlId).length) {

              socket.emit('value', {
                destination: destination,
                sensor: sensor
              }, function (value) {

                if (value.roToggleHtmlId != 0) {

                  var checked = value.currentValue;
                  var htmlId = "#" + value.roToggleHtmlId;

                  if (checked == 1) {
                    $(htmlId).prop('checked', true);
                  } else if (checked == 0) {
                    $(htmlId).prop('checked', false);
                  }

                }
              });
            }
          }
        }

        if (settings.settings.dashboards[0].section[i].destination) {

          // Add data attributes to html ids

          var htmlId = "#" + id;
          var destination = settings.settings.dashboards[0].section[i].destination;
          var sensor = settings.settings.dashboards[0].section[i].sensor;
          var type = settings.settings.dashboards[0].section[i].type;

          $(htmlId).data("dest", destination);
          $(htmlId).data("sensor", sensor);

          // If its a value section, display the following

          if (type == "value") {

            if ($(htmlId).length) {

              socket.emit('value', {
                destination: destination,
                sensor: sensor
              }, function (value) {

                if (value.valueHtmlId != 0) {

                  var currentValue = value.currentValue;
                  var updated = moment(value.valueUpdated).format('h:mm a');
                  var id = value.valueHtmlId;
                  var htmlId = "#" + id;
                  var html;

                  if (value.type == 6) {
                    html = '<h2>'+currentValue+'&deg; C</h2>';
                  } else if (value.type == 7) {
                    html = '<p style="font-size: 18px;">'+currentValue+'&#37; Humidity</p>';
                  }

                  var updatedHtml = '<p style="font-size: 15px;"><strong>Updated: </strong> '+updated

                  $(htmlId).html(html);
                  $('#updated').html(updatedHtml);

                }
              });
            }
          }

          // Or if its a colour picker, display the current colour

          else if (type == "colour") {

            if ($(htmlId).length) {

              socket.emit('value', {
                destination: destination,
                sensor: sensor
              }, function (value) {

                var currentValue = value.currentValue;
                var id = value.valueHtmlId;
                var htmlId = "#" + id;
                var hex = "#" + currentValue;
                var style = "background-image: none; background-color:" + hex + "; color: rgb(0, 0, 0);";

                $(htmlId).prop('value', currentValue);
                $(htmlId).prop('style', style);

              });
            }
          }

          // Or if its a graph section, display the graph

          else if (type == "graph") {

            var htmlId = "#" + id;

            if ($(htmlId).length) {

              if (settings.settings.dashboards[0].section[i].destination) {

                var sensors = [];
                var sensorLength = settings.settings.dashboards[0].section[i].multiSensor.length;

                for (var j = 0; j<sensorLength; j++) {

                  var sensorDetail = {
                    destination: settings.settings.dashboards[0].section[i].multiSensor[j].destination,
                    sensor: settings.settings.dashboards[0].section[i].multiSensor[j].sensor
                  }

                  sensors.push(sensorDetail);

                }

                socket.emit('graph', {
                  sensors: sensors
                }, function (values) {

                  if (values[0]) {

                    var series = [];

                    if (values[0].values != null) {
                      var htmlId = '.chart'+values[0].graphHtmlId;
                    }

                    for (var i = 0; i<values.length; i++) {

                      var data = [];

                      if (values[i].values != null) {

                        var numValues = values[i].values.length;

                        if (numValues > 0) {

                          var timePlus = moment(values[i].values[0].timestamp).add(10, 'minutes');

                          for(var g=0; g<numValues; g++){

                            var timeFor = moment(values[i].values[g].timestamp);
                            var time = values[i].values[g].timestamp;
                            var value = values[i].values[g].value;

                            if (timeFor > timePlus || data.length == 0) {
                              data.push({x: new Date(time), y: value});
                              timePlus = moment(values[i].values[g].timestamp).add(10, 'minutes');
                            }
                          }
                        }
                      }

                      series.push(data);

                    }

                    var searchData = {
                      series: series
                    };

                    var options = {
                      axisX: {
                            type: Chartist.FixedScaleAxis,
                            name: 'Time',
                            divisor: 10,
                            labelInterpolationFnc: function(value) {
                              return moment(value).format('ddd h:mm a');
                            }
                          },
                          showArea: true,
                          showPoint: false
                    }

                    new Chartist.Line(htmlId, searchData, options);

                  } else {
                    console.log(values);
                  }
                });
              }
            }
          }
        }
      }

      // Refresh these functions every 5 mins

      setInterval(function(){

        socket.emit('settings', {}, function (settings) {

          if (settings.settings) {

            var sunrise = moment(settings.settings.sunrise).format('h:mm a');
            var sunset = moment(settings.settings.sunset).format('h:mm a');
            var windDirection = settings.settings.windDirection;
            var windSpeed = settings.settings.windSpeed;
            var weather = settings.settings.weatherMain;

            // Print the Sunset / Sunrise times

            var sunriseHtml = '<p style="font-size: 15px;">'+sunrise+'</p>';
            var sunsetHtml = '<p style="font-size: 15px;">'+sunset+'</p>';

            // Print the Weather information

            if (windDirection > 330 || windDirection < 30) {
              windDirection = 'N';
            } else if (windDirection >= 30 && windDirection < 60) {
              windDirection = 'NE';
            } else if (windDirection >= 60 && windDirection < 120) {
              windDirection = 'E';
            } else if (windDirection >= 120 && windDirection < 150) {
              windDirection = 'SE';
            } else if (windDirection >= 150 && windDirection < 210) {
              windDirection = 'S';
            } else if (windDirection >= 210 && windDirection < 240) {
              windDirection = 'SW';
            } else if (windDirection >= 240 && windDirection < 300) {
              windDirection = 'W';
            } else if (windDirection >= 300 && windDirection < 330) {
              windDirection = 'NW';
            }

            var windDirectionHtml = '<p style="font-size: 10px; text-align: center;">'+windDirection+'</p>';
            windSpeed = Math.round(windSpeed * 2.24).toFixed(2);
            var windSpeedHtml = '<p style="font-size: 10px; text-align: center;">'+windSpeed+' mph</p>';

            if (weather == 'Thunderstorm') {
              $('#weather').addClass("thunderstorm");
            } else if (weather == 'Drizzle') {
              $('#weather').addClass("drizzle");
            } else if (weather == 'Rain') {
              $('#weather').addClass("rain");
            } else if (weather == 'Snow') {
              $('#weather').addClass("snow");
            } else if (weather == 'Atmosphere') {
              $('#weather').addClass("atmosphere");
            } else if (weather == 'Clear') {
              $('#weather').addClass("clear");
            } else if (weather == 'Clouds') {
              $('#weather').addClass("clouds");
            } else if (weather == 'Extreme') {
              $('#weather').addClass("extreme");
            } else if (weather == 'Additional') {
              $('#weather').addClass("additional");
            }

            $('#sunrise').html(sunriseHtml);
            $('#sunset').html(sunsetHtml);
            $('#windDirection').html(windDirectionHtml);
            $('#windSpeed').html(windSpeedHtml);

            // Build table of sensors

            if($('#table').length) {

              var tableHtml = '<table class="table table-condensed table-hover">'+
                                '<tr>'+
                                  '<th>Node</th>'+
                                  '<th>Sensor</th>'+
                                  '<th>Type</th>'+
                                  '<th>Current Value</th>'+
                                  '<th>Last Updated</th>'+
                                '</tr>';

              socket.emit('sensors', {}, function (sensors) {

                if (sensors.sensors[0]) {

                  for (var i=0; i<sensors.sensors.length; i++) {

                    for (var j=0; j<sensors.sensors[i].sensors.length; j++) {

                      var node = sensors.sensors[i].name;
                      var sensor = sensors.sensors[i].sensors[j].name;
                      var sensorType = sensors.sensors[i].sensors[j].type;
                      var currentValue = sensors.sensors[i].sensors[j].currentValue;
                      var lastUpdated = moment(sensors.sensors[i].sensors[j].valueUpdated).format('h:mm:ss a DD/MM/YY');

                      if (sensorType != 17) {

                        tableHtml = tableHtml +
                                    '<tr>'+
                                      '<td>'+node+'</td>'+
                                      '<td>'+sensor+'</td>'+
                                      '<td>'+sensorType+'</td>'+
                                      '<td>'+currentValue+'</td>'+
                                      '<td>'+lastUpdated+'</td>'+
                                    '</tr>';
                      }
                    }
                  }
                } else {
                  console.log(sensors);
                }

                tableHtml = tableHtml +
                            '</table>';
                $('#table').html(tableHtml);
              });
            }
          }
        });
      }, 300000);

      // Refresh these functions every 30 seconds

      setInterval(function(){

        // Run through each of the dashboard sections

        var numSections = settings.settings.dashboards[0].section.length;

        for (var i = 0; i<numSections; i++) {

          var id = settings.settings.dashboards[0].section[i].id;

          if (settings.settings.dashboards[0].section[i].destination) {

            // Add data attributes to html ids

            var htmlId = "#" + id;
            var destination = settings.settings.dashboards[0].section[i].destination;
            var sensor = settings.settings.dashboards[0].section[i].sensor;
            var type = settings.settings.dashboards[0].section[i].type;

            // $(htmlId).data("dest", destination);
            // $(htmlId).data("sensor", sensor);

            // If its a value section, display the following

            if (type == "value") {

              if ($(htmlId).length) {

                socket.emit('value', {
                  destination: destination,
                  sensor: sensor
                }, function (value) {

                  if (value.valueHtmlId != 0) {

                    var currentValue = value.currentValue;
                    var updated = moment(value.valueUpdated).format('h:mm a');
                    var id = value.valueHtmlId;
                    var htmlId = "#" + id;
                    var html;

                    if (value.type == 6) {
                      html = '<h2>'+currentValue+'&deg; C</h2>';
                    } else if (value.type == 7) {
                      html = '<p style="font-size: 18px;">'+currentValue+'&#37; Humidity</p>';
                    }

                    var updatedHtml = '<p style="font-size: 15px;"><strong>Updated: </strong> '+updated

                    $(htmlId).html(html);
                    $('#updated').html(updatedHtml);

                  }
                });
              }
            }

            // Or if its a graph section, display the graph

            else if (type == "graph") {

              var htmlId = "#" + id;

              if ($(htmlId).length) {

                if (settings.settings.dashboards[0].section[i].destination) {

                  var sensors = [];
                  var sensorLength = settings.settings.dashboards[0].section[i].multiSensor.length;

                  for (var j = 0; j<sensorLength; j++) {

                    var sensorDetail = {
                      destination: settings.settings.dashboards[0].section[i].multiSensor[j].destination,
                      sensor: settings.settings.dashboards[0].section[i].multiSensor[j].sensor
                    }

                    sensors.push(sensorDetail);

                  }

                  socket.emit('graph', {
                    sensors: sensors
                  }, function (values) {

                    if (values[0]) {

                      var series = [];

                      if (values[0].values != null) {
                        var htmlId = '.chart'+values[0].graphHtmlId;
                      }

                      for (var i = 0; i<values.length; i++) {

                        var data = [];

                        if (values[i].values != null) {

                          var numValues = values[i].values.length;

                          if (numValues > 0) {

                            var timePlus = moment(values[i].values[0].timestamp).add(10, 'minutes');

                            for(var g=0; g<numValues; g++){

                              var timeFor = moment(values[i].values[g].timestamp);
                              var time = values[i].values[g].timestamp;
                              var value = values[i].values[g].value;

                              if (timeFor > timePlus || data.length == 0) {
                                data.push({x: new Date(time), y: value});
                                timePlus = moment(values[i].values[g].timestamp).add(10, 'minutes');
                              }
                            }
                          }
                        }

                        series.push(data);

                      }

                      var searchData = {
                        series: series
                      };

                      var options = {
                        axisX: {
                              type: Chartist.FixedScaleAxis,
                              name: 'Time',
                              divisor: 10,
                              labelInterpolationFnc: function(value) {
                                return moment(value).format('ddd h:mm a');
                              }
                            },
                            showArea: true,
                            showPoint: false
                      }

                      new Chartist.Line(htmlId, searchData, options);

                    } else {
                      console.log(values);
                    }
                  });
                }
              }
            }
          }
        }
      }, 30000);
    } else {
      console.log(settings);
    }
  });
});

socket.on('statusChange', function (sensor) {

  // binary change

  if (sensor.type == "3") {

    var currentValue = sensor.value;
    var id = sensor.htmlId;
    var htmlId = "#" + id;
    var hex = "#" + currentValue;

    if (currentValue == 1) {
      $(htmlId).prop('checked', true);
    } else if (currentValue == 0) {
      $(htmlId).prop('checked', false);
    }

  }

  // colour change

  else if (sensor.type == "26") {

    var currentValue = sensor.value;
    var id = sensor.htmlId;
    var htmlId = "#" + id;
    var hex = "#" + currentValue;
    var style = "background-image: none; background-color:" + hex + "; color: rgb(0, 0, 0);";

    $(htmlId).prop('value', currentValue);
    $(htmlId).prop('style', style);

    $(htmlId).load(window.location.href + " " + htmlId);

  }

});
