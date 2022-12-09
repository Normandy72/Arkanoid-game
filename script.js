var canvas, canvasContext;

// положение шарика по оси Х и У
var ballX = 75;
var ballY = 75;

// кол-во пикселей для одного смещения по Х и У
var ballSpeedX = 5;
var ballSpeedY = 7;

// создаем манипулятор
const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_AGE = 60;
var paddleX = 400;

// координаты курсора мыши
var mouseX = 0;
var mouseY = 0;

// задаем размеры блоков
const BRICK_W = 100;
const BRICK_H = 50;
const BRICK_COUNT = 8;

// массив блоков
var brickGrid = new Array(BRICK_COUNT);

// функция для заполнения массива
function brickReset(){
    for(var i = 0; i < BRICK_COUNT; i++)
    {
        if(Math.random() < 0.5)
        {
            brickGrid[i] = true;
        }
        else
        {
            brickGrid[i] = false;
        }    
    }
}

function updateMousePos(e){
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = e.clientX - rect.left - root.scrollLeft;
    mouseY = e.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH/2;
}

window.onload = function(){
    // --- СОЗДАЕМ ХОЛСТ И КОНТЕКСТ ---
    // получаем холст через ID
    canvas = document.getElementById('gameCanvas');

    // создаем контекст в 2d
    canvasContext = canvas.getContext('2d');

    // кол-во обновлений холста
    var framesPerSecond = 30;

    // задаем интервал обновления холста
    setInterval(updateAll, 1000/framesPerSecond);

    // добавляем слушателя на движение мыши (чтобы манипулятор двигался при движении мыши)
    canvas.addEventListener('mousemove', updateMousePos);

    brickReset();
}

function updateAll(){
    moveAll();
    drawAll();
}

// если мячик не попадает на манипулятор, то он снова оказывается в центре экрана
function ballReset(){
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}

function moveAll(){
    // изменение положение шарика по оси Х каждый раз, когда холст обновляется
    ballX += ballSpeedX;

    if(ballX > canvas.width)
    {
        ballSpeedX *= -1;
    }

    if(ballX < 0)
    {
        ballSpeedX *= -1;
    }

    // изменение положение шарика по оси Y каждый раз, когда холст обновляется
    ballY += ballSpeedY;

    if(ballY > canvas.height)
    {
        ballReset();
    }
 
    if(ballY < 0)
    {
        ballSpeedY *= -1;
    }

    // определяем положение сторон манипулятора (верхний край, нижний край, левый край, правый край)
    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_AGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

    // если мячик попадает в область манипулятора, меняем направление его движения
    if(ballY > paddleTopEdgeY && 
        ballY < paddleBottomEdgeY &&
        ballX > paddleLeftEdgeX &&
        ballX < paddleRightEdgeX)
    {
        ballSpeedY *= -1;

        // чем дальше мячик попадает от центра манипулятора, тем больше скорость и угол полета
        var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
        var ballDistFromPaddleCentreX = ballX - centerOfPaddleX;
        ballSpeedX = ballDistFromPaddleCentreX  * 0.35;         // немного уменьшаем скорость
    }    
}

function drawAll(){
    colorRect(0,0, canvas.width,canvas.height, 'black');    // очищаем экран
    colorCircle(ballX, ballY, 10, 'white');                 // рисуем мячик
    colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_AGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white'); // рисуем манипулятор
    colorText(mouseX + ", " + mouseY, mouseX, mouseY, 'yellow');    // создаем текст с позицией курсора мыши
    drawBricks();
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
    // окрашиваем холст в нужный цвет каждый раз при обновлении холста
    canvasContext.fillStyle = fillColor;
    // задаем положение и размеры холста 
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX,centerY, radius, fillColor){
    // --- СОЗДАЕМ ШАРИК ---
    // задаем ему цвет
    canvasContext.fillStyle = fillColor;   
    // задаем начало пути
    canvasContext.beginPath();   
    // создаем шарик (начальное положение top - ballX, left - ballY; радиус 10, начальный угол 0, конечный угол pi * 2, против часовой стрелки - true)
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);   
    // заполняем получившийся элемент
    canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor){
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}

function drawBricks(){
    for(var i = 0; i < BRICK_COUNT; i++)
    {
        if(brickGrid[i])
        {
            colorRect(BRICK_W * i, 0, BRICK_W - 2, BRICK_H, 'blue');
        } 
    } 
}