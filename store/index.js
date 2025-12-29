import Vue from 'vue'
import Vuex from 'vuex'
import user from '@/store/modules/user'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user
  },
  state: {
    currentPage: '/pages/index/index',
    currentIndex: 0,
  },
  mutations: {
    setCurrentPage(state, page) {
      state.currentPage = page;
    },
    setCurrentIndex(state, index) {
      state.currentIndex = index;
    }
  },
  getters
})

export default store
