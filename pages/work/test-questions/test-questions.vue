<!-- 测试题 -->
<template>
	<view class="test-question">
		<view v-if="this.$store.state.user.roles === 100">
			<uni-section title="上传习题" type="line">
				<uni-group>
					<view>
						<uni-file-picker ref="imgFiles" v-model="imageList" :auto-upload="true" fileMediatype="image"
							@select="selectImg" @delete="deleteImg" />
					</view>
					<view class="test-btn">
						<view class="test-btn-item">
							<button size="mini" @click="goBack('add')">返回</button>
						</view>
						<view class="test-subtn-item">
							<button size="mini" class="submit-btn" @click="submitForm('add')">提交</button>
						</view>
					</view>
				</uni-group>
			</uni-section>
		</view>

		<view v-else-if="this.$store.state.user.roles === 2">
			<uni-section title="习题" type="line">
				<template v-slot:right>
					<button :disabled="isTest" size="mini" type="primary" @click="downloadAllImages">下载习题</button>
				</template>
				<uni-group>
					<view class="image-wall">
						<view v-for="(item, index) in showImageList" :key="index" class="image-item"
							@tap="previewImage(index)">
							<image :src="item" mode="aspectFill" class="image" />
						</view>
					</view>
				</uni-group>
			</uni-section>
			<uni-section title="上传答案" type="line">
				<uni-group>
					<view>
						<uni-file-picker :disabled="isTest" ref="imgFiles" v-model="imageList" :auto-upload="true" fileMediatype="image"
							@select="selectImg" @delete="deleteImg" />
					</view>
					<view class="test-btn">
						<view class="test-btn-item">
							<button size="mini" @click="goBack('edit')">返回</button>
						</view>
						<view class="test-subtn-item">
							<button :disabled="isTest" size="mini" type="primary" @click="submitForm('edit')">提交</button>
						</view>
					</view>
				</uni-group>
			</uni-section>
		</view>
	</view>
</template>

