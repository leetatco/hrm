"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const util = {};
util.getTargetTimezone = function(val) {
  if (typeof val === "number") {
    return val;
  }
  let vk = common_vendor.index.vk;
  let defaultValue = 8;
  let targetTimezone = defaultValue;
  try {
    const config = vk.callFunctionUtil.getConfig();
    targetTimezone = config.targetTimezone;
    if (typeof targetTimezone !== "number") {
      targetTimezone = defaultValue;
    }
  } catch (err) {
  }
  return targetTimezone;
};
util.getDateObject = function(date, targetTimezone) {
  if (!date)
    return "";
  let nowDate;
  if (typeof date === "string" && !isNaN(date) && date.length >= 10)
    date = Number(date);
  if (typeof date === "number") {
    if (date.toString().length == 10)
      date *= 1e3;
    nowDate = new Date(date);
  } else if (typeof date === "object") {
    nowDate = new Date(date.getTime());
  } else if (typeof date === "string") {
    targetTimezone = util.getTargetTimezone(targetTimezone);
    let targetTimezoneStr = targetTimezone;
    let targetTimezoneF = targetTimezone >= 0 ? "+" : "";
    if (targetTimezone >= 0 && targetTimezone < 10) {
      targetTimezoneStr = `0${targetTimezone}`;
    } else if (targetTimezone < 0 && targetTimezone > -10) {
      targetTimezoneStr = `-0${targetTimezone * -1}`;
    }
    let arr1 = date.split(" ");
    let arr1_1 = arr1[0] || "";
    let arr1_2 = arr1[1] || "";
    let arr2;
    if (arr1_1.indexOf("-") > -1) {
      arr2 = arr1_1.split("-");
    } else {
      arr2 = arr1_1.split("/");
    }
    let arr3 = arr1_2.split(":");
    let dateObj = {
      year: Number(arr2[0]),
      month: Number(arr2[1]) || 1,
      day: Number(arr2[2]) || 1,
      hour: Number(arr3[0]) || 0,
      minute: Number(arr3[1]) || 0,
      second: Number(arr3[2]) || 0
    };
    for (let key in dateObj) {
      if (dateObj[key] >= 0 && dateObj[key] < 10)
        dateObj[key] = `0${dateObj[key]}`;
    }
    let dateStr = `${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}${targetTimezoneF}${targetTimezoneStr}:00`;
    nowDate = new Date(dateStr);
  }
  return nowDate;
};
util.getTimeByTimeZone = function(date, targetTimezone) {
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  let timezoneOffset = nowDate.getTimezoneOffset();
  let offset = timezoneOffset * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let targetTime = nowDate.getTime() + offset;
  nowDate = new Date(targetTime);
  return nowDate;
};
util.timeFormat = function(date, fmt = "yyyy-MM-dd hh:mm:ss", targetTimezone) {
  try {
    if (!date)
      return "";
    targetTimezone = util.getTargetTimezone(targetTimezone);
    let nowDate = util.getTimeByTimeZone(date, targetTimezone);
    let opt = {
      "M+": nowDate.getMonth() + 1,
      //月份
      "d+": nowDate.getDate(),
      //日
      "h+": nowDate.getHours(),
      //小时
      "m+": nowDate.getMinutes(),
      //分
      "s+": nowDate.getSeconds(),
      //秒
      "q+": Math.floor((nowDate.getMonth() + 3) / 3),
      //季度
      "S": nowDate.getMilliseconds(),
      //毫秒
      "Z": `${targetTimezone >= 0 ? "+" : "-"}${Math.abs(targetTimezone).toString().padStart(2, "0")}:00`
      // 时区
    };
    let regex = new RegExp("(y+)");
    if (regex.test(fmt)) {
      let fmtMatch = fmt.match(regex);
      fmt = fmt.replace(fmtMatch[1], (nowDate.getFullYear() + "").substr(4 - fmtMatch[1].length));
    }
    for (let k in opt) {
      let regex2 = new RegExp("(" + k + ")");
      if (regex2.test(fmt)) {
        let fmtMatch = fmt.match(regex2);
        fmt = fmt.replace(fmtMatch[1], fmtMatch[1].length == 1 ? opt[k] : ("00" + opt[k]).substr(("" + opt[k]).length));
      }
    }
    return fmt;
  } catch (err) {
    return time;
  }
};
util.getDateInfo = function(date = /* @__PURE__ */ new Date(), targetTimezone) {
  let nowDate = util.getTimeByTimeZone(date, targetTimezone);
  let year = nowDate.getFullYear() + "";
  let month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
  let day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
  let hour = nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours();
  let minute = nowDate.getMinutes() < 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
  let second = nowDate.getSeconds() < 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds();
  let millisecond = nowDate.getMilliseconds();
  let week = nowDate.getDay();
  let quarter = Math.floor((nowDate.getMonth() + 3) / 3);
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    millisecond: Number(millisecond),
    week: Number(week),
    quarter: Number(quarter)
  };
};
util.getCommonTime = function(date = /* @__PURE__ */ new Date(), targetTimezone) {
  let res = {};
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  const { year, month, day, hour, minute, second, millisecond, week, quarter } = util.getDateInfo(nowDate, targetTimezone);
  const oneDayTime = 24 * 60 * 60 * 1e3;
  res.now = {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
    week,
    quarter,
    date_str: util.timeFormat(nowDate, "yyyy-MM-dd hh:mm:ss", targetTimezone),
    date_day_str: util.timeFormat(nowDate, "yyyy-MM-dd", targetTimezone),
    date_month_str: util.timeFormat(nowDate, "yyyy-MM", targetTimezone)
  };
  let month_last_day = new Date(year, month, 0).getDate();
  let year_last_day = new Date(year, 12, 0).getDate();
  res.todayStart = (/* @__PURE__ */ new Date(`${year}/${month}/${day}`)).getTime() - timeDif;
  res.today12End = (/* @__PURE__ */ new Date(`${year}/${month}/${day}`)).getTime() + (12 * 60 * 60 * 1e3 - 1) - timeDif;
  res.todayEnd = (/* @__PURE__ */ new Date(`${year}/${month}/${day}`)).getTime() + (oneDayTime - 1) - timeDif;
  res.monthStart = (/* @__PURE__ */ new Date(`${year}/${month}/1`)).getTime() - timeDif;
  res.monthEnd = (/* @__PURE__ */ new Date(`${year}/${month}/${month_last_day}`)).getTime() + (oneDayTime - 1) - timeDif;
  res.yearStart = (/* @__PURE__ */ new Date(`${year}/1/1`)).getTime() - timeDif;
  res.yearEnd = (/* @__PURE__ */ new Date(`${year}/12/${year_last_day}`)).getTime() + (oneDayTime - 1) - timeDif;
  res.hourStart = (/* @__PURE__ */ new Date(`${year}/${month}/${day} ${hour}:00:00`)).getTime() - timeDif;
  res.hourEnd = (/* @__PURE__ */ new Date(`${year}/${month}/${day} ${hour}:59:59`)).getTime() - timeDif;
  let year_last = year;
  let month_last = month - 1;
  if (month_last === 0) {
    month_last = 12;
    year_last = year - 1;
  }
  let month_last_day_last = new Date(year_last, month_last, 0).getDate();
  res.lastMonthStart = (/* @__PURE__ */ new Date(`${year_last}/${month_last}/1`)).getTime() - timeDif;
  res.lastMonthEnd = (/* @__PURE__ */ new Date(`${year_last}/${month_last}/${month_last_day_last}`)).getTime() + (oneDayTime - 1) - timeDif;
  res.yesterdayStart = res.todayStart - 1e3 * 3600 * 24;
  res.yesterday12End = res.today12End - 1e3 * 3600 * 24;
  res.yesterdayEnd = res.todayEnd - 1e3 * 3600 * 24;
  let weekObj = util.getWeekOffsetStartAndEnd(0, nowDate, targetTimezone);
  res.weekStart = weekObj.startTime;
  res.weekEnd = weekObj.endTime;
  res.months = [];
  res.months[0] = {
    startTime: res.monthStart,
    endTime: res.monthEnd,
    startTimeStr: util.timeFormat(res.monthStart, "yyyy-MM-dd hh:mm:ss", targetTimezone),
    endTimeStr: util.timeFormat(res.monthEnd, "yyyy-MM-dd hh:mm:ss", targetTimezone),
    monthStart: res.monthStart,
    // 兼容旧版
    monthEnd: res.monthEnd
    // 兼容旧版
  };
  for (let i = 1; i <= 12; i++) {
    let month_last_day2 = new Date(year, i, 0).getDate();
    let startTime = (/* @__PURE__ */ new Date(`${year}/${i}/1`)).getTime() - timeDif;
    let endTime = (/* @__PURE__ */ new Date(`${year}/${i}/${month_last_day2}`)).getTime() + (oneDayTime - 1) - timeDif;
    res.months[i] = {
      startTime,
      endTime,
      startTimeStr: util.timeFormat(startTime, "yyyy-MM-dd hh:mm:ss", targetTimezone),
      endTimeStr: util.timeFormat(endTime, "yyyy-MM-dd hh:mm:ss", targetTimezone),
      monthStart: startTime,
      // 兼容旧版
      monthEnd: endTime
      // 兼容旧版
    };
  }
  res.days = [];
  res.days[0] = {
    startTime: res.todayStart,
    endTime: res.todayEnd,
    startTimeStr: util.timeFormat(res.todayStart, "yyyy-MM-dd hh:mm:ss", targetTimezone),
    endTimeStr: util.timeFormat(res.todayEnd, "yyyy-MM-dd hh:mm:ss", targetTimezone)
  };
  for (let i = 1; i <= month_last_day; i++) {
    let nowTime = res.monthStart + (i - 1) * oneDayTime;
    let { startTime, endTime } = util.getDayOffsetStartAndEnd(0, nowTime, targetTimezone);
    res.days[i] = {
      startTime,
      endTime,
      startTimeStr: util.timeFormat(startTime, "yyyy-MM-dd hh:mm:ss", targetTimezone),
      endTimeStr: util.timeFormat(endTime, "yyyy-MM-dd hh:mm:ss", targetTimezone)
    };
  }
  for (let key in res) {
    if (typeof res[key] === "number" && res[key].toString().length === 13) {
      res[`${key}Str`] = util.timeFormat(res[key], "yyyy-MM-dd hh:mm:ss", targetTimezone);
    }
  }
  return res;
};
util.getMonthStartAndEnd = function(obj, targetTimezone) {
  targetTimezone = util.getTargetTimezone(targetTimezone);
  let res = {
    startTime: null,
    endTime: null
  };
  let { year, month } = obj;
  if (year > 0 && month > 0) {
    const dif = (/* @__PURE__ */ new Date()).getTimezoneOffset();
    const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
    let month_last_day = new Date(year, month, 0).getDate();
    res.startTime = (/* @__PURE__ */ new Date(`${year}/${month}/1`)).getTime() - timeDif;
    res.endTime = (/* @__PURE__ */ new Date(`${year}/${month}/${month_last_day}`)).getTime() + (24 * 60 * 60 * 1e3 - 1) - timeDif;
  }
  return res;
};
util.getHourOffsetStartAndEnd = function(count = 0, date = /* @__PURE__ */ new Date(), targetTimezone) {
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  let res = {};
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let offsetMillisecond = 1e3 * 60 * 60;
  nowDate = new Date(nowDate.getTime() + offsetMillisecond * 1 * count);
  let dateInfo = util.getDateInfo(nowDate);
  res.startTime = (/* @__PURE__ */ new Date(`${dateInfo.year}/${dateInfo.month}/${dateInfo.day} ${dateInfo.hour}:00:00`)).getTime() - timeDif;
  res.endTime = (/* @__PURE__ */ new Date(`${dateInfo.year}/${dateInfo.month}/${dateInfo.day} ${dateInfo.hour}:00:00`)).getTime() + (offsetMillisecond - 1) - timeDif;
  return res;
};
util.getDayOffsetStartAndEnd = function(count = 0, date = /* @__PURE__ */ new Date(), targetTimezone) {
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  let res = {};
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let offsetMillisecond = 1e3 * 60 * 60 * 24;
  nowDate = new Date(nowDate.getTime() + offsetMillisecond * 1 * count);
  let dateInfo = util.getDateInfo(nowDate);
  res.startTime = (/* @__PURE__ */ new Date(`${dateInfo.year}/${dateInfo.month}/${dateInfo.day}`)).getTime() - timeDif;
  res.endTime = (/* @__PURE__ */ new Date(`${dateInfo.year}/${dateInfo.month}/${dateInfo.day}`)).getTime() + (offsetMillisecond - 1) - timeDif;
  return res;
};
util.getWeekOffsetStartAndEnd = function(count = 0, date = /* @__PURE__ */ new Date(), targetTimezone) {
  let res = {};
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let nowDay = nowDate.getDay() === 0 ? 7 : nowDate.getDay();
  nowDate.setDate(nowDate.getDate() - nowDay + 1 + count * 7);
  let dateInfo1 = util.getDateInfo(nowDate);
  nowDate.setDate(nowDate.getDate() + 7);
  let dateInfo2 = util.getDateInfo(nowDate);
  res.startTime = (/* @__PURE__ */ new Date(`${dateInfo1.year}/${dateInfo1.month}/${dateInfo1.day}`)).getTime() - timeDif;
  res.endTime = (/* @__PURE__ */ new Date(`${dateInfo2.year}/${dateInfo2.month}/${dateInfo2.day}`)).getTime() - 1 - timeDif;
  return res;
};
util.getMonthOffsetStartAndEnd = function(count = 0, date = /* @__PURE__ */ new Date(), targetTimezone) {
  let res = {};
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let dateInfo = util.getDateInfo(nowDate);
  let month = dateInfo.month + count;
  let year = dateInfo.year;
  if (month > 12) {
    year = year + Math.floor(month / 12);
    month = Math.abs(month) % 12;
  } else if (month <= 0) {
    year = year - 1 - Math.floor(Math.abs(month) / 12);
    month = 12 - Math.abs(month) % 12;
  }
  let month_last_day = new Date(year, month, 0).getDate();
  res.startTime = (/* @__PURE__ */ new Date(`${year}/${month}/1`)).getTime() - timeDif;
  res.endTime = (/* @__PURE__ */ new Date(`${year}/${month}/${month_last_day}`)).getTime() + (24 * 60 * 60 * 1e3 - 1) - timeDif;
  return res;
};
util.getQuarterOffsetStartAndEnd = function(count = 0, date = /* @__PURE__ */ new Date(), targetTimezone) {
  let res = {};
  let nowDate = util.getDateObject(date);
  nowDate.setMonth(nowDate.getMonth() + count * 3);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let dateInfo = util.getDateInfo(nowDate);
  let month = dateInfo.month;
  if ([1, 2, 3].indexOf(month) > -1) {
    month = 1;
  } else if ([4, 5, 6].indexOf(month) > -1) {
    month = 4;
  } else if ([7, 8, 9].indexOf(month) > -1) {
    month = 7;
  } else if ([10, 11, 12].indexOf(month) > -1) {
    month = 10;
  }
  nowDate.setMonth(month - 1);
  let dateInfo1 = util.getDateInfo(nowDate);
  nowDate.setMonth(nowDate.getMonth() + 3);
  let dateInfo2 = util.getDateInfo(nowDate);
  res.startTime = (/* @__PURE__ */ new Date(`${dateInfo1.year}/${dateInfo1.month}/1`)).getTime() - timeDif;
  res.endTime = (/* @__PURE__ */ new Date(`${dateInfo2.year}/${dateInfo2.month}/1`)).getTime() - 1 - timeDif;
  return res;
};
util.getYearOffsetStartAndEnd = function(count = 0, date = /* @__PURE__ */ new Date(), targetTimezone) {
  let res = {};
  let nowDate = util.getDateObject(date);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let dateInfo = util.getDateInfo(nowDate);
  let year = dateInfo.year + count;
  res.startTime = (/* @__PURE__ */ new Date(`${year}/1/1`)).getTime() - timeDif;
  res.endTime = (/* @__PURE__ */ new Date(`${year}/12/31`)).getTime() + (24 * 60 * 60 * 1e3 - 1) - timeDif;
  return res;
};
util.getOffsetTime = function(date = /* @__PURE__ */ new Date(), obj, targetTimezone) {
  let nowDate = util.getDateObject(date);
  let dateInfo = util.getDateInfo(nowDate);
  targetTimezone = util.getTargetTimezone(targetTimezone);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  let year = obj.year || obj.y || 0;
  let month = obj.month || obj.m || 0;
  let day = obj.day || obj.d || 0;
  let hour = obj.hour || obj.hours || obj.hh || 0;
  let minute = obj.minute || obj.minutes || obj.mm || 0;
  let second = obj.second || obj.seconds || obj.ss || 0;
  let { mode = "after" } = obj;
  if (mode == "before") {
    year *= -1;
    month *= -1;
    day *= -1;
    hour *= -1;
    minute *= -1;
    second *= -1;
  }
  let offsetObj = {
    year: dateInfo.year + year,
    month: dateInfo.month + month,
    day: dateInfo.day + day,
    hour: dateInfo.hour + hour,
    minute: dateInfo.minute + minute,
    second: dateInfo.second + second
  };
  nowDate = new Date(offsetObj.year, offsetObj.month - 1, offsetObj.day, offsetObj.hour, offsetObj.minute, offsetObj.second);
  return nowDate.getTime() - timeDif;
};
util.isLeapYear = function(year) {
  if (typeof year === "undefined") {
    let { now } = util.getCommonTime();
    year = now.year;
  } else if (typeof year === "object") {
    let { now } = util.getCommonTime(year);
    year = now.year;
  }
  if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
    return true;
  } else {
    return false;
  }
};
util.isQingming = function(data = /* @__PURE__ */ new Date()) {
  let { now } = util.getCommonTime(data);
  let { year, month, day } = now;
  let key = false;
  if (util.isLeapYear(year) || util.isLeapYear(year - 1)) {
    if (month === 4 && day === 4) {
      key = true;
    }
  } else {
    if (month === 4 && day === 5) {
      key = true;
    }
  }
  return key;
};
util.getFullTime = function(date, type = 0, targetTimezone) {
  if (!date)
    return "";
  targetTimezone = util.getTargetTimezone(targetTimezone);
  let nowDate = util.getDateObject(date);
  const dif = nowDate.getTimezoneOffset();
  const timeDif = dif * 60 * 1e3 + targetTimezone * 60 * 60 * 1e3;
  const east8time = nowDate.getTime() + timeDif;
  nowDate = new Date(east8time);
  let YYYY = nowDate.getFullYear() + "";
  let MM = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
  let DD = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
  let hh = nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours();
  let mm = nowDate.getMinutes() < 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
  let ss = nowDate.getSeconds() < 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds();
  if (type === 2) {
    return {
      YYYY: Number(YYYY),
      MM: Number(MM),
      DD: Number(DD),
      hh: Number(hh),
      mm: Number(mm),
      ss: Number(ss),
      year: Number(YYYY),
      month: Number(MM),
      day: Number(DD),
      hour: Number(hh),
      minute: Number(mm),
      second: Number(ss)
    };
  } else if (type === 1) {
    return YYYY + "" + MM + DD + hh + mm + ss;
  } else {
    return YYYY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss;
  }
};
exports.util = util;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/timeUtil.js.map
