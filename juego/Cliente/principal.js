
var socket;
var players = [];
var tanque1;
var cursores;
var player;
var botonDisparo;
var balas;
var enemies;
var tiempoBala = 0;
var direccionImagen=['tanqueR','tanqueL','tanqueU','tanqueD']
var miDireccion;


var juego = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update})

	function preload(){
		juego.stage.backgroundColor = "#00796B";
		juego.load.spritesheet('tanqueU', 'imagenes/tanqueU.png', 64, 64)
		juego.load.spritesheet('tanqueR', 'imagenes/tanqueR.png', 64, 64)
		juego.load.spritesheet('tanqueD', 'imagenes/tanqueD.png', 64, 64)
		juego.load.spritesheet('tanqueL', 'imagenes/tanqueL.png', 64, 64)
		juego.load.image('bala', 'imagenes/bala.png' );
	}

	function create () {
		socket=io.connect('http://localhost:8888');
		cursores = juego.input.keyboard.createCursorKeys();
		juego.physics.startSystem(Phaser.Physics.ARCADE);
		enemies=[];
		setEventHandlers();

		/*
		botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		balas = juego.add.group();
		balas.enableBody = true;
		balas.physicsBodyType= Phaser.Physics.ARCADE;
		balas.createMultiple(20,'bala');
		balas.setAll('anchor.x',0.5);
		balas.setAll('anchor.y',1);
		balas.setAll('outOfBoundsKill',true);
		balas.setAll('checkWorldBounds',true);
		*/
		
	}

	var setEventHandlers = function () {
		  // Socket connection successful
		  socket.on('connect', onSocketConnected)

		  // Socket disconnection
		  socket.on('disconnect', onSocketDisconnect)

		  // New player message received
		  socket.on('new player', onNewPlayer)

		  socket.on('my player', MyPlayer)

		  // Player move message received
		  socket.on('move player', onMovePlayer)

		  // Player removed message received
		  socket.on('remove player', onRemovePlayer)
		}


	function onSocketConnected(){
		socket.emit('new player');
	}

	function onSocketDisconnect(){

	}

	function MyPlayer(data){
		miDireccion=data.dir;
		player = juego.add.sprite(data.x, data.y, miDireccion);
  		//player.anchor.setTo(0.5, 0.5);

	}

	function onNewPlayer(data){
		console.log("data: "+data.id);
		var duplicate = playerById(data.id)
	  	if (duplicate) {
	    	console.log('Duplicate player!')
	    	return
	  	}

	  // Add new player to the remote players array
	   enemies.push(new RemotePlayer(data.id, juego, player, data.x, data.y,data.dir))
	}

	function onMovePlayer(data){
		var movePlayer = playerById(data.id)

	  // Player not found
	  if (!movePlayer) {
	    console.log('Player not found: ', data.id);
	    return
	  }

	  // Update player position
	  movePlayer.player.x = data.x;
	  movePlayer.player.y = data.y;
	  movePlayer.player.direccion=data.dir;

	}

	function onRemovePlayer(data){
		var removePlayer=playerById(data.id);
		 // Player not found
		if (!removePlayer) {
		    util.log('Player not found: ' + this.id)
		    return
  		}

  		removePlayer.player.destroy();

  		enemies.splice(enemies.indexOf(removePlayer), 1);
	}

	function update(){
		if(player!=null){
			var j=0;

			for (var i = 0; i < enemies.length; i++) {
				
			    if (enemies[i].alive) {
			      enemies[i].update()
			      juego.physics.arcade.collide(player, enemies[i].player)
			    }
			  }
			if (cursores.right.isDown) {
				player.position.x += 4;

				miDireccion=direccionImagen[0];
			}
			if (cursores.left.isDown) {
				player.position.x -= 4;

				miDireccion=direccionImagen[1];
			}
			if (cursores.up.isDown) {
				player.position.y -= 4;
				miDireccion=direccionImagen[2];
			}
			if (cursores.down.isDown) {
				player.position.y += 4;
				miDireccion=direccionImagen[3];
			}
			player.loadTexture(miDireccion, 0);
			socket.emit('move player', { x: player.position.x, y: player.position.y, dir: miDireccion})
		}
	}
function playerById (id) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}

var RemotePlayer = function (index, game, player, startX, startY, direccion) {
  var x = startX
  var y = startY
  var direccion=direccion

  this.game = game
  this.health = 3
  this.player = player
  this.alive = true

  this.player = game.add.sprite(x, y, direccion)

  //this.player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true)
  //this.player.animations.add('stop', [3], 20, true)

  //this.player.anchor.setTo(0.5, 0.5)

  this.player.name = index.toString()
  juego.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.player.body.immovable = true
  this.player.body.collideWorldBounds = true

  //this.player.angle = game.rnd.angle()

  this.lastPosition = { x: x, y: y }
}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
    this.player.play('move')
    this.player.loadTexture(this.player.direccion, 0);
  } else {
    this.player.play('stop')
  }

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}
