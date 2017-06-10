<?php
/**
 * @property  UserModel $mUser
 */
class RoomModel extends BaseModel
{
	const LIST_KEY = 'roomlist';
	const PLAYING_KEY = "room_playing_list";
	const INFO_KEY = 'room:';
	const MAX_POS = 5;
	const DEFAULT_POINT = 10000;
	const MAX_POINT = 4;
	const MAX_STEP = 5;
	const TIMER_DELAY = 16;//后端延迟16s
	
	//玩家状态
	const STATE_NONE = 0;
	const STATE_READY = 1;
	const STATE_PLAYING = 2;
	
	private $mUser = null;
	private $id	= null;
	private $uid = null;
	private $info = null;
	
	public function __construct($mUser, $id = null)
	{
		$this->mUser = $mUser;
		$this->id = $id;
		$this->uid = $this->mUser->getUid();
		$this->redis = RedisDB::factory('game');
	}
	
	public function getId()
	{
		return $this->id;
	}
	
	public function getInfo()
	{
		if($this->info === null){
			$info = $this->redis->hGetAll(self::INFO_KEY . $this->id);
			if(!$info){
				throw new Exception('RoomNotFound');
			}
			
			for($i = 1; $i <= self::MAX_POS; ++$i){
				$seatkey = "seat$i";
				if(isset($info[$seatkey])){
					$info[$seatkey] = json_decode($info[$seatkey], true);
				}
			}
			
			//coin list
			$info['coins'] = empty($info['coins']) ? array() : json_decode($info['coins'], true);
			
			$this->info = $info;
		}
		
		return $this->info;
	}
	
	public function getInfoEx()
	{
		$info = $this->getInfo();
		$users = array();
		$myseatid = 0;
		for($i = 1; $i <= self::MAX_POS; ++$i){
			$seatKey = "seat$i";
			if(empty($info[$seatKey])){
				continue;
			}
			
			$seat = $info[$seatKey];
			$mUser = new UserModel($seat['uid']);
			$user = $mUser->getInfo();
			$seat['name'] = $user['nickname'];
			$seat['avatar'] = $user['avatar'];
			$seat['offline'] = isset($info["exit$i"]);
			
			//myself
			if($seat['uid'] == $this->uid){
				$myseatid = $seat['seatid'];
				$seat['offline'] = 0;
				$info['cards'] = empty($seat['look']) ? array() : $seat['cards'];
			}
			
			$users[] = $seat;
		}
		
		$info['seatid'] = $myseatid;
		$info['users'] = $users;
		
		//send online state
		$exitkey = "exit{$myseatid}";
		if(isset($info[$exitkey])){
			$this->redis->hDel(self::INFO_KEY . $this->id, $exitkey);
			Socket::sendToChannel("game-{$this->id}", "Room", "online", array(
				'seatid' => $myseatid,
			));
		}
		
		//join
		Socket::getRouter()->addChannel("game-{$this->id}", SESSIONID);
		
		return $info;
	}
	
	public function offline($seatid)
	{
		$this->redis->hSet(self::INFO_KEY . $this->id, "exit{$seatid}", 1);
		Socket::sendToChannel("game-{$this->id}", "Room", "offline", array(
			'seatid' => $seatid,
		));
	}
	
	public function create()
	{
		//随机生成房间号
		do{
			$id = mt_rand(10000000, 99999999);
			$ret = $this->redis->hSetNx(self::LIST_KEY, $id, time());
			if(!$ret){
				continue;
			}
			
			break;
		}while(true);
		
		$uid = $this->mUser->getUid();
		$seat = array(
			'uid' => $uid,
			'seatid' => 1,
			'state' => self::STATE_NONE,
			'total' => self::DEFAULT_POINT,
			'point' => 0,
		);
		$this->id = $id;
		$this->info = array(
			'id' => $id,
			'owner' => $uid,//房主
			'time' => time(),//创建时间
			'state' => 0,//状态
			'total' => 0,//总注
			'point' => 0,//当前注
			'max' => self::MAX_POINT,//最大注
			'step' => 0,//局数
			'seat1' => json_encode($seat),
		);
		$this->redis->hMSet(self::INFO_KEY . $id, $this->info);
		
		$this->mUser->save(array(
			'roomid' => $id,
			'seatid' => 1,
		));
		
		return array(
			'roomid' => $id,
			'seatid' => 1,
		);
	}
	
