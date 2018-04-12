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

// Require config file

require('./config/config');

// Require packages

const http = require('http');
const path = require('path');
const express = require('express');
const mqtt = require('mqtt');
const fs = require('fs');
const socketIO = require('socket.io');
const request = require('request');
const schedule = require('node-schedule');
const moment = require('moment');
const bodyParser = require('body-parser');

if (process.env.NODE_ENV !== 'production'){
  require('longjohn');
}

// Require DB connection

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');

// Require models & utils

const {SensorNode} = require('./models/node');
const {Setting} = require('./models/settings');
const {Gateway} = require('./models/gateway');
const {sunUpdate} = require('./utils/sunupdate');
const {weatherUpdate} = require('./utils/weatherUpdate');
const {systemUpdate} = require('./utils/systemUpdate');

// Setup public path and port variables

const publicPath = path.join(__dirname + '/../public');
const port = process.env.PORT || 3000;

// New Sensor ID

const BROADCAST_ADDRESS				   = 255;
const NODE_SENSOR_ID				       = 255;

// Commands

const C_PRESENTATION				     = 0;
const C_SET							         = 1;
const C_REQ							         = 2;
const C_INTERNAL					       = 3;
const C_STREAM						       = 4;

// Set / Req Types

const V_TEMP						         = 0;
const V_HUM							         = 1;
const V_STATUS					         = 2;
const V_PERCENTAGE				       = 3;
const V_PRESSURE					       = 4;
const V_FORECAST					       = 5;
const V_RAIN						         = 6;
const V_RAINRATE					       = 7;
const V_WIND						         = 8;
const V_GUST						         = 9;
const V_DIRECTION					       = 10;
const V_UV							         = 11;
const V_WEIGHT						       = 12;
const V_DISTANCE					       = 13;
const V_IMPEDANCE					       = 14;
const V_ARMED						         = 15;
const V_TRIPPED						       = 16;
const V_WATT						         = 17;
const V_KWH							         = 18;
const V_SCENE_ON					       = 19;
const V_SCENE_OFF					       = 20;
const V_HVAC_FLOW_STATE		       = 21;
const V_HVAC_SPEED				       = 22;
const V_LIGHT_LEVEL					     = 23;
const V_VAR1						         = 24;
const V_VAR2						         = 25;
const V_VAR3						         = 26;
const V_VAR4						         = 27;
const V_VAR5						         = 28;
const V_UP							         = 29;
const V_DOWN						         = 30;
const V_STOP						         = 31;
const V_IR_SEND						       = 32;
const V_IR_RECEIVE					     = 33;
const V_FLOW						         = 34;
const V_VOLUME						       = 35;
const V_LOCK_STATUS					     = 36;
const V_LEVEL     					     = 37;
const V_VOLTAGE   					     = 38;
const V_CURRENT   					     = 39;
const V_RGB       					     = 40;
const V_RGBW      					     = 41;
const V_ID	         				     = 42;
const V_UNIT_PREFIX					     = 43;
const V_HVAC_SETPOINT_COOL	     = 44;
const V_HVAC_SETPOINT_HEAT	     = 45;
const V_HVAC_FLOW_MODE			     = 46;
const V_TEXT      					     = 47;
const V_CUSTOM    					     = 48;
const V_POSITION  					     = 49;
const V_IR_RECORD 					     = 50;
const V_PH        					     = 51;
const V_ORP       					     = 52;
const V_EC	         				     = 53;
const V_VAR	        				     = 54;
const V_VA	         				     = 55;
const V_POWER_FACTOR				     = 56;

// Internal Message Types

