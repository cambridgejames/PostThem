export class PluginManager {
  private static INSTANCE: PluginManager;

  /**
   * 获取插件管理器实例
   *
   * @return {PluginManager} 插件管理器实例
   */
  public static getInstance(): PluginManager {
    if (!this.INSTANCE) {
      this.INSTANCE = new PluginManager();
    }
    return this.INSTANCE;
  }

  /**
   * 注册插件
   *
   * @param pluginName 插件名称
   */
  public register(pluginName: string): void {
    console.log(`Registered plugin: "${pluginName}".`); // TODO
  }
}

