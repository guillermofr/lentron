lentron
=======

Nueva versión de lentron.

Pronto se irán subiendo funcionalidades.

Resumen de la nueva implementación:

+NUEVOS CAMBIOS


+SERVIDOR

Otro punto sería usar NODE.js para la comunicación server-cliente

Aun está en duda si tener los datos en un servidor apache y tirar de api o tener los datos en 
SQLITE que guarde los datos en el local del servidor

Se podría crear un login para crear usuarios o usar la tabla de users de la mlp

en lugar de haber un proceso cron lanzando un php, puede ser un script hecho en node
o un cron que lance node , habría que ver que estabilidad tiene para poder hacer eso


+CHAT
Implementar un chat en tiempo real
con un chat general abajo, permanente
y en el tablero poner bocadillos online sobre los concursantes, pero que permanezcan 2 segundos

Tambien , con node, se pueden actualizar en tiempo real si el usuario está conectado o
desconectado



+REPRESENTACION
Una buena mejora sería implementar el juego para que en lugar de ser mostrado como imagen
se base en dibujar algo en cliente mediante un volcado de datos que tiene el servidor

la representación gráfica se facilita con la librería paperjs muy util para estas cosas , 
se limitaría el acceso por móvil pero se pueden llegar a dibujar cosas muy chulas

la api devuelve una colección de arrays , una para la información de cada jugador

turno:"",
ultimo_turno:"",
tiempo_turno:"",
data{
	[
		id:""
		nombre:""
		cabeza:["",""]
		cola:[["",""],["",""]..["",""]]
	],
	[
		id:""
		nombre:""
		cabeza:["",""]
		cola:[["",""],["",""]..["",""]]
	],
}

