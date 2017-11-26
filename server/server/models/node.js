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

  currentValue:{


  },

  valueUpdated: {

    type: Date

  },

  values: [valueSchema]

});

var battSchema = new Schema ({

  timestamp: {

    type: Date

  },

  value: {

  }

});

var SensorNode = mongoose.model('SensorNode', {

  id: {

    type: Number,
    required: true

  },

  protocol: {

  },

  sensors: [sensorSchema],

  battLevels: [battSchema]

});

module.exports = {SensorNode};
