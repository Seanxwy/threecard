<?php
define('APP_PATH', dirname(__FILE__));
define('SESSIONID', $_SERVER['SESSIONID']);

//app init
$app = new Yaf_Application(APP_PATH . '/config/application.ini');
$app->bootstrap();

//request init
$event = isset($_SERVER['EVENT']) ? $_SERVER['EVENT'] : 0;
if($event == 1){//onConnect
	$req = new Yaf_Request_Simple();
	$req->setControllerName('Index');
	$req->setActionName('onConnect');
}else if($event == 2){//onClose
	$req = new Yaf_Request_Simple();
	$req->setControllerName('Index');
	$req->setActionName('onClose');
}else{//onMessage
	$input = file_get_contents("php://input");
	$packet = Socket::unpackMsg($input);
	if(!$packet){
		echo "invalid request\n";
		exit;
	}
	
	$req = new Yaf_Request_Simple();
	$req->setControllerName($packet['c']);
	$req->setActionName($packet['m']);
	if($packet['data']){
		$req->setParam($packet['data']);
	}
}

//dispatch request
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
