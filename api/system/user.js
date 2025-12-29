import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    data: data
  })
}

// 查询用户个人信息
export function getUserProfile(userId) {
 /* return request({
    // url: '/system/user/profile',
    // method: 'get'
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  }) */

    return request({
      url: '/system/user/' + parseStrEmpty(userId),
      method: 'get'
    })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
   /* url: '/system/user/profile',
    method: 'put',
    data: data, */
	url: '/system/user',
	method: 'put',
	data: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return upload({
    url: '/system/user/profile/avatar',
    name: data.name,
    filePath: data.filePath
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  })
}

// 查询角色
export function getRole() {
  return request({
    url: '/system/user/roleList',
    method: 'get'
  })
}

// 查询门店
export function getDept() {
  return request({
    url: '/system/user/deptList',
    method: 'get'
  })
}

// 注册
export function appRegister(data) {
  return request({
    url: '/appRegister',
    /* headers: {
      isToken: false
    }, */
    method: 'post',
    data: data
  })
}
