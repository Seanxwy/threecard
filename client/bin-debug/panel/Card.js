/**
 *
 * @author
 *
 */
var Card = (function (_super) {
    __extends(Card, _super);
    function Card(_color, _value) {
        _super.call(this);
        this.color = _color;
        this.value = _value;
        var bg = new egret.Bitmap(RES.getRes("card_front_png"));
        this.height = bg.height - 1;
        this.addChild(bg);
        var resName = (_color == 1 || _color == 3) ? "card_value_black_" : "card_value_red_";
        var spValue = new egret.Bitmap(RES.getRes(resName + _value + "_png"));
        spValue.x = 5;
        spValue.y = 5;
        this.addChild(spValue);
        var spColor = new egret.Bitmap(RES.getRes("card_color_" + _color + "_png"));
        spColor.x = 5;
        spColor.y = 28;
        this.addChild(spColor);
    }
    var d = __define,c=Card,p=c.prototype;
    return Card;
}(egret.Sprite));
egret.registerClass(Card,'Card');
