/**
 *
 * @author 
 *
 */
class Network {
    private socket:egret.WebSocket;
    private state:number;
    private host:string;
    private port:number;
    private handler:Object = {};
    private cbConnect:Array<any>;
    private cbClose:Array<any>;
    private cbError:Array<any>;
    
	public constructor() {
        //创建 WebSocket 对象
        this.socket = new egret.WebSocket();
        //设置数据格式为二进制，默认为字符串
        //this.socket.type = egret.WebSocket.TYPE_BINARY;
        //添加收到数据侦听，收到数据会调用此方法
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA,this.onSocketData,this);
        //添加链接打开侦听，连接成功会调用此方法
        this.socket.addEventListener(egret.Event.CONNECT,this.onSocketOpen,this);
        //添加链接关闭侦听，手动关闭或者服务器关闭连接会调用此方法
        this.socket.addEventListener(egret.Event.CLOSE,this.onSocketClose,this);
        //添加异常侦听，出现异常会调用此方法
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR,this.onSocketError,this);
	}
	
	public setConnectHandler(_func:Function, _obj:Object){
	    this.cbConnect = [_obj, _func];
	}
	
	public setCloseHandler(_func:Function, _obj:Object){
	    this.cbClose = [_obj, _func];
	}
	
    public setErrorHandler(_func: Function,_obj: Object) {
        this.cbError = [_obj,_func];
    }
	
	public connect(_host:string, _port:number){
        this.state = 0;
    	  this.host = _host;
    	  this.port = _port;
	    this.socket.connect(_host, _port);
	}
	
	public reconnect(){
	    this.connect(this.host, this.port);
	}
	
	public bind(name:string, func:Function, obj:Object){
	    this.handler[name] = [obj, func];
	}
	
	public send(c:string, m:string, data:any)
	{
        var obj:Object = {
            "c" : c,
            "m" : m,
            "data": data
        };
        console.log("send -->", JSON.stringify(obj))
        this.socket.writeUTF(JSON.stringify(obj));
	}
	
	public isConnected(){
	    return this.state == 1;
	}
	
    private onSocketOpen(): void {
        console.log("websocket connected");
        if(this.cbConnect.length > 0){
            var obj: Object = this.cbConnect[0];
            var func: Function = this.cbConnect[1];
            func.call(obj);
        }
        this.state = 1;
    }

    private onSocketClose(): void {
        console.log("websocket closed");
        if(this.cbClose.length > 0) {
            var obj: Object = this.cbClose[0];
            var func: Function = this.cbClose[1];
            func.call(obj);
        }
    }

    private onSocketError(): void {
        console.log("websocket error");
        if(this.cbError.length > 0) {
            var obj: Object = this.cbError[0];
            var func: Function = this.cbError[1];
            func.call(obj);
        }
    }

    private onSocketData(e: egret.ProgressEvent): void {
        var bytes: string = this.socket.readUTF();
        console.log("recv -->", bytes);
        var packet: Object = JSON.parse(bytes);
        this.dispatch(packet);
    }

    private dispatch(msg: Object) {
        //data handler
        var error:number = msg["err"];
        var name:string = error ? "Error" : msg["c"] + "." + msg["m"];
        var cb:Array<any> = this.handler[name];
        if(cb){
            var obj:Object = cb[0];
            var func:Function = cb[1];
            func.call(obj, msg["data"]);
        }else{
            console.log("not found handler --> " + name)
        }
    }
}
