<template>
	<view>
		<view class='qrcode-box'>
			<view class='qrcode-canvas-view'>
				<canvas class='qrcode-canvas' @click="previewImage" canvas-id='qrcode'></canvas>
				<block v-if='logoImg'>
					<image class='logo-img opt-btn' :src='logoImg' @click='updateLogo'></image>
				</block>
				<block v-else>
					<view class='logo-img opt-btn' @click='updateLogo'>LOGO</view>
				</block>
				<view class="qrcode-color opt-btn" :style="'background:'+color" @click="showColorPicker">颜色</view>
			</view>
			<view class='qrcode-set'>
				<textarea class='message-content' @input="bindInput" name="message" maxlength="100" placeholder="请输入二维码内容,最多输入100个字符"></textarea>
			</view>
			<view class='qrcode-opretion'>
				<button @click='savePic' class='qrcode-btn'>生成二维码</button>
			</view>
		</view>
		
		<!-- 颜色选择器 -->
		<t-color-picker ref="colorPicker" :color="colorData" @confirm="handleColorConfirm"></t-color-picker>
	</view>
</template>

<script>
	import tColorPicker from '@/components/t-color-picker/t-color-picker.vue'
	let QRCode = require('../../utils/qrcode.js').default
	export default {
		components: {
			tColorPicker
		},
		data() {
			return {
				canvasId: 'qrcode',
				QR: '', // 二维码
				qrText: '', // 输入的二维码内容
				logoImg: '', // logo图片
				color: '#000000', // 选择的颜色，默认：黑色
				colorData: {r: 0,g: 0,b: 0,a: 1}
			}
		},
		onLoad () {
			let that = this
			let res = uni.getSystemInfoSync()
			that.canvasWidth = res.windowWidth * 350 / 750
			that.canvasHeight = res.windowWidth * 350 / 750
			let qrcode = new QRCode(that.canvasId, {
				text: '没有填写内容哦',
				width: that.canvasWidth,
				height: that.canvasHeight,
				colorDark: '#ccc',
				colorLight: '#fff',
				correctLevel: QRCode.correctLevel.H,
				logo: '',
				successTips: false
			})
			that.QR = qrcode
		},
		methods: {
			bindInput (e) {
				// 二维码内容输入
				this.qrText = e.detail.value
			},
			doCreateQRCode () {
				// 生成二维码
				uni.showLoading({
					title: '正在生成...',
				})
				this.QR.clear()
				this.QR._opts.colorDark = this.color
				this.QR._opts.logo = this.logoImg || false
				this.QR._opts.successTips = false
				this.QR.makeCode(this.qrText)
				this.createQRCodeDone = true
				uni.hideLoading()
			},
			isEmojiCharacter (str) {
				// 校验是否输入包含表情
				if (str) {
					for (var i = 0; i < str.length; i++) {
						var hs = str.charCodeAt(i)
						if (0xd800 <= hs && hs <= 0xdbff) {
							if (str.length > 1) {
								var ls = str.charCodeAt(i + 1)
								var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000
								if (0x1d000 <= uc && uc <= 0x1f77f) {
									return true
								}
							}
						} else if (str.length > 1) {
							var ls = str.charCodeAt(i + 1)
							if (ls == 0x20e3) return true
						} else {
							if (0x2100 <= hs && hs <= 0x27ff) {
								return true
							} else if (0x2B05 <= hs && hs <= 0x2b07) {
								return true
							} else if (0x2934 <= hs && hs <= 0x2935) {
								return true
							} else if (0x3297 <= hs && hs <= 0x3299) {
								return true
							} else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b || hs == 0x2b50) {
								return true
							}
						}
					}
				}
			},
			savePic () {
				// 保存二维码
				let that = this
				let res = uni.getSystemInfoSync()
				if (!that.qrText) {
					uni.showToast({
						title: '二维码内容不能为空哦！',
						icon: 'none',
						duration: 2000
					})
					return
				}
				if (that.isEmojiCharacter(that.qrText)) {
					uni.showToast({
						title: '二维码内容目前不支持表情哦！',
						icon: 'none',
						duration: 2000
					})
					return
				}
				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: this.canvasWidth,
					height: this.canvasHeight,
					destWidth: 472,
					destHeight: 472,
					canvasId: this.canvasId,
					success (res) {
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success (res) {
								uni.showToast({
									title: '保存成功~',
									icon: 'success',
									duration: 2000
								})
							},
							fail (res) {
								uni.showToast({
									title: '暂无相册权限，请授权后再试',
									icon: 'none',
									duration: 2000
								})
							}
						})
					}
				})
			},
			previewImage (e) {
				// 预览已生成的二维码
				if (this.createQRCodeDone) {
					uni.canvasToTempFilePath({
						x: 0,
						y: 0,
						width: this.canvasWidth,
						height: this.canvasHeight,
						destWidth: 472,
						destHeight: 472,
						canvasId: this.canvasId,
						success(res) {
							uni.previewImage({
								urls: [res.tempFilePath],
							})
						}
					})
				}
			},
			showColorPicker () {
			    // 显示颜色选择器
				this.$refs.colorPicker.open()
			},
			handleColorConfirm (color) {
				// 选择颜色，并更新二维码
				this.colorData = color.rgba
				this.color = color.hex || '#000'
				this.doCreateQRCode()
			},
			updateLogo (e) {
				// 选择logo上传并更新二维码
				let that = this
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						that.logoImg = res.tempFilePaths[0]
						that.doCreateQRCode()
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qrcode-box {
		font-size: 28rpx;
		width: auto;
		height: 360rpx;
		margin: 20rpx auto;
		padding: 0 40rpx;
		box-sizing: border-box;
	}
	.qrcode-canvas-view {
		height: 356rpx;
		width: 356rpx;
		margin: 40rpx auto;
		border: solid 1rpx #ccc;
	}
	.qrcode-canvas {
		margin: 2rpx;
		height: 350rpx;
		width: 350rpx;
	}
	.opt-btn {
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		color: #fff;
		background: #000;
		box-shadow: 0 0 10rpx #999;
		font-size: 24rpx;
		text-align: center;
		border-radius: 50%;
		margin-right: 10rpx;
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		z-index: 2;
	}
	.qrcode-color {
		top: 120rpx;
	}
	.logo-img {
		background: #D8B765;
	}
	.message-content {
		padding: 2%;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		min-height: 40rpx;
		margin: 0;
		width: 100%;
		box-sizing: border-box;
	}
	.qrcode-opretion {
		width: 100%;
		overflow: hidden;
		margin-top: 30rpx;
		.qrcode-btn {
			background-image: linear-gradient(100deg, #D8B765, #B58862);
			color: #fff;
			margin: 20rpx auto;
			border-radius: 70rpx;
		}
	}
</style>
