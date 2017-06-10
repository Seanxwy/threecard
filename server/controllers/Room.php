<?php
/**
 * @property UserModel $mUser
 */
class RoomController extends BaseController
{
	/**
	 * 初始化登录用户
	 */
	private function init()
	{
		$this->mUser = new UserModel();
	}
	
	/**
	 * 获取房间对像
	 * @return boolean|\RoomModel
	 */
	private function getGame()
	{
		$user = $this->mUser->getInfo();
		if(empty($user['roomid'])){
			throw new Exception('InvalidRequest');
		}
		
		return new RoomModel($this->mUser, $user['roomid']);
	}
	
	//获取房间信息
	public function infoAction()
	{
		$game = $this->getGame();
		$room = $game->getInfoEx();
		$this->success($room);
	}
	
	//准备
	public function readyAction()
	{
		$game = $this->getGame();
		if(!$game->ready()){
			$this->error($game->getError());
		}
	}
	
	//开始
	public function startAction()
	{
		$game = $this->getGame();
		if(!$game->start()){
			$this->error($game->getError());
		}
	}
	
	//加注
	public function raiseAction()
	{
		$game = $this->getGame();
		if(!$game->raise()){
			$this->error($game->getError());
		}
	}
	
	//跟注
	public function followAction()
	{
		$game = $this->getGame();
		if(!$game->follow()){
			$this->error($game->getError());
		}
	}
	
	//看牌
	public function lookAction()
	{
		$game = $this->getGame();
		$ret = $game->look();
		if(!$ret){
			$this->error($game->getError());
			return ;
		}
		
		$this->success($ret);
	}
	
	//弃牌
	public function giveupAction()
	{
		$game = $this->getGame();
		if(!$game->giveup()){
			$this->error($game->getError());
		}
	}
	
	//比牌
	public function pkAction()
	{
		$data = $this->getRequest()->getParams();
		$game = $this->getGame();
		if(!$game->pk($data['seatid'])){
			$this->error($game->getError());
		}
	}
	
	//解散
	public function disbandAction()
	{
		$game = $this->getGame();
		if(!$game->disband()){
			$this->error($game->getError());
		}
	}
}