// utils/tabBarInit.js
// 简化的TabBar初始化工具
export const tabBarInit = {
  // 应用启动时初始化
  onAppLaunch() {
    console.log('应用启动，准备初始化TabBar...')
    
    // 延迟初始化
    setTimeout(() => {
      this.initFromStorage()
    }, 2000)
  },
  
  // 从storage初始化
  initFromStorage() {
    try {
      // 直接从storage获取角色
      const role = uni.getStorageSync('roles') || 2
      console.log('从storage获取角色:', role)
      
      // 更新TabBar
      if (typeof updateTabBarByRole === 'function') {
        updateTabBarByRole(role)
      } else {
        // 如果函数不存在，延迟重试
        setTimeout(() => this.initFromStorage(), 500)
      }
    } catch (error) {
      console.error('初始化TabBar失败:', error)
    }
  },
  
  // 页面显示时调用
  onPageShow() {
    console.log('页面显示，检查TabBar...')
    
    setTimeout(() => {
      this.checkAndFixTabBar()
    }, 300)
  },
  
  // 检查并修复TabBar
  checkAndFixTabBar() {
    try {
      // 获取当前角色
      const app = getApp()
      let role = 2
      
      if (app && app.$store) {
        role = app.$store.state.user.roles || 2
      } else {
        role = uni.getStorageSync('roles') || 2
      }
      
      console.log('当前角色:', role)
      
      // 简单检查：尝试显示TabBar
      uni.showTabBar({
        animation: false,
        success: () => {
          console.log('TabBar显示正常')
        },
        fail: () => {
          console.log('TabBar显示异常，尝试修复...')
          this.fixTabBar(role)
        }
      })
    } catch (error) {
      console.error('检查TabBar失败:', error)
    }
  },
  
  // 修复TabBar
  fixTabBar(role) {
    if (typeof updateTabBarByRole === 'function') {
      updateTabBarByRole(role)
    }
  }
}

// 直接调用TabBar更新的方法（供页面直接调用）
export function updateTabBarDirectly() {
  try {
    const app = getApp()
    let role = 2
    
    if (app && app.$store) {
      role = app.$store.state.user.roles || 2
    } else {
      role = uni.getStorageSync('roles') || 2
    }
    
    console.log('直接更新TabBar，角色:', role)
    
    // 延迟执行
    setTimeout(() => {
      if (typeof updateTabBarByRole === 'function') {
        updateTabBarByRole(role)
      }
    }, 500)
  } catch (error) {
    console.error('直接更新TabBar失败:', error)
  }
}