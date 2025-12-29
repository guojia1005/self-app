<!-- 授课信息 -->
<template>
	<view class="teach-info">
		<view class="teach-info-item">主题：{{ info.topicName }}</view>
		<view class="teach-info-item">类型：{{ info.subType }}</view>
		<view class="teach-info-item">学科：{{ info.stuSubject }}</view>
		<view class="teach-info-item">年级：{{ info.stuGrade }}</view>
		<view class="teach-info-item">专题：{{ info.featureOne }}</view>
		<view class="teach-info-item">二级专题：{{ info.featureTwoName }}</view>
		<view class="teach-info-item">历史最高成绩：{{ info.historyHighScore }}</view>
		<view class="teach-info-item">历史最低成绩：{{ info.historyLowScore }}</view>
		<view class="teach-info-item">期望教师风格：{{ info.hopeTeachStyle }}</view>
		<view class="teach-info-item">期望教师性别：{{ info.hopeTeachSex }}</view>
		<view class="teach-info-item">期望上课次数：{{ info.hopeClassNumber }}</view>
		<view class="teach-info-item">补充描述：{{ info.desInfo }}</view>
		<view class="teach-info-item">图片：</view>
		<view class="image-wall">
			<view v-for="(item, index) in showImageList" :key="index" class="image-item" @tap="previewImage(index)">
				<image :src="item" mode="aspectFill" class="image" />
			</view>
		</view>
		<view class="teach-btn">
			<view class="teach-btn-item">
				<button size="mini" @click="goBack">返回</button>
			</view>
			<view class="teach-subtn-item">
				<button size="mini" class="submit-btn" @click="submitForm">
					{{ '接单并上传课前测试' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		teacherOrder
	} from '@/api/teacher/teacherSquare.js';
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	import {
		dataFormat,
		dictFormat,
		getDict,
		getNewDict,
		transCode
	} from '@/utils/format.js';
	import {
		createTencentMeeting,
		generateMeetingInfo
	} from '@/api/tencent/meeting.js'; // 假设有腾讯会议相关的API

	export default {
		name: 'TeachingInfo',
		onLoad(val) {
			this.id = val;
		},
		data() {
			return {
				info: {},
				fileList: [],
				showPreview: false,
				showImageList: [],
				isLoading: false, // 加载状态
				meetingData: null // 会议数据
			}
		},
		onLoad(options) {
			this.initPage(options)
		},
		created() {

		},
		methods: {
			initPage(options) {
				// 参数解析
				if (options && options.data) {
					try {
						const params = JSON.parse(decodeURIComponent(options.data))
						this.setPageData(params)
					} catch (error) {
						console.error('参数解析错误:', error)
						uni.showToast({
							title: '参数错误',
							icon: 'none'
						})
					}
				} else {
					console.warn('未接收到参数')
				}
			},
			async setPageData(params) {
				try {
					let data = params;
					data.subType = params.subType ? await getNewDict(131, params.subType) : ''
					let stuSubject = params.stuSubject ? await transCode(params.stuSubject, 122) : ''
					data.featureOne = (params.stuSubject && params.featureOne) ? await getNewDict(stuSubject, params
						.featureOne) : ''
					data.stuSubject = params.stuSubject ? await getNewDict(122, params.stuSubject) : ''
					data.stuGrade = params.stuGrade ? await getNewDict(138, params.stuGrade) : ''
					data.hopeTeachStyle = params.hopeTeachStyle ? await getNewDict(145, params.hopeTeachStyle) : ''
					data.hopeTeachSex = params.hopeTeachSex ? await getNewDict(115, params.hopeTeachSex) : ''
					this.showImageList = (params.pictureUrl && params.pictureUrl.length > 0) ? (params.pictureUrl)
						.split(',') : [];
					this.info = data;
				} catch (err) {
					console.log(err, 'error')
				}
			},
			// 返回
			goBack() {
				uni.navigateBack({
					delta: 1 // 返回的页面数，这里设置为1表示返回上一页
				});
			},
			// 接单并上传课前测试
			async submitForm() {
				// 1. 首先调用接单接口
				const orderData = {
					teacherId: this.info.teacherId,
					releaseId: this.info.releaseId,
				};

				const orderResponse = await teacherOrder(orderData);

				if (orderResponse.code === 200) {
					// 2. 接单成功后，创建腾讯会议
					/* await this.createTencentMeetingAfterOrder();

					// 3. 跳转到上传课前测试页面
					uni.showToast({
						title: '接单成功，会议已创建',
						icon: 'success',
						duration: 2000
					}); */
					uni.showToast({
						title: '接单成功',
						icon: 'success',
						duration: 1000
					});

					setTimeout(() => {
						let params = {
							releaseId: this.info.releaseId,
							status: 0,
						}
						let dataString = JSON.stringify(params);
						uni.navigateTo({
							url: `/pages/work/test-questions/test-questions?data=` +
								encodeURIComponent(dataString)
						})
					}, 1000);
				} else {
					// 接单失败
					uni.showToast({
						title: orderResponse.msg,
						icon: 'none'
					});
				}

			},

			// 接单成功后创建腾讯会议
			async createTencentMeetingAfterOrder() {
				try {
					// 解析上课时间
					// timePeriod 格式可能是 "2024-01-01 14:30 16:30"
					const timePeriod = this.info.timePeriod;
					let startTime, endTime;

					if (timePeriod) {
						const parts = timePeriod.split(' ');
						if (parts.length >= 3) {
							// 格式：日期 开始时间 结束时间
							const datePart = parts[0];
							const startTimePart = parts[1];
							const endTimePart = parts[2];

							// 组合成完整的开始时间和结束时间
							startTime = `${datePart} ${startTimePart}:00`;
							endTime = `${datePart} ${endTimePart}:00`;
						}
					}

					// 创建会议参数
					const meetingParams = {
						releaseId: this.info.releaseId, // 关联的发布ID
						teacherId: this.info.teacherId, // 教师ID
						studentId: this.info.studentId, // 学生ID
						topic: `课程教学 - ${this.info.topicName}`, // 会议主题
						description: `${this.info.topicName} - ${this.info.stuSubject} ${this.info.stuGrade}`, // 会议描述
						startTime: startTime || new Date(Date.now() + 3600000).toISOString(), // 开始时间，如果没有则设为1小时后
						endTime: endTime || new Date(Date.now() + 7200000).toISOString(), // 结束时间，如果没有则设为2小时后
						type: 1, // 会议类型：1-立即开始，2-预定会议
						settings: {
							mute_enable_join: true, // 参会者加入时静音
							allow_unmute_self: true, // 允许参会者解除静音
							play_ivr_on_join: false, // 加入时播放提示音
							play_ivr_on_left: false // 离开时播放提示音
						}
					};

					// 调用创建腾讯会议API
					const meetingResponse = await createTencentMeeting(meetingParams);

					if (meetingResponse.code === 200) {
						this.meetingData = meetingResponse.data;

						// 如果需要，可以保存会议信息到本地或显示给用户
						console.log('腾讯会议创建成功:', this.meetingData);

						// 可以在这里添加会议信息展示逻辑
						// 例如：显示会议号、加入链接等
						if (this.meetingData.meetingNumber) {
							uni.showModal({
								title: '会议创建成功',
								content: `会议号：${this.meetingData.meetingNumber}\n会议链接：${this.meetingData.joinUrl}`,
								showCancel: false,
								confirmText: '知道了'
							});
						}
					} else {
						console.error('创建腾讯会议失败:', meetingResponse.msg);
						// 可以记录错误但不影响主要流程
						uni.showToast({
							title: '会议创建失败，但接单成功',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('创建腾讯会议异常:', error);
					// 会议创建失败不影响接单成功
					uni.showToast({
						title: '会议创建异常，但接单成功',
						icon: 'none',
						duration: 2000
					});
				}
			},

			// 生成会议信息（如果需要单独调用）
			async generateMeetingInfo() {
				try {
					const params = {
						releaseId: this.info.releaseId,
						teacherId: this.info.teacherId,
						studentId: this.info.studentId
					};

					const response = await generateMeetingInfo(params);

					if (response.code === 200) {
						return response.data;
					} else {
						console.error('生成会议信息失败:', response.msg);
						return null;
					}
				} catch (error) {
					console.error('生成会议信息异常:', error);
					return null;
				}
			},

			// 查询类型
			getSubType(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.subTypeOptions = dataFormat(response.data, 'dict');
					}
				})
			},
			// 查询学科
			selectSubject(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.subjectOptions = dataFormat(response.data, 'dict');
					}
				})
			},
			/**
			 * 预览图片（大图模式）
			 * @param {number} currentIndex - 当前点击的图片索引
			 */
			previewImage(currentIndex) {
				uni.previewImage({
					// 当前显示图片的链接
					current: this.showImageList[currentIndex],
					// 需要预览的图片链接列表
					urls: this.showImageList,
					// 图片指示器样式
					indicator: 'default',
					// 是否可循环预览
					loop: false,
					// 长按保存图片到相册
					longPressActions: {
						itemList: ['保存图片', '取消'],
						success: (data) => {
							if (data.tapIndex === 0) {
								this.saveImage(this.showImageList[currentIndex]);
							}
						}
					}
				});
			},

			/**
			 * 保存图片到相册
			 * @param {string} url - 图片URL
			 */
			saveImage(url) {
				uni.showLoading({
					title: '保存中...'
				});

				uni.downloadFile({
					url: url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveImageToPhotosAlbum({
								filePath: res.tempFilePath,
								success: () => {
									uni.hideLoading();
									uni.showToast({
										title: '保存成功',
										icon: 'success'
									});
								},
								fail: () => {
									uni.hideLoading();
									uni.showToast({
										title: '保存失败',
										icon: 'error'
									});
								}
							});
						}
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({
							title: '下载失败',
							icon: 'error'
						});
					}
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.teach-info {
		width: 100%;
		background-color: #fff;
		height: 100vh;
		padding: 10px;
		overflow-y: auto;

		.teach-info-item {
			margin-bottom: 5px;
		}

		.teach-info-img {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 20rpx;
		}

		.teach-info-img-item {
			position: relative;
			width: 100%;
			height: 220rpx;
			border-radius: 12rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}


		.preview-modal {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.8);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
		}

		.preview-content {
			width: 90%;
			max-width: 600rpx;
			background: white;
			border-radius: 16rpx;
			overflow: hidden;
		}

		.preview-image {
			width: 100%;
			display: block;
		}

		.preview-actions {
			padding: 20rpx;
			text-align: center;
		}

		.preview-close {
			background: #007AFF;
			color: white;
			border-radius: 8rpx;
			padding: 16rpx 40rpx;
		}

		.teach-btn {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			padding: 10px;
			display: flex;

			.teach-btn-item {
				flex: 1;
			}

			.teach-subtn-item {
				flex: 1;
				text-align: right;

				.submit-btn {
					background-color: #1890ff;
					color: #fff;
					text-align: right;
				}
			}

			.teach-btn-item:first-child {
				margin-right: 30px;
			}
		}

		.image-wall {
			display: grid;
			grid-template-columns: repeat(3, 1fr); // 3列布局
			grid-gap: 10rpx;
			margin-bottom: 20px;
		}

		.image-item {
			position: relative;
			width: 100%;
			height: 0;
			padding-bottom: 100%; // 保持正方形
			overflow: hidden;
			border-radius: 10rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.95);
				opacity: 0.9;
			}
		}

		.image {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
</style>