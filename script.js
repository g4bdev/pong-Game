//Global variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var rounds = [5,5,3,3,2];
var colors = ['#1abc9c', '#2ecc71','#3498db', '#8c52ff', '#9b59b6'];

//Ball Object (The square that represents the ball that bounces forth and back)
var Ball = 
{
    new: function (incrementedSpeed) {
        return{
            width: 18,
            height: 18,
            x: (this.canvas.width/2) - 9,
            y: (this.canvas.height/2)-9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 6
        };
    }
};

// AI object (Two lines that move up and down)
var Ai = {
    new: function (side){
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height/2) - 35,
            score : 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};

var Game = {
    initialize: function (){
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.canvas.style.width = (this.canvas.width/2) + 'px';
        this.canvas.style.height = (this.canvas.height/2) + 'px';

        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);

        this.ai.speed= 5;
        this.running= this.over = false;
        this.turn=  this.ai;
        this.timer= this.round = 0;
        this.color= '#8c52ff';

        Pong.menu();
        Pong.listen();
    },

    endGameMenu: function(text){
        //change the background color and font size
        Pong.context.font= '45px Courier New';
        Pong.context.fillStyle = this.color;

        //draw the rectangle behind 'the press anu ket begin'
        Pong.context.fillRect(
            Pong.canvas.width/2 - 350,
            Pong.canvas.height/2 - 48,
            700,
            100
        );

        //change the canvas color
        Pong.context.fillStyle = '#ffffff';

        //draw the end game text: game over and start
        Pong.context.fillText(text,
            Pong.canvas.width/2,
            Pong.canvas.height/2 + 15
        );

        setTimeout(function(){
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },

    menu: function(){
        //draw all the pong objects in the current state
        Pong.draw();

        //cahnge the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        //draw the rectangle behind the 'Press any key to begin'
        this.context.fillRect(
            this.canvas.width/2 - 350,
            this.canvas.height/2 - 48,
            700,
            100
        );

        //change the canvas color
        this.context.fillStyle = '#ffffff';

        //draw the 'press any key to begin'
        this.context.fillText('Press any key to begin <3',
            this.canvas.width/2,
            this.canvas.height/2 + 15
            );
    },

    //update all objects: move the player, ai, ball, increment the score, etc...
    update: function(){
        if (!this.over){
            //if the balls collide with the bound limits - correct the x and y coords.
            if (this.ball.x <=0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            //move player if the player move value was updated by a keyboard event
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

            //on new server (start of each turn) move the ball to the correct side
            //and randomize the direction to add some challenge
            if (Pong._turnDelayIsOver.call(this) && this.turn){
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN] [Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }

            //if the player collides with the bound limits, update the x and y coords
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

            //move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed/1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed/1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

            //handle ai (AI) UP and DOWN movement
            if (this.ai.y > this.ball.y - (this.ai.height/2))
            {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed/1.5;
                else this.ai.y -= this.ai.speed/4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height/2))
            {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed/1.5;
                else this.ai.y += this.ai.speed/4;
            }

            //handle ai (AI) wall collision
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;

            //handle player-ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width){
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y){
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                }
            }

            //handle ai-ball collision
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y){
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                }
            }
        }

        //handle the end of round 
        //check to see if the player won the round
        if (this.player.score === rounds[this.round]){
            //check to see if there are any more rounds/levels left and display the victory screen if there not
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function(){Pong.endGameMenu('Winner winner chicken dinner :D :D :D'); }, 1000);
            } else {
                //if there is another round, reset all the values and increment the round number
                this.color = this._generateRoundColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
            }
        }

        //check to see if the ai/AI has won the round
        else if (this.ai.score === rounds[this.round]){
            this.over = true;
            setTimeout(function(){Pong.endGameMenu('Totally F...so sad for u');}, 1010)
        }
    },

    //draw the objects to the canvas element
    draw: function(){
        //clear canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        //set the fill style ro black
        this.context.fillStyle = this.color;

        //draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        //set the fill style to white (the paddles and ball)
        this.context.fillStyle = '#ffffff';

        //drawn the player back
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );

        //draw th Ai
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height
        );

        //draw the ball
        if (Pong._turnDelayIsOver.call(this)){
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height);
        }
       
        //draw the net (line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7,15]);
        this.context.moveTo((this.canvas.width/2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width/2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        //set the default canvas font and align it to the center
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';

        //draw the players score (left)
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width/2) - 300,
            200
        );

        //draw the paddles score (right)
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width/2) + 300,
            200
        );

        //change the font size for the center score
        this.context.font = '30px Courier New';

        //draw the winning score (center)
        this.context.fillText(
            'Round ' + (Pong.round + 1),
            (this.canvas.width/2),
            35
        );

        //change the font size for the center score value
        this.context.font = '40px Courier';

        //draw the current round number
        this.context.fillText (
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width/2),
            100
        );
    },

    loop: function() {
        Pong.update();
        Pong.draw();

        //if the game is not over, draw the next frame
        if(!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function (){
        document.addEventListener('keydown', function(key){
            //handle the 'press any key' function and start game
            if (Pong.running === false){
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }

            //handle up arrow and w key events
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

            //handle down arrow and s key events
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });

        //stop the player from moving when there are no keys being pressed
        document.addEventListener('keyup', function(key) {Pong.player.move = DIRECTION.IDLE;});    
    },

    //reset the ball location, player turns and set a delay before the round
    _resetTurn: function(victorious, loser){
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victorious.score++;
    },

    //wait for a delay to have passed after each turn
    _turnDelayIsOver: function(){
        return((new Date()).getTime() - this.timer >= 2005);
    },

    //select a random color as the background of each level
    _generateRoundColor: function(){
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};

var Pong = Object.assign({}, Game);
Pong.initialize();