<script>
	import {
		upTest,
		selTest,
		updateTest
	} from "@/api/teacher/testQuestions.js";
	import {
		baseUrl
	} from "../../../config";
	import {
		getToken
	} from "@/utils/auth";
	const platform = uni.getSystemInfoSync().platform
	export default {
		name: 'TestQuestions',
		data() {
			return {
				info: {},
				imageList: [],
				fileList: [],
				showImageList: [],
				isDownloading: false,
				downloadedCount: 0,
				successCount: 0,
				failCount: 0,
				downloadPercent: 0,
				downloadStatus: '',
				isTest: false,
			}
		},
		onLoad(options) {
			this.initPage(options)
		},
		methods: {
			initPage(options) {
				// 参数解析
				if (options && options.data) {
					try {
						const params = JSON.parse(decodeURIComponent(options.data))
						this.setPageData(params)
					} catch (error) {
						console.error('参数解析错误:', error)
						uni.showToast({
							title: '参数错误',
							icon: 'none'
						})
					}
				} else {
					console.warn('未接收到参数')
				}
			},
			setPageData(params) {
				this.info = params;
				if (this.$store.state.user.roles === 2) {
					this.selectPreTest(this.info.releaseId);
				}
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
			// 返回
			goBack(val) {
				if (val === 'add') {
					uni.switchTab({
						url: `/pages/work/index`
					})
				} else if (val === 'edit') {
					uni.switchTab({
						url: `/pages/study/index`
					})
				}
			},
			// 提交测试题
			submitForm(val) {
				if (val === 'add') {
					if (this.fileList.length < 0 || this.fileList.length == 0) {
						uni.showToast({
							title: '请上传至少一个习题卷',
							icon: 'none'
						});
						return
					}
					let url = [];
					let urlName = [];
					for (let i = 0; i < this.fileList.length; i++) {
						url.push(this.fileList[i].url);
						urlName.push(this.fileList[i].name);
					}
					let data = {
						releaseId: this.info.releaseId,
						status: this.info.status,
						teacherAnswerUrl: url.join(','),
						teacherUrlName: urlName.join(','),
					}
					console.log(data, '新增')
					upTest(data).then(res => {
						if (res.code === 200) {
							uni.showToast({
								title: '提交成功',
								icon: 'success',
								duration: 2000
							});
							setTimeout(() => {
								uni.switchTab({
									url: `/pages/work/index`
								})
							}, 1000);
						} else {
								// 上传失败
								uni.showToast({
									title: res.msg,
									icon: 'none'
								});
						}
					})
				} else if (val === 'edit') {
					if (this.fileList.length < 0 || this.fileList.length == 0) {
						uni.showToast({
							title: '请上传至少一个答案',
							icon: 'none'
						});
						return
					}
					let url = [];
					let urlName = [];
					for (let i = 0; i < this.fileList.length; i++) {
						url.push(this.fileList[i].url);
						urlName.push(this.fileList[i].name);
					}
					let data = {
						releaseId: this.info.releaseId,
						status: this.info.status,
						studentAnswerUrl: url.join(','),
						studentUrlName: urlName.join(','),
						problemId: this.info.problemId,
					}
					updateTest(data).then(res => {
						if (res.code === 200) {
							uni.showToast({
								title: '提交成功',
								icon: 'success',
								duration: 2000
							});
							setTimeout(() => {
								uni.switchTab({
									url: `/pages/study/index`
								})
							}, 1000);
						}
					})
				}
			},
			// 查询课前测试
			selectPreTest(id) {
				let params = {
					releaseId: id,
					status: this.info.status
				}
				selTest(params).then(res => {
					if (res.code === 200 && res.data) {
						let url = (res.data.teacherProblemUrl).split(',')
						this.showImageList = url;
						this.info.problemId = res.data.problemId;
						this.isTest = false;
					} else {
						this.showImageList = [];
						// 等待老师上传习题
						uni.showToast({
							title: '老师还未上传习题请等待',
							icon: 'none'
						});
						this.isTest = true;
					}
				})
			},
			/**
			 * 预览图片（大图模式）
			 * @param {number} currentIndex - 当前点击的图片索引
			 */
			previewImage(currentIndex) {
				uni.previewImage({
					// 当前显示图片的链接
					current: this.showImageList[currentIndex],
					// 需要预览的图片链接列表
					urls: this.showImageList,
					// 图片指示器样式
					indicator: 'default',
					// 是否可循环预览
					loop: false,
					// 长按保存图片到相册
					longPressActions: {
						itemList: ['保存图片', '取消'],
						success: (data) => {
							if (data.tapIndex === 0) {
								this.saveImage(this.showImageList[currentIndex]);
							}
						}
					}
				});
			},

			/**
			 * 保存图片到相册
			 * @param {string} url - 图片URL
			 */
			saveImage(url) {
				uni.showLoading({
					title: '保存中...'
				});

				uni.downloadFile({
					url: url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveImageToPhotosAlbum({
								filePath: res.tempFilePath,
								success: () => {
									uni.hideLoading();
									uni.showToast({
										title: '保存成功',
										icon: 'success'
									});
								},
								fail: () => {
									uni.hideLoading();
									uni.showToast({
										title: '保存失败',
										icon: 'error'
									});
								}
							});
						}
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({
							title: '下载失败',
							icon: 'error'
						});
					}
				});
			},
			// 下载全部图片
			// 下载全部图片
			downloadAllImages() {
				// 检查是否有图片
				if (!this.showImageList || this.showImageList.length === 0) {
					uni.showToast({
						title: '没有可下载的图片',
						icon: 'none'
					})
					return
				}

				// 检查是否正在下载
				if (this.isDownloading) {
					uni.showToast({
						title: '正在下载中，请稍候',
						icon: 'none'
					})
					return
				}

				// 显示确认对话框
				uni.showModal({
					title: '批量下载',
					content: `确定要下载${this.showImageList.length}张习题图片吗？`,
					success: (res) => {
						if (res.confirm) {
							this.startDownloadAllImages()
						}
					}
				})
			},

			// 开始下载所有图片
			async startDownloadAllImages() {
				// 重置状态
				this.resetDownloadStatus()
				this.isDownloading = true

				try {
					// H5环境下使用特定的下载方法
					await this.downloadAllH5WithProgress()
				} catch (error) {
					console.error('下载过程中出错:', error)
					uni.showToast({
						title: '下载过程出错',
						icon: 'error'
					})
				} finally {
					this.isDownloading = false
					// 显示下载结果
					this.showDownloadResult()
				}
			},

			// H5环境下带进度的批量下载
			async downloadAllH5WithProgress() {
				const images = this.showImageList
				const total = images.length

				// 创建下载队列
				const downloadQueue = []

				for (let i = 0; i < images.length; i++) {
					const url = images[i]
					const index = i + 1

					// 添加到下载队列
					downloadQueue.push({
						url,
						index,
						filename: this.generateFilename(url, index)
					})
				}

				// 开始下载队列
				await this.processDownloadQueueH5(downloadQueue, total)
			},

			// 处理H5下载队列
			async processDownloadQueueH5(queue, total) {
				// 控制并发数（H5下载可以并发）
				const CONCURRENCY = 3
				const results = []

				for (let i = 0; i < queue.length; i += CONCURRENCY) {
					const batch = queue.slice(i, i + CONCURRENCY)

					// 并发下载当前批次
					const batchPromises = batch.map(async (item) => {
						try {
							await this.downloadSingleImageH5(item.url, item.filename)

							// 更新成功计数
							this.successCount++
							return {
								success: true,
								item
							}
						} catch (error) {
							console.error(`图片下载失败 [${item.filename}]:`, error)

							// 更新失败计数
							this.failCount++
							return {
								success: false,
								item,
								error
							}
						} finally {
							// 更新下载计数和进度
							this.downloadedCount++
							this.downloadPercent = Math.round((this.downloadedCount / total) * 100)
							this.downloadStatus = `下载中 ${this.downloadedCount}/${total}`

							// 更新loading提示
							uni.showLoading({
								title: `下载中 ${this.downloadedCount}/${total}`,
								mask: true
							})
						}
					})

					// 等待当前批次完成
					const batchResults = await Promise.allSettled(batchPromises)
					results.push(...batchResults)

					// 每批之间稍作延迟，避免请求过于密集
					if (i + CONCURRENCY < queue.length) {
						await new Promise(resolve => setTimeout(resolve, 500))
					}
				}

				this.downloadPercent = 100
				this.downloadStatus = '下载完成'
				uni.hideLoading()
			},

			// 生成文件名
			generateFilename(url, index) {
				// 尝试从URL提取文件名
				let filename = `习题_${index}`

				try {
					// 移除查询参数
					const cleanUrl = url.split('?')[0]
					// 获取路径的最后部分
					const pathParts = cleanUrl.split('/')
					const lastPart = pathParts[pathParts.length - 1]

					if (lastPart && lastPart.includes('.')) {
						// 保留原文件名
						filename = lastPart
					} else {
						// 添加扩展名
						filename = `习题_${index}_${Date.now()}.jpg`
					}
				} catch (e) {
					console.warn('解析URL失败，使用默认文件名:', e)
					filename = `习题_${index}_${Date.now()}.jpg`
				}

				return filename
			},

			// H5下载单张图片（使用XMLHttpRequest避免跨域问题）
			downloadSingleImageH5(url, filename) {
				return new Promise((resolve, reject) => {
					// 使用XMLHttpRequest来获取Blob数据
					const xhr = new XMLHttpRequest()

					xhr.open('GET', url, true)
					xhr.responseType = 'blob'

					xhr.onload = () => {
						if (xhr.status === 200) {
							const blob = xhr.response

							// 创建下载链接
							const downloadUrl = URL.createObjectURL(blob)
							const a = document.createElement('a')

							a.href = downloadUrl
							a.download = filename
							a.style.display = 'none'

							document.body.appendChild(a)

							try {
								a.click()

								// 清理资源
								setTimeout(() => {
									document.body.removeChild(a)
									URL.revokeObjectURL(downloadUrl)
									resolve()
								}, 100)
							} catch (error) {
								// 如果click方法失败，尝试使用其他方法
								this.fallbackDownload(blob, filename)
									.then(resolve)
									.catch(reject)
							}
						} else {
							reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
						}
					}

					xhr.onerror = () => {
						reject(new Error('网络错误，无法下载图片'))
					}

					xhr.ontimeout = () => {
						reject(new Error('请求超时'))
					}

					xhr.timeout = 30000 // 30秒超时
					xhr.send()
				})
			},

			// 备用下载方法
			fallbackDownload(blob, filename) {
				return new Promise((resolve, reject) => {
					try {
						// 方法1：使用FileReader创建base64
						const reader = new FileReader()

						reader.onloadend = () => {
							const base64data = reader.result

							// 创建链接下载base64
							const a = document.createElement('a')
							a.href = base64data
							a.download = filename
							a.style.display = 'none'

							document.body.appendChild(a)
							a.click()

							setTimeout(() => {
								document.body.removeChild(a)
								resolve()
							}, 100)
						}

						reader.onerror = () => {
							// 方法2：直接打开新窗口
							this.openInNewWindow(blob, filename)
								.then(resolve)
								.catch(reject)
						}

						reader.readAsDataURL(blob)
					} catch (error) {
						reject(error)
					}
				})
			},

			// 在新窗口打开图片
			openInNewWindow(blob, filename) {
				return new Promise((resolve, reject) => {
					try {
						const blobUrl = URL.createObjectURL(blob)

						// 打开新窗口显示图片
						const newWindow = window.open(blobUrl, '_blank')

						if (newWindow) {
							// 提示用户右键另存为
							uni.showModal({
								title: '下载提示',
								content: `图片"${filename}"已在新窗口打开，请右键选择"图片另存为"进行保存。`,
								showCancel: false,
								success: () => {
									// 稍后清理URL
									setTimeout(() => {
										URL.revokeObjectURL(blobUrl)
										resolve()
									}, 1000)
								}
							})
						} else {
							// 窗口被阻止，直接显示图片
							this.showImageInPage(blobUrl, filename)
								.then(resolve)
								.catch(reject)
						}
					} catch (error) {
						reject(error)
					}
				})
			},

			// 在当前页面显示图片
			showImageInPage(blobUrl, filename) {
				return new Promise((resolve, reject) => {
					try {
						// 创建图片元素
						const img = document.createElement('img')
						img.src = blobUrl
						img.style.maxWidth = '100%'
						img.style.maxHeight = '80vh'

						// 创建容器
						const container = document.createElement('div')
						container.style.position = 'fixed'
						container.style.top = '0'
						container.style.left = '0'
						container.style.right = '0'
						container.style.bottom = '0'
						container.style.backgroundColor = 'rgba(0,0,0,0.8)'
						container.style.display = 'flex'
						container.style.flexDirection = 'column'
						container.style.alignItems = 'center'
						container.style.justifyContent = 'center'
						container.style.zIndex = '9999'

						// 创建提示文字
						const tip = document.createElement('div')
						tip.textContent = `右键点击图片选择"图片另存为"保存: ${filename}`
						tip.style.color = 'white'
						tip.style.marginBottom = '20px'
						tip.style.fontSize = '16px'
						tip.style.textAlign = 'center'
						tip.style.padding = '0 20px'

						// 创建关闭按钮
						const closeBtn = document.createElement('button')
						closeBtn.textContent = '关闭'
						closeBtn.style.marginTop = '20px'
						closeBtn.style.padding = '10px 20px'
						closeBtn.style.backgroundColor = '#1890ff'
						closeBtn.style.color = 'white'
						closeBtn.style.border = 'none'
						closeBtn.style.borderRadius = '5px'
						closeBtn.style.cursor = 'pointer'

						closeBtn.onclick = () => {
							document.body.removeChild(container)
							URL.revokeObjectURL(blobUrl)
							resolve()
						}

						// 组装元素
						container.appendChild(tip)
						container.appendChild(img)
						container.appendChild(closeBtn)
						document.body.appendChild(container)

						// 点击背景关闭
						container.onclick = (e) => {
							if (e.target === container) {
								document.body.removeChild(container)
								URL.revokeObjectURL(blobUrl)
								resolve()
							}
						}
					} catch (error) {
						reject(error)
					}
				})
			},

			// 重置下载状态
			resetDownloadStatus() {
				this.downloadedCount = 0
				this.successCount = 0
				this.failCount = 0
				this.downloadPercent = 0
				this.downloadStatus = ''
			},

			// 显示下载结果
			showDownloadResult() {
				const total = this.showImageList.length

				// 隐藏loading
				uni.hideLoading()

				if (this.successCount === total) {
					uni.showToast({
						title: `全部下载完成 (${total}张)`,
						icon: 'success',
						duration: 3000
					})
				} else if (this.successCount > 0) {
					uni.showModal({
						title: '下载完成',
						content: `共${total}张图片\n✅ 成功: ${this.successCount}张\n❌ 失败: ${this.failCount}张`,
						showCancel: false,
						confirmText: '知道了',
						success: () => {
							// 如果有失败的图片，提供重试选项
							if (this.failCount > 0) {
								setTimeout(() => {
									uni.showModal({
										title: '重试失败图片',
										content: `有${this.failCount}张图片下载失败，是否重试？`,
										success: (res) => {
											if (res.confirm) {
												this.retryFailedImages()
											}
										}
									})
								}, 500)
							}
						}
					})
				} else {
					uni.showToast({
						title: '下载失败，请重试',
						icon: 'error',
						duration: 3000
					})
				}
			},

			// 重试失败的图片
			retryFailedImages() {
				// 这里可以实现重试逻辑，如果需要的话
				uni.showToast({
					title: '请重新点击下载按钮',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.test-question {
		background-color: #fff;
		height: calc(100vh - 44px);
		padding: 10px;

		.test-title {
			margin: 0px 0px 10px 0px;
			width: 100%;
		}

		.test-btn {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			padding: 10px;
			display: flex;

			.test-btn-item {
				flex: 1;
			}

			.test-subtn-item {
				flex: 1;
				text-align: right;

				.submit-btn {
					background-color: #1890ff;
					color: #fff;
					text-align: right;
				}
			}
		}

		.image-wall {
			display: grid;
			grid-template-columns: repeat(3, 1fr); // 3列布局
			grid-gap: 10rpx;
			margin-bottom: 20px;
		}

		.image-item {
			position: relative;
			width: 100%;
			height: 0;
			padding-bottom: 100%; // 保持正方形
			overflow: hidden;
			border-radius: 10rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.95);
				opacity: 0.9;
			}
		}

		.image {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
</style>