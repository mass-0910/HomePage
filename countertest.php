<!DOCTYPE html>

<html>
    <head>
        <meta http-equiv="Content-Script-Type" content="text/javascript">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="description" content="鮭男のホームページ">
        <meta name="keywords" contents="鮭男のオフィシャルホームページ。作ったゲーム、プラモデルなどの日記を書きます。">
        <title>Tips/鮭男のホームページ</title>
        <link rel="stylesheet" href="css/stylesheet.css">
        <link rel="icon" href="favicon.ico">
    </head>
    <body>
        <!-- header -->
        <script src="common_js/headermaker.js"></script>
        <script>header(0, 0)</script>
        <!-- <header>
            <img src="img/logo.png" alt="ロゴ" width="128" height="128">
            <div>
            <h1>鮭男のホームページ</h1>
            <nav>
                <ul>
                    <a href="index.html"><li class="selected">Tips</li></a>
                    <a href="about.html"><li>About</li></a>
                    <a href="blog.html"><li>Blog</li></a>
                    <a href="games.html"><li>Games</li></a>
                </ul>
            </nav>
            </div>
        </header> -->
        <hr>

        <!-- tips -->
        <div class="main">
            <?php
            $filename = 'counter.dat';　// counter.datというカウント数を書き込むテキストファイル
            
            $fp = fopen($filename, "r+");　// counter.datファイルを fopenで開く
            $count = fgets($fp,32);　// fgets関数でcounter.datに書かれたカウント数を読み込む
            $count++; // counter.datに書かれたカウント数を加算
            fseek($fp, 0); // fseek関数でcounter.datの読み書きを行う場所を先頭に戻す
            fputs($fp, $count); // fputs関数でカウントされた数をファイルに書き込む
            flock($fp, LOCK_UN); // flock関数でファイルを上書きされないようにロックする
            fclose($fp); // fclose関数でファイルを閉じる
            echo $count; // カウントされた数字を表示
            ?>
        </div>

        <!-- footer -->
        <footer>
            <hr>
            last update :
            <script type="text/javascript">
                document.write(document.lastModified);
            </script><br>
            © 2020 Shakeo
        </footer>
    </body>
</html>