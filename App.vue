<script>
	import config from './config'
	import {
		getToken
	} from '@/utils/auth'

	export default {
		onLaunch: function() {
			this.initApp()
			// 在这里检查配置
			console.log('检查tabBar配置:', this.globalData?.tabBar || '未找到配置')

			// 或者检查全局配置
			const appConfig = wx.getAppBaseInfo?.() || {}
			console.log('应用基础配置:', appConfig)
		},
		onShow: function() {
			// console.log('App Show');
			uni.hideTabBar()
			// 也可以在这里检查
			const tabBar = wx.getTabBar?.()
			console.log('获取tabBar实例:', tabBar)
		},
		onHide: function() {
			// console.log('App Hide');
		},
		globalData: {
			userRole: '',
			// 可以在globalData中存储配置
			tabBar: {
				custom: true,
				list: [],
			},
		},
		methods: {
			// 初始化应用
			initApp() {
				// 初始化应用配置
				this.initConfig()
				// 检查用户登录状态
				//#ifdef H5
				this.checkLogin()
				//#endif
			},
			initConfig() {
				this.globalData.config = config
			},
			checkLogin() {
				if (!getToken()) {
					this.$tab.reLaunch('/pages/login')
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/static/scss/index.scss'
</style>