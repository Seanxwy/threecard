<?php
/**
 * 模块基础类
 */
class BaseModel
{
	protected $_error = '';
	
	public function __construct()
	{
	}
	
	public function getError()
	{
		return $this->_error;
	}
}