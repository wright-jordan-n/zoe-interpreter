import { keywords, Token, Token_t, TokenType } from "./token.ts";

export function lex(src: string): { toks: Token_t[]; errs: string[] } {
  const toks: Token_t[] = [];
  const errs: string[] = [];
  for (const ptr = { i: 0 }; ptr.i < src.length; ptr.i += 1) {
    const c = src[ptr.i];
    switch (c) {
      case " ":
      case "\t":
      case "\v":
      case "\f":
      case "\r":
      case "\n":
        break;
      case "=":
        toks.push(Token(TokenType.ASSIGN, c));
        break;
      case "+":
        toks.push(Token(TokenType.ADD, c));
        break;
      case "-":
        toks.push(Token(TokenType.SUBTRACT, c));
        break;
      case "*":
        toks.push(Token(TokenType.MULTIPLY, c));
        break;
      case "/":
        toks.push(Token(TokenType.DIVIDE, c));
        break;
      case "%":
        toks.push(Token(TokenType.MODULO, c));
        break;
      case "(":
        toks.push(Token(TokenType.LPAREN, c));
        break;
      case ")":
        toks.push(Token(TokenType.RPAREN, c));
        break;
      case "{":
        toks.push(Token(TokenType.LBRACE, c));
        break;
      case "}":
        toks.push(Token(TokenType.RBRACE, c));
        break;
      case "[":
        toks.push(Token(TokenType.LBRACKET, c));
        break;
      case "]":
        toks.push(Token(TokenType.RBRACKET, c));
        break;
      case ".":
        toks.push(Token(TokenType.DOT, c));
        break;
      case ",":
        toks.push(Token(TokenType.COMMA, c));
        break;
      case ":":
        toks.push(Token(TokenType.COLON, c));
        break;
      case ";":
        toks.push(Token(TokenType.SEMICOLON, c));
        break;
      case "0": {
        const start = ptr.i;
        let next = peek(src, ptr.i + 1);
        switch (next) {
          case "o": {
            ptr.i += 1;
            next = peek(src, ptr.i + 1);
            if (!isOctal(next)) {
              errs.push(`unexpected character '${next}', expected octal`);
              break;
            }
            ptr.i += 1;
            for (
              next = peek(src, ptr.i + 1);
              next !== "\0" && isOctal(next);
              ptr.i += 1, next = peek(src, ptr.i + 1)
            );
            toks.push(
              Token(TokenType.OCTAL, src.substring(start, ptr.i + 1)),
            );
            break;
          }
          case "x": {
            ptr.i += 1;
            next = peek(src, ptr.i + 1);
            if (!isHexadecimal(next)) {
              errs.push(`unexpected character '${next}', expected hex`);
              break;
            }
            ptr.i += 1;
            for (
              next = peek(src, ptr.i + 1);
              next !== "\0" && isHexadecimal(next);
              ptr.i += 1, next = peek(src, ptr.i + 1)
            );
            toks.push(
              Token(TokenType.HEXADECIMAL, src.substring(start, ptr.i + 1)),
            );
            break;
          }
          case "b": {
            ptr.i += 1;
            next = peek(src, ptr.i + 1);
            if (!isBinary(next)) {
              errs.push(`unexpected character '${next}', expected binary`);
              break;
            }
            ptr.i += 1;
            for (
              next = peek(src, ptr.i + 1);
              next !== "\0" && isBinary(next);
              ptr.i += 1, next = peek(src, ptr.i + 1)
            );
            toks.push(
              Token(TokenType.BINARY, src.substring(start, ptr.i + 1)),
            );
            break;
          }
          case ".": {
            ptr.i += 1;
            next = peek(src, ptr.i + 1);
            if (!isDigit(next)) {
              errs.push(`unexpected character '${next}', expected digit`);
              break;
            }
            ptr.i += 1;
            for (
              next = peek(src, ptr.i + 1);
              next !== "\0" && isDigit(next);
              ptr.i += 1, next = peek(src, ptr.i + 1)
            );
            toks.push(
              Token(TokenType.FLOAT, src.substring(start, ptr.i + 1)),
            );
            break;
          }
          default: {
            for (
              ;
              next !== "\0" && isDigit(next);
              ptr.i += 1, next = peek(src, ptr.i + 1)
            );
            if (next === ".") {
              ptr.i += 1;
              next = peek(src, ptr.i + 1);
              if (!isDigit(next)) {
                errs.push(`unexpected character '${next}', expected digit`);
                break;
              }
              ptr.i += 1;
              for (
                next = peek(src, ptr.i + 1);
                next !== "\0" && isDigit(next);
                ptr.i += 1, next = peek(src, ptr.i + 1)
              );
              const literal = src.substring(start, ptr.i + 1);
              toks.push(Token(TokenType.FLOAT, literal));
              break;
            }
            const literal = src.substring(start, ptr.i + 1);
            toks.push(Token(TokenType.INTEGER, literal));
            break;
          }
        }
        break;
      }
      default:
        if (isAlpha(c)) {
          const start = ptr.i;
          for (
            let next = peek(src, ptr.i + 1);
            next !== "\0" && isAlphaNumeric(next);
            ptr.i += 1, next = peek(src, ptr.i + 1)
          );
          const literal = src.substring(start, ptr.i + 1);
          const keyword = keywords.get(literal);
          if (keyword === undefined) {
            toks.push(Token(TokenType.IDENTIFIER, literal));
            break;
          }
          toks.push(Token(keyword, literal));
          break;
        }
        if (isDigit(c)) {
          const start = ptr.i;
          let next = peek(src, ptr.i + 1);
          for (
            ;
            next !== "\0" && isDigit(next);
            ptr.i += 1, next = peek(src, ptr.i + 1)
          );
          if (next === ".") {
            ptr.i += 1;
            next = peek(src, ptr.i + 1);
            if (!isDigit(next)) {
              errs.push(`unexpected character '${next}', expected digit`);
              break;
            }
            ptr.i += 1;
            for (
              next = peek(src, ptr.i + 1);
              next !== "\0" && isDigit(next);
              ptr.i += 1, next = peek(src, ptr.i + 1)
            );
            const literal = src.substring(start, ptr.i + 1);
            toks.push(Token(TokenType.FLOAT, literal));
            break;
          }
          const literal = src.substring(start, ptr.i + 1);
          toks.push(Token(TokenType.INTEGER, literal));
          break;
        }
        errs.push(`invalid character '${c}'`);
    }
  }
  toks.push(Token(TokenType.EOF, "\0"));
  return { toks, errs };
}

function isAlpha(c: string): boolean {
  const byte = c.charCodeAt(0);
  return (97 <= byte && byte <= 127) || (65 <= byte && byte <= 90) ||
    (byte === 95);
}

function isDigit(c: string): boolean {
  const byte = c.charCodeAt(0);
  return 48 <= byte && byte <= 57;
}

function isBinary(c: string): boolean {
  return c === "0" || c === "1";
}

function isOctal(c: string) {
  const byte = c.charCodeAt(0);
  return 48 <= byte && byte <= 55;
}

function isHexadecimal(c: string) {
  const byte = c.charCodeAt(0);
  return (48 <= byte && byte <= 57) || (65 <= byte && byte <= 70) ||
    (97 <= byte && byte <= 102);
}

function isAlphaNumeric(c: string) {
  const byte = c.charCodeAt(0);
  return (48 <= byte && byte <= 57) || (97 <= byte && byte <= 127) ||
    (65 <= byte && byte <= 90) || (byte === 95);
}

function peek(src: string, n: number): string {
  if (n >= src.length) {
    return "\0";
  }
  return src[n];
}
