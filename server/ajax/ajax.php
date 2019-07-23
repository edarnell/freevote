<?php
require 'config.php';
$ajax=new Ajax;
return $ajax;
// remove apcu for now - perhaps add back in
class Ajax {
    function request() {
        $this->init(['version'=>10]); // update when updated in FM.js
        $json=json_decode(file_get_contents("php://input"),true);
        $this->debug($json,true);
        if ($json && isset($json['req'])) {
            if (method_exists($this,'req_'.$json['req'])) $resp=$this->{'req_'.$json['req']}($json);
            else $resp=['e'=>'404','r'=>"404 ({$json['req']} Not Found)"];
            $this->response($resp);
            if ($this->con) $this->db('close'); // don't leave open db
            $this->debug($resp);
        }
        else $this->debug($json);
    }
    public function req_register($json)
	{
        $e=[]; $r=false;
        if (!$json['name']) $e['name']='required';
        else if (strlen($json['name'])>255) $e['name']='too long';

        if (!filter_var($json['email'],FILTER_VALIDATE_EMAIL)) $e['email']='invalid';
        else{
            $i=$this->db('select id,name,email,postcode,confirmed from users where email=?',['s',&$json['email']]);
            if (count($i)>0) {
                $this->user=$u=$i[0];
                if ($u['name']==$json['name'] && $u['postcode']==$json['postcode']) {
                    if (!$u['confirmed']) {
                        $token=$this->encrypt(json_encode(['id'=>$u['id'],'ts'=>time()]));
                        $this->mail('register',$json,$token);
                        $r='reconfirm';
                    }
                    else $r='confirmed';
                }
                else {
                    $update=[];
                    if ($u['name']!=$json['name']) $update['name']=$json['name'];
                    if ($u['postcode']!=$json['postcode']) $update['postcode']=$json['postcode'];
                    $token=$this->encrypt(json_encode(['id'=>$u['id'],'ts'=>time(),'update'=>$update]));
                    $this->mail('update',$json,$token);
                    $r='update';
                }
                // update?
            }
        }
        if (count($e)==0 && !$r) {
            $uid=$this->db("insert into users (name,email,postcode) values(?,?,?)",['sss',&$json['name'],&$json['email'],&$json['postcode']]);
            $token=$this->encrypt(json_encode(['id'=>$uid,'ts'=>time()]));
            //$this->db("update users set token=? where id=?",['si',&$token,&$uid]);
            $this->user=['id'=>$uid,'name'=>$json['name'],'email'=>$json['email']];
            $this->mail('register',$json,$token);
            $r='confirm';
        }
        return (count($e)>0)?['e'=>422,'r'=>$e]:['r'=>$r,'uid'=>$this->user['id']];
    }
    public function req_confirm($json)
	{
        $e=null;
        $token=json_decode($this->decrypt($json['token']),true);
        $u=$this->db("select name,email,id from users where id=?",['s',&$token['id']]);
        if ($u && $token['ts']>time()-48*3600) {
            $this->user=$u[0];
            $this->db("update users set confirmed='true' where id=?",['s',&$token['id']]);
            $this->mail('confirmed',null,$json['token']);
        }
        else $e='timeout';
        return $e?['r'=>['error'=>$e]]:['r'=>'confirmed','uid'=>$this->user['id']];
    }
    public function req_contact($json)
	{
        $e=null;
        if (isset($json['token'])) {
            $token=json_decode($this->decrypt($json['token']),true);
            $u=$this->db("select name,email,id,confirmed from users where id=?",['s',&$token['id']]);
            if ($u) {
                $this->user=$u[0];
                $this->mail('contact',$json,$json['token']);
            }
            $e='unknown user'
        }
        else $e='notoken';
        return $e?['r'=>['error'=>$e]]:['r'=>'sent','uid'=>$this->user['id']];
    }
    public function req_unsubscribe($json)
	{
        $user=$this->user();
        if (password_verify($json['password'],$user['password'])) {
            $this->db("update users set name=?,email=?,token='' where id=?",['ssi',&$user['id'],&$user['id'],&$user['id']]);
            $this->db("delete from tutors where user_id=? or email=?",['is',&$user['id'],&$user['email']]);
            $token=$this->encrypt(json_encode(['user'=>$user]));
            $this->mail('unsubscribe',$json,$token);
            $ret=['unsubscribe'=>'account deteted','uid'=>$user['id']];
        }
        else $ret=['e'=>401,'r'=>['password'=>'incorrect']];
        return $ret;
    }
    private function db_in_values(&$list,$key=null,$type) {
        if (!count($list)) $ret='';
        else {
            $ret=['?s'=>'','is'=>'','vs'=>[]];
            foreach ($list as $k=>$d) {
                if ($ret['?s']) $ret['?s'].=',?'; else $ret['?s']='?';
                $ret['is'].=$type;
                if ($key) $ret['vs'][]=&$list[$k][$key];
                else $ret['vs'][]=&$list[$k];
            }
            array_unshift($ret['vs'],$ret['is']);
        }
        $this->debug(['in'=>$ret],false,500);
        return $ret;
    }
    private function req_errorlog($json) {
        $user=$this->user();
        if ($user['id']==1) return ['errorlog'=>$this->zip(file_get_contents('../storage/error.log'))];
        else return ['e'=>401,'r'=>'unauthorised'];
    }
    private function validate($req,$spec) {
        foreach ($spec as $key=>$type) {
            if (!$req[$key]) $error[$key]=$type;
        }
        return isset($error)?['e'=>'422','r'=>$error]:null;
    }
    private function init($version) {
        error_reporting(E_ALL); // Reports all errors
        ini_set('display_errors','Off'); // Do not display errors for the end-users (security issue)
        ini_set('error_log',__DIR__.'/../storage/error.log'); // Set a logging file
        $this->freemaths=$version;
        $this->start=microtime(true);
        $this->config=config();
        $this->con=null;
        $this->mailer=null;
        $this->user=null;
        $this->origin=isset($_SERVER['HTTP_FV_ORIGIN'])?$_SERVER['HTTP_FV_ORIGIN']:null;
    }
    private function response($resp) {
        header('Content-type: application/json');
        if (isset($resp['e'])) {
            http_response_code($resp['e']);
            echo json_encode($resp['r']);
        }
        else echo json_encode($resp);
    }
    private function debug($message,$req=false,$max=250) {
        if (isset($message['password'])) $message['password']='...';
        if (is_array($message)) foreach ($message as $k=>$v) if (isset($message[$k]['password'])) $message[$k]['password']='...';
        $json=json_encode($message);
        if (strlen($json) > $max) {
            $short=[];
            foreach($message as $key=>$val) {
                $len=strlen(json_encode($val));
                if ($len > $max) $short[$key]="...($len)";
                else $short[$key]=$val;
            }
            $json=json_encode($short);
        }
        error_log(($req?'':number_format(round(microtime(true)-$this->start,4),4).',').$json.','.$this->start);
    }
    private function mail($type,$json=null,$token=null)
    {
        if (!$this->mailer) {
            require_once 'mailer.php';
            $this->mailer=new Mailer();
        }
        $user=$this->user?$this->user:['id'=>0,'name'=>$json['name'],'email'=>$json['email']];
        $this->mailer->send($type,$json,$token,$user);
    }
    private function db($query,$vals=[],$close=false) {
        $ret=null;
        if (in_array('db',$this->config['debug'])) $this->debug(['query'=>$query,'vals'=>$vals,'close'=>$close],false,500);
        if (!$this->con && $query!='close') {
            if ($this->con=new mysqli('localhost',$this->config['db']['user'],$this->config['db']['password'],$this->config['db']['db'])) {
                mysqli_set_charset($this->con,"utf8");
            }
        }
        if ($query=='close') $close=true;
        else if ($this->con && $query && count($vals)>0) {
            $stmt=$this->con->prepare($query);
            if (count($vals) > 0) call_user_func_array(array($stmt, 'bind_param'), $vals);
            $stmt->execute();
            if (substr($query,0,6)==='insert') $ret=mysqli_insert_id($this->con);
            else if (substr($query,0,6)==='update' || substr($query,0,6)==='delete') $ret=mysqli_affected_rows($this->con);
            else $ret=mysqli_fetch_all($stmt->get_result(),MYSQLI_ASSOC);
            $stmt->close();
        }
        else if ($this->con && $query) {
            $res=$this->con->query($query);
            if (substr($query,0,8)==='truncate') $ret=mysqli_affected_rows($this->con);
            else {
                $ret=mysqli_fetch_all($res,MYSQLI_ASSOC);
                mysqli_free_result($res);
            }
        }
        if ($this->con && $close) {
            mysqli_close($this->con);
            $this->con=null;
        }
        if (in_array('db',$this->config['debug'])) $this->debug(['query'=>$query,'vals'=>$vals,'result'=>$ret],false,500);
        return $ret;
    }
    private function unzip($zip) {
        return json_decode(gzuncompress(base64_decode($zip)),true);
    }
    private function zip($json) {
        return base64_encode(gzcompress(json_encode($json)));
    }
    private function decrypt($payload,$unserialize=true) {
        $payload=json_decode(base64_decode($payload),true);
        $iv=base64_decode($payload['iv']);
        $decrypted=openssl_decrypt($payload['value'],'AES-256-CBC',$this->config['key'],0,$iv);
        return $unserialize?unserialize($decrypted):$decrypted;
    }
    public function encrypt($value,$serialize=true) {
        $iv=random_bytes(openssl_cipher_iv_length('AES-256-CBC'));
        $value=openssl_encrypt($serialize?serialize($value):$value,'AES-256-CBC',$this->config['key'],0,$iv);
        $iv=base64_encode($iv);
        $mac=hash_hmac('sha256',$iv.$value,$this->config['key']);
        $json=json_encode(compact('iv','value','mac'));
        //$this->debug(['encrypt'=>$json?true:false,'iv'=>$iv?true:false,'value'=>$value?true:false,'mac'=>$mac?true:false]);
        return base64_encode($json);
    }
}
?>