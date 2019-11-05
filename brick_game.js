var game = {};
var playArea = {};
var ball = {};
var mp = {};

var paddleMargin = 50;
var mouseCorX;

var brickCol = 0;
var brickRow = 0;
var brickWidth = 0;
var brickHeight = 30;
var brickMargin = 7;

var bricks;

var map;

var mapArr;


var lastTick = 0;
var ballSpeed = 300 /1000;
var paddleSpeed = 400 / 1000;
var controls = {
	player1L: "ArrowLeft",
	player1R: "ArrowRight"
}

var startGame = false;

var keysPressed = {};

function init(){

	initGOs();

	document.addEventListener("keydown", function (keyEvent) {
		keysPressed[keyEvent.key] = true;
	});
	document.addEventListener("keyup", function (keyEvent) {
		keysPressed[keyEvent.key] = false;
	});
	document.addEventListener("mousemove", function() {
		mouseCorX = event.clientX;
		if(!startGame){
			ball.x =  mp.x + (mp.width-ball.width)/2;
		}
	});
	playArea.dom.addEventListener("mousedown", function(event) {
		//alert("You pressed button: " + event.button);
		//Question? BUT, ex) in window 8 left click -> 1, how to fix this problem??
		if(event.button == 0){
			startGameSetting();
		} 
	});
	window.addEventListener("resize", function (event) {
		game.width = window.innerWidth; 
		game.height = window.innerHeight; 
	});


	requestAnimationFrame(loop);
}

function startGameSetting() {
	startGame = true;
	ballSpeed = 300 /1000;
}

function initGOs() {

	map = maps[Math.floor(Math.random() * maps.length)];

	game.x = 0;
	game.y = 0;
	game.dom = document.getElementById("game");
	game.width = game.dom.offsetWidth;
	game.height = game.dom.offsetHeight;

	updateDOMFromGO(game);

	playArea.dom = document.getElementById("playArea");
	playArea.width = playArea.dom.offsetWidth;
	playArea.height = playArea.dom.offsetHeight;
	playArea.x = (game.width-playArea.width)/2;
	playArea.y = (game.height-playArea.height)/2;

	updateDOMFromGO(playArea);

	mp.dom = document.getElementById("myPaddle");
	mp.width = mp.dom.offsetWidth;
	mp.height = mp.dom.offsetHeight;
	mp.x = (playArea.width-mp.width)/2;
	mp.y = playArea.height-paddleMargin;

	updateDOMFromGO(mp);

	ball.dom = document.getElementById("ball");
	ball.width = ball.dom.offsetWidth;
	ball.height = ball.dom.offsetHeight;
	ball.x = mp.x + (mp.width-ball.width)/2;
	ball.y = (mp.y-ball.height);
	ball.direction = {};
	ball.direction.x = 1;
	ball.direction.y = -1;
	ballSpeed = 0;

	updateDOMFromGO(ball);

	createBricks();

}

function createBricks() {

	mapRows = map.split("\n");
	brickRow = mapRows.length;
	brickCol = mapRows[0].length;

	bricks = new Array(brickRow);
	for (var i = 0; i < bricks.length; i++) { 
	    bricks[i] = new Array(brickCol); 
	} 

	brickWidth = (playArea.width - (brickCol+1)*brickMargin)/brickCol;

	//var temp="";
	for(var j=0;j<brickRow;j++){
		for(var i=0;i<brickCol;i++){
  			bricks[j][i] = createBrick(j, i);
  			//temp += mapRows[j][i];
  			updateDOMFromGO(bricks[j][i])
		}
		//temp += "\n";
	}
  	//console.log(temp);

}

