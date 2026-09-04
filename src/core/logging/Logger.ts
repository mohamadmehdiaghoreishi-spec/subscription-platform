export interface LogFields {
  [key: string]: unknown;
}

export class Logger {

  static info(
    event: string,
    fields: LogFields = {}
  ): void {

    Logger.write("info", event, fields);

  }

  static warn(
    event: string,
    fields: LogFields = {}
  ): void {

    Logger.write("warn", event, fields);

  }

  static error(
    event: string,
    fields: LogFields = {}
  ): void {

    Logger.write("error", event, fields);

  }

  private static write(
    level: "info" | "warn" | "error",
    event: string,
    fields: LogFields
  ): void {

    const line = {
      level,
      event,
      timestamp: new Date().toISOString(),
      ...fields
    };

    const output = JSON.stringify(line);

    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }

  }

}
