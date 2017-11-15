var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var valueSchema = new Schema ({

  timestamp: {

    type: Date

  },

  value: {

  }

});

var sensorSchema = new Schema ({

  id: {

    type: Number

  },

  type: {

    type: String

  },

  description: {

    type: String

  },

  ack: {

    type: Boolean

  },

  values: [valueSchema]

});

var SensorNode = mongoose.model('SensorNode', {

  id: {

    type: Number,
    required: true

  },

  protocol: {

  },

  sensors: [sensorSchema]

});

module.exports = {SensorNode};
