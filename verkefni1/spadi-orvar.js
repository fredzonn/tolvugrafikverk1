/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á lyklaborðsatburðum til að hreyfa spaða
//
//    Hjálmtýr Hafsteinsson, janúar 2019
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var locPosition;
var locColor;

var bufferIdA;
var bufferIdB;
var bufferIdC;
var bufferIdD;

var colorA = vec4(1.0, 0.0, 0.0, 1.0);
var colorB = colorA
var colorC = vec4(0.0, 1.0, 0.0, 1.0);
var colorD = vec4(0.0, 1.0, 0.0, 1.0);

var xmove = 0.009;
var xVel = 0.004;
var yVel = 0.006;
var speed = 0;
var score = 0;

var rightKey = true;
var leftKey = true;

var down = false;
var up = false;
var left = false;
var right = false;
var flag = false;
var timer = true;

window.onload = function init() {
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //Entity coords
    var verticesA = [vec2( -0.1, -0.9 ), vec2( -0.1, -0.86 ), vec2(  0.1, -0.86 ), vec2(  0.1, -0.9 ) ];
    var verticesB = [vec2( -0.1, 0.9 ), vec2( -0.1, 0.86 ), vec2(  0.1, 0.86 ), vec2(  0.1, 0.9 ) ];
    var verticesC = [vec2( 0.0, 0.0 ), vec2( 0.0, -0.04 ), vec2(  0.03, -0.04 ), vec2(  0.03, 0.0 ) ];
    var verticesD = [vec2( 0.0, 0.0 ), vec2( 0.0, -0.16 ), vec2(  0.12, -0.16 ), vec2(  0.12, 0.0 ) ];

    randomBall();
    randomPebble();
   
    //Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    function buffer(){

        // Define two VBOs and load the data into the GPU
        bufferIdA = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdA );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesA), gl.DYNAMIC_DRAW );
    
        bufferIdB = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdB );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesB), gl.DYNAMIC_DRAW );
    
        bufferIdC = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdC );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesC), gl.DYNAMIC_DRAW );

        bufferIdD = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdD );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesD), gl.DYNAMIC_DRAW );
    }
    
    buffer();

    // Get location of shader variable vPosition
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    
    locColor = gl.getUniformLocation( program, "rcolor" );
    
    render();

    randomDir();

    // Event listener for keyboard
    window.addEventListener("keyup", function(e){
        switch( e.keyCode ) {
            case 37:	// left arrow
                leftKey = false;
                break;
            case 39:	// right arrow
                rightKey = false;
                break;    
        }
    } );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// left arrow
                leftKey = true;
                rightKey = false;
                break;
            case 39:	// right arrow
                rightKey = true;
                leftKey = false;
                break;    
        }
    } );

    function speed(){
        xVel *= 2;
        yVel *= 2;
        xmove *= 2;
    }

    //Randomize the ball's starting position on the x-axis.
    function randomBall(){ 
        var randomX = (Math.random() * 2) - 1;
        
        verticesC = [vec2( 0.0, 0.0 ), vec2( 0.0, -0.04 ), vec2(  0.03, -0.04 ), vec2(  0.03, 0.0 ) ];

        for(var j = 0; j < 4; j++){ 
            verticesC[j][0] += randomX;
        }
        randomDir();
    }

    //Randomize the pebble starting pos in the upper frame of canvas.
    function randomPebble(){
        var pebbleX = (Math.random() * 1) - 0.9;
        var pebbleY = (Math.random()* 0.5);

        verticesD = [vec2( 0.0, 0.0 ), vec2( 0.0, -0.16 ), vec2(  0.12, -0.16 ), vec2(  0.12, 0.0 ) ];

        for(var i = 0; i < 4; i++){
            verticesD[i][0] += pebbleX;
        }
        for(var j = 0; j < 2; j++){
            verticesD[0][j] += pebbleY;
            verticesD[1][j] += pebbleY;
            verticesD[2][j] += pebbleY;
            verticesD[3][j] += pebbleY;
        }
        
    }


    //Randomize the ball's direction.
    function randomDir(){ 
        var randomUD = (Math.random() * 2);
        var randomLR = (Math.random() * 2);

        if(randomUD <= 1){
            down = true;
        }
        if(randomUD <= 2){
            up = true;
        }
        if(randomLR <= 1){
            right = true;
        }
        if(randomLR <= 2){
            left = true;
        }    
    }     

    //Collision detection for the ball
    function ballCollision(){
        flag = false;
        //If it's on it's way down and it touches the outer edge of the paddle, down = false && up = true
        if(down === true && 
           verticesC[0][0] > verticesA[0][0] && verticesC[2][0] < verticesA[2][0] && 
           verticesC[1][1] < verticesA[1][1] && verticesC[1][1] > verticesA[0][1]){
                up = true;
        }
        //If it's on it's way up and it touches the outer edge of the paddle, down = true && up = false
        if(up === true &&
           verticesC[0][0] > verticesB[0][0] && verticesC[2][0] < verticesB[2][0] && 
           verticesC[0][1] > verticesB[1][1] && verticesC[0][1] < verticesB[0][1]){ 
                down = true;
        }
        //If it's on it's way right and touches the canvas border, right = false && left = true;
        if(right === true &&
           verticesC[2][0] > 1){
                left = true;
        }
        //If it's on it's way left and touches the canvas border, right = true && left = false;
        if(left === true &&
           verticesC[0][0] < -1){
                right = true;
        }

        if(down === true && 
           verticesC[2][1] < -1 &&
           flag === false){
            timer = false;
            flag = true;
            randomPebble();
            randomBall();
               score = 0;
               timer = true;
           }
           
        if(up === true &&
           verticesC[0][1] > 1 &&
           flag === false){
               flag = true;
               randomPebble();
               randomBall();
               score = 0;
           }
    }

    function paddleCollision(){
        //Collision detection for right side.
        if(verticesA[3][0] >= 1){
            verticesA[0][0] = 0.8;
            verticesA[1][0] = 0.8;
            verticesA[2][0] = 1;
            verticesA[3][0] = 1;
    
            verticesB[0][0] = -1;
            verticesB[1][0] = -1;
            verticesB[2][0] = -0.8;
            verticesB[3][0] = -0.8;
        }

        //Collision detection for left side 
        if(verticesA[0][0] <= -1){
            verticesA[0][0] = -1;
            verticesA[1][0] = -1;
            verticesA[2][0] = -0.8;
            verticesA[3][0] = -0.8;
    
            verticesB[0][0] = 0.8;
            verticesB[1][0] = 0.8;
            verticesB[2][0] = 1;
            verticesB[3][0] = 1;
        }
    }

    function update(){
    //Here we do the tasks that the simulation executes every 16hz or so.
    paddleCollision();    

    for(i=0; i<4; i++) {
        if(leftKey){ 
        //Paddle movement
        verticesA[i][0] -= xmove;
        verticesB[i][0] += xmove;
        }
        if(rightKey){ 
            //Paddle movement
            verticesA[i][0] += xmove;
            verticesB[i][0] -= xmove;
        }
    }

            if(down){
                up = false;
                verticesC[0][1] -= yVel;
                verticesC[1][1] -= yVel;
                verticesC[2][1] -= yVel;
                verticesC[3][1] -= yVel;
                ballCollision();
                }
            if(up){
                verticesC[0][1] += yVel;
                verticesC[1][1] += yVel;
                verticesC[2][1] += yVel;
                verticesC[3][1] += yVel;
                down = false;
                ballCollision();
            }
            if(right){
                verticesC[0][0] += xVel;
                verticesC[1][0] += xVel;
                verticesC[2][0] += xVel;
                verticesC[3][0] += xVel;
                left = false;
                ballCollision();
            }
            if(left){
                verticesC[0][0] -= xVel;
                verticesC[1][0] -= xVel;
                verticesC[2][0] -= xVel;
                verticesC[3][0] -= xVel;
                right = false;
                ballCollision();
            }
    
        buffer();
    }

    function mainIter() {
        update();
      }
    
    //Requesting a recurring periodic "timer event" to make the game run.
    window.setInterval(mainIter, 16.666);

    //Have the ball and paddle speed double every 20 seconds.
    if(timer === true){ 
        window.setInterval(speed, 20000);
    }

    render();
}

    function render() {
    
        gl.clear( gl.COLOR_BUFFER_BIT );

        // Draw first paddle   
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdA );
        gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( locColor, flatten(colorA) );
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

        // Draw second paddle
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdB );
        gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( locColor, flatten(colorB) );
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

        // Draw verticesC
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdC );
        gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( locColor, flatten(colorC) );
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

        // Draw verticesD
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdD );
        gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( locColor, flatten(colorD) );
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

        window.requestAnimFrame(render);
    } 

    
    
    