<?php
define('APP_PATH', dirname(__FILE__));
define('SESSIONID', $_GET['sid']);
define('IS_DEBUG', 1);

//app init
$app = new Yaf_Application(APP_PATH . '/config/application.ini');
$app->bootstrap();

//request init
$req = new Yaf_Request_Simple();
$req->setControllerName($_GET['c']);
$req->setActionName($_GET['m']);
$req->setParam($_GET);

//request dispatch
$lockName = "req_" . SESSIONID;
if(DMutex::lock($lockName)){
	try{
		$app->getDispatcher()->dispatch($req);
	}catch(Exception $e){
		Socket::reply($req->getControllerName(), $req->getActionName(), $e->getMessage(), 1);
	}
	DMutex::unlock($lockName);
}else{
	echo "request locked\n";
}
