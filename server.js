
/**
* SERVIDOR DE LENTRON
*/

console.log('SERVER ON');
var fs = require('fs');

//GAME 

var partida = new Object();

partida.turno = 0;

partida.avanza_turno = function(){
	this.turno = this.turno +1;
	return this.turno;
};

partida.online = 0;

partida.conecta = function(){
	this.online = this.online+1;
	return this.online;
};
partida.desconecta = function(){
	this.online = this.online-1;
	return this.online;
};


function make_game_status(){
	return 'turno = ' + partida.turno + '<br>gente = <span id="users">' + partida.online + '</span>' ;
}

//SOCKET.IO

//configurar el puerto por el que escucha, por defecto 415
var arguments = process.argv.splice(2)[0]

if (arguments==undefined){
	socket_port = 415;
} else {
	socket_port = parseInt(arguments);
}

var io = require('socket.io');
	io = io.listen(socket_port);
   // console.log(io.server._handle);
	if (io.server._handle == null){
		console.log("PUERTO OCUPADO");
		process.exit(0);
	}

io.sockets.on('connection', function(socket) { 
	partida.conecta();
	//Cuando un cliente se conecta se le manda la información de partida
	socket.emit('SC_game_status' , make_game_status());
	//Tratar que un usuario se conecta
	
	io.sockets.emit('SC_user_connect',partida.online);
	
	//Tratar que un usuario se desconecta 
	socket.on('disconnect', function () {
		console.log('disconnect');
		partida.desconecta();
		io.sockets.emit('SC_user_disconnect',partida.online);
		
	});
});

setInterval(function() {
	
	console.log('-- PASANDO AL TURNO Nº' + partida.avanza_turno() + ' --');
	//actualizamos el estado del servidor en cada turno
	io.sockets.emit('SC_game_status',make_game_status());
	
}, 5000);


//HTTP SERVER

//include our modules
var sys   = require('util');
var http  = require('http');
var url   = require('url');


//configuración del servidor http 
var server_ip = '127.0.0.1';
var server_port = 5000;


//require custom dispatcher
var dispatcher = require('./lib/dispatcher.js');
console.log('Starting server @ http://'+server_ip+':'+server_port+'/');
http.createServer(function (req, res) {
  //wrap calls in a try catch
  //or the node js server will crash upon any code errors
  
   client_ip = req.connection.remoteAddress;
  
	try {
		//pipe some details to the node console
		console.log('Incoming Request from: ' +
					 req.connection.remoteAddress +
					' for href: ' + url.parse(req.url).href
	);

	//dispatch our request
	dispatcher.dispatch(req, res); 

	} catch (err) {
		//handle errors gracefully
		sys.puts(err);
		res.writeHead(500);
		res.end('Internal Server Error' + ' | Your IP: ' + client_ip);
	}  
 
}).listen(server_port, server_ip, function() {
	//runs when our server is created
	console.log('Server running at http://'+server_ip+':'+server_port+'/');
});



