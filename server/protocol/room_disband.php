<?php
class room_disband_protocol extends Protox
{
    protected $fields = array(
		'list' => 'array.room_disband_data',
    );
}

class room_disband_data_protocol extends Protox
{
    protected $fields = array(
        'seatid' => 'int',
		'total' => 'int',
		'point' => 'int',
		'king' => 'int',
    );
}