<?php
class IndexController extends BaseController
{
	public function indexAction()
	{
		$this->success('hello world');
	}
	
	//登录
	public function loginAction()
	{
		$data = $this->getRequest()->getParams();
		$mUser = new UserModel(null, false);
		if(!$mUser->login($data['username'], $data['token'])){
			$this->error('InvalidToken');
			return ;
		}
		
		//关闭原连接
		$uid = $mUser->getUid();
		$oldsid = Socket::getSessionId($uid);
		if($oldsid){
			Socket::close($oldsid);
		}
		
		//绑定socket
		Socket::bind(SESSIONID, $uid);
		
		//获取数据
		$user = $mUser->getInfo();
		
		$this->success($user);
	}
	
	//注册(测试用)
	public function registerAction()
	{
		$data = $this->getRequest()->getParams();
		$username = trim($data['username']);
		$nickname = trim($data['nickname']);
		if(!$username){
			$this->error('InvaludUserName');
			return ;
		}
		if(!$nickname){
			$this->error('InvalidNickName');
			return ;
		}
		
		$redis = RedisDB::factory('user');
		$uid = $redis->incr(UserModel::USERID_KEY);
		$ret = $redis->hSetNx(UserModel::USERNAME_KEY, $username, $uid);
		if(!$ret){
			$this->error('UserNameExists');
			return ;
		}
		
		//write user info
		$user = array(
			'uid' => $uid,
			'username' => $username,
			'nickname' => $nickname,
			'gamepoint' => 0,
			'gold' => 20,
			'regdate' => time(),
		);
		$redis->hMSet(UserModel::INFO_KEY . $uid, $user);
		
		//write auth info
		$token = md5(date('YmdHis') . mt_rand(1000, 9999) . $username);
		$redis->hSet(UserModel::AUTH_KEY, $data['username'], $token);
		
		$this->success(array(
			'username' => $username,
			'token' => $token,
		));
	}
	
	//客户端连接
	public function onConnectAction()
	{
		//TODO
	}
	
	//客户端关闭
	public function onCloseAction()
	{
		$mUser = new UserModel();
		$uid = $mUser->getUid();
		$ret = Socket::unbind(SESSIONID, $uid);
		
		//玩家离线处理
		if($ret){
			$user = $mUser->getInfo();
			if(!empty($user['roomid'])){
				$mRoom = new RoomModel($mUser, $user['roomid']);
				$mRoom->offline($user['seatid']);
			}
		}
	}
	
	//创建房间
	public function createAction()
	{
		$mUser = new UserModel();
		$user = $mUser->getInfo();
		if($user['gold'] < 5){
			$this->error('GoldLess');
			return ;
		}
		
		if(!empty($user['roomid'])){
			$this->error('InRoom');
			return ;
		}
		
		$mGame = new RoomModel($mUser);
		$ret = $mGame->create();
		if(!$ret){
			$this->error('CreateFailed');
			return ;
		}
		
		//update user info
		$mUser->save(array(
			'roomid' => $mGame->getId(),
		));
		
		$this->success($ret);
	}
	
	//加入房间
	public function joinAction()
	{
		$data = $this->getRequest()->getParams();
		$roomid = $data['roomid'];
		if(!$roomid){
			$this->error('InvalidRoomId');
			return ;
		}
		
		$mUser = new UserModel();
		$user = $mUser->getInfo();
		if($user['gold'] < 5){
			$this->error('GoldLess');
			return ;
		}
		
		if(!empty($user['roomid'])){
			$this->error('InRoom');
			return ;
		}
		
		$mGame = new RoomModel($mUser, $roomid);
		$ret = $mGame->join($user['uid']);
		if(!$ret){
			$this->error('PositionLess');
			return ;
		}
		
		$this->success($ret);
	}
	
	//退出房间
	public function leaveAction()
	{
		$mUser = new UserModel();
		$user = $mUser->getInfo();
		if(!$user['roomid']){
			$this->error('NotInRoom');
			return ;
		}
		
		$mGame = new RoomModel($mUser, $user['roomid']);
		$ret = $mGame->leave();
		if(!$ret){
			$this->error('LeaveFailed');
			return ;
		}
		
		$this->success();
	}
}
