<!-- 学生发布游戏 -->
<template>
	<view class="post-information">
		<view class="post-content">
			<uni-forms :modelValue="formData" label-width="140px" border>
				<uni-forms-item label="主题" name="theme">
					<uni-easyinput type="text" v-model="formData.theme" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="类型" name="typeDirection">
					<uni-data-select v-model="formData.typeDirection" placeholder="请选择"
						:localdata="directionOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择学科" name="typeDirection">
					<uni-data-select v-model="formData.typeDirection" placeholder="请选择" :border="true"
						:localdata="directionOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择年级" name="grade">
					<uni-data-select v-model="formData.grade" placeholder="请选择" :border="true"
						:localdata="gradeOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="选择专题（单选）" name="typeDirection">
					<uni-data-select v-model="formData.typeDirection" placeholder="请选择" :border="true"
						:localdata="directionOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="二级专题（可多选）" name="typeDirection">
					<uni-data-select v-model="formData.typeDirection" placeholder="请选择" :border="true"
						:localdata="directionOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="历史最高成绩" name="highGrade">
					<uni-easyinput type="number" v-model="formData.highGrade" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="历史最低成绩" name="lowGrade">
					<uni-easyinput type="number" v-model="formData.lowGrade" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="教师风格" name="style">
					<uni-data-select v-model="formData.style" placeholder="请选择" :border="true"
						:localdata="styleOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="期望教师性别" name="teacherSex">
					<uni-data-select v-model="formData.teacherSex" placeholder="请选择" :border="true"
						:localdata="sexOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="期望上课次数" name="classNum">
					<uni-easyinput type="number" v-model="formData.classNum" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="选择老师" name="teacherLevel">
					<uni-data-select v-model="formData.teacherLevel" placeholder="请选择" :border="true"
						:localdata="levelOptions"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="补充描述" name="remark">
					<uni-easyinput type="textarea" v-model="formData.remark" placeholder="请输入" />
				</uni-forms-item>
				<uni-forms-item label="上传图片" name="file">
						<uni-file-picker ref="imgFiles" v-model="formData.imageList" :auto-upload="true"
							fileMediatype="image" @select="selectImg" @success="imgSuccess" @fail="imgFail"
							@progress="imgProgress" @delete="imgDelete" />
				</uni-forms-item>
			</uni-forms>
			<view class="post-btn">
				<view class="post-btn-item">
					<button size="mini" @click="cancelForm">放弃发布</button>
				</view>
				<view class="post-btn-item">
					<button size="mini" class="submit-btn" @click="submitForm">立即发布</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		dataFormat,
	} from '@/utils/format';
	import {
		selectDict
	} from "@/api/system/dict/data.js";
	export default {
		name: 'PostGame',
		onLoad(query) {

		},
		data() {
			return {
				formData: {},
				directionOptions: [],
				gradeOptions: [],
				styleOptions: [],
				sexOptions: [],
				levelOptions: [],
			}
		},
		created() {
			this.getDirection(131);
			this.getGrade(138);
			this.getStyle(145);
			this.getSex(115);
			this.getLevel(150);
		},
		methods: {
			// 查询方向
			getDirection(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.directionOptions = dataFormat(response.data, 'dict');
					}
				})
			},
			// 查询年级
			getGrade(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.gradeOptions = dataFormat(response.data, 'dict');
					}
				})
			},
			// 查询教师风格
			getStyle(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.styleOptions = dataFormat(response.data, 'dict');
					}
				})
			},
			// 查询性别
			getSex(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.sexOptions = dataFormat(response.data, 'dict');
					}
				})
			},
			// 查询教师级别
			getLevel(val) {
				selectDict(val).then(response => {
					if (response.code === 200) {
						this.levelOptions = dataFormat(response.data, 'dict');
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page{
		background-color: #fff;
	}
	.post-information {
		background-color: #fff;

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
		}
	}
</style>