const I_BATTERY_LEVEL				     = 0;
const I_TIME						         = 1;
const I_VERSION						       = 2;
const I_ID_REQUEST					     = 3;
const I_ID_RESPONSE					     = 4;
const I_INCLUSION_MODE				   = 5;
const I_CONFIG						       = 6;
const I_FIND_PARENT			         = 7;
const I_FIND_PARENT_RESPONSE     = 8;
const I_LOG_MESSAGE					     = 9;
const I_CHILDREN					       = 10;
const I_SKETCH_NAME					     = 11;
const I_SKETCH_VERSION				   = 12;
const I_REBOOT						       = 13;
const I_GATEWAY_READY			       = 14;
const I_SIGNING_PRESENTATION     = 15;
const I_NONCE_REQUEST			       = 16;
const I_NONCE_RESPONSE		       = 17;
const I_HEARTBEAT_REQUEST	       = 18;
const I_PRESENTATION			       = 19;
const I_DISCOVER_REQUEST	       = 20;
const I_DISCOVER_RESPONSE	       = 21;
const I_HEARTBEAT_RESPONSE	     = 22;
const I_LOCKED						       = 23;
const I_PING  						       = 24;
const I_PONG	   					       = 25;
const I_REGISTRATION_REQUEST     = 26;
const I_REGISTRATION_RESPONSE    = 27;
const I_DEBUG 						       = 28;

// Sensor Presentation Types

const S_DOOR						         = 0;
const S_MOTION						       = 1;
const S_SMOKE						         = 2;
const S_BINARY					         = 3;
const S_DIMMER						       = 4;
const S_COVER						         = 5;
const S_TEMP						         = 6;
const S_HUM							         = 7;
const S_BARO						         = 8;
const S_WIND						         = 9;
const S_RAIN						         = 10;
const S_UV							         = 11;
const S_WEIGHT						       = 12;
const S_POWER						         = 13;
const S_HEATER					 	       = 14;
const S_DISTANCE					       = 15;
const S_LIGHT_LEVEL					     = 16;
const S_ARDUINO_NODE				     = 17;
const S_ARDUINO_REPEATER_NODE		 = 18;
const S_LOCK						         = 19;
const S_IR							         = 20;
const S_WATER 						       = 21;
const S_AIR_QUALITY 				     = 22;
const S_CUSTOM       				     = 23;
const S_DUST         				     = 24;
const S_SCENE_CONTROLLER 		     = 25;
const S_RGB_LIGHT    				     = 26;
const S_RGBW_LIGHT   				     = 27;
const S_COLOR_SENSOR 				     = 28;
const S_HVAC         				     = 29;
const S_MULTIMETER   				     = 30;
const S_SPRINKLER    				     = 31;
const S_WATER_LEAK   				     = 32;
const S_SOUND       				     = 33;
const S_VIBRATION    				     = 34;
const S_MOISTURE     				     = 35;
const S_INFO        				     = 36;
const S_GAS 	         			     = 37;
const S_GPS 				             = 38;
const S_WATER_QUALITY 			     = 39;

// Setup Express app, http server, socketIO server and MQTT client

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var client  = mqtt.connect([{ host: 'localhost', port: 1883 }]);

app.use(express.static(publicPath));
app.use(bodyParser.json());

/*

  MQTT Stuff

*/

// Connect to MQTT Borker

client.on('connect', function () {

  client.subscribe('mysensors-utility-out/#');
  
  client.subscribe('jess-bedroom-out/#');

  console.log('Connected to MQTT broker');

});

// When a message is received...

