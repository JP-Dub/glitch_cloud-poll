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