'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var User = new Schema({
  date: {
    time: Date
  },
  chart : {
    graph: Number
  },
  signin: {
    account: String,
    id: Number,
    displayName: String,
    email: String,
    password: String
  },
  poll: [{
      question: String,
      answers: [{
        options: String,
        votes: Number
      }]
  }]           
});

User.set( 'toObject', {retainKeyOrder: true});
   
module.exports = mongoose.model('User', User);

/*
var User = new Schema({
  
	github: {
		id: String,
		displayName: String,
		username: String,
    publicRepos: Number
	},
   nbrClicks: {
      clicks: Number
   },
     poll: [{
      question: String,
      answers: [{
        options: String,
        votes: Number
      }] 
   
    poll: [Schema.Types.Mixed] 
   
});

module.exports = mongoose.model('User', User);*/

/*  // to find

    var query = User.find({}).select({ "date": 1 });
     query.exec(function (err, user) {
        if(err) return console.error(err);
        console.log(user)
    })
    
    // or to remove
    
    var query = User.find({}).remove({  _id: "5a7a04344b518b09ddf1dbfd" });
    query.exec()
    

*/

/*
var User = new Schema({
  date: {
    time: Date
  },
  google: {
    id: String,
    displayName: String,
    username: String,
  },
  github: {
    id: String,
    displayName: String,
    username: String,
    email: String
  },
  signin: {
    displayName: String,
    email: String,
    password: String
  },
  poll: [{
      question: String,
      answers: [{
        options: String,
        votes: Number
      }]
  }]           
});
*/