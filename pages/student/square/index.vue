<!-- 学生广场首页 -->
<template>
	<view class="student-square">
		<view class="tab-bar">
			<uni-segmented-control :current="currentIndex" :values="items" @clickItem="onClickItem" styleType="button"
				activeColor="#007aff" class="tab-bar-control"></uni-segmented-control>
		</view>
		<view class="tab-content">
			<view v-if="currentIndex === 1">
				<view class="icon-btn" @click="addCourse">
					<uni-icons type="plusempty" size="30"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'StudentSquare',
		data() {
			return {
				currentIndex: 0,
				items: ['发现', '我的发布', '我已加入'],
			};
		},
		methods: {
			onClickItem(e) {
				if (this.currentIndex !== e.currentIndex) {
					this.currentIndex = e.currentIndex
				}
			},
			// 点击发布
			addCourse() {
				uni.navigateTo({
				  url: '/pages/student/square/post-information/index',
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.student-square {
		.tab-bar {
			display: flex;
			border-bottom: 1px solid #eee;
			background-color: #f8f8f8;
			
			.tab-bar-control {
				width: 100%;
				margin: 5px;
			}
		}

		.tab-content {
			flex: 1;
			overflow-y: auto;
			padding: 20px;
		}
			
		.icon-btn {
			width: 100%;
		    text-align: center;
		}
		
		.uni-icons {
		    border: 1px solid #000;
		    border-radius: 50%;
		}
	}
</style>