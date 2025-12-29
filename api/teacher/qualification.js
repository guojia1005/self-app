import upload from '@/utils/upload'
import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

/* 教师资质上传 */
export function addQualification(data) {
  return request({
    url: '/teacher/teacherQualification',
    method: 'post',
    data: data
  })
}

/* 删除图片 */
export function delFile(attachIds) {
  return request({
    url: '/teacher/teacherQualification/attachment/' + attachIds,
    method: 'delete'
  })
}