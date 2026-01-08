<template>
	<view class="webview-container">
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url: '',
				meetingCode: ''
			};
		},
		onLoad(options) {
			if (options.params) {
				try {
					const params = JSON.parse(decodeURIComponent(options.params));
					this.url = params.url;
					this.meetingCode = params.meetingCode || '';
					
					// 立即显示提示并复制
					if (this.meetingCode) {
						this.showMeetingCodeAlert();
					}
					
				} catch (error) {
					if (options.url) {
						this.url = decodeURIComponent(options.url);
					}
				}
			} else if (options.url) {
				this.url = decodeURIComponent(options.url);
			}
		},
		methods: {
			// 显示会议码提示
			showMeetingCodeAlert() {
				// 延迟显示，确保webview开始加载
				setTimeout(() => {
					uni.showModal({
						title: '腾讯会议',
						content: `会议号：${this.meetingCode}\n\n会议号已复制到剪贴板，请粘贴到会议输入框中。`,
						showCancel: false,
						confirmText: '知道了',
						success: () => {
							// 复制到剪贴板
							uni.setClipboardData({
								data: this.meetingCode,
								success: () => {
									console.log('会议号复制成功');
								}
							});
						}
					});
				}, 500);
			}
		}
	};
</script>

<style scoped>
	.webview-container {
		width: 100%;
		height: 100vh;
	}
</style>