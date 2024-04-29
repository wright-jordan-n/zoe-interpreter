import {
  AssignmentExpr,
  BinaryExpr,
  BlockStmt,
  BlockStmt_t,
  BooleanLiteralExpr,
  CallExpr,
  Expr,
  ExprStmt,
  FloatLiteralExpr,
  FunctionLiteralExpr,
  IdentifierExpr,
  IfStmt,
  IfStmt_t,
  IntegerLiteralExpr,
  MemberExpr,
  NullLiteralExpr,
  ObjectLiteralExpr,
  PropertyExpr,
  PropertyExpr_t,
  ReturnStmt,
  ReturnStmt_t,
  Stmt,
  UnaryExpr,
  VarStmt,
  VarStmt_t,
} from "./ast.ts";
import { Token_t, TokenType } from "./token.ts";

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
        const rslt = parseVarStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      case TokenType.RETURN: {
        const rslt = parseReturnStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      case TokenType.LBRACE: {
        const rslt = parseBlockStmt(toks, ptr, errs);
        stmts.push(rslt);
        break;
      }
      case TokenType.IF: {
        const rslt = parseIfStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      default: {
        const rslt = parseExpr(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
        } else {
          if (toks[ptr.i].type !== TokenType.SEMICOLON) {
            errs.push(
              `error: unexpected token '${toks[ptr.i].literal}' expected ';'`,
            );
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

function parseVarStmt(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): VarStmt_t | string {
  advance(toks, ptr);
  if (toks[ptr.i].type !== TokenType.IDENTIFIER) {
    return `unexpected token '${toks[ptr.i].literal}' expected identifier`;
  }
  const symbol = toks[ptr.i].literal;
  advance(toks, ptr);
  if (toks[ptr.i].type === TokenType.SEMICOLON) {
    advance(toks, ptr);
    return VarStmt(symbol, NullLiteralExpr());
  }
  if (toks[ptr.i].type !== TokenType.ASSIGN) {
    return `unexpected token '${toks[ptr.i].literal}' expected '=' or ';'`;
  }
  advance(toks, ptr);
  const expr = parseExpr(toks, ptr, errs);
  if (typeof expr === "string") {
    return expr;
  }
  if (toks[ptr.i].type !== TokenType.SEMICOLON) {
    return `unexpected token '${toks[ptr.i].literal}' expected ';'`;
  }
  advance(toks, ptr);
  return VarStmt(symbol, expr);
}

function parseReturnStmt(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): ReturnStmt_t | string {
  advance(toks, ptr);
  if (toks[ptr.i].type === TokenType.SEMICOLON) {
    advance(toks, ptr);
    return ReturnStmt(NullLiteralExpr());
  }
  const expr = parseExpr(toks, ptr, errs);
  if (typeof expr === "string") {
    return expr;
  }
  if (toks[ptr.i].type !== TokenType.SEMICOLON) {
    return `unexpected token '${toks[ptr.i].literal}', expected ';'`;
  }
  advance(toks, ptr);
  return ReturnStmt(expr);
}

function parseIfStmt(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): IfStmt_t | string {
  advance(toks, ptr);
  const ifs: { condition: Expr; block: BlockStmt_t }[] = [];
  let dflt: BlockStmt_t | null = null;
  let condition = parseExpr(toks, ptr, errs);
  if (typeof condition === "string") {
    return condition;
  }
  if (toks[ptr.i].type !== TokenType.LBRACE) {
    return `error: unexpected token '${toks[ptr.i].literal}', expected '{'`;
  }
  let block = parseBlockStmt(toks, ptr, errs);
  ifs.push({ condition, block });
  for (; toks[ptr.i].type === TokenType.ELSE;) {
    advance(toks, ptr);
    if (toks[ptr.i].type === TokenType.IF) {
      advance(toks, ptr);
      condition = parseExpr(toks, ptr, errs);
      if (typeof condition === "string") {
        return condition;
      }
      if (toks[ptr.i].type !== TokenType.LBRACE) {
        return `error: unexpected token '${toks[ptr.i].literal}', expected '{'`;
      }
      block = parseBlockStmt(toks, ptr, errs);
      ifs.push({ condition, block });
    } else {
      if (toks[ptr.i].type !== TokenType.LBRACE) {
        return `error: unexpected token '${toks[ptr.i].literal}', expected '{'`;
      }
      dflt = parseBlockStmt(toks, ptr, errs);
      break;
    }
  }
  return IfStmt(ifs, dflt);
}

function parseExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  return parseAssignmentExpr(toks, ptr, errs);
}

function parsePrimaryExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  const tok = toks[ptr.i];
  switch (tok.type) {
    // case TokenType.SUBTRACT:
    // case TokenType.NOT:
    //   advance(toks, ptr);
    //   return parseUnaryExpr(toks, ptr, errs);
    case TokenType.TRUE:
      advance(toks, ptr);
      return BooleanLiteralExpr(true);
    case TokenType.FALSE:
      advance(toks, ptr);
      return BooleanLiteralExpr(false);
    case TokenType.NULL:
      advance(toks, ptr);
      return NullLiteralExpr();
    case TokenType.IDENTIFIER:
      advance(toks, ptr);
      return IdentifierExpr(tok.literal);
    case TokenType.INTEGER:
    case TokenType.HEXADECIMAL:
    case TokenType.OCTAL:
    case TokenType.BINARY:
      advance(toks, ptr);
      return IntegerLiteralExpr(BigInt(tok.literal));
    case TokenType.FLOAT:
      advance(toks, ptr);
      return FloatLiteralExpr(Number(tok.literal));
    case TokenType.LBRACE:
      // Current implementation doesn't allow arbitrary block statements.
      // Block statments can be done by refactoring parse function to have adjsustable stopping point?
      // Then a BlockStatment_t is an interface that holds an array of stmts.
      return parseObjectLiteralExpr(toks, ptr, errs);
    case TokenType.LPAREN: {
      advance(toks, ptr);
      const rslt = parseExpr(toks, ptr, errs);
      if (typeof rslt === "string") {
        return rslt;
      }
      if (toks[ptr.i].type !== TokenType.RPAREN) {
        return `error: unexpected token '${toks[ptr.i].literal}', expected ')'`;
      }
      advance(toks, ptr);
      return rslt;
    }
    case TokenType.FN:
      return parseFunctionLiteralExpr(toks, ptr, errs);
    default:
      advance(toks, ptr);
      return `error: unexpected token '${tok.literal}', expected expresssion`;
  }
}

function parseCallMemberExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  let left = parsePrimaryExpr(toks, ptr, errs);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.DOT || tok.type === TokenType.LPAREN;
    tok = toks[ptr.i]
  ) {
    const operator = tok;
    advance(toks, ptr);
    if (operator.type === TokenType.DOT) {
      if (toks[ptr.i].type !== TokenType.IDENTIFIER) {
        return `error: unexpected token '${
          toks[ptr.i].literal
        }', expected identifier`;
      }
      const right = IdentifierExpr(toks[ptr.i].literal);
      advance(toks, ptr);
      left = MemberExpr(left, right);
    } else {
      const args: Expr[] = [];
      for (;;) {
        if (toks[ptr.i].type === TokenType.RPAREN) {
          advance(toks, ptr);
          break;
        }
        const expr = parseExpr(toks, ptr, errs);
        if (typeof expr === "string") {
          return expr;
        }
        args.push(expr);
        if (toks[ptr.i].type === TokenType.COMMA) {
          advance(toks, ptr);
        }
      }
      left = CallExpr(left, args);
    }
  }
  return left;
}

function parseUnaryExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  if (
    toks[ptr.i].type !== TokenType.SUBTRACT &&
    toks[ptr.i].type !== TokenType.NOT
  ) {
    return parseCallMemberExpr(toks, ptr, errs);
  }
  let expr: Expr | string;
  do {
    const operator = toks[ptr.i].literal;
    advance(toks, ptr);
    expr = parseCallMemberExpr(toks, ptr, errs);
    if (typeof expr === "string") {
      return expr;
    }
    expr = UnaryExpr(operator, expr);
  } while (
    toks[ptr.i].type === TokenType.SUBTRACT ||
    toks[ptr.i].type === TokenType.NOT
  );
  return expr;
}

function parseMultiplicativeExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  let left = parseUnaryExpr(toks, ptr, errs);
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
    const right = parseUnaryExpr(toks, ptr, errs);
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
  errs: string[],
): Expr | string {
  let left = parseMultiplicativeExpr(toks, ptr, errs);
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
    const right = parseMultiplicativeExpr(toks, ptr, errs);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseComparisonExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  let left = parseAdditiveExpr(toks, ptr, errs);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.EQUAL || tok.type === TokenType.NOT_EQUAL ||
    tok.type === TokenType.LESS_THAN || tok.type === TokenType.GREATER_THAN;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parseAdditiveExpr(toks, ptr, errs);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseAndExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  let left = parseComparisonExpr(toks, ptr, errs);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.AND;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parseComparisonExpr(toks, ptr, errs);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseOrExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  let left = parseAndExpr(toks, ptr, errs);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.OR;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parseAndExpr(toks, ptr, errs);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseAssignmentExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  let left = parseOrExpr(toks, ptr, errs);
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
    const right = parseOrExpr(toks, ptr, errs);
    if (typeof right === "string") {
      return right;
    }
    left = AssignmentExpr(left, operator, right);
  }
  return left;
}

/* This is just to parse a primary expr, it's not part of recursive descent chain.*/
function parseObjectLiteralExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
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
    const value = parseExpr(toks, ptr, errs);
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
    // if (toks[ptr.i].type === TokenType.COMMA) {
    //   advance(toks, ptr);
    // }
  }
  advance(toks, ptr);
  return ObjectLiteralExpr(properties);
}

