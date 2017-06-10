/**
 *
 * @author 
 *
 */
class Login extends BaseComponent {
    private btnLogin:eui.Button;
    private main:Main;
    
	public constructor() {
        super();
        this.main = Main.getInstance();
        
        this.load("game/LoginSkin.exml");
	}
	
	protected initComponent(){
	    this.btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLoginTouch, this);
	}
	
    private onLoginTouch(){
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open("http://" + location.host + "/api.php?cmd=login&r=" + Math.random());
        request.addEventListener(egret.Event.COMPLETE,function(e: egret.Event) {
            var s = JSON.parse(request.response);
            if(s.auth){
                this.main.username = s.username;
                this.main.token = s.token;
                Main.getInstance().loadRes("game");
            }else{
                location.href = s.url;
            }
        },this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR,function() {
            Alert.show("登录认证出错", false)
        },this);
        request.send();
    }
}
