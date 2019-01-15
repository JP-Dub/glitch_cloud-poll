'use strict';

var routes = require('./cloud-poll/app/routes/index.js'),
    session = require('express-session'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();

require('dotenv').load();
require('./cloud-poll/app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI, {useMongoClient : true});
mongoose.Promise = global.Promise;

app.use('/controllers', express.static(process.cwd() + './cloud-poll/app/controllers'));
app.use('/public', express.static(process.cwd() + './cloud-poll/public'));
app.use('/common', express.static(process.cwd() + './cloud-poll/app/common'));

app.set('trust proxy', 1);
app.use(session({
    name: 'cloud_polling',
	secret: 'secreteSerpentine', //'secretClementine',
	resave: false,
	saveUninitialized: true,
	cookie : {
	    secure: true
	}
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});