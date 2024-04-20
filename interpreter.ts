import { BinaryExpr_t, Expr, ExprType, Stmt } from "./ast.ts";
import {
  FloatValue,
  IntegerValue,
  NullValue,
  RuntimeValue,
  ValueType,
} from "./runtime.ts";

function evaluate(node: Stmt | Expr): RuntimeValue {
  switch (node.tag) {
    case ExprType.INTEGER:
      return IntegerValue(node.value);
    case ExprType.FLOAT:
      return FloatValue(node.value);
    case ExprType.NULL:
      return NullValue();
    case ExprType.BINARY:
      return evalBinaryExpr(node);
    default:
      return NullValue();
  }
}

export function interpret(stmts: Stmt[]): RuntimeValue {
  let lastEval: RuntimeValue = NullValue();
  for (const stmt of stmts) {
    lastEval = evaluate(stmt);
  }
  return lastEval;
}

function evalBinaryExpr(expr: BinaryExpr_t): RuntimeValue {
  const lhs = evaluate(expr.left);
  const rhs = evaluate(expr.right);
  if (lhs.tag !== rhs.tag) {
    throw new Error(`error: operands of different types`);
  }
  switch (expr.operator) {
    case "+":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value + (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value + (rhs.value as number));
      }
      throw new Error("error: operands for `+` must be of type int or float");
    case "-":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value - (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value - (rhs.value as number));
      }
      throw new Error("error: operands for `-` must be of type int or float");
    case "*":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value * (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value * (rhs.value as number));
      }
      throw new Error("error: operands for `*` must be of type int or float");
    case "/":
      if (lhs.tag === ValueType.INTEGER) {
        if (rhs.value === 0n) {
          throw new Error("error: division by zero not allowed");
        }
        return IntegerValue(lhs.value / (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        if (rhs.value === 0) {
          throw new Error("error: division by zero not allowed");
        }
        return FloatValue(lhs.value / (rhs.value as number));
      }
      throw new Error("error: operands for `/` must be of type int or float");
    case "%":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value % (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value % (rhs.value as number));
      }
      throw new Error("error: operands for `%` must be of type int or float");
    default:
      throw new Error(`unable to evaluate binary operator '${expr.operator}'`);
  }
}
