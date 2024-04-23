import { Stmt } from "./ast.ts";
import { lex } from "./lexer.ts";
import { parse } from "./parser.ts";
import { Token_t } from "./token.ts";
import { interpret } from "./interpreter.ts";
import { Scope } from "./scope.ts";

if (Deno.args.length === 0) {
  let toks: Token_t[], stmts: Stmt[], errs: string[];
  // const globalScope = Scope(null);
  for (let input = prompt(">"); input !== null; input = prompt(">")) {
    ({ toks, errs } = lex(input));
    console.log({ toks, errs });
    ({ stmts, errs } = parse(toks));
    console.log({ stmts, errs });
    // const rslt = interpret(stmts, globalScope);
    // console.log(rslt.value);
  }
} else if (Deno.args.length === 1) {
  const bytes = Deno.readFileSync(Deno.args[0]);
  const src = new TextDecoder().decode(bytes);
  let toks: Token_t[], stmts: Stmt[], errs: string[];
  ({ toks, errs } = lex(src));
  console.log({ toks, errs });
  ({ stmts, errs } = parse(toks));
  console.log({ stmts, errs });
  const rslt = interpret(stmts, Scope(null));
  console.log(rslt);
}
