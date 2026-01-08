import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询发布信息
export function getReleaseInfo(params) {
  return request({
    url: '/release/studentRelease/list',
    method: 'get',
	params: params
  })
}

// 取消发布
export function cancelPost(releaseId) {
  return request({
    url: '/release/studentRelease/' + releaseId,
    method: 'delete'
  })
}

// 再约查询历史数据
export function getHistory(releaseId) {
  return request({
    url: '/release/studentRelease/history/' + releaseId,
    method: 'get'
  })
}

// 查询教师时间
export function getTeacherTime(params) {
  return request({
    url: '/system/slot/grid',
    method: 'get',
	params: params
  })
}

// 评价
export function sendEvaluate(data) {
  return request({
    url: '/release/evaluate',
    method: 'post',
	data: data
  })
}

// 查询评价
export function getEvaluate(params) {
  return request({
    url: '/release/evaluate',
    method: 'get',
	params: params,
  })
}

// 修改评价
export function updateEvaluate(data) {
  return request({
    url: '/release/evaluate',
    method: 'put',
	data: data,
  })
}