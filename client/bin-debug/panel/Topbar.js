/**
 *
 * @author
 *
 */
var Topbar = (function (_super) {
    __extends(Topbar, _super);
    function Topbar() {
        _super.call(this);
        this.init = false;
        this.load("game/TopbarSkin.exml");
    }
    var d = __define,c=Topbar,p=c.prototype;
    return Topbar;
}(BaseComponent));
egret.registerClass(Topbar,'Topbar');
