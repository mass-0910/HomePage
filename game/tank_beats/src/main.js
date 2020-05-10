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
var key = [];

var player;
var pbullet = [];
var loading = 0;

var enemy = [];
var enemynum = 0;

var gameover = false;

var in_title;
var in_game;
var in_credit;
var in_howtoplay;

map = [];
var now_mapnumber;

var clear;
var gameovertime;
var cleartime;

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

    // set key listener
    canvas.setAttribute('tabindex', 0);
    canvas.addEventListener('keydown', function(evt){
        if(evt.key == 'w') key['w'] = true;
        if(evt.key == 'a') key['a'] = true;
        if(evt.key == 's') key['s'] = true;
        if(evt.key == 'd') key['d'] = true;
    }, false);
    canvas.addEventListener('keyup', function(evt){
        if(evt.key == 'w') key['w'] = false;
        if(evt.key == 'a') key['a'] = false;
        if(evt.key == 's') key['s'] = false;
        if(evt.key == 'd') key['d'] = false;
    }, false);

    //map load
    loadMap();
    now_mapnumber = 0;

    //mesbutton init
    mesbutton[0] = { text: 'START',       x: 200, y: 300 };
    mesbutton[1] = { text: 'HOW TO PLAY', x: 200, y: 350 };
    mesbutton[2] = { text: 'CREDIT',      x: 200, y: 400 };

    //player init
    player = { x: 32.0,
               y: 32.0,
               xv: 0.0,
               yv: 0.0,
               r: 0.0,
               tr: 0.0,
               HP: 3,
               damage_timer:
               ANIMEFRAME * 4,
               smoke_timer: 0,
               firepage: 0,
               bulnum: 0
             };
    for(var i = 0; i < PBULMAX; i++){
        pbullet[i] = { x: -1.0, y: -1.0, xv: 0.0, yv: 0.0, r: 0.0 };
    }
    player.smoke = [];
    for(var i = 0; i < SMOKENUMMAX; i++){
        player.smoke[i] = {x: 0, y: 0, xv: 0, yv: 0};
    }
    player.bodyimage = Asset.images['tankbody'];
    player.towerimage = Asset.images['tankhead'];

    //enemy init
    enemynum = 0;
    for(var i = 0; i < EMAX; i++){
        enemy[i] = { HP: ENEMYHPMAX,
                     damage_timer: ANIMEFRAME * 4,
                     smoke_timer: 0,
                     firepage: 0,
                     r: 0,
                     tr: 0,
                     shotpoint: {x: 0, y: 0},
                     loading: 0,
                     bulnum: 0,
                     noshot: false
                   };
        enemy[i].bullet = [];
        for(var j = 0; j < EBULMAX; j++){
            enemy[i].bullet[j] = { x: -1.0, y: -1.0, xv: 0.0, yv: 0.0, r: 0.0 };
        }
        enemy[i].smoke = [];
        for(var j = 0; j < SMOKENUMMAX; j++){
            enemy[i].smoke[j] = {x: 0, y: 0, xv: 0, yv: 0};
        }
    }

    in_title = true;
    in_game = false;
    in_credit = false;
    in_howtoplay = false;

    tmpHP = player.HP;
    damageEffect = 0;

    clear = false;
    gameovertime = 0;
    cleartime = 0;

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
    playerSpeed();

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
        drawEnemies();
        drawBullet();
        drawExplosion();
        drawFire();
        drawSmoke();
        drawParameter();
        drawDamageEffect();

        if(player.HP == 0){
            ctx.drawImage(Asset.images['gameover'], 0, 0);
            if(gameovertime > 100){
                ctx.fillText('Click to back to the main menu.', 200, 400 + 32);
            }
        }

        if(clear){
            ctx.drawImage(Asset.images['clear'], 0, 0);
            if(cleartime > 100){
                ctx.fillText('Click to go to the next stage.', 200, 400 + 32);
            }
        }
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
    ctx.drawImage(player.bodyimage, -(player.bodyimage.width / 2), -(player.bodyimage.width / 2));

    //draw tankhead
    ctx.rotate(player.tr - player.r);
    ctx.drawImage(player.towerimage, -(player.towerimage.width / 2), -(player.towerimage.height / 2));

    ctx.restore();
    
    ctx.fillRect(player.x, player.y, 3, 3);
}

