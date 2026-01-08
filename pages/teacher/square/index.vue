<!-- 教师广场首页 -->
<template>
	<view class="teacher-square">
		<view class="tab-bar">
			<uni-segmented-control :current="currentIndex" :values="items" @clickItem="onClickItem" styleType="button"
				activeColor="#007aff" class="tab-bar-control"></uni-segmented-control>
		</view>
		<view class="tab-content">
			<!-- 使用 scroll-view 实现下拉刷新 -->
			<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
				@refresherrefresh="onRefresh" @refresherrestore="onRestore"
				:style="{ height: scrollViewHeight + 'px' }">
				<view v-if="currentIndex === 0">
					<view v-for="(item, index) in data" :key="index">
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
								<view>发起人：{{ item.studentName }}</view>
								<view>上课时间：{{ transTime(item.timePeriod) }}</view>
								<view>描述：{{ item.desInfo }}</view>
							</view>
							<view class="content-btn">
								<button size="mini" class="card-sub-btn" @click="viewDetails(item)">查看详情</button>
							</view>
						</uni-card>
					</view>

					<!-- 空数据提示 -->
					<view v-if="data.length === 0 && !isLoading" class="empty-container">
						<uni-icons type="search" size="50" color="#999"></uni-icons>
						<text class="empty-text">暂无发现数据</text>
					</view>
				</view>
				<view v-else-if="currentIndex === 1">
					<view v-for="(item, index) in data" :key="index">
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
								<view>发起人：{{ item.studentName }}</view>
								<view>上课时间：{{ transTime(item.timePeriod) }}</view>
								<view>描述：{{ item.desInfo }}</view>
								<view>状态：{{ formatStatus(item.releaseStatus) }}</view>
							</view>
							<view class="content-btn">
								<button v-if="shouldShowCancelBtn(item)" 
								        size="mini" 
								        class="card-sub-btn" 
								        @click="orderCancel(item)">
								    取消
								</button>

								<!-- 根据时间动态显示上课/下课按钮 -->
								<button v-if="shouldShowGoToClassBtn(item)" size="mini" class="card-sub-btn"
									@click="goToClass(item)">
									去上课
								</button>

								<button v-if="shouldShowClassOverBtn(item) && (item.releaseStatus !== '3')" size="mini"
									class="card-sub-btn" @click="classOver(item)">
									下课
								</button>
								<button v-if="item.releaseStatus === '3'" size="mini" class="card-sub-btn" @click="uploadExercises(item)">课后测</button>
								<button v-if="item.releaseStatus === '3'" size="mini" class="card-sub-btn" @click="feedBack(item, 'info')">学生反馈</button>
								<button v-if="item.releaseStatus === '3'" size="mini" class="card-sub-btn" @click="evaluate(item)">评价</button>
								<button v-if="item.releaseStatus === '2'"
								size="mini" class="card-sub-btn" @click="uploadExercises(item)">课前测</button>
							</view>
						</uni-card>
					</view>

					<!-- 空数据提示 -->
					<view v-if="data.length === 0 && !isLoading" class="empty-container">
						<uni-icons type="search" size="50" color="#999"></uni-icons>
						<text class="empty-text">暂无已接单数据</text>
					</view>
				</view>

				<!-- 加载更多提示 -->
				<view v-if="data.length > 0" class="load-more-container">
					<text class="load-more-text">{{ loadMoreText }}</text>
				</view>
			</scroll-view>
		</view>
		<view>
			<!-- 提示窗示例 -->
			<uni-popup ref="alertDialog" type="dialog">
			     <view class="single-input-dialog">
			       <view class="dialog-title">学生反馈</view>
			       <uni-easyinput
			         v-model="content"
								  type="textarea"
			         class="input-box" 
			         placeholder="请输入..."
			         :focus="true"
					 :disabled="true"
			       />
			       <view class="dialog-actions">
			         <text class="action-cancel-close" @click="closeFeedBack">关闭</text>
			       </view>
			     </view>
			   </uni-popup>
		</view>
		<view>
			<!-- 输入框示例 -->
			 <uni-popup ref="singleInput" type="dialog">
			      <view class="single-input-dialog">
			        <view class="dialog-title">请对学生进行评价</view>
			        <uni-easyinput
			          v-model="content"
					  type="textarea"
			          class="input-box" 
			          placeholder="请输入..."
			          :focus="true"
			        />
			        <view class="dialog-actions">
			          <text class="action-cancel" @click="cancelSingleInput">取消</text>
			          <text class="action-confirm" @click="confirmSingleInput">确定</text>
			        </view>
			      </view>
			    </uni-popup>
		</view>
	</view>
