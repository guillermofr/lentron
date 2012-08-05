
/**
* SERVIDOR DE LENTRON
*/

console.log('SERVER ON');
var fs = require('fs');
var md5 = require('MD5');

//GAME 

var partida = {

	width : 5,
	height : 5,

	init: function(){
		//cargar persistencia si existe
		//si no existe
		this.tablero_create(this.width,this.height);
		//si existe, cargar el tablero relleno
		
		//petarlo de personas para ver si peta
		this.hacer_gente(0);
	},
	
	
	
	turno : 0,
	tablero : [],
	
	tablero_create : function(width,height){
		for (x = 0;x<width ; x++){
			this.tablero[x] = [];
			for (y = 0;y<height ; y++){
				this.tablero[x][y] = [];
			}
		}
	},
	
	avanza_turno : function(){
		this.turno = this.turno +1;
		
		//console.log (JSON.stringify(this.tablero));
		
		return this.turno;
	},
	

	
	hacer_gente: function(gente){
		for (x = 0;x<gente ; x++){
			this.user_create(Math.random()*1000);
		}
	},
	
	online : 0,

	conecta : function(){
		this.online = this.online+1;
		return this.online;
	},
	desconecta : function(){
		this.online = this.online-1;
		return this.online;
	},

	get_status : function(){
		var copy = new Object();
		copy.online = this.online + '/' + this.num_users();
		copy.turno = this.turno;
		copy.tablero = this.tablero;
		return copy;
	},
	
	users: [],
	
	num_users : function(){ 
		return this.users.length;
	},
	
	user_exists : function(user) {
		for (i = 0;i < this.num_users();i++){
			if (this.users[i].username == user) return i;
		}
		return false;
	},
	
	user_create : function(user) {
		this.users.push({
						username:user,
						apikey:Math.random()*10,
						pos:{
								x:null,
								y:null
							},
						direction : null,
						live : true,
						online: false
						});
		return this.num_users() -1;
	},
	
	user_update : function(index) {
		this.users[index].apikey = Math.random()*10;	
		return true
	},
	
	tablero_move_user_start : function(move){
		if ((move.to.x >= this.width || move.to.y >= this.height || move.to.x < 0 || move.to.y < 0) 
		|| (this.tablero[move.to.x][move.to.y].length > 0))
		return false;
		if (move.from.x == null){
			this.tablero[move.to.x][move.to.y].push({id:move.id,type:move.type});
			return true;	
		} else {
			for (n = 0; n < this.tablero[move.from.x][move.from.y].length; n++){
				if (this.tablero[move.from.x][move.from.y][n].id == move.id){
					this.tablero[move.from.x][move.from.y].splice(n,1);
					this.tablero[move.to.x][move.to.y].push({id:move.id,type:move.type});
					return true;
				}
			}
			return false;
		}
	},
	
	user_set : function(data){
		var index = this.allowed(data.username,data.apikey);
		if (index !== false){	
			var move = {
						id : index,
						type : 'user',
						from:{
							x : this.users[index].pos.x,
							y : this.users[index].pos.y,
							},
						to:{
							x : data.x,
							y : data.y,
							}
						};
			
			if (this.tablero_move_user_start(move)){	
				this.users[index].pos.x = data.x;
				this.users[index].pos.y = data.y;
				this.users[index].pos.live = true;
			}			
		}
	},
	
	allowed : function(user,apikey){
		for (i = 0;i < this.num_users();i++){
			if (this.users[i].username == user) {
				if (this.users[i].apikey == apikey) {
					return i;
				} else {
					return false;
				}
			}
		}
		return false;
	},
	
	
	login : function(user,password,apikey){
		if ((user != '' && password != '') || (user != '' && (this.user_exists(user) !== false) && (apikey == this.users[this.user_exists(user)].apikey)))
		//if (true)
		{
			//que pasa si es la primera vez que entra
			var index = this.user_exists(user);

			if (index === false){
				
				index = this.user_create(user);
				return index;
			}
			//que pasa si el usuario ya existe y es una segunda vez 
			else {
				
				this.user_update(index);
				return index;
			}
		}
		else return false;
	}
}

partida.init();

function make_game_status(){
	return partida.get_status();
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
	//Guardar en db el socket_id donde encaje la apikey 
	
	io.sockets.emit('SC_user_connect',make_game_status());
	
	//Tratar que un usuario se desconecta 
	socket.on('disconnect', function () {
		console.log('disconnect');
		partida.desconecta();
		io.sockets.emit('SC_user_disconnect',make_game_status());
	});
	
	socket.on('CS_set', function (data) {
		partida.user_set(data);
		io.sockets.emit('SC_game_status',make_game_status());
	});
	
	socket.on('CS_move_top', function () {
		
	});
	socket.on('CS_move_right', function () {
		
	});
	socket.on('CS_move_bottom', function () {
		
	});
	socket.on('CS_move_left', function () {
		
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
		/*console.log('Incoming Request from: ' +
					 req.connection.remoteAddress +
					' for href: ' + url.parse(req.url).href); */

	//dispatch our request
	dispatcher.dispatch(req, res, partida); 

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



