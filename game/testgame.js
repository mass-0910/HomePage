window.addEventListener('load', init);

var canvas;
var ctx;

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;

var lastTimeStamp = null;

var mouse = { x: 0, y: 0 };

var block = [];
var BLOCK_NUM = (SCREEN_WIDTH / 32) * ( (SCREEN_HEIGHT - 200) / 10);

var player = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };

function init(){

    // canvas initialize
    canvas = document.getElementById("maincanvas");
    ctx = canvas.getContext('2d');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    // loading assets
    Asset.loadAssets(function(){
        requestAnimationFrame(update);
    });

    // set mousemove listener
    canvas.addEventListener('mousemove', function(evt){
        var canvasRect = canvas.getBoundingClientRect();
        mouse = {
            x: evt.clientX - canvasRect.left,
            y: evt.clientY - canvasRect.top
        } 
    });

    // initialize block
    for(var i = 0; i < BLOCK_NUM; i++){
        block[i] = { x: (i * 32) % SCREEN_WIDTH, y: Math.floor(i / Math.floor(SCREEN_WIDTH / 32)) * 10};
        console.log("index:" + i + " x:" + block[i].x + " y:" + block[i].y);
    }
};

function update(timestamp){

    // time from before frame
    var delta = 0;
    if(lastTimeStamp != null){
        delta = (timestamp - lastTimeStamp) / 1000;
    }
    lastTimeStamp = timestamp;

    draw();

    requestAnimationFrame(update);
};

function draw(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['back'], 0, 0);
    block.forEach(function(a_block){
        ctx.drawImage(Asset.images['block'], a_block.x, a_block.y);
    });

    ctx.fillStyle = "white";
    ctx.fillRect(mouse.x - 32, 400, 64, 10);
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

