import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

/* 查询学生发布信息*/
export function getPostInfo(params) {
  return request({
    url: '/teacher/teacherReplyRelease/list',
    method: 'get',
	params: params,
  })
}

/* 接单*/
export function teacherOrder(data) {
  return request({
    url: '/teacher/teacherReplyRelease/edit',
    method: 'put',
	params: data
  })
}

/* 下课*/
export function overClass(releaseId) {
  return request({
    url: '/teacher/teacherReplyRelease/' + releaseId,
    method: 'put',
  })
}

/* 取消*/
export function cancelClass(releaseId) {
  return request({
    url: '/teacher/teacherReplyRelease/' + releaseId,
    method: 'delete',
  })
}