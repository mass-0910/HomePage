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

var player;
var pbullet = [];

var enemy = [];
var enemynum = 0;

var gameover = false;

var in_title = true;
var in_game = false;
var in_credit = false;
var in_howtoplay = false;

map = [];
var now_mapnumber;

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
    now_mapnumber = 0;

    //mesbutton init
    mesbutton[0] = { text: 'START',       x: 200, y: 300 };
    mesbutton[1] = { text: 'HOW TO PLAY', x: 200, y: 350 };
    mesbutton[2] = { text: 'CREDIT',      x: 200, y: 400 };

    //player init
    player = { x: 32.0, y: 32.0, xv: 0.0, yv: 0.0, r: 0.0, tr: 0.0, HP: 3, damage_timer: ANIMEFRAME * 4, bulnum: 0};
    for(var i = 0; i < PBULMAX; i++){
        pbullet[i] = { x: -1.0, y: -1.0, xv: 0.0, yv: 0.0 };
    }
    player.bodyimage = Asset.images['tankbody'];
    player.towerimage = Asset.images['tankhead'];

    //enemy init
    for(var i = 0; i < EMAX; i++){
        enemy[i] = { HP: ENEMYHPMAX, damage_timer: ANIMEFRAME * 4, smoke_timer: 0, r: 0, tr: 0};
        enemy[i].bullet = [];
        for(var j = 0; j < EBULMAX; j++){
            enemy[i].bullet[j] = { x: -1.0, y: -1.0, xv: 0.0, yv: 0.0 };
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
    
    //collision();

    draw();

    requestAnimationFrame(update);
};

function draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['back'], 0, 0);

    if(in_title){
        ctx.drawImage(Asset.images['title'], 0, 0);
        for(var i = 0; i < 3; i++){
            if(mouse.x >= mesbutton[i].x && mouse.x <= mesbutton[i].x + ctx.measureText(mesbutton[i].text).width && mouse.y >= mesbutton[i].y - 32 && mouse.y <= mesbutton[i].y){
                ctx.fillStyle = 'rgba(150, 150, 150)';
            }else{
                ctx.fillStyle = 'rgba(255, 255, 255)';
            }
            ctx.fillText(mesbutton[i].text, mesbutton[i].x, mesbutton[i].y);
        }
        //ctx.fillText('クリックで始める', SCREEN_WIDTH / 2 - 120, SCREEN_HEIGHT / 2 + 50);
    }

    if(in_game){
        ctx.drawImage(Asset.images['back'], 0, 0);
        drawMap();
        drawPlayer();
    }

    if(gameover){
        ctx.fillText('ゲームオーバー', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 50);
        ctx.fillText('更新で再挑戦', SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 2 + 90);
    }

    //draw mouse cursor
    ctx.drawImage(Asset.images['cursor'], mouse.x - 16, mouse.y - 16);
};

function drawMap(){
    for(var j = 0; j < 10; j++){
        for(var i = 0; i < 10; i++){
            var posX, posY;
            posX = i * 64;
            posY = j * 64;
            if(map[now_mapnumber].elm[i][j] == 3){
                player.x = i * 64 + 32;
                player.y = j * 64 + 32;
                map[now_mapnumber].elm[i][j] = 0;
            }
            if(map[now_mapnumber].elm[i][j] == 4){
                enemy[enemynum].x = i * 64 + 32;
                enemy[enemynum].y = j * 64 + 32;
                enemy[enemynum].type = 0;
                enemynum++;
                map[now_mapnumber].elm[i][j] = 0;
            }
            if(map[now_mapnumber].elm[i][j] == 5){
                enemy[enemynum].x = i * 64 + 32;
                enemy[enemynum].y = j * 64 + 32;
                enemy[enemynum].type = 1;
                enemynum++;
                map[now_mapnumber].elm[i][j] = 0;
            }
            if(map[now_mapnumber].elm[i][j] == 6){
                enemy[enemynum].x = i * 64 + 32;
                enemy[enemynum].y = j * 64 + 32;
                enemy[enemynum].type = 2;
                enemynum++;
                map[now_mapnumber].elm[i][j] = 0;
            }
            ctx.drawImage(Asset.images['map'], map[now_mapnumber].elm[i][j] * 64, 0, 64, 64, posX, posY, 64, 64);
        }
    }
}

function drawPlayer(){

    //draw tankbody
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.r);
    ctx.drawImage(player.bodyimage, player.bodyimage.width - 32, player.bodyimage.width - 32);

    //draw tankhead
    ctx.rotate(player.tr - player.r);
    ctx.drawImage(player.towerimage, player.towerimage.width - 32, player.towerimage.height - 32);

    ctx.restore();
}

function drawEnemies(){
    for(var i = 0; i < enemynum; i++){
        ctx.save();
        //draw enemy body
        ctx.translate(enemy[i].x, enemy[i].y);
        ctx.rotate(enemy[i].r);
        ctx.drawImage(Asset.images['enemybody'], Asset.images['enemybody'].width - 32, Asset.images['enemybody'].height - 32);
        //draw enemy head
        ctx.rotate(enemy[i].tr - enemy[i].r - Math.PI / 2);
        ctx.drawImage(Asset.images['enemyhead'], Asset.images['enemyhead'].width - 32, Asset.images['enemyhead'].width - 32);
        ctx.restore();
    }
}

var Asset = {};

Asset.assets = [
    { type: 'image', name: 'back', src: 'tank_beats/data/black.png' },
    { type: 'image', name: 'title', src: 'tank_beats/data/title.png' },
    { type: 'image', name: 'cursor', src: 'tank_beats/data/target.png' },
    { type: 'image', name: 'map', src: 'tank_beats/data/map.png' },
    { type: 'image', name: 'tankbody', src: 'tank_beats/data/tankbody.png' },
    { type: 'image', name: 'tankhead', src: 'tank_beats/data/tankhead.png' },
    { type: 'image', name: 'enemybody', src: 'tank_beats/data/enemybody.png' },
    { type: 'image', name: 'enemyhead', src: 'tank_beats/data/enemyhead.png'},
    { type: 'image', name: 'bullet', src: 'tank_beats/data/bullet.png' },
    { type: 'image', name: 'hitimg', src: 'tank_beats/data/hitimg.png' },
    { type: 'image', name: 'smoke', src: 'tank_beats/data/smoke.png' },
    { type: 'image', name: 'fire', src: 'tank_beats/data/fire.png' },
    { type: 'image', name: 'damage', src: 'tank_beats/data/damage.png'},
    { type: 'image', name: 'gameover', src: 'tank_beats/data/gameover.png' },
    { type: 'image', name: 'clear', src: 'tank_beats/data/clear.png'}
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
    if(in_title){
        for(var i = 0; i < 3; i++){
            if(mouse.x >= mesbutton[i].x && mouse.x <= mesbutton[i].x + ctx.measureText(mesbutton.text).width && mouse.y >= mesbutton[i].y - 32 && mouse.y <= mesbutton[i].y){
                switch(i){
                    case 0:
                        in_title = false;
                        in_game = true;
                        break;
                    case 1:
                        in_title = false;
                        in_howtoplay = true;
                        break;
                    case 2:
                        in_title = false;
                        in_credit = true;
                }
            }
        }
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