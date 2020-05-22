window.addEventListener('load', init);
var first_init = true;

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
var dmap = [];

var clear;
var gameovertime;
var cleartime;

mesbutton = [];

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

function init(){

    // canvas initialize
    if(first_init){
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
        canvas.addEventListener('blur', function(evt){
            key['w'] = false;
            key['a'] = false;
            key['s'] = false;
            key['d'] = false;
        }), false;
    }

    //map load
    loadMap();
    now_mapnumber = 0;

    //init distance map
    for(var i = 0; i < 10; i++){
        dmap[i] = new Array(10);
    }

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
               bulnum: 0,
               shotable: false
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
        enemy[i] = { x: 0.0,
                     y: 0.0,
                     xv: 0.0,
                     yv: 0.0,
                     HP: ENEMYHPMAX,
                     damage_timer: ANIMEFRAME * 4,
                     smoke_timer: 0,
                     firepage: 0,
                     r: 0,
                     tr: 0,
                     shotpoint: {x: 0, y: 0},
                     loading: 0,
                     bulnum: 0,
                     noshot: false,
                     mapX: 0,
                     mapY:0
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

    first_init = false;
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

    if(in_game){
        movePlayer();
    
        //make enemymap
        for(var i = 0; i < enemynum; i++){
            enemy[i].mapX = Math.floor(enemy[i].x / 64);
            enemy[i].mapY = Math.floor(enemy[i].y / 64);
        }
        console.log("shotable : " + player.shotable);
        
        make_dmap();
        moveEnemy();
    
        movePlayerGunTower();
        playerBullet();
        moveEnemyGunTower();
        enemyBullet();
        hitBullet();

        if(player.HP <= 0){
            gameovertime++;
        }

        clear = true;
        for(var i = 0; i < enemynum; i++){
            if(enemy[i].HP != 0){
                clear = false;
                break;
            }
        }
        if(clear){
            cleartime++;
        }
    }

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
        if(pbullet[i].x != -1.0){
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
                ctx.rotate(enemy[j].bullet[i].r - Math.PI / 2.0);
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
        ctx.drawImage(Asset.images['hitimg'], page * 32, 0, 32, 32, player.x - 16, player.y - 16, 32, 32);
        player.damage_timer++;
    }

    //draw enemy's explosion
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].damage_timer != ANIMEFRAME * 4){
            var page = Math.floor(enemy[i].damage_timer / ANIMEFRAME);
            ctx.drawImage(Asset.images['hitimg'], page * 32, 0, 32, 32, enemy[i].x - 16, enemy[i].y - 16, 32, 32);
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
            if(Math.floor(player.smoke_timer / 3) == i){
                player.smoke[i].xv = Math.cos(-Math.PI / 2.0 + Math.random() - 0.5);
                player.smoke[i].yv = Math.sin(-Math.PI / 2.0 + Math.random() - 0.5);
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
                if(Math.floor(enemy[j].smoke_timer / 3) == i){
                    enemy[j].smoke[i].xv = Math.cos(-Math.PI / 2.0 + Math.random() - 0.5);
                    enemy[j].smoke[i].yv = Math.sin(-Math.PI / 2.0 + Math.random() - 0.5);
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
    ctx.fillText('HP', 670, 20 + 32);
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

function movePlayer(){
    if(player.HP != 0){
        if(key['d'] == true){
            player.xv += PLAYERV;
            if(player.x >= 639.0) player.xv = 0.0;
            if(map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 1 || map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 2) player.xv = 0.0;
        }
        if(key['a'] == true){
            player.xv += -PLAYERV;
            if(player.x + player.xv <= 0.0) player.xv = 0.0;
            if(map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 1 || map[now_mapnumber].elm[Math.floor((player.x + player.xv) / 64)][Math.floor(player.y / 64)] == 2) player.xv = 0.0;
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
        if(player.xv > 0.0 && player.yv == 0.0){//right
            if(player.r > -Math.PI / 2.0 && player.r < Math.PI / 2.0){
                player.r -= 0.05;
            }else{
                player.r += 0.05;
            }
        }
        if(player.xv < 0.0 && player.yv == 0.0){//left
            if(player.r > -Math.PI / 2.0 && player.r < Math.PI / 2.0){
                player.r += 0.05;
            }else{
                player.r -= 0.05;
            }
        }
        if(player.xv == 0.0 && player.yv < 0.0){//up
            if(player.r < 0.0){
                player.r -= 0.05;
            }else{
                player.r += 0.05;
            }
        }
        if(player.xv == 0.0 && player.yv > 0.0){//down
            if(player.r < 0.0){
                player.r += 0.05;
            }else{
                player.r -= 0.05;
            }
        }
        if(player.xv > 0 && player.yv < 0){//右上
            if(player.r < Math.PI / 4.0 && player.r > -(3.0 * Math.PI) / 4.0){
                player.r -= 0.05;
            }else{
                player.r += 0.05;
            }
        }
        if(player.xv > 0 && player.yv > 0){//右下
            if(player.r < (3.0 * Math.PI) / 4.0 && player.r > -Math.PI / 4.0){
                player.r -= 0.05;
            }else{
                player.r += 0.05;
            }
        }
        if(player.xv < 0 && player.yv < 0){//左上
            if(player.r < (3.0 * Math.PI) / 4.0 && player.r > -Math.PI / 4.0){
                player.r += 0.05;
            }else{
                player.r -= 0.05;
            }
        }
        if(player.xv < 0 && player.yv > 0){//左下
            if(player.r > -(3.0 * Math.PI) / 4.0 && player.r < Math.PI / 4.0){
                player.r += 0.05;
            }else{
                player.r -= 0.05;
            }
        }
        if(player.r <= -Math.PI) player.r += 2.0 * Math.PI;
        if(player.r >= Math.PI) player.r -= 2.0 * Math.PI;
    }

    //hit to enemy
    for(var i = 0; i < enemynum; i++){
        if(distance(enemy[i].x, enemy[i].y, player.x+player.xv, player.y) <= 40) player.xv = 0.0;
        if(distance(enemy[i].x, enemy[i].y, player.x, player.y+player.yv) <= 40) player.yv = 0.0;
    }

    //add speed on player's point
    player.x += player.xv;
    player.y += player.yv;

    // init speed
    player.xv = 0.0;
    player.yv = 0.0;
}

function make_dmap(){
    var changed;

    for(var j = 0; j < 10; j++){
        for(var i = 0; i < 10; i++){
            dmap[i][j] = 0;
        }
    }
    
    dmap[Math.floor(player.x / 64)][Math.floor(player.y / 64)] = 50;
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].HP == 0){
            dmap[enemy[i].mapX][enemy[i].mapY] = -1;
        }
    }

    for(var d = 0; d < 50; d++){
        changed = 0;
        for(var j = 0; j < 10; j++){
            for(var i = 0; i < 10; i++){
                if(dmap[i][j] != 0 && dmap[i][j] != -1){
                    if(i-1 >= 0){if(map[now_mapnumber].elm[i-1][j] != 1 && map[now_mapnumber].elm[i-1][j] != 2 && dmap[i-1][j] == 0) dmap[i-1][j] = dmap[i][j] -1 ; changed = 1;}
                    if(i+1 <= 9){if(map[now_mapnumber].elm[i+1][j] != 1 && map[now_mapnumber].elm[i+1][j] != 2 && dmap[i+1][j] == 0) dmap[i+1][j] = dmap[i][j] -1 ; changed = 1;}
                    if(j-1 >= 0){if(map[now_mapnumber].elm[i][j-1] != 1 && map[now_mapnumber].elm[i][j-1] != 2 && dmap[i][j-1] == 0) dmap[i][j-1] = dmap[i][j] -1 ; changed = 1;}
                    if(j+1 <= 9){if(map[now_mapnumber].elm[i][j+1] != 1 && map[now_mapnumber].elm[i][j+1] != 2 && dmap[i][j+1] == 0) dmap[i][j+1] = dmap[i][j] -1 ; changed = 1;}
                }
            }
        }
        if(changed == 0)break;
    }
}

function moveEnemy(){
    var direction;
    var tmparray = [];

    //enemy speed
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].HP != 0){
            switch(enemy[i].type){

                case 0://好戦家
                    if(dmap[enemy[i].mapX][ enemy[i].mapY] < DISTANCEMAX - 4){
                        for(var j = 0; j < 8; j++){
                            tmparray[j] = 0;
                        }
                        if(enemy[i].mapY - 1 >= 0)  tmparray[0] = dmap[enemy[i].mapX][ enemy[i].mapY - 1];//上
                        if(enemy[i].mapY + 1 <= 9)  tmparray[1] = dmap[enemy[i].mapX][ enemy[i].mapY + 1];//下
                        if(enemy[i].mapX - 1 >= 0)  tmparray[2] = dmap[enemy[i].mapX - 1][ enemy[i].mapY];//左
                        if(enemy[i].mapX + 1 <= 9)  tmparray[3] = dmap[enemy[i].mapX + 1][ enemy[i].mapY];//右
                        if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY - 1 >= 0)  tmparray[4] = dmap[enemy[i].mapX - 1][ enemy[i].mapY - 1];//左上
                        if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY - 1 >= 0)  tmparray[5] = dmap[enemy[i].mapX + 1][ enemy[i].mapY - 1];//右上
                        if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY + 1 <= 9)  tmparray[6] = dmap[enemy[i].mapX + 1][ enemy[i].mapY + 1];//右下
                        if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY + 1 <= 9)  tmparray[7] = dmap[enemy[i].mapX - 1][ enemy[i].mapY + 1];//左下
                        direction = tmparray.indexOf(Math.max(...tmparray));//tmparray.reduce((a, b) => a > b ? a : b);
                        switch(direction){
                            case -1: break;
                            case 0 : enemy[i].yv += -ENEMYV ; break;
                            case 1 : enemy[i].yv += ENEMYV ; break;
                            case 2 : enemy[i].xv += -ENEMYV ; break;
                            case 3 : enemy[i].xv += ENEMYV ; break;
                            case 4 : enemy[i].xv += -ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                            case 5 : enemy[i].xv += ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                            case 6 : enemy[i].xv += ENEMYV ; enemy[i].yv += ENEMYV ; break;
                            case 7 : enemy[i].xv += -ENEMYV ; enemy[i].yv += ENEMYV ; break;
                        }
                    }
                    break;
            
                case 1://慎重派
                    if(dmap[enemy[i].mapX][ enemy[i].mapY] > DISTANCEMAX - 10){
                        for(var j = 0; j < 8; j++){
                            tmparray[j] = DISTANCEMAX + 1;
                        }
                        if(enemy[i].mapY - 1 >= 0)  tmparray[0] = dmap[enemy[i].mapX][ enemy[i].mapY - 1];//上
                        if(enemy[i].mapY + 1 <= 9)  tmparray[1] = dmap[enemy[i].mapX][ enemy[i].mapY + 1];//下
                        if(enemy[i].mapX - 1 >= 0)  tmparray[2] = dmap[enemy[i].mapX - 1][ enemy[i].mapY];//左
                        if(enemy[i].mapX + 1 <= 9)  tmparray[3] = dmap[enemy[i].mapX + 1][ enemy[i].mapY];//右
                        if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY - 1 >= 0)  tmparray[4] = dmap[enemy[i].mapX - 1][ enemy[i].mapY - 1];//左上
                        if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY - 1 >= 0)  tmparray[5] = dmap[enemy[i].mapX + 1][ enemy[i].mapY - 1];//右上
                        if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY + 1 <= 9)  tmparray[6] = dmap[enemy[i].mapX + 1][ enemy[i].mapY + 1];//右下
                        if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY + 1 <= 9)  tmparray[7] = dmap[enemy[i].mapX - 1][ enemy[i].mapY + 1];//左下
                        direction = tmparray.indexOf(Math.min(...tmparray));
                        switch(direction){
                            case -1: break;
                            case 0 : enemy[i].yv += -ENEMYV ; break;
                            case 1 : enemy[i].yv += ENEMYV ; break;
                            case 2 : enemy[i].xv += -ENEMYV ; break;
                            case 3 : enemy[i].xv += ENEMYV ; break;
                            case 4 : enemy[i].xv += -ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                            case 5 : enemy[i].xv += ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                            case 6 : enemy[i].xv += ENEMYV ; enemy[i].yv += ENEMYV ; break;
                            case 7 : enemy[i].xv += -ENEMYV ; enemy[i].yv += ENEMYV ; break;
                        }
                    }
                    break;
                    
                case 2://策略家
                    if(enemy[i].loading != LOADINGTIME){
                        for(var j = 0; j < 8; j++){
                            tmparray[j] = DISTANCEMAX + 1;
                        }
                        if(enemy[i].mapY - 1 >= 0)  tmparray[0] = dmap[enemy[i].mapX][ enemy[i].mapY - 1];//上
                        if(enemy[i].mapY + 1 <= 9)  tmparray[1] = dmap[enemy[i].mapX][ enemy[i].mapY + 1];//下
                        if(enemy[i].mapX - 1 >= 0)  tmparray[2] = dmap[enemy[i].mapX - 1][ enemy[i].mapY];//左
                        if(enemy[i].mapX + 1 <= 9)  tmparray[3] = dmap[enemy[i].mapX + 1][ enemy[i].mapY];//右
                        if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY - 1 >= 0)  tmparray[4] = dmap[enemy[i].mapX - 1][ enemy[i].mapY - 1];//左上
                        if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY - 1 >= 0)  tmparray[5] = dmap[enemy[i].mapX + 1][ enemy[i].mapY - 1];//右上
                        if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY + 1 <= 9)  tmparray[6] = dmap[enemy[i].mapX + 1][ enemy[i].mapY + 1];//右下
                        if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY + 1 <= 9)  tmparray[7] = dmap[enemy[i].mapX - 1][ enemy[i].mapY + 1];//左下
                        direction = tmparray.indexOf(Math.min(...tmparray));//tmparray.reduce((a, b) => a < b ? a : b);
                        switch(direction){
                            case -1: break;
                            case 0 : enemy[i].yv += -ENEMYV ; break;
                            case 1 : enemy[i].yv += ENEMYV ; break;
                            case 2 : enemy[i].xv += -ENEMYV ; break;
                            case 3 : enemy[i].xv += ENEMYV ; break;
                            case 4 : enemy[i].xv += -ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                            case 5 : enemy[i].xv += ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                            case 6 : enemy[i].xv += ENEMYV ; enemy[i].yv += ENEMYV ; break;
                            case 7 : enemy[i].xv += -ENEMYV ; enemy[i].yv += ENEMYV ; break;
                        }
                    }else{
                        //見えているかの判定(下からのコピー)
                        for(var k = 0; k < 50; k++){
                            var bitx, bity;
                            bitx = (enemy[i].x + Math.cos(Math.atan2(player.y - enemy[i].y, player.x - enemy[i].x)) * (distance(enemy[i].x, enemy[i].y, player.x, player.y)/50.0) * (k + 1));
                            bity = (enemy[i].y + Math.sin(Math.atan2(player.y - enemy[i].y, player.x - enemy[i].x)) * (distance(enemy[i].x, enemy[i].y, player.x, player.y)/50.0) * (k + 1));
                            if(map[now_mapnumber].elm[Math.floor(bitx/64)][ Math.floor(bity/64)] == 1){
                                enemy[i].noshot = true;//見えていない
                                break;
                            }else{
                                enemy[i].noshot = false;//見えている
                            }
                        }
                        if(enemy[i].noshot == true){
                            for(var j = 0; j < 8; j++){
                                tmparray[j] = 0;
                            }
                            if(enemy[i].mapY - 1 >= 0)  tmparray[0] = dmap[enemy[i].mapX][ enemy[i].mapY - 1];//上
                            if(enemy[i].mapY + 1 <= 9)  tmparray[1] = dmap[enemy[i].mapX][ enemy[i].mapY + 1];//下
                            if(enemy[i].mapX - 1 >= 0)  tmparray[2] = dmap[enemy[i].mapX - 1][ enemy[i].mapY];//左
                            if(enemy[i].mapX + 1 <= 9)  tmparray[3] = dmap[enemy[i].mapX + 1][ enemy[i].mapY];//右
                            if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY - 1 >= 0)  tmparray[4] = dmap[enemy[i].mapX - 1][ enemy[i].mapY - 1];//左上
                            if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY - 1 >= 0)  tmparray[5] = dmap[enemy[i].mapX + 1][ enemy[i].mapY - 1];//右上
                            if(enemy[i].mapX + 1 <= 9 && enemy[i].mapY + 1 <= 9)  tmparray[6] = dmap[enemy[i].mapX + 1][ enemy[i].mapY + 1];//右下
                            if(enemy[i].mapX - 1 >= 0 && enemy[i].mapY + 1 <= 9)  tmparray[7] = dmap[enemy[i].mapX - 1][ enemy[i].mapY + 1];//左下
                            direction = tmparray.indexOf(Math.max(...tmparray));
                            switch(direction){
                                case -1: break;
                                case 0 : enemy[i].yv += -ENEMYV ; break;
                                case 1 : enemy[i].yv += ENEMYV ; break;
                                case 2 : enemy[i].xv += -ENEMYV ; break;
                                case 3 : enemy[i].xv += ENEMYV ; break;
                                case 4 : enemy[i].xv += -ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                                case 5 : enemy[i].xv += ENEMYV ; enemy[i].yv += -ENEMYV ; break;
                                case 6 : enemy[i].xv += ENEMYV ; enemy[i].yv += ENEMYV ; break;
                                case 7 : enemy[i].xv += -ENEMYV ; enemy[i].yv += ENEMYV ; break;
                            }
                        }
                    }
                    break;
            }
        }
    }

    //collide to wall
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].x+enemy[i].xv >= 639.0) enemy[i].xv = 0.0;
        if(enemy[i].x+enemy[i].xv <= 0.0) enemy[i].xv = 0.0;
        if(enemy[i].y+enemy[i].yv >= 639.0) enemy[i].yv = 0.0;
        if(enemy[i].y+enemy[i].yv <= 0.0) enemy[i].yv = 0.0;
        if(map[now_mapnumber].elm[Math.floor((enemy[i].x+enemy[i].xv)/64)][Math.floor(enemy[i].y/64)] == 1 || map[now_mapnumber].elm[Math.floor((enemy[i].x+enemy[i].xv)/64)][Math.floor(enemy[i].y/64)] == 2) enemy[i].xv = 0.0;
        if(map[now_mapnumber].elm[Math.floor(enemy[i].x/64)][Math.floor((enemy[i].y+enemy[i].yv)/64)] == 1 || map[now_mapnumber].elm[Math.floor(enemy[i].x/64)][Math.floor((enemy[i].y+enemy[i].yv)/64)] == 2) enemy[i].yv = 0.0;
    }

    //collide to player
    for(var i = 0; i < enemynum; i++){
        if(distance(enemy[i].x+enemy[i].xv, enemy[i].y, player.x, player.y) <= 40) enemy[i].xv = 0.0;
        if(distance(enemy[i].x, enemy[i].y+enemy[i].yv, player.x, player.y) <= 40) enemy[i].yv = 0.0;
    }

    //collide to another enemy
    for(var j = 0; j < enemynum; j++){
        for(var i = 0; i < enemynum; i++){
            if(i != j){
                if(distance(enemy[j].x+enemy[j].xv, enemy[j].y, enemy[i].x, enemy[i].y) <= 40) enemy[j].xv = 0.0;
                if(distance(enemy[j].x, enemy[j].y+enemy[j].yv, enemy[i].x, enemy[i].y) <= 40) enemy[j].yv = 0.0;
            }
        }
    }

    //enemy's body angle
    for(var i = 0; i < enemynum; i++){
        var tmpr;
        tmpr = enemy[i].r;
        if(enemy[i].xv > 0.0 && enemy[i].yv == 0.0){
            if(enemy[i].r > -Math.PI/2.0 && enemy[i].r < Math.PI/2.0){
                enemy[i].r -= 0.025;
            }else{
                enemy[i].r += 0.025;
            }
        }
        if(enemy[i].xv < 0.0 && enemy[i].yv == 0.0){
            if(enemy[i].r > -Math.PI/2.0 && enemy[i].r < Math.PI/2.0){
                enemy[i].r += 0.025;
            }else{
                enemy[i].r -= 0.025;
            }
        }
        if(enemy[i].xv == 0.0 && enemy[i].yv < 0.0){
            if(enemy[i].r  < 0.0){
                enemy[i].r -= 0.025;
            }else{
                enemy[i].r += 0.025;
            }
        }
        if(enemy[i].xv == 0.0 && enemy[i].yv > 0.0){
            if(enemy[i].r  < 0.0){
                enemy[i].r += 0.025;
            }else{
                enemy[i].r -= 0.025;
            }
        }
        if(enemy[i].xv > 0.0 && enemy[i].yv < 0.0){
            if(enemy[i].r < Math.PI/4.0 && enemy[i].r > -(3.0*Math.PI)/4.0){
                enemy[i].r -= 0.025;
            }else{
                enemy[i].r += 0.025;
            }
        }
        if(enemy[i].xv > 0.0 && enemy[i].yv > 0.0){
            if(enemy[i].r < (3.0*Math.PI)/4.0 && enemy[i].r > -Math.PI/4.0){
                enemy[i].r -= 0.025;
            }else{
                enemy[i].r += 0.025;
            }
        }
        if(enemy[i].xv < 0.0 && enemy[i].yv < 0.0){
            if(enemy[i].r < (3.0*Math.PI)/4.0 && enemy[i].r > -Math.PI/4.0){
                enemy[i].r += 0.025;
            }else{
                enemy[i].r -= 0.025;
            }
        }
        if(enemy[i].xv < 0.0 && enemy[i].yv > 0.0){
            if(enemy[i].r > -(3.0*Math.PI)/4.0 && enemy[i].r < Math.PI/4.0){
                enemy[i].r += 0.025;
            }else{
                enemy[i].r -= 0.025;
            }
        }
        enemy[i].tr += enemy[i].r - tmpr;
        if(enemy[i].r <= -Math.PI) enemy[i].r += 2.0 * Math.PI;
        if(enemy[i].r >=  Math.PI) enemy[i].r -= 2.0 * Math.PI;
    }

    //add speed on point
    for(var i = 0; i < enemynum; i++){
        enemy[i].x += enemy[i].xv;
        enemy[i].y += enemy[i].yv;
    }

    //initialize enemy speed
    for(var i = 0; i < enemynum; i++){
        enemy[i].xv = 0.0;
        enemy[i].yv = 0.0;
    }
    
}

