<template>
	<view class="mine-container" :style="{height: `${windowHeight}px`}">
		<!--顶部个人信息栏-->
		<view class="header-section">
			<view class="flex padding justify-between">
				<view class="flex align-center">
					<view v-if="!avatar" class="cu-avatar xl round bg-white">
						<view class="iconfont icon-people text-gray icon"></view>
					</view>
					<image v-if="avatar" @click="handleToAvatar" :src="avatar" class="user-avatar-round"
						mode="aspectFill">
					</image>
					<view v-if="!name" @click="handleToLogin" class="login-tip">
						点击登录
					</view>
					<view v-if="name" @click="handleToInfo" class="user-info">
						<view class="u_title">
							{{ name }}
						</view>
						<!-- 教师基本信息 -->
						<view v-if="this.$store.state.user.roles === 100">
							<view class="u_title">
								评级：A
							</view>
							<view class="u_title">
								R币余额：600
							</view>
							<view class="u_title">
								信用分：100
							</view>
						</view>
						<!-- 学生基本信息 -->
						<view v-else-if="this.$store.state.user.roles === 2">
							<view class="u_title">
								{{ age }} 岁
							</view>
							<view class="u_title">
								R币余额：600
							</view>
							<view class="u_title">
								信用分：100
							</view>
						</view>
					</view>
				</view>
				<view @click="handleToInfo" class="flex align-center">
					<view class="iconfont icon-right"></view>
				</view>
			</view>
		</view>

		<view class="content-section">
			<!-- 教师端我的功能 -->
			<view v-if="this.$store.state.user.roles === 100" class="menu-list">
				<view class="list-cell list-cell-arrow" @click="handleToQualificationInfo">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-user menu-icon"></view> -->
						<view>资质认证</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="depositPay">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-help menu-icon"></view> -->
						<view>押金缴纳（未缴纳押金部分功能不可使用）</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="withdrawR">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-aixin menu-icon"></view> -->
						<view>R币提现</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="applyRecord">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-setting menu-icon"></view> -->
						<view>提现申请记录</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="detailR">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-setting menu-icon"></view> -->
						<view>R币明细</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="handleToSetting">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-setting menu-icon"></view> -->
						<view>退出登录</view>
					</view>
				</view>
			</view>
			<!-- 学生端我的功能 -->
			<view v-if="this.$store.state.user.roles === 2" class="menu-list">
				<view class="list-cell list-cell-arrow" @click="basicTest">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-user menu-icon"></view> -->
						<view>基础知识点自测</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="collectExercises">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-help menu-icon"></view> -->
						<view>我收藏的习题</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="usageDetailR">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-aixin menu-icon"></view> -->
						<view>R币使用明细</view>
					</view>
				</view>
				<view class="list-cell list-cell-arrow" @click="handleToSetting">
					<view class="menu-item-box">
						<!-- <view class="iconfont icon-setting menu-icon"></view> -->
						<view>退出登录</view>
					</view>
				</view>
			</view>
		</view>
		<custom-tab-bar :current-page="currentPage" @tab-click="handleTabClick" />
	</view>
</template>

