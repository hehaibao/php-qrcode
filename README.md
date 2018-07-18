# php-qrcode 在线生成二维码

基于phpqrcode+js实现的在线生成二维码工具(canvas版)，个人已使用许久。

目前支持的功能：随意更换颜色、可自定义版权文案、可一键下载二维码，支持页面刷新等。

### 演示地址： 

http://www.hehaibao.com/qr


### 效果预览：

![image](https://github.com/hehaibao/php-qrcode/blob/master/preview.gif)


### 更新日志：

----------------------

2018-07-18更新：

    1 新增颜色选择器，使得二维码颜色可修改
    
    2 对纯白色，纯黑色做兼容处理
    
    
2018-06-12更新：
 
    1 去掉尺寸选择功能，修复生成图片超出问题
    
    2 二维码 支持 白边框 值范围：1-9 
    
    3 新增 自定义版权文案，位置底部居中


2018-06-11更新：

    1 fixed #1 URL过长，导致无法生成图片
    
    2 新增 每次生成时 都会清空canvas画布，防止出现2张图重合的bug
    
    3 二维码调整为在canvas内居中
    
    4 UI调整，新增select改变二维码图片尺寸


2018-05-21更新：

    1 优化js, URL没有填写协议，自动增加http或https


2018-05-17更新：

    1 优化JS写法；

    2 新增判断有没有http协议,如果没有则自动添加；

    3 新增图片错误提示
    
    4 新增local/sessionStorage检测及方法


----------------------


### 依赖：

phpqrcode: http://phpqrcode.sourceforge.net/

jscolor: http://jscolor.com/ (Tips: 如果需要用更改颜色功能的话)

### 协议

MIT

### 鸣谢

感谢phpqrcode和jscolor开源技术及开发人员。

如果小工具对您有作用，请star一下已示鼓励！谢谢！
