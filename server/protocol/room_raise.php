<?php
class room_raise_protocol extends Protox
{
    protected $fields = array(
		'seatid' => 'int',
		'total' => 'int',
		'point' => 'int',
		'user_point' => 'int',
		'add_point' => 'int',
		'current' => 'int',
	);
}