	private function setTimer()
	{
		$this->redis->zadd(self::PLAYING_KEY, time() + self::TIMER_DELAY, $this->id);
	}
	
	private function delTimer()
	{
		$this->redis->zrem(self::PLAYING_KEY, $this->id);
	}
	
	public function disband()
	{
		$room = $this->getInfo();
		if($this->uid != $room['owner']){
			$this->_error = 'NoPermission';
			return false;
		}
		
		if($room['state']){
			$this->_error = 'Started';
			return false;
		}
		
		//结算
		$list = array();
		$lastMaxIndex = -1;
		$lastMaxPoint = 0;
		$balance = $room['step'] > 0;
		for($i = 1; $i <= self::MAX_POS; ++$i){
			$seatkey = "seat$i";
			
			if(empty($room[$seatkey])){
				continue;
			}
			
			$seat = $room[$seatkey];
			$mUser = new UserModel($seat['uid']);
			$mUser->save(array(
				'roomid' => 0,
				'seatid' => 0,
			));
			
			if($balance){
				$king = false;
				$point2 = $seat['total'] - self::DEFAULT_POINT;
				if($lastMaxIndex == -1){
					$lastMaxIndex = count($list);
					$lastMaxPoint = $point2;
					$king = true;
				}else{
					if($point2 > $lastMaxPoint){
						$list[$lastMaxIndex]['king'] = false;
						$king = true;
						$lastMaxIndex = count($list);
						$lastMaxPoint = $point2;
					}
				}
				
				$list[] = array(
					'seatid' => $i,
					'total' => $seat['total'],
					'point' => $point2,
					'king' => $king,
				);
			}
		}
		
		$this->redis->del(self::INFO_KEY . $room['id']);
		
		Socket::sendToChannel("game-{$this->id}", "Room", "disband", array(
			'list' => $list,
		));
		
		return true;
	}
	
	public function join()
	{
		$uid = $this->mUser->getUid();
		$info = $this->getInfo();
		$pos = 0;
		for($i = 1; $i <= self::MAX_POS; ++$i){
			$seatKey = "seat$i";
			if(!empty($info[$seatKey])){
				continue;
			}
			
			if(!$this->redis->hSetNx(self::INFO_KEY . $this->id, $seatKey, $uid)){
				continue;
			}
			
			$pos = $i;
			break;
		}
		
		if($pos){
			$seat = array(
				'uid' => $uid,
				'seatid' => $pos,
				'state' => self::STATE_NONE,
				'total' => self::DEFAULT_POINT,
				'point' => 0,
			);
			$this->redis->hSet(self::INFO_KEY . $this->id, $seatKey, json_encode($seat));
			$this->mUser->save(array(
				'roomid' => $this->id,
				'seatid' => $pos,
			));
			
			//notify
			$user = $this->mUser->getInfo();
			Socket::sendToChannel("game-{$this->id}", "Room", "join", array(
				'uid' => $uid,
				'seatid' => $pos,
				'state' => self::STATE_NONE,
				'total' => self::DEFAULT_POINT,
				'name' => $user['nickname'],
				'avatar' => $user['avatar'],
			));
		}else{
			$this->_error = 'PositionLess';
			return false;
		}
		
		return array(
			'roomid' => $this->id,
			'seatid' => $pos,
		);
	}
	
	public function ready()
	{
		$room = $this->getInfo();
		if($this->uid == $room['owner']){
			$this->_error = 'Nothing';
			return false;
		}
		
		if($room['state']){
			$this->_error = 'Started';
			return false;
		}
		
		$user = $this->mUser->getInfo();
		$seatkey = "seat" . $user['seatid'];
		$seat = $room[$seatkey];
		if($seat['state']){
			$this->_error = 'Already';
			return false;
		}
		
		$this->lock();
		$seat['state'] = self::STATE_READY;
		$this->redis->hSet(self::INFO_KEY . $this->id, $seatkey, json_encode($seat));
		$this->unlock();
		
		Socket::sendToChannel("game-{$this->id}", "Room", "ready", array(
			'seatid' => $user['seatid'],
		));
		
		return true;
	}
	
