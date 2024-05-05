export enum TokenType {
  ASSIGN,
  ADD,
  SUBTRACT,
  MULTIPLY,
  DIVIDE,
  MODULO,
  LPAREN,
  RPAREN,
  LBRACE,
  RBRACE,
  // LBRACKET,
  // RBRACKET,
  DOT,
  COMMA,
  COLON,
  SEMICOLON,
  EQUAL,
  NOT_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  NOT,

  BINARY,
  OCTAL,
  HEXADECIMAL,
  INTEGER,
  FLOAT,
  STRING,

  TRUE,
  FALSE,
  NULL,
  VAR,
  FN,
  RETURN,
  IDENTIFIER,
  AND,
  OR,
  IF,
  ELSE,

  EOF,
}

const keywords = new Map<string, TokenType>();
keywords.set("var", TokenType.VAR);
keywords.set("nil", TokenType.NULL);
keywords.set("true", TokenType.TRUE);
keywords.set("false", TokenType.FALSE);
keywords.set("fn", TokenType.FN);
keywords.set("return", TokenType.RETURN);
keywords.set("and", TokenType.AND);
keywords.set("or", TokenType.OR);
keywords.set("if", TokenType.IF);
keywords.set("else", TokenType.ELSE);

export { keywords };

export interface Token_t {
  type: TokenType;
  literal: string;
}

export function Token(type: TokenType, literal: string): Token_t {
  return { type, literal };
}
