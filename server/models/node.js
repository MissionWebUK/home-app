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

    type: Number,
    index: true

  },

  type: {

    type: String

  },

  name: {

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

  htmlId: {



  },

  graphHtmlId: {



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
    required: true,
    index: true

  },

  protocol: {

  },

  name: {

    type: String

  },

  description: {

    type: String

  },

  sketchName: {

    type: String

  },

  sketchVersion: {


  },

  lastHeartbeat: {

    type: Date

  },

  currentBattLevel: {



  },

  sensors: [sensorSchema],

  battLevels: [battSchema]

});

module.exports = {SensorNode};
