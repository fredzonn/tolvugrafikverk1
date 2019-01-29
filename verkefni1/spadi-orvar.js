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
var colorA = vec4(1.0, 0.0, 0.0, 1.0);
var colorB = colorA
var colorC = vec4(0.0, 1.0, 0.0, 1.0);
var xVel = 0.002;
var yVel = 0.003;
var down = true;
var up = true;
var left = true;
var right = true;

window.onload = function init() {
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var verticesA = [vec2( -0.1, -0.9 ), vec2( -0.1, -0.86 ), vec2(  0.1, -0.86 ), vec2(  0.1, -0.9 ) ];
    var verticesB = [vec2( -0.1, 0.9 ), vec2( -0.1, 0.86 ), vec2(  0.1, 0.86 ), vec2(  0.1, 0.9 ) ];
    var verticesC = [vec2( 0.0, 0.0 ), vec2( 0.0, -0.04 ), vec2(  0.03, -0.04 ), vec2(  0.03, 0.0 ) ];

    //Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
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
    }
    
    buffer();

    // Get location of shader variable vPosition
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    
    locColor = gl.getUniformLocation( program, "rcolor" );
    
    render();

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// vinstri ör
                xmove = -0.04;
                break;
            case 39:	// hægri ör
                xmove = 0.04;
                break;
            default:
                xmove = 0.0;
        }
        for(i=0; i<4; i++) {
            verticesA[i][0] += xmove;
            verticesB[i][0] -= xmove;
        }

        buffer();
    } );

    function collision(){
        if(down === true && 
           verticesC[0][0] >= verticesA[0][0] && verticesC[2][0] <= verticesA[2][0] && 
           verticesC[1][1] <= verticesA[1][1] && verticesC[1][1] >= verticesA[0][1]){
               up = true;
           }
        }

    function update(){ 
        for(i=0; i<4; i++) {
            if(down){
                up = false;
                verticesC[i][1] -= yVel;
                collision();
                }
            if(up){
                verticesC[i][1] += yVel;
                down = false;
            }
            if(right){
                verticesC[i][0] += xVel;
                left = false;
            }
            if(left){
                verticesC[i][0] -= xVel;
                right = false;
            }
        
        }
        buffer();
    }

    function mainIter() {
        update();
      }
    
    window.setInterval(mainIter, 16.666);

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

        window.requestAnimFrame(render);
    } 

    
    
    