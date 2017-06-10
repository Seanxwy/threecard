/**
 *
 * @author 
 *
 */
class Balance extends BaseComponent {
    private btnOk: eui.Button;
    private labStep: eui.Label;
    private grpBox1: eui.Group;
    private grpBox2: eui.Group;
    private grpBox3: eui.Group;
    private grpBox4: eui.Group;
    private grpBox5: eui.Group;
    private labName1: eui.Label;
    private labName2: eui.Label;
    private labName3: eui.Label;
    private labName4: eui.Label;
    private labName5: eui.Label;
    private labGold1: eui.Label;
    private labGold2: eui.Label;
    private labGold3: eui.Label;
    private labGold4: eui.Label;
    private labGold5: eui.Label;
    
    private users: Array<any>;
    private balance: boolean;
    private steptext:string;
    private btntext:string;
    private doneFunc:Function = null;
    private doneObj:Object = null;
    private doneArgs:Array<any>;
    
    public constructor(users: Array<any>,steptext:string, btntext:string, balance:boolean) {
        super();

        this.steptext = steptext;
        this.btntext = btntext;
        this.users = users;
        this.balance = balance;
        this.width = 326;
        this.height = 449;
        
        this.load("component/BalanceSkin.exml");
    }
    
    public setDoneHandler(func:Function, obj:Object, args:Array<any>){
        this.doneFunc = func;
        this.doneObj = obj;
        this.doneArgs = args;
    }

    protected initComponent() {
        for(var i:number = 0; i < 5; ++i){
            var grp:eui.Group = this["grpBox" + (i+1)];
            if(i >= this.users.length){
                grp.visible = false;
                continue;
            }else{
                grp.visible = true;
            }
            
            var u:any = this.users[i];
            var lab:eui.Label = this["labName"+(i+1)];
            var gold:eui.Label = this["labGold"+(i+1)];
            
            lab.text = u["name"];
            gold.text = u["point"] > 0 ? "+" + u["point"] : u["point"];
            
            //create card
            if(this.balance){
                if(u["king"]){
                    var king = new egret.Bitmap(RES.getRes("balance_king_png"));
                    king.x = 225;
                    king.y = 3;
                    king.scaleX = 0.6;
                    king.scaleY = 0.6;
                    grp.addChild(king);
                }
            }else{
                var cards:Array<number> = u["cards"];
                for(var n = 0; n < 3; ++n){
                    var color = Math.floor(cards[n] / 100);
                    var value = cards[n] % 100;
                    var c: Card = new Card(color, value);
                    c.scaleX = 0.5;
                    c.scaleY = 0.5;
                    c.x = 205 + n * 20;
                    c.y = 3;
                    grp.addChild(c);
                }
            }
            
            grp.x = i % 2 == 0 ? -303 : 326;
            var tw = egret.Tween.get(grp);
            tw.to({x:23}, 300);
        }
        
        this.labStep.text = this.steptext;
        this.btnOk.label = this.btntext;
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_BEGIN,() => {
            this.btnOk.scaleX = 0.9;
            this.btnOk.scaleY = 0.9;
        },this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_END,() => {
            this.btnOk.scaleX = 1;
            this.btnOk.scaleY = 1;
        },this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTouch,this);
    }

    private onTouch(ev: egret.TouchEvent) {
        if(this.doneFunc){
            this.doneFunc.apply(this.doneObj, this.doneArgs);
        }else{
            this.parent.removeChild(this);
        }
    }
}
