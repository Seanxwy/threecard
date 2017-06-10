/**
 *
 * @author
 *
 */
var Balance = (function (_super) {
    __extends(Balance, _super);
    function Balance(users, steptext, btntext, balance) {
        _super.call(this);
        this.doneFunc = null;
        this.doneObj = null;
        this.steptext = steptext;
        this.btntext = btntext;
        this.users = users;
        this.balance = balance;
        this.width = 326;
        this.height = 449;
        this.load("component/BalanceSkin.exml");
    }
    var d = __define,c=Balance,p=c.prototype;
    p.setDoneHandler = function (func, obj, args) {
        this.doneFunc = func;
        this.doneObj = obj;
        this.doneArgs = args;
    };
    p.initComponent = function () {
        var _this = this;
        for (var i = 0; i < 5; ++i) {
            var grp = this["grpBox" + (i + 1)];
            if (i >= this.users.length) {
                grp.visible = false;
                continue;
            }
            else {
                grp.visible = true;
            }
            var u = this.users[i];
            var lab = this["labName" + (i + 1)];
            var gold = this["labGold" + (i + 1)];
            lab.text = u["name"];
            gold.text = u["point"] > 0 ? "+" + u["point"] : u["point"];
            //create card
            if (this.balance) {
                if (u["king"]) {
                    var king = new egret.Bitmap(RES.getRes("balance_king_png"));
                    king.x = 225;
                    king.y = 3;
                    king.scaleX = 0.6;
                    king.scaleY = 0.6;
                    grp.addChild(king);
                }
            }
            else {
                var cards = u["cards"];
                for (var n = 0; n < 3; ++n) {
                    var color = Math.floor(cards[n] / 100);
                    var value = cards[n] % 100;
                    var c = new Card(color, value);
                    c.scaleX = 0.5;
                    c.scaleY = 0.5;
                    c.x = 205 + n * 20;
                    c.y = 3;
                    grp.addChild(c);
                }
            }
            grp.x = i % 2 == 0 ? -303 : 326;
            var tw = egret.Tween.get(grp);
            tw.to({ x: 23 }, 300);
        }
        this.labStep.text = this.steptext;
        this.btnOk.label = this.btntext;
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            _this.btnOk.scaleX = 0.9;
            _this.btnOk.scaleY = 0.9;
        }, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_END, function () {
            _this.btnOk.scaleX = 1;
            _this.btnOk.scaleY = 1;
        }, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
    };
    p.onTouch = function (ev) {
        if (this.doneFunc) {
            this.doneFunc.apply(this.doneObj, this.doneArgs);
        }
        else {
            this.parent.removeChild(this);
        }
    };
    return Balance;
}(BaseComponent));
egret.registerClass(Balance,'Balance');
