<?php
/**
 * Socket封装，用于数据打包、解包、广播、组播和用户映射
 */
class Socket
{
	const SESSION_2_USERID = 'socket:session2userid';
	const USERID_2_SESSION = 'socket:userid2session';
	
	/**
	 * 消息解包
	 * @param string $data
	 * @return array
	 */
	static public function unpackMsg($data)
	{
		return json_decode($data, true);
	}
	
	/**
	 * 消息打包
	 * @param string $c
	 * @param string $m
	 * @param mixed $data
	 * @param int $error
	 * @return type
	 */
	static public function packMsg($c, $m, $data, $error = 0)
	{
		$packet = array(
			'c' => $c,
			'm' => $m,
			'err' => $error,
			'data' => $data,
		);
		
		if(!$error){
			$pname = strtolower($c . '_' . $m);
			$packet['data'] = Protox::make($pname, $packet['data']);
		}
		
		$msg = json_encode($packet);
		
		return $msg;
	}
	
	/**
	 * 将消息直接返回给当前会话者
	 * @param string $c
	 * @param string $m
	 * @param mixed $data
	 * @param int $error
	 */
	static public function reply($c, $m, $data, $error = 0)
	{
		$msg = self::packMsg($c, $m, $data, $error);
		if(!defined('IS_DEBUG')){
			$len = strlen($msg);
			header("Content-Length: $len");
			header("Content-Offset: -$len");
		}
		echo $msg;
	}
	
	/**
	 * 给所有人发消息
	 * @param string $c
	 * @param string $m
	 * @param mixed $data
	 * @param int $error
	 */
	static public function sendToAll($c, $m, $data, $error = 0)
	{
		$router = self::getRouter();
		$msg = self::packMsg($c, $m, $data, $error);
		$router->sendAllMsg($msg);
	}
	
	/**
	 * 给指定人发消息
	 * @param string|array $uid
	 * @param string $c
	 * @param string $m
	 * @param mixed $data
	 * @param int $error
	 */
	static public function sendToUser($uid, $c, $m, $data, $error = 0)
	{
		$router = self::getRouter();
		$msg = self::packMsg($c, $m, $data, $error);
		$sids = self::getSessionId($uid);
		if($sids){
			$router->sendMsg(is_array($sids) ? implode("", $sids) : $sids, $msg);
		}
	}
	
	/**
	 * 给频道发消息
	 * @param string $channel
	 * @param string $c
	 * @param string $m
	 * @param mixed $data
	 * @param int $error
	 */
	static public function sendToChannel($channel, $c, $m, $data, $error = 0)
	{
		$router = self::getRouter();
		$msg = self::packMsg($c, $m, $data, $error);
		$router->publish($channel, $msg);
	}
	
	/**
	 * 关闭连接
	 * @param string $sid
	 */
	static public function close($sid)
	{
		$router = self::getRouter();
		$router->kickUser($sid);
	}
	
	/**
	 * @return \RouterClient
	 */
	static public function getRouter()
	{
		static $router = null;
		if($router === null){
			$cfg = require(APP_PATH . '/config/router.php');
			$router = new RouterClient();
			$router->connect($cfg['host'], $cfg['port']);
		}
		return $router;
	}
	
	/**
	 * 绑定sessionid与uid映射关系
	 * @param string $sid
	 * @param string $uid
	 */
	static public function bind($sid, $uid)
	{
		$redis = RedisDB::factory('game');
		$redis->hSet(self::SESSION_2_USERID, $sid, $uid);
		$redis->hSet(self::USERID_2_SESSION, $uid, $sid);
	}
	
	/**
	 * 解除sessionid与uid映射关系
	 * @param string $sid
	 * @param string $uid
	 */
	static public function unbind($sid, $uid)
	{
		$redis = RedisDB::factory('game');
		$redis->hDel(self::SESSION_2_USERID, $sid);
		
		//atomic delete
		$script = "local oldsid=redis.call('hGet', KEYS[1], ARGV[1]);\n";
		$script.= "if oldsid ~= ARGV[2] then return false;end;";
		$script.= "redis.call('hDel', KEYS[1], ARGV[1]);\n";
		$script.= "return true;";
		$ret = $redis->eval($script, array(self::USERID_2_SESSION, "", $uid, $sid), 2);
		
		return $ret;
	}
	
	/**
	 * 用uid取对应sessionid
	 * @param array|string $uid
	 * @return array|string
	 */
	static public function getSessionId($uid)
	{
		$redis = RedisDB::factory('game');
		$uids = is_array($uid) ? $uid : array($uid);
		$sids = $redis->hMGet(self::USERID_2_SESSION, $uids);
		return is_array($uid) ? $sids : current($sids);
	}
	
	/**
	 * 用sessionid取对应uid
	 * @param array|string $sid
	 * @return array|string
	 */
	static public function getUid($sid)
	{
		$redis = RedisDB::factory('game');
		$sids = is_array($sid) ? $sid : array($sid);
		$uids = $redis->hMGet(self::SESSION_2_USERID, $sids);
		return is_array($sid) ? $uids : current($uids);
	}
}