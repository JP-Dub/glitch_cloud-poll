/* This page is used to control attributes of pages */

'use strict';

/* global $, appUrl, ajaxFunctions */
var pathname = window.location.pathname;

(function () {
    
    function findVmin(x, y) {
      
      var height = $(document).height(),
          width = $(document).width(),
          vh = .01*height,
          vw = .01*width,
          vmin = Math.min(vh, vw);

      if(y) {
        return (x * vmin).toFixed(2);
      } else {
        height = height - (x * vmin);
        return height.toFixed(2);
      }  
    }

    var height = findVmin(52.2);
    $(".content").css({ 'height' : height.toString() });

    // for index.html animation for login toggle
    var num = 0;
    $("#account-btn").click( function() {
     
      var sign = $("#signin-header"), 
          vmin = findVmin(1.21, true),
          blur = Math.round(findVmin(.1, true)); 
 
      if(num === 0) {
        sign.animate({'marginTop': "2.65vmin" }, "slow");
        sign.animate({'zIndex' : '3'}, "fast");
        sign.animate({'boxShadow': vmin + "px " + vmin + "px " + blur + "px #595959"}, "slow"); //"8px 12px 1px 
        num = 1;
      } else {
        sign.animate({'boxShadow': "0 0 0 #595959"}, "slow");
        sign.animate({'zIndex': '-3'}, "fast");
        sign.animate({'marginTop': "-24.25vmin" }, "slow");
        num = 0;
      }
    });
    
    // places "Welcome, [user]" on top navbar
    if(pathname !== '/') {
      
      var displayName = document.querySelector("#nav-welcome"),
          apiUrl = appUrl + '/api/:user';
   
      var updateHtmlElement = function(data, element, userProperty) {
          element.innerHTML = "Welcome,  " + data[userProperty];
      };

      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        var userObject = JSON.parse(data);
        
        if (userObject.displayName !== null) {
            updateHtmlElement(userObject, displayName, 'displayName');
        } 

      }));
    }
})();