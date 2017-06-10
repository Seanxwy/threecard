<?php
require('../crontab.php');

$redis = RedisDB::factory('game');
$count = 100;
do{
	$now = time();
	$list = $redis->zRange(RoomModel::PLAYING_KEY, 0, -1, true);
	foreach($list as $roomid => $expire){
		if($now < $expire){
			break;
		}
		
		$room = $redis->hGetAll(RoomModel::INFO_KEY . $roomid);
		$seatkey = "seat" . $room['current'];
		$seat = json_decode($room[$seatkey], true);
		$mUser = new UserModel($seat['uid']);
		$mRoom = new RoomModel($mUser, $roomid);
		$mRoom->giveup();
		unset($mUser, $mRoom);
	}
	
	sleep(2);
}while(--$count > 0);