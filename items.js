//0: short paddle, 1: long paddle, 2: increase speed, 3: reverse dir, 4: blind, 5: upsidedown
var itemImg = ["img/minus.png","https://img.icons8.com/cotton/64/000000/plus--v1.png","img/speedup.png", "img/skeleton.png", "img/torch.png", "img/upsidedown.png"];
//Item 0
function shortPaddle(minLen) {
	console.log("shortPaddle");
	addScore(50);

	if(minLen <= mp.with*0){
		return;
	}

	var beforePWidth = mp.width;
	var id = setInterval(frame, 5);
	function frame() {
		if (mp.width <= minLen) {
			clearInterval(id);
		} else {
			mp.width--; 
			updateDOMFromGO(mp);
		}
	}
	return beforePWidth;
}

//Item 1
function longPaddle(maxLen) {
	console.log("longPaddle");

	if(maxLen >= mp.with*2){
		return;
	}

	var beforePWidth = mp.width;
	var id = setInterval(frame, 5);
	function frame() {
		if (mp.width >= maxLen) {
			clearInterval(id);
		} else {
			mp.width++; 
			updateDOMFromGO(mp);
		}
	}
	return beforePWidth;
}

//Item 2
function increaseSpeed() {
	console.log("increaseSpeed");
	addScore(50);

	if(!itemSet[2]){
		itemSet[2] = true;
		var beforeBallSpeed = ballSpeed;
		ballSpeed = ballSpeed*2;
		setTimeout(function(){ ballSpeed = beforeBallSpeed; itemSet[2] = false; }, itemLastSec);
	}
	
}

//Item 3
function reverseDir() {
	console.log("reverseDir");
	addScore(70);

	if(!itemSet[3]){
		itemSet[3] = true;
		setTimeout(function(){ itemSet[3] = false; }, 6000);
	}
}

//Item 4
function blind() {
	addScore(150);

	if(!itemSet[4]){
		itemSet[4] = true;
		setTimeout(function(){ 
			itemSet[4] = false;
			document.getElementsByTagName("html")[0].id = "";	//remove the blind mode
		}, 6000);
	}
}

function updateLight(e) {
	//var x = e.clientX || e.touches[0].clientX;	//when the reverseDir work->it couldn't be work
	var y = e.clientY || e.touches[0].clientY;

	document.getElementsByTagName("html")[0].id = "light";	//question?

	document.documentElement.style.setProperty('--cusorX', mouseCorX + 'px');
	document.documentElement.style.setProperty('--cusorY', y + 'px');
}

//Item 5
function upsidedown() {
	addScore(100);

	if(!itemSet[5]){
		itemSet[5] = true;
		//move brick
		var ogBrickYs;
		ogBrickYs = new Array(brickRow);
		for (var i = 0; i < ogBrickYs.length; i++) { 
		    ogBrickYs[i] = new Array(brickCol); 
		} 
		for(var i=0;i<brickCol;i++){
			for(var j=0;j<brickRow;j++){
				ogBrickYs[j][i] = bricks[j][i].y;

				bricks[j][i].y *= -1;
				bricks[j][i].y += playArea.height - bricks[j][i].height;
				updateDOMFromGO(bricks[j][i]);
			}
		}
		//move paddle
		var ogPaddleY = mp.y;
		mp.y *= -1;
		mp.y += playArea.height - mp.height;
		updateDOMFromGO(mp);

		setTimeout(function(){ 
			for(var i=0;i<brickCol;i++){
				for(var j=0;j<brickRow;j++){
					bricks[j][i].y = ogBrickYs[j][i];
					updateDOMFromGO(bricks[j][i]);
				}
			}
			mp.y = ogPaddleY;
			updateDOMFromGO(mp);
			itemSet[5] = false;

		}, itemLastSec);

	}
}

function itemDrop(go) {
	// var exitItem = Math.random();
	// if(exitItem > itemRate){	//No Item
	// 	return;
	// }

	var index = -1;
	for (var i = 0; i < iMaxNum; i++) {
		if(currentItems[i] == undefined){
			index = i;
			break;
		}
	}

	if(index == -1) return; //currentItems is full

	var item = {};
	item.dom = document.createElement("div");
	item.dom.classList.add("item");
	item.width = itemSize;
	item.height = itemSize;
	item.x = go.x + go.width/2 - item.width/2;
	item.y = go.y + go.height;
	item.num = Math.floor(Math.random() * itemCount);
	item.dom.style.backgroundImage  = "url('"+itemImg[item.num]+"')";
  	playArea.dom.appendChild(item.dom);
  	currentItems[index] = item;
	updateDOMFromGO(item);

	var id = setInterval(frame, 5);
	function frame() {
		if (playArea.height < item.y) {
			item.dom.style.display = "none";
			clearInterval(id);
		} else {
			//upsidedown
			if(itemSet[5]){
				item.y--;
			}else{
				item.y++;
			}
			updateDOMFromGO(item);
		}
	}
}


function eatItem(citem) {
	citem.dom.style.display = "none";
	// citem.num=4;
	switch(citem.num){
		case 0:
		var beforePWidth = shortPaddle(mp.width*0.5);
		setTimeout(function(){ longPaddle(beforePWidth); }, itemLastSec);
		break;

		case 1:
		var beforePWidth = longPaddle(mp.width*1.5);
		setTimeout(function(){ shortPaddle(beforePWidth); }, itemLastSec);
		break;

		case 2:
		increaseSpeed();
		break;

		case 3:
		reverseDir();
		break;

		case 4:
		blind();
		break;

		case 5:
		upsidedown();
		break;
	}
}
