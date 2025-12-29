<!-- 资质上传 -->
<template>
	<view class="qualification-container">
		<view class="qualification-example">
			<uni-forms ref="form" :model="form" labelWidth="10px">
				<uni-forms-item label="学科（可多选）" labelWidth="140px">
				</uni-forms-item>
				<uni-forms-item label="" name="subjects">
					<uni-data-checkbox multiple v-model="form.subjects" :localdata="subjectOptions"
						@change="changeSubject" />
				</uni-forms-item>
				<uni-forms-item label="负责方向（可多选）" labelWidth="140px">
				</uni-forms-item>
				<uni-forms-item label="" name="typeDirections">
					<uni-data-checkbox multiple v-model="form.typeDirections" :localdata="directionOptions" />
				</uni-forms-item>
				<uni-forms-item label="负责专题（可多选）" labelWidth="140px">
				</uni-forms-item>
				<uni-forms-item label="" name="topics">
					<uni-data-checkbox multiple v-model="form.topics" :localdata="topicOptions" @change="changeTopic" />
				</uni-forms-item>
				<uni-forms-item label="教师风格" labelWidth="80px">
					<uni-data-select v-model="form.teachingStyle" placeholder="请选择"
					:localdata="styleOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="请上传相关证书图片" labelWidth="140px">
				</uni-forms-item>
				<uni-forms-item label="" name="discipline" class="show-pic" labelWidth="0px">
					<view class="example-body">
						<uni-file-picker ref="imgFiles" v-model="imageList" :auto-upload="true" fileMediatype="image"
							@select="selectImg" @delete="deleteImg" file-extname="png,jpg,jpeg" />
					</view>
				</uni-forms-item>
				<uni-forms-item label="请上传讲课视频" labelWidth="140px">
				</uni-forms-item>
				<uni-forms-item label="" name="discipline" class="show-video" labelWidth="0px">
					<view class="example-body">
						<uni-file-picker ref="videoFiles" v-model="videoList" :auto-upload="true" fileMediatype="video"
							@select="selectVideo" @delete="deleteImg" />
					</view>
				</uni-forms-item>
				<view class="teacher-tip">*至少包含一个讲课视频，否则认证可能无法通过！</view>
				<view class="teacher-tip">*再次上传将重新认证，可能造成评级变化，请谨慎操作！</view>
			</uni-forms>
			<button type="primary" @click="submit">确认提交</button>
		</view>
	</view>
</template>