	public function start()
	{
		$room = $this->getInfo();
		if($this->uid != $room['owner']){
			$this->_error = 'NoPermission';
			return false;
		}
		
		if($room['state']){
			$this->_error = 'Started';
			return false;
		}
		
		//检测是否所有玩家都准备
		$num = 0;
		$user = $this->mUser->getInfo();
		$update = array();
		$cards = $this->makeCards();
		for($i = 1; $i <= self::MAX_POS; ++$i){
			if(!isset($room["seat$i"])){
				continue;
			}
			
			$seat = $room["seat$i"];
			if($i != $user['seatid'] && !$seat['state']){
				$this->_error = 'PlayerStateError';
				return false;
			}
			
			//更新所有人状态
			$seat['state'] = self::STATE_PLAYING;
			$seat['point'] = 1;
			$seat['cards'] = $this->sortCard(array_slice($cards, $num * 3, 3));
			$update["seat$i"] = json_encode($seat);
	
			//人数+1
			$num++;
		}
		
		//是否大于2人
		if($num < 2){
			$this->_error = 'PlayerLess';
			return false;
		}
		
		$this->lock();
		$update['current'] = 1;
		$update['state'] = 1;
		$update['total'] = $num;
		$update['point'] = 1;
		$update['coins'] = json_encode(array_fill(0, $num, 1));
		$this->redis->hMSet(self::INFO_KEY . $this->id, $update);
		$this->unlock();
		
		//设置后端定时器
		$this->setTimer();
		
		Socket::sendToChannel("game-{$this->id}", "Room", "start", array(
			'total' => $update['total'],
			'point' => $update['point'],
			'userpoint' => $update['point'],
			'current' => $update['current'],
		));
		
		return true;
	}
	
	public function raise()
	{
		$this->_error = 'RaiseFailed';
		
		$room = $this->getInfo();
		if(!$room['state']){
			return false;
		}
		
		if($room['point'] >= $room['max']){
			return false;
		}
		
		$user = $this->mUser->getInfo();
		if($user['seatid'] != $room['current']){
			return false;
		}
		
		//加锁
		$this->lock();
		
		//更新数据
		$seatkey = "seat" . $user['seatid'];
		$seat = $room[$seatkey];
		$multi = empty($seat['look']) ? 1 : 2;
		$room['point']*= 2;
		$addpoint = ($room['point'] * $multi);
		$room['current'] = $this->getNext($room);
		$seat['point']+= $addpoint;
		$room['total']+= $addpoint;
		$room['coins'][] = $addpoint;
		$this->redis->hMSet(self::INFO_KEY . $this->id, array(
			'point' => $room['point'],
			'total' => $room['total'],
			'current' => $room['current'],
			$seatkey => json_encode($seat),
			'coins' => json_encode($room['coins']),
		));
		
		//更新定时器
		$this->setTimer();
		
		//通知
		Socket::sendToChannel("game-{$this->id}", "Room", "raise", array(
			'seatid' => $user['seatid'],
			'total' => $room['total'],
			'point' => $room['point'],
			'user_point' => $seat['point'],
			'add_point' => $addpoint,
			'current' => $room['current'],
		));
		
		//解锁
		$this->unlock();
		
		return true;
	}
	
