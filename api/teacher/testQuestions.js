import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

/* 新增测试题*/
export function upTest(data) {
  return request({
    url: '/release/problem',
    method: 'post',
	data: data
  })
}

/* 查询课前测试题*/
export function selTest(params) {
  return request({
    url: '/release/problem',
    method: 'get',
	params: params
  })
}

/* 修改测试题*/
export function updateTest(data) {
  return request({
    url: '/release/problem',
    method: 'put',
	data: data
  })
}