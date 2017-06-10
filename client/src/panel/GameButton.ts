/**
 *
 * @author 
 *
 */
class GameButton extends BaseComponent {
    private btnName:string;//按钮名称
    private btnText:string;//标签内容
    private enableSource:string; //图片按下
    private disableSource:string;//图片不可用
    private labText:eui.Label;
    private labName:eui.Label;
    private imgIcon:eui.Image;
    
	public constructor(btnName:string, btnText:string, enable:string, disable:string) {
        super();
        
        this.btnName = btnName;
        this.btnText = btnText;
        this.enableSource = enable;
        this.disableSource = disable;
        
        this.load("component/GameButtonSkin.exml");
	}
    
    public setEnable(v:boolean){
        var old = this.enabled;
        this.enabled = v;
        if(old != v){
            this.imgIcon.source = v ? this.enableSource : this.disableSource;
        }
    }
    
    public setLable(v:string){
        this.labText.text = v;
        this.btnText = v;
    }
	
    protected initComponent()
    {
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,() => {
            this.scaleX = 0.9;
            this.scaleY = 0.9;
        },this);
        this.addEventListener(egret.TouchEvent.TOUCH_END,() => {
            this.scaleX = 1;
            this.scaleY = 1;
        },this);

        this.width = 83;
        this.height = 112;
        this.anchorOffsetX = this.width / 2;
        this.anchorOffsetY = this.height / 2;
        
        this.labName.text = this.btnName;
        this.labText.text = this.btnText;
        this.imgIcon.source = this.enableSource;
    }
}
