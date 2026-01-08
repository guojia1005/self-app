<template>
	<view class="modal-overlay" v-if="show" @tap="closeModal">
		<view class="modal-content" @tap.stop>
			<!-- 弹窗头部 -->
			<view class="modal-header">
				<text class="modal-title">{{ teacher.name }}老师讲解</text>
				<text class="close-btn" @tap="closeModal">×</text>
			</view>

			<!-- 视频解析 -->
			<view class="section" v-if="teacher.videoUrl">
				<view class="section-title">视频解析</view>
				<video :src="teacher.videoUrl" controls class="video-player" poster="/static/video-poster.jpg"></video>
			</view>

			<!-- 图片解析 -->
			<view class="section" v-if="teacher.images && teacher.images.length">
				<view class="section-title">图片解析</view>
				<scroll-view class="image-scroll" scroll-x>
					<view v-for="(image, index) in teacher.images" :key="index" class="image-item">
						<image :src="image.url" mode="aspectFit" class="solution-image"
							@tap="previewImage(teacher.images, index)"></image>
						<text class="image-desc" v-if="image.desc">{{ image.desc }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 文字解析 -->
			<view class="section" v-if="teacher.textAnalysis">
				<view class="section-title">文字解析</view>
				<view class="text-content">
					<text>{{ teacher.textAnalysis }}</text>
				</view>
			</view>

			<!-- 互动区域 -->
			<view class="interaction-section">
				<view class="like-buttons">
					<view class="like-btn" :class="{'active': teacher.liked}" @tap="handleLike">
						<text class="like-icon">👍</text>
						<text class="like-count">{{ teacher.likes }}</text>
					</view>
					<view class="dislike-btn" :class="{'active': teacher.disliked}" @tap="handleDislike">
						<text class="dislike-icon">👎</text>
						<text class="dislike-count">{{ teacher.dislikes }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'TeacherModal',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			teacher: {
				type: Object,
				default: () => ({})
			},
			question: {
				type: Object,
				default: () => ({})
			}
		},

		methods: {
			closeModal() {
				this.$emit('close')
			},

			handleLike() {
				this.$emit('like', this.teacher.id)
			},

			handleDislike() {
				this.$emit('dislike', this.teacher.id)
			},

			previewImage(images, currentIndex) {
				uni.previewImage({
					current: currentIndex,
					urls: images.map(img => img.url)
				})
			}
		}
	}
</script>

<style scoped>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}

	.modal-content {
		width: 90%;
		max-height: 80vh;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.modal-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #fff;
	}

	.close-btn {
		font-size: 50rpx;
		color: #fff;
		width: 60rpx;
		height: 60rpx;
		text-align: center;
		line-height: 60rpx;
	}

	.section {
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.video-player {
		width: 100%;
		height: 400rpx;
		border-radius: 12rpx;
	}

	.image-scroll {
		white-space: nowrap;
	}

	.image-item {
		display: inline-block;
		width: 300rpx;
		margin-right: 20rpx;
	}

	.solution-image {
		width: 300rpx;
		height: 200rpx;
		border-radius: 12rpx;
	}

	.image-desc {
		display: block;
		font-size: 26rpx;
		color: #666;
		margin-top: 10rpx;
		white-space: normal;
	}

	.text-content {
		font-size: 30rpx;
		line-height: 1.6;
		color: #333;
		padding: 20rpx;
		background: #f9f9f9;
		border-radius: 12rpx;
	}

	.interaction-section {
		padding: 30rpx;
	}

	.like-buttons {
		display: flex;
		justify-content: center;
		gap: 60rpx;
	}

	.like-btn,
	.dislike-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 40rpx;
		border-radius: 40rpx;
		background: #f5f5f5;
		transition: all 0.3s;
	}

	.like-btn.active {
		background: #e8f5e9;
		color: #4CAF50;
	}

	.dislike-btn.active {
		background: #ffebee;
		color: #f44336;
	}

	.like-icon,
	.dislike-icon {
		font-size: 50rpx;
		margin-bottom: 10rpx;
	}

	.like-count,
	.dislike-count {
		font-size: 28rpx;
		font-weight: bold;
	}
</style>