window.addEventListener('load', init);

const GAMETITLE = "TANK BEATS";
const VERSION = "1.0";
const EMAX = 50;
const PLAYERV = 1.0;
const ENEMYV = 0.8;
const PBULMAX = 5;
const PBULV = 3.0;
const EBULV = 3.0;
const ENEMYTRV = 0.02;
const EBULMAX = 10;
const PLAYERHPMAX = 3;
const ENEMYHPMAX = 3;
const ANIMEFRAME = 5;//アニメ一枚にかける時間
const LOADINGTIME = 100;
const DISTANCEMAX = 50;
const SMOKENUMMAX = 20;
const SMOKETIME = 3;
const STAGENUMMAX = 10;

var canvas;
var ctx;

var SCREEN_WIDTH = 800;
var SCREEN_HEIGHT = 640;

var lastTimeStamp = null;

var mouse = { x: 0, y: 0 };

var player = { x: SCREEN_WIDTH / 2, y: 400, v: 0.0, lastx: SCREEN_WIDTH / 2};

var gameover = false;

var in_title = true;

map = [];

mesbutton = [];


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

    console.log("asset loaded");

    // set mouse listener
    canvas.addEventListener('mousemove', function(evt){
        var canvasRect = canvas.getBoundingClientRect();
        mouse = {
            x: evt.clientX - canvasRect.left,
            y: evt.clientY - canvasRect.top
        } 
    }, false);
    canvas.addEventListener('click', onClick, false);

    //map load
    loadMap();
    for(var i = 0; i < map.length; i++){
        console.log(map[i].name);
        for(var k = 0; k < 10; k++){
            for(var j = 0; j < 10; j++){
                console.log(map[i].elm[j][k]);
            }
        }
    }
    console.log("init end");
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

    //collision();

    draw();

    requestAnimationFrame(update);
};

function draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['back'], 0, 0);

    if(in_title){
        console.log("title");
        ctx.drawImage(Asset.images['title'], 0, 0);
        //ctx.fillText('クリックで始める', SCREEN_WIDTH / 2 - 120, SCREEN_HEIGHT / 2 + 50);
    }

    if(gameover){
        ctx.fillText('ゲームオーバー', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 50);
        ctx.fillText('更新で再挑戦', SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 2 + 90);
    }
};

var Asset = {};

Asset.assets = [
    { type: 'image', name: 'back', src: 'tank_beats/data/black.png' },
    { type: 'image', name: 'title', src: 'tank_beats/data/title.png'}
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
    mouse.x = 
    mesbutton.forEach(function(elm){
        
    });
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

function loadMap(){
    var mapname;
    var mapfile;
    var mapnamefile = readTextFile("https://www.mass-site.work/game/tank_beats/data/mapfile/mapdata.txt");
    for(var i = 0;; i++){
        mapname = mapnamefile.split('\n')[i];
        if(mapname != 'TEXTend'){
            map[i] = {};
            map[i].name = mapname;
            map[i].elm = [];
            for(var elm_i = 0; elm_i < 10; elm_i++){
                map[i].elm[elm_i] = new Array(10);
            }
            mapfile = readTextFile("https://www.mass-site.work/game/tank_beats/data/mapfile/" + map[i].name + ".txt");
            for(var k = 0; k < 10; k++){
                var split_elm;
                split_elm = mapfile.split('\n')[k].split('');
                for(var j = 0; j < 10; j++){
                    map[i].elm[j][k] = split_elm[j];
                }
            }
        }else{
            break;
        }
    }
}

function readTextFile(file){
    var rawFile = new XMLHttpRequest();
    var allText;
    var exitFlag = false;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function(){
        if(rawFile.readyState == 4){
            if(rawFile.status == 200 || rawFile.status == 0){
                allText = rawFile.responseText;
                exitFlag = true;
            }
        }
    }
    rawFile.send(null);
    while(exitFlag == false);
    return allText;
} 