
<?php 

//  防止全局变量造成安全隐患
$admin = false;
//  启动会话，这步必不可少
session_start();
//  判断是否登陆
if (isset($_SESSION["admin"]) && $_SESSION["admin"] === true) {
    echo '{"login":"logged"}';
} else {
    //  验证失败，将 $_SESSION["admin"] 置为 false
    $_SESSION["admin"] = false;
    die("您无权访问");

}

?>