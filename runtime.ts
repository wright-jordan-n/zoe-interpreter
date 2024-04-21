export enum ValueType {
  NULL,
  FLOAT,
  INTEGER,
  BOOLEAN,
  OBJECT,
}

export type RuntimeValue =
  | NullValue_t
  | FloatValue_t
  | IntegerValue_t
  | BooleanValue_t
  | ObjectValue_t;

interface NullValue_t {
  tag: ValueType.NULL;
  value: null;
}

export function NullValue(): NullValue_t {
  return {
    tag: ValueType.NULL,
    value: null,
  };
}

interface FloatValue_t {
  tag: ValueType.FLOAT;
  value: number;
}

export function FloatValue(value: number): FloatValue_t {
  return {
    tag: ValueType.FLOAT,
    value,
  };
}

interface IntegerValue_t {
  tag: ValueType.INTEGER;
  value: bigint;
}

export function IntegerValue(value: bigint): IntegerValue_t {
  return {
    tag: ValueType.INTEGER,
    value,
  };
}

interface BooleanValue_t {
  tag: ValueType.BOOLEAN;
  value: boolean;
}

export function BooleanValue(value: boolean): BooleanValue_t {
  return {
    tag: ValueType.BOOLEAN,
    value,
  };
}

interface ObjectValue_t {
  tag: ValueType.OBJECT;
  value: Map<string, RuntimeValue>;
}

export function ObjectValue(
  value: Map<string, RuntimeValue>,
): ObjectValue_t {
  return {
    tag: ValueType.OBJECT,
    value,
  };
}
