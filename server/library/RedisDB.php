<?php
/**
 * db工厂类(基于redis)
 */
class RedisDB extends Redis
{
	private static $_config = null;
	private static $_instance = array();
	
	public function __construct($params)
	{
		parent::__construct();

		if ($params['pconnect']) {
			$this->pconnect($params['host'], $params['port'], 0, $params['handle']);
		} else {
			$this->connect($params['host'], $params['port']);
		}

		if ($params['prefix']){
			$this->setOption(Redis::OPT_PREFIX, $params['prefix']);
		}
	}
	
	public function hMDel($key, $mems)
	{
		array_unshift($mems, $key);
		return call_user_func_array(array($this, 'hDel'), $mems);
	}
	
	static public function factory($name)
	{
		//check instance exists
		if(isset(self::$_instance[$name])){
			return self::$_instance[$name];
		}
		
		//load config
		if(self::$_config === null){
			self::$_config = require(APP_PATH . '/config/redis.php');
		}
		
		//check config item
		if(!isset(self::$_config[$name])){
			echo "redis config not found($name)\n";
			return false;
		}
		
		//new redis
		$redis = new self(self::$_config[$name]);
		self::$_instance[$name] = $redis;
		
		return $redis;
	}
}