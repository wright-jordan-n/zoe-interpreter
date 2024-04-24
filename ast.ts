// import { RuntimeValue } from "./runtime.ts";

export enum NodeType {
  VAR_STMT,
  RETURN_STMT,
  EXPRESSION_STMT,
  BLOCK_STMT,
  ASSIGNMENT_EXPR,
  BINARY_EXPR,
  IDENTIFIER_EXPR,
  INTEGER_LITERAL_EXPR,
  FLOAT_LITERAL_EXPR,
  NULL_LITERAL_EXPR,
  BOOLEAN_LITERAL_EXPR,
  OBJECT_LITERAL_EXPR,
  CALL_EXPR,
  MEMBER_EXPR,
  PROPERTY_EXPR,
  FUNCTION_LITERAL_EXPR,
}

export type Stmt = VarStmt_t | ReturnStmt_t | ExprStmt_t | BlockStmt_t;

export interface BlockStmt_t {
  tag: NodeType.BLOCK_STMT;
  stmts: Stmt[];
}

export function BlockStmt(stmts: Stmt[]): BlockStmt_t {
  return {
    tag: NodeType.BLOCK_STMT,
    stmts,
  };
}

export interface VarStmt_t {
  tag: NodeType.VAR_STMT;
  symbol: string;
  expr: Expr;
}

export function VarStmt(symbol: string, expr: Expr): VarStmt_t {
  return {
    tag: NodeType.VAR_STMT,
    symbol,
    expr,
  };
}

interface ReturnStmt_t {
  tag: NodeType.RETURN_STMT;
  expr: Expr;
}

// this should probably go in runtime.ts
// class Return extends Error {
//   value: RuntimeValue;
//   constructor() {
//     super("error: return statment only allowed in statment.")
//   }
// }

export function ReturnStmt(expr: Expr): ReturnStmt_t {
  return {
    tag: NodeType.RETURN_STMT,
    expr,
  };
}

export interface ExprStmt_t {
  tag: NodeType.EXPRESSION_STMT;
  expr: Expr;
}

export function ExprStmt(expr: Expr): ExprStmt_t {
  return {
    tag: NodeType.EXPRESSION_STMT,
    expr,
  };
}

export type Expr =
  | BinaryExpr_t
  | IdentifierExpr_t
  | IntegerLiteralExpr_t
  | FloatLiteralExpr_t
  | NullLiteralExpr_t
  | BooleanLiteralExpr_t
  | AssignmentExpr_t
  | ObjectLiteralExpr_t
  | CallExpr_t
  | MemberExpr_t
  | FunctionLiteralExpr_t;

export interface AssignmentExpr_t {
  tag: NodeType.ASSIGNMENT_EXPR;
  assignee: Expr;
  operator: string;
  value: Expr;
}

export function AssignmentExpr(
  assignee: Expr,
  operator: string,
  value: Expr,
): AssignmentExpr_t {
  return {
    tag: NodeType.ASSIGNMENT_EXPR,
    assignee,
    operator,
    value,
  };
}

export interface BinaryExpr_t {
  tag: NodeType.BINARY_EXPR;
  left: Expr;
  operator: string;
  right: Expr;
}

export function BinaryExpr(
  left: Expr,
  operator: string,
  right: Expr,
): BinaryExpr_t {
  return {
    tag: NodeType.BINARY_EXPR,
    left,
    operator,
    right,
  };
}

export interface IdentifierExpr_t {
  tag: NodeType.IDENTIFIER_EXPR;
  symbol: string;
}

export function IdentifierExpr(symbol: string): IdentifierExpr_t {
  return {
    tag: NodeType.IDENTIFIER_EXPR,
    symbol,
  };
}

interface IntegerLiteralExpr_t {
  tag: NodeType.INTEGER_LITERAL_EXPR;
  value: bigint;
}

export function IntegerLiteralExpr(value: bigint): IntegerLiteralExpr_t {
  return {
    tag: NodeType.INTEGER_LITERAL_EXPR,
    value,
  };
}

interface FloatLiteralExpr_t {
  tag: NodeType.FLOAT_LITERAL_EXPR;
  value: number;
}

export function FloatLiteralExpr(value: number): FloatLiteralExpr_t {
  return {
    tag: NodeType.FLOAT_LITERAL_EXPR,
    value,
  };
}

interface NullLiteralExpr_t {
  tag: NodeType.NULL_LITERAL_EXPR;
  value: null;
}

export function NullLiteralExpr(): NullLiteralExpr_t {
  return {
    tag: NodeType.NULL_LITERAL_EXPR,
    value: null,
  };
}

interface BooleanLiteralExpr_t {
  tag: NodeType.BOOLEAN_LITERAL_EXPR;
  value: boolean;
}

export function BooleanLiteralExpr(value: boolean): BooleanLiteralExpr_t {
  return {
    tag: NodeType.BOOLEAN_LITERAL_EXPR,
    value,
  };
}

export interface ObjectLiteralExpr_t {
  tag: NodeType.OBJECT_LITERAL_EXPR;
  properties: PropertyExpr_t[];
}

export function ObjectLiteralExpr(
  properties: PropertyExpr_t[],
): ObjectLiteralExpr_t {
  return {
    tag: NodeType.OBJECT_LITERAL_EXPR,
    properties,
  };
}

export interface CallExpr_t {
  tag: NodeType.CALL_EXPR;
  caller: Expr;
  args: Expr[];
}

export function CallExpr(caller: Expr, args: Expr[]): CallExpr_t {
  return {
    tag: NodeType.CALL_EXPR,
    caller,
    args,
  };
}

export interface MemberExpr_t {
  tag: NodeType.MEMBER_EXPR;
  left: Expr;
  right: Expr;
}

export function MemberExpr(left: Expr, right: Expr): MemberExpr_t {
  return {
    tag: NodeType.MEMBER_EXPR,
    left,
    right,
  };
}

export interface FunctionLiteralExpr_t {
  tag: NodeType.FUNCTION_LITERAL_EXPR;
  parameters: string[];
  block: BlockStmt_t;
}

export function FunctionLiteralExpr(
  parameters: string[],
  block: BlockStmt_t,
): FunctionLiteralExpr_t {
  return {
    tag: NodeType.FUNCTION_LITERAL_EXPR,
    parameters,
    block,
  };
}

// Properties might not need explicit type with a tag.
// Maybe just need to embed keyval in obj literal?

export interface PropertyExpr_t {
  tag: NodeType.PROPERTY_EXPR;
  symbol: string;
  value: Expr | null;
}

export function PropertyExpr(
  symbol: string,
  value: Expr | null,
): PropertyExpr_t {
  return {
    tag: NodeType.PROPERTY_EXPR,
    symbol,
    value,
  };
}