function parseFunctionLiteralExpr(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): Expr | string {
  advance(toks, ptr);
  if (toks[ptr.i].type !== TokenType.LPAREN) {
    return `error: unexpected token '${toks[ptr.i].literal}' expected '('`;
  }
  advance(toks, ptr);
  const parameters: string[] = [];
  for (
    ;
    // I only need to check rparen once before loop, bc it's also handled inside, same with obj literal expr
    toks[ptr.i].type !== TokenType.EOF && toks[ptr.i].type !== TokenType.RPAREN;
  ) {
    if (toks[ptr.i].type !== TokenType.IDENTIFIER) {
      return `error: unexpected token '${
        toks[ptr.i].literal
      }' expected identifier`;
    }
    parameters.push(toks[ptr.i].literal);
    advance(toks, ptr);
    if (toks[ptr.i].type === TokenType.RPAREN) {
      break;
    }
    if (toks[ptr.i].type !== TokenType.COMMA) {
      return `error: unexpected token '${toks[ptr.i].literal}' expected ','`;
    }
    advance(toks, ptr);
  }
  if (toks[ptr.i].type !== TokenType.RPAREN) {
    return `error: unexpected token '${toks[ptr.i].literal}' expected ')'`;
  }
  advance(toks, ptr);
  if (toks[ptr.i].type !== TokenType.LBRACE) {
    return `error: unexpected token '${toks[ptr.i].literal}' expected '{'`;
  }
  const block = parseBlockStmt(toks, ptr, errs);
  return FunctionLiteralExpr(parameters, block);
}

function parseBlockStmt(
  toks: Token_t[],
  ptr: { i: number },
  errs: string[],
): BlockStmt_t {
  advance(toks, ptr);
  const stmts: Stmt[] = [];
  while (
    toks[ptr.i].type !== TokenType.EOF && toks[ptr.i].type !== TokenType.RBRACE
  ) {
    switch (toks[ptr.i].type) {
      case TokenType.VAR: {
        const rslt = parseVarStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      case TokenType.RETURN: {
        const rslt = parseReturnStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      case TokenType.LBRACE: {
        const rslt = parseBlockStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      case TokenType.IF: {
        const rslt = parseIfStmt(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
          break;
        }
        stmts.push(rslt);
        break;
      }
      default: {
        const rslt = parseExpr(toks, ptr, errs);
        if (typeof rslt === "string") {
          errs.push(rslt);
        } else {
          if (toks[ptr.i].type !== TokenType.SEMICOLON) {
            errs.push(
              `error: unexpected token '${toks[ptr.i].literal}' expected ';'`,
            );
          } else {
            advance(toks, ptr);
          }
          stmts.push(ExprStmt(rslt));
        }
      }
    }
  }
  if (toks[ptr.i].type !== TokenType.RBRACE) {
    errs.push(`error: unexpected token '${toks[ptr.i].literal}' expected '}'`);
    return BlockStmt(stmts);
  }
  advance(toks, ptr);
  return BlockStmt(stmts);
}
