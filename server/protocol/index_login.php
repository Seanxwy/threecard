<?php
class index_login_protocol extends Protox
{
    protected $fields = array(
        'uid' => 'int',
        'username' => 'string',
        'nickname' => 'string',
        'gamepoint' => 'int',
        'gold' => 'int',
		'roomid' => 'int',
		'seatid' => 'int',
    );
}