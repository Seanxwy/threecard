<?php
class room_over_protocol extends Protox
{
    protected $fields = array(
        'step' => 'int',
		'balance' => 'int',
		'list' => 'array.room_over_data',
		'list2' => 'array.room_over_data2',
    );
}

class room_over_data_protocol extends Protox
{
    protected $fields = array(
        'seatid' => 'int',
		'total' => 'int',
		'point' => 'int',
		'cards' => 'array.int',
    );
}

class room_over_data2_protocol extends Protox
{
    protected $fields = array(
        'seatid' => 'int',
		'total' => 'int',
		'point' => 'int',
		'king' => 'int',
    );
}