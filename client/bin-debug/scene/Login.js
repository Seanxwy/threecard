/**
 *
 * @author
 *
 */
var Login = (function (_super) {
    __extends(Login, _super);
    function Login() {
        _super.call(this);
        this.main = Main.getInstance();
        this.load("game/LoginSkin.exml");
    }
    var d = __define,c=Login,p=c.prototype;
    p.initComponent = function () {
        this.btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLoginTouch, this);
    };
    p.onLoginTouch = function () {
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open("http://" + location.host + "/api.php?cmd=login&r=" + Math.random());
        request.addEventListener(egret.Event.COMPLETE, function (e) {
            var s = JSON.parse(request.response);
            if (s.auth) {
                this.main.username = s.username;
                this.main.token = s.token;
                Main.getInstance().loadRes("game");
            }
            else {
                location.href = s.url;
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            Alert.show("登录认证出错", false);
        }, this);
        request.send();
    };
    return Login;
}(BaseComponent));
egret.registerClass(Login,'Login');
