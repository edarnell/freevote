<?php
require_once '../vendor/autoload.php';
class Mailer {
  function send($type,$json,$token,$user,$logid) {
    $url=(isset($_SERVER['HTTP_FV_ORIGIN'])?$_SERVER['HTTP_FV_ORIGIN']:'https://freevote.uk');
    switch ($type) {
      case 'contact':
      $to=isset($json['to'])?$json['to']:null;
      $from=isset($json['from'])?$json['from']:$user;
      $message=$json['message'];
      $title="Message from ".$from['name'];
      $url.="?mail=M{$logid}_{$token}";
      $button=['title'=>'Reply', 'url'=>$url, 'text'=>"to view online and reply"];
      break;
      case 'register':
      $to=$user;
      $message="Thank you for registering. Please confirm using the button below.";
      $title="Confirm Registration";
      $name="Dear ".$user['name'].',';
      $url.="?mail=R{$user['id']}_{$token}";
      $button=['title'=>$title, 'url'=>$url, 'text'=>"link will expire in 48 hours"];
      break;
      case 'confirmed':
      $to=$user;
      $message="Welcome to the start of true democracy."
      ."\n\nWhat happens next?"
      ."\n\nPlease let others who may be interested know. An initial target is 1 million registrations."
      ." Freevote.uk will not stand for election until there is a clear demand for true democracy. We will keep you informed on progress.";
      $title="Welcome";
      $name="Dear ".$user['name'].',';
      $url.="?mail=C{$user['id']}_{$token}";
      $button=['title'=>'Contact Us', 'url'=>$url, 'text'=>""];
      break;
      case 'update':
      $to=$user;
      $message="Please confirm your updated details.\n";
      if ($user['name']!=$json['name']) $message.="\nName: {$json['name']}";
      if ($user['postcode']!=$json['postcode']) $message.="\nPost Code: {$json['postcode']}";
      $title="Confirm Changes";
      $name="Dear ".$user['name'].',';
      $url.="?mail=R{$user['id']}_{$token}";
      $button=['title'=>$title, 'url'=>$url, 'text'=>"link will expire in 48 hours"];
      break;
      case 'unsubscribe':
      $to=$user;
      $message="Your account has now been unsubscribed and your details removed from our database."
      .PHP_EOL."If you did not request this, or made the request in error please contact us or reply to this email.";
      $title="Account Deleted";
      $name="Dear ".$user['name'].',';
      $url.="?mail=X{$user['id']}_{$token}";
      $button=['title'=>"Contact Us", 'url'=>$url, 'text'=>"contact FreeVote.uk"];
      break;
    }
    
    $greet=$to?"Dear {$to['name']},":'';
    $html=str_replace(['$greet','$title','$message','$button.title','$button.url','$button.text'],[$greet,$title,nl2br(htmlentities($message)),$button['title'],$button['url'],$button['text']],$this->template);
    $text='*** '.$title." ***".PHP_EOL.$greet.PHP_EOL.$message.PHP_EOL.$button['title'].' ('.$button['text'].'): '.$button['url'].PHP_EOL;
    // Create a message
    $email=(new Swift_Message($title))
      ->setFrom(['ed.darnell@freevote.uk'=>'FreeVote.uk'])
      ->setTo($to?[$to['email']=>$to['name']]:['ed.darnell@freevote.uk'=>'FreeVote.uk'])
      ->setBody($html,'text/html')
      ->addPart($text,'text/plain');
    if (isset($from)) $email->setReplyTo([$from['email']=>$from['name']]);
    // Send the message
    if (strncmp($message,'_test',5)==0 || strncmp($message,"'_test",6)==0) {
      $test=strpos($message,' ')>0?substr($message,0,strpos($message,' ')):$message;
      file_put_contents("../storage/emails/{$test}",json_encode(['to'=>$to,'from'=>isset($from)?$from:null,'token'=>$token,'greet'=>$greet,'title'=>$title,'button'=>$button,'message'=>$message]));
    }
    else if (strncmp($to['email'],'epdarnell+',strlen('epdarnell+'))==0){
      file_put_contents("../storage/emails/{$type}_{$to['email']}",json_encode(['to'=>$to,'from'=>isset($from)?$from:null,'token'=>$token,'greet'=>$greet,'title'=>$title,'button'=>$button,'message'=>$message]));
    }
    $result=$this->mailer->send($email);
  }
  function __construct() {
      // Create the Transport
      $this->transport=(new Swift_SmtpTransport($GLOBALS['ajax']->config['mail']['server'],$GLOBALS['ajax']->config['mail']['port'],'ssl'))
        ->setUsername($GLOBALS['ajax']->config['mail']['user'])
        ->setPassword($GLOBALS['ajax']->config['mail']['password']);
      // Create the Mailer using your created Transport
      $this->mailer=new Swift_Mailer($this->transport);
    $this->template=
'<html>
<head>
<meta http-equiv="Content-Type" content="text/html; " />
<meta http-equiv="Content-Language" content="en-GB" />
<meta name="language" content="en-GB" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="HandheldFriendly" content="true" />
<title>$title</title>
</head>
<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0" bgcolor="#fbfbfb" id="ft_email">
<table id="outer_tabler" width="100%" cellpadding="5" cellspacing="0" bgcolor="#fbfbfb">
<tr>
<td valign="top" align="center">
<table class="full" id="inner_table" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td height="60" valign="middle" align="center" bgcolor="#ffffff" style="background-color:#ffffff;border-top:1px solid #e6dee4;border-right:1px solid #e6dee4;border-left:1px solid #e6dee4;font-size:30px;font-family:Georgia,serif;">
<a href="" style="color:#3097D1;text-decoration:none;">FreeVote.uk</a>
</td>
</tr>
<tr>
<td valign="top" align="center" bgcolor="#ffffff" style="background-color:#ffffff;border-left:1px solid #e6dee4;border-right:1px solid #e6dee4;">
<hr style="height:1px;margin:0 auto;background:#3097D1;padding:0;border:0;width:90%;" />
<table class="full" id="content" width="90%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
<tr>
<td bgcolor="#ffffff" valign="top" width="100%" style="font-size:16px;color:#000000;line-height:150%;font-family:Arial,sans-serif;text-align:justify;">
<h3 name="greet">$greet</h3>
<center><h3 name="title">$title</h3>
<div style="background:#f5f8fa;padding-top:10px; padding-right: 15px; padding-bottom:10px; padding-left: 15px; margin-bottom: 15px;">
<div name="message" style="margin:0; padding:0; text-align:left;">
$message
</div></div>
<table width="100%" cellpadding="0" cellspacing="0" class="button-wrapper large method-padding-border">
<tr>
<td align="center" width="100%">
<table width="auto" cellpadding="0" cellspacing="0">
<tr>
<td align="center" width="auto" bgcolor="#3097D1" style="background: #3097D1; -webkit-border-radius: 6px; -moz-border-radius: 6px; border-radius: 6px; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 18px; font-family: Helvetica, Arial, sans-serif; display: block;" class="button_td">
<a name="button" href="$button.url" title="$button.title" style="color: #ffffff; text-decoration: none; padding-top: 10px; padding-right: 25px; padding-bottom: 10px; padding-left: 25px; -webkit-border-radius: 6px; -moz-border-radius: 6px; border-radius: 6px; border: 1px solid #3097D1; display: inline-block;" class="button">
$button.title</a></td>
</tr>
</table>
</tr>
</table>
<div class="padded">
<p style="margin: 0; padding: 0; line-height:1.6em; color:#999;"><small><em name="button_text">$button.text</em></small></p><br />
</div>
</center>
</td>
</tr>
</table>
<hr style="height:1px;margin:0 auto;padding:0;background:#3097D1;border:0;width:90%;" />
</td>
</tr>
<tr>
<td height="60" valign="middle" align="center" bgcolor="#ffffff" style="background-color:#ffffff;border-left:1px solid #e6dee4;border-right:1px solid #e6dee4;border-bottom:1px solid #e6dee4;padding:5px 0;">
<div style="font-size:14px;color:#999;line-height:20px;font-family:Arial,sans-serif;">
Copyright &copy; 2019 FreeVote.uk All rights reserved.
</div>
<div style="font-size:14px;"><a href="us">unsubscribe</a></div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>';
  }
}
?>