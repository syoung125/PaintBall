var statusBar = {};
var game = {};
var playArea = {};
var ball = {};
var mp = {};

var paddleMargin = 50;
var mouseCorX;

var brickCol = 0;
var brickRow = 0;
var brickWidth = 0;
var brickHeight = 40;
var brickMargin = 7;
var bricks;
var totalBlockNum;

var map;

var lastTick = 0;
var ballSpeed;
var paddleSpeed = 400 / 1000;
var controls = {
	player1L: "ArrowLeft",
	player1R: "ArrowRight"
}
var keysPressed = {};

var itemSize;
var itemRate = 0.3;
var itemLastSec = 4000;
var itemCount = 6;
var itemSet;
//0: short paddle, 1: long paddle, 2: increase speed, 3: reverse dir, 4: blind, 5: upsidedown

var iMaxNum = 5;
var currentItems;
//item info : item object = { x, y, num }


var startGame = false;
var lifeNum;
var lifeArr;
var myPaintArr = [ '#ff2626', '#ff8026', '#fff426', '#79ff26', '#26ffdb', '#263fff', '#af26ff', '#ff5cab'];	//total: 7
var ballColor;

var score;

function initGS() {	//init game status
	startGame = false;
	ballSpeed = 0;
	lifeNum = 5;
	score = 0;
	document.getElementById("score").innerHTML = score;
}

function startGameSetting() {
	startGame = true;
	ballSpeed = 300 /1000;
}

