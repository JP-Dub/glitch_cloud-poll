'use strict';

var GitHubStrategy = require('passport-github').Strategy,
	  LocalStrategy  = require('passport-local').Strategy,
    User           = require('../models/users'),
    configAuth     = require('./auth'),
    bcrypt         = require('bcrypt');

module.exports = function (passport) {
	
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'signin.id': profile.id }, function (err, user) {
				if (err) return done(err);
				
				if (user) {
				
					return done(null, user);
				} else {

					var newUser = new User();
					
					newUser.date.time =  new Date(Date.now()).toString();
					newUser.signin.account = "Github";
					newUser.signin.id = profile.id;
					newUser.signin.displayName = profile.displayName;

					newUser.save(function (err) {
						if (err) return console.error(err);
						return done(null, newUser);
					});
				}
			});
		});
	}));
	
	passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ "signin.displayName" : username }, function(err, user) {
              
                if (err) return done(err); 
                
                if (!user) {
                    return done(null, false, { message: 'Username not found. Please return to previous page to re-try or sign-up for a new account.' });
                }
              
                // check user password against stored hashed password
                bcrypt.compare(password, user.signin.password, (err, validPassword) => {
                  if (!validPassword) {
                      return done(null, false, { message: 'Incorrect password. Please return to previous page to re-try.' });
                  }
                
                  return done(null, user);
               });
            });
        }
    ));
};