
let path = process.cwd(),
    bP = require('body-parser'),
    urlEncPar = bP.urlencoded({extended: true}),
    ClickHandler = require(path + '/app/controllers/clickHandler.js');

module.exports = function(app, passport) {
    app.set("json spaces", 2);
  
  	function isLoggedIn (req, res, next) {
  	   req.isAuthenticated() ? next() : res.redirect('/');
	  }
    
    let clickHandler = new ClickHandler();
    
    app.route('/')
        .get(function(req, res) {
          res.sendFile(path + '/public/index.html');
        });
        
    app.route('/poll-creation')
        .get(isLoggedIn, function(req, res, next) {
          res.sendFile(path + '/public/poll-creation.html'); 
        }); 
        
    app.route('/poll-vault')
        .get(function(req, res) {
          res.sendFile(path + '/public/poll-vault.html');
        });
        
    app.route('/signup')
        .get(function(req, res) {
          res.sendFile(path + '/public/signup.html');
        });
        
    app.route('/poll-vault/:user')
        .get(clickHandler.usersPoll);
        
    app.route('/poll/:results')
        .get(clickHandler.getPoll)
        .post(urlEncPar, clickHandler.modifyPoll);
        
    app.route('/signup/:user')
        .post(urlEncPar, clickHandler.createUser);
        
    app.route('/api/:user')
      .get(isLoggedIn, function (req, res) {
          var user;
          if(req.user.signin.displayName) {
              user = req.user.signin;
          } else
          if(req.user.github.displayName) {
              user = req.user.github;
          }
      
          res.json(user);
      });        

    app.route('/auth/github')
      .get(passport.authenticate('github'));

    app.route('/auth/github/callback')
      .get(passport.authenticate('github', {
        successRedirect: '/poll-creation',
        failureRedirect: '/'
      })); 

    app.route('/auth/login')
       .post(urlEncPar, function(req, res, next) {
         passport.authenticate('local', function(err, user, info) {
           if(err) return next(err);

           if(!user) document.alert(info)//return res.json(info);
           
           req.logIn(user, function(err) {
             if(err) return next(err);
             return res.redirect('/poll-creation');
           });
         }) (req, res, next);
       });

    app.route('/logout/:path')
       .get( function(req, res) {
         if(req.params.path === "creation") {
           req.logout();
           res.redirect('/');
         } else {
           req.logout();
           res.redirect('/poll-vault');
         }
       });
};

/*
var path = process.cwd(),
    bP = require('body-parser'),
    urlEncPar = bP.urlencoded({extended: true}),
    check = require('../controllers/serverData');

module.exports = function(app, passport) {
    app.set("json spaces", 2);
  
  	function isLoggedIn (req, res, next) {
	    if (req.isAuthenticated()) {
		    return next();
		} else {
		    res.redirect('/');
		}
	}
    
    app.route('/')
        .get(function(req, res) {
          res.sendFile(path + '/public/index.html');
        });
        
    app.route('/poll-creation')
        .get(isLoggedIn, function(req, res, next) {
          res.sendFile(path + '/public/poll-creation.html'); 
        }); 
        
    app.route('/poll-vault')
        .get(function(req, res) {
          res.sendFile(path + '/public/poll-vault.html');
        });
        
    app.route('/signup')
        .get(function(req, res) {
          res.sendFile(path + '/public/signup.html');
        });
        
    app.route('/poll-vault/:user')
        .get( function(req, res) {
            check(req.params.user, '/poll-vault/:user', null, function(results) {
                res.json(results);
            });
        });
    
    app.route('/poll/:results')
        .get(function(req, res) {
            if(!req.user) {
                check(null, req.path, null, function(results) { 
                    res.json(results);  
                });
            } else {    
                
            res.json(req.user.poll);
            }
        })
        .post(urlEncPar, function(req, res) {
            check(req.user, req.path, req.body, function(results) {
                res.json(results);   
            });
        });
       
    app.route('/signup/:user')
        .post(urlEncPar, function(req, res) {
            check(null, req.path, req.body, function(results) {
                res.json(results);
            }); 
        });
        
	app.route('/api/:user')
		.get(isLoggedIn, function (req, res) {
		    if(req.user.signin.displayName) {
		        var user = req.user.signin;
		    } else
		    if(req.user.github.displayName) {
		        user = req.user.github;
		    }
		res.json(user);
		});        
       
    app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/poll-creation',
			failureRedirect: '/'
		})); 

    app.route('/auth/login')
        .post(urlEncPar, function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if(err) return next(err);
                
                if(!user) return res.json(info);
                req.logIn(user, function(err) {
                    if(err) return next(err);
                    return res.redirect('/poll-creation');
                });
            }) (req, res, next);
        });
        
    app.route('/logout/:path')
        .get( function(req, res) {
            if(req.params.path === "creation") {
                req.logout();
                res.redirect('/');
            } else {
                req.logout();
                res.redirect('/poll-vault');
            }
        });
};
*/