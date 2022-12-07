"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globes = exports.langAlias = exports.langs = void 0;
const en_json_1 = __importDefault(require("../assets/lang/en.json"));
const zh_tw_json_1 = __importDefault(require("../assets/lang/zh_tw.json"));
const icons_json_1 = __importDefault(require("../assets/icons.json"));
exports.langs = { en: en_json_1.default, tw: zh_tw_json_1.default };
exports.langAlias = {
    en: ["en", "english"],
    tw: ["tw", "zh-tw", "繁體中文"]
};
exports.globes = {
    color: "CFF2FF"
};
class i18n {
    globe;
    icon;
    constructor() {
        this.globe = exports.globes;
        this.icon = icons_json_1.default;
    }
    parse(lang, string, ...opt) {
        if (string.startsWith("-"))
            string = string.slice(1);
        if (!Object.keys(exports.langs).includes(lang))
            throw new Error("No lang specified found!");
        let str = exports.langs[lang][string] ??
            exports.langs["en"][string] ??
            `${string}${opt.length ? `(${opt.join(", ")})` : ""}`;
        if (typeof str != "string")
            return str;
        for (let ot of opt)
            str = str.replace("%s", `${ot}`);
        return str;
    }
}
global.i18n = new i18n();
//# sourceMappingURL=i18n.js.map