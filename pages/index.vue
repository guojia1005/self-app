<template>
  <view class="content">
    <!-- <image class="logo" src="@/static/logo.png"></image>
    <view class="text-area">
      <text class="title">Hello RuoYi</text>
    </view> -->
	<custom-tab-bar :current-page="currentPage" />
  </view>
</template>
<script>
	import customTabBar from '@/components/customTabBar/customTabBar.vue';
	import { mapMutations } from 'vuex';
	
	export default {
		components: {
			customTabBar
		},
		data() {
			return {
				userRole: 2,
				showTabBar: true,
				currentPage: '/pages/index',
				roleName: '学生'
			};
		},
		onLoad() {
			this.userRole = this.$store.state.user.roles;
			this.showTabBar = getApp().globalData.showCustomTabBar;
			this.roleName = this.userRole === 100 ? '教师' : '学生';
			// 隐藏原生tabBar
			if (getApp().globalData.hideOriginalTabBar) {
				uni.hideTabBar();
			}
		},
		created() {
			
		},
		methods: {
			...mapMutations(['setCurrentPage', 'setCurrentIndex']),
			switchRole() {
				const newRole = this.userRole === 100 ? 'teacher' : 'teacher';
				getApp().globalData.userRole = newRole;
				this.userRole = newRole;
				this.roleName = newRole === 100 ? '教师' : '学生';
				
				uni.showToast({
					title: `已切换为${this.roleName}身份`,
					icon: 'none'
				});
			},
			toggleTabBar() {
				this.showTabBar = !this.showTabBar;
				getApp().globalData.showCustomTabBar = this.showTabBar;
				
				uni.showToast({
					title: this.showTabBar ? '导航栏已显示' : '导航栏已隐藏',
					icon: 'none'
				});
			},
			handleTabClick(index) {
			  //this.$store.dispatch('updateCurrentPage', index); // 更新currentPage状态
					this.setCurrentPage(this.currentPage);
			}
		}
	}
</script>

<style scoped>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
  }

  .text-area {
    display: flex;
    justify-content: center;
  }

  .title {
    font-size: 36rpx;
    color: #8f8f94;
  }
</style>