client.on('message', function (topic, message) {

  // Use for debugging

  // console.log(topic);
  //
  // console.log(message);

  // Decode MQTT Message

  if ((topic != null) && (topic != "")) {

    // Set variables from message

    var values = topic.toString().split("/");

    var gateway = values[0];
    var rsender = values[1];
    var rsensor = values[2];
    var rcommand = values[3];
    var rack = values[4];
    var rtype = values[5];
    var payload = (message.toString()).trim();

  }

  // Fire the relevant function based on the message command and type

  if (rcommand == C_PRESENTATION) {

    if (rsensor == NODE_SENSOR_ID) {

      saveProtocol(rsender, payload);

    }

    saveSensor(rsender, rsensor, rtype);

  } else if (rcommand == C_SET) {

    saveValue(rsender, rsensor, payload);

  } else if (rcommand == C_REQ) {

    // Request function to go here

  } else if (rcommand == C_INTERNAL) {

    if (rtype == I_BATTERY_LEVEL) {

      saveBatteryLevel(rsender, payload);

    } else if (rtype == I_TIME) {

      sendTime(rsender, rsensor);

    } else if (rtype == I_HEARTBEAT_RESPONSE) {

      saveHeartbeat(rsender);

    } else if (rtype == I_ID_REQUEST) {

      sendNextAvailableSensorId();

    } else if (rtype == I_SKETCH_NAME) {

      saveSketchName(rsender, payload);

    } else if (rtype == I_SKETCH_VERSION) {

      saveSketchVersion(rsender, payload);

    } else if (rtype == I_CONFIG) {

      sendConfig(rsender);

    }

  }

});
//
// /*
//
//   Web Socket Stuff
//
// */

// When a web socket connects...

io.on('connection', (socket) => {

  // Get all settings when the client requests

  socket.on('settings', (data, callback) => {

    Setting.findOne()
    .then((settings) => {
      callback({settings});

      settings = null;

    }, (e) => {
      callback(e);
    });

  });
  //
  // // Get all sensors when the client requests
  //
  socket.on('sensors', (data, callback) => {

    SensorNode.find()
    .select('name id sensors.id sensors.name sensors.currentValue sensors.valueUpdated sensors.type')
    .exec()
    .then((sensors) => {
      callback({sensors});
      sensors = null;
    }, (e) => {
      callback(e);
    });

  });
  //
  // // Get a value from a specific sensor when the client requests
  //
  socket.on('value', (data, callback) => {

    var rsender = data.destination;
    var rsensor = data.sensor;
    SensorNode.findOne({
        "id": rsender,
        "sensors.id": rsensor
      }, {
        'sensors.$': 1
      })
      .select(
        'sensors.currentValue sensors.valueUpdated sensors.type sensors.roToggleHtmlId sensors.valueHtmlId sensors.id')
      .exec()
      .then((value) => {

        callback({
          currentValue: value.sensors[0].currentValue,
          valueUpdated: value.sensors[0].valueUpdated,
          type: value.sensors[0].type,
          roToggleHtmlId: value.sensors[0].roToggleHtmlId,
          valueHtmlId: value.sensors[0].valueHtmlId
        });

        value = null;

      }, (e) => {

        callback(e);

      });

  });
  //
  // // Get graph data values when the client requests
  //
  socket.on('graph', (data, callback) => {

    var graph = [];
    var j = 0;

    for (var i = 0; i<data.sensors.length; i++) {

      var rsender = data.sensors[i].destination;;
      var rsensor = data.sensors[i].sensor;
      SensorNode.findOne({
        "id": rsender,
        "sensors.id": rsensor
      }, {
        'sensors.$': 1
      })
      .select('sensors.values sensors.graphHtmlId')
      .exec()
      .then((values) => {

        j++;

        graph.push({
          graphHtmlId: values.sensors[0].graphHtmlId,
          values: values.sensors[0].values
        });

        values = null;

        if (j == data.sensors.length) {
          callback(graph);
          graph = null;
        }

      }, (e) => {

        callback(e);

      });

    }
  });
  //
  // Update a value in the DB

  socket.on('saveValue', (value) => {

    var rsender = value.destination;
    var rsensor = value.sensor;
    var payload = value.value;
    var command = 1;
    var acknowledge = 0;
    var type = value.type;
    var topic = 'mysensors-utility-in/' + rsender + '/' + rsensor + '/' + command + '/' + acknowledge + '/' + type;

    client.publish(topic.toString(), payload.toString());
    
    topic = 'jess-bedroom-in/' + rsender + '/' + rsensor + '/' + command + '/' + acknowledge + '/' + type;
    
    client.publish(topic.toString(), payload.toString());

    saveValue(rsender, rsensor, payload);

  });
});
//
// /*
//
//   Routes
//
// */
//
app.patch('/system/:gateway', (req, res) => {

  var id = req.params.gateway;

  Gateway.findOneAndUpdate({

    id: id

  }, {

    $set: {

      boardTemp: req.body.boardTemp,
      memTotal: req.body.memTotal,
      memFree: req.body.memFree,
      memUsed: req.body.memUsed,
      memAvail: req.body.memAvail,
      platform: req.body.platform,
      distro: req.body.distro,
      release: req.body.release,
      kernel: req.body.kernel,
      hostname: req.body.hostname,
      bootSize: req.body.bootSize,
      bootUsed: req.body.bootUsed,
      bootName: req.body.bootName,
      rootSize: req.body.rootSize,
      rootUsed: req.body.rootUsed,
      rootName: req.body.rootName,
      currentLoad: req.body.currentLoad,
      avgLoad: req.body.avgLoad,
      modified: new Date().getTime()

    }

  }).then(() => {

    res.send();

  }).catch((e) => {

    res.status(400).send();

  });;

});


