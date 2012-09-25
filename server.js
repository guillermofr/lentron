
/**
* SERVIDOR DE LENTRON
*/

console.log('SERVER ON');
var fs = require('fs');
var md5 = require('MD5');

//GAME 

var partida = {
	//configuration
	turn_time : 10000,
	
	last_turn_time : new Date(),
	
	width : 50,
	height : 50,

	init: function(){
		//cargar persistencia si existe
		//si no existe
		this.tablero_create(this.width,this.height);
		//si existe, cargar el tablero relleno
		
		//petarlo de personas para ver si peta
		this.hacer_gente(0);
	},
	
	reset: function(){
		this.tablero_create(this.width,this.height);
		this.status = 0;
		this.turno = 0;
		this.users = [];
		this.online = 0;
	},
	
	start_game: function(){
		this.status = 1;
		
	},
	
	//estado de la partida
	// 0 = no empezada, seleccionen sus asientos
	// 1 = en curso, pasan turnos y empieza el funne
	// 2 = terminada, partida parada
	status : 1,
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
		if (this.status == 1){
			//si la partida está en curso
			
			//TODO, AKI TODA LA DINÁMICA DE MOVIMIENTOS Y CALCULO DE COLISIONES

			this.turno = this.turno +1;
		} else if (this.status == 0) {
			//aqui se checkea si ha llegado la hora de empezar
		
			//TODO, aki hay que hacer el checkeo de la hora de inicio
		
		}
		//console.log (JSON.stringify(this.tablero));
		this.last_turn_time = new Date();
		return this.turno;
	},
	

	
	hacer_gente: function(gente){
		for (x = 0;x<gente ; x++){
			this.user_create(Math.random()*1000);
		}
	},
	
	
	
	online : 0,

	conecta : function(data){
	
		console.log('llamo a conecta',data);
	
		var username = data.username;
		var apikey = data.apikey;
		var socket = data.socket;
		
		console.log('allowed',this.allowed(username,apikey));

		if (this.allowed(username,apikey) !== false){
			var user_index = this.user_exists(username);
			if (user_index === false){
				//no está registrado
				
			} else {
				//está registrado
				if (!this.users[user_index].online){
					this.online = this.online+1;
					this.users[user_index].online = true;
				}
				console.log();
				this.users[user_index].socket.push(socket);
			}
		} else {
			return -1;
		}

		return this.online;
	}, 
	
	desconecta : function(socket){
		//console.log('se sale el socket',socket,this.users);
		for (i = 0;i < this.users.length; i++){	
				var pos = this.users[i].socket.indexOf(socket);
				if (pos > -1) {
					this.users[i].socket.splice( pos, 1 );
					this.users[i].online = false;
					this.online = this.online-1;
					return this.online;
				}
		}
		return this.online;
	},

	get_status : function(){
		var copy = new Object();
		copy.online = this.online + '/' + this.num_users();
		copy.turno = this.turno;
		copy.tablero = this.tablero;
		copy.width = this.width;
		copy.heigth = this.height;
		copy.timer = 10 - ((new Date()) - this.last_turn_time)/1000
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
						live : false,
						online: false,
						socket: [],
						});
		return this.num_users() -1;
	},
	
	user_update : function(index) {
		this.users[index].apikey = Math.random()*10;	
		return true
	},
	
	tablero_move_user_start : function(move){
		// siguiente posición es un número
		if (isNaN(move.to.x) || isNaN(move.to.y)) return false;
		// siguiente posición está dentro del tablero
		if ((move.to.x >= this.width || move.to.y >= this.height || move.to.x < 0 || move.to.y < 0) 
		|| (this.tablero[move.to.x][move.to.y].length > 0))
		return false;
		
		if (move.from.x == null){
			//la primera vez que te mueves, no vienes de ninguna parte
			this.tablero[move.to.x][move.to.y].push({id:move.id,type:move.type});
			return true;	
		} else {
			for (n = 0; n < this.tablero[move.from.x][move.from.y].length; n++){
				if (this.tablero[move.from.x][move.from.y][n].id == move.id){
					//me borro
					this.tablero[move.from.x][move.from.y].splice(n,1);
					//me añado
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
	
	check_user: function(user,password){
		//validar un usuario y contraseña
		return (user != '' && password != '');
		//TODO, hay que enviar esto a una api, o algo
	},
	
	login : function(user,password,apikey){

		if (this.check_user(user,password) || (user != '' && (this.user_exists(user) !== false) && (apikey == this.users[this.user_exists(user)].apikey)))
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
var arguments = process.argv.splice(2)[0];

if (arguments==undefined){
	socket_port = 415;
} else {
	socket_port = parseInt(arguments);
}

var io = require('socket.io');
	
	io = io.listen(socket_port);
	io.set('log level', 1);
   // console.log(io.server._handle);
	if (io.server._handle == null){
		console.log("PUERTO OCUPADO");
		process.exit(0);
	}

io.sockets.on('connection', function(socket) { 
	//partida.conecta();
	//Cuando un cliente se conecta se le manda la información de partida
	socket.emit('SC_game_status' , make_game_status());
	//Tratar que un usuario se conecta
	//Guardar en db el socket_id donde encaje la apikey 
	//io.sockets.emit('SC_user_connect',make_game_status());
	
	//Cuando un usuario dice que se conecta guardarmos su socket y status
	socket.on('CS_connect', function (data) {
		data.socket = socket.id;
		partida.conecta(data);
		io.sockets.emit('SC_user_connect',make_game_status());
	});
	
	//Tratar que un usuario se desconecta 
	socket.on('disconnect', function () {
		partida.desconecta(socket.id);
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



//CRON PARA PASAR TURNO CADA X TIEMPO
setInterval(function() {
	var turno = partida.avanza_turno();
	if (turno) 
	console.log('-- PASANDO AL TURNO Nº' + turno + ' -- ' + partida.last_turn_time);
	else 
	console.log('-- ESPERANDO A QUE EMPIECE LA PARTIDA -- ' + partida.last_turn_time);
	
	//actualizamos el estado del tablero de los clientes en cada turno
	io.sockets.emit('SC_game_status',make_game_status());
	//console.log(partida.users);
	
}, partida.turn_time);


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



