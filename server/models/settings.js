var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var multiSensorSchema = new Schema ({

  destination: {

    type: Number

  },

  sensor: {

    type: Number

  },


});

var sectionSchema = new Schema ({

  id: {



  },

  title: {



  },

  type: {



  },

  readOnly : {

    type: Boolean

  },

  destination: {



  },

  sensor: {



  },

  multiSensor: [multiSensorSchema]

});

var dashSchema = new Schema ({

  name: {


  },

  created: {

    type: Date

  },

  colourScheme: {



  },

  section: [sectionSchema]

});

var Setting = mongoose.model('Setting', {

  id: {

    type: Number

  },

  longitude: {

    type: Number,
    trim: true

  },

  latitude: {

    type: Number,
    trim: true

  },

  sunset: {

    type: Date

  },

  sunrise: {

    type: Date

  },

  modified: {

    type: Date

  },

  dashboards: [dashSchema]

});

module.exports = {Setting};
