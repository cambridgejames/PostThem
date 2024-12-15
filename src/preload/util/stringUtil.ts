/**
 * 判断字符串是否为空
 *
 * @param value 字符串
 */
export const isEmpty = (value: string | undefined | null): boolean => {
  return value === null || value === undefined || value === "";
};
