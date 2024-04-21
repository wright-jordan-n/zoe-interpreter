import { Stmt } from "./ast.ts";
import { lex } from "./lexer.ts";
import { parse } from "./parser.ts";
import { Token_t } from "./token.ts";
import { interpret } from "./interpreter.ts";
import { Environment, initVar } from "./environment.ts";
import { IntegerValue } from "./runtime.ts";

if (Deno.args.length === 0) {
  let toks: Token_t[], stmts: Stmt[], errs: string[];
  for (let input = prompt(">"); input !== null; input = prompt(">")) {
    ({ toks, errs } = lex(input));
    console.log({ toks, errs });
    ({ stmts, errs } = parse(toks));
    console.log({ stmts, errs });
    const env = Environment(null);
    initVar(env, "x", IntegerValue(73n));
    const rslt = interpret(stmts, env);
    console.log(rslt.value);
  }
} else if (Deno.args.length === 1) {
  const bytes = Deno.readFileSync(Deno.args[0]);
  const src = new TextDecoder().decode(bytes);
  let toks: Token_t[], stmts: Stmt[], errs: string[];
  ({ toks, errs } = lex(src));
  console.log({ toks, errs });
  ({ stmts, errs } = parse(toks));
  console.log({ stmts, errs });
}
