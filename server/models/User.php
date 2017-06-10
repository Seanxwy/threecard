<?php
class UserModel extends BaseModel
{
	const INFO_KEY = 'user:';
	const AUTH_KEY = 'auth';
	const USERNAME_KEY = 'username_index';
	const USERID_KEY = 'userid';
	
	private $uid	= null;
	private $userinfo = null;
	
	public function __construct($uid = null, $load = true)
	{
		parent::__construct();
		
		$this->redis = RedisDB::factory('user');
		
		if($uid){
			//指定uid
			$this->uid = $uid;
		}else if($load){
			$this->uid = Socket::getUid(SESSIONID);
			if(!$this->uid){
				throw new Exception('Unauth');
			}
		}
	}
	
	public function getUid()
	{
		return $this->uid;
	}
	
	public function getInfo()
	{
		if($this->userinfo === null){
			$this->userinfo = $this->redis->hGetAll(self::INFO_KEY . $this->uid);
		}
		
		return $this->userinfo;
	}
	
	public function save($data)
	{
		$this->redis->hMSet(self::INFO_KEY . $this->uid, $data);
	}
	
	public function incr($key, $value)
	{
		$this->redis->hIncrBy(self::INFO_KEY . $this->uid, $key, $value);
	}
	
	public function login($username, $token)
	{
		$val = $this->redis->hGet(self::AUTH_KEY, $username);
		if($val != $token){
			//return false;
		}
		
		//remove auth info
		$this->redis->hDel(self::AUTH_KEY, $username);
		
		//get userid
		$this->uid = $this->redis->hGet(self::USERNAME_KEY, $username);
		if(!$this->uid){
			throw new Exception('UserNotExists');
		}
		
		return true;
	}
}