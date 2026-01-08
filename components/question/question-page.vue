<template>
	<view class="question-page">
		<!-- 收藏按钮（顶部） -->
		<view class="header">
			<view class="favorite-btn" @tap="toggleFavorite">
				<text :class="['star-icon', isFavorite ? 'favorited' : '']">
					{{ isFavorite ? '★' : '☆' }}
				</text>
				<text class="favorite-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
			</view>
			<view class="title">题目 {{ currentIndex + 1 }}/{{ questions.length }}</view>
		</view>

		<!-- 题目内容 -->
		<view class="question-section" v-if="showQuestion">
			<view class="question-card">
				<text class="question-text">{{ currentQuestion.content }}</text>
			</view>
		</view>

		<!-- 选项区域 -->
		<view class="options-section" v-if="showOptions">
			<!-- 单选模式 -->
			<view v-for="(option, index) in currentQuestion.options" :key="index"
				v-if="currentQuestion.type === 'single'" class="option-item" :class="getOptionClass(option)"
				@tap="selectOption(option)">
				<view class="option-content">
					<view class="option-label">{{ option.label }}</view>
					<view class="option-text">{{ option.text }}</view>
				</view>
				<view v-if="showAnswer" class="option-status">
					<text v-if="option.isCorrect" class="correct-icon">✓</text>
					<text v-if="option.isSelected && !option.isCorrect" class="wrong-icon">✗</text>
				</view>
			</view>

			<!-- 多选模式 -->
			<view v-for="(option, index) in currentQuestion.options" :key="'multi-'+index"
				v-if="currentQuestion.type === 'multi'" class="option-item" :class="getOptionClass(option)"
				@tap="toggleMultiOption(option)">
				<view class="option-content">
					<view class="option-label">{{ option.label }}</view>
					<view class="option-text">{{ option.text }}</view>
				</view>
				<view class="multi-selector">
					<view class="checkbox" :class="{'selected': option.isSelected}"></view>
				</view>
			</view>
		</view>

		<!-- 控制面板（显示/隐藏区域） -->
		<view class="control-panel">
			<view class="control-row">
				<view class="control-item" @tap="toggleShowQuestion">
					<text>题目</text>
					<view class="toggle-switch" :class="{'on': showQuestion}"></view>
				</view>
				<view class="control-item" @tap="toggleShowOptions">
					<text>选项</text>
					<view class="toggle-switch" :class="{'on': showOptions}"></view>
				</view>
			</view>
			<view class="control-row">
				<view class="control-item" @tap="toggleShowAnswer">
					<text>正确答案</text>
					<view class="toggle-switch" :class="{'on': showAnswer}"></view>
				</view>
				<view class="control-item" @tap="toggleShowTeachers">
					<text>名师讲解</text>
					<view class="toggle-switch" :class="{'on': showTeachers}"></view>
				</view>
			</view>
		</view>

		<!-- 正确答案区域 -->
		<view class="answer-section" v-if="showAnswer">
			<view class="section-title">
				<text class="title-text">正确答案</text>
				<text class="correct-answer">{{ formatCorrectAnswer(currentQuestion.correctAnswer) }}</text>
			</view>
			<view class="error-analysis" v-if="currentQuestion.errorAnalysis">
				<text class="analysis-title">错误分析：</text>
				<text class="analysis-content">{{ currentQuestion.errorAnalysis }}</text>
			</view>
		</view>

		<!-- 名师讲解区域 -->
		<view class="teachers-section" v-if="showTeachers">
			<view class="section-title">名师讲解</view>
			<view v-for="(teacher, index) in currentQuestion.teachers" :key="index" class="teacher-item"
				@tap="openTeacherModal(teacher)">
				<view class="teacher-info">
					<text class="teacher-rank">{{ index + 1 }}.</text>
					<text class="teacher-name">{{ teacher.name }}老师</text>
					<view class="teacher-stats">
						<text class="like-count">👍 {{ teacher.likes }}</text>
						<text class="dislike-count">👎 {{ teacher.dislikes }}</text>
					</view>
				</view>
				<view class="teacher-action">
					<text class="action-text">查看讲解</text>
				</view>
			</view>
		</view>

		<!-- 固定在底部的导航按钮 -->
		<view class="bottom-nav">
			<button class="nav-btn prev-btn" @tap="prevQuestion" :disabled="currentIndex === 0"
				:class="{'disabled': currentIndex === 0}">
				上一题
			</button>
			<button class="nav-btn next-btn" @tap="nextQuestion" :disabled="currentIndex === questions.length - 1"
				:class="{'disabled': currentIndex === questions.length - 1}">
				下一题
			</button>
		</view>

		<!-- 名师讲解弹窗 -->
		<teacher-modal :show="showTeacherModal" :teacher="selectedTeacher" :question="currentQuestion"
			@close="closeTeacherModal" @like="handleLike" @dislike="handleDislike" />
	</view>
