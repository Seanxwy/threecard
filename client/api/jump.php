<?php
$md5 = md5_file(APP_PATH . '/game.html');
$v = hexdec(substr($md5, 0, 2) . substr($md5, -2));
echo "location.href='game.html?v=$v';";