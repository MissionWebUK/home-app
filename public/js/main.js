/*

Main Function Loads with the page

*/

var socket = io();

$(function(){

  $(".toggle").change(function(event) {

    var id = "#" + event.target.id;

    if ($(id).data().dest) {

      if ($('input.checkbox_check').is(':checked')) {

        socket.emit('toggle', {

          toggle: 1,
          destination: $(id).data().dest,
          sensor: $(id).data().sensor

        })

      } else {

        socket.emit('toggle', {

          toggle: 0,
          destination: $(id).data().dest,
          sensor: $(id).data().sensor

        })

      }

    }

  });

});

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

      socket.emit('percent', {

        percent: percent,
        destination: $(id).data().dest,
        sensor: $(id).data().sensor

      })

    }

    var percentHtml = "<p>"+percent+"&#37;</p>";

    var textId = "#" + (event.target.parentElement.id+1);

    $(textId).html(percentHtml);

  });

});

$(function() {

  $(".picker").change(function(event) {

    var id = "#" + event.target.id;

    console.log(event);

    if ($(id).data().dest) {

      var colour = $(id).val();

      socket.emit('colour', {

        colour: colour,
        destination: $(id).data().dest,
        sensor: $(id).data().sensor

      })

    }

  });

});

function startTime() {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    var html = '<h2>'+time+'</h2>'+
               '<h3>'+date+'</h3>'

    $('#clock').html(html);

    var t = setTimeout(startTime, 500);

}

