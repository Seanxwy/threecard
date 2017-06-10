<?php
/**
 * 分布式锁(基于redis)
 */
class DMutex
{
	static public function lock($name, $ttl = 5)
	{
		$redis = RedisDB::factory('game');
		$ret = $redis->set("mutex_{$name}", 1, array('nx', 'ex' => $ttl));
		return $ret;
	}
	
	static public function unlock($name)
	{
		$redis = RedisDB::factory('game');
		$redis->del("mutex_{$name}");
	}
}