</template>

<script>
	import {
		getPostInfo,
		overClass,
		cancelClass,
		getConnect
	} from '@/api/teacher/teacherSquare.js';
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	import {
		getDictOption
	} from '@/utils/format.js';
	import {
		sendEvaluate,
		getEvaluate,
		updateEvaluate
	} from '@/api/study/release.js';
	export default {
		name: 'TeacherSquare',
		data() {
			return {
				currentIndex: 0,
				items: ['发现', '我已接单'],
				data: [],
				subTypeOptions: [],
				timer: null, // 定时器用于实时更新时间判断
				isRefreshing: false, // 下拉刷新状态
				isLoading: false, // 加载状态
				scrollViewHeight: 0, // scroll-view 高度
				loadMoreText: '下拉加载更多', // 加载更多提示文字
				feeRules: { // 12306扣费规则配置（以小时为单位）
					// 时间区间（小时）：扣除百分比
					'360': 0, // 15天（360小时）以外：0%
					'48': 5, // 48小时-15天：5%
					'24': 10, // 24小时-48小时：10%
					'0': 20 // 24小时以内：20%
				},
				coursePrice: 100, // 课程单价，可根据实际情况调整或从接口获取
				msgType: '', // 提示框类型
				content: '',
			}
		},
		created() {
			this.getInfo(this.currentIndex + 1);
			this.getDictData();
			// 启动定时器，每分钟检查一次时间
			this.startTimer();
		},
		mounted() {
			// 计算 scroll-view 高度
			this.calculateScrollViewHeight();
		},
		beforeDestroy() {
			// 组件销毁时清除定时器
			this.clearTimer();
		},
		methods: {
			// 计算 scroll-view 高度
			calculateScrollViewHeight() {
				const systemInfo = uni.getSystemInfoSync();
				// 减去tab-bar高度和可能的其他高度
				this.scrollViewHeight = systemInfo.windowHeight - 45 - 44; // 调整这个值以适应你的布局
			},
			async getDictData() {
				// 类型
				this.subTypeOptions = await getDictOption(131);
			},
			// 查询学生发布的信息
			getInfo(val) {
				this.isLoading = true;
				let params = {
					teacherId: this.$store.state.user.id,
					releaseStatus: val
				}
				getPostInfo(params).then(response => {
					if (response.code === 200) {
						let data = response.data;
						for (let i = 0; i < data.length; i++) {
							data[i].captureTime = (data[i].timePeriod).substring(0, 16);
							data[i].endTime = (data[i].timePeriod).substring(0, 11) + (data[i].timePeriod)
								.substring(17, 22);
							if(this.shouldShowGoToClassBtn(data[i]) === true) {
								this.getTencentConnect(data[i], i);
							}
						}
						this.data = data;
					}
					this.isLoading = false;
					this.stopRefresh();
				}).catch(error => {
					this.isLoading = false;
					this.stopRefresh();
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				})
			},
			// 查询腾讯会议连接
			getTencentConnect(item, index) {
				getConnect(item.releaseId).then(response => {
					if (response.code === 200) {
						this.data[index].meetingUrl = response.data.meetingUrl;
						this.data[index].meetingCode = response.data.meetingCode;
					}
				})
			},
			// 下拉刷新
			onRefresh() {
				if (this.isLoading) {
					this.stopRefresh();
					return;
				}

				this.isRefreshing = true;
				this.loadMoreText = '正在刷新...';

				// 重新获取数据
				this.getInfo(this.currentIndex + 1);
			},
			// scroll-view 刷新恢复
			onRestore() {
				
			},
			// 停止刷新
			stopRefresh() {
				this.isRefreshing = false;
				this.loadMoreText = '下拉加载更多';
			},
			subTypeFormat(e) {
				for (let i = 0; i < this.subTypeOptions.length; i++) {
					if (e === this.subTypeOptions[i].value) {
						return this.subTypeOptions[i].text
					}
				}
			},
			onClickItem(e) {
				if (this.currentIndex !== e.currentIndex) {
					this.currentIndex = e.currentIndex;
					this.data = []; // 清空数据
					this.getInfo(this.currentIndex + 1);
				}
			},
			// 解析时间字符串为Date对象
			parseTime(timeStr) {
				if (!timeStr) return null;

				// 格式: "2024-01-01 10:00"
				const parts = timeStr.split(' ');
				if (parts.length !== 2) return null;

				const dateParts = parts[0].split('-');
				const timeParts = parts[1].split(':');

				if (dateParts.length !== 3 || timeParts.length !== 2) return null;

				return new Date(
					parseInt(dateParts[0]), // 年
					parseInt(dateParts[1]) - 1, // 月（0-based）
					parseInt(dateParts[2]), // 日
					parseInt(timeParts[0]), // 时
					parseInt(timeParts[1]) // 分
				);
			},
			// 判断是否应该显示"去上课"按钮
			shouldShowGoToClassBtn(item) {
				if (!item.captureTime || !item.endTime) return false;

				const captureTime = this.parseTime(item.captureTime);
				const endTime = this.parseTime(item.endTime);
				const now = new Date();

				if (!captureTime || !endTime) return false;

				// 计算距离开始时间10分钟的时间点
				const tenMinutesBeforeStart = new Date(captureTime.getTime() - 10 * 60 * 1000);

				// 当前时间在开始前10分钟到结束时间之间时显示"去上课"
				return now >= tenMinutesBeforeStart && now < endTime;
			},
			// 判断是否应该显示"下课"按钮
			shouldShowClassOverBtn(item) {
				if (!item.endTime) return false;

				const endTime = this.parseTime(item.endTime);
				const now = new Date();

				if (!endTime) return false;

				// 当前时间大于等于结束时间时显示"下课"
				return now >= endTime;
			},
			// 启动定时器，每分钟更新一次
			startTimer() {
				this.clearTimer(); // 先清除可能存在的定时器
				this.timer = setInterval(() => {
					// 强制更新视图，让按钮状态重新计算
					this.$forceUpdate();
				}, 60000); // 每分钟检查一次
			},
			// 清除定时器
			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			// 查看详情
			viewDetails(item) {
				let dataString = JSON.stringify(item);

				uni.navigateTo({
					url: `/pages/teacher/square/teachingInfo?data=` + encodeURIComponent(dataString)
				})
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
			// 取消上课
			orderCancel(item) {
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
					message =
						`距离上课还有${feeInfo.hoursBeforeClass}小时，取消课程将扣除${feeInfo.deductionPercentage}%的费用（${feeInfo.deductionAmount}元）。确认要取消吗？`;
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
				// 调用取消接口
				cancelClass(item.releaseId).then(response => {
					uni.hideLoading();

					if (response.code === 200) {
						// 根据扣费情况显示不同提示
						let refundMessage = '';
						if (feeInfo.deductionPercentage === 0) {
							refundMessage = '已成功取消，不扣除任何费用。';
						} else if (feeInfo.deductionPercentage === 100) {
							refundMessage = `已扣除全部费用${feeInfo.deductionAmount}元。`;
						} else {
							refundMessage =
								`已扣除${feeInfo.deductionAmount}元`;
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
						// 刷新列表
						this.getInfo(this.currentIndex + 1);
					} else {
						uni.showToast({
							title: response.msg || '取消失败',
							icon: 'none',
							duration: 2000
						});
					}
				})
			},
			// 去上课
			goToClass(item) {
				if (item.meetingUrl) {
					// 检查链接是否包含协议头
					let meetingUrl = item.meetingUrl;
					
					// 如果链接没有协议头，添加https://
					if (!meetingUrl.startsWith('http://') && !meetingUrl.startsWith('https://')) {
						meetingUrl = 'https://' + meetingUrl;
					}
					
					// 准备传递的参数
					const params = {
						url: meetingUrl,
						meetingCode: item.meetingCode || '',
						topicName: item.topicName || '腾讯会议'
					};
					
					// 使用uni-app的API跳转到外部链接
					uni.navigateTo({
						url: '/pages/webview/webview?params=' + encodeURIComponent(JSON.stringify(params))
					});
				} else {
					uni.showToast({
						title: '会议链接暂不可用',
						icon: 'none',
						duration: 2000
					});
				}
			},
			// 上传习题
			uploadExercises(item) {
				let params = {
					releaseId: item.releaseId,
					status: 1,
				}
				let dataString = JSON.stringify(params);
				uni.navigateTo({
					url: `/pages/work/test-questions/test-questions?data=` +
						encodeURIComponent(dataString)
				})
			},
			// 下课
			classOver(item) {
				overClass(item.releaseId).then(response => {
					if (response.code === 200) {
						uni.showToast({
							title: '已下课',
							icon: 'success',
							duration: 2000
						});
						setTimeout(() => {
							this.getInfo(this.currentIndex + 1);
						}, 1000);
					}
				})
			},
			transTime(val) {
				if (!val) {
					return
				}
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
			// 状态转码
			formatStatus(val) {
				if (val === '2') {
					return '已接单';
				} else if (val === '3') {
					return '已上完';
				}
			},
			// 在 methods 中添加
			shouldShowCancelBtn(item) {
			    // 课程未结束且不在上课时间段内
			    return item.releaseStatus !== '3' && this.isInClassTime(item);
			},
			// 学生反馈
			feedBack(item, type) {
				this.msgType = type
				this.$refs.alertDialog.open()
				let params = {
					releaseId: item.releaseId,
					status: '1'
				}
				getEvaluate(params).then(response => {
					if(response.code === 200) {
						if(response.data.content) {
							this.content = response.data.content;
						}
					}
				})
			},
			// 关闭学生反馈弹窗
			closeFeedBack() {
				this.$refs.alertDialog.close();
			},
			// 评价
			evaluate(item) {
				this.evaluateId = '';
				this.content = '';
				this.releaseId = item.releaseId;
				this.$refs.singleInput.open();
				let params = {
					releaseId: this.releaseId,
					status: '2'
				}
				getEvaluate(params).then(response => {
					if (response.code === 200) {
						if (response.data) {
							this.content = response.data.content;
							this.evaluateId = response.data.evaluateId;
						}
					}
				})
			},
			cancelSingleInput() {
				this.$refs.singleInput.close();
			},
			// 课程评价
			confirmSingleInput() {
				if (this.evaluateId) {
					let data = {
						evaluateId: this.evaluateId,
						releaseId: this.releaseId,
						content: this.content,
						status: '2'
					}
					console.log(data)
					updateEvaluate(data).then(response => {
						if (response.code === 200) {
							this.$refs.singleInput.close();
						}
					})
				} else {
					let data = {
						releaseId: this.releaseId,
						content: this.content,
						status: '2'
					}
					sendEvaluate(data).then(response => {
						if (response.code === 200) {
							this.$refs.singleInput.close();
						}
					})
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.teacher-square {
		position: relative;
		height: calc(100vh - 44px);

		.tab-bar {
			background-color: #fff;
			display: flex;
			border-bottom: 1px solid #eee;
			background-color: #f8f8f8;
			height: 45px;

			.tab-bar-control {
				width: 100%;
				margin: 5px;
			}
		}

		.tab-content {
			width: 100%;
			flex: 1;
			overflow: hidden;
			/* 改为 hidden */

			.scroll-view {
				height: 100%;
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
			}

			.content-btn {
				margin: 10px 0px 0px 0px;
				overflow: auto;

				.card-sub-btn {
					height: 32px;
					background-color: #1890ff;
					color: #fff;
					float: right;
					margin-left: 10px;
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
		}
	}

	.single-input-dialog {
		background: #fff;
		border-radius: 12rpx;
		padding: 40rpx;
		width: 600rpx;
	}

	.dialog-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		text-align: center;
	}

	.input-box {
		padding: 0 20rpx;
		margin-bottom: 40rpx;
	}

	.dialog-actions {
		display: flex;
		justify-content: space-between;
	}

    .action-cancel-close,
	.action-cancel,
	.action-confirm {
		flex: 1;
		text-align: center;
		height: 70rpx;
		line-height: 70rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
	}
	
	.action-cancel-close {
		background: #f8f8f8;
		color: #333;
	}

	.action-cancel {
		background: #f8f8f8;
		color: #333;
	}

	.action-confirm {
		background: #007aff;
		color: #fff;
	}
</style>