	public function follow()
	{
		$this->_error = 'FollowFailed';
		
		$room = $this->getInfo();
		if(!$room['state']){
			return false;
		}
		
		$user = $this->mUser->getInfo();
		if($user['seatid'] != $room['current']){
			return false;
		}
		
		//加锁
		$this->lock();
		
		//数据更新
		$seatkey = "seat" . $user['seatid'];
		$seat = $room[$seatkey];
		$multi = empty($seat['look']) ? 1 : 2;
		$addpoint = ($room['point'] * $multi);
		$seat['point']+= $addpoint;
		$room['total']+= $addpoint;
		$room['current'] = $this->getNext($room);
		$room['coins'][] = $addpoint;
		$this->redis->hMSet(self::INFO_KEY . $this->id, array(
			'current' => $room['current'],
			'total' => $room['total'],
			$seatkey => json_encode($seat),
			'coins' => json_encode($room['coins']),
		));
		
		//更新定时器
		$this->setTimer();
		
		//通知
		Socket::sendToChannel("game-{$this->id}", "Room", "follow", array(
			'seatid' => $user['seatid'],
			'total' => $room['total'],
			'user_point' => $seat['point'],
			'add_point' => $addpoint,
			'current' => $room['current'],
		));
		
		//解锁
		$this->unlock();
		
		return true;
	}
	
	public function look()
	{
		$this->_error = 'LookFailed';
		
		$room = $this->getInfo();
		if(!$room['state']){
			return false;
		}
		
		$user = $this->mUser->getInfo();
		$seatkey = "seat" . $user['seatid'];
		$seat = $room[$seatkey];
		if(!empty($seat['look'])){
			return false;
		}
		
		//加锁
		$this->lock();
		
		//数据更新
		$seat['look'] = 1;
		$this->redis->hMSet(self::INFO_KEY . $this->id, array(
			$seatkey => json_encode($seat),
		));
		
		//通知
		Socket::sendToChannel("game-{$this->id}", "Room", "look2", array(
			'seatid' => $user['seatid'],
		));
		
		//解锁
		$this->unlock();
		
		return array(
			'cards' => $seat['cards'],
		);
	}
	
	public function giveup()
	{
		$this->_error = 'GiveupFailed';
		
		$room = $this->getInfo();
		if(!$room['state']){
			return false;
		}
		
		$user = $this->mUser->getInfo();
		if($user['seatid'] != $room['current']){
			return false;
		}
		
		$seatkey = "seat" . $user['seatid'];
		$seat = $room[$seatkey];
		if(!empty($seat['giveup'])){
			return false;
		}
		
		//加锁
		$this->lock();
		
		//数据更新
		$seat['giveup'] = 1;
		$seat['state'] = self::STATE_NONE;
		$room[$seatkey] = $seat;
		$room['current'] = $this->getNext($room);
		$this->redis->hMSet(self::INFO_KEY . $this->id, array(
			'current' => $room['current'],
			$seatkey => json_encode($seat),
		));
		
		//通知
		Socket::sendToChannel("game-{$this->id}", "Room", "giveup", array(
			'seatid' => $user['seatid'],
			'current' => $room['current'],
		));
		
		//更新定时器
		$this->setTimer();
		
		//游戏结束
		if(!$room['current']){
			$this->gameOver($room);
		}
		
		//解锁
		$this->unlock();
		
		return true;
	}
	
	public function pk($seatid)
	{
		$this->_error = 'PkFailed';
		
		$room = $this->getInfo();
		if(!$room['state']){
			return false;
		}
		
		$user = $this->mUser->getInfo();
		if($user['seatid'] != $room['current']){
			return false;
		}
		
		if($user['seatid'] == $seatid){
			return false;
		}
		
		$seatkey = "seat" . $user['seatid'];
		$seatkey2 = "seat" . $seatid;
		$seat = $room[$seatkey];
		$seat2 = $room[$seatkey2];
		if($seat2['state'] != self::STATE_PLAYING){
			return false;
		}
		
		//加锁
		$this->lock();
		
		//比牌
		$win = $this->compareCard($seat['cards'], $seat2['cards']);
		
		//比牌消耗
		$multi = empty($seat['look']) ? 1 : 2;
		$addpoint = ($room['point'] * $multi);
		$seat['point']+= $addpoint;
		$room['total']+= $addpoint;
		$room['coins'][] = $addpoint;
		
		//数据更新
		$sets = array();
		if($win == 1){
			$seat2['lose'] = 1;
			$seat2['state'] = self::STATE_NONE;
			$sets[$seatkey] = json_encode($seat);
			$sets[$seatkey2] = json_encode($seat2);
		}else{
			$seat['lose'] = 1;
			$seat['state'] = self::STATE_NONE;
			$sets[$seatkey] = json_encode($seat);
		}
		$room[$seatkey] = $seat;
		$room[$seatkey2] = $seat2;
		$room['current'] = $this->getNext($room);
		$sets['total'] = $room['total'];
		$sets['current'] = $room['current'];
		$sets['coins'] = json_encode($room['coins']);
		$this->redis->hMSet(self::INFO_KEY . $this->id, $sets);
		
		//更新定时器
		$this->setTimer();
		
		//通知
		Socket::sendToChannel("game-{$this->id}", "Room", "pk", array(
			'seatid' => $user['seatid'],
			'pkid' => $seatid,
			'total' => $room['total'],
			'point' => $room['point'],
			'user_point' => $seat['point'],
			'add_point' => $addpoint,
			'loseid' => $win == 1 ? $seatid : $user['seatid'],
			'current' => $room['current'],
		));
		
		//游戏结束
		if(!$room['current']){
			$this->gameOver($room);
		}
		
		//解锁
		$this->unlock();
		
		return true;
	}
	
