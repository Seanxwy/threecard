/**
 *
 * @author 
 *
 */
class Index extends BaseComponent {
    private main:Main;
    private net:Network;
    
    private imgEnter:eui.Image;
    private imgEnterBg:eui.Image;
    private imgCreate:eui.Image;
    private imgCreateBg:eui.Image;
    private btnNum1:eui.Button;
    private btnNum2:eui.Button;
    private btnNum3:eui.Button;
    private btnNum4: eui.Button;
    private btnNum5: eui.Button;
    private btnNum6:eui.Button;
    private btnNum7: eui.Button;
    private btnNum8:eui.Button;
    private btnNum9: eui.Button;
    private btnNum0: eui.Button;
    private btnBackspace: eui.Button;
    private btnCloseKeyboard: eui.Button;
    private btnOk: eui.Button;
    private labRoomId: eui.Label;
    private grpInput: eui.Group;
    
	public constructor() {
        super();
        
        this.main = Main.getInstance();
        this.net = this.main.net;
        this.net.bind("Index.create", this.onCreate, this);
        this.net.bind("Index.join",this.onJoin,this);
        
        this.load("game/IndexSkin.exml");
	}
	
	public hideInput(){
	    this.grpInput.visible = false;
	}
	
	protected initComponent(){
	    this.imgEnter.touchEnabled = true;
        this.imgEnter.addEventListener(egret.TouchEvent.TOUCH_BEGIN, ()=>{
            this.imgEnter.scaleX = 0.9;
            this.imgEnter.scaleY = 0.9;
            this.imgEnterBg.scaleX = 0.9;
            this.imgEnterBg.scaleY = 0.9;
        }, this);
        this.imgEnter.addEventListener(egret.TouchEvent.TOUCH_END, ()=>{
            this.imgEnter.scaleX = 1;
            this.imgEnter.scaleY = 1;
            this.imgEnterBg.scaleX = 1;
            this.imgEnterBg.scaleY = 1;
        }, this);
        this.imgEnter.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEnterTouch, this);
        this.imgEnterBg.addEventListener(egret.Event.ENTER_FRAME,(evt: egret.Event) => {
            this.imgEnterBg.rotation += 3;
        },this);
        
        this.imgCreate.touchEnabled = true;
        this.imgCreate.addEventListener(egret.TouchEvent.TOUCH_BEGIN,() => {
            this.imgCreate.scaleX = 0.9;
            this.imgCreate.scaleY = 0.9;
            this.imgCreateBg.scaleX = 0.9;
            this.imgCreateBg.scaleY = 0.9;
        },this);
        this.imgCreate.addEventListener(egret.TouchEvent.TOUCH_END,() => {
            this.imgCreate.scaleX = 1;
            this.imgCreate.scaleY = 1;
            this.imgCreateBg.scaleX = 1;
            this.imgCreateBg.scaleY = 1;
        },this);
        this.imgCreate.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onCreateTouch, this);
        this.imgCreateBg.addEventListener(egret.Event.ENTER_FRAME,(evt: egret.Event) => {
            this.imgCreateBg.rotation += 3;
        },this);
        
        for(var i = 0; i <= 9; ++i){
            this["btnNum" + i].addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNumTouch, this);
        }
        
        this.btnBackspace.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBackspace, this);
        this.btnCloseKeyboard.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCloseKeyboard, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onOk, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_BEGIN, ()=>{
            this.btnOk.scaleX = 0.9;
            this.btnOk.scaleY = 0.9;
        }, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_END, ()=>{
            this.btnOk.scaleX = 1;
            this.btnOk.scaleY = 1;    
        },this);
	}
	
	private onNumTouch(ev:egret.TouchEvent){
        if(this.labRoomId.text.length < 8) {
            this.labRoomId.text += ev.target.label;
        }
	}
	
	private onBackspace(ev:egret.TouchEvent){
        var str: string = this.labRoomId.text;
        if(str.length > 0) {
            this.labRoomId.text = str.substring(0,str.length - 1);
        }
	}
	
	private onCloseKeyboard(ev:egret.TouchEvent){
        this.grpInput.visible = false;
	}
	
	private onOk(ev:egret.TouchEvent){
        this.main.net.send("Index","join",{
            "roomid": this.labRoomId.text,
        });
	}
	
    private onEnterTouch(){
        if(this.main.user.roomid){
            Main.getInstance().showGameScene();
        }else{
            this.grpInput.visible = true;
            this.labRoomId.text = "";
	    }
	}
	
	private onCreateTouch(){
        this.net.send("Index", "create", null);
	}
	
    private onCreate(data:any){
        this.main.user.roomid = data["roomid"];
        this.main.user.seatid = data["seatid"];
        this.main.showGameScene();
    }
    
    private onJoin(data: any) {
        this.main.user.roomid = data["roomid"];
        this.main.user.seatid = data["seatid"];
        this.main.showGameScene();
    }
}
