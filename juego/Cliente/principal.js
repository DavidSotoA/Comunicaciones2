
var socket;
var players = [];
var tanque1;
var cursores;
var explosions;
var player;
var botonDisparo;
var balas=null;
var enemies;
var tiempoBala = 0;
var direccionImagen=[0,-180,-90,90]
var miposicionOring;
var miDireccion;
var sonido_disparo;
var sondio_explosion;
var enemyDisparo=null;



var juego = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update})

	function preload(){
		juego.stage.backgroundColor = "#000";
		juego.load.spritesheet('tanqueR', 'imagenes/tanqueR.png', 64, 64)
		juego.load.spritesheet('kaboom', 'imagenes/explode.png', 128, 128);
		juego.load.image('bala', 'imagenes/bala.png' );
		juego.load.image('boss', 'imagenes/boss.png', 10, 10);
		juego.load.audio('sonido_disparo', 'sonidos/disparo.mp3');
		juego.load.audio('sondio_explosion', 'sonidos/meDieron.mp3');
		juego.load.bitmapFont('desyrel', 'fuentes/desyrel.png', 'fuentes/desyrel.xml');
	

	}

	function create () {
		socket=io.connect('http://localhost:8888');
		//socket=io.connect('http://192.168.194.17:8888');
		cursores = juego.input.keyboard.createCursorKeys();
		juego.physics.startSystem(Phaser.Physics.ARCADE);
		fireButton = juego.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
		enemies=[];
		/*
		map = juego.add.tilemap();
		layer = map.create('level1', 40, 30, 32, 32);
		 map.putTile(30, 2, 10, layer);
    	map.putTile(30, 3, 10, layer);
    	map.putTile(30, 4, 10, layer);

    	map.setCollisionByExclusion([0]);*/

		sonido_disparo = juego.add.audio('sonido_disparo');
	    sondio_explosion = juego.add.audio('sondio_explosion');
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

		  socket.on('aiudaaa', enemigoDestruido)

		  socket.on('meMori', meMoriPorBala)

		  socket.on('perdedor', perdi)

		}

	function perdi(){
		var line1;
		var line2;
		var text = juego.add.bitmapText(400, 300, 'desyrel', 'HAS PERDIDO!!', 64);
    	text.anchor.x = 0.5;
    	text.anchor.y = 0.5;

    	line1 = new Phaser.Line(400, 0, 400, 600);
    	line2 = new Phaser.Line(0, 300, 800, 300);
    	juego.paused = true;
	}

	function onSocketConnected(){
		socket.emit('new player');
	}

	function onSocketDisconnect(){

	}

	function choque(obj1,obj2){
		/*
		console.log("choquee")
		obj1.kill();
		explosion = juego.add.sprite(player.position.x, player.position.y, "kaboom")
		explosion.anchor.set(0.5);
    	explosion.animations.add('explodes')
    	explosion.animations.play('explodes', 30, false, true);
        sondio_explosion.play();*/
        socket.emit('explosion', {id1: obj1.name, x1: obj1.body.x, y1: obj1.body.y,
        					      id2: obj2.name, x2: obj2.body.x, y2: obj2.body.y});
        //console.log("colision");
        //juego.time.events.add(Phaser.Timer.SECOND * 2, function () {player.reset(miposicionOring[0],miposicionOring[1]);}, this);
        //explosion.animations.currentAnim.onComplete.add(function () {player.reset(miposicionOring[0],miposicionOring[1]);}, this);
        
	}


	 function meDieron(obj1,obj2){
	 	console.log("me dierooon")
	 	socket.emit('explosionDisparo', {id1: obj1.name,id2: enemyDisparo.player.name, x1: obj1.body.x, y1: obj1.body.y});
	 	//obj2.kill();
	 }


	 function meMoriPorBala(data){/*

		var enemigoDestruido = playerById(data.id);
	
		console.log("enemy_x: "+data.x);
		console.log("enemy_y: "+data.y);
		enemigoDestruido.player.kill();
		explosion = juego.add.sprite(data.x, data.y, "kaboom")
		explosion.anchor.set(0.25);
    	explosion.animations.add('explodes')
    	explosion.animations.play('explodes', 30, false, true);
        sondio_explosion.play();
        //juego.time.events.add(Phaser.Timer.SECOND * 2, function () {enemigoDestruido.player.reset();}, this);
        explosion.animations.currentAnim.onComplete.add(function () {enemigoDestruido.player.reset();}, this);        
	*/
		var exp1;
		var enemigoDestruido = playerById(data.id1);
		var matarBala=playerById(data.id2);


		if(!enemigoDestruido){
			player.kill();
			exp1 = juego.add.sprite(player.position.x, player.position.y, "kaboom")
			exp1.anchor.set(0.5);
	    	exp1.animations.add('explodes')
	    	exp1.animations.play('explodes', 30, false, true);
	    	player.reset(miposicionOring[0],miposicionOring[1]);
	    	//juego.time.events.add(Phaser.Timer.SECOND * 2, function () {player.reset(miposicionOring[0],miposicionOring[1]);}, this);
			
		}else{
			console.log("cc")
			enemigoDestruido.player.kill();
			exp2 = juego.add.sprite(data.x1, data.y1, "kaboom")
			exp2.anchor.set(0.25);
	    	exp2.animations.add('explodes')
	    	exp2.animations.play('explodes', 30, false, true);
	    	enemigoDestruido.player.reset(enemigoDestruido.getInitX(),enemigoDestruido.getInitY());
	    	//juego.time.events.add(Phaser.Timer.SECOND * 2, function () {enemigoDestruido.player.reset(enemigoDestruido.getInitX(),enemigoDestruido.getInitY());}, this);
		}

		console.log("balas.bullets: "+ balas.bullets)

		if(!matarBala){
			balas.killAll();
		}else{
			matarBala.balas.killAll();
		}

		sondio_explosion.play();
	}

	function enemigoDestruido(data){/*

		var enemigoDestruido = playerById(data.id);
	
		console.log("enemy_x: "+data.x);
		console.log("enemy_y: "+data.y);
		enemigoDestruido.player.kill();
		explosion = juego.add.sprite(data.x, data.y, "kaboom")
		explosion.anchor.set(0.25);
    	explosion.animations.add('explodes')
    	explosion.animations.play('explodes', 30, false, true);
        sondio_explosion.play();
        //juego.time.events.add(Phaser.Timer.SECOND * 2, function () {enemigoDestruido.player.reset();}, this);
        explosion.animations.currentAnim.onComplete.add(function () {enemigoDestruido.player.reset();}, this);        
	*/
		var exp1,exp2;
		var enemigoDestruido = playerById(data.id1);

		if(!enemigoDestruido){
			console.log("me choque")
			player.kill();
			exp1 = juego.add.sprite(player.position.x, player.position.y, "kaboom")
			exp1.anchor.set(0.5);
	    	exp1.animations.add('explodes')
	    	exp1.animations.play('explodes', 30, false, true);
	    	player.reset(miposicionOring[0],miposicionOring[1]);
	    	//juego.time.events.add(Phaser.Timer.SECOND * 2, function () {player.reset(miposicionOring[0],miposicionOring[1]);}, this);
			
		}else{
			console.log("cc")
			enemigoDestruido.player.kill();
			exp2 = juego.add.sprite(data.x1, data.y1, "kaboom")
			exp2.anchor.set(0.25);
	    	exp2.animations.add('explodes')
	    	exp2.animations.play('explodes', 30, false, true);
	    	enemigoDestruido.player.reset(enemigoDestruido.getInitX(),enemigoDestruido.getInitY());
	    	//juego.time.events.add(Phaser.Timer.SECOND * 2, function () {enemigoDestruido.player.reset(enemigoDestruido.getInitX(),enemigoDestruido.getInitY());}, this);
		}

		enemigoDestruido = playerById(data.id2);

		if(!enemigoDestruido){
			console.log("aca no entro")
			player.kill();
			exp1 = juego.add.sprite(player.position.x, player.position.y, "kaboom")
			exp1.anchor.set(0.5);
	    	exp1.animations.add('explodes')
	    	exp1.animations.play('explodes', 30, false, true);
	    	player.reset(miposicionOring[0],miposicionOring[1]);
	    	//juego.time.events.add(Phaser.Timer.SECOND * 2, function () {player.reset(miposicionOring[0],miposicionOring[1]);}, this);
			
		}else{
			console.log("dd")
			enemigoDestruido.player.kill();
			exp2 = juego.add.sprite(data.x2, data.y2, "kaboom")
			exp2.anchor.set(0.25);
	    	exp2.animations.add('explodes')
	    	exp2.animations.play('explodes', 30, false, true);
	    	enemigoDestruido.player.reset(enemigoDestruido.getInitX(),enemigoDestruido.getInitY());
	    	//juego.time.events.add(Phaser.Timer.SECOND * 2, function () {enemigoDestruido.player.reset(enemigoDestruido.getInitX(),enemigoDestruido.getInitY());}, this);
		}
		sondio_explosion.play();
	}


	function MyPlayer(data){
		miDireccion=data.dir;
	
  		balas = juego.add.weapon(1, 'bala'); //numero de balas que pueden haber en pantalla y se carga el sprite
	    balas.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS; // se indica que muera la bala al salir de la pantalla
	    balas.bulletSpeed = 600; //velocidad de las balas
	    balas.fireRate = 100; //velacidad entre cada bala

	    player = juego.add.sprite(data.x, data.y, "tanqueR");
  		player.anchor.set(0.5);
  		player.angle=data.dir;
  		player.name = (data.id).toString()

  		boss = juego.add.sprite(410, 270, "boss");
  		boss.anchor.set(0.5);

  		juego.physics.enable(boss, Phaser.Physics.ARCADE);
		boss.body.collideWorldBounds = true;
		boss.body.immovable = true;


  		miposicionOring = [data.x,data.y];

  		juego.physics.enable(player, Phaser.Physics.ARCADE)
  		player.body.collideWorldBounds = true
  		player.body.drag.set(70);

				

  		balas.onFire.add(disparo, this); // se  llamara la funcion disparo cada vez que el jugador dispare
	    balas.trackSprite(player, 0, 0, true); //indicar que la bala sale con el mismo angulo que player 


	}

	function gane(ob1, ob2){
		console.log("ganeeeeeee");
		var line1;
		var line2;
		var text = juego.add.bitmapText(400, 300, 'desyrel', 'HAS GANADO!!', 64);
    	text.anchor.x = 0.5;
    	text.anchor.y = 0.5;

    	line1 = new Phaser.Line(400, 0, 400, 600);
    	line2 = new Phaser.Line(0, 300, 800, 300);
    	socket.emit('gane',{});
    	juego.paused = true;

	}

	function disparo () { 
		console.log("x: "+balas.fireFrom.x);
		console.log("y: "+balas.fireFrom.y);
		sonido_disparo.play();
		var enviarBalas=[];
		enviarBalas.push({x: balas.fireFrom.x, y: balas.fireFrom.y});
		
	 }


	function onNewPlayer(data){
		console.log("data: "+data.id);
		var duplicate = playerById(data.id)
	  	if (duplicate) {
	    	console.log('Duplicate player!')
	    	return
	  	}

	  // Add new player to the remote players array
	   enemies.push(new RemotePlayer(data.id, juego, player, data.x, data.y,data.dir));
	   juego.physics.arcade.enable([player, playerById(data.id).player]);
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
  		moveBullets.disparar();
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
			juego.physics.arcade.collide(boss, balas.bullets,gane,null,this);

			for (var i = 0; i < enemies.length; i++) {
				
				
			    if (enemies[i].alive) {
			    	enemyDisparo=enemies[i];
			    //  juego.physics.enable(enemies[i].player, Phaser.Physics.ARCADE)
			    //  enemies[i].player.body.collideWorldBounds = true;
			      juego.physics.arcade.collide(player, enemies[i].player,choque,null,this);
			      juego.physics.arcade.collide(player, enemies[i].balas.bullets,meDieron,null,this);
			      enemies[i].update()
			      
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
			player.angle = miDireccion;
			socket.emit('move player', { x: player.position.x, y: player.position.y, dir: miDireccion});	
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

   this.initX=startX
   this.initY=startY

  this.balas = game.add.weapon(1, 'bala'); //numero de balas que pueden haber en pantalla y se carga el sprite
  this.balas.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS; // se indica que muera la bala al salir de la pantalla
  this.balas.bulletSpeed = 600; //velocidad de las balas
  this.balas.fireRate = 100; //velacidad entre cada bala

  this.player = game.add.sprite(x, y, "tanqueR")
  this.player.angle=direccion;
  this.player.anchor.set(0.5);

  this.player.name = index.toString()
  this.balas.bullets.name = index.toString()
  juego.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.player.body.immovable = true
  this.player.body.collideWorldBounds = true

  this.balas.trackSprite(this.player, 0, 0, true);

  this.lastPosition = { x: x, y: y }

}


RemotePlayer.prototype.disparar = function () {
	sonido_disparo.play();
	this.balas.fire();
}

RemotePlayer.prototype.getInitX=function(){
		return this.initX
	}

RemotePlayer.prototype.getInitY=function(){
		return this.initY
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
