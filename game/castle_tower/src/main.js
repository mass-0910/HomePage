window.addEventListener('load', init);

var canvas;
var ctx;

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 640;

const SQUARE_WIDTH = 300;
const SQUARE_HEIGHT = 300;

const SQUARE_NUM = 30;

var lastTimeStamp = null;

var mouse = { x: 0, y: 0 };

var block = [];
var BLOCK_NUM = (SCREEN_WIDTH / 32 - 2) * ( (SCREEN_HEIGHT - 250) / 10 - 2);

var player = { x: SCREEN_WIDTH / 2, y: 400, v: 0.0, lastx: SCREEN_WIDTH / 2};

var BALL_RADIUS = 5;
var ball = null;

var gameover = false;

var Asset = {};

Asset.assets = [
    { type: 'image', name: 'back', src: 'img/back.png' },
];

Asset.images = [];

var squares = [];

function init(){

    // canvas initialize
    canvas = document.getElementById("maincanvas");
    ctx = canvas.getContext('2d');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    ctx.font = '32px sans-serif';

    // loading assets
    Asset.loadAssets(function(){
        requestAnimationFrame(update);
    });

    // set mouse listener
    canvas.addEventListener('mousemove', function(evt){
        var canvasRect = canvas.getBoundingClientRect();
        mouse = {
            x: evt.clientX - canvasRect.left,
            y: evt.clientY - canvasRect.top
        } 
    }, false);
    canvas.addEventListener('click', onClick, false);

    //init squares
    side_num = (SQUARE_NUM / 10) * 2;
    tb_num = (SQUARE_NUM / 10) * 3;
    next_point = { x: SCREEN_WIDTH / 2 - (tb_num + 1) / 2, y: SCREEN_HEIGHT / 2 - (side_num + 1) / 2 };
    for(var i = 0; i < SQUARE_NUM; i++){
        squares[i] = {
            x: next_point.x,
            y: next_point.y
        };
        if(i < tb_num){
            next_point.x += SQUARE_WIDTH;
        }else if(i < tb_num + side_num){
            next_point.y += SQUARE_HEIGHT;
        }else if(i < tb_num + side_num + tb_num){
            next_point.x -= SQUARE_WIDTH;
        }else{
            next_point.y -= SQUARE_HEIGHT;
        }
    }

    console.log('init')
};

function update(timestamp){

    console.log('update')

    // time from before frame
    var delta = 0;
    if(lastTimeStamp != null){
        delta = (timestamp - lastTimeStamp) / 10;
    }
    lastTimeStamp = timestamp;

    draw();

    requestAnimationFrame(update);
};

function draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log('draw');

    ctx.drawImage(Asset.images['back'], 0, 0);

    ctx.fillStyle = "white";
    ctx.fillRect(player.x - 32, player.y - 5, 64, 10);

    if(gameover){
        ctx.fillText('ゲームオーバー', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 50);
        ctx.fillText('更新で再挑戦', SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 2 + 90);
    }

    for(square in squares){
        ctx.strokeRect(square.x, square.y, SQUARE_WIDTH, SQUARE_HEIGHT);
    }
};

Asset.loadAssets = function(onComplete){

    var total = Asset.assets.length;
    var loadCount = 0;

    var onLoad = function(){
        loadCount++;
        if(loadCount >= total){
            onComplete();
        }
    };

    Asset.assets.forEach(function(asset){
        switch(asset.type){
            case 'image':
                Asset._loadImage(asset, onLoad);
                break;
        }
    });
};

Asset._loadImage = function(asset, onLoad){
    var image = new Image();
    image.src = asset.src;
    image.onload = onLoad;
    Asset.images[asset.name] = image;
};

function onClick(){
    
};