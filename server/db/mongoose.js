var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, { server: { socketOptions: { connectTimeoutMS: 5000 }}}, function(err) {

  if (err) {

    console.log("error connecting to DB");
    console.log(err);

  }

});

module.exports = {mongoose};
