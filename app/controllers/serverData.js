// THIS PAGE IS DISCONTINUED //

var User = require('../models/users');

module.exports = function(user, path, form, forward) {
    var regEx = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/igm;
    var reg = /(^\w)(.+)($\b|.)/g;
    var choice = [],
        question = ""; 
     
    function repairSent(match, p1, p2) {
        return p1.toUpperCase() + p2; //.toLowerCase();
    }
    
    // clean up question with capital letter and question mark
    function process(a, q, done) {    
        question = q.replace(reg, repairSent) + "?";
        a.forEach( function(val) {
            if(val !== "") {
                choice.push( val.replace(reg, repairSent) );
            }
        });
    done(question, choice);
    } // process()

    function findUser(multiple, single, done) {

        User.find({}).select({"chart": 1, "signin": 1, "poll":1})
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


    if(path === '/poll/save') {

        var ans = form.answers, 
            quest = form.question;
        
            process(ans, quest, function(question, choice) {
                for(var i = 0; i < user.poll.length; i++) {
                    if(user.poll[i].question == question) {
                        var results = [{"error": "You already asked this question!"}, user.poll];
                        return forward(results);
                    }
                }
                
                var Poll = user.poll;
                Poll.push({question: question, answers: []});
                choice.forEach(function(val, i) {
                    Poll[Poll.length-1].answers.push({options: choice[i], votes: 0});
                    });
                    
                user.save(function (err, user, status) {
                    if(err) return console.error(err);

                    forward(user.poll);
                }, {"returnOriginal": false});
            }); // end of function(process)
    } // if('/poll/save)
    
    
    if(path === '/poll/delete') {
         
        var deleteForm = function(user, form) {
            for(var i = 0; i < user.poll.length; i++) {
                if(user.poll[i].question === form.question) {
                    user.poll.splice(i, 1);
                }    
            } 
            user.save(function(err, user, status){
                if(err) return console.error(err);
                forward(user.poll);
            }, {"returnOriginal": false} );
        };
       
        deleteForm(user, form);
    } // if('/poll/delete')
    
    
    if(path === '/poll/update') {
        
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
            });
            
            // returns the larger array
            var num = Math.max(ans.length, form.length);
            
            for(var i = 0; i < num; i++) {
                // remove remaining answers from poll
                if(i >= form.length) {
                    ans.splice(i, ans.length-1);
                    break;
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
                forward(user.poll);
            }, {"returnOriginal": false} );
        }; // updateForm()
        
        updateForm(user, form);
    } // if('/poll/update') 
    

    if(path === '/poll/vault') {

        findUser( true, null, function(user) {
            forward(user);
        });
    }  // if('/poll/vault')
    
    
    if(path === '/poll/chart') {
        console.log('/poll/chart')
        User.find({_id: "5ad773bb70b87312d878ac8a"})
            .exec(function (err, user) {
                if(err) return console.error(err);
            
                var User = user[0];
                if(User.chart.graph < 4){
                    User.chart.graph += 1;
                } else {
                    User.chart.graph = 0;
                }
                
                User.save(function(err, user) {
                    if(err) return console.error(err);
                    //console.log(user.chart, "graph")
                    forward(user.chart.graph);
                },{"returnOriginal": false});
            });
    } // if('/poll/chart')
    
    
    if(path === '/poll-vault/:user') {
      console.log('/poll-vault/:user')
        var multiple = null;
        if(user === "default") {
            multiple = true;
            user = null;
        }
        
        findUser(multiple, user, function(user) {
            forward(user);
        });
    } // if('/poll-vault/:user')
    
    
    if(path === '/poll/votes') {
         
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
                  forward(user);
                });
            }, {"returnOriginal": false});
        }); //findUser()
    } // if('/poll/votes')

    /*
    if(path === '/signup/:user') {
        
        var displayName = form.displayname,
            email = form.email,
            password = form.password;
        console.log(form)
        if(email !== "" && !email.match(regEx)) {
            forward({ "email" : "Your email doesn't appear valid." });
        } else
        if(password.length < 4 || password !== form.confirm || password === "") {
            forward({ "password" : "Your password doesn't match or isn't long enough, please try again." });
        } else {
            User.findOne({"signin.displayName": displayName} , function(err, user) {
                if(err) return console.error(err);

                if (user) {
                    return forward({"user": "There is already a user with this name!"});
                } else {
                    var currentTime = new Date(Date.now()).toString(),
                        newUser = new User();
                    newUser.date.time = currentTime;
                    newUser.signin.account = "CP Account";
                    newUser.signin.displayName = displayName;
                    newUser.signin.email = email || null;
                    newUser.signin.password = password;
                    
                    newUser.save(function (err) {
                        if(err)return console.error(err);                      
                    });
                    
                    forward({ "success": "Thank you for signing up! You'll be redirected to the sign in page."});    
                }
            }); // User.findOne()
        } // else statement 
    } // if('/signup/:user')
    */
};
