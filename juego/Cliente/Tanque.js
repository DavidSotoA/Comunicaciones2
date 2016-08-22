/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Tanque = function (startX, startY,startId,startNumJugador,startDireccion) {
  var x = startX
  var y = startY
  var id=startId
  var numJugador=startNumJugador;
  var direccion=startDireccion;

  // Getters and setters
  var getX = function () {
    return x
  }

  var getY = function () {
    return y
  }

  var getNumJugador=function(){
    return numJugador;
  }

  var getDireccion=function(){
    return direccion;
  }

  var setX = function (newX) {
    x = newX
  }

  var setY = function (newY) {
    y = newY
  }

  var setDireccion=function(newDireccion){
    direccion=newDireccion;
  }


  var setNumJugador=function(newNum){
     numJugador=newNum;
  }
  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
    getNumJugador: getNumJugador,
    setNumJugador: setNumJugador,
    getDireccion: getDireccion,
    setDireccion: setDireccion,
    id: id
  }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Tanque