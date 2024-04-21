export enum NodeType {
  VAR_STMT,
  RETURN_STMT,
  EXPRESSION_STMT,
  ASSIGNMENT_EXPR,
  BINARY_EXPR,
  IDENTIFIER_EXPR,
  INTEGER_EXPR,
  FLOAT_EXPR,
  NULL_EXPR,
  BOOLEAN_EXPR,
  OBJECT_EXPR,
  PROPERTY_EXPR,
}

export type Stmt = VarStmt_t | ReturnStmt_t | ExprStmt_t;

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
  | IntegerExpr_t
  | FloatExpr_t
  | NullExpr_t
  | BooleanExpr_t
  | AssignmentExpr_t
  | ObjectExpr_t;

export interface AssignmentExpr_t {
  tag: NodeType.ASSIGNMENT_EXPR;
  assignee: Expr;
  operator: string;
  value: Expr;
}

export interface BinaryExpr_t {
  tag: NodeType.BINARY_EXPR;
  left: Expr;
  operator: string;
  right: Expr;
}

export interface IdentifierExpr_t {
  tag: NodeType.IDENTIFIER_EXPR;
  symbol: string;
}

interface IntegerExpr_t {
  tag: NodeType.INTEGER_EXPR;
  value: bigint;
}

interface FloatExpr_t {
  tag: NodeType.FLOAT_EXPR;
  value: number;
}

interface NullExpr_t {
  tag: NodeType.NULL_EXPR;
  value: null;
}

interface BooleanExpr_t {
  tag: NodeType.BOOLEAN_EXPR;
  value: boolean;
}

export interface ObjectExpr_t {
  tag: NodeType.OBJECT_EXPR;
  properties: PropertyExpr_t[];
}

export function ObjectExpr(properties: PropertyExpr_t[]): ObjectExpr_t {
  return {
    tag: NodeType.OBJECT_EXPR,
    properties,
  };
}

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

export function IdentifierExpr(symbol: string): IdentifierExpr_t {
  return {
    tag: NodeType.IDENTIFIER_EXPR,
    symbol,
  };
}

export function IntegerExpr(value: bigint): IntegerExpr_t {
  return {
    tag: NodeType.INTEGER_EXPR,
    value,
  };
}

export function FloatExpr(value: number): FloatExpr_t {
  return {
    tag: NodeType.FLOAT_EXPR,
    value,
  };
}

export function NullExpr(): NullExpr_t {
  return {
    tag: NodeType.NULL_EXPR,
    value: null,
  };
}

export function BooleanExpr(value: boolean): BooleanExpr_t {
  return {
    tag: NodeType.BOOLEAN_EXPR,
    value,
  };
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
