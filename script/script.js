// useful to have them as global variables
var canvas, ctx, w, h; 
var mousePos;

// an empty array!
var balls = []; 
var initialNumberOfBalls;
var globalSpeedMutiplier = 1;
var colorToEat = 'red';
var wrongBallsEaten = goodBallsEaten = 0;
var numberOfGoodBalls;
var gameLevel;
var newNumber;
var finalScore;

// SOUNDS
let ballEatenSound;

var player = {
  x:10,
  y:10,
  width:20,
  height:20,
  color:'red',

  movePlayerWithMouse: function() 
  {
    if(mousePos !== undefined) {
      this.x = mousePos.x;
      this.y = mousePos.y;
    }
  },

  drawFilledRectangle: function(ctx) 
  {
    // GOOD practice: save the context, use 2D trasnformations
    ctx.save();
  
    // translate the coordinate system, draw relative to it
    ctx.translate(this.x, this.y);
  
    ctx.fillStyle = this.color;
    // (0, 0) is the top left corner of the monster.
    ctx.fillRect(0, 0, this.width, this.height);

    // eyes, x=20, y=20 is relative to the top left corner
    // of the previous rectangle
    ctx.fillStyle = 'green';
    ctx.fillRect(5, 5, 0.10 * this.width, 0.10 * this.height);
    ctx.fillRect(15, 5, 0.10 * this.width, 0.10 * this.height);
  
    // nose
    ctx.fillStyle = 'purple';
    ctx.strokeRect(10, 8, 0.10 * this.width, 0.40 * this.height);
    
    // mouth
    ctx.strokeRect(8, 16, 0.30 * this.width, 0.10 * this.height);

    // teeth
    ctx.fillStyle = 'white';
    ctx.fillRect(9, 16, 0.10 * this.width, 0.10 * this.height);
    ctx.fillRect(9, 16, 0.10 * this.width, 0.10 * this.height);
    
    //GOOD practice: restore the context
    ctx.restore();
  }
}

window.onload = function init() {
    // called AFTER the page has been loaded
    canvas = document.querySelector("#myCanvas");

    // Start playing the background music as soon as the page has loaded
    playBackgroundMusic();
  
    // often useful
    w = canvas.width; 
    h = canvas.height;  
  
    // important, we will draw with this object
    ctx = canvas.getContext('2d');
  
    gameLevel = 0;
    // start game with 10 balls, balls to eat = red balls
    startGame(10);
  
    // add a mousemove event listener to the canvas
    canvas.addEventListener('mousemove', mouseMoved);

    // Load the sound and start the game only when the sound has been loaded
    ballEatenSound = new Howl({
                urls: ['https://mainline.i3s.unice.fr/mooc/SkywardBound/assets/sounds/plop.mp3'],
                onload: function () {
                  // start the animation
                    mainLoop();
                }
            });
};

function playBackgroundMusic() {
   let audioPlayer = document.querySelector("#audioPlayer");
   audioPlayer.play();
}

function pausebackgroundMusic() {
   let audioPlayer = document.querySelector("#audioPlayer");
   audioPlayer.pause();  
}

function startGame(nb) {
  do {
    balls = createBalls(nb);
    initialNumberOfBalls = nb;
    numberOfGoodBalls = countNumberOfGoodBalls(balls, colorToEat);
  } while(numberOfGoodBalls === 0);
  
  wrongBallsEaten = goodBallsEaten = 0;
}

function countNumberOfGoodBalls(balls, colorToEat) {
  var nb = 0;
  
  balls.forEach(function(b) {
    if(b.color === colorToEat)
      nb++;
  });
  
  return nb;
}

function changeNbBalls(nb) {
  startGame(nb);
}

function changeColorToEat(color) {
  colorToEat = color;
}

function changePlayerColor(color) {
  player.color = color;
}

function changeBallSpeed(coef) {
    globalSpeedMutiplier = coef;
}

function mouseMoved(evt) {
    mousePos = getMousePos(canvas, evt);
}

function getMousePos(canvas, evt) {
    // necessary work in the canvas coordinate system
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function mainLoop() {
  if(gameLevel <= 4){
  ctx.clearRect(0, 0, w, h);
  
  // draw the ball and the player
  player.drawFilledRectangle(ctx);
  drawAllBalls(balls);
  drawBallNumbers(balls);

  // animate the ball that is bouncing all over the walls
  moveAllBalls(balls);
  
  player.movePlayerWithMouse();
  
  // ask for a new animation frame
  requestAnimationFrame(mainLoop);
  }
}

// Collisions between rectangle and circle
function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
   var testX=cx;
   var testY=cy;
   if (testX < x0) testX=x0;
   if (testX > (x0+w0)) testX=(x0+w0);
   if (testY < y0) testY=y0;
   if (testY > (y0+h0)) testY=(y0+h0);
   return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))< r*r);
}


