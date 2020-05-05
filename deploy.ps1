$now_time = Get-Date -Format "yyyy/MM/dd HH:mm:ss"
$commit_message = "deploy at " + $now_time
if ($args.Length -ne 0) {
    $commit_message += " '" + $args + "'"
}
echo $commit_message
git add .
git commit -m $commit_message
git push origin master