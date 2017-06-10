/**
 *
 * @author
 *
 */
var Utils = (function () {
    function Utils() {
    }
    var d = __define,c=Utils,p=c.prototype;
    Utils.rand = function (a, b) {
        var diff = b - a - 1;
        var r = Math.random() * diff;
        return Math.round(r) + a;
    };
    Utils.playSound = function (name) {
        var sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE, function (event) {
            sound.play(0, 1);
        }, this);
        sound.addEventListener(egret.IOErrorEvent.IO_ERROR, function (event) {
            console.log("loaded error!");
        }, this);
        sound.load("resource/assets/sound/" + name + ".mp3");
    };
    Utils.imageProxyUrl = function (url) {
        return (egret.Capabilities.renderMode == "webgl") ?
            "http://" + location.host + "/api.php?cmd=image_proxy&url=" + encodeURIComponent(url) :
            url;
    };
    return Utils;
}());
egret.registerClass(Utils,'Utils');
