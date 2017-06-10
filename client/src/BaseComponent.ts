/**
 *
 * @author 
 *
 */
class BaseComponent extends eui.Component{
	public constructor() {
        super();
	}
	
	protected load(skinName:string){
        this.addEventListener(eui.UIEvent.COMPLETE, this.onUIComplete, this);
	    this.skinName = "resource/eui_skins/" + skinName;
	}
	
    protected onUIComplete(ev:eui.UIEvent){
        this.removeEventListener(eui.UIEvent.COMPLETE, this.onUIComplete, this);
	    this.initComponent();
	}
	
    protected initComponent(){
        //TODO
    }
}
