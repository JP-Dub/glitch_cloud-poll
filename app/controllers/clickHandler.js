'use strict';

var Users  = require('../models/users.js'),
    bcrypt = require('bcrypt');

function ClickHandler () {
    // validates email
    var validEmail = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/igm;
    var reg = /(^\w)(.+)($\b|.)/g; // for process() 

    function repairSent(match, p1, p2) {
        return p1.toUpperCase() + p2; //.toLowerCase();
    }
     
    function process(a, q, done) {    
        var choice = [], question = ""; 
        
        question = q.replace(reg, repairSent) + "?";
        a.forEach( val => {
            if(val !== "") {
                choice.push( val.replace(reg, repairSent) );
            }
        });
    done(question, choice);
    } // process()

    function findUser(multiple, single, done) {

        Users.find({}).select({"chart": 1, "signin": 1, "poll":1})
            .exec(function(err, user) {
                if(err) return console.error(err);
                
                if(single) {
                    user.forEach( function(e, i) {
                        if(user[i].signin.displayName === single) {
                            return done(user[i].poll);
                        }
                    });
                } else
                // returns multiple users
                if (multiple) {
                    var results = [];
                    user.forEach( function(e, i) {
                        if(user[i].chart) {
                            results.push(user[i].chart);
                        }
                        if(user[i].signin) {
                            results.push(user[i].signin);
                        }
                        var newUser = user[i].poll;
                        for(var j = 0; j < newUser.length; j++) {
                            results.push(newUser[j]);
                        }
                    });
                    return done(results);
                } else {
                    // returns single user
                    return done(user); 
                }
            }); // User.find()    
    } // findUser()

this.getPoll = function(req, res) {
    
    if(req.user) return res.json(req.user.poll);

    //get 
    if(req.path === '/poll/vault') {

        findUser( true, null, function(user) {
           return res.json(user);
        });
    }  // if('/poll/vault')
       
    //get
    if(req.path === '/poll/chart') {
    
        Users.find({_id: "5b339f5ae632a22c5ed59fc3"})// _id:"5ad773bb70b87312d878ac8a"})
            .exec(function (err, user) {
            //console.log(user)
                if(err) return console.error(err);
            
                var User = user[0];
                (User.chart.graph < 4) ? User.chart.graph += 1 : User.chart.graph = 0;

                User.save(function(err, user) {
                    if(err) return console.error(err);
                    
                    res.json(user.chart.graph);
                },{"returnOriginal": false});
            });
    } // if('/poll/chart')
};

this.modifyPoll = function(req, res) { 
    var user = req.user,
        form = req.body; 
 
    //post
    if(req.path === '/poll/save') {

        var ans = form.answers, 
            quest = form.question;
        
            process(ans, quest, function(question, choice) {
                for(var i = 0; i < user.poll.length; i++) {
                    if(user.poll[i].question == question) {
                        var results = [{"error": "You already asked this question!"}, user.poll];
                        return res.json(results);
                    }
                }
                
                var Poll = user.poll;
                Poll.push({question: question, answers: []});
                choice.forEach(function(val, i) {
                    Poll[Poll.length-1].answers.push({options: choice[i], votes: 0});
                    });
                    
                user.save(function (err, user, status) {
                    if(err) return console.error(err);

                    res.json(user.poll);
                }, {"returnOriginal": false});
            }); // end of function(process)
    } // if('/poll/save)

    //post
    if(req.path === '/poll/delete') {
        
        var deleteForm = function(user, form) {
            for(var i = 0; i < user.poll.length; i++) {
                if(user.poll[i].question === form.question) {
                    user.poll.splice(i, 1);
                }    
            } 
            user.save(function(err, user, status){
                if(err) return console.error(err);
                res.json(user.poll);
            }, {"returnOriginal": false} );
        };
       
        deleteForm(user, form);
    } // if('/poll/delete')

    //post
    if(req.path === '/poll/update') {
        
        var updateForm = function(user, form) {
            var answers = form.answers, 
                quest = form.question, ans;
            
            process(answers, quest, function(question, choice) {
                for(var i = 0; i < user.poll.length; i++) {
                    if(user.poll[i].question === question) {
                        ans = user.poll[i].answers;
                        form = choice; 
                    }  
                }
            }); // process()
            
            // returns the larger array
            var num = Math.max(ans.length, form.length);
            
            for(var i = 0; i < num; i++) {
                // remove remaining answers from poll
                if(i >= form.length) {
                    ans.splice(i, ans.length-1);
                }  
                // creates remaining form 
                if(ans.length <= i) { 
                    ans[i] = {options: form[i], votes : 0};
                }   
                // if questions aren't the same, update value and reset votes
                if(form[i] !== ans[i].options) { 
                    ans[i].options = form[i];
                    ans[i].votes = 0;
                }
            }
            
            user.save(function(err, user, status){
                if(err) return console.error(err);
                res.json(user.poll);
            }, {"returnOriginal": false} );
        }; // updateForm()
        
        updateForm(user, form);
    } // if('/poll/update') 
     
    //post
    if(req.path === '/poll/votes') {
        
        var userPoll;
        findUser(false, null, function(user) {
            user.forEach(function(a, b) {
                var poll = user[b].poll;
                for(var i = 0; i < poll.length; i++) {
                   
                    if(poll[i].question === form.question) {
                        var answers = poll[i].answers;
                        userPoll = user[b];
                        
                        answers.forEach(function(a,b) {
                            if(answers[b].options === form.vote ) {
                                answers[b].votes += 1;
                            }
                        });
                    }
                }
            });
        
            userPoll.save(function(err) {
                if(err)return console.error(err);
                
                findUser(true, null, function(user) {
                    res.json(user);
                });
            }, {"returnOriginal": false});
        }); //findUser()
    } // if('/poll/votes')    

};
//poll-vault/:user
this.usersPoll = function(req, res) { 
    //console.log(req.params.user)
    var user = req.params.user;

        var multiple = null;
        if(user === "default") {
            multiple = true;
            user = null;
        }
        
        findUser(multiple, user, function(user) {
            res.json(user);
        });
};
//signup/:user
this.createUser = function(req, res) {
        var form = req.body;

        var displayName = form.displayname,
            email = form.email,
            password = form.password;

        if(email !== "" && !email.match(validEmail)) {
            res.json({ "email" : "Your email doesn't appear valid." });
        } else
        if(password.length < 4 || password !== form.confirm || password === "") {
            res.json({ "password" : "Your password doesn't match or isn't long enough, please try again." });
        } else {
            Users.findOne({"signin.displayName": displayName} , function(err, user) {
                if(err) return console.error(err);

                if (user) {
                    return res.json({"user": "There is already a user with this name!"});
                } else {                                      
                    
                    var newUser = new Users();
                    
                    // var encrypt = (err, encrypted) => {
                    //   console.log(encrypted)
                    //   return err ? console.log(err) : encrypted 
                    // };
                    var encrypt = bcrypt.hash(password, 10, (err, hash) => err ? console.log(err) : hash);
                      
                      //return encrypt(err, true);
                    //});  
                  
                    newUser.date.time =  new Date(Date.now()).toString();
                    newUser.signin.account = "CP Account";
                    newUser.signin.displayName = displayName;
                    newUser.signin.email = email || null;
                    newUser.signin.password = encrypt;
                                    
                  
                    //if(encrypt) {
                      newUser.save(function (err) {
                          if(err) return console.error(err);
                          console.log("newUser", newUser);
                      });
                   // }
                    
                    res.json({ "success": "Thank you for signing up! You'll be redirected to the sign in page."});    
                }
            }); // User.findOne()
        } // else statement 

};   
}

module.exports = ClickHandler;