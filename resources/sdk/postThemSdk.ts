/**
 * Before切面处理方法
 */
export type BeforeAspect = <T extends any[]>(...args: T) => T;

/**
 * 创建切点
 */
export type CreateAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string) => T;

/**
 * 注册Before切面处理方法
 */
export type RegisterBefore = (aspectName: string, aspectMethod: BeforeAspect) => void;

/**
 * 切面工具类
 */
export interface AspectUtilsType {
  createAspectProxy: CreateAspectProxy;
  registerBefore: RegisterBefore;
}
