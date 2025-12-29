
<template>
  <view class="tree-node" :style="{ paddingLeft: level * 20 + 'px' }">
    <view class="node-content">
      <!-- 展开/收起图标 -->
      <view 
        v-if="hasChildren" 
        class="expand-icon" 
        @click="toggleExpand"
      >
	  <uni-icons v-if="isExpanded" type="down" size="14"></uni-icons>
	  <uni-icons v-else type="right" size="14"></uni-icons>
      </view>
      <view v-else class="empty-icon"></view>
      
      <!-- 复选框 -->
      <view class="checkbox-wrapper">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="isChecked"
            :indeterminate="isIndeterminate"
            @change="handleCheck"
            class="checkbox-input"
          />
          <view class="checkbox-custom" :class="{ checked: isChecked, indeterminate: isIndeterminate }">
            <text v-if="isChecked" class="checkmark">✓</text>
            <text v-else-if="isIndeterminate" class="indeterminate-line">—</text>
          </view>
        </label>
      </view>
      
      <!-- 节点名称 -->
      <view class="node-label" @click="handleCheck">
        {{ node.name }}
      </view>
    </view>
    
    <!-- 子节点 -->
    <view v-if="isExpanded && hasChildren" class="children-container">
      <tree-node
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-keys="selectedKeys"
        :indeterminate-keys="indeterminateKeys"
        @node-check="handleChildCheck"
      />
    </view>
  </view>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    selectedKeys: {
      type: Array,
      default: () => []
    },
    indeterminateKeys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0
    },
    isChecked() {
      return this.selectedKeys.includes(this.node.id)
    },
    isIndeterminate() {
      return this.indeterminateKeys.includes(this.node.id)
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },
    handleCheck() {
      this.$emit('node-check', this.node, !this.isChecked)
    },
    handleChildCheck(childNode, checked) {
      this.$emit('node-check', childNode, checked)
    }
  }
}
</script>

<style scoped>
.tree-node {
  padding: 4px 0;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
}

.node-content:hover {
  background-color: #f5f7fa;
}

.expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  color: #c0c4cc;
  font-size: 12px;
}

.empty-icon {
  width: 20px;
  margin-right: 4px;
}

.checkbox-wrapper {
  margin-right: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.3s;
}

.checkbox-custom.checked {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.checkbox-custom.indeterminate {
  background-color: #409eff;
  border-color: #409eff;
}

.indeterminate-line {
  color: #fff;
  font-weight: bold;
}

.checkbox-custom.checked .checkmark {
  color: #fff;
  font-size: 12px;
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.children-container {
  margin-left: 20px;
}
</style>
