"use strict";
const BASE = 1e8;
function getCut(exponent, precision, length, fractionLength) {
  const negative = exponent.charAt(0) === "-";
  const text = exponent.replace(/^[+-]?0*/, "") || "0";
  if (text.length > 17) {
    return negative ? -1 : length;
  }
  const sign = negative ? -1 : 1;
  const offset = length - fractionLength;
  const precisionLow = precision % BASE;
  const offsetLow = offset % BASE;
  let high = sign * Number(text.slice(0, -8) || "0") + (precision - precisionLow) / BASE + (offset - offsetLow) / BASE;
  let low = sign * Number(text.slice(-8)) + precisionLow + offsetLow;
  high += Math.floor(low / BASE);
  low = (low % BASE + BASE) % BASE;
  if (high < 0) {
    return -1;
  }
  const lengthLow = length % BASE;
  const lengthHigh = (length - lengthLow) / BASE;
  if (high > lengthHigh || high === lengthHigh && low >= lengthLow) {
    return length;
  }
  return high * BASE + low;
}
function increment(text) {
  let index = text.length - 1;
  while (index >= 0 && text.charAt(index) === "9") {
    index--;
  }
  if (index < 0) {
    return "1" + "0".repeat(text.length);
  }
  return text.slice(0, index) + String(Number(text.charAt(index)) + 1) + "0".repeat(text.length - index - 1);
}
function toDecimal(val, precision = 0) {
  if (typeof precision === "string" && precision.trim() !== "") {
    precision = Number(precision);
  }
  if (!Number.isSafeInteger(precision)) {
    throw new RangeError("precision 必须是安全整数");
  }
  if (val === null || val === void 0 || typeof val === "string" && val.trim() === "") {
    return 0;
  }
  if (typeof val !== "number" && typeof val !== "string") {
    throw new TypeError("val 必须是有限数字或十进制数字字符串");
  }
  const source = String(val).trim();
  const match = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(source);
  if (!match) {
    throw new TypeError("val 必须是有限数字或十进制数字字符串");
  }
  const numberValue = Number(source);
  if (!Number.isFinite(numberValue)) {
    throw new RangeError("val 超出 Number 的有限数值范围");
  }
  const negative = match[1] === "-" || Object.is(val, -0);
  const fraction = match[3] || match[4] || "";
  const digits = ((match[2] || "") + fraction).replace(/^0+/, "");
  if (digits === "") {
    return negative ? -0 : 0;
  }
  const cut = getCut(match[5] || "0", precision, digits.length, fraction.length);
  if (cut >= digits.length) {
    return numberValue;
  }
  if (cut < 0) {
    return negative ? -0 : 0;
  }
  const nextDigit = digits.charCodeAt(cut) - 48;
  const roundUp = nextDigit > 5 || nextDigit === 5 && (!negative || /[1-9]/.test(digits.slice(cut + 1)));
  let integer = digits.slice(0, cut) || "0";
  if (roundUp) {
    integer = increment(integer);
  }
  const result = Number(`${negative ? "-" : ""}${integer}e${-precision}`);
  if (!Number.isFinite(result)) {
    throw new RangeError("舍入结果超出 Number 的有限数值范围");
  }
  return result;
}
exports.toDecimal = toDecimal;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/toDecimal.js.map
