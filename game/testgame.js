window.addEventListener('load', init);

var canvas;
var ctx;

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;

function init(){
    canvas = document.getElementById("maincanvas");
    ctx = canvas.getContext('2d');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    Asset.loadAssets(function(){
        requestAnimationFrame(update);
    })
};

function update(){
    draw();
    requestAnimationFrame(update);
};

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Asset.images['back'], 0, 0);
    ctx.drawImage(Asset.images['chara'], 0, 0);
};

var Asset = {};

Asset.assets = [
    { type: 'image', name: 'back', src: 'img/black.png' },
    { type: 'image', name: 'chara', src: 'img/player.png'}
];

Asset.images = {};

Asset.loadAssets = function(onComplete){
    var total = Asset.assets.length;
    var loadCount = 0;

    var onLoad = function(){
        loadCount++;
        console.log("count : " + loadCount);
        if(loadCount >= total){
            console.log("ほな、また。。。");
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