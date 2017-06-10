/**
 *
 * @author 
 *
 */
class Topbar extends BaseComponent {
    public labelName:eui.Label;
    public labelGold:eui.Label;
    public imgAvatar:eui.Image;
    public init:Boolean = false;
    
    public constructor() {
        super();

        this.load("game/TopbarSkin.exml");
    }
}
