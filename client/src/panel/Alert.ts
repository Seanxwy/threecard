/**
 *
 * @author 
 *
 */
class Alert extends BaseComponent {
    private static instance: Alert;
    private static texts:Object = {
        "InvalidToken": "登录验证失败",
        "GoldLess":"钻石少于5个不能进入房间",
        "InRoom":"你已经有房间了，点击进入即可",
        "CreateFailed":"创建房间出现了异常",
        "InvalidRoomId":"房间不存在",
        "RoomNotFound":"房间不存在",
        "Already":"已经准备了",
        "PlayerStateError":"还有玩家没有准备",
        "PlayerLess":"一个人怎么玩?还不赶快邀请你的基友互相伤害!",
        "RaiseFailed":"跟注错误",
        "FollowFailed":"加注错误",
        "LookFailed":"看牌错误",
        "GiveupFailed":"放弃错误",
        "PkFailed":"比牌错误",
        "UserNotExists":"用户不存在"
    };
    
    public labText: eui.Label;
    public btnOk: eui.Button;
    public btnCancel:eui.Button;
    public func:Function;
    public cfunc: Function;
    public obj:any;
    
    public constructor() {
        super();
        
        Alert.instance = this;
        
        this.load("component/AlertSkin.exml");
    }
    
    protected initComponent(){
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onButtonTouchBegin,this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_END, this.onButtonTouchEnd,this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTouch,this);
        
        this.btnCancel.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onButtonTouchBegin, this);
        this.btnCancel.addEventListener(egret.TouchEvent.TOUCH_END, this.onButtonTouchEnd, this);
        this.btnCancel.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchCancel, this);
    }
    
    private onButtonTouchBegin(ev:egret.TouchEvent){
        ev.target.scaleX = 0.9;
        ev.target.scaleY = 0.9;
    }
    
    private onButtonTouchEnd(ev: egret.TouchEvent){
        ev.target.scaleX = 1;
        ev.target.scaleY = 1;
    }
    
    private onTouch(ev:egret.TouchEvent){
        this.parent.removeChild(this);
        if(this.func){
            this.func.call(this.obj);
        }
    }
    
    private onTouchCancel(ev: egret.TouchEvent) {
        this.parent.removeChild(this);
        if(this.cfunc){
            this.cfunc.call(this.obj)
        }
    }
    
    public static show(text:string, trans:boolean = true, func:Function = null, obj:any = null, cancel=false, cancelFunc:Function = null){
        if(trans){
            text = Alert.texts[text];
        }
        
        var inst = Alert.instance;
        inst.labText.text = text;
        inst.func = func;
        inst.cfunc = cancelFunc;
        inst.obj = obj;
        if(cancel){
            inst.btnOk.x = 95;
            inst.btnCancel.x = 226;
            inst.btnCancel.visible = true;
        }else{
            inst.btnOk.x = inst.width / 2;
            inst.btnCancel.visible = false;
        }
        
        Main.getInstance().addChild(inst);
    }
}