function createBrick(y, x) {
	var brick={};
	brick.dom = document.createElement("div");
	brick.dom.classList.add("brick");
	brick.width = brickWidth;
	brick.height = brickHeight;
	//i, j: col, row index
	// brick.i = x;	
	// brick.j = y;
	//x, y: location
  	brick.x = x*(brickWidth+brickMargin)+brickMargin;
  	brick.y = y*(brickHeight+brickMargin)+brickMargin;
	if(mapRows[y][x] == "0"){
  		brick.hit = 0;
	}else{
  		brick.hit = Math.floor(Math.random() * 3 + 1); //1,2,3
	}
	changeColor(brick);
  	brick.itemNum = Math.floor(Math.random() * 1);	//0,1,2,3,4
  	playArea.dom.appendChild(brick.dom);

  	return brick;
}


function updateDOMFromGO(go) {	//go: gameobject

	go.dom.style.width = go.width + "px";
	go.dom.style.height = go.height + "px";
	go.dom.style.top = go.y + "px";
	go.dom.style.left = go.x + "px";
	
}


function loop(ts) {
	var delta = ts - lastTick;
	//console.log(delta);
	handleInput(delta);
	updateGame(delta);

	lastTick = ts;
	requestAnimationFrame(loop);

}

function handleInput(dt) {
	if(keysPressed[controls.player1L]){
		mp.x -= dt*paddleSpeed;
	}
	if(keysPressed[controls.player1R]){
		mp.x += dt*paddleSpeed;	
	}

	if(mp.x < 0){
		mp.x = 0;
	}
	if(mp.x > playArea.width - mp.width){
		mp.x = playArea.width - mp.width;
	}

	updateDOMFromGO(mp);

}

function updateGame(delta) {
	ball.x += delta*ballSpeed*ball.direction.x;
	ball.y += delta*ballSpeed*ball.direction.y;
	if (ball.x < 0){
		ball.x = 0;
		ball.direction.x *= -1;
	}
	if(ball.x > playArea.width - ball.width){
		ball.x = playArea.width - ball.width;
		ball.direction.x *= -1;
	}
	if (ball.y < 0){
		ball.y = 0;
		ball.direction.y *= -1;
	}
	if(ball.y > playArea.height - ball.height){
		ball.y = playArea.height - ball.height;
		ball.direction.y *= -1;
	}
	
	//paddle move
	mp.x = mouseCorX - mp.width/2;

	//when hit the paddle
	var mpcol = aabbCollision(ball, mp);
	if(mpcol){
		decideBallDir();
	}
	updateDOMFromGO(ball);

	//when hit the brick
	var bcol;
	for(var i=0;i<brickCol;i++){
		for(var j=0;j<brickRow;j++){
			bcol = aabbCollision(ball, bricks[j][i]);
			if(bcol && bricks[j][i].hit > 0){
				hitBrick(j,i);
			}
		}
	}

}

function hitBrick(j,i) {
	ball.direction.y *= -1;

	bricks[j][i].hit--;

	updateDOMFromGO(ball);
	changeColor(bricks[j][i]);
}

function aabbCollision(go1, go2) {
	
	if(go1.x+go1.width>go2.x && go1.x<go2.x+go2.width 
		&& go1.y+go1.height>go2.y && go1.y<go2.y+go2.height){
		return true;
	}
	
	return false;
}

function decideBallDir(argument) {
	//Question? 각도 조절 못함..
	ballCenter = ball.x + ball.width/2;
	paddleCenter = mp.x + mp.width/2;
	if(ballCenter < paddleCenter && ball.direction.x == 1){
		ball.direction.x *= -1;
	}else if(ballCenter > paddleCenter && ball.direction.x == -1){
		ball.direction.x *= -1;
	}else{

	}
	ball.direction.y *= -1;
}

function changeColor(brick) {

	switch(brick.hit){
		case 0:
		brick.dom.style.display = "none";
		break;
		case 1:
		brick.dom.style.background = "RGB(0,0,80)";
		break;
		case 2:
		brick.dom.style.background = "RGB(0,0,170)";
		break;
		case 3:
		brick.dom.style.background = "RGB(0,0,255)";
		break;
	}
}