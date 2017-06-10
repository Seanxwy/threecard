<?php
class Bootstrap extends Yaf_Bootstrap_Abstract
{
	function _init()
	{
		Yaf_Loader::import('BaseController.php');
		Yaf_Loader::import('BaseModel.php');
		
		Yaf_Dispatcher::getInstance()->disableView();
		
		Protox::init(array(
			'path' => APP_PATH . '/protocol/',
		));
	}
}