function movePlayerGunTower(){
    if(player.HP != 0){
        player.tr = Math.atan2(mouse.y - player.y, mouse.x- player.x) - (Math.PI / 2.0);
    }
}

function playerBullet(){
    for(var i = 0; i < PBULMAX; i++){
        pbullet[i].x += pbullet[i].xv;
        pbullet[i].y += pbullet[i].yv;

        if(pbullet[i].x < 0 || pbullet[i].x > 640 || pbullet[i].y < 0 || pbullet[i].y > 640){
            pbullet[i].x = -1.0;
            pbullet[i].y = -1.0;
            pbullet[i].xv = 0.0;
            pbullet[i].yv = 0.0;
            player.bulnum--;
        }
    }

    for(var j = 0; j < 10; j++){
        for(var i = 0; i < 10; i++){
            if(map[now_mapnumber].elm[i][j] == 1){
                for(var bul_i = 0; bul_i < PBULMAX; bul_i++){
                    if(pbullet[bul_i].x > i * 64 && pbullet[bul_i].x < (i+1) * 64 && pbullet[bul_i].y > j * 64 && pbullet[bul_i].y < (j+1) * 64){
                        pbullet[bul_i].x = -1.0;
                        pbullet[bul_i].y = -1.0;
                        pbullet[bul_i].xv = 0.0;
                        pbullet[bul_i].yv = 0.0;
                        player.bulnum--;
                    }
                }
            }
        }
    }

    if(loading != LOADINGTIME) loading++;
    if(loading == LOADINGTIME) player.shotable = true;

    if(player.bulnum == PBULMAX) player.shotable = false;
}

