"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var riscript_exports = {};
__export(riscript_exports, {
  RiScript: () => RiScript
});
module.exports = __toCommonJS(riscript_exports);
var import_he = __toESM(require("he"), 1);
var import_mingo = require("mingo");
var import_chevrotain = require("chevrotain");
var import_tokens = require("./tokens.js");
var import_parser = require("./parser.js");
var import_visitor = require("./visitor.js");
const { decode } = import_he.default;
const VowelRE = /[aeiou]/;
const RegexEscape = "_RE_";
const HtmlEntities = /&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi;
class RiQuery extends import_mingo.Query {
  constructor(scripting, condition, options) {
    if (typeof condition === "string") {
      let raw = condition;
      condition = scripting.parseJSOL(condition);
    }
    super(condition, options);
  }
  test(obj) {
    for (let i = 0, len = this.compiled.length; i < len; i++) {
      if (!this.compiled[i](obj))
        return false;
    }
    return true;
  }
  operands() {
    const stack = [this.condition];
    const keys = /* @__PURE__ */ new Set();
    while (stack?.length > 0) {
      const currentObj = stack.pop();
      Object.keys(currentObj).forEach((key) => {
        const value = currentObj[key];
        if (!key.startsWith("$"))
          keys.add(key);
        if (typeof value === "object" && value !== null) {
          const eles = Array.isArray(value) ? value : [value];
          eles.forEach((ele) => stack.push(ele));
        }
      });
    }
    return Array.from(keys);
  }
}
const _RiScript = class {
  static evaluate(script, context, opts = {}) {
    return new _RiScript().evaluate(script, context, opts);
  }
  constructor(opts = {}) {
    this.visitor = 0;
    this.v2Compatible = opts.compatibility === 2;
    const { Constants, tokens } = (0, import_tokens.getTokens)(this.v2Compatible);
    this.Escaped = Constants.Escaped;
    this.Symbols = Constants.Symbols;
    const anysym = Constants.Escaped.STATIC + Constants.Escaped.DYNAMIC;
    const open = Constants.Escaped.OPEN_CHOICE;
    const close = Constants.Escaped.CLOSE_CHOICE;
    this.JSOLIdentRE = new RegExp(`([${anysym}]?[A-Za-z_0-9][A-Za-z_0-9]*)\\s*:`, "g");
    this.RawAssignRE = new RegExp(`^[${anysym}][A-Za-z_0-9][A-Za-z_0-9]*\\s*=`);
    this.ChoiceWrapRE = new RegExp("^" + open + "[^" + open + close + "]*" + close + "$");
    this.SpecialRE = new RegExp(`[${this.Escaped.SPECIAL.replace("&", "")}]`);
    this.ContinueRE = new RegExp(this.Escaped.CONTINUATION + "\\r?\\n", "g");
    this.WhitespaceRE = /[\u00a0\u2000-\u200b\u2028-\u2029\u3000]+/g;
    this.AnySymbolRE = new RegExp(`[${anysym}]`);
    this.silent = false;
    this.lexer = new import_chevrotain.Lexer(tokens);
    this.parser = new import_parser.RiScriptParser(tokens);
    this.RiTa = opts.RiTa || {
      VERSION: 0,
      randi: (k) => Math.floor(Math.random() * k)
    };
  }
  lex(opts) {
    if (!opts.input)
      throw Error("no input");
    const lexResult = this.lexer.tokenize(opts.input);
    if (lexResult.errors.length) {
      console.error("Input: " + opts.input + "\n", lexResult.errors[0].message);
      throw Error("[LEXING] " + lexResult.errors[0].message);
    }
    if (opts.trace)
      this.printTokens(lexResult.tokens);
    opts.tokens = lexResult.tokens;
  }
  parse(opts) {
    opts.cst = this.parser.parse(opts);
  }
  visit(opts) {
    return this.visitor.start(opts);
  }
  lexParseVisit(opts = {}) {
    this.lex(opts);
    this.parse(opts);
    return this.visit(opts);
  }
  evaluate(script, context, opts = {}) {
    if (typeof script !== "string") {
      throw Error("RiScript.evaluate() expects a string, got " + typeof script);
    }
    opts.input = script;
    opts.visitor = new import_visitor.RiScriptVisitor(this, context);
    return this._evaluate(opts);
  }
  _evaluate(opts) {
    const { input } = opts;
    let last, endingBreak = /\r?\n$/.test(input);
    let expr = this.preParse(input, opts);
    if (!expr)
      return "";
    if (opts.trace)
      console.log(`
Input:  '${_RiScript._escapeText(input)}'`);
    if (opts.trace && input !== expr) {
      console.log(`Parsed: '${_RiScript._escapeText(expr)}'`);
    }
    if (!opts.visitor)
      throw Error("no visitor");
    this.visitor = opts.visitor;
    delete opts.visitor;
    for (let i = 1; expr !== last && i <= 10; i++) {
      last = expr;
      if (opts.trace)
        console.log("-".repeat(20) + " Pass#" + i + " " + "-".repeat(20));
      opts.input = expr;
      expr = this.lexParseVisit(opts);
      if (opts.trace) {
        console.log(`Result(${i}) -> "${_RiScript._escapeText(expr)}" ctx=${this.visitor.lookupsToString()}`);
      }
      if (opts.onepass || !this.isParseable(expr))
        break;
    }
    if (!this.silent && !this.RiTa.SILENT) {
      if (this.AnySymbolRE.test(expr.replace(HtmlEntities, ""))) {
        console.warn('[WARN] Unresolved symbol(s) in "' + expr.replace(/\n/g, "\\n") + '" ');
      }
    }
    return this.postParse(expr, opts) + (endingBreak ? "\n" : "");
  }
  _query(rawQuery, opts) {
    return new RiQuery(this, rawQuery, opts);
  }
  printTokens(tokens) {
    let s = tokens.reduce((str, t) => {
      let { name } = t.tokenType;
      let tag = name;
      if (tag === "TEXT")
        tag = _RiScript._escapeText(t.image, 1);
      if (tag === "SYM")
        tag = "sym(" + t.image + ")";
      if (tag === "TX")
        tag = "tx(" + t.image + ")";
      return str + tag + ", ";
    }, "").slice(0, -2);
    console.log(
      "\nTokens: [ " + s + " ]  Context:",
      this.visitor.lookupsToString()
    );
  }
  postParse(input, opts) {
    if (typeof input !== "string")
      return "";
    let decoded = decode(input);
    let result = decoded.replace(this.WhitespaceRE, " ").replace(/\r?\n$/, "");
    let gates = [...result.matchAll(this.Symbols.PENDING_GATE_RE)];
    gates.forEach((g) => {
      if (!g || !g[0] || !g[1])
        throw Error("bad gate: " + g);
      let deferredGate = this.visitor.pendingGates[g[1]];
      let { deferredContext, operands } = deferredGate;
      if (!operands.length)
        throw Error("no operands");
      let reject = this.visitor.choice(deferredContext, { forceReject: true });
      result = result.replace(g[0], reject);
      if (opts.trace)
        console.log("  " + g[0] + "-> " + reject);
    });
    if (opts.trace)
      console.log(`
Final: '${result}'`);
    if (!opts.preserveLookups) {
      this.visitor.statics = void 0;
      this.visitor.dynamics = void 0;
    }
    return result;
  }
  preParse(script, opts) {
    if (typeof script !== "string")
      return "";
    const $ = this.Symbols;
    let input = script;
    if (!this.v2Compatible) {
      input = input.replace(/\((\s*\d+\s*)\)/g, "^$1^");
    }
    input = input.replace(/\/\*[^]*?(\r?\n)?\//g, "");
    input = input.replace(/\/\/[^\n]+(\r?\n|$)/g, "");
    input = input.replace(this.ContinueRE, "");
    input = slashEscapesToEntities(input);
    let result = "";
    let lines = input.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (
        /*!opts.noAddedSilence && */
        this.RawAssignRE.test(lines[i])
      ) {
        let eqIdx = lines[i].indexOf("=");
        if (eqIdx < 0)
          throw Error("invalid state: no assigment: " + lines[i]);
        let lhs = lines[i].substring(0, eqIdx), rhs = lines[i].substring(eqIdx + 1);
        let opens = charCount(rhs, $.OPEN_CHOICE);
        let closes = charCount(rhs, $.CLOSE_CHOICE);
        while (opens > closes) {
          let line = lines[++i];
          rhs += "\n" + line;
          opens += charCount(line, $.OPEN_CHOICE);
          closes += charCount(line, $.CLOSE_CHOICE);
        }
        result += $.OPEN_SILENT + (lhs + "=" + rhs) + $.CLOSE_SILENT;
      } else {
        result += lines[i];
        if (i < lines.length - 1)
          result += "\n";
      }
    }
    return result;
  }
  /**
   * Parses a mingo query into JSON format
   */
  parseJSOL(text) {
    const unescapeRegexProperty = (text2) => {
      let res = text2;
      if (typeof text2 === "string" && text2.startsWith(RegexEscape) && text2.endsWith(RegexEscape)) {
        let parts = text2.split(RegexEscape);
        if (parts.length !== 4)
          throw Error("invalid regex in unescape");
        res = new RegExp(parts[1], parts[2]);
      }
      return res;
    };
    let escaped = _RiScript._escapeJSONRegex(text).replace(this.JSOLIdentRE, '"$1":').replace(/'/g, '"');
    let result = JSON.parse(escaped), urp = unescapeRegexProperty;
    Object.keys(result).forEach((k) => result[k] = urp(result[k]));
    return result;
  }
  isParseable(s) {
    let result = true;
    let isStrOrNum = /(string|number)/.test(typeof s);
    if (isStrOrNum)
      result = this.SpecialRE.test(s.toString());
    return result;
  }
  // ========================= statics ===============================
  // Default transform that adds an article
  static articlize(s) {
    if (!s || !s.length)
      return "";
    let first = s.split(/\s+/)[0];
    if (!_RiScript.RiTa?.phones) {
      if (!_RiScript.RiTaWarnings.phones) {
        console.warn("[WARN] Install RiTa for proper phonemes");
        _RiScript.RiTaWarnings.phones = true;
      }
      return (/^[aeiou].*/i.test(first) ? "an " : "a ") + s;
    }
    let phones = _RiScript.RiTa.phones(first, { silent: true });
    return (phones && phones.length && VowelRE.test(phones[0]) ? "an " : "a ") + s;
  }
  // Default transform that capitalizes the first character
  static capitalize(s) {
    return s ? s[0].toUpperCase() + s.substring(1) : "";
  }
  // Default transform that capitalizes the string
  static uppercase(s) {
    return s ? s.toUpperCase() : "";
  }
  // Default transform that wraps the string in (smart) quotes.
  static quotify(s) {
    return "&#8220;" + (s || "") + "&#8221;";
  }
  // Default transform that pluralizes a string (requires RiTa)
  static pluralize(s) {
    if (!_RiScript.RiTa?.pluralize) {
      if (!_RiScript.RiTaWarnings.plurals) {
        _RiScript.RiTaWarnings.plurals = true;
        console.warn("[WARN] Install RiTa for proper pluralization");
      }
      return s.endsWith("s") ? s : s + "s";
    }
    return _RiScript.RiTa.pluralize(s);
  }
  // Default no-op transform
  static identity(s) {
    return s;
  }
  // static helpers
  static _transformNames(txs) {
    return txs && txs.length ? txs.map((tx) => tx.image.replace(/(^\.|\(\)$)/g, ""), []) : [];
  }
  static _escapeText(s, quotify) {
    if (typeof s !== "string")
      return s;
    let t = s.replace(/\r?\n/g, "\\n");
    return quotify || !t.length ? "'" + t + "'" : t;
  }
  static _escapeJSONRegex(text) {
    return text.replace(
      /\/([^/]+?)\/([igmsuy]*)/g,
      `"${RegexEscape}$1${RegexEscape}$2${RegexEscape}"`
    );
  }
  static _stringHash(s) {
    let chr, hash = 0;
    for (let i = 0; i < s.length; i++) {
      chr = s.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    let strHash = hash.toString();
    return hash < 0 ? strHash.replace("-", "0") : strHash;
  }
};
let RiScript = _RiScript;
__publicField(RiScript, "Query", RiQuery);
__publicField(RiScript, "VERSION", "[VI]{version}[/VI]");
__publicField(RiScript, "RiTaWarnings", { plurals: false, phones: false });
RiScript.transforms = {
  quotify: RiScript.quotify,
  pluralize: RiScript.pluralize,
  capitalize: RiScript.capitalize,
  articlize: RiScript.articlize,
  uppercase: RiScript.uppercase,
  // sequences
  norepeat: RiScript.identity,
  // aliases
  art: RiScript.articlize,
  nr: RiScript.identity,
  cap: RiScript.capitalize,
  ucf: RiScript.capitalize,
  // deprecated?
  uc: RiScript.uppercase,
  qq: RiScript.quotify,
  s: RiScript.pluralize
};
function slashEscapesToEntities(s) {
  s = replaceAll(s, "\\(", "&lpar;");
  s = replaceAll(s, "\\)", "&rpar;");
  s = replaceAll(s, "\\[", "&lsqb;");
  s = replaceAll(s, "\\]", "&rsqb;");
  s = replaceAll(s, "\\{", "&lcqb;");
  s = replaceAll(s, "\\}", "&rcqb;");
  s = replaceAll(s, "\\@", "&commat;");
  s = replaceAll(s, "\\#", "&num;");
  s = replaceAll(s, "\\|", " &vert");
  s = replaceAll(s, "\\=", " &equals");
  return s;
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function replaceAll(str, match, replacement) {
  return str.replace(new RegExp(escapeRegExp(match), "g"), () => replacement);
}
function charCount(str, c) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === c)
      count++;
  }
  return count;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RiScript
});
