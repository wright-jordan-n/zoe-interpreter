import { Expr, ExprType, Stmt } from "./ast.ts";
import { FloatValue, IntegerValue, NullValue, RuntimeValue } from "./values.ts";

export function evaluate(node: Stmt | Expr): RuntimeValue {
  switch (node.tag) {
    case ExprType.INTEGER:
      return IntegerValue(node.value);
    case ExprType.FLOAT:
      return FloatValue(node.value);
    case ExprType.NULL:
      return NullValue();
    default:
      return NullValue();
  }
}