/*

  Schedule Jobs

*/

// Sunset / Sunrise DB Settings update job - runs at 3 am daily

var j = schedule.scheduleJob('0 3 * * *', function(){

  sunUpdate();

});

// Live Weather Update job - runs every 5 minutes

var k = schedule.scheduleJob('*/1 * * * *', function(){

  weatherUpdate();

});

// Live System Update job - runs every 1 minute

var l = schedule.scheduleJob('*/1 * * * *', function(){

  systemUpdate();

});
//
// /*
//
//   Start Server
//
// */
//
server.listen(port, () => {

  console.log(`Server is running on port ${port}`);

});

/*

  Functions

*/

// When a new node connects to the gateway it will request an ID - This function assigns and sends one

function sendNextAvailableSensorId() {

  // Need to look for gaps in the ID sequence so they can be reused when nodes are deleted

  SensorNode.find()
  .sort({
    id: 'asc'
  })
  .select('id')
  .exec()
  .then((results) => {

    var newid;
    var length = results.length;

    if (length > 0) {
      newid = (results[length - 1].id) + 1;
    } else {
      newid = 1;
    }

    if (newid < 255) {
      var sensorNode = new SensorNode({
        id: newid
      })

      sensorNode.save();

      var destination = BROADCAST_ADDRESS;
      var sensor = NODE_SENSOR_ID;
      var command = C_INTERNAL;
      var acknowledge = 0; // no ack
      var type = I_ID_RESPONSE;
      var payload = newid;
      var topic = 'mysensors-utility-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;

      client.publish(topic.toString(), payload.toString());
      
      topic = 'jess-bedroom-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;
      
      client.publish(topic.toString(), payload.toString());

    } else {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('app.log', date + " " + time + " ");

      fs.appendFileSync('app.log', "To many Nodes in the DB - IDs have exceeded 255\n");

    }

    results = null;

  }, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error finding Nodes" + "\n" + e + "\n");

  });
}

// When a new node connects, or a node reboots, save the version of mysensors it is running

function saveProtocol(rsender, payload) {

  SensorNode.findOneAndUpdate({
    id: rsender
  }, {
    $set: {
      protocol: payload
    }
  }).then(() => {

  }, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error saving protocol" + "\n" + e + "\n");

  });
}

// Save a new sensor when it first connects, update if the node reboots

