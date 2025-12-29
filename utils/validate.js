/**
 * 路径匹配器
 * @param {string} pattern
 * @param {string} path
 * @returns {Boolean}
 */
export function isPathMatch(pattern, path) {
  const regexPattern = pattern.replace(/\//g, '\\/').replace(/\*\*/g, '.*').replace(/\*/g, '[^\\/]*')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

/**
 * 判断value字符串是否为空 
 * @param {string} value
 * @returns {Boolean}
 */
export function isEmpty(value) {
  if (value == null || value == "" || value == undefined || value == "undefined") {
    return true
  }
  return false
}

/**
 * 判断url是否是http或https 
 * @param {string} url
 * @returns {Boolean}
 */
export function isHttp(url) {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  return typeof str === 'string' || str instanceof String
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

/* 校验身份证格式 */
export function isValidChineseID(idcard) {
     let socialNo = idcard;
      if(socialNo === '') {
        return;
      }
      if (socialNo.length !== 15 && socialNo.length !== 18) {
        return false;
      }
      /* let area={11:'北京',12:'天津',13:'河北',14:'山西',15:'内蒙古',21:'辽宁',22:'吉林',23:'黑龙江',31:'上海',32:'江苏',33:'浙江',34:'安徽',35:'福建',36:'江西',37:'山东',41:'河南',42:'湖北',43:'湖南',44:'广东',45:'广西',46:'海南',50:'重庆',51:'四川',52:'贵州',53:'云南',54:'西藏',61:'陕西',62:'甘肃',63:'青海',64:'宁夏',65:'新疆',71:'台湾',81:'香港',82:'澳门',91:'国外'};
      if(area[parseInt(socialNo.substr(0,2))]===null) {
        return '身份证号码不正确(地区非法)!';
      } */
      if (socialNo.length === 15) {
        let pattern= /^\d{15}$/;
        if (pattern.exec(socialNo)===null){
        return false;
        }
        let birth = parseInt('19' + socialNo.substr(6,2));
        let month = socialNo.substr(8,2);
        let day = parseInt(socialNo.substr(10,2));
        switch(month) {
          case '01':
          case '03':
          case '05':
          case '07':
          case '08':
          case '10':
          case '12':
            if(day>31) {
        return false;
            }
            break;
          case '04':
          case '06':
          case '09':
          case '11':
            if(day>30) {
        return false;
            }
            break;
          case '02':
            if((birth % 4 === 0 && birth % 100 !== 0) || birth % 400 === 0) {
              if(day>29) {
        return false;
              }
            } else if(day>28) {
        return false;
              }
            break;
          default:
        return false;
        }
        let nowYear = new Date().getYear();
        if(nowYear - parseInt(birth)<15 || nowYear - parseInt(birth)>100) {
        return false;
        }
        return '';
      }
      let Wi = new Array(
        7,9,10,5,8,4,2,1,6,
        3,7,9,10,5,8,4,2,1
      );
      let lSum = 0;
      let nNum = 0;
      // let nCheckSum = 0;
      for (let i = 0; i < 17; ++i) {
        if ( socialNo.charAt(i) < '0' || socialNo.charAt(i) > '9' ) {
        return false;
        } else {
          nNum = socialNo.charAt(i) - '0';
        }
        lSum += nNum * Wi[i];
      }
      if( socialNo.charAt(17) === 'X' || socialNo.charAt(17) === 'x') {
        lSum += 10*Wi[17];
      } else if ( socialNo.charAt(17) < '0' || socialNo.charAt(17) > '9' ) {
        return false;
      } else {
        lSum += ( socialNo.charAt(17) - '0' ) * Wi[17];
      }
      if ( (lSum % 11) === 1 ) {
        return '';
      } else {
        return false;
      }
}
