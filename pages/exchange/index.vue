<template>
	<view>
		
		<custom-tab-bar :current-page="currentPage" @tab-click="handleTabClick" />
	</view>
</template>

<script>
	import customTabBar from '@/components/customTabBar/customTabBar.vue';
	import { mapMutations } from 'vuex'
	export default {
		components: {
			customTabBar
		},
		data() {
			return {
				currentPage: '/pages/exchange/index',
			}
		},
		onLoad() {
			// 隐藏原生tabBar
			if (getApp().globalData.hideOriginalTabBar) {
				uni.hideTabBar();
			}
		},
		methods: {	
			 ...mapMutations(['setCurrentPage', 'setCurrentIndex']),
			handleTabClick(index) {
			  //this.$store.dispatch('updateCurrentPage', index); // 更新currentPage状态
					this.setCurrentPage(this.currentPage);
			}
		}
	}
</script>

<style>

</style>