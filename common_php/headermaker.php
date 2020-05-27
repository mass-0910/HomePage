<?php

function header_make($layernum, $light_contents){
    $layer_urlstr = '';
    for($i = 0; $i < $layernum; $i++){
        $layer_urlstr .= '../';
    }
    $logo_url = $layer_urlstr . 'img/logo.png';
    $tips_url = $layer_urlstr . 'index.html';
    $about_url = $layer_urlstr . 'about.html';
    $blog_url = $layer_urlstr . 'blog.html';
    $games_url = $layer_urlstr . 'games.html';
    
    echo '<header>';
    echo '<img src="' . $logo_url . '" alt="ロゴ" width="128" height="128">';
    echo '<div>';
    echo '<h1>鮭男のホームページ</h1>';
    echo '<nav>';
    echo '<ul>';
    if($light_contents == 0){
        echo '<a href="' . $tips_url . '"><li class="selected">Tips</li></a>';
    }else{
        echo '<a href="' . $tips_url . '"><li>Tips</li></a>';
    }
    if($light_contents == 1){
        echo '<a href="' . $about_url . '"><li class="selected">About</li></a>';
    }else{
        echo '<a href="' . $about_url . '"><li>About</li></a>';
    }
    if($light_contents == 2){
        echo '<a href="' . $blog_url . '"><li class="selected">Blog</li></a>';
    }else{
        echo '<a href="' . $blog_url . '"><li>Blog</li></a>';
    }
    if($light_contents == 3){
        echo '<a href="' . $games_url . '"><li class="selected">Games</li></a>';
    }else{
        echo '<a href="' . $games_url . '"><li>Games</li></a>';
    }
    echo('</ul>');
    echo('</nav>');
    echo('</div>');
    echo('</header>');
}

?>