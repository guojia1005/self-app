import {
	selectDict
} from "@/api/system/dict/data.js";
/* 转码 */
export function dataFormat(data, flag) {
	let formatData = [];
	for (let i = 0; i < data.length; i++) {
		let list = {}
		if (flag === 'role') {
			if (data[i].roleId === 2 || data[i].roleId === 100) {
				list.text = data[i].roleName;
				list.value = data[i].roleId;
				formatData.push(list);
			}
		} else if (flag === 'dept') {
			list.text = data[i].deptName;
			list.value = data[i].deptId;
			formatData.push(list);
		} else if (flag === 'dict') {
			list.text = data[i].dictLabel;
			list.value = data[i].dictValue;
			list.code = data[i].dictCode;
			formatData.push(list);
		}
	}
	return formatData;
}

/* 合并数组并去重 */
export function mergeAndDeduplicate(arr1, arr2) {
	const combined = [...arr1, ...arr2];
	const uniqueSet = new Set(combined);
	return Array.from(uniqueSet);
}

/* 图片url转为base64 */

export function convertImageToBase64(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'Anonymous'; // 处理跨域图片
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			const base64 = canvas.toDataURL('image/png');
			resolve(base64);
		};
		img.onerror = reject;
		img.src = url;
	});
}

/* 门店转码 */
export function transformDeptData(data) {
	return data.map(item => {
		if (item.children) {
			item.children = transformDeptData(item.children); // 递归调用处理子数组
		}
		return {
			value: item.deptId, // 将 deptId 替换为 value
			text: item.deptName, // 将 deptName 替换为 text
			children: item.children // 保持原有的 children 或新的 children 数组
		};
	});
}

/* 根据出生日期计算年龄 */
export function calculateAge(birthDate) {
	const today = new Date();
	const birth = new Date(birthDate);
	let age = today.getFullYear() - birth.getFullYear();
	const monthDifference = today.getMonth() - birth.getMonth();
	if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}

/* 生成当天和后三天得日期 */
export function generateDates() {
	const dates = [];
	for (let i = 0; i < 4; i++) {
		const date = new Date();
		date.setDate(date.getDate() + i);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		dates.push(`${year}-${month}-${day}`);
	}
	return dates;
}

/* 替换时间字符 */
export function transTime(val) {
	if (!val) {
		return
	}
	let originalString = val;
	let newChar = "-"; // 你想替换的字符

	// 将字符串转换为数组
	let stringArray = originalString.split('');
	// 替换第五个字符
	stringArray[16] = newChar; // 注意：数组索引是从0开始的，所以第五个字符的索引是4
	// 将数组转换回字符串
	let newString = stringArray.join('');

	return newString
}

// 字典转码
export function dictFormat(data, val) {
	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			if (val === data[i].value) {
				return data[i].text
			}
		}
	} else {
		return ''
	}
}

export function getDict(val) {
	selectDict(val).then(response => {
		if (response.code === 200) {
			return dataFormat(response.data, 'dict');
		}
	})
}

// 页面文字转码根据value转为text
export function getNewDict(dict, val) {
	let result = '';
	let data = [];

	return new Promise((resolve, reject) => {
		try {
			selectDict(dict).then(res => {
				if (res.code === 200) {
					let resData = res.data;
					for (let i = 0; i < resData.length; i++) {
						let list = {};
						list.text = resData[i].dictLabel;
						list.value = resData[i].dictValue;
						list.code = resData[i].dictCode;
						data.push(list);
					}
					for (let j = 0; j < data.length; j++) {
						if (val === data[j].value) {
							result = data[j].text
							break;
						}
					}
					resolve(result); // ✅ 使用 resolve 返回结果
				}
			})
		} catch (err) {
			reject(error); // ✅ 使用 reject 返回错误
		}
	});
}

// 根据value获取code
export function transCode(val, type) {
	return new Promise((resolve, reject) => {
		selectDict(type).then(response => {
			if (response.code === 200) {
				let data = response.data;
				for (let i = 0; i < data.length; i++) {
					if (val === data[i].dictValue) {
						resolve(data[i].dictCode); // ✅ 使用 resolve 返回结果
					}
				}
			}
		})
	})
}

// 获取字典数据option
export function getDictOption(val) {
	return new Promise((resolve, reject) => {
		selectDict(val).then(response => {
			if (response.code === 200) {
				let data = response.data;
				let formatData = [];
				for (let i = 0; i < data.length; i++) {
					let list = {}
					list.text = data[i].dictLabel;
					list.value = data[i].dictValue;
					list.code = data[i].dictCode;
					formatData.push(list);
				}
				resolve(formatData); // ✅ 使用 resolve 返回结果
			}
		})
	})
}