</template>

<script>
	import TeacherModal from './teacher-modal.vue'
	export default {
		name: 'QuestionPage',
		components: {
			TeacherModal
		},
		data() {
			return {
				currentIndex: 0,
				isFavorite: false,
				showQuestion: true,
				showOptions: true,
				showAnswer: false,
				showTeachers: false,
				showTeacherModal: false,
				selectedTeacher: null,
				questions: [{
						id: 1,
						type: 'single', // single: 单选, multi: 多选
						content: '题目1，xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
						options: [{
								label: 'A',
								text: 'xxxxxx',
								isCorrect: true,
								isSelected: false
							},
							{
								label: 'B',
								text: 'zzzzzzzzzz',
								isCorrect: false,
								isSelected: false
							}
						],
						correctAnswer: ['A'],
						errorAnalysis: 'xxx知识点掌握不牢，xxx公式应用不正确。。。',
						teachers: [{
								id: 1,
								name: '张三',
								likes: 128,
								dislikes: 20,
								liked: false,
								disliked: false
							},
							{
								id: 2,
								name: '李四',
								likes: 120,
								dislikes: 12,
								liked: false,
								disliked: false
							},
							{
								id: 3,
								name: '王五',
								likes: 100,
								dislikes: 32,
								liked: false,
								disliked: false
							}
						]
					},
					// 更多题目...
				]
			}
		},

		computed: {
			currentQuestion() {
				return this.questions[this.currentIndex] || {}
			}
		},

		methods: {
			// 切换收藏状态
			toggleFavorite() {
				this.isFavorite = !this.isFavorite
				uni.showToast({
					title: this.isFavorite ? '已收藏' : '已取消收藏',
					icon: 'none'
				})
			},

			// 选择选项（单选）
			selectOption(option) {
				if (this.currentQuestion.type !== 'single') return

				// 清除其他选项的选择
				this.currentQuestion.options.forEach(opt => {
					opt.isSelected = false
				})

				// 选择当前选项
				option.isSelected = true

				// 如果是查看答案模式，不自动显示结果
				if (this.showAnswer) {
					this.showAnswer = true
				}
			},

			// 切换多选选项
			toggleMultiOption(option) {
				if (this.currentQuestion.type !== 'multi') return
				option.isSelected = !option.isSelected
			},

			// 获取选项样式
			getOptionClass(option) {
				if (!this.showAnswer) {
					return option.isSelected ? 'selected' : ''
				}

				if (option.isCorrect) {
					return 'correct'
				} else if (option.isSelected && !option.isCorrect) {
					return 'wrong'
				}
				return ''
			},

			// 格式化正确答案显示
			formatCorrectAnswer(answers) {
				return Array.isArray(answers) ? answers.join('、') : answers
			},

			// 题目导航
			prevQuestion() {
				if (this.currentIndex > 0) {
					this.currentIndex--
					this.resetCurrentQuestion()
				}
			},

			nextQuestion() {
				if (this.currentIndex < this.questions.length - 1) {
					this.currentIndex++
					this.resetCurrentQuestion()
				}
			},

			// 重置当前题目状态
			resetCurrentQuestion() {
				// 重置收藏状态（可以从本地存储读取）
				this.isFavorite = false
				// 重置显示状态
				this.showAnswer = false
				// 重置选项选择状态
				this.currentQuestion.options.forEach(option => {
					option.isSelected = false
				})
			},

			// 切换显示/隐藏
			toggleShowQuestion() {
				this.showQuestion = !this.showQuestion
			},

			toggleShowOptions() {
				this.showOptions = !this.showOptions
			},

			toggleShowAnswer() {
				this.showAnswer = !this.showAnswer
			},

			toggleShowTeachers() {
				this.showTeachers = !this.showTeachers
			},

			// 名师讲解相关
			openTeacherModal(teacher) {
				this.selectedTeacher = teacher
				this.showTeacherModal = true
			},

			closeTeacherModal() {
				this.showTeacherModal = false
				this.selectedTeacher = null
			},

			handleLike(teacherId) {
				const teacher = this.currentQuestion.teachers.find(t => t.id === teacherId)
				if (teacher) {
					if (!teacher.liked) {
						teacher.likes++
						teacher.liked = true
						// 如果之前点过踩，取消踩
						if (teacher.disliked) {
							teacher.dislikes = Math.max(0, teacher.dislikes - 1)
							teacher.disliked = false
						}
					} else {
						teacher.likes = Math.max(0, teacher.likes - 1)
						teacher.liked = false
					}
				}
			},

			handleDislike(teacherId) {
				const teacher = this.currentQuestion.teachers.find(t => t.id === teacherId)
				if (teacher) {
					if (!teacher.disliked) {
						teacher.dislikes++
						teacher.disliked = true
						// 如果之前点过赞，取消赞
						if (teacher.liked) {
							teacher.likes = Math.max(0, teacher.likes - 1)
							teacher.liked = false
						}
					} else {
						teacher.dislikes = Math.max(0, teacher.dislikes - 1)
						teacher.disliked = false
					}
				}
			}
		}
	}
