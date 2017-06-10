<?php
return array(
	'user' => array(
		'host' => '127.0.0.1',
		'port' => 6379,
		'prefix' => 'user::',
		'handle' => 'redisUser',
		'pconnect' => 1,
	),
	'game' => array(
		'host' => '127.0.0.1',
		'port' => 6379,
		'prefix' => 'game::',
		'handle' => 'redisGame',
		'pconnect' => 1,
	),
);