function moveEnemyGunTower(){

    //shotpoint
    for(var i = 0; i < enemynum; i++){
        enemy[i].shotpoint.x = player.x;
        enemy[i].shotpoint.y = player.y;
    }

    //can shot to player
    for(var i = 0; i < enemynum; i++){
        for(var k = 0; k < 50; k++){
            var bitx, bity;
            bitx = (enemy[i].x + Math.cos(Math.atan2(player.y - enemy[i].y, player.x - enemy[i].x)) * (distance(enemy[i].x, enemy[i].y, player.x, player.y)/50.0) * (k + 1));
            bity = (enemy[i].y + Math.sin(Math.atan2(player.y - enemy[i].y, player.x - enemy[i].x)) * (distance(enemy[i].x, enemy[i].y, player.x, player.y)/50.0) * (k + 1));
            ctx.fillRect(bitx, bity, 2, 2);
            if(map[now_mapnumber].elm[Math.floor(bitx/64)][ Math.floor(bity/64)] == 1){
                enemy[i].noshot = true;//見えていない
                break;
            }else{
                enemy[i].noshot = false;//見えている
            }
        }
    }

    //gun tower round
    for(var i = 0; i < enemynum; i++){
        if(enemy[i].HP != 0 && enemy[i].noshot == false){
            if((enemy[i].shotpoint.x - enemy[i].x) * Math.sin(enemy[i].tr) - (enemy[i].shotpoint.y - enemy[i].y) * Math.cos(enemy[i].tr) < 0){
                enemy[i].tr += ENEMYTRV;
            }else{
                enemy[i].tr -= ENEMYTRV;
            }
        }
    }
}

