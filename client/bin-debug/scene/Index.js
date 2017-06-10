/**
 *
 * @author
 *
 */
var Index = (function (_super) {
    __extends(Index, _super);
    function Index() {
        _super.call(this);
        this.main = Main.getInstance();
        this.net = this.main.net;
        this.net.bind("Index.create", this.onCreate, this);
        this.net.bind("Index.join", this.onJoin, this);
        this.load("game/IndexSkin.exml");
    }
    var d = __define,c=Index,p=c.prototype;
    p.hideInput = function () {
        this.grpInput.visible = false;
    };
    p.initComponent = function () {
        var _this = this;
        this.imgEnter.touchEnabled = true;
        this.imgEnter.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            _this.imgEnter.scaleX = 0.9;
            _this.imgEnter.scaleY = 0.9;
            _this.imgEnterBg.scaleX = 0.9;
            _this.imgEnterBg.scaleY = 0.9;
        }, this);
        this.imgEnter.addEventListener(egret.TouchEvent.TOUCH_END, function () {
            _this.imgEnter.scaleX = 1;
            _this.imgEnter.scaleY = 1;
            _this.imgEnterBg.scaleX = 1;
            _this.imgEnterBg.scaleY = 1;
        }, this);
        this.imgEnter.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEnterTouch, this);
        this.imgEnterBg.addEventListener(egret.Event.ENTER_FRAME, function (evt) {
            _this.imgEnterBg.rotation += 3;
        }, this);
        this.imgCreate.touchEnabled = true;
        this.imgCreate.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            _this.imgCreate.scaleX = 0.9;
            _this.imgCreate.scaleY = 0.9;
            _this.imgCreateBg.scaleX = 0.9;
            _this.imgCreateBg.scaleY = 0.9;
        }, this);
        this.imgCreate.addEventListener(egret.TouchEvent.TOUCH_END, function () {
            _this.imgCreate.scaleX = 1;
            _this.imgCreate.scaleY = 1;
            _this.imgCreateBg.scaleX = 1;
            _this.imgCreateBg.scaleY = 1;
        }, this);
        this.imgCreate.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateTouch, this);
        this.imgCreateBg.addEventListener(egret.Event.ENTER_FRAME, function (evt) {
            _this.imgCreateBg.rotation += 3;
        }, this);
        for (var i = 0; i <= 9; ++i) {
            this["btnNum" + i].addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNumTouch, this);
        }
        this.btnBackspace.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBackspace, this);
        this.btnCloseKeyboard.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCloseKeyboard, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onOk, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            _this.btnOk.scaleX = 0.9;
            _this.btnOk.scaleY = 0.9;
        }, this);
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_END, function () {
            _this.btnOk.scaleX = 1;
            _this.btnOk.scaleY = 1;
        }, this);
    };
    p.onNumTouch = function (ev) {
        if (this.labRoomId.text.length < 8) {
            this.labRoomId.text += ev.target.label;
        }
    };
    p.onBackspace = function (ev) {
        var str = this.labRoomId.text;
        if (str.length > 0) {
            this.labRoomId.text = str.substring(0, str.length - 1);
        }
    };
    p.onCloseKeyboard = function (ev) {
        this.grpInput.visible = false;
    };
    p.onOk = function (ev) {
        this.main.net.send("Index", "join", {
            "roomid": this.labRoomId.text,
        });
    };
    p.onEnterTouch = function () {
        if (this.main.user.roomid) {
            Main.getInstance().showGameScene();
        }
        else {
            this.grpInput.visible = true;
            this.labRoomId.text = "";
        }
    };
    p.onCreateTouch = function () {
        this.net.send("Index", "create", null);
    };
    p.onCreate = function (data) {
        this.main.user.roomid = data["roomid"];
        this.main.user.seatid = data["seatid"];
        this.main.showGameScene();
    };
    p.onJoin = function (data) {
        this.main.user.roomid = data["roomid"];
        this.main.user.seatid = data["seatid"];
        this.main.showGameScene();
    };
    return Index;
}(BaseComponent));
egret.registerClass(Index,'Index');