<script>
	import customTabBar from '@/components/customTabBar/customTabBar.vue';
	import {
		mapMutations
	} from 'vuex';
	import {
		getUserProfile
	} from "@/api/system/user"
	export default {
		components: {
			customTabBar
		},
		data() {
			return {
				/* name: this.$store.state.user.nickName,
				avatar: this.$store.state.user.avatar, */
				currentPage: '/pages/mine/index',
				avatar: '',
				name: '',
				age: '',
			}
		},
		onLoad() {
			// 隐藏原生tabBar
			if (getApp().globalData.hideOriginalTabBar) {
				uni.hideTabBar();
			}
			// 直接获取用户信息
			this.loadUserInfo();
		},
		onShow() {
			// 页面显示时也刷新一下
			this.loadUserInfo();
		},
		computed: {
			// 完整的头像URL
			fullAvatarUrl() {
				if (!this.avatar) return '';
				if (this.avatar.startsWith('http://') || this.avatar.startsWith('https://')) {
					return this.avatar;
				}
				return baseUrl + this.avatar;
			},
			windowHeight() {
				return uni.getSystemInfoSync().windowHeight - 50
			}
		},
		created() {

		},
		methods: {
			...mapMutations(['setCurrentPage', 'setCurrentIndex']),
			handleToInfo() {
				this.$tab.navigateTo('/pages/mine/info/edit')
			},
			/* 跳转资质认证页面 */
			handleToQualificationInfo() {
				this.$tab.navigateTo('/pages/teacher/mine/QualificationCertification')
			},
			handleToSetting() {
				this.$tab.navigateTo('/pages/mine/setting/index')
			},
			handleToLogin() {
				this.$tab.reLaunch('/pages/login')
			},
			handleToAvatar() {
				// this.$tab.navigateTo('/pages/mine/avatar/index')
			},
			handleHelp() {
				this.$tab.navigateTo('/pages/mine/help/index')
			},
			handleAbout() {
				this.$tab.navigateTo('/pages/mine/about/index')
			},
			handleTabClick(index) {
				// 更新currentPage状态
				this.setCurrentPage(this.currentPage);
			},
			// 押金缴纳
			depositPay() {

			},
			// R币提现
			withdrawR() {

			},
			// 提现申请记录
			applyRecord() {

			},
			// R币明细
			detailR() {

			},

			// 基础知识点自测
			basicTest() {

			},
			// 我收藏的习题
			collectExercises() {
				this.$tab.navigateTo('/pages/student/mine/my-collection/my-collection')
			},
			// R币使用明细
			usageDetailR() {

			},
			// 加载用户信息
			async loadUserInfo() {
				try {
					// 先尝试从Vuex获取
					const vuexName = this.$store.state.user.nickName || this.$store.state.user.name;
					const vuexAvatar = this.$store.state.user.avatar;
					const vuexAge = this.$store.state.user.age;

					if (vuexName) this.name = vuexName;
					if (vuexAvatar) this.avatar = vuexAvatar;
					if (vuexAge) this.age = vuexAge;

					// 如果有用户ID，从接口获取最新数据
					const userId = this.$store.state.user.id;
					if (userId) {
						const response = await getUserProfile(userId);
						if (response.code === 200 && response.data) {
							const userData = response.data;

							// 更新本地数据
							this.name = userData.nickName || this.name;
							this.avatar = userData.avatar || this.avatar;
							this.age = userData.age || this.age;

							// 保存到本地存储
							uni.setStorageSync('userName', this.name);
							uni.setStorageSync('userAvatar', this.avatar);
							uni.setStorageSync('userAge', this.age);
						}
					}
				} catch (error) {
					console.error('加载用户信息失败:', error);

					// 如果失败，尝试从本地存储读取
					const storedName = uni.getStorageSync('userName');
					const storedAvatar = uni.getStorageSync('userAvatar');
					const storedAge = uni.getStorageSync('userAge');

					if (storedName) this.name = storedName;
					if (storedAvatar) this.avatar = storedAvatar;
					if (storedAge) this.age = storedAge;
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		background-color: #f5f6f7;
	}

	.mine-container {
		width: 100%;
		height: 100%;


		.header-section {
			padding: 15px 15px 45px 15px;
			background-color: #3c96f3;
			color: white;

			.login-tip {
				font-size: 18px;
				margin-left: 10px;
			}

			.cu-avatar {
				border: 2px solid #eaeaea;

				.icon {
					font-size: 40px;
				}
			}

			.user-info {
				margin-left: 15px;

				.u_title {
					font-size: 18px;
					line-height: 30px;
				}
			}
		}

		/* 自定义圆形头像样式 */
		.user-avatar-round {
			width: 70px !important;
			height: 70px !important;
			border-radius: 50% !important;
			border: 2px solid #eaeaea;
			background-color: white;
			overflow: hidden;
			/* 确保图片完全适配圆形 */
			object-fit: cover;
		}

		.content-section {
			position: relative;
			top: -50px;

			.mine-actions {
				margin: 15px 15px;
				padding: 20px 0px;
				border-radius: 8px;
				background-color: white;

				.action-item {
					.icon {
						font-size: 28px;
					}

					.text {
						display: block;
						font-size: 13px;
						margin: 8px 0px;
					}
				}
			}
		}
	}
</style>