function enemyBullet(){

    //shot
    for(var i = 0; i < enemynum; i++){
        var difarg;
        difarg = Math.atan2(enemy[i].shotpoint.y - enemy[i].y, enemy[i].shotpoint.x - enemy[i].x) - enemy[i].tr;
        if(difarg % Math.PI > -ENEMYTRV && difarg % Math.PI < ENEMYTRV && enemy[i].noshot == false && enemy[i].loading == LOADINGTIME && Math.floor(Math.random() * 30) == 0 && enemy[i].HP != 0){
            for(var j = 0; j < EBULMAX; j++){
                if(enemy[i].bullet[j].x == -1.0){
                    enemy[i].bullet[j].r = enemy[i].tr;
                    enemy[i].bullet[j].x = enemy[i].x + Math.cos(enemy[i].tr) * 30.0;
                    enemy[i].bullet[j].y = enemy[i].y + Math.sin(enemy[i].tr) * 30.0;
                    enemy[i].bullet[j].xv = Math.cos(enemy[i].tr) * EBULV;
                    enemy[i].bullet[j].yv = Math.sin(enemy[i].tr) * EBULV;
                    enemy[i].bulnum++;
                    break;
                }
            }
            enemy[i].loading = 0;
        }
        if(enemy[i].loading != LOADINGTIME) enemy[i].loading++;
    }

    //init noshot
    for(var i = 0; i < enemynum; i++){
        enemy[i].noshot = false;
    }

    //add speed
    for(var i = 0; i < enemynum; i++){
        for(var j = 0; j < EBULMAX; j++){
            if(enemy[i].bullet[j].x != -1.0){
                enemy[i].bullet[j].x += enemy[i].bullet[j].xv;
                enemy[i].bullet[j].y += enemy[i].bullet[j].yv;
            }
        }
    }

    //collide to edge of canvas
    for(var i = 0; i < enemynum; i++){
        for(var j = 0; j < EBULMAX; j++){
            if(enemy[i].bullet[j].x != -1.0){
                if(enemy[i].bullet[j].x < 0 || enemy[i].bullet[j].x > 640 || enemy[i].bullet[j].y < 0 || enemy[i].bullet[j].y > 640){
                    enemy[i].bullet[j].x = -1.0;
                    enemy[i].bullet[j].y = -1.0;
                    enemy[i].bullet[j].xv = 0.0;
                    enemy[i].bullet[j].yv = 0.0;
                    enemy[i].bulnum--;
                }
            }
        }
    }

    //collide to wall
    for(var l = 0; l < 10; l++){
        for(var k = 0; k < 10; k++){
            if(map[now_mapnumber].elm[k][l] == 1){
                for(var i = 0; i < enemynum; i++){
                    for(var j = 0; j < EBULMAX; j++){
                        if(enemy[i].bullet[j].x != -1.0){
                            if(enemy[i].bullet[j].x > k * 64 && enemy[i].bullet[j].x < (k+1) * 64 && enemy[i].bullet[j].y > l * 64 && enemy[i].bullet[j].y < (l+1) * 64){
                                enemy[i].bullet[j].x = -1.0;
                                enemy[i].bullet[j].y = -1.0;
                                enemy[i].bullet[j].xv = 0.0;
                                enemy[i].bullet[j].yv = 0.0;
                                enemy[i].bulnum--;
                            }
                        }
                    }
                }
            }
        }
    }
}

