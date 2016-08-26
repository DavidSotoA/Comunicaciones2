
var socket;
var players = [];
var tanque1;
var cursores;
var player;
var botonDisparo;
var balas=null;
var enemies;
var tiempoBala = 0;
var direccionImagen=[0,-180,-90,90]
var miDireccion;


var juego = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update})

	function preload(){
		juego.stage.backgroundColor = "#000";
		juego.load.spritesheet('tanqueR', 'imagenes/tanqueR.png', 64, 64)
		juego.load.image('bala', 'imagenes/bala.png' );
	}

	function create () {
		socket=io.connect('http://localhost:8888');
		cursores = juego.input.keyboard.createCursorKeys();
		juego.physics.startSystem(Phaser.Physics.ARCADE);
		fireButton = juego.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
		enemies=[];
		setEventHandlers();	
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

		  socket.on('move bullets', onMoveBullets)

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
	
  		balas = juego.add.weapon(1, 'bala'); //numero de balas que pueden haber en pantalla y se carga el sprite
	    balas.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS; // se indica que muera la bala al salir de la pantalla
	    balas.bulletSpeed = 600; //velocidad de las balas
	    balas.fireRate = 100; //velacidad entre cada bala
	    console

	    player = juego.add.sprite(data.x, data.y, "tanqueR");
  		player.anchor.set(0.5);
  		player.angle=data.dir;

  		juego.physics.enable(player, Phaser.Physics.ARCADE)
  		player.body.collideWorldBounds = true
  		player.body.drag.set(70);

	    balas.trackSprite(player, 0, 0, true); //indicar que la bala sale con el mismo angulo que player 
  		/* 
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
	  movePlayer.player.anchor.setTo(0.5, 0.5);
	  movePlayer.player.direccion=data.dir;

	}

	function onMoveBullets(data){
		console.log("tam: "+data.balas.length)
		console.log("x: "+data.balas[0].x);
		console.log("y: "+data.balas[0].y);

		var moveBullets=playerById(data.id);

		if (!moveBullets) {
		    util.log('Player not found: ' + this.id)
		    return
  		}

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
			if (fireButton.isDown){
		        balas.fire();
		    }
		    if(balas!=null){
		    	if(balas.bullets.total!=0){
			    	var i;
			    	var enviarBalas=[];
			    	for(i=0;i<balas.bullets.total;i++){
			    		enviarBalas.push({x: balas.bullets.children[i].x, y: balas.bullets.children[i].y});
			    	}
			    	socket.emit('move bullets', {balas: enviarBalas});
			    	//console.log(balas.total);
			    	//console.log(balas.bullets.children[0].x);
		    	}
		    }	
			player.angle = miDireccion;
			socket.emit('move player', { x: player.position.x, y: player.position.y, dir: miDireccion});
			/*
			var bala;
			if (botonDisparo.isDown) {
				if (juego.time.now > tiempoBala) {

					bala = balas.getFirstExists(false);
					bala.height = 50;
					bala.width = 50;
				}
				if (bala) {
					bala.height = 50;
					bala.width = 50;
					bala.reset(player.x,player.y);
					if (player.angle==0) {
					
						bala.body.velocity.x= 300;
						bala.anchor.setTo(0.5, 0.5);
	  					bala.angle=90;
						
					}
					if (player.angle==-180) {
						
						bala.body.velocity.x= -300;
						bala.anchor.setTo(0.5, 0.5);
	  					bala.angle=-90;
						
					}
					if (player.angle==-90) {
						bala.body.velocity.y= -300;
						bala.anchor.setTo(0.5, 0.5);
	  					bala.angle=0;
					}
					if (player.angle==90) {
						bala.body.velocity.y= 300;
						bala.anchor.setTo(0.5, 0.5);
	  					bala.angle=-180;
					}
					

					tiempoBala = juego.time.now + 100;
				}
			}*/ 	
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

  this.balas = game.add.group();

  this.game = game
  this.health = 3
  this.player = player
  this.alive = true

  this.player = game.add.sprite(x, y, "tanqueR")
  this.player.angle=direccion;

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
    this.player.angle=this.player.direccion;
  } else {
    this.player.play('stop')
  }

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}
