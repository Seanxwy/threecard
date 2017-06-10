<?php
define('APP_PATH', dirname(__FILE__));

//app init
$app = new Yaf_Application(APP_PATH . '/config/application.ini');
$app->bootstrap();