</script>

<style scoped>
	.question-page {
		padding: 20rpx;
		padding-bottom: 120rpx;
		/* 为底部导航留出空间 */
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 头部样式 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.favorite-btn {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background: #fff;
		border-radius: 40rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.star-icon {
		font-size: 36rpx;
		margin-right: 10rpx;
		color: #ccc;
	}

	.star-icon.favorited {
		color: #ffd700;
	}

	.favorite-text {
		font-size: 28rpx;
		color: #666;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	/* 题目区域 */
	.question-section {
		margin-bottom: 30rpx;
	}

	.question-card {
		background: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.question-text {
		font-size: 32rpx;
		line-height: 1.6;
		color: #333;
	}

	/* 选项区域 */
	.options-section {
		margin-bottom: 30rpx;
	}

	.option-item {
		background: #fff;
		margin-bottom: 20rpx;
		padding: 30rpx;
		border-radius: 16rpx;
		border: 2rpx solid #e0e0e0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.option-item.selected {
		border-color: #4a86e8;
		background-color: #f0f7ff;
	}

	.option-item.correct {
		border-color: #4CAF50;
		background-color: #e8f5e9;
	}

	.option-item.wrong {
		border-color: #f44336;
		background-color: #ffebee;
	}

	.option-content {
		flex: 1;
	}

	.option-label {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #333;
	}

	.option-text {
		font-size: 30rpx;
		color: #666;
		line-height: 1.5;
	}

	.option-status {
		margin-left: 20rpx;
	}

	.correct-icon {
		color: #4CAF50;
		font-size: 40rpx;
	}

	.wrong-icon {
		color: #f44336;
		font-size: 40rpx;
	}

	.multi-selector {
		margin-left: 20rpx;
	}

	.checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
	}

	.checkbox.selected {
		background-color: #4a86e8;
		border-color: #4a86e8;
	}

	/* 控制面板 */
	.control-panel {
		background: #fff;
		padding: 20rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
	}

	.control-row {
		display: flex;
		justify-content: space-around;
		margin: 20rpx 0;
	}

	.control-item {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #666;
	}

	.toggle-switch {
		width: 80rpx;
		height: 40rpx;
		background: #e0e0e0;
		border-radius: 20rpx;
		margin-left: 20rpx;
		position: relative;
		transition: all 0.3s;
	}

	.toggle-switch.on {
		background: #4a86e8;
	}

	.toggle-switch.on::after {
		transform: translateX(40rpx);
	}

	.toggle-switch::after {
		content: '';
		position: absolute;
		top: 4rpx;
		left: 4rpx;
		width: 32rpx;
		height: 32rpx;
		background: #fff;
		border-radius: 50%;
		transition: all 0.3s;
	}

	/* 答案区域 */
	.answer-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
	}

	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-right: 20rpx;
	}

	.correct-answer {
		font-size: 32rpx;
		color: #4CAF50;
		font-weight: bold;
	}

	.error-analysis {
		background: #fff8e1;
		padding: 20rpx;
		border-radius: 12rpx;
		border-left: 6rpx solid #ff9800;
	}

	.analysis-title {
		font-size: 28rpx;
		color: #ff9800;
		font-weight: bold;
		margin-right: 10rpx;
	}

	.analysis-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
	}

	/* 名师讲解区域 */
	.teachers-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
	}

	.teacher-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.teacher-item:last-child {
		border-bottom: none;
	}

	.teacher-info {
		flex: 1;
	}

	.teacher-rank {
		font-size: 28rpx;
		color: #ff9800;
		margin-right: 15rpx;
		font-weight: bold;
	}

	.teacher-name {
		font-size: 30rpx;
		color: #333;
		margin-right: 20rpx;
	}

	.teacher-stats {
		display: inline-flex;
		align-items: center;
	}

	.like-count {
		font-size: 26rpx;
		color: #666;
		margin-right: 20rpx;
	}

	.dislike-count {
		font-size: 26rpx;
		color: #666;
	}

	.teacher-action {
		padding: 10rpx 20rpx;
		background: #f0f7ff;
		border-radius: 20rpx;
	}

	.action-text {
		font-size: 26rpx;
		color: #4a86e8;
	}

	/* 底部导航 */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.nav-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background: #4a86e8;
		color: #fff;
		border-radius: 40rpx;
		font-size: 32rpx;
		margin: 0 10rpx;
		border: none;
	}

	.nav-btn:disabled {
		background: #ccc;
		color: #999;
	}

	.nav-btn.disabled {
		opacity: 0.5;
	}

	.prev-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.next-btn {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}
</style>