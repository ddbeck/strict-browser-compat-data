import {
  FlagStatement,
  SimpleSupportStatement,
  VersionValue,
} from "@mdn/browser-compat-data";

export function statement(
  incoming: Partial<SimpleSupportStatement> | RealSupportStatement,
): SupportStatement {
  if (incoming instanceof RealSupportStatement) {
    return incoming;
  }

  if (incoming instanceof SupportStatement) {
    return statement(incoming.data);
  }

  try {
    return new RealSupportStatement(incoming);
  } catch (err) {
    if (err instanceof NonRealValueError) {
      return new SupportStatement(incoming);
    }
    throw err;
  }
}

export class NonRealValueError extends Error {
  constructor(name: "version_added" | "version_removed", value: unknown) {
    super(`${name} of ${value} is not a BCD real value`);
  }
}

export class SupportStatement {
  data: Partial<SimpleSupportStatement>;

  constructor(data: Partial<SimpleSupportStatement>) {
    this.data = data;
  }

  _isRanged(key: "version_added" | "version_removed" | undefined): boolean {
    if (key === undefined) {
      return (
        this._isRanged("version_added") || this._isRanged("version_removed")
      );
    }

    const version = this.data?.[key];

    if (
      typeof version === "boolean" ||
      version === undefined ||
      version === null
    ) {
      return false;
    }

    return version.includes("≤");
  }

  hasCaveats(): boolean {
    return (
      this.data.alternative_name !== undefined ||
      this.flags.length > 0 ||
      this.partial_implementation === true ||
      this.data.prefix !== undefined
    );
  }

  get flags(): FlagStatement[] {
    return this.data?.flags ?? [];
  }

  get partial_implementation(): boolean {
    // Strictness guarantee: unset partial_implementation returns false
    return this.data?.partial_implementation ?? false;
  }

  get version_added(): VersionValue {
    // Strictness guarantee: unset version_added returns false
    return this.data?.version_added || false;
  }

  get version_removed(): VersionValue {
    // Strictness guarantee: unset version_removed returns false
    return this.data?.version_removed || false;
  }
}

export class RealSupportStatement extends SupportStatement {
  constructor(data: Partial<SimpleSupportStatement>) {
    // Strictness guarantee: Support statements never contain non-real values

    super(data);

    if (!Object.hasOwn(data, "version_added")) {
      throw new Error("version_added missing from simple support statement");
    }

    const { version_added } = data;
    if (!(typeof version_added === "string" || version_added === false)) {
      throw new NonRealValueError("version_added", version_added);
    }

    if (Object.hasOwn(data, "version_removed")) {
      const { version_removed } = data;
      if (!(typeof version_removed === "string" || version_removed === false)) {
        throw new NonRealValueError("version_added", version_removed);
      }
    }
  }
}
