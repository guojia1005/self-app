<template>
	<view v-if="showTabBar" class="custom-tab-bar">
		<view class="tab-bar-content">
			<view v-for="(item, index) in tabBarList" :key="index" class="tab-item"
				:class="{ active: currentIndex === index }" @click="switchTab(item.pagePath, index)">
				<image :src="currentIndex === index ? item.selectedIconPath : item.iconPath" class="tab-icon"></image>
				<text class="tab-text">{{ item.text }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex'
	export default {
		name: "CustomTabBar",
		props: {
			currentPage: {
				type: String,
				default: '/pages/index'
			}
		},
		onLoad() {
			// 页面加载时隐藏
			this.hideNativeTabBar()
		},
		onShow() {
			// 每次显示时确保隐藏
			this.hideNativeTabBar()
		},
		data() {
			return {
				currentIndex: 0,
				showTabBar: true,
				tabBarList: [],
				data: [{
						text: '首页',
						pagePath: '/pages/index',
						iconPath: '/static/images/tabbar/home.png',
						selectedIconPath: '/static/images/tabbar/home_.png',
						roles: [2, 100]
					},
					{
						text: '学习',
						pagePath: '/pages/study/index',
						iconPath: "/static/images/tabbar/work.png",
						selectedIconPath: "/static/images/tabbar/work_.png",
						roles: [2]
					},
					{
						text: '广场',
						pagePath: '/pages/work/index',
						iconPath: "/static/images/tabbar/work.png",
						selectedIconPath: "/static/images/tabbar/work_.png",
						roles: [2, 100]
					},
					/* {
						text: '兑换',
						pagePath: '/pages/exchange/index',
						iconPath: "/static/images/tabbar/work.png",
						selectedIconPath: "/static/images/tabbar/work_.png",
						roles: [2]
					}, */
					{
						text: '我的',
						pagePath: '/pages/mine/index',
						iconPath: "/static/images/tabbar/mine.png",
						selectedIconPath: "/static/images/tabbar/mine_.png",
						roles: [2, 100]
					}
				]
			};
		},
		computed: {
			visibleTabs() {
				// 根据当前用户角色过滤显示的tab项
				const role = this.$store.state.user.roles;
				let filterData = this.data.filter(tab => tab.roles.includes(role));
				this.tabBarList = filterData;
				return filterData;
			},
		},
		watch: {
			currentPage: {
				handler(newVal, oldVal) {
					this.updateCurrentIndex(newVal);
				},
				immediate: true
			}
		},
		created() {
			uni.$on('tabBarChange', (show) => {
				this.showTabBar = show;
			});
		},
		destroyed() {
			uni.$off('tabBarChange')
		},
		methods: {
			hideNativeTabBar() {
				// 多次尝试策略
				const hideTabBar = () => {
					uni.hideTabBar({
						animation: false, // 禁用动画可能更可靠
						success: () => {
							console.log('页面内隐藏成功')
						},
						fail: () => {
							// 递归尝试，最多3次
							if (this.hideAttempts < 3) {
								this.hideAttempts++
								setTimeout(hideTabBar, 300)
							}
						}
					})
				}

				this.hideAttempts = 1
				setTimeout(hideTabBar, 50)
			},
			...mapMutations(['setCurrentPage', 'setCurrentIndex']),
			switchTab(pagePath, index) {
				if (this.$store.state.currentIndex !== index) {
					this.setCurrentIndex(index);
					uni.reLaunch({
						url: pagePath,
					})
					this.$emit('tab-click')
				}
			},
			updateCurrentIndex(newVal) {
				const items = this.visibleTabs;
				for (let i = 0; i < items.length; i++) {
					if (items[i].pagePath === newVal) {
						this.currentIndex = i;
						break;
					}
				}
			}
		}
	}
</script>

<style scoped>
	.custom-tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60px;
		background-color: #fff;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		z-index: 999;
	}

	.tab-bar-content {
		display: flex;
		justify-content: space-around;
		align-items: center;
		height: 100%;
		padding: 0 10px;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #999;
		font-size: 12px;
	}

	.tab-item.active {
		color: #007AFF;
	}

	.tab-icon {
		width: 24px;
		height: 24px;
		margin-bottom: 4px;
	}

	.tab-text {
		font-size: 12px;
	}
</style>