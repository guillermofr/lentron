lentron
=======

Nueva versión de lentron.

Pronto se irán subiendo funcionalidades.
Resumen de la nueva implementación:

+NUEVOS CAMBIOS




+SERVIDOR

Tanto el servidor http como el de la dinámica del juego están realizados sobre NODE.js

Para la persistencia de los datos se utilizará fichero o sqlite (TODO)

+CHAT
Implementar un chat en tiempo real
con un chat general abajo, permanente
y en el tablero poner bocadillos online sobre los concursantes, pero que permanezcan 2 segundos

Tambien , con node, se pueden actualizar en tiempo real si el usuario está conectado o
desconectado

Además puede que tenga su gracia indicar hacia que dirección está mirando cada usuario en cada momento

+REPRESENTACION
Node.js volcará un dump de la situación del tablero como un objeto. Un array multidimensional con lo que hay 
en cada una de las celdas

la representación gráfica se facilita con la librería paper.js muy util para estas cosas , 
se limitaría el acceso por móvil pero se pueden llegar a dibujar cosas muy chulas

la api devuelve una colección de arrays , una para la información de cada jugador

turno:"", //TODO
ultimo_turno:"", //TODO
tiempo_turno:"", //TODO
data{
[[],[],[],[]],
[[],[],[],[]],
[[],[],[],[]],
[[],[],[],[]]
}

+CONTENIDO DE LAS CELDAS
Para la cabeza de un jugador
{id:4,type:'user'}

para la cola de un jugador
{id:4,type:'tail'}

para una tumba
{id:-1,type:'grave',users:[4,5]} 	// si hay choque contra cabeza
{id:-1,type:'grave',users:[4]}		// si hay choque contra cola

-- Las tumbas sirven para dejar una casilla con un solo elemento en lugar de una cabeza y una cola
o dos cabezas. De esta forma en cada turno se mueven todas las cabezas y se recorre el tablero buscando 
celdas con 2 objetos, si se encuentra alguna cabeza en estas celdas, se marca como muerto y se sustituye el contenido
de la celda por una tumba(grave), quedando esta con un solo objeto.