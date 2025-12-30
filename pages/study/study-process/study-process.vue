<!-- 课程 -->
<template>
	<view class="process-container">
		<!-- 使用 scroll-view 包裹内容 -->
		<scroll-view 
			scroll-y 
			:refresher-enabled="true" 
			:refresher-triggered="refresherTriggered"
			@refresherrefresh="onRefresh" 
			@refresherrestore="onRestore"
			:style="{ height: scrollViewHeight + 'px' }"
		>
			<view v-for="(item, index) in studyData" :key="index">
				<uni-card padding="10px 0" :is-full="true">
					<template v-slot:title>
						<uni-list>
							<view class="card-title">
								<uni-list-item :title="'主题：' + item.topicName" class="card-title-item" />
							</view>
						</uni-list>
					</template>
					<view>
						<view>类型：{{ subTypeFormat(item.subType) }}</view>
						<view>上课时间：{{ transTime(item.timePeriod) }}</view>
						<view>补充描述：{{ item.desInfo }}</view>
						<view>状态：{{ formatStatus(item.releaseStatus) }}</view>
						<view class="class-btn">
							<button size="mini" class="class-sub-btn" @click="cancelStudy(item)">取消</button>
							<button 
								v-if="shouldShowStudyButton(item) && item.releaseStatus === '2'" 
								size="mini" 
								class="class-sub-btn" 
								@click="goTostudy(item)"
								:loading="loadingStates[item.releaseId]"
								:disabled="loadingStates[item.releaseId]">
								{{ loadingStates[item.releaseId] ? '加载中...' : '去上课' }}
							</button>
							<button v-if="item.releaseStatus === '2'" size="mini" class="class-sub-btn"
							@click="preTest(item)">课前测</button>
						</view>
					</view>
				</uni-card>
			</view>
			
			<!-- 空数据提示 -->
			<view v-if="studyData.length === 0 && !isRefreshing" class="empty-container">
				<uni-icons type="search" size="50" color="#999"></uni-icons>
				<text class="empty-text">暂无课程数据</text>
			</view>
			
			<!-- 加载更多提示 -->
			<view v-if="studyData.length > 0" class="load-more-container">
				<text class="load-more-text">{{ loadMoreText }}</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	import { getReleaseInfo, cancelPost } from '@/api/study/release.js';
	import { getMeetingInfo } from '@/api/tencent/meeting.js'; // 新增：获取会议信息接口
	import { dataFormat, getDictOption } from '@/utils/format.js'
	export default {
		name: 'StudyProcress',
		data() {
			return {
				studyData: [],
				subTypeOptions: [],
				timer: null, // 定时器
				feeRules: { // 12306扣费规则配置（以小时为单位）
					// 时间区间（小时）：扣除百分比
					'360': 0,    // 15天（360小时）以外：0%
					'48': 5,     // 48小时-15天：5%
					'24': 10,    // 24小时-48小时：10%
					'0': 20      // 24小时以内：20%
				},
				coursePrice: 100, // 课程单价，可根据实际情况调整或从接口获取
				loadingStates: {}, // 记录每个课程的加载状态
				isRefreshing: false, // 是否正在刷新
				refresherTriggered: false, // scroll-view 下拉刷新状态
				scrollViewHeight: 0, // scroll-view 高度
				loadMoreText: '下拉加载更多' // 加载更多提示文字
			}
		},
		created() {
			this.getDictData();
		},
		mounted() {
			// 计算 scroll-view 高度
			this.calculateScrollViewHeight();
			
			// releaseStatus（1：课程，2:课后）
			this.getStudyData('1');
			
			// 启动定时器，每分钟检查一次时间
			this.startTimer();
		},
		beforeDestroy() {
			// 组件销毁前清除定时器
			this.clearTimer();
		},
		// 页面生命周期（在page页面中有效）
		onPullDownRefresh() {
			// 如果当前是页面组件，使用 uni-app 自带的下拉刷新
			this.onRefresh();
		},
		onReachBottom() {
			// 如果需要可以在这里实现上拉加载更多
			// this.loadMore();
		},
		methods: {
			// 计算 scroll-view 高度
			calculateScrollViewHeight() {
				const systemInfo = uni.getSystemInfoSync();
				this.scrollViewHeight = systemInfo.windowHeight;
			},
			async getDictData() {
				// 类型
				this.subTypeOptions = await getDictOption(131);
			},
			subTypeFormat(e) {
				for(let i = 0; i < this.subTypeOptions.length; i++) {
					if(e === this.subTypeOptions[i].value) {
						return this.subTypeOptions[i].text
					}
				}
			},
			// 查询发布信息
			getStudyData(status) {
				let params = {
					studentId: this.$store.state.user.id,
					releaseStatus: status
				}
				
				// 显示加载状态
				if (!this.refresherTriggered) {
					uni.showLoading({
						title: '加载中...'
					});
				}
				
				getReleaseInfo(params).then(response => {
					if (response.code === 200) {
						let data = response.data;
						for(let i = 0; i < data.length; i++) {
							data[i].captureTime = (data[i].timePeriod).substring(0, 16);
							data[i].endTime = (data[i].timePeriod).substring(0, 10) + ' ' + (data[i].timePeriod).substring(17, 22);
						}
						this.studyData = data;
					}
					
					// 停止刷新和加载
					this.stopRefresh();
					uni.hideLoading();
				}).catch(error => {
					console.error('获取课程数据失败:', error);
					// 停止刷新和加载
					this.stopRefresh();
					uni.hideLoading();
				})
			},
			// 下拉刷新处理
			onRefresh() {
				// 设置刷新状态
				this.isRefreshing = true;
				this.refresherTriggered = true;
				this.loadMoreText = '正在刷新...';
				
				// 重新获取数据
				this.getStudyData('1');
			},
			// scroll-view 刷新恢复
			onRestore() {
				console.log('刷新状态恢复');
			},
			// 停止刷新
			stopRefresh() {
				this.isRefreshing = false;
				this.refresherTriggered = false;
				this.loadMoreText = '下拉加载更多';
				
				// 停止页面下拉刷新动画
				if (typeof uni.stopPullDownRefresh === 'function') {
					uni.stopPullDownRefresh();
				}
			},
			// 计算是否显示去上课按钮（从captureTime前10分钟到endTime结束）
			shouldShowStudyButton(item) {
				if (!item.captureTime || !item.endTime) return false;
				
				try {
					// 获取当前时间
					const now = new Date();
					
					// 解析captureTime (格式如 "2024-01-01 14:30")
					const [captureDateStr, captureTimeStr] = item.captureTime.split(' ');
					const [captureYear, captureMonth, captureDay] = captureDateStr.split('-').map(Number);
					const [captureHours, captureMinutes] = captureTimeStr.split(':').map(Number);
					
					// 解析endTime (格式如 "2024-01-01 15:30")
					const [endDateStr, endTimeStr] = item.endTime.split(' ');
					const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
					const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
					
					// 创建上课开始时间对象
					const captureDate = new Date(captureYear, captureMonth - 1, captureDay, captureHours, captureMinutes);
					
					// 创建上课结束时间对象
					const endDate = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes);
					
					// 计算允许上课的开始时间（captureTime前10分钟）
					const allowedStartTime = new Date(captureDate.getTime() - 10 * 60 * 1000);
					
					// 判断当前时间是否在允许上课的时间段内
					// 条件：当前时间 >= 允许开始时间 且 当前时间 <= 结束时间
					return now >= allowedStartTime && now <= endDate;
				} catch (error) {
					console.error('时间解析错误:', error);
					return false;
				}
			},
			// 计算距离上课开始时间的小时数（用于取消课程扣费）
			calculateHoursBeforeClass(captureTime) {
				if (!captureTime) return 0;
				
				try {
					// 获取当前时间
					const now = new Date();
					
					// 解析captureTime (格式如 "2024-01-01 14:30")
					const [dateStr, timeStr] = captureTime.split(' ');
					const [year, month, day] = dateStr.split('-').map(Number);
					const [hours, minutes] = timeStr.split(':').map(Number);
					
					// 创建上课时间对象
					const captureDate = new Date(year, month - 1, day, hours, minutes);
					
					// 计算时间差（毫秒）
					const timeDiff = captureDate.getTime() - now.getTime();
					
					// 转换为小时（保留2位小数）
					const timeDiffHours = timeDiff / (1000 * 60 * 60);
					
					return Math.max(0, timeDiffHours); // 如果已经过了上课时间，返回0
				} catch (error) {
					console.error('时间解析错误:', error);
					return 0;
				}
			},
			// 计算需要扣除的费用
			calculateCancellationFee(hoursBeforeClass) {
				let deductionPercentage = 100; // 默认100%
				
				// 根据时间区间计算扣费百分比
				const timeIntervals = Object.keys(this.feeRules)
					.map(key => parseInt(key))
					.sort((a, b) => b - a); // 从大到小排序
				
				for (let interval of timeIntervals) {
					if (hoursBeforeClass > interval) {
						deductionPercentage = this.feeRules[interval];
						break;
					}
				}
				
				// 计算扣除金额
				const deductionAmount = (this.coursePrice * deductionPercentage) / 100;
				
				return {
					hoursBeforeClass: hoursBeforeClass.toFixed(1),
					deductionPercentage,
					deductionAmount: deductionAmount.toFixed(2),
					remainingAmount: (this.coursePrice - deductionAmount).toFixed(2)
				};
			},
			// 取消课程
			cancelStudy(item) {
				if(item.releaseStatus === '1') {
					uni.showModal({
						title: '确认取消课程',
						confirmText: '确认取消',
						cancelText: '再想想',
						confirmColor: '#e64340',
						success: (res) => {
							if (res.confirm) {
								this.proceedCancellation(item);
							}
						}
					});
				} else if(item.releaseStatus === '2') {
					// 首先检查是否已经在上课时间段内
					if (this.isInClassTime(item)) {
						uni.showToast({
							title: '课程正在进行中，无法取消',
							icon: 'none',
							duration: 2000
						});
						return;
					}
					
					// 计算距离上课时间
					const hoursBeforeClass = this.calculateHoursBeforeClass(item.captureTime);
					
					// 计算扣费信息
					const feeInfo = this.calculateCancellationFee(hoursBeforeClass);
					
					// 弹出确认对话框
					let message = '';
					if (feeInfo.deductionPercentage === 0) {
						message = `距离上课还有${feeInfo.hoursBeforeClass}小时，取消课程不会扣除费用。确认要取消吗？`;
					} else if (feeInfo.deductionPercentage === 100) {
						message = `距离上课不足4小时，取消课程将扣除全部费用（${feeInfo.deductionAmount}元）。确认要取消吗？`;
					} else {
						message = `距离上课还有${feeInfo.hoursBeforeClass}小时，取消课程将扣除${feeInfo.deductionPercentage}%的费用（${feeInfo.deductionAmount}元），剩余${feeInfo.remainingAmount}元将退回。确认要取消吗？`;
					}
					
					uni.showModal({
						title: '确认取消课程',
						content: message,
						confirmText: '确认取消',
						cancelText: '再想想',
						confirmColor: '#e64340',
						success: (res) => {
							if (res.confirm) {
								this.proceedCancellation(item, feeInfo);
							}
						}
					});
				}
			},
			// 检查是否在上课时间段内（captureTime到endTime之间）
			isInClassTime(item) {
				if (!item.captureTime || !item.endTime) return false;
				
				try {
					// 获取当前时间
					const now = new Date();
					
					// 解析captureTime
					const [captureDateStr, captureTimeStr] = item.captureTime.split(' ');
					const [captureYear, captureMonth, captureDay] = captureDateStr.split('-').map(Number);
					const [captureHours, captureMinutes] = captureTimeStr.split(':').map(Number);
					
					// 解析endTime
					const [endDateStr, endTimeStr] = item.endTime.split(' ');
					const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
					const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
					
					// 创建上课开始时间对象
					const captureDate = new Date(captureYear, captureMonth - 1, captureDay, captureHours, captureMinutes);
					
					// 创建上课结束时间对象
					const endDate = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes);
					
					// 判断当前时间是否在上课时间段内
					return now >= captureDate && now <= endDate;
				} catch (error) {
					console.error('时间解析错误:', error);
					return false;
				}
			},
			// 执行取消操作
			proceedCancellation(item, feeInfo) {
				// 显示加载中
				uni.showLoading({
					title: '处理中...',
					mask: true
				});
				
				console.log(item.releaseId, 'releaseId')
				// 调用取消接口
				cancelPost(item.releaseId).then(response => {
					uni.hideLoading();
					
					if (response.code === 200) {
						if(item.releaseStatus === '1') {
							// 取消成功
							uni.showToast({
								title: '取消成功',
								icon: 'success',
								duration: 2000
							});
						} else if(item.releaseStatus === '2') {
							// 根据扣费情况显示不同提示
							let refundMessage = '';
							if (feeInfo.deductionPercentage === 0) {
								refundMessage = '已成功取消，不扣除任何费用。';
							} else if (feeInfo.deductionPercentage === 100) {
								refundMessage = `已扣除全部费用${feeInfo.deductionAmount}元。`;
							} else {
								refundMessage = `已扣除${feeInfo.deductionAmount}元，${feeInfo.remainingAmount}元将退回您的账户。`;
							}
							
							// 显示退款信息
							setTimeout(() => {
								uni.showModal({
									title: '取消成功',
									content: refundMessage,
									showCancel: false,
									confirmText: '知道了'
								});
							}, 1000);
						}
						
						// 刷新列表
						this.getStudyData('1');
					} else {
						uni.showToast({
							title: response.msg || '取消失败',
							icon: 'none',
							duration: 2000
						});
					}
				})
			},
			// 去上课 - 跳转到腾讯会议
			async goTostudy(item) {
				// 检查是否在允许上课的时间段内
				if (!this.shouldShowStudyButton(item)) {
					uni.showToast({
						title: '不在上课时间段内',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				// 设置加载状态
				this.$set(this.loadingStates, item.releaseId, true);
				
				try {
					// 1. 先获取腾讯会议信息
					const meetingResponse = await this.getMeetingInfo(item.releaseId);
					
					if (meetingResponse && meetingResponse.code === 200) {
						const meetingData = meetingResponse.data;
						
						// 2. 检查会议是否有效
						if (!this.validateMeetingInfo(meetingData)) {
							uni.showToast({
								title: '会议信息不完整',
								icon: 'none',
								duration: 2000
							});
							return;
						}
						
						// 3. 提供多种进入会议的方式
						this.showJoinMeetingOptions(meetingData);
					} else {
						uni.showToast({
							title: '获取会议信息失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('进入会议失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none',
						duration: 2000
					});
				} finally {
					// 清除加载状态
					this.$set(this.loadingStates, item.releaseId, false);
				}
			},
			
			// 获取会议信息
			async getMeetingInfo(releaseId) {
				try {
					const params = {
						releaseId: releaseId
					};
					
					return await getMeetingInfo(params);
				} catch (error) {
					console.error('获取会议信息失败:', error);
					throw error;
				}
			},
			
			// 验证会议信息
			validateMeetingInfo(meetingData) {
				// 检查必要的会议信息
				if (!meetingData) return false;
				
				// 至少要有会议号或加入链接其中之一
				const hasMeetingNumber = meetingData.meetingNumber && meetingData.meetingNumber.trim();
				const hasJoinUrl = meetingData.joinUrl && meetingData.joinUrl.trim();
				
				return hasMeetingNumber || hasJoinUrl;
			},
			
			// 显示加入会议的选项
			showJoinMeetingOptions(meetingData) {
				const options = [];
				
				// 如果会议号存在，添加"通过会议号加入"选项
				if (meetingData.meetingNumber) {
					options.push({
						text: '通过会议号加入',
						value: 'meetingNumber'
					});
				}
				
				// 如果加入链接存在，添加"直接链接加入"选项
				if (meetingData.joinUrl) {
					options.push({
						text: '直接链接加入',
						value: 'joinUrl'
					});
				}
				
				// 如果没有有效的选项，提示用户
				if (options.length === 0) {
					uni.showToast({
						title: '无有效的会议加入方式',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				// 如果只有一个选项，直接使用
				if (options.length === 1) {
					this.joinMeeting(meetingData, options[0].value);
					return;
				}
				
				// 多个选项，让用户选择
				uni.showActionSheet({
					itemList: options.map(opt => opt.text),
					success: (res) => {
						const selectedOption = options[res.tapIndex];
						this.joinMeeting(meetingData, selectedOption.value);
					}
				});
			},
			
			// 加入腾讯会议
			joinMeeting(meetingData, joinMethod) {
				if (joinMethod === 'meetingNumber') {
					// 通过会议号加入
					this.joinByMeetingNumber(meetingData);
				} else if (joinMethod === 'joinUrl') {
					// 通过链接加入
					this.joinByUrl(meetingData);
				}
			},
			
			// 通过会议号加入
			joinByMeetingNumber(meetingData) {
				// 腾讯会议APP的scheme格式: tmeeting://meeting?action=join&meeting_no=会议号
				const meetingNo = meetingData.meetingNumber;
				const meetingUrl = `tmeeting://meeting?action=join&meeting_no=${meetingNo}`;
				
				// 先尝试用微信小程序打开
				this.openMeetingWithApp(meetingUrl, meetingData);
			},
			
			// 通过链接加入
			joinByUrl(meetingData) {
				const joinUrl = meetingData.joinUrl;
				
				// 检查是否是腾讯会议链接
				if (joinUrl.includes('meeting.tencent.com')) {
					// 腾讯会议网页版链接
					this.openWebMeeting(joinUrl);
				} else {
					// 其他类型的链接，直接跳转
					uni.navigateTo({
						url: `/pages/webview/webview?url=${encodeURIComponent(joinUrl)}`
					});
				}
			},
			
			// 尝试用APP打开会议
			openMeetingWithApp(schemeUrl, meetingData) {
				// 先尝试打开腾讯会议APP
				uni.navigateToMiniProgram({
					appId: 'wxda43d52940db58b1', // 腾讯会议小程序AppID
					path: `/pages/meeting/meeting?meeting_no=${meetingData.meetingNumber}`,
					success: () => {
						console.log('成功跳转到腾讯会议小程序');
					},
					fail: (err) => {
						console.log('跳转小程序失败:', err);
						
						// 如果小程序失败，尝试用scheme打开APP
						plus.runtime.openURL(schemeUrl, (error) => {
							console.log('打开APP失败:', error);
							
							// APP也失败，使用网页版
							if (meetingData.joinUrl) {
								this.openWebMeeting(meetingData.joinUrl);
							} else {
								// 显示会议号让用户手动输入
								this.showMeetingNumberManual(meetingData.meetingNumber);
							}
						});
					}
				});
			},
			
			// 打开网页版会议
			openWebMeeting(url) {
				// 使用webview打开腾讯会议网页版
				uni.navigateTo({
					url: `/pages/webview/webview?url=${encodeURIComponent(url)}&title=腾讯会议`
				});
			},
			
			// 显示会议号让用户手动输入
			showMeetingNumberManual(meetingNumber) {
				uni.showModal({
					title: '加入会议',
					content: `请打开腾讯会议APP，输入会议号：${meetingNumber}`,
					showCancel: false,
					confirmText: '复制会议号',
					success: (res) => {
						if (res.confirm) {
							// 复制会议号到剪贴板
							uni.setClipboardData({
								data: meetingNumber.toString(),
								success: () => {
									uni.showToast({
										title: '已复制会议号',
										icon: 'success'
									});
								}
							});
						}
					}
				});
			},
			
			// 课前测
			preTest(item) {
				let params = {
					releaseId: item.releaseId,
					status: 0,
				}
				let dataString = JSON.stringify(params);
				uni.navigateTo({
					url: `/pages/work/test-questions/test-questions?data=` + encodeURIComponent(dataString)
				})
			},
			transTime(val) {
				let originalString = val;
				let newChar = "-"; // 你想替换的字符
				
				// 将字符串转换为数组
				let stringArray = originalString.split('');
				// 替换第五个字符
				stringArray[16] = newChar; // 注意：数组索引是从0开始的，所以第五个字符的索引是4
				// 将数组转换回字符串
				let newString = stringArray.join('');
				
				return newString
			},
			// 启动定时器
			startTimer() {
				// 每分钟检查一次时间
				this.timer = setInterval(() => {
					// 强制组件重新渲染以更新按钮显示状态
					this.$forceUpdate();
				}, 60000); // 60000毫秒 = 1分钟
			},
			// 清除定时器
			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			// 状态转码
			formatStatus(val) {
				if (val === '1') {
					return '发布';
				} else if (val === '2') {
					return '已接单';
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.process-container {
	min-height: 100vh;
}

.card-title {
	display: flex;
	align-items: center;
	width: 100%;

	.card-title-item {
		flex: 4;
		text-align: left;
		font-weight: bold;
	}

	.card-title-btn {
		flex: 1;
		text-align: right;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 32px;
		background-color: #1890ff;
		color: #fff;
	}
}

.class-btn {
	margin: 5px 0px 0px 0px;
	overflow: auto;
	width: 100%;
	
	.class-sub-btn {
		height: 32px;
		background-color: #1890ff;
		color: #fff;
		float: right;
		margin-left: 10px;
	}
	
	.button {
		background-color: #1890ff;
		color: #fff;
	}
	
	.btn-left {
		margin-left: 0;
	}
	
	.btn-center {
		margin: 0 auto;
	}
	
	.btn-right {
		margin-right: 0;
	}
}

/* 空数据样式 */
.empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	color: #999;
	
	.empty-text {
		margin-top: 20rpx;
		font-size: 28rpx;
	}
}

/* 加载更多样式 */
.load-more-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 0;
	
	.load-more-text {
		font-size: 24rpx;
		color: #999;
	}
}

::v-deep .uni-scroll-view {
	min-height: 100vh;
}
</style>