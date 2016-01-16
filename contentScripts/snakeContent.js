$(document).keydown(function(e){
	if(e.which == "145") {
		if (!document.getElementById("snakeGameDiv"))
			initializeSnakeGame();
	}
});

function initializeSnakeGame() {
	console.log("initializing snake game");
	//Create canvas elements.
	var canvasDiv = document.createElement("div");
	canvasDiv.setAttribute("id", "snakeGameDiv");
	canvasDiv.setAttribute("style", "z-index:99; position:fixed; bottom:25px; left:50%; margin-left:-225px;");
	
	var canvasElement = document.createElement("canvas");
	canvasElement.setAttribute("id", "snakeGameCanvas");
	canvasElement.setAttribute("width", "450");
	canvasElement.setAttribute("height", "450");
	canvasDiv.appendChild(canvasElement);
	
	var closeCanvasDivButton = document.createElement("span");
	closeCanvasDivButton.innerHTML = "Close";
	closeCanvasDivButton.setAttribute("style", "cursor:pointer; position:absolute; top:1px; right:1px; color:#4E76C9;");
	closeCanvasDivButton.addEventListener("click", closeCanvasDiv);
	canvasDiv.appendChild(closeCanvasDivButton);
	
	var scoresDiv = document.createElement("div");
	scoresDiv.setAttribute("width", "100%");
	scoresDiv.setAttribute("style", "position:absolute; background-color:black; color:white; top:450px; left:0px; width:100%; height:15px;");
	
	var playerHighScoreSpan = document.createElement("span");
	playerHighScoreSpan.setAttribute("id", "playerHighScoreSpan");
	playerHighScoreSpan.setAttribute("style", "z-index:100; position:absolute; bottom:0px; left:1px;");
	scoresDiv.appendChild(playerHighScoreSpan);
	
	var recordHighScoreSpan = document.createElement("span");
	recordHighScoreSpan.setAttribute("id", "recordHighScoreSpan");
	recordHighScoreSpan.setAttribute("style", "z-index:100; position:absolute; bottom:0px; right:1px;");
	recordHighScoreSpan.innerHTML = "All-Time High Score: ????";
	scoresDiv.appendChild(recordHighScoreSpan);
	
	canvasDiv.appendChild(scoresDiv);
	
	document.getElementsByTagName("body")[0].appendChild(canvasDiv);
	
	//Set up local variables.
	var canvas = $("#snakeGameCanvas")[0];
	var canvasContext = canvas.getContext("2d");
	var canvasWidth = $("#snakeGameCanvas").width();
	var canvasHeight = $("#snakeGameCanvas").height();
	var cellWidth = 10;
	var moveDirection, selectedDirection;
	var food;
	var score, highScore;
	var paused;
	var snakeArray; //Array of cells to make up the snake
	var updateScreen;
	
	//Keydown listener for controls.
	$(document).keydown(function(e){
		var key = e.which;

		if((key == "37" ||  key == "100") && moveDirection != "right") //Left arrow or numpad 4.
			selectedDirection = "left";
		else if((key == "38" ||  key == "104") && moveDirection != "down") //Up arrow or numpad 8.
			selectedDirection = "up";
		else if((key == "39" ||  key == "102") && moveDirection != "left") //Right arrow or numpad 6.
			selectedDirection = "right";
		else if((key == "40" ||  key == "101") && moveDirection != "up") //Down arrow or numpad 5.
			selectedDirection = "down";
		
		if (paused) { // If the game hasn't yet started: ...
			if (key == "37" || key == "38" || key == "39" || key == "40" || key == "100" || key == "101" || key == "102" || key == "104") {
				$("#snakeInstructionsDiv").remove();
				paused = false;
				startGame();
			}
		}
	});
	
	//Get the player's high score from storage.
	chrome.storage.sync.get({
		snakeHighScore: 0
	}, function (items) {
		highScore = items.snakeHighScore;
		init();
	});
	
	/*

	
	
	
	
	*/
	
	function init()	{
		selectedDirection = "right"; //Set default direction.
		createSnake();
		createFood(); //Now we can see the food particle
		score = 0;
		document.getElementById("playerHighScoreSpan").innerHTML = "Your High Score: " + highScore;
		paused = true;
		
		if (updateScreen)
			clearInterval(updateScreen);
		
		paint();
		
		
		var instructionsDiv = document.createElement("div");
		instructionsDiv.setAttribute("id", "snakeInstructionsDiv");
		instructionsDiv.setAttribute("style", "position:absolute; top:50%; width:100%; color:black; text-align:center;");
		
		var instructionSpan = document.createElement("span");
		instructionSpan.innerHTML = "Help the imgur snake collect server resources!<br>To start the game, press any arrow key or numpad key 4/5/6/8.";
		//instructionSpan.setAttribute("style", "position:absolute; top:50%; left:50%; margin-left:-125px; color:black;");
		instructionsDiv.appendChild(instructionSpan);
		
		document.getElementById("snakeGameDiv").appendChild(instructionsDiv);
	}
	
	function startGame() {
		//Start interval that will repaint every 60ms.
		if (updateScreen) 
			clearInterval(updateScreen);
		updateScreen = setInterval(paint, 60);
	}

	function createSnake()	{
		var length = 5; //Length of the snake
		snakeArray = []; //Empty array to start with
		for(var i = length-1; i>=0; i--) {
			//This will create a horizontal snake starting from the top left
			snakeArray.push({x: i, y:0});
		}
	}

	function createFood() {
		var foodXPosition, foodYPosition;
		do { //Assign x and y coordinates for the food. If they collide with the snake, assign new coordinates. Repeat until there is no collision.
			foodXPosition = Math.round(Math.random()*(canvasWidth-cellWidth)/cellWidth); //0-44
			foodYPosition = Math.round(Math.random()*(canvasHeight-cellWidth)/cellWidth); //0-44
		} while (checkCollision(foodXPosition, foodYPosition, snakeArray));
		
		food = {
			x: foodXPosition,
			y: foodYPosition
		};
	}

	
	function paint()
	{
		moveDirection = selectedDirection;
		
		//To avoid the snake trail we need to paint the BG on every frame
		//Lets paint the canvas now
		canvasContext.fillStyle = "white";
		canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
		canvasContext.strokeStyle = "black";
		canvasContext.strokeRect(0, 0, canvasWidth, canvasHeight);
		
		//Get the next coordinates of the front of the snake.
		var nextXPosition = snakeArray[0].x;
		var nextYPosition = snakeArray[0].y;
		if (moveDirection == "right")
			nextXPosition++;
		else if (moveDirection == "left")
			nextXPosition--;
		else if (moveDirection == "up")
			nextYPosition--;
		else if (moveDirection == "down")
			nextYPosition++;
		
		//Game over if snake goes out of bounds or hits its own body.
		if(nextXPosition == -1 || nextXPosition == canvasWidth/cellWidth || nextYPosition == -1 || nextYPosition == canvasHeight/cellWidth || checkCollision(nextXPosition, nextYPosition, snakeArray)) {
			if (score > highScore) {
				highScore = score;
				chrome.storage.sync.set({
					snakeHighScore: highScore
				}, function () {
					//in the future send stats
				});
			}
			
			init();
			return;
		}
		
		//Handle food eating.
		if(nextXPosition == food.x && nextYPosition == food.y) { //If the new position of the snake's head matches the position of the food: ...
			var tail = {x: nextXPosition, y: nextYPosition};
			score++;
			//Create new food
			createFood();
		}
		else {
			var tail = snakeArray.pop(); //pops out the last cell
			tail.x = nextXPosition; tail.y = nextYPosition;
		}
		
		snakeArray.unshift(tail); //Put back the tail as the first cell.
		
		//Paint the snake.
		for(var i = 0; i < snakeArray.length; i++) {
			var c = snakeArray[i];
			paintCell(c.x, c.y, "green");
		}
		//Paint the food.
		paintCell(food.x, food.y, "blue");
		//Paint the score.
		var score_text = "Score: " + score;
		canvasContext.fillText(score_text, 5, canvasHeight-5);
	}

	function paintCell(x, y, cellColor) {
		canvasContext.fillStyle = cellColor;//"blue";
		canvasContext.fillRect(x*cellWidth, y*cellWidth, cellWidth, cellWidth);
		canvasContext.strokeStyle = "white";
		canvasContext.strokeRect(x*cellWidth, y*cellWidth, cellWidth, cellWidth);
	}

	function checkCollision(x, y, array) {
		//This function will check if the provided x/y coordinates exist
		//in an array of cells or not
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
	
	function closeCanvasDiv() {
		console.log("Closing");
		var parentDiv = this.parentNode;
		$(parentDiv).remove();
	}
}