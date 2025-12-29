<template>
	<view class="work-container">
		<student-square v-if="this.$store.state.user.roles === 2"></student-square>
		<teacher-square v-else-if="this.$store.state.user.roles === 100"></teacher-square>
		<custom-tab-bar :current-page="currentPage" @tab-click="handleTabClick" />
	</view>
</template>

<script>
	import customTabBar from '@/components/customTabBar/customTabBar.vue';
	import StudentSquare from '../student/square/index.vue';
	import TeacherSquare from '../teacher/square/index.vue'
	import { mapMutations } from 'vuex'
	export default {
		components: {
			customTabBar,
			StudentSquare,
			TeacherSquare
		},
		data() {
			return {
				currentPage: '/pages/work/index',
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
				this.setCurrentPage(this.currentPage);
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	.page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}
	/*  #endif  */
</style>