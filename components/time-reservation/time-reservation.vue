<template>
	<view class="booking-time-picker">
		<!-- 日期Tab -->
		<scroll-view class="date-tabs" scroll-x>
			<view v-for="(date, index) in dateList" :key="index" class="date-tab"
				:class="{ active: currentTabIndex === index }" @click="switchTab(index)">
				<text class="day">{{ date.month }}{{ date.day }}</text>
			</view>
		</scroll-view>

		<!-- 时间段选择 -->
		<view class="time-section">
			<!-- 时间列表 -->
			<view class="time-list">
				<view v-for="(time, index) in currentTimeSlots" :key="index" class="time-item"
					:class="{ 
						selected: time.selected, 
						disabled: time.disabled 
					}" 
					@click="!time.disabled && toggleTimeSlot(index, time)">
					<text class="time-text">{{ time.workStartTime }} - {{ time.workEndTime }}</text>
					<text v-if="time.disabled" class="disabled-text">(已过)</text>
				</view>
			</view>
			<!-- <view class="select-btn">
				<button type="primary" size="mini" @click="toggleSelectAll">全选</button>
			</view> -->
		</view>
	</view>
</template>

<script>
	import {
		getTime
	} from "@/api/study/postInformation.js";
	export default {
		name: "TimeReservation",
		data() {
			return {
				currentTabIndex: 0,
				dateList: [],
				timeSlots: [],
				selectTime: [],
				chooseTime: {},
				currentTime: new Date() // 当前时间
			};
		},
		computed: {
			currentTimeSlots() {
				return this.timeSlots[this.currentTabIndex] || [];
			},
			isAllSelected() {
				const slots = this.currentTimeSlots;
				return slots.length > 0 && slots.every(slot => slot.selected);
			}
		},
		created() {
			this.initData();
			// 每60秒更新一次当前时间，确保时间判断准确
			this.timer = setInterval(() => {
				this.currentTime = new Date();
				this.updateDisabledStatus();
			}, 60000);
		},
		beforeDestroy() {
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		methods: {
			initData() {
				// 生成未来4天的日期
				const dates = [];
				const slots = [];
				let timeList = []

				getTime().then(response => {
					if (response.code === 200) {
						let data = response.data;

						for (let i = 0; i < 4; i++) {
							const date = new Date();
							date.setDate(date.getDate() + i);

							let dayTime = `${date.getFullYear()}-` + `${date.getMonth() + 1}-` + date.getDate()
							dates.push({
								day: date.getDate(),
								month: `${date.getMonth() + 1}-`,
								year: `${date.getFullYear()}-`,
								dayTime: dayTime
							});
                            
							// 为每一天生成时间段
							let daySlots = [];

							for (let j = 0; j < data.length; j++) {
								// 深拷贝对象，避免引用问题
								const timeSlot = {
									...data[j],
									selected: false,
									dayTime: dayTime,
									startTime: dayTime + ' ' + data[j].workStartTime,
									endTime: dayTime + ' ' + data[j].workEndTime,
									disabled: false // 新增禁用状态
								};
								
								// 判断时间段是否已过
								this.checkTimeSlotDisabled(timeSlot, i);
								
								daySlots.push(timeSlot);
							}
							slots.push(daySlots);
						}

						this.dateList = dates;
						this.timeSlots = slots;
					}
				})
			},

			// 检查时间段是否已过并设置禁用状态
			checkTimeSlotDisabled(timeSlot, dayIndex) {
				// 如果不是今天（dayIndex === 0），则不处理
				if (dayIndex !== 0) return;
				
				try {
					// 解析开始时间
					const [year, month, day] = timeSlot.dayTime.split('-').map(Number);
					const [hours, minutes] = timeSlot.workStartTime.split(':').map(Number);
					
					// 创建时间段开始时间
					const slotStartTime = new Date(year, month - 1, day, hours, minutes);
					
					// 获取当前时间
					const now = this.currentTime;
					
					// 如果开始时间在当前时间之前，则已过
					if (slotStartTime < now) {
						timeSlot.disabled = true;
					} else {
						timeSlot.disabled = false;
					}
				} catch (error) {
					console.error('时间解析错误:', error);
					timeSlot.disabled = false;
				}
			},

			// 更新所有时间段的禁用状态
			updateDisabledStatus() {
				// 只更新今天（索引0）的时间段
				if (this.timeSlots.length > 0 && this.timeSlots[0]) {
					const todaySlots = this.timeSlots[0];
					const now = this.currentTime;
					const today = new Date();
					const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
					
					todaySlots.forEach(slot => {
						try {
							// 解析开始时间
							const [year, month, day] = slot.dayTime.split('-').map(Number);
							const [hours, minutes] = slot.workStartTime.split(':').map(Number);
							
							// 创建时间段开始时间
							const slotStartTime = new Date(year, month - 1, day, hours, minutes);
							
							// 如果开始时间在当前时间之前，则已过
							if (slotStartTime < now) {
								slot.disabled = true;
								// 如果当前选中了已过的时间段，取消选中
								if (slot.selected) {
									slot.selected = false;
								}
							} else {
								slot.disabled = false;
							}
						} catch (error) {
							console.error('时间解析错误:', error);
						}
					});
					
					// 强制更新视图
					this.$forceUpdate();
				}
			},

			switchTab(index) {
				this.currentTabIndex = index;
				for(let i = 0; i < this.currentTimeSlots.length; i++) {
					this.currentTimeSlots[i].selected = false;
				}
			},

			toggleTimeSlot(index, time) {
				// 如果时间段已禁用，不执行操作
				if (time.disabled) return;
				
				const slots = this.timeSlots[this.currentTabIndex];
				const idx = slots.findIndex(item => item === time);
				if (idx !== -1) {
					// 先将所有元素的 selected 设置为 false，然后再设置目标项的 selected 为 true
					slots.forEach(item => item.selected = false);
					slots[idx].selected = true;
				}
				this.$forceUpdate();
				for(let i = 0; i < this.dateList.length; i++) {
					if(i === this.currentTabIndex) {
						time.dayTime = this.dateList[i].dayTime;
					}
				}
				this.chooseTime = time;
			},

			toggleSelectAll() {
				const slots = this.timeSlots[this.currentTabIndex];
				const allSelected = this.isAllSelected;

				slots.forEach(slot => {
					// 只操作未禁用的时间段
					if (!slot.disabled) {
						slot.selected = !allSelected;
					}
				});

				this.$forceUpdate();
			},

			// 获取选中的时间（只返回未禁用的时间段）
			getSelectedTimes() {
				const result = [];
				this.timeSlots.forEach((daySlots, dayIndex) => {
					// 只筛选未禁用且选中的时间段
					const selected = daySlots.filter(slot => slot.selected && !slot.disabled);
					if (selected.length > 0) {
						result.push({
							date: this.formatDate(new Date(new Date().setDate(new Date().getDate() + dayIndex))),
							times: selected.map(slot => ({
								start: slot.startTime,
								end: slot.endTime,
								workStartTime: slot.workStartTime,
								workEndTime: slot.workEndTime
							}))
						});
					}
				});
				return result;
			},

			formatDate(date) {
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			}
		}
	};
</script>

<style scoped>
	.booking-time-picker {
		background: #fff;
		border-radius: 12px;
		padding: 10px;
		width: 100%;
	}

	::v-deep .uni-scroll-view-content {
		display: flex;
		width: 100%;
	}

	.date-tabs {
		display: flex;
		padding-bottom: 15px;
		border-bottom: 1px solid #f0f0f0;
		white-space: nowrap;
	}

	.date-tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
		margin-right: 10px;
		border-radius: 10px;
		background: #f8f9fa;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.date-tab.active {
		background: #1890ff;
		color: white;
	}

	.date-tab .day {
		font-size: 16px;
		font-weight: bold;
		margin: 5px 0;
	}

	.time-section {
		margin-top: 20px;
	}

	.time-list {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 15px;
	}

	.time-item {
		padding: 10px 2px;
		text-align: center;
		background: #f8f9fa;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		border: 2px solid #f8f9fa;
		position: relative;
	}

	.time-item:hover:not(.disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.time-item.selected {
		background: #1890ff;
		color: white;
		border-color: #1890ff;
	}

	.time-item.disabled {
		background: #f5f5f5;
		color: #999;
		border-color: #e8e8e8;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.time-text {
		font-size: 14px;
		font-weight: 500;
		display: block;
	}

	.disabled-text {
		font-size: 12px;
		color: #ff4d4f;
		display: block;
		margin-top: 2px;
	}

	.select-btn {
		margin: 10px 0px 0px 0px;
	}
</style>