<template>
	<view class="tree-select-container" @tap.stop>
		<!-- 下拉选择框 -->
		<view class="select-box" :class="{ 'disabled': disabled }" @click="toggleDropdown">
			<view class="selected-tags">
				<view v-for="(item, index) in displayTags" :key="index" class="tag">
					{{ item }}
				</view>
				<view v-if="hiddenCount > 0" class="tag more-tag">
					+{{ hiddenCount }}
				</view>
				<view v-if="selectedItems.length === 0" class="placeholder">
					请选择
				</view>
			</view>
			<uni-icons v-if="!disabled && isOpen" type="up" size="14"></uni-icons>
			<uni-icons v-else-if="!disabled" type="down" size="14"></uni-icons>
		</view>

		<!-- 下拉树形结构 -->
		<view v-show="!disabled && isOpen" class="dropdown-tree">
			<scroll-view class="tree-scroll" scroll-y>
				<tree-node v-for="node in treeData" :key="node.id" :node="node" :selected-keys="selectedKeys"
					:indeterminate-keys="indeterminateKeys" @node-check="handleNodeCheck" />
			</scroll-view>
			<view class="tree-footer">
				<button size="mini" class="cancel-btn" @click="cancelSelection">取消</button>
				<button size="mini" class="confirm-btn" @click="confirmSelection">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
	import TreeNode from './tree-node.vue'

	export default {
		name: 'TreeSelectDropdown',
		components: {
			TreeNode
		},
		props: {
			// 添加 v-model 支持
			value: {
				type: Array,
				default: () => []
			},
			// 树形数据
			data: {
				type: Array,
				default: () => []
			},
			// 最多显示的标签数量
			maxTags: {
				type: Number,
				default: 2
			},
			// 组件宽度
			width: {
				type: String,
				default: '100%'
			},
			// 是否禁用
			disabled: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isOpen: false,
				selectedKeys: [], // 已选中的节点key
				indeterminateKeys: [], // 半选状态的节点key
				tempSelectedKeys: [], // 临时选中key，用于取消操作
				tempIndeterminateKeys: [] // 临时半选key
			}
		},
		computed: {
			treeData() {
				return this.data
			},
			selectedItems() {
				const items = []
				this.flattenTree(this.treeData, items)
				const filtered = items.filter(item => this.selectedKeys.includes(item.id))
				return filtered
			},
			displayTags() {
				return this.selectedItems.slice(0, this.maxTags).map(item => item.name)
			},
			hiddenCount() {
				return Math.max(0, this.selectedItems.length - this.maxTags)
			},
			// 是否有选中的数据（包括叶子节点）
			hasSelectedData() {
				// 只检查叶子节点是否有选中
				const leafNodes = []
				this.collectLeafNodes(this.treeData, leafNodes)
				return leafNodes.some(node => this.selectedKeys.includes(node.id))
			}
		},
		mounted() {
			// 添加全局点击事件监听
			this.bindDocumentClick()
		},
		beforeDestroy() {
			// 移除全局点击事件监听
			this.unbindDocumentClick()
		},
		watch: {
			// 监听 value 变化，从外部更新选中状态
			value: {
				immediate: true,
				handler(newVal) {
					if (newVal && Array.isArray(newVal)) {
						// 如果是 ID 数组，直接设置
						this.selectedKeys = [...newVal];
						this.updateIndeterminateState();
					}
				}
			},
			// 监听 treeData 变化，重新计算选中项
			treeData: {
				deep: true,
				handler(newData) {
					// 当 treeData 更新后，重新设置选中状态
					this.$nextTick(() => {
						if (this.value && this.value.length > 0) {
							this.selectedKeys = [...this.value];
							this.updateIndeterminateState();
						}
					});
				}
			},
			disabled: {
				immediate: true,
				handler(newVal) {
					// 禁用时自动关闭下拉框
					if (newVal && this.isOpen) {
						this.close();
					}
				}
			}
		},
		methods: {
			// 收集所有叶子节点
			collectLeafNodes(nodes, result) {
				nodes.forEach(node => {
					if (!node.children || node.children.length === 0) {
						// 叶子节点
						result.push(node)
					} else {
						// 非叶子节点，递归收集子节点
						this.collectLeafNodes(node.children, result)
					}
				})
			},
			// 绑定文档点击事件
			bindDocumentClick() {
				document.addEventListener('click', this.handleDocumentClick)
				document.addEventListener('touchend', this.handleDocumentClick)
			},
			// 解绑文档点击事件
			unbindDocumentClick() {
				document.removeEventListener('click', this.handleDocumentClick)
				document.removeEventListener('touchend', this.handleDocumentClick)
			},
			// 处理文档点击事件
			handleDocumentClick(event) {
				if (!this.isOpen) return

				// 检查点击是否在组件内部
				const componentElement = this.$el
				if (componentElement && !componentElement.contains(event.target)) {
					// 点击页面空白处
					if (this.hasSelectedData) {
						// 如果有选中的数据，自动确认选择
						this.confirmSelection()
					} else {
						// 没有选中的数据，直接关闭
						this.close()
					}
				}
			},
			// 打开下拉框
			open() {
				this.isOpen = true
				// 保存当前状态用于取消操作
				this.tempSelectedKeys = [...this.selectedKeys]
				this.tempIndeterminateKeys = [...this.indeterminateKeys]
				this.$emit('open')
			},
			// 关闭下拉框
			close() {
				this.isOpen = false
				this.$emit('close')
			},
			// 切换下拉框状态
			toggleDropdown() {
				if (this.disabled) {
					return; // 禁用状态下不响应点击
				}

				if (this.isOpen) {
					this.close()
				} else {
					this.open()
				}
			},
			// 处理节点勾选
			handleNodeCheck(node, checked) {
				if (checked) {
					// 勾选节点
					this.selectNode(node)
				} else {
					// 取消勾选节点
					this.unselectNode(node)
				}

				// 更新半选状态
				this.updateIndeterminateState()
			},
			// 勾选节点及其子节点
			selectNode(node) {
				// 添加当前节点
				if (!this.selectedKeys.includes(node.id)) {
					this.selectedKeys.push(node.id)
				}

				// 添加所有子节点
				if (node.children && node.children.length > 0) {
					this.selectAllChildren(node.children)
				}

				// 更新父节点状态
				this.updateParentState(node)
			},
			// 取消勾选节点及其子节点
			unselectNode(node) {
				// 移除当前节点
				const index = this.selectedKeys.indexOf(node.id)
				if (index > -1) {
					this.selectedKeys.splice(index, 1)
				}

				// 移除所有子节点
				if (node.children && node.children.length > 0) {
					this.unselectAllChildren(node.children)
				}

				// 更新父节点状态
				this.updateParentState(node)
			},
			// 勾选所有子节点
			selectAllChildren(children) {
				children.forEach(child => {
					if (!this.selectedKeys.includes(child.id)) {
						this.selectedKeys.push(child.id)
					}
					if (child.children && child.children.length > 0) {
						this.selectAllChildren(child.children)
					}
				})
			},
			// 取消勾选所有子节点
			unselectAllChildren(children) {
				children.forEach(child => {
					const index = this.selectedKeys.indexOf(child.id)
					if (index > -1) {
						this.selectedKeys.splice(index, 1)
					}
					if (child.children && child.children.length > 0) {
						this.unselectAllChildren(child.children)
					}
				})
			},
			// 更新父节点状态
			updateParentState(node) {
				// 从当前节点向上更新所有父节点的选中和半选状态
				let currentNode = node
				while (currentNode.parentId) {
					// 查找父节点
					const parentNode = this.findNodeById(this.treeData, currentNode.parentId)
					if (!parentNode) break

					// 检查父节点的所有子节点的选中状态
					const checkedChildrenCount = parentNode.children.filter(child =>
						this.selectedKeys.includes(child.id)
					).length

					const childCount = parentNode.children.length

					if (checkedChildrenCount === 0) {
						// 没有子节点被选中，移除父节点的选中和半选状态
						const selectedIndex = this.selectedKeys.indexOf(parentNode.id)
						if (selectedIndex > -1) {
							this.selectedKeys.splice(selectedIndex, 1)
						}
						const indeterminateIndex = this.indeterminateKeys.indexOf(parentNode.id)
						if (indeterminateIndex > -1) {
							this.indeterminateKeys.splice(indeterminateIndex, 1)
						}
					} else if (checkedChildrenCount === childCount) {
						// 所有子节点都被选中，父节点设为选中状态
						if (!this.selectedKeys.includes(parentNode.id)) {
							this.selectedKeys.push(parentNode.id)
						}
						// 移除半选状态
						const indeterminateIndex = this.indeterminateKeys.indexOf(parentNode.id)
						if (indeterminateIndex > -1) {
							this.indeterminateKeys.splice(indeterminateIndex, 1)
						}
					} else {
						// 部分子节点被选中，父节点设为半选状态
						// 移除选中状态（如果存在）
						const selectedIndex = this.selectedKeys.indexOf(parentNode.id)
						if (selectedIndex > -1) {
							this.selectedKeys.splice(selectedIndex, 1)
						}
						// 添加半选状态（如果不存在）
						if (!this.indeterminateKeys.includes(parentNode.id)) {
							this.indeterminateKeys.push(parentNode.id)
						}
					}

					currentNode = parentNode
				}
			},
			// 根据ID查找节点
			findNodeById(nodes, id) {
				for (let node of nodes) {
					if (node.id === id) {
						return node
					}
					if (node.children && node.children.length > 0) {
						const found = this.findNodeById(node.children, id)
						if (found) return found
					}
				}
				return null
			},
			// 更新半选状态
			updateIndeterminateState() {
				this.indeterminateKeys = []
				this.checkIndeterminateState(this.treeData)
			},
			// 检查半选状态
			checkIndeterminateState(nodes) {
				nodes.forEach(node => {
					if (node.children && node.children.length > 0) {
						const checkedChildren = node.children.filter(child =>
							this.selectedKeys.includes(child.id)
						).length

						const indeterminateChildren = node.children.filter(child =>
							this.indeterminateKeys.includes(child.id)
						).length

						// 如果子节点部分选中，则当前节点为半选状态
						if ((checkedChildren > 0 && checkedChildren < node.children.length) ||
							indeterminateChildren > 0) {
							if (!this.indeterminateKeys.includes(node.id)) {
								this.indeterminateKeys.push(node.id)
							}
						} else if (checkedChildren === node.children.length) {
							// 如果所有子节点都选中，父节点也设为选中状态
							if (!this.selectedKeys.includes(node.id)) {
								this.selectedKeys.push(node.id)
							}
							// 移除半选状态
							const indeterminateIndex = this.indeterminateKeys.indexOf(node.id)
							if (indeterminateIndex > -1) {
								this.indeterminateKeys.splice(indeterminateIndex, 1)
							}
						} else {
							// 如果没有子节点被选中，移除父节点选中状态
							const selectedIndex = this.selectedKeys.indexOf(node.id)
							if (selectedIndex > -1) {
								this.selectedKeys.splice(selectedIndex, 1)
							}
							// 移除半选状态
							const indeterminateIndex = this.indeterminateKeys.indexOf(node.id)
							if (indeterminateIndex > -1) {
								this.indeterminateKeys.splice(indeterminateIndex, 1)
							}
						}

						// 递归检查子节点
						this.checkIndeterminateState(node.children)
					}
				})
			},
			// 展平树形结构
			flattenTree(nodes, result) {
				nodes.forEach(node => {
					result.push({
						id: node.id,
						name: node.name,
						parentId: node.parentId
					})
					if (node.children && node.children.length > 0) {
						this.flattenTree(node.children, result)
					}
				})
			},
			// 修改 confirmSelection 方法
			confirmSelection() {
				this.close();

				// 过滤掉父级节点，只保留叶子节点
				const leafItems = this.selectedItems.filter(item => {
					// 找到对应的节点
					const node = this.findNodeById(this.treeData, item.id);
					// 只保留叶子节点
					return node && (!node.children || node.children.length === 0);
				});

				// 提取叶子节点的 ID
				const leafIds = leafItems.map(item => item.id);

				// 更新内部选中状态
				this.selectedKeys = leafIds;

				// 通知父组件
				this.$emit('input', leafIds); // 触发 v-model 更新
				this.$emit('change', leafItems);
			},

			// 修改 setValue 方法
			setValue(selectedIds) {
				if (!selectedIds || !Array.isArray(selectedIds)) {
					this.selectedKeys = [];
					return;
				}

				// 直接设置选中键
				this.selectedKeys = [...selectedIds];

				// 更新半选状态
				this.updateIndeterminateState();

				// 触发计算属性重新计算
				this.$forceUpdate();
			},

			// 添加一个辅助方法，用于根据 ID 获取完整的节点信息
			getFullNodeInfoById(id) {
				const node = this.findNodeById(this.treeData, id);
				if (node) {
					return {
						id: node.id,
						name: node.name,
						parentId: node.parentId
					};
				}
				return null;
			},

			// 取消选择
			cancelSelection() {
				this.close()
				// 恢复之前的选择状态
				this.selectedKeys = [...this.tempSelectedKeys]
				this.indeterminateKeys = [...this.tempIndeterminateKeys]
			},
			// 设置选中值
			setValue(selectedIds) {
				this.selectedKeys = [...selectedIds];
				this.updateIndeterminateState();
				// 触发 change 事件，让父组件知道选中的值
				const leafItems = this.selectedItems.filter(item => {
					const node = this.findNodeById(this.treeData, item.id);
					return node && (!node.children || node.children.length === 0);
				});
				this.$emit('change', leafItems);
			},
			// 清空选择
			clear() {
				this.selectedKeys = []
				this.indeterminateKeys = []
			}
		}
	}
