var mongoose = require('mongoose');

var Gateway = mongoose.model('Gateway', {

  id: {

    type: Number,
    required: true,
    index: true

  },

  name: {

    type: String

  },

  description: {

    type: String

  },

  room: {

    type: String

  },

  mqttTopic: {

    type: String

  },

  frequency: {

    type: String

  },

  platform: {


  },

  distro: {


  },

  release: {


  },

  kernel: {


  },

  hostname: {



  },

  // Temperature

  boardTemp: {


  },

  // CPU

  currentLoad: {


  },

  avgLoad: {


  },

  // File System

  bootSize: {


  },

  bootUsed: {


  },

  bootName: {


  },

  rootSize: {


  },

  rootUsed: {


  },

  rootName: {


  },

  // Memory

  memTotal: {


  },

  memFree: {


  },

  memUsed: {


  },

  memAvail: {


  },

  modified: {

    type: Date

  }

});

module.exports = {Gateway};
