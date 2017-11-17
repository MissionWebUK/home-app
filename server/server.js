/**/

require('./config/config');

const http = require('http');
const path = require('path');
const express = require('express');
const mqtt = require('mqtt');
const fs = require('fs');
const socketIO = require('socket.io');
const request = require('request');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');

var {SensorNode} = require('./models/node');

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

// Payload Types?

const P_STRING						      = 0;
const P_BYTE						        = 1;
const P_INT16						        = 2;
const P_UINT16						      = 3;
const P_LONG32						      = 4;
const P_ULONG32						      = 5;
const P_CUSTOM						      = 6;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var client  = mqtt.connect([{ host: 'localhost', port: 1883 }]);

app.use(express.static(publicPath));

/*

  MQTT Stuff

*/

// Connect to MQTT Borker

client.on('connect', function () {

  client.subscribe('mysensors-out/#');

  console.log('Connected to MQTT broker');

});

client.on('message', function (topic, message) {

  // Decode MQTT Message

  var payload = (message.toString()).trim();

  if ((topic != null) && (topic != "")) {

    var values = topic.toString().split("/");

    var rsender = values[1];

    var rsensor = values[2];

    var rcommand = values[3];

    var rack = values[4];

    var rtype = values[5];

    var payload = (message.toString()).trim();

  }

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

      // Battery Level Function to go here

    } else if (rtype == I_TIME) {

      sendTime(rsender, rsensor);

    } else if (rtype == I_VERSION) {

      // Gateway Version function to go here

    } else if (rtype == I_ID_REQUEST) {

      sendNextAvailableSensorId();

    }

  }

});

/*

  Web Socket Stuff

*/

io.on('connection', (socket) => {

  socket.on('temps', (data, callback) => {

    var nodeId = data.nodeid;
    var sensorId = data.sensorid;
    var url = 'http://192.168.1.69:3000/temps/' + nodeId + '/' + sensorId

    var getOptions = { method: 'GET',
        url: url,
        headers:
          { 'content-type': 'application/json' },
        json: true };

    request(getOptions, function (error, response, body) {

      if (error) throw new Error(error);

      var numValues = body.values[0].sensors[0].values.length;

      var lastValue = numValues - 1;

      var temp = body.values[0].sensors[0].values[lastValue];

      //console.log(temp);

      //var items = body.trackedsearchs;

      callback(temp);

    });

  });

  socket.on('toggle', (toggle) => {

    var payload = toggle.toggle;
    var destination = 1;
    var sensor = 2;
    var command = 1;
    var acknowledge = 0;
    var type = 2;
    var topic = 'mysensors-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;

    client.publish(topic.toString(), payload.toString());

  });

});

/*

  Routes

*/

app.get('/temps/:id/:sensor', (req, res) => {

  SensorNode.find({

    "id": req.params.id,
    "sensors.id": req.params.sensor

  }, "sensors.$.values").then((values) => {

    res.send({values});

  }, (e) => {

    res.send(e);

  });

});

/*

  Start Server

*/

server.listen(port, () => {

  console.log(`Server is running on port ${port}`);

});

/*

  Functions

*/

function sendNextAvailableSensorId() {

  SensorNode.find().exec(function (err, results) {

    if (err) {

      console.log('Error finding Nodes');

    }

    var newid;

    if (results.length > 0) {

      for (var i = 0; i < results.length; i++) {

        if (results[i].id > i + 1) {

          newid = i + 1;

        }

      }

      if (newid == null) {

        newid = results.length + 1;

      }

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

      var topic = 'mysensors-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;

      client.publish(topic.toString(), payload.toString());

    }

  });

}

function saveProtocol(rsender, payload) {

  SensorNode.findOneAndUpdate({

    id: rsender

  }, {

    $set: {

      protocol: payload

    }

  }, function(err, result) {

    if (err) {

      console.log("Error writing protocol to database");

    }

  });

}

function saveSensor(rsender, rsensor, rtype) {

  var sensor = {

    sensors: {

      id: rsensor,
      type: rtype

    }

  }

  SensorNode.findOneAndUpdate({

    id: rsender

  }, {

    $push:sensor

  }, {

    new: true

  }, function(err, result) {

    if (err) {

      console.log("Error writing sensor to database");

    }

  });

}

function saveValue(rsender, rsensor, payload) {

  var value = {

      timestamp: new Date().getTime(),
      value: payload

  }

  SensorNode.findOneAndUpdate({

    "id": rsender,
    "sensors.id": rsensor

  }, {

    "$push": {

      "sensors.$.values": value

    }

  }, function(err, result) {

    if (err) {

      console.log(err);

    }

  });

}

function sendTime(destination, sensor) {

  var payload = new Date().getTime()/1000;
  var command = C_INTERNAL;
  var acknowledge = 0; // no ack
	var type = I_TIME;

  var topic = 'mysensors-in/' + destination + '/' + sensor + '/' + command + '/' + acknowledge + '/' + type;

  client.publish(topic.toString(), payload.toString());

}