function init(){

	initGS();
	initGOs();

	document.addEventListener("keydown", function (keyEvent) {
		keysPressed[keyEvent.key] = true;
	});
	document.addEventListener("keyup", function (keyEvent) {
		keysPressed[keyEvent.key] = false;
	});
	document.addEventListener("mousemove", function(e) {
		if(!startGame){	//before start game, fix ball location
			ball.x =  mp.x + (mp.width-ball.width)/2;
			ball.y = (mp.y-ball.height);
			if(itemSet[5]){
				ball.y = (mp.y+mp.height);
			}

		}

		if(itemSet[3]){
			mouseCorX = playArea.width - event.clientX;
		}else{
			mouseCorX = event.clientX;
		}

		if(itemSet[4]){
			updateLight(e);
		}

	});
	document.addEventListener("mousedown", function(event) {
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

function initGOs() {

	map = maps[Math.floor(Math.random() * maps.length)];

	header.x = 0;
	header.y = 0;
	header.dom = document.getElementById("header");
	header.width = header.dom.offsetWidth;
	header.height = header.dom.offsetHeight;

	updateDOMFromGO(header);

	statusBar.x = 0;
	statusBar.y = header.y + header.height;
	statusBar.dom = document.getElementById("statusBar");
	statusBar.width = statusBar.dom.offsetWidth;
	statusBar.height = statusBar.dom.offsetHeight;

	updateDOMFromGO(statusBar);

	game.x = statusBar.x + statusBar.width;
	game.y = header.y + header.height;
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

	if(brickWidth < brickHeight) itemSize = brickWidth;
	else itemSize = brickHeight;

	
	initItem();
	initStatusBar();
	
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

	var tempCount = 0;
	for(var j=0;j<brickRow;j++){
		for(var i=0;i<brickCol;i++){
  			bricks[j][i] = createBrick(j, i);
  			updateDOMFromGO(bricks[j][i]);
  			if(bricks[j][i].hit != 0) tempCount++;
		}
	}
	totalBlockNum = tempCount;
	console.log('init: ' + totalBlockNum);
}

function createBrick(y, x) {
	var brick={};
	brick.dom = document.createElement("div");
	brick.dom.classList.add("brick");
	brick.width = brickWidth;
	brick.height = brickHeight;
  	brick.x = x*(brickWidth+brickMargin)+brickMargin;
  	brick.y = y*(brickHeight+brickMargin)+brickMargin;
	if(mapRows[y][x] == "0"){
  		brick.hit = 0;
  		brick.dom.style.display = "none";
	}else{
  		// brick.hit = Math.floor(Math.random() * 3 + 1); //1,2,3
  		brick.hit = 1;
	}
	changeColor(brick);
  	brick.itemNum = Math.floor(Math.random() * 1);	//0,1,2,3,4
  	playArea.dom.appendChild(brick.dom);

  	return brick;
}

function initItem() {
	itemSet = new Array(itemCount);
	for(var i=0;i<itemCount;i++){
		itemSet[i] = false; 
	}

	currentItems = new Array(iMaxNum);
}

function initStatusBar() {
	//init Lifes (paint color)  일시정지->space bar
	lifeArr = new Array(lifeNum);
	var colorMargin = playArea.y;
	for (var i = 0; i < lifeNum; i++) {
		var color = {};
		color.dom = document.createElement("div");
		color.dom.classList.add("life");
		color.dom.style.backgroundColor = myPaintArr[i];
		color.width = statusBar.width * 0.6;
		color.height = color.width;
	  	color.x = statusBar.width * 0.2;
	  	color.y = i*(color.height+colorMargin)+colorMargin;
  		statusBar.dom.appendChild(color.dom);
  		lifeArr[i] = color;
  		updateDOMFromGO(color);
	}
	ballColor = myPaintArr[lifeNum-1];
	ball.dom.style.backgroundColor = ballColor;

	//Score
	score = 0;


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
		if(itemSet[5]){
			dead();
		}
		ball.y = 0;
		ball.direction.y *= -1;
	}
	if(ball.y > playArea.height - ball.height){
		if(!itemSet[5]){
			dead();
		}
		ball.y = playArea.height - ball.height;
		ball.direction.y *= -1;
	}

	//paddle move
	mp.x = mouseCorX - mp.width/2 - playArea.x - statusBar.width;

	//when hit the paddle
	var mpcol = aabbCollision(ball, mp);
	decideBallDir(mpcol, ball, mp);
	updateDOMFromGO(ball);

	//when hit the brick
	var bcol;
	for(var i=0;i<brickCol;i++){
		for(var j=0;j<brickRow;j++){
			bcol = aabbCollision(ball, bricks[j][i]);
			if(bcol && bricks[j][i].hit > 0){
				decideBallDir(bcol, ball, bricks[j][i]);
				hitBrick(j,i);
			}
		}
	}

	//when eat the item
	for (var i = 0; i < iMaxNum; i++) {
		if(currentItems[i] != undefined){
			//eat item
			if(aabbCollision(currentItems[i], mp)){
				eatItem(currentItems[i]);
				currentItems[i] = undefined;
			}
			//can't eat item
			else if(currentItems[i].y > playArea.height - ball.height){
				currentItems[i].dom.style.display = "none";
				currentItems[i] = undefined;
			}
		}
	}

}

function addScore(amount) {
	score += amount;
	document.getElementById("score").innerHTML = score;
}

function hitBrick(j,i) {

	bricks[j][i].hit--;
	addScore(10);
	updateDOMFromGO(ball);
	changeColor(bricks[j][i]);


	if(bricks[j][i].hit == 0){
		//end check
		totalBlockNum--;
		console.log("hitblock : "+totalBlockNum);

		if(totalBlockNum == 0){
			gameEnd(1);
			return;
		}

		itemDrop(bricks[j][i]);
	}

}


function changeColor(brick) {
	switch(brick.hit){
		case 0:
		brick.dom.style.border = "none";
		brick.dom.style.background = ballColor;
		break;
		case 1:
		brick.dom.style.background = "#c9c9c9";	//light gray
		break;
		case 2:
		brick.dom.style.background = "#757575";	//gray
		break;
		case 3:
		brick.dom.style.background = "#363636";	//dark gray
		break;
	}
}


function decideBallDir(aabb, go1, go2) {

	if(aabb == 0){
		return false;
	}

	switch(aabb){
		case 1:
		go1.y = go2.y + go2.height;
		ball.direction.y *= -1;
		break;
		case 2:
		go1.x = go2.x - go1.width;
		ball.direction.x *= -1;
		break;
		case 3:
		go1.y = go2.y - go1.height;
		ball.direction.y *= -1;
		break;
		case 4:
		go1.x = go2.x + go2.width;
		ball.direction.x *= -1;
		break;
	}
	return true;
}

/*when the ball hit right side of paddle it goes right, hit left side of paddle it goes left.*/
// function decideBallDir(argument) {
// 	var ballCenter = ball.x + ball.width/2;
// 	var paddleCenter = mp.x + mp.width/2;
// 	if(ballCenter < paddleCenter && ball.direction.x == 1){
// 		ball.direction.x *= -1;
// 	}else if(ballCenter > paddleCenter && ball.direction.x == -1){
// 		ball.direction.x *= -1;
// 	}else{

// 	}
// 	ball.direction.y *= -1;
// }

function aabbCollision(go1, go2) {
	
	var ballTop = {
		x : go1.x + go1.width/2,
		y : go1.y
	};
	var ballRight = {
		x : go1.x + go1.width,
		y : go1.y + go1.height/2
	};
	var ballBottom = {
		x : go1.x + go1.width/2,
		y : go1.y + go1.height
	};
	var ballLeft = {
		x : go1.x,
		y : go1.y + go1.height/2
	};

	var ballArr = [ ballTop, ballRight, ballBottom, ballLeft ];

	for (var i = 0; i < ballArr.length; i++) {
		if(isDotInRange(ballArr[i], go2)){
			return i+1;
		}
	}
	//BALL's 1: top, 2: right, 3: bottom, 4: left, 0: no hit

	return 0;
}

function isDotInRange(go1, go2) {
	if(go1.x>go2.x && go1.x<go2.x+go2.width 
		&& go1.y>go2.y && go1.y<go2.y+go2.height){
		return true;
	}
	return false;
}

function dead(argument) {
	// alert("dead");
	startGame = false;
	ballSpeed = 0;

	lifeNum--;
	if(lifeNum <= 0){
		gameEnd(0);
		return;
	}
	lifeArr[lifeNum].dom.style.display = "none";
	ballColor = lifeArr[lifeNum-1].dom.style.backgroundColor;
	ball.dom.style.backgroundColor = ballColor;

	
}

function gameEnd(num) {
	//num - 1: wind, 0: lose
	console.log("GameEnd: "+num);
	if(num == 1){
		alert('WIN');
	}else if(num == 0){
		alert('Lose');
	}

	//remove previous bricks
	for(var j=0;j<brickRow;j++){
		for(var i=0;i<brickCol;i++){
			bricks[j][i].dom.parentNode.removeChild(bricks[j][i].dom);
		}
	}

	//init game
	initGS();
	initGOs();

}