	/**
	 * 游戏结束
	 * @param array $room
	 */
	private function gameOver($room)
	{
		$data = array();
		$data2 = array();
		$room['step']+= 1;
		$balance = ($room['step'] >= self::MAX_STEP) ? 1 : 0;
		$lastMaxPoint = 0;
		$lastMaxIndex = -1;
		for($i = 1; $i <= self::MAX_POS; ++$i){
			$seatkey = "seat$i";
			
			if(empty($room[$seatkey])){
				continue;
			}
			
			$seat = $room[$seatkey];
			if($seat['state'] == self::STATE_PLAYING){
				$point = $room['total'] - $seat['point'];
			}else{
				$point = -$seat['point'];
			}
			
			//update seat
			$seat['state'] = self::STATE_NONE;
			$seat['total']+= $point;
			$seat['point'] = 0;
			$seat['lose'] = 0;
			$seat['look'] = 0;
			$seat['giveup'] = 0;
			$this->redis->hSet(self::INFO_KEY . $room['id'], $seatkey, json_encode($seat));
			
			//update user
			$mUser = new UserModel($seat['uid']);
			$mUser->incr("gold", -1);
			if($balance){
				$mUser->save(array(
					'roomid' => 0,
					'seatid' => 0,
				));
				
				$king = false;
				$point2 = $seat['total'] - self::DEFAULT_POINT;
				if($lastMaxIndex == -1){
					$lastMaxIndex = count($data2);
					$lastMaxPoint = $point2;
					$king = true;
				}else{
					if($point2 > $lastMaxPoint){
						$data2[$lastMaxIndex]['king'] = false;
						$king = true;
						$lastMaxIndex = count($data2);
						$lastMaxPoint = $point2;
					}
				}
				
				$data2[] = array(
					'seatid' => $i,
					'total' => $seat['total'],
					'point' => $point2,
					'king' => $king,
				);
			}
			
			$data[] = array(
				'seatid' => $i,
				'total' => $seat['total'],
				'point' => $point,
				'cards' => $seat['cards'],
			);
		}
		
		//关闭
		if($balance){
			$this->redis->del(self::INFO_KEY . $room['id']);
		}else{
			$this->redis->hMSet(self::INFO_KEY . $room['id'], array(
				'state' => 0,
				'step' => $room['step'],
				'coins' => '',
				'point' => 0,
				'total' => 0,
			));
		}
		
		//删除定时器
		$this->delTimer();
		
		//通知
		Socket::sendToChannel("game-{$this->id}", "Room", "over", array(
			'step' => $room['step'],
			'balance' => $balance,
			'list' => $data,
			'list2' => $data2,
		));
	}
	
	/**
	 * 操作加锁
	 */
	private function lock()
	{
		$lockName = "oplock-{$this->id}-{$this->uid}";
		if(!DMutex::lock($lockName)){
			throw new Exception('Locked');
		}
	}
	
	/**
	 * 操作解锁
	 */
	private function unlock()
	{
		$lockName = "oplock-{$this->id}-{$this->uid}";
		DMutex::unlock($lockName);
	}
	