function drawEnemies(){
    for(var i = 0; i < enemynum; i++){
        ctx.save();
        //draw enemy body
        ctx.translate(enemy[i].x, enemy[i].y);
        ctx.rotate(enemy[i].r);
        ctx.drawImage(Asset.images['enemybody'], -(Asset.images['enemybody'].width / 2), -(Asset.images['enemybody'].height / 2));
        //draw enemy head
        ctx.rotate(enemy[i].tr - enemy[i].r - Math.PI / 2);
        ctx.drawImage(Asset.images['enemyhead'], -(Asset.images['enemyhead'].width / 2), -(Asset.images['enemyhead'].height / 2));
        ctx.restore();
    }
}

function drawBullet(){

    //draw player's bullet
    for(var i = 0; i < PBULMAX; i++){
        if(pbullet[i] != -1.0){
            ctx.save();
            ctx.translate(pbullet[i].x, pbullet[i].y);
            ctx.rotate(pbullet[i].r);
            ctx.drawImage(Asset.images['bullet'], -(Asset.images['bullet'].width / 2), -(Asset.images['bullet'].height / 2));
            ctx.restore();
        }
    }

    //draw enemy's bullet
    for(var j = 0; j < enemynum; j++){
        for(var i = 0; i < EBULMAX; i++){
            if(enemy[j].bullet[i].x != -1.0){
                ctx.save();
                ctx.translate(enemy[j].bullet[i].x, enemy[j].bullet[i].y);
                ctx.rotate(enemy[j].bullet[i].r);
                ctx.drawImage(Asset.images['bullet'], -(Asset.images['bullet'].width / 2), -(Asset.images['bullet'].height / 2));
                ctx.restore();
            }
        }
    }
}

function drawExplosion(){

    //draw player's explosion
    if(player.damage_timer != ANIMEFRAME * 4){
        var page = Math.floor(player.damage_timer / ANIMEFRAME);
        ctx.drawImage(Asset.images['hitimg'], page * 32, 0, 32, 32, player.x - Asset.images['hitimg'].width / 2, player.y - Asset.images['hitimg'].height / 2);
        player.damage_timer++;
    }

    //draw enemy's explosion
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].damage_timer != ANIMEFRAME * 4){
            var page = Math.floor(enemy[i].damage_timer / ANIMEFRAME);
            ctx.drawImage(Asset.images['hitimg'], page * 32, 0, 32, 32, enemy[i].x - Asset.images['hitimg'].width / 2, enemy[i].y - Asset.images['hitimg'].height / 2);
            enemy[i].damage_timer++;
        }
    }
}

function drawFire(){

    //draw player fire
    if(player.HP == 0){
        if(player.smoke_timer % ANIMEFRAME == 0){
            if(player.firepage == 0){
                player.firepage = 1;
            }else{
                player.firepage = 0;
            }
        }
        ctx.drawImage(Asset.images['fire'], player.firepage * 32, 0, 32, 32, player.x - (Asset.images['fire'].width / 4), player.y - (Asset.images['fire'].height / 2), 32, 32);
    }

    //draw enemy fire
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].HP == 0){
            if(enemy[i].smoke_timer % ANIMEFRAME == 0){
                if(enemy[i].firepage == 0){
                    enemy[i].firepage = 1;
                }else{
                    enemy[i].firepage = 0;
                }
            }
            ctx.drawImage(Asset.images['fire'], enemy[i].firepage * 32, 0, 32, 32, enemy[i].x - (Asset.images['fire'].width / 4), enemy[i].y - (Asset.images['fire'].height / 2), 32, 32);
        }
    }
}

