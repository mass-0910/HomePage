<?php

function comment(){
    $filename = '/cgi-bin/' . basename(__FILE__, ".php") . '_comment.txt';
    $now_date = null;
    $data = null;
    date_default_timezone_set('Asia/Tokyo');
    $now_date = date("Y-m-d H:i:s");

    $split_data = null;
    $message = array();
    $message_array = array();
    
    if(!empty($_POST['btn_submit'])){

        if(empty($_POST['name'])){
            $error_message[] = '名前を入力してください。';	
        } else {
            $clean['view_name'] = htmlspecialchars( $_POST['name'], ENT_QUOTES);
            $clean['view_name'] = preg_replace( '/\\r\\n|\\n|\\r/', '', $clean['view_name']);
        }
        if(empty($_POST['comment'])) {
            $error_message[] = 'コメントを入力してください。';
        } else {
            $clean['message'] = htmlspecialchars( $_POST['comment'], ENT_QUOTES);
            $clean['message'] = preg_replace( '/\\r\\n|\\n|\\r/', '<br>', $clean['message']);
        }

        if(empty($error_message)){
            if($fp = fopen($filename, "a")){
                $data = "'".$clean['view_name']."','".$clean['message']."','".$now_date."'\n";
                fputs($fp, $data);
                fclose($fp);
            }else{
                echo 'fileopen a failed';
            }
        }
    }

    if($fp = fopen( $filename,'r')) {
        while($data = fgets($fp)){
            //echo $data . "<br>";
            $split_data = preg_split( '/\'/', $data);
            $message = array(
                'view_name' => $split_data[1],
                'message' => $split_data[3],
                'post_date' => $split_data[5]
            );
            array_unshift( $message_array, $message);
        }
        fclose($fp);
    }else{
        echo '<p>まだコメントは投稿されていません。</p>';
    }

    echo '<br>';
    if( !empty($error_message) ){
        echo '<ul class="error_message">';
        foreach( $error_message as $value ){
            echo '<li>' . $value . '</li>';
        }
        echo '</ul>';
    }
    if( !empty($message_array) ){
        foreach( $message_array as $value ){
            echo '<article>';
            echo '<div class="info">';
            echo '<h2>' . $value['view_name'] . '</h2>';
            echo '<time>' . date('Y年m月d日 H:i', strtotime($value['post_date'])) . '</time>';
            echo '</div>';
            echo '<p>' . $value['message'] . '</p>';
            echo '</article>';
        }
    }
}

?>