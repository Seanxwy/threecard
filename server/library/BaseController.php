<?php
/**
 * 控制器基础类
 */
class BaseController extends Yaf_Controller_Abstract
{
	/**
	 * 返回成功数据包
	 * @param mixed $data
	 */
	protected function success($data = null)
	{
		$req = $this->getRequest();
		$c = $req->getControllerName();
		$m = $req->getActionName();
		Socket::reply($c, $m, $data, 0);
	}
	
	/**
	 * 返回失败数据包
	 * @param string $errmsg
	 */
	protected function error($errmsg)
	{
		$req = $this->getRequest();
		$c = $req->getControllerName();
		$m = $req->getActionName();
		Socket::reply($c, $m, $errmsg, 1);
	}
}
