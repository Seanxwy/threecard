<?php
class RouterClient
{
	private $_socket = null;
	
	public function __construct()
	{
	}
	
	public function close()
	{
		if($this->_socket){
			fclose($this->_socket);
		}
	}
	
	public function sendMsg($sid, $msg)
	{
		$this->send(5, $sid, $msg);
	}
	
	public function sendAllMsg($msg)
	{
		$this->send(6, "", $msg);
	}

	public function kickUser($sid)
	{
		$this->send(4, $sid, "");
	}
	
	public function addChannel($channel, $sid)
	{
		$this->send(7, $sid, $channel);
	}
	
	public function delChannel($channel, $sid)
	{
		$this->send(8, $sid, $channel);
	}
	
	public function publish($channel, $msg)
	{
		$this->send(9, $channel, $msg);
	}
	
	public function info()
	{
		$this->send(12, "", "");
		
		$msg = $this->recv();
		if(!$msg){
			echo "read info data error\n";
			return array();
		}
		
		$data = $msg['body'];
		$info = array();
		do{
			$pos = strpos($data, "\r\n");
			if($pos === false){
				break;
			}
			
			$line = substr($data, 0, $pos);
			$args = explode(': ', $line);
			if($args[0] == 'gateway'){
				list($serverid, $workerid, $clients, $channels) = explode("\t", $args[1]);
				$info['gateway'][$serverid][] = array(
					'serverid' => $serverid,
					'workerid' => $workerid,
					'clients' => $clients,
					'channels' => $channels,
				);
			}else{
				$info[$args[0]] = $args[1];
			}
			
			$data = substr($data, strlen($line) + 2);
		}while(true);
		
		return $info;
	}
	
	public function connect($host, $port)
	{
		$errno = 0;
		$errstr = '';
		$this->_socket = stream_socket_client("tcp://$host:$port", $errno, $errstr);
		if(!$this->_socket){
			echo "connect $host:$port failed, $errstr\n";
			return ;
		}
	}
	
	private function send($type, $sid, $msg)
	{
		if(!$this->_socket){
			return false;
		}

		$data = $this->writeInt16($type);
		$data.= $this->writeInt16(strlen($sid));
		$data.= $this->writeInt32(strlen($msg));
		$data.= $sid;
		$data.= $msg;

		fwrite($this->_socket, $data, strlen($data));
	}
	
	private function recv()
	{
		if(!$this->_socket){
			return false;
		}
		
		$data = fread($this->_socket, 8);
		if(strlen($data) != 8){
			return false;
		}
		
		$type = $this->readInt16($data);
		$slen = $this->readInt16($data, 2);
		$dlen = $this->readInt32($data, 4);
		$body = fread($this->_socket, $dlen);
		
		return array(
			'type' => $type,
			'slen' => $slen,
			'len' => $dlen,
			'body' => $body
		);
	}
	
	private function writeInt16($val)
	{
		return (chr(($val >> 8) & 0xFF) . chr($val & 0xFF));
	}
	
	private function writeInt32($val)
	{
		return (chr(($val >> 24) & 0xFF) . chr(($val >> 16) & 0xFF) . chr(($val >> 8) & 0xFF) . chr($val & 0xFF));
	}
	
	private function readInt16($data, $offset = 0)
	{
		return (ord($data{$offset+0}) << 8 | ord($data{$offset+1}));
	}
	
	private function readInt32($data, $offset = 0)
	{
		return (ord($data{$offset+0}) << 24) | (ord($data{$offset+1}) << 16) | (ord($data{$offset+2}) << 8) | ord($data{$offset+3});
	}
}