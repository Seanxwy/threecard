<?php
class room_info_user_protocol extends Protox{
	protected $fields = array(
        'uid' => 'int',
        'seatid' => 'int',
		'state' => 'int',
		'total' => 'int',
		'point' => 'int',
		'name' => 'string',
		'avatar' => 'string',
		'lose' => 'int',
		'giveup' => 'int',
		'look' => 'int',
		'offline' => 'int',
    );
}