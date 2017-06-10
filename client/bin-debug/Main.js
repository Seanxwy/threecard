//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.alertView = null;
        this.topbar = null;
        this.home = null;
        this.current = null;
        this.indexScene = null;
        this.gameScene = null;
        Main.instance = this;
    }
    var d = __define,c=Main,p=c.prototype;
    Main.getInstance = function () {
        return Main.instance;
    };
    /**
     * 加载进度界面
     * loading process interface
     */
    p.createChildren = function () {
        _super.prototype.createChildren.call(this);
        //inject the custom material parser
        //注入自定义的素材解析器
        var assetAdapter = new AssetAdapter();
        this.stage.registerImplementation("eui.IAssetAdapter", assetAdapter);
        this.stage.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
        //Config loading process interface
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.addChild(this.loadingView);
        //初始化Resource资源加载库
        this.loadingView.setLoadingText("正在加载配置");
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json?v=" + Math.random(), "resource/");
    };
    /**
     * 加载资源
     */
    p.loadRes = function (groupname) {
        if (!this.loadingView.visible) {
            this.loadingView.visible = true;
            this.addChild(this.loadingView);
        }
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup(groupname);
    };
    /**
     * 配置文件加载完成,开始预加载皮肤主题资源和preload资源组。
     * Loading of configuration file is complete, start to pre-load the theme configuration file and the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // load skin theme configuration file, you can manually modify the file. And replace the default skin.
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        this.loadingView.setLoadingText("正在加载皮肤主题");
        var theme = new eui.Theme("resource/default.thm.json?v=" + Math.random(), this.stage);
        theme.addEventListener(eui.UIEvent.COMPLETE, this.onThemeLoadComplete, this);
        this.loadRes("preload");
    };
    /**
     * 主题文件加载完成,开始预加载
     * Loading of theme configuration file is complete, start to pre-load the
     */
    p.onThemeLoadComplete = function () {
        //初始化alert
        this.alertView = new Alert();
        this.alertView.horizontalCenter = 0;
        this.alertView.verticalCenter = 0;
        //加载资源
        this.loadingView.setLoadingText("正在加载资源");
        this.loadRes("preload");
    };
    p.onResourceLoadComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        if (event.groupName == "preload") {
            this.createScene();
        }
        else if (event.groupName == "game") {
            this.initGame();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     * Resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //ignore loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    p.onResourceProgress = function (event) {
        this.loadingView.setLoadingText("Loading..." + Math.ceil(event.itemsLoaded / event.itemsTotal * 100) + "%");
    };
    /**
     * 初始化游戏
     */
    p.initGame = function () {
        //init network
        this.net = new Network();
        this.net.setConnectHandler(this.onServerConnected, this);
        this.net.setCloseHandler(this.onServerClosed, this);
        //get server
        this.loadingView.setLoadingText("正在获取服务器信息");
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open("http://" + location.host + "/api.php?cmd=getserver&r=" + Math.random());
        request.addEventListener(egret.Event.COMPLETE, function (e) {
            var s = JSON.parse(request.response);
            this.loadingView.setLoadingText("正在连接服务器");
            this.net.connect(s.host, s.port);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            this.loadingView.setLoadingText("获取服务器失败");
        }, this);
        request.send();
    };
    p.onServerConnected = function () {
        this.net.bind("Index.login", this.onLogin, this);
        this.net.bind("Error", this.onError, this);
        //发送登录
        this.loadingView.setLoadingText("正在登录");
        this.net.send("Index", "login", {
            "username": this.username,
            "token": this.token
        });
    };
    p.onServerClosed = function () {
        if (this.net.isConnected()) {
            Alert.show("与服务器断开连接", false, function () {
                window.location.reload();
            }, this);
        }
        else {
            Alert.show("无法连接服务器", false);
        }
    };
    p.onError = function (errstr) {
        Alert.show(errstr);
    };
    p.onLogin = function (data) {
        this.user = new UserData();
        this.user.uid = data["uid"];
        this.user.username = data["username"];
        this.user.nickname = data["nickname"];
        this.user.avatar = data["avatar"];
        this.user.gamepoint = data["gamepoint"];
        this.user.gold = data["gold"];
        this.user.roomid = data["roomid"];
        this.user.seatid = data["seatid"];
        this.createGame();
    };
    p.createScene = function () {
        this.loadingView.visible = false;
        this.removeChildren();
        var login = new Login();
        this.addChild(login);
    };
    p.createGame = function () {
        this.loadingView.visible = false;
        this.removeChildren();
        //draw background
        var bg = new egret.Bitmap(RES.getRes("bg"));
        this.addChild(bg);
        //draw home
        this.home = new egret.DisplayObjectContainer();
        this.home.width = this.stage.stageWidth;
        this.home.height = this.stage.stageHeight;
        this.addChild(this.home);
        //draw topbar
        this.topbar = new Topbar();
        this.addChild(this.topbar);
        this.topbar.labelName.text = this.user.nickname;
        this.topbar.labelGold.text = this.user.gold + "";
        this.topbar.imgAvatar.source = this.user.avatar ? Utils.imageProxyUrl(this.user.avatar) : "face_jpg";
        //show scene
        this.showIndexScene();
    };
    p.display = function (scene) {
        if (this.current) {
            this.home.removeChild(this.current);
        }
        this.current = scene;
        this.home.addChild(this.current);
    };
    p.showIndexScene = function () {
        if (!this.indexScene) {
            this.indexScene = new Index();
        }
        this.indexScene.hideInput();
        this.display(this.indexScene);
    };
    p.showGameScene = function () {
        if (!this.gameScene) {
            this.gameScene = new Game();
        }
        this.net.send("Room", "info", {
            "roomid": this.user.roomid,
        });
        this.display(this.gameScene);
    };
    p.updateTopbar = function () {
        this.topbar.labelGold.text = this.user.gold + "";
    };
    return Main;
}(eui.UILayer));
egret.registerClass(Main,'Main');