	/**
	 * 获取下次出手玩家
	 * @param array $room
	 * @return int
	 */
	private function getNext($room)
	{
		if(!$room){
			return 0;
		}
		
		$actives = array();
		for($i = 1; $i <= self::MAX_POS; ++$i){
			$seatkey = "seat$i";
			if(!isset($room[$seatkey])){
				continue;
			}
			
			$seat = $room[$seatkey];
			if($seat['state'] == self::STATE_PLAYING){
				$actives[$i] = 1;
			}
		}
		
		if(count($actives) < 2){
			return 0;
		}
		
		$start = $current = $room['current'];
		do{
			if(++$current > self::MAX_POS){
				$current = 1;
			}
			
			if($current == $start){
				break;
			}
			
			if(!isset($actives[$current])){
				continue;
			}
			
			return $current;
		}while(true);
		
		return 0;
	}
	
	/**
	 * 生成牌列表
	 * @return array
	 */
	private function makeCards()
	{
		$cards = array();
		for($i = 1; $i <= 4; ++$i){
			for($j = 1; $j <= 13; ++$j){
				$cards[] = $i * 100 + $j;
			}
		}
		
		shuffle($cards);
		
		return $cards;
	}
	
	/**
	 * 排序(从大到小排)
	 * @param array $cards
	 * @return array
	 */
	private function sortCard($cards)
	{
		$list = array();
		foreach($cards as $card){
			$value = $card % 100;
			$list[$card] = $value;
		}
		
		arsort($list);
		
		return array_keys($list);
	}
	
	/**
	 * 对比牌
	 * @param array $c1
	 * @param array $c2
	 * @return int
	 */
	private function compareCard($cards1, $cards2)
	{
		$c1 = $this->getCardInfo($cards1);
		$c2 = $this->getCardInfo($cards2);
		$win = 0;
		if($c1['type'] > $c2['type']){
			$win = 1;
		}else if($c2['type'] > $c1['type']){
			$win = 2;
		}else{
			if(in_array($c1['type'], array(1, 3, 4, 5))){
				$values1 = $c1['values'];
				$values2 = $c2['values'];
			}else{
				$values1 = array($c1['max'], $c1['min']);
				$values2 = array($c2['max'], $c2['min']);
			}
			
			//从最大牌开始往下比
			foreach($values1 as $k => $v){
				if($v > $values2[$k]){
					$win = 1;
					break;
				}else if($values2[$k] > $v){
					$win = 2;
					break;
				}
			}
			
			//相同的就是对面赢
			if(!$win){
				$win = 2;
			}
		}
		
		return $win;
	}
	
	/**
	 * 获取牌型
	 * @param array $cards
	 * @return array
	 */
	private function getCardInfo($cards)
	{
		$colorCounts = array();
		$valueCounts = array();
		$values = array();
		foreach($cards as $card){
			$color = floor($card / 100);
			$value = $card % 100;
			$colorCounts[$color]+= 1;
			$valueCounts[$value]+= 1;
			$values[] = $value;
		}
		
		if(count($valueCounts) == 1){//炸弹
			$type = 6;
			$min = $max = $values[0];
		}else if(count($colorCounts) == 1){//共花 or 同花顺
			if($values[0] - 1 == $values[1] && $values[1] - 1 == $values[2]){
				$type = 5;
				$max = $values[0];
				$min = $values[2];
			}else{
				$type = 4;
				$max = $values[0];
				$min = $values[2];
			}
		}else if(count($valueCounts) == 3 && $values[0] - 1 == $values[1] && $values[1] - 1 == $values[2]){//顺子
			$type = 3;
			$max = $values[0];
			$min = $values[2];
		}else if(count($valueCounts) == 2){//对子
			$type = 2;
			$c1 = $values[0];
			$c3 = $values[2];
			$max = $valueCounts[$c1] > 1 ? $c1 : $c3;
			$min = $max == $c1 ? $c3 : $c1;
		}else{//散牌
			$type = 1;
			$max = $values[0];
			$min = $values[1];
		}

		return array(
			'type' => $type,
			'min' => $min,
			'max' => $max,
			'values' => $values,
		);
	}
}