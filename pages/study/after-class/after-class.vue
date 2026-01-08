<!-- 课程 -->
<template>
	<view class="process-container">
		<!-- 使用 scroll-view 包裹内容 -->
		<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="refresherTriggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" :style="{ height: scrollViewHeight + 'px' }">
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
						<view>地点：{{ item.address }}</view>
						<view>授课教师：{{ item.teacher }}</view>
						<view class="class-btn">
							<button size="mini" class="class-sub-btn" @click="feedBack(item, 'info')">
								老师反馈</button>
							<button size="mini" class="class-sub-btn" @click="evaluate(item)">评价</button>
							<button size="mini" class="class-sub-btn" @click="meetAgain(item)">再约</button>
							<button size="mini" class="class-sub-btn" @click="afterTest(item)">课后测</button>
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
		<view>
			<!-- 提示窗示例 -->
			<uni-popup ref="alertDialog" type="dialog">
			     <view class="single-input-dialog">
			       <view class="dialog-title">老师反馈</view>
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
					<view class="dialog-title">请评价当前课程</view>
					<uni-easyinput v-model="content" type="textarea" class="input-box" placeholder="请输入..."
						:focus="true" />
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
		selectDict
	} from "@/api/system/dict/data.js";
	import {
		getReleaseInfo,
		cancelStudy,
		getHistory,
		sendEvaluate,
		getEvaluate,
		updateEvaluate
	} from '@/api/study/release.js';
	import {
		getMeetingInfo
	} from '@/api/tencent/meeting.js'; // 新增：获取会议信息接口
	import {
		dataFormat,
		getDictOption
	} from '@/utils/format.js'
	export default {
		name: 'AfterClass',
		data() {
			return {
				studyData: [],
				subTypeOptions: [],
				timer: null, // 定时器
				feeRules: { // 12306扣费规则配置（以小时为单位）
					// 时间区间（小时）：扣除百分比
					'360': 0, // 15天（360小时）以外：0%
					'48': 5, // 48小时-15天：5%
					'24': 10, // 24小时-48小时：10%
					'0': 20 // 24小时以内：20%
				},
				coursePrice: 100, // 课程单价，可根据实际情况调整或从接口获取
				loadingStates: {}, // 记录每个课程的加载状态
				isRefreshing: false, // 是否正在刷新
				refresherTriggered: false, // scroll-view 下拉刷新状态
				scrollViewHeight: 0, // scroll-view 高度
				loadMoreText: '', // 加载更多提示文字
				content: '', // 当前课程评价内容
				msgType: '', // 提示框类型
				releaseId: '',
				evaluateId: '',
			}
		},
		created() {
			this.getDictData();
		},
		mounted() {
			// 计算 scroll-view 高度
			this.calculateScrollViewHeight();

			// releaseStatus（1：课程，2:课后）
			this.getStudyData('2');
		},
		beforeDestroy() {

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
				for (let i = 0; i < this.subTypeOptions.length; i++) {
					if (e === this.subTypeOptions[i].value) {
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
						for (let i = 0; i < data.length; i++) {
							data[i].captureTime = (data[i].timePeriod).substring(0, 16);
							data[i].endTime = (data[i].timePeriod).substring(0, 10) + ' ' + (data[i].timePeriod)
								.substring(16, 22);
						}
						this.studyData = data;
					}

					// 停止刷新和加载
					this.stopRefresh();
					uni.hideLoading();
				}).catch(error => {
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

				// 重新获取数据
				this.getStudyData('2');
			},
			// scroll-view 刷新恢复
			onRestore() {
				console.log('刷新状态恢复');
			},
			// 停止刷新
			stopRefresh() {
				this.isRefreshing = false;
				this.refresherTriggered = false;

				// 停止页面下拉刷新动画
				if (typeof uni.stopPullDownRefresh === 'function') {
					uni.stopPullDownRefresh();
				}
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
			// 再约
			meetAgain(item) {
				getHistory(item.releaseId).then(response => {
					if (response.code === 200) {
						let dataString = JSON.stringify(response.data);
						uni.navigateTo({
							url: `/pages/study/post-information/post-information?data=` +
								encodeURIComponent(dataString)
						})
					}
				})
			},
			// 课后测
			afterTest(item) {
				let params = {
					releaseId: item.releaseId,
					status: 1,
				}
				let dataString = JSON.stringify(params);
				uni.navigateTo({
					url: `/pages/work/test-questions/test-questions?data=` + encodeURIComponent(dataString)
				})
			},
			// 评价
			evaluate(item) {
				this.evaluateId = '';
				this.content = '';
				this.releaseId = item.releaseId;
				this.$refs.singleInput.open();
				let params = {
					releaseId: this.releaseId,
					status: '1'
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
						status: '1'
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
						status: '1'
					}
					sendEvaluate(data).then(response => {
						if (response.code === 200) {
							this.$refs.singleInput.close();
						}
					})
				}
			},
			// 老师反馈
			feedBack(item, type) {
				this.msgType = type
				this.$refs.alertDialog.open()
				let params = {
					releaseId: item.releaseId,
					status: '2'
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
		margin-right: 120rpx;
	}

	.action-confirm {
		background: #007aff;
		color: #fff;
	}
</style>