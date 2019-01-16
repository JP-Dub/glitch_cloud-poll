'use strict';
/* global $, appUrl, ajaxFunctions, Chart */
var pathname = window.location.pathname;

if (pathname === '/poll-creation') {
    
    (function () {
        
        var clicks = 0;
        var changeAttr = function(value) {
            var val = true, num = 0, i = 0,
                btn = ['#submit-btn', '#update-btn', '#delete-btn'],
                text = ["Disabled", "Update Poll", "Delete Poll", "Save Poll", "Disabled", "Disabled", "#800000", "white", "Edit", "Create"];
        
            if(value) {
                val = false;
                num = 1;
                i = 3;
            }
            
            btn.forEach(function(ele, index) {
                $(btn[index]).html(text[i + index]);
                if(index !== 0) $(btn[index]).attr("disabled", value);
            }); 
            
            $('#olly > li').remove();
            $('#delete-btn').css("color", text[6 + num]);
            $("#choice-header > header > h1").html(text[8 + num]);
            $('input[name="question"]').prop('readonly', val);
            $('#submit-btn').attr("disabled", val);
        };
        
        var loadPage = function (user) {

            for(var i = 0; i < user.length; i++ ) {
                $("#list").append('<li><a href="#">' + user[i].question + '</a></li>');
            }
       
            // initiates poll "Edit"
            $("#list > li").on("click", function(e) {
                e.preventDefault();
                var survey = $(this).text();
                $('input[name="question"]').val(survey);
                $("#olly").html("");
                changeAttr(false);

                for(var i = 0; i < user.length; i++) {
                    if(survey === user[i].question) {
                        var poll = user[i].answers;
                        clicks = poll.length-2;
                            
                        poll.forEach(function(ele, i) {
                            $("#olly").append("<li>Edit:<input class='input' type='text' name='answers' value=" + JSON.stringify(poll[i].options) + " size='34'></li>");
                        }); 
                    } // if(statement)
                } // for(loop)
            }); // click()
        }; // loadPage();
        
        // Poll Creation header - click to reset poll/form to "Create"
        $("#ques-header").click(function(e) {
            e.preventDefault();
            clicks = 0;
           
            $(this).css({
                "box-shadow" : "1vmin 1vmin .5vmin #595959", /*"16px 16px 6px #595959",*/
                "transform" : "translate(6px,6px)",
                "cursor" : "crosshair"
            });

            changeAttr(true);
            
            $('input[name="question"]').val("");    
            $('#olly').html('<li>Answer:<input class="input" type="text" name="answers" required placeholder="blue" size="34"></li><li>Answer:<input class="input" type="text" name="answers" reqired placeholder="red" size="34"></li>');
            
            setTimeout(function() {
                $("#ques-header").css({
                    "box-shadow" : "2vmin 2vmin 1vmin #595959", /*"26px 26px 8px #595959",*/
                    "transform" : "",
                }); 
            }, 200);
        }).children().click(function(e) {
            return false;
        }); // click()        
        
        var getForm = function(apiUrl, done) {
            var element = document.getElementById("creation-form").elements;
            var form = {}, arr = [];
            
            for(var i = 1; i < element.length; i++) {
                var item = element.item(i);
                form.question = element.item(0).value;
                
                if(item.value !== ''){
                    arr.push(item.value);
                }
            }
            
            form.answers = arr;
            
            if(form.question === "") return alert("You're gonna need to ask a question first!");
            
            if(form.answers.length < 2) return alert("You need at least two options!");
            
            $("#list > li").remove();
            $("#olly > li").remove();
            
            $.post(apiUrl, form, function(user) {
                if(user[0].error) {
                    alert(user[0].error);
                    user = user[1];
                }
                $('input[name="question"]').val("");
                $("#olly").append('<li>Answer:<input class="input" type="text" name="answers" required placeholder="blue" size="34"></li><li>Answer:<input class="input" type="text" name="answers" required placeholder="red" size="34"></li>');
                loadPage(user.reverse());
            });
            
            done(form);
        }; // getForm()
        
        // Button Handler
        $('#options-btn').click(function(e) {
            e.preventDefault();
            clicks += 1;
            if(clicks <= 4) return $("#olly").append("<li>Answer:<input class='input' type='text' name='answers' size='34'></li>");
                 
            if (clicks == 5) return $("#olly").append("<p>You've reached your limit!</p>");
        }); // click()        
    
        $('#submit-btn').click(function (e) {
            e.preventDefault();
            var apiUrl = appUrl + '/poll/save'; 

            getForm(apiUrl, function(form) {
                if(form.error) return alert(form.error);
            });
        }); // click()
        
        $('#update-btn').click(function (e) {
            e.preventDefault();
            var apiUrl = appUrl + '/poll/update';
            getForm(apiUrl, function(form) {
              //$('#question').html(JSON.stringify(form));
            });
        }); // click()
        
        $('#delete-btn').click(function (e) {
            e.preventDefault();
            var apiUrl = appUrl + '/poll/delete';
            var del = confirm("Warning! This will delete your question and answers. Would you like to continue?");
            if(del) {
                getForm(apiUrl, function(form) {
                //$('#question').html(JSON.stringify(form));
                });
            }
        }); // click()
        
        var Url = appUrl + '/poll/questions'; 
        ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', Url, function (data) {
            var obj = JSON.parse(data),
                user = obj.reverse();
            loadPage(user);
        }));
        
    })(); // function()   
} // if('/poll-creation')


