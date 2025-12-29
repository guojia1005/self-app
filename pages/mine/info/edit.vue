<template>
	<view class="container">
		<view class="example">
			<uni-forms ref="form" :model="user" labelWidth="80px">
				<uni-forms-item label="姓名" name="nickName">
					<uni-easyinput v-model="user.nickName" placeholder="请输入昵称" />
				</uni-forms-item>
				<uni-forms-item label="性别" name="sex">
					<uni-data-checkbox v-model="user.sex" :localdata="sexs" />
				</uni-forms-item>
				<uni-forms-item label="生日" name="birthday">
					<uni-datetime-picker type="date" :clear-icon="false" v-model="user.birthday" @maskClick="maskClick"
						@change="changeBirthday" disabled />
				</uni-forms-item>
				<uni-forms-item v-if="this.$store.state.user.roles === 100" label="教学风格" name="style">
					<uni-data-select v-model="user.style" placeholder="请选择" :border="true"
						:localdata="styleOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择头像" name="avatar">
					<uni-file-picker :value="avatarValue" limit="1" :del-icon="false" disable-preview
						:imageStyles="imageStyles" file-mediatype="image" :auto-upload="true" @select="selectImg">
						<uni-icons type="plusempty" size="30"></uni-icons>
					</uni-file-picker>
				</uni-forms-item>
			</uni-forms>
			<view class="bottom-btn">
				<button type="primary" size="mini" @click="submit">保存并返回</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getUserProfile
	} from "@/api/system/user"
	import {
		updateUserProfile
	} from "@/api/system/user"
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	import {
		dataFormat,
		calculateAge
	} from '@/utils/format';
	import {
		baseUrl
	} from "../../../config";
	import {
		getToken
	} from "@/utils/auth";

	export default {
		data() {
			return {
				user: {
					nickName: "",
					sex: "",
					birthday: '',
					avatar: [],
				},
				sexs: [{
					text: '男',
					value: "0"
				}, {
					text: '女',
					value: "1"
				}],
				rules: {
					nickName: {
						rules: [{
							required: true,
							errorMessage: '用户昵称不能为空'
						}]
					},
					/* phonenumber: {
					  rules: [{
					    required: true,
					    errorMessage: '手机号码不能为空'
					  }, {
					    pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
					    errorMessage: '请输入正确的手机号码'
					  }]
					}, */
				},
				styleOptions: [],
				imageStyles: {
					width: 100,
					height: 100,
					border: {
						radius: '50%'
					}
				},
				age: '',
				fileList: [],
				avatar: '',
				avatarValue: [],
				roleIds: [],
			}
		},
		onLoad() {
			this.getUser()
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		created() {
			this.getStyle(145);
		},
		methods: {
			getUser() {
				getUserProfile(this.$store.state.user.id).then(response => {
					this.user = response.data;
					this.roleIds = response.roleIds;
					// 如果有现有头像，初始化avatarValue
					if (this.user.avatar) {
						this.avatarValue = [{
							url: this.user.avatar,
							name: 'avatar.jpg'
						}];
					}
				})
			},
			submit(ref) {
				let data = this.user;
				data.roleIds = this.roleIds;
				data.avatar = this.avatar;
				this.$refs.form.validate().then(res => {
					updateUserProfile(data).then(response => {
						uni.showToast({
							title: '修改成功',
							icon: 'success',
							duration: 2000
						});
						if (this.avatar) {
							this.$store.commit("SET_AVATAR", this.avatar)
						}
						this.$store.commit("SET_NICK_NAME", this.user.nickName)
						this.$store.commit("SET_AGE", this.user.age)
						setTimeout(() => {
							uni.navigateBack({
								delta: 1 // 返回的页面数，这里设置为1表示返回上一页
							});
						}, 1000);
					})
				})
			},
			maskClick(e) {
				this.age = calculateAge(e)
			},
			changeBirthday(e) {
				this.age = calculateAge(e)
			},
			// 查询教师风格
			getStyle(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.styleOptions = dataFormat(response.data, 'dict');
					}
				})
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
							url: JSON.parse(res.data).url,
							name: JSON.parse(res.data).originalFilename,
						}
						this.fileList.push(list)
						this.avatar = JSON.parse(res.data).url
						console.log(this.avatar)
					},
					fail: function(err) {
						uni.showToast({
							title: '上传失败:' + err,
							icon: 'none'
						});
						// 上传失败时清空显示
						this.avatarValue = [];
					},
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #ffffff;
	}

	.example {
		padding: 15px;
		background-color: #fff;
	}

	.segmented-control {
		margin-bottom: 15px;
	}

	.button-group {
		margin-top: 15px;
		display: flex;
		justify-content: space-around;
	}

	.form-item {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.button {
		display: flex;
		align-items: center;
		height: 35px;
		line-height: 35px;
		margin-left: 10px;
	}

	.bottom-btn {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>