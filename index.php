<?php
/*
 * 生成链接二维码 by haibao
 * */
include "./phpqrcode.php";

$content = $_GET["d"]; 
$errorLevel = isset($_GET["e"]) ? $_GET["e"] : 'L'; 
$PointSize  = $_GET["p"]; 
$margin = $_GET["m"];
preg_match('/http:\/\/([\w\W]*?)\//si', $content, $matches);

if(isset($_GET['t'])){ 	
	 QRcode::png($content, false, $errorLevel, $PointSize, $margin);
}
?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
	<meta name="Keywords" content="在线生成二维码"/>
	<title>在线二维码API接口| 何海宝的博客</title>
	<style>
		html,body{margin:0;padding:0;font-size:14px;font-family:"microsoft yahei",arial;background-color:#F2F2F2;}
		ul{margin:0;padding:0;}
		li{list-style:none;}
		input{border:0 none;}
		input:focus{outline:none;}
		pre{font-size:14px;line-height:20px;}
		.tc{text-align:center;}
		.title{letter-spacing:3px;text-shadow:0 0 2px #999;margin:5% auto 20px;}
		#qrcode li{padding:10px 0;}
		.ipt{padding:8px 10px;width:280px;font-size:14px;border:1px solid #ccc;}
		.ipt:focus{border:1px solid #0074A2;}
		#submit{width:300px;padding:10px 0;background-color:#0074A2;color:#fff;font-size:16px;border-radius:4px;cursor:pointer;letter-spacing:2px;}
		#toast{width:300px;position:fixed;top:2%;right:1%;z-index:999999;background-color:rgba(0,0,0,.7);border-radius:5px;color:#fff;padding:10px 0;text-align:center;-webkit-animation: zoomOut .4s ease both;animation: zoomOut .4s ease both;}
		@-webkit-keyframes zoomOut { 0% { opacity: 0; -webkit-transform: scale(.6); } 100% { opacity: 1; -webkit-transform: scale(1); } }
		@keyframes zoomOut { 0% { opacity: 0; transform: scale(.6); } 100% { opacity: 1; transform: scale(1); } }
	</style>
</head>
<body>
<h1 class="title tc">在线生成二维码</h1>
<!--<pre>
	参数说明：
	
	d: 二维码对应的网址
	p: 二维码尺寸，可选范围1-10(具体大小和容错级别有关)（缺省值：3）
	m: 二维码白色边框尺寸,缺省值: 0px
	e: 容错级别(errorLevel)，可选参数如下(缺省值 L)：
	 - L水平    7%的字码可被修正
	 - M水平    15%的字码可被修正
	 - Q水平    25%的字码可被修正
	 - H水平    30%的字码可被修正
</pre>-->

<!--参数表单--->
<ul id="qrcode" class="tc">
	<li><input type="text" value="" placeholder="请输入二维码内容，文本／链接(必填)" class="ipt" id="content" required /></li>
	<li><input type="text" value="" placeholder="请输入二维码尺寸，1-10之间(选填)" class="ipt" id="size" /></li>
	<li><input type="text" value="" placeholder="请输入二维码白色边框尺寸，整数即可(选填)" class="ipt" id="border_size" /></li>
	<li><img src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==" id="qrcodes"/></li>
	<li><input type="button" value="生成二维码" id="submit"/></li>
</ul>

<!--js-->
<script>
	// 默认二维码图片
	var defaultQr = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';
	// 显示提示框
	var toast_timer = 0;
	function showToast(message, t) {
	    var alert = document.getElementById("toast");
	    if(alert == null){
	        alert =  document.createElement("div");
	        alert.id = 'toast';
	        alert.innerText = message;
	    } else {
	        alert.style.opacity = .9;
	    }
	    document.body.appendChild(alert);
	    t = t ? t : 1000;
	    toast_timer = setTimeout(function() {
	    	// 隐藏提示框
	    	if(alert) {
	    		document.body.removeChild(alert); 
	    		clearTimeout(toast_timer);
	    	}
	    }, t);
	}
	
	// 提示并重置二维码内容输入框
	function reset() {
		showToast('请输入二维码内容～', 1500);
		sessionStorage.removeItem('qrcode');
		sessionStorage.removeItem('qrcontent');
		document.getElementById('qrcodes').src = defaultQr;
	}
	
	window.onload = function() {
		var $content = document.getElementById('content'),
			$size = document.getElementById('size'),
			$border_size = document.getElementById('border_size'),
			$qrcodes = document.getElementById('qrcodes'),
		    $btn = document.getElementById('submit');

		// 生成二维码按钮 点击事件
		$btn.onclick = function() {
			var con = $content.value, 
				size = $size.value || 8, 
				border_size = $border_size.value || 2,
				qrcode = window.location.protocol+'//'+window.location.host+'/qr/index.php?m='+border_size+'&e=L&p='+size+'&d='+con+'&t='+new Date();

			if(con == '') {
				reset();
			} else {
				// 缓存二维码内容和图片
				sessionStorage.setItem('qrcode', qrcode);
				sessionStorage.setItem('qrcontent', con);
				$qrcodes.src = qrcode;
			}
		}

		// 如果有缓存(二维码内容和图片)，则读取缓存的值（目的：为了刷新页面也会存在）
		if(sessionStorage.getItem('qrcode') != null) {
			$qrcodes.src = sessionStorage.getItem('qrcode');
		}
		if(sessionStorage.getItem('qrcontent') != null) {
			$content.value = sessionStorage.getItem('qrcontent');	
		}
	}
</script>
</body>
</html>