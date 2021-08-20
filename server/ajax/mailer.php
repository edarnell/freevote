<?php
require_once '../vendor/autoload.php';
class Mailer
{
  function send($m)
  {
    //$type,$json,$token,$user
    $url = (isset($_SERVER['HTTP_FV_ORIGIN']) ? $_SERVER['HTTP_FV_ORIGIN'] : 'https://freevote.uk');
    $user = $m['user'];
    $token = $m['token'];
    switch ($m['type']) {
      case 'send':
        $to = $m['from'];
        $message = "Thank you for your message. Please confirm that you sent this message and that it is not spam by using the send button below.";
        $title = "Confirm Send";
        $button = ['title' => 'Send', 'url' => $url . "?mail=V{$token}", 'text' => "to send your message"];
        break;
      case 'contact':
        $to = null;
        $from = $m['from'];
        $message = $m['message'];
        $title = "Message from " . $from['name'];
        $button = ['title' => 'Reply', 'url' => $url . "?mail=M{$token}", 'text' => "to view online and reply"];
        break;
      case 'reply':
        $to = $m['from'];
        $message = $m['message'];
        $title = "Reply from Ed Darnell";
        break;
      case 'register':
      case 'reregister':
        $to = $user;
        $message = "Please confirm that this registration request came from you using the button below.";
        $title = "Confirm Registration";
        $button = ['title' => $title, 'url' => $url . "?mail=R{$token}", 'text' => "link will expire in 48 hours"];
        break;
      case 'registered':
      case 'confirmed':
        $to = $user;
        $message = ($user['confirmed'] ? "You have registered in the past so there is no need to re-register. " : "Thank you for registering. ")
          . "\n\nWe will keep you informed on progress. Every vote is one step closer to a fair and sustainable future."
          . "\n\nPlease let others know who may be interested.";
        $user['confirmed'] = true;
        $title = "Welcome";
        break;
      case 'update':
        $to = $user;
        $u = $m['update'];
        $message = "Please confirm your updated details.\n";
        if (isset($u['name'])) $message .= "\nName: {$u['name']}";
        if (isset($u['email'])) $message .= "\nEmail: {$u['email']}";
        $title = "Confirm Changes";
        $button = ['title' => $title, 'url' => $url . "?mail=U{$token}", 'text' => "link will expire in 48 hours"];
        break;
      case 'updated':
        $to = $user;
        $message = "Name: {$user['name']}";
        $message .= "\nEmail: {$user['email']}";
        $title = "Details Updated";
        $button = ['title' => 'Contact Us', 'url' => $url . "?mail=C{$token}", 'text' => ""];
        break;
      case 'unsubscribe':
        $to = $user;
        $user = null;
        $message = "Your account has now been unsubscribed and your details removed from our database."
          . PHP_EOL . "If you made the request in error or change your mind please re-register.";
        $title = "Account Deleted";
        break;
    }
    $greet = $to ? "Dear {$to['name']}," : '';
    $but = isset($button) ? $html = str_replace(['$button.title', '$button.url', '$button.text'], [$button['title'], $button['url'], $button['text']], $this->button) : '<table width="100%"></table>';
    $unsub = $user ? str_replace(['$url', '$token'], [$url, $token], $this->unsub) : '';
    $confirm = $user && !$user['confirmed'] ? str_replace(['$url', '$token'], [$url, $token], $this->confirm) : '';
    $html = str_replace(['$url', '$token', '$greet', '$title', '$message', '$button', '$confirm', '$unsub'], [$url, $token, $greet, $title, nl2br(htmlentities($message)), $but, $confirm, $unsub], $this->template);
    $text = '*** ' . $title . " ***" . PHP_EOL . $greet . PHP_EOL . $message . PHP_EOL
      . (isset($button) ? $button['title'] . ' (' . $button['text'] . '): ' . $button['url'] . PHP_EOL : '');
    // Create a message
    $email = (new Swift_Message($title))
      ->setFrom(['ed.darnell@freevote.uk' => 'FreeVote.uk'])
      ->setTo($to ? [$to['email'] => $to['name']] : ['ed.darnell@freevote.uk' => 'FreeVote.uk'])
      ->setBody($html, 'text/html')
      ->addPart($text, 'text/plain');
    if (isset($from)) $email->setReplyTo([$from['email'] => $from['name']]);
    $result = $this->mailer->send($email);
  }
  function __construct()
  {
    // Create the Transport
    if ($GLOBALS['ajax']->config['mail']['server'] == 'localhost') $this->transport = new Swift_SendmailTransport('/usr/sbin/sendmail -bs');
    else {
      $this->transport = (new Swift_SmtpTransport($GLOBALS['ajax']->config['mail']['server'], $GLOBALS['ajax']->config['mail']['port'], 'ssl'))
        ->setUsername($GLOBALS['ajax']->config['mail']['user'])
        ->setPassword($GLOBALS['ajax']->config['mail']['password']);
    }
    // Create the Mailer using your created Transport
    $this->mailer = new Swift_Mailer($this->transport);
    $this->unsub = '<div style="font-size:14px;">You may <a href="$url?mail=C$token">contact</a> us or <a href="$url?mail=X$token">unsubscribe</a> at any time.</div>';
    $this->confirm = '<div style="font-size:14px;">Note: you are part registered, please <a href="$url?mail=R$token">confirm</a> or <a href="$url?mail=X$token">unsubscribe</a></div>';
    $this->button = '<table width="100%" cellpadding="0" cellspacing="0" class="button-wrapper large method-padding-border">
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
</div>';
    $this->template =
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
<table class="full" id="inner_table" width="100%" cellpadding="0" cellspacing="0" >
<tr>
<td height="60" valign="middle" align="center" bgcolor="#ffffff" style="background-color:#ffffff;font-size:30px;font-family:Georgia,serif; border-top:1px solid #e6dee4; border-right:1px solid #e6dee4; border-left:1px solid #e6dee4;">
<a href="$url" style="color:#3097D1;text-decoration:none;">FreeVote.uk</a>
</td>
</tr>
<tr>
<td valign="top" align="center" bgcolor="#ffffff" style="background-color:#ffffff; border-right:1px solid #e6dee4; border-left:1px solid #e6dee4;">
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
$button
$confirm
</center>
</td>
</tr>
</table>
<hr style="height:1px;margin:0 auto;padding:0;background:#3097D1;border:0;width:90%;" />
</td>
</tr>
<tr>
<td valign="top" align="center" bgcolor="#ffffff" style="background-color:#ffffff; border-right:1px solid #e6dee4; border-left:1px solid #e6dee4; border-bottom:1px solid #e6dee4;">
<br/>
<div style="font-size:14px;color:#999;line-height:20px;font-family:Arial,sans-serif;">
<a href="$url">FreeVote.uk</a> does not use cookies or track users.
<div style="font-size:14px;">Beware of scams, all links should start with https://freevote.uk/</div>
$unsub
</div>
<br/>
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
