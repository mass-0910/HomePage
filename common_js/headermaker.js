function header(layernum, light_contents){
    var layer_urlstr = '';
    for(var i = 0; i < layernum; i++){
        layer_urlstr += '../';
    }
    var logo_url = layer_urlstr + 'img/logo.png';
    var tips_url = layer_urlstr + 'index.html';
    var about_url = layer_urlstr + 'about.html';
    var blog_url = layer_urlstr + 'blog.html';
    var games_url = layer_urlstr + 'games.html';

    document.write('<header>');
    document.write('<img src="' + logo_url+ '" alt="ロゴ" width="128" height="128">');
    document.write('<div>');
    document.write('<h1>鮭男のホームページ</h1>');
    document.write('<nav>');
    document.write('<ul>');
    if(light_contents == 0){
        document.write('<a href="' + tips_url + '"><li class="selected">Tips</li></a>');
    }else{
        document.write('<a href="' + tips_url + '"><li>Tips</li></a>');
    }
    if(light_contents == 1){
        document.write('<a href="' + about_url + '"><li class="selected">About</li></a>');
    }else{
        document.write('<a href="' + about_url + '"><li>About</li></a>');
    }
    if(light_contents == 2){
        document.write('<a href="' + blog_url + '"><li class="selected">Blog</li></a>');
    }else{
        document.write('<a href="' + blog_url + '"><li>Blog</li></a>');
    }
    if(light_contents == 3){
        document.write('<a href="' + games_url + '"><li class="selected">Games</li></a>');
    }else{
        document.write('<a href="' + games_url + '"><li>Games</li></a>');
    }
    document.write('</ul>');
    document.write('</nav>');
    document.write('</div>');
    document.write('</header>');
}