socket.on('connect', function () {

  socket.emit('settings', {}, function (settings) {

    //console.log(settings);

    var sunrise = moment(settings.value.sunrise).format('h:mm a');
    var sunset = moment(settings.value.sunset).format('h:mm a');

    var html = '<p>Sun Rise: '+sunrise+'</p>'+
               '<p>Sun Set: '+sunset+'</p>';

    $('#sunTimes').html(html);

    var numSections = settings.value.dashboards[0].section.length;

    for (var i = 0; i<numSections; i++) {

      var  id = settings.value.dashboards[0].section[i].id;

      var readOnly = settings.value.dashboards[0].section[i].readOnly;

      if (readOnly == true) {

        var htmlId = "#" + id;

        $(htmlId).prop('disabled', true);

      }

      if (settings.value.dashboards[0].section[i].destination) {

        if (readOnly == true) {

          var htmlId = "#" + id;

          var  destination = settings.value.dashboards[0].section[i].destination;

          var sensor = settings.value.dashboards[0].section[i].sensor;

          socket.emit('value', {

            destination: destination,
            sensor: sensor

          }, function (value) {

            var checked = value.value[0].sensors[0].currentValue;

            var htmlId = "#" + value.value[0].sensors[0].roToggleHtmlId;

            if (checked == 1) {

              $(htmlId).prop('checked', true);

            } else if (checked == 0) {

              $(htmlId).prop('checked', false);

            }

          });

        }

      }

      if (settings.value.dashboards[0].section[i].destination) {

        var  destination = settings.value.dashboards[0].section[i].destination;

        var sensor = settings.value.dashboards[0].section[i].sensor;

        $(htmlId).data("dest", destination);
        $(htmlId).data("sensor", sensor);

        var type = settings.value.dashboards[0].section[i].type;

        if (type == "value") {

          socket.emit('value', {

            destination: destination,
            sensor: sensor

          }, function (value) {

            var temperature = value.value[0].sensors[0].currentValue;

            var updated = moment(value.value[0].sensors[0].valueUpdated).format('h:mm:ss a MMMM Do YYYY');

            var html = '<h2>'+temperature+'&deg; C</h2>'+
                       '<p><strong>Last Updated:</strong> '+updated;

            $('#temp').html(html);

          });

        } else if (type == "graph") {

          var sensors = [];

          var sensorLength = settings.value.dashboards[0].section[i].multiSensor.length;

          for (var j = 0; j<sensorLength; j++) {

            var sensorDetail = {

              destination: settings.value.dashboards[0].section[i].multiSensor[j].destination,
              sensor: settings.value.dashboards[0].section[i].multiSensor[j].sensor

            }

            sensors.push(sensorDetail);

          }

          socket.emit('graph', {

            sensors: sensors

          }, function (values) {

            var series = [];

            for (var i = 0; i<values.length; i++) {

              var data = [];

              var timePlus = moment(values[i].values.sensors[0].values[0].timestamp).add(5, 'minutes');

              var numValues = values[i].values.sensors[0].values.length;

              for(var g=0; g<numValues; g++){

                var timeFor = moment(values[i].values.sensors[0].values[g].timestamp);

                var time = values[i].values.sensors[0].values[g].timestamp;

                var value = values[i].values.sensors[0].values[g].value;

                if (timeFor > timePlus || data.length == 0) {

                  data.push({x: new Date(time), y: value});

                  timePlus = moment(values[i].values.sensors[0].values[g].timestamp).add(5, 'minutes');

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
                      return moment(value).format('h:mm a');
                    }
                  },

              showArea: true,
              showPoint: false

            }

            new Chartist.Line('#chartbox', searchData, options);

          });

        }

      }

    }

    setInterval(function(){

      var numSections = settings.value.dashboards[0].section.length;

      for (var i = 0; i<numSections; i++) {

        var  id = settings.value.dashboards[0].section[i].id;

        var readOnly = settings.value.dashboards[0].section[i].readOnly;

        if (settings.value.dashboards[0].section[i].destination) {

          if (readOnly == true) {

            var htmlId = "#" + id;

            $(htmlId).prop('disabled', true);

            var  destination = settings.value.dashboards[0].section[i].destination;

            var sensor = settings.value.dashboards[0].section[i].sensor;

            socket.emit('value', {

              destination: destination,
              sensor: sensor

            }, function (value) {

              var checked = value.value[0].sensors[0].currentValue;

              var htmlId = "#" + value.value[0].sensors[0].roToggleHtmlId;

              if (checked == 1) {

                $(htmlId).prop('checked', true);

              } else if (checked == 0) {

                $(htmlId).prop('checked', false);

              }

            });

          }

        }

        if (settings.value.dashboards[0].section[i].destination) {

          var destination = settings.value.dashboards[0].section[i].destination;

          var sensor = settings.value.dashboards[0].section[i].sensor;

          var type = settings.value.dashboards[0].section[i].type;

          if (type == "value") {

            socket.emit('value', {

              destination: destination,
              sensor: sensor

            }, function (value) {

              var temperature = value.value[0].sensors[0].currentValue;

              var updated = moment(value.value[0].sensors[0].valueUpdated).format('h:mm:ss a MMMM Do YYYY');

              var html = '<h2>'+temperature+'&deg; C</h2>'+
                         '<p><strong>Last Updated:</strong> '+updated;

              $('#temp').html(html);

            });

          } else if (type == "graph") {

            var sensors = [];

            var sensorLength = settings.value.dashboards[0].section[i].multiSensor.length;

            for (var j = 0; j<sensorLength; j++) {

              var sensorDetail = {

                destination: settings.value.dashboards[0].section[i].multiSensor[j].destination,
                sensor: settings.value.dashboards[0].section[i].multiSensor[j].sensor

              }

              sensors.push(sensorDetail);

            }

            socket.emit('graph', {

              sensors: sensors

            }, function (values) {

              var series = [];

              for (var i = 0; i<values.length; i++) {

                var data = [];

                var timePlus = moment(values[i].values.sensors[0].values[0].timestamp).add(5, 'minutes');

                var numValues = values[i].values.sensors[0].values.length;

                for(var g=0; g<numValues; g++){

                  var timeFor = moment(values[i].values.sensors[0].values[g].timestamp);

                  var time = values[i].values.sensors[0].values[g].timestamp;

                  var value = values[i].values.sensors[0].values[g].value;

                  if (timeFor > timePlus || data.length == 0) {

                    data.push({x: new Date(time), y: value});

                    timePlus = moment(values[i].values.sensors[0].values[g].timestamp).add(5, 'minutes');

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
                        return moment(value).format('h:mm a');
                      }
                    },

                showArea: true,
                showPoint: false

              }

              new Chartist.Line('#chartbox', searchData, options);

            });

          }

        }

      }

    }, 30000);

  });

});
