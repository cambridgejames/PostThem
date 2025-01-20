type CreateProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string) => T;

/**
 * 将方法注册为切面方法
 *
 * @param target 目标方法
 * @param aspectName 切面名称
 */
const createProxy: CreateProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    console.log(`Before calling target method, name: ${aspectName}, args: ${JSON.stringify(args)}`);
    const result = target(...args);
    console.log(`After calling target method, name: ${aspectName}, result: ${result}`);
    return result;
  }) as T;
};

/**
 * 切面工具类
 */
export interface AspectUtilsType {
  createProxy: CreateProxy;
}

export const AspectUtil: AspectUtilsType = {
  createProxy,
};
