/**
 * 转换捕获的异常
 *
 * @param {any} exception 捕获的原始异常
 * @returns {Error} 转换后的异常
 */
export const formatException = (exception: any): Error => {
  return exception instanceof Error ? exception : new Error(exception || exception.toString());
};
