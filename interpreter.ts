import {
  AssignmentExpr_t,
  BinaryExpr_t,
  BlockStmt_t,
  CallExpr_t,
  Expr,
  ExprStmt_t,
  IdentifierExpr_t,
  MemberExpr_t,
  NodeType,
  ObjectLiteralExpr_t,
  Stmt,
  VarStmt_t,
} from "./ast.ts";
import { assignVar, initVar, lookupVar, Scope, Scope_t } from "./scope.ts";
import {
  BooleanValue,
  FloatValue,
  FunctionValue,
  IntegerValue,
  NullValue,
  ObjectValue,
  RuntimeValue,
  ValueType,
} from "./runtime.ts";

export function interpret(stmts: Stmt[], scope: Scope_t): RuntimeValue {
  let lastEval: RuntimeValue = NullValue();
  for (const stmt of stmts) {
    lastEval = evaluate(stmt, scope);
  }
  return lastEval;
}

function evaluate(node: Stmt | Expr, scope: Scope_t): RuntimeValue {
  switch (node.tag) {
    case NodeType.VAR_STMT:
      return evalVarStmt(node, scope);
    case NodeType.EXPRESSION_STMT:
      return evalExprStmt(node, scope);
    case NodeType.INTEGER_LITERAL_EXPR:
      return IntegerValue(node.value);
    case NodeType.FLOAT_LITERAL_EXPR:
      return FloatValue(node.value);
    case NodeType.NULL_LITERAL_EXPR:
      return NullValue();
    case NodeType.BOOLEAN_LITERAL_EXPR:
      if (node.value) {
        return BooleanValue(true);
      }
      return BooleanValue(false);
    case NodeType.BINARY_EXPR:
      return evalBinaryExpr(node, scope);
    case NodeType.IDENTIFIER_EXPR:
      return evalIdentifierExpr(node, scope);
    case NodeType.OBJECT_LITERAL_EXPR:
      return evalObjectLiteralExpr(node, scope);
    case NodeType.ASSIGNMENT_EXPR:
      return evalAssignmentExpr(node, scope);
    case NodeType.MEMBER_EXPR:
      return evalMemberExpr(node, scope);
    case NodeType.CALL_EXPR:
      return evalCallExpr(node, scope);
    case NodeType.BLOCK_STMT:
      return evalBlockStmt(node, Scope(scope));
    case NodeType.FUNCTION_LITERAL_EXPR:
      return FunctionValue(node);
    default:
      throw new Error(
        `error: encountered invalid ast node with NodeType ${node.tag}`,
      );
  }
}

// EXPRESSIONS

function evalBinaryExpr(expr: BinaryExpr_t, scope: Scope_t): RuntimeValue {
  const lhs = evaluate(expr.left, scope);
  const rhs = evaluate(expr.right, scope);
  switch (expr.operator) {
    case "+":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '+' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value + (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value + (rhs.value as number));
      }
      throw new Error("error: operands for '+' must be of type int or float");
    case "-":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '-' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value - (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value - (rhs.value as number));
      }
      throw new Error("error: operands for '-' must be of type int or float");
    case "*":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '*' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value * (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value * (rhs.value as number));
      }
      throw new Error("error: operands for '*' must be of type int or float");
    case "/":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '/' must be of the same time`);
      }
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
      throw new Error("error: operands for '/' must be of type int or float");
    case "%":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '%' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value % (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value % (rhs.value as number));
      }
      throw new Error("error: operands for '%' must be of type int or float");
    default:
      throw new Error(
        `error: unable to evaluate '${expr.operator}' as binary operator expression`,
      );
  }
}

function evalIdentifierExpr(
  expr: IdentifierExpr_t,
  scope: Scope_t,
): RuntimeValue {
  return lookupVar(scope, expr.symbol);
}

function evalObjectLiteralExpr(
  expr: ObjectLiteralExpr_t,
  scope: Scope_t,
): RuntimeValue {
  const m: { [key: string]: RuntimeValue } = {};
  for (const { symbol, value } of expr.properties) {
    if (value === null) {
      m[symbol] = lookupVar(scope, symbol);
    } else {
      m[symbol] = evaluate(value, scope);
    }
  }
  return ObjectValue(m);
}

function evalMemberExpr(expr: MemberExpr_t, scope: Scope_t) {
  const parentVal = evaluate(expr.left, scope);
  const child = expr.right;
  if (
    parentVal.tag !== ValueType.OBJECT
  ) {
    throw new Error(
      "error: dot operator can only be called on type object",
    );
  }
  if (child.tag !== NodeType.IDENTIFIER_EXPR) {
    throw new Error(
      "error: right hand side of dot operator must be an identifier",
    );
  }
  const childVal = parentVal.value[child.symbol];
  if (childVal === undefined) {
    throw new Error(
      `error: field ${child.symbol} is not present on calling object`,
    );
  }
  return childVal;
}

// I might want to swap these switches.
function evalAssignmentExpr(
  expr: AssignmentExpr_t,
  scope: Scope_t,
): RuntimeValue {
  switch (expr.operator) {
    case "=":
      switch (expr.assignee.tag) {
        case NodeType.IDENTIFIER_EXPR: {
          const value = evaluate(expr.value, scope);
          assignVar(scope, expr.assignee.symbol, value);
          return value;
        }
        case NodeType.MEMBER_EXPR: {
          console.log("member expr time!");
          const parentVal = evaluate(expr.assignee.left, scope);
          const child = expr.assignee.right;
          if (
            parentVal.tag !== ValueType.OBJECT
          ) {
            throw new Error(
              "error: dot operator can only be called on type object",
            );
          }
          if (child.tag !== NodeType.IDENTIFIER_EXPR) {
            throw new Error(
              "error: right hand side of dot operator must be an identifier",
            );
          }
          const value = evaluate(expr.value, scope);
          parentVal.value[child.symbol] = value;
          return value;
        }
        default:
          throw new Error(
            "error: assignee must be an identifier or object property",
          );
      }
    default:
      throw new Error(
        `error: unable to evaluate '${expr.operator}' as assignment expression`,
      );
  }
}

function evalCallExpr(expr: CallExpr_t, scope: Scope_t): RuntimeValue {
  const args = expr.args.map(function (expr) {
    return evaluate(expr, scope);
  });
  const fn = evaluate(expr.caller, scope);
  if (fn.tag === ValueType.JS_FN) {
    return fn.value(args);
  } else if (fn.tag === ValueType.FUNCTION) {
    if (args.length !== fn.value.parameters.length) {
      throw new Error(
        `error: function call expected ${fn.value.parameters.length} args, received ${args.length}`,
      );
    }
    const newScope = Scope(scope);
    for (let i = 0; i < fn.value.parameters.length; i += 1) {
      initVar(newScope, fn.value.parameters[i], args[i]);
    }
    return evalBlockStmt(fn.value.block, newScope);
  }
  throw new Error("error: non function types are not callable");
}

// STATEMENTS

function evalVarStmt(stmt: VarStmt_t, scope: Scope_t): RuntimeValue {
  initVar(scope, stmt.symbol, evaluate(stmt.expr, scope));
  return NullValue();
}

function evalExprStmt(stmt: ExprStmt_t, scope: Scope_t): RuntimeValue {
  evaluate(stmt.expr, scope);
  return NullValue();
}

function evalBlockStmt(block: BlockStmt_t, scope: Scope_t): RuntimeValue {
  for (const stmt of block.stmts) {
    evaluate(stmt, scope);
  }
  return NullValue();
}
