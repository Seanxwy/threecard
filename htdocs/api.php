<?php
if(!isset($_GET['cmd'])){
	exit('invalid request');
}

$cmd = preg_replace("#[\.\/\\\]#", "", $_GET['cmd']);;
$file = "api/{$cmd}.php";
if(!file_exists($file)){
	exit('invalid request');
}

define('APP_PATH', dirname(__FILE__));
date_default_timezone_set('Asia/Shanghai');
require($file);