function drawSmoke(){

    //draw player smoke
    if(player.HP <= 1){
        for(var i = 0; i < SMOKENUMMAX; i++){
            if(player.smoke_timer == 0){
                player.smoke[i].x = player.x;
                player.smoke[i].y = player.y;
                player.smoke[i].xv = 0.0;
                player.smoke[i].yv = 0.0;
            }
            if(player.smoke_timer % 3 == i){
                player.smoke[i].xv = Math.cos(-Math.PI / 2,0 + Math.random() - 0.5);
                player.smoke[i].yv = Math.sin(-Math.PI / 2,0 + Math.random() - 0.5);
            }
            player.smoke[i].x += player.smoke[i].xv;
            player.smoke[i].y += player.smoke[i].yv;
            if(Math.sqrt(Math.pow(player.smoke[i].x - player.x, 2) + Math.pow(player.smoke[i].y - player.y, 2)) >= SMOKENUMMAX * 3){
                player.smoke[i].x = player.x;
                player.smoke[i].y = player.y;
            }
            ctx.drawImage(Asset.images['smoke'], player.smoke[i].x - 8, player.smoke[i].y - 8);
        }
        player.smoke_timer++;
    }

    //draw enemy smoke
    for(var j = 0; j < EMAX; j++){
        if(enemy[j].HP <= 1){
            for(var i = 0; i < SMOKENUMMAX; i++){
                if(enemy[j].smoke_timer == 0){
                    enemy[j].smoke[i].x = enemy[j].x;
                    enemy[j].smoke[i].y = enemy[j].y;
                    enemy[j].smoke[i].xv = 0.0;
                    enemy[j].smoke[i].yv = 0.0;
                }
                if(enemy[j].smoke_timer % 3 == i){
                    enemy[j].smoke[i].xv = Math.cos(-Math.PI / 2,0 + Math.random() - 0.5);
                    enemy[j].smoke[i].yv = Math.sin(-Math.PI / 2,0 + Math.random() - 0.5);
                }
                enemy[j].smoke[i].x += enemy[j].smoke[i].xv;
                enemy[j].smoke[i].y += enemy[j].smoke[i].yv;
                if(Math.sqrt(Math.pow(enemy[j].smoke[i].x - enemy[j].x, 2) + Math.pow(enemy[j].smoke[i].y - enemy[j].y, 2)) >= SMOKENUMMAX * 3){
                    enemy[j].smoke[i].x = enemy[j].x;
                    enemy[j].smoke[i].y = enemy[j].y;
                }
                ctx.drawImage(Asset.images['smoke'], enemy[j].smoke[i].x - 8, enemy[j].smoke[i].y - 8);
            }
            enemy[j].smoke_timer++;
        }
    }
}

function drawParameter(){
    ctx.fillText('HP', 670, 20);
    if(loading != LOADINGTIME){
        ctx.fillText('Loading', 650, 140 + 32);
    }
    ctx.fillRect(670, 200, (loading / LOADINGTIME) * 100.0, 10);
    ctx.fillText('Stage' + (now_mapnumber + 1), 660, 250 + 32);
}

var tmpHP;
var damageEffect;
function drawDamageEffect(){
    if(tmpHP != player.HP && player.HP != 0) damageEffect = 200;
    if(tmpHP != player.HP && player.HP == 0) damageEffect = 255;
    ctx.globalAlpha = damageEffect / 255.0;
    ctx.drawImage(Asset.images['damage'], 0, 0);
    ctx.globalAlpha = 1.0;
    if(damageEffect != 0) damageEffect -= 2;
    tmpHP = player.HP;
}

function playerSpeed(){
    if(player.HP != 0){
        if(key['d'] == true){
            player.xv += PLAYERV;
            if(player.x >= 639.0) player.xv = 0.0;
            if(map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 1 || map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 2) player.xv = 0.0;
        }
        if(key['a'] == true){
            player.xv += -PLAYERV;
            if(map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 1 || map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 2) player.xv = 0.0;
            if(player.x <= 0.0) player.xv = 0.0;
        }
        if(key['w'] == true){
            player.yv += -PLAYERV;
            if(map[now_mapnumber].elm[Math.floor(player.x / 64)][Math.floor((player.y + player.yv) / 64)] == 1 || map[now_mapnumber].elm[Math.floor(player.x / 64)][Math.floor((player.y + player.yv) / 64)] == 2) player.yv = 0.0;
            if(player.y <= 0.0) player.yv = 0.0;
        }
        if(key['s'] == true){
            player.yv += PLAYERV;
            if(player.y >= 639.0) player.yv = 0.0;
            if(map[now_mapnumber].elm[Math.floor(player.x / 64)][Math.floor((player.y + player.yv) / 64)] == 1 || map[now_mapnumber].elm[Math.floor(player.x / 64)][Math.floor((player.y + player.yv) / 64)] == 2) player.yv = 0.0;
        }
        player.x += player.xv;
        player.y += player.yv;
        player.xv = 0.0;
        player.yv = 0.0;
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