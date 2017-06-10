/**
 *
 * @author 
 *
 */
class Utils {
	public constructor() {
	}
	
    public static rand(a: number,b: number): number {
        var diff: number = b - a - 1;
        var r: number = Math.random() * diff;
        return Math.round(r) + a;
    }
    
    public static playSound(name:string){
        var sound: egret.Sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE,(event: egret.Event)=>{
            sound.play(0, 1);
        },this);
        sound.addEventListener(egret.IOErrorEvent.IO_ERROR,(event: egret.IOErrorEvent)=>{
            console.log("loaded error!");
        },this);
        sound.load("resource/assets/sound/"+name+".mp3");
    }
    
    public static imageProxyUrl(url:string){
        return (egret.Capabilities.renderMode == "webgl") ? 
            "http://" + location.host + "/api.php?cmd=image_proxy&url=" + encodeURIComponent(url) : 
            url;
    }
}
