/**
 *
 * @author
 *
 */
var BaseComponent = (function (_super) {
    __extends(BaseComponent, _super);
    function BaseComponent() {
        _super.call(this);
    }
    var d = __define,c=BaseComponent,p=c.prototype;
    p.load = function (skinName) {
        this.addEventListener(eui.UIEvent.COMPLETE, this.onUIComplete, this);
        this.skinName = "resource/eui_skins/" + skinName;
    };
    p.onUIComplete = function (ev) {
        this.removeEventListener(eui.UIEvent.COMPLETE, this.onUIComplete, this);
        this.initComponent();
    };
    p.initComponent = function () {
        //TODO
    };
    return BaseComponent;
}(eui.Component));
egret.registerClass(BaseComponent,'BaseComponent');
