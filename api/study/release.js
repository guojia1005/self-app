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