import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询教师
export function getTeacher(params) {
  return request({
    url: '/teacher/teacherQualification/teacherList',
    method: 'get',
	data: params
  })
}

// 发布信息
export function releaseInfo(data) {
  return request({
    url: '/release/studentRelease',
    method: 'post',
	data: data
  })
}

// 查询时间段
export function getTime() {
  return request({
    url: '/period/PeriodController/list',
    method: 'get'
  })
}
