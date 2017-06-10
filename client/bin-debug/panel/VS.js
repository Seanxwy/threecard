/**
 *
 * @author
 *
 */
var VS = (function (_super) {
    __extends(VS, _super);
    function VS(data, loser) {
        _super.call(this);
        this.func = null;
        this.data = data;
        this.loser = loser;
        this.load("component/VSSkin.exml");
    }
    var d = __define,c=VS,p=c.prototype;
    p.setDoneHandler = function (func, obj, args) {
        this.func = func;
        this.obj = obj;
        this.args = args;
    };
    p.initComponent = function () {
        var _this = this;
        this.labName1.text = this.data[0]["name"];
        this.labName2.text = this.data[1]["name"];
        this.labPoint1.text = this.data[0]["point"];
        this.labPoint2.text = this.data[1]["point"];
        this.grpLeft.x = -300;
        var tw1 = egret.Tween.get(this.grpLeft);
        tw1.to({ x: -20 }, 300);
        this.grpRight.x = 485;
        var tw2 = egret.Tween.get(this.grpRight);
        tw2.to({ x: 193 }, 300);
        var tw3 = egret.Tween.get(this.imgLose);
        this.imgLose.x = (this.loser == 1) ? 88 : 391;
        this.imgLose.y = (this.loser == 1) ? 73 : 96;
        this.imgLose.scaleX = 5;
        this.imgLose.scaleY = 5;
        tw3.wait(400).to({ visible: true }, 1).to({ scaleX: 1, scaleY: 1 }, 300).call(function () {
            if (_this.func) {
                _this.func.apply(_this.obj, _this.args);
            }
        }, this, []);
    };
    return VS;
}(BaseComponent));
egret.registerClass(VS,'VS');