<script>
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	import {
		dataFormat,
		getDictOption,
		mergeAndDeduplicate,
		convertImageToBase64
	} from '@/utils/format';
	import {
		addQualification
	} from "@/api/teacher/qualification.js";
	import {
		getToken
	} from "@/utils/auth";
	import {
		baseUrl
	} from "../../../config";
	export default {
		name: "Teacher",
		components: {
			
		},
		data() {
			return {
				form: {
					subjects: [],
					typeDirections: [],
					topics: [],
				},
				imageList: [],
				videoList: [],
				// 学科
				subjectOptions: [],
				// 方向数据
				directionOptions: [],
				// 专题数据
				topicOptions: [],
				transferDirection: [],
				fileList: [],
				topicName: [],
				// 教师风格数据
				styleOptions: [],
			}
		},
		created() {
			this.topicOptions = [];
			this.transferDirection = [];
			this.getDictData();
			console.log(this.$store.state.user.id)
		},
		methods: {
			async getDictData() {
				// 类型
				this.directionOptions = await getDictOption(131);
				// 学科
				this.subjectOptions = await getDictOption(122);
				// 教师风格
				this.styleOptions = await getDictOption(145);
			},
			// 选择学科查询对应专题
			changeSubject(e) {
				let data = []
				this.topicOptions = [];
				for (let i = 0; i < e.detail.data.length; i++) {
					data.push(e.detail.data[i].code);
				}
				this.selectTopic(data);
			},
			// 查询专题
			selectTopic(val) {
				for (let i = 0; i < val.length; i++) {
					selectDict(val[i]).then(response => {
						if (response.code === 200) {
							let data = dataFormat(response.data, 'dict');
							this.topicOptions = mergeAndDeduplicate(this.topicOptions, data);
						}
					})
				}
			},
			changeTopic(e) {
				this.topicName = [];
				let data = e.detail.data;
				for(let i = 0; i < data.length; i++) {
					if(i < data.length - 1) {
						this.topicName += data[i].text + "、"
					} else {
						this.topicName += data[i].text
					}
				}
			},
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
			
			deleteImg(e) {
				for(let i = 0; i < this.fileList.length; i++) {
					if(this.fileList[i].uuid == e.tempFile.uuid) {
						this.fileList.splice(i, 1);
					}
				}
			},

			selectVideo(e) {
				const file = e.tempFiles[0];
				if (!file) return;

				// 验证文件类型
				if (file.fileType !== 'video' || !file.name.endsWith('.mp4')) {
					uni.showToast({
						title: '请选择MP4格式视频',
						icon: 'none'
					});
					return;
				}

				// 验证文件大小 (500MB)
				if (file.size > 500 * 1024 * 1024) {
					uni.showToast({
						title: '视频大小不能超过500MB',
						icon: 'none'
					});
					return;
				}
				this.uploadImage(e.tempFiles, 2);
			},
			async uploadImage(file, type) {
				console.log(file)
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
							annexType: type,
							annexName: JSON.parse(res.data).originalFilename,
							annexUrl: JSON.parse(res.data).url,
							uuid: file.uuid
						}
						this.fileList.push(list)

					},
					fail: function(err) {
						uni.showToast({
							title: '上传失败:' + err,
							icon: 'none'
						});
					},
				});
			},
			// 资质上传提交
			submit() {
				if(this.form.subjects.length == 0 || this.form.subjects.length < 0) {
					uni.showToast({
						title: '请选择学科',
						icon: 'none'
					});
					return
				}
				if(this.form.typeDirections.length == 0 || this.form.typeDirections.length < 0) {
					uni.showToast({
						title: '请选择负责方向',
						icon: 'none'
					});
					return
				}
				if(this.form.topics.length == 0 || this.form.topics.length < 0) {
					uni.showToast({
						title: '请选择负责专题',
						icon: 'none'
					});
					return
				}
				if(!this.form.teachingStyle) {
					uni.showToast({
						title: '请选择教师风格',
						icon: 'none'
					});
					return
				}
				let videoList = [];
				for(let i = 0; i < this.fileList.length; i++) {
					if(this.fileList[i].annexType === 2) {
						videoList.push(this.fileList[i])
					}
				}
				if(videoList.length == 0 || videoList.length < 0) {
					uni.showToast({
						title: '请上传至少一个讲课视频',
						icon: 'none'
					});
					return
				}
				let data = {
					teacherId: this.$store.state.user.id,
					teacherName: this.$store.state.user.name,
					subjects: this.form.subjects,
					topics: this.form.topics,
					topicName: JSON.stringify(this.topicName),
					typeDirections: this.form.typeDirections,
					attachments: this.fileList,
					teachingStyle: this.form.teachingStyle
				}
				addQualification(data).then(res => {
					if(res.code === 200) {
						uni.showToast({
							title: '上传成功',
							icon: 'success',
							 duration: 2000
						});
						 setTimeout(() => {
						    uni.navigateBack({
						      delta: 1 // 返回的页面数，这里设置为1表示返回上一页
						    });
						  }, 1000);
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.qualification-container {
		padding: 10px;
		background-color: #fff;

		.qualification-example {
			.show-pic {
				display: flex;
			}
		}

		.form-qualification {
			.uni-btn-v {}
		}

		.uni-forms-item {
			position: relative;
			display: flex;
			margin-bottom: 0px;
			flex-direction: row;
		}

		.add-button {
			width: 100%;
			height: 180rpx;
			border: 2rpx dashed #dcdcdc;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f8f8f8;
			cursor: pointer;
		}

		.add-icon {
			width: 60rpx;
			height: 60rpx;
		}

		.teacher-tip {
			color: red;
			margin: 5px 0px;
		}
	}

	.container {
		padding: 20rpx;
	}

	.header {
		margin-bottom: 40rpx;
	}

	.title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
	}

	.control-panel {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx;
	}

	.control-btn {
		background: #007AFF;
		color: white;
		border-radius: 10rpx;
		padding: 20rpx 40rpx;
	}

	.progress-container {
		margin-top: 40rpx;
	}

	.progress-bar {
		width: 100%;
		height: 12rpx;
	}
</style>