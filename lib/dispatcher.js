var fs = require('fs');
var md5 = require('MD5');

var actions = {
  'view' : function(user){
    return '<h1>Action view, user = : ' + user + '</h1>';
  },
  'load' : function(file){
	//nothing
  }
}
this.dispatch = function(req, res, partida) {

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
  //console.log(req.method);
  var parts = req.url.split('/');
 
  if (req.url == "/") {
	
	 if (req.method == 'POST') {
		 //console.log("[200] " + req.method + " to " + req.url); 
	 
		 req.on('data', function(chunk) {
		      //console.log("Received body data:");
		      //console.log(chunk.toString());
		      
		      post = chunk.toString().split('&')
		      username = post[0].split('=');
		      password = post[1].split('=');
			  apikey = post[2].split('=');
		      
		      console.log('DATOS POR POST PARA LOGIN',username,password,apikey);
		      //TODO ver si la pass es correcta

			  var index = partida.login(username[1],password[1],apikey[1]);
			  //console.log('login = ',index,partida.users);
		      if (index !== false) {
			  
		    	  destination = './client/game.html';
		    	  //TODO : que se hace si el login es correcto
				  //guardo en db el username, apikey, y un hueco para el socket_id

		    	  res.setHeader("Set-Cookie", ["username="+partida.users[index].username, "apikey="+partida.users[index].apikey]);
		    	  
		      } else {
				
			      res.setHeader("Set-Cookie", ["username=; expires=Thu, 01 Jan 1970 00:00:01 GMT;", "apikey=; expires=Thu, 01 Jan 1970 00:00:01 GMT;"]);
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
