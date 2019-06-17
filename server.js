'use strict';

var routes   = require('./app/routes/index.js'),
    session  = require('express-session'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    express  = require('express'),
    helmet   = require('helmet'),
    app      = express();

require('dotenv').config();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser : true,
  useFindAndModify: false
});
mongoose.Promise = global.Promise;


app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use(helmet());

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