</script>

<style scoped>
	.tree-select-container {
		position: relative;
		width: v-bind(width);
		font-size: 14px;
	}

	.select-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		background-color: #fff;
		cursor: pointer;
		min-height: 36px;
		box-sizing: border-box;
	}

	/* 移除原来的 .select-box:hover */
	.select-box:hover:not(.disabled) {
		border-color: #409eff;
	}

	/* 确保禁用样式有足够优先级 */
	.select-box.disabled {
		background-color: #f5f7fa !important;
		border-color: #e4e7ed !important;
		color: #c0c4cc !important;
		cursor: not-allowed !important;
	}

	/* 禁用状态下的标签样式 */
	.select-box.disabled .tag {
		background-color: #f0f2f5 !important;
		color: #c0c4cc !important;
	}

	/* 禁用状态下不显示图标 */
	.select-box.disabled uni-icons {
		display: none;
	}

	.select-box.disabled .placeholder {
		color: #c0c4cc !important;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		flex: 1;
	}

	.tag {
		background-color: #ecf5ff;
		color: #409eff;
		padding: 0 8px;
		border-radius: 4px;
		font-size: 12px;
		line-height: 20px;
	}

	.more-tag {
		background-color: #f0f2f5;
		color: #606266;
	}

	.placeholder {
		color: #c0c4cc;
		font-size: 14px;
	}

	.dropdown-tree {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 5px;
		border: 1px solid #e4e7ed;
		border-radius: 4px;
		background-color: #fff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.tree-scroll {
		max-height: 300px;
	}

	.tree-footer {
		padding: 10px;
		border-top: 1px solid #e4e7ed;
		text-align: right;
	}

	.confirm-btn {
		padding: 0px 16px;
		background-color: #409eff;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.cancel-btn {
		background-color: #fff;
		margin-right: 10px;
	}

	.confirm-btn:hover {
		background-color: #66b1ff;
	}
</style>