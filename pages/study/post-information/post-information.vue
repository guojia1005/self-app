<!-- 课前学生发布学习信息页面 -->
<template>
	<view class="post-study" @tap.stop>
		<view class="post-content">
			<uni-forms :modelValue="formData" label-width="140px" border>
				<uni-forms-item label="主题" name="topicName">
					<uni-easyinput type="text" v-model="formData.topicName" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="类型" name="subType">
					<uni-data-select v-model="formData.subType" placeholder="请选择"
						:localdata="subTypeOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择学科" name="stuSubject">
					<uni-data-select v-model="formData.stuSubject" placeholder="请选择" :border="true"
						:localdata="subjectOptions" @change="clickSubject"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择年级" name="stuGrade">
					<uni-data-select v-model="formData.stuGrade" placeholder="请选择" :border="true"
						:localdata="gradeOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择专题（单选）" name="featureOne" v-if="formData.subType === '1'">
					<uni-data-select v-model="formData.featureOne" placeholder="请选择" :border="true"
						:localdata="topicOptions" @change="clickTopic"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="二级专题（可多选）" name="featureTwo" v-if="formData.subType === '1'">
					<select-checkbox ref="selectCheckbox" v-model="formData.featureTwo" placeholder="请选择" collapse-tags
						:collapse-tags-num="2" :multiple="true" dataKey="text" dataValue="value"
						:localdata="secondTopicOptions" @change="changeFeaTwo" />
				</uni-forms-item>
				<uni-forms-item label="历史最高成绩" name="historyHighScore">
					<uni-easyinput type="number" v-model="formData.historyHighScore" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="历史最低成绩" name="historyLowScore">
					<uni-easyinput type="number" v-model="formData.historyLowScore" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="教师风格" name="hopeTeachStyle">
					<uni-data-select v-model="formData.hopeTeachStyle" placeholder="请选择" :border="true"
						:localdata="styleOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="期望教师性别" name="hopeTeachSex">
					<uni-data-select v-model="formData.hopeTeachSex" placeholder="请选择" :border="true"
						:localdata="sexOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="期望上课次数" name="hopeClassNumber">
					<uni-easyinput type="number" v-model="formData.hopeClassNumber" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="预约时间">
					<button type="primary" size="mini" @click="clickTime">选择时间</button>
					<view v-if="timeData.dayTime">
						{{ timeData.dayTime + ' ' + timeData.workStartTime + '-' + timeData.workEndTime}}
					</view>
				</uni-forms-item>
				<!-- 选择老师 -->
				<uni-forms-item label="选择老师" name="chooseTeacher" v-if="!hasPreSelectedTeacher">
					<tree-select-dropdown v-model="selectedResult" ref="treeSelect" :data="treeData" :max-tags="2"
						:disabled="!!flag" width="300px" @change="handleChange" @open="handleOpen"
						@close="handleClose" />
				</uni-forms-item>

				<!-- 显示已选老师（当有预选老师时） -->
				<uni-forms-item label="已选老师" name="selectedTeacherDisplay" v-if="hasPreSelectedTeacher">
					<uni-easyinput type="text" v-model="selectedTeacherDisplay" placeholder="暂无老师" disabled
						:readonly="true" :input-border="false">
					</uni-easyinput>
					<view class="teacher-tips" v-if="hasPreSelectedTeacher">
						<text class="tip-text">再次预约，不可更改老师</text>
					</view>
				</uni-forms-item>
				<uni-forms-item label="补充描述" name="desInfo">
					<uni-easyinput type="textarea" v-model="formData.desInfo" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="上传图片" name="imageList">
					<uni-file-picker ref="imgFiles" v-model="formData.imageList" :auto-upload="true"
						fileMediatype="image" @select="selectImg" @delete="deleteImg" />
				</uni-forms-item>
			</uni-forms>
			<view class="post-btn">
				<view class="post-btn-item">
					<button size="mini" @click="cancelForm">放弃发布</button>
				</view>
				<view class="post-subtn-item">
					<button size="mini" class="submit-btn" @click="submitForm">立即发布</button>
				</view>
			</view>
		</view>
		<!-- 普通弹窗 -->
		<uni-popup ref="popup" background-color="#fff" @change="changePop">
			<view class="popup-content" style="width: 100%;">
				<time-reservation ref="timePicker" />
			</view>
			<view class="tip-content">
				<view>
					*提示：请选择您方便上课的时段
				</view>
				<view class="pop-btn">
					<view class="pop-btn-content">
						<button size="mini" @click="timeCancel">取消</button>
					</view>
					<view class="pop-conbtn-content">
						<button size="mini" type="primary" @click="timeConfirm">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		getDictOption
	} from '@/utils/format';
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	import {
		upLoadImg
	} from "@/api/teacher/qualification.js";
	import {
		getToken
	} from "@/utils/auth";
	import {
		baseUrl
	} from "../../../config";
	import TimeReservation from "@/components/time-reservation/time-reservation.vue";
	import treeSelectDropdown from '../../../components/tree-select/tree-select-dropdown.vue';
	import {
		getTeacher,
		releaseInfo
	} from "@/api/study/postInformation.js";
	import selectCheckbox from '../../../components/select-checkbox/select-checkbox.vue';
	export default {
		name: 'PostStudy',
		components: {
			TimeReservation,
			treeSelectDropdown,
			selectCheckbox
		},
		onLoad(query) {
			this.flag = query.flag;
			this.teacherId = query.teacherId;
			this.teacherName = query.teacherName;
			// 如果有预选老师，初始化显示
			if (this.teacherId && this.teacherName) {
				this.handlePreSelectedTeacher();
			}
		},
		data() {
			return {
				formData: {
					imageList: [],
					hopeTeachSex: '2',
					featureTwo: [],
					featureTwoName: [],
					chooseTeacher: [],
				},
				subTypeOptions: [],
				subjectOptions: [],
				topicOptions: [],
				secondTopicOptions: [],
				gradeOptions: [],
				styleOptions: [],
				sexOptions: [],
				levelOptions: [],
				fileList: [],
				treeData: [],
				selectedResult: [],
				timeData: {
					dayTime: undefined,
					workStartTime: undefined,
					workEndTime: undefined,
				},
				// 判断是否再约
				flag: '',
				// 再约传递得老师id
				teacherId: '',
				// 新增：预选老师的显示名称
				selectedTeacherDisplay: '',
			}
		},
		computed: {
			// 新增：判断是否有预选老师
			hasPreSelectedTeacher() {
				return !!(this.teacherId && this.teacherName);
			}
		},
		watch: {
			// 监听 teacherId 变化
			teacherId: {
				immediate: true,
				handler(newVal) {
					if (newVal && this.teacherName) {
						// 处理预选老师
						this.handlePreSelectedTeacher();
					}
				}
			},
			// 监听 treeData 变化，数据加载后设置选中
			treeData: {
				immediate: true,
				handler(newVal) {
					if (newVal && newVal.length > 0 && this.teacherId && !this.hasPreSelectedTeacher) {
						this.$nextTick(() => {
							this.handleTeacherSelection();
						});
					}
				}
			}
		},
		created() {
			this.getDictData();
		},
		methods: {
			async getDictData() {
				// 类型
				this.subTypeOptions = await getDictOption(131);
				// 学科
				this.subjectOptions = await getDictOption(122);
				// 年级
				this.gradeOptions = await getDictOption(138);
				// 教师风格
				this.styleOptions = await getDictOption(145);
				// 性别
				this.sexOptions = await getDictOption(115);
				// 级别
				this.levelOptions = await getDictOption(150);
			},
			// 查询学科对应专题
			async clickSubject(val) {
				for (let i = 0; i < this.subjectOptions.length; i++) {
					if (val === this.subjectOptions[i].value) {
						this.topicOptions = await getDictOption(this.subjectOptions[i].code);
					}
				}
			},
			// 查询专题对应二级专题
			async clickTopic(val) {
				this.formData.featureTwo = [];
				this.$refs.selectCheckbox.clearVal();
				for (let i = 0; i < this.topicOptions.length; i++) {
					if (val === this.topicOptions[i].value) {
						this.secondTopicOptions = await getDictOption(this.topicOptions[i].code);
					}
				}
			},
			timeToString(timeStr) {
				// 将时间字符串分割为小时和分钟
				const [hours, minutes] = timeStr.split(':').map(Number);

				// 创建一个新的Date对象，设置为今天的日期加上指定时间
				const now = new Date();
				now.setHours(hours);
				now.setMinutes(minutes);
				now.setSeconds(0); // 可选，根据需要设置秒和毫秒
				now.setMilliseconds(0); // 可选，根据需要设置毫秒

				// 返回格式化的时间字符串
				return now.toLocaleTimeString(); // 或者使用其他格式化方法，例如toISOString()
			},
			// 处理预选老师
			handlePreSelectedTeacher() {
				// 设置显示的老师姓名
				this.selectedTeacherDisplay = this.teacherName;

				// 设置选中结果
				this.selectedResult = [this.teacherId];

				// 更新 formData.chooseTeacher
				this.formData.chooseTeacher = [{
					id: this.teacherId,
					name: this.teacherName,
					parentId: '' // 根据实际情况可能需要设置
				}];
			},

			// 清空预选老师（可选功能）
			clearPreSelectedTeacher() {
				uni.showModal({
					title: '提示',
					content: '确定要清空已选老师吗？',
					success: (res) => {
						if (res.confirm) {
							this.teacherId = '';
							this.teacherName = '';
							this.selectedTeacherDisplay = '';
							this.selectedResult = [];
							this.formData.chooseTeacher = [];
						}
					}
				});
			},
			// 修改 handleTeacherSelection 方法
			handleTeacherSelection() {

				// 如果有预选老师，不需要执行此方法
				if (this.hasPreSelectedTeacher) {
					return;
				}
                // 条件不满足，跳过老师选择设置
				if (!this.teacherId || !this.treeData || this.treeData.length === 0) {
					return;
				}

				// 检查老师是否存在于 treeData 中
				const teacherExists = this.findTeacherById(this.teacherId);

				// 老师存在于 treeData 中
				if (teacherExists) {
					// 设置 selectedResult
					this.selectedResult = [this.teacherId];

					// 更新 formData.chooseTeacher（用于显示）
					this.formData.chooseTeacher = [teacherExists];

					// 等待 DOM 更新后设置 tree-select 的值
					this.$nextTick(() => {
						if (this.$refs.treeSelect) {
							this.$refs.treeSelect.setValue([this.teacherId]);
						}
					});
				} else {
					// 如果老师不在当前 treeData 中，可能需要重新获取老师列表
				}
			},

			// 修改 handleChange 方法
			handleChange(selectedItems) {
                // 老师选择变化
				// 更新 selectedResult（ID 数组）
				this.selectedResult = selectedItems.map(item => item.id);

				// 更新 formData.chooseTeacher（完整对象数组）
				this.formData.chooseTeacher = selectedItems;
			},

			// 修改 getTeacherInfo 方法
			getTeacherInfo() {
				let data = {
					subType: this.formData.subType,
					stuSubject: this.formData.stuSubject,
					featureOne: this.formData.featureOne,
					hopeTeachStyle: this.formData.hopeTeachStyle,
					hopeTeachSex: this.formData.hopeTeachSex,
					slotDate: this.timeData.dayTime,
					startTime: this.timeData.workStartTime,
					endTime: this.timeData.workEndTime
				};

				getTeacher(data).then(response => {
					if (response.code === 200) {
						let teacherData = response.data;

						// 处理数据并检查指定的老师是否存在
						let levelA = {
							id: 'A',
							name: 'A级',
							children: []
						};
						let levelB = {
							id: 'B',
							name: 'B级',
							children: []
						};
						let levelC = {
							id: 'C',
							name: 'C级',
							children: []
						};

						let targetTeacherFound = false;

						for (let i = 0; i < teacherData.length; i++) {
							if (teacherData[i].children && teacherData[i].children.length > 0) {
								let teacher = teacherData[i].children[0];
								let list = {
									id: teacher.teacherId,
									name: teacher.teacherName,
									parentId: teacherData[i].ratingLevel
								};

								// 检查是否是目标老师
								if (this.teacherId && teacher.teacherId === this.teacherId) {
									targetTeacherFound = true;
								}

								if (teacherData[i].ratingLevel === 'A') {
									levelA.children.push(list);
								} else if (teacherData[i].ratingLevel === 'B') {
									levelB.children.push(list);
								} else if (teacherData[i].ratingLevel === 'C') {
									levelC.children.push(list);
								}
							}
						}

						// 构建 treeData
						this.treeData = [];
						if (levelA.children.length > 0) {
							levelA.children.forEach(child => child.parentId = levelA.id);
							this.treeData.push(levelA);
						}
						if (levelB.children.length > 0) {
							levelB.children.forEach(child => child.parentId = levelB.id);
							this.treeData.push(levelB);
						}
						if (levelC.children.length > 0) {
							levelC.children.forEach(child => child.parentId = levelC.id);
							this.treeData.push(levelC);
						}

						// 如果有 teacherId 并且老师在列表中，设置选中状态
						if (this.teacherId && targetTeacherFound) {
							this.$nextTick(() => {
								this.handleTeacherSelection();
							});
						}
					}
				}).catch(error => {
					console.error('获取老师信息异常:', error);
				});
			},
			// 上传图片
			selectImg(e) {
				const maxSize = 2 * 1024 * 1024; // 2MB
				const validFiles = e.tempFiles.filter(file => file.size <= maxSize);

				if (validFiles.length < e.tempFiles.length) {
					uni.showToast({
						title: '图片不能超过超过2MB',
						icon: 'none'
					});
					return
				}
				this.uploadImage(e.tempFiles, 1);
			},
			async uploadImage(file, type) {
				const tempFilePaths = file[0].url;
				uni.uploadFile({
					url: baseUrl + '/common/upload', // 替换为实际接口地址
					filePath: tempFilePaths,
					name: 'file',
					header: {
						Authorization: "Bearer " + getToken(),
					},
					success: (res) => {
						let list = {
							annexUrl: JSON.parse(res.data).url,
							annexType: type,
							annexName: JSON.parse(res.data).originalFilename,
							uuid: file.uuid
						}
						this.fileList.push(JSON.parse(res.data).url)
					},
					fail: function(err) {
						uni.showToast({
							title: '上传失败:' + err,
							icon: 'none'
						});
					},
				});
			},
			// 删除图片
			deleteImg(e) {
				this.fileList.splice(e.index, 1)
			},
			// 立即发布
			submitForm() {
				if (!this.formData.topicName) {
					uni.showToast({
						title: '请填写主题',
						icon: 'none'
					});
					return
				}
				if (!this.formData.subType) {
					uni.showToast({
						title: '请选择类型',
						icon: 'none'
					});
					return
				}
				if (!this.formData.stuSubject) {
					uni.showToast({
						title: '请选择学科',
						icon: 'none'
					});
					return
				}
				if (!this.formData.stuGrade) {
					uni.showToast({
						title: '请选择年级',
						icon: 'none'
					});
					return
				}
				if (this.formData.subType && !this.formData.featureOne) {
					uni.showToast({
						title: '请选择专题',
						icon: 'none'
					});
					return
				}
				if (this.formData.subType && !this.formData.featureTwo) {
					uni.showToast({
						title: '请选择二级专题',
						icon: 'none'
					});
					return
				}
				if (!this.formData.historyHighScore) {
					uni.showToast({
						title: '请输入最高成绩',
						icon: 'none'
					});
					return
				}
				if (!this.formData.historyLowScore) {
					uni.showToast({
						title: '请输入最低成绩',
						icon: 'none'
					});
					return
				}
				if (!this.timeData.workStartTime) {
					uni.showToast({
						title: '请选择上课时间',
						icon: 'none'
					});
					return
				}
				if (this.selectedResult.length < 0 || this.selectedResult.length === 0) {
					uni.showToast({
						title: '请选择教师',
						icon: 'none'
					});
					return
				}
				// 修改老师选择的验证
				if (this.selectedResult.length === 0) {
					uni.showToast({
						title: '请选择教师',
						icon: 'none'
					});
					return;
				}
				let data = {
					studentId: this.$store.state.user.id,
					studentName: this.$store.state.user.nickName,
					topicName: this.formData.topicName,
					subType: this.formData.subType,
					stuSubject: this.formData.stuSubject,
					stuGrade: this.formData.stuGrade,
					featureOne: this.formData.featureOne,
					featureTwo: (this.formData.featureTwo).join(','),
					featureTwoName: (this.formData.featureTwoName).join(','),
					historyHighScore: this.formData.historyHighScore,
					historyLowScore: this.formData.historyLowScore,
					chooseTeacher: this.selectedResult,
					// 如果有预选老师，可以额外记录老师姓名
					teacherName: this.teacherName || '',
					desInfo: this.formData.desInfo,
					hopeTeachStyle: this.formData.hopeTeachStyle,
					hopeTeachSex: this.formData.hopeTeachSex,
					hopeClassNumber: this.formData.hopeClassNumber,
					pictureUrl: (this.fileList).join(','),
					timePeriod: this.timeData.dayTime + ' ' + this.timeData.workStartTime + ' ' + this.timeData
						.workEndTime
				}
				releaseInfo(data).then(response => {
					if (response.code === 200) {
						this.reset();
						uni.showToast({
							title: '发布成功',
							icon: 'success',
							duration: 2000
						});
						setTimeout(() => {
							this.$emit('update-data');
						}, 1000);
					}
				});
			},
			// 放弃发布
			cancelForm() {
				if (this.flag) {
					uni.navigateBack({
						delta: 1, // 返回的页面数，默认是1
					});
				} else {
					setTimeout(() => {
						this.reset();
					}, 0);
				}
			},
			// 选择时间
			clickTime() {
				// 如果老师选择器是打开的，先关闭它
				if (this.$refs.treeSelect) {
					this.$refs.treeSelect.close()
				}
				this.$refs.popup.open('center')
			},
			// 弹窗操作
			changePop(e) {

			},
			// 取消选择时间
			timeCancel() {
				this.$refs.popup.close();
				this.timeData = {
					dayTime: undefined,
					workStartTime: undefined,
					workEndTime: undefined,
				};
			},
			// 确定选择时间
			timeConfirm() {
				this.$refs.popup.close();
				this.timeData = this.$refs.timePicker.chooseTime;
			},

			handleChange(selectedItems) {
				this.selectedResult = [];
				for (let i = 0; i < selectedItems.length; i++) {
					if (selectedItems[i].parentId) {
						this.selectedResult.push(selectedItems[i].id);
					}
				}
			},
			handleOpen() {
				if (!this.timeData.dayTime) {
					uni.showToast({
						title: '请先选择时间',
						icon: 'none'
					});
					return;
				}
				this.getTeacherInfo();
			},
			handleClose() {

			},
			changeFeaTwo(e) {
				this.formData.featureTwoName = [];
				for (let i = 0; i < e.length; i++) {
					this.formData.featureTwoName.push(e[i].text);
				}
			},
			// 重置页面
			reset() {
				this.formData.topicName = '';
				this.formData.subType = '';
				this.formData.stuSubject = '';
				this.formData.stuGrade = '';
				this.formData.featureOne = '';
				this.formData.featureTwo = [];
				this.formData.historyHighScore = '';
				this.formData.historyLowScore = '';
				this.formData.hopeTeachStyle = ''
				this.formData.hopeTeachSex = '2';
				this.formData.hopeClassNumber = '';
				this.timeData = {
					dayTime: undefined,
					workStartTime: undefined,
					workEndTime: undefined,
				};
				this.selectedResult = [];
				this.formData.desInfo = '';
				this.fileList = [];
				this.formData.imageList = [];
				this.formData.chooseTeacher = [];
				this.treeData = [];
				this.formData.featureTwoName = [];

				// 注意：不清空 teacherId 和 flag，因为它们是外部传入的
				// 清空 tree-select 的选中状态
				if (this.$refs.treeSelect) {
					this.$refs.treeSelect.clear();
				}
				// 如果有预选老师，不清空 teacherId 和 teacherName
				if (!this.hasPreSelectedTeacher) {
					this.teacherId = '';
					this.teacherName = '';
				}

				// 清空显示
				this.selectedTeacherDisplay = '';
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		background-color: #fff;
	}

	.post-study {
		background-color: #fff;
		height: 100%;

		.post-content {
			padding: 10px;
		}

		.post-btn {
			display: flex;
			padding: 0px 10px;

			.post-btn-item {
				flex: 1;

				.submit-btn {
					background-color: #1890ff;
					color: #fff;
					text-align: right;
				}
			}

			.post-btn-item:first-child {
				margin-right: 30px;
			}

			.post-subtn-item {
				flex: 1;
				text-align: right;

				.submit-btn {
					background-color: #1890ff;
					color: #fff;
					text-align: right;
				}
			}
		}

		::v-deep .uni-popup .uni-popup__wrapper[data-v-7c43d41b] {
			display: block;
			position: relative;
			width: 93%;
		}

		.popup-content {}

		.tip-content {
			padding: 0px 10px 10px 10px;
			color: red;
		}

		.pop-btn {
			display: flex;
			margin: 10px;

			.pop-btn-content {
				flex: 1;
				width: 80px;
			}

			.pop-conbtn-content {
				flex: 1;
				text-align: right;
			}
		}

		.container {
			min-height: 100vh;
			background-color: #f5f5f5;
			padding: 20rpx;
		}

		.header {
			text-align: center;
			padding: 40rpx 0;
		}

		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}

		.content {
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		}

		.section {
			margin-bottom: 50rpx;
		}

		.section-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}

		.result {
			margin-top: 20rpx;
			padding: 20rpx;
			background-color: #f0f8ff;
			border-radius: 10rpx;
			font-size: 24rpx;
			color: #666;
		}

		// 新增样式
		.teacher-actions {
			display: flex;
			align-items: center;
			padding: 0 8px;
		}

		.clear-icon {
			cursor: pointer;
			transition: color 0.3s;

			&:hover {
				color: #ff4d4f;
			}
		}

		.teacher-tips {
			margin-top: 4px;
		}

		.tip-text {
			font-size: 12px;
			color: #ff9900;
		}

		// 禁用状态下的输入框样式
		:deep(.uni-easyinput__content) {
			&.is-disabled {
				background-color: #f5f5f5;
				color: #666;
			}
		}
	}
</style>