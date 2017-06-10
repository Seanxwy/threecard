/**
 *
 * @author 
 *
 */
class Card extends egret.Sprite {
    private color: number;
    private value: number;

    public constructor(_color: number,_value: number) {
        super();

        this.color = _color;
        this.value = _value;
        
        var bg: egret.Bitmap = new egret.Bitmap(RES.getRes("card_front_png"));
        this.height = bg.height - 1;
        this.addChild(bg);

        var resName: string = (_color == 1 || _color == 3) ? "card_value_black_" : "card_value_red_";
        var spValue: egret.Bitmap = new egret.Bitmap(RES.getRes(resName + _value + "_png"));
        spValue.x = 5;
        spValue.y = 5;
        this.addChild(spValue);

        var spColor: egret.Bitmap = new egret.Bitmap(RES.getRes("card_color_" + _color + "_png"));
        spColor.x = 5;
        spColor.y = 28;
        this.addChild(spColor);
    }
}
