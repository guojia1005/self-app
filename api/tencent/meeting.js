import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 创建腾讯会议
export function createTencentMeeting(data) {
	return request({
		url: '/tencent/meeting/create',
		method: 'post',
		data: data
	})
}

// 生成会议信息
export function generateMeetingInfo(params) {
	return request({
		url: '/tencent/meeting/generate',
		method: 'get',
		params: params
	})
}

// @/api/tencent/meeting.js
// 获取会议信息
export function getMeetingInfo(params) {
	return request({
		url: '/tencent/meeting/info',
		method: 'get',
		params: params
	})
}