if (pathname === '/poll-vault') {

    (function () {
        var User, myChart, style = 0, chart = ['bar', 'pie', 'line', 'doughnut', 'polarArea'];

        var updatePage = function(data, survey) {
            var choices = [], votes = [];         
            User = data;
        
            for(var i = 0; i < User.length; i++) {
                if ( survey === User[i].question) {
                    var poll = User[i].answers;
                    $("#vaultChoices").html('<h2>' + User[i].question + '</h2>');    
                } 
            }         
             
            poll.forEach(function(val, j) {
                $("#vaultChoices").append('<div class="voterSpace"><table style ="width:100%"><tr><td class="leftSpace">' + poll[j].options + '</td><td class="centerSpace"><input type="radio" name="vote" value="' + poll[j].options + '"></td><td class="rightSpace">votes: ' + poll[j].votes+ '</td></tr></table></div>');             
                
                choices.push(poll[j].options);
                votes.push(poll[j].votes);
            });
                             
            $("#vaultChoices").append("<div class='voterSpace'><p class='leftSpace'></p><p id='centerSp' class='centerSpace'><button id='voterBtn' type='submit' style='margin-left:0'>Vote</button></p><p class='rightSpace'></p></div>");
             
            myChart.data.labels = choices;
            myChart.data.datasets[0].data = votes;
            myChart.update();
        
            $('#voterBtn').click(function(e) {
                e.preventDefault();
                var myUrl = appUrl + '/poll/votes';
                var survey = {
                    question : $('#vaultChoices > h2').text(), 
                    vote: $('input[name="vote"]:checked').val()
                        };
            
                $("#vaultResults>li>:contains('" + survey.question + "')").css({'color':'rgba(41,137,216,1)', "fontWeight":"bold"});
            
                $.post(myUrl, survey, function(user) {
                    User = user; // saves user to global scope
                    updatePage(User, survey.question);
                }); 
            }); // click() 
		}; // updatePage()
		
        var loadPage = function(data, user) { 

            // initializes the page if empty
            if(data) {
                User = JSON.parse(data);
            }
            
            if(user) {
                $('#vaultResults').empty();
                $('canvas').hide();
                $('#vaultChoices').empty();
                $('#vaultChoices').html('<h2>Question Selected...</h2>');
                User = user;
            }
                       
            for(var i = 0; i < User.length; i++ ) {
                if(User[i].graph) {
                    style = User[i].graph;
                }
                
                if(User[i].question) {
                    $("#vaultResults").append('<li><a href="#">' + User[i].question + '</a></li>');
                }
                
                if(User[i].displayName && !user) {
                    var displayName = User[i].displayName;
                    $('#selectUser').append('<option>' + displayName + '</option>');
                }
			} // end of for(loop)
			
			var userLogged = $('#nav-welcome').html();
            if(userLogged) {
                $(".navbar-left").html('<a href="/poll-creation" title="Create Polls">Create</a> | <a href="/logout/vault">Log Out</a>');
            }
			

			var graph = ['Bar', 'Pie', 'Line', 'Doughnut', 'Polar'];
            $('#data').html("Click to change style of chart: " + graph[style]);
			$('#myChart').hide();
			var ctx = $("#myChart");
			myChart = new Chart(ctx, {
				type: chart[style],
				data: {
					labels: [],
					datasets: [{
						label: '# of Votes',
						data: [],//[12, 19, 3, 5, 2, 8],
						backgroundColor: [
							'rgba(255, 99,  132, 0.2)', //red
							'rgba(54,  162, 235, 0.2)', //blue
							'rgba(255, 206, 86,  0.2)', //yellow
							'rgba(75,  192, 192, 0.2)', //green
							'rgba(153, 102, 255, 0.2)',//purple
							'rgba(255, 159, 64,  0.2)'  //orange
						],
						borderColor: [
							'rgba(255, 99,  132, 1)',
							'rgba(54,  162, 235, 1)',
							'rgba(255, 206, 86,  1)',
							'rgba(75,  192, 192, 1)',
							'rgba(153, 102, 255, 1)',
							'rgba(255, 159, 64,  1)'
						],
						borderWidth: 1
					}]
				},
				options: {
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero:true
							}
						}],
						xAxes: []
					}
				}
			}); // myChart()  
        
            $("#vaultResults > li").on("click", function(e) {
                e.preventDefault();
                var survey = $(this).text();
               
                if(myChart) {
                    $('#myChart').show();
                }

                updatePage(User, survey);    
            }); // click() 
        }; // loadPage() 		
        
        // Function desired to change graph style 
        $('#vault-header').click(function(e) {
            e.preventDefault();

            var app = appUrl + '/poll/chart';
            $.get(app, function(num) {
               window.location.href = "https://cloud-poll.glitch.me/poll-vault";
            });
        });
            
        $('#selectUser').change(function(e) {
            e.preventDefault();
            var val = $("#selectUser").val();
           
            apiUrl = appUrl + '/poll-vault/' + val;
            $.get(apiUrl, function(data) {
                if(val !== "default") {
                    loadPage(null, data);
                } else {
                    loadPage(null, data);
                }
            });
        });
   
        var apiUrl = appUrl + '/poll/vault';
        ajaxFunctions.ready(ajaxFunctions.ajaxRequest("GET", apiUrl, loadPage));
        
    })();  // function()    
} // if('/poll-vault')


if (pathname === '/signup') {

    (function(){    
        var url = appUrl + '/signup/:user';
   
        $('#register').click(function(e) {
            e.preventDefault();
            var element = document.getElementById("regform").elements,
                form = {};
            
            form.displayname = element.item(0).value;
            form.email = element.item(1).value || null;
            form.password = element.item(2).value;
            form.confirm = element.item(3).value;
             
            $.post(url, form, function(res) {
                if(!res.success) {
                    if(res.user) {
                        confirm(res.user);
                        $('input[name="displayname"]').focus();
                        $('input[name="displayname"]').val("");
                    } else
                    if(res.email) {
                        confirm(res.email);
                        $('input[name="email"]').focus();
                        $('input[name="email"]').val("");
                    } else {
                        confirm(res.password);
                        $('input[name="password"]').focus();
                        $('input[name="password"]').val("");
                        $('input[name="confirm"]').val("");
                    }
                } else {
                    alert(res.success);
                    setTimeout(function(){
                        window.location.href = "https://cloud-poll-jpiazza.c9users.io" ;
                    }, 1000);
                }
            }); // end of ajax request
        }); // end of click(function)
        
    })(); // function()
} // if('/signup')
