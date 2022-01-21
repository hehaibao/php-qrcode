# php-qrcode 在线生成二维码

基于phpqrcode+js实现的在线生成二维码工具(canvas版)，个人已使用许久。

新增小程序版本，wxapp-qrcode文件夹，目前功能只有简版的生成二维码，代码下载后可在本地的微信开发者工具中导入查看。

2022-01-21 新增uni-app版本的生成二维码功能，位于uni-app-qrcode目录下，下载后请用HBuilderX打开。
[插件地址](https://ext.dcloud.net.cn/plugin?id=7297)

### 目前支持的功能：

  可选择类型、随意更换颜色、可自定义版权文案、可一键下载二维码，可重置，支持页面刷新等。


### 效果预览：

![image](https://github.com/hehaibao/php-qrcode/blob/master/preview.gif)

![image](https://github.com/hehaibao/php-qrcode/blob/master/wxapp-qrcode/demo.jpg)


### 更新日志：

----------------------

2019-06-28更新：

    + 新增小程序版本(简版)，仅支持网址

2019-06-20更新：

    + 增加类型选择，目前支持网址和文本
    + 新增重置按钮
    ! 修复Firefox下颜色无法选择的bug
    ! 调整部分UI展示


2018-07-25更新：

    1 下载图片保存时的名称 修改为时间戳形式 


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

### TODO

 1 增加电话，邮箱等支持
 
 2 增加logo
 
 ...


### 依赖：

phpqrcode: http://phpqrcode.sourceforge.net/

jscolor: http://jscolor.com/ (Tips: 如果需要用更改颜色功能的话)

### 协议

MIT LICENSE

### 致谢

感谢phpqrcode和jscolor开源技术及开发人员。

如果小工具对您有作用，请star一下已示鼓励！谢谢！
