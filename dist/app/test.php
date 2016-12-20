<?php 
// echo '<script>alert(98989898)</script>';
//  保存一天
$lifeTime = 24 * 3600;
//  取得当前 Session 名，默认为 PHPSESSID
// $sessionName = session_name();
//  取得 Session ID
$sessionID = $_GET["sessionID"];
//  使用 session_id() 设置获得的 Session ID
// session_id($sessionID); 

// session_set_cookie_params($lifeTime);
// session_start();
// $_SESSION['admin'] = true;
echo $sessionID;
if($sessionID == 'testSession'){
    echo '<script>location.hash="#login"</script>';
}
?>