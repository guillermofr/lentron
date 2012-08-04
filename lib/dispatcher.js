var fs = require('fs');
var md5 = require('MD5');

var actions = {
  'view' : function(user){
    return '<h1>Action view, user = : ' + user + '</h1>';
  }
}
this.dispatch = function(req, res) {

  //some private methods
  var serverError = function(code, content) {
    res.writeHead(code, {'Content-Type': 'text/plain'});
    res.end(content);
  }
 
  var renderHtml = function(content) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(content, 'utf-8');
  }

  var renderScript = function(content) {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(content, 'utf-8');
  }
  console.log(req.method);
  var parts = req.url.split('/');
 
  if (req.url == "/") {
	
	 if (req.method == 'POST') {
		 console.log("[200] " + req.method + " to " + req.url); 
	 
		 req.on('data', function(chunk) {
		      console.log("Received body data:");
		      console.log(chunk.toString());
		      
		      post = chunk.toString().split('&')
		      username = post[0].split('=');
		      password = post[1].split('=');
		      
		      console.log(username,password);
		      //TODO ver si la pass es correcta
		      
		      
		      if (username[1] != '') {
		    	  destination = './client/game.html';
		    	  //TODO : que se hace si el login es correcto
		    	  res.setHeader("Set-Cookie", ["username="+username[1], "apikey="+md5(username[1])]);
		    	  
		      } else {
		    	  destination = './client/index.html';
		    	  //TODO : que se hace si el login no es correcto
		    	  
		    	  
		    	  
		      }
		      
		      
		      fs.readFile(destination, function(error, content) {
		        if (error) {
		          serverError(500);
		        } else {
		          renderHtml(content);
		        }
		      });
		      
		    });

	 } else {

	    fs.readFile('./client/index.html', function(error, content) {
	      if (error) {
	        serverError(500);
	      } else {
	        renderHtml(content);
	      }
	    });

	 }
	
	
	
 
  } else {
	
    var action   = parts[1];
    var argument = parts[2];
 
    if (typeof actions[action] == 'function') {
		if (action == 'load'){
			fs.readFile('./client/lib/'+argument, function(error, content) {
		      if (error) {
		        serverError(500);
		      } else {
				renderScript(content);
		      }
		    });
		}else {
			var content = actions[action](argument);
      		renderHtml(content);
		}      
    } else {
      serverError(404, '404 Bad Request');
    }
  }
}