class Ball 
{
    constructor(x, y, radius, color, speedX, speedY) {
        this.x = x;            // properties
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    drawFilledCircle(ctx)
    {
      // GOOD practice: save the context, use 2D trasnformations
      ctx.save();

      // translate the coordinate system, draw relative to it
      ctx.translate(this.x, this.y);

      ctx.fillStyle = this.color;
      // (0, 0) is the top left corner of the monster.
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
      ctx.fill();

      // GOOD practice: restore the context
      ctx.restore();
    }

    move() 
    {
      this.x += (this.speedX + globalSpeedMutiplier);
      this.y += (this.speedY + globalSpeedMutiplier);
    }
}

function createBalls(n) {
  // empty array
  var ballArray = [];
  
  // create n balls
  for(var i=0; i < n; i++) {

      // Create ball with values...
      let x = w/2;
      let y = h/2;
      let radius = 10 + 25 * Math.random(); // between 10 and 35
      let speedX = -2.5 + 5 * Math.random(); // between -2.5 and +2.5
      let speedY = -2.5 + 5 * Math.random(); // between -2.5 and +2.5
      let color = getARandomColor();

      // Create the new ball b
      let b = new Ball(x, y, radius, color, speedX, speedY);
     // add ball b to the array
     ballArray.push(b);
    }
  // returns the array full of randomly created balls
  return ballArray;
}

function getARandomColor() {
  var colors = ['red', 'blue', 'cyan', 'purple', 'pink', 'green', 'yellow'];
  // a value between 0 and color.length-1
  // Math.round = rounded value
  // Math.random() a value between 0 and 1
  var colorIndex = Math.round((colors.length-1)*Math.random()); 
  var c = colors[colorIndex];
  
  // return the random color
  return c;
}

function drawBallNumbers(balls) { 
  ctx.save();
  ctx.font="20px Arial";
  
  if(gameLevel <= 4){
      if(balls.length === 0) {
        ctx.fillText("Game Over!", 20, 30);
        ctx.fillText("Press the spacebar to reset.", 20, 50);
        //start listening for a keypress
        window.addEventListener('keypress', spaceBarPress);
      } else if(goodBallsEaten === numberOfGoodBalls) {
        ctx.fillText("You Win! Final score : " + (initialNumberOfBalls - wrongBallsEaten), 
                     20, 30);
        //go to the next level if this one is finished
        gameLevel++;
        changeLevel();
      } else {
        //display the current level
        ctx.fillText("Level " + (gameLevel+1), 210, 30);
        ctx.fillText("Balls still alive: " + balls.length, 210, 50);
        ctx.fillText("Good Balls eaten: " + goodBallsEaten, 210, 70);
        ctx.fillText("Wrong Balls eaten: " + wrongBallsEaten, 210, 90);
      }
    }
    ctx.restore();
}

function changeLevel(){
    switch(gameLevel){
        case 0:
            startGame(10);
            canvas.addEventListener('mousemove', mouseMoved);
            mainLoop();
            //stop listening for the keypress
            window.removeEventListener('keypress', spaceBarPress);
            break;
        case 1:
            //get the score
            finalScore = (initialNumberOfBalls - wrongBallsEaten);
            newNumber = initialNumberOfBalls++;
            //restart with the updated number of balls
            startGame(newNumber);
            mainLoop();
            break;
        case 2:
            //add to the score
            finalScore += (initialNumberOfBalls - wrongBallsEaten);
            newNumber = initialNumberOfBalls++;
            startGame(newNumber);
            mainLoop();
            break;
        case 3:
            finalScore += (initialNumberOfBalls - wrongBallsEaten);
            newNumber = initialNumberOfBalls++;
            startGame(newNumber);
            mainLoop();
            break;
        case 4:
            finalScore += (initialNumberOfBalls - wrongBallsEaten);
            newNumber = initialNumberOfBalls++;
            startGame(newNumber);
            mainLoop();
            break;
        case 5:
            finalScore += (initialNumberOfBalls - wrongBallsEaten);
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.font="20px Arial";
            //display the final score
            ctx.fillText("You Win! Final score : " + (finalScore), 20, 30);
            ctx.fillText("Press the spacebar to reset.", 20, 50);
            ctx.restore();
            //start listening for  a keypress
            window.addEventListener('keypress', spaceBarPress);
            
            break;
            
    }
}

//restart the whole game if space is pressed
function spaceBarPress(evt){
        if(evt.keyCode == 32){
            gameLevel = 0;
            changeLevel();
        }
    
}

function drawAllBalls(ballArray) {
    ballArray.forEach(function(b) {
      b.drawFilledCircle(ctx);
    });
}

function moveAllBalls(ballArray) {
  // iterate on all balls in array
  balls.forEach(function(b, index) {
      // b is the current ball in the array
      b.move();
  
      testCollisionBallWithWalls(b); 
    
      testCollisionWithPlayer(b, index);
  });
}

function testCollisionWithPlayer(b, index) {
  if(circRectsOverlap(player.x, player.y,
                     player.width, player.height,
                     b.x, b.y, b.radius)) {

    // PLAY A PLOP SOUND!
    ballEatenSound.play();
    // we remove the element located at index
    // from the balls array
    // splice: first parameter = starting index
    //         second parameter = number of elements to remove
    if(b.color === colorToEat) {
      // Yes, we remove it and increment the score
      goodBallsEaten += 1;
    } else {
      wrongBallsEaten += 1;
    }
    
    balls.splice(index, 1);

  }
}

function testCollisionBallWithWalls(b) {
    // COLLISION WITH VERTICAL WALLS ?
    if((b.x + b.radius) > w) {
    // the ball hit the right wall
    // change horizontal direction
    b.speedX = -b.speedX;
    
    // put the ball at the collision point
    b.x = w - b.radius;
  } else if((b.x -b.radius) < 0) {
    // the ball hit the left wall
    // change horizontal direction
    b.speedX = -b.speedX;
    
    // put the ball at the collision point
    b.x = b.radius;
  }
  
  // COLLISIONS WTH HORIZONTAL WALLS ?
  // Not in the else as the ball can touch both
  // vertical and horizontal walls in corners
  if((b.y + b.radius) > h) {
    // the ball hit the right wall
    // change horizontal direction
    b.speedY = -b.speedY;
    
    // put the ball at the collision point
    b.y = h - b.radius;
  } else if((b.y -b.radius) < 0) {
    // the ball hit the left wall
    // change horizontal direction
    b.speedY = -b.speedY;
    
    // put the ball at the collision point
    b.Y = b.radius;
  }  
}