window.addEventListener('load', init);

var canvas;
var ctx;

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;

var lastTimeStamp = null;

var mouse = { x: 0, y: 0 };

var block = [];
var BLOCK_NUM = (SCREEN_WIDTH / 32 - 2) * ( (SCREEN_HEIGHT - 250) / 10 - 2);

var player = { x: SCREEN_WIDTH / 2, y: 400, v: 0.0, lastx: SCREEN_WIDTH / 2};

var BALL_RADIUS = 5;
var ball = null;

var gameover = false;

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

    // initialize block
    var block_index = 0;
    for(var i = 0; i < BLOCK_NUM; i++, block_index++){
        var block_x, block_y;
        block_x = (block_index * 32) % SCREEN_WIDTH;
        block_y = Math.floor(block_index / Math.floor(SCREEN_WIDTH / 32)) * 10;
        while(block_x / 32 == 0 || block_x / 32 == SCREEN_WIDTH / 32 - 1 || block_y / 10 == 0 || block_y / 10 == 1){
            block_index++;
            block_x = (block_index * 32) % SCREEN_WIDTH;
            block_y = Math.floor(block_index / Math.floor(SCREEN_WIDTH / 32)) * 10;
        }
        block[i] = { x: block_x, y: block_y, alive: true };
        //console.log("index:" + i + " x:" + block[i].x + " y:" + block[i].y + " block_index:" + block_index);
    }
};

function update(timestamp){

    // time from before frame
    var delta = 0;
    if(lastTimeStamp != null){
        delta = (timestamp - lastTimeStamp) / 10;
    }
    lastTimeStamp = timestamp;

    // update player
    player.x = mouse.x;
    player.v = player.x - player.lastx;
    player.lastx = player.x;

    //update ball
    if(ball != null){
        ball.x += ball.xv * delta;
        ball.y += ball.yv * delta;
    }

    collision();

    draw();

    requestAnimationFrame(update);
};

function draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['back'], 0, 0);
    block.forEach(function(a_block){
        if(a_block.alive){
            ctx.drawImage(Asset.images['block'], a_block.x, a_block.y);
        }
    });

    ctx.fillStyle = "white";
    ctx.fillRect(player.x - 32, player.y - 5, 64, 10);

    if(ball == null){
        ctx.fillText('クリックで始める', SCREEN_WIDTH / 2 - 120, SCREEN_HEIGHT / 2 + 50);
    }

    if(gameover){
        ctx.fillText('ゲームオーバー', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 50);
        ctx.fillText('更新で再挑戦', SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 2 + 90);
    }

    if(ball != null){
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI*2, true);
        ctx.fill();
        ctx.closePath();
    }
};

var Asset = {};

Asset.assets = [
    { type: 'image', name: 'back', src: 'img/black.png' },
    { type: 'image', name: 'block', src: 'img/block.png'}
];

Asset.images = [];

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
    var rand_rad = Math.random() - 0.5 + Math.PI / 2;
    console.log(rand_rad);
    if(ball == null){
        ball = {};
        ball.x = player.x;
        ball.y = player.y;
        ball.xv = Math.cos(rand_rad);
        ball.yv = -Math.sin(rand_rad);
    }
};

function collision(){
    if(ball != null){

        // hit to player bar
        if(ball.y - BALL_RADIUS < player.y - 5 && ball.y + BALL_RADIUS > player.y - 5){
            if(ball.x > player.x - 32 && ball.x < player.x + 32){
                ball.xv = (ball.x - player.x) / 50;
                ball.yv = -1.0 - Math.abs(player.v) / 7;
                console.log("hit to bar");
            }
        }

        // hit to block
        block.forEach(function(a_block){
            if(a_block.alive){
                switch(isInTheBlock(a_block, ball)){
                    case 'left':
                        a_block.alive = false;
                        ball.xv *= -1;
                        break;
                    case 'top':
                        a_block.alive = false;
                        ball.yv *= -1;
                        break;
                    case 'right':
                        a_block.alive = false;
                        ball.xv *= -1;
                        break;
                    case 'bottom':
                        a_block.alive = false;
                        ball.yv *= -1;
                        break;
                    default:
                        break;
                }
            }
        });

        // hit to wall(edge of screen)
        if(ball.x - BALL_RADIUS < 0){
            ball.x = BALL_RADIUS;
            ball.xv *= -1;
            console.log("hit to wall");
        }
        if(ball.x + BALL_RADIUS > SCREEN_WIDTH){
            ball.x = SCREEN_WIDTH - BALL_RADIUS;
            ball.xv *= -1;
            console.log("hit to wall");
        }
        if(ball.y - BALL_RADIUS < 0){
            ball.y = BALL_RADIUS;
            ball.yv *= -1;
            console.log("hit to wall");
        }
        if(ball.y + BALL_RADIUS > SCREEN_HEIGHT){
            gameover = true;
        }
    }
}

function isInTheBlock(block, ball){
    if(block.x < ball.x - BALL_RADIUS && block.x + 32 > ball.x - BALL_RADIUS && block.y < ball.y && block.y + 10 > ball.y){ // hit ball left
        return 'left';
    }else if(block.x < ball.x && block.x + 32 > ball.x && block.y < ball.y - BALL_RADIUS && block.y + 10 > ball.y - BALL_RADIUS){ // hit ball top
        return 'top';
    }else if(block.x < ball.x + BALL_RADIUS && block.x + 32 > ball.x + BALL_RADIUS && block.y < ball.y && block.y + 10 > ball.y){ // hit ball right
        return 'right';
    }else if(block.x < ball.x && block.x + 32 > ball.x && block.y < ball.y + BALL_RADIUS && block.y + 10 > ball.y + BALL_RADIUS){ // hit ball bottom
        return 'bottom';
    }else{
        return 'nohit';
    }
}