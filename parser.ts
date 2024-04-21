import {
  AssignmentExpr,
  BinaryExpr,
  BooleanExpr,
  Expr,
  ExprStmt,
  FloatExpr,
  IdentifierExpr,
  IntegerExpr,
  NullExpr,
  ObjectExpr,
  PropertyExpr,
  PropertyExpr_t,
  Stmt,
  VarStmt,
  VarStmt_t,
} from "./ast.ts";
import { Token_t, TokenType } from "./token.ts";

function advance(toks: Token_t[], ptr: { i: number }): void {
  if (ptr.i === toks.length - 1) {
    return;
  }
  ptr.i += 1;
}

// function peek(toks: Token_t[], ptr: { i: number }): Token_t | null {
//   if (ptr.i === toks.length - 1) {
//     return null;
//   }
//   return toks[ptr.i + 1];
// }

export function parse(toks: Token_t[]): { stmts: Stmt[]; errs: string[] } {
  const stmts: Stmt[] = [];
  const errs: string[] = [];
  const ptr: { i: number } = { i: 0 };
  while (toks[ptr.i].type !== TokenType.EOF) {
    switch (toks[ptr.i].type) {
      case TokenType.VAR: {
        const rslt = parseVarStmt(toks, ptr);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      default: {
        const rslt = parseExpr(toks, ptr);
        if (typeof rslt === "string") {
          errs.push(rslt);
        } else {
          if (toks[ptr.i].type !== TokenType.SEMICOLON) {
            errs.push(`error: expected ';'`);
          } else {
            advance(toks, ptr);
          }
          stmts.push(ExprStmt(rslt));
        }
      }
    }
  }
  return { stmts, errs };
}

function parseVarStmt(toks: Token_t[], ptr: { i: number }): VarStmt_t | string {
  advance(toks, ptr);
  if (toks[ptr.i].type !== TokenType.IDENTIFIER) {
    return `unexpected token '${toks[ptr.i].literal}' expected identifier`;
  }
  const symbol = toks[ptr.i].literal;
  advance(toks, ptr);
  if (toks[ptr.i].type === TokenType.SEMICOLON) {
    advance(toks, ptr);
    return VarStmt(symbol, NullExpr());
  }
  if (toks[ptr.i].type !== TokenType.ASSIGN) {
    return `unexpected token '${toks[ptr.i].literal}' expected '=' or ';'`;
  }
  advance(toks, ptr);
  const expr = parseExpr(toks, ptr);
  if (typeof expr === "string") {
    return expr;
  }
  if (toks[ptr.i].type !== TokenType.SEMICOLON) {
    return `unexpected token '${toks[ptr.i].literal}' expected ';'`;
  }
  advance(toks, ptr);
  return VarStmt(symbol, expr);
}

// Order of Operations
// PrimaryExpr
// FuncCall ArraySubscript StructAccess
// UnaryExpr
// * / %
// + -
// < <= > >= == !=
// &&
// ||
// AssignmentExpr

function parseExpr(toks: Token_t[], ptr: { i: number }): Expr | string {
  return parseAssignmentExpr(toks, ptr);
}

function parsePrimaryExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  const tok = toks[ptr.i];
  switch (tok.type) {
    case TokenType.TRUE:
      advance(toks, ptr);
      return BooleanExpr(true);
    case TokenType.FALSE:
      advance(toks, ptr);
      return BooleanExpr(false);
    case TokenType.NULL:
      advance(toks, ptr);
      return NullExpr();
    case TokenType.IDENTIFIER:
      advance(toks, ptr);
      return IdentifierExpr(tok.literal);
    case TokenType.INTEGER:
    case TokenType.HEXADECIMAL:
    case TokenType.OCTAL:
    case TokenType.BINARY:
      advance(toks, ptr);
      return IntegerExpr(BigInt(tok.literal));
    case TokenType.FLOAT:
      advance(toks, ptr);
      return FloatExpr(Number(tok.literal));
    case TokenType.LPAREN: {
      advance(toks, ptr);
      const rslt = parseExpr(toks, ptr);
      if (typeof rslt === "string") {
        return rslt;
      }
      if (toks[ptr.i].type !== TokenType.RPAREN) {
        return `error: unexpected token '${toks[ptr.i].literal}', expected ')'`;
      }
      advance(toks, ptr);
      return rslt;
    }
    default:
      advance(toks, ptr);
      return `error: unexpected token '${tok.literal}', expected expresssion`;
  }
}

function parseMultiplicativeExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  let left = parsePrimaryExpr(toks, ptr);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.MULTIPLY || tok.type === TokenType.DIVIDE ||
    tok.type === TokenType.MODULO;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parsePrimaryExpr(toks, ptr);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseAdditiveExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  let left = parseMultiplicativeExpr(toks, ptr);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.ADD || tok.type === TokenType.SUBTRACT;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parseMultiplicativeExpr(toks, ptr);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseObjectExpr(toks: Token_t[], ptr: { i: number }): Expr | string {
  if (toks[ptr.i].type !== TokenType.LBRACE) {
    return parseAdditiveExpr(toks, ptr);
  }
  advance(toks, ptr);
  const properties: PropertyExpr_t[] = [];
  for (
    ;
    toks[ptr.i].type !== TokenType.EOF && toks[ptr.i].type !== TokenType.RBRACE;
  ) {
    if (toks[ptr.i].type !== TokenType.IDENTIFIER) {
      return `error: unexpected token '${
        toks[ptr.i].literal
      }' expected identifier`;
    }
    const key = toks[ptr.i].literal;
    advance(toks, ptr);
    if (toks[ptr.i].type === TokenType.COMMA) {
      advance(toks, ptr);
      properties.push(PropertyExpr(key, null));
      continue;
    }
    if (toks[ptr.i].type === TokenType.RBRACE) {
      properties.push(PropertyExpr(key, null));
      break;
    }
    if (toks[ptr.i].type !== TokenType.COLON) {
      return `error: unexpected token '${toks[ptr.i].literal}', expected ':'`;
    }
    advance(toks, ptr);
    const value = parseExpr(toks, ptr);
    if (typeof value === "string") {
      return value;
    }
    properties.push(PropertyExpr(key, value));
    if (toks[ptr.i].type === TokenType.RBRACE) {
      break;
    }
    if (toks[ptr.i].type !== TokenType.COMMA) {
      return `error: unexpected token '${toks[ptr.i].literal}' expected ','`;
    }
    advance(toks, ptr);
    if (toks[ptr.i].type === TokenType.COMMA) {
      advance(toks, ptr);
    }
  }
  advance(toks, ptr);
  return ObjectExpr(properties);
}

function parseAssignmentExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  let left = parseObjectExpr(toks, ptr);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.ASSIGN;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parseObjectExpr(toks, ptr);
    if (typeof right === "string") {
      return right;
    }
    left = AssignmentExpr(left, operator, right);
  }
  return left;
}
