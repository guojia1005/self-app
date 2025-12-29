<template>
	<view class="study-container">
		<view class="tab-bar">
			<uni-segmented-control :current="currentIndex" :values="items" @clickItem="onClickItem" styleType="button"
				activeColor="#007aff" class="tab-bar-control"></uni-segmented-control>
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
		<custom-tab-bar :current-page="currentPage" @tab-click="handleTabClick" />
	</view>
</template>

<script>
	import customTabBar from '@/components/customTabBar/customTabBar.vue';
	import { mapMutations } from 'vuex';
	import PostStudy from './post-information/post-information.vue';
	import StudyProcress from './study-process/study-process.vue';
	import AfterClass from './after-class/after-class.vue'
	export default {
		components: {
			customTabBar,
			PostStudy,
			StudyProcress,
			AfterClass
		},
		data() {
			return {
				currentPage: '/pages/study/index',
				currentIndex: 0,
				items: ['课前', '课程', '课后'],
			}
		},
		onLoad() {
			// 隐藏原生tabBar
			if (getApp().globalData.hideOriginalTabBar) {
				uni.hideTabBar();
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
			// 切换tab页
			onClickItem(e) {
				this.currentIndex = e.currentIndex;
			},
			changeIndex() {
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
			overflow-y: auto;
			height: calc(100vh - 149px);

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