function saveSensor(rsender, rsensor, rtype) {

  var sensor = {
    sensors: {
      id: rsensor,
      type: rtype
    }
  }

  SensorNode.find({
    "id": rsender
  }).then((data) => {

    var exists;

    if (data[0] && data[0].sensors.length != 0){

      for (var i=0; i<data[0].sensors.length; i++) {

        if (data[0].sensors[i].id != rsensor) {
           exists = 0;
         } else {
           exists = 1;
           return exists;
         }
      }
      return exists;
    } else {
      SensorNode.findOneAndUpdate({
        id: rsender
      }, {
        $push:sensor
      }, {
        new: true
      }, function(err) {
        if (err) {

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('app.log', date + " " + time + " ");

          fs.appendFileSync('app.log', "Error writing sensor to database" + "\n" + err + "\n");

        }
        exists = 1;
        return exists;
      });
    }

    data = null;

  }, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error writing sensor to database" + "\n" + e + "\n");

  }).then((exists) => {

    if (exists == 0) {

      SensorNode.findOneAndUpdate({
        id: rsender
      }, {
        $push:sensor
      }, {
        new: true
      }).then(() => {}, (e) => {

        var today = new Date();
        var time = moment(today).format('h:mm:ss a');
        var date = moment(today).format('MMMM Do YYYY');

        fs.appendFileSync('app.log', date + " " + time + " ");

        fs.appendFileSync('app.log', "Error writing sensor to database" + "\n" + e + "\n");

      });

    }
  }, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error writing sensor to database" + "\n" + e + "\n");

  });
}

// Save a value - Update the currentValue field every time, but only update the time series every 10 mins min

function saveValue(rsender, rsensor, payload) {

  var snapshot = {
    timestamp: new Date().getTime(),
    value: payload
  }

  SensorNode.findOneAndUpdate({
    "id": rsender,
    "sensors.id": rsensor
  }, {
    $set: {
      "sensors.$.currentValue": payload,
      "sensors.$.valueUpdated": new Date().getTime()
    }
  })
  .exec()
  .then(() => {

    SensorNode.findOne({
      "id": rsender,
      "sensors.id": rsensor
    }, {
      'sensors.$': 1
    })
    .exec()
    .then((sensor) => {

      var htmlId = sensor.sensors[0].valueHtmlId;

      if (htmlId != 0) {

        var clientSensor = {

          node: rsender,
          sensor: rsensor,
          htmlId: sensor.sensors[0].valueHtmlId,
          value: sensor.sensors[0].currentValue,
          updated: sensor.sensors[0].valueUpdated,
          type: sensor.sensors[0].type

        }

        io.emit('statusChange', clientSensor);

      }

      var values = sensor.sensors[0].values.sort(function(a, b){return a.timestamp - b.timestamp});
      var valuesLength = values.length;

      var lastValueArray = valuesLength - 1;
      lastValue = moment(values[lastValueArray].timestamp).format();

      var nowMinusTen = moment(new Date().getTime()).subtract(10, 'minutes').format();

      if (valuesLength == 0 || lastValue < nowMinusTen) {

        SensorNode.findOneAndUpdate({

          "id": rsender,
          "sensors.id": rsensor

        }, {

          "$push": {

            "sensors.$.values": {

              "$each": [snapshot],
              "$sort": {timestamp: 1},
              "$slice": -50

            }

          }

        })
        .exec()
        .then(() => {

        }, (e) => {

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('app.log', date + " " + time + " ");

          fs.appendFileSync('app.log', "Unable to update values" + "\n" + e + "\n");

          e = null;

        });

      }

      sensor = null;
      clientSensor = null;

    }, (e) => {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('app.log', date + " " + time + " ");

      fs.appendFileSync('app.log', "Unable to get sensor values" + "\n" + e + "\n");

    });

  }, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Unable to update current value" + "\n" + e + "\n");

  });

}

// Send the time to a node that has requested it

function sendTime(destination, sensor) {

  var payload = new Date().getTime()/1000;
  var command = C_INTERNAL;
  var acknowledge = 0; // no ack
	var type = I_TIME;

  var topic = 'mysensors-utility-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;

  client.publish(topic.toString(), payload.toString());
  
  topic = 'jess-bedroom-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;
  
  client.publish(topic.toString(), payload.toString());

}

// Save a battery level sent by a battery node

function saveBatteryLevel(rsender, payload) {

  var battLevel = {
    battLevels: {
      timestamp: new Date().getTime(),
      value: payload
    }
  }

  SensorNode.findOneAndUpdate({
    "id": rsender
  }, {
    $set: {
      "currentBattValue": payload
    }
  })
  .exec()
  .then(() => {

    SensorNode.findOne({
      "id": rsender
    })
    .select('id battLevels')
    .exec()
    .then((battLevels) => {

      var values = battLevels.battLevels.sort(function(a, b){return a.timestamp - b.timestamp});
      var valuesLength = values.length;

      var lastValueArray = valuesLength - 1;
      lastValue = moment(values[lastValueArray].timestamp).format();

      var nowMinusTen = moment(new Date().getTime()).subtract(10, 'minutes').format();

      if (valuesLength == 0 || lastValue < nowMinusTen) {

        SensorNode.findOneAndUpdate({

          "id": rsender,

        }, {

          "$push": {

            "battLevels": {

              "$each": [battLevel],
              "$sort": {timestamp: 1},
              "$slice": -50

            }

          }

        })
        .exec()
        .then(() => {

        }, (e) => {

          var today = new Date();
          var time = moment(today).format('h:mm:ss a');
          var date = moment(today).format('MMMM Do YYYY');

          fs.appendFileSync('app.log', date + " " + time + " ");

          fs.appendFileSync('app.log', "Unable to update battery values" + "\n" + e + "\n");

        });

      }

    }, (e) => {

      var today = new Date();
      var time = moment(today).format('h:mm:ss a');
      var date = moment(today).format('MMMM Do YYYY');

      fs.appendFileSync('app.log', date + " " + time + " ");

      fs.appendFileSync('app.log', "Unable to update battery values" + "\n" + e + "\n");

    });

  }, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Unable to update battery values" + "\n" + e + "\n");

  });

}

// Save the Sketch Name of a node when it starts up

function saveSketchName(rsender, payload) {

  SensorNode.findOneAndUpdate({
    id: rsender
  }, {
    $set: {
      sketchName: payload
    }
  })
  .exec()
  .then(() => {}, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error writing Sketch Name to database" + "\n" + e + "\n");

  });
}

// Save the Sketch Version of a node when it starts up

function saveSketchVersion(rsender, payload) {

  SensorNode.findOneAndUpdate({
    id: rsender
  }, {
    $set: {
      sketchVersion: payload
    }
  })
  .exec()
  .then(() => {}, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error writing Sketch Version to database" + "\n" + e + "\n");

  });
}

// Save Heartbeat timestamp

function saveHeartbeat(rsender) {

  SensorNode.findOneAndUpdate({
    id: rsender
  }, {
    $set: {
      lastHeartbeat: new Date().getTime()
    }
  })
  .exec()
  .then(() => {}, (e) => {

    var today = new Date();
    var time = moment(today).format('h:mm:ss a');
    var date = moment(today).format('MMMM Do YYYY');

    fs.appendFileSync('app.log', date + " " + time + " ");

    fs.appendFileSync('app.log', "Error writing Heartbeat to database" + "\n" + e + "\n");

  });
}

// Send Configuration - M (metric) or I (imperial) on config request

function sendConfig(rsender) {

  var destination = rsender;
  var sensor = NODE_SENSOR_ID;
	var command = C_INTERNAL;
	var acknowledge = 0; // no ack
	var type = I_CONFIG;
  var payload = "M";
  var topic = 'mysensors-utility-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;

  client.publish(topic.toString(), payload.toString());
  
  topic = 'jess-bedroom-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;
  
  client.publish(topic.toString(), payload.toString());

}
