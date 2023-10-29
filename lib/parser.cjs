"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var parser_exports = {};
__export(parser_exports, {
  RiScriptParser: () => RiScriptParser
});
module.exports = __toCommonJS(parser_exports);
var import_chevrotain = require("chevrotain");
class RiScriptParser extends import_chevrotain.CstParser {
  constructor(allTokens) {
    super(allTokens, { nodeLocationTracking: "full" });
    this.atomTypes = ["silent", "assign", "symbol", "choice", "pgate", "text", "entity"];
    this.buildRules();
  }
  parse(opts) {
    this.input = opts.tokens;
    let cst = this.script();
    if (this.errors.length > 0)
      throw Error("[PARSING]\n" + this.errors[0].message);
    return cst;
  }
  buildRules() {
    const $ = this, Tokens = this.tokensMap;
    $.RULE("script", () => {
      $.MANY(() => $.SUBRULE($.expr));
    });
    $.RULE("pgate", () => {
      $.CONSUME(Tokens.PendingGate);
      $.MANY(() => $.CONSUME(Tokens.TF));
    });
    $.RULE("entity", () => {
      $.CONSUME(Tokens.Entity);
    });
    $.RULE("gate", () => {
      $.CONSUME(Tokens.EnterGate);
      $.MANY(() => $.CONSUME(Tokens.Gate));
      $.CONSUME(Tokens.ExitGate);
    });
    $.RULE("silent", () => {
      $.CONSUME(Tokens.OS);
      $.OPTION1(() => $.SUBRULE($.gate));
      $.CONSUME(Tokens.SYM);
      $.OPTION2(() => {
        $.CONSUME(Tokens.EQ);
        $.SUBRULE($.expr);
      });
      $.CONSUME(Tokens.CS);
    });
    $.RULE("assign", () => {
      $.CONSUME(Tokens.SYM);
      $.CONSUME(Tokens.EQ);
      $.SUBRULE($.expr);
    });
    $.RULE("symbol", () => {
      $.CONSUME(Tokens.SYM);
      $.MANY(() => $.CONSUME(Tokens.TF));
    });
    $.RULE("accept", () => {
      $.SUBRULE($.or_expr);
    });
    $.RULE("reject", () => {
      $.SUBRULE($.or_expr);
    });
    $.RULE("or_expr", () => {
      $.MANY_SEP({
        SEP: Tokens.OR,
        DEF: () => $.SUBRULE($.wexpr)
      });
    });
    $.RULE("choice", () => {
      $.CONSUME(Tokens.OC);
      $.OPTION1(() => $.SUBRULE($.gate));
      $.SUBRULE($.accept);
      $.OPTION2(() => {
        $.CONSUME(Tokens.ELSE);
        $.SUBRULE($.reject);
      });
      $.CONSUME(Tokens.CC);
      $.MANY(() => $.CONSUME(Tokens.TF));
    });
    $.RULE("wexpr", () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.expr) },
          { ALT: () => $.CONSUME(Tokens.Weight) }
        ]);
      });
    });
    $.RULE("expr", () => {
      $.AT_LEAST_ONE(() => $.SUBRULE($.atom));
    });
    $.RULE("atom", () => {
      $.OR(this.atomTypes.map((t) => ({ ALT: () => $.SUBRULE($[t]) })));
    });
    $.RULE("text", () => {
      $.CONSUME(Tokens.Raw);
    });
    this.performSelfAnalysis();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RiScriptParser
});
