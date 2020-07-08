window.addEventListener('load', init);

var canvas;
var ctx;

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 640;

const SQUARE_WIDTH = 60;
const SQUARE_HEIGHT = 60;

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

class Dice{
    constructor(){
        this.num = 1
    }

    draw(x, y){
        ctx.drawImage(Asset.images['dice'], (this.num - 1) * 64, 0, 64, 64, Math.round(x), Math.round(y), 64, 64);
    }

    throw(){
        this.num = Math.ceil(Math.random()*6);
    }

    getNum(){
        return this.num;
    }
}

class Ordering{
    
    constructor(){
        this.state = 'dice'
        this.dice = new Dice();
        this.frame = 0;
        this.player_dice_x = SCREEN_WIDTH/2 - 32;
        this.player_dice_y = SCREEN_HEIGHT/2 - 32
    }

    update(){
        switch(this.state){
            case 'dice':
                if(this.frame % 5 == 0)this.dice.throw();
                break;
            case 'stop':
                if(this.frame > 60){
                    this.state = 'left alignment'
                }
                break;
            case 'left alignment':
                this.player_dice_x += (SCREEN_WIDTH / 3 - 32 - this.player_dice_x) * 0.1;
                break;
        }
        this.frame += 1;
    }

    draw(){
        switch(this.state){
            case 'dice':
                this.dice.draw(this.player_dice_x, this.player_dice_y);
                break;
            case 'stop':
                this.dice.draw(this.player_dice_x, this.player_dice_y);
                break;
            case 'left alignment':
                this.dice.draw(this.player_dice_x, this.player_dice_y);
                break;
        }
    }

    onClick(){
        switch(this.state){
            case 'dice':
                this.state = 'stop';
                this.frame = 0;
                break;

        }
    }
}

Asset.assets = [
    { type: 'image', name: 'back', src: 'castle_tower/img/back.png' },
    { type: 'image', name: 'dice', src: 'castle_tower/img/dice.png' },
];

Asset.images = [];

var squares = [];

var task = new Ordering();

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
    next_point = { x: SCREEN_WIDTH / 2 - ((tb_num + 1) * SQUARE_WIDTH) / 2, y: SCREEN_HEIGHT / 2 - ((side_num + 1) * SQUARE_HEIGHT) / 2 };
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

    // time from before frame
    var delta = 0;
    if(lastTimeStamp != null){
        delta = (timestamp - lastTimeStamp) / 10;
    }
    lastTimeStamp = timestamp;

    draw();

    task.update();

    requestAnimationFrame(update);
};

function draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['back'], 0, 0);

    if(gameover){
        ctx.fillText('ゲームオーバー', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 50);
        ctx.fillText('更新で再挑戦', SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 2 + 90);
    }

    for(var square of squares){
        ctx.strokeRect(square.x, square.y, SQUARE_WIDTH, SQUARE_HEIGHT);
    }

    task.draw()
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
    task.onClick();
};

