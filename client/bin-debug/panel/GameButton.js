/**
 *
 * @author
 *
 */
var GameButton = (function (_super) {
    __extends(GameButton, _super);
    function GameButton(btnName, btnText, enable, disable) {
        _super.call(this);
        this.btnName = btnName;
        this.btnText = btnText;
        this.enableSource = enable;
        this.disableSource = disable;
        this.load("component/GameButtonSkin.exml");
    }
    var d = __define,c=GameButton,p=c.prototype;
    p.setEnable = function (v) {
        var old = this.enabled;
        this.enabled = v;
        if (old != v) {
            this.imgIcon.source = v ? this.enableSource : this.disableSource;
        }
    };
    p.setLable = function (v) {
        this.labText.text = v;
        this.btnText = v;
    };
    p.initComponent = function () {
        var _this = this;
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            _this.scaleX = 0.9;
            _this.scaleY = 0.9;
        }, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, function () {
            _this.scaleX = 1;
            _this.scaleY = 1;
        }, this);
        this.width = 83;
        this.height = 112;
        this.anchorOffsetX = this.width / 2;
        this.anchorOffsetY = this.height / 2;
        this.labName.text = this.btnName;
        this.labText.text = this.btnText;
        this.imgIcon.source = this.enableSource;
    };
    return GameButton;
}(BaseComponent));
egret.registerClass(GameButton,'GameButton');
