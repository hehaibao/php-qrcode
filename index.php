<?php
/*
 * 生成链接二维码 by haibao
 * */
include "./phpqrcode.php";

/*
	参数说明：
	
	d: 二维码对应的网址
	p: 二维码尺寸，可选范围1-10(具体大小和容错级别有关)（缺省值：3）
	m: 二维码白色边框尺寸,缺省值: 0px
	e: 容错级别(errorLevel)，可选参数如下(缺省值 L)：
	 - L水平    7%的字码可被修正
	 - M水平    15%的字码可被修正
	 - Q水平    25%的字码可被修正
	 - H水平    30%的字码可被修正
*/
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
	<!-- css -->
	<style>
		html,body{margin:0;padding:0;font-size:14px;font-family:"microsoft yahei",arial;background-color:#F2F2F2;}
		ul{margin:0;padding:0;}
		li{list-style:none;}
		input{border:0 none;}
		input:focus{outline:none;}
		pre{font-size:14px;line-height:20px;}
		.tc{text-align:center;}
		.dn{display: none;}
		.title{letter-spacing:3px;text-shadow:0 0 2px #999;margin:5% auto 20px;}
		#qrcode{width: 300px;margin: 0 auto;}
		#qrcode li{padding:10px 0;}
		#qrcode li > span{display: block;text-align: left;margin-bottom: 3px;}
		#qrcodes{margin: 0 auto;background-color: #fff;}
		.ipt{padding:8px 10px;width:280px;font-size:14px;border:1px solid #ccc;border-radius: 4px;}
		.ipt:focus{border:1px solid #0074A2;}
		.ipt[readonly]{cursor: not-allowed;}
		#submit{width:300px;padding:10px 0;background-color:#0074A2;color:#fff;font-size:16px;border-radius:4px;cursor:pointer;letter-spacing:2px;}
		#toast{width:300px;position:fixed;top:2%;left:50%;margin-left: -150px;z-index:999999;background-color:rgba(0,0,0,.7);border-radius:5px;color:#fff;padding:10px 0;text-align:center;-webkit-animation: zoomOut .4s ease both;animation: zoomOut .4s ease both;}
		@-webkit-keyframes zoomOut { 0% { opacity: 0; -webkit-transform: scale(.6); } 100% { opacity: 1; -webkit-transform: scale(1); } }
		@keyframes zoomOut { 0% { opacity: 0; transform: scale(.6); } 100% { opacity: 1; transform: scale(1); } }
	</style>
</head>
<body>

<h1 class="title tc">在线生成二维码</h1>

<!--参数表单-->
<ul id="qrcode" class="tc">
	<li>
		<span>二维码内容 <font color="red">*</font></span>
		<input type="text" value="" placeholder="请输入二维码内容，文本／链接" class="ipt" id="content" required />
	</li>
	<li>
		<span>白边框尺寸</span>
		<input type="text" value="2" placeholder="二维码白色边框尺寸，1-9整数即可(选填)" onKeyUp="value=value.replace(/[^\d]/g,'')" maxlength="1" class="ipt" id="border_size" />
	</li>
	<li>
		<span>二维码颜色</span>
		<input type="text" placeholder="选择二维码颜色(选填)" class="ipt jscolor {closable:true,closeText:'关闭',onFineChange:'updateColor(this)'}" maxlength="6" readonly disabled value="000000" id="color">
	</li>
	<li>
		<span>自定义版权</span>
		<input type="text" value="" placeholder="输入文字，最多8个字符(选填)" maxlength="8" class="ipt" id="copyright" />
	</li>
	<li>
		<canvas id="qrcodes" class="dn" width="300" height="300">您的浏览器不支持canvas标签。</canvas>
	</li>
	<li>
		<input type="button" value="生成二维码" id="submit"/>
	</li>
	<li>
		<a href="javascript:;" class="dn" id="download" onclick="qr.download('#qrcodes')">下载二维码</a>
	</li>
</ul>

<!--js-->
<script src="jscolor.js"></script>
<script>
	var getID = function(el) {
		return document.getElementById(el);
	};

	var $qrcodes = getID('qrcodes'), //canvas DOM
		$download = getID('download'), //download DOM
		$color = getID('color'),
		defaultQr = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==', // 默认二维码图片
		toast_timer = 0,
		qr = {};

	//获取选中的颜色，得到rgb值
	function updateColor(picker) {
		qr.color = Math.round(picker.rgb[0])+','+Math.round(picker.rgb[1])+','+Math.round(picker.rgb[2]);
		// $color.jscolor.hide(); //关闭取色器
	}

	/*
	*  JS操作缓存
	*  by haibao [http://www.hehaibao.com/] 
	*  更多使用方法请看：[https://github.com/hehaibao/cacheJS]
	**/
	var cacheJS = {
		errorTxt: '您的Web浏览器不支持本地存储设置。在Safari中，最常见的原因是使用“无痕浏览模式”。有些设置可能无法保存，某些功能可能无法正常工作。',	
		/**
		 * 存储storage单个属性
		 * @param key 名称
		 * @param val 值
		 * @param type [object] 类型[可选值sessionStorage/localStorage]，不填则默认sessionStorage
		 * **/
		setStorage: function (key, val, type) {
			type = type ? type : window.sessionStorage;
			if(this.checkSupport()) {
				type[key] = escape(val); 
			} else {
				alert(this.errorTxt);
			}
		},
		/**
		 * 读取storage单个属性
		 * @param key 名称
		 * @param type [object] 类型[可选值sessionStorage/localStorage]，不填则默认sessionStorage
		 * **/
		getStorage: function (key, type) {
			type = type ? type : window.sessionStorage;
			if(this.checkSupport()) {
				return unescape(type[key]);
			} else {
				alert(this.errorTxt);
			}
		},
		/**
		 * 删除storage对象
		 * @param key 名称
		 * @param type [object] 类型[可选值sessionStorage/localStorage]，不填则默认sessionStorage
		 * **/
		delStorage: function (key, type) {
			type = type ? type : window.sessionStorage;
			if(this.checkSupport()) {
				type[key] = '';
				delete type[key];
			} else {
				alert(this.errorTxt);
			}
		},
		/**
		 * 检测是否支持localStorage或sessionStorage
		 */
		checkSupport: function () {
			var testKey = 'test', storage = window.sessionStorage;
			try {
				storage.setItem(testKey, '1');
				storage.removeItem(testKey);
				return true;
			} 
			catch (error) {
				return false;
			}
		}
	};

	qr.init = function() {
		var $this = this,
			$content = getID('content'),
			$border_size = getID('border_size'),
			$copyright = getID('copyright'),
			$btn = getID('submit');

		// 生成二维码按钮 点击事件
		$btn.onclick = function() {
			$this.reset(); //每次点击都先重置
			var protocol = 'http://',
				protocol_https = 'https://',
				con = $content.value, //用户填写的内容
				str = con.substr(0,7).toLowerCase(),
				str_https = con.substr(0,8).toLowerCase(),
				con = (str == protocol || str_https == protocol_https) ? con : (str_https == protocol_https ? protocol_https : protocol) + con, //用户如果忘记填写协议，自动加上
				size = 5, //二维码尺寸
				border_size = $border_size && $border_size.value || 2, //边框尺寸
				copyright = $copyright && $copyright.value || '', //自定义版权文字
				color = $color && $color.value || '000000', //自定义二维码颜色
				qrcode = $this.getUrlPath() +'index.php?m='+border_size+'&e=L&p='+size+'&d='+encodeURIComponent(con)+'&t='+new Date();

			if(con == '' || con == protocol || con == protocol_https) {
				//如果内容为空，则重置
				$this.showToast('请输入二维码内容～');
				//输入框焦点改变
				$content.focus();
				return;
			} 
			// 缓存二维码内容,图片,文字,边框
			cacheJS.setStorage('qrcode', qrcode);
			cacheJS.setStorage('qrcontent', con);
			cacheJS.setStorage('qrcopyright', copyright);
			cacheJS.setStorage('qrcolor', color);
			cacheJS.setStorage('qrcolorrgb', qr.color);
			cacheJS.setStorage('qrbordersize', border_size);
			$this.draw(qrcode, copyright);
		}

		// 如果有缓存(二维码内容和图片)，则读取缓存的值（目的：为了刷新页面也会存在）
		if(cacheJS.getStorage('qrcopyright') !== 'undefined') {
			$copyright.value = cacheJS.getStorage('qrcopyright');	
		}
		if(cacheJS.getStorage('qrcolor') !== 'undefined') {
			$color.value = cacheJS.getStorage('qrcolor');
			$color.style.backgroundColor = '#' + $color.value;
		}
		if(cacheJS.getStorage('qrcolorrgb') !== 'undefined') {
			qr.color = cacheJS.getStorage('qrcolorrgb');	
		}
		if(cacheJS.getStorage('qrcode') !== 'undefined') {
			$this.draw(cacheJS.getStorage('qrcode'), $copyright.value);
		}
		if(cacheJS.getStorage('qrcontent') !== 'undefined') {
			$content.value = cacheJS.getStorage('qrcontent');	
		}
		if(cacheJS.getStorage('qrbordersize') !== 'undefined') {
			$border_size.value = cacheJS.getStorage('qrbordersize');	
		}
		
	}

	qr.showToast = function(msg, t) {
		// 显示提示框
		var alert = getID("toast");
	    if(alert === null){
	        alert =  document.createElement("div");
	        alert.id = 'toast';
	        alert.innerText = msg;
	    } else {
	        alert.style.opacity = .9;
	    }
	    document.body.appendChild(alert);
	    t = t ? t : 1500;
	    toast_timer = setTimeout(function() {
	    	// 隐藏提示框
	    	if(alert) {
	    		document.body.removeChild(alert); 
	    		clearTimeout(toast_timer);
	    	}
	    }, t);
	}

	qr.reset = function() {
		// 重置二维码内容输入框
		$qrcodes.style.display = 'none';
		$download.style.display = 'none';
		cacheJS.delStorage('qrcode');
		cacheJS.delStorage('qrcontent');
		cacheJS.delStorage('qrcopyright');
		cacheJS.delStorage('qrbordersize');
		cacheJS.delStorage('qrcolor');
		cacheJS.delStorage('qrcolorrgb');
	}

	qr.draw = function(imgSrc, copyright) {
		// canvas绘制二维码
		if($qrcodes.getContext) {
			var ctx = $qrcodes.getContext('2d'),
				img = new Image(),
				qrWidth = $qrcodes.width,
				qrHeight = $qrcodes.height;
			ctx.clearRect(0,0,qrWidth,qrHeight); //清空画布

	        img.onload = function() {
				ctx.drawImage(img, 0, 0, qrWidth, qrHeight);

				//设置颜色
				qr.color = qr.color == '0,0,0' || qr.color == '255,255,255' ? '0,0,0' : qr.color;
				var imageData = ctx.getImageData(0, 0, qrWidth, qrHeight);
				var pxData = imageData.data;  //获取每一个像素
				var qrcolor = qr.color.split(','); //选择的颜色 rgb
				for(var i = 0, len = pxData.length; i < len; i += 4) { 
					//改成对应的rgb颜色
					pxData[i] = pxData[i] + qrcolor[0]; 
					pxData[i+1] = pxData[i+1] + qrcolor[1]; 
					pxData[i+2] = pxData[i+2] + qrcolor[2]; 
				}  
				ctx.putImageData(imageData,0,0);

				//有设置版权文字的话，就绘制文字
				if(copyright) {
					ctx.fillStyle = '#999';
					ctx.font = '14px Microsoft YaHei, sans-serif';
					ctx.textBaseline = "middle";
					ctx.textAlign = 'center';
					ctx.fillText(copyright , qrWidth/2, qrHeight - 10);
				}
			};
			img.onerror = function() { 
				qr.showToast("image error!");
			}; 

	        img.src = imgSrc || defaultQr;
	        $qrcodes.style.display = 'block';
	        $download.style.display = 'block';
        } else {
			this.toast('该浏览器不支持canvas..');
		}
	}

	qr.download = function(el, picType) {
		// 下载二维码
		//------------------------------------------------------------------------
        //1.确定图片的类型  获取到的图片格式 data:image/Png;base64,......
        var type = picType || 'png'; //你想要什么图片格式 就选什么吧, 默认png
        var d = document.querySelector(el);
        var imgdata = d.toDataURL(type);
        //2.0 将mime-type改为image/octet-stream,强制让浏览器下载
        var fixtype = function(type) {
            type = type.toLocaleLowerCase().replace(/jpg/i,'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/'+r;
        };
        imgdata = imgdata.replace(fixtype(type),'image/octet-stream');
        //3.0 将图片保存到本地
        var savaFile = function(data,filename) {
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = data;
            save_link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click',true,false,window,0,0,0,0,0,false,false,false,false,0,null);
            save_link.dispatchEvent(event);
        };
        var filename = 'canvas-qr-'+new Date().getDate()+'.'+type;
        //直接用当前几号做的图片名字
        savaFile(imgdata, filename);
	}
	
	qr.getUrlPath = function() {
		// 获取URL地址
		// 这部分代码就是处理标题兼容问题的。
		// 由于在Chrome window.location.origin 属性是支持的，但是在IE11不支持，会导致无法正常翻页。
		var loc = window.location;
        var portStr = "";
        if(loc.port != 80) { 
			portStr = ":" + loc.port;
		}
        return loc.protocol + "//" +loc.hostname + portStr + loc.pathname;
	}

	window.onload = function() {
		qr.init();
	}
</script>

<!-- cnzz -->
<div style="display:none;">
<script type="text/javascript" id="cnzz">var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");document.write(unescape("%3Cspan id='cnzz_stat_icon_1253289748'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s9.cnzz.com/stat.php%3Fid%3D1253289748%26show%3Dpic2' type='text/javascript'%3E%3C/script%3E"));</script>
</div>
</body>
</html>