// ----- ПЕРЕМЕННЫЕ -----
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
const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 14;

// массив блоков
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);


// ----- ФУНКЦИИ -----
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
    //ballReset();
}

// функция для заполнения массива
function brickReset(){
    for(var i = 0; i < BRICK_COLS * BRICK_ROWS; i++)
    {
        // if(Math.random() < 0.5)
        // {
        //     brickGrid[i] = true;
        // }
        // else
        // {
        //     brickGrid[i] = false;
        // }  
        brickGrid[i] = true;
    }
}

// функция, определяющая позицию курсора мыши
function updateMousePos(e){
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = e.clientX - rect.left - root.scrollLeft;
    mouseY = e.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH/2;

    // cheat / hack to test ball in any position
    // ballX = mouseX;
    // ballY = mouseY;
    // ballSpeedX = 3;
    // ballSpeedY = -4;
}

// обновление 
function updateAll(){
    moveAll();
    drawAll();
}

// если мячик не попадает на манипулятор, то он снова оказывается в центре экрана
function ballReset(){
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}

// движение мячика
function ballMove(){
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
}

// взаимодействие мячика и блоков
function ballBrickHandeling(){
    var ballBrickCol = Math.floor(ballX / BRICK_W);
    var ballBrickRow = Math.floor(ballY / BRICK_H);
    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);
    if(ballBrickCol >= 0 && ballBrickCol < BRICK_COLS && ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS)
    {
        if(brickGrid[brickIndexUnderBall])
        {            
            brickGrid[brickIndexUnderBall] = false;
            
            var prevBallX = ballX - ballSpeedX;
            var prevBallY = ballY - ballSpeedY;
            var prevBrickCol = Math.floor(prevBallX / BRICK_W);
            var prevBrickRow = Math.floor(prevBallY / BRICK_H);

            var bothTestFailed = true;
            if(prevBrickCol != ballBrickCol)
            {
                var adjBrickSide = rowColToArrayIndex(prevBrickCol, ballBrickRow);

                // если нет блокирующего блока, то направление меняется
                if(brickGrid[adjBrickSide] == false)
                {
                    ballSpeedX *= -1;
                    bothTestFailed = false;
                }                
            }  
            if(prevBrickRow != ballBrickRow)
            {
                var adjBlockTopBottom = rowColToArrayIndex(ballBrickCol, prevBrickRow);

                if(brickGrid[adjBlockTopBottom] == false)
                {
                    ballSpeedY *= -1;
                    bothTestFailed = false;
                }                
            }
            
            // мячик меняет направление при удалении блоков наискосок
            if(bothTestFailed)
            {
                ballSpeedX *= -1;
                ballSpeedY *= -1;
            }
        }        
    }
}

// взаимодействие мячика и манипулятора
function ballPaddleHandeling(){
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

// создаем все движения игры
function moveAll(){
    ballMove();    
    ballBrickHandeling();
    ballPaddleHandeling();
}

// создаем все элементы игры
function drawAll(){
    colorRect(0,0, canvas.width,canvas.height, 'black');    // очищаем экран
    colorCircle(ballX, ballY, 10, 'white');                 // рисуем мячик
    colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_AGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white'); // рисуем манипулятор
    drawBricks();

    // код, который позволяет увидеть номер столбца, строки и номер блока
    // var mouseBrickCol = Math.floor(mouseX / BRICK_W);
    // var mouseBrickRow = Math.floor(mouseY / BRICK_H);
    // var brickIndexUnderMouse = rowColToArrayIndex(mouseBrickCol, mouseBrickRow);
    // colorText(mouseBrickCol + ", " + mouseBrickRow + ": " + brickIndexUnderMouse, mouseX, mouseY, 'yellow');    // создаем текст с позицией курсора мыши

    // исчезновение блока при наведении курсора
    // if(brickIndexUnderMouse >= 0 && brickIndexUnderMouse < BRICK_COLS * BRICK_ROWS)
    // {
    //     brickGrid[brickIndexUnderMouse] = false;
    // }
}

// создание прямоугольников
function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
    // окрашиваем холст в нужный цвет каждый раз при обновлении холста
    canvasContext.fillStyle = fillColor;
    // задаем положение и размеры холста 
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

// создание шариков
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

// создание текста
function colorText(showWords, textX, textY, fillColor){
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}

// задаем порядковый номер каждому блоку
function rowColToArrayIndex(col, row){
   return col + BRICK_COLS * row;
}

// создаем блоки
function drawBricks(){
    for(var eachRow = 0; eachRow < BRICK_ROWS; eachRow++)
    {
        for(var eachCol = 0; eachCol < BRICK_COLS; eachCol++)
        {
            var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
            if(brickGrid[arrayIndex])
            {
                colorRect(BRICK_W * eachCol, BRICK_H * eachRow, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue');
            } 
        }
    }
}