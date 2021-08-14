<?php
require 'config.php';
$ajax = new Ajax;
return $ajax;
// remove apcu for now - perhaps add back in
class Ajax
{
    function request()
    {
        $this->init();
        $json = json_decode(file_get_contents("php://input"), true);
        if ($json && isset($json['req'])) {
            $this->debug($json, true);
            if (method_exists($this, 'req_' . $json['req'])) $resp = $this->{'req_' . $json['req']}($json);
            else $resp = ['e' => '404', 'r' => ['error' => "404 ({$json['req']} Not Found)"]];
            $this->response($resp);
            if ($this->con) $this->db('close'); // don't leave open db
            $this->debug($resp);
            if (isset($resp['send'])) {
                // send after response to prevent lag
                //sleep(1); // perhaps  - allow context-switch for response to be sent
                if (!$this->mailer) {
                    require_once 'mailer.php';
                    $this->mailer = new Mailer();
                }
                $this->mailer->send($resp['send']);
                //$this->debug(['sent' => $resp['send']]);
            }
        } else $this->debug($json);
    }

    public function req_count()
    {
        $r = $this->db('select count(id) as n from users where confirmed=1', [], true);
        $n = count($r) ? $r[0]['n'] : 0;
        return ['n' => $n];
    }

    public function req_register($json)
    {
        $e = [];
        $r = false;
        if (!$json['name']) $e['name'] = 'required';
        else if (strlen($json['name']) > 255) $e['name'] = 'too long';

        if (!filter_var($json['email'], FILTER_VALIDATE_EMAIL)) $e['email'] = 'invalid';
        else {
            $i = $this->db('select id,name,email,postcode,confirmed from users where email=?', ['s', &$json['email']]);
            if (count($i) > 0) {
                $this->user = $u = $i[0];
                if ($u['name'] == $json['name'] && $u['postcode'] == $json['postcode']) {
                    $token = $this->encrypt(json_encode(['id' => $u['id'], 'ts' => time()]));
                    if (!$u['confirmed']) {
                        $r = ['send' => ['type' => 'reregister', 'user' => $u, 'token' => $token]];
                    } else $r =  ['send' => ['type' => 'registered', 'user' => $u, 'token' => $token]];
                } else {
                    $update = [];
                    if ($u['name'] != $json['name']) $update['name'] = $json['name'];
                    //if ($u['postcode'] != $json['postcode']) $update['postcode'] = $json['postcode'];
                    $token = $this->encrypt(json_encode(['id' => $u['id'], 'ts' => time(), 'update' => $update]));
                    $r = ['send' => ['type' => $u['confirmed'] ? 'update' : 'reregister', 'user' => $u, 'token' => $token, 'update' => $update]];
                }
            }
        }
        if (count($e) == 0 && !$r) {
            $uid = $this->db("insert into users (name,email,postcode) values(?,?,?)", ['sss', &$json['name'], &$json['email'], &$json['postcode']]);
            $token = $this->encrypt(json_encode(['id' => $uid, 'ts' => time()]));
            //$this->db("update users set token=? where id=?",['si',&$token,&$uid]);
            $user = ['id' => $uid, 'name' => $json['name'], 'email' => $json['email']];
            //$this->mail('register', $json, $token);
            $r = ['send' => ['type' => 'register', 'user' => $user, 'token' => $token]];
        }
        return (count($e) > 0) ? ['e' => 422, 'r' => $e] : $r;
    }
    public function req_confirm($json)
    {
        $e = null;
        if (isset($json['token']) && $json['token'] && $token = json_decode($this->decrypt($json['token']), true)) {
            $d = $this->db("select name,email,id from users where id=?", ['i', &$token['id']]);
            if ($d && $token['ts'] > time() - 48 * 3600) {
                $user = $d[0];
                $this->db("update users set confirmed=1 where id=?", ['i', &$token['id']]);
                $tok = $this->encrypt(json_encode(['id' => $user['id'], 'ts' => time()]));
                $r =  ['send' => ['type' => 'confirmed', 'user' => $user, 'token' => $tok]];
            } else $e = 'timeout';
        } else $e = 'invalid token';
        return $e ? ['error' => $e] : $r;
    }
    public function req_update($json)
    {
        $e = null;
        if (isset($json['token']) && $json['token'] && $token = json_decode($this->decrypt($json['token']), true)) {
            if ($token && $u = $this->db("select id,name,email,postcode,confirmed,unix_timestamp(uts) as uts from users where id=?", ['i', &$token['id']])) {
                $user = $u[0];
                if ($token['ts'] > time() - 48 * 3600 && $token['ts'] > $user['uts']) { // timeout or more recent update
                    if (isset($token['update']) && $token['update']) {
                        foreach ($token['update'] as $f => $v) $user[$f] = $v;
                        $this->db("update users set name=?,postcode=?,confirmed=1 where id=?", ['ssi', &$user['name'], &$user['postcode'], &$user['id']]);
                        $tok = $this->encrypt(json_encode(['id' => $user['id'], 'ts' => time()]));
                        $r =  $user['confirmed'] ? ['send' => ['type' => 'updated', 'user' => $user, 'token' => $tok]] : ['send' => ['type' => 'confirmed', 'user' => $u[0], 'token' => $token]];
                    } else $e = 'no updates';
                } else $e = 'timeout';
            } else $e = 'invalid id';
        } else $e = 'invalid token';
        return $e ? ['error' => $e] : $r;
    }
    public function req_message($json)
    {
        $m = null;
        if (isset($json['token']) && $json['token'] && $token = json_decode($this->decrypt($json['token']), true)) {
            if ($m = $this->db("select message from contact where id=?", ['s', &$token['mid']])) {
                $m = json_decode($m[0]['message'], true);
            }
        }
        return $m ? $m : ['error' => 'message not found'];
    }
    public function req_reply($json) // duplicate code with send - refactor
    {
        $e = $r = null;
        if (isset($json['token']) && $json['token'] && $token = json_decode($this->decrypt($json['token']), true)) {
            if (isset($token['id'])) {
                $message = json_encode(['reply' => true, 'id' => $this->user['id'], 'message' => $json['message']]);
                if ($u = $this->db("select name,email,id,confirmed from users where id=?", ['s', &$token['id']])) {
                    $this->user = $u[0];
                } else $e = 'invalid user';
            } else {
                $message = json_encode(['reply' => true, 'name' => $json['name'], 'email' => $json['email'], 'message' => $json['message']]);
            }
            $mid = $this->db("insert into contact (message) values(?)", ['s', &$message]);
            if ($this->user && $this->user['id']) $token = $this->encrypt(json_encode(['id' => $this->user['id'], 'mid' => $mid, 'ts' => time()]));
            else $token = $this->encrypt(json_encode(['mid' => $mid, 'ts' => time()]));
            $r =  ['send' => ['type' => 'reply', 'user' => $this->user, 'token' => $token, 'message' => $json['message']]];
        } else $e = 'invalid token';
        return $e ? ['error' => $e] : $r;
    }
    public function req_send($json)
    {
        $e = $r = null;
        if (isset($json['token']) && $json['token'] && $token = json_decode($this->decrypt($json['token']), true)) {
            if (isset($token['id'])) {
                $message = json_encode(['id' => $this->user['id'], 'message' => $json['message']]);
                if ($u = $this->db("select name,email,id,confirmed from users where id=?", ['s', &$token['id']])) {
                    $this->user = $u[0];
                } else $e = 'invalid user';
            } else {
                if ($json['email'] == '' && isset($token['mid'])) {
                    $m = $this->db("select message from contact where id=?", ['s', &$token['mid']]);
                    $m = json_decode($m[0]['message'], true);
                    $this->user = ['name' => $m['name'], 'email' => $m['email'], 'id' => 0];
                    $message = $message = json_encode(['name' => $this->user['name'], 'email' => $this->user['email'], 'message' => $json['message']]);
                } else $message = json_encode(['name' => $json['name'], 'email' => $json['email'], 'message' => $json['message']]);
            }
            $mid = $this->db("insert into contact (message) values(?)", ['s', &$message]);
            if ($this->user && $this->user['id']) $token = $this->encrypt(json_encode(['id' => $this->user['id'], 'mid' => $mid, 'ts' => time()]));
            else $token = $this->encrypt(json_encode(['mid' => $mid, 'ts' => time()]));
            $r =  ['send' => ['type' => 'contact', 'user' => $this->user, 'token' => $token, 'message' => $json['message']]];
        } else $e = 'invalid token';
        return $e ? ['error' => $e] : $r;
    }
    public function req_contact($json)
    {
        if ($u = $this->db("select name,email,id,confirmed from users where email=?", ['s', &$json['email']])) {
            $user = $u[0];
        } else $user = null;
        $message = json_encode(['name' => $json['name'], 'email' => $json['email'], 'message' => $json['message']]);
        $mid = $this->db("insert into contact (message) values(?)", ['s', &$message]);
        $token = $user ? $this->encrypt(json_encode(['id' => $user['id'], 'mid' => $mid, 'ts' => time()])) : $this->encrypt(json_encode(['mid' => $mid, 'ts' => time()]));
        return ['send' => ['type' => 'send', 'user' => $user, 'from' => ['name' => $json['name'], 'email' => $json['email']], 'token' => $token, 'message' => $json['message']]];
    }
    public function req_unsubscribe($json)
    {
        $r = null;
        if (isset($json['token']) && $json['token'] && $token = json_decode($this->decrypt($json['token']), true)) {
            if ($u = $this->db("select name,email,id,confirmed from users where id=?", ['s', &$token['id']])) {
                $this->user = $u[0];
                $this->db("delete from users where id=?", ['s', &$token['id']]);
                $this->user['id'] = 0;
                $r = ['send' => ['type' => 'unsubscribe', 'token' => '', 'user' => $u[0]]];
            }
        }
        return $r ? $r : ['error' => 'unsubscribe'];
    }
    private function db_in_values(&$list, $key = null, $type)
    {
        if (!count($list)) $ret = '';
        else {
            $ret = ['?s' => '', 'is' => '', 'vs' => []];
            foreach ($list as $k => $d) {
                if ($ret['?s']) $ret['?s'] .= ',?';
                else $ret['?s'] = '?';
                $ret['is'] .= $type;
                if ($key) $ret['vs'][] = &$list[$k][$key];
                else $ret['vs'][] = &$list[$k];
            }
            array_unshift($ret['vs'], $ret['is']);
        }
        $this->debug(['in' => $ret], false, 500);
        return $ret;
    }
    private function validate($req, $spec)
    {
        foreach ($spec as $key => $type) {
            if (!$req[$key]) $error[$key] = $type;
        }
        return isset($error) ? ['e' => '422', 'r' => $error] : null;
    }
    private function init()
    {
        error_reporting(E_ALL); // Reports all errors
        ini_set('display_errors', 'Off'); // Do not display errors for the end-users (security issue)
        ini_set('error_log', __DIR__ . '/../storage/error.log'); // Set a logging file
        $this->start = microtime(true);
        $this->config = config();
        $this->con = null;
        $this->mailer = null;
        $this->user = null;
        $this->origin = isset($_SERVER['HTTP_FV_ORIGIN']) ? $_SERVER['HTTP_FV_ORIGIN'] : null;
    }
    private function response($resp)
    {
        header('Content-type: application/json');
        if (isset($resp['e'])) {
            http_response_code($resp['e']);
            echo json_encode($resp['r']);
        } else echo json_encode($resp);
    }
    private function debug($message, $req = false, $max = 250)
    {
        if (isset($message['password'])) $message['password'] = '...';
        if (is_array($message)) foreach ($message as $k => $v) {
            if (isset($message[$k]['password'])) $message[$k]['password'] = '...';
            if (isset($message[$k]['token']) && $message[$k]['token']) $message[$k]['token'] = '...';
        }
        $json = json_encode($message);
        if (strlen($json) > $max) {
            $short = [];
            foreach ($message as $key => $val) {
                $len = strlen(json_encode($val));
                if ($len > $max) $short[$key] = "...($len)";
                else $short[$key] = $val;
            }
            $json = json_encode($short);
        }
        error_log(($req ? '' : number_format(round(microtime(true) - $this->start, 4), 4) . ',') . $json . ',' . $this->start);
    }
    private function mail($mail)
    {
    }
    private function db($query, $vals = [], $close = false)
    {
        $ret = null;
        if (in_array('db', $this->config['debug'])) $this->debug(['query' => $query, 'vals' => $vals, 'close' => $close], false, 500);
        if (!$this->con && $query != 'close') {
            if ($this->con = new mysqli('localhost', $this->config['db']['user'], $this->config['db']['password'], $this->config['db']['db'])) {
                mysqli_set_charset($this->con, "utf8");
            }
        }
        if ($query == 'close') $close = true;
        else if ($this->con && $query && count($vals) > 0) {
            $stmt = $this->con->prepare($query);
            if (count($vals) > 0) call_user_func_array(array($stmt, 'bind_param'), $vals);
            $stmt->execute();
            if (substr($query, 0, 6) === 'insert') $ret = mysqli_insert_id($this->con);
            else if (substr($query, 0, 6) === 'update' || substr($query, 0, 6) === 'delete') $ret = mysqli_affected_rows($this->con);
            else $ret = mysqli_fetch_all($stmt->get_result(), MYSQLI_ASSOC);
            $stmt->close();
        } else if ($this->con && $query) {
            $res = $this->con->query($query);
            if (substr($query, 0, 8) === 'truncate') $ret = mysqli_affected_rows($this->con);
            else {
                $ret = mysqli_fetch_all($res, MYSQLI_ASSOC);
                mysqli_free_result($res);
            }
        }
        if ($this->con && $close) {
            mysqli_close($this->con);
            $this->con = null;
        }
        if (in_array('db', $this->config['debug'])) $this->debug(['query' => $query, 'vals' => $vals, 'result' => $ret], false, 500);
        return $ret;
    }
    private function unzip($zip)
    {
        return json_decode(gzuncompress(base64_decode($zip)), true);
    }
    private function zip($json)
    {
        return base64_encode(gzcompress(json_encode($json)));
    }
    private function decrypt($payload, $unserialize = true)
    {
        $payload = json_decode(base64_decode($payload), true);
        $iv = base64_decode($payload['iv']);
        $decrypted = openssl_decrypt($payload['value'], 'AES-256-CBC', $this->config['key'], 0, $iv);
        return $unserialize ? unserialize($decrypted) : $decrypted;
    }
    public function encrypt($value, $serialize = true)
    {
        $iv = random_bytes(openssl_cipher_iv_length('AES-256-CBC'));
        $value = openssl_encrypt($serialize ? serialize($value) : $value, 'AES-256-CBC', $this->config['key'], 0, $iv);
        $iv = base64_encode($iv);
        $mac = hash_hmac('sha256', $iv . $value, $this->config['key']);
        $json = json_encode(compact('iv', 'value', 'mac'));
        //$this->debug(['encrypt'=>$json?true:false,'iv'=>$iv?true:false,'value'=>$value?true:false,'mac'=>$mac?true:false]);
        return base64_encode($json);
    }
}
