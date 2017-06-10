/**
 *
 * @author 
 *
 */
class VS extends BaseComponent{
    private grpLeft:eui.Group;
    private grpRight: eui.Group;
    private labName1:eui.Label;
    private labPoint1:eui.Label;
    private imgAvatar1:eui.Image;
    private labName2: eui.Label;
    private labPoint2: eui.Label;
    private imgAvatar2: eui.Image;
    private imgLose:eui.Image;
    
    private data:Array<any>;
    private loser:number;
    private func:Function = null
    private obj:Object;
    private args:Array<any>;
    
	public constructor(data:Array<any>,loser:number) {
        super();
        
        this.data = data;
        this.loser = loser;
        
        this.load("component/VSSkin.exml");
	}
	
	public setDoneHandler(func:Function, obj:Object, args:Array<any>)
	{
	    this.func = func;
	    this.obj = obj;
	    this.args = args;
	}
	
	protected initComponent()
    {
        this.labName1.text = this.data[0]["name"];
        this.labName2.text = this.data[1]["name"];
        this.labPoint1.text = this.data[0]["point"];
        this.labPoint2.text = this.data[1]["point"];
        
        this.grpLeft.x = -300;
        var tw1 = egret.Tween.get(this.grpLeft);
        tw1.to({ x: -20 }, 300);
        
        this.grpRight.x = 485;
        var tw2 = egret.Tween.get(this.grpRight);
        tw2.to({x:193}, 300);
        
        var tw3 = egret.Tween.get(this.imgLose);
        this.imgLose.x = (this.loser == 1) ? 88 : 391;
        this.imgLose.y = (this.loser == 1) ? 73 : 96;
        this.imgLose.scaleX = 5;
        this.imgLose.scaleY = 5;
        tw3.wait(400).to({visible:true}, 1).to({scaleX:1,scaleY:1}, 300).call(()=>{
            if(this.func){
                this.func.apply(this.obj, this.args);
            }
        }, this, [])
    }
}
