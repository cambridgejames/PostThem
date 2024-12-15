declare global {
  interface FileUtils {}

  interface SettingsUtils {}

  interface StringUtils {}

  interface Util {
    FileUtils: FileUtils;
    SettingsUtils: SettingsUtils;
    StringUtils: StringUtils;
  }
}
