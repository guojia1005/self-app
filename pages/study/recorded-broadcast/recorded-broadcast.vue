<!-- 录播课页面 -->
<template>
	<view class="recorded-broadcast">
		<uni-search-bar @confirm="search" :focus="true" v-model="searchValue" @blur="blur" @focus="focus" @input="input"
						@cancel="cancel" @clear="clear">
					</uni-search-bar>
	</view>
</template>

<script>
	export default {
		name: 'RecordedBroadcast',
		data() {
			return {
				searchValue: '',
			}
		},
		methods: {
			search() {
				
			},
			blur() {
				
			},
			focus() {
				
			},
			input() {
				
			},
			cancel() {
				
			},
			clear() {
				
			},
		}
	}
</script>

<style lang="scss" scoped>
.recorded-broadcast {
	background-color: #fff;
}
</style>