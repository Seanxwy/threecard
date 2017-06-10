<?php
class room_pk_protocol extends Protox
{
    protected $fields = array(
        'seatid' => 'int',
		'pkid' => 'int',
		'total' => 'int',
		'point' => 'int',
		'user_point' => 'int',
		'add_point' => 'int',
		'loseid' => 'int',
		'current' => 'int',
    );
}