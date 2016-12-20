<?php
//  表单提交后...
$posts = $_POST;
//  清除一些空白符号
foreach ($posts as $key => $value) {
    $posts[$key] = trim($value);
}
$password = md5($posts["password"]);
$phoneNum = $posts["phoneNum"];

// $query = "SELECT `username` FROM `user` WHERE `password` = '$password' AND `username` = '$username'";
// //  取得查询结果
// $userInfo = $DB->getRow($query); 

$userInfo = 'admin';

if (!empty($userInfo)) {
    //  当验证通过后，启动 Session
    session_start();
    //  注册登陆成功的 admin 变量，并赋值 true
    $_SESSION[$phoneNum] = true;
    //  保存一天
$lifeTime = 24 * 3600;
setcookie(session_name(), session_id(), time() + $lifeTime, "/");

    echo '{"login":"success","phoneNum":"'.$phoneNum.'"}';
} else {
    die("用户名密码错误");
}
?>