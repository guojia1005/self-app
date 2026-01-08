<template>
	<view class="study-container">
		<view class="tab-bar">
			<uni-segmented-control :current="currentTypeIndex" :values="itemsTitle" @clickItem="onClickTitle" styleType="button"
				activeColor="#007aff" class="tab-bar-control"></uni-segmented-control>
		</view>
		<view v-if="currentTypeIndex === 0">
			<view class="tab-bar">
				<!-- 将 styleType 改为 "text" -->
				<uni-segmented-control :current="currentIndex" :values="items" @clickItem="onClickItem" styleType="text"
					activeColor="#007aff" class="tab-bar-control text-tabs"></uni-segmented-control>
			</view>
			<view class="tab-content">
				<view v-if="currentIndex === 0">
					<PostStudy @update-data="changeIndex"></PostStudy>
				</view>
				<view v-else-if="currentIndex === 1">
					<StudyProcress></StudyProcress>
				</view>
				<view v-else-if="currentIndex === 2">
					<AfterClass></AfterClass>
				</view>
			</view>
		</view>
		<view v-if="currentTypeIndex === 1">
			<RecordedBroadcast></RecordedBroadcast>
		</view>
		<custom-tab-bar :current-page="currentPage" @tab-click="handleTabClick" />
	</view>
</template>

<script>
	import customTabBar from '@/components/customTabBar/customTabBar.vue';
	import { mapMutations } from 'vuex';
	import PostStudy from './post-information/post-information.vue';
	import StudyProcress from './study-process/study-process.vue';
	import AfterClass from './after-class/after-class.vue'
	import RecordedBroadcast from './recorded-broadcast/recorded-broadcast.vue'
	export default {
		components: {
			customTabBar,
			PostStudy,
			StudyProcress,
			AfterClass,
			RecordedBroadcast
		},
		data() {
			return {
				currentPage: '/pages/study/index',
				currentTypeIndex: 0, // 直播录播
				currentIndex: 0,
				itemsTitle: ['直播', '录播'],
				items: ['课前', '课程', '课后'],
			}
		},
		onLoad(query) {
			// 隐藏原生tabBar
			if (getApp().globalData.hideOriginalTabBar) {
				uni.hideTabBar();
			}
			if (!!query.flag) {
				this.changeIndex(query.flag);
			}
		},
		created() {
			
		},
		mounted() {
			
		},
		methods: {
			 ...mapMutations(['setCurrentPage', 'setCurrentIndex']),
			// 查看详情
			viewDetail() {
				uni.navigateTo({
				  url: '/pages/study/post-information/post-information',
				});
			},
			handleTabClick(index) {
				this.setCurrentPage(this.currentPage);
			},
			// 切换直播录播
			onClickTitle(e) {
				this.currentTypeIndex = e.currentIndex;
			},
			// 切换tab页
			onClickItem(e) {
				this.currentIndex = e.currentIndex;
			},
			changeIndex(val) {
				this.currentTypeIndex = 0;
				this.currentIndex = 1
			},
		}
	}
</script>

<style lang="scss" scoped>
	.study-container {
		position: relative;
		//height: calc(100vh - 44px);

		.tab-bar {
			display: flex;
			border-bottom: 1px solid #eee;
			background-color: #fff; /* 将背景色改为白色 */
			height: 45px;

			.tab-bar-control {
				width: 100%;
				margin: 5px;
			}

			// 为文字标签添加样式
			.text-tabs {
				background-color: #fff; /* 确保文字标签背景也为白色 */
				
				::v-deep .uni-segmented-control__item {
					// 文字样式，去掉按钮背景
					background-color: transparent;
					border: none;
					font-weight: normal;
					transition: color 0.3s;
					
					&.uni-segmented-control__item--active {
						color: #007aff;
						font-weight: bold;
						// 可选：添加下划线表示激活状态
						position: relative;
						&::after {
							content: '';
							position: absolute;
							bottom: 0;
							left: 50%;
							transform: translateX(-50%);
							width: 60%;
							height: 3px;
							background-color: #007aff;
							border-radius: 2px;
						}
					}
				}
			}
		}

		.tab-content {
			width: 100%;
			flex: 1;
			overflow-y: auto;
			height: calc(100vh - 194px);

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
					margin-left: 20px;
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
		}

		.icon-btn {
			width: 100%;
			position: fixed;
			bottom: 70px;
			/* 距离底部20px */
			left: 45.5%;
			cursor: pointer;
			z-index: 1000;
			/* 确保按钮在内容上方 */
		}

		.uni-icons {
			border: 1px solid #000;
			border-radius: 50%;
		}
	}
</style>