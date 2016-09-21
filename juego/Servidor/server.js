var util = require('util')
var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')
var io = require('socket.io')
var direccionImagen=[0,-180,-90,90]

var Tanque = require('../Cliente/Tanque.js')

var posiciones= [[40,40],[760,560],[40,560], [760,40]];
var jugadoresDisponibles=[true,true,true,true];
var port =  8888

/* ************************************************
** GAME VARIABLES
************************************************ */
var socket	// Socket controller
var players	// Array of connected players

/* ************************************************
** GAME INITIALISATION
************************************************ */

// Create and start the http server
var server = http.createServer(
  ecstatic({ root: path.resolve(__dirname, '../Servidor') })
).listen(port, function (err) {
  if (err) {
    throw err
  }
  console.log("Servidor conectado")
  init()
})

function init () {
  // Create an empty array to store players
  players = []

  // Attach Socket.IO to server
  socket = io.listen(server)

  // Start listening for events
  setEventHandlers()
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */
var setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection)
}

// New socket connection
function onSocketConnection (client) {


  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  client.on('move bullets', onMoveBullets)

  // Listen for move player message
  client.on('move player', onMovePlayer)

  client.on('explosion', choque)

  client.on('explosionDisparo', disparo)

  client.on('gane', ganador)

  client.on('destruyeBala', destBala)
}

function ganador(data){
  this.broadcast.emit('perdedor', {})
}

function destBala(data){
  this.broadcast.emit('destBalas', {data})
}

function onClientDisconnect(){
  util.log('Player has disconnected: ' + this.id)
  var removePlayer=playerById(this.id);

  if (removePlayer==false) {
    util.log('Player not found: ' + this.id)
    return
  }

  util.log("removido jugador "+(removePlayer.getNumJugador()+1));
  jugadoresDisponibles[removePlayer.getNumJugador()]=true;
  
  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('remove player', {id: this.id})
}


function onNewPlayer(){

  var num_jugadores=players.length;
  
  if(num_jugadores<4){
    var i;
    var direccion;
    for(i=0;i<4;i++){
      if(jugadoresDisponibles[i]){
        util.log("agregado jugador "+(i+1));
        newPlayer = new Tanque(posiciones[i][0], posiciones[i][1], this.id,i, direccionImagen[i]);

        jugadoresDisponibles[i]=false;
        break;
      }
    }
  
    // Enviar al jugador que hizo la llamada su informacion
    this.emit('my player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(),dir: newPlayer.getDireccion()})

    // Enviar a los otros jugadores la informacion del nuevo jugador
    this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), dir: newPlayer.getDireccion()})

    //Enviar la informacion de los otro jugadores al jugador que realizo la llamada
    var i, existingPlayer
    for (i = 0; i < num_jugadores; i++) {
      existingPlayer = players[i]
      this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), dir: existingPlayer.getDireccion()})
    }

    //Agregar al jugador que realizo la llamada al array de jugadores
    players.push(newPlayer)
  }else{
    util.log("Ya estan los 4 jugadores, no se pueden conectar mas")
  }
}

function choque(data){
  /*var player= playerById(this.id);


  if (!player) {
    util.log('Player not found: ' + this.id);
    return
  }*/
  util.log("choque")
  this.emit('aiudaaa', {id1: data.id1, x1: data.x1, y1: data.y1,
                                id2: data.id2, x2: data.x2, y2: data.y2});
  this.broadcast.emit('aiudaaa', {id1: data.id1, x1: data.x1, y1: data.y1,
                                id2: data.id2, x2: data.x2, y2: data.y2});
}

function disparo(data){
  /*var player= playerById(this.id);


  if (!player) {
    util.log('Player not found: ' + this.id);
    return
  }*/
  util.log("me mori")
  this.emit('meMori', {id1: data.id1, id2: data.id2, x1: data.x1, y1: data.y1});
  this.broadcast.emit('meMori', {id1: data.id1, id2: data.id2, x1: data.x1, y1: data.y1});
}


function onMoveBullets(data){
  var moveBullets = playerById(this.id);

  if (!moveBullets) {
    util.log('Player not found: ' + this.id);
    return
  }

  this.broadcast.emit('move bullets', {id: moveBullets.id, balas: data.balas});  

}

function onMovePlayer(data){
  // Find player in array
  var movePlayer = playerById(this.id)

  // Player not found
  if (!movePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.setX(data.x)
  movePlayer.setY(data.y)
  movePlayer.setDireccion(data.dir);

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(),dir: movePlayer.getDireccion()})
}


function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}