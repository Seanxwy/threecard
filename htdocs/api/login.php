<?php
if(isset($_COOKIE['three_user']) && isset($_COOKIE['three_token'])){
	$result = array(
		'auth' => true,
		'username' => $_COOKIE['three_user'],
		'token' => $_COOKIE['three_token'],
	);
}else{
	include 'include/config.inc.php';
	/*$appid = APP_ID;
	$redirect_url = urlencode('http://www.xx.com/callback.php');
	$url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={$appid}&redirect_uri={$redirect_url}&response_type=code&scope=snsapi_userinfo&state=STATE&connect_redirect=1#wechat_redirect";
	$data = array(
		'auth' => false,
		'url' => $url,
	);*/
	
	$redis = new Redis();
	$redis->connect(REDIS_HOST, REDIS_PORT);
	$redis->setOption(Redis::OPT_PREFIX, REDIS_PREFIX);
	$uid = $redis->incr('userid');
	do{
		$username = randUsername();
		$ret = $redis->hSetNx('username_index', $username, $uid);
		if($ret){
			break;
		}
	}while(true);
	
	//register
	$nickname = randNickname($uid);
	$user = array(
		'uid' => $uid,
		'username' => $username,
		'nickname' => $nickname,
		'gamepoint' => 0,
		'gold' => 100,
		'regdate' => time(),
	);
	$redis->hMSet("user:$uid", $user);
	
	//write auth info
	$token = md5(date('YmdHis') . mt_rand(1000, 9999) . $username);
	$redis->hSet('auth', $username, $token);
	
	//setcookie
	setcookie('three_user', $username, time() + 86400);
	setcookie('three_token', $token, time() + 86400);

	//ret
	$result = array(
		'auth' => true,
		'username' => $username,
		'token' => $token,
	);
}

echo json_encode($result);

function randUsername()
{
	$str = '0123456789abcdefghijklnmopqrstuvwxyz';
	$len = strlen($str);
	$ret = '';
	for($i = 0; $i < 8; ++$i){
		$idx = mt_rand(0, $len - 1);
		$ret.= $str{$idx};
	}
	return $ret;
}

function randNickname($uid)
{
	return "游客$uid";
}