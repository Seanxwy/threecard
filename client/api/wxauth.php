<?php
//回调地址
//http://xxx.com/api.php?a=1&code=001wfQe12YbnN31isfb12mxPe12wfQeP&state=STATE

//获取token响应
//string(336) "{"access_token":"d2oIc1GNpKFvwstY3AcC3UVwVK21hSSoe9FoEftW5J0RebFkenJRpMGp5llPuT_dkb900rwLca6UAJFW_fjIms8yrXlK1vpoRAeN_GwqMVI","expires_in":7200,"refresh_token":"vEYKn1MJsvo086O0t_hFHMAp1RDBQRMqZriYqCaSmGffJanB48lF9K-d7JNzgzL34d0hvOXvEEXnuk5P9lUYfcjDfYx_Etqk78lUkEeMeAU","openid":"ofLljw8df_3-rGVuWrNdO2cSG6Uc","scope":"snsapi_userinfo"}"

//获取用户信息响应
//array(9) { ["openid"]=> string(28) "ofLljw8df_3-rGVuWrNdO2cSG6Uc" ["nickname"]=> string(6) "鑫爷" ["sex"]=> int(1) ["language"]=> string(5) "zh_CN" ["city"]=> string(6) "闵行" ["province"]=> string(6) "上海" ["country"]=> string(6) "中国" ["headimgurl"]=> string(131) "http://wx.qlogo.cn/mmopen/GicF33sySMMHMOuib0Q4lglCsAQQFh1OVoYHOepf1MKXrQWJ3UeViaEBP6AiaSpJMfNqd5I3CbmbibtZUzRiau3OVIAKRUAqufyV9ib/0" ["privilege"]=> array(0) { } }

include 'include/config.inc.php';
$appid = APP_ID;
$secret = APP_SECRET;

//get access token
//$code = $_GET['code'];
$code = '001wfQe12YbnN31isfb12mxPe12wfQeP';
$tokenurl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid={$appid}&secret={$secret}&code={$code}&grant_type=authorization_code";
//$ret = json_decode(file_get_contents($tokenurl), true);
$ret = json_decode('{"access_token":"d2oIc1GNpKFvwstY3AcC3UVwVK21hSSoe9FoEftW5J0RebFkenJRpMGp5llPuT_dkb900rwLca6UAJFW_fjIms8yrXlK1vpoRAeN_GwqMVI","expires_in":7200,"refresh_token":"vEYKn1MJsvo086O0t_hFHMAp1RDBQRMqZriYqCaSmGffJanB48lF9K-d7JNzgzL34d0hvOXvEEXnuk5P9lUYfcjDfYx_Etqk78lUkEeMeAU","openid":"ofLljw8df_3-rGVuWrNdO2cSG6Uc","scope":"snsapi_userinfo"}', true);

//get info
$acctoken = $ret['access_token'];
$openid = $ret['openid'];
$infourl = "https://api.weixin.qq.com/sns/userinfo?access_token={$acctoken}&openid={$openid}&lang=zh_CN";
$info = json_decode(file_get_contents($infourl), true);
var_dump($info);