<?php
class room_info_protocol extends Protox
{
    protected $fields = array(
        'id' => 'int',
		'seatid' => 'int',
        'owner' => 'int',
		'state' => 'int',
		'total' => 'int',
		'point' => 'int',
		'max' => 'int',
		'step' => 'int',
		'current' => 'int',
		'users' => 'array.room_info_user',
		'coins' => 'array.int',
		'cards' => 'array.int',
    );
}