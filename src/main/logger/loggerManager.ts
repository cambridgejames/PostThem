import { is } from "@electron-toolkit/utils";
import log4js, { Configuration, FileAppender, Logger, LogLevelFilterAppender } from "log4js";
import { LoggerLevel } from "@interface/common";

import * as path from "node:path";
import * as fs from "node:fs";

const LOG_ENCODING: string = "utf-8";

const LOG_FILE_DIR_NAME: string = "log";
const LOG_FILE_SUB_DIR_NORMAL: string = ".";
const LOG_FILE_SUB_DIR_PLUGIN: string = "plugins";

const LOG_FILE_MAX_SIZE: number = 50 * 1024 * 1024;
const LOG_FILE_BACKUP_NUM: number = 10;

/**
 * 日志管理器
 */
export class LoggerManager {
  private static INSTANCE: LoggerManager;

  private loggerConfigure: Configuration;

  private constructor() {
    this.loggerConfigure = {
      appenders: {
        console: { type: "console", level: LoggerLevel.TRACE, encoding: LOG_ENCODING },
      },
      categories: {
        default: { appenders: ["console"], level: LoggerLevel.TRACE },
      },
    };
  }

  /**
   * 获取日志管理器实例
   *
   * @return {LoggerManager} 日志管理器实例
   */
  public static getInstance(): LoggerManager {
    if (!this.INSTANCE) {
      this.INSTANCE = new LoggerManager();
    }
    return this.INSTANCE;
  }

  /**
   * 获取默认logger
   *
   * @param {string} loggerName logger名称
   * @returns {Logger} 默认logger
   */
  public getNormalLogger(loggerName: string): Logger {
    const loggerKey = `Normal_${loggerName}`;
    this.createLogger(loggerKey, LOG_FILE_SUB_DIR_NORMAL);
    return log4js.getLogger(loggerKey);
  }

  /**
   * 获取插件logger
   *
   * @param {string} loggerName logger名称
   * @returns {Logger} 插件logger
   */
  public getPluginLogger(loggerName: string): Logger {
    const loggerKey = `Plugin_${loggerName}`;
    this.createLogger(loggerKey, LOG_FILE_SUB_DIR_PLUGIN);
    return log4js.getLogger(loggerKey);
  }

  /**
   * 创建指定的logger
   *
   * @param {string} loggerName logger名称
   * @param {string} pathToLogFile 日志文件路径
   * @private
   */
  private createLogger(loggerName: string, pathToLogFile: string): void {
    if (this.loggerConfigure.appenders[loggerName]) {
      return; // 已经创建配置文件的直接返回
    }
    this.createLogDir(path.join(LOG_FILE_DIR_NAME, pathToLogFile));
    const filterLoggerName: string = `Filter_${loggerName}`;
    const currentFileAppender: FileAppender = {
      type: "file",
      filename: path.join(LOG_FILE_DIR_NAME, pathToLogFile, `${loggerName}.log`),
      maxLogSize: LOG_FILE_MAX_SIZE,
      backups: LOG_FILE_BACKUP_NUM,
      compress: true,
      encoding: LOG_ENCODING,
    };
    const currentFileFilterAppender: LogLevelFilterAppender = {
      type: "logLevelFilter",
      level: LoggerLevel.INFO, // 过滤日志等级，文件中只能写入高于INFO等级的日志
      appender: loggerName,
    };
    this.loggerConfigure = {
      appenders: {
        ...this.loggerConfigure.appenders,
        [loggerName]: currentFileAppender,
        [filterLoggerName]: currentFileFilterAppender,
      },
      categories: {
        ...this.loggerConfigure.categories,
        [loggerName]: {
          appenders: (is.dev && process.env["ELECTRON_RENDERER_URL"]) ? [filterLoggerName, "console"] : [filterLoggerName],
          level: LoggerLevel.TRACE,
        },
      },
    };
    log4js.configure(this.loggerConfigure);
  }

  /**
   * 创建日志目录
   *
   * @param {string} pathToDir 日志的相对目录
   * @private
   */
  private createLogDir(pathToDir: string): void {
    const logDirectory = path.join(".", pathToDir);
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
  }
}