function hitBullet(){

    if(player.HP != 0){
        for(var i = 0; i < enemynum; i++){
            if(enemy[i].HP != 0 && enemy[i].bulnum != 0){
                for(var j = 0; j < EBULMAX; j++){
                    if(enemy[i].bullet[j].x != -1.0 && distance(player.x, player.y, enemy[i].bullet[j].x, enemy[i].bullet[j].y) < 20){
                        player.HP--;
                        player.damage_timer = 0;
                        enemy[i].bullet[j].x = -1.0;
                        enemy[i].bullet[j].y = -1.0;
                        enemy[i].bullet[j].xv = 0.0;
                        enemy[i].bullet[j].yv = 0.0;
                        enemy[i].bulnum--;
                    }
                }
            }
        }
    }

    for(var i = 0; i < enemynum; i++){
        if(enemy[i].HP != 0){
            for(var j = 0; j < PBULMAX; j++){
                if(pbullet[j].x != -1.0 && distance(enemy[i].x, enemy[i].y, pbullet[j].x, pbullet[j].y) < 20){
                    enemy[i].HP--;
                    enemy[i].damage_timer = 0;
                    pbullet[j].x = -1.0;
                    pbullet[j].y = -1.0;
                    pbullet[j].xv = 0.0;
                    pbullet[j].yv = 0.0;
                    player.bulnum--;
                }
            }
        }
    }
}

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

    if(in_game){
        if(player.shotable){
            console.log("shotable");
            for(var i = 0; i < PBULMAX; i++){
                if(pbullet[i].x == -1.0){
                    pbullet[i].r = player.tr;
                    pbullet[i].x = player.x + Math.cos(player.tr + Math.PI / 2.0) * 30.0;
                    pbullet[i].y = player.y + Math.sin(player.tr + Math.PI / 2.0) * 30.0;
                    pbullet[i].xv = Math.cos(player.tr + Math.PI / 2.0) * PBULV;
                    pbullet[i].yv = Math.sin(player.tr + Math.PI / 2.0) * PBULV;
                    player.bulnum++;
                    break;
                }
            }
            loading = 0;
            player.shotable = false;
        }

        if(gameovertime > 100){
            init();
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

function distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2));
}