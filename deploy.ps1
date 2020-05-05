$now_time = Get-Date -Format "yyyy/MM/dd HH:mm:ss"
$commit_message = "deploy at " + $now_time
if ($args.Length -ne 0) {
    $commit_message += " '" + $args + "'"
}
$notification_message = "commit message : [" + $commit_message + "]"
Write $notification_message
$input = Read-Host "Are you sure to start to deploy?(y/n)"
switch($input){
    "y" {
        git add .
        git commit -m $commit_message
        git push origin master
    }
    "n" {
        exit
    }
    default {
        Write "you wrote other character without 'y' or 'n'."
    }
}