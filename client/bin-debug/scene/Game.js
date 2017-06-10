/**
 *
 * @author
 *
 */
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        _super.call(this);
        this.seatid = 0; //我自己的位置
        this.state = 0; //状态
        this.current = 0; //当前出手位置
        this.coins = [];
        this.cards = [];
        this.pklist = [];
        this.op = false;
        this.timer = null;
        this.timerSecond = 0;
        this.pking = false;
        this.main = Main.getInstance();
        this.net = this.main.net;
        this.initNetwork();
        this.load("game/GameSkin.exml");
    }
    var d = __define,c=Game,p=c.prototype;
    p.initComponent = function () {
        //init seat
        this.seats = [new Seat(), new Seat(), new Seat(), new Seat(), new Seat()];
        for (var i = 1; i <= 4; ++i) {
            var seat = this.seats[i];
            seat.grpBox = this["seat" + i];
            seat.imgAvatar = this["faceImg" + i];
            seat.labName = this["nameLabel" + i];
            seat.labTotal = this["goldLabel" + i];
            seat.imgCard1 = this["cardaImg" + i];
            seat.imgCard2 = this["cardbImg" + i];
            seat.imgCard3 = this["cardcImg" + i];
            seat.imgState = this["statImg" + i];
            seat.imgBg = this["imgBg" + i];
        }
        //init my ui
        this.seats[0].active = true;
        this.seats[0].myself = true;
        this.seats[0].labTotal = this.labMyTotal;
        this.seats[0].labPoint = this.labMyPoint;
        this.imgMyCard1 = new egret.Sprite();
        this.imgMyCard1.x = 177;
        this.imgMyCard1.y = 697;
        this.addChild(this.imgMyCard1);
        this.imgMyCard2 = new egret.Sprite();
        this.imgMyCard2.x = 217;
        this.imgMyCard2.y = 697;
        this.addChild(this.imgMyCard2);
        this.imgMyCard3 = new egret.Sprite();
        this.imgMyCard3.x = 257;
        this.imgMyCard3.y = 697;
        this.addChild(this.imgMyCard3);
        //盖在牌上面
        this.setChildIndex(this.btnLook, this.getChildIndex(this.imgMyCard3) + 1);
        //begin btn
        this.btnStartGame.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBegin, this);
        this.btnDisband.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            Alert.show("确定解散房间吗？", false, function () {
                this.main.net.send("Room", "disband", null);
            }, this, true);
        }, this);
        this.btnStartGame.visible = false;
        this.btnDisband.visible = false;
        //init btn event
        this.btnLook.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.main.net.send("Room", "look", null);
        }, this);
        this.btnRaise = new GameButton("加注", "", "raise_enable_png", "raise_disable_png");
        this.btnRaise.visible = false;
        this.addChild(this.btnRaise);
        this.btnRaise.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.main.net.send("Room", "raise", null);
        }, this);
        this.btnFollow = new GameButton("跟注", "", "follow_enable_png", "follow_disable_png");
        this.btnFollow.visible = false;
        this.addChild(this.btnFollow);
        this.btnFollow.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.main.net.send("Room", "follow", null);
        }, this);
        this.btnGiveup = new GameButton("弃牌", "", "giveup_enable_png", "giveup_disable_png");
        this.btnGiveup.visible = false;
        this.addChild(this.btnGiveup);
        this.btnGiveup.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.main.net.send("Room", "giveup", null);
        }, this);
        this.btnPk = new GameButton("比牌", "", "pk_enable_png", "pk_enable_png");
        this.btnPk.visible = false;
        this.addChild(this.btnPk);
        this.btnPk.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            var bg = new egret.Bitmap(RES.getRes("topbar_bg_png"));
            bg.width = this.width;
            bg.height = this.height;
            bg.touchEnabled = true;
            bg.alpha = 0.3;
            bg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cancelPk, this);
            this.pklist.push(bg);
            this.addChild(bg);
            var tip = new eui.Label();
            tip.verticalCenter = 0;
            tip.horizontalCenter = 0;
            tip.text = "点击玩家头像比牌";
            tip.fontFamily = "微软雅黑";
            tip.size = 22;
            this.addChild(tip);
            this.pklist.push(tip);
            for (var i = 1; i < this.seats.length; ++i) {
                var seat = this.seats[i];
                if (seat.state == 2) {
                    var pk = new egret.Bitmap(RES.getRes("pk_png"));
                    pk.scale9Grid = new egret.Rectangle(15, 15, 64, 55);
                    pk.width = seat.imgBg.width + 2;
                    pk.height = seat.imgBg.height + 2;
                    pk.x = seat.grpBox.x + seat.imgBg.x - 2;
                    pk.y = seat.grpBox.y + seat.imgBg.y - 2;
                    pk.name = seat.pos + "";
                    pk.touchEnabled = true;
                    pk.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchPk, this);
                    this.pklist.push(pk);
                    this.addChild(pk);
                }
            }
        }, this);
    };
    p.initNetwork = function () {
        this.net.bind("Room.info", this.onInfo, this);
        this.net.bind("Room.ready", this.onReady, this);
        this.net.bind("Room.start", this.onStart, this);
        this.net.bind("Room.raise", this.onRaise, this);
        this.net.bind("Room.join", this.onJoin, this);
        this.net.bind("Room.look", this.onLook, this);
        this.net.bind("Room.look2", this.onLook2, this);
        this.net.bind("Room.follow", this.onFollow, this);
        this.net.bind("Room.giveup", this.onGiveup, this);
        this.net.bind("Room.pk", this.onPK, this);
        this.net.bind("Room.over", this.onOver, this);
        this.net.bind("Room.online", this.onOnline, this);
        this.net.bind("Room.offline", this.onOffline, this);
        this.net.bind("Room.disband", this.onDisband, this);
    };
    p.onTouchPk = function (ev) {
        var pos = (ev.target).name;
        this.main.net.send("Room", "pk", {
            "seatid": pos,
        });
        this.cancelPk();
    };
    p.cancelPk = function () {
        for (var i in this.pklist) {
            this.removeChild(this.pklist[i]);
        }
        this.pklist = [];
    };
    p.getSeatByPos = function (_pos) {
        var indexs = [
            [0, 3, 4, 1, 2],
            [2, 0, 3, 4, 1],
            [1, 2, 0, 3, 4],
            [4, 1, 2, 0, 3],
            [3, 4, 1, 2, 0] //我在第5号位置
        ];
        var idx = indexs[this.seatid - 1][_pos - 1];
        return this.seats[idx];
    };
    p.showButtons = function (show) {
        console.log("show buttons=" + show);
        if (show) {
            this.btnRaise.x = this.imgMyCard2.x;
            this.btnRaise.y = this.imgMyCard2.y;
            this.btnRaise.alpha = 0.5;
            this.btnRaise.visible = true;
            this.btnFollow.x = this.imgMyCard2.x;
            this.btnFollow.y = this.imgMyCard2.y;
            this.btnFollow.alpha = 0.5;
            this.btnFollow.visible = true;
            this.btnGiveup.x = this.imgMyCard2.x;
            this.btnGiveup.y = this.imgMyCard2.y;
            this.btnGiveup.alpha = 0.5;
            this.btnGiveup.visible = true;
            this.btnPk.x = this.imgMyCard2.x;
            this.btnPk.y = this.imgMyCard2.y;
            this.btnPk.alpha = 0.5;
            this.btnPk.visible = true;
            egret.Tween.removeTweens(this.btnGiveup);
            egret.Tween.removeTweens(this.btnRaise);
            egret.Tween.removeTweens(this.btnFollow);
            egret.Tween.removeTweens(this.btnPk);
            egret.Tween.get(this.btnGiveup).to({ x: 43 + 42.5, y: 610 + 56, alpha: 1 }, 300);
            egret.Tween.get(this.btnRaise).to({ x: 125 + 42.5, y: 540 + 56, alpha: 1 }, 300);
            egret.Tween.get(this.btnFollow).to({ x: 278 + 42.5, y: 540 + 56, alpha: 1 }, 300);
            egret.Tween.get(this.btnPk).to({ x: 355 + 42.5, y: 610 + 56, alpha: 1 }, 300);
        }
        else if (this.op == true) {
            var tox = this.imgMyCard2.x;
            var toy = this.imgMyCard2.y;
            egret.Tween.get(this.btnGiveup).to({ x: tox, y: toy, alpha: 0.5 }, 300).call(function (btn) {
                btn.visible = false;
            }, this, [this.btnGiveup]);
            egret.Tween.get(this.btnRaise).to({ x: tox, y: toy, alpha: 0.5 }, 300).call(function (btn) {
                btn.visible = false;
            }, this, [this.btnRaise]);
            egret.Tween.get(this.btnFollow).to({ x: tox, y: toy, alpha: 0.5 }, 300).call(function (btn) {
                btn.visible = false;
            }, this, [this.btnFollow]);
            egret.Tween.get(this.btnPk).to({ x: tox, y: toy, alpha: 0.5 }, 300).call(function (btn) {
                btn.visible = false;
            }, this, [this.btnPk]);
        }
    };
    p.updateTimer = function () {
        var _this = this;
        if (!this.timer) {
            this.timer = new egret.Timer(1000, 15);
            this.timer.addEventListener(egret.TimerEvent.TIMER, function () {
                _this.labTimer.label = (--_this.timerSecond) + "";
            }, this);
            this.timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function () {
                if (_this.current == _this.seatid) {
                    _this.main.net.send("Room", "giveup", null);
                }
            }, this);
        }
        if (this.state && this.current) {
            this.timerSecond = 15;
            this.labTimer.label = this.timerSecond + "";
            this.labTimer.visible = true;
            if (this.current != this.seatid) {
                var seat = this.getSeatByPos(this.current);
                this.labTimer.x = seat.grpBox.x + seat.imgCard2.x + seat.imgCard2.width * 0.5;
                this.labTimer.y = seat.grpBox.y + seat.imgCard2.y - this.labTimer.height * 0.5 - 5;
                console.log(this.labTimer.x, this.labTimer.y);
            }
            else {
                this.labTimer.x = 242;
                this.labTimer.y = 560;
            }
            this.timer.reset();
            this.timer.start();
        }
        else {
            this.labTimer.visible = false;
            this.timer.stop();
        }
    };
    p.updateUI = function (ani) {
        if (ani === void 0) { ani = true; }
        //opbtn
        if (this.state == 1 && this.current == this.seatid) {
            console.log("current=myself");
            this.btnRaise.setEnable((this.currentgold < this.maxgold));
            if (ani) {
                this.showButtons(true);
            }
            else {
                this.btnRaise.visible = true;
                this.btnFollow.visible = true;
                this.btnGiveup.visible = true;
                this.btnPk.visible = true;
                this.btnGiveup.x = 43 + 42.5;
                this.btnGiveup.y = 610 + 56;
                this.btnRaise.x = 125 + 42.5;
                this.btnRaise.y = 540 + 56;
                this.btnFollow.x = 278 + 42.5;
                this.btnFollow.y = 540 + 56;
                this.btnPk.x = 355 + 42.5;
                this.btnPk.y = 610 + 56;
            }
            this.op = true;
        }
        else {
            console.log("current=other");
            if (ani) {
                this.showButtons(false);
            }
            else {
                this.btnRaise.visible = false;
                this.btnFollow.visible = false;
                this.btnGiveup.visible = false;
                this.btnPk.visible = false;
            }
            this.op = false;
        }
        this.btnLook.visible = (this.state == 1 && !this.seats[0].look) ? true : false;
        if (this.state) {
            this.btnStartGame.visible = false;
            this.btnDisband.visible = false;
        }
        else {
            if (this.owner == this.main.user.uid) {
                this.btnStartGame.label = "开始";
                this.btnDisband.visible = true;
            }
            else {
                this.btnStartGame.label = "准备";
                this.btnDisband.visible = false;
            }
            this.btnStartGame.visible = true;
        }
        this.labTotal.text = this.totalgold + "";
        this.updateTimer();
    };
    p.updateCard = function () {
        this.imgMyCard1.removeChildren();
        this.imgMyCard2.removeChildren();
        this.imgMyCard3.removeChildren();
        if (this.state && this.seats[0].look) {
            this.imgMyCard1.addChild(new Card(Math.floor(this.cards[2] / 100), this.cards[2] % 100));
            this.imgMyCard2.addChild(new Card(Math.floor(this.cards[1] / 100), this.cards[1] % 100));
            this.imgMyCard3.addChild(new Card(Math.floor(this.cards[0] / 100), this.cards[0] % 100));
        }
        else {
            this.imgMyCard1.addChild(new egret.Bitmap(RES.getRes("card_back_png")));
            this.imgMyCard2.addChild(new egret.Bitmap(RES.getRes("card_back_png")));
            this.imgMyCard3.addChild(new egret.Bitmap(RES.getRes("card_back_png")));
        }
    };
    p.addCoin = function (v, seatid) {
        var res = "coin_" + v + "_png";
        var coin = new egret.Bitmap(RES.getRes(res));
        coin.scaleX = 0.7;
        coin.scaleY = 0.7;
        var x = Utils.rand(160, 300);
        var y = Utils.rand(310, 400);
        //init
        if (seatid) {
            if (seatid == this.seatid) {
                coin.x = this.imgMyCard2.x;
                coin.y = this.imgMyCard2.y;
            }
            else {
                var seat = this.getSeatByPos(seatid);
                coin.x = seat.grpBox.x + seat.imgCard2.x;
                coin.y = seat.grpBox.y + seat.imgCard2.y;
            }
        }
        else {
            coin.x = x;
            coin.y = y;
        }
        //add
        this.addChild(coin);
        this.coins.push(coin);
        //tween
        if (seatid) {
            var tw = egret.Tween.get(coin);
            tw.to({ x: x, y: y }, 200, egret.Ease.sineOut);
        }
    };
    p.clearCoin = function () {
        for (var x in this.coins) {
            this.removeChild(this.coins[x]);
        }
        this.coins = [];
    };
    p.onBegin = function (e) {
        if (this.main.user.uid == this.owner) {
            this.main.net.send("Room", "start", null);
        }
        else {
            this.main.net.send("Room", "ready", null);
        }
    };
    p.updateFollowLable = function () {
        var multi = (this.seats[0].look) ? 2 : 1;
        this.btnFollow.setLable((this.currentgold * multi) + "");
    };
    p.onInfo = function (data) {
        //init data
        this.roomid = data["id"];
        this.seatid = data["seatid"];
        this.totalgold = data["total"];
        this.currentgold = data["point"];
        this.maxgold = data["max"];
        this.owner = data["owner"];
        this.state = data["state"];
        this.current = data["current"];
        this.cards = data["cards"];
        this.labRoomId.text = this.roomid + "";
        //init seat
        this.seats[1].hide();
        this.seats[2].hide();
        this.seats[3].hide();
        this.seats[4].hide();
        for (var x in data["users"]) {
            var u = data["users"][x];
            this.onJoin(u);
        }
        //init coins
        var coins = data["coins"];
        for (var x in coins) {
            this.addCoin(coins[x], 0);
        }
        //init card
        this.updateCard();
        //update ui
        this.labMyTotal.text = this.seats[0].total + "";
        this.labMyPoint.text = this.seats[0].point + "";
        this.labTip.text = "底注：1  单注上限：" + this.maxgold;
        this.updateFollowLable();
        this.updateUI(false);
    };
    p.onDisband = function (data) {
        var _this = this;
        var list = data["list"];
        if (list.length > 0) {
            Alert.show("该房间已被房主解散，点击查看结算数据", false, function () {
                _this.main.user.roomid = 0;
                _this.main.user.seatid = 0;
                var details = [];
                for (var i in list) {
                    var dat = list[i];
                    var seat = _this.getSeatByPos(dat["seatid"]);
                    details.push({
                        "name": seat.name,
                        "total": dat["total"],
                        "point": dat["point"],
                        "king": dat["king"]
                    });
                }
                var b = new Balance(details, "结算", "退出游戏", true);
                b.horizontalCenter = 0;
                b.verticalCenter = 0;
                b.setDoneHandler(function (b) {
                    _this.removeChild(b);
                    Main.getInstance().showIndexScene();
                }, _this, [b]);
                _this.addChild(b);
            }, this);
        }
        else {
            Alert.show("该房间已被房主解散，点击确定退出", false, function () {
                _this.main.user.roomid = 0;
                _this.main.user.seatid = 0;
                Main.getInstance().showIndexScene();
            }, this);
        }
    };
    p.onOnline = function (data) {
        var seat = this.getSeatByPos(data["seatid"]);
        seat.offline = 0;
        seat.updateState();
    };
    p.onOffline = function (data) {
        var seat = this.getSeatByPos(data["seatid"]);
        seat.offline = 1;
        seat.updateState();
    };
    p.onJoin = function (u) {
        var seatid = u["seatid"];
        var seat = this.getSeatByPos(seatid);
        seat.seatid = seatid;
        seat.uid = u["uid"];
        seat.avatar = u["avatar"];
        seat.name = u["name"];
        seat.total = u["total"];
        seat.point = u["point"];
        seat.state = u["state"];
        seat.pos = seatid;
        seat.look = u["look"];
        seat.lose = u["lose"];
        seat.giveup = u["giveup"];
        seat.offline = u["offline"];
        seat.updateState();
        seat.show();
    };
    p.onReady = function (data) {
        var seatid = data["seatid"];
        var seat = this.getSeatByPos(seatid);
        seat.state = 1;
        seat.updateState();
        if (seat.myself) {
            this.btnStartGame.visible = false;
        }
    };
    p.onStart = function (data) {
        this.totalgold = data["total"];
        this.currentgold = data["point"];
        this.current = data["current"];
        this.state = 1;
        var userpoint = data["userpoint"];
        for (var i in this.seats) {
            var seat = this.seats[i];
            if (seat.active) {
                seat.point = userpoint;
                seat.state = 2;
                seat.updateGold();
                seat.updateState();
                this.addCoin(userpoint, 0);
            }
        }
        this.updateFollowLable();
        this.updateCard();
        this.updateUI();
    };
    p.onRaise = function (data) {
        this.totalgold = data["total"];
        this.currentgold = data["point"];
        this.current = data["current"];
        var seatid = data["seatid"];
        var seat = this.getSeatByPos(seatid);
        seat.point = data["user_point"];
        seat.updateGold();
        this.addCoin(data["add_point"], seatid);
        this.updateFollowLable();
        this.updateUI();
        Utils.playSound("jiazhu-f");
    };
    p.onFollow = function (data) {
        this.totalgold = data["total"];
        this.current = data["current"];
        var seatid = data["seatid"];
        var seat = this.getSeatByPos(seatid);
        seat.point = data["user_point"];
        seat.updateGold();
        this.addCoin(data["add_point"], seatid);
        this.updateUI();
        Utils.playSound("push_coin-c");
    };
    p.onLook = function (data) {
        this.cards = data["cards"];
        this.seats[0].look = 1;
        this.btnLook.visible = false;
        this.updateFollowLable();
        this.updateCard();
    };
    p.onLook2 = function (data) {
        var seatid = data["seatid"];
        var seat = this.getSeatByPos(seatid);
        seat.look = 1;
        seat.updateState();
        Utils.playSound("wokanpai-f");
    };
    p.onGiveup = function (data) {
        var seatid = data["seatid"];
        var seat = this.getSeatByPos(seatid);
        seat.giveup = 1;
        seat.state = 0;
        seat.updateState();
        this.current = data["current"];
        this.updateUI();
        Utils.playSound("fangqi-f");
    };
    p.onPK = function (data) {
        var _this = this;
        this.totalgold = data["total"];
        this.currentgold = data["point"];
        this.current = data["current"];
        var seatid = data["seatid"];
        var pkid = data["pkid"];
        var loseid = data["loseid"];
        var seat = this.getSeatByPos(seatid);
        var pk = this.getSeatByPos(pkid);
        seat.point = data["user_point"];
        seat.updateGold();
        var loser = this.getSeatByPos(loseid);
        loser.lose = 1;
        loser.state = 0;
        loser.updateState();
        this.pking = true;
        this.addCoin(data["add_point"], seatid);
        this.updateUI();
        var vsbg = new egret.Bitmap(RES.getRes("topbar_bg_png"));
        vsbg.x = 0;
        vsbg.y = 0;
        vsbg.width = 480;
        vsbg.height = 800;
        vsbg.alpha = 0.2;
        this.addChild(vsbg);
        var vs = new VS([{
                "name": seat.name,
                "point": seat.total,
                "avatar": seat.avatar
            }, {
                "name": pk.name,
                "point": pk.total,
                "avatar": pk.avatar
            }], loseid == seatid ? 1 : 2);
        vs.x = 0;
        vs.y = 310;
        vs.setDoneHandler(function (vs, vsbg) {
            setTimeout(function (pthis, vs) {
                pthis.pking = false;
                pthis.removeChild(vsbg);
                pthis.removeChild(vs);
                if (pthis.pkdone) {
                    pthis.pkdone();
                }
            }, 1500, _this, vs, vsbg);
        }, this, [vs, vsbg]);
        this.addChild(vs);
        Utils.playSound("pk-c");
    };
    p.onOver = function (data) {
        this.state = 0;
        this.totalgold = 0;
        this.currentgold = 0;
        var balance = data["balance"];
        var list = data["list"];
        var list2 = data["list2"];
        var step = data["step"];
        var listDetails = [];
        var list2Details = [];
        for (var i in list) {
            var dat = list[i];
            var seat = this.getSeatByPos(dat["seatid"]);
            seat.total = dat["total"];
            seat.point = 0;
            seat.state = 0;
            seat.look = 0;
            seat.lose = 0;
            seat.giveup = 0;
            seat.updateGold();
            seat.updateState();
            listDetails.push({
                "name": seat.name,
                "total": seat.total,
                "point": dat["point"],
                "cards": dat["cards"],
            });
        }
        if (balance) {
            this.main.user.roomid = 0;
            this.main.user.seatid = 0;
            for (var i in list2) {
                var dat = list2[i];
                var seat = this.getSeatByPos(dat["seatid"]);
                list2Details.push({
                    "name": seat.name,
                    "total": dat["total"],
                    "point": dat["point"],
                    "king": dat["king"]
                });
            }
        }
        //结算面板
        var callback = function () {
            var _this = this;
            var btntext = step == 5 ? "查看结算" : "继续游戏";
            var b = new Balance(listDetails, "第" + step + "局", btntext, false);
            b.x = 77;
            b.y = 175;
            b.setDoneHandler(function (p1, p2, p3) {
                _this.removeChild(p1);
                if (!p2) {
                    return;
                }
                var b2 = new Balance(p3, "结算", "退出游戏", true);
                b2.x = 77;
                b2.y = 175;
                b2.setDoneHandler(function (b2) {
                    _this.removeChild(b2);
                    Main.getInstance().showIndexScene();
                }, _this, [b2]);
                _this.addChild(b2);
            }, this, [b, balance, list2Details]);
            this.addChild(b);
            this.pkdone = null;
        };
        if (this.pking) {
            this.pkdone = callback;
        }
        else {
            callback.call(this);
        }
        //扣金币
        this.main.user.gold -= 1;
        this.main.updateTopbar();
        //清理coin
        this.clearCoin();
        this.updateUI();
    };
    return Game;
}(BaseComponent));
egret.registerClass(Game,'Game');
var Seat = (function () {
    function Seat() {
        this.states = [
            "null",
            "cards_ready_png",
            "cards_viewed_png",
            "cards_givenup_png",
            "cards_lose_png",
            "cards_offline_png"
        ];
    }
    var d = __define,c=Seat,p=c.prototype;
    p.hide = function () {
        if (!this.myself) {
            this.grpBox.visible = false;
        }
        this.active = false;
    };
    p.show = function () {
        this.active = true;
        if (!this.myself) {
            this.labName.text = this.name;
            this.labTotal.text = this.total + "";
            this.imgAvatar.source = this.avatar ? Utils.imageProxyUrl(this.avatar) : "face_jpg";
            this.grpBox.visible = true;
        }
    };
    p.updateGold = function () {
        this.labTotal.text = this.total + "";
        if (this.myself) {
            this.labPoint.text = this.point + "";
        }
    };
    p.updateState = function () {
        if (this.myself) {
            return;
        }
        if (this.offline) {
            this.setState(Seat.STAT_OFFLINE);
        }
        else if (this.lose) {
            this.setState(Seat.STAT_LOSE);
        }
        else if (this.giveup) {
            this.setState(Seat.STAT_GIVEUP);
        }
        else if (this.look) {
            this.setState(Seat.STAT_LOOK);
        }
        else if (this.state == 1) {
            this.setState(Seat.STAT_READY);
        }
        else {
            this.setState(Seat.STAT_NONE);
        }
    };
    p.setState = function (_state) {
        if (_state == 0) {
            this.imgState.visible = false;
        }
        else {
            this.imgState.source = this.states[_state];
            this.imgState.visible = true;
        }
    };
    Seat.STAT_NONE = 0;
    Seat.STAT_READY = 1;
    Seat.STAT_LOOK = 2;
    Seat.STAT_GIVEUP = 3;
    Seat.STAT_LOSE = 4;
    Seat.STAT_OFFLINE = 5;
    return Seat;
}());
egret.registerClass(Seat,'Seat');
