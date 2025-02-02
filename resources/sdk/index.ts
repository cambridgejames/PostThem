/**
 * 目标函数代理类型
 *
 * @template T 目标函数的类型
 */
export interface ProceedingTarget<T extends (...args: any[]) => any> {
  /**
   * 获取切点名称
   *
   * @return {string} 切点名称
   */
  getAspectName(): string;

  /**
   * 获取目标函数的入参
   *
   * @return {Parameters<T>} 目标函数的入参
   */
  getArgs(): Parameters<T>;

  /**
   * 执行目标函数的原函数
   *
   * @return {ReturnType<T>} 目标函数的返回值
   */
  proceed(): ReturnType<T>;
}

/**
 * Before切面处理函数
 *
 * 用于插件系统中的切面处理函数，在目标函数执行之前改变其入参。
 * 如果对同一个切点注册了多个Before切面处理函数，它们将按照注册的顺序依次执行。
 *
 * @template T 目标函数的入参类型
 * @param {...T} args 目标函数的原始入参
 * @return {T} 处理后的入参
 *
 * @example
 * const logArguments: BeforeAspect = <T extends any[]>(...args: T): T => {
 *   console.log("参数：", args);
 *   return args;
 * };
 */
export type BeforeAspect = <T extends any[]>(...args: T) => T;

/**
 * Around切面处理函数
 *
 *
 * 用于插件系统中的切面处理函数，在目标函数执行之前改变其入参。
 * 如果对同一个切点注册了多个Around切面处理函数，它们将按照注册的顺序依次执行。
 *
 * 必须在切面处理函数中调用`target.proceed()`函数，否则会影响原函数及其他切面处理函数的运行。
 *
 * @template T 目标函数的类型
 * @param {ProceedingTarget<T>} target 目标函数代理对象
 * @return {ReturnType<T>} 处理后的返回值
 *
 * @example
 * const logFunction: AroundAspect = <T extends (...args: any[]) => any>(target: ProceedingTarget<T>): ReturnType<T> => {
 *   console.log("参数：", ...target.getArgs());
 *   const returnValue = target.proceed();
 *   console.log("返回值：", returnValue);
 *   return returnValue;
 * }
 */
export type AroundAspect = <T extends (...args: any[]) => any>(target: ProceedingTarget<T>) => ReturnType<T>;

/**
 * After切面处理函数
 *
 * 用于插件系统中的切面处理函数，在目标函数执行之后改变其返回值。
 * 如果对同一个切点注册了多个After切面处理函数，它们将按照与注册顺序相反的顺序依次执行。
 *
 * @template T 目标函数的返回值类型
 * @param {...T} returnValue 目标函数的原始返回值
 * @return {T} 处理后的返回值
 *
 * @example
 * const logReturnValue: AfterAspect = <T>(returnValue: T): T => {
 *   console.log("返回值：", returnValue);
 *   return returnValue;
 * };
 */
export type AfterAspect = <T>(returnValue: T) => T;

/**
 * 创建切点
 *
 * 为目标函数创建代理，生成的代理函数调用方法与目标函数相同。调用代理函数时会自动从插件系统中查找并按顺序调用切面处理函数。
 *
 * 如果在`manifest.json`的`aspect.provide`字段中没有声明切点名称，则对应的切点注册不会生效，调用代理函数时将原函数仍会执行，但不会触发切面处理函数。
 *
 * @template T 目标函数的类型
 * @param {T} target 目标函数
 * @param {string} aspectName 切点名称
 * @return {T} 目标函数的代理函数
 *
 * @example
 * const joinString = (...args: string[]): string => {
 *   return args.join(", ");
 * };
 * const joinStringProxy = window.sdk.aspect.createAspectProxy(joinString, "example.joinString");
 * joinString("Hello", "World"); // 不会触发切面处理函数
 * joinStringProxy("Hello", "World"); // 会触发切面处理函数
 */
export type CreateAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string) => T;

/**
 * 注册Before切面处理函数
 *
 * 用于向插件系统注册Before切面处理函数，在目标函数执行之前改变其入参。
 * 如果对同一个切点注册了多个Before切面处理函数，它们将按照注册的顺序依次执行。
 *
 * 为了保证切面处理函数能够按照插件加载顺序执行，请尽量在插件的生命周期函数`onMount()`中注册切面处理函数。
 *
 * @param {string} aspectName 切点名称
 * @param {BeforeAspect} aspectMethod Before切面处理函数
 *
 * @example
 * const logArguments: BeforeAspect = <T extends any[]>(...args: T): T => {
 *   console.log("参数：", args);
 *   return args;
 * };
 * window.sdk.aspect.registerBefore("example.joinString", logArguments);
 */
export type RegisterBefore = (aspectName: string, aspectMethod: BeforeAspect) => void;

/**
 * Around切面处理函数
 *
 *
 * 用于插件系统中的切面处理函数，在目标函数执行之前改变其入参。
 * 如果对同一个切点注册了多个Around切面处理函数，它们将按照注册的顺序依次执行。
 *
 * 为了保证切面处理函数能够按照插件加载顺序执行，请尽量在插件的生命周期函数`onMount()`中注册切面处理函数。
 *
 * @param {string} aspectName 切点名称
 * @param {AroundAspect} aspectMethod Around切面处理函数
 *
 * @example
 * const logFunction: AroundAspect = <T extends (...args: any[]) => any>(target: ProceedingTarget<T>): ReturnType<T> => {
 *   console.log("参数：", ...target.getArgs());
 *   const returnValue = target.proceed();
 *   console.log("返回值：", returnValue);
 *   return returnValue;
 * }
 * window.sdk.aspect.registerAround("example.joinString", logFunction);
 */
export type RegisterAround = (aspectName: string, aspectMethod: AroundAspect) => void;

/**
 * 注册After切面处理函数
 *
 * 用于向插件系统注册After切面处理函数，在目标函数执行之后改变其返回值。
 * 如果对同一个切点注册了多个After切面处理函数，它们将按照与注册顺序相反的顺序依次执行。
 *
 * 为了保证切面处理函数能够按照插件加载顺序执行，请尽量在插件的生命周期函数`onMount()`中注册切面处理函数。
 *
 * @param {string} aspectName 切点名称
 * @param {AfterAspect} aspectMethod After切面处理函数
 *
 * @example
 * const logReturnValue: AfterAspect = <T>(returnValue: T): T => {
 *   console.log("返回值：", returnValue);
 *   return returnValue;
 * };
 * window.sdk.aspect.registerAfter("example.joinString", logReturnValue);
 */
export type RegisterAfter = (aspectName: string, aspectMethod: AfterAspect) => void;

/**
 * 切面工具类
 */
export interface AspectUtilsType {
  createAspectProxy: CreateAspectProxy;
  registerBefore: RegisterBefore;
  registerAround: RegisterAround;
  registerAfter: RegisterAfter;
}
