(function(){
	var game = $("#game"),
		ctx = game[0].getContext("2d");
		unlocked = false,
		canChangeDir = true,
		played = false,
		hsln = Math.round(Math.random() * 360),
		speed = 75,
		difficulty = 0;
	
	var logo = new Image();
	logo.onload = function(){
		ctx.drawImage(logo, game.width() / 2 - logo.width / 2, 50);
	}
	logo.src = "images/logo.jpg";
	
	var playGame = {
		width: 175,
		height: 40,
		bgColor: "red",
		text: "Start Game",
		fontColor: "white"
	}
	playGame.x = game.width() / 2 - playGame.width / 2, playGame.y = game.height() / 2 - playGame.height / 2;
	ctx.fillStyle = playGame.bgColor;
	ctx.fillRect(playGame.x, playGame.y, playGame.width, playGame.height);
	
	ctx.fillStyle = playGame.fontColor;
	ctx.font = "35px Georgia";
	ctx.fillText(playGame.text, playGame.x, playGame.y + playGame.height / 1.25);
	
	var slithersPerSecond = 1000 / speed;
	$("#sideBar").html("Highscore: " + localStorage.highscore + "<br />Score: 0<br />Length: 2<br />Speed: " + slithersPerSecond.toFixed(2) + " SPS<br />Difficulty: " + difficulty);
	
	game.click(function(e){
		var x = e.offsetX, y = e.offsetY;
		if(x > playGame.x && y > playGame.y && x < playGame.x + playGame.width && y < playGame.y + playGame.height && !unlocked){
			startGame();
		}
	});
	
	var tiles = [], score = 0, snake = [], snakeTiles = [], appleArr = [], walls = false, wallCount = 0;
	
	function setTile(x, y, id){
		this.id = id;
		this.x = x;
		this.y = y;
		if(x == 0 || x == 575 || y == 0 || y == 575){
			this.type = "edge";
		}else{
			this.type = "space";
		}
		this.color = "white";
		tiles.push(this);
	}
	
	function setGrid(){
		var coX = 0, coY = 0, id = 0;
		for(var i = 0; i < 24; i++){
			for(var x = 0; x < 24; x++){
				var coX = 25 * x;
				var coY = 25 * i;
				new setTile(coX, coY, id);
				id++;
			}
		}
	}
	
	function createElements(){
		var color = "hsl(" + hsln + ", 100%, " + Math.round(Math.random() * 100) + "%)";;
		snake.push({type: "head", color: color, id: 275, x: tiles[275].x, y: tiles[275].y, direction: [{dir: "down", till: ""}]});
		var color = "hsl(" + hsln + ", 100%, " + Math.round(Math.random() * 100) + "%)";
		snake.push({type: "tail", color: color, id: 251, x: tiles[251].x, y: tiles[251].y, direction:[{dir: "down", till: ""}]});
		var color = "hsl(" + hsln + ", 100%, " + Math.round(Math.random() * 100) + "%)";
		snake.push({type: "tail", color: color, id: 227, x: tiles[227].x, y: tiles[227].y, direction: [{dir: "down", till: ""}]});
		getApple(Math.ceil(Math.random() * 575));
		startClock();
	}

	function getApple(apple, spec){
		if(appleArr.length == 0){
			if(tiles[apple].type !== "space"){
				getApple(Math.ceil(Math.random() * 575));
			}else{
				if(snakeTiles.indexOf(apple) > -1){
					getApple(Math.ceil(Math.random() * 575));
				}else{
					var rng = Math.random();
					if(rng <= .005){
						var appleObj = {
							id: apple,
							type: "gold"
						}
						appleArr = [appleObj];
					}else if(rng <= .01){
						var appleObj = {
							id: apple,
							type: "slow"
						}
						appleArr = [appleObj];
					}else{
						var appleObj = {
							id: apple,
							type: "apple"
						}
						appleArr = [appleObj];
					}
				}
			}
		}
	}
	
	function startClock(){
		clockStart = setInterval(function(){
			snakeTiles = [];
			for(var i = 0; i < snake.length; i++){
				if(snake[i].direction[0].dir == "down"){
					if(snake[i].y + 25 > 575){
						endGame();
					}else{
						snake[i].y += 25;
						snake[i].id += 24;
						if(snake[i].id == parseInt(snake[i].direction[0].till)){
							snake[i].direction.splice(0, 1);
						}
					}
				}else if(snake[i].direction[0].dir == "left"){
					if(snake[i].x - 25 < 0){
						endGame();
					}else{
						snake[i].x -= 25;
						snake[i].id -= 1;
						if(snake[i].id == parseInt(snake[i].direction[0].till)){
							snake[i].direction.splice(0, 1);
						}
					}
				}else if(snake[i].direction[0].dir == "up"){
					if(snake[i].y - 25 < 0){
						endGame();
					}else{
						if(tiles[snake[i].id - 24].type == "snake"){
							endGame();
						}else{
							snake[i].y -= 25;
							snake[i].id -= 24;
							if(snake[i].id == parseInt(snake[i].direction[0].till)){
								snake[i].direction.splice(0, 1);
							}
						}
					}
				}else if(snake[i].direction[0].dir == "right"){
					if(snake[i].x + 25 > 575){
						endGame();
					}else{
						snake[i].x += 25;
						snake[i].id += 1;
						if(snake[i].id == parseInt(snake[i].direction[0].till)){
							snake[i].direction.splice(0, 1);
						}
				}
				}
				snakeTiles.push(snake[i].id);
			}
			checkCollision();
			canChangeDir = true;
		}, speed);
	}
	
	if(!localStorage.highscore){
		localStorage.highscore = 0;	
	}
	
	function checkCollision(){
		for(var i = 1; i < snake.length; i++){
			if(snake[i].id == snake[0].id){
				endGame();
			}
		}
		for(var i = 0; i < tiles.length; i++){
			var appleEaten = false;
			if(appleArr[0].id == snake[0].id){
				score++;
				var highscore = localStorage.highscore;
				if(appleArr[0].type == "slow"){
					speed = 100;
					clearInterval(clockStart);
					startClock();
					slowTimer = setTimeout(function(){
						speed = 75;
						clearInterval(clockStart);
						startClock();
					}, 20 * 1000);
				}else if(appleArr[0].type == "gold"){
					score += 4;
				}
				if(score > parseInt(highscore)){
					highscore = score;
					localStorage.highscore = highscore;	
				}
				if(score > 30 && !walls){
					difficulty++;
					getWall(Math.ceil(Math.random() * 575), difficulty);
					walls = true;
				}
				if(score == 50 || score == 60){
					deleteWalls();
					difficulty++;
					getWall(Math.ceil(Math.random() * 575), difficulty);
				}
				if(walls){
					wallCount++;
					if(wallCount >= 5){
						wallCount = 0;
						deleteWalls();
						getWall(Math.ceil(Math.random() * 575), difficulty);
					}
				}
				updateScore(score);
				addTail();
				appleEaten = true;
			}else if(tiles[i].id == snake[0].id && tiles[i].type == "wall"){
				endGame();
			}
			if(appleEaten){
				appleArr = [];
				appleCount = 0;
				getApple(Math.ceil(Math.random() * 575));
			}
		}
	}
	
	function increaseDifficulty(x){
		getWall(Math.ceil(Math.random() * 575), x);
	}
	
	function getWall(wall, x){
		if(tiles[wall].type !== "space"){
			getWall(Math.ceil(Math.random() * 575), x);
		}else{
			if(snakeTiles.indexOf(wall) > -1){
				getWall(Math.ceil(Math.random() * 575), x);
			}else{
				makeWall(wall);
				x--;
				if(x > 0){
					getWall(Math.ceil(Math.random() * 575), x);
				}
			}
		}
		function makeWall(wall){
			tiles[wall].type = "wall";
			tiles[wall].color = "gray";	
		}
	}
	
	function deleteWalls(){
		for(var i = 0; i < tiles.length; i++){
			if(tiles[i].type == "wall"){
				tiles[i].type = "space";
				tiles[i].color = "white";	
			}
		}
	}
	
	function addTail(){
		var x = snake[snake.length - 1];
		var direct = x.direction;
		var color = "hsl(" + hsln + ", 100%, " + Math.round(Math.random() * 100) + "%)";
		if(direct[0].dir == "down"){
			var z = x.id - 24;
			snake.push({type: "tail", color: color, id: z, x: tiles[z].x, y: tiles[z].y, direction: [{dir: "down", till: ""}]});
		}else if(direct[0].dir == "left"){
			var z = x.id + 1;
			snake.push({type: "tail", color: color, id: z, x: tiles[z].x, y: tiles[z].y, direction: [{dir: "left", till: ""}]});
		}else if(direct[0].dir == "up"){
			var z = x.id + 24;
			snake.push({type: "tail", color: color, id: z, x: tiles[z].x, y: tiles[z].y, direction: [{dir: "up", till: ""}]});
		}else if(direct[0].dir == "right"){
			var z = x.id - 1;
			snake.push({type: "tail", color: color, id: z, x: tiles[z].x, y: tiles[z].y, direction: [{dir: "right", till: ""}]});
		}
		snake[snake.length - 1].direction.splice(0, 1);
		for(var i = 0; i < snake[snake.length - 2].direction.length; i++){
			snake[snake.length - 1].direction.push(snake[snake.length - 2].direction[i]);
		}
	}
	
	function updateScore(x){
		var slithersPerSecond = 1000 / speed;
		$("#sideBar").html("Highscore: " + localStorage.highscore + "<br />Score: " + x + "<br />Length: " + snake.length + "<br />Speed: " + slithersPerSecond.toFixed(2) + " SPS<br />Difficulty: " + difficulty);
	}
	
	function endGame(){
		for(var i = 0; i < 99999; i++) window.clearInterval(i);
		ctx.clearRect(0, 0, 600, 600);
		unlocked = false;
		ctx.fillStyle = "red";
		ctx.font = "35px Georgia";
		ctx.fillText("Game Over", 212, 275);
		$("#playAgain").css("display", "block");
	}
	
	$("#playAgain").click(function(){
		playAgain();
	});
	
	function playAgain(){
		hsln = Math.round(Math.random() * 360),
		unlocked = true;
		score = 0, snake = [], tiles = [], appleCount = 0, walls = false, wallCount = 0, difficulty = 0, speed = 75;
		slowTimer = 0;
		clearInterval(clockStart);
		var slithersPerSecond = 1000 / speed;
		$("#sideBar").html("Highscore: " + localStorage.highscore + "<br />Score: " + score + "<br />Length: 2<br />Speed: " + slithersPerSecond.toFixed(2) + " SPS<br />Difficulty: " + difficulty);
		setGrid();
		render();
		$("#playAgain").hide();
	}
	
	$(document).keydown(function(e){
		if(e.keyCode == 13){
			if(!unlocked){
				if(!played){
					startGame();
				}else{
					playAgain();
				}
			}
		}
		if(canChangeDir){
			var down = [40, 83], left = [37, 65], up = [38, 87], right = [39, 68];
			if(down.indexOf(e.keyCode) > -1 && snake[0].direction[0].dir !== "up"){
				//Down
				setTillTile();
				for(var i = 0; i < snake.length; i++){
					snake[i].direction.push({dir: "down", till: ""});
					canChangeDir = false;
				}
				snake[0].direction.splice(0, 1);
			}else if(left.indexOf(e.keyCode) > -1 && snake[0].direction[0].dir !== "right"){
				//Left
				setTillTile();
				for(var i = 0; i < snake.length; i++){
					snake[i].direction.push({dir: "left", till: ""});
					canChangeDir = false;
				}
				snake[0].direction.splice(0, 1);
			}else if(up.indexOf(e.keyCode) > -1 && snake[0].direction[0].dir !== "down"){
				//Up
				setTillTile();
				for(var i = 0; i < snake.length; i++){
					snake[i].direction.push({dir: "up", till: ""});
					canChangeDir = false;
				}
				snake[0].direction.splice(0, 1);
			}else if(right.indexOf(e.keyCode) > -1 && snake[0].direction[0].dir !== "left"){
				//Right
				setTillTile();
				for(var i = 0; i < snake.length; i++){
					snake[i].direction.push({dir: "right", till: ""});
					canChangeDir = false;
				}
				snake[0].direction.splice(0, 1);
			}
		}
		function setTillTile(){
			for(var i = 1; i < snake.length; i++){
				for(var x = 0; x < snake[i].direction.length; x++){
					if(snake[i].direction[x].till == ""){
						snake[i].direction[x].till = snake[0].id;
					}
				}
			}	
		}
	});
	
	function startGame(){
		played = true;
		unlocked = true;
		setGrid();
		render();
	}
	
	function render(){
		createElements();
		var normApple = new Image();
		normApple.src = 'images/apple.png';
		var slowApple = new Image();
		slowApple.src = 'images/appleSlow.png';
		var goldApple = new Image();
		goldApple.src = 'images/appleGold.png';
		setInterval(function(){
			ctx.clearRect(0, 0, game.width(), game.height());
			for(var i = 0; i < tiles.length; i++){
				ctx.fillStyle = tiles[i].color;
				ctx.fillRect(tiles[i].x, tiles[i].y, 25, 25);
				if(tiles[i].id == appleArr[0].id){
					if(appleArr[0].type == "apple"){
						ctx.drawImage(normApple, tiles[i].x, tiles[i].y);
					}else if(appleArr[0].type == "slow"){
						ctx.drawImage(slowApple, tiles[i].x, tiles[i].y);
					}else if(appleArr[0].type == "gold"){
						ctx.drawImage(goldApple, tiles[i].x, tiles[i].y);
					}
				}
			}
			for(var i = 0; i < snake.length; i++){
				var sn = snake[i];
				ctx.beginPath();
				ctx.arc(sn.x + 12.5, sn.y + 12.5, 12.5, 0, 2 * Math.PI, false);
				ctx.fillStyle = sn.color;
				ctx.fill();
			}
		}, 1000/50);
	}
})();