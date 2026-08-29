"use strict";
/**
* @vue/shared v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function makeMap(str, expectsLowerCase) {
  const set2 = new Set(str.split(","));
  return expectsLowerCase ? (val) => set2.has(val.toLowerCase()) : (val) => set2.has(val);
}
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i2 = arr.indexOf(el);
  if (i2 > -1) {
    arr.splice(i2, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise$1 = (val) => {
  return (isObject$1(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const isBuiltInDirective = /* @__PURE__ */ makeMap(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
);
const cacheStringFunction = (fn2) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn2(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_2, c2) => c2 ? c2.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str) => {
  const s2 = str ? `on${capitalize(str)}` : ``;
  return s2;
});
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns$1 = (fns, arg) => {
  for (let i2 = 0; i2 < fns.length; i2++) {
    fns[i2](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const looseToNumber = (val) => {
  const n2 = parseFloat(val);
  return isNaN(n2) ? val : n2;
};
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i2 = 0; i2 < value.length; i2++) {
      const item = value[i2];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i2 = 0; i2 < value.length; i2++) {
      const normalized = normalizeClass(value[i2]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i2) => {
          entries[stringifySymbol(key, i2) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v2) => stringifySymbol(v2))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject$1(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v2, i2 = "") => {
  var _a;
  return isSymbol(v2) ? `Symbol(${(_a = v2.description) != null ? _a : i2})` : v2;
};
const LOCALE_ZH_HANS = "zh-Hans";
const LOCALE_ZH_HANT = "zh-Hant";
const LOCALE_EN = "en";
const LOCALE_FR = "fr";
const LOCALE_ES = "es";
function include(str, parts) {
  return !!parts.find((part) => str.indexOf(part) !== -1);
}
function startsWith(str, parts) {
  return parts.find((part) => str.indexOf(part) === 0);
}
function normalizeLocale(locale, messages) {
  if (!locale) {
    return;
  }
  locale = locale.trim().replace(/_/g, "-");
  if (messages && messages[locale]) {
    return locale;
  }
  locale = locale.toLowerCase();
  if (locale === "chinese") {
    return LOCALE_ZH_HANS;
  }
  if (locale.indexOf("zh") === 0) {
    if (locale.indexOf("-hans") > -1) {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("-hant") > -1) {
      return LOCALE_ZH_HANT;
    }
    if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
      return LOCALE_ZH_HANT;
    }
    return LOCALE_ZH_HANS;
  }
  let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
  if (messages && Object.keys(messages).length > 0) {
    locales = Object.keys(messages);
  }
  const lang = startsWith(locale, locales);
  if (lang) {
    return lang;
  }
}
const SLOT_DEFAULT_NAME = "d";
const ON_SHOW = "onShow";
const ON_HIDE = "onHide";
const ON_LAUNCH = "onLaunch";
const ON_ERROR = "onError";
const ON_THEME_CHANGE = "onThemeChange";
const ON_PAGE_NOT_FOUND = "onPageNotFound";
const ON_UNHANDLE_REJECTION = "onUnhandledRejection";
const ON_LAST_PAGE_BACK_PRESS = "onLastPageBackPress";
const ON_EXIT = "onExit";
const ON_LOAD = "onLoad";
const ON_READY = "onReady";
const ON_UNLOAD = "onUnload";
const ON_INIT = "onInit";
const ON_SAVE_EXIT_STATE = "onSaveExitState";
const ON_UPLOAD_DOUYIN_VIDEO = "onUploadDouyinVideo";
const ON_LIVE_MOUNT = "onLiveMount";
const ON_TITLE_CLICK = "onTitleClick";
const ON_RESIZE = "onResize";
const ON_BACK_PRESS = "onBackPress";
const ON_PAGE_SCROLL = "onPageScroll";
const ON_TAB_ITEM_TAP = "onTabItemTap";
const ON_REACH_BOTTOM = "onReachBottom";
const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
const ON_SHARE_TIMELINE = "onShareTimeline";
const ON_SHARE_CHAT = "onShareChat";
const ON_COPY_URL = "onCopyUrl";
const ON_ADD_TO_FAVORITES = "onAddToFavorites";
const ON_SHARE_APP_MESSAGE = "onShareAppMessage";
const ON_NAVIGATION_BAR_BUTTON_TAP = "onNavigationBarButtonTap";
const ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED = "onNavigationBarSearchInputClicked";
const ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED = "onNavigationBarSearchInputChanged";
const ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED = "onNavigationBarSearchInputConfirmed";
const ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED = "onNavigationBarSearchInputFocusChanged";
const VIRTUAL_HOST_STYLE = "virtualHostStyle";
const VIRTUAL_HOST_CLASS = "virtualHostClass";
const VIRTUAL_HOST_HIDDEN = "virtualHostHidden";
const VIRTUAL_HOST_ID = "virtualHostId";
const customizeRE = /:/g;
function customizeEvent(str) {
  return camelize(str.replace(customizeRE, "-"));
}
function hasLeadingSlash(str) {
  return str.indexOf("/") === 0;
}
function addLeadingSlash(str) {
  return hasLeadingSlash(str) ? str : "/" + str;
}
const invokeArrayFns = (fns, arg) => {
  let ret;
  for (let i2 = 0; i2 < fns.length; i2++) {
    ret = fns[i2](arg);
  }
  return ret;
};
function once(fn2, ctx = null) {
  let res;
  return (...args) => {
    if (fn2) {
      res = fn2.apply(ctx, args);
      fn2 = null;
    }
    return res;
  };
}
function getValueByDataPath(obj, path) {
  if (!isString(path)) {
    return;
  }
  path = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = path.split(".");
  let key = parts[0];
  if (!obj) {
    obj = {};
  }
  if (parts.length === 1) {
    return obj[key];
  }
  return getValueByDataPath(obj[key], parts.slice(1).join("."));
}
const encode = encodeURIComponent;
function stringifyQuery(obj, encodeStr = encode) {
  const res = obj ? Object.keys(obj).map((key) => {
    let val = obj[key];
    if (typeof val === void 0 || val === null) {
      val = "";
    } else if (isPlainObject(val)) {
      val = JSON.stringify(val);
    }
    return encodeStr(key) + "=" + encodeStr(val);
  }).filter((x) => x.length > 0).join("&") : null;
  return res ? `?${res}` : "";
}
const PAGE_HOOKS = [
  ON_INIT,
  ON_LOAD,
  ON_SHOW,
  ON_HIDE,
  ON_UNLOAD,
  ON_RESIZE,
  ON_BACK_PRESS,
  ON_PAGE_SCROLL,
  ON_TAB_ITEM_TAP,
  ON_REACH_BOTTOM,
  ON_PULL_DOWN_REFRESH,
  ON_SHARE_TIMELINE,
  ON_SHARE_APP_MESSAGE,
  ON_SHARE_CHAT,
  ON_COPY_URL,
  ON_UPLOAD_DOUYIN_VIDEO,
  ON_LIVE_MOUNT,
  ON_TITLE_CLICK,
  ON_ADD_TO_FAVORITES,
  ON_SAVE_EXIT_STATE,
  ON_NAVIGATION_BAR_BUTTON_TAP,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED
];
function isRootHook(name) {
  return PAGE_HOOKS.indexOf(name) > -1;
}
const UniLifecycleHooks = [
  ON_SHOW,
  ON_HIDE,
  ON_LAUNCH,
  ON_ERROR,
  ON_THEME_CHANGE,
  ON_PAGE_NOT_FOUND,
  ON_UNHANDLE_REJECTION,
  ON_EXIT,
  ON_INIT,
  ON_LOAD,
  ON_READY,
  ON_UNLOAD,
  ON_RESIZE,
  ON_BACK_PRESS,
  ON_PAGE_SCROLL,
  ON_TAB_ITEM_TAP,
  ON_REACH_BOTTOM,
  ON_PULL_DOWN_REFRESH,
  ON_SHARE_TIMELINE,
  ON_ADD_TO_FAVORITES,
  ON_SHARE_APP_MESSAGE,
  ON_SHARE_CHAT,
  ON_COPY_URL,
  ON_UPLOAD_DOUYIN_VIDEO,
  ON_LIVE_MOUNT,
  ON_TITLE_CLICK,
  ON_SAVE_EXIT_STATE,
  ON_NAVIGATION_BAR_BUTTON_TAP,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED,
  ON_LAST_PAGE_BACK_PRESS
];
const MINI_PROGRAM_PAGE_RUNTIME_HOOKS = /* @__PURE__ */ (() => {
  return {
    onPageScroll: 1,
    onShareAppMessage: 1 << 1,
    onShareTimeline: 1 << 2,
    onShareChat: 1 << 3,
    onCopyUrl: 1 << 4,
    onUploadDouyinVideo: 1 << 5,
    onLiveMount: 1 << 6,
    onTitleClick: 1 << 7
  };
})();
function isUniLifecycleHook(name, value, checkType = true) {
  if (checkType && !isFunction(value)) {
    return false;
  }
  if (UniLifecycleHooks.indexOf(name) > -1) {
    return true;
  } else if (name.indexOf("on") === 0) {
    return true;
  }
  return false;
}
let vueApp;
const createVueAppHooks = [];
function onCreateVueApp(hook) {
  if (vueApp) {
    return hook(vueApp);
  }
  createVueAppHooks.push(hook);
}
function invokeCreateVueAppHook(app) {
  vueApp = app;
  createVueAppHooks.forEach((hook) => hook(app));
}
const invokeCreateErrorHandler = once((app, createErrorHandler2) => {
  return createErrorHandler2(app);
});
const E$1 = function() {
};
E$1.prototype = {
  _id: 1,
  on: function(name, callback, ctx) {
    var e2 = this.e || (this.e = {});
    (e2[name] || (e2[name] = [])).push({
      fn: callback,
      ctx,
      _id: this._id
    });
    return this._id++;
  },
  once: function(name, callback, ctx) {
    var self2 = this;
    function listener() {
      self2.off(name, listener);
      callback.apply(ctx, arguments);
    }
    listener._ = callback;
    return this.on(name, listener, ctx);
  },
  emit: function(name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i2 = 0;
    var len = evtArr.length;
    for (i2; i2 < len; i2++) {
      evtArr[i2].fn.apply(evtArr[i2].ctx, data);
    }
    return this;
  },
  off: function(name, event) {
    var e2 = this.e || (this.e = {});
    var evts = e2[name];
    var liveEvents = [];
    if (evts && event) {
      for (var i2 = evts.length - 1; i2 >= 0; i2--) {
        if (evts[i2].fn === event || evts[i2].fn._ === event || evts[i2]._id === event) {
          evts.splice(i2, 1);
          break;
        }
      }
      liveEvents = evts;
    }
    liveEvents.length ? e2[name] = liveEvents : delete e2[name];
    return this;
  }
};
var E$1$1 = E$1;
/**
* @dcloudio/uni-mp-vue v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function warn$2(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn2) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn2();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    } else {
      warn$2(`cannot run an inactive effect scope.`);
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i2, l2;
      for (i2 = 0, l2 = this.effects.length; i2 < l2; i2++) {
        this.effects[i2].stop();
      }
      for (i2 = 0, l2 = this.cleanups.length; i2 < l2; i2++) {
        this.cleanups[i2]();
      }
      if (this.scopes) {
        for (i2 = 0, l2 = this.scopes.length; i2 < l2; i2++) {
          this.scopes[i2].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect2, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect2);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeEffect;
class ReactiveEffect {
  constructor(fn2, trigger2, scheduler, scope) {
    this.fn = fn2;
    this.trigger = trigger2;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this._dirtyLevel = 4;
    this._trackId = 0;
    this._runnings = 0;
    this._shouldSchedule = false;
    this._depsLength = 0;
    recordEffectScope(this, scope);
  }
  get dirty() {
    if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
      this._dirtyLevel = 1;
      pauseTracking();
      for (let i2 = 0; i2 < this._depsLength; i2++) {
        const dep = this.deps[i2];
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= 4) {
            break;
          }
        }
      }
      if (this._dirtyLevel === 1) {
        this._dirtyLevel = 0;
      }
      resetTracking();
    }
    return this._dirtyLevel >= 4;
  }
  set dirty(v2) {
    this._dirtyLevel = v2 ? 4 : 0;
  }
  run() {
    this._dirtyLevel = 0;
    if (!this.active) {
      return this.fn();
    }
    let lastShouldTrack = shouldTrack;
    let lastEffect = activeEffect;
    try {
      shouldTrack = true;
      activeEffect = this;
      this._runnings++;
      preCleanupEffect(this);
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._runnings--;
      activeEffect = lastEffect;
      shouldTrack = lastShouldTrack;
    }
  }
  stop() {
    var _a;
    if (this.active) {
      preCleanupEffect(this);
      postCleanupEffect(this);
      (_a = this.onStop) == null ? void 0 : _a.call(this);
      this.active = false;
    }
  }
}
function triggerComputed(computed2) {
  return computed2.value;
}
function preCleanupEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i2 = effect2._depsLength; i2 < effect2.deps.length; i2++) {
      cleanupDepEffect(effect2.deps[i2], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
let shouldTrack = true;
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  var _a;
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
    {
      (_a = effect2.onTrack) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
    }
  }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  var _a;
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    let tracking;
    if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
      effect2._dirtyLevel = dirtyLevel;
    }
    if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      {
        (_a = effect2.onTrigger) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
      }
      effect2.trigger();
      if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
        effect2._shouldSchedule = false;
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}
const createDep = (cleanup, computed2) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed2;
  return dep;
};
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("iterate");
const MAP_KEY_ITERATE_KEY = Symbol("Map key iterate");
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
      activeEffect,
      dep,
      {
        target,
        type,
        key
      }
    );
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        4,
        {
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        }
      );
    }
  }
  resetScheduling();
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i2 = 0, l2 = this.length; i2 < l2; i2++) {
        track(arr, "get", i2 + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty(key) {
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    {
      warn$2(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    {
      warn$2(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
  true
);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v2) => Reflect.getPrototypeOf(v2);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get22 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get22.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value, oldValue);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get22 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get22 ? get22.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const oldTarget = isMap(target) ? new Map(target) : new Set(target);
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0, oldTarget);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn$2(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has2, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has2.call(target, rawKey)) {
    const type = toRawType(target);
    warn$2(
      `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    {
      warn$2(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;
const COMPUTED_SIDE_EFFECT_WARN = `Computed is still dirty after getter evaluation, likely because a computed is mutating its own dependency in its getter. State mutations in computed getters should be avoided.  Check the docs for more details: https://vuejs.org/guide/essentials/computed.html#getters-should-be-side-effect-free`;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this.getter = getter;
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => triggerRefValue(
        this,
        this.effect._dirtyLevel === 2 ? 2 : 3
      )
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self = toRaw(this);
    if ((!self._cacheable || self.effect.dirty) && hasChanged(self._value, self._value = self.effect.run())) {
      triggerRefValue(self, 4);
    }
    trackRefValue(self);
    if (self.effect._dirtyLevel >= 2) {
      if (this._warnRecursive) {
        warn$2(COMPUTED_SIDE_EFFECT_WARN, `

getter: `, this.getter);
      }
      triggerRefValue(self, 2);
    }
    return self._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(v2) {
    this.effect.dirty = v2;
  }
  // #endregion
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      warn$2("Write operation failed: computed value is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  if (debugOptions && !isSSR) {
    cRef.effect.onTrack = debugOptions.onTrack;
    cRef.effect.onTrigger = debugOptions.onTrigger;
  }
  return cRef;
}
function trackRefValue(ref2) {
  var _a;
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    trackEffect(
      activeEffect,
      (_a = ref2.dep) != null ? _a : ref2.dep = createDep(
        () => ref2.dep = void 0,
        ref2 instanceof ComputedRefImpl ? ref2 : void 0
      ),
      {
        target: ref2,
        type: "get",
        key: "value"
      }
    );
  }
}
function triggerRefValue(ref2, dirtyLevel = 4, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    triggerEffects(
      dep,
      dirtyLevel,
      {
        target: ref2,
        type: "set",
        key: "value",
        newValue: newVal
      }
    );
  }
}
function isRef(r2) {
  return !!(r2 && r2.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, 4, newVal);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
const stack = [];
function pushWarningContext(vnode) {
  stack.push(vnode);
}
function popWarningContext() {
  stack.pop();
}
function warn$1(msg, ...args) {
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        msg + args.map((a2) => {
          var _a, _b;
          return (_b = (_a = a2.toString) == null ? void 0 : _a.call(a2)) != null ? _b : JSON.stringify(a2);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i2) => {
    logs.push(...i2 === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
const ErrorTypeStrings = {
  ["sp"]: "serverPrefetch hook",
  ["bc"]: "beforeCreate hook",
  ["c"]: "created hook",
  ["bm"]: "beforeMount hook",
  ["m"]: "mounted hook",
  ["bu"]: "beforeUpdate hook",
  ["u"]: "updated",
  ["bum"]: "beforeUnmount hook",
  ["um"]: "unmounted hook",
  ["a"]: "activated hook",
  ["da"]: "deactivated hook",
  ["ec"]: "errorCaptured hook",
  ["rtc"]: "renderTracked hook",
  ["rtg"]: "renderTriggered hook",
  [0]: "setup function",
  [1]: "render function",
  [2]: "watcher getter",
  [3]: "watcher callback",
  [4]: "watcher cleanup function",
  [5]: "native event handler",
  [6]: "component event handler",
  [7]: "vnode hook",
  [8]: "directive hook",
  [9]: "transition hook",
  [10]: "app errorHandler",
  [11]: "app warnHandler",
  [12]: "ref function",
  [13]: "async component loader",
  [14]: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://github.com/vuejs/core ."
};
function callWithErrorHandling(fn2, instance, type, args) {
  try {
    return args ? fn2(...args) : fn2();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn2, instance, type, args) {
  if (isFunction(fn2)) {
    const res = callWithErrorHandling(fn2, instance, type, args);
    if (res && isPromise$1(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values = [];
  for (let i2 = 0; i2 < fn2.length; i2++) {
    values.push(callWithAsyncErrorHandling(fn2[i2], instance, type, args));
  }
  return values;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = ErrorTypeStrings[type] || type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i2 = 0; i2 < errorCapturedHooks.length; i2++) {
          if (errorCapturedHooks[i2](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(
        appErrorHandler,
        null,
        10,
        [err, exposedInstance, errorInfo]
      );
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    const info = ErrorTypeStrings[type] || type;
    if (contextVNode) {
      pushWarningContext(contextVNode);
    }
    warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
    if (contextVNode) {
      popWarningContext();
    }
    if (throwInDev) {
      console.error(err);
    } else {
      console.error(err);
    }
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue$1 = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick$1(fn2) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn2 ? p2.then(this ? fn2.bind(this) : fn2) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue$1.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue$1[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.pre) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!queue$1.length || !queue$1.includes(
    job,
    isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
  )) {
    if (job.id == null) {
      queue$1.push(job);
    } else {
      queue$1.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function hasQueueJob(job) {
  return queue$1.indexOf(job) > -1;
}
function invalidateJob(job) {
  const i2 = queue$1.indexOf(job);
  if (i2 > flushIndex) {
    queue$1.splice(i2, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(
      cb,
      cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
    )) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i2 = isFlushing ? flushIndex + 1 : 0) {
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  for (; i2 < queue$1.length; i2++) {
    const cb = queue$1[i2];
    if (cb && cb.pre) {
      if (checkRecursiveUpdates(seen, cb)) {
        continue;
      }
      queue$1.splice(i2, 1);
      i2--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a2, b2) => getId(a2) - getId(b2)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    {
      seen = seen || /* @__PURE__ */ new Map();
    }
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      if (checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex])) {
        continue;
      }
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a2, b2) => {
  const diff2 = getId(a2) - getId(b2);
  if (diff2 === 0) {
    if (a2.pre && !b2.pre)
      return -1;
    if (b2.pre && !a2.pre)
      return 1;
  }
  return diff2;
};
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  queue$1.sort(comparator);
  const check = (job) => checkRecursiveUpdates(seen, job);
  try {
    for (flushIndex = 0; flushIndex < queue$1.length; flushIndex++) {
      const job = queue$1[flushIndex];
      if (job && job.active !== false) {
        if (check(job)) {
          continue;
        }
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue$1.length = 0;
    flushPostFlushCbs(seen);
    isFlushing = false;
    currentFlushPromise = null;
    if (queue$1.length || pendingPostFlushCbs.length) {
      flushJobs(seen);
    }
  }
}
function checkRecursiveUpdates(seen, fn2) {
  if (!seen.has(fn2)) {
    seen.set(fn2, 1);
  } else {
    const count = seen.get(fn2);
    if (count > RECURSION_LIMIT) {
      const instance = fn2.ownerInstance;
      const componentName = instance && getComponentName(instance.type);
      handleError(
        `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
        null,
        10
      );
      return true;
    } else {
      seen.set(fn2, count + 1);
    }
  }
}
let devtools;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
  if (devtools) {
    devtools.emit(event, ...args);
  } else if (!devtoolsNotInstalled) {
    buffer.push({ event, args });
  }
}
function setDevtoolsHook(hook, target) {
  var _a, _b;
  devtools = hook;
  if (devtools) {
    devtools.enabled = true;
    buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
    buffer = [];
  } else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== "undefined" && // some envs mock window but not fully
    window.HTMLElement && // also exclude jsdom
    !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))
  ) {
    const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
    replay.push((newHook) => {
      setDevtoolsHook(newHook, target);
    });
    setTimeout(() => {
      if (!devtools) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        devtoolsNotInstalled = true;
        buffer = [];
      }
    }, 3e3);
  } else {
    devtoolsNotInstalled = true;
    buffer = [];
  }
}
function devtoolsInitApp(app, version2) {
  emit$1("app:init", app, version2, {
    Fragment,
    Text,
    Comment,
    Static
  });
}
const devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:added"
  /* COMPONENT_ADDED */
);
const devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:updated"
  /* COMPONENT_UPDATED */
);
const _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:removed"
  /* COMPONENT_REMOVED */
);
const devtoolsComponentRemoved = (component) => {
  if (devtools && typeof devtools.cleanupBuffer === "function" && // remove the component if it wasn't buffered
  !devtools.cleanupBuffer(component)) {
    _devtoolsComponentRemoved(component);
  }
};
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function createDevtoolsComponentHook(hook) {
  return (component) => {
    emit$1(
      hook,
      component.appContext.app,
      component.uid,
      // fixed by xxxxxx
      // 为 0 是 App，无 parent 是 Page 指向 App
      component.uid === 0 ? void 0 : component.parent ? component.parent.uid : 0,
      component
    );
  };
}
const devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook(
  "perf:start"
  /* PERFORMANCE_START */
);
const devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook(
  "perf:end"
  /* PERFORMANCE_END */
);
function createDevtoolsPerformanceHook(hook) {
  return (component, type, time) => {
    emit$1(hook, component.appContext.app, component.uid, component, type, time);
  };
}
function devtoolsComponentEmit(component, event, params) {
  emit$1(
    "component:emit",
    component.appContext.app,
    component,
    event,
    params
  );
}
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  {
    const {
      emitsOptions,
      propsOptions: [propsOptions]
    } = instance;
    if (emitsOptions) {
      if (!(event in emitsOptions) && true) {
        if (!propsOptions || !(toHandlerKey(event) in propsOptions)) {
          warn$1(
            `Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(event)}" prop.`
          );
        }
      } else {
        const validator = emitsOptions[event];
        if (isFunction(validator)) {
          const isValid = validator(...rawArgs);
          if (!isValid) {
            warn$1(
              `Invalid event arguments: event validation failed for event "${event}".`
            );
          }
        }
      }
    }
  }
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a2) => isString(a2) ? a2.trim() : a2);
    }
    if (number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  {
    devtoolsComponentEmit(instance, event, args);
  }
  {
    const lowerCaseEvent = event.toLowerCase();
    if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
      warn$1(
        `Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(
          instance,
          instance.type
        )} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(
          event
        )}" instead of "${event}".`
      );
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject$1(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  instance && instance.type.__scopeId || null;
  return prev;
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component2 = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(
        Component2,
        false
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component2;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component2[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component2;
    }
    if (warnMissing && !res) {
      const extra = type === COMPONENTS ? `
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.` : ``;
      warn$1(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
    }
    return res;
  } else {
    warn$1(
      `resolve${capitalize(type.slice(0, -1))} can only be used in render() or setup().`
    );
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  if (!isFunction(cb)) {
    warn$1(
      `\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`
    );
  }
  return doWatch(source, cb, options);
}
function doWatch(source, cb, {
  immediate,
  deep,
  flush,
  once: once2,
  onTrack,
  onTrigger
} = EMPTY_OBJ) {
  if (cb && once2) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      unwatch();
    };
  }
  if (deep !== void 0 && typeof deep === "number") {
    warn$1(
      `watch() "deep" option with number value will be used as watch depth in future versions. Please use a boolean instead to avoid potential breakage.`
    );
  }
  if (!cb) {
    if (immediate !== void 0) {
      warn$1(
        `watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (deep !== void 0) {
      warn$1(
        `watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (once2 !== void 0) {
      warn$1(
        `watch() "once" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
  }
  const warnInvalidSource = (s2) => {
    warn$1(
      `Invalid watch source: `,
      s2,
      `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
    );
  };
  const instance = currentInstance;
  const reactiveGetter = (source2) => deep === true ? source2 : (
    // for deep: false, only traverse root-level properties
    traverse(source2, deep === false ? 1 : void 0)
  );
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s2) => isReactive(s2) || isShallow(s2));
    getter = () => source.map((s2) => {
      if (isRef(s2)) {
        return s2.value;
      } else if (isReactive(s2)) {
        return reactiveGetter(s2);
      } else if (isFunction(s2)) {
        return callWithErrorHandling(s2, instance, 2);
      } else {
        warnInvalidSource(s2);
      }
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          3,
          [onCleanup]
        );
      };
    }
  } else {
    getter = NOOP;
    warnInvalidSource(source);
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn2) => {
    cleanup = effect2.onStop = () => {
      callWithErrorHandling(fn2, instance, 4);
      cleanup = effect2.onStop = void 0;
    };
  };
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect2.active || !effect2.dirty) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v2, i2) => hasChanged(v2, oldValue[i2])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect2.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect$1(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect2 = new ReactiveEffect(getter, NOOP, scheduler);
  const scope = getCurrentScope();
  const unwatch = () => {
    effect2.stop();
    if (scope) {
      remove(scope.effects, effect2);
    }
  };
  {
    effect2.onTrack = onTrack;
    effect2.onTrigger = onTrigger;
  }
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect$1(
      effect2.run.bind(effect2),
      instance && instance.suspense
    );
  } else {
    effect2.run();
  }
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i2 = 0; i2 < segments.length && cur; i2++) {
      cur = cur[segments[i2]];
    }
    return cur;
  };
}
function traverse(value, depth, currentDepth = 0, seen) {
  if (!isObject$1(value) || value["__v_skip"]) {
    return value;
  }
  if (depth && depth > 0) {
    if (currentDepth >= depth) {
      return value;
    }
    currentDepth++;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, depth, currentDepth, seen);
  } else if (isArray(value)) {
    for (let i2 = 0; i2 < value.length; i2++) {
      traverse(value[i2], depth, currentDepth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v2) => {
      traverse(v2, depth, currentDepth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, currentDepth, seen);
    }
  }
  return value;
}
function validateDirectiveName(name) {
  if (isBuiltInDirective(name)) {
    warn$1("Do not use built-in directive ids as custom directive id: " + name);
  }
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject$1(rootProps)) {
      warn$1(`root props passed to app.mount() must be an object.`);
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v2) {
        {
          warn$1(
            `app.config cannot be replaced. Modify individual options instead.`
          );
        }
      },
      use(plugin2, ...options) {
        if (installedPlugins.has(plugin2)) {
          warn$1(`Plugin has already been applied to target app.`);
        } else if (plugin2 && isFunction(plugin2.install)) {
          installedPlugins.add(plugin2);
          plugin2.install(app, ...options);
        } else if (isFunction(plugin2)) {
          installedPlugins.add(plugin2);
          plugin2(app, ...options);
        } else {
          warn$1(
            `A plugin must either be a function or an object with an "install" function.`
          );
        }
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          } else {
            warn$1(
              "Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : "")
            );
          }
        }
        return app;
      },
      component(name, component) {
        {
          validateComponentName(name, context.config);
        }
        if (!component) {
          return context.components[name];
        }
        if (context.components[name]) {
          warn$1(`Component "${name}" has already been registered in target app.`);
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        {
          validateDirectiveName(name);
        }
        if (!directive) {
          return context.directives[name];
        }
        if (context.directives[name]) {
          warn$1(`Directive "${name}" has already been registered in target app.`);
        }
        context.directives[name] = directive;
        return app;
      },
      // fixed by xxxxxx
      mount() {
      },
      // fixed by xxxxxx
      unmount() {
      },
      provide(key, value) {
        if (key in context.provides) {
          warn$1(
            `App already provides property with key "${String(key)}". It will be overwritten with the new value.`
          );
        }
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn2) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn2();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
function provide(key, value) {
  if (!currentInstance) {
    {
      warn$1(`provide() can only be used inside setup().`);
    }
  } else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
    if (currentInstance.type.mpType === "app") {
      currentInstance.appContext.app.provide(key, value);
    }
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance || currentApp) {
    const provides = instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : currentApp._context.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else {
      warn$1(`injection "${String(key)}" not found.`);
    }
  } else {
    warn$1(`inject() can only be used inside setup() or functional components.`);
  }
}
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    if (isRootHook(type)) {
      target = target.root;
    }
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  } else {
    const apiName = toHandlerKey(
      (ErrorTypeStrings[type] || type.replace(/^on/, "")).replace(/ hook$/, "")
    );
    warn$1(
      `${apiName} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup().`
    );
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (
  // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
  (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target)
);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook(
  "rtg"
);
const onRenderTracked = createHook(
  "rtc"
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const getPublicInstance = (i2) => {
  if (!i2)
    return null;
  if (isStatefulComponent(i2))
    return getExposeProxy(i2) || i2.proxy;
  return getPublicInstance(i2.parent);
};
function getComponentInternalInstance(i2) {
  return i2;
}
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    // fixed by xxxxxx
    $: getComponentInternalInstance,
    // fixed by xxxxxx vue-i18n 在 dev 模式，访问了 $el，故模拟一个假的
    // $el: i => i.vnode.el,
    $el: (i2) => i2.__$el || (i2.__$el = {}),
    $data: (i2) => i2.data,
    $props: (i2) => shallowReadonly(i2.props),
    $attrs: (i2) => shallowReadonly(i2.attrs),
    $slots: (i2) => shallowReadonly(i2.slots),
    $refs: (i2) => shallowReadonly(i2.refs),
    $parent: (i2) => getPublicInstance(i2.parent),
    $root: (i2) => getPublicInstance(i2.root),
    $emit: (i2) => i2.emit,
    $options: (i2) => resolveMergedOptions(i2),
    $forceUpdate: (i2) => i2.f || (i2.f = () => {
      i2.effect.dirty = true;
      queueJob(i2.update);
    }),
    // $nextTick: i => i.n || (i.n = nextTick.bind(i.proxy!)),// fixed by xxxxxx
    $watch: (i2) => instanceWatch.bind(i2)
  })
);
const isReservedPrefix = (key) => key === "_" || key === "$";
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key === "__isVue") {
      return true;
    }
    let normalizedProps;
    if (key[0] !== "$") {
      const n2 = accessCache[key];
      if (n2 !== void 0) {
        switch (n2) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (
        // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)
      ) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      } else if (key === "$slots") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (instance.exposed && hasOwn(instance.exposed, key)) {
      return instance.exposed[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else if (currentRenderingInstance && (!isString(key) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    key.indexOf("__v") !== 0)) {
      if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
        warn$1(
          `Property ${JSON.stringify(
            key
          )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
        );
      } else if (instance === currentRenderingInstance) {
        warn$1(
          `Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`
        );
      }
    }
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (setupState.__isScriptSetup && hasOwn(setupState, key)) {
      warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
      return false;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      warn$1(
        `Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`
      );
      return false;
    } else {
      if (key in instance.appContext.config.globalProperties) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          value
        });
      } else {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, propsOptions }
  }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
{
  PublicInstanceProxyHandlers.ownKeys = (target) => {
    warn$1(
      `Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`
    );
    return Reflect.ownKeys(target);
  };
}
function createDevRenderContext(instance) {
  const target = {};
  Object.defineProperty(target, `_`, {
    configurable: true,
    enumerable: false,
    get: () => instance
  });
  Object.keys(publicPropertiesMap).forEach((key) => {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get: () => publicPropertiesMap[key](instance),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: NOOP
    });
  });
  return target;
}
function exposePropsOnRenderContext(instance) {
  const {
    ctx,
    propsOptions: [propsOptions]
  } = instance;
  if (propsOptions) {
    Object.keys(propsOptions).forEach((key) => {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => instance.props[key],
        set: NOOP
      });
    });
  }
}
function exposeSetupStateOnRenderContext(instance) {
  const { ctx, setupState } = instance;
  Object.keys(toRaw(setupState)).forEach((key) => {
    if (!setupState.__isScriptSetup) {
      if (isReservedPrefix(key[0])) {
        warn$1(
          `setup() return property ${JSON.stringify(
            key
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => setupState[key],
        set: NOOP
      });
    }
  });
}
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
function createDuplicateChecker() {
  const cache = /* @__PURE__ */ Object.create(null);
  return (type, key) => {
    if (cache[key]) {
      warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
    } else {
      cache[key] = type;
    }
  };
}
let shouldCacheAccess = true;
function applyOptions$1(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = createDuplicateChecker();
  {
    const [propsOptions] = instance.propsOptions;
    if (propsOptions) {
      for (const key in propsOptions) {
        checkDuplicateProperties("Props", key);
      }
    }
  }
  function initInjections() {
    if (injectOptions) {
      resolveInjections(injectOptions, ctx, checkDuplicateProperties);
    }
  }
  {
    initInjections();
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          Object.defineProperty(ctx, key, {
            value: methodHandler.bind(publicThis),
            configurable: true,
            enumerable: true,
            writable: true
          });
        }
        {
          checkDuplicateProperties("Methods", key);
        }
      } else {
        warn$1(
          `Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`
        );
      }
    }
  }
  if (dataOptions) {
    if (!isFunction(dataOptions)) {
      warn$1(
        `The data option must be a function. Plain object usage is no longer supported.`
      );
    }
    const data = dataOptions.call(publicThis, publicThis);
    if (isPromise$1(data)) {
      warn$1(
        `data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`
      );
    }
    if (!isObject$1(data)) {
      warn$1(`data() should return an object.`);
    } else {
      instance.data = reactive(data);
      {
        for (const key in data) {
          checkDuplicateProperties("Data", key);
          if (!isReservedPrefix(key[0])) {
            Object.defineProperty(ctx, key, {
              configurable: true,
              enumerable: true,
              get: () => data[key],
              set: NOOP
            });
          }
        }
      }
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get22 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      if (get22 === NOOP) {
        warn$1(`Computed property "${key}" has no getter.`);
      }
      const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : () => {
        warn$1(
          `Write operation failed: computed property "${key}" is readonly.`
        );
      };
      const c2 = computed({
        get: get22,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c2.value,
        set: (v2) => c2.value = v2
      });
      {
        checkDuplicateProperties("Computed", key);
      }
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  function initProvides() {
    if (provideOptions) {
      const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key]);
      });
    }
  }
  {
    initProvides();
  }
  {
    if (created) {
      callHook$1(created, instance, "c");
    }
  }
  function registerLifecycleHook(register2, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register2(_hook.bind(publicThis)));
    } else if (hook) {
      register2(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
  if (instance.ctx.$onApplyOptions) {
    instance.ctx.$onApplyOptions(options, instance, publicThis);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v2) => injected.value = v2
      });
    } else {
      ctx[key] = injected;
    }
    {
      checkDuplicateProperties("Inject", key);
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      watch(getter, handler);
    } else {
      warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
    }
  } else if (isFunction(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$1(raw)) {
    if (isArray(raw)) {
      raw.forEach((r2) => createWatcher(r2, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      } else {
        warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
      }
    }
  } else {
    warn$1(`Invalid watch option: "${key}"`, raw);
  }
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m2) => mergeOptions(resolved, m2, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject$1(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m2) => mergeOptions(to, m2, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") {
      warn$1(
        `"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`
      );
    } else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray$1,
  created: mergeAsArray$1,
  beforeMount: mergeAsArray$1,
  mounted: mergeAsArray$1,
  beforeUpdate: mergeAsArray$1,
  updated: mergeAsArray$1,
  beforeDestroy: mergeAsArray$1,
  beforeUnmount: mergeAsArray$1,
  destroyed: mergeAsArray$1,
  unmounted: mergeAsArray$1,
  activated: mergeAsArray$1,
  deactivated: mergeAsArray$1,
  errorCaptured: mergeAsArray$1,
  serverPrefetch: mergeAsArray$1,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i2 = 0; i2 < raw.length; i2++) {
      res[raw[i2]] = raw[i2];
    }
    return res;
  }
  return raw;
}
function mergeAsArray$1(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray$1(to[key], from[key]);
  }
  return merged;
}
function initProps$1(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  {
    validateProps(rawProps || {}, props, instance);
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function isInHmrContext(instance) {
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !isInHmrContext() && (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i2 = 0; i2 < propsToUpdate.length; i2++) {
        let key = propsToUpdate[i2];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = normalizeInheritAttrsValue(instance, key, value);
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue$1(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = normalizeInheritAttrsValue(instance, key, value);
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue$1(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
  {
    validateProps(rawProps || {}, props, instance);
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          {
            props[camelKey] = value;
          }
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = normalizeInheritAttrsValue(instance, key, value);
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i2 = 0; i2 < needCastKeys.length; i2++) {
      const key = needCastKeys[i2];
      props[key] = resolvePropValue$1(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function normalizeInheritAttrsValue(instance, key, value) {
  return value;
}
function resolvePropValue$1(options, props, key, value, instance, isAbsent) {
  const result = _resolvePropValue(
    options,
    props,
    key,
    value,
    instance,
    isAbsent
  );
  return result;
}
function _resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i2 = 0; i2 < raw.length; i2++) {
      if (!isString(raw[i2])) {
        warn$1(`props must be strings when using array syntax.`, raw[i2]);
      }
      const normalizedKey = camelize(raw[i2]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    if (!isObject$1(raw)) {
      warn$1(`invalid props options`, raw);
    }
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[
            0
            /* shouldCast */
          ] = booleanIndex > -1;
          prop[
            1
            /* shouldCastTrue */
          ] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$1(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  } else {
    warn$1(`Invalid prop name: "${key}" is a reserved property.`);
  }
  return false;
}
function getType$1(ctor) {
  if (ctor === null) {
    return "null";
  }
  if (typeof ctor === "function") {
    return ctor.name || "";
  } else if (typeof ctor === "object") {
    const name = ctor.constructor && ctor.constructor.name;
    return name || "";
  }
  return "";
}
function isSameType(a2, b2) {
  return getType$1(a2) === getType$1(b2);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray(expectedTypes)) {
    return expectedTypes.findIndex((t2) => isSameType(t2, type));
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
function validateProps(rawProps, props, instance) {
  const resolvedValues = toRaw(props);
  const options = instance.propsOptions[0];
  for (const key in options) {
    let opt = options[key];
    if (opt == null)
      continue;
    validateProp$1(
      key,
      resolvedValues[key],
      opt,
      shallowReadonly(resolvedValues),
      !hasOwn(rawProps, key) && !hasOwn(rawProps, hyphenate(key))
    );
  }
}
function validateProp$1(name, value, prop, props, isAbsent) {
  const { type, required, validator, skipCheck } = prop;
  if (required && isAbsent) {
    warn$1('Missing required prop: "' + name + '"');
    return;
  }
  if (value == null && !required) {
    return;
  }
  if (type != null && type !== true && !skipCheck) {
    let isValid = false;
    const types = isArray(type) ? type : [type];
    const expectedTypes = [];
    for (let i2 = 0; i2 < types.length && !isValid; i2++) {
      const { valid, expectedType } = assertType$1(value, types[i2]);
      expectedTypes.push(expectedType || "");
      isValid = valid;
    }
    if (!isValid) {
      warn$1(getInvalidTypeMessage$1(name, value, expectedTypes));
      return;
    }
  }
  if (validator && !validator(value, props)) {
    warn$1('Invalid prop: custom validator check failed for prop "' + name + '".');
  }
}
const isSimpleType$1 = /* @__PURE__ */ makeMap(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function assertType$1(value, type) {
  let valid;
  const expectedType = getType$1(type);
  if (isSimpleType$1(expectedType)) {
    const t2 = typeof value;
    valid = t2 === expectedType.toLowerCase();
    if (!valid && t2 === "object") {
      valid = value instanceof type;
    }
  } else if (expectedType === "Object") {
    valid = isObject$1(value);
  } else if (expectedType === "Array") {
    valid = isArray(value);
  } else if (expectedType === "null") {
    valid = value === null;
  } else {
    valid = value instanceof type;
  }
  return {
    valid,
    expectedType
  };
}
function getInvalidTypeMessage$1(name, value, expectedTypes) {
  if (expectedTypes.length === 0) {
    return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
  }
  let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  const expectedValue = styleValue$1(value, expectedType);
  const receivedValue = styleValue$1(value, receivedType);
  if (expectedTypes.length === 1 && isExplicable$1(expectedType) && !isBoolean$1(expectedType, receivedType)) {
    message += ` with value ${expectedValue}`;
  }
  message += `, got ${receivedType} `;
  if (isExplicable$1(receivedType)) {
    message += `with value ${receivedValue}.`;
  }
  return message;
}
function styleValue$1(value, type) {
  if (type === "String") {
    return `"${value}"`;
  } else if (type === "Number") {
    return `${Number(value)}`;
  } else {
    return `${value}`;
  }
}
function isExplicable$1(type) {
  const explicitTypes = ["string", "number", "boolean"];
  return explicitTypes.some((elem) => type.toLowerCase() === elem);
}
function isBoolean$1(...args) {
  return args.some((elem) => elem.toLowerCase() === "boolean");
}
let supported;
let perf;
function startMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    perf.mark(`vue-${type}-${instance.uid}`);
  }
  {
    devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
  }
}
function endMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    const startTag = `vue-${type}-${instance.uid}`;
    const endTag = startTag + `:end`;
    perf.mark(endTag);
    perf.measure(
      `<${formatComponentName(instance, instance.type)}> ${type}`,
      startTag,
      endTag
    );
    perf.clearMarks(startTag);
    perf.clearMarks(endTag);
  }
  {
    devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
  }
}
function isSupported() {
  if (supported !== void 0) {
    return supported;
  }
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else {
    supported = false;
  }
  return supported;
}
const queuePostRenderEffect$1 = queuePostFlushCb;
const Fragment = Symbol.for("v-fgt");
const Text = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
const InternalObjectKey = `__vInternal`;
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend({}, props) : props;
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    attrsProxy: null,
    slotsProxy: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null,
    // fixed by xxxxxx 用于存储uni-app的元素缓存
    $uniElements: /* @__PURE__ */ new Map(),
    $templateUniElementRefs: [],
    $templateUniElementStyles: {},
    $eS: {},
    $eA: {}
  };
  {
    instance.ctx = createDevRenderContext(instance);
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  internalSetCurrentInstance = (i2) => {
    currentInstance = i2;
  };
  setInSSRSetupState = (v2) => {
    isInSSRComponentSetup = v2;
  };
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
const isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
function validateComponentName(name, { isNativeTag }) {
  if (isBuiltInTag(name) || isNativeTag(name)) {
    warn$1(
      "Do not use built-in or reserved HTML elements as component id: " + name
    );
  }
}
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isSSR && setInSSRSetupState(isSSR);
  const {
    props
    /*, children*/
  } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps$1(instance, props, isStateful, isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component2 = instance.type;
  {
    if (Component2.name) {
      validateComponentName(Component2.name, instance.appContext.config);
    }
    if (Component2.components) {
      const names = Object.keys(Component2.components);
      for (let i2 = 0; i2 < names.length; i2++) {
        validateComponentName(names[i2], instance.appContext.config);
      }
    }
    if (Component2.directives) {
      const names = Object.keys(Component2.directives);
      for (let i2 = 0; i2 < names.length; i2++) {
        validateDirectiveName(names[i2]);
      }
    }
    if (Component2.compilerOptions && isRuntimeOnly()) {
      warn$1(
        `"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`
      );
    }
  }
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  {
    exposePropsOnRenderContext(instance);
  }
  const { setup } = Component2;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        shallowReadonly(instance.props),
        setupContext
      ]
    );
    resetTracking();
    reset();
    if (isPromise$1(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      {
        warn$1(
          `setup() returned a Promise, but the version of Vue you are using does not support it yet.`
        );
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    {
      instance.render = setupResult;
    }
  } else if (isObject$1(setupResult)) {
    if (isVNode(setupResult)) {
      warn$1(
        `setup() should not return VNodes directly - return a render function instead.`
      );
    }
    {
      instance.devtoolsRawSetupState = setupResult;
    }
    instance.setupState = proxyRefs(setupResult);
    {
      exposeSetupStateOnRenderContext(instance);
    }
  } else if (setupResult !== void 0) {
    warn$1(
      `setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`
    );
  }
  finishComponentSetup(instance, isSSR);
}
let compile;
const isRuntimeOnly = () => !compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component2 = instance.type;
  if (!instance.render) {
    instance.render = Component2.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions$1(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
  if (!Component2.render && instance.render === NOOP && !isSSR) {
    if (Component2.template) {
      warn$1(
        `Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
      );
    } else {
      warn$1(`Component is missing template or render function.`);
    }
  }
}
function getAttrsProxy(instance) {
  return instance.attrsProxy || (instance.attrsProxy = new Proxy(
    instance.attrs,
    {
      get(target, key) {
        track(instance, "get", "$attrs");
        return target[key];
      },
      set() {
        warn$1(`setupContext.attrs is readonly.`);
        return false;
      },
      deleteProperty() {
        warn$1(`setupContext.attrs is readonly.`);
        return false;
      }
    }
  ));
}
function getSlotsProxy(instance) {
  return instance.slotsProxy || (instance.slotsProxy = new Proxy(instance.slots, {
    get(target, key) {
      track(instance, "get", "$slots");
      return target[key];
    }
  }));
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    {
      if (instance.exposed) {
        warn$1(`expose() should be called only once per setup().`);
      }
      if (exposed != null) {
        let exposedType = typeof exposed;
        if (exposedType === "object") {
          if (isArray(exposed)) {
            exposedType = "array";
          } else if (isRef(exposed)) {
            exposedType = "ref";
          }
        }
        if (exposedType !== "object") {
          warn$1(
            `expose() should be passed a plain object, received ${exposedType}.`
          );
        }
      }
    }
    instance.exposed = exposed || {};
  };
  {
    return Object.freeze({
      get attrs() {
        return getAttrsProxy(instance);
      },
      get slots() {
        return getSlotsProxy(instance);
      },
      get emit() {
        return (event, ...args) => instance.emit(event, ...args);
      },
      expose
    });
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        }
        return instance.proxy[key];
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c2) => c2.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component2, includeInferred = true) {
  return isFunction(Component2) ? Component2.displayName || Component2.name : Component2.name || includeInferred && Component2.__name;
}
function formatComponentName(instance, Component2, isRoot = false) {
  let name = getComponentName(Component2);
  if (!name && Component2.__file) {
    const match = Component2.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component2) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
      instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
const computed = (getterOrOptions, debugOptions) => {
  const c2 = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  {
    const i2 = getCurrentInstance();
    if (i2 && i2.appContext.config.warnRecursiveComputed) {
      c2._warnRecursive = true;
    }
  }
  return c2;
};
const version = "3.4.21";
const warn = warn$1;
function unwrapper(target) {
  return unref(target);
}
const ARRAYTYPE = "[object Array]";
const OBJECTTYPE = "[object Object]";
function diff(current, pre) {
  const result = {};
  syncKeys(current, pre);
  _diff(current, pre, "", result);
  return result;
}
function syncKeys(current, pre) {
  current = unwrapper(current);
  if (current === pre)
    return;
  const rootCurrentType = toTypeString(current);
  const rootPreType = toTypeString(pre);
  if (rootCurrentType == OBJECTTYPE && rootPreType == OBJECTTYPE) {
    for (let key in pre) {
      const currentValue = current[key];
      if (currentValue === void 0) {
        current[key] = null;
      } else {
        syncKeys(currentValue, pre[key]);
      }
    }
  } else if (rootCurrentType == ARRAYTYPE && rootPreType == ARRAYTYPE) {
    if (current.length >= pre.length) {
      pre.forEach((item, index2) => {
        syncKeys(current[index2], item);
      });
    }
  }
}
function _diff(current, pre, path, result) {
  current = unwrapper(current);
  if (current === pre)
    return;
  const rootCurrentType = toTypeString(current);
  const rootPreType = toTypeString(pre);
  if (rootCurrentType == OBJECTTYPE) {
    if (rootPreType != OBJECTTYPE || Object.keys(current).length < Object.keys(pre).length) {
      setResult(result, path, current);
    } else {
      for (let key in current) {
        const currentValue = unwrapper(current[key]);
        const preValue = pre[key];
        const currentType = toTypeString(currentValue);
        const preType = toTypeString(preValue);
        if (currentType != ARRAYTYPE && currentType != OBJECTTYPE) {
          if (currentValue != preValue) {
            setResult(
              result,
              (path == "" ? "" : path + ".") + key,
              currentValue
            );
          }
        } else if (currentType == ARRAYTYPE) {
          if (preType != ARRAYTYPE) {
            setResult(
              result,
              (path == "" ? "" : path + ".") + key,
              currentValue
            );
          } else {
            if (currentValue.length < preValue.length) {
              setResult(
                result,
                (path == "" ? "" : path + ".") + key,
                currentValue
              );
            } else {
              currentValue.forEach((item, index2) => {
                _diff(
                  item,
                  preValue[index2],
                  (path == "" ? "" : path + ".") + key + "[" + index2 + "]",
                  result
                );
              });
            }
          }
        } else if (currentType == OBJECTTYPE) {
          if (preType != OBJECTTYPE || Object.keys(currentValue).length < Object.keys(preValue).length) {
            setResult(
              result,
              (path == "" ? "" : path + ".") + key,
              currentValue
            );
          } else {
            for (let subKey in currentValue) {
              _diff(
                currentValue[subKey],
                preValue[subKey],
                (path == "" ? "" : path + ".") + key + "." + subKey,
                result
              );
            }
          }
        }
      }
    }
  } else if (rootCurrentType == ARRAYTYPE) {
    if (rootPreType != ARRAYTYPE) {
      setResult(result, path, current);
    } else {
      if (current.length < pre.length) {
        setResult(result, path, current);
      } else {
        current.forEach((item, index2) => {
          _diff(item, pre[index2], path + "[" + index2 + "]", result);
        });
      }
    }
  } else {
    setResult(result, path, current);
  }
}
function setResult(result, k, v2) {
  result[k] = v2;
}
function hasComponentEffect(instance) {
  return queue$1.includes(instance.update);
}
function flushCallbacks(instance) {
  const ctx = instance.ctx;
  const callbacks = ctx.__next_tick_callbacks;
  if (callbacks && callbacks.length) {
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    for (let i2 = 0; i2 < copies.length; i2++) {
      copies[i2]();
    }
  }
}
function nextTick(instance, fn2) {
  const ctx = instance.ctx;
  if (!ctx.__next_tick_pending && !hasComponentEffect(instance)) {
    return nextTick$1(fn2 && fn2.bind(instance.proxy));
  }
  let _resolve;
  if (!ctx.__next_tick_callbacks) {
    ctx.__next_tick_callbacks = [];
  }
  ctx.__next_tick_callbacks.push(() => {
    if (fn2) {
      callWithErrorHandling(
        fn2.bind(instance.proxy),
        instance,
        14
      );
    } else if (_resolve) {
      _resolve(instance.proxy);
    }
  });
  return new Promise((resolve2) => {
    _resolve = resolve2;
  });
}
function clone(src, seen) {
  src = unwrapper(src);
  const type = typeof src;
  if (type === "object" && src !== null) {
    let copy = seen.get(src);
    if (typeof copy !== "undefined") {
      return copy;
    }
    if (isArray(src)) {
      const len = src.length;
      copy = new Array(len);
      seen.set(src, copy);
      for (let i2 = 0; i2 < len; i2++) {
        copy[i2] = clone(src[i2], seen);
      }
    } else {
      copy = {};
      seen.set(src, copy);
      for (const name in src) {
        if (hasOwn(src, name)) {
          copy[name] = clone(src[name], seen);
        }
      }
    }
    return copy;
  }
  if (type !== "symbol") {
    return src;
  }
}
function deepCopy(src) {
  return clone(src, typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : /* @__PURE__ */ new Map());
}
function getMPInstanceData(instance, keys) {
  const data = instance.data;
  const ret = /* @__PURE__ */ Object.create(null);
  keys.forEach((key) => {
    ret[key] = data[key];
  });
  return ret;
}
function patch(instance, data, oldData) {
  if (!data) {
    return;
  }
  data = deepCopy(data);
  data.$eS = instance.$eS || {};
  data.$eA = instance.$eA || {};
  const ctx = instance.ctx;
  const mpType = ctx.mpType;
  if (mpType === "page" || mpType === "component") {
    data.r0 = 1;
    const mpInstance = ctx.$scope;
    const keys = Object.keys(data);
    const diffData = diff(data, oldData || getMPInstanceData(mpInstance, keys));
    if (Object.keys(diffData).length) {
      ctx.__next_tick_pending = true;
      mpInstance.setData(diffData, () => {
        ctx.__next_tick_pending = false;
        flushCallbacks(instance);
      });
      flushPreFlushCbs();
    } else {
      flushCallbacks(instance);
    }
  }
}
function initAppConfig(appConfig) {
  appConfig.globalProperties.$nextTick = function $nextTick(fn2) {
    return nextTick(this.$, fn2);
  };
}
function onApplyOptions(options, instance, publicThis) {
  instance.appContext.config.globalProperties.$applyOptions(
    options,
    instance,
    publicThis
  );
  const computedOptions = options.computed;
  if (computedOptions) {
    const keys = Object.keys(computedOptions);
    if (keys.length) {
      const ctx = instance.ctx;
      if (!ctx.$computedKeys) {
        ctx.$computedKeys = [];
      }
      ctx.$computedKeys.push(...keys);
    }
  }
  delete instance.ctx.$onApplyOptions;
}
function setRef$1(instance, isUnmount = false) {
  const {
    setupState,
    $templateRefs,
    $templateUniElementRefs,
    ctx: { $scope, $mpPlatform }
  } = instance;
  if (!$scope || !$templateRefs && !$templateUniElementRefs) {
    return;
  }
  if (isUnmount) {
    if ($mpPlatform !== "mp-alipay") {
      $templateRefs && $templateRefs.forEach(
        (templateRef) => setTemplateRef(templateRef, null, setupState)
      );
    }
    $templateUniElementRefs && $templateUniElementRefs.forEach(
      (templateRef) => setTemplateRef(templateRef, null, setupState)
    );
    return;
  }
  const check = $mpPlatform === "mp-baidu" || $mpPlatform === "mp-toutiao";
  const doSetByRefs = (refs) => {
    if (refs.length === 0) {
      return [];
    }
    const mpComponents = (
      // 字节小程序 selectAllComponents 可能返回 null
      // https://github.com/dcloudio/uni-app/issues/3954
      ($scope.selectAllComponents(".r") || []).concat(
        $scope.selectAllComponents(".r-i-f") || []
      )
    );
    return refs.filter((templateRef) => {
      const refValue = findComponentPublicInstance(mpComponents, templateRef.i);
      if (check && refValue === null) {
        return true;
      }
      setTemplateRef(templateRef, refValue, setupState);
      return false;
    });
  };
  const doSet = () => {
    if ($templateRefs) {
      const refs = doSetByRefs($templateRefs);
      if (refs.length && instance.proxy && instance.proxy.$scope) {
        instance.proxy.$scope.setData({ r1: 1 }, () => {
          doSetByRefs(refs);
        });
      }
    }
  };
  if ($mpPlatform !== "mp-alipay") {
    if ($scope._$setRef) {
      $scope._$setRef(doSet);
    } else {
      nextTick(instance, doSet);
    }
  }
  if ($templateUniElementRefs && $templateUniElementRefs.length) {
    nextTick(instance, () => {
      $templateUniElementRefs.forEach((templateRef) => {
        if (isArray(templateRef.v)) {
          templateRef.v.forEach((v2) => {
            setTemplateRef(templateRef, v2, setupState);
          });
        } else {
          setTemplateRef(templateRef, templateRef.v, setupState);
        }
      });
    });
  }
}
function toSkip(value) {
  if (isObject$1(value)) {
    markRaw(value);
  }
  return value;
}
function findComponentPublicInstance(mpComponents, id) {
  const mpInstance = mpComponents.find(
    (com) => com && (com.properties || com.props).uI === id
  );
  if (mpInstance) {
    const vm = mpInstance.$vm;
    if (vm) {
      return getExposeProxy(vm.$) || vm;
    }
    return toSkip(mpInstance);
  }
  return null;
}
function setTemplateRef({ r: r2, f: f2 }, refValue, setupState) {
  if (isFunction(r2)) {
    r2(refValue, {});
  } else {
    const _isString = isString(r2);
    const _isRef = isRef(r2);
    if (_isString || _isRef) {
      if (f2) {
        if (!_isRef) {
          return;
        }
        if (!isArray(r2.value)) {
          r2.value = [];
        }
        const existing = r2.value;
        if (existing.indexOf(refValue) === -1) {
          existing.push(refValue);
          if (!refValue) {
            return;
          }
          if (refValue.$) {
            onBeforeUnmount(() => remove(existing, refValue), refValue.$);
          }
        }
      } else if (_isString) {
        if (hasOwn(setupState, r2)) {
          setupState[r2] = refValue;
        }
      } else if (isRef(r2)) {
        r2.value = refValue;
      } else {
        warnRef(r2);
      }
    } else {
      warnRef(r2);
    }
  }
}
function warnRef(ref2) {
  warn("Invalid template ref type:", ref2, `(${typeof ref2})`);
}
const queuePostRenderEffect = queuePostFlushCb;
function mountComponent(initialVNode, options) {
  const instance = initialVNode.component = createComponentInstance(initialVNode, options.parentComponent, null);
  instance.renderer = options.mpType ? options.mpType : "component";
  {
    instance.ctx.$onApplyOptions = onApplyOptions;
    instance.ctx.$children = [];
  }
  if (options.mpType === "app") {
    instance.render = NOOP;
  }
  if (options.onBeforeSetup) {
    options.onBeforeSetup(instance, options);
  }
  {
    pushWarningContext(initialVNode);
    startMeasure(instance, `mount`);
  }
  {
    startMeasure(instance, `init`);
  }
  setupComponent(instance);
  {
    endMeasure(instance, `init`);
  }
  {
    if (options.parentComponent && instance.proxy) {
      options.parentComponent.ctx.$children.push(getExposeProxy(instance) || instance.proxy);
    }
  }
  setupRenderEffect(instance);
  {
    popWarningContext();
    endMeasure(instance, `mount`);
  }
  return instance.proxy;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
function clearTemplateRefs(templateRefs) {
  if (!templateRefs) {
    return [];
  }
  return templateRefs.filter((templateRef) => {
    const v2 = templateRef.v;
    if (v2 && typeof v2 === "object" && ["UNI-LOADING-ELEMENT", "UNI-CLOUD-DB-ELEMENT"].includes(v2.nodeName)) {
      return true;
    }
    return false;
  });
}
function renderComponentRoot(instance) {
  const {
    type: Component2,
    vnode,
    proxy,
    withProxy,
    props,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    data,
    setupState,
    ctx,
    uid: uid2,
    appContext: {
      app: {
        config: {
          globalProperties: { pruneComponentPropsCache: pruneComponentPropsCache2 }
        }
      }
    },
    inheritAttrs
  } = instance;
  instance.$uniElementIds = /* @__PURE__ */ new Map();
  instance.$templateRefs = clearTemplateRefs(
    instance.$templateRefs || []
  );
  instance.$templateUniElementRefs = clearTemplateRefs(
    instance.$templateUniElementRefs || []
  );
  instance.$templateUniElementStyles = {};
  instance.$ei = 0;
  pruneComponentPropsCache2(uid2);
  instance.__counter = instance.__counter === 0 ? 1 : 0;
  let result;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      fallthroughAttrs(inheritAttrs, props, propsOptions, attrs);
      const proxyToUse = withProxy || proxy;
      result = render.call(
        proxyToUse,
        proxyToUse,
        renderCache,
        props,
        setupState,
        data,
        ctx
      );
    } else {
      fallthroughAttrs(
        inheritAttrs,
        props,
        propsOptions,
        Component2.props ? attrs : getFunctionalFallthrough(attrs)
      );
      const render2 = Component2;
      result = render2.length > 1 ? render2(props, { attrs, slots, emit: emit2 }) : render2(
        props,
        null
        /* we know it doesn't need it */
      );
    }
  } catch (err) {
    handleError(err, instance, 1);
    result = false;
  }
  setRef$1(instance);
  setCurrentRenderingInstance(prev);
  return result;
}
function fallthroughAttrs(inheritAttrs, props, propsOptions, fallthroughAttrs2) {
  if (props && fallthroughAttrs2 && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs2).filter(
      (key) => key !== "class" && key !== "style"
    );
    if (!keys.length) {
      return;
    }
    if (propsOptions && keys.some(isModelListener)) {
      keys.forEach((key) => {
        if (!isModelListener(key) || !(key.slice(9) in propsOptions)) {
          props[key] = fallthroughAttrs2[key];
        }
      });
    } else {
      keys.forEach((key) => props[key] = fallthroughAttrs2[key]);
    }
  }
}
const updateComponentPreRender = (instance) => {
  pauseTracking();
  flushPreFlushCbs();
  resetTracking();
};
function componentUpdateScopedSlotsFn() {
  const scopedSlotsData = this.$scopedSlotsData;
  if (!scopedSlotsData || scopedSlotsData.length === 0) {
    return;
  }
  const mpInstance = this.ctx.$scope;
  const oldData = mpInstance.data;
  const diffData = /* @__PURE__ */ Object.create(null);
  scopedSlotsData.forEach(({ path, index: index2, data }) => {
    const oldScopedSlotData = getValueByDataPath(oldData, path);
    const diffPath = isString(index2) ? `${path}.${index2}` : `${path}[${index2}]`;
    if (typeof oldScopedSlotData === "undefined" || typeof oldScopedSlotData[index2] === "undefined") {
      diffData[diffPath] = data;
    } else {
      const diffScopedSlotData = diff(
        data,
        oldScopedSlotData[index2]
      );
      Object.keys(diffScopedSlotData).forEach((name) => {
        diffData[diffPath + "." + name] = diffScopedSlotData[name];
      });
    }
  });
  scopedSlotsData.length = 0;
  if (Object.keys(diffData).length) {
    mpInstance.setData(diffData);
  }
}
function toggleRecurse({ effect: effect2, update: update3 }, allowed) {
  effect2.allowRecurse = update3.allowRecurse = allowed;
}
function setupRenderEffect(instance) {
  const updateScopedSlots = componentUpdateScopedSlotsFn.bind(
    instance
  );
  instance.$updateScopedSlots = () => nextTick$1(() => queueJob(updateScopedSlots));
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      onBeforeUnmount(() => {
        setRef$1(instance, true);
      }, instance);
      {
        startMeasure(instance, `patch`);
      }
      patch(instance, renderComponentRoot(instance));
      {
        endMeasure(instance, `patch`);
      }
      {
        devtoolsComponentAdded(instance);
      }
    } else {
      const { next, bu, u: u2 } = instance;
      {
        pushWarningContext(next || instance.vnode);
      }
      toggleRecurse(instance, false);
      updateComponentPreRender();
      if (bu) {
        invokeArrayFns$1(bu);
      }
      toggleRecurse(instance, true);
      {
        startMeasure(instance, `patch`);
      }
      patch(instance, renderComponentRoot(instance));
      {
        endMeasure(instance, `patch`);
      }
      if (u2) {
        queuePostRenderEffect(u2);
      }
      {
        devtoolsComponentUpdated(instance);
      }
      {
        popWarningContext();
      }
    }
  };
  const effect2 = instance.effect = new ReactiveEffect(
    componentUpdateFn,
    NOOP,
    () => queueJob(update3),
    instance.scope
    // track it in component's effect scope
  );
  const update3 = instance.update = () => {
    if (effect2.dirty) {
      effect2.run();
    }
  };
  update3.id = instance.uid;
  toggleRecurse(instance, true);
  {
    effect2.onTrack = instance.rtc ? (e2) => invokeArrayFns$1(instance.rtc, e2) : void 0;
    effect2.onTrigger = instance.rtg ? (e2) => invokeArrayFns$1(instance.rtg, e2) : void 0;
    update3.ownerInstance = instance;
  }
  {
    update3();
  }
}
function unmountComponent(instance) {
  const { bum, scope, update: update3, um } = instance;
  if (bum) {
    invokeArrayFns$1(bum);
  }
  {
    const parentInstance = instance.parent;
    if (parentInstance) {
      const $children = parentInstance.ctx.$children;
      const target = getExposeProxy(instance) || instance.proxy;
      const index2 = $children.indexOf(target);
      if (index2 > -1) {
        $children.splice(index2, 1);
      }
    }
  }
  scope.stop();
  if (update3) {
    update3.active = false;
  }
  if (um) {
    queuePostRenderEffect(um);
  }
  queuePostRenderEffect(() => {
    instance.isUnmounted = true;
  });
  {
    devtoolsComponentRemoved(instance);
  }
}
const oldCreateApp = createAppAPI();
function getTarget() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof my !== "undefined") {
    return my;
  }
}
function createVueApp(rootComponent, rootProps = null) {
  const target = getTarget();
  target.__VUE__ = true;
  {
    setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
  }
  const app = oldCreateApp(rootComponent, rootProps);
  const appContext = app._context;
  initAppConfig(appContext.config);
  const createVNode2 = (initialVNode) => {
    initialVNode.appContext = appContext;
    initialVNode.shapeFlag = 6;
    return initialVNode;
  };
  const createComponent2 = function createComponent22(initialVNode, options) {
    return mountComponent(createVNode2(initialVNode), options);
  };
  const destroyComponent = function destroyComponent2(component) {
    return component && unmountComponent(component.$);
  };
  app.mount = function mount() {
    rootComponent.render = NOOP;
    const instance = mountComponent(
      createVNode2({ type: rootComponent }),
      {
        mpType: "app",
        mpInstance: null,
        parentComponent: null,
        slots: [],
        props: null
      }
    );
    app._instance = instance.$;
    {
      devtoolsInitApp(app, version);
    }
    instance.$app = app;
    instance.$createComponent = createComponent2;
    instance.$destroyComponent = destroyComponent;
    appContext.$appInstance = instance;
    return instance;
  };
  app.unmount = function unmount() {
    warn(`Cannot unmount an app.`);
  };
  return app;
}
function injectLifecycleHook(name, hook, publicThis, instance) {
  if (isFunction(hook)) {
    injectHook(name, hook.bind(publicThis), instance);
  }
}
function initHooks$1(options, instance, publicThis) {
  const mpType = options.mpType || publicThis.$mpType;
  if (!mpType || mpType === "component" || // instance.renderer 标识页面是否作为组件渲染
  mpType === "page" && instance.renderer === "component") {
    return;
  }
  Object.keys(options).forEach((name) => {
    if (isUniLifecycleHook(name, options[name], false)) {
      const hooks = options[name];
      if (isArray(hooks)) {
        hooks.forEach((hook) => injectLifecycleHook(name, hook, publicThis, instance));
      } else {
        injectLifecycleHook(name, hooks, publicThis, instance);
      }
    }
  });
}
function applyOptions$2(options, instance, publicThis) {
  initHooks$1(options, instance, publicThis);
}
function set(target, key, val) {
  return target[key] = val;
}
function $callMethod(method, ...args) {
  const fn2 = this[method];
  if (fn2) {
    return fn2(...args);
  }
  console.error(`method ${method} not found`);
  return null;
}
function createErrorHandler(app) {
  const userErrorHandler = app.config.errorHandler;
  return function errorHandler(err, instance, info) {
    if (userErrorHandler) {
      userErrorHandler(err, instance, info);
    }
    const appInstance = app._instance;
    if (!appInstance || !appInstance.proxy) {
      throw err;
    }
    if (appInstance[ON_ERROR]) {
      {
        appInstance.proxy.$callHook(ON_ERROR, err);
      }
    } else {
      logError(err, info, instance ? instance.$.vnode : null, false);
    }
  };
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function initOptionMergeStrategies(optionMergeStrategies) {
  UniLifecycleHooks.forEach((name) => {
    optionMergeStrategies[name] = mergeAsArray;
  });
}
let realAtob;
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
if (typeof atob !== "function") {
  realAtob = function(str) {
    str = String(str).replace(/[\t\n\f\r ]+/g, "");
    if (!b64re.test(str)) {
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    }
    str += "==".slice(2 - (str.length & 3));
    var bitmap;
    var result = "";
    var r1;
    var r2;
    var i2 = 0;
    for (; i2 < str.length; ) {
      bitmap = b64.indexOf(str.charAt(i2++)) << 18 | b64.indexOf(str.charAt(i2++)) << 12 | (r1 = b64.indexOf(str.charAt(i2++))) << 6 | (r2 = b64.indexOf(str.charAt(i2++)));
      result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255) : r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255) : String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    return result;
  };
} else {
  realAtob = atob;
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(realAtob(str).split("").map(function(c2) {
    return "%" + ("00" + c2.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}
function getCurrentUserInfo() {
  const token = index.getStorageSync("uni_id_token") || "";
  const tokenArr = token.split(".");
  if (!token || tokenArr.length !== 3) {
    return {
      uid: null,
      role: [],
      permission: [],
      tokenExpired: 0
    };
  }
  let userInfo;
  try {
    userInfo = JSON.parse(b64DecodeUnicode(tokenArr[1]));
  } catch (error) {
    throw new Error("获取当前用户信息出错，详细错误信息为：" + error.message);
  }
  userInfo.tokenExpired = userInfo.exp * 1e3;
  delete userInfo.exp;
  delete userInfo.iat;
  return userInfo;
}
function uniIdMixin(globalProperties) {
  globalProperties.uniIDHasRole = function(roleId) {
    const { role } = getCurrentUserInfo();
    return role.indexOf(roleId) > -1;
  };
  globalProperties.uniIDHasPermission = function(permissionId) {
    const { permission } = getCurrentUserInfo();
    return this.uniIDHasRole("admin") || permission.indexOf(permissionId) > -1;
  };
  globalProperties.uniIDTokenValid = function() {
    const { tokenExpired } = getCurrentUserInfo();
    return tokenExpired > Date.now();
  };
}
function initApp(app) {
  const appConfig = app.config;
  appConfig.errorHandler = invokeCreateErrorHandler(app, createErrorHandler);
  initOptionMergeStrategies(appConfig.optionMergeStrategies);
  const globalProperties = appConfig.globalProperties;
  {
    uniIdMixin(globalProperties);
  }
  {
    globalProperties.$set = set;
    globalProperties.$applyOptions = applyOptions$2;
    globalProperties.$callMethod = $callMethod;
  }
  {
    index.invokeCreateVueAppHook(app);
  }
}
const propsCaches = /* @__PURE__ */ Object.create(null);
function renderProps(props) {
  const { uid: uid2, __counter } = getCurrentInstance();
  const propsId = (propsCaches[uid2] || (propsCaches[uid2] = [])).push(guardReactiveProps(props)) - 1;
  return uid2 + "," + propsId + "," + __counter;
}
function pruneComponentPropsCache(uid2) {
  delete propsCaches[uid2];
}
function findComponentPropsData(up) {
  if (!up) {
    return;
  }
  const [uid2, propsId] = up.split(",");
  if (!propsCaches[uid2]) {
    return;
  }
  return propsCaches[uid2][parseInt(propsId)];
}
var plugin = {
  install(app) {
    initApp(app);
    app.config.globalProperties.pruneComponentPropsCache = pruneComponentPropsCache;
    const oldMount = app.mount;
    app.mount = function mount(rootContainer, subpackageRoot, options) {
      const hasSubpackageRoot = typeof subpackageRoot === "string";
      const root = hasSubpackageRoot ? subpackageRoot : void 0;
      const instance = hasSubpackageRoot ? oldMount.call(app, rootContainer) : oldMount.apply(app, arguments);
      const createApp2 = getCreateApp(root, options);
      if (createApp2) {
        createApp2(instance);
      } else {
        if (typeof createMiniProgramApp !== "undefined") {
          createMiniProgramApp(instance);
        }
      }
      return instance;
    };
  }
};
function getCreateApp(subpackageRoot, options) {
  const root = normalizeSubpackageRoot$1(subpackageRoot);
  const method = root && (options === null || options === void 0 ? void 0 : options.independent) ? "createIndependentSubpackageApp" : root || "" ? "createSubpackageApp" : "createApp";
  const createApp2 = method === "createIndependentSubpackageApp" && (options === null || options === void 0 ? void 0 : options.createApp) ? options.createApp : getGlobalCreateApp(method);
  if (createApp2 && root && (method === "createSubpackageApp" || method === "createIndependentSubpackageApp")) {
    return (instance) => createApp2(instance, root);
  }
  return createApp2;
}
function getGlobalCreateApp(method) {
  if (typeof global !== "undefined" && typeof global[method] !== "undefined") {
    return global[method];
  } else if (typeof my !== "undefined") {
    return my[method];
  }
}
function normalizeSubpackageRoot$1(root) {
  return typeof root === "string" ? root.replace(/^\/+|\/+$/g, "") : void 0;
}
function stringifyStyle(value) {
  if (isString(value)) {
    return value;
  }
  return stringify(normalizeStyle(value));
}
function stringify(styles) {
  let ret = "";
  if (!styles || isString(styles)) {
    return ret;
  }
  for (const key in styles) {
    ret += `${key.startsWith(`--`) ? key : hyphenate(key)}:${styles[key]};`;
  }
  return ret;
}
function vOn(value, key) {
  const instance = getCurrentInstance();
  const ctx = instance.ctx;
  const extraKey = typeof key !== "undefined" && (ctx.$mpPlatform === "mp-weixin" || ctx.$mpPlatform === "mp-qq" || ctx.$mpPlatform === "mp-xhs") && (isString(key) || typeof key === "number") ? "_" + key : "";
  const name = "e" + instance.$ei++ + extraKey;
  const mpInstance = ctx.$scope;
  if (!value) {
    delete mpInstance[name];
    return name;
  }
  const existingInvoker = mpInstance[name];
  if (existingInvoker) {
    existingInvoker.value = value;
  } else {
    mpInstance[name] = createInvoker(value, instance);
  }
  return name;
}
function createInvoker(initialValue, instance) {
  const invoker = (e2) => {
    patchMPEvent(e2);
    let args = [e2];
    if (instance && instance.ctx.$getTriggerEventDetail) {
      if (typeof e2.detail === "number") {
        e2.detail = instance.ctx.$getTriggerEventDetail(e2.detail);
      }
    }
    if (e2.detail && e2.detail.__args__) {
      args = e2.detail.__args__;
    }
    const eventValue = invoker.value;
    const invoke = () => callWithAsyncErrorHandling(patchStopImmediatePropagation(e2, eventValue), instance, 5, args);
    const eventTarget = e2.target;
    const eventSync = eventTarget ? eventTarget.dataset ? String(eventTarget.dataset.eventsync) === "true" : false : false;
    if (bubbles.includes(e2.type) && !eventSync) {
      setTimeout(invoke);
    } else {
      const res = invoke();
      if (e2.type === "input" && (isArray(res) || isPromise$1(res))) {
        return;
      }
      return res;
    }
  };
  invoker.value = initialValue;
  return invoker;
}
const bubbles = [
  // touch事件暂不做延迟，否则在 Android 上会影响性能，比如一些拖拽跟手手势等
  // 'touchstart',
  // 'touchmove',
  // 'touchcancel',
  // 'touchend',
  "tap",
  "longpress",
  "longtap",
  "transitionend",
  "animationstart",
  "animationiteration",
  "animationend",
  "touchforcechange"
];
function patchMPEvent(event, instance) {
  if (event.type && event.target) {
    event.target;
    event.currentTarget;
    event.preventDefault = NOOP;
    event.stopPropagation = NOOP;
    event.stopImmediatePropagation = NOOP;
    if (!hasOwn(event, "detail")) {
      event.detail = {};
    }
    if (hasOwn(event, "markerId")) {
      event.detail = typeof event.detail === "object" ? event.detail : {};
      event.detail.markerId = event.markerId;
    }
    if (isPlainObject(event.detail) && hasOwn(event.detail, "checked") && !hasOwn(event.detail, "value")) {
      event.detail.value = event.detail.checked;
    }
    if (isPlainObject(event.detail)) {
      event.target = extend({}, event.target, event.detail);
    }
  }
}
function patchStopImmediatePropagation(e2, value) {
  if (isArray(value)) {
    const originalStop = e2.stopImmediatePropagation;
    e2.stopImmediatePropagation = () => {
      originalStop && originalStop.call(e2);
      e2._stopped = true;
    };
    return value.map((fn2) => (e3) => !e3._stopped && fn2(e3));
  } else {
    return value;
  }
}
function vFor(source, renderItem) {
  let ret;
  if (isArray(source) || isString(source)) {
    ret = new Array(source.length);
    for (let i2 = 0, l2 = source.length; i2 < l2; i2++) {
      ret[i2] = renderItem(source[i2], i2, i2);
    }
  } else if (typeof source === "number") {
    if (!Number.isInteger(source)) {
      warn(`The v-for range expect an integer value but got ${source}.`);
      return [];
    }
    ret = new Array(source);
    for (let i2 = 0; i2 < source; i2++) {
      ret[i2] = renderItem(i2 + 1, i2, i2);
    }
  } else if (isObject$1(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(source, (item, i2) => renderItem(item, i2, i2));
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
        const key = keys[i2];
        ret[i2] = renderItem(source[key], key, i2);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
function renderSlot(name, props = {}, key) {
  const instance = getCurrentInstance();
  const { parent, isMounted, ctx: { $scope } } = instance;
  const vueIds = ($scope.properties || $scope.props).uI;
  if (!vueIds) {
    return;
  }
  if (!parent && !isMounted) {
    onMounted(() => {
      renderSlot(name, props, key);
    }, instance);
    return;
  }
  const invoker = findScopedSlotInvoker(vueIds, instance);
  if (invoker) {
    invoker(name, props, key);
  }
}
function findScopedSlotInvoker(vueId, instance) {
  let parent = instance.parent;
  while (parent) {
    const invokers = parent.$ssi;
    if (invokers && invokers[vueId]) {
      return invokers[vueId];
    }
    parent = parent.parent;
  }
}
function setRef(ref2, id, opts = {}) {
  const { $templateRefs } = getCurrentInstance();
  $templateRefs.push({ i: id, r: ref2, k: opts.k, f: opts.f });
}
const o$1 = (value, key) => vOn(value, key);
const f$1 = (source, renderItem) => vFor(source, renderItem);
const r$1 = (name, props, key) => renderSlot(name, props, key);
const s$1 = (value) => stringifyStyle(value);
const e$1 = (target, ...sources) => extend(target, ...sources);
const n$1 = (value) => normalizeClass(value);
const t$1 = (val) => toDisplayString(val);
const p$1 = (props) => renderProps(props);
const sr$1 = (ref2, id, opts) => setRef(ref2, id, opts);
function createApp$1(rootComponent, rootProps = null) {
  rootComponent && (rootComponent.mpType = "app");
  return createVueApp(rootComponent, rootProps).use(plugin);
}
const createSSRApp = createApp$1;
function getLocaleLanguage$1() {
  var _a;
  let localeLanguage = "";
  {
    const appBaseInfo = ((_a = wx.getAppBaseInfo) === null || _a === void 0 ? void 0 : _a.call(wx)) || wx.getSystemInfoSync();
    const language = appBaseInfo && appBaseInfo.language ? appBaseInfo.language : LOCALE_EN;
    localeLanguage = normalizeLocale(language) || LOCALE_EN;
  }
  return localeLanguage;
}
function validateProtocolFail(name, msg) {
  console.warn(`${name}: ${msg}`);
}
function validateProtocol(name, data, protocol, onFail) {
  if (!onFail) {
    onFail = validateProtocolFail;
  }
  for (const key in protocol) {
    const errMsg = validateProp(key, data[key], protocol[key], !hasOwn(data, key));
    if (isString(errMsg)) {
      onFail(name, errMsg);
    }
  }
}
function validateProtocols(name, args, protocol, onFail) {
  if (!protocol) {
    return;
  }
  if (!isArray(protocol)) {
    return validateProtocol(name, args[0] || /* @__PURE__ */ Object.create(null), protocol, onFail);
  }
  const len = protocol.length;
  const argsLen = args.length;
  for (let i2 = 0; i2 < len; i2++) {
    const opts = protocol[i2];
    const data = /* @__PURE__ */ Object.create(null);
    if (argsLen > i2) {
      data[opts.name] = args[i2];
    }
    validateProtocol(name, data, { [opts.name]: opts }, onFail);
  }
}
function validateProp(name, value, prop, isAbsent) {
  if (!isPlainObject(prop)) {
    prop = { type: prop };
  }
  const { type, required, validator } = prop;
  if (required && isAbsent) {
    return 'Missing required args: "' + name + '"';
  }
  if (value == null && !required) {
    return;
  }
  if (type != null) {
    let isValid = false;
    const types = isArray(type) ? type : [type];
    const expectedTypes = [];
    for (let i2 = 0; i2 < types.length && !isValid; i2++) {
      const { valid, expectedType } = assertType(value, types[i2]);
      expectedTypes.push(expectedType || "");
      isValid = valid;
    }
    if (!isValid) {
      return getInvalidTypeMessage(name, value, expectedTypes);
    }
  }
  if (validator) {
    return validator(value);
  }
}
const isSimpleType = /* @__PURE__ */ makeMap("String,Number,Boolean,Function,Symbol");
function assertType(value, type) {
  let valid;
  const expectedType = getType(type);
  if (isSimpleType(expectedType)) {
    const t2 = typeof value;
    valid = t2 === expectedType.toLowerCase();
    if (!valid && t2 === "object") {
      valid = value instanceof type;
    }
  } else if (expectedType === "Object") {
    valid = isObject$1(value);
  } else if (expectedType === "Array") {
    valid = isArray(value);
  } else {
    {
      valid = value instanceof type;
    }
  }
  return {
    valid,
    expectedType
  };
}
function getInvalidTypeMessage(name, value, expectedTypes) {
  let message = `Invalid args: type check failed for args "${name}". Expected ${expectedTypes.map(capitalize).join(", ")}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  const expectedValue = styleValue(value, expectedType);
  const receivedValue = styleValue(value, receivedType);
  if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
    message += ` with value ${expectedValue}`;
  }
  message += `, got ${receivedType} `;
  if (isExplicable(receivedType)) {
    message += `with value ${receivedValue}.`;
  }
  return message;
}
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : "";
}
function styleValue(value, type) {
  if (type === "String") {
    return `"${value}"`;
  } else if (type === "Number") {
    return `${Number(value)}`;
  } else {
    return `${value}`;
  }
}
function isExplicable(type) {
  const explicitTypes = ["string", "number", "boolean"];
  return explicitTypes.some((elem) => type.toLowerCase() === elem);
}
function isBoolean(...args) {
  return args.some((elem) => elem.toLowerCase() === "boolean");
}
function tryCatch(fn2) {
  return function() {
    try {
      return fn2.apply(fn2, arguments);
    } catch (e2) {
      console.error(e2);
    }
  };
}
let invokeCallbackId = 1;
const invokeCallbacks = {};
function addInvokeCallback(id, name, callback, keepAlive = false) {
  invokeCallbacks[id] = {
    name,
    keepAlive,
    callback
  };
  return id;
}
function invokeCallback(id, res, extras) {
  if (typeof id === "number") {
    const opts = invokeCallbacks[id];
    if (opts) {
      if (!opts.keepAlive) {
        delete invokeCallbacks[id];
      }
      return opts.callback(res, extras);
    }
  }
  return res;
}
const API_SUCCESS = "success";
const API_FAIL = "fail";
const API_COMPLETE = "complete";
function getApiCallbacks(args) {
  const apiCallbacks = {};
  for (const name in args) {
    const fn2 = args[name];
    if (isFunction(fn2)) {
      apiCallbacks[name] = tryCatch(fn2);
      delete args[name];
    }
  }
  return apiCallbacks;
}
function normalizeErrMsg(errMsg, name) {
  if (!errMsg || errMsg.indexOf(":fail") === -1) {
    return name + ":ok";
  }
  return name + errMsg.substring(errMsg.indexOf(":fail"));
}
function createAsyncApiCallback(name, args = {}, { beforeAll, beforeSuccess } = {}) {
  if (!isPlainObject(args)) {
    args = {};
  }
  const { success, fail, complete } = getApiCallbacks(args);
  const hasSuccess = isFunction(success);
  const hasFail = isFunction(fail);
  const hasComplete = isFunction(complete);
  const callbackId = invokeCallbackId++;
  addInvokeCallback(callbackId, name, (res) => {
    res = res || {};
    res.errMsg = normalizeErrMsg(res.errMsg, name);
    isFunction(beforeAll) && beforeAll(res);
    if (res.errMsg === name + ":ok") {
      isFunction(beforeSuccess) && beforeSuccess(res, args);
      hasSuccess && success(res);
    } else {
      hasFail && fail(res);
    }
    hasComplete && complete(res);
  });
  return callbackId;
}
const HOOK_SUCCESS = "success";
const HOOK_FAIL = "fail";
const HOOK_COMPLETE = "complete";
const globalInterceptors = {};
const scopedInterceptors = {};
function wrapperHook(hook, params) {
  return function(data) {
    return hook(data, params) || data;
  };
}
function queue(hooks, data, params) {
  let promise = false;
  for (let i2 = 0; i2 < hooks.length; i2++) {
    const hook = hooks[i2];
    if (promise) {
      promise = Promise.resolve(wrapperHook(hook, params));
    } else {
      const res = hook(data, params);
      if (isPromise$1(res)) {
        promise = Promise.resolve(res);
      }
      if (res === false) {
        return {
          then() {
          },
          catch() {
          }
        };
      }
    }
  }
  return promise || {
    then(callback) {
      return callback(data);
    },
    catch() {
    }
  };
}
function wrapperOptions(interceptors2, options = {}) {
  [HOOK_SUCCESS, HOOK_FAIL, HOOK_COMPLETE].forEach((name) => {
    const hooks = interceptors2[name];
    if (!isArray(hooks)) {
      return;
    }
    const oldCallback = options[name];
    options[name] = function callbackInterceptor(res) {
      queue(hooks, res, options).then((res2) => {
        return isFunction(oldCallback) && oldCallback(res2) || res2;
      });
    };
  });
  return options;
}
function wrapperReturnValue(method, returnValue) {
  const returnValueHooks = [];
  if (isArray(globalInterceptors.returnValue)) {
    returnValueHooks.push(...globalInterceptors.returnValue);
  }
  const interceptor = scopedInterceptors[method];
  if (interceptor && isArray(interceptor.returnValue)) {
    returnValueHooks.push(...interceptor.returnValue);
  }
  returnValueHooks.forEach((hook) => {
    returnValue = hook(returnValue) || returnValue;
  });
  return returnValue;
}
function getApiInterceptorHooks(method) {
  const interceptor = /* @__PURE__ */ Object.create(null);
  Object.keys(globalInterceptors).forEach((hook) => {
    if (hook !== "returnValue") {
      interceptor[hook] = globalInterceptors[hook].slice();
    }
  });
  const scopedInterceptor = scopedInterceptors[method];
  if (scopedInterceptor) {
    Object.keys(scopedInterceptor).forEach((hook) => {
      if (hook !== "returnValue") {
        interceptor[hook] = (interceptor[hook] || []).concat(scopedInterceptor[hook]);
      }
    });
  }
  return interceptor;
}
function invokeApi(method, api, options, params) {
  const interceptor = getApiInterceptorHooks(method);
  if (interceptor && Object.keys(interceptor).length) {
    if (isArray(interceptor.invoke)) {
      const res = queue(interceptor.invoke, options);
      return res.then((options2) => {
        return api(wrapperOptions(getApiInterceptorHooks(method), options2), ...params);
      });
    } else {
      return api(wrapperOptions(interceptor, options), ...params);
    }
  }
  return api(options, ...params);
}
function hasCallback(args) {
  if (isPlainObject(args) && [API_SUCCESS, API_FAIL, API_COMPLETE].find((cb) => isFunction(args[cb]))) {
    return true;
  }
  return false;
}
function handlePromise(promise) {
  return promise;
}
function promisify$1(name, fn2) {
  return (args = {}, ...rest) => {
    if (hasCallback(args)) {
      return wrapperReturnValue(name, invokeApi(name, fn2, extend({}, args), rest));
    }
    return wrapperReturnValue(name, handlePromise(new Promise((resolve2, reject) => {
      invokeApi(name, fn2, extend({}, args, { success: resolve2, fail: reject }), rest);
    })));
  };
}
function formatApiArgs(args, options) {
  args[0];
  {
    return;
  }
}
function invokeSuccess(id, name, res) {
  const result = {
    errMsg: name + ":ok"
  };
  return invokeCallback(id, extend(res || {}, result));
}
function invokeFail(id, name, errMsg, errRes = {}) {
  const errMsgPrefix = name + ":fail";
  let apiErrMsg = "";
  if (!errMsg) {
    apiErrMsg = errMsgPrefix;
  } else if (errMsg.indexOf(errMsgPrefix) === 0) {
    apiErrMsg = errMsg;
  } else {
    apiErrMsg = errMsgPrefix + " " + errMsg;
  }
  {
    delete errRes.errCode;
  }
  let res = extend({ errMsg: apiErrMsg }, errRes);
  return invokeCallback(id, res);
}
function beforeInvokeApi(name, args, protocol, options) {
  {
    validateProtocols(name, args, protocol);
  }
  const errMsg = formatApiArgs(args);
  if (errMsg) {
    return errMsg;
  }
}
function parseErrMsg(errMsg) {
  if (!errMsg || isString(errMsg)) {
    return errMsg;
  }
  if (errMsg.stack) {
    if (typeof globalThis === "undefined" || !globalThis.harmonyChannel) {
      console.error(errMsg.message + "\n" + errMsg.stack);
    }
    return errMsg.message;
  }
  return errMsg;
}
function wrapperTaskApi(name, fn2, protocol, options) {
  return (args) => {
    const id = createAsyncApiCallback(name, args, options);
    const errMsg = beforeInvokeApi(name, [args], protocol);
    if (errMsg) {
      return invokeFail(id, name, errMsg);
    }
    return fn2(args, {
      resolve: (res) => invokeSuccess(id, name, res),
      reject: (errMsg2, errRes) => invokeFail(id, name, parseErrMsg(errMsg2), errRes)
    });
  };
}
function wrapperSyncApi(name, fn2, protocol, options) {
  return (...args) => {
    const errMsg = beforeInvokeApi(name, args, protocol);
    if (errMsg) {
      throw new Error(errMsg);
    }
    return fn2.apply(null, args);
  };
}
function wrapperAsyncApi(name, fn2, protocol, options) {
  return wrapperTaskApi(name, fn2, protocol, options);
}
function defineSyncApi(name, fn2, protocol, options) {
  return wrapperSyncApi(name, fn2, protocol);
}
function defineAsyncApi(name, fn2, protocol, options) {
  return promisify$1(name, wrapperAsyncApi(name, fn2, protocol, options));
}
const API_UPX2PX = "upx2px";
const Upx2pxProtocol = [
  {
    name: "upx",
    type: [Number, String],
    required: true
  }
];
const EPS = 1e-4;
const BASE_DEVICE_WIDTH = 750;
let isIOS = false;
let deviceWidth = 0;
let deviceDPR = 0;
function checkDeviceWidth() {
  var _a, _b;
  let windowWidth, pixelRatio, platform;
  {
    const windowInfo = ((_a = wx.getWindowInfo) === null || _a === void 0 ? void 0 : _a.call(wx)) || wx.getSystemInfoSync();
    const deviceInfo = ((_b = wx.getDeviceInfo) === null || _b === void 0 ? void 0 : _b.call(wx)) || wx.getSystemInfoSync();
    windowWidth = windowInfo.windowWidth;
    pixelRatio = windowInfo.pixelRatio;
    platform = deviceInfo.platform;
  }
  deviceWidth = windowWidth;
  deviceDPR = pixelRatio;
  isIOS = platform === "ios";
}
const upx2px = defineSyncApi(API_UPX2PX, (number, newDeviceWidth) => {
  if (deviceWidth === 0) {
    checkDeviceWidth();
  }
  number = Number(number);
  if (number === 0) {
    return 0;
  }
  let width = newDeviceWidth || deviceWidth;
  let result = number / BASE_DEVICE_WIDTH * width;
  if (result < 0) {
    result = -result;
  }
  result = Math.floor(result + EPS);
  if (result === 0) {
    if (deviceDPR === 1 || !isIOS) {
      result = 1;
    } else {
      result = 0.5;
    }
  }
  return number < 0 ? -result : result;
}, Upx2pxProtocol);
function __f__(type, filename, ...args) {
  if (filename) {
    args.push(filename);
  }
  console[type].apply(console, args);
}
const API_ADD_INTERCEPTOR = "addInterceptor";
const API_REMOVE_INTERCEPTOR = "removeInterceptor";
const AddInterceptorProtocol = [
  {
    name: "method",
    type: [String, Object],
    required: true
  }
];
const RemoveInterceptorProtocol = AddInterceptorProtocol;
function mergeInterceptorHook(interceptors2, interceptor) {
  Object.keys(interceptor).forEach((hook) => {
    if (isFunction(interceptor[hook])) {
      interceptors2[hook] = mergeHook(interceptors2[hook], interceptor[hook]);
    }
  });
}
function removeInterceptorHook(interceptors2, interceptor) {
  if (!interceptors2 || !interceptor) {
    return;
  }
  Object.keys(interceptor).forEach((name) => {
    const hooks = interceptors2[name];
    const hook = interceptor[name];
    if (isArray(hooks) && isFunction(hook)) {
      remove(hooks, hook);
    }
  });
}
function mergeHook(parentVal, childVal) {
  const res = childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
  return res ? dedupeHooks(res) : res;
}
function dedupeHooks(hooks) {
  const res = [];
  for (let i2 = 0; i2 < hooks.length; i2++) {
    if (res.indexOf(hooks[i2]) === -1) {
      res.push(hooks[i2]);
    }
  }
  return res;
}
const addInterceptor = defineSyncApi(API_ADD_INTERCEPTOR, (method, interceptor) => {
  if (isString(method) && isPlainObject(interceptor)) {
    mergeInterceptorHook(scopedInterceptors[method] || (scopedInterceptors[method] = {}), interceptor);
  } else if (isPlainObject(method)) {
    mergeInterceptorHook(globalInterceptors, method);
  }
}, AddInterceptorProtocol);
const removeInterceptor = defineSyncApi(API_REMOVE_INTERCEPTOR, (method, interceptor) => {
  if (isString(method)) {
    if (isPlainObject(interceptor)) {
      removeInterceptorHook(scopedInterceptors[method], interceptor);
    } else {
      delete scopedInterceptors[method];
    }
  } else if (isPlainObject(method)) {
    removeInterceptorHook(globalInterceptors, method);
  }
}, RemoveInterceptorProtocol);
const interceptors = {};
const API_ON = "$on";
const OnProtocol = [
  {
    name: "event",
    type: String,
    required: true
  },
  {
    name: "callback",
    type: Function,
    required: true
  }
];
const API_ONCE = "$once";
const OnceProtocol = OnProtocol;
const API_OFF = "$off";
const OffProtocol = [
  {
    name: "event",
    type: [String, Array]
  },
  {
    name: "callback",
    type: [Function, Number]
  }
];
const API_EMIT = "$emit";
const EmitProtocol = [
  {
    name: "event",
    type: String,
    required: true
  }
];
class EventBus {
  constructor() {
    this.$emitter = new E$1$1();
  }
  on(name, callback) {
    return this.$emitter.on(name, callback);
  }
  once(name, callback) {
    return this.$emitter.once(name, callback);
  }
  off(name, callback) {
    if (!name) {
      this.$emitter.e = {};
      return;
    }
    this.$emitter.off(name, callback);
  }
  emit(name, ...args) {
    this.$emitter.emit(name, ...args);
  }
}
const eventBus = new EventBus();
const $on = defineSyncApi(API_ON, (name, callback) => {
  eventBus.on(name, callback);
  return () => eventBus.off(name, callback);
}, OnProtocol);
const $once = defineSyncApi(API_ONCE, (name, callback) => {
  eventBus.once(name, callback);
  return () => eventBus.off(name, callback);
}, OnceProtocol);
const $off = defineSyncApi(API_OFF, (name, callback) => {
  if (!isArray(name))
    name = name ? [name] : [];
  name.forEach((n2) => {
    eventBus.off(n2, callback);
  });
}, OffProtocol);
const $emit = defineSyncApi(API_EMIT, (name, ...args) => {
  eventBus.emit(name, ...args);
}, EmitProtocol);
let cid;
let cidErrMsg;
let enabled;
function normalizePushMessage(message) {
  try {
    return JSON.parse(message);
  } catch (e2) {
  }
  return message;
}
function invokePushCallback(args) {
  if (args.type === "enabled") {
    enabled = true;
  } else if (args.type === "clientId") {
    cid = args.cid;
    cidErrMsg = args.errMsg;
    invokeGetPushCidCallbacks(cid, args.errMsg);
  } else if (args.type === "pushMsg") {
    const message = {
      type: "receive",
      data: normalizePushMessage(args.message)
    };
    for (let i2 = 0; i2 < onPushMessageCallbacks.length; i2++) {
      const callback = onPushMessageCallbacks[i2];
      callback(message);
      if (message.stopped) {
        break;
      }
    }
  } else if (args.type === "click") {
    onPushMessageCallbacks.forEach((callback) => {
      callback({
        type: "click",
        data: normalizePushMessage(args.message)
      });
    });
  }
}
const getPushCidCallbacks = [];
function invokeGetPushCidCallbacks(cid2, errMsg) {
  getPushCidCallbacks.forEach((callback) => {
    callback(cid2, errMsg);
  });
  getPushCidCallbacks.length = 0;
}
const API_GET_PUSH_CLIENT_ID = "getPushClientId";
const getPushClientId = defineAsyncApi(API_GET_PUSH_CLIENT_ID, (_2, { resolve: resolve2, reject }) => {
  Promise.resolve().then(() => {
    if (typeof enabled === "undefined") {
      enabled = false;
      cid = "";
      cidErrMsg = "uniPush is not enabled";
    }
    getPushCidCallbacks.push((cid2, errMsg) => {
      if (cid2) {
        resolve2({ cid: cid2 });
      } else {
        reject(errMsg);
      }
    });
    if (typeof cid !== "undefined") {
      invokeGetPushCidCallbacks(cid, cidErrMsg);
    }
  });
});
const onPushMessageCallbacks = [];
const onPushMessage = (fn2) => {
  if (onPushMessageCallbacks.indexOf(fn2) === -1) {
    onPushMessageCallbacks.push(fn2);
  }
};
const offPushMessage = (fn2) => {
  if (!fn2) {
    onPushMessageCallbacks.length = 0;
  } else {
    const index2 = onPushMessageCallbacks.indexOf(fn2);
    if (index2 > -1) {
      onPushMessageCallbacks.splice(index2, 1);
    }
  }
};
const SYNC_API_RE = /^\$|__f__|getLocale|setLocale|sendNativeEvent|restoreGlobal|requireGlobal|getCurrentSubNVue|getMenuButtonBoundingClientRect|^report|interceptors|Interceptor$|getSubNVueById|requireNativePlugin|upx2px|rpx2px|hideKeyboard|canIUse|^create|Sync$|Manager$|base64ToArrayBuffer|arrayBufferToBase64|getDeviceInfo|getAppBaseInfo|getWindowInfo|getSystemSetting|getAppAuthorizeSetting/;
const CONTEXT_API_RE = /^create|Manager$/;
const CONTEXT_API_RE_EXC = ["createBLEConnection"];
const TASK_APIS = ["request", "downloadFile", "uploadFile", "connectSocket"];
const ASYNC_API = ["createBLEConnection"];
const CALLBACK_API_RE = /^on|^off/;
function isContextApi(name) {
  return CONTEXT_API_RE.test(name) && CONTEXT_API_RE_EXC.indexOf(name) === -1;
}
function isSyncApi(name) {
  return SYNC_API_RE.test(name) && ASYNC_API.indexOf(name) === -1;
}
function isCallbackApi(name) {
  return CALLBACK_API_RE.test(name) && name !== "onPush";
}
function isTaskApi(name) {
  return TASK_APIS.indexOf(name) !== -1;
}
function shouldPromise(name) {
  if (isContextApi(name) || isSyncApi(name) || isCallbackApi(name)) {
    return false;
  }
  return true;
}
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function(onfinally) {
    const promise = this.constructor;
    return this.then((value) => promise.resolve(onfinally && onfinally()).then(() => value), (reason) => promise.resolve(onfinally && onfinally()).then(() => {
      throw reason;
    }));
  };
}
function promisify(name, api) {
  if (!shouldPromise(name)) {
    return api;
  }
  if (!isFunction(api)) {
    return api;
  }
  return function promiseApi(options = {}, ...rest) {
    if (isFunction(options.success) || isFunction(options.fail) || isFunction(options.complete)) {
      return wrapperReturnValue(name, invokeApi(name, api, extend({}, options), rest));
    }
    return wrapperReturnValue(name, handlePromise(new Promise((resolve2, reject) => {
      invokeApi(name, api, extend({}, options, {
        success: resolve2,
        fail: reject
      }), rest);
    })));
  };
}
const CALLBACKS = ["success", "fail", "cancel", "complete"];
function initWrapper(protocols2) {
  function processCallback(methodName, method, returnValue) {
    return function(res) {
      return method(processReturnValue(methodName, res, returnValue));
    };
  }
  function processArgs(methodName, fromArgs, argsOption = {}, returnValue = {}, keepFromArgs = false) {
    if (isPlainObject(fromArgs)) {
      const toArgs = keepFromArgs === true ? fromArgs : {};
      if (isFunction(argsOption)) {
        argsOption = argsOption(fromArgs, toArgs) || {};
      }
      for (const key in fromArgs) {
        if (hasOwn(argsOption, key)) {
          let keyOption = argsOption[key];
          if (isFunction(keyOption)) {
            keyOption = keyOption(fromArgs[key], fromArgs, toArgs);
          }
          if (!keyOption) {
            console.warn(`微信小程序 ${methodName} 暂不支持 ${key}`);
          } else if (isString(keyOption)) {
            toArgs[keyOption] = fromArgs[key];
          } else if (isPlainObject(keyOption)) {
            toArgs[keyOption.name ? keyOption.name : key] = keyOption.value;
          }
        } else if (CALLBACKS.indexOf(key) !== -1) {
          const callback = fromArgs[key];
          if (isFunction(callback)) {
            toArgs[key] = processCallback(methodName, callback, returnValue);
          }
        } else {
          if (!keepFromArgs && !hasOwn(toArgs, key)) {
            toArgs[key] = fromArgs[key];
          }
        }
      }
      return toArgs;
    } else if (isFunction(fromArgs)) {
      if (isFunction(argsOption)) {
        argsOption(fromArgs, {});
      }
      fromArgs = processCallback(methodName, fromArgs, returnValue);
    }
    return fromArgs;
  }
  function processReturnValue(methodName, res, returnValue, keepReturnValue = false) {
    if (isFunction(protocols2.returnValue)) {
      res = protocols2.returnValue(methodName, res);
    }
    const realKeepReturnValue = keepReturnValue || false;
    return processArgs(methodName, res, returnValue, {}, realKeepReturnValue);
  }
  return function wrapper(methodName, method) {
    const hasProtocol = hasOwn(protocols2, methodName);
    if (!hasProtocol && typeof wx[methodName] !== "function") {
      return method;
    }
    const needWrapper = hasProtocol || isFunction(protocols2.returnValue) || isContextApi(methodName) || isTaskApi(methodName);
    const hasMethod = hasProtocol || isFunction(method);
    if (!hasProtocol && !method) {
      return function() {
        console.error(`微信小程序 暂不支持${methodName}`);
      };
    }
    if (!needWrapper || !hasMethod) {
      return method;
    }
    const protocol = protocols2[methodName];
    return function(arg1, arg2) {
      let options = protocol || {};
      if (isFunction(protocol)) {
        options = protocol(arg1);
      }
      arg1 = processArgs(methodName, arg1, options.args, options.returnValue);
      const args = [arg1];
      if (typeof arg2 !== "undefined") {
        args.push(arg2);
      }
      const returnValue = wx[options.name || methodName].apply(wx, args);
      if (isContextApi(methodName) || isTaskApi(methodName)) {
        if (returnValue && !returnValue.__v_skip) {
          returnValue.__v_skip = true;
        }
      }
      if (isSyncApi(methodName)) {
        return processReturnValue(methodName, returnValue, options.returnValue, isContextApi(methodName));
      }
      return returnValue;
    };
  };
}
const getLocale = () => {
  const app = isFunction(getApp) && getApp({ allowDefault: true });
  if (app && app.$vm) {
    return app.$vm.$locale;
  }
  return getLocaleLanguage$1();
};
const setLocale = (locale) => {
  const app = isFunction(getApp) && getApp();
  if (!app) {
    return false;
  }
  const oldLocale = app.$vm.$locale;
  if (oldLocale !== locale) {
    app.$vm.$locale = locale;
    onLocaleChangeCallbacks.forEach((fn2) => fn2({ locale }));
    return true;
  }
  return false;
};
const onLocaleChangeCallbacks = [];
const onLocaleChange = (fn2) => {
  if (onLocaleChangeCallbacks.indexOf(fn2) === -1) {
    onLocaleChangeCallbacks.push(fn2);
  }
};
if (typeof global !== "undefined") {
  global.getLocale = getLocale;
}
const UUID_KEY = "__DC_STAT_UUID";
let deviceId;
function useDeviceId(global2 = wx) {
  return function addDeviceId(_2, toRes) {
    deviceId = deviceId || global2.getStorageSync(UUID_KEY);
    if (!deviceId) {
      deviceId = Date.now() + "" + Math.floor(Math.random() * 1e7);
      wx.setStorage({
        key: UUID_KEY,
        data: deviceId
      });
    }
    toRes.deviceId = deviceId;
  };
}
function addSafeAreaInsets(fromRes, toRes) {
  if (fromRes.safeArea) {
    const safeArea = fromRes.safeArea;
    toRes.safeAreaInsets = {
      top: safeArea.top,
      left: safeArea.left,
      right: fromRes.windowWidth - safeArea.right,
      bottom: fromRes.screenHeight - safeArea.bottom
    };
  }
}
function getOSInfo(system, platform) {
  let osName = "";
  let osVersion = "";
  if (platform && false) {
    osName = platform;
    osVersion = system;
    system = `${osName} ${osVersion}`;
  } else {
    {
      osName = platform;
    }
    osVersion = system.split(" ")[1] || "";
  }
  osName = osName.toLowerCase();
  switch (osName) {
    case "harmony":
    case "ohos":
    case "openharmonyos":
    case "openharmony":
      osName = "harmonyos";
      break;
    case "iphone os":
      osName = "ios";
      break;
    case "mac":
    case "darwin":
      osName = "macos";
      break;
    case "windows_nt":
      osName = "windows";
      break;
  }
  return {
    osName,
    osVersion,
    system
  };
}
function getPlatform(platform) {
  platform = platform.toLowerCase();
  {
    if (platform === "ohos") {
      platform = "harmonyos";
    }
  }
  return platform;
}
function populateParameters(fromRes, toRes) {
  const { brand = "", model = "", system = "", language = "", theme, version: version2, platform, fontSizeSetting, SDKVersion, pixelRatio, deviceOrientation } = fromRes;
  const { osName, osVersion, system: updatedSystem } = getOSInfo(system, platform);
  let hostVersion = version2;
  let deviceType = getGetDeviceType(fromRes, model);
  let deviceBrand = getDeviceBrand(brand);
  let _hostName = getHostName(fromRes);
  let _deviceOrientation = deviceOrientation;
  let _devicePixelRatio = pixelRatio;
  let _SDKVersion = SDKVersion;
  const hostLanguage = (language || "").replace(/_/g, "-");
  const parameters = {
    appId: "__UNI__ABE8DE0",
    appName: "tdh-hrm-client",
    appVersion: "1.0.0",
    appVersionCode: "100",
    appLanguage: getAppLanguage(hostLanguage),
    uniCompileVersion: "5.23",
    uniCompilerVersion: "5.23",
    uniRuntimeVersion: "5.23",
    uniPlatform: "mp-weixin",
    deviceBrand,
    deviceModel: model,
    deviceType,
    devicePixelRatio: _devicePixelRatio,
    deviceOrientation: _deviceOrientation,
    osName,
    osVersion,
    hostTheme: theme,
    hostVersion,
    hostLanguage,
    hostName: _hostName,
    hostSDKVersion: _SDKVersion,
    hostFontSizeSetting: fontSizeSetting,
    windowTop: 0,
    windowBottom: 0,
    platform: getPlatform(platform),
    system: updatedSystem,
    // TODO
    osLanguage: void 0,
    osTheme: void 0,
    ua: void 0,
    hostPackageName: void 0,
    browserName: void 0,
    browserVersion: void 0,
    isUniAppX: false
  };
  extend(toRes, parameters);
}
function getGetDeviceType(fromRes, model) {
  const platform = fromRes.platform || "";
  let deviceType = fromRes.deviceType || "phone";
  {
    const deviceTypeMaps = {
      ipad: "pad",
      windows: "pc",
      mac: "pc",
      linux: "pc",
      pc: "pc"
    };
    const deviceTypeMapsKeys = Object.keys(deviceTypeMaps);
    const _model = model.toLowerCase();
    for (let index2 = 0; index2 < deviceTypeMapsKeys.length; index2++) {
      const _m = deviceTypeMapsKeys[index2];
      if (_model.indexOf(_m) !== -1) {
        deviceType = deviceTypeMaps[_m];
        break;
      }
    }
  }
  {
    if (platform === "ohos_pc") {
      deviceType = "pc";
    }
  }
  return deviceType;
}
function getDeviceBrand(brand) {
  let deviceBrand = brand;
  if (deviceBrand) {
    deviceBrand = deviceBrand.toLowerCase();
  }
  return deviceBrand;
}
function getAppLanguage(defaultLanguage) {
  return getLocale ? getLocale() : defaultLanguage;
}
function getHostName(fromRes) {
  const _platform = "WeChat";
  let _hostName = fromRes.hostName || _platform;
  {
    if (fromRes.environment) {
      _hostName = fromRes.environment;
    } else if (fromRes.host && fromRes.host.env) {
      _hostName = fromRes.host.env;
    }
  }
  return _hostName;
}
const getSystemInfo = {
  returnValue: (fromRes, toRes) => {
    addSafeAreaInsets(fromRes, toRes);
    useDeviceId()(fromRes, toRes);
    populateParameters(fromRes, toRes);
  }
};
const getSystemInfoSync = getSystemInfo;
const redirectTo = {};
const previewImage = {
  args(fromArgs, toArgs) {
    let currentIndex = parseInt(fromArgs.current);
    if (isNaN(currentIndex)) {
      return;
    }
    const urls = fromArgs.urls;
    if (!isArray(urls)) {
      return;
    }
    const len = urls.length;
    if (!len) {
      return;
    }
    if (currentIndex < 0) {
      currentIndex = 0;
    } else if (currentIndex >= len) {
      currentIndex = len - 1;
    }
    if (currentIndex > 0) {
      toArgs.current = urls[currentIndex];
      toArgs.urls = urls.filter((item, index2) => index2 < currentIndex ? item !== urls[currentIndex] : true);
    } else {
      toArgs.current = urls[0];
    }
    return {
      indicator: false,
      loop: false
    };
  }
};
const showActionSheet = {
  args(fromArgs, toArgs) {
    toArgs.alertText = fromArgs.title;
  }
};
const getDeviceInfo = {
  returnValue: (fromRes, toRes) => {
    const { brand, model, system = "", platform = "" } = fromRes;
    let deviceType = getGetDeviceType(fromRes, model);
    let deviceBrand = getDeviceBrand(brand);
    useDeviceId()(fromRes, toRes);
    const { osName, osVersion } = getOSInfo(system, platform);
    toRes = extend(toRes, {
      deviceType,
      deviceBrand,
      deviceModel: model,
      osName,
      osVersion,
      platform: getPlatform(platform)
    });
  }
};
const getAppBaseInfo = {
  returnValue: (fromRes, toRes) => {
    const { version: version2, language, SDKVersion, theme } = fromRes;
    let _hostName = getHostName(fromRes);
    let hostLanguage = (language || "").replace(/_/g, "-");
    const parameters = {
      appId: "__UNI__ABE8DE0",
      appName: "tdh-hrm-client",
      appVersion: "1.0.0",
      appVersionCode: "100",
      appLanguage: getAppLanguage(hostLanguage),
      hostVersion: version2,
      hostLanguage,
      hostName: _hostName,
      hostSDKVersion: SDKVersion,
      hostTheme: theme,
      isUniAppX: false,
      uniPlatform: "mp-weixin",
      uniCompileVersion: "5.23",
      uniCompilerVersion: "5.23",
      uniRuntimeVersion: "5.23"
    };
    try {
      if (typeof wx.getAccountInfoSync === "function") {
        parameters.packagename = wx.getAccountInfoSync().miniProgram.appId;
      }
    } catch (error) {
    }
    extend(toRes, parameters);
  }
};
const getWindowInfo = {
  returnValue: (fromRes, toRes) => {
    addSafeAreaInsets(fromRes, toRes);
    toRes = extend(toRes, {
      windowTop: 0,
      windowBottom: 0
    });
  }
};
const getAppAuthorizeSetting = {
  returnValue: function(fromRes, toRes) {
    const { locationReducedAccuracy } = fromRes;
    toRes.locationAccuracy = "unsupported";
    if (locationReducedAccuracy === true) {
      toRes.locationAccuracy = "reduced";
    } else if (locationReducedAccuracy === false) {
      toRes.locationAccuracy = "full";
    }
  }
};
const onError = {
  args(fromArgs) {
    const app = getApp({ allowDefault: true }) || {};
    if (!app.$vm) {
      if (!wx.$onErrorHandlers) {
        wx.$onErrorHandlers = [];
      }
      wx.$onErrorHandlers.push(fromArgs);
    } else {
      injectHook(ON_ERROR, fromArgs, app.$vm.$);
    }
  }
};
const offError = {
  args(fromArgs) {
    const app = getApp({ allowDefault: true }) || {};
    if (!app.$vm) {
      if (!wx.$onErrorHandlers) {
        return;
      }
      const index2 = wx.$onErrorHandlers.findIndex((fn2) => fn2 === fromArgs);
      if (index2 !== -1) {
        wx.$onErrorHandlers.splice(index2, 1);
      }
    } else if (fromArgs.__weh) {
      const onErrors = app.$vm.$[ON_ERROR];
      if (onErrors) {
        const index2 = onErrors.indexOf(fromArgs.__weh);
        if (index2 > -1) {
          onErrors.splice(index2, 1);
        }
      }
    }
  }
};
const onSocketOpen = {
  args() {
    if (wx.__uni_console__) {
      if (wx.__uni_console_warned__) {
        return;
      }
      wx.__uni_console_warned__ = true;
      console.warn(`开发模式下小程序日志回显会使用 socket 连接，为了避免冲突，建议使用 SocketTask 的方式去管理 WebSocket 或手动关闭日志回显功能。[详情](https://uniapp.dcloud.net.cn/tutorial/run/mp-log.html)`);
    }
  }
};
const onSocketMessage = onSocketOpen;
const baseApis = {
  $on,
  $off,
  $once,
  $emit,
  upx2px,
  rpx2px: upx2px,
  interceptors,
  addInterceptor,
  removeInterceptor,
  onCreateVueApp,
  invokeCreateVueAppHook,
  getLocale,
  setLocale,
  onLocaleChange,
  getPushClientId,
  onPushMessage,
  offPushMessage,
  invokePushCallback,
  __f__
};
function normalizeApi(name, api) {
  return api;
}
function initUni(api, protocols2, platform = wx) {
  const wrapper = initWrapper(protocols2);
  const UniProxyHandlers = {
    get(target, key) {
      if (hasOwn(target, key)) {
        return target[key];
      }
      if (hasOwn(api, key)) {
        return normalizeApi(key, promisify(key, api[key]));
      }
      if (hasOwn(baseApis, key)) {
        return normalizeApi(key, promisify(key, baseApis[key]));
      }
      return normalizeApi(key, promisify(key, wrapper(key, platform[key])));
    }
  };
  return new Proxy({}, UniProxyHandlers);
}
function initGetProvider(providers) {
  return function getProvider2({ service, success, fail, complete }) {
    let res;
    if (providers[service]) {
      res = {
        errMsg: "getProvider:ok",
        service,
        provider: providers[service]
      };
      isFunction(success) && success(res);
    } else {
      res = {
        errMsg: "getProvider:fail:服务[" + service + "]不存在"
      };
      isFunction(fail) && fail(res);
    }
    isFunction(complete) && complete(res);
  };
}
const objectKeys = [
  "qy",
  "env",
  "error",
  "version",
  "lanDebug",
  "cloud",
  "serviceMarket",
  "router",
  "worklet",
  "__webpack_require_UNI_MP_PLUGIN__"
];
const singlePageDisableKey = ["lanDebug", "router", "worklet"];
const launchOption = wx.getLaunchOptionsSync ? wx.getLaunchOptionsSync() : null;
function isWxKey(key) {
  if (launchOption && launchOption.scene === 1154 && singlePageDisableKey.includes(key)) {
    return false;
  }
  return objectKeys.indexOf(key) > -1 || typeof wx[key] === "function";
}
function initWx() {
  const newWx = {};
  for (const key in wx) {
    if (isWxKey(key)) {
      newWx[key] = wx[key];
    }
  }
  if (typeof globalThis !== "undefined" && typeof requireMiniProgram === "undefined") {
    globalThis.wx = newWx;
  }
  return newWx;
}
const mocks$1 = ["__route__", "__wxExparserNodeId__", "__wxWebviewId__"];
const getProvider = initGetProvider({
  oauth: ["weixin"],
  share: ["weixin"],
  payment: ["wxpay"],
  push: ["weixin"]
});
function initComponentMocks(component) {
  const res = /* @__PURE__ */ Object.create(null);
  mocks$1.forEach((name) => {
    res[name] = component[name];
  });
  return res;
}
function createSelectorQuery() {
  const query = wx$2.createSelectorQuery();
  const oldIn = query.in;
  query.in = function newIn(component) {
    if (component.$scope) {
      return oldIn.call(this, component.$scope);
    }
    return oldIn.call(this, initComponentMocks(component));
  };
  return query;
}
const wx$2 = initWx();
if (!wx$2.getAppBaseInfo || !wx$2.getAppBaseInfo()) {
  wx$2.getAppBaseInfo = wx$2.getSystemInfoSync;
}
if (!wx$2.getWindowInfo || !wx$2.getWindowInfo()) {
  wx$2.getWindowInfo = wx$2.getSystemInfoSync;
}
if (!wx$2.getDeviceInfo || !wx$2.getDeviceInfo()) {
  wx$2.getDeviceInfo = wx$2.getSystemInfoSync;
}
let baseInfo = wx$2.getAppBaseInfo && wx$2.getAppBaseInfo();
if (!baseInfo) {
  baseInfo = wx$2.getSystemInfoSync();
}
const host = baseInfo ? baseInfo.host : null;
const shareVideoMessage = host && host.env === "SAAASDK" ? wx$2.miniapp.shareVideoMessage : wx$2.shareVideoMessage;
var shims = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  createSelectorQuery,
  getProvider,
  shareVideoMessage
});
const compressImage = {
  args(fromArgs, toArgs) {
    if (fromArgs.compressedHeight && !toArgs.compressHeight) {
      toArgs.compressHeight = fromArgs.compressedHeight;
    }
    if (fromArgs.compressedWidth && !toArgs.compressWidth) {
      toArgs.compressWidth = fromArgs.compressedWidth;
    }
  }
};
var protocols = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  compressImage,
  getAppAuthorizeSetting,
  getAppBaseInfo,
  getDeviceInfo,
  getSystemInfo,
  getSystemInfoSync,
  getWindowInfo,
  offError,
  onError,
  onSocketMessage,
  onSocketOpen,
  previewImage,
  redirectTo,
  showActionSheet
});
const wx$1 = initWx();
var index = initUni(shims, protocols, wx$1);
function currentPageCaptureScreenshot(fullPage, callback) {
  var _a;
  const pages2 = getCurrentPages();
  const currentPage = pages2[pages2.length - 1];
  (_a = currentPage.vm) === null || _a === void 0 ? void 0 : _a.$viewToTempFilePath({
    wholeContent: fullPage,
    overwrite: true,
    success: (res) => {
      const fileManager = index.getFileSystemManager();
      fileManager.readFile({
        encoding: "base64",
        filePath: res.tempFilePath,
        success(readFileRes) {
          callback(readFileRes.data, "");
        },
        fail(err) {
          callback("", `captureScreenshot fail: ${JSON.stringify(err)}`);
        }
      });
    },
    fail: (err) => {
      callback("", `captureScreenshot fail: ${JSON.stringify(err)}`);
    }
  });
}
function initRuntimeSocket(hosts, port, id) {
  if (hosts == "" || port == "" || id == "")
    return Promise.resolve(null);
  return hosts.split(",").reduce((promise, host2) => {
    return promise.then((socket) => {
      if (socket != null)
        return Promise.resolve(socket);
      return tryConnectSocket(host2, port, id);
    });
  }, Promise.resolve(null));
}
const SOCKET_TIMEOUT = 500;
function tryConnectSocket(host2, port, id) {
  return new Promise((resolve2, reject) => {
    const socket = index.connectSocket({
      url: `ws://${host2}:${port}/${id}`,
      multiple: true,
      // 支付宝小程序 是否开启多实例
      fail() {
        resolve2(null);
      }
    });
    const timer = setTimeout(() => {
      socket.close({
        code: 1006,
        reason: "connect timeout"
      });
      resolve2(null);
    }, SOCKET_TIMEOUT);
    socket.onOpen((e2) => {
      clearTimeout(timer);
      resolve2(socket);
    });
    socket.onClose((e2) => {
      clearTimeout(timer);
      resolve2(null);
    });
    socket.onError((e2) => {
      clearTimeout(timer);
      resolve2(null);
    });
    socket.onMessage((result) => {
      const message = JSON.parse(result.data);
      if (message["type"] == "screencap") {
        const id2 = message["id"];
        currentPageCaptureScreenshot(message.fullPage, (base64, error) => {
          socket.send({
            data: JSON.stringify({
              id: id2,
              base64,
              error
            })
          });
        });
      }
      resolve2(null);
    });
  });
}
const CONSOLE_TYPES = ["log", "warn", "error", "info", "debug"];
const originalConsole = /* @__PURE__ */ CONSOLE_TYPES.reduce((methods, type) => {
  methods[type] = console[type].bind(console);
  return methods;
}, {});
let sendError = null;
const errorQueue = /* @__PURE__ */ new Set();
const errorExtra = {};
function sendErrorMessages(errors) {
  if (sendError == null) {
    errors.forEach((error) => {
      errorQueue.add(error);
    });
    return;
  }
  const data = errors.map((err) => {
    if (typeof err === "string") {
      return err;
    }
    const isPromiseRejection = err && "promise" in err && "reason" in err;
    const prefix = isPromiseRejection ? "UnhandledPromiseRejection: " : "";
    if (isPromiseRejection) {
      err = err.reason;
    }
    if (err instanceof Error && err.stack) {
      if (err.message && !err.stack.includes(err.message)) {
        return `${prefix}${err.message}
${err.stack}`;
      }
      return `${prefix}${err.stack}`;
    }
    if (typeof err === "object" && err !== null) {
      try {
        return prefix + JSON.stringify(err);
      } catch (err2) {
        return prefix + String(err2);
      }
    }
    return prefix + String(err);
  }).filter(Boolean);
  if (data.length > 0) {
    sendError(JSON.stringify(Object.assign({
      type: "error",
      data
    }, errorExtra)));
  }
}
function setSendError(value, extra = {}) {
  sendError = value;
  Object.assign(errorExtra, extra);
  if (value != null && errorQueue.size > 0) {
    const errors = Array.from(errorQueue);
    errorQueue.clear();
    sendErrorMessages(errors);
  }
}
function initOnError() {
  function onError2(error) {
    try {
      if (typeof PromiseRejectionEvent !== "undefined" && error instanceof PromiseRejectionEvent && error.reason instanceof Error && error.reason.message && error.reason.message.includes(`Cannot create property 'errMsg' on string 'taskId`)) {
        return;
      }
      if (true) {
        originalConsole.error(error);
      }
      sendErrorMessages([error]);
    } catch (err) {
      originalConsole.error(err);
    }
  }
  if (typeof index !== "undefined") {
    if (typeof index.onError === "function") {
      index.onError(onError2);
    }
    if (typeof index.onUnhandledRejection === "function") {
      index.onUnhandledRejection(onError2);
    }
  }
  return function offError2() {
    if (typeof index !== "undefined") {
      if (typeof index.offError === "function") {
        index.offError(onError2);
      }
      if (typeof index.offUnhandledRejection === "function") {
        index.offUnhandledRejection(onError2);
      }
    }
  };
}
function formatMessage(type, args) {
  try {
    return {
      type,
      args: formatArgs(args)
    };
  } catch (e2) {
  }
  return {
    type,
    args: []
  };
}
function formatArgs(args) {
  return args.map((arg) => formatArg(arg));
}
function formatArg(arg, depth = 0) {
  if (depth >= 7) {
    return {
      type: "object",
      value: "[Maximum depth reached]"
    };
  }
  const type = typeof arg;
  switch (type) {
    case "string":
      return formatString(arg);
    case "number":
      return formatNumber(arg);
    case "boolean":
      return formatBoolean(arg);
    case "object":
      try {
        return formatObject(arg, depth);
      } catch (e2) {
        return {
          type: "object",
          value: {
            properties: []
          }
        };
      }
    case "undefined":
      return formatUndefined();
    case "function":
      return formatFunction(arg);
    case "symbol": {
      return formatSymbol(arg);
    }
    case "bigint":
      return formatBigInt(arg);
  }
}
function formatFunction(value) {
  return {
    type: "function",
    value: `function ${value.name}() {}`
  };
}
function formatUndefined() {
  return {
    type: "undefined"
  };
}
function formatBoolean(value) {
  return {
    type: "boolean",
    value: String(value)
  };
}
function formatNumber(value) {
  return {
    type: "number",
    value: String(value)
  };
}
function formatBigInt(value) {
  return {
    type: "bigint",
    value: String(value)
  };
}
function formatString(value) {
  return {
    type: "string",
    value
  };
}
function formatSymbol(value) {
  return {
    type: "symbol",
    value: value.description
  };
}
function formatObject(value, depth) {
  if (value === null) {
    return {
      type: "null"
    };
  }
  {
    if (isComponentPublicInstance(value)) {
      return formatComponentPublicInstance(value, depth);
    }
    if (isComponentInternalInstance(value)) {
      return formatComponentInternalInstance(value, depth);
    }
    if (isUniElement(value)) {
      return formatUniElement(value, depth);
    }
    if (isCSSStyleDeclaration(value)) {
      return formatCSSStyleDeclaration(value, depth);
    }
  }
  if (Array.isArray(value)) {
    return {
      type: "object",
      subType: "array",
      value: {
        properties: value.map((v2, i2) => formatArrayElement(v2, i2, depth + 1))
      }
    };
  }
  if (value instanceof Set) {
    return {
      type: "object",
      subType: "set",
      className: "Set",
      description: `Set(${value.size})`,
      value: {
        entries: Array.from(value).map((v2) => formatSetEntry(v2, depth + 1))
      }
    };
  }
  if (value instanceof Map) {
    return {
      type: "object",
      subType: "map",
      className: "Map",
      description: `Map(${value.size})`,
      value: {
        entries: Array.from(value.entries()).map((v2) => formatMapEntry(v2, depth + 1))
      }
    };
  }
  if (value instanceof Promise) {
    return {
      type: "object",
      subType: "promise",
      value: {
        properties: []
      }
    };
  }
  if (value instanceof RegExp) {
    return {
      type: "object",
      subType: "regexp",
      value: String(value),
      className: "Regexp"
    };
  }
  if (value instanceof Date) {
    return {
      type: "object",
      subType: "date",
      value: String(value),
      className: "Date"
    };
  }
  if (value instanceof Error) {
    return {
      type: "object",
      subType: "error",
      value: value.message || String(value),
      className: value.name || "Error"
    };
  }
  let className = void 0;
  {
    const constructor = value.constructor;
    if (constructor) {
      if (constructor.get$UTSMetadata$) {
        className = constructor.get$UTSMetadata$().name;
      }
    }
  }
  let entries = Object.entries(value);
  if (isHarmonyBuilderParams(value)) {
    entries = entries.filter(([key]) => key !== "modifier" && key !== "nodeContent");
  }
  return {
    type: "object",
    className,
    value: {
      properties: entries.map((entry) => formatObjectProperty(entry[0], entry[1], depth + 1))
    }
  };
}
function isHarmonyBuilderParams(value) {
  return value.modifier && value.modifier._attribute && value.nodeContent;
}
function isComponentPublicInstance(value) {
  return value.$ && isComponentInternalInstance(value.$);
}
function isComponentInternalInstance(value) {
  return value.type && value.uid != null && value.appContext;
}
function formatComponentPublicInstance(value, depth) {
  return {
    type: "object",
    className: "ComponentPublicInstance",
    value: {
      properties: Object.entries(value.$.type).map(([name, value2]) => formatObjectProperty(name, value2, depth + 1))
    }
  };
}
function formatComponentInternalInstance(value, depth) {
  return {
    type: "object",
    className: "ComponentInternalInstance",
    value: {
      properties: Object.entries(value.type).map(([name, value2]) => formatObjectProperty(name, value2, depth + 1))
    }
  };
}
function isUniElement(value) {
  return value.style && value.tagName != null && value.nodeName != null;
}
function formatUniElement(value, depth) {
  return {
    type: "object",
    // 非 x 没有 UniElement 的概念
    // className: 'UniElement',
    value: {
      properties: Object.entries(value).filter(([name]) => [
        "id",
        "tagName",
        "nodeName",
        "dataset",
        "offsetTop",
        "offsetLeft",
        "style"
      ].includes(name)).map(([name, value2]) => formatObjectProperty(name, value2, depth + 1))
    }
  };
}
function isCSSStyleDeclaration(value) {
  return typeof value.getPropertyValue === "function" && typeof value.setProperty === "function" && value.$styles;
}
function formatCSSStyleDeclaration(style, depth) {
  return {
    type: "object",
    value: {
      properties: Object.entries(style.$styles).map(([name, value]) => formatObjectProperty(name, value, depth + 1))
    }
  };
}
function formatObjectProperty(name, value, depth) {
  const result = formatArg(value, depth);
  result.name = name;
  return result;
}
function formatArrayElement(value, index2, depth) {
  const result = formatArg(value, depth);
  result.name = `${index2}`;
  return result;
}
function formatSetEntry(value, depth) {
  return {
    value: formatArg(value, depth)
  };
}
function formatMapEntry(value, depth) {
  return {
    key: formatArg(value[0], depth),
    value: formatArg(value[1], depth)
  };
}
let sendConsole = null;
const messageQueue = [];
const messageExtra = {};
const EXCEPTION_BEGIN_MARK = "---BEGIN:EXCEPTION---";
const EXCEPTION_END_MARK = "---END:EXCEPTION---";
function sendConsoleMessages(messages) {
  if (sendConsole == null) {
    messageQueue.push(...messages);
    return;
  }
  sendConsole(JSON.stringify(Object.assign({
    type: "console",
    data: messages
  }, messageExtra)));
}
function setSendConsole(value, extra = {}) {
  sendConsole = value;
  Object.assign(messageExtra, extra);
  if (value != null && messageQueue.length > 0) {
    const messages = messageQueue.slice();
    messageQueue.length = 0;
    sendConsoleMessages(messages);
  }
}
const atFileRegex = /^\s*at\s+[\w/./-]+:\d+$/;
function rewriteConsole() {
  function wrapConsole(type) {
    return function(...args) {
      {
        const originalArgs = [...args];
        if (originalArgs.length) {
          const maybeAtFile = originalArgs[originalArgs.length - 1];
          if (typeof maybeAtFile === "string" && atFileRegex.test(maybeAtFile)) {
            originalArgs.pop();
          }
        }
        originalConsole[type](...originalArgs);
      }
      if (type === "error" && args.length === 1) {
        const arg = args[0];
        if (typeof arg === "string" && arg.startsWith(EXCEPTION_BEGIN_MARK)) {
          const startIndex = EXCEPTION_BEGIN_MARK.length;
          const endIndex = arg.length - EXCEPTION_END_MARK.length;
          sendErrorMessages([arg.slice(startIndex, endIndex)]);
          return;
        } else if (arg instanceof Error) {
          sendErrorMessages([arg]);
          return;
        }
      }
      sendConsoleMessages([formatMessage(type, args)]);
    };
  }
  if (isConsoleWritable()) {
    CONSOLE_TYPES.forEach((type) => {
      console[type] = wrapConsole(type);
    });
    return function restoreConsole() {
      CONSOLE_TYPES.forEach((type) => {
        console[type] = originalConsole[type];
      });
    };
  } else {
    {
      if (typeof index !== "undefined" && index.__f__) {
        const oldLog = index.__f__;
        if (oldLog) {
          index.__f__ = function(...args) {
            const [type, filename, ...rest] = args;
            oldLog(type, "", ...rest);
            sendConsoleMessages([formatMessage(type, [...rest, filename])]);
          };
          return function restoreConsole() {
            index.__f__ = oldLog;
          };
        }
      }
    }
  }
  return function restoreConsole() {
  };
}
function isConsoleWritable() {
  const value = console.log;
  const sym = Symbol();
  try {
    console.log = sym;
  } catch (ex) {
    return false;
  }
  const isWritable = console.log === sym;
  console.log = value;
  return isWritable;
}
const UNI_CONSOLE_RUNTIME_PROMISE = "__uni_console_runtime_promise__";
function initRuntimeSocketService() {
  const hosts = "192.168.82.44,127.0.0.1";
  const port = "8090";
  const id = "mp-weixin_1QWQZx";
  const runtimeGlobal = getRuntimeGlobal();
  const existingPromise = runtimeGlobal === null || runtimeGlobal === void 0 ? void 0 : runtimeGlobal[UNI_CONSOLE_RUNTIME_PROMISE];
  if (existingPromise) {
    return existingPromise;
  }
  let runtimePromise = initRuntimeSocketServiceOnce(hosts, port, id);
  if (runtimeGlobal) {
    runtimePromise = runtimePromise.then((success) => {
      if (!success && runtimeGlobal[UNI_CONSOLE_RUNTIME_PROMISE] === runtimePromise) {
        delete runtimeGlobal[UNI_CONSOLE_RUNTIME_PROMISE];
      }
      return success;
    }, (error) => {
      if (runtimeGlobal[UNI_CONSOLE_RUNTIME_PROMISE] === runtimePromise) {
        delete runtimeGlobal[UNI_CONSOLE_RUNTIME_PROMISE];
      }
      throw error;
    });
    runtimeGlobal[UNI_CONSOLE_RUNTIME_PROMISE] = runtimePromise;
  }
  return runtimePromise;
}
function initRuntimeSocketServiceOnce(hosts, port, id) {
  const lazy = typeof swan !== "undefined";
  let restoreError = lazy ? () => {
  } : initOnError();
  let restoreConsole = lazy ? () => {
  } : rewriteConsole();
  return Promise.resolve().then(() => {
    if (lazy) {
      restoreError = initOnError();
      restoreConsole = rewriteConsole();
    }
    return initRuntimeSocket(hosts, port, id).then((socket) => {
      if (!socket) {
        restoreError();
        restoreConsole();
        originalConsole.error(wrapError("开发模式下日志通道建立 socket 连接失败。"));
        {
          originalConsole.error(wrapError("小程序平台，请勾选不校验合法域名配置。"));
        }
        originalConsole.error(wrapError("如果是运行到真机，请确认手机与电脑处于同一网络。"));
        return false;
      }
      {
        initMiniProgramGlobalFlag();
      }
      socket.onClose(() => {
        {
          originalConsole.error(wrapError("开发模式下日志通道 socket 连接关闭，请在 HBuilderX 中重新运行。"));
        }
        restoreError();
        restoreConsole();
      });
      setSendConsole((data) => {
        socket.send({
          data
        });
      });
      setSendError((data) => {
        socket.send({
          data
        });
      });
      return true;
    });
  });
}
const ERROR_CHAR = "‌";
function wrapError(error) {
  return `${ERROR_CHAR}${error}${ERROR_CHAR}`;
}
function getRuntimeGlobal() {
  const miniProgramGlobal = getMiniProgramGlobal();
  if (miniProgramGlobal) {
    return miniProgramGlobal;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
}
function getMiniProgramGlobal() {
  if (typeof wx$1 !== "undefined") {
    return wx$1;
  } else if (typeof my !== "undefined") {
    return my;
  } else if (typeof tt !== "undefined") {
    return tt;
  } else if (typeof swan !== "undefined") {
    return swan;
  } else if (typeof qq !== "undefined") {
    return qq;
  } else if (typeof ks !== "undefined") {
    return ks;
  } else if (typeof jd !== "undefined") {
    return jd;
  } else if (typeof xhs !== "undefined") {
    return xhs;
  } else if (typeof has !== "undefined") {
    return has;
  } else if (typeof qa !== "undefined") {
    return qa;
  }
}
function initMiniProgramGlobalFlag() {
  const miniProgramGlobal = getMiniProgramGlobal();
  if (miniProgramGlobal) {
    miniProgramGlobal.__uni_console__ = true;
  }
}
initRuntimeSocketService();
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
function initVueIds(vueIds, mpInstance) {
  if (!vueIds) {
    return;
  }
  const ids = vueIds.split(",");
  const len = ids.length;
  if (len === 1) {
    mpInstance._$vueId = ids[0];
  } else if (len === 2) {
    mpInstance._$vueId = ids[0];
    mpInstance._$vuePid = ids[1];
  }
}
const EXTRAS = ["externalClasses"];
function initExtraOptions(miniProgramComponentOptions, vueOptions) {
  EXTRAS.forEach((name) => {
    if (hasOwn(vueOptions, name)) {
      miniProgramComponentOptions[name] = vueOptions[name];
    }
  });
}
const WORKLET_RE = /_(.*)_worklet_factory_/;
function initWorkletMethods(mpMethods, vueMethods) {
  if (vueMethods) {
    Object.keys(vueMethods).forEach((name) => {
      const matches = name.match(WORKLET_RE);
      if (matches) {
        const workletName = matches[1];
        mpMethods[name] = vueMethods[name];
        mpMethods[workletName] = vueMethods[workletName];
      }
    });
  }
}
function initWxsCallMethods(methods, wxsCallMethods) {
  if (!isArray(wxsCallMethods)) {
    return;
  }
  wxsCallMethods.forEach((callMethod) => {
    methods[callMethod] = function(args) {
      return this.$vm[callMethod](args);
    };
  });
}
function selectAllComponents(mpInstance, selector, $refs) {
  const components = mpInstance.selectAllComponents(selector);
  components.forEach((component) => {
    const ref2 = component.properties.uR;
    $refs[ref2] = component.$vm || component;
  });
}
function initRefs(instance, mpInstance) {
  Object.defineProperty(instance, "refs", {
    get() {
      const $refs = {};
      selectAllComponents(mpInstance, ".r", $refs);
      const forComponents = mpInstance.selectAllComponents(".r-i-f");
      forComponents.forEach((component) => {
        const ref2 = component.properties.uR;
        if (!ref2) {
          return;
        }
        if (!$refs[ref2]) {
          $refs[ref2] = [];
        }
        $refs[ref2].push(component.$vm || component);
      });
      return $refs;
    }
  });
}
function findVmByVueId(instance, vuePid) {
  const $children = instance.$children;
  for (let i2 = $children.length - 1; i2 >= 0; i2--) {
    const childVm = $children[i2];
    if (childVm.$scope._$vueId === vuePid) {
      return childVm;
    }
  }
  let parentVm;
  for (let i2 = $children.length - 1; i2 >= 0; i2--) {
    parentVm = findVmByVueId($children[i2], vuePid);
    if (parentVm) {
      return parentVm;
    }
  }
}
function getLocaleLanguage() {
  var _a;
  let localeLanguage = "";
  {
    const appBaseInfo = ((_a = wx.getAppBaseInfo) === null || _a === void 0 ? void 0 : _a.call(wx)) || wx.getSystemInfoSync();
    const language = appBaseInfo && appBaseInfo.language ? appBaseInfo.language : LOCALE_EN;
    localeLanguage = normalizeLocale(language) || LOCALE_EN;
  }
  return localeLanguage;
}
const MP_METHODS = [
  "createSelectorQuery",
  "createIntersectionObserver",
  "selectAllComponents",
  "selectComponent"
];
function createEmitFn(oldEmit, ctx) {
  return function emit2(event, ...args) {
    const scope = ctx.$scope;
    if (scope && event) {
      const detail = { __args__: args };
      {
        scope.triggerEvent(event, detail);
      }
    }
    return oldEmit.apply(this, [event, ...args]);
  };
}
function initBaseInstance(instance, options) {
  const ctx = instance.ctx;
  ctx.mpType = options.mpType;
  ctx.$mpType = options.mpType;
  ctx.$mpPlatform = "mp-weixin";
  ctx.$scope = options.mpInstance;
  {
    Object.defineProperties(ctx, {
      // only id
      [VIRTUAL_HOST_ID]: {
        get() {
          const id = this.$scope.data[VIRTUAL_HOST_ID];
          return id === void 0 ? "" : id;
        }
      }
    });
  }
  ctx.$mp = {};
  {
    ctx._self = {};
  }
  instance.slots = {};
  if (isArray(options.slots) && options.slots.length) {
    options.slots.forEach((name) => {
      instance.slots[name] = true;
    });
    if (instance.slots[SLOT_DEFAULT_NAME]) {
      instance.slots.default = true;
    }
  }
  ctx.getOpenerEventChannel = function() {
    {
      return options.mpInstance.getOpenerEventChannel();
    }
  };
  ctx.$hasHook = hasHook;
  ctx.$callHook = callHook;
  instance.emit = createEmitFn(instance.emit, ctx);
}
function initComponentInstance(instance, options) {
  initBaseInstance(instance, options);
  const ctx = instance.ctx;
  MP_METHODS.forEach((method) => {
    ctx[method] = function(...args) {
      const mpInstance = ctx.$scope;
      if (mpInstance && mpInstance[method]) {
        return mpInstance[method].apply(mpInstance, args);
      }
    };
  });
}
function initMocks(instance, mpInstance, mocks2) {
  const ctx = instance.ctx;
  mocks2.forEach((mock) => {
    if (hasOwn(mpInstance, mock)) {
      instance[mock] = ctx[mock] = mpInstance[mock];
    }
  });
}
function hasHook(name) {
  const hooks = this.$[name];
  if (hooks && hooks.length) {
    return true;
  }
  return false;
}
function callHook(name, args) {
  if (name === "mounted") {
    callHook.call(this, "bm");
    this.$.isMounted = true;
    name = "m";
  }
  const hooks = this.$[name];
  return hooks && invokeArrayFns(hooks, args);
}
const PAGE_INIT_HOOKS = [
  ON_LOAD,
  ON_SHOW,
  ON_HIDE,
  ON_UNLOAD,
  ON_RESIZE,
  ON_TAB_ITEM_TAP,
  ON_REACH_BOTTOM,
  ON_PULL_DOWN_REFRESH,
  ON_ADD_TO_FAVORITES
  // 'onReady', // lifetimes.ready
  // 'onPageScroll', // 影响性能，开发者手动注册
  // 'onShareTimeline', // 右上角菜单，开发者手动注册
  // 'onShareAppMessage' // 右上角菜单，开发者手动注册
];
function findHooks(vueOptions, hooks = /* @__PURE__ */ new Set()) {
  if (vueOptions) {
    Object.keys(vueOptions).forEach((name) => {
      if (isUniLifecycleHook(name, vueOptions[name])) {
        hooks.add(name);
      }
    });
    {
      const { extends: extendsOptions, mixins } = vueOptions;
      if (mixins) {
        mixins.forEach((mixin) => findHooks(mixin, hooks));
      }
      if (extendsOptions) {
        findHooks(extendsOptions, hooks);
      }
    }
  }
  return hooks;
}
function initHook(mpOptions, hook, excludes) {
  if (excludes.indexOf(hook) === -1 && !hasOwn(mpOptions, hook)) {
    mpOptions[hook] = function(args) {
      return this.$vm && this.$vm.$callHook(hook, args);
    };
  }
}
const EXCLUDE_HOOKS = [ON_READY];
function initHooks(mpOptions, hooks, excludes = EXCLUDE_HOOKS) {
  hooks.forEach((hook) => initHook(mpOptions, hook, excludes));
}
function initUnknownHooks(mpOptions, vueOptions, excludes = EXCLUDE_HOOKS) {
  findHooks(vueOptions).forEach((hook) => initHook(mpOptions, hook, excludes));
}
function initRuntimeHooks(mpOptions, runtimeHooks) {
  if (!runtimeHooks) {
    return;
  }
  const hooks = Object.keys(MINI_PROGRAM_PAGE_RUNTIME_HOOKS);
  hooks.forEach((hook) => {
    if (runtimeHooks & MINI_PROGRAM_PAGE_RUNTIME_HOOKS[hook]) {
      initHook(mpOptions, hook, []);
    }
  });
}
const findMixinRuntimeHooks = /* @__PURE__ */ once(() => {
  const runtimeHooks = [];
  const app = isFunction(getApp) && getApp({ allowDefault: true });
  if (app && app.$vm && app.$vm.$) {
    const mixins = app.$vm.$.appContext.mixins;
    if (isArray(mixins)) {
      const hooks = Object.keys(MINI_PROGRAM_PAGE_RUNTIME_HOOKS);
      mixins.forEach((mixin) => {
        hooks.forEach((hook) => {
          if (hasOwn(mixin, hook) && !runtimeHooks.includes(hook)) {
            runtimeHooks.push(hook);
          }
        });
      });
    }
  }
  return runtimeHooks;
});
function initMixinRuntimeHooks(mpOptions) {
  initHooks(mpOptions, findMixinRuntimeHooks());
}
let runtimeSubpackageRoot;
const runtimeSubpackages = /* @__PURE__ */ Object.create(null);
function resolveSubpackageRoot(root) {
  return normalizeSubpackageRoot(root) || normalizeSubpackageRoot("");
}
function setRuntimeSubpackageRoot(root) {
  runtimeSubpackageRoot = normalizeSubpackageRoot(root);
}
function getRuntimeSubpackageRoot() {
  return runtimeSubpackageRoot;
}
function setSubpackageAppVm(root, vm, independent) {
  const subpackageRoot = normalizeSubpackageRoot(root);
  if (!subpackageRoot) {
    return;
  }
  setRuntimeSubpackageRoot(subpackageRoot);
  if (independent) {
    runtimeSubpackages[subpackageRoot] = {
      $vm: vm
    };
  } else {
    const globalObject = wx;
    (globalObject.$subpackages || (globalObject.$subpackages = {}))[subpackageRoot] = {
      $vm: vm
    };
  }
}
function getSubpackageAppVm() {
  var _a, _b, _c;
  const subpackageRoot = getRuntimeSubpackageRoot();
  if (!subpackageRoot) {
    return;
  }
  return ((_a = runtimeSubpackages[subpackageRoot]) === null || _a === void 0 ? void 0 : _a.$vm) || ((_c = (_b = wx.$subpackages) === null || _b === void 0 ? void 0 : _b[subpackageRoot]) === null || _c === void 0 ? void 0 : _c.$vm);
}
function normalizeSubpackageRoot(root) {
  return typeof root === "string" ? root.replace(/^\/+|\/+$/g, "") : void 0;
}
const HOOKS = [
  ON_SHOW,
  ON_HIDE,
  ON_ERROR,
  ON_THEME_CHANGE,
  ON_PAGE_NOT_FOUND,
  ON_UNHANDLE_REJECTION
];
function parseApp(instance, parseAppOptions) {
  const internalInstance = instance.$;
  const appOptions = {
    globalData: instance.$options && instance.$options.globalData || {},
    $vm: instance,
    // mp-alipay 组件 data 初始化比 onLaunch 早，提前挂载
    onLaunch(options) {
      this.$vm = instance;
      const ctx = internalInstance.ctx;
      if (this.$vm && ctx.$scope && ctx.$callHook) {
        return;
      }
      initBaseInstance(internalInstance, {
        mpType: "app",
        mpInstance: this,
        slots: []
      });
      ctx.globalData = this.globalData;
      instance.$callHook(ON_LAUNCH, options);
    }
  };
  const onErrorHandlers = wx.$onErrorHandlers;
  if (onErrorHandlers) {
    onErrorHandlers.forEach((fn2) => {
      injectHook(ON_ERROR, fn2, internalInstance);
    });
    onErrorHandlers.length = 0;
  }
  initLocale(instance);
  const vueOptions = instance.$.type;
  initHooks(appOptions, HOOKS);
  initUnknownHooks(appOptions, vueOptions);
  {
    const methods = vueOptions.methods;
    methods && extend(appOptions, methods);
  }
  return appOptions;
}
function initCreateApp(parseAppOptions) {
  return function createApp2(vm) {
    return App(parseApp(vm));
  };
}
function initCreateSubpackageApp(parseAppOptions) {
  return function createApp2(vm, root) {
    const appOptions = parseApp(vm);
    const app = isFunction(getApp) && getApp({
      allowDefault: true
    });
    if (!app)
      return;
    vm.$.ctx.$scope = app;
    const globalData = app.globalData;
    if (globalData) {
      Object.keys(appOptions.globalData).forEach((name) => {
        if (!hasOwn(globalData, name)) {
          globalData[name] = appOptions.globalData[name];
        }
      });
    }
    Object.keys(appOptions).forEach((name) => {
      if (!hasOwn(app, name)) {
        app[name] = appOptions[name];
      }
    });
    initAppLifecycle(appOptions, vm);
    setSubpackageAppVm(resolveSubpackageRoot(root), vm);
  };
}
function initCreateIndependentSubpackageApp() {
  return function createApp2(vm, root) {
    setSubpackageAppVm(resolveSubpackageRoot(root), vm, true);
  };
}
function initAppLifecycle(appOptions, vm) {
  if (isFunction(appOptions.onLaunch)) {
    const args = wx.getLaunchOptionsSync && wx.getLaunchOptionsSync();
    appOptions.onLaunch(args);
  }
  if (isFunction(appOptions.onShow) && wx.onAppShow) {
    wx.onAppShow((args) => {
      vm.$callHook("onShow", args);
    });
  }
  if (isFunction(appOptions.onHide) && wx.onAppHide) {
    wx.onAppHide((args) => {
      vm.$callHook("onHide", args);
    });
  }
}
function initLocale(appVm) {
  const locale = ref(getLocaleLanguage());
  Object.defineProperty(appVm, "$locale", {
    get() {
      return locale.value;
    },
    set(v2) {
      locale.value = v2;
    }
  });
}
const builtInProps = [
  // 百度小程序,快手小程序自定义组件不支持绑定动态事件，动态dataset，故通过props传递事件信息
  // event-opts
  "eO",
  // 组件 ref
  "uR",
  // 组件 ref-in-for
  "uRIF",
  // 组件 id
  "uI",
  // 组件类型 m: 小程序组件
  "uT",
  // 组件 props
  "uP",
  // 小程序不能直接定义 $slots 的 props，所以通过 vueSlots 转换到 $slots
  "uS"
];
function initDefaultProps(options, isBehavior = false) {
  const properties = {};
  if (!isBehavior) {
    let observerSlots = function(newVal) {
      const $slots = /* @__PURE__ */ Object.create(null);
      newVal && newVal.forEach((slotName) => {
        $slots[slotName] = true;
      });
      this.setData({
        $slots
      });
    };
    builtInProps.forEach((name) => {
      properties[name] = {
        type: null,
        value: ""
      };
    });
    properties.uS = {
      type: null,
      value: []
    };
    {
      properties.uS.observer = observerSlots;
    }
  }
  if (options.behaviors) {
    if (options.behaviors.includes("wx://form-field")) {
      if (!options.properties || !options.properties.name) {
        properties.name = {
          type: null,
          value: ""
        };
      }
      if (!options.properties || !options.properties.value) {
        properties.value = {
          type: null,
          value: ""
        };
      }
    }
  }
  return properties;
}
function initVirtualHostProps(options) {
  const properties = {};
  {
    if (options && options.virtualHost) {
      properties[VIRTUAL_HOST_STYLE] = {
        type: null,
        value: ""
      };
      properties[VIRTUAL_HOST_CLASS] = {
        type: null,
        value: ""
      };
      properties[VIRTUAL_HOST_HIDDEN] = {
        type: null,
        value: ""
      };
      properties[VIRTUAL_HOST_ID] = {
        type: null,
        value: ""
      };
    }
  }
  return properties;
}
function initProps(mpComponentOptions) {
  if (!mpComponentOptions.properties) {
    mpComponentOptions.properties = {};
  }
  extend(mpComponentOptions.properties, initDefaultProps(mpComponentOptions), initVirtualHostProps(mpComponentOptions.options));
}
const PROP_TYPES = [String, Number, Boolean, Object, Array, null];
function parsePropType(type, defaultValue) {
  if (isArray(type) && type.length === 1) {
    return type[0];
  }
  return type;
}
function normalizePropType(type, defaultValue) {
  const res = parsePropType(type);
  return PROP_TYPES.indexOf(res) !== -1 ? res : null;
}
function initPageProps({ properties }, rawProps) {
  if (isArray(rawProps)) {
    rawProps.forEach((key) => {
      properties[key] = {
        type: String,
        value: ""
      };
    });
  } else if (isPlainObject(rawProps)) {
    Object.keys(rawProps).forEach((key) => {
      const opts = rawProps[key];
      if (isPlainObject(opts)) {
        let value = opts.default;
        if (isFunction(value)) {
          value = value();
        }
        const type = opts.type;
        opts.type = normalizePropType(type);
        properties[key] = {
          type: opts.type,
          value
        };
      } else {
        properties[key] = {
          type: normalizePropType(opts)
        };
      }
    });
  }
}
function findPropsData(properties, isPage2) {
  return (isPage2 ? findPagePropsData(properties) : findComponentPropsData(resolvePropValue(properties.uP))) || {};
}
function findPagePropsData(properties) {
  const propsData = {};
  if (isPlainObject(properties)) {
    Object.keys(properties).forEach((name) => {
      if (builtInProps.indexOf(name) === -1) {
        propsData[name] = resolvePropValue(properties[name]);
      }
    });
  }
  return propsData;
}
function initFormField(vm) {
  const vueOptions = vm.$options;
  if (isArray(vueOptions.behaviors) && vueOptions.behaviors.includes("uni://form-field")) {
    vm.$watch("modelValue", () => {
      vm.$scope && vm.$scope.setData({
        name: vm.name,
        value: vm.modelValue
      });
    }, {
      immediate: true
    });
  }
}
function resolvePropValue(prop) {
  return prop;
}
function initData(_2) {
  return {};
}
function initPropsObserver(componentOptions) {
  const observe = function observe2() {
    const up = this.properties.uP;
    if (!up) {
      return;
    }
    if (this.$vm) {
      updateComponentProps(resolvePropValue(up), this.$vm.$);
    } else if (resolvePropValue(this.properties.uT) === "m") {
      updateMiniProgramComponentProperties(resolvePropValue(up), this);
    } else
      ;
  };
  {
    if (!componentOptions.observers) {
      componentOptions.observers = {};
    }
    componentOptions.observers.uP = observe;
  }
}
function updateMiniProgramComponentProperties(up, mpInstance) {
  const prevProps = mpInstance.properties;
  const nextProps = findComponentPropsData(up) || {};
  if (hasPropsChanged(prevProps, nextProps, false)) {
    mpInstance.setData(nextProps);
  }
}
function updateComponentProps(up, instance) {
  const prevProps = toRaw(instance.props);
  const nextProps = findComponentPropsData(up) || {};
  if (hasPropsChanged(prevProps, nextProps)) {
    updateProps(instance, nextProps, prevProps, false);
    if (hasQueueJob(instance.update)) {
      invalidateJob(instance.update);
    }
    {
      instance.update();
    }
  }
}
function hasPropsChanged(prevProps, nextProps, checkLen = true) {
  const nextKeys = Object.keys(nextProps);
  if (checkLen && nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i2 = 0; i2 < nextKeys.length; i2++) {
    const key = nextKeys[i2];
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
function initBehaviors(vueOptions) {
  const vueBehaviors = vueOptions.behaviors;
  let vueProps = vueOptions.props;
  if (!vueProps) {
    vueOptions.props = vueProps = [];
  }
  const behaviors = [];
  if (isArray(vueBehaviors)) {
    vueBehaviors.forEach((behavior) => {
      behaviors.push(behavior.replace("uni://", "wx://"));
      if (behavior === "uni://form-field") {
        if (isArray(vueProps)) {
          vueProps.push("name");
          vueProps.push("modelValue");
        } else {
          vueProps.name = {
            type: String,
            default: ""
          };
          vueProps.modelValue = {
            type: [String, Number, Boolean, Array, Object, Date],
            default: ""
          };
        }
      }
    });
  }
  return behaviors;
}
function applyOptions(componentOptions, vueOptions) {
  componentOptions.data = initData();
  componentOptions.behaviors = initBehaviors(vueOptions);
}
function parseComponent(vueOptions, { parse, mocks: mocks2, isPage: isPage2, isPageInProject, initRelation: initRelation2, handleLink: handleLink2, initLifetimes: initLifetimes2 }) {
  vueOptions = vueOptions.default || vueOptions;
  const options = {
    multipleSlots: true,
    // styleIsolation: 'apply-shared',
    addGlobalClass: true,
    pureDataPattern: /^uP$/
  };
  if (isArray(vueOptions.mixins)) {
    vueOptions.mixins.forEach((item) => {
      if (isObject$1(item.options)) {
        extend(options, item.options);
      }
    });
  }
  if (vueOptions.options) {
    extend(options, vueOptions.options);
  }
  const mpComponentOptions = {
    options,
    lifetimes: initLifetimes2({ mocks: mocks2, isPage: isPage2, initRelation: initRelation2, vueOptions }),
    pageLifetimes: {
      show() {
        this.$vm && this.$vm.$callHook("onPageShow");
      },
      hide() {
        this.$vm && this.$vm.$callHook("onPageHide");
      },
      resize(size2) {
        this.$vm && this.$vm.$callHook("onPageResize", size2);
      }
    },
    methods: {
      __l: handleLink2
    }
  };
  {
    applyOptions(mpComponentOptions, vueOptions);
  }
  initProps(mpComponentOptions);
  initPropsObserver(mpComponentOptions);
  initExtraOptions(mpComponentOptions, vueOptions);
  initWxsCallMethods(mpComponentOptions.methods, vueOptions.wxsCallMethods);
  {
    initWorkletMethods(mpComponentOptions.methods, vueOptions.methods);
  }
  if (parse) {
    parse(mpComponentOptions, { handleLink: handleLink2 });
  }
  return mpComponentOptions;
}
function initCreateComponent(parseOptions2) {
  return function createComponent2(vueComponentOptions) {
    return Component(parseComponent(vueComponentOptions, parseOptions2));
  };
}
let $createComponentFn;
let $destroyComponentFn;
let $createComponentAppVm;
let $destroyComponentAppVm;
const componentAppVmMap = /* @__PURE__ */ new WeakMap();
function getAppVm() {
  const subpackageAppVm = getSubpackageAppVm();
  if (subpackageAppVm) {
    return subpackageAppVm;
  }
  return getApp().$vm;
}
function $createComponent(initialVNode, options) {
  const appVm = getAppVm();
  if (!$createComponentFn || $createComponentAppVm !== appVm) {
    $createComponentAppVm = appVm;
    $createComponentFn = appVm.$createComponent;
  }
  const proxy = $createComponentFn(initialVNode, options);
  const exposeProxy = getComponentExposeProxy(proxy);
  componentAppVmMap.set(proxy, appVm);
  if (exposeProxy && typeof exposeProxy === "object") {
    componentAppVmMap.set(exposeProxy, appVm);
  }
  return exposeProxy || proxy;
}
function $destroyComponent(instance) {
  const appVm = componentAppVmMap.get(instance) || getAppVm();
  if (!$destroyComponentFn || $destroyComponentAppVm !== appVm) {
    $destroyComponentAppVm = appVm;
    $destroyComponentFn = appVm.$destroyComponent;
  }
  try {
    return $destroyComponentFn(instance);
  } finally {
    componentAppVmMap.delete(instance);
  }
}
function getComponentExposeProxy(proxy) {
  return typeof getExposeProxy === "function" ? getExposeProxy(proxy.$) : void 0;
}
function parsePage(vueOptions, parseOptions2) {
  const { parse, mocks: mocks2, isPage: isPage2, initRelation: initRelation2, handleLink: handleLink2, initLifetimes: initLifetimes2 } = parseOptions2;
  const miniProgramPageOptions = parseComponent(vueOptions, {
    mocks: mocks2,
    isPage: isPage2,
    isPageInProject: true,
    initRelation: initRelation2,
    handleLink: handleLink2,
    initLifetimes: initLifetimes2
  });
  initPageProps(miniProgramPageOptions, (vueOptions.default || vueOptions).props);
  const methods = miniProgramPageOptions.methods;
  methods.onLoad = function(query) {
    {
      this.options = query;
    }
    this.$page = {
      fullPath: addLeadingSlash(this.route + stringifyQuery(query))
    };
    return this.$vm && this.$vm.$callHook(ON_LOAD, query);
  };
  initHooks(methods, PAGE_INIT_HOOKS);
  {
    initUnknownHooks(methods, vueOptions);
  }
  initRuntimeHooks(methods, vueOptions.__runtimeHooks);
  initMixinRuntimeHooks(methods);
  parse && parse(miniProgramPageOptions, { handleLink: handleLink2 });
  return miniProgramPageOptions;
}
function initCreatePage(parseOptions2) {
  return function createPage2(vuePageOptions) {
    return Component(parsePage(vuePageOptions, parseOptions2));
  };
}
function initCreatePluginApp(parseAppOptions) {
  return function createApp2(vm) {
    initAppLifecycle(parseApp(vm), vm);
  };
}
const MPPage = Page;
const MPComponent = Component;
function initTriggerEvent(mpInstance) {
  const oldTriggerEvent = mpInstance.triggerEvent;
  const newTriggerEvent = function(event, ...args) {
    return oldTriggerEvent.apply(mpInstance, [
      customizeEvent(event),
      ...args
    ]);
  };
  try {
    mpInstance.triggerEvent = newTriggerEvent;
  } catch (error) {
    mpInstance._triggerEvent = newTriggerEvent;
  }
}
function initMiniProgramHook(name, options, isComponent) {
  const oldHook = options[name];
  if (!oldHook) {
    options[name] = function() {
      initTriggerEvent(this);
    };
  } else {
    options[name] = function(...args) {
      initTriggerEvent(this);
      return oldHook.apply(this, args);
    };
  }
}
Page = function(options) {
  initMiniProgramHook(ON_LOAD, options);
  return MPPage(options);
};
Component = function(options) {
  initMiniProgramHook("created", options);
  const isVueComponent = options.properties && options.properties.uP;
  if (!isVueComponent) {
    initProps(options);
    initPropsObserver(options);
  }
  return MPComponent(options);
};
function initLifetimes({ mocks: mocks2, isPage: isPage2, initRelation: initRelation2, vueOptions }) {
  return {
    attached() {
      let properties = this.properties;
      initVueIds(properties.uI, this);
      const relationOptions = {
        vuePid: this._$vuePid
      };
      initRelation2(this, relationOptions);
      const mpInstance = this;
      const isMiniProgramPage = isPage2(mpInstance);
      let propsData = properties;
      this.$vm = $createComponent({
        type: vueOptions,
        props: findPropsData(propsData, isMiniProgramPage)
      }, {
        mpType: isMiniProgramPage ? "page" : "component",
        mpInstance,
        slots: properties.uS || {},
        // vueSlots
        parentComponent: relationOptions.parent && relationOptions.parent.$,
        onBeforeSetup(instance, options) {
          initRefs(instance, mpInstance);
          initMocks(instance, mpInstance, mocks2);
          initComponentInstance(instance, options);
        }
      });
      if (!isMiniProgramPage) {
        initFormField(this.$vm);
      }
    },
    ready() {
      if (this.$vm) {
        {
          this.$vm.$callHook("mounted");
          this.$vm.$callHook(ON_READY);
        }
      }
    },
    detached() {
      if (this.$vm) {
        pruneComponentPropsCache(this.$vm.$.uid);
        $destroyComponent(this.$vm);
      }
    }
  };
}
const mocks = ["__route__", "__wxExparserNodeId__", "__wxWebviewId__"];
function isPage(mpInstance) {
  return !!mpInstance.route;
}
function initRelation(mpInstance, detail) {
  mpInstance.triggerEvent("__l", detail);
}
function handleLink(event) {
  const detail = event.detail || event.value;
  const vuePid = detail.vuePid;
  let parentVm;
  if (vuePid) {
    parentVm = findVmByVueId(this.$vm, vuePid);
  }
  if (!parentVm) {
    parentVm = this.$vm;
  }
  detail.parent = parentVm;
}
var parseOptions = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  handleLink,
  initLifetimes,
  initRelation,
  isPage,
  mocks
});
const createApp = initCreateApp();
const createPage = initCreatePage(parseOptions);
const createComponent = initCreateComponent(parseOptions);
const createPluginApp = initCreatePluginApp();
const createSubpackageApp = initCreateSubpackageApp();
const createIndependentSubpackageApp = initCreateIndependentSubpackageApp();
const isIndependentRuntime = typeof __UNI_MP_INDEPENDENT_RUNTIME__ !== "undefined" && __UNI_MP_INDEPENDENT_RUNTIME__ === true;
{
  if (!isIndependentRuntime) {
    wx.createApp = global.createApp = createApp;
    wx.createPage = createPage;
    wx.createComponent = createComponent;
    wx.createPluginApp = global.createPluginApp = createPluginApp;
    wx.createSubpackageApp = global.createSubpackageApp = createSubpackageApp;
    wx.createIndependentSubpackageApp = global.createIndependentSubpackageApp = createIndependentSubpackageApp;
  }
}
/*!
 * vuex v4.1.0
 * (c) 2022 Evan You
 * @license MIT
 */
var storeKey = "store";
function forEachValue(obj, fn2) {
  Object.keys(obj).forEach(function(key) {
    return fn2(obj[key], key);
  });
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isPromise(val) {
  return val && typeof val.then === "function";
}
function assert(condition, msg) {
  if (!condition) {
    throw new Error("[vuex] " + msg);
  }
}
function partial(fn2, arg) {
  return function() {
    return fn2(arg);
  };
}
function genericSubscribe(fn2, subs, options) {
  if (subs.indexOf(fn2) < 0) {
    options && options.prepend ? subs.unshift(fn2) : subs.push(fn2);
  }
  return function() {
    var i2 = subs.indexOf(fn2);
    if (i2 > -1) {
      subs.splice(i2, 1);
    }
  };
}
function resetStore(store, hot) {
  store._actions = /* @__PURE__ */ Object.create(null);
  store._mutations = /* @__PURE__ */ Object.create(null);
  store._wrappedGetters = /* @__PURE__ */ Object.create(null);
  store._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  var state = store.state;
  installModule(store, state, [], store._modules.root, true);
  resetStoreState(store, state, hot);
}
function resetStoreState(store, state, hot) {
  var oldState = store._state;
  var oldScope = store._scope;
  store.getters = {};
  store._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var wrappedGetters = store._wrappedGetters;
  var computedObj = {};
  var computedCache = {};
  var scope = effectScope(true);
  scope.run(function() {
    forEachValue(wrappedGetters, function(fn2, key) {
      computedObj[key] = partial(fn2, store);
      computedCache[key] = computed(function() {
        return computedObj[key]();
      });
      Object.defineProperty(store.getters, key, {
        get: function() {
          return computedCache[key].value;
        },
        enumerable: true
        // for local getters
      });
    });
  });
  store._state = reactive({
    data: state
  });
  store._scope = scope;
  if (store.strict) {
    enableStrictMode(store);
  }
  if (oldState) {
    if (hot) {
      store._withCommit(function() {
        oldState.data = null;
      });
    }
  }
  if (oldScope) {
    oldScope.stop();
  }
}
function installModule(store, rootState, path, module2, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);
  if (module2.namespaced) {
    if (store._modulesNamespaceMap[namespace] && true) {
      console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
    }
    store._modulesNamespaceMap[namespace] = module2;
  }
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function() {
      {
        if (moduleName in parentState) {
          console.warn(
            '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join(".") + '"'
          );
        }
      }
      parentState[moduleName] = module2.state;
    });
  }
  var local = module2.context = makeLocalContext(store, namespace, path);
  module2.forEachMutation(function(mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });
  module2.forEachAction(function(action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });
  module2.forEachGetter(function(getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });
  module2.forEachChild(function(child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
function makeLocalContext(store, namespace, path) {
  var noNamespace = namespace === "";
  var local = {
    dispatch: noNamespace ? store.dispatch : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
        if (!store._actions[type]) {
          console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
          return;
        }
      }
      return store.dispatch(type, payload);
    },
    commit: noNamespace ? store.commit : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
        if (!store._mutations[type]) {
          console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
          return;
        }
      }
      store.commit(type, payload, options);
    }
  };
  Object.defineProperties(local, {
    getters: {
      get: noNamespace ? function() {
        return store.getters;
      } : function() {
        return makeLocalGetters(store, namespace);
      }
    },
    state: {
      get: function() {
        return getNestedState(store.state, path);
      }
    }
  });
  return local;
}
function makeLocalGetters(store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    var gettersProxy = {};
    var splitPos = namespace.length;
    Object.keys(store.getters).forEach(function(type) {
      if (type.slice(0, splitPos) !== namespace) {
        return;
      }
      var localType = type.slice(splitPos);
      Object.defineProperty(gettersProxy, localType, {
        get: function() {
          return store.getters[type];
        },
        enumerable: true
      });
    });
    store._makeLocalGettersCache[namespace] = gettersProxy;
  }
  return store._makeLocalGettersCache[namespace];
}
function registerMutation(store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store, local.state, payload);
  });
}
function registerAction(store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function(err) {
        store._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
function registerGetter(store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    {
      console.error("[vuex] duplicate getter key: " + type);
    }
    return;
  }
  store._wrappedGetters[type] = function wrappedGetter(store2) {
    return rawGetter(
      local.state,
      // local state
      local.getters,
      // local getters
      store2.state,
      // root state
      store2.getters
      // root getters
    );
  };
}
function enableStrictMode(store) {
  watch(function() {
    return store._state.data;
  }, function() {
    {
      assert(store._committing, "do not mutate vuex store state outside mutation handlers.");
    }
  }, { deep: true, flush: "sync" });
}
function getNestedState(state, path) {
  return path.reduce(function(state2, key) {
    return state2[key];
  }, state);
}
function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  {
    assert(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
  }
  return { type, payload, options };
}
var Module = function Module2(rawModule, runtime) {
  this.runtime = runtime;
  this._children = /* @__PURE__ */ Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
};
var prototypeAccessors$1 = { namespaced: { configurable: true } };
prototypeAccessors$1.namespaced.get = function() {
  return !!this._rawModule.namespaced;
};
Module.prototype.addChild = function addChild(key, module2) {
  this._children[key] = module2;
};
Module.prototype.removeChild = function removeChild(key) {
  delete this._children[key];
};
Module.prototype.getChild = function getChild(key) {
  return this._children[key];
};
Module.prototype.hasChild = function hasChild(key) {
  return key in this._children;
};
Module.prototype.update = function update(rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};
Module.prototype.forEachChild = function forEachChild(fn2) {
  forEachValue(this._children, fn2);
};
Module.prototype.forEachGetter = function forEachGetter(fn2) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn2);
  }
};
Module.prototype.forEachAction = function forEachAction(fn2) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn2);
  }
};
Module.prototype.forEachMutation = function forEachMutation(fn2) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn2);
  }
};
Object.defineProperties(Module.prototype, prototypeAccessors$1);
var ModuleCollection = function ModuleCollection2(rawRootModule) {
  this.register([], rawRootModule, false);
};
ModuleCollection.prototype.get = function get2(path) {
  return path.reduce(function(module2, key) {
    return module2.getChild(key);
  }, this.root);
};
ModuleCollection.prototype.getNamespace = function getNamespace(path) {
  var module2 = this.root;
  return path.reduce(function(namespace, key) {
    module2 = module2.getChild(key);
    return namespace + (module2.namespaced ? key + "/" : "");
  }, "");
};
ModuleCollection.prototype.update = function update$1(rawRootModule) {
  update2([], this.root, rawRootModule);
};
ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
  var this$1$1 = this;
  if (runtime === void 0)
    runtime = true;
  {
    assertRawModule(path, rawModule);
  }
  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function(rawChildModule, key) {
      this$1$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};
ModuleCollection.prototype.unregister = function unregister(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  var child = parent.getChild(key);
  if (!child) {
    {
      console.warn(
        "[vuex] trying to unregister module '" + key + "', which is not registered"
      );
    }
    return;
  }
  if (!child.runtime) {
    return;
  }
  parent.removeChild(key);
};
ModuleCollection.prototype.isRegistered = function isRegistered(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (parent) {
    return parent.hasChild(key);
  }
  return false;
};
function update2(path, targetModule, newModule) {
  {
    assertRawModule(path, newModule);
  }
  targetModule.update(newModule);
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        {
          console.warn(
            "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
          );
        }
        return;
      }
      update2(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}
var functionAssert = {
  assert: function(value) {
    return typeof value === "function";
  },
  expected: "function"
};
var objectAssert = {
  assert: function(value) {
    return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
  },
  expected: 'function or object with "handler" function'
};
var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};
function assertRawModule(path, rawModule) {
  Object.keys(assertTypes).forEach(function(key) {
    if (!rawModule[key]) {
      return;
    }
    var assertOptions = assertTypes[key];
    forEachValue(rawModule[key], function(value, type) {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}
function makeAssertionMessage(path, key, type, value, expected) {
  var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
  if (path.length > 0) {
    buf += ' in module "' + path.join(".") + '"';
  }
  buf += " is " + JSON.stringify(value) + ".";
  return buf;
}
function createStore(options) {
  return new Store(options);
}
var Store = function Store2(options) {
  var this$1$1 = this;
  if (options === void 0)
    options = {};
  {
    assert(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
    assert(this instanceof Store2, "store must be called with the new operator.");
  }
  var plugins = options.plugins;
  if (plugins === void 0)
    plugins = [];
  var strict = options.strict;
  if (strict === void 0)
    strict = false;
  var devtools2 = options.devtools;
  this._committing = false;
  this._actions = /* @__PURE__ */ Object.create(null);
  this._actionSubscribers = [];
  this._mutations = /* @__PURE__ */ Object.create(null);
  this._wrappedGetters = /* @__PURE__ */ Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  this._subscribers = [];
  this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  this._scope = null;
  this._devtools = devtools2;
  var store = this;
  var ref2 = this;
  var dispatch2 = ref2.dispatch;
  var commit2 = ref2.commit;
  this.dispatch = function boundDispatch(type, payload) {
    return dispatch2.call(store, type, payload);
  };
  this.commit = function boundCommit(type, payload, options2) {
    return commit2.call(store, type, payload, options2);
  };
  this.strict = strict;
  var state = this._modules.root.state;
  installModule(this, state, [], this._modules.root);
  resetStoreState(this, state);
  plugins.forEach(function(plugin2) {
    return plugin2(this$1$1);
  });
};
var prototypeAccessors = { state: { configurable: true } };
Store.prototype.install = function install(app, injectKey) {
  app.provide(injectKey || storeKey, this);
  app.config.globalProperties.$store = this;
  this._devtools !== void 0 ? this._devtools : true;
};
prototypeAccessors.state.get = function() {
  return this._state.data;
};
prototypeAccessors.state.set = function(v2) {
  {
    assert(false, "use store.replaceState() to explicit replace store state.");
  }
};
Store.prototype.commit = function commit(_type, _payload, _options) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload, _options);
  var type = ref2.type;
  var payload = ref2.payload;
  var options = ref2.options;
  var mutation = { type, payload };
  var entry = this._mutations[type];
  if (!entry) {
    {
      console.error("[vuex] unknown mutation type: " + type);
    }
    return;
  }
  this._withCommit(function() {
    entry.forEach(function commitIterator(handler) {
      handler(payload);
    });
  });
  this._subscribers.slice().forEach(function(sub) {
    return sub(mutation, this$1$1.state);
  });
  if (options && options.silent) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
    );
  }
};
Store.prototype.dispatch = function dispatch(_type, _payload) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload);
  var type = ref2.type;
  var payload = ref2.payload;
  var action = { type, payload };
  var entry = this._actions[type];
  if (!entry) {
    {
      console.error("[vuex] unknown action type: " + type);
    }
    return;
  }
  try {
    this._actionSubscribers.slice().filter(function(sub) {
      return sub.before;
    }).forEach(function(sub) {
      return sub.before(action, this$1$1.state);
    });
  } catch (e2) {
    {
      console.warn("[vuex] error in before action subscribers: ");
      console.error(e2);
    }
  }
  var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
    return handler(payload);
  })) : entry[0](payload);
  return new Promise(function(resolve2, reject) {
    result.then(function(res) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.after;
        }).forEach(function(sub) {
          return sub.after(action, this$1$1.state);
        });
      } catch (e2) {
        {
          console.warn("[vuex] error in after action subscribers: ");
          console.error(e2);
        }
      }
      resolve2(res);
    }, function(error) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.error;
        }).forEach(function(sub) {
          return sub.error(action, this$1$1.state, error);
        });
      } catch (e2) {
        {
          console.warn("[vuex] error in error action subscribers: ");
          console.error(e2);
        }
      }
      reject(error);
    });
  });
};
Store.prototype.subscribe = function subscribe(fn2, options) {
  return genericSubscribe(fn2, this._subscribers, options);
};
Store.prototype.subscribeAction = function subscribeAction(fn2, options) {
  var subs = typeof fn2 === "function" ? { before: fn2 } : fn2;
  return genericSubscribe(subs, this._actionSubscribers, options);
};
Store.prototype.watch = function watch$1(getter, cb, options) {
  var this$1$1 = this;
  {
    assert(typeof getter === "function", "store.watch only accepts a function.");
  }
  return watch(function() {
    return getter(this$1$1.state, this$1$1.getters);
  }, cb, Object.assign({}, options));
};
Store.prototype.replaceState = function replaceState(state) {
  var this$1$1 = this;
  this._withCommit(function() {
    this$1$1._state.data = state;
  });
};
Store.prototype.registerModule = function registerModule(path, rawModule, options) {
  if (options === void 0)
    options = {};
  if (typeof path === "string") {
    path = [path];
  }
  {
    assert(Array.isArray(path), "module path must be a string or an Array.");
    assert(path.length > 0, "cannot register the root module by using registerModule.");
  }
  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  resetStoreState(this, this.state);
};
Store.prototype.unregisterModule = function unregisterModule(path) {
  var this$1$1 = this;
  if (typeof path === "string") {
    path = [path];
  }
  {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }
  this._modules.unregister(path);
  this._withCommit(function() {
    var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
    delete parentState[path[path.length - 1]];
  });
  resetStore(this);
};
Store.prototype.hasModule = function hasModule(path) {
  if (typeof path === "string") {
    path = [path];
  }
  {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }
  return this._modules.isRegistered(path);
};
Store.prototype.hotUpdate = function hotUpdate(newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};
Store.prototype._withCommit = function _withCommit(fn2) {
  var committing = this._committing;
  this._committing = true;
  fn2();
  this._committing = committing;
};
Object.defineProperties(Store.prototype, prototypeAccessors);
var mapMutations = normalizeNamespace(function(namespace, mutations) {
  var res = {};
  if (!isValidMap(mutations)) {
    console.error("[vuex] mapMutations: mapper parameter must be either an Array or an Object");
  }
  normalizeMap(mutations).forEach(function(ref2) {
    var key = ref2.key;
    var val = ref2.val;
    res[key] = function mappedMutation() {
      var args = [], len = arguments.length;
      while (len--)
        args[len] = arguments[len];
      var commit2 = this.$store.commit;
      if (namespace) {
        var module2 = getModuleByNamespace(this.$store, "mapMutations", namespace);
        if (!module2) {
          return;
        }
        commit2 = module2.context.commit;
      }
      return typeof val === "function" ? val.apply(this, [commit2].concat(args)) : commit2.apply(this.$store, [val].concat(args));
    };
  });
  return res;
});
function normalizeMap(map2) {
  if (!isValidMap(map2)) {
    return [];
  }
  return Array.isArray(map2) ? map2.map(function(key) {
    return { key, val: key };
  }) : Object.keys(map2).map(function(key) {
    return { key, val: map2[key] };
  });
}
function isValidMap(map2) {
  return Array.isArray(map2) || isObject(map2);
}
function normalizeNamespace(fn2) {
  return function(namespace, map2) {
    if (typeof namespace !== "string") {
      map2 = namespace;
      namespace = "";
    } else if (namespace.charAt(namespace.length - 1) !== "/") {
      namespace += "/";
    }
    return fn2(namespace, map2);
  };
}
function getModuleByNamespace(store, helper, namespace) {
  var module2 = store._modulesNamespaceMap[namespace];
  if (!module2) {
    console.error("[vuex] module namespace not found in " + helper + "(): " + namespace);
  }
  return module2;
}
const pages = [
  {
    path: "pages/index/index",
    style: {
      navigationBarTitleText: "首页",
      navigationStyle: "custom"
    }
  },
  {
    path: "pages/login/index",
    style: {
      navigationBarTitleText: "登录页面",
      navigationStyle: "custom"
    }
  },
  {
    path: "pages/login/register",
    style: {
      navigationBarTitleText: "注册页面"
    }
  },
  {
    path: "pages/login/forget",
    style: {
      navigationBarTitleText: "忘记密码页面"
    }
  },
  {
    path: "pages/user/index",
    style: {
      navigationBarTitleText: "我的"
    }
  },
  {
    path: "pages/contacts/index",
    style: {
      navigationBarTitleText: "通信录"
    }
  },
  {
    path: "pages/notice/index",
    style: {
      navigationBarTitleText: "消息",
      navigationStyle: "custom"
    }
  },
  {
    path: "pages/functions/index",
    style: {
      navigationBarTitleText: "常用功能"
    }
  },
  {
    path: "pages/opendb-notice/index",
    style: {
      navigationBarTitleText: "公告信息",
      navigationStyle: "custom"
    }
  },
  {
    path: "pages/setting/index",
    style: {
      navigationBarTitleText: "资料修改"
    }
  },
  {
    path: "pages/pwd/update-password",
    style: {
      navigationBarTitleText: "修改密码"
    }
  },
  {
    path: "pages/entry-forms/index",
    style: {
      navigationBarTitleText: "入职登记"
    }
  }
];
const tabBar = {
  color: "#7d7e80",
  selectedColor: "#2979ff",
  backgroundColor: "#ffffff",
  borderStyle: "white",
  list: [
    {
      iconPath: "static/icon_home.png",
      selectedIconPath: "static/icon_home_sel.png",
      pagePath: "pages/index/index",
      text: "首页"
    },
    {
      iconPath: "static/icon_msg.png",
      selectedIconPath: "static/icon_msg_sel.png",
      pagePath: "pages/notice/index",
      text: "消息"
    },
    {
      iconPath: "static/icon_mailList.png",
      selectedIconPath: "static/icon_mailList_sel.png",
      pagePath: "pages/contacts/index",
      text: "通讯录"
    },
    {
      iconPath: "static/icon_user.png",
      selectedIconPath: "static/icon_user_sel.png",
      pagePath: "pages/user/index",
      text: "我的"
    }
  ]
};
const subPackages = [
  {
    root: "pages/workflow",
    pages: [
      {
        path: "application-form/list",
        style: {
          navigationBarTitleText: "我的任务"
        }
      },
      {
        path: "seal/index",
        style: {
          navigationBarTitleText: "用印申请"
        }
      },
      {
        path: "miss-punch-apply/index",
        style: {
          navigationBarTitleText: "签卡申请"
        }
      },
      {
        path: "transfer/index",
        style: {
          navigationBarTitleText: "调动申请"
        }
      },
      {
        path: "recruitment/index",
        style: {
          navigationBarTitleText: "招聘申请"
        }
      },
      {
        path: "leave/index",
        style: {
          navigationBarTitleText: "请假申请"
        }
      },
      {
        path: "overtime/index",
        style: {
          navigationBarTitleText: "加班申请"
        }
      },
      {
        path: "compensatory/index",
        style: {
          navigationBarTitleText: "调休申请"
        }
      },
      {
        path: "business-trip/index",
        style: {
          navigationBarTitleText: "出差申请"
        }
      },
      {
        path: "resignation/index",
        style: {
          navigationBarTitleText: "离职申请"
        }
      },
      {
        path: "loan/index",
        style: {
          navigationBarTitleText: "借款申请"
        }
      },
      {
        path: "reimbursement/index",
        style: {
          navigationBarTitleText: "报销申请"
        }
      },
      {
        path: "work-clothes/index",
        style: {
          navigationBarTitleText: "工衣申请"
        }
      },
      {
        path: "outing/index",
        style: {
          navigationBarTitleText: "外出申请"
        }
      }
    ]
  },
  {
    root: "pages/clockin",
    pages: [
      {
        path: "index",
        style: {
          navigationBarTitleText: "考勤打卡主页",
          enablePullDownRefresh: false
        }
      },
      {
        path: "setting",
        style: {
          navigationBarTitleText: "考勤打卡设置",
          enablePullDownRefresh: true
        }
      },
      {
        path: "setting_edit",
        style: {
          navigationBarTitleText: "考勤打卡设置表",
          enablePullDownRefresh: false
        }
      },
      {
        path: "clockin",
        style: {
          navigationBarTitleText: "考勤打卡",
          enablePullDownRefresh: false
        }
      }
    ]
  },
  {
    root: "pages/payslip",
    pages: [
      {
        path: "index",
        style: {
          navigationBarTitleText: "薪资列表"
        }
      },
      {
        path: "sign",
        style: {
          navigationBarTitleText: "薪资签名"
        }
      }
    ]
  },
  {
    root: "pages_template",
    pages: [
      {
        path: "db-test/db-test",
        style: {
          navigationBarTitleText: "数据库API演示"
        }
      },
      {
        path: "db-test/list/list",
        style: {
          navigationBarTitleText: "列表加载演示"
        }
      },
      {
        path: "uni-id/index/index",
        style: {
          navigationBarTitleText: "【开箱即用】vk-uniCloud-router - 云函数路由模式 - uniCloud开发框架 - 已集成uni-id"
        }
      },
      {
        path: "uni-id/password/password",
        style: {
          navigationBarTitleText: "密码"
        }
      },
      {
        path: "uni-id/mobile/mobile",
        style: {
          navigationBarTitleText: "手机号"
        }
      },
      {
        path: "uni-id/univerify/univerify",
        style: {
          navigationBarTitleText: "APP一键登录"
        }
      },
      {
        path: "uni-id/weixin/weixin",
        style: {
          navigationBarTitleText: "微信"
        }
      },
      {
        path: "uni-id/weixin/h5-weixin",
        style: {
          navigationBarTitleText: "微信公众号"
        }
      },
      {
        path: "uni-id/weixin/set-user-info",
        style: {
          navigationBarTitleText: "设置基础信息"
        }
      },
      {
        path: "uni-id/alipay/alipay",
        style: {
          navigationBarTitleText: "支付宝"
        }
      },
      {
        path: "uni-id/qq/qq",
        style: {
          navigationBarTitleText: "QQ"
        }
      },
      {
        path: "uni-id/util/util",
        style: {
          navigationBarTitleText: "其他"
        }
      },
      {
        path: "uni-id/email/email",
        style: {
          navigationBarTitleText: "邮箱"
        }
      },
      {
        path: "uni-id/login/index/index",
        style: {
          navigationBarTitleText: "登录"
        }
      },
      {
        path: "uni-id/login/register/register",
        style: {
          navigationBarTitleText: "注册"
        }
      },
      {
        path: "uni-id/login/forget/forget",
        style: {
          navigationBarTitleText: "找回密码"
        }
      },
      {
        path: "vk-vuex/vk-vuex",
        style: {
          navigationBarTitleText: "vuex演示示例"
        }
      },
      {
        path: "openapi/weixin/weixin",
        style: {
          navigationBarTitleText: "微信开放平台API"
        }
      },
      {
        path: "openapi/weixin/msgSecCheck/msgSecCheck",
        style: {
          navigationBarTitleText: "文本安全检测"
        }
      },
      {
        path: "openapi/weixin/imgSecCheck/imgSecCheck",
        style: {
          navigationBarTitleText: "图片安全检测"
        }
      },
      {
        path: "openapi/weixin/sendMessage/sendMessage",
        style: {
          navigationBarTitleText: "发送订阅消息"
        }
      },
      {
        path: "openapi/baidu/baidu",
        style: {
          navigationBarTitleText: "百度开放平台API"
        }
      },
      {
        path: "openapi/qq/qq",
        style: {
          navigationBarTitleText: "qq开放接口"
        }
      },
      {
        path: "openapi/qq/msgSecCheck/msgSecCheck",
        style: {}
      },
      {
        path: "openapi/qq/imgSecCheck/imgSecCheck",
        style: {}
      },
      {
        path: "openapi/douyin/douyin",
        style: {
          navigationBarTitleText: "抖音开放接口"
        }
      },
      {
        path: "openapi/douyin/msgSecCheck/msgSecCheck",
        style: {}
      },
      {
        path: "openapi/douyin/imgSecCheck/imgSecCheck",
        style: {}
      },
      {
        path: "openapi/alipay/alipay",
        style: {
          navigationBarTitleText: "支付宝开放接口"
        }
      },
      {
        path: "uni-id/test/test",
        style: {
          navigationStyle: "custom",
          navigationBarTextStyle: "white"
        }
      },
      {
        path: "plugs/lucky-draw/lucky-draw",
        style: {
          navigationBarTitleText: "抽奖活动小助手"
        }
      }
    ]
  }
];
const globalStyle = {
  navigationBarTextStyle: "black",
  navigationBarTitleText: "",
  navigationBarBackgroundColor: "#F8F8F8",
  backgroundColor: "#F8F8F8"
};
const e = {
  pages,
  tabBar,
  subPackages,
  globalStyle
};
var define_process_env_UNI_SECURE_NETWORK_CONFIG_default = [];
function t(e2) {
  return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
}
function n(e2, t2, n2) {
  return e2(n2 = { path: t2, exports: {}, require: function(e3, t3) {
    return function() {
      throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
    }(null == t3 && n2.path);
  } }, n2.exports), n2.exports;
}
var s = n(function(e2, t2) {
  var n2;
  e2.exports = (n2 = n2 || function(e3, t3) {
    var n3 = Object.create || /* @__PURE__ */ function() {
      function e4() {
      }
      return function(t4) {
        var n4;
        return e4.prototype = t4, n4 = new e4(), e4.prototype = null, n4;
      };
    }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e4) {
      var t4 = n3(this);
      return e4 && t4.mixIn(e4), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
        t4.$super.init.apply(this, arguments);
      }), t4.init.prototype = t4, t4.$super = this, t4;
    }, create: function() {
      var e4 = this.extend();
      return e4.init.apply(e4, arguments), e4;
    }, init: function() {
    }, mixIn: function(e4) {
      for (var t4 in e4)
        e4.hasOwnProperty(t4) && (this[t4] = e4[t4]);
      e4.hasOwnProperty("toString") && (this.toString = e4.toString);
    }, clone: function() {
      return this.init.prototype.extend(this);
    } }, o2 = r2.WordArray = i2.extend({ init: function(e4, n4) {
      e4 = this.words = e4 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e4.length;
    }, toString: function(e4) {
      return (e4 || c2).stringify(this);
    }, concat: function(e4) {
      var t4 = this.words, n4 = e4.words, s3 = this.sigBytes, r3 = e4.sigBytes;
      if (this.clamp(), s3 % 4)
        for (var i3 = 0; i3 < r3; i3++) {
          var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
          t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
        }
      else
        for (i3 = 0; i3 < r3; i3 += 4)
          t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
      return this.sigBytes += r3, this;
    }, clamp: function() {
      var t4 = this.words, n4 = this.sigBytes;
      t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e3.ceil(n4 / 4);
    }, clone: function() {
      var e4 = i2.clone.call(this);
      return e4.words = this.words.slice(0), e4;
    }, random: function(t4) {
      for (var n4, s3 = [], r3 = function(t5) {
        t5 = t5;
        var n5 = 987654321, s4 = 4294967295;
        return function() {
          var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
          return r4 /= 4294967296, (r4 += 0.5) * (e3.random() > 0.5 ? 1 : -1);
        };
      }, i3 = 0; i3 < t4; i3 += 4) {
        var a3 = r3(4294967296 * (n4 || e3.random()));
        n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
      }
      return new o2.init(s3, t4);
    } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e4) {
      for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
        var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
        s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
      }
      return s3.join("");
    }, parse: function(e4) {
      for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
        n4[s3 >>> 3] |= parseInt(e4.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
      return new o2.init(n4, t4 / 2);
    } }, u2 = a2.Latin1 = { stringify: function(e4) {
      for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
        var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
        s3.push(String.fromCharCode(i3));
      }
      return s3.join("");
    }, parse: function(e4) {
      for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3++)
        n4[s3 >>> 2] |= (255 & e4.charCodeAt(s3)) << 24 - s3 % 4 * 8;
      return new o2.init(n4, t4);
    } }, h2 = a2.Utf8 = { stringify: function(e4) {
      try {
        return decodeURIComponent(escape(u2.stringify(e4)));
      } catch (e5) {
        throw new Error("Malformed UTF-8 data");
      }
    }, parse: function(e4) {
      return u2.parse(unescape(encodeURIComponent(e4)));
    } }, l2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
      this._data = new o2.init(), this._nDataBytes = 0;
    }, _append: function(e4) {
      "string" == typeof e4 && (e4 = h2.parse(e4)), this._data.concat(e4), this._nDataBytes += e4.sigBytes;
    }, _process: function(t4) {
      var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e3.ceil(a3) : e3.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e3.min(4 * c3, r3);
      if (c3) {
        for (var h3 = 0; h3 < c3; h3 += i3)
          this._doProcessBlock(s3, h3);
        var l3 = s3.splice(0, c3);
        n4.sigBytes -= u3;
      }
      return new o2.init(l3, u3);
    }, clone: function() {
      var e4 = i2.clone.call(this);
      return e4._data = this._data.clone(), e4;
    }, _minBufferSize: 0 });
    r2.Hasher = l2.extend({ cfg: i2.extend(), init: function(e4) {
      this.cfg = this.cfg.extend(e4), this.reset();
    }, reset: function() {
      l2.reset.call(this), this._doReset();
    }, update: function(e4) {
      return this._append(e4), this._process(), this;
    }, finalize: function(e4) {
      return e4 && this._append(e4), this._doFinalize();
    }, blockSize: 16, _createHelper: function(e4) {
      return function(t4, n4) {
        return new e4.init(n4).finalize(t4);
      };
    }, _createHmacHelper: function(e4) {
      return function(t4, n4) {
        return new d2.HMAC.init(e4, n4).finalize(t4);
      };
    } });
    var d2 = s2.algo = {};
    return s2;
  }(Math), n2);
}), r = s, i = (n(function(e2, t2) {
  var n2;
  e2.exports = (n2 = r, function(e3) {
    var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
    !function() {
      for (var t4 = 0; t4 < 64; t4++)
        a2[t4] = 4294967296 * e3.abs(e3.sin(t4 + 1)) | 0;
    }();
    var c2 = o2.MD5 = i2.extend({ _doReset: function() {
      this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
    }, _doProcessBlock: function(e4, t4) {
      for (var n3 = 0; n3 < 16; n3++) {
        var s3 = t4 + n3, r3 = e4[s3];
        e4[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
      }
      var i3 = this._hash.words, o3 = e4[t4 + 0], c3 = e4[t4 + 1], p2 = e4[t4 + 2], f2 = e4[t4 + 3], g2 = e4[t4 + 4], m2 = e4[t4 + 5], y2 = e4[t4 + 6], _2 = e4[t4 + 7], w2 = e4[t4 + 8], v2 = e4[t4 + 9], I2 = e4[t4 + 10], S2 = e4[t4 + 11], b2 = e4[t4 + 12], k2 = e4[t4 + 13], A2 = e4[t4 + 14], T2 = e4[t4 + 15], C2 = i3[0], P2 = i3[1], O2 = i3[2], E2 = i3[3];
      C2 = u2(C2, P2, O2, E2, o3, 7, a2[0]), E2 = u2(E2, C2, P2, O2, c3, 12, a2[1]), O2 = u2(O2, E2, C2, P2, p2, 17, a2[2]), P2 = u2(P2, O2, E2, C2, f2, 22, a2[3]), C2 = u2(C2, P2, O2, E2, g2, 7, a2[4]), E2 = u2(E2, C2, P2, O2, m2, 12, a2[5]), O2 = u2(O2, E2, C2, P2, y2, 17, a2[6]), P2 = u2(P2, O2, E2, C2, _2, 22, a2[7]), C2 = u2(C2, P2, O2, E2, w2, 7, a2[8]), E2 = u2(E2, C2, P2, O2, v2, 12, a2[9]), O2 = u2(O2, E2, C2, P2, I2, 17, a2[10]), P2 = u2(P2, O2, E2, C2, S2, 22, a2[11]), C2 = u2(C2, P2, O2, E2, b2, 7, a2[12]), E2 = u2(E2, C2, P2, O2, k2, 12, a2[13]), O2 = u2(O2, E2, C2, P2, A2, 17, a2[14]), C2 = h2(C2, P2 = u2(P2, O2, E2, C2, T2, 22, a2[15]), O2, E2, c3, 5, a2[16]), E2 = h2(E2, C2, P2, O2, y2, 9, a2[17]), O2 = h2(O2, E2, C2, P2, S2, 14, a2[18]), P2 = h2(P2, O2, E2, C2, o3, 20, a2[19]), C2 = h2(C2, P2, O2, E2, m2, 5, a2[20]), E2 = h2(E2, C2, P2, O2, I2, 9, a2[21]), O2 = h2(O2, E2, C2, P2, T2, 14, a2[22]), P2 = h2(P2, O2, E2, C2, g2, 20, a2[23]), C2 = h2(C2, P2, O2, E2, v2, 5, a2[24]), E2 = h2(E2, C2, P2, O2, A2, 9, a2[25]), O2 = h2(O2, E2, C2, P2, f2, 14, a2[26]), P2 = h2(P2, O2, E2, C2, w2, 20, a2[27]), C2 = h2(C2, P2, O2, E2, k2, 5, a2[28]), E2 = h2(E2, C2, P2, O2, p2, 9, a2[29]), O2 = h2(O2, E2, C2, P2, _2, 14, a2[30]), C2 = l2(C2, P2 = h2(P2, O2, E2, C2, b2, 20, a2[31]), O2, E2, m2, 4, a2[32]), E2 = l2(E2, C2, P2, O2, w2, 11, a2[33]), O2 = l2(O2, E2, C2, P2, S2, 16, a2[34]), P2 = l2(P2, O2, E2, C2, A2, 23, a2[35]), C2 = l2(C2, P2, O2, E2, c3, 4, a2[36]), E2 = l2(E2, C2, P2, O2, g2, 11, a2[37]), O2 = l2(O2, E2, C2, P2, _2, 16, a2[38]), P2 = l2(P2, O2, E2, C2, I2, 23, a2[39]), C2 = l2(C2, P2, O2, E2, k2, 4, a2[40]), E2 = l2(E2, C2, P2, O2, o3, 11, a2[41]), O2 = l2(O2, E2, C2, P2, f2, 16, a2[42]), P2 = l2(P2, O2, E2, C2, y2, 23, a2[43]), C2 = l2(C2, P2, O2, E2, v2, 4, a2[44]), E2 = l2(E2, C2, P2, O2, b2, 11, a2[45]), O2 = l2(O2, E2, C2, P2, T2, 16, a2[46]), C2 = d2(C2, P2 = l2(P2, O2, E2, C2, p2, 23, a2[47]), O2, E2, o3, 6, a2[48]), E2 = d2(E2, C2, P2, O2, _2, 10, a2[49]), O2 = d2(O2, E2, C2, P2, A2, 15, a2[50]), P2 = d2(P2, O2, E2, C2, m2, 21, a2[51]), C2 = d2(C2, P2, O2, E2, b2, 6, a2[52]), E2 = d2(E2, C2, P2, O2, f2, 10, a2[53]), O2 = d2(O2, E2, C2, P2, I2, 15, a2[54]), P2 = d2(P2, O2, E2, C2, c3, 21, a2[55]), C2 = d2(C2, P2, O2, E2, w2, 6, a2[56]), E2 = d2(E2, C2, P2, O2, T2, 10, a2[57]), O2 = d2(O2, E2, C2, P2, y2, 15, a2[58]), P2 = d2(P2, O2, E2, C2, k2, 21, a2[59]), C2 = d2(C2, P2, O2, E2, g2, 6, a2[60]), E2 = d2(E2, C2, P2, O2, S2, 10, a2[61]), O2 = d2(O2, E2, C2, P2, p2, 15, a2[62]), P2 = d2(P2, O2, E2, C2, v2, 21, a2[63]), i3[0] = i3[0] + C2 | 0, i3[1] = i3[1] + P2 | 0, i3[2] = i3[2] + O2 | 0, i3[3] = i3[3] + E2 | 0;
    }, _doFinalize: function() {
      var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
      n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
      var i3 = e3.floor(s3 / 4294967296), o3 = s3;
      n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
      for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
        var h3 = c3[u3];
        c3[u3] = 16711935 & (h3 << 8 | h3 >>> 24) | 4278255360 & (h3 << 24 | h3 >>> 8);
      }
      return a3;
    }, clone: function() {
      var e4 = i2.clone.call(this);
      return e4._hash = this._hash.clone(), e4;
    } });
    function u2(e4, t4, n3, s3, r3, i3, o3) {
      var a3 = e4 + (t4 & n3 | ~t4 & s3) + r3 + o3;
      return (a3 << i3 | a3 >>> 32 - i3) + t4;
    }
    function h2(e4, t4, n3, s3, r3, i3, o3) {
      var a3 = e4 + (t4 & s3 | n3 & ~s3) + r3 + o3;
      return (a3 << i3 | a3 >>> 32 - i3) + t4;
    }
    function l2(e4, t4, n3, s3, r3, i3, o3) {
      var a3 = e4 + (t4 ^ n3 ^ s3) + r3 + o3;
      return (a3 << i3 | a3 >>> 32 - i3) + t4;
    }
    function d2(e4, t4, n3, s3, r3, i3, o3) {
      var a3 = e4 + (n3 ^ (t4 | ~s3)) + r3 + o3;
      return (a3 << i3 | a3 >>> 32 - i3) + t4;
    }
    t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
  }(Math), n2.MD5);
}), n(function(e2, t2) {
  var n2;
  e2.exports = (n2 = r, void function() {
    var e3 = n2, t3 = e3.lib.Base, s2 = e3.enc.Utf8;
    e3.algo.HMAC = t3.extend({ init: function(e4, t4) {
      e4 = this._hasher = new e4.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
      var n3 = e4.blockSize, r2 = 4 * n3;
      t4.sigBytes > r2 && (t4 = e4.finalize(t4)), t4.clamp();
      for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
        a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
      i2.sigBytes = o2.sigBytes = r2, this.reset();
    }, reset: function() {
      var e4 = this._hasher;
      e4.reset(), e4.update(this._iKey);
    }, update: function(e4) {
      return this._hasher.update(e4), this;
    }, finalize: function(e4) {
      var t4 = this._hasher, n3 = t4.finalize(e4);
      return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
    } });
  }());
}), n(function(e2, t2) {
  e2.exports = r.HmacMD5;
})), o = n(function(e2, t2) {
  e2.exports = r.enc.Utf8;
}), a = n(function(e2, t2) {
  var n2;
  e2.exports = (n2 = r, function() {
    var e3 = n2, t3 = e3.lib.WordArray;
    function s2(e4, n3, s3) {
      for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
        if (o2 % 4) {
          var a2 = s3[e4.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e4.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
          r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
        }
      return t3.create(r2, i2);
    }
    e3.enc.Base64 = { stringify: function(e4) {
      var t4 = e4.words, n3 = e4.sigBytes, s3 = this._map;
      e4.clamp();
      for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
        for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
          r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
      var c2 = s3.charAt(64);
      if (c2)
        for (; r2.length % 4; )
          r2.push(c2);
      return r2.join("");
    }, parse: function(e4) {
      var t4 = e4.length, n3 = this._map, r2 = this._reverseMap;
      if (!r2) {
        r2 = this._reverseMap = [];
        for (var i2 = 0; i2 < n3.length; i2++)
          r2[n3.charCodeAt(i2)] = i2;
      }
      var o2 = n3.charAt(64);
      if (o2) {
        var a2 = e4.indexOf(o2);
        -1 !== a2 && (t4 = a2);
      }
      return s2(e4, t4, r2);
    }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
  }(), n2.enc.Base64);
});
const c = "FUNCTION", u = "OBJECT", h = "CLIENT_DB", l = "pending", d = "fulfilled", p = "rejected";
function f(e2) {
  return Object.prototype.toString.call(e2).slice(8, -1).toLowerCase();
}
function g(e2) {
  return "object" === f(e2);
}
function m(e2) {
  return "function" == typeof e2;
}
function y(e2) {
  return function() {
    try {
      return e2.apply(e2, arguments);
    } catch (e3) {
      console.error(e3);
    }
  };
}
const _ = "REJECTED", w = "NOT_PENDING";
class v {
  constructor({ createPromise: e2, retryRule: t2 = _ } = {}) {
    this.createPromise = e2, this.status = null, this.promise = null, this.retryRule = t2;
  }
  get needRetry() {
    if (!this.status)
      return true;
    switch (this.retryRule) {
      case _:
        return this.status === p;
      case w:
        return this.status !== l;
    }
  }
  exec() {
    return this.needRetry ? (this.status = l, this.promise = this.createPromise().then((e2) => (this.status = d, Promise.resolve(e2)), (e2) => (this.status = p, Promise.reject(e2))), this.promise) : this.promise;
  }
}
function I(e2) {
  return e2 && "string" == typeof e2 ? JSON.parse(e2) : e2;
}
const S = true, b = "mp-weixin", A = I(define_process_env_UNI_SECURE_NETWORK_CONFIG_default), T = b, C = I('{"address":["127.0.0.1","192.168.82.44"],"servePort":7001,"debugPort":9001,"initialLaunchType":"remote","skipFiles":["<node_internals>/**","E:/HBuilderX/plugins/unicloud/**/*.js"]}'), P = I('[{"provider":"aliyun","spaceName":"tdh-db","spaceId":"mp-172c1e9f-d637-4510-916b-3f73d0c2de3c","clientSecret":"B1vi2KWj85GiOkR32fR9cA==","endpoint":"https://api.next.bspapp.com","failoverEndpoint":""}]') || [];
let E = "";
try {
  E = "__UNI__ABE8DE0";
} catch (e2) {
}
let L = {};
function R(e2, t2 = {}) {
  var n2, s2;
  return n2 = L, s2 = e2, Object.prototype.hasOwnProperty.call(n2, s2) || (L[e2] = t2), L[e2];
}
const N = ["invoke", "success", "fail", "complete"], D = R("_globalUniCloudInterceptor");
function M(e2, t2) {
  D[e2] || (D[e2] = {}), g(t2) && Object.keys(t2).forEach((n2) => {
    N.indexOf(n2) > -1 && function(e3, t3, n3) {
      let s2 = D[e3][t3];
      s2 || (s2 = D[e3][t3] = []), -1 === s2.indexOf(n3) && m(n3) && s2.push(n3);
    }(e2, n2, t2[n2]);
  });
}
function q(e2, t2) {
  D[e2] || (D[e2] = {}), g(t2) ? Object.keys(t2).forEach((n2) => {
    N.indexOf(n2) > -1 && function(e3, t3, n3) {
      const s2 = D[e3][t3];
      if (!s2)
        return;
      const r2 = s2.indexOf(n3);
      r2 > -1 && s2.splice(r2, 1);
    }(e2, n2, t2[n2]);
  }) : delete D[e2];
}
function F(e2, t2) {
  return e2 && 0 !== e2.length ? e2.reduce((e3, n2) => e3.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
}
function K(e2, t2) {
  return D[e2] && D[e2][t2] || [];
}
function j(e2) {
  M("callObject", e2);
}
const $ = R("_globalUniCloudListener"), B = "response", W = "needLogin", H = "refreshToken", J = "failover", z = "clientdb", V = "cloudfunction", G = "cloudobject";
function Q(e2) {
  return $[e2] || ($[e2] = []), $[e2];
}
function Y(e2, t2) {
  const n2 = Q(e2);
  n2.includes(t2) || n2.push(t2);
}
function X(e2, t2) {
  const n2 = Q(e2), s2 = n2.indexOf(t2);
  -1 !== s2 && n2.splice(s2, 1);
}
function Z(e2, t2) {
  const n2 = Q(e2);
  for (let e3 = 0; e3 < n2.length; e3++) {
    (0, n2[e3])(t2);
  }
}
let ee, te = false;
function ne() {
  return ee || (ee = new Promise((e2) => {
    te && e2(), function t2() {
      if ("function" == typeof getCurrentPages) {
        const t3 = getCurrentPages();
        t3 && t3[0] && (te = true, e2());
      }
      te || setTimeout(() => {
        t2();
      }, 30);
    }();
  }), ee);
}
function se(e2) {
  const t2 = {};
  for (const n2 in e2) {
    const s2 = e2[n2];
    m(s2) && (t2[n2] = y(s2));
  }
  return t2;
}
class re extends Error {
  constructor(e2) {
    const t2 = e2.message || e2.errMsg || "unknown system error";
    super(t2), this.errMsg = t2, this.code = this.errCode = e2.code || e2.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e2.subject || e2.errSubject, this.cause = e2.cause, this.requestId = e2.requestId;
  }
  toJson(e2 = 0) {
    if (!(e2 >= 10))
      return e2++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e2) : this.cause };
  }
}
var ie = { request: (e2) => index.request(e2), uploadFile: (e2) => index.uploadFile(e2), setStorageSync: (e2, t2) => index.setStorageSync(e2, t2), getStorageSync: (e2) => index.getStorageSync(e2), removeStorageSync: (e2) => index.removeStorageSync(e2), clearStorageSync: () => index.clearStorageSync(), connectSocket: (e2) => index.connectSocket(e2) };
function oe(e2) {
  return e2 && oe(e2.__v_raw) || e2;
}
function ae() {
  return { token: ie.getStorageSync("uni_id_token") || ie.getStorageSync("uniIdToken"), tokenExpired: ie.getStorageSync("uni_id_token_expired") };
}
function ce({ token: e2, tokenExpired: t2 } = {}) {
  e2 && ie.setStorageSync("uni_id_token", e2), t2 && ie.setStorageSync("uni_id_token_expired", t2);
}
let ue, he;
function le() {
  return ue || (ue = wx$1.canIUse("getAppBaseInfo") && wx$1.canIUse("getDeviceInfo") ? { ...index.getAppBaseInfo(), ...index.getDeviceInfo() } : index.getSystemInfoSync()), ue;
}
function de() {
  let e2, t2;
  try {
    if (index.getLaunchOptionsSync) {
      if (index.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
        return;
      const { scene: n2, channel: s2 } = index.getLaunchOptionsSync();
      e2 = s2, t2 = n2;
    }
  } catch (e3) {
  }
  return { channel: e2, scene: t2 };
}
let pe = {};
function fe() {
  const e2 = index.getLocale && index.getLocale() || "en";
  if (he)
    return { ...pe, ...he, locale: e2, LOCALE: e2 };
  const t2 = le(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["appId", "appLanguage", "appName", "appVersion", "appVersionCode", "appWgtVersion", "browserName", "browserVersion", "deviceBrand", "deviceId", "deviceModel", "deviceType", "osName", "osVersion", "romName", "romVersion", "ua", "hostName", "hostVersion", "uniPlatform", "uniRuntimeVersion", "uniRuntimeVersionCode", "uniCompilerVersion", "uniCompilerVersionCode"];
  for (const e3 in t2)
    Object.hasOwnProperty.call(t2, e3) && -1 === o2.indexOf(e3) && delete t2[e3];
  return he = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...de(), ...t2 }, { ...pe, ...he, locale: e2, LOCALE: e2 };
}
var ge = { sign: function(e2, t2) {
  let n2 = "";
  return Object.keys(e2).sort().forEach(function(t3) {
    e2[t3] && (n2 = n2 + "&" + t3 + "=" + e2[t3]);
  }), n2 = n2.slice(1), i(n2, t2).toString();
}, wrappedRequest: function(e2, t2) {
  return new Promise((n2, s2) => {
    t2(Object.assign(e2, { complete(e3) {
      e3 || (e3 = {});
      const t3 = e3.data && e3.data.header && e3.data.header["x-serverless-request-id"] || e3.header && e3.header["request-id"];
      if (!e3.statusCode || e3.statusCode >= 400) {
        const n3 = e3.data && e3.data.error && e3.data.error.code || "SYS_ERR", r3 = e3.data && e3.data.error && e3.data.error.message || e3.errMsg || "request:fail";
        return s2(new re({ code: n3, message: r3, requestId: t3 }));
      }
      const r2 = e3.data;
      if (r2.error)
        return s2(new re({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
      r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
    } }));
  });
}, toBase64: function(e2) {
  return a.stringify(o.parse(e2));
} };
var me = class {
  constructor(e2) {
    ["spaceId", "clientSecret"].forEach((t2) => {
      if (!Object.prototype.hasOwnProperty.call(e2, t2))
        throw new Error(`${t2} required`);
    }), this.config = Object.assign({}, { endpoint: 0 === e2.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e2), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = ie, this._getAccessTokenPromiseHub = new v({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e3) => {
      if (!e3.result || !e3.result.accessToken)
        throw new re({ code: "AUTH_FAILED", message: "获取accessToken失败" });
      this.setAccessToken(e3.result.accessToken);
    }), retryRule: w });
  }
  get hasAccessToken() {
    return !!this.accessToken;
  }
  setAccessToken(e2) {
    this.accessToken = e2;
  }
  requestWrapped(e2) {
    return ge.wrappedRequest(e2, this.adapter.request);
  }
  requestAuth(e2) {
    return this.requestWrapped(e2);
  }
  request(e2, t2) {
    return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e2) : this.requestWrapped(e2).catch((t3) => new Promise((e3, n2) => {
      !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e3();
    }).then(() => this.getAccessToken()).then(() => {
      const t4 = this.rebuildRequest(e2);
      return this.request(t4, true);
    })) : this.getAccessToken().then(() => {
      const t3 = this.rebuildRequest(e2);
      return this.request(t3, true);
    }));
  }
  rebuildRequest(e2) {
    const t2 = Object.assign({}, e2);
    return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = ge.sign(t2.data, this.config.clientSecret), t2;
  }
  setupRequest(e2, t2) {
    const n2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
    return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = ge.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
  }
  getAccessToken() {
    return this._getAccessTokenPromiseHub.exec();
  }
  async authorize() {
    await this.getAccessToken();
  }
  callFunction(e2) {
    const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
    return this.request({ ...this.setupRequest(t2), timeout: e2.timeout });
  }
  getOSSUploadOptionsFromPath(e2) {
    const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
    return this.request(this.setupRequest(t2));
  }
  uploadFileToOSS({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
    return new Promise((o2, a2) => {
      const c2 = this.adapter.uploadFile({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e3) {
        e3 && e3.statusCode < 400 ? o2(e3) : a2(new re({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }, fail(e3) {
        a2(new re({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
      } });
      "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
        i2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
      });
    });
  }
  reportOSSUpload(e2) {
    const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
    return this.request(this.setupRequest(t2));
  }
  async uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", cloudPathAsRealPath: s2 = false, onUploadProgress: r2, config: i2 }) {
    if ("string" !== f(t2))
      throw new re({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
    if (!(t2 = t2.trim()))
      throw new re({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
    if (/:\/\//.test(t2))
      throw new re({ code: "INVALID_PARAM", message: "cloudPath不合法" });
    const o2 = i2 && i2.envType || this.config.envType;
    if (s2 && ("/" !== t2[0] && (t2 = "/" + t2), t2.indexOf("\\") > -1))
      throw new re({ code: "INVALID_PARAM", message: "使用cloudPath作为路径时，cloudPath不可包含“\\”" });
    const a2 = (await this.getOSSUploadOptionsFromPath({ env: o2, filename: s2 ? t2.split("/").pop() : t2, fileId: s2 ? t2 : void 0 })).result, c2 = "https://" + a2.cdnDomain + "/" + a2.ossPath, { securityToken: u2, accessKeyId: h2, signature: l2, host: d2, ossPath: p2, id: g2, policy: m2, ossCallbackUrl: y2 } = a2, _2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: h2, Signature: l2, host: d2, id: g2, key: p2, policy: m2, success_action_status: 200 };
    if (u2 && (_2["x-oss-security-token"] = u2), y2) {
      const e3 = JSON.stringify({ callbackUrl: y2, callbackBody: JSON.stringify({ fileId: g2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
      _2.callback = ge.toBase64(e3);
    }
    const w2 = { url: "https://" + a2.host, formData: _2, fileName: "file", name: "file", filePath: e2, fileType: n2 };
    if (await this.uploadFileToOSS(Object.assign({}, w2, { onUploadProgress: r2 })), y2)
      return { success: true, filePath: e2, fileID: c2 };
    if ((await this.reportOSSUpload({ id: g2 })).success)
      return { success: true, filePath: e2, fileID: c2 };
    throw new re({ code: "UPLOAD_FAILED", message: "文件上传失败" });
  }
  getTempFileURL({ fileList: e2 } = {}) {
    return new Promise((t2, n2) => {
      Array.isArray(e2) && 0 !== e2.length || n2(new re({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), this.getFileInfo({ fileList: e2 }).then((n3) => {
        t2({ fileList: e2.map((e3, t3) => {
          const s2 = n3.fileList[t3];
          return { fileID: e3, tempFileURL: s2 && s2.url || e3 };
        }) });
      });
    });
  }
  async getFileInfo({ fileList: e2 } = {}) {
    if (!Array.isArray(e2) || 0 === e2.length)
      throw new re({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
    const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e2.map((e3) => e3.split("?")[0]).join(",") }) };
    return { fileList: (await this.request(this.setupRequest(t2))).result };
  }
};
var ye = { init(e2) {
  const t2 = new me(e2), n2 = { signInAnonymously: function() {
    return t2.authorize();
  }, getLoginState: function() {
    return Promise.resolve(false);
  } };
  return t2.auth = function() {
    return n2;
  }, t2.customAuth = t2.auth, t2;
} };
const _e = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
var we;
!function(e2) {
  e2.local = "local", e2.none = "none", e2.session = "session";
}(we || (we = {}));
var ve = function() {
}, Ie = n(function(e2, t2) {
  var n2;
  e2.exports = (n2 = r, function(e3) {
    var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [], c2 = [];
    !function() {
      function t4(t5) {
        for (var n4 = e3.sqrt(t5), s4 = 2; s4 <= n4; s4++)
          if (!(t5 % s4))
            return false;
        return true;
      }
      function n3(e4) {
        return 4294967296 * (e4 - (0 | e4)) | 0;
      }
      for (var s3 = 2, r3 = 0; r3 < 64; )
        t4(s3) && (r3 < 8 && (a2[r3] = n3(e3.pow(s3, 0.5))), c2[r3] = n3(e3.pow(s3, 1 / 3)), r3++), s3++;
    }();
    var u2 = [], h2 = o2.SHA256 = i2.extend({ _doReset: function() {
      this._hash = new r2.init(a2.slice(0));
    }, _doProcessBlock: function(e4, t4) {
      for (var n3 = this._hash.words, s3 = n3[0], r3 = n3[1], i3 = n3[2], o3 = n3[3], a3 = n3[4], h3 = n3[5], l2 = n3[6], d2 = n3[7], p2 = 0; p2 < 64; p2++) {
        if (p2 < 16)
          u2[p2] = 0 | e4[t4 + p2];
        else {
          var f2 = u2[p2 - 15], g2 = (f2 << 25 | f2 >>> 7) ^ (f2 << 14 | f2 >>> 18) ^ f2 >>> 3, m2 = u2[p2 - 2], y2 = (m2 << 15 | m2 >>> 17) ^ (m2 << 13 | m2 >>> 19) ^ m2 >>> 10;
          u2[p2] = g2 + u2[p2 - 7] + y2 + u2[p2 - 16];
        }
        var _2 = s3 & r3 ^ s3 & i3 ^ r3 & i3, w2 = (s3 << 30 | s3 >>> 2) ^ (s3 << 19 | s3 >>> 13) ^ (s3 << 10 | s3 >>> 22), v2 = d2 + ((a3 << 26 | a3 >>> 6) ^ (a3 << 21 | a3 >>> 11) ^ (a3 << 7 | a3 >>> 25)) + (a3 & h3 ^ ~a3 & l2) + c2[p2] + u2[p2];
        d2 = l2, l2 = h3, h3 = a3, a3 = o3 + v2 | 0, o3 = i3, i3 = r3, r3 = s3, s3 = v2 + (w2 + _2) | 0;
      }
      n3[0] = n3[0] + s3 | 0, n3[1] = n3[1] + r3 | 0, n3[2] = n3[2] + i3 | 0, n3[3] = n3[3] + o3 | 0, n3[4] = n3[4] + a3 | 0, n3[5] = n3[5] + h3 | 0, n3[6] = n3[6] + l2 | 0, n3[7] = n3[7] + d2 | 0;
    }, _doFinalize: function() {
      var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
      return n3[r3 >>> 5] |= 128 << 24 - r3 % 32, n3[14 + (r3 + 64 >>> 9 << 4)] = e3.floor(s3 / 4294967296), n3[15 + (r3 + 64 >>> 9 << 4)] = s3, t4.sigBytes = 4 * n3.length, this._process(), this._hash;
    }, clone: function() {
      var e4 = i2.clone.call(this);
      return e4._hash = this._hash.clone(), e4;
    } });
    t3.SHA256 = i2._createHelper(h2), t3.HmacSHA256 = i2._createHmacHelper(h2);
  }(Math), n2.SHA256);
}), Se = Ie, be = n(function(e2, t2) {
  e2.exports = r.HmacSHA256;
});
const ke = () => {
  let e2;
  if (!Promise) {
    e2 = () => {
    }, e2.promise = {};
    const t3 = () => {
      throw new re({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
    };
    return Object.defineProperty(e2.promise, "then", { get: t3 }), Object.defineProperty(e2.promise, "catch", { get: t3 }), e2;
  }
  const t2 = new Promise((t3, n2) => {
    e2 = (e3, s2) => e3 ? n2(e3) : t3(s2);
  });
  return e2.promise = t2, e2;
};
function Ae(e2) {
  return void 0 === e2;
}
function Te(e2) {
  return "[object Null]" === Object.prototype.toString.call(e2);
}
function Ce(e2 = "") {
  return e2.replace(/([\s\S]+)\s+(请前往云开发AI小助手查看问题：.*)/, "$1");
}
function Pe(e2 = 32) {
  const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n2 = t2.length;
  let s2 = "";
  for (let r2 = 0; r2 < e2; r2++)
    s2 += t2.charAt(Math.floor(Math.random() * n2));
  return s2;
}
var Oe;
function Ee(e2) {
  const t2 = (n2 = e2, "[object Array]" === Object.prototype.toString.call(n2) ? e2 : [e2]);
  var n2;
  for (const e3 of t2) {
    const { isMatch: t3, genAdapter: n3, runtime: s2 } = e3;
    if (t3())
      return { adapter: n3(), runtime: s2 };
  }
}
!function(e2) {
  e2.WEB = "web", e2.WX_MP = "wx_mp";
}(Oe || (Oe = {}));
const xe = { adapter: null, runtime: void 0 }, Le = ["anonymousUuidKey"];
class Re extends ve {
  constructor() {
    super(), xe.adapter.root.tcbObject || (xe.adapter.root.tcbObject = {});
  }
  setItem(e2, t2) {
    xe.adapter.root.tcbObject[e2] = t2;
  }
  getItem(e2) {
    return xe.adapter.root.tcbObject[e2];
  }
  removeItem(e2) {
    delete xe.adapter.root.tcbObject[e2];
  }
  clear() {
    delete xe.adapter.root.tcbObject;
  }
}
function Ue(e2, t2) {
  switch (e2) {
    case "local":
      return t2.localStorage || new Re();
    case "none":
      return new Re();
    default:
      return t2.sessionStorage || new Re();
  }
}
class Ne {
  constructor(e2) {
    if (!this._storage) {
      this._persistence = xe.adapter.primaryStorage || e2.persistence, this._storage = Ue(this._persistence, xe.adapter);
      const t2 = `access_token_${e2.env}`, n2 = `access_token_expire_${e2.env}`, s2 = `refresh_token_${e2.env}`, r2 = `anonymous_uuid_${e2.env}`, i2 = `login_type_${e2.env}`, o2 = "device_id", a2 = `token_type_${e2.env}`, c2 = `user_info_${e2.env}`;
      this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: c2, deviceIdKey: o2, tokenTypeKey: a2 };
    }
  }
  updatePersistence(e2) {
    if (e2 === this._persistence)
      return;
    const t2 = "local" === this._persistence;
    this._persistence = e2;
    const n2 = Ue(e2, xe.adapter);
    for (const e3 in this.keys) {
      const s2 = this.keys[e3];
      if (t2 && Le.includes(e3))
        continue;
      const r2 = this._storage.getItem(s2);
      Ae(r2) || Te(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
    }
    this._storage = n2;
  }
  setStore(e2, t2, n2) {
    if (!this._storage)
      return;
    const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
    try {
      this._storage.setItem(e2, r2);
    } catch (e3) {
      throw e3;
    }
  }
  getStore(e2, t2) {
    try {
      if (!this._storage)
        return;
    } catch (e3) {
      return "";
    }
    t2 = t2 || "localCachev1";
    const n2 = this._storage.getItem(e2);
    if (!n2)
      return "";
    if (n2.indexOf(t2) >= 0) {
      return JSON.parse(n2).content;
    }
    return "";
  }
  removeStore(e2) {
    this._storage.removeItem(e2);
  }
}
const De = {}, Me = {};
function qe(e2) {
  return De[e2];
}
class Fe {
  constructor(e2, t2) {
    this.data = t2 || null, this.name = e2;
  }
}
class Ke extends Fe {
  constructor(e2, t2) {
    super("error", { error: e2, data: t2 }), this.error = e2;
  }
}
const je = new class {
  constructor() {
    this._listeners = {};
  }
  on(e2, t2) {
    return function(e3, t3, n2) {
      n2[e3] = n2[e3] || [], n2[e3].push(t3);
    }(e2, t2, this._listeners), this;
  }
  off(e2, t2) {
    return function(e3, t3, n2) {
      if (n2 && n2[e3]) {
        const s2 = n2[e3].indexOf(t3);
        -1 !== s2 && n2[e3].splice(s2, 1);
      }
    }(e2, t2, this._listeners), this;
  }
  fire(e2, t2) {
    if (e2 instanceof Ke)
      return console.error(e2.error), this;
    const n2 = "string" == typeof e2 ? new Fe(e2, t2 || {}) : e2;
    const s2 = n2.name;
    if (this._listens(s2)) {
      n2.target = this;
      const e3 = this._listeners[s2] ? [...this._listeners[s2]] : [];
      for (const t3 of e3)
        t3.call(this, n2);
    }
    return this;
  }
  _listens(e2) {
    return this._listeners[e2] && this._listeners[e2].length > 0;
  }
}();
function $e(e2, t2) {
  je.on(e2, t2);
}
function Be(e2, t2 = {}) {
  je.fire(e2, t2);
}
function We(e2, t2) {
  je.off(e2, t2);
}
const He = "loginStateChanged", Je = "loginStateExpire", ze = "loginTypeChanged", Ve = "anonymousConverted", Ge = "refreshAccessToken";
var Qe;
!function(e2) {
  e2.ANONYMOUS = "ANONYMOUS", e2.WECHAT = "WECHAT", e2.WECHAT_PUBLIC = "WECHAT-PUBLIC", e2.WECHAT_OPEN = "WECHAT-OPEN", e2.CUSTOM = "CUSTOM", e2.EMAIL = "EMAIL", e2.USERNAME = "USERNAME", e2.NULL = "NULL";
}(Qe || (Qe = {}));
class Ye {
  constructor() {
    this._fnPromiseMap = /* @__PURE__ */ new Map();
  }
  async run(e2, t2) {
    let n2 = this._fnPromiseMap.get(e2);
    return n2 || (n2 = new Promise(async (n3, s2) => {
      try {
        await this._runIdlePromise();
        const s3 = t2();
        n3(await s3);
      } catch (e3) {
        s2(e3);
      } finally {
        this._fnPromiseMap.delete(e2);
      }
    }), this._fnPromiseMap.set(e2, n2)), n2;
  }
  _runIdlePromise() {
    return Promise.resolve();
  }
}
class Xe {
  constructor(e2) {
    this._singlePromise = new Ye(), this._cache = qe(e2.env), this._baseURL = `https://${e2.env}.ap-shanghai.tcb-api.tencentcloudapi.com`, this._reqClass = new xe.adapter.reqClass({ timeout: e2.timeout, timeoutMsg: `请求在${e2.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] });
  }
  _getDeviceId() {
    if (this._deviceID)
      return this._deviceID;
    const { deviceIdKey: e2 } = this._cache.keys;
    let t2 = this._cache.getStore(e2);
    return "string" == typeof t2 && t2.length >= 16 && t2.length <= 48 || (t2 = Pe(), this._cache.setStore(e2, t2)), this._deviceID = t2, t2;
  }
  async _request(e2, t2, n2 = {}) {
    const s2 = { "x-request-id": Pe(), "x-device-id": this._getDeviceId() };
    if (n2.withAccessToken) {
      const { tokenTypeKey: e3 } = this._cache.keys, t3 = await this.getAccessToken(), n3 = this._cache.getStore(e3);
      s2.authorization = `${n3} ${t3}`;
    }
    return this._reqClass["get" === n2.method ? "get" : "post"]({ url: `${this._baseURL}${e2}`, data: t2, headers: s2 });
  }
  async _fetchAccessToken() {
    const { loginTypeKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2, tokenTypeKey: s2 } = this._cache.keys, r2 = this._cache.getStore(e2);
    if (r2 && r2 !== Qe.ANONYMOUS)
      throw new re({ code: "INVALID_OPERATION", message: "非匿名登录不支持刷新 access token" });
    const i2 = await this._singlePromise.run("fetchAccessToken", async () => (await this._request("/auth/v1/signin/anonymously", {}, { method: "post" })).data), { access_token: o2, expires_in: a2, token_type: c2 } = i2;
    return this._cache.setStore(s2, c2), this._cache.setStore(t2, o2), this._cache.setStore(n2, Date.now() + 1e3 * a2), o2;
  }
  isAccessTokenExpired(e2, t2) {
    let n2 = true;
    return e2 && t2 && (n2 = t2 < Date.now()), n2;
  }
  async getAccessToken() {
    const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
    return this.isAccessTokenExpired(n2, s2) ? this._fetchAccessToken() : n2;
  }
  async refreshAccessToken() {
    const { accessTokenKey: e2, accessTokenExpireKey: t2, loginTypeKey: n2 } = this._cache.keys;
    return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.setStore(n2, Qe.ANONYMOUS), this.getAccessToken();
  }
  async getUserInfo() {
    return this._singlePromise.run("getUserInfo", async () => (await this._request("/auth/v1/user/me", {}, { withAccessToken: true, method: "get" })).data);
  }
}
const Ze = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], et = { "X-SDK-Version": "1.3.5" };
function tt$1(e2, t2, n2) {
  const s2 = e2[t2];
  e2[t2] = function(t3) {
    const r2 = {}, i2 = {};
    n2.forEach((n3) => {
      const { data: s3, headers: o3 } = n3.call(e2, t3);
      Object.assign(r2, s3), Object.assign(i2, o3);
    });
    const o2 = t3.data;
    return o2 && (() => {
      var e3;
      if (e3 = o2, "[object FormData]" !== Object.prototype.toString.call(e3))
        t3.data = { ...o2, ...r2 };
      else
        for (const e4 in r2)
          o2.append(e4, r2[e4]);
    })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e2, t3);
  };
}
function nt() {
  const e2 = Math.random().toString(16).slice(2);
  return { data: { seqId: e2 }, headers: { ...et, "x-seqid": e2 } };
}
class st {
  constructor(e2 = {}) {
    var t2;
    this.config = e2, this._reqClass = new xe.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = qe(this.config.env), this._localCache = (t2 = this.config.env, Me[t2]), this.oauth = new Xe(this.config), tt$1(this._reqClass, "post", [nt]), tt$1(this._reqClass, "upload", [nt]), tt$1(this._reqClass, "download", [nt]);
  }
  async post(e2) {
    return await this._reqClass.post(e2);
  }
  async upload(e2) {
    return await this._reqClass.upload(e2);
  }
  async download(e2) {
    return await this._reqClass.download(e2);
  }
  async refreshAccessToken() {
    let e2, t2;
    this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
    try {
      e2 = await this._refreshAccessTokenPromise;
    } catch (e3) {
      t2 = e3;
    }
    if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
      throw t2;
    return e2;
  }
  async _refreshAccessToken() {
    const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
    this._cache.removeStore(e2), this._cache.removeStore(t2);
    let i2 = this._cache.getStore(n2);
    if (!i2)
      throw new re({ message: "未登录CloudBase" });
    const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
    if (a2.data.code) {
      const { code: e3 } = a2.data;
      if ("SIGN_PARAM_INVALID" === e3 || "REFRESH_TOKEN_EXPIRED" === e3 || "INVALID_REFRESH_TOKEN" === e3) {
        if (this._cache.getStore(s2) === Qe.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e3) {
          const e4 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e4, refresh_token: t3 });
          return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
        }
        Be(Je), this._cache.removeStore(n2);
      }
      throw new re({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
    }
    if (a2.data.access_token)
      return Be(Ge), this._cache.setStore(e2, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
    a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
  }
  async getAccessToken() {
    const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
    if (!this._cache.getStore(n2))
      throw new re({ message: "refresh token不存在，登录状态异常" });
    let s2 = this._cache.getStore(e2), r2 = this._cache.getStore(t2), i2 = true;
    return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
  }
  async request(e2, t2, n2) {
    const s2 = `x-tcb-trace_${this.config.env}`;
    let r2 = "application/x-www-form-urlencoded";
    const i2 = { action: e2, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
    let o2;
    if (-1 === Ze.indexOf(e2) && (this._cache.keys, i2.access_token = await this.oauth.getAccessToken()), "storage.uploadFile" === e2) {
      o2 = new FormData();
      for (let e3 in o2)
        o2.hasOwnProperty(e3) && void 0 !== o2[e3] && o2.append(e3, i2[e3]);
      r2 = "multipart/form-data";
    } else {
      r2 = "application/json", o2 = {};
      for (let e3 in i2)
        void 0 !== i2[e3] && (o2[e3] = i2[e3]);
    }
    let a2 = { headers: { "content-type": r2 } };
    n2 && n2.timeout && (a2.timeout = n2.timeout), n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
    const c2 = this._localCache.getStore(s2);
    c2 && (a2.headers["X-TCB-Trace"] = c2);
    const { parse: u2, inQuery: h2, search: l2 } = t2;
    let d2 = { env: this.config.env };
    u2 && (d2.parse = true), h2 && (d2 = { ...h2, ...d2 });
    let p2 = function(e3, t3, n3 = {}) {
      const s3 = /\?/.test(t3);
      let r3 = "";
      for (let e4 in n3)
        "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e4}=${encodeURIComponent(n3[e4])}`;
      return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e3}${t3}`;
    }(_e, "//tcb-api.tencentcloudapi.com/web", d2);
    l2 && (p2 += l2);
    const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
    if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
      throw new re({ code: "NETWORK_ERROR", message: "network request error" });
    return f2;
  }
  async send(e2, t2 = {}, n2 = {}) {
    const s2 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
    if (("ACCESS_TOKEN_DISABLED" === s2.data.code || "ACCESS_TOKEN_EXPIRED" === s2.data.code) && -1 === Ze.indexOf(e2)) {
      await this.oauth.refreshAccessToken();
      const s3 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
      if (s3.data.code)
        throw new re({ code: s3.data.code, message: Ce(s3.data.message) });
      return s3.data;
    }
    if (s2.data.code)
      throw new re({ code: s2.data.code, message: Ce(s2.data.message) });
    return s2.data;
  }
  setRefreshToken(e2) {
    const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
    this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
  }
}
const rt = {};
function it(e2) {
  return rt[e2];
}
class ot {
  constructor(e2) {
    this.config = e2, this._cache = qe(e2.env), this._request = it(e2.env);
  }
  setRefreshToken(e2) {
    const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
    this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
  }
  setAccessToken(e2, t2) {
    const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
    this._cache.setStore(n2, e2), this._cache.setStore(s2, t2);
  }
  async refreshUserInfo() {
    const { data: e2 } = await this._request.send("auth.getUserInfo", {});
    return this.setLocalUserInfo(e2), e2;
  }
  setLocalUserInfo(e2) {
    const { userInfoKey: t2 } = this._cache.keys;
    this._cache.setStore(t2, e2);
  }
}
class at {
  constructor(e2) {
    if (!e2)
      throw new re({ code: "PARAM_ERROR", message: "envId is not defined" });
    this._envId = e2, this._cache = qe(this._envId), this._request = it(this._envId), this.setUserInfo();
  }
  linkWithTicket(e2) {
    if ("string" != typeof e2)
      throw new re({ code: "PARAM_ERROR", message: "ticket must be string" });
    return this._request.send("auth.linkWithTicket", { ticket: e2 });
  }
  linkWithRedirect(e2) {
    e2.signInWithRedirect();
  }
  updatePassword(e2, t2) {
    return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e2 });
  }
  updateEmail(e2) {
    return this._request.send("auth.updateEmail", { newEmail: e2 });
  }
  updateUsername(e2) {
    if ("string" != typeof e2)
      throw new re({ code: "PARAM_ERROR", message: "username must be a string" });
    return this._request.send("auth.updateUsername", { username: e2 });
  }
  async getLinkedUidList() {
    const { data: e2 } = await this._request.send("auth.getLinkedUidList", {});
    let t2 = false;
    const { users: n2 } = e2;
    return n2.forEach((e3) => {
      e3.wxOpenId && e3.wxPublicId && (t2 = true);
    }), { users: n2, hasPrimaryUid: t2 };
  }
  setPrimaryUid(e2) {
    return this._request.send("auth.setPrimaryUid", { uid: e2 });
  }
  unlink(e2) {
    return this._request.send("auth.unlink", { platform: e2 });
  }
  async update(e2) {
    const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e2, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
    this.setLocalUserInfo(a2);
  }
  async refresh() {
    const e2 = await this._request.oauth.getUserInfo();
    return this.setLocalUserInfo(e2), e2;
  }
  setUserInfo() {
    const { userInfoKey: e2 } = this._cache.keys, t2 = this._cache.getStore(e2);
    ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e3) => {
      this[e3] = t2[e3];
    }), this.location = { country: t2.country, province: t2.province, city: t2.city };
  }
  setLocalUserInfo(e2) {
    const { userInfoKey: t2 } = this._cache.keys;
    this._cache.setStore(t2, e2), this.setUserInfo();
  }
}
class ct {
  constructor(e2) {
    if (!e2)
      throw new re({ code: "PARAM_ERROR", message: "envId is not defined" });
    this._cache = qe(e2);
    const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
    this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new at(e2);
  }
  get isAnonymousAuth() {
    return this.loginType === Qe.ANONYMOUS;
  }
  get isCustomAuth() {
    return this.loginType === Qe.CUSTOM;
  }
  get isWeixinAuth() {
    return this.loginType === Qe.WECHAT || this.loginType === Qe.WECHAT_OPEN || this.loginType === Qe.WECHAT_PUBLIC;
  }
  get loginType() {
    return this._cache.getStore(this._cache.keys.loginTypeKey);
  }
}
class ut extends ot {
  async signIn() {
    this._cache.updatePersistence("local"), await this._request.oauth.getAccessToken(), Be(He), Be(ze, { env: this.config.env, loginType: Qe.ANONYMOUS, persistence: "local" });
    const e2 = new ct(this.config.env);
    return await e2.user.refresh(), e2;
  }
  async linkAndRetrieveDataWithTicket(e2) {
    const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e2 });
    if (i2.refresh_token)
      return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), Be(Ve, { env: this.config.env }), Be(ze, { loginType: Qe.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
    throw new re({ message: "匿名转化失败" });
  }
  _setAnonymousUUID(e2) {
    const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
    this._cache.removeStore(t2), this._cache.setStore(t2, e2), this._cache.setStore(n2, Qe.ANONYMOUS);
  }
  _clearAnonymousUUID() {
    this._cache.removeStore(this._cache.keys.anonymousUuidKey);
  }
}
class ht extends ot {
  async signIn(e2) {
    if ("string" != typeof e2)
      throw new re({ code: "PARAM_ERROR", message: "ticket must be a string" });
    const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e2, refresh_token: this._cache.getStore(t2) || "" });
    if (n2.refresh_token)
      return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), Be(He), Be(ze, { env: this.config.env, loginType: Qe.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new ct(this.config.env);
    throw new re({ message: "自定义登录失败" });
  }
}
class lt extends ot {
  async signIn(e2, t2) {
    if ("string" != typeof e2)
      throw new re({ code: "PARAM_ERROR", message: "email must be a string" });
    const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
    if (r2)
      return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Be(He), Be(ze, { env: this.config.env, loginType: Qe.EMAIL, persistence: this.config.persistence }), new ct(this.config.env);
    throw s2.code ? new re({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new re({ message: "邮箱登录失败" });
  }
  async activate(e2) {
    return this._request.send("auth.activateEndUserMail", { token: e2 });
  }
  async resetPasswordWithToken(e2, t2) {
    return this._request.send("auth.resetPasswordWithToken", { token: e2, newPassword: t2 });
  }
}
class dt extends ot {
  async signIn(e2, t2) {
    if ("string" != typeof e2)
      throw new re({ code: "PARAM_ERROR", message: "username must be a string" });
    "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
    const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: Qe.USERNAME, username: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
    if (r2)
      return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Be(He), Be(ze, { env: this.config.env, loginType: Qe.USERNAME, persistence: this.config.persistence }), new ct(this.config.env);
    throw s2.code ? new re({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new re({ message: "用户名密码登录失败" });
  }
}
class pt {
  constructor(e2) {
    this.config = e2, this._cache = qe(e2.env), this._request = it(e2.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), $e(ze, this._onLoginTypeChanged);
  }
  get currentUser() {
    const e2 = this.hasLoginState();
    return e2 && e2.user || null;
  }
  get loginType() {
    return this._cache.getStore(this._cache.keys.loginTypeKey);
  }
  anonymousAuthProvider() {
    return new ut(this.config);
  }
  customAuthProvider() {
    return new ht(this.config);
  }
  emailAuthProvider() {
    return new lt(this.config);
  }
  usernameAuthProvider() {
    return new dt(this.config);
  }
  async signInAnonymously() {
    return new ut(this.config).signIn();
  }
  async signInWithEmailAndPassword(e2, t2) {
    return new lt(this.config).signIn(e2, t2);
  }
  signInWithUsernameAndPassword(e2, t2) {
    return new dt(this.config).signIn(e2, t2);
  }
  async linkAndRetrieveDataWithTicket(e2) {
    this._anonymousAuthProvider || (this._anonymousAuthProvider = new ut(this.config)), $e(Ve, this._onAnonymousConverted);
    return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e2);
  }
  async signOut() {
    if (this.loginType === Qe.ANONYMOUS)
      throw new re({ message: "匿名用户不支持登出操作" });
    const { refreshTokenKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e2);
    if (!s2)
      return;
    const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
    return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.removeStore(n2), Be(He), Be(ze, { env: this.config.env, loginType: Qe.NULL, persistence: this.config.persistence }), r2;
  }
  async signUpWithEmailAndPassword(e2, t2) {
    return this._request.send("auth.signUpWithEmailAndPassword", { email: e2, password: t2 });
  }
  async sendPasswordResetEmail(e2) {
    return this._request.send("auth.sendPasswordResetEmail", { email: e2 });
  }
  onLoginStateChanged(e2) {
    $e(He, () => {
      const t3 = this.hasLoginState();
      e2.call(this, t3);
    });
    const t2 = this.hasLoginState();
    e2.call(this, t2);
  }
  onLoginStateExpired(e2) {
    $e(Je, e2.bind(this));
  }
  onAccessTokenRefreshed(e2) {
    $e(Ge, e2.bind(this));
  }
  onAnonymousConverted(e2) {
    $e(Ve, e2.bind(this));
  }
  onLoginTypeChanged(e2) {
    $e(ze, () => {
      const t2 = this.hasLoginState();
      e2.call(this, t2);
    });
  }
  async getAccessToken() {
    return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
  }
  hasLoginState() {
    const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
    return this._request.oauth.isAccessTokenExpired(n2, s2) ? null : new ct(this.config.env);
  }
  async isUsernameRegistered(e2) {
    if ("string" != typeof e2)
      throw new re({ code: "PARAM_ERROR", message: "username must be a string" });
    const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e2 });
    return t2 && t2.isRegistered;
  }
  getLoginState() {
    return Promise.resolve(this.hasLoginState());
  }
  async signInWithTicket(e2) {
    return new ht(this.config).signIn(e2);
  }
  shouldRefreshAccessToken(e2) {
    this._request._shouldRefreshAccessTokenHook = e2.bind(this);
  }
  getUserInfo() {
    return this._request.send("auth.getUserInfo", {}).then((e2) => e2.code ? e2 : { ...e2.data, requestId: e2.seqId });
  }
  getAuthHeader() {
    const { refreshTokenKey: e2, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2);
    return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
  }
  _onAnonymousConverted(e2) {
    const { env: t2 } = e2.data;
    t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
  }
  _onLoginTypeChanged(e2) {
    const { loginType: t2, persistence: n2, env: s2 } = e2.data;
    s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
  }
}
const ft = function(e2, t2) {
  t2 = t2 || ke();
  const n2 = it(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e2;
  return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
    const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e3, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
    n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e4) => {
      201 === e4.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new re({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e4.data}` }));
    }).catch((e4) => {
      t2(e4);
    });
  }).catch((e3) => {
    t2(e3);
  }), t2.promise;
}, gt = function(e2, t2) {
  t2 = t2 || ke();
  const n2 = it(this.config.env), { cloudPath: s2 } = e2;
  return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
    t2(null, e3);
  }).catch((e3) => {
    t2(e3);
  }), t2.promise;
}, mt = function({ fileList: e2 }, t2) {
  if (t2 = t2 || ke(), !e2 || !Array.isArray(e2))
    return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
  for (let t3 of e2)
    if (!t3 || "string" != typeof t3)
      return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
  const n2 = { fileid_list: e2 };
  return it(this.config.env).send("storage.batchDeleteFile", n2).then((e3) => {
    e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.delete_list, requestId: e3.requestId });
  }).catch((e3) => {
    t2(e3);
  }), t2.promise;
}, yt = function({ fileList: e2 }, t2) {
  t2 = t2 || ke(), e2 && Array.isArray(e2) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
  let n2 = [];
  for (let s3 of e2)
    "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
  const s2 = { file_list: n2 };
  return it(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e3) => {
    e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.download_list, requestId: e3.requestId });
  }).catch((e3) => {
    t2(e3);
  }), t2.promise;
}, _t = async function({ fileID: e2 }, t2) {
  const n2 = (await yt.call(this, { fileList: [{ fileID: e2, maxAge: 600 }] })).fileList[0];
  if ("SUCCESS" !== n2.code)
    return t2 ? t2(n2) : new Promise((e3) => {
      e3(n2);
    });
  const s2 = it(this.config.env);
  let r2 = n2.download_url;
  if (r2 = encodeURI(r2), !t2)
    return s2.download({ url: r2 });
  t2(await s2.download({ url: r2 }));
}, wt = function({ name: e2, data: t2, query: n2, parse: s2, search: r2, timeout: i2 }, o2) {
  const a2 = o2 || ke();
  let c2;
  try {
    c2 = t2 ? JSON.stringify(t2) : "";
  } catch (e3) {
    return Promise.reject(e3);
  }
  if (!e2)
    return Promise.reject(new re({ code: "PARAM_ERROR", message: "函数名不能为空" }));
  const u2 = { inQuery: n2, parse: s2, search: r2, function_name: e2, request_data: c2 };
  return it(this.config.env).send("functions.invokeFunction", u2, { timeout: i2 }).then((e3) => {
    if (e3.code)
      a2(null, e3);
    else {
      let t3 = e3.data.response_data;
      if (s2)
        a2(null, { result: t3, requestId: e3.requestId });
      else
        try {
          t3 = JSON.parse(e3.data.response_data), a2(null, { result: t3, requestId: e3.requestId });
        } catch (e4) {
          a2(new re({ message: "response data must be json" }));
        }
    }
    return a2.promise;
  }).catch((e3) => {
    a2(e3);
  }), a2.promise;
}, vt = { timeout: 15e3, persistence: "session" }, It = {};
class St {
  constructor(e2) {
    this.config = e2 || this.config, this.authObj = void 0;
  }
  init(e2) {
    switch (xe.adapter || (this.requestClient = new xe.adapter.reqClass({ timeout: e2.timeout || 5e3, timeoutMsg: `请求在${(e2.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...vt, ...e2 }, true) {
      case this.config.timeout > 6e5:
        console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = 6e5;
        break;
      case this.config.timeout < 100:
        console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
    }
    return new St(this.config);
  }
  auth({ persistence: e2 } = {}) {
    if (this.authObj)
      return this.authObj;
    const t2 = e2 || xe.adapter.primaryStorage || vt.persistence;
    var n2;
    return t2 !== this.config.persistence && (this.config.persistence = t2), function(e3) {
      const { env: t3 } = e3;
      De[t3] = new Ne(e3), Me[t3] = new Ne({ ...e3, persistence: "local" });
    }(this.config), n2 = this.config, rt[n2.env] = new st(n2), this.authObj = new pt(this.config), this.authObj;
  }
  on(e2, t2) {
    return $e.apply(this, [e2, t2]);
  }
  off(e2, t2) {
    return We.apply(this, [e2, t2]);
  }
  callFunction(e2, t2) {
    return wt.apply(this, [e2, t2]);
  }
  deleteFile(e2, t2) {
    return mt.apply(this, [e2, t2]);
  }
  getTempFileURL(e2, t2) {
    return yt.apply(this, [e2, t2]);
  }
  downloadFile(e2, t2) {
    return _t.apply(this, [e2, t2]);
  }
  uploadFile(e2, t2) {
    return ft.apply(this, [e2, t2]);
  }
  getUploadMetadata(e2, t2) {
    return gt.apply(this, [e2, t2]);
  }
  registerExtension(e2) {
    It[e2.name] = e2;
  }
  async invokeExtension(e2, t2) {
    const n2 = It[e2];
    if (!n2)
      throw new re({ message: `扩展${e2} 必须先注册` });
    return await n2.invoke(t2, this);
  }
  useAdapters(e2) {
    const { adapter: t2, runtime: n2 } = Ee(e2) || {};
    t2 && (xe.adapter = t2), n2 && (xe.runtime = n2);
  }
}
var bt = new St();
function kt(e2, t2, n2) {
  void 0 === n2 && (n2 = {});
  var s2 = /\?/.test(t2), r2 = "";
  for (var i2 in n2)
    "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
  return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e2 + t2;
}
class At {
  get(e2) {
    const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
    return new Promise((e3, i2) => {
      ie.request({ url: kt("https:", t2), data: n2, method: "GET", header: s2, timeout: r2, success(t3) {
        e3(t3);
      }, fail(e4) {
        i2(e4);
      } });
    });
  }
  post(e2) {
    const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
    return new Promise((e3, i2) => {
      ie.request({ url: kt("https:", t2), data: n2, method: "POST", header: s2, timeout: r2, success(t3) {
        e3(t3);
      }, fail(e4) {
        i2(e4);
      } });
    });
  }
  upload(e2) {
    return new Promise((t2, n2) => {
      const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e2, c2 = ie.uploadFile({ url: kt("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e3) {
        const n3 = { statusCode: e3.statusCode, data: e3.data || {} };
        200 === e3.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
      }, fail(e3) {
        n2(new Error(e3.errMsg || "uploadFile:fail"));
      } });
      "function" == typeof e2.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
        e2.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
      });
    });
  }
}
const Tt = { setItem(e2, t2) {
  ie.setStorageSync(e2, t2);
}, getItem: (e2) => ie.getStorageSync(e2), removeItem(e2) {
  ie.removeStorageSync(e2);
}, clear() {
  ie.clearStorageSync();
} };
var Ct = { genAdapter: function() {
  return { root: {}, reqClass: At, localStorage: Tt, primaryStorage: "local" };
}, isMatch: function() {
  return true;
}, runtime: "uni_app" };
bt.useAdapters(Ct);
const Pt = bt, Ot = Pt.init;
Pt.init = function(e2) {
  e2.env = e2.spaceId;
  const t2 = Ot.call(this, e2);
  t2.config.provider = "tencent", t2.config.spaceId = e2.spaceId;
  const n2 = t2.auth;
  return t2.auth = function(e3) {
    const t3 = n2.call(this, e3);
    return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e4) => {
      var n3;
      t3[e4] = (n3 = t3[e4], function(e5) {
        e5 = e5 || {};
        const { success: t4, fail: s2, complete: r2 } = se(e5);
        if (!(t4 || s2 || r2))
          return n3.call(this, e5);
        n3.call(this, e5).then((e6) => {
          t4 && t4(e6), r2 && r2(e6);
        }, (e6) => {
          s2 && s2(e6), r2 && r2(e6);
        });
      }).bind(t3);
    }), t3;
  }, t2.customAuth = t2.auth, t2;
};
var Et = Pt;
async function xt(e2, t2) {
  const n2 = `http://${e2}:${t2}/system/ping`;
  try {
    const e3 = await (s2 = { url: n2, timeout: 500 }, new Promise((e4, t3) => {
      ie.request({ ...s2, success(t4) {
        e4(t4);
      }, fail(e5) {
        t3(e5);
      } });
    }));
    return !(!e3.data || 0 !== e3.data.code);
  } catch (e3) {
    return false;
  }
  var s2;
}
async function Lt(e2, t2) {
  let n2;
  for (let s2 = 0; s2 < e2.length; s2++) {
    const r2 = e2[s2];
    if (await xt(r2, t2)) {
      n2 = r2;
      break;
    }
  }
  return { address: n2, port: t2 };
}
const Rt = { "serverless.file.resource.generateProximalSign": "storage/generate-proximal-sign", "serverless.file.resource.report": "storage/report", "serverless.file.resource.delete": "storage/delete", "serverless.file.resource.getTempFileURL": "storage/get-temp-file-url", "system/check-storage": "system/check-storage" };
var Ut = class {
  constructor(e2) {
    if (["spaceId", "clientSecret"].forEach((t2) => {
      if (!Object.prototype.hasOwnProperty.call(e2, t2))
        throw new Error(`${t2} required`);
    }), !e2.endpoint)
      throw new Error("集群空间未配置ApiEndpoint，配置后需要重新关联服务空间后生效");
    this.config = Object.assign({}, e2), this.config.provider = "dcloud", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.adapter = ie;
  }
  async request(e2, t2 = true) {
    const n2 = t2;
    return Promise.resolve().then(() => n2 ? this.requestLocal(e2) : ge.wrappedRequest(this.setupRequest(e2), this.adapter.request));
  }
  async requestLocal(e2) {
    const t2 = await this.setupLocalRequest({ method: "system/check-storage", platform: T, provider: this.config.provider, spaceId: this.config.spaceId });
    return new Promise((e3) => {
      this.adapter.request(Object.assign({}, t2, { success: (t3) => {
        e3(t3);
      }, fail: () => {
        e3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } }));
    }).then(({ data: e3 } = {}) => {
      const { code: t3, message: n2 } = e3 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n2 || "SYS_ERR" };
    }).then(({ code: t3, message: n2 }) => 0 !== t3 ? (console.error(t3, n2), ge.wrappedRequest(this.setupRequest(e2), this.adapter.request)) : new Promise((t4, n3) => {
      this.setupLocalRequest(e2).then((e3) => {
        this.adapter.request(Object.assign(e3, { complete(e4) {
          if (e4 || (e4 = {}), !e4.statusCode || e4.statusCode >= 400) {
            const t5 = e4.data && e4.data.code || "SYS_ERR", s3 = e4.data && e4.data.message || "request:fail";
            return n3(new re({ code: t5, message: s3 }));
          }
          const s2 = e4.data;
          if (s2.error)
            return n3(new re({ code: s2.error.code, message: s2.error.message }));
          t4({ success: true, result: s2 });
        } }));
      });
    }));
  }
  setupRequest(e2) {
    const t2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), n2 = { "Content-Type": "application/json" };
    n2["x-serverless-sign"] = ge.sign(t2, this.config.clientSecret);
    const s2 = fe();
    n2["x-client-info"] = encodeURIComponent(JSON.stringify(s2));
    const { token: r2 } = ae();
    return n2["x-client-token"] = r2, { url: this.config.requestUrl, method: "POST", data: t2, dataType: "json", header: JSON.parse(JSON.stringify(n2)) };
  }
  async setupLocalRequest(e2) {
    const t2 = fe(), { token: n2 } = ae(), s2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now(), clientInfo: t2, token: n2 }), { address: r2, servePort: i2 } = this.__dev__ && this.__dev__.debugInfo || {}, { address: o2 } = await Lt(r2, i2);
    return { url: `http://${o2}:${i2}/${Rt[e2.method]}`, method: "POST", data: s2, dataType: "json", header: JSON.parse(JSON.stringify({ "Content-Type": "application/json" })) };
  }
  callFunction(e2) {
    const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
    return this.request(t2, false);
  }
  getUploadFileOptions(e2) {
    const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
    return this.request(t2);
  }
  reportUploadFile(e2) {
    const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
    return this.request(t2);
  }
  uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
    if (!t2)
      throw new re({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
    let r2;
    return this.getUploadFileOptions({ cloudPath: t2 }).then((t3) => {
      const { url: i2, formData: o2, name: a2 } = t3.result;
      return r2 = t3.result.fileUrl, new Promise((t4, r3) => {
        const c2 = this.adapter.uploadFile({ url: i2, formData: o2, name: a2, filePath: e2, fileType: n2, success(e3) {
          e3 && e3.statusCode < 400 ? t4(e3) : r3(new re({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          r3(new re({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof s2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
          s2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }).then(() => this.reportUploadFile({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
      t3.success ? n3({ success: true, filePath: e2, fileID: r2 }) : s3(new re({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
    }));
  }
  deleteFile({ fileList: e2 }) {
    const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e2 }) };
    return this.request(t2).then((e3) => {
      if (e3.success)
        return e3.result;
      throw new re({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
    });
  }
  getTempFileURL({ fileList: e2, maxAge: t2 } = {}) {
    if (!Array.isArray(e2) || 0 === e2.length)
      throw new re({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
    const n2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e2, maxAge: t2 }) };
    return this.request(n2).then((e3) => {
      if (e3.success)
        return { fileList: e3.result.fileList.map((e4) => ({ fileID: e4.fileID, tempFileURL: e4.tempFileURL })) };
      throw new re({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
    });
  }
};
var Nt = { init(e2) {
  const t2 = new Ut(e2), n2 = { signInAnonymously: function() {
    return Promise.resolve();
  }, getLoginState: function() {
    return Promise.resolve(false);
  } };
  return t2.auth = function() {
    return n2;
  }, t2.customAuth = t2.auth, t2;
} }, Dt = n(function(e2, t2) {
  e2.exports = r.enc.Hex;
});
function Mt() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e2) {
    var t2 = 16 * Math.random() | 0;
    return ("x" === e2 ? t2 : 3 & t2 | 8).toString(16);
  });
}
function qt(e2) {
  return `${e2}.api-hz.cloudbasefunction.cn`;
}
function Ft(e2 = "", t2 = {}) {
  const { data: n2, functionName: s2, method: r2, headers: i2, signHeaderKeys: o2 = [], endpoint: a2, config: c2 } = t2, u2 = String(Date.now()), h2 = Mt(), l2 = Object.assign({}, i2, { "x-from-app-id": c2.spaceAppId, "x-from-env-id": c2.spaceId, "x-to-env-id": c2.spaceId, "x-from-instance-id": u2, "x-from-function-name": s2, "x-client-timestamp": u2, "x-alipay-source": "client", "x-request-id": h2, "x-alipay-callid": h2, "x-trace-id": h2 }), d2 = ["x-from-app-id", "x-from-env-id", "x-to-env-id", "x-from-instance-id", "x-from-function-name", "x-client-timestamp"].concat(o2), [p2 = "", f2 = ""] = e2.split("?") || [], g2 = function(e3) {
    const t3 = e3.signedHeaders.join(";"), n3 = e3.signedHeaders.map((t4) => `${t4.toLowerCase()}:${e3.headers[t4]}
`).join(""), s3 = Se(e3.body).toString(Dt), r3 = `${e3.method.toUpperCase()}
${e3.path}
${e3.query}
${n3}
${t3}
${s3}
`, i3 = Se(r3).toString(Dt), o3 = `HMAC-SHA256
${e3.timestamp}
${i3}
`, a3 = be(o3, e3.secretKey).toString(Dt);
    return `HMAC-SHA256 Credential=${e3.secretId}, SignedHeaders=${t3}, Signature=${a3}`;
  }({ path: p2, query: f2, method: r2, headers: l2, timestamp: u2, body: JSON.stringify(n2), secretId: c2.accessKey, secretKey: c2.secretKey, signedHeaders: d2.sort() });
  return { url: `${a2 || c2.endpoint}${e2}`, headers: Object.assign({}, l2, { Authorization: g2 }) };
}
function Kt({ url: e2, data: t2, method: n2 = "POST", headers: s2 = {}, timeout: r2 }) {
  return new Promise((i2, o2) => {
    ie.request({ url: e2, method: n2, data: "object" == typeof t2 ? JSON.stringify(t2) : t2, header: s2, dataType: "json", timeout: r2, complete: (e3 = {}) => {
      const t3 = s2["x-trace-id"] || "";
      if (!e3.statusCode || e3.statusCode >= 400) {
        const { message: n3, errMsg: s3, trace_id: r3 } = e3.data || {};
        return o2(new re({ code: "SYS_ERR", message: n3 || s3 || "request:fail", requestId: r3 || t3 }));
      }
      i2({ status: e3.statusCode, data: e3.data, headers: e3.header, requestId: t3 });
    } });
  });
}
function jt(e2, t2) {
  const { path: n2, data: s2, method: r2 = "GET" } = e2, { url: i2, headers: o2 } = Ft(n2, { functionName: "", data: s2, method: r2, headers: { "x-alipay-cloud-mode": "oss", "x-data-api-type": "oss", "x-expire-timestamp": String(Date.now() + 6e4) }, signHeaderKeys: ["x-data-api-type", "x-expire-timestamp"], config: t2, endpoint: `https://${qt(t2.spaceId)}` });
  return Kt({ url: i2, data: s2, method: r2, headers: o2 }).then((e3) => {
    const t3 = e3.data || {};
    if (!t3.success)
      throw new re({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
    return t3.data || {};
  }).catch((e3) => {
    throw new re({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
  });
}
function $t(e2 = "") {
  const t2 = e2.trim().replace(/^cloud:\/\//, ""), n2 = t2.indexOf("/");
  if (n2 <= 0)
    throw new re({ code: "INVALID_PARAM", message: "fileID不合法" });
  const s2 = t2.substring(0, n2), r2 = t2.substring(n2 + 1);
  return s2 !== this.config.spaceId && console.warn("file ".concat(e2, " does not belong to env ").concat(this.config.spaceId)), r2;
}
function Bt(e2 = "") {
  return "cloud://".concat(this.config.spaceId, "/").concat(e2.replace(/^\/+/, ""));
}
class Wt {
  constructor(e2) {
    this.config = e2;
  }
  signedURL(e2, t2 = {}) {
    const n2 = `/ws/function/${e2}`, s2 = this.config.wsEndpoint.replace(/^ws(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Mt(), timestamp: "" + Date.now() }), i2 = [n2, ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
      return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
    }).filter(Boolean).join("&"), `host:${s2}`].join("\n"), o2 = ["HMAC-SHA256", Se(i2).toString(Dt)].join("\n"), a2 = be(o2, this.config.secretKey).toString(Dt), c2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
    return `${this.config.wsEndpoint}${n2}?${c2}&signature=${a2}`;
  }
}
class Ht {
  constructor(e2) {
    this.config = e2;
  }
  signedURL(e2, t2 = {}) {
    const n2 = `/ws/sse/function/${e2}`, s2 = this.config.endpoint.replace(/^http(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Mt(), timestamp: "" + Date.now() }), i2 = ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
      return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
    }).filter(Boolean).join("&"), o2 = [n2.replace("/ws", ""), i2, `host:${s2}`].join("\n"), a2 = ["HMAC-SHA256", Se(o2).toString(Dt)].join("\n"), c2 = be(a2, this.config.secretKey).toString(Dt), u2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
    return `${this.config.endpoint}${n2}?${u2}&signature=${c2}`;
  }
}
var Jt = class {
  constructor(e2) {
    if (["spaceId", "spaceAppId", "accessKey", "secretKey"].forEach((t2) => {
      if (!Object.prototype.hasOwnProperty.call(e2, t2))
        throw new Error(`${t2} required`);
    }), e2.endpoint) {
      if ("string" != typeof e2.endpoint)
        throw new Error("endpoint must be string");
      if (!/^https:\/\//.test(e2.endpoint))
        throw new Error("endpoint must start with https://");
      e2.endpoint = e2.endpoint.replace(/\/$/, "");
    }
    this.config = Object.assign({}, e2, { endpoint: e2.endpoint || `https://${qt(e2.spaceId)}`, wsEndpoint: e2.wsEndpoint || `wss://${qt(e2.spaceId)}` }), this._websocket = new Wt(this.config), this._sse = new Ht(this.config);
  }
  callFunction(e2) {
    return function(e3, t2) {
      const { name: n2, data: s2, async: r2 = false, timeout: i2 } = e3, o2 = "POST", a2 = { "x-to-function-name": n2 };
      r2 && (a2["x-function-invoke-type"] = "async");
      const { url: c2, headers: u2 } = Ft("/functions/invokeFunction", { functionName: n2, data: s2, method: o2, headers: a2, signHeaderKeys: ["x-to-function-name"], config: t2 });
      return Kt({ url: c2, data: s2, method: o2, headers: u2, timeout: i2 }).then((e4) => {
        let t3 = 0;
        if (r2) {
          const n3 = e4.data || {};
          t3 = "200" === n3.errCode ? 0 : n3.errCode, e4.data = n3.data || {}, e4.errMsg = n3.errMsg;
        }
        if (0 !== t3)
          throw new re({ code: t3, message: e4.errMsg, requestId: e4.requestId });
        return { errCode: t3, success: 0 === t3, requestId: e4.requestId, result: e4.data };
      }).catch((e4) => {
        throw new re({ code: e4.errCode, message: e4.errMsg, requestId: e4.requestId });
      });
    }(e2, this.config);
  }
  uploadFileToOSS({ url: e2, filePath: t2, fileType: n2, formData: s2, onUploadProgress: r2 }) {
    return new Promise((i2, o2) => {
      const a2 = ie.uploadFile({ url: e2, filePath: t2, fileType: n2, formData: s2, name: "file", success(e3) {
        e3 && e3.statusCode < 400 ? i2(e3) : o2(new re({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }, fail(e3) {
        o2(new re({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
      } });
      "function" == typeof r2 && a2 && "function" == typeof a2.onProgressUpdate && a2.onProgressUpdate((e3) => {
        r2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
      });
    });
  }
  async uploadFile({ filePath: e2, cloudPath: t2 = "", fileType: n2 = "image", onUploadProgress: s2 }) {
    if ("string" !== f(t2))
      throw new re({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
    if (!(t2 = t2.trim()))
      throw new re({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
    if (/:\/\//.test(t2))
      throw new re({ code: "INVALID_PARAM", message: "cloudPath不合法" });
    const r2 = await jt({ path: "/".concat(t2.replace(/^\//, ""), "?post_url") }, this.config), { file_id: i2, upload_url: o2, form_data: a2 } = r2, c2 = a2 && a2.reduce((e3, t3) => (e3[t3.key] = t3.value, e3), {});
    return this.uploadFileToOSS({ url: o2, filePath: e2, fileType: n2, formData: c2, onUploadProgress: s2 }).then(() => ({ fileID: i2 }));
  }
  async getTempFileURL({ fileList: e2 }) {
    return new Promise((t2, n2) => {
      (!e2 || e2.length < 0) && t2({ code: "INVALID_PARAM", message: "fileList不能为空数组" }), e2.length > 50 && t2({ code: "INVALID_PARAM", message: "fileList数组长度不能超过50" });
      const s2 = [];
      for (const n3 of e2) {
        let e3;
        "string" !== f(n3) && t2({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
        try {
          e3 = $t.call(this, n3);
        } catch (t3) {
          console.warn(t3.errCode, t3.errMsg), e3 = n3;
        }
        s2.push({ file_id: e3, expire: 600 });
      }
      jt({ path: "/?download_url", data: { file_list: s2 }, method: "POST" }, this.config).then((e3) => {
        const { file_list: n3 = [] } = e3;
        t2({ fileList: n3.map((e4) => ({ fileID: Bt.call(this, e4.file_id), tempFileURL: e4.download_url })) });
      }).catch((e3) => n2(e3));
    });
  }
  async connectWebSocket(e2) {
    const { name: t2, query: n2 } = e2;
    return ie.connectSocket({ url: this._websocket.signedURL(t2, n2), complete: () => {
    } });
  }
  requestSSE(e2) {
    const { name: t2, data: n2 } = e2;
    return ie.request({ method: "POST", url: this._sse.signedURL(t2), data: n2, header: { "content-type": "application/json" }, dataType: "json" });
  }
};
var zt = { init: (e2) => {
  e2.provider = "alipay";
  const t2 = new Jt(e2);
  return t2.auth = function() {
    return { signInAnonymously: function() {
      return Promise.resolve();
    }, getLoginState: function() {
      return Promise.resolve(true);
    } };
  }, t2;
} };
function Vt({ data: e2 }) {
  let t2;
  t2 = fe();
  const n2 = JSON.parse(JSON.stringify(e2 || {}));
  if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
    const { token: e3 } = ae();
    e3 && (n2.uniIdToken = e3);
  }
  return n2;
}
const Gt = { enable: false, interval: 0, space: {} };
let Qt = null, Yt = 0, Xt = false;
function Zt() {
  return Array.isArray(P) && P.length ? P[0] : {};
}
function en(e2) {
  return `${e2}_${Zt().spaceId || "default"}`;
}
function tn() {
  if (Qt)
    return Qt;
  try {
    const e2 = ie.getStorageSync(en("UNICLOUD_FAILOVER_CONFIG"));
    if (g(e2))
      return Qt = e2, e2;
  } catch (e2) {
  }
  return null;
}
function nn(e2) {
  Yt = e2;
  try {
    ie.setStorageSync(en("UNICLOUD_FAILOVER_LAST_REQUEST"), e2);
  } catch (e3) {
  }
}
function sn(e2) {
  if (null === e2 || e2 < 0)
    return false;
  if (0 === e2)
    return true;
  const t2 = function() {
    if (Yt)
      return Yt;
    try {
      const e3 = ie.getStorageSync(en("UNICLOUD_FAILOVER_LAST_REQUEST"));
      if (e3 && "number" == typeof e3)
        return Yt = e3, e3;
    } catch (e3) {
    }
    return 0;
  }();
  if (!t2)
    return true;
  return Date.now() - t2 >= e2;
}
async function rn() {
  const e2 = Zt(), { failoverEndpoint: t2 } = e2;
  if (!t2)
    return null;
  if (Xt)
    return tn();
  Xt = true;
  try {
    const e3 = `${t2}/.unicloud/failover-cfg.json`, n2 = await ie.request({ url: e3, method: "GET", dataType: "json", timeout: 5e3 });
    if (nn(Date.now()), 200 !== n2.statusCode || !g(n2.data))
      return null;
    const s2 = { ...Gt, ...n2.data }, { enable: r2 = false, interval: i2 = 0, space: o2 = {} } = s2, a2 = tn(), c2 = a2 && a2.enable, u2 = function(e4, t3) {
      if (!e4)
        return t3.enable;
      if (e4.enable !== t3.enable)
        return true;
      if (e4.interval !== t3.interval)
        return true;
      if (t3._lastModifiedAt && e4._lastModifiedAt !== t3._lastModifiedAt)
        return true;
      if (JSON.stringify(e4.space) !== JSON.stringify(t3.space))
        return true;
      return false;
    }(a2, s2);
    return function(e4) {
      try {
        Qt = e4, e4 && e4.enable ? ie.setStorageSync(en("UNICLOUD_FAILOVER_CONFIG"), e4) : (ie.removeStorageSync(en("UNICLOUD_FAILOVER_CONFIG")), ie.removeStorageSync(en("UNICLOUD_FAILOVER_LAST_REQUEST")));
      } catch (e5) {
      }
    }({ enable: r2, interval: i2, space: o2, _lastModifiedAt: n2.data._lastModifiedAt || Date.now() }), u2 && Z(J, { isEnabled: r2, hasStatusChanged: c2 !== r2, failoverSpace: o2 }), s2;
  } catch (e3) {
    return tn();
  } finally {
    Xt = false;
  }
}
async function on(e2 = {}) {
  await this.__dev__.initLocalNetwork();
  const { localAddress: t2, localPort: n2 } = this.__dev__, s2 = Zt(), r2 = { aliyun: "aliyun", tencent: "tcb", alipay: "alipay", dcloud: "dcloud" }[s2.provider], i2 = s2.spaceId, o2 = `http://${t2}:${n2}/system/check-function`, a2 = `http://${t2}:${n2}/cloudfunctions/${e2.name}`;
  return new Promise((t3, n3) => {
    ie.request({ method: "POST", url: o2, data: { name: e2.name, platform: T, provider: r2, spaceId: i2 }, timeout: 3e3, success(e3) {
      t3(e3);
    }, fail() {
      t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
    } });
  }).then(({ data: e3 } = {}) => {
    const { code: t3, message: n3 } = e3 || {};
    return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
  }).then(({ code: t3, message: n3 }) => {
    if (0 !== t3) {
      switch (t3) {
        case "MODULE_ENCRYPTED":
          console.error(`此云函数（${e2.name}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
          break;
        case "FUNCTION_ENCRYPTED":
          console.error(`此云函数（${e2.name}）已加密不可本地调试，自动切换为云端已部署的云函数`);
          break;
        case "ACTION_ENCRYPTED":
          console.error(n3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
          break;
        case "NETWORK_ERROR":
          console.error(n3 || "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下");
          break;
        case "SWITCH_TO_CLOUD":
          break;
        default: {
          const e3 = `检测本地调试服务出现错误：${n3}，请检查网络环境或重启客户端再试`;
          throw console.error(e3), new Error(e3);
        }
      }
      return this._callCloudFunction(e2);
    }
    return new Promise((t4, n4) => {
      const s3 = Vt.call(this, { data: e2.data });
      ie.request({ method: "POST", url: a2, data: { provider: r2, platform: T, param: s3 }, timeout: e2.timeout, success: ({ statusCode: e3, data: s4 } = {}) => !e3 || e3 >= 400 ? n4(new re({ code: s4.code || "SYS_ERR", message: s4.message || "request:fail" })) : t4({ result: s4 }), fail(e3) {
        n4(new re({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
      } });
    });
  });
}
const an = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
var cn = /[\\^$.*+?()[\]{}|]/g, un = RegExp(cn.source);
function hn(e2, t2, n2) {
  return e2.replace(new RegExp((s2 = t2) && un.test(s2) ? s2.replace(cn, "\\$&") : s2, "g"), n2);
  var s2;
}
const dn = "request", pn = "response", fn = "both", gn = { code: 2e4, message: "System error" }, mn = { code: 20101, message: "Invalid client" };
function wn(e2) {
  const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e2 || {};
  return new re({ subject: t2 || n2 || "uni-secure-network", code: s2 || i2 || gn.code, message: r2 || o2, cause: a2 });
}
let ns;
function as({ secretType: e2 } = {}) {
  return e2 === dn || e2 === pn || e2 === fn;
}
function cs({ name: e2, data: t2 = {} } = {}) {
  return "app" === T;
}
function us({ provider: e2, spaceId: t2, functionName: n2 } = {}) {
  const { appId: s2, uniPlatform: r2, osName: i2 } = le();
  let o2 = r2;
  "app" === r2 && (o2 = i2);
  const a2 = function({ provider: e3, spaceId: t3 } = {}) {
    const n3 = A;
    if (!n3)
      return {};
    e3 = /* @__PURE__ */ function(e4) {
      return "tencent" === e4 ? "tcb" : e4;
    }(e3);
    const s3 = n3.find((n4) => n4.provider === e3 && n4.spaceId === t3);
    return s3 && s3.config;
  }({ provider: e2, spaceId: t2 });
  if (!a2 || !a2.accessControl || !a2.accessControl.enable)
    return false;
  const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
  if (0 === u2.length)
    return true;
  const h2 = function(e3, t3) {
    let n3, s3, r3;
    for (let i3 = 0; i3 < e3.length; i3++) {
      const o3 = e3[i3];
      o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e4) => e4.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
    }
    return n3 || s3 || r3;
  }(u2, n2);
  if (!h2)
    return false;
  if ((c2[h2] || []).find((e3 = {}) => e3.appId === s2 && (e3.platform || "").toLowerCase() === o2.toLowerCase()))
    return true;
  throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), wn(mn);
}
function hs({ functionName: e2, result: t2, logPvd: n2 }) {
  if (this.__dev__.debugLog && t2 && t2.requestId) {
    const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e2, requestId: t2.requestId });
    console.log(`[${n2}-request]${s2}[/${n2}-request]`);
  }
}
function ls(e2) {
  const t2 = e2.callFunction, n2 = function(n3) {
    const s2 = n3.name;
    n3.data = Vt.call(e2, { data: n3.data });
    const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], i2 = as(n3), o2 = cs(n3), a2 = i2 || o2;
    return t2.call(this, n3).then((e3) => (e3.errCode = 0, !a2 && hs.call(this, { functionName: s2, result: e3, logPvd: r2 }), Promise.resolve(e3)), (e3) => (!a2 && hs.call(this, { functionName: s2, result: e3, logPvd: r2 }), e3 && e3.message && (e3.message = function({ message: e4 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
      for (let s3 = 0; s3 < n4.length; s3++) {
        const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e4.match(r3);
        if (!a3)
          continue;
        let c2 = i3;
        for (let e5 = 1; e5 < a3.length; e5++)
          c2 = hn(c2, `{$${e5}}`, a3[e5]);
        for (const e5 in t3)
          c2 = hn(c2, `{${e5}}`, t3[e5]);
        return "replace" === o3 ? c2 : e4 + c2;
      }
      return e4;
    }({ message: `[${n3.name}]: ${e3.message}`, formatter: an, extraInfo: { functionName: s2 } })), Promise.reject(e3)));
  };
  e2.callFunction = function(t3) {
    const { provider: s2, spaceId: r2 } = e2.config, i2 = t3.name;
    let o2, a2;
    if (t3.data = t3.data || {}, e2.__dev__.debugInfo && !e2.__dev__.debugInfo.forceRemote && P && e2._isDefault ? (e2._callCloudFunction || (e2._callCloudFunction = n2, e2._callLocalFunction = on), o2 = on) : o2 = n2, o2 = o2.bind(e2), cs(t3))
      ;
    else if (function({ name: e3, data: t4 = {} }) {
      return "uni-id-co" === e3 && "secureNetworkHandshakeByWeixin" === t4.method;
    }(t3))
      a2 = o2.call(e2, t3);
    else if (as(t3)) {
      a2 = new ns({ secretType: t3.secretType, uniCloudIns: e2 }).wrapEncryptDataCallFunction(n2.bind(e2))(t3);
    } else if (us({ provider: s2, spaceId: r2, functionName: i2 })) {
      a2 = new ns({ secretType: t3.secretType, uniCloudIns: e2 }).wrapVerifyClientCallFunction(n2.bind(e2))(t3);
    } else
      a2 = o2(t3);
    return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2.then((e3) => e3);
  };
}
ns = class {
  constructor() {
    throw wn({ message: `Platform ${T} is not enabled, please check whether secure network module is enabled in your manifest.json` });
  }
};
const ds = Symbol("CLIENT_DB_INTERNAL");
function ps(e2, t2) {
  return e2.then = "DoNotReturnProxyWithAFunctionNamedThen", e2._internalType = ds, e2.inspect = null, e2.__v_raw = void 0, new Proxy(e2, { get(e3, n2, s2) {
    if ("_uniClient" === n2)
      return null;
    if ("symbol" == typeof n2)
      return e3[n2];
    if (n2 in e3 || "string" != typeof n2) {
      const t3 = e3[n2];
      return "function" == typeof t3 ? t3.bind(e3) : t3;
    }
    return t2.get(e3, n2, s2);
  } });
}
function fs(e2) {
  return { on: (t2, n2) => {
    e2[t2] = e2[t2] || [], e2[t2].indexOf(n2) > -1 || e2[t2].push(n2);
  }, off: (t2, n2) => {
    e2[t2] = e2[t2] || [];
    const s2 = e2[t2].indexOf(n2);
    -1 !== s2 && e2[t2].splice(s2, 1);
  } };
}
const gs = ["db.Geo", "db.command", "command.aggregate"];
function ms(e2, t2) {
  return gs.indexOf(`${e2}.${t2}`) > -1;
}
function ys(e2) {
  switch (f(e2 = oe(e2))) {
    case "array":
      return e2.map((e3) => ys(e3));
    case "object":
      return e2._internalType === ds || Object.keys(e2).forEach((t2) => {
        e2[t2] = ys(e2[t2]);
      }), e2;
    case "regexp":
      return { $regexp: { source: e2.source, flags: e2.flags } };
    case "date":
      return { $date: e2.toISOString() };
    default:
      return e2;
  }
}
function _s(e2) {
  return e2 && e2.content && e2.content.$method;
}
class ws {
  constructor(e2, t2, n2) {
    this.content = e2, this.prevStage = t2 || null, this.udb = null, this._database = n2;
  }
  toJSON() {
    let e2 = this;
    const t2 = [e2.content];
    for (; e2.prevStage; )
      e2 = e2.prevStage, t2.push(e2.content);
    return { $db: t2.reverse().map((e3) => ({ $method: e3.$method, $param: ys(e3.$param) })) };
  }
  toString() {
    return JSON.stringify(this.toJSON());
  }
  getAction() {
    const e2 = this.toJSON().$db.find((e3) => "action" === e3.$method);
    return e2 && e2.$param && e2.$param[0];
  }
  getCommand() {
    return { $db: this.toJSON().$db.filter((e2) => "action" !== e2.$method) };
  }
  get isAggregate() {
    let e2 = this;
    for (; e2; ) {
      const t2 = _s(e2), n2 = _s(e2.prevStage);
      if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
        return true;
      e2 = e2.prevStage;
    }
    return false;
  }
  get isCommand() {
    let e2 = this;
    for (; e2; ) {
      if ("command" === _s(e2))
        return true;
      e2 = e2.prevStage;
    }
    return false;
  }
  get isAggregateCommand() {
    let e2 = this;
    for (; e2; ) {
      const t2 = _s(e2), n2 = _s(e2.prevStage);
      if ("aggregate" === t2 && "command" === n2)
        return true;
      e2 = e2.prevStage;
    }
    return false;
  }
  getNextStageFn(e2) {
    const t2 = this;
    return function() {
      return vs({ $method: e2, $param: ys(Array.from(arguments)) }, t2, t2._database);
    };
  }
  get count() {
    return this.isAggregate ? this.getNextStageFn("count") : function() {
      return this._send("count", Array.from(arguments));
    };
  }
  get remove() {
    return this.isCommand ? this.getNextStageFn("remove") : function() {
      return this._send("remove", Array.from(arguments));
    };
  }
  get() {
    return this._send("get", Array.from(arguments));
  }
  get add() {
    return this.isCommand ? this.getNextStageFn("add") : function() {
      return this._send("add", Array.from(arguments));
    };
  }
  update() {
    return this._send("update", Array.from(arguments));
  }
  end() {
    return this._send("end", Array.from(arguments));
  }
  get set() {
    return this.isCommand ? this.getNextStageFn("set") : function() {
      throw new Error("JQL禁止使用set方法");
    };
  }
  _send(e2, t2) {
    const n2 = this.getAction(), s2 = this.getCommand();
    if (s2.$db.push({ $method: e2, $param: ys(t2) }), S) {
      const e3 = s2.$db.find((e4) => "collection" === e4.$method), t3 = e3 && e3.$param;
      t3 && 1 === t3.length && "string" == typeof e3.$param[0] && e3.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
    }
    return this._database._callCloudFunction({ action: n2, command: s2 });
  }
}
function vs(e2, t2, n2) {
  return ps(new ws(e2, t2, n2), { get(e3, t3) {
    let s2 = "db";
    return e3 && e3.content && (s2 = e3.content.$method), ms(s2, t3) ? vs({ $method: t3 }, e3, n2) : function() {
      return vs({ $method: t3, $param: ys(Array.from(arguments)) }, e3, n2);
    };
  } });
}
function Is({ path: e2, method: t2 }) {
  return class {
    constructor() {
      this.param = Array.from(arguments);
    }
    toJSON() {
      return { $newDb: [...e2.map((e3) => ({ $method: e3 })), { $method: t2, $param: this.param }] };
    }
    toString() {
      return JSON.stringify(this.toJSON());
    }
  };
}
function Ss(e2, t2 = {}) {
  return ps(new e2(t2), { get: (e3, t3) => ms("db", t3) ? vs({ $method: t3 }, null, e3) : function() {
    return vs({ $method: t3, $param: ys(Array.from(arguments)) }, null, e3);
  } });
}
class bs extends class {
  constructor({ uniClient: e2 = {}, isJQL: t2 = false } = {}) {
    this._uniClient = e2, this._authCallBacks = {}, this._dbCallBacks = {}, e2._isDefault && (this._dbCallBacks = R("_globalUniCloudDatabaseCallback")), t2 || (this.auth = fs(this._authCallBacks)), this._isJQL = t2, Object.assign(this, fs(this._dbCallBacks)), this.env = ps({}, { get: (e3, t3) => ({ $env: t3 }) }), this.Geo = ps({}, { get: (e3, t3) => Is({ path: ["Geo"], method: t3 }) }), this.serverDate = Is({ path: [], method: "serverDate" }), this.RegExp = Is({ path: [], method: "RegExp" });
  }
  getCloudEnv(e2) {
    if ("string" != typeof e2 || !e2.trim())
      throw new Error("getCloudEnv参数错误");
    return { $env: e2.replace("$cloudEnv_", "") };
  }
  _callback(e2, t2) {
    const n2 = this._dbCallBacks;
    n2[e2] && n2[e2].forEach((e3) => {
      e3(...t2);
    });
  }
  _callbackAuth(e2, t2) {
    const n2 = this._authCallBacks;
    n2[e2] && n2[e2].forEach((e3) => {
      e3(...t2);
    });
  }
  multiSend() {
    const e2 = Array.from(arguments), t2 = e2.map((e3) => {
      const t3 = e3.getAction(), n2 = e3.getCommand();
      if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
        throw new Error("multiSend只支持子命令内使用getTemp");
      return { action: t3, command: n2 };
    });
    return this._callCloudFunction({ multiCommand: t2, queryList: e2 });
  }
  startTransaction() {
    throw new Error("JQL 事务仅支持在云端使用");
  }
  commit() {
    throw new Error("JQL 事务仅支持在云端使用");
  }
  rollback() {
    throw new Error("JQL 事务仅支持在云端使用");
  }
} {
  _parseResult(e2) {
    return this._isJQL ? e2.result : e2;
  }
  _callCloudFunction({ action: e2, command: t2, multiCommand: n2, queryList: s2 }) {
    function r2(e3, t3) {
      if (n2 && s2)
        for (let n3 = 0; n3 < s2.length; n3++) {
          const r3 = s2[n3];
          r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e3.result.dataList[n3]));
        }
    }
    const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
    function a2(e3) {
      return i2._callback("error", [e3]), F(K(o2, "fail"), e3).then(() => F(K(o2, "complete"), e3)).then(() => (r2(null, e3), Z(B, { type: z, content: e3 }), Promise.reject(e3)));
    }
    const c2 = F(K(o2, "invoke")), u2 = this._uniClient;
    return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: h, data: { action: e2, command: t2, multiCommand: n2 } })).then((e3) => {
      const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e3.result;
      if (u3)
        for (let e4 = 0; e4 < u3.length; e4++) {
          const { level: t4, message: n4, detail: s4 } = u3[e4], r3 = console[t4] || console.log;
          let i3 = "[System Info]" + n4;
          s4 && (i3 = `${i3}
详细信息：${s4}`), r3(i3);
        }
      if (t3) {
        return a2(new re({ code: t3, message: n3, requestId: e3.requestId }));
      }
      e3.result.errCode = e3.result.errCode || e3.result.code, e3.result.errMsg = e3.result.errMsg || e3.result.message, s3 && c3 && (ce({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), Z(H, { token: s3, tokenExpired: c3 }));
      const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
      for (let t4 = 0; t4 < h2.length; t4++) {
        const { prop: n4, tips: s4 } = h2[t4];
        if (n4 in e3.result) {
          const t5 = e3.result[n4];
          Object.defineProperty(e3.result, n4, { get: () => (console.warn(s4), t5) });
        }
      }
      return function(e4) {
        return F(K(o2, "success"), e4).then(() => F(K(o2, "complete"), e4)).then(() => {
          r2(e4, null);
          const t4 = i2._parseResult(e4);
          return Z(B, { type: z, content: t4 }), Promise.resolve(t4);
        });
      }(e3);
    }, (e3) => {
      /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e3.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
      return a2(new re({ code: e3.code || "SYSTEM_ERROR", message: e3.message, requestId: e3.requestId }));
    });
  }
}
const ks$1 = "token无效，跳转登录页面", As = "token过期，跳转登录页面", Ts = { TOKEN_INVALID_TOKEN_EXPIRED: As, TOKEN_INVALID_INVALID_CLIENTID: ks$1, TOKEN_INVALID: ks$1, TOKEN_INVALID_WRONG_TOKEN: ks$1, TOKEN_INVALID_ANONYMOUS_USER: ks$1 }, Cs = { "uni-id-token-expired": As, "uni-id-check-token-failed": ks$1, "uni-id-token-not-exist": ks$1, "uni-id-check-device-feature-failed": ks$1 }, Ps = { ...Ts, ...Cs, default: "用户未登录或登录状态过期，自动跳转登录页面" };
function Os(e2, t2) {
  let n2 = "";
  return n2 = e2 ? `${e2}/${t2}` : t2, n2.replace(/^\//, "");
}
function Es(e2 = [], t2 = "") {
  const n2 = [], s2 = [];
  return e2.forEach((e3) => {
    true === e3.needLogin ? n2.push(Os(t2, e3.path)) : false === e3.needLogin && s2.push(Os(t2, e3.path));
  }), { needLoginPage: n2, notNeedLoginPage: s2 };
}
function xs(e2) {
  return e2.split("?")[0].replace(/^\//, "");
}
function Ls() {
  return function(e2) {
    let t2 = e2 && e2.$page && e2.$page.fullPath;
    return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : "";
  }(function() {
    const e2 = getCurrentPages();
    return e2[e2.length - 1];
  }());
}
function Rs() {
  return xs(Ls());
}
function Us(e2 = "", t2 = {}) {
  if (!e2)
    return false;
  if (!(t2 && t2.list && t2.list.length))
    return false;
  const n2 = t2.list, s2 = xs(e2);
  return n2.some((e3) => e3.pagePath === s2);
}
const Ns = !!e.uniIdRouter;
const { loginPage: Ds, routerNeedLogin: Ms, resToLogin: qs, needLoginPage: Fs, notNeedLoginPage: Ks, loginPageInTabBar: js } = function({ pages: t2 = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = e) {
  const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = Es(t2), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
    const t3 = [], n3 = [];
    return e2.forEach((e3) => {
      const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = Es(r3, s3);
      t3.push(...i3), n3.push(...o3);
    }), { needLoginPage: t3, notNeedLoginPage: n3 };
  }(n2);
  return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: Us(i2, r2) };
}();
if (Fs.indexOf(Ds) > -1)
  throw new Error(`Login page [${Ds}] should not be "needLogin", please check your pages.json`);
function $s(e2) {
  const t2 = Rs();
  if ("/" === e2.charAt(0))
    return e2;
  const [n2, s2] = e2.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
  i2.pop();
  for (let e3 = 0; e3 < r2.length; e3++) {
    const t3 = r2[e3];
    ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
  }
  return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
}
function Bs(e2, t2) {
  return new RegExp(t2).test(e2);
}
function Ws({ redirect: e2 }) {
  const t2 = xs(e2), n2 = xs(Ds);
  return Rs() !== n2 && t2 !== n2;
}
function Hs({ api: e2, redirect: t2 } = {}) {
  if (!t2 || !Ws({ redirect: t2 }))
    return;
  const n2 = function(e3, t3) {
    return "/" !== e3.charAt(0) && (e3 = "/" + e3), t3 ? e3.indexOf("?") > -1 ? e3 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3;
  }(Ds, t2);
  js ? "navigateTo" !== e2 && "redirectTo" !== e2 || (e2 = "switchTab") : "switchTab" === e2 && (e2 = "navigateTo");
  const s2 = { navigateTo: index.navigateTo, redirectTo: index.redirectTo, switchTab: index.switchTab, reLaunch: index.reLaunch };
  setTimeout(() => {
    s2[e2]({ url: n2 });
  }, 0);
}
function Js({ url: e2 } = {}) {
  const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
    const { token: e3, tokenExpired: t3 } = ae();
    let n3;
    if (e3) {
      if (t3 < Date.now()) {
        const e4 = "uni-id-token-expired";
        n3 = { errCode: e4, errMsg: Ps[e4] };
      }
    } else {
      const e4 = "uni-id-check-token-failed";
      n3 = { errCode: e4, errMsg: Ps[e4] };
    }
    return n3;
  }();
  if (function(e3) {
    const t3 = xs($s(e3));
    return !(Ks.indexOf(t3) > -1) && (Fs.indexOf(t3) > -1 || Ms.some((n3) => Bs(t3, n3) || Bs(e3, n3)));
  }(e2) && n2) {
    n2.uniIdRedirectUrl = e2;
    if (Q(W).length > 0)
      return setTimeout(() => {
        Z(W, n2);
      }, 0), t2.abortLoginPageJump = true, t2;
    t2.autoToLoginPage = true;
  }
  return t2;
}
function zs() {
  const e2 = Ls(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = Js({ url: e2 });
  t2 || n2 && Hs({ api: "redirectTo", redirect: e2 });
}
function Vs() {
  zs();
  const e2 = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
  for (let t2 = 0; t2 < e2.length; t2++) {
    const n2 = e2[t2];
    index.addInterceptor(n2, { invoke(e3) {
      const { abortLoginPageJump: t3, autoToLoginPage: s2 } = Js({ url: e3.url });
      return t3 ? e3 : s2 ? (Hs({ api: n2, redirect: $s(e3.url) }), false) : e3;
    } });
  }
}
function Gs() {
  this.onResponse((e2) => {
    const { type: t2, content: n2 } = e2;
    let s2 = false;
    switch (t2) {
      case "cloudobject":
        s2 = function(e3) {
          if ("object" != typeof e3)
            return false;
          const { errCode: t3 } = e3 || {};
          return t3 in Ps;
        }(n2);
        break;
      case "clientdb":
        s2 = function(e3) {
          if ("object" != typeof e3)
            return false;
          const { errCode: t3 } = e3 || {};
          return t3 in Ts;
        }(n2);
    }
    s2 && function(e3 = {}) {
      const t3 = Q(W);
      ne().then(() => {
        const n3 = Ls();
        if (n3 && Ws({ redirect: n3 }))
          return t3.length > 0 ? Z(W, Object.assign({ uniIdRedirectUrl: n3 }, e3)) : void (Ds && Hs({ api: "navigateTo", redirect: n3 }));
      });
    }(n2);
  });
}
function Qs(e2) {
  e2.onNeedLogin = function(e3) {
    Y(W, e3);
  }, e2.offNeedLogin = function(e3) {
    X(W, e3);
  }, Ns && (R("_globalUniCloudStatus").needLoginInit || (R("_globalUniCloudStatus").needLoginInit = true, ne().then(() => {
    Vs.call(e2);
  }), qs && Gs.call(e2)));
}
function Ys(e2) {
  e2.onFailover = function(e3) {
    Y(J, e3);
  }, e2.offFailover = function(e3) {
    X(J, e3);
  }, e2.refreshFailoverConfig = function() {
    return e2.config, nn(0), rn();
  }, e2.clearFailoverConfig = function() {
    !function() {
      Qt = null, Yt = 0;
      try {
        ie.removeStorageSync(en("UNICLOUD_FAILOVER_CONFIG")), ie.removeStorageSync(en("UNICLOUD_FAILOVER_LAST_REQUEST"));
      } catch (e3) {
      }
    }();
  };
}
function Xs(e2) {
  !function(e3) {
    e3.onResponse = function(e4) {
      Y(B, e4);
    }, e3.offResponse = function(e4) {
      X(B, e4);
    };
  }(e2), Qs(e2), function(e3) {
    e3.onRefreshToken = function(e4) {
      Y(H, e4);
    }, e3.offRefreshToken = function(e4) {
      X(H, e4);
    };
  }(e2), Ys(e2);
}
const Zs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", er = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
function tr(e2) {
  return decodeURIComponent(function(e3) {
    if (e3 = String(e3).replace(/[\t\n\f\r ]+/g, ""), !er.test(e3))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e3 += "==".slice(2 - (3 & e3.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e3.length; )
      t2 = Zs.indexOf(e3.charAt(i2++)) << 18 | Zs.indexOf(e3.charAt(i2++)) << 12 | (n2 = Zs.indexOf(e3.charAt(i2++))) << 6 | (s2 = Zs.indexOf(e3.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  }(e2).split("").map(function(e3) {
    return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}
function nr() {
  const e2 = ae().token || "", t2 = e2.split(".");
  if (!e2 || 3 !== t2.length)
    return { uid: null, role: [], permission: [], tokenExpired: 0 };
  let n2;
  try {
    n2 = JSON.parse(tr(t2[1]));
  } catch (e3) {
    throw new Error("获取当前用户信息出错，详细错误信息为：" + e3.message);
  }
  return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
}
var sr = n(function(e2, t2) {
  Object.defineProperty(t2, "__esModule", { value: true });
  const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
  function r2(e3, t3) {
    return e3.tempFiles.forEach((e4, n3) => {
      e4.name || (e4.name = e4.path.substring(e4.path.lastIndexOf("/") + 1)), t3 && (e4.fileType = t3), e4.cloudPath = Date.now() + "_" + n3 + e4.name.substring(e4.name.lastIndexOf("."));
    }), e3.tempFilePaths || (e3.tempFilePaths = e3.tempFiles.map((e4) => e4.path)), e3;
  }
  function i2(e3, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
    return t3.then((e4) => {
      if (s3) {
        const t4 = s3(e4);
        if (void 0 !== t4)
          return Promise.resolve(t4).then((t5) => void 0 === t5 ? e4 : t5);
      }
      return e4;
    }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e4, t5, s4 = 5, r4) {
      (t5 = Object.assign({}, t5)).errMsg = n2;
      const i3 = t5.tempFiles, o2 = i3.length;
      let a2 = 0;
      return new Promise((n3) => {
        for (; a2 < s4; )
          c2();
        function c2() {
          const s5 = a2++;
          if (s5 >= o2)
            return void (!i3.find((e5) => !e5.url && !e5.errMsg) && n3(t5));
          const u2 = i3[s5];
          e4.uploadFile({ provider: u2.provider, filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, cloudPathAsRealPath: u2.cloudPathAsRealPath, onUploadProgress(e5) {
            e5.index = s5, e5.tempFile = u2, e5.tempFilePath = u2.path, r4 && r4(e5);
          } }).then((e5) => {
            u2.url = e5.fileID, s5 < o2 && c2();
          }).catch((e5) => {
            u2.errMsg = e5.errMsg || e5.message, s5 < o2 && c2();
          });
        }
      });
    }(e3, t4, 5, r3));
  }
  t2.initChooseAndUploadFile = function(e3) {
    return function(t3 = { type: "all" }) {
      return "image" === t3.type ? i2(e3, function(e4) {
        const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e4;
        return new Promise((e5, a2) => {
          index.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
            e5(r2(t5, "image"));
          }, fail(e6) {
            a2({ errMsg: e6.errMsg.replace("chooseImage:fail", s2) });
          } });
        });
      }(t3), t3) : "video" === t3.type ? i2(e3, function(e4) {
        const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e4;
        return new Promise((e5, c2) => {
          index.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
            const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
            e5(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
          }, fail(e6) {
            c2({ errMsg: e6.errMsg.replace("chooseVideo:fail", s2) });
          } });
        });
      }(t3), t3) : i2(e3, function(e4) {
        const { count: t4, extension: n3 } = e4;
        return new Promise((e5, i3) => {
          let o2 = index.chooseFile;
          if ("undefined" != typeof wx$1 && "function" == typeof wx$1.chooseMessageFile && (o2 = wx$1.chooseMessageFile), "function" != typeof o2)
            return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
          o2({ type: "all", count: t4, extension: n3, success(t5) {
            e5(r2(t5));
          }, fail(e6) {
            i3({ errMsg: e6.errMsg.replace("chooseFile:fail", s2) });
          } });
        });
      }(t3), t3);
    };
  };
}), rr = t(sr);
const ir = "manual";
function or(e2) {
  return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {}, mixinDatacomError: null }), created() {
    this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
      var e3 = [];
      return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
        e3.push(this[t2]);
      }), e3;
    }, (e3, t2) => {
      if (this.loadtime === ir)
        return;
      let n2 = false;
      const s2 = [];
      for (let r2 = 2; r2 < e3.length; r2++)
        e3[r2] !== t2[r2] && (s2.push(e3[r2]), n2 = true);
      e3[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
    });
  }, methods: { onMixinDatacomPropsChange(e3, t2) {
  }, mixinDatacomEasyGet({ getone: e3 = false, success: t2, fail: n2 } = {}) {
    this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomError = null, this.mixinDatacomGet().then((n3) => {
      this.mixinDatacomLoading = false;
      const { data: s2, count: r2 } = n3.result;
      this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
      const i2 = e3 ? s2.length ? s2[0] : void 0 : s2;
      this.mixinDatacomResData = i2, t2 && t2(i2);
    }).catch((e4) => {
      this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e4, this.mixinDatacomError = e4, n2 && n2(e4);
    }));
  }, mixinDatacomGet(t2 = {}) {
    let n2;
    t2 = t2 || {}, n2 = "undefined" != typeof __uniX && __uniX ? e2.databaseForJQL(this.spaceInfo) : e2.database(this.spaceInfo);
    const s2 = t2.action || this.action;
    s2 && (n2 = n2.action(s2));
    const r2 = t2.collection || this.collection;
    n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
    const i2 = t2.where || this.where;
    i2 && Object.keys(i2).length && (n2 = n2.where(i2));
    const o2 = t2.field || this.field;
    o2 && (n2 = n2.field(o2));
    const a2 = t2.foreignKey || this.foreignKey;
    a2 && (n2 = n2.foreignKey(a2));
    const c2 = t2.groupby || this.groupby;
    c2 && (n2 = n2.groupBy(c2));
    const u2 = t2.groupField || this.groupField;
    u2 && (n2 = n2.groupField(u2));
    true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
    const h2 = t2.orderby || this.orderby;
    h2 && (n2 = n2.orderBy(h2));
    const l2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
    return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (l2 - 1)).limit(d2).get(m2), n2;
  } } };
}
function ar(e2) {
  return function(t2, n2 = {}) {
    n2 = function(e3, t3 = {}) {
      return e3.customUI = t3.customUI || e3.customUI, e3.parseSystemError = t3.parseSystemError || e3.parseSystemError, Object.assign(e3.loadingOptions, t3.loadingOptions), Object.assign(e3.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e3.secretMethods = t3.secretMethods), e3;
    }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
    const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
    return new Proxy({}, { get(s3, c2) {
      switch (c2) {
        case "toString":
          return "[object UniCloudObject]";
        case "toJSON":
          return {};
      }
      return function({ fn: e3, interceptorName: t3, getCallbackArgs: n3 } = {}) {
        return async function(...s4) {
          const r3 = n3 ? n3({ params: s4 }) : {};
          let i3, o3;
          try {
            return await F(K(t3, "invoke"), { ...r3 }), i3 = await e3(...s4), await F(K(t3, "success"), { ...r3, result: i3 }), i3;
          } catch (e4) {
            throw o3 = e4, await F(K(t3, "fail"), { ...r3, error: o3 }), o3;
          } finally {
            await F(K(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
          }
        };
      }({ fn: async function s4(...h2) {
        let l2;
        a2 && index.showLoading({ title: r2.title, mask: r2.mask });
        const d2 = { name: t2, type: u, data: { method: c2, params: h2 } };
        "object" == typeof n2.secretMethods && function(e3, t3) {
          const n3 = t3.data.method, s5 = e3.secretMethods || {}, r3 = s5[n3] || s5["*"];
          r3 && (t3.secretType = r3);
        }(n2, d2);
        let p2 = false;
        try {
          l2 = await e2.callFunction(d2);
        } catch (e3) {
          p2 = true, l2 = { result: new re(e3) };
        }
        const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = l2.result || {};
        if (a2 && index.hideLoading(), y2 && y2.token && y2.tokenExpired && (ce(y2), Z(H, { ...y2 })), g2) {
          let e3 = m2;
          if (p2 && o2) {
            e3 = (await o2({ objectName: t2, methodName: c2, params: h2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
          }
          if (a2)
            if ("toast" === i2.type)
              index.showToast({ title: e3, icon: "none" });
            else {
              if ("modal" !== i2.type)
                throw new Error(`Invalid errorOptions.type: ${i2.type}`);
              {
                const { confirm: t3 } = await async function({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                  return new Promise((i3, o3) => {
                    index.showModal({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e5) {
                      i3(e5);
                    }, fail() {
                      i3({ confirm: false, cancel: true });
                    } });
                  });
                }({ title: "提示", content: e3, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                if (i2.retry && t3)
                  return s4(...h2);
              }
            }
          const n3 = new re({ subject: f2, code: g2, message: m2, requestId: l2.requestId });
          throw n3.detail = l2.result, Z(B, { type: G, content: n3 }), n3;
        }
        return Z(B, { type: G, content: l2.result }), l2.result;
      }, interceptorName: "callObject", getCallbackArgs: function({ params: e3 } = {}) {
        return { objectName: t2, methodName: c2, params: e3 };
      } });
    } });
  };
}
function cr(e2) {
  return R("_globalUniCloudSecureNetworkCache__{spaceId}".replace("{spaceId}", e2.config.spaceId));
}
async function ur({ openid: e2, callLoginByWeixin: t2 = false } = {}) {
  const n2 = cr(this);
  if (e2 && t2)
    throw new Error("[SecureNetwork] openid and callLoginByWeixin cannot be passed at the same time");
  if (e2)
    return n2.mpWeixinOpenid = e2, {};
  const s2 = await new Promise((e3, t3) => {
    index.login({ success(t4) {
      e3(t4.code);
    }, fail(e4) {
      t3(new Error(e4.errMsg));
    } });
  }), r2 = this.importObject("uni-id-co", { customUI: true });
  return await r2.secureNetworkHandshakeByWeixin({ code: s2, callLoginByWeixin: t2 }), n2.mpWeixinCode = s2, { code: s2 };
}
async function hr(e2) {
  const t2 = cr(this);
  return t2.initPromise || (t2.initPromise = ur.call(this, e2).then((e3) => e3).catch((e3) => {
    throw delete t2.initPromise, e3;
  })), t2.initPromise;
}
function lr(e2) {
  return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
    return hr.call(e2, { openid: t2, callLoginByWeixin: n2 });
  };
}
function dr(e2) {
  !function(e3) {
    pe = e3;
  }(e2);
}
function pr(e2) {
  const t2 = wx$1.canIUse("getAppBaseInfo"), n2 = { getAppBaseInfo: t2 ? index.getAppBaseInfo : index.getSystemInfo, getPushClientId: index.getPushClientId };
  return function(s2) {
    return new Promise((r2, i2) => {
      t2 && "getAppBaseInfo" === e2 ? r2(n2[e2]()) : n2[e2]({ ...s2, success(e3) {
        r2(e3);
      }, fail(e3) {
        i2(e3);
      } });
    });
  };
}
class fr extends class {
  constructor() {
    this._callback = {};
  }
  addListener(e2, t2) {
    this._callback[e2] || (this._callback[e2] = []), this._callback[e2].push(t2);
  }
  on(e2, t2) {
    return this.addListener(e2, t2);
  }
  removeListener(e2, t2) {
    if (!t2)
      throw new Error('The "listener" argument must be of type function. Received undefined');
    const n2 = this._callback[e2];
    if (!n2)
      return;
    const s2 = function(e3, t3) {
      for (let n3 = e3.length - 1; n3 >= 0; n3--)
        if (e3[n3] === t3)
          return n3;
      return -1;
    }(n2, t2);
    n2.splice(s2, 1);
  }
  off(e2, t2) {
    return this.removeListener(e2, t2);
  }
  removeAllListener(e2) {
    delete this._callback[e2];
  }
  emit(e2, ...t2) {
    const n2 = this._callback[e2];
    if (n2)
      for (let e3 = 0; e3 < n2.length; e3++)
        n2[e3](...t2);
  }
} {
  constructor() {
    super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
  }
  init() {
    return Promise.all([pr("getAppBaseInfo")(), pr("getPushClientId")()]).then(([{ appId: e2 } = {}, { cid: t2 } = {}] = []) => {
      if (!e2)
        throw new Error("Invalid appId, please check the manifest.json file");
      if (!t2)
        throw new Error("Invalid push client id");
      this._appId = e2, this._pushClientId = t2, this._seqId = Date.now() + "-" + Math.floor(9e5 * Math.random() + 1e5), this.emit("open"), this._initMessageListener();
    }, (e2) => {
      throw this.emit("error", e2), this.close(), e2;
    });
  }
  async open() {
    return this.init();
  }
  _isUniCloudSSE(e2) {
    if ("receive" !== e2.type)
      return false;
    const t2 = e2 && e2.data && e2.data.payload;
    return !(!t2 || "UNI_CLOUD_SSE" !== t2.channel || t2.seqId !== this._seqId);
  }
  _receivePushMessage(e2) {
    if (!this._isUniCloudSSE(e2))
      return;
    const t2 = e2 && e2.data && e2.data.payload, { action: n2, messageId: s2, message: r2 } = t2;
    this._payloadQueue.push({ action: n2, messageId: s2, message: r2 }), this._consumMessage();
  }
  _consumMessage() {
    for (; ; ) {
      const e2 = this._payloadQueue.find((e3) => e3.messageId === this._currentMessageId + 1);
      if (!e2)
        break;
      this._currentMessageId++, this._parseMessagePayload(e2);
    }
  }
  _parseMessagePayload(e2) {
    const { action: t2, messageId: n2, message: s2 } = e2;
    "end" === t2 ? this._end({ messageId: n2, message: s2 }) : "message" === t2 && this._appendMessage({ messageId: n2, message: s2 });
  }
  _appendMessage({ messageId: e2, message: t2 } = {}) {
    this.emit("message", t2);
  }
  _end({ messageId: e2, message: t2 } = {}) {
    this.emit("end", t2), this.close();
  }
  _initMessageListener() {
    index.onPushMessage(this._uniPushMessageCallback);
  }
  _destroy() {
    index.offPushMessage(this._uniPushMessageCallback);
  }
  toJSON() {
    return { appId: this._appId, pushClientId: this._pushClientId, seqId: this._seqId };
  }
  close() {
    this._destroy(), this.emit("close");
  }
}
async function gr(e2) {
  const t2 = e2.__dev__;
  if (!t2.debugInfo)
    return;
  const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await Lt(n2, s2);
  if (r2)
    return t2.localAddress = r2, void (t2.localPort = s2);
  const i2 = console["warn"];
  let o2 = "";
  if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === T.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
    throw new Error(o2);
  i2(o2);
}
function mr(e2) {
  e2._initPromiseHub || (e2._initPromiseHub = new v({ createPromise: function() {
    let t2 = Promise.resolve();
    var n2;
    n2 = 1, t2 = new Promise((e3) => {
      setTimeout(() => {
        e3();
      }, n2);
    });
    const s2 = e2.auth();
    return t2.then(() => s2.getLoginState()).then((e3) => e3 ? Promise.resolve() : s2.signInAnonymously());
  } }));
}
const yr = { tcb: Et, tencent: Et, aliyun: ye, private: Nt, dcloud: Nt, alipay: zt };
let _r = new class {
  init(e2) {
    let t2 = {};
    const n2 = yr[e2.provider];
    if (!n2)
      throw new Error("未提供正确的provider参数");
    t2 = n2.init(e2), function(e3) {
      const t3 = {};
      e3.__dev__ = t3, t3.debugLog = "mp-harmony" === T;
      const n3 = C;
      n3 && !n3.code && (t3.debugInfo = n3);
      const s2 = new v({ createPromise: function() {
        return gr(e3);
      } });
      t3.initLocalNetwork = function() {
        return s2.exec();
      };
    }(t2), mr(t2), ls(t2), function(e3) {
      const t3 = e3.uploadFile;
      e3.uploadFile = function(e4) {
        return t3.call(this, e4);
      };
    }(t2), function(e3) {
      e3.database = function(t3) {
        if (t3 && Object.keys(t3).length > 0)
          return e3.init(t3).database();
        if (this._database)
          return this._database;
        const n3 = Ss(bs, { uniClient: e3 });
        return this._database = n3, n3;
      }, e3.databaseForJQL = function(t3) {
        if (t3 && Object.keys(t3).length > 0)
          return e3.init(t3).databaseForJQL();
        if (this._databaseForJQL)
          return this._databaseForJQL;
        const n3 = Ss(bs, { uniClient: e3, isJQL: true });
        return this._databaseForJQL = n3, n3;
      };
    }(t2), function(e3) {
      e3.getCurrentUserInfo = nr, e3.chooseAndUploadFile = rr.initChooseAndUploadFile(e3), Object.assign(e3, { get mixinDatacom() {
        return or(e3);
      } }), e3.SSEChannel = fr, e3.initSecureNetworkByWeixin = lr(e3), e3.setCustomClientInfo = dr, e3.importObject = ar(e3);
    }(t2);
    return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e3) => {
      if (!t2[e3])
        return;
      const n3 = t2[e3];
      t2[e3] = function() {
        return n3.apply(t2, Array.from(arguments));
      }, t2[e3] = (/* @__PURE__ */ function(e4, t3) {
        return function(n4) {
          let s2 = false;
          if ("callFunction" === t3) {
            const e5 = n4 && n4.type || c;
            s2 = e5 !== c;
          }
          const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
          n4 = n4 || {};
          const { success: o2, fail: a2, complete: u2 } = se(n4), h2 = i2.then(() => s2 ? Promise.resolve() : F(K(t3, "invoke"), n4)).then(() => e4.call(this, n4)).then((e5) => s2 ? Promise.resolve(e5) : F(K(t3, "success"), e5).then(() => F(K(t3, "complete"), e5)).then(() => (r2 && Z(B, { type: V, content: e5 }), Promise.resolve(e5))), (e5) => s2 ? Promise.reject(e5) : F(K(t3, "fail"), e5).then(() => F(K(t3, "complete"), e5)).then(() => (Z(B, { type: V, content: e5 }), Promise.reject(e5))));
          if (!(o2 || a2 || u2))
            return h2;
          h2.then((e5) => {
            o2 && o2(e5), u2 && u2(e5), r2 && Z(B, { type: V, content: e5 });
          }, (e5) => {
            a2 && a2(e5), u2 && u2(e5), r2 && Z(B, { type: V, content: e5 });
          });
        };
      }(t2[e3], e3)).bind(t2);
    }), t2.init = this.init, t2;
  }
}();
(() => {
  const e2 = Array.isArray(P) ? P.length : 0, t2 = function() {
    const e3 = Zt(), t3 = tn();
    return t3 && t3.enable && g(t3.space) ? t3.space : e3;
  }();
  if (1 === e2)
    _r = _r.init(t2), _r._isDefault = true;
  else {
    const t3 = ["database", "getCurrentUserInfo", "importObject"];
    let n2;
    n2 = e2 > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", [...["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile"], ...t3].forEach((e3) => {
      _r[e3] = function() {
        if (console.error(n2), -1 === t3.indexOf(e3))
          return Promise.reject(new re({ code: "SYS_ERR", message: n2 }));
        console.error(n2);
      };
    });
  }
  if (Object.assign(_r, { get mixinDatacom() {
    return or(_r);
  } }), Xs(_r), _r.addInterceptor = M, _r.removeInterceptor = q, _r.interceptObject = j, "web" === T)
    ;
  !function() {
    const { failoverEndpoint: e3 } = Zt();
    if (!e3)
      return;
    rn().catch((e4) => {
      console.error("请求故障切换配置失败：", e4);
    });
    const t3 = { fail() {
      const e4 = tn();
      sn(e4 && e4.interval || 0) && rn().catch((e5) => {
        console.error("请求故障切换配置失败：", e5);
      });
    } };
    M("callFunction", t3), M("database", t3), M("uploadFile", t3);
  }();
})();
var wr = _r;
const DoubleUnicodePrefixReg = /^[\uD800-\uDBFF]$/;
const DoubleUnicodeSuffixReg = /^[\uDC00-\uDFFF]$/;
const DoubleUnicodeReg = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var Probability;
(function(Probability2) {
  Probability2[Probability2["Unknown"] = 1e-13] = "Unknown";
  Probability2[Probability2["Rule"] = 1e-12] = "Rule";
  Probability2[Probability2["DICT"] = 2e-8] = "DICT";
  Probability2[Probability2["Surname"] = 1] = "Surname";
  Probability2[Probability2["Custom"] = 1] = "Custom";
})(Probability || (Probability = {}));
const Priority = {
  Normal: 1,
  Surname: 10,
  Custom: 100
};
function stringLength(text) {
  var _a;
  return text.length - (((_a = text.match(DoubleUnicodeReg)) === null || _a === void 0 ? void 0 : _a.length) || 0);
}
function splitString(text) {
  const result = [];
  let i2 = 0;
  while (i2 < text.length) {
    const char = text[i2];
    if (DoubleUnicodePrefixReg.test(char) && DoubleUnicodeSuffixReg.test(text[i2 + 1])) {
      result.push(text.substring(i2, i2 + 2));
      i2 += 2;
    } else {
      result.push(char);
      i2 += 1;
    }
  }
  return result;
}
class FastDictFactory {
  constructor() {
    this.NumberDICT = [];
    this.StringDICT = /* @__PURE__ */ new Map();
  }
  get(word) {
    if (word.length > 1) {
      return this.StringDICT.get(word);
    } else {
      const code = word.charCodeAt(0);
      return this.NumberDICT[code];
    }
  }
  set(word, pinyin2) {
    if (word.length > 1) {
      this.StringDICT.set(word, pinyin2);
    } else {
      const code = word.charCodeAt(0);
      this.NumberDICT[code] = pinyin2;
    }
  }
  clear() {
    this.NumberDICT = [];
    this.StringDICT.clear();
  }
}
const map = {
  "bǎng páng pāng": ["膀"],
  líng: [
    "〇",
    "伶",
    "凌",
    "刢",
    "囹",
    "坽",
    "夌",
    "姈",
    "婈",
    "孁",
    "岺",
    "彾",
    "掕",
    "昤",
    "朎",
    "柃",
    "棂",
    "櫺",
    "欞",
    "泠",
    "淩",
    "澪",
    "灵",
    "燯",
    "爧",
    "狑",
    "玲",
    "琌",
    "瓴",
    "皊",
    "砱",
    "祾",
    "秢",
    "竛",
    "笭",
    "紷",
    "綾",
    "绫",
    "羐",
    "羚",
    "翎",
    "聆",
    "舲",
    "苓",
    "菱",
    "蓤",
    "蔆",
    "蕶",
    "蛉",
    "衑",
    "裬",
    "詅",
    "跉",
    "軨",
    "輘",
    "酃",
    "醽",
    "鈴",
    "錂",
    "铃",
    "閝",
    "陵",
    "零",
    "霊",
    "霗",
    "霛",
    "霝",
    "靈",
    "駖",
    "魿",
    "鯪",
    "鲮",
    "鴒",
    "鸰",
    "鹷",
    "麢",
    "齡",
    "齢",
    "龄",
    "龗",
    "㥄"
  ],
  yī: [
    "一",
    "乊",
    "伊",
    "依",
    "医",
    "吚",
    "咿",
    "噫",
    "壱",
    "壹",
    "夁",
    "嫛",
    "嬄",
    "弌",
    "揖",
    "撎",
    "檹",
    "毉",
    "洢",
    "渏",
    "漪",
    "瑿",
    "畩",
    "祎",
    "禕",
    "稦",
    "繄",
    "蛜",
    "衤",
    "譩",
    "辷",
    "郼",
    "醫",
    "銥",
    "铱",
    "鷖",
    "鹥",
    "黟",
    "黳"
  ],
  "dīng zhēng": ["丁"],
  "kǎo qiǎo yú": ["丂"],
  qī: [
    "七",
    "倛",
    "僛",
    "凄",
    "嘁",
    "墄",
    "娸",
    "悽",
    "慼",
    "慽",
    "戚",
    "捿",
    "柒",
    "桤",
    "桼",
    "棲",
    "榿",
    "欺",
    "沏",
    "淒",
    "漆",
    "紪",
    "緀",
    "萋",
    "褄",
    "諆",
    "迉",
    "郪",
    "鏚",
    "霋",
    "魌",
    "鶈"
  ],
  shàng: ["丄", "尙", "尚", "恦", "緔", "绱"],
  xià: [
    "丅",
    "下",
    "乤",
    "圷",
    "夏",
    "夓",
    "懗",
    "梺",
    "疜",
    "睱",
    "罅",
    "鎼",
    "鏬"
  ],
  hǎn: ["丆", "喊", "浫", "罕", "豃", "㘎"],
  "wàn mò": ["万"],
  zhàng: [
    "丈",
    "仗",
    "墇",
    "嶂",
    "帐",
    "帳",
    "幛",
    "扙",
    "杖",
    "涱",
    "痮",
    "瘬",
    "瘴",
    "瞕",
    "粀",
    "胀",
    "脹",
    "賬",
    "账",
    "障"
  ],
  sān: ["三", "厁", "叁", "弎", "毵", "毶", "毿", "犙", "鬖"],
  "shàng shǎng shang": ["上"],
  "qí jī": ["丌", "其", "奇"],
  "bù fǒu": ["不"],
  "yǔ yù yú": ["与"],
  miǎn: [
    "丏",
    "偭",
    "免",
    "冕",
    "勉",
    "勔",
    "喕",
    "娩",
    "愐",
    "汅",
    "沔",
    "湎",
    "睌",
    "緬",
    "缅",
    "腼",
    "葂",
    "靦",
    "鮸",
    "𩾃"
  ],
  gài: [
    "丐",
    "乢",
    "匃",
    "匄",
    "戤",
    "概",
    "槩",
    "槪",
    "溉",
    "漑",
    "瓂",
    "葢",
    "鈣",
    "钙",
    "𬮿"
  ],
  chǒu: ["丑", "丒", "侴", "吜", "杽", "瞅", "矁", "醜", "魗"],
  zhuān: [
    "专",
    "叀",
    "嫥",
    "専",
    "專",
    "瑼",
    "甎",
    "砖",
    "磗",
    "磚",
    "蟤",
    "諯",
    "鄟",
    "顓",
    "颛",
    "鱄",
    "䏝"
  ],
  "qiě jū": ["且"],
  pī: [
    "丕",
    "伓",
    "伾",
    "噼",
    "坯",
    "岯",
    "憵",
    "批",
    "披",
    "炋",
    "狉",
    "狓",
    "砒",
    "磇",
    "礔",
    "礕",
    "秛",
    "秠",
    "耚",
    "豾",
    "邳",
    "鈚",
    "鉟",
    "銔",
    "錃",
    "錍",
    "霹",
    "駓",
    "髬",
    "魾",
    "𬳵"
  ],
  shì: [
    "世",
    "丗",
    "亊",
    "事",
    "仕",
    "侍",
    "冟",
    "势",
    "勢",
    "卋",
    "呩",
    "嗜",
    "噬",
    "士",
    "奭",
    "嬕",
    "室",
    "市",
    "式",
    "弑",
    "弒",
    "恀",
    "恃",
    "戺",
    "拭",
    "揓",
    "是",
    "昰",
    "枾",
    "柿",
    "栻",
    "澨",
    "烒",
    "煶",
    "眂",
    "眎",
    "眡",
    "睗",
    "示",
    "礻",
    "筮",
    "簭",
    "舐",
    "舓",
    "襫",
    "視",
    "视",
    "觢",
    "試",
    "誓",
    "諡",
    "謚",
    "试",
    "谥",
    "貰",
    "贳",
    "軾",
    "轼",
    "逝",
    "遾",
    "釈",
    "释",
    "釋",
    "鈰",
    "鉃",
    "鉽",
    "铈",
    "飾",
    "餙",
    "餝",
    "饰",
    "鰘",
    "䏡",
    "𬤊"
  ],
  qiū: [
    "丘",
    "丠",
    "坵",
    "媝",
    "恘",
    "恷",
    "楸",
    "秋",
    "秌",
    "穐",
    "篍",
    "緧",
    "萩",
    "蘒",
    "蚯",
    "蝵",
    "蟗",
    "蠤",
    "趥",
    "邱",
    "鞦",
    "鞧",
    "鰌",
    "鰍",
    "鳅",
    "鶖",
    "鹙",
    "龝"
  ],
  bǐng: [
    "丙",
    "屛",
    "怲",
    "抦",
    "昞",
    "昺",
    "柄",
    "棅",
    "炳",
    "禀",
    "秉",
    "稟",
    "苪",
    "蛃",
    "邴",
    "鈵",
    "陃",
    "鞆",
    "餅",
    "餠",
    "饼"
  ],
  yè: [
    "业",
    "亱",
    "僷",
    "墷",
    "夜",
    "嶪",
    "嶫",
    "抴",
    "捙",
    "擛",
    "擪",
    "擫",
    "晔",
    "曄",
    "曅",
    "曗",
    "曳",
    "曵",
    "枼",
    "枽",
    "業",
    "洂",
    "液",
    "澲",
    "烨",
    "燁",
    "爗",
    "璍",
    "皣",
    "瞱",
    "瞸",
    "礏",
    "腋",
    "葉",
    "謁",
    "谒",
    "邺",
    "鄴",
    "鍱",
    "鐷",
    "靥",
    "靨",
    "頁",
    "页",
    "餣",
    "饁",
    "馌",
    "驜",
    "鵺",
    "鸈"
  ],
  cóng: [
    "丛",
    "从",
    "叢",
    "婃",
    "孮",
    "従",
    "徔",
    "徖",
    "悰",
    "樷",
    "欉",
    "淙",
    "灇",
    "爜",
    "琮",
    "藂",
    "誴",
    "賨",
    "賩",
    "錝"
  ],
  dōng: [
    "东",
    "倲",
    "冬",
    "咚",
    "埬",
    "岽",
    "崬",
    "徚",
    "昸",
    "東",
    "氡",
    "氭",
    "涷",
    "笗",
    "苳",
    "菄",
    "蝀",
    "鮗",
    "鯟",
    "鶇",
    "鶫",
    "鸫",
    "鼕",
    "𬟽"
  ],
  sī: [
    "丝",
    "俬",
    "凘",
    "厮",
    "司",
    "咝",
    "嘶",
    "噝",
    "媤",
    "廝",
    "恖",
    "撕",
    "斯",
    "楒",
    "泀",
    "澌",
    "燍",
    "禗",
    "禠",
    "私",
    "糹",
    "絲",
    "緦",
    "纟",
    "缌",
    "罳",
    "蕬",
    "虒",
    "蛳",
    "蜤",
    "螄",
    "蟖",
    "蟴",
    "鉰",
    "銯",
    "鍶",
    "鐁",
    "锶",
    "颸",
    "飔",
    "騦",
    "鷥",
    "鸶",
    "鼶",
    "㟃"
  ],
  chéng: [
    "丞",
    "呈",
    "城",
    "埕",
    "堘",
    "塍",
    "塖",
    "宬",
    "峸",
    "惩",
    "懲",
    "成",
    "承",
    "挰",
    "掁",
    "揨",
    "枨",
    "棖",
    "橙",
    "檙",
    "洆",
    "溗",
    "澂",
    "珵",
    "珹",
    "畻",
    "程",
    "窚",
    "筬",
    "絾",
    "脭",
    "荿",
    "誠",
    "诚",
    "郕",
    "酲",
    "鋮",
    "铖",
    "騬",
    "鯎"
  ],
  diū: ["丟", "丢", "銩", "铥"],
  liǎng: [
    "両",
    "两",
    "兩",
    "唡",
    "啢",
    "掚",
    "緉",
    "脼",
    "蜽",
    "裲",
    "魉",
    "魎",
    "𬜯"
  ],
  yǒu: [
    "丣",
    "卣",
    "友",
    "梄",
    "湵",
    "牖",
    "禉",
    "羑",
    "聈",
    "苃",
    "莠",
    "蜏",
    "酉",
    "銪",
    "铕",
    "黝"
  ],
  yán: [
    "严",
    "厳",
    "啱",
    "喦",
    "嚴",
    "塩",
    "壛",
    "壧",
    "妍",
    "姸",
    "娫",
    "娮",
    "岩",
    "嵒",
    "嵓",
    "巌",
    "巖",
    "巗",
    "延",
    "揅",
    "昖",
    "楌",
    "檐",
    "櫩",
    "欕",
    "沿",
    "炎",
    "炏",
    "狿",
    "琂",
    "盐",
    "碞",
    "筵",
    "簷",
    "莚",
    "蔅",
    "虤",
    "蜒",
    "言",
    "訁",
    "訮",
    "詽",
    "讠",
    "郔",
    "閆",
    "閻",
    "闫",
    "阎",
    "顏",
    "顔",
    "颜",
    "鹽",
    "麣",
    "𫄧"
  ],
  bìng: [
    "並",
    "併",
    "倂",
    "傡",
    "垪",
    "摒",
    "栤",
    "病",
    "窉",
    "竝",
    "誁",
    "靐",
    "鮩"
  ],
  "sàng sāng": ["丧"],
  gǔn: [
    "丨",
    "惃",
    "滚",
    "滾",
    "磙",
    "緄",
    "绲",
    "蓘",
    "蔉",
    "衮",
    "袞",
    "輥",
    "辊",
    "鮌",
    "鯀",
    "鲧"
  ],
  jiū: [
    "丩",
    "勼",
    "啾",
    "揪",
    "揫",
    "朻",
    "究",
    "糾",
    "纠",
    "萛",
    "赳",
    "阄",
    "鬏",
    "鬮",
    "鳩",
    "鸠"
  ],
  "gè gě": ["个", "個", "各"],
  yā: [
    "丫",
    "圧",
    "孲",
    "庘",
    "押",
    "枒",
    "桠",
    "椏",
    "錏",
    "鐚",
    "鴉",
    "鴨",
    "鵶",
    "鸦",
    "鸭"
  ],
  pán: [
    "丬",
    "媻",
    "幋",
    "槃",
    "洀",
    "瀊",
    "爿",
    "盘",
    "盤",
    "磐",
    "縏",
    "蒰",
    "蟠",
    "蹒",
    "蹣",
    "鎜",
    "鞶"
  ],
  "zhōng zhòng": ["中"],
  jǐ: [
    "丮",
    "妀",
    "己",
    "戟",
    "挤",
    "掎",
    "撠",
    "擠",
    "橶",
    "泲",
    "犱",
    "脊",
    "虮",
    "蟣",
    "魢",
    "鱾",
    "麂"
  ],
  jiè: [
    "丯",
    "介",
    "借",
    "唶",
    "堺",
    "屆",
    "届",
    "岕",
    "庎",
    "徣",
    "戒",
    "楐",
    "犗",
    "玠",
    "琾",
    "界",
    "畍",
    "疥",
    "砎",
    "蚧",
    "蛶",
    "衸",
    "褯",
    "誡",
    "诫",
    "鎅",
    "骱",
    "魪"
  ],
  fēng: [
    "丰",
    "仹",
    "偑",
    "僼",
    "凨",
    "凬",
    "凮",
    "妦",
    "寷",
    "封",
    "峯",
    "峰",
    "崶",
    "枫",
    "楓",
    "檒",
    "沣",
    "沨",
    "渢",
    "灃",
    "烽",
    "犎",
    "猦",
    "琒",
    "疯",
    "瘋",
    "盽",
    "砜",
    "碸",
    "篈",
    "蘴",
    "蜂",
    "蠭",
    "豐",
    "鄷",
    "酆",
    "鋒",
    "鎽",
    "鏠",
    "锋",
    "霻",
    "靊",
    "飌",
    "麷"
  ],
  "guàn kuàng": ["丱"],
  chuàn: ["串", "汌", "玔", "賗", "釧", "钏"],
  chǎn: [
    "丳",
    "产",
    "冁",
    "剷",
    "囅",
    "嵼",
    "旵",
    "浐",
    "滻",
    "灛",
    "產",
    "産",
    "簅",
    "蒇",
    "蕆",
    "諂",
    "譂",
    "讇",
    "谄",
    "鏟",
    "铲",
    "閳",
    "闡",
    "阐",
    "骣",
    "𬊤"
  ],
  lín: [
    "临",
    "冧",
    "壣",
    "崊",
    "嶙",
    "斴",
    "晽",
    "暽",
    "林",
    "潾",
    "瀶",
    "燐",
    "琳",
    "璘",
    "瞵",
    "碄",
    "磷",
    "粦",
    "粼",
    "繗",
    "翷",
    "臨",
    "轔",
    "辚",
    "遴",
    "邻",
    "鄰",
    "鏻",
    "阾",
    "隣",
    "霖",
    "驎",
    "鱗",
    "鳞",
    "麐",
    "麟",
    "𬴊",
    "𬭸"
  ],
  zhuó: [
    "丵",
    "劅",
    "卓",
    "啄",
    "圴",
    "妰",
    "娺",
    "撯",
    "擆",
    "擢",
    "斫",
    "斮",
    "斱",
    "斲",
    "斵",
    "晫",
    "椓",
    "浊",
    "浞",
    "濁",
    "灼",
    "烵",
    "琸",
    "硺",
    "禚",
    "窡",
    "籗",
    "籱",
    "罬",
    "茁",
    "蠗",
    "蠿",
    "諁",
    "諑",
    "謶",
    "诼",
    "酌",
    "鐲",
    "镯",
    "鵫",
    "鷟",
    "䓬",
    "𬸦"
  ],
  zhǔ: [
    "丶",
    "主",
    "劯",
    "嘱",
    "囑",
    "宔",
    "帾",
    "拄",
    "渚",
    "濐",
    "煑",
    "煮",
    "燝",
    "瞩",
    "矚",
    "罜",
    "詝",
    "陼",
    "鸀",
    "麈",
    "𬣞"
  ],
  bā: [
    "丷",
    "仈",
    "八",
    "叭",
    "哵",
    "夿",
    "岜",
    "巴",
    "捌",
    "朳",
    "玐",
    "疤",
    "笆",
    "粑",
    "羓",
    "芭",
    "蚆",
    "豝",
    "釟"
  ],
  wán: [
    "丸",
    "刓",
    "完",
    "岏",
    "抏",
    "捖",
    "汍",
    "烷",
    "玩",
    "琓",
    "笂",
    "紈",
    "纨",
    "翫",
    "芄",
    "貦",
    "頑",
    "顽"
  ],
  dān: [
    "丹",
    "勯",
    "匰",
    "単",
    "妉",
    "媅",
    "殚",
    "殫",
    "甔",
    "眈",
    "砃",
    "箪",
    "簞",
    "耼",
    "耽",
    "聃",
    "聸",
    "褝",
    "襌",
    "躭",
    "郸",
    "鄲",
    "酖",
    "頕"
  ],
  "wèi wéi": ["为"],
  "jǐng dǎn": ["丼"],
  "lì lí": ["丽"],
  jǔ: [
    "举",
    "弆",
    "挙",
    "擧",
    "椇",
    "榉",
    "榘",
    "櫸",
    "欅",
    "矩",
    "筥",
    "聥",
    "舉",
    "莒",
    "蒟",
    "襷",
    "踽",
    "齟",
    "龃"
  ],
  piě: ["丿", "苤", "鐅", "𬭯"],
  fú: [
    "乀",
    "伏",
    "俘",
    "凫",
    "刜",
    "匐",
    "咈",
    "哹",
    "垘",
    "孚",
    "岪",
    "巿",
    "帗",
    "幅",
    "幞",
    "弗",
    "彿",
    "怫",
    "扶",
    "柫",
    "栿",
    "桴",
    "氟",
    "泭",
    "浮",
    "涪",
    "澓",
    "炥",
    "玸",
    "甶",
    "畉",
    "癁",
    "祓",
    "福",
    "稪",
    "符",
    "箙",
    "紱",
    "紼",
    "絥",
    "綍",
    "绂",
    "绋",
    "罘",
    "罦",
    "翇",
    "艀",
    "芙",
    "芣",
    "苻",
    "茀",
    "茯",
    "菔",
    "葍",
    "虙",
    "蚨",
    "蜉",
    "蝠",
    "袚",
    "袱",
    "襆",
    "襥",
    "諨",
    "豧",
    "踾",
    "輻",
    "辐",
    "郛",
    "鉘",
    "鉜",
    "韍",
    "韨",
    "颫",
    "髴",
    "鮄",
    "鮲",
    "鳧",
    "鳬",
    "鴔",
    "鵩",
    "黻"
  ],
  "yí jí": ["乁"],
  yì: [
    "乂",
    "义",
    "亄",
    "亦",
    "亿",
    "伇",
    "伿",
    "佾",
    "俋",
    "億",
    "兿",
    "刈",
    "劓",
    "劮",
    "勚",
    "勩",
    "匇",
    "呓",
    "呭",
    "呹",
    "唈",
    "囈",
    "圛",
    "坄",
    "垼",
    "埸",
    "奕",
    "嫕",
    "嬑",
    "寱",
    "屹",
    "峄",
    "嶧",
    "帟",
    "帠",
    "幆",
    "廙",
    "异",
    "弈",
    "弋",
    "役",
    "忆",
    "怈",
    "怿",
    "悒",
    "意",
    "憶",
    "懌",
    "懿",
    "抑",
    "挹",
    "敡",
    "易",
    "晹",
    "曀",
    "曎",
    "杙",
    "枍",
    "棭",
    "榏",
    "槸",
    "檍",
    "歝",
    "殔",
    "殪",
    "殹",
    "毅",
    "浂",
    "浥",
    "浳",
    "湙",
    "溢",
    "潩",
    "澺",
    "瀷",
    "炈",
    "焲",
    "熠",
    "熤",
    "熼",
    "燚",
    "燡",
    "燱",
    "獈",
    "玴",
    "異",
    "疫",
    "痬",
    "瘗",
    "瘞",
    "瘱",
    "癔",
    "益",
    "瞖",
    "穓",
    "竩",
    "篒",
    "縊",
    "繶",
    "繹",
    "绎",
    "缢",
    "義",
    "羿",
    "翊",
    "翌",
    "翳",
    "翼",
    "耴",
    "肄",
    "肊",
    "膉",
    "臆",
    "艗",
    "艺",
    "芅",
    "苅",
    "萟",
    "蓺",
    "薏",
    "藙",
    "藝",
    "蘙",
    "虉",
    "蜴",
    "螠",
    "衪",
    "袣",
    "裔",
    "裛",
    "褹",
    "襼",
    "訲",
    "訳",
    "詍",
    "詣",
    "誼",
    "譯",
    "議",
    "讛",
    "议",
    "译",
    "诣",
    "谊",
    "豙",
    "豛",
    "豷",
    "貖",
    "贀",
    "跇",
    "轶",
    "逸",
    "邑",
    "鄓",
    "醷",
    "釴",
    "鈠",
    "鎰",
    "鐿",
    "镒",
    "镱",
    "阣",
    "隿",
    "霬",
    "饐",
    "駅",
    "驛",
    "驿",
    "骮",
    "鮨",
    "鶂",
    "鶃",
    "鶍",
    "鷁",
    "鷊",
    "鷧",
    "鷾",
    "鸃",
    "鹝",
    "鹢",
    "黓",
    "齸",
    "𬬩",
    "㑊",
    "𫄷",
    "𬟁"
  ],
  nǎi: ["乃", "倷", "奶", "嬭", "廼", "氖", "疓", "艿", "迺", "釢"],
  wǔ: [
    "乄",
    "五",
    "仵",
    "伍",
    "侮",
    "倵",
    "儛",
    "午",
    "啎",
    "妩",
    "娬",
    "嫵",
    "庑",
    "廡",
    "忤",
    "怃",
    "憮",
    "摀",
    "武",
    "潕",
    "熓",
    "牾",
    "玝",
    "珷",
    "瑦",
    "甒",
    "碔",
    "舞",
    "躌",
    "迕",
    "逜",
    "陚",
    "鵡",
    "鹉",
    "𣲘"
  ],
  jiǔ: [
    "久",
    "乆",
    "九",
    "乣",
    "奺",
    "杦",
    "汣",
    "灸",
    "玖",
    "紤",
    "舏",
    "酒",
    "镹",
    "韭",
    "韮"
  ],
  "tuō zhé": ["乇", "杔", "馲"],
  "me mó ma yāo": ["么"],
  zhī: [
    "之",
    "倁",
    "卮",
    "巵",
    "搘",
    "支",
    "栀",
    "梔",
    "椥",
    "榰",
    "汁",
    "泜",
    "疷",
    "祗",
    "祬",
    "秓",
    "稙",
    "綕",
    "肢",
    "胑",
    "胝",
    "脂",
    "芝",
    "蘵",
    "蜘",
    "衼",
    "隻",
    "鳷",
    "鴲",
    "鼅",
    "𦭜"
  ],
  "wū wù": ["乌"],
  zhà: [
    "乍",
    "咤",
    "宱",
    "搾",
    "榨",
    "溠",
    "痄",
    "蚱",
    "詐",
    "诈",
    "醡",
    "霅",
    "䃎"
  ],
  hū: [
    "乎",
    "乯",
    "匢",
    "匫",
    "呼",
    "唿",
    "嘑",
    "垀",
    "寣",
    "幠",
    "忽",
    "惚",
    "昒",
    "歑",
    "泘",
    "淴",
    "滹",
    "烀",
    "苸",
    "虍",
    "虖",
    "謼",
    "軤",
    "轷",
    "雐"
  ],
  fá: [
    "乏",
    "伐",
    "傠",
    "坺",
    "垡",
    "墢",
    "姂",
    "栰",
    "浌",
    "瞂",
    "笩",
    "筏",
    "罚",
    "罰",
    "罸",
    "藅",
    "閥",
    "阀"
  ],
  "lè yuè yào lào": ["乐", "樂"],
  yín: [
    "乑",
    "吟",
    "噖",
    "嚚",
    "圁",
    "垠",
    "夤",
    "婬",
    "寅",
    "峾",
    "崟",
    "崯",
    "檭",
    "殥",
    "泿",
    "淫",
    "滛",
    "烎",
    "犾",
    "狺",
    "璌",
    "硍",
    "碒",
    "荶",
    "蔩",
    "訔",
    "訚",
    "訡",
    "誾",
    "鄞",
    "鈝",
    "銀",
    "银",
    "霪",
    "鷣",
    "齦"
  ],
  pīng: ["乒", "俜", "娉", "涄", "甹", "砯", "聠", "艵", "頩"],
  pāng: ["乓", "滂", "胮", "膖", "雱", "霶"],
  qiáo: [
    "乔",
    "侨",
    "僑",
    "嫶",
    "憔",
    "桥",
    "槗",
    "樵",
    "橋",
    "櫵",
    "犞",
    "瞧",
    "硚",
    "礄",
    "荍",
    "荞",
    "蕎",
    "藮",
    "譙",
    "趫",
    "鐈",
    "鞒",
    "鞽",
    "顦"
  ],
  hǔ: ["乕", "琥", "萀", "虎", "虝", "錿", "鯱"],
  guāi: ["乖"],
  "chéng shèng": ["乗", "乘", "娍"],
  yǐ: [
    "乙",
    "乛",
    "以",
    "倚",
    "偯",
    "嬟",
    "崺",
    "已",
    "庡",
    "扆",
    "攺",
    "敼",
    "旑",
    "旖",
    "檥",
    "矣",
    "礒",
    "笖",
    "舣",
    "艤",
    "苡",
    "苢",
    "蚁",
    "螘",
    "蟻",
    "裿",
    "踦",
    "輢",
    "轙",
    "逘",
    "酏",
    "釔",
    "鈘",
    "鉯",
    "钇",
    "顗",
    "鳦",
    "齮",
    "𫖮",
    "𬺈"
  ],
  "háo yǐ": ["乚"],
  "niè miē": ["乜"],
  qǐ: [
    "乞",
    "企",
    "启",
    "唘",
    "啓",
    "啔",
    "啟",
    "婍",
    "屺",
    "杞",
    "棨",
    "玘",
    "盀",
    "綺",
    "绮",
    "芑",
    "諬",
    "起",
    "邔",
    "闙"
  ],
  yě: ["也", "冶", "嘢", "埜", "壄", "漜", "野"],
  xí: [
    "习",
    "喺",
    "媳",
    "嶍",
    "席",
    "椺",
    "檄",
    "漝",
    "習",
    "蓆",
    "袭",
    "襲",
    "覡",
    "觋",
    "謵",
    "趘",
    "郋",
    "鎴",
    "隰",
    "霫",
    "飁",
    "騱",
    "騽",
    "驨",
    "鰼",
    "鳛",
    "𠅤",
    "𫘬"
  ],
  xiāng: [
    "乡",
    "厢",
    "廂",
    "忀",
    "楿",
    "欀",
    "湘",
    "瓖",
    "稥",
    "箱",
    "緗",
    "缃",
    "膷",
    "芗",
    "萫",
    "葙",
    "薌",
    "襄",
    "郷",
    "鄉",
    "鄊",
    "鄕",
    "鑲",
    "镶",
    "香",
    "驤",
    "骧",
    "鱜",
    "麘",
    "𬙋"
  ],
  shū: [
    "书",
    "倏",
    "倐",
    "儵",
    "叔",
    "姝",
    "尗",
    "抒",
    "掓",
    "摅",
    "攄",
    "書",
    "枢",
    "梳",
    "樞",
    "殊",
    "殳",
    "毹",
    "毺",
    "淑",
    "瀭",
    "焂",
    "疎",
    "疏",
    "紓",
    "綀",
    "纾",
    "舒",
    "菽",
    "蔬",
    "踈",
    "軗",
    "輸",
    "输",
    "鄃",
    "陎",
    "鮛",
    "鵨"
  ],
  dǒu: ["乧", "抖", "枓", "蚪", "鈄", "阧", "陡"],
  shǐ: [
    "乨",
    "使",
    "兘",
    "史",
    "始",
    "宩",
    "屎",
    "榁",
    "矢",
    "笶",
    "豕",
    "鉂",
    "駛",
    "驶"
  ],
  jī: [
    "乩",
    "僟",
    "击",
    "刉",
    "刏",
    "剞",
    "叽",
    "唧",
    "喞",
    "嗘",
    "嘰",
    "圾",
    "基",
    "墼",
    "姬",
    "屐",
    "嵆",
    "嵇",
    "撃",
    "擊",
    "朞",
    "机",
    "枅",
    "樭",
    "機",
    "毄",
    "激",
    "犄",
    "玑",
    "璣",
    "畸",
    "畿",
    "癪",
    "矶",
    "磯",
    "积",
    "積",
    "笄",
    "筓",
    "箕",
    "簊",
    "緁",
    "羁",
    "羇",
    "羈",
    "耭",
    "肌",
    "芨",
    "虀",
    "覉",
    "覊",
    "譏",
    "譤",
    "讥",
    "賫",
    "賷",
    "赍",
    "跻",
    "踑",
    "躋",
    "躸",
    "銈",
    "錤",
    "鐖",
    "鑇",
    "鑙",
    "隮",
    "雞",
    "鞿",
    "韲",
    "飢",
    "饑",
    "饥",
    "魕",
    "鳮",
    "鶏",
    "鶺",
    "鷄",
    "鸄",
    "鸡",
    "齎",
    "齏",
    "齑",
    "𬯀",
    "𫓯",
    "𫓹",
    "𫌀"
  ],
  náng: ["乪", "嚢", "欜", "蠰", "饢"],
  jiā: [
    "乫",
    "佳",
    "傢",
    "加",
    "嘉",
    "抸",
    "枷",
    "梜",
    "毠",
    "泇",
    "浃",
    "浹",
    "犌",
    "猳",
    "珈",
    "痂",
    "笳",
    "糘",
    "耞",
    "腵",
    "葭",
    "袈",
    "豭",
    "貑",
    "跏",
    "迦",
    "鉫",
    "鎵",
    "镓",
    "鴐",
    "麚",
    "𬂩"
  ],
  jù: [
    "乬",
    "倨",
    "倶",
    "具",
    "剧",
    "劇",
    "勮",
    "埧",
    "埾",
    "壉",
    "姖",
    "屦",
    "屨",
    "岠",
    "巨",
    "巪",
    "怇",
    "惧",
    "愳",
    "懅",
    "懼",
    "拒",
    "拠",
    "昛",
    "歫",
    "洰",
    "澽",
    "炬",
    "烥",
    "犋",
    "秬",
    "窭",
    "窶",
    "簴",
    "粔",
    "耟",
    "聚",
    "虡",
    "蚷",
    "詎",
    "讵",
    "豦",
    "距",
    "踞",
    "躆",
    "遽",
    "邭",
    "醵",
    "鉅",
    "鐻",
    "钜",
    "颶",
    "飓",
    "駏",
    "鮔"
  ],
  shí: [
    "乭",
    "十",
    "埘",
    "塒",
    "姼",
    "实",
    "実",
    "寔",
    "實",
    "峕",
    "嵵",
    "时",
    "旹",
    "時",
    "榯",
    "湜",
    "溡",
    "炻",
    "祏",
    "竍",
    "蚀",
    "蝕",
    "辻",
    "遈",
    "鉐",
    "飠",
    "饣",
    "鮖",
    "鰣",
    "鲥",
    "鼫",
    "鼭"
  ],
  mǎo: ["乮", "冇", "卯", "峁", "戼", "昴", "泖", "笷", "蓩", "鉚", "铆"],
  mǎi: ["买", "嘪", "荬", "蕒", "買", "鷶"],
  luàn: ["乱", "亂", "釠"],
  rǔ: ["乳", "擩", "汝", "肗", "辱", "鄏"],
  xué: [
    "乴",
    "学",
    "學",
    "峃",
    "嶨",
    "斈",
    "泶",
    "澩",
    "燢",
    "穴",
    "茓",
    "袕",
    "踅",
    "鷽",
    "鸴"
  ],
  yǎn: [
    "䶮",
    "乵",
    "俨",
    "偃",
    "儼",
    "兖",
    "兗",
    "厣",
    "厴",
    "噞",
    "孍",
    "嵃",
    "巘",
    "巚",
    "弇",
    "愝",
    "戭",
    "扊",
    "抁",
    "掩",
    "揜",
    "曮",
    "椼",
    "檿",
    "沇",
    "渷",
    "演",
    "琰",
    "甗",
    "眼",
    "罨",
    "萒",
    "蝘",
    "衍",
    "褗",
    "躽",
    "遃",
    "郾",
    "隒",
    "顩",
    "魇",
    "魘",
    "鰋",
    "鶠",
    "黡",
    "黤",
    "黬",
    "黭",
    "黶",
    "鼴",
    "鼹",
    "齴",
    "龑",
    "𬸘",
    "𬙂",
    "𪩘"
  ],
  fǔ: [
    "乶",
    "俌",
    "俛",
    "俯",
    "府",
    "弣",
    "抚",
    "拊",
    "撫",
    "斧",
    "椨",
    "滏",
    "焤",
    "甫",
    "盙",
    "簠",
    "腐",
    "腑",
    "蜅",
    "輔",
    "辅",
    "郙",
    "釜",
    "釡",
    "阝",
    "頫",
    "鬴",
    "黼",
    "㕮",
    "𫖯"
  ],
  shā: [
    "乷",
    "唦",
    "杀",
    "桬",
    "殺",
    "毮",
    "猀",
    "痧",
    "砂",
    "硰",
    "紗",
    "繺",
    "纱",
    "蔱",
    "裟",
    "鎩",
    "铩",
    "閷",
    "髿",
    "魦",
    "鯊",
    "鯋",
    "鲨"
  ],
  nǎ: ["乸", "雫"],
  qián: [
    "乹",
    "亁",
    "仱",
    "偂",
    "前",
    "墘",
    "媊",
    "岒",
    "拑",
    "掮",
    "榩",
    "橬",
    "歬",
    "潛",
    "潜",
    "濳",
    "灊",
    "箝",
    "葥",
    "虔",
    "軡",
    "鈐",
    "鉗",
    "銭",
    "錢",
    "鎆",
    "钤",
    "钱",
    "钳",
    "靬",
    "騚",
    "騝",
    "鰬",
    "黔",
    "黚"
  ],
  suǒ: [
    "乺",
    "唢",
    "嗩",
    "所",
    "暛",
    "溑",
    "溹",
    "琐",
    "琑",
    "瑣",
    "索",
    "褨",
    "鎖",
    "鎻",
    "鏁",
    "锁"
  ],
  yú: [
    "乻",
    "于",
    "亐",
    "伃",
    "余",
    "堣",
    "堬",
    "妤",
    "娛",
    "娯",
    "娱",
    "嬩",
    "崳",
    "嵎",
    "嵛",
    "愚",
    "扵",
    "揄",
    "旟",
    "楡",
    "楰",
    "榆",
    "欤",
    "歈",
    "歟",
    "歶",
    "渔",
    "渝",
    "湡",
    "漁",
    "澞",
    "牏",
    "狳",
    "玗",
    "玙",
    "瑜",
    "璵",
    "盂",
    "睮",
    "窬",
    "竽",
    "籅",
    "羭",
    "腴",
    "臾",
    "舁",
    "舆",
    "艅",
    "茰",
    "萮",
    "萸",
    "蕍",
    "蘛",
    "虞",
    "虶",
    "蝓",
    "螸",
    "衧",
    "褕",
    "覦",
    "觎",
    "諛",
    "謣",
    "谀",
    "踰",
    "輿",
    "轝",
    "逾",
    "邘",
    "酑",
    "鍝",
    "隅",
    "雓",
    "雩",
    "餘",
    "馀",
    "騟",
    "骬",
    "髃",
    "魚",
    "魣",
    "鮽",
    "鯲",
    "鰅",
    "鱼",
    "鷠",
    "鸆",
    "齵"
  ],
  zhù: [
    "乼",
    "伫",
    "佇",
    "住",
    "坾",
    "墸",
    "壴",
    "嵀",
    "拀",
    "杼",
    "柱",
    "樦",
    "殶",
    "注",
    "炷",
    "疰",
    "眝",
    "祝",
    "祩",
    "竚",
    "筯",
    "箸",
    "篫",
    "簗",
    "紵",
    "紸",
    "纻",
    "羜",
    "翥",
    "苎",
    "莇",
    "蛀",
    "註",
    "貯",
    "贮",
    "跓",
    "軴",
    "鉒",
    "鋳",
    "鑄",
    "铸",
    "馵",
    "駐",
    "驻"
  ],
  zhě: ["乽", "者", "褶", "襵", "赭", "踷", "鍺", "锗"],
  "qián gān": ["乾"],
  "zhì luàn": ["乿"],
  guī: [
    "亀",
    "圭",
    "妫",
    "媯",
    "嫢",
    "嬀",
    "帰",
    "归",
    "摫",
    "椝",
    "槻",
    "槼",
    "櫷",
    "歸",
    "珪",
    "瑰",
    "璝",
    "瓌",
    "皈",
    "瞡",
    "硅",
    "茥",
    "蘬",
    "規",
    "规",
    "邽",
    "郌",
    "閨",
    "闺",
    "騩",
    "鬶",
    "鬹"
  ],
  "lǐn lìn": ["亃"],
  jué: [
    "亅",
    "决",
    "刔",
    "劂",
    "匷",
    "厥",
    "噊",
    "孒",
    "孓",
    "崛",
    "崫",
    "嶥",
    "彏",
    "憠",
    "憰",
    "戄",
    "抉",
    "挗",
    "掘",
    "攫",
    "桷",
    "橛",
    "橜",
    "欮",
    "氒",
    "決",
    "灍",
    "焳",
    "熦",
    "爑",
    "爴",
    "爵",
    "獗",
    "玃",
    "玦",
    "玨",
    "珏",
    "瑴",
    "瘚",
    "矍",
    "矡",
    "砄",
    "絕",
    "絶",
    "绝",
    "臄",
    "芵",
    "蕝",
    "蕨",
    "虳",
    "蟨",
    "蟩",
    "觖",
    "觮",
    "觼",
    "訣",
    "譎",
    "诀",
    "谲",
    "貜",
    "赽",
    "趉",
    "蹷",
    "躩",
    "鈌",
    "鐍",
    "鐝",
    "钁",
    "镢",
    "鴂",
    "鴃",
    "鷢",
    "𫘝",
    "㵐",
    "𫔎"
  ],
  "le liǎo": ["了"],
  "gè mā": ["亇"],
  "yǔ yú": ["予", "懙"],
  zhēng: [
    "争",
    "佂",
    "凧",
    "姃",
    "媜",
    "峥",
    "崝",
    "崢",
    "征",
    "徰",
    "炡",
    "烝",
    "爭",
    "狰",
    "猙",
    "癥",
    "眐",
    "睁",
    "睜",
    "筝",
    "箏",
    "篜",
    "聇",
    "脀",
    "蒸",
    "踭",
    "鉦",
    "錚",
    "鏳",
    "鬇"
  ],
  èr: ["二", "刵", "咡", "弍", "弐", "樲", "誀", "貮", "貳", "贰", "髶"],
  chù: [
    "亍",
    "傗",
    "儊",
    "怵",
    "憷",
    "搐",
    "斶",
    "歜",
    "珿",
    "琡",
    "矗",
    "竌",
    "絀",
    "绌",
    "臅",
    "触",
    "觸",
    "豖",
    "鄐",
    "閦",
    "黜"
  ],
  kuī: ["亏", "刲", "岿", "巋", "盔", "窥", "窺", "聧", "虧", "闚", "顝"],
  yún: [
    "云",
    "伝",
    "勻",
    "匀",
    "囩",
    "妘",
    "愪",
    "抣",
    "昀",
    "橒",
    "沄",
    "涢",
    "溳",
    "澐",
    "熉",
    "畇",
    "秐",
    "筼",
    "篔",
    "紜",
    "縜",
    "纭",
    "耘",
    "芸",
    "蒷",
    "蕓",
    "郧",
    "鄖",
    "鋆",
    "雲"
  ],
  hù: [
    "互",
    "冱",
    "嗀",
    "嚛",
    "婟",
    "嫭",
    "嫮",
    "岵",
    "帍",
    "弖",
    "怙",
    "戶",
    "户",
    "戸",
    "戽",
    "扈",
    "护",
    "昈",
    "槴",
    "沍",
    "沪",
    "滬",
    "熩",
    "瓠",
    "祜",
    "笏",
    "簄",
    "粐",
    "綔",
    "蔰",
    "護",
    "豰",
    "鄠",
    "鍙",
    "頀",
    "鱯",
    "鳠",
    "鳸",
    "鸌",
    "鹱"
  ],
  qí: [
    "亓",
    "剘",
    "埼",
    "岐",
    "岓",
    "崎",
    "嵜",
    "愭",
    "掑",
    "斉",
    "斊",
    "旂",
    "旗",
    "棊",
    "棋",
    "檱",
    "櫀",
    "歧",
    "淇",
    "濝",
    "猉",
    "玂",
    "琦",
    "琪",
    "璂",
    "畦",
    "疧",
    "碁",
    "碕",
    "祁",
    "祈",
    "祺",
    "禥",
    "竒",
    "簯",
    "簱",
    "籏",
    "粸",
    "綥",
    "綦",
    "肵",
    "脐",
    "臍",
    "艩",
    "芪",
    "萁",
    "萕",
    "蕲",
    "藄",
    "蘄",
    "蚑",
    "蚚",
    "蛴",
    "蜝",
    "蜞",
    "螧",
    "蠐",
    "褀",
    "軝",
    "鄿",
    "釮",
    "錡",
    "锜",
    "陭",
    "頎",
    "颀",
    "騎",
    "騏",
    "騹",
    "骐",
    "骑",
    "鬐",
    "鬿",
    "鯕",
    "鰭",
    "鲯",
    "鳍",
    "鵸",
    "鶀",
    "麒",
    "麡",
    "𨙸",
    "𬨂",
    "䓫"
  ],
  jǐng: [
    "井",
    "儆",
    "刭",
    "剄",
    "坓",
    "宑",
    "幜",
    "憬",
    "暻",
    "殌",
    "汫",
    "汬",
    "澋",
    "璄",
    "璟",
    "璥",
    "穽",
    "肼",
    "蟼",
    "警",
    "阱",
    "頚",
    "頸"
  ],
  sì: [
    "亖",
    "佀",
    "価",
    "儩",
    "兕",
    "嗣",
    "四",
    "姒",
    "娰",
    "孠",
    "寺",
    "巳",
    "柶",
    "榹",
    "汜",
    "泗",
    "泤",
    "洍",
    "洠",
    "涘",
    "瀃",
    "牭",
    "祀",
    "禩",
    "竢",
    "笥",
    "耜",
    "肂",
    "肆",
    "蕼",
    "覗",
    "貄",
    "釲",
    "鈶",
    "鈻",
    "飤",
    "飼",
    "饲",
    "駟",
    "騃",
    "驷"
  ],
  suì: [
    "亗",
    "嬘",
    "岁",
    "嵗",
    "旞",
    "檖",
    "歲",
    "歳",
    "澻",
    "煫",
    "燧",
    "璲",
    "砕",
    "碎",
    "祟",
    "禭",
    "穂",
    "穗",
    "穟",
    "繀",
    "繐",
    "繸",
    "襚",
    "誶",
    "譢",
    "谇",
    "賥",
    "邃",
    "鐆",
    "鐩",
    "隧",
    "韢",
    "𫟦",
    "𬭼"
  ],
  gèn: ["亘", "亙", "揯", "搄", "茛"],
  yà: [
    "亚",
    "亜",
    "俹",
    "冴",
    "劜",
    "圔",
    "圠",
    "埡",
    "娅",
    "婭",
    "揠",
    "氩",
    "氬",
    "犽",
    "砑",
    "稏",
    "聐",
    "襾",
    "覀",
    "訝",
    "讶",
    "迓",
    "齾"
  ],
  "xiē suò": ["些"],
  "qí zhāi": ["亝", "齊"],
  "yā yà": ["亞", "压", "垭", "壓", "铔"],
  "jí qì": ["亟", "焏"],
  tóu: ["亠", "投", "頭", "骰"],
  "wáng wú": ["亡"],
  "kàng háng gāng": ["亢"],
  dà: ["亣", "眔"],
  jiāo: [
    "交",
    "僬",
    "娇",
    "嬌",
    "峧",
    "嶕",
    "嶣",
    "憍",
    "椒",
    "浇",
    "澆",
    "焦",
    "礁",
    "穚",
    "簥",
    "胶",
    "膠",
    "膲",
    "茭",
    "茮",
    "蕉",
    "虠",
    "蛟",
    "蟭",
    "跤",
    "轇",
    "郊",
    "鐎",
    "驕",
    "骄",
    "鮫",
    "鲛",
    "鵁",
    "鷦",
    "鷮",
    "鹪",
    "䴔"
  ],
  hài: ["亥", "嗐", "害", "氦", "餀", "饚", "駭", "駴", "骇"],
  "hēng pēng": ["亨"],
  mǔ: [
    "亩",
    "姆",
    "峔",
    "拇",
    "母",
    "牡",
    "牳",
    "畂",
    "畆",
    "畒",
    "畝",
    "畞",
    "畮",
    "砪",
    "胟",
    "踇",
    "鉧",
    "𬭁",
    "𧿹"
  ],
  ye: ["亪"],
  xiǎng: [
    "享",
    "亯",
    "响",
    "想",
    "晑",
    "蚃",
    "蠁",
    "響",
    "飨",
    "餉",
    "饗",
    "饷",
    "鮝",
    "鯗",
    "鱶",
    "鲞"
  ],
  jīng: [
    "京",
    "亰",
    "兢",
    "坕",
    "坙",
    "婛",
    "惊",
    "旌",
    "旍",
    "晶",
    "橸",
    "泾",
    "涇",
    "猄",
    "睛",
    "秔",
    "稉",
    "粳",
    "精",
    "経",
    "經",
    "綡",
    "聙",
    "腈",
    "茎",
    "荆",
    "荊",
    "菁",
    "葏",
    "驚",
    "鯨",
    "鲸",
    "鶁",
    "鶄",
    "麖",
    "麠",
    "鼱",
    "䴖"
  ],
  tíng: [
    "亭",
    "停",
    "婷",
    "嵉",
    "庭",
    "廷",
    "楟",
    "榳",
    "筳",
    "聤",
    "莛",
    "葶",
    "蜓",
    "蝏",
    "諪",
    "邒",
    "霆",
    "鼮",
    "䗴"
  ],
  liàng: ["亮", "喨", "悢", "晾", "湸", "諒", "谅", "輌", "輛", "辆", "鍄"],
  "qīn qìng": ["亲", "親"],
  bó: [
    "亳",
    "仢",
    "侼",
    "僰",
    "博",
    "帛",
    "愽",
    "懪",
    "挬",
    "搏",
    "欂",
    "浡",
    "淿",
    "渤",
    "煿",
    "牔",
    "狛",
    "瓝",
    "礴",
    "秡",
    "箔",
    "簙",
    "糪",
    "胉",
    "脖",
    "膊",
    "舶",
    "艊",
    "萡",
    "葧",
    "袯",
    "襏",
    "襮",
    "謈",
    "踣",
    "郣",
    "鈸",
    "鉑",
    "鋍",
    "鎛",
    "鑮",
    "钹",
    "铂",
    "镈",
    "餺",
    "馎",
    "馛",
    "馞",
    "駁",
    "駮",
    "驳",
    "髆",
    "鵓",
    "鹁"
  ],
  yòu: [
    "亴",
    "佑",
    "佦",
    "侑",
    "又",
    "右",
    "哊",
    "唀",
    "囿",
    "姷",
    "宥",
    "峟",
    "幼",
    "狖",
    "祐",
    "蚴",
    "誘",
    "诱",
    "貁",
    "迶",
    "酭",
    "釉",
    "鼬"
  ],
  xiè: [
    "亵",
    "伳",
    "偞",
    "偰",
    "僁",
    "卨",
    "卸",
    "噧",
    "塮",
    "夑",
    "媟",
    "屑",
    "屧",
    "廨",
    "徢",
    "懈",
    "暬",
    "械",
    "榍",
    "榭",
    "泻",
    "洩",
    "渫",
    "澥",
    "瀉",
    "瀣",
    "灺",
    "炧",
    "炨",
    "燮",
    "爕",
    "獬",
    "祄",
    "禼",
    "糏",
    "紲",
    "絏",
    "絬",
    "繲",
    "纈",
    "绁",
    "缷",
    "薢",
    "薤",
    "蟹",
    "蠏",
    "褉",
    "褻",
    "謝",
    "谢",
    "躞",
    "邂",
    "靾",
    "韰",
    "齂",
    "齘",
    "齛",
    "齥",
    "𬹼",
    "𤫉"
  ],
  "dǎn dàn": ["亶", "馾"],
  lián: [
    "亷",
    "劆",
    "匲",
    "匳",
    "嗹",
    "噒",
    "奁",
    "奩",
    "嫾",
    "帘",
    "廉",
    "怜",
    "憐",
    "涟",
    "漣",
    "濂",
    "濓",
    "瀮",
    "熑",
    "燫",
    "簾",
    "籢",
    "籨",
    "縺",
    "翴",
    "联",
    "聨",
    "聫",
    "聮",
    "聯",
    "臁",
    "莲",
    "蓮",
    "薕",
    "螊",
    "蠊",
    "裢",
    "褳",
    "覝",
    "謰",
    "蹥",
    "连",
    "連",
    "鎌",
    "鐮",
    "镰",
    "鬑",
    "鰱",
    "鲢"
  ],
  duǒ: [
    "亸",
    "哚",
    "嚲",
    "埵",
    "崜",
    "朵",
    "朶",
    "綞",
    "缍",
    "趓",
    "躱",
    "躲",
    "軃"
  ],
  "wěi mén": ["亹", "斖"],
  rén: ["人", "亻", "仁", "壬", "忈", "忎", "朲", "秂", "芢", "魜", "鵀"],
  jí: [
    "亼",
    "亽",
    "伋",
    "佶",
    "偮",
    "卙",
    "即",
    "卽",
    "及",
    "叝",
    "吉",
    "堲",
    "塉",
    "姞",
    "嫉",
    "岌",
    "嵴",
    "嶯",
    "彶",
    "忣",
    "急",
    "愱",
    "戢",
    "揤",
    "极",
    "棘",
    "楫",
    "極",
    "槉",
    "檝",
    "殛",
    "汲",
    "湒",
    "潗",
    "疾",
    "瘠",
    "皍",
    "笈",
    "箿",
    "籍",
    "級",
    "级",
    "膌",
    "艥",
    "蒺",
    "蕀",
    "蕺",
    "蝍",
    "螏",
    "襋",
    "觙",
    "谻",
    "踖",
    "蹐",
    "躤",
    "輯",
    "轚",
    "辑",
    "郆",
    "銡",
    "鍓",
    "鏶",
    "集",
    "雧",
    "霵",
    "鹡",
    "㴔"
  ],
  wáng: ["亾", "仼", "兦", "莣", "蚟"],
  "shén shí": ["什"],
  lè: [
    "仂",
    "叻",
    "忇",
    "氻",
    "泐",
    "玏",
    "砳",
    "簕",
    "艻",
    "阞",
    "韷",
    "餎",
    "鰳",
    "鱳",
    "鳓"
  ],
  dīng: ["仃", "叮", "帄", "玎", "疔", "盯", "耵", "虰", "靪"],
  zè: ["仄", "崱", "庂", "捑", "昃", "昗", "汄"],
  "jǐn jìn": ["仅", "僅", "嫤"],
  "pú pū": ["仆"],
  "chóu qiú": ["仇"],
  zhǎng: ["仉", "幥", "掌", "礃"],
  jīn: [
    "今",
    "堻",
    "巾",
    "惍",
    "斤",
    "津",
    "珒",
    "琻",
    "璡",
    "砛",
    "筋",
    "荕",
    "衿",
    "襟",
    "觔",
    "金",
    "釒",
    "釿",
    "钅",
    "鹶",
    "黅",
    "𬬱"
  ],
  bīng: ["仌", "仒", "兵", "冫", "冰", "掤", "氷", "鋲"],
  réng: ["仍", "礽", "芿", "辸", "陾"],
  fó: ["仏", "坲", "梻"],
  "jīn sǎn": ["仐"],
  lún: [
    "仑",
    "伦",
    "侖",
    "倫",
    "囵",
    "圇",
    "婨",
    "崘",
    "崙",
    "棆",
    "沦",
    "淪",
    "磮",
    "腀",
    "菕",
    "蜦",
    "踚",
    "輪",
    "轮",
    "錀",
    "陯",
    "鯩",
    "𬬭"
  ],
  cāng: [
    "仓",
    "仺",
    "倉",
    "凔",
    "嵢",
    "沧",
    "滄",
    "濸",
    "獊",
    "舱",
    "艙",
    "苍",
    "蒼",
    "螥",
    "鸧"
  ],
  "zǎi zǐ zī": ["仔"],
  tā: ["他", "塌", "它", "榙", "溻", "牠", "祂", "褟", "趿", "遢", "闧"],
  fù: [
    "付",
    "偩",
    "傅",
    "冨",
    "副",
    "咐",
    "坿",
    "复",
    "妇",
    "婦",
    "媍",
    "嬔",
    "富",
    "復",
    "椱",
    "祔",
    "禣",
    "竎",
    "緮",
    "縛",
    "缚",
    "腹",
    "萯",
    "蕧",
    "蚹",
    "蛗",
    "蝜",
    "蝮",
    "袝",
    "複",
    "覄",
    "覆",
    "訃",
    "詂",
    "讣",
    "負",
    "賦",
    "賻",
    "负",
    "赋",
    "赙",
    "赴",
    "輹",
    "鍑",
    "鍢",
    "阜",
    "附",
    "馥",
    "駙",
    "驸",
    "鮒",
    "鰒",
    "鲋",
    "鳆",
    "㳇"
  ],
  xiān: [
    "仙",
    "仚",
    "佡",
    "僊",
    "僲",
    "先",
    "嘕",
    "奾",
    "屳",
    "廯",
    "忺",
    "憸",
    "掀",
    "暹",
    "杴",
    "氙",
    "珗",
    "祆",
    "秈",
    "籼",
    "繊",
    "纎",
    "纖",
    "苮",
    "褼",
    "襳",
    "跹",
    "蹮",
    "躚",
    "酰",
    "鍁",
    "锨",
    "韯",
    "韱",
    "馦",
    "鱻",
    "鶱",
    "𬸣"
  ],
  "tuō chà duó": ["仛"],
  hóng: [
    "仜",
    "吰",
    "垬",
    "妅",
    "娂",
    "宏",
    "宖",
    "弘",
    "彋",
    "汯",
    "泓",
    "洪",
    "浤",
    "渱",
    "潂",
    "玒",
    "玜",
    "竑",
    "竤",
    "篊",
    "粠",
    "紘",
    "紭",
    "綋",
    "纮",
    "翃",
    "翝",
    "耾",
    "苰",
    "荭",
    "葒",
    "葓",
    "谹",
    "谼",
    "鈜",
    "鉷",
    "鋐",
    "閎",
    "闳",
    "霐",
    "霟",
    "鞃",
    "魟",
    "鴻",
    "鸿",
    "黉",
    "黌",
    "𫟹",
    "𬭎"
  ],
  tóng: [
    "仝",
    "佟",
    "哃",
    "峂",
    "峝",
    "庝",
    "彤",
    "晍",
    "曈",
    "桐",
    "氃",
    "浵",
    "潼",
    "犝",
    "獞",
    "眮",
    "瞳",
    "砼",
    "秱",
    "童",
    "粡",
    "膧",
    "茼",
    "蚒",
    "詷",
    "赨",
    "酮",
    "鉖",
    "鉵",
    "銅",
    "铜",
    "餇",
    "鮦",
    "鲖",
    "𫍣",
    "𦒍"
  ],
  rèn: [
    "仞",
    "仭",
    "刃",
    "刄",
    "妊",
    "姙",
    "屻",
    "岃",
    "扨",
    "牣",
    "祍",
    "紉",
    "紝",
    "絍",
    "纫",
    "纴",
    "肕",
    "腍",
    "衽",
    "袵",
    "訒",
    "認",
    "认",
    "讱",
    "軔",
    "轫",
    "鈓",
    "靭",
    "靱",
    "韌",
    "韧",
    "飪",
    "餁",
    "饪"
  ],
  qiān: [
    "仟",
    "佥",
    "僉",
    "千",
    "圲",
    "奷",
    "孯",
    "岍",
    "悭",
    "愆",
    "慳",
    "扦",
    "拪",
    "搴",
    "撁",
    "攐",
    "攑",
    "攓",
    "杄",
    "櫏",
    "汘",
    "汧",
    "牵",
    "牽",
    "竏",
    "签",
    "簽",
    "籖",
    "籤",
    "粁",
    "芊",
    "茾",
    "蚈",
    "褰",
    "諐",
    "謙",
    "谦",
    "谸",
    "迁",
    "遷",
    "釺",
    "鈆",
    "鉛",
    "鏲",
    "钎",
    "阡",
    "韆",
    "顅",
    "騫",
    "骞",
    "鬜",
    "鬝",
    "鵮",
    "鹐"
  ],
  "gǎn hàn": ["仠"],
  "yì gē": ["仡"],
  dài: [
    "代",
    "侢",
    "叇",
    "垈",
    "埭",
    "岱",
    "帒",
    "带",
    "帯",
    "帶",
    "廗",
    "怠",
    "戴",
    "曃",
    "柋",
    "殆",
    "瀻",
    "玳",
    "瑇",
    "甙",
    "簤",
    "紿",
    "緿",
    "绐",
    "艜",
    "蝳",
    "袋",
    "襶",
    "貣",
    "贷",
    "蹛",
    "軑",
    "軚",
    "軩",
    "轪",
    "迨",
    "霴",
    "靆",
    "鴏",
    "黛",
    "黱"
  ],
  "lìng líng lǐng": ["令"],
  chào: ["仦", "耖", "觘"],
  "cháng zhǎng": ["仧", "兏", "長", "长"],
  sā: ["仨"],
  cháng: [
    "仩",
    "偿",
    "償",
    "嘗",
    "嚐",
    "嫦",
    "尝",
    "常",
    "徜",
    "瑺",
    "瓺",
    "甞",
    "肠",
    "腸",
    "膓",
    "苌",
    "萇",
    "镸",
    "鱨",
    "鲿"
  ],
  yí: [
    "仪",
    "侇",
    "儀",
    "冝",
    "匜",
    "咦",
    "圯",
    "夷",
    "姨",
    "宐",
    "宜",
    "宧",
    "寲",
    "峓",
    "嶬",
    "嶷",
    "巸",
    "彛",
    "彜",
    "彝",
    "彞",
    "怡",
    "恞",
    "扅",
    "暆",
    "栘",
    "椬",
    "椸",
    "沂",
    "洟",
    "熪",
    "瓵",
    "痍",
    "移",
    "簃",
    "籎",
    "羠",
    "胰",
    "萓",
    "蛦",
    "螔",
    "觺",
    "謻",
    "貽",
    "贻",
    "跠",
    "迻",
    "遺",
    "鏔",
    "頉",
    "頤",
    "頥",
    "顊",
    "颐",
    "饴",
    "鮧",
    "鴺"
  ],
  mù: [
    "仫",
    "凩",
    "募",
    "墓",
    "幕",
    "幙",
    "慔",
    "慕",
    "暮",
    "暯",
    "木",
    "楘",
    "毣",
    "沐",
    "炑",
    "牧",
    "狇",
    "目",
    "睦",
    "穆",
    "艒",
    "苜",
    "莯",
    "蚞",
    "鉬",
    "钼",
    "雮",
    "霂"
  ],
  "men mén": ["们"],
  fǎn: ["仮", "反", "橎", "返"],
  "chào miǎo": ["仯"],
  "yǎng áng": ["仰"],
  zhòng: [
    "仲",
    "众",
    "堹",
    "妕",
    "媑",
    "狆",
    "眾",
    "祌",
    "筗",
    "茽",
    "蚛",
    "衆",
    "衶",
    "諥"
  ],
  "pǐ pí": ["仳"],
  wò: [
    "仴",
    "偓",
    "卧",
    "媉",
    "幄",
    "握",
    "楃",
    "沃",
    "渥",
    "濣",
    "瓁",
    "瞃",
    "硪",
    "肟",
    "腛",
    "臥",
    "齷",
    "龌"
  ],
  jiàn: [
    "件",
    "俴",
    "健",
    "僭",
    "剑",
    "剣",
    "剱",
    "劍",
    "劎",
    "劒",
    "劔",
    "墹",
    "寋",
    "建",
    "徤",
    "擶",
    "旔",
    "楗",
    "毽",
    "洊",
    "涧",
    "澗",
    "牮",
    "珔",
    "瞷",
    "磵",
    "礀",
    "箭",
    "糋",
    "繝",
    "腱",
    "臶",
    "舰",
    "艦",
    "荐",
    "薦",
    "覸",
    "諓",
    "諫",
    "譛",
    "谏",
    "賎",
    "賤",
    "贱",
    "趝",
    "践",
    "踐",
    "踺",
    "轞",
    "鉴",
    "鍳",
    "鍵",
    "鐱",
    "鑑",
    "鑒",
    "鑬",
    "鑳",
    "键",
    "間",
    "餞",
    "饯",
    "𬣡"
  ],
  "jià jiè jie": ["价"],
  "yǎo fó": ["仸"],
  "rèn rén": ["任"],
  "fèn bīn": ["份"],
  dī: [
    "仾",
    "低",
    "啲",
    "埞",
    "堤",
    "岻",
    "彽",
    "樀",
    "滴",
    "磾",
    "秪",
    "羝",
    "袛",
    "趆",
    "隄",
    "鞮",
    "䃅"
  ],
  fǎng: [
    "仿",
    "倣",
    "旊",
    "昉",
    "昘",
    "瓬",
    "眆",
    "紡",
    "纺",
    "舫",
    "訪",
    "访",
    "髣",
    "鶭"
  ],
  zhōng: [
    "伀",
    "刣",
    "妐",
    "幒",
    "彸",
    "忠",
    "柊",
    "汷",
    "泈",
    "炂",
    "盅",
    "籦",
    "終",
    "终",
    "舯",
    "蔠",
    "蜙",
    "螤",
    "螽",
    "衳",
    "衷",
    "蹱",
    "鈡",
    "鍾",
    "鐘",
    "钟",
    "锺",
    "鴤",
    "鼨"
  ],
  pèi: [
    "伂",
    "佩",
    "姵",
    "帔",
    "斾",
    "旆",
    "沛",
    "浿",
    "珮",
    "蓜",
    "轡",
    "辔",
    "配",
    "霈",
    "馷"
  ],
  diào: [
    "伄",
    "吊",
    "弔",
    "掉",
    "瘹",
    "盄",
    "窎",
    "窵",
    "竨",
    "訋",
    "釣",
    "鈟",
    "銱",
    "鋽",
    "鑃",
    "钓",
    "铞",
    "雿",
    "魡"
  ],
  dùn: [
    "伅",
    "潡",
    "炖",
    "燉",
    "盾",
    "砘",
    "碷",
    "踲",
    "逇",
    "遁",
    "遯",
    "鈍",
    "钝"
  ],
  wěn: ["伆", "刎", "吻", "呅", "抆", "桽", "稳", "穏", "穩", "紊", "肳", "脗"],
  xǐn: ["伈"],
  kàng: ["伉", "匟", "囥", "抗", "炕", "鈧", "钪"],
  ài: [
    "伌",
    "僾",
    "塧",
    "壒",
    "嫒",
    "嬡",
    "愛",
    "懓",
    "暧",
    "曖",
    "爱",
    "瑷",
    "璦",
    "皧",
    "瞹",
    "砹",
    "硋",
    "碍",
    "礙",
    "薆",
    "譺",
    "賹",
    "鑀",
    "隘",
    "靉",
    "餲",
    "馤",
    "鱫",
    "鴱"
  ],
  "jì qí": ["伎", "薺"],
  "xiū xǔ": ["休"],
  "jìn yín": ["伒"],
  dǎn: [
    "伔",
    "刐",
    "撢",
    "玬",
    "瓭",
    "紞",
    "胆",
    "膽",
    "衴",
    "賧",
    "赕",
    "黕",
    "𬘘"
  ],
  fū: [
    "伕",
    "呋",
    "娐",
    "孵",
    "尃",
    "怤",
    "懯",
    "敷",
    "旉",
    "玞",
    "砆",
    "稃",
    "筟",
    "糐",
    "綒",
    "肤",
    "膚",
    "荂",
    "荴",
    "衭",
    "趺",
    "跗",
    "邞",
    "鄜",
    "酜",
    "鈇",
    "麩",
    "麬",
    "麱",
    "麸",
    "𫓧"
  ],
  tǎng: [
    "伖",
    "傥",
    "儻",
    "埫",
    "戃",
    "曭",
    "爣",
    "矘",
    "躺",
    "鎲",
    "钂",
    "镋"
  ],
  yōu: [
    "优",
    "優",
    "呦",
    "嚘",
    "峳",
    "幽",
    "忧",
    "悠",
    "憂",
    "攸",
    "櫌",
    "滺",
    "瀀",
    "纋",
    "羪",
    "耰",
    "逌",
    "鄾",
    "麀"
  ],
  huǒ: ["伙", "夥", "火", "煷", "邩", "鈥", "钬"],
  "huì kuài": ["会", "會", "浍", "璯"],
  yǔ: [
    "伛",
    "俁",
    "俣",
    "偊",
    "傴",
    "匬",
    "噳",
    "圄",
    "圉",
    "宇",
    "寙",
    "屿",
    "嶼",
    "庾",
    "挧",
    "敔",
    "斞",
    "楀",
    "瑀",
    "瘐",
    "祤",
    "禹",
    "穥",
    "窳",
    "羽",
    "與",
    "萭",
    "貐",
    "鄅",
    "頨",
    "麌",
    "齬",
    "龉",
    "㺄"
  ],
  cuì: [
    "伜",
    "啛",
    "忰",
    "悴",
    "毳",
    "淬",
    "焠",
    "疩",
    "瘁",
    "竁",
    "粋",
    "粹",
    "紣",
    "綷",
    "翆",
    "翠",
    "脃",
    "脆",
    "脺",
    "膬",
    "膵",
    "臎",
    "萃",
    "襊",
    "顇"
  ],
  sǎn: ["伞", "傘", "糤", "繖", "饊", "馓"],
  wěi: [
    "伟",
    "伪",
    "偉",
    "偽",
    "僞",
    "儰",
    "娓",
    "寪",
    "屗",
    "崣",
    "嶉",
    "徫",
    "愇",
    "捤",
    "暐",
    "梶",
    "洧",
    "浘",
    "渨",
    "炜",
    "煒",
    "猥",
    "玮",
    "瑋",
    "痿",
    "緯",
    "纬",
    "腲",
    "艉",
    "芛",
    "苇",
    "荱",
    "萎",
    "葦",
    "蒍",
    "蔿",
    "蜼",
    "諉",
    "诿",
    "踓",
    "鍡",
    "韑",
    "韙",
    "韡",
    "韪",
    "頠",
    "颹",
    "骩",
    "骪",
    "骫",
    "鮪",
    "鲔",
    "𫇭",
    "𬀩",
    "𬱟"
  ],
  "chuán zhuàn": ["传", "傳"],
  "chē jū": ["伡", "俥", "车"],
  "jū chē": ["車"],
  yá: [
    "伢",
    "厑",
    "厓",
    "堐",
    "岈",
    "崕",
    "崖",
    "涯",
    "漄",
    "牙",
    "玡",
    "琊",
    "睚",
    "笌",
    "芽",
    "蚜",
    "衙",
    "齖"
  ],
  qiàn: [
    "伣",
    "俔",
    "倩",
    "儙",
    "刋",
    "壍",
    "嬱",
    "悓",
    "棈",
    "椠",
    "槧",
    "欠",
    "歉",
    "皘",
    "篏",
    "篟",
    "縴",
    "芡",
    "蒨",
    "蔳",
    "輤",
    "𬘬"
  ],
  shāng: [
    "伤",
    "傷",
    "商",
    "墒",
    "慯",
    "殇",
    "殤",
    "滳",
    "漡",
    "熵",
    "蔏",
    "螪",
    "觞",
    "觴",
    "謪",
    "鬺"
  ],
  chāng: [
    "伥",
    "倀",
    "娼",
    "昌",
    "椙",
    "淐",
    "猖",
    "琩",
    "菖",
    "裮",
    "錩",
    "锠",
    "閶",
    "阊",
    "鯧",
    "鲳",
    "鼚"
  ],
  "chen cāng": ["伧"],
  xùn: [
    "伨",
    "侚",
    "卂",
    "噀",
    "巺",
    "巽",
    "徇",
    "愻",
    "殉",
    "殾",
    "汛",
    "潠",
    "狥",
    "蕈",
    "訊",
    "訓",
    "訙",
    "训",
    "讯",
    "迅",
    "迿",
    "逊",
    "遜",
    "鑂",
    "顨",
    "馴",
    "驯"
  ],
  xìn: ["伩", "囟", "孞", "脪", "舋", "衅", "訫", "釁", "阠", "顖"],
  chǐ: [
    "伬",
    "侈",
    "卶",
    "叺",
    "呎",
    "垑",
    "恥",
    "歯",
    "耻",
    "肔",
    "胣",
    "蚇",
    "裭",
    "褫",
    "豉",
    "鉹",
    "齒",
    "齿"
  ],
  "xián xuán": ["伭"],
  "nú nǔ": ["伮"],
  "bó bǎi": ["伯"],
  "gū gù": ["估"],
  nǐ: ["伱", "你", "儞", "孴", "拟", "擬", "旎", "晲", "狔", "苨", "薿", "隬"],
  "nì ní": ["伲"],
  bàn: [
    "伴",
    "办",
    "半",
    "姅",
    "怑",
    "扮",
    "瓣",
    "秚",
    "絆",
    "绊",
    "辦",
    "鉡",
    "靽"
  ],
  xù: [
    "伵",
    "侐",
    "勖",
    "勗",
    "卹",
    "叙",
    "垿",
    "壻",
    "婿",
    "序",
    "恤",
    "敍",
    "敘",
    "旭",
    "昫",
    "朂",
    "槒",
    "欰",
    "殈",
    "汿",
    "沀",
    "洫",
    "溆",
    "漵",
    "潊",
    "烅",
    "烼",
    "煦",
    "獝",
    "珬",
    "盢",
    "瞁",
    "稸",
    "絮",
    "続",
    "緒",
    "緖",
    "續",
    "绪",
    "续",
    "聓",
    "聟",
    "蓄",
    "藚",
    "訹",
    "賉",
    "酗",
    "頊",
    "鱮",
    "㳚"
  ],
  zhòu: [
    "伷",
    "僽",
    "冑",
    "呪",
    "咒",
    "咮",
    "宙",
    "昼",
    "晝",
    "甃",
    "皱",
    "皺",
    "籀",
    "籒",
    "籕",
    "粙",
    "紂",
    "縐",
    "纣",
    "绉",
    "胄",
    "荮",
    "葤",
    "詋",
    "酎",
    "駎",
    "驟",
    "骤",
    "㤘",
    "㑇"
  ],
  shēn: [
    "伸",
    "侁",
    "兟",
    "呻",
    "堔",
    "妽",
    "娠",
    "屾",
    "峷",
    "扟",
    "敒",
    "曑",
    "柛",
    "氠",
    "深",
    "燊",
    "珅",
    "甡",
    "甧",
    "申",
    "眒",
    "砷",
    "穼",
    "籶",
    "籸",
    "糂",
    "紳",
    "绅",
    "罙",
    "罧",
    "葠",
    "蓡",
    "蔘",
    "薓",
    "裑",
    "訷",
    "詵",
    "诜",
    "身",
    "駪",
    "鯓",
    "鯵",
    "鰺",
    "鲹",
    "鵢",
    "𬳽"
  ],
  qū: [
    "伹",
    "佉",
    "匤",
    "呿",
    "坥",
    "屈",
    "岖",
    "岴",
    "嶇",
    "憈",
    "抾",
    "敺",
    "浀",
    "煀",
    "祛",
    "筁",
    "粬",
    "胠",
    "蛆",
    "蛐",
    "袪",
    "覻",
    "詘",
    "诎",
    "趍",
    "躯",
    "軀",
    "阹",
    "駆",
    "駈",
    "驅",
    "驱",
    "髷",
    "魼",
    "鰸",
    "鱋",
    "鶌",
    "麯",
    "麴",
    "麹",
    "黢",
    "㭕",
    "𪨰",
    "䓛"
  ],
  "sì cì": ["伺"],
  bēng: ["伻", "嘣", "奟", "崩", "嵭", "閍"],
  "sì shì": ["似"],
  "jiā qié gā": ["伽"],
  "yǐ chì": ["佁"],
  "diàn tián": ["佃", "钿"],
  "hān gàn": ["佄"],
  mài: [
    "佅",
    "劢",
    "勱",
    "卖",
    "唛",
    "売",
    "脈",
    "衇",
    "賣",
    "迈",
    "邁",
    "霡",
    "霢",
    "麥",
    "麦",
    "鿏"
  ],
  dàn: [
    "但",
    "僤",
    "啖",
    "啗",
    "啿",
    "噉",
    "嚪",
    "帎",
    "憺",
    "旦",
    "柦",
    "氮",
    "沊",
    "泹",
    "淡",
    "狚",
    "疍",
    "癚",
    "禫",
    "窞",
    "腅",
    "萏",
    "蓞",
    "蛋",
    "蜑",
    "觛",
    "訑",
    "誕",
    "诞",
    "贉",
    "霮",
    "餤",
    "饏",
    "駳",
    "髧",
    "鴠",
    "𫢸"
  ],
  bù: [
    "佈",
    "勏",
    "吥",
    "咘",
    "埗",
    "埠",
    "布",
    "廍",
    "怖",
    "悑",
    "步",
    "歨",
    "歩",
    "瓿",
    "篰",
    "荹",
    "蔀",
    "踄",
    "部",
    "郶",
    "鈈",
    "钚",
    "餢"
  ],
  bǐ: [
    "佊",
    "俾",
    "匕",
    "夶",
    "妣",
    "彼",
    "朼",
    "柀",
    "比",
    "毞",
    "沘",
    "疕",
    "秕",
    "笔",
    "筆",
    "粃",
    "聛",
    "舭",
    "貏",
    "鄙"
  ],
  "zhāo shào": ["佋"],
  cǐ: ["佌", "此", "泚", "皉", "𫚖"],
  wèi: [
    "位",
    "卫",
    "味",
    "喂",
    "墛",
    "媦",
    "慰",
    "懀",
    "未",
    "渭",
    "煟",
    "熭",
    "犚",
    "猬",
    "畏",
    "緭",
    "罻",
    "胃",
    "苿",
    "菋",
    "藯",
    "蘶",
    "蝟",
    "螱",
    "衛",
    "衞",
    "褽",
    "謂",
    "讆",
    "讏",
    "谓",
    "躗",
    "躛",
    "軎",
    "轊",
    "鏏",
    "霨",
    "餧",
    "餵",
    "饖",
    "魏",
    "鮇",
    "鳚"
  ],
  zuǒ: ["佐", "左", "繓"],
  yǎng: [
    "佒",
    "傟",
    "养",
    "坱",
    "岟",
    "慃",
    "懩",
    "攁",
    "氧",
    "氱",
    "炴",
    "痒",
    "癢",
    "礢",
    "紻",
    "蝆",
    "軮",
    "養",
    "駚"
  ],
  "tǐ tī": ["体", "體"],
  zhàn: [
    "佔",
    "偡",
    "嶘",
    "战",
    "戦",
    "戰",
    "栈",
    "桟",
    "棧",
    "湛",
    "站",
    "綻",
    "绽",
    "菚",
    "蘸",
    "虥",
    "虦",
    "譧",
    "轏",
    "驏"
  ],
  "hé hē hè": ["何"],
  bì: [
    "佖",
    "咇",
    "哔",
    "嗶",
    "坒",
    "堛",
    "壁",
    "奰",
    "妼",
    "婢",
    "嬖",
    "币",
    "幣",
    "幤",
    "庇",
    "庳",
    "廦",
    "弊",
    "弻",
    "弼",
    "彃",
    "必",
    "怭",
    "愊",
    "愎",
    "敝",
    "斃",
    "梐",
    "毕",
    "毖",
    "毙",
    "湢",
    "滗",
    "滭",
    "潷",
    "煏",
    "熚",
    "狴",
    "獘",
    "獙",
    "珌",
    "璧",
    "畀",
    "畢",
    "疪",
    "痹",
    "痺",
    "皕",
    "睤",
    "碧",
    "筚",
    "箅",
    "箆",
    "篦",
    "篳",
    "粊",
    "綼",
    "縪",
    "繴",
    "罼",
    "腷",
    "苾",
    "荜",
    "萆",
    "萞",
    "蓖",
    "蓽",
    "蔽",
    "薜",
    "蜌",
    "袐",
    "襅",
    "襞",
    "襣",
    "觱",
    "詖",
    "诐",
    "貱",
    "贔",
    "赑",
    "跸",
    "蹕",
    "躃",
    "躄",
    "避",
    "邲",
    "鄨",
    "鄪",
    "鉍",
    "鏎",
    "鐴",
    "铋",
    "閇",
    "閉",
    "閟",
    "闭",
    "陛",
    "韠",
    "飶",
    "饆",
    "馝",
    "駜",
    "驆",
    "髀",
    "魓",
    "鮅",
    "鷝",
    "鷩",
    "鼊"
  ],
  tuó: [
    "佗",
    "坨",
    "堶",
    "岮",
    "槖",
    "橐",
    "沱",
    "砣",
    "砤",
    "碢",
    "紽",
    "詑",
    "跎",
    "酡",
    "阤",
    "陀",
    "陁",
    "駝",
    "駞",
    "騨",
    "驒",
    "驝",
    "驼",
    "鮀",
    "鴕",
    "鸵",
    "鼉",
    "鼍",
    "鼧",
    "𬶍"
  ],
  shé: ["佘", "舌", "虵", "蛥"],
  "yì dié": ["佚", "昳", "泆", "軼"],
  "fó fú bì bó": ["佛"],
  "zuò zuō": ["作"],
  gōu: [
    "佝",
    "沟",
    "溝",
    "痀",
    "篝",
    "簼",
    "緱",
    "缑",
    "袧",
    "褠",
    "鈎",
    "鉤",
    "钩",
    "鞲",
    "韝"
  ],
  nìng: ["佞", "侫", "倿", "寕", "泞", "澝", "濘"],
  qú: [
    "佢",
    "劬",
    "戵",
    "斪",
    "欋",
    "欔",
    "氍",
    "淭",
    "灈",
    "爠",
    "璖",
    "璩",
    "癯",
    "磲",
    "籧",
    "絇",
    "胊",
    "臞",
    "菃",
    "葋",
    "蕖",
    "蘧",
    "蟝",
    "蠷",
    "蠼",
    "衐",
    "衢",
    "躣",
    "軥",
    "鑺",
    "鴝",
    "鸜",
    "鸲",
    "鼩"
  ],
  "yōng yòng": ["佣"],
  wǎ: ["佤", "咓", "砙", "邷"],
  kǎ: ["佧", "垰", "胩", "裃", "鉲"],
  bāo: [
    "佨",
    "勹",
    "包",
    "孢",
    "煲",
    "笣",
    "胞",
    "苞",
    "蕔",
    "裦",
    "褒",
    "襃",
    "闁",
    "齙",
    "龅"
  ],
  "huái huí": ["佪"],
  "gé hè": ["佫"],
  lǎo: [
    "佬",
    "咾",
    "恅",
    "栳",
    "狫",
    "珯",
    "硓",
    "老",
    "耂",
    "荖",
    "蛯",
    "轑",
    "銠",
    "铑",
    "鮱"
  ],
  xiáng: ["佭", "庠", "栙", "祥", "絴", "翔", "詳", "跭"],
  gé: [
    "佮",
    "匌",
    "呄",
    "嗝",
    "塥",
    "愅",
    "挌",
    "搿",
    "槅",
    "櫊",
    "滆",
    "膈",
    "臵",
    "茖",
    "觡",
    "諽",
    "輵",
    "轕",
    "閣",
    "阁",
    "隔",
    "鞷",
    "韐",
    "韚",
    "騔",
    "骼",
    "鮯"
  ],
  yáng: [
    "佯",
    "劷",
    "垟",
    "崸",
    "徉",
    "扬",
    "揚",
    "敭",
    "旸",
    "昜",
    "暘",
    "杨",
    "楊",
    "洋",
    "炀",
    "珜",
    "疡",
    "瘍",
    "眻",
    "蛘",
    "諹",
    "輰",
    "鍚",
    "钖",
    "阦",
    "阳",
    "陽",
    "霷",
    "颺",
    "飏",
    "鰑",
    "鴹",
    "鸉"
  ],
  bǎi: ["佰", "捭", "摆", "擺", "栢", "百", "竡", "粨", "襬"],
  fǎ: ["佱", "峜", "法", "灋", "砝", "鍅"],
  mǐng: ["佲", "凕", "姳", "慏", "酩"],
  "èr nài": ["佴"],
  hěn: ["佷", "很", "狠", "詪", "𬣳"],
  huó: ["佸", "活"],
  guǐ: [
    "佹",
    "匦",
    "匭",
    "厬",
    "垝",
    "姽",
    "宄",
    "庋",
    "庪",
    "恑",
    "晷",
    "湀",
    "癸",
    "祪",
    "簋",
    "蛫",
    "蟡",
    "觤",
    "詭",
    "诡",
    "軌",
    "轨",
    "陒",
    "鬼"
  ],
  quán: [
    "佺",
    "全",
    "啳",
    "埢",
    "姾",
    "峑",
    "巏",
    "拳",
    "搼",
    "权",
    "楾",
    "権",
    "權",
    "泉",
    "洤",
    "湶",
    "牷",
    "犈",
    "瑔",
    "痊",
    "硂",
    "筌",
    "縓",
    "荃",
    "葲",
    "蜷",
    "蠸",
    "觠",
    "詮",
    "诠",
    "跧",
    "踡",
    "輇",
    "辁",
    "醛",
    "銓",
    "铨",
    "闎",
    "顴",
    "颧",
    "駩",
    "騡",
    "鬈",
    "鰁",
    "鳈",
    "齤"
  ],
  tiāo: ["佻", "庣", "旫", "祧", "聎"],
  jiǎo: [
    "佼",
    "儌",
    "孂",
    "挢",
    "搅",
    "撟",
    "撹",
    "攪",
    "敫",
    "敽",
    "敿",
    "晈",
    "暞",
    "曒",
    "灚",
    "燞",
    "狡",
    "璬",
    "皎",
    "皦",
    "絞",
    "纐",
    "绞",
    "腳",
    "臫",
    "蟜",
    "譑",
    "賋",
    "踋",
    "鉸",
    "铰",
    "餃",
    "饺",
    "鱎",
    "龣"
  ],
  cì: [
    "佽",
    "刾",
    "庛",
    "朿",
    "栨",
    "次",
    "絘",
    "茦",
    "莿",
    "蛓",
    "螆",
    "賜",
    "赐"
  ],
  xíng: [
    "侀",
    "刑",
    "哘",
    "型",
    "娙",
    "形",
    "洐",
    "硎",
    "蛵",
    "邢",
    "郉",
    "鈃",
    "鉶",
    "銒",
    "钘",
    "铏",
    "陉",
    "陘",
    "餳",
    "𫰛"
  ],
  tuō: [
    "侂",
    "咃",
    "咜",
    "圫",
    "托",
    "拕",
    "拖",
    "汑",
    "脫",
    "脱",
    "莌",
    "袥",
    "託",
    "讬",
    "飥",
    "饦",
    "魠",
    "鮵"
  ],
  kǎn: ["侃", "偘", "冚", "坎", "惂", "砍", "莰", "輡", "轗", "顑"],
  zhí: [
    "侄",
    "値",
    "值",
    "埴",
    "執",
    "姪",
    "嬂",
    "戠",
    "执",
    "摭",
    "植",
    "樴",
    "淔",
    "漐",
    "直",
    "禃",
    "絷",
    "縶",
    "聀",
    "职",
    "職",
    "膱",
    "蟙",
    "跖",
    "踯",
    "蹠",
    "躑",
    "軄",
    "釞",
    "馽"
  ],
  gāi: [
    "侅",
    "垓",
    "姟",
    "峐",
    "晐",
    "畡",
    "祴",
    "荄",
    "該",
    "该",
    "豥",
    "賅",
    "賌",
    "赅",
    "陔"
  ],
  lái: [
    "來",
    "俫",
    "倈",
    "崃",
    "崍",
    "庲",
    "来",
    "梾",
    "棶",
    "涞",
    "淶",
    "猍",
    "琜",
    "筙",
    "箂",
    "莱",
    "萊",
    "逨",
    "郲",
    "錸",
    "铼",
    "騋",
    "鯠",
    "鶆",
    "麳"
  ],
  kuǎ: ["侉", "咵", "垮", "銙"],
  gōng: [
    "侊",
    "公",
    "功",
    "匑",
    "匔",
    "塨",
    "宫",
    "宮",
    "工",
    "幊",
    "弓",
    "恭",
    "攻",
    "杛",
    "碽",
    "糼",
    "糿",
    "肱",
    "觥",
    "觵",
    "躬",
    "躳",
    "髸",
    "龔",
    "龚",
    "䢼"
  ],
  lì: [
    "例",
    "俐",
    "俪",
    "傈",
    "儮",
    "儷",
    "凓",
    "利",
    "力",
    "励",
    "勵",
    "历",
    "厉",
    "厤",
    "厯",
    "厲",
    "叓",
    "吏",
    "呖",
    "唎",
    "唳",
    "嚦",
    "囇",
    "坜",
    "塛",
    "壢",
    "娳",
    "婯",
    "屴",
    "岦",
    "悧",
    "悷",
    "慄",
    "戾",
    "搮",
    "暦",
    "曆",
    "曞",
    "朸",
    "枥",
    "栃",
    "栗",
    "栛",
    "檪",
    "櫔",
    "櫪",
    "欐",
    "歴",
    "歷",
    "沥",
    "沴",
    "涖",
    "溧",
    "濿",
    "瀝",
    "爏",
    "犡",
    "猁",
    "珕",
    "瑮",
    "瓅",
    "瓑",
    "瓥",
    "疬",
    "痢",
    "癧",
    "盭",
    "睙",
    "砅",
    "砺",
    "砾",
    "磿",
    "礪",
    "礫",
    "礰",
    "禲",
    "秝",
    "立",
    "笠",
    "篥",
    "粒",
    "粝",
    "糲",
    "脷",
    "苈",
    "茘",
    "荔",
    "莅",
    "莉",
    "蒚",
    "蒞",
    "藶",
    "蚸",
    "蛎",
    "蛠",
    "蜧",
    "蝷",
    "蠇",
    "蠣",
    "詈",
    "讈",
    "赲",
    "轢",
    "轣",
    "轹",
    "酈",
    "鉝",
    "隶",
    "隷",
    "雳",
    "靂",
    "靋",
    "鬁",
    "鳨",
    "鴗",
    "鷅",
    "麜",
    "𫵷",
    "𬍛"
  ],
  yīn: [
    "侌",
    "凐",
    "喑",
    "噾",
    "囙",
    "因",
    "垔",
    "堙",
    "姻",
    "婣",
    "愔",
    "慇",
    "栶",
    "氤",
    "洇",
    "溵",
    "濦",
    "瘖",
    "禋",
    "秵",
    "筃",
    "絪",
    "緸",
    "茵",
    "蒑",
    "蔭",
    "裀",
    "諲",
    "銦",
    "铟",
    "闉",
    "阥",
    "阴",
    "陰",
    "陻",
    "隂",
    "霒",
    "霠",
    "鞇",
    "音",
    "韾",
    "駰",
    "骃",
    "齗",
    "𬘡",
    "𬤇",
    "𬮱"
  ],
  mǐ: [
    "侎",
    "孊",
    "弭",
    "敉",
    "洣",
    "渳",
    "灖",
    "米",
    "粎",
    "羋",
    "脒",
    "芈",
    "葞",
    "蔝",
    "銤"
  ],
  zhū: [
    "侏",
    "株",
    "槠",
    "橥",
    "櫧",
    "櫫",
    "洙",
    "潴",
    "瀦",
    "猪",
    "珠",
    "硃",
    "秼",
    "絑",
    "茱",
    "蕏",
    "蛛",
    "蝫",
    "蠩",
    "袾",
    "誅",
    "諸",
    "诛",
    "诸",
    "豬",
    "跦",
    "邾",
    "銖",
    "铢",
    "駯",
    "鮢",
    "鯺",
    "鴸",
    "鼄"
  ],
  ān: [
    "侒",
    "偣",
    "媕",
    "安",
    "峖",
    "庵",
    "桉",
    "氨",
    "盦",
    "盫",
    "腤",
    "菴",
    "萻",
    "葊",
    "蓭",
    "誝",
    "諳",
    "谙",
    "鞌",
    "鞍",
    "韽",
    "馣",
    "鮟",
    "鵪",
    "鶕",
    "鹌",
    "𩽾"
  ],
  lù: [
    "侓",
    "僇",
    "勎",
    "勠",
    "圥",
    "坴",
    "塶",
    "娽",
    "峍",
    "廘",
    "彔",
    "录",
    "戮",
    "摝",
    "椂",
    "樚",
    "淕",
    "淥",
    "渌",
    "漉",
    "潞",
    "琭",
    "璐",
    "甪",
    "盝",
    "睩",
    "硉",
    "祿",
    "禄",
    "稑",
    "穋",
    "箓",
    "簏",
    "簬",
    "簵",
    "簶",
    "籙",
    "粶",
    "蔍",
    "蕗",
    "虂",
    "螰",
    "賂",
    "赂",
    "趢",
    "路",
    "踛",
    "蹗",
    "輅",
    "轆",
    "辂",
    "辘",
    "逯",
    "醁",
    "錄",
    "録",
    "錴",
    "鏴",
    "陸",
    "騄",
    "騼",
    "鯥",
    "鴼",
    "鵦",
    "鵱",
    "鷺",
    "鹭",
    "鹿",
    "麓",
    "𫘧"
  ],
  móu: ["侔", "劺", "恈", "眸", "蛑", "謀", "谋", "踎", "鍪", "鴾", "麰"],
  ér: [
    "侕",
    "儿",
    "児",
    "兒",
    "峏",
    "栭",
    "洏",
    "粫",
    "而",
    "胹",
    "荋",
    "袻",
    "輀",
    "轜",
    "陑",
    "隭",
    "髵",
    "鮞",
    "鲕",
    "鴯",
    "鸸"
  ],
  "dòng tǒng tóng": ["侗"],
  chà: ["侘", "奼", "姹", "岔", "汊", "詫", "诧"],
  chì: [
    "侙",
    "傺",
    "勅",
    "勑",
    "叱",
    "啻",
    "彳",
    "恜",
    "慗",
    "憏",
    "懘",
    "抶",
    "敕",
    "斥",
    "杘",
    "湁",
    "灻",
    "炽",
    "烾",
    "熾",
    "痓",
    "痸",
    "瘛",
    "翄",
    "翅",
    "翤",
    "翨",
    "腟",
    "赤",
    "趩",
    "遫",
    "鉓",
    "雴",
    "飭",
    "饬",
    "鶒",
    "鷘"
  ],
  "gòng gōng": ["供", "共"],
  zhōu: [
    "侜",
    "周",
    "喌",
    "州",
    "徟",
    "洲",
    "淍",
    "炿",
    "烐",
    "珘",
    "矪",
    "舟",
    "謅",
    "譸",
    "诌",
    "賙",
    "赒",
    "輈",
    "輖",
    "辀",
    "週",
    "郮",
    "銂",
    "霌",
    "駲",
    "騆",
    "鵃",
    "鸼"
  ],
  rú: [
    "侞",
    "儒",
    "嚅",
    "如",
    "嬬",
    "孺",
    "帤",
    "曘",
    "桇",
    "渪",
    "濡",
    "筎",
    "茹",
    "蕠",
    "薷",
    "蝡",
    "蠕",
    "袽",
    "襦",
    "邚",
    "醹",
    "銣",
    "铷",
    "顬",
    "颥",
    "鱬",
    "鴑",
    "鴽"
  ],
  "jiàn cún": ["侟"],
  xiá: [
    "侠",
    "俠",
    "匣",
    "峡",
    "峽",
    "敮",
    "暇",
    "柙",
    "炠",
    "烚",
    "狎",
    "狭",
    "狹",
    "珨",
    "瑕",
    "硖",
    "硤",
    "碬",
    "祫",
    "筪",
    "縖",
    "翈",
    "舝",
    "舺",
    "蕸",
    "赮",
    "轄",
    "辖",
    "遐",
    "鍜",
    "鎋",
    "陜",
    "陿",
    "霞",
    "騢",
    "魻",
    "鶷",
    "黠"
  ],
  lǚ: [
    "侣",
    "侶",
    "儢",
    "吕",
    "呂",
    "屡",
    "屢",
    "履",
    "挔",
    "捛",
    "旅",
    "梠",
    "焒",
    "祣",
    "稆",
    "穭",
    "絽",
    "縷",
    "缕",
    "膂",
    "膐",
    "褛",
    "褸",
    "郘",
    "鋁",
    "铝"
  ],
  ta: ["侤"],
  "jiǎo yáo": ["侥", "僥", "徺"],
  zhēn: [
    "侦",
    "偵",
    "寊",
    "帧",
    "帪",
    "幀",
    "搸",
    "斟",
    "桢",
    "楨",
    "榛",
    "樼",
    "殝",
    "浈",
    "湞",
    "潧",
    "澵",
    "獉",
    "珍",
    "珎",
    "瑧",
    "甄",
    "眞",
    "真",
    "砧",
    "碪",
    "祯",
    "禎",
    "禛",
    "箴",
    "胗",
    "臻",
    "葴",
    "蒖",
    "蓁",
    "薽",
    "貞",
    "贞",
    "轃",
    "遉",
    "酙",
    "針",
    "鉁",
    "錱",
    "鍼",
    "针",
    "鱵"
  ],
  "cè zè zhāi": ["侧", "側"],
  kuài: [
    "侩",
    "儈",
    "凷",
    "哙",
    "噲",
    "圦",
    "块",
    "塊",
    "巜",
    "廥",
    "快",
    "旝",
    "欳",
    "狯",
    "獪",
    "筷",
    "糩",
    "脍",
    "膾",
    "郐",
    "鄶",
    "鱠",
    "鲙"
  ],
  chái: ["侪", "儕", "喍", "柴", "犲", "祡", "豺"],
  nóng: [
    "侬",
    "儂",
    "农",
    "哝",
    "噥",
    "檂",
    "欁",
    "浓",
    "濃",
    "燶",
    "禯",
    "秾",
    "穠",
    "脓",
    "膿",
    "蕽",
    "襛",
    "譨",
    "農",
    "辳",
    "醲",
    "鬞",
    "𬪩"
  ],
  jǐn: [
    "侭",
    "儘",
    "卺",
    "厪",
    "巹",
    "槿",
    "漌",
    "瑾",
    "紧",
    "緊",
    "菫",
    "蓳",
    "謹",
    "谨",
    "錦",
    "锦",
    "饉",
    "馑"
  ],
  "hóu hòu": ["侯", "矦"],
  jiǒng: [
    "侰",
    "僒",
    "冏",
    "囧",
    "泂",
    "澃",
    "炯",
    "烱",
    "煚",
    "煛",
    "熲",
    "燛",
    "窘",
    "綗",
    "褧",
    "迥",
    "逈",
    "顈",
    "颎",
    "䌹"
  ],
  "chěng tǐng": ["侱"],
  "zhèn zhēn": ["侲", "揕"],
  zuò: [
    "侳",
    "做",
    "唑",
    "坐",
    "岝",
    "岞",
    "座",
    "祚",
    "糳",
    "胙",
    "葃",
    "葄",
    "蓙",
    "袏",
    "阼"
  ],
  qīn: [
    "侵",
    "兓",
    "媇",
    "嵚",
    "嶔",
    "欽",
    "衾",
    "誛",
    "钦",
    "顉",
    "駸",
    "骎",
    "鮼"
  ],
  jú: [
    "侷",
    "啹",
    "婅",
    "局",
    "巈",
    "椈",
    "橘",
    "泦",
    "淗",
    "湨",
    "焗",
    "犑",
    "狊",
    "粷",
    "菊",
    "蘜",
    "趜",
    "跼",
    "蹫",
    "輂",
    "郹",
    "閰",
    "駶",
    "驧",
    "鵙",
    "鵴",
    "鶪",
    "鼰",
    "鼳",
    "䴗"
  ],
  "shù dōu": ["侸"],
  tǐng: [
    "侹",
    "圢",
    "娗",
    "挺",
    "涏",
    "烶",
    "珽",
    "脡",
    "艇",
    "誔",
    "頲",
    "颋"
  ],
  shèn: [
    "侺",
    "愼",
    "慎",
    "昚",
    "涁",
    "渗",
    "滲",
    "瘆",
    "瘮",
    "眘",
    "祳",
    "肾",
    "胂",
    "脤",
    "腎",
    "蜃",
    "蜄",
    "鋠"
  ],
  "tuì tuó": ["侻"],
  nán: [
    "侽",
    "喃",
    "娚",
    "抩",
    "暔",
    "枏",
    "柟",
    "楠",
    "男",
    "畘",
    "莮",
    "萳",
    "遖"
  ],
  xiāo: [
    "侾",
    "哓",
    "嘵",
    "嚻",
    "囂",
    "婋",
    "宯",
    "宵",
    "庨",
    "彇",
    "揱",
    "枭",
    "枵",
    "梟",
    "櫹",
    "歊",
    "毊",
    "消",
    "潇",
    "瀟",
    "灱",
    "灲",
    "烋",
    "焇",
    "猇",
    "獢",
    "痚",
    "痟",
    "硝",
    "硣",
    "窙",
    "箫",
    "簘",
    "簫",
    "綃",
    "绡",
    "翛",
    "膮",
    "萧",
    "蕭",
    "虈",
    "虓",
    "蟂",
    "蟏",
    "蟰",
    "蠨",
    "踃",
    "逍",
    "銷",
    "销",
    "霄",
    "颵",
    "驍",
    "骁",
    "髇",
    "髐",
    "魈",
    "鴞",
    "鴵",
    "鷍",
    "鸮"
  ],
  "biàn pián": ["便", "緶", "缏"],
  tuǐ: ["俀", "腿", "蹆", "骽"],
  xì: [
    "係",
    "匸",
    "卌",
    "呬",
    "墍",
    "屃",
    "屓",
    "屭",
    "忥",
    "怬",
    "恄",
    "椞",
    "潝",
    "潟",
    "澙",
    "熂",
    "犔",
    "磶",
    "禊",
    "細",
    "綌",
    "縘",
    "细",
    "绤",
    "舃",
    "舄",
    "蕮",
    "虩",
    "衋",
    "覤",
    "赩",
    "趇",
    "郤",
    "釳",
    "阋",
    "隙",
    "隟",
    "霼",
    "餼",
    "饩",
    "鬩",
    "黖"
  ],
  cù: [
    "促",
    "媨",
    "憱",
    "猝",
    "瘄",
    "瘯",
    "簇",
    "縬",
    "脨",
    "蔟",
    "誎",
    "趗",
    "踧",
    "踿",
    "蹙",
    "蹴",
    "蹵",
    "醋",
    "顣",
    "鼀"
  ],
  é: [
    "俄",
    "囮",
    "娥",
    "峉",
    "峨",
    "峩",
    "涐",
    "珴",
    "皒",
    "睋",
    "磀",
    "莪",
    "訛",
    "誐",
    "譌",
    "讹",
    "迗",
    "鈋",
    "鋨",
    "锇",
    "頟",
    "額",
    "额",
    "魤",
    "鵝",
    "鵞",
    "鹅"
  ],
  qiú: [
    "俅",
    "叴",
    "唒",
    "囚",
    "崷",
    "巯",
    "巰",
    "扏",
    "梂",
    "殏",
    "毬",
    "求",
    "汓",
    "泅",
    "浗",
    "湭",
    "煪",
    "犰",
    "玌",
    "球",
    "璆",
    "皳",
    "盚",
    "紌",
    "絿",
    "肍",
    "芁",
    "莍",
    "虬",
    "虯",
    "蛷",
    "裘",
    "觓",
    "觩",
    "訄",
    "訅",
    "賕",
    "赇",
    "逎",
    "逑",
    "遒",
    "酋",
    "釚",
    "釻",
    "銶",
    "頄",
    "鮂",
    "鯄",
    "鰽",
    "鼽",
    "𨱇"
  ],
  xú: ["俆", "徐", "禑"],
  "guàng kuāng": ["俇"],
  kù: [
    "俈",
    "喾",
    "嚳",
    "库",
    "庫",
    "廤",
    "瘔",
    "絝",
    "绔",
    "袴",
    "裤",
    "褲",
    "酷"
  ],
  wù: [
    "俉",
    "务",
    "務",
    "勿",
    "卼",
    "坞",
    "塢",
    "奦",
    "婺",
    "寤",
    "屼",
    "岉",
    "嵨",
    "忢",
    "悞",
    "悟",
    "悮",
    "戊",
    "扤",
    "晤",
    "杌",
    "溩",
    "焐",
    "熃",
    "物",
    "痦",
    "矹",
    "窹",
    "粅",
    "蘁",
    "誤",
    "误",
    "鋈",
    "阢",
    "隖",
    "雾",
    "霚",
    "霧",
    "靰",
    "騖",
    "骛",
    "鶩",
    "鹜",
    "鼿",
    "齀"
  ],
  jùn: [
    "俊",
    "儁",
    "呁",
    "埈",
    "寯",
    "峻",
    "懏",
    "捃",
    "攟",
    "晙",
    "棞",
    "燇",
    "珺",
    "畯",
    "竣",
    "箟",
    "蜠",
    "賐",
    "郡",
    "陖",
    "餕",
    "馂",
    "駿",
    "骏",
    "鵔",
    "鵕",
    "鵘",
    "䐃"
  ],
  liáng: [
    "俍",
    "墚",
    "梁",
    "椋",
    "樑",
    "粮",
    "粱",
    "糧",
    "良",
    "輬",
    "辌",
    "𫟅"
  ],
  zǔ: ["俎", "唨", "爼", "祖", "組", "组", "詛", "诅", "鎺", "阻", "靻"],
  "qiào xiào": ["俏"],
  yǒng: [
    "俑",
    "勇",
    "勈",
    "咏",
    "埇",
    "塎",
    "嵱",
    "彮",
    "怺",
    "恿",
    "悀",
    "惥",
    "愑",
    "愹",
    "慂",
    "柡",
    "栐",
    "永",
    "泳",
    "湧",
    "甬",
    "蛹",
    "詠",
    "踊",
    "踴",
    "鯒",
    "鲬"
  ],
  hùn: ["俒", "倱", "圂", "尡", "慁", "掍", "溷", "焝", "睴", "觨", "諢", "诨"],
  jìng: [
    "俓",
    "傹",
    "境",
    "妌",
    "婙",
    "婧",
    "弪",
    "弳",
    "径",
    "徑",
    "敬",
    "曔",
    "桱",
    "梷",
    "浄",
    "瀞",
    "獍",
    "痉",
    "痙",
    "竞",
    "竟",
    "竫",
    "競",
    "竸",
    "胫",
    "脛",
    "莖",
    "誩",
    "踁",
    "迳",
    "逕",
    "鏡",
    "镜",
    "靖",
    "静",
    "靜",
    "鵛"
  ],
  sàn: ["俕", "閐"],
  pěi: ["俖"],
  sú: ["俗"],
  xī: [
    "俙",
    "僖",
    "兮",
    "凞",
    "卥",
    "厀",
    "吸",
    "唏",
    "唽",
    "嘻",
    "噏",
    "嚱",
    "夕",
    "奚",
    "嬆",
    "嬉",
    "屖",
    "嵠",
    "巇",
    "希",
    "徆",
    "徯",
    "息",
    "悉",
    "悕",
    "惁",
    "惜",
    "昔",
    "晞",
    "晰",
    "晳",
    "曦",
    "析",
    "桸",
    "榽",
    "樨",
    "橀",
    "欷",
    "氥",
    "汐",
    "浠",
    "淅",
    "渓",
    "溪",
    "烯",
    "焁",
    "焈",
    "焟",
    "熄",
    "熈",
    "熙",
    "熹",
    "熺",
    "熻",
    "燨",
    "爔",
    "牺",
    "犀",
    "犠",
    "犧",
    "琋",
    "瘜",
    "皙",
    "睎",
    "瞦",
    "矽",
    "硒",
    "磎",
    "礂",
    "稀",
    "穸",
    "窸",
    "粞",
    "糦",
    "緆",
    "繥",
    "羲",
    "翕",
    "翖",
    "肸",
    "肹",
    "膝",
    "舾",
    "莃",
    "菥",
    "蒠",
    "蜥",
    "螅",
    "蟋",
    "蠵",
    "西",
    "觹",
    "觽",
    "觿",
    "譆",
    "谿",
    "豀",
    "豨",
    "豯",
    "貕",
    "赥",
    "邜",
    "鄎",
    "酅",
    "醯",
    "釸",
    "錫",
    "鏭",
    "鐊",
    "鑴",
    "锡",
    "隵",
    "餏",
    "饎",
    "饻",
    "鯑",
    "鵗",
    "鸂",
    "鼷"
  ],
  lǐ: [
    "俚",
    "娌",
    "峢",
    "峲",
    "李",
    "欚",
    "浬",
    "澧",
    "理",
    "礼",
    "禮",
    "粴",
    "裏",
    "裡",
    "豊",
    "逦",
    "邐",
    "醴",
    "鋰",
    "锂",
    "鯉",
    "鱧",
    "鱱",
    "鲤",
    "鳢"
  ],
  bǎo: [
    "保",
    "堢",
    "媬",
    "宝",
    "寚",
    "寳",
    "寶",
    "珤",
    "緥",
    "葆",
    "藵",
    "褓",
    "賲",
    "靌",
    "飹",
    "飽",
    "饱",
    "駂",
    "鳵",
    "鴇",
    "鸨"
  ],
  "yú shù yù": ["俞"],
  "sì qí": ["俟"],
  "xìn shēn": ["信"],
  xiū: [
    "俢",
    "修",
    "咻",
    "庥",
    "樇",
    "烌",
    "羞",
    "脙",
    "脩",
    "臹",
    "貅",
    "銝",
    "鎀",
    "飍",
    "饈",
    "馐",
    "髤",
    "髹",
    "鮴",
    "鱃",
    "鵂",
    "鸺",
    "䗛"
  ],
  dì: [
    "俤",
    "偙",
    "僀",
    "埊",
    "墑",
    "墬",
    "娣",
    "帝",
    "怟",
    "旳",
    "梊",
    "焍",
    "玓",
    "甋",
    "眱",
    "睇",
    "碲",
    "祶",
    "禘",
    "第",
    "締",
    "缔",
    "腣",
    "菂",
    "蒂",
    "蔕",
    "蝃",
    "蝭",
    "螮",
    "諦",
    "谛",
    "踶",
    "递",
    "逓",
    "遞",
    "遰",
    "鉪",
    "𤧛",
    "䗖"
  ],
  chóu: [
    "俦",
    "儔",
    "嬦",
    "惆",
    "愁",
    "懤",
    "栦",
    "燽",
    "畴",
    "疇",
    "皗",
    "稠",
    "筹",
    "籌",
    "絒",
    "綢",
    "绸",
    "菗",
    "詶",
    "讎",
    "讐",
    "踌",
    "躊",
    "酧",
    "酬",
    "醻",
    "雔",
    "雠",
    "雦"
  ],
  zhì: [
    "俧",
    "偫",
    "儨",
    "制",
    "劕",
    "垁",
    "娡",
    "寘",
    "帙",
    "帜",
    "幟",
    "庢",
    "庤",
    "廌",
    "彘",
    "徏",
    "徝",
    "志",
    "忮",
    "懥",
    "懫",
    "挃",
    "挚",
    "掷",
    "摯",
    "擲",
    "旘",
    "晊",
    "智",
    "栉",
    "桎",
    "梽",
    "櫍",
    "櫛",
    "治",
    "洷",
    "滍",
    "滞",
    "滯",
    "潌",
    "瀄",
    "炙",
    "熫",
    "狾",
    "猘",
    "璏",
    "瓆",
    "痔",
    "痣",
    "礩",
    "祑",
    "秩",
    "秷",
    "稚",
    "稺",
    "穉",
    "窒",
    "紩",
    "緻",
    "置",
    "翐",
    "膣",
    "至",
    "致",
    "芖",
    "蛭",
    "袟",
    "袠",
    "製",
    "覟",
    "觗",
    "觯",
    "觶",
    "誌",
    "豑",
    "豒",
    "貭",
    "質",
    "贄",
    "质",
    "贽",
    "跱",
    "踬",
    "躓",
    "輊",
    "轾",
    "郅",
    "銍",
    "鋕",
    "鑕",
    "铚",
    "锧",
    "陟",
    "隲",
    "雉",
    "駤",
    "騭",
    "騺",
    "驇",
    "骘",
    "鯯",
    "鴙",
    "鷙",
    "鸷",
    "𬃊"
  ],
  "liǎ liǎng": ["俩"],
  jiǎn: [
    "俭",
    "倹",
    "儉",
    "减",
    "剪",
    "堿",
    "弿",
    "彅",
    "戩",
    "戬",
    "拣",
    "挸",
    "捡",
    "揀",
    "撿",
    "枧",
    "柬",
    "梘",
    "检",
    "検",
    "檢",
    "減",
    "湕",
    "瀽",
    "瑐",
    "睑",
    "瞼",
    "硷",
    "碱",
    "礆",
    "笕",
    "筧",
    "简",
    "簡",
    "絸",
    "繭",
    "翦",
    "茧",
    "藆",
    "蠒",
    "裥",
    "襇",
    "襉",
    "襺",
    "詃",
    "謇",
    "謭",
    "譾",
    "谫",
    "趼",
    "蹇",
    "鐗",
    "鬋",
    "鰎",
    "鹸",
    "鹻",
    "鹼"
  ],
  huò: [
    "俰",
    "咟",
    "嚯",
    "嚿",
    "奯",
    "彠",
    "惑",
    "或",
    "擭",
    "旤",
    "曤",
    "檴",
    "沎",
    "湱",
    "瀖",
    "獲",
    "癨",
    "眓",
    "矐",
    "祸",
    "禍",
    "穫",
    "窢",
    "耯",
    "臛",
    "艧",
    "获",
    "蒦",
    "藿",
    "蠖",
    "謋",
    "貨",
    "货",
    "鍃",
    "鑊",
    "镬",
    "雘",
    "霍",
    "靃",
    "韄",
    "㸌"
  ],
  "jù jū": ["俱", "据", "鋸", "锯"],
  xiào: [
    "俲",
    "傚",
    "効",
    "咲",
    "哮",
    "啸",
    "嘋",
    "嘨",
    "嘯",
    "孝",
    "效",
    "斅",
    "斆",
    "歗",
    "涍",
    "熽",
    "笑",
    "詨",
    "誟"
  ],
  pái: ["俳", "徘", "牌", "犤", "猅", "簰", "簲", "輫"],
  biào: ["俵", "鰾", "鳔"],
  "chù tì": ["俶"],
  fèi: [
    "俷",
    "剕",
    "厞",
    "吠",
    "屝",
    "废",
    "廃",
    "廢",
    "昲",
    "曊",
    "櫠",
    "沸",
    "濷",
    "狒",
    "癈",
    "肺",
    "萉",
    "費",
    "费",
    "鐨",
    "镄",
    "陫",
    "靅",
    "鼣"
  ],
  fèng: ["俸", "凤", "奉", "湗", "焨", "煈", "賵", "赗", "鳯", "鳳", "鴌"],
  ǎn: ["俺", "唵", "埯", "揞", "罯", "銨", "铵"],
  bèi: [
    "俻",
    "倍",
    "偝",
    "偹",
    "備",
    "僃",
    "备",
    "悖",
    "惫",
    "愂",
    "憊",
    "昁",
    "梖",
    "焙",
    "牬",
    "犕",
    "狈",
    "狽",
    "珼",
    "琲",
    "碚",
    "禙",
    "糒",
    "苝",
    "蓓",
    "蛽",
    "褙",
    "貝",
    "贝",
    "軰",
    "輩",
    "辈",
    "邶",
    "郥",
    "鄁",
    "鋇",
    "鐾",
    "钡",
    "鞁",
    "鞴",
    "𬇙"
  ],
  yù: [
    "俼",
    "儥",
    "喅",
    "喩",
    "喻",
    "域",
    "堉",
    "妪",
    "嫗",
    "寓",
    "峪",
    "嶎",
    "庽",
    "彧",
    "御",
    "愈",
    "慾",
    "戫",
    "昱",
    "棛",
    "棜",
    "棫",
    "櫲",
    "欎",
    "欝",
    "欲",
    "毓",
    "浴",
    "淯",
    "滪",
    "潏",
    "澦",
    "灪",
    "焴",
    "煜",
    "燏",
    "燠",
    "爩",
    "狱",
    "獄",
    "玉",
    "琙",
    "瘉",
    "癒",
    "砡",
    "硢",
    "硲",
    "礇",
    "礖",
    "礜",
    "禦",
    "秗",
    "稢",
    "稶",
    "篽",
    "籞",
    "籲",
    "粖",
    "緎",
    "罭",
    "聿",
    "肀",
    "艈",
    "芋",
    "芌",
    "茟",
    "蒮",
    "蓣",
    "蓹",
    "蕷",
    "蘌",
    "蜟",
    "蜮",
    "袬",
    "裕",
    "誉",
    "諭",
    "譽",
    "谕",
    "豫",
    "軉",
    "輍",
    "逳",
    "遇",
    "遹",
    "郁",
    "醧",
    "鈺",
    "鋊",
    "錥",
    "鐭",
    "钰",
    "閾",
    "阈",
    "雤",
    "霱",
    "預",
    "预",
    "飫",
    "饇",
    "饫",
    "馭",
    "驈",
    "驭",
    "鬰",
    "鬱",
    "鬻",
    "魊",
    "鱊",
    "鳿",
    "鴥",
    "鴧",
    "鴪",
    "鵒",
    "鷸",
    "鸒",
    "鹆",
    "鹬"
  ],
  xīn: [
    "俽",
    "噺",
    "妡",
    "嬜",
    "廞",
    "心",
    "忄",
    "忻",
    "惞",
    "新",
    "昕",
    "杺",
    "欣",
    "歆",
    "炘",
    "盺",
    "薪",
    "訢",
    "辛",
    "邤",
    "鈊",
    "鋅",
    "鑫",
    "锌",
    "馨",
    "馫",
    "䜣",
    "𫷷"
  ],
  "hǔ chí": ["俿"],
  jiù: [
    "倃",
    "僦",
    "匓",
    "匛",
    "匶",
    "厩",
    "咎",
    "就",
    "廄",
    "廏",
    "廐",
    "慦",
    "捄",
    "救",
    "旧",
    "柩",
    "柾",
    "桕",
    "欍",
    "殧",
    "疚",
    "臼",
    "舅",
    "舊",
    "鯦",
    "鷲",
    "鹫",
    "麔",
    "齨",
    "㠇"
  ],
  yáo: [
    "倄",
    "傜",
    "嗂",
    "垚",
    "堯",
    "姚",
    "媱",
    "尧",
    "尭",
    "峣",
    "嶢",
    "嶤",
    "徭",
    "揺",
    "搖",
    "摇",
    "摿",
    "暚",
    "榣",
    "烑",
    "爻",
    "猺",
    "珧",
    "瑤",
    "瑶",
    "磘",
    "窑",
    "窯",
    "窰",
    "肴",
    "蘨",
    "謠",
    "謡",
    "谣",
    "軺",
    "轺",
    "遙",
    "遥",
    "邎",
    "顤",
    "颻",
    "飖",
    "餆",
    "餚",
    "鰩",
    "鱙",
    "鳐"
  ],
  "cuì zú": ["倅"],
  "liǎng liǎ": ["倆"],
  wǎn: [
    "倇",
    "唍",
    "婉",
    "惋",
    "挽",
    "晚",
    "晥",
    "晩",
    "晼",
    "梚",
    "椀",
    "琬",
    "畹",
    "皖",
    "盌",
    "碗",
    "綩",
    "綰",
    "绾",
    "脘",
    "萖",
    "踠",
    "輓",
    "鋔"
  ],
  zǒng: [
    "倊",
    "偬",
    "傯",
    "嵸",
    "总",
    "惣",
    "捴",
    "搃",
    "摠",
    "燪",
    "総",
    "緫",
    "縂",
    "總",
    "蓗"
  ],
  guān: [
    "倌",
    "关",
    "官",
    "棺",
    "瘝",
    "癏",
    "窤",
    "蒄",
    "関",
    "闗",
    "關",
    "鰥",
    "鱞",
    "鳏"
  ],
  tiǎn: [
    "倎",
    "唺",
    "忝",
    "悿",
    "晪",
    "殄",
    "淟",
    "睓",
    "腆",
    "舔",
    "覥",
    "觍",
    "賟",
    "錪",
    "餂"
  ],
  mén: ["們", "扪", "捫", "璊", "菛", "虋", "鍆", "钔", "門", "閅", "门", "𫞩"],
  "dǎo dào": ["倒"],
  "tán tàn": ["倓", "埮"],
  "juè jué": ["倔"],
  chuí: [
    "倕",
    "垂",
    "埀",
    "捶",
    "搥",
    "桘",
    "棰",
    "槌",
    "箠",
    "腄",
    "菙",
    "錘",
    "鎚",
    "锤",
    "陲",
    "顀"
  ],
  xìng: [
    "倖",
    "姓",
    "婞",
    "嬹",
    "幸",
    "性",
    "悻",
    "杏",
    "涬",
    "緈",
    "臖",
    "荇",
    "莕",
    "葕"
  ],
  péng: [
    "倗",
    "傰",
    "塜",
    "塳",
    "弸",
    "憉",
    "捀",
    "朋",
    "棚",
    "椖",
    "樥",
    "硼",
    "稝",
    "竼",
    "篷",
    "纄",
    "膨",
    "芃",
    "蓬",
    "蘕",
    "蟚",
    "蟛",
    "袶",
    "輣",
    "錋",
    "鑝",
    "韸",
    "韼",
    "騯",
    "髼",
    "鬅",
    "鬔",
    "鵬",
    "鹏"
  ],
  "tǎng cháng": ["倘"],
  hòu: [
    "候",
    "厚",
    "后",
    "垕",
    "堠",
    "後",
    "洉",
    "茩",
    "豞",
    "逅",
    "郈",
    "鮜",
    "鱟",
    "鲎",
    "鲘"
  ],
  tì: [
    "倜",
    "剃",
    "嚏",
    "嚔",
    "屉",
    "屜",
    "悌",
    "悐",
    "惕",
    "惖",
    "戻",
    "掦",
    "替",
    "朑",
    "歒",
    "殢",
    "涕",
    "瓋",
    "笹",
    "籊",
    "薙",
    "褅",
    "逖",
    "逷",
    "髰",
    "鬀",
    "鬄"
  ],
  gàn: [
    "倝",
    "凎",
    "幹",
    "榦",
    "檊",
    "淦",
    "灨",
    "盰",
    "紺",
    "绀",
    "詌",
    "贑",
    "赣",
    "骭",
    "㽏"
  ],
  "liàng jìng": ["倞", "靓"],
  suī: [
    "倠",
    "哸",
    "夊",
    "滖",
    "濉",
    "眭",
    "睢",
    "芕",
    "荽",
    "荾",
    "虽",
    "雖",
    "鞖"
  ],
  "chàng chāng": ["倡"],
  jié: [
    "倢",
    "偼",
    "傑",
    "刦",
    "刧",
    "刼",
    "劫",
    "劼",
    "卩",
    "卪",
    "婕",
    "媫",
    "孑",
    "岊",
    "崨",
    "嵥",
    "嶻",
    "巀",
    "幯",
    "截",
    "捷",
    "掶",
    "擮",
    "昅",
    "杢",
    "杰",
    "桀",
    "桝",
    "楬",
    "楶",
    "榤",
    "洁",
    "滐",
    "潔",
    "狤",
    "睫",
    "礍",
    "竭",
    "節",
    "羯",
    "莭",
    "蓵",
    "蛣",
    "蜐",
    "蠘",
    "蠞",
    "蠽",
    "衱",
    "袺",
    "訐",
    "詰",
    "誱",
    "讦",
    "踕",
    "迼",
    "鉣",
    "鍻",
    "镼",
    "頡",
    "鮚",
    "鲒",
    "㛃"
  ],
  "kǒng kōng": ["倥"],
  juàn: [
    "倦",
    "劵",
    "奆",
    "慻",
    "桊",
    "淃",
    "狷",
    "獧",
    "眷",
    "睊",
    "睠",
    "絭",
    "絹",
    "绢",
    "罥",
    "羂",
    "腃",
    "蔨",
    "鄄",
    "餋"
  ],
  zōng: [
    "倧",
    "堫",
    "宗",
    "嵏",
    "嵕",
    "惾",
    "朡",
    "棕",
    "椶",
    "熧",
    "猣",
    "磫",
    "緃",
    "翪",
    "腙",
    "葼",
    "蝬",
    "豵",
    "踨",
    "踪",
    "蹤",
    "鍐",
    "鑁",
    "騌",
    "騣",
    "骔",
    "鬃",
    "鬉",
    "鬷",
    "鯮",
    "鯼"
  ],
  ní: [
    "倪",
    "坭",
    "埿",
    "尼",
    "屔",
    "怩",
    "淣",
    "猊",
    "籾",
    "聣",
    "蚭",
    "蜺",
    "觬",
    "貎",
    "跜",
    "輗",
    "郳",
    "鈮",
    "铌",
    "霓",
    "馜",
    "鯢",
    "鲵",
    "麑",
    "齯",
    "𫐐",
    "𫠜"
  ],
  zhuō: [
    "倬",
    "拙",
    "捉",
    "桌",
    "梲",
    "棁",
    "棳",
    "槕",
    "涿",
    "窧",
    "鐯",
    "䦃"
  ],
  "wō wēi": ["倭"],
  luǒ: ["倮", "剆", "曪", "瘰", "癳", "臝", "蓏", "蠃", "裸", "躶"],
  sōng: [
    "倯",
    "凇",
    "娀",
    "崧",
    "嵩",
    "庺",
    "憽",
    "松",
    "枀",
    "枩",
    "柗",
    "梥",
    "檧",
    "淞",
    "濍",
    "硹",
    "菘",
    "鬆"
  ],
  lèng: ["倰", "堎", "愣", "睖", "踜"],
  zì: [
    "倳",
    "剚",
    "字",
    "恣",
    "渍",
    "漬",
    "牸",
    "眥",
    "眦",
    "胔",
    "胾",
    "自",
    "茡",
    "荢"
  ],
  bèn: ["倴", "坌", "捹", "撪", "渀", "笨", "逩"],
  cǎi: ["倸", "啋", "婇", "彩", "採", "棌", "毝", "睬", "綵", "跴", "踩"],
  zhài: ["债", "債", "寨", "瘵", "砦"],
  yē: ["倻", "吔", "噎", "擨", "暍", "椰", "歋", "潱", "蠮"],
  shà: ["倽", "唼", "喢", "歃", "箑", "翜", "翣", "萐", "閯", "霎"],
  qīng: [
    "倾",
    "傾",
    "卿",
    "圊",
    "寈",
    "氢",
    "氫",
    "淸",
    "清",
    "蜻",
    "軽",
    "輕",
    "轻",
    "郬",
    "錆",
    "鑋",
    "靑",
    "青",
    "鯖"
  ],
  yīng: [
    "偀",
    "嘤",
    "噟",
    "嚶",
    "婴",
    "媖",
    "嫈",
    "嬰",
    "孆",
    "孾",
    "愥",
    "撄",
    "攖",
    "朠",
    "桜",
    "樱",
    "櫻",
    "渶",
    "煐",
    "珱",
    "瑛",
    "璎",
    "瓔",
    "甇",
    "甖",
    "碤",
    "礯",
    "緓",
    "纓",
    "绬",
    "缨",
    "罂",
    "罃",
    "罌",
    "膺",
    "英",
    "莺",
    "蘡",
    "蝧",
    "蠳",
    "褮",
    "譻",
    "賏",
    "軈",
    "鑍",
    "锳",
    "霙",
    "韺",
    "鴬",
    "鶑",
    "鶧",
    "鶯",
    "鷪",
    "鷹",
    "鸎",
    "鸚",
    "鹦",
    "鹰",
    "䓨"
  ],
  "chēng chèn": ["偁", "爯"],
  ruǎn: ["偄", "朊", "瑌", "瓀", "碝", "礝", "腝", "軟", "輭", "软", "阮"],
  "zhòng tóng": ["偅"],
  chǔn: ["偆", "惷", "睶", "萶", "蠢", "賰"],
  "jiǎ jià": ["假"],
  "jì jié": ["偈"],
  "bǐng bìng": ["偋"],
  ruò: [
    "偌",
    "叒",
    "嵶",
    "弱",
    "楉",
    "焫",
    "爇",
    "箬",
    "篛",
    "蒻",
    "鄀",
    "鰙",
    "鰯",
    "鶸"
  ],
  tí: [
    "偍",
    "厗",
    "啼",
    "嗁",
    "崹",
    "漽",
    "瑅",
    "睼",
    "禵",
    "稊",
    "緹",
    "缇",
    "罤",
    "蕛",
    "褆",
    "謕",
    "趧",
    "蹄",
    "蹏",
    "醍",
    "鍗",
    "題",
    "题",
    "騠",
    "鮷",
    "鯷",
    "鳀",
    "鵜",
    "鷤",
    "鹈",
    "𫘨"
  ],
  wēi: [
    "偎",
    "危",
    "喴",
    "威",
    "媙",
    "嶶",
    "巍",
    "微",
    "愄",
    "揋",
    "揻",
    "椳",
    "楲",
    "溦",
    "烓",
    "煨",
    "燰",
    "癓",
    "縅",
    "葨",
    "葳",
    "薇",
    "蜲",
    "蝛",
    "覣",
    "詴",
    "逶",
    "隇",
    "隈",
    "霺",
    "鰃",
    "鰄",
    "鳂"
  ],
  piān: ["偏", "囨", "媥", "楄", "犏", "篇", "翩", "鍂"],
  yàn: [
    "偐",
    "厌",
    "厭",
    "唁",
    "喭",
    "嚈",
    "嚥",
    "堰",
    "妟",
    "姲",
    "嬊",
    "嬿",
    "宴",
    "彥",
    "彦",
    "敥",
    "晏",
    "暥",
    "曕",
    "曣",
    "滟",
    "灎",
    "灔",
    "灧",
    "灩",
    "焔",
    "焰",
    "焱",
    "熖",
    "燄",
    "牪",
    "猒",
    "砚",
    "硯",
    "艳",
    "艶",
    "艷",
    "覎",
    "觃",
    "觾",
    "諺",
    "讌",
    "讞",
    "谚",
    "谳",
    "豓",
    "豔",
    "贋",
    "贗",
    "赝",
    "軅",
    "酀",
    "酽",
    "醼",
    "釅",
    "雁",
    "餍",
    "饜",
    "騐",
    "験",
    "騴",
    "驗",
    "驠",
    "验",
    "鬳",
    "鳫",
    "鴈",
    "鴳",
    "鷃",
    "鷰",
    "齞"
  ],
  "tǎng dàng": ["偒"],
  è: [
    "偔",
    "匎",
    "卾",
    "厄",
    "呝",
    "咢",
    "噩",
    "垩",
    "堊",
    "堮",
    "岋",
    "崿",
    "廅",
    "悪",
    "愕",
    "戹",
    "扼",
    "搤",
    "搹",
    "擜",
    "櫮",
    "歞",
    "歺",
    "湂",
    "琧",
    "砈",
    "砐",
    "硆",
    "腭",
    "苊",
    "萼",
    "蕚",
    "蚅",
    "蝁",
    "覨",
    "諤",
    "讍",
    "谔",
    "豟",
    "軛",
    "軶",
    "轭",
    "遌",
    "遏",
    "遻",
    "鄂",
    "鈪",
    "鍔",
    "鑩",
    "锷",
    "阨",
    "阸",
    "頞",
    "顎",
    "颚",
    "餓",
    "餩",
    "饿",
    "鰐",
    "鰪",
    "鱷",
    "鳄",
    "鶚",
    "鹗",
    "齃",
    "齶",
    "𫫇",
    "𥔲"
  ],
  xié: [
    "偕",
    "勰",
    "协",
    "協",
    "嗋",
    "垥",
    "奊",
    "恊",
    "愶",
    "拹",
    "携",
    "撷",
    "擕",
    "擷",
    "攜",
    "斜",
    "旪",
    "熁",
    "燲",
    "綊",
    "緳",
    "縀",
    "缬",
    "翓",
    "胁",
    "脅",
    "脇",
    "脋",
    "膎",
    "蝢",
    "衺",
    "襭",
    "諧",
    "讗",
    "谐",
    "鞋",
    "鞵",
    "龤",
    "㙦"
  ],
  chě: ["偖", "扯", "撦"],
  shěng: ["偗", "渻", "眚"],
  chā: [
    "偛",
    "嗏",
    "扠",
    "挿",
    "插",
    "揷",
    "疀",
    "臿",
    "艖",
    "銟",
    "鍤",
    "锸",
    "餷"
  ],
  huáng: [
    "偟",
    "凰",
    "喤",
    "堭",
    "墴",
    "媓",
    "崲",
    "徨",
    "惶",
    "楻",
    "湟",
    "煌",
    "獚",
    "瑝",
    "璜",
    "癀",
    "皇",
    "磺",
    "穔",
    "篁",
    "簧",
    "艎",
    "葟",
    "蝗",
    "蟥",
    "諻",
    "趪",
    "遑",
    "鍠",
    "鐄",
    "锽",
    "隍",
    "韹",
    "餭",
    "騜",
    "鰉",
    "鱑",
    "鳇",
    "鷬",
    "黃",
    "黄",
    "𨱑"
  ],
  yǎo: [
    "偠",
    "咬",
    "婹",
    "宎",
    "岆",
    "杳",
    "柼",
    "榚",
    "溔",
    "狕",
    "窅",
    "窈",
    "舀",
    "苭",
    "闄",
    "騕",
    "鷕",
    "齩"
  ],
  "chǒu qiào": ["偢"],
  yóu: [
    "偤",
    "尤",
    "庮",
    "怣",
    "沋",
    "油",
    "浟",
    "游",
    "犹",
    "猶",
    "猷",
    "由",
    "疣",
    "秞",
    "肬",
    "莜",
    "莸",
    "蕕",
    "蚰",
    "蝣",
    "訧",
    "輏",
    "輶",
    "逰",
    "遊",
    "邮",
    "郵",
    "鈾",
    "铀",
    "駀",
    "魷",
    "鮋",
    "鱿",
    "鲉",
    "𬨎"
  ],
  xū: [
    "偦",
    "墟",
    "媭",
    "嬃",
    "楈",
    "欨",
    "歔",
    "燸",
    "疞",
    "盱",
    "綇",
    "縃",
    "繻",
    "胥",
    "蕦",
    "虗",
    "虚",
    "虛",
    "蝑",
    "裇",
    "訏",
    "許",
    "諝",
    "譃",
    "谞",
    "鑐",
    "需",
    "須",
    "须",
    "顼",
    "驉",
    "鬚",
    "魆",
    "魖",
    "𬣙",
    "𦈡"
  ],
  zhā: [
    "偧",
    "哳",
    "抯",
    "挓",
    "揸",
    "摣",
    "樝",
    "渣",
    "皶",
    "觰",
    "譇",
    "齄",
    "齇"
  ],
  cī: ["偨", "疵", "蠀", "趀", "骴", "髊", "齹"],
  bī: ["偪", "屄", "楅", "毴", "豍", "逼", "鰏", "鲾", "鵖"],
  xún: [
    "偱",
    "噚",
    "寻",
    "尋",
    "峋",
    "巡",
    "廵",
    "循",
    "恂",
    "揗",
    "攳",
    "旬",
    "杊",
    "栒",
    "桪",
    "樳",
    "洵",
    "浔",
    "潯",
    "燅",
    "燖",
    "珣",
    "璕",
    "畃",
    "紃",
    "荀",
    "蟳",
    "詢",
    "询",
    "鄩",
    "鱏",
    "鱘",
    "鲟",
    "𬘓",
    "𬩽",
    "𬍤",
    "𬊈"
  ],
  "cāi sī": ["偲"],
  duān: ["偳", "媏", "端", "褍", "鍴"],
  ǒu: ["偶", "吘", "嘔", "耦", "腢", "蕅", "藕", "𬉼", "𠙶"],
  tōu: ["偷", "偸", "鍮"],
  "zán zá zǎ": ["偺"],
  "lǚ lóu": ["偻", "僂"],
  fèn: [
    "偾",
    "僨",
    "奋",
    "奮",
    "弅",
    "忿",
    "愤",
    "憤",
    "瀵",
    "瞓",
    "秎",
    "粪",
    "糞",
    "膹",
    "鱝",
    "鲼"
  ],
  "kuǐ guī": ["傀"],
  sǒu: ["傁", "叜", "叟", "嗾", "櫢", "瞍", "薮", "藪"],
  "zhì sī tí": ["傂"],
  sù: [
    "傃",
    "僳",
    "嗉",
    "塐",
    "塑",
    "夙",
    "嫊",
    "愫",
    "憟",
    "榡",
    "樎",
    "樕",
    "殐",
    "泝",
    "涑",
    "溯",
    "溸",
    "潚",
    "潥",
    "玊",
    "珟",
    "璛",
    "簌",
    "粛",
    "粟",
    "素",
    "縤",
    "肃",
    "肅",
    "膆",
    "蔌",
    "藗",
    "觫",
    "訴",
    "謖",
    "诉",
    "谡",
    "趚",
    "蹜",
    "速",
    "遡",
    "遬",
    "鋉",
    "餗",
    "驌",
    "骕",
    "鱐",
    "鷫",
    "鹔",
    "𫗧"
  ],
  xiā: ["傄", "煆", "瞎", "虲", "谺", "颬", "鰕"],
  "yuàn yuán": ["傆", "媛"],
  rǒng: ["傇", "冗", "宂", "氄", "軵"],
  nù: ["傉", "怒"],
  yùn: [
    "傊",
    "孕",
    "恽",
    "惲",
    "愠",
    "慍",
    "枟",
    "腪",
    "蕴",
    "薀",
    "藴",
    "蘊",
    "褞",
    "貟",
    "运",
    "運",
    "郓",
    "鄆",
    "酝",
    "醖",
    "醞",
    "韗",
    "韞",
    "韵",
    "韻",
    "餫"
  ],
  "gòu jiǎng": ["傋"],
  mà: ["傌", "嘜", "榪", "睰", "祃", "禡", "罵", "閁", "駡", "骂", "鬕"],
  bàng: [
    "傍",
    "塝",
    "棒",
    "玤",
    "稖",
    "艕",
    "蒡",
    "蜯",
    "謗",
    "谤",
    "鎊",
    "镑"
  ],
  diān: [
    "傎",
    "厧",
    "嵮",
    "巅",
    "巓",
    "巔",
    "掂",
    "攧",
    "敁",
    "槇",
    "滇",
    "癫",
    "癲",
    "蹎",
    "顚",
    "顛",
    "颠",
    "齻"
  ],
  táng: [
    "傏",
    "唐",
    "啺",
    "坣",
    "堂",
    "塘",
    "搪",
    "棠",
    "榶",
    "溏",
    "漟",
    "煻",
    "瑭",
    "磄",
    "禟",
    "篖",
    "糃",
    "糖",
    "糛",
    "膅",
    "膛",
    "蓎",
    "螗",
    "螳",
    "赯",
    "踼",
    "鄌",
    "醣",
    "鎕",
    "隚",
    "餹",
    "饄",
    "鶶",
    "䣘"
  ],
  hào: [
    "傐",
    "哠",
    "恏",
    "昊",
    "昦",
    "晧",
    "暠",
    "暤",
    "暭",
    "曍",
    "浩",
    "淏",
    "澔",
    "灏",
    "灝",
    "皓",
    "皜",
    "皞",
    "皡",
    "皥",
    "耗",
    "聕",
    "薃",
    "號",
    "鄗",
    "顥",
    "颢",
    "鰝"
  ],
  "xī xì": ["傒"],
  shān: [
    "傓",
    "删",
    "刪",
    "剼",
    "圸",
    "山",
    "挻",
    "搧",
    "柵",
    "檆",
    "潸",
    "澘",
    "煽",
    "狦",
    "珊",
    "笘",
    "縿",
    "羴",
    "羶",
    "脠",
    "舢",
    "芟",
    "衫",
    "跚",
    "軕",
    "邖",
    "閊",
    "鯅"
  ],
  "qiàn jiān": ["傔"],
  "què jué": ["傕", "埆"],
  "cāng chen": ["傖"],
  róng: [
    "傛",
    "媶",
    "嫆",
    "嬫",
    "容",
    "峵",
    "嵘",
    "嶸",
    "戎",
    "搈",
    "曧",
    "栄",
    "榕",
    "榮",
    "榵",
    "毧",
    "溶",
    "瀜",
    "烿",
    "熔",
    "狨",
    "瑢",
    "穁",
    "絨",
    "绒",
    "羢",
    "肜",
    "茙",
    "茸",
    "荣",
    "蓉",
    "蝾",
    "融",
    "螎",
    "蠑",
    "褣",
    "鎔",
    "镕",
    "駥"
  ],
  "tà tàn": ["傝"],
  suō: [
    "傞",
    "唆",
    "嗍",
    "嗦",
    "娑",
    "摍",
    "桫",
    "梭",
    "睃",
    "簑",
    "簔",
    "羧",
    "莏",
    "蓑",
    "趖",
    "鮻"
  ],
  dǎi: ["傣", "歹"],
  zài: ["傤", "儎", "再", "在", "扗", "洅", "載", "酨"],
  gǔ: [
    "傦",
    "古",
    "啒",
    "尳",
    "愲",
    "榖",
    "榾",
    "汩",
    "淈",
    "濲",
    "瀔",
    "牯",
    "皷",
    "皼",
    "盬",
    "瞽",
    "穀",
    "罟",
    "羖",
    "股",
    "脵",
    "臌",
    "薣",
    "蛊",
    "蠱",
    "詁",
    "诂",
    "轂",
    "逧",
    "鈷",
    "钴",
    "餶",
    "馉",
    "鼓",
    "鼔",
    "𦙶"
  ],
  bīn: [
    "傧",
    "宾",
    "彬",
    "斌",
    "椕",
    "滨",
    "濒",
    "濱",
    "濵",
    "瀕",
    "繽",
    "缤",
    "虨",
    "豩",
    "豳",
    "賓",
    "賔",
    "邠",
    "鑌",
    "镔",
    "霦",
    "顮"
  ],
  chǔ: [
    "储",
    "儲",
    "杵",
    "椘",
    "楚",
    "楮",
    "檚",
    "濋",
    "璴",
    "础",
    "礎",
    "禇",
    "處",
    "齭",
    "齼",
    "𬺓"
  ],
  nuó: ["傩", "儺", "挪", "梛", "橠"],
  "cān càn": ["傪"],
  lěi: [
    "傫",
    "儡",
    "厽",
    "垒",
    "塁",
    "壘",
    "壨",
    "櫐",
    "灅",
    "癗",
    "矋",
    "磊",
    "礨",
    "耒",
    "蕌",
    "蕾",
    "藟",
    "蘽",
    "蠝",
    "誄",
    "讄",
    "诔",
    "鑸",
    "鸓"
  ],
  cuī: ["催", "凗", "墔", "崔", "嵟", "慛", "摧", "榱", "獕", "磪", "鏙"],
  yōng: [
    "傭",
    "嗈",
    "墉",
    "壅",
    "嫞",
    "庸",
    "廱",
    "慵",
    "拥",
    "擁",
    "滽",
    "灉",
    "牅",
    "痈",
    "癕",
    "癰",
    "臃",
    "邕",
    "郺",
    "鄘",
    "鏞",
    "镛",
    "雍",
    "雝",
    "饔",
    "鱅",
    "鳙",
    "鷛"
  ],
  "zāo cáo": ["傮"],
  sǒng: ["傱", "嵷", "怂", "悚", "愯", "慫", "竦", "耸", "聳", "駷", "㧐"],
  ào: [
    "傲",
    "坳",
    "垇",
    "墺",
    "奡",
    "嫯",
    "岙",
    "岰",
    "嶴",
    "懊",
    "擙",
    "澳",
    "鏊",
    "驁",
    "骜"
  ],
  "qī còu": ["傶"],
  chuǎng: ["傸", "磢", "闖", "闯"],
  shǎ: ["傻", "儍"],
  hàn: [
    "傼",
    "垾",
    "悍",
    "憾",
    "扞",
    "捍",
    "撖",
    "撼",
    "旱",
    "晘",
    "暵",
    "汉",
    "涆",
    "漢",
    "瀚",
    "焊",
    "猂",
    "皔",
    "睅",
    "翰",
    "莟",
    "菡",
    "蛿",
    "蜭",
    "螒",
    "譀",
    "輚",
    "釬",
    "銲",
    "鋎",
    "雗",
    "頷",
    "顄",
    "颔",
    "駻",
    "鶾"
  ],
  zhāng: [
    "傽",
    "嫜",
    "张",
    "張",
    "彰",
    "慞",
    "暲",
    "樟",
    "漳",
    "獐",
    "璋",
    "章",
    "粻",
    "蔁",
    "蟑",
    "遧",
    "鄣",
    "鏱",
    "餦",
    "騿",
    "鱆",
    "麞"
  ],
  "yān yàn": ["傿", "墕", "嬮"],
  "piào biāo": ["僄", "骠"],
  liàn: [
    "僆",
    "堜",
    "媡",
    "恋",
    "戀",
    "楝",
    "殓",
    "殮",
    "湅",
    "潋",
    "澰",
    "瀲",
    "炼",
    "煉",
    "瑓",
    "練",
    "纞",
    "练",
    "萰",
    "錬",
    "鍊",
    "鏈",
    "链",
    "鰊",
    "𬶠"
  ],
  màn: [
    "㵘",
    "僈",
    "墁",
    "幔",
    "慢",
    "曼",
    "漫",
    "澷",
    "熳",
    "獌",
    "縵",
    "缦",
    "蔄",
    "蘰",
    "鄤",
    "鏝",
    "镘",
    "𬜬"
  ],
  "tàn tǎn": ["僋"],
  yíng: [
    "僌",
    "営",
    "塋",
    "嬴",
    "攍",
    "楹",
    "櫿",
    "溁",
    "溋",
    "滢",
    "潆",
    "濙",
    "濚",
    "濴",
    "瀅",
    "瀛",
    "瀠",
    "瀯",
    "灐",
    "灜",
    "熒",
    "營",
    "瑩",
    "盁",
    "盈",
    "禜",
    "籝",
    "籯",
    "縈",
    "茔",
    "荧",
    "莹",
    "萤",
    "营",
    "萦",
    "萾",
    "蓥",
    "藀",
    "蛍",
    "蝇",
    "蝿",
    "螢",
    "蠅",
    "謍",
    "贏",
    "赢",
    "迎",
    "鎣"
  ],
  dòng: [
    "働",
    "冻",
    "凍",
    "动",
    "動",
    "姛",
    "戙",
    "挏",
    "栋",
    "棟",
    "湩",
    "硐",
    "胨",
    "胴",
    "腖",
    "迵",
    "霘",
    "駧"
  ],
  zhuàn: [
    "僎",
    "啭",
    "囀",
    "堟",
    "撰",
    "灷",
    "瑑",
    "篆",
    "腞",
    "蒃",
    "襈",
    "譔",
    "饌",
    "馔"
  ],
  xiàng: [
    "像",
    "勨",
    "向",
    "嚮",
    "姠",
    "嶑",
    "曏",
    "橡",
    "珦",
    "缿",
    "蟓",
    "衖",
    "襐",
    "象",
    "鐌",
    "項",
    "项",
    "鱌"
  ],
  shàn: [
    "僐",
    "善",
    "墠",
    "墡",
    "嬗",
    "擅",
    "敾",
    "椫",
    "樿",
    "歚",
    "汕",
    "灗",
    "疝",
    "磰",
    "繕",
    "缮",
    "膳",
    "蟮",
    "蟺",
    "訕",
    "謆",
    "譱",
    "讪",
    "贍",
    "赡",
    "赸",
    "鄯",
    "鐥",
    "饍",
    "騸",
    "骟",
    "鱓",
    "鱔",
    "鳝",
    "𫮃"
  ],
  "tuí tuǐ": ["僓"],
  zǔn: ["僔", "噂", "撙", "譐"],
  pú: [
    "僕",
    "匍",
    "圤",
    "墣",
    "濮",
    "獛",
    "璞",
    "瞨",
    "穙",
    "莆",
    "菐",
    "菩",
    "葡",
    "蒱",
    "蒲",
    "贌",
    "酺",
    "鏷",
    "镤"
  ],
  láo: [
    "僗",
    "劳",
    "労",
    "勞",
    "哰",
    "崂",
    "嶗",
    "憥",
    "朥",
    "浶",
    "牢",
    "痨",
    "癆",
    "窂",
    "簩",
    "醪",
    "鐒",
    "铹",
    "顟",
    "髝",
    "𫭼"
  ],
  chǎng: ["僘", "厰", "廠", "敞", "昶", "氅", "鋹", "𬬮"],
  guāng: [
    "僙",
    "光",
    "咣",
    "垙",
    "姯",
    "洸",
    "灮",
    "炗",
    "炚",
    "炛",
    "烡",
    "珖",
    "胱",
    "茪",
    "輄",
    "銧",
    "黆",
    "𨐈"
  ],
  liáo: [
    "僚",
    "嘹",
    "嫽",
    "寥",
    "寮",
    "尞",
    "屪",
    "嵺",
    "嶚",
    "嶛",
    "廫",
    "憀",
    "敹",
    "暸",
    "橑",
    "獠",
    "璙",
    "疗",
    "療",
    "竂",
    "簝",
    "繚",
    "缭",
    "聊",
    "膋",
    "膫",
    "藔",
    "蟟",
    "豂",
    "賿",
    "蹘",
    "辽",
    "遼",
    "飉",
    "髎",
    "鷯",
    "鹩"
  ],
  dèng: ["僜", "凳", "墱", "嶝", "櫈", "瞪", "磴", "覴", "邓", "鄧", "隥"],
  "chán zhàn zhuàn": ["僝"],
  bō: [
    "僠",
    "嶓",
    "拨",
    "撥",
    "播",
    "波",
    "溊",
    "玻",
    "癶",
    "盋",
    "砵",
    "碆",
    "礡",
    "缽",
    "菠",
    "袰",
    "蹳",
    "鉢",
    "钵",
    "餑",
    "饽",
    "驋",
    "鱍",
    "𬭛"
  ],
  huì: [
    "僡",
    "匯",
    "卉",
    "喙",
    "嘒",
    "嚖",
    "圚",
    "嬒",
    "寭",
    "屶",
    "屷",
    "彗",
    "彙",
    "彚",
    "徻",
    "恚",
    "恵",
    "惠",
    "慧",
    "憓",
    "懳",
    "晦",
    "暳",
    "槥",
    "橞",
    "檅",
    "櫘",
    "汇",
    "泋",
    "滙",
    "潓",
    "烩",
    "燴",
    "獩",
    "璤",
    "瞺",
    "硊",
    "秽",
    "穢",
    "篲",
    "絵",
    "繪",
    "绘",
    "翙",
    "翽",
    "荟",
    "蔧",
    "蕙",
    "薈",
    "薉",
    "蟪",
    "詯",
    "誨",
    "諱",
    "譓",
    "譿",
    "讳",
    "诲",
    "賄",
    "贿",
    "鐬",
    "闠",
    "阓",
    "靧",
    "頮",
    "顪",
    "颒",
    "餯",
    "𬤝",
    "𬭬"
  ],
  chuǎn: ["僢", "喘", "舛", "荈", "踳"],
  "tiě jiàn": ["僣"],
  sēng: ["僧", "鬙"],
  xiàn: [
    "僩",
    "僴",
    "哯",
    "垷",
    "塪",
    "姭",
    "娊",
    "宪",
    "岘",
    "峴",
    "憲",
    "撊",
    "晛",
    "橌",
    "橺",
    "涀",
    "瀗",
    "献",
    "獻",
    "现",
    "現",
    "県",
    "睍",
    "粯",
    "糮",
    "絤",
    "綫",
    "線",
    "线",
    "缐",
    "羡",
    "羨",
    "腺",
    "臔",
    "臽",
    "苋",
    "莧",
    "誢",
    "豏",
    "鋧",
    "錎",
    "限",
    "陥",
    "陷",
    "霰",
    "餡",
    "馅",
    "麲",
    "鼸",
    "𬀪",
    "𪾢"
  ],
  "yù jú": ["僪"],
  "è wū": ["僫"],
  "tóng zhuàng": ["僮"],
  lǐn: [
    "僯",
    "凛",
    "凜",
    "廩",
    "廪",
    "懍",
    "懔",
    "撛",
    "檁",
    "檩",
    "澟",
    "癛",
    "癝"
  ],
  gù: [
    "僱",
    "凅",
    "固",
    "堌",
    "崓",
    "崮",
    "故",
    "梏",
    "棝",
    "牿",
    "痼",
    "祻",
    "錮",
    "锢",
    "雇",
    "顧",
    "顾",
    "鯝",
    "鲴"
  ],
  jiāng: [
    "僵",
    "壃",
    "姜",
    "橿",
    "殭",
    "江",
    "畕",
    "疅",
    "礓",
    "繮",
    "缰",
    "翞",
    "茳",
    "葁",
    "薑",
    "螀",
    "螿",
    "豇",
    "韁",
    "鱂",
    "鳉"
  ],
  mǐn: [
    "僶",
    "冺",
    "刡",
    "勄",
    "悯",
    "惽",
    "愍",
    "慜",
    "憫",
    "抿",
    "敃",
    "敏",
    "敯",
    "泯",
    "潣",
    "皿",
    "笢",
    "笽",
    "簢",
    "蠠",
    "閔",
    "閩",
    "闵",
    "闽",
    "鰵",
    "鳘",
    "黽"
  ],
  jìn: [
    "僸",
    "凚",
    "噤",
    "嚍",
    "墐",
    "壗",
    "妗",
    "嬧",
    "搢",
    "晉",
    "晋",
    "枃",
    "殣",
    "浕",
    "浸",
    "溍",
    "濅",
    "濜",
    "烬",
    "煡",
    "燼",
    "琎",
    "瑨",
    "璶",
    "盡",
    "祲",
    "縉",
    "缙",
    "荩",
    "藎",
    "覲",
    "觐",
    "賮",
    "贐",
    "赆",
    "近",
    "进",
    "進",
    "靳",
    "齽"
  ],
  "jià jie": ["價"],
  qiào: [
    "僺",
    "峭",
    "帩",
    "撬",
    "殻",
    "窍",
    "竅",
    "誚",
    "诮",
    "躈",
    "陗",
    "鞩",
    "韒",
    "髚"
  ],
  pì: ["僻", "媲", "嫓", "屁", "澼", "甓", "疈", "譬", "闢", "鷿", "鸊", "䴙"],
  sài: ["僿", "簺", "賽", "赛"],
  "chán tǎn shàn": ["儃"],
  "dāng dàng": ["儅", "当", "闣"],
  xuān: [
    "儇",
    "喧",
    "塇",
    "媗",
    "宣",
    "愃",
    "愋",
    "揎",
    "昍",
    "暄",
    "煊",
    "煖",
    "瑄",
    "睻",
    "矎",
    "禤",
    "箮",
    "翧",
    "翾",
    "萱",
    "萲",
    "蓒",
    "蕿",
    "藼",
    "蘐",
    "蝖",
    "蠉",
    "諠",
    "諼",
    "譞",
    "谖",
    "軒",
    "轩",
    "鍹",
    "駽",
    "鰚",
    "𫓶",
    "𫍽"
  ],
  "dān dàn": ["儋", "擔", "瘅"],
  càn: ["儏", "澯", "灿", "燦", "璨", "粲", "薒", "謲"],
  "bīn bìn": ["儐"],
  "án àn": ["儑"],
  tái: [
    "儓",
    "坮",
    "嬯",
    "抬",
    "擡",
    "檯",
    "炱",
    "炲",
    "籉",
    "臺",
    "薹",
    "跆",
    "邰",
    "颱",
    "鮐",
    "鲐"
  ],
  lán: [
    "儖",
    "兰",
    "囒",
    "婪",
    "岚",
    "嵐",
    "幱",
    "拦",
    "攔",
    "斓",
    "斕",
    "栏",
    "欄",
    "欗",
    "澜",
    "瀾",
    "灆",
    "灡",
    "燣",
    "燷",
    "璼",
    "篮",
    "籃",
    "籣",
    "繿",
    "葻",
    "蓝",
    "藍",
    "蘫",
    "蘭",
    "褴",
    "襕",
    "襤",
    "襴",
    "襽",
    "譋",
    "讕",
    "谰",
    "躝",
    "鑭",
    "镧",
    "闌",
    "阑",
    "韊",
    "𬒗"
  ],
  "nǐ yì ài yí": ["儗"],
  méng: [
    "儚",
    "幪",
    "曚",
    "朦",
    "橗",
    "檬",
    "氋",
    "溕",
    "濛",
    "甍",
    "甿",
    "盟",
    "礞",
    "艨",
    "莔",
    "萌",
    "蕄",
    "虻",
    "蝱",
    "鄳",
    "鄸",
    "霿",
    "靀",
    "顭",
    "饛",
    "鯍",
    "鸏",
    "鹲",
    "𫑡",
    "㠓"
  ],
  níng: [
    "儜",
    "凝",
    "咛",
    "嚀",
    "嬣",
    "柠",
    "橣",
    "檸",
    "狞",
    "獰",
    "聍",
    "聹",
    "薴",
    "鑏",
    "鬡",
    "鸋"
  ],
  qióng: [
    "儝",
    "卭",
    "宆",
    "惸",
    "憌",
    "桏",
    "橩",
    "焪",
    "焭",
    "煢",
    "熍",
    "琼",
    "瓊",
    "睘",
    "穷",
    "穹",
    "窮",
    "竆",
    "笻",
    "筇",
    "舼",
    "茕",
    "藑",
    "藭",
    "蛩",
    "蛬",
    "赹",
    "跫",
    "邛",
    "銎",
    "䓖"
  ],
  liè: [
    "儠",
    "冽",
    "列",
    "劣",
    "劽",
    "埒",
    "埓",
    "姴",
    "峛",
    "巤",
    "挒",
    "捩",
    "栵",
    "洌",
    "浖",
    "烈",
    "烮",
    "煭",
    "犣",
    "猎",
    "猟",
    "獵",
    "聗",
    "脟",
    "茢",
    "蛚",
    "趔",
    "躐",
    "迾",
    "颲",
    "鬛",
    "鬣",
    "鮤",
    "鱲",
    "鴷",
    "䴕",
    "𫚭"
  ],
  kuǎng: ["儣", "夼", "懭"],
  bào: [
    "儤",
    "勽",
    "報",
    "忁",
    "报",
    "抱",
    "曓",
    "爆",
    "犦",
    "菢",
    "虣",
    "蚫",
    "豹",
    "鉋",
    "鑤",
    "铇",
    "骲",
    "髱",
    "鮑",
    "鲍"
  ],
  biāo: [
    "儦",
    "墂",
    "幖",
    "彪",
    "标",
    "標",
    "滮",
    "瀌",
    "熛",
    "爂",
    "猋",
    "瘭",
    "磦",
    "膘",
    "臕",
    "謤",
    "贆",
    "鏢",
    "鑣",
    "镖",
    "镳",
    "颮",
    "颷",
    "飆",
    "飇",
    "飈",
    "飊",
    "飑",
    "飙",
    "飚",
    "驫",
    "骉",
    "髟"
  ],
  zǎn: ["儧", "儹", "噆", "攅", "昝", "趱", "趲"],
  háo: [
    "儫",
    "嗥",
    "嘷",
    "噑",
    "嚎",
    "壕",
    "椃",
    "毜",
    "毫",
    "濠",
    "獆",
    "獔",
    "竓",
    "籇",
    "蚝",
    "蠔",
    "譹",
    "豪"
  ],
  qìng: ["儬", "凊", "庆", "慶", "櫦", "濪", "碃", "磬", "罄", "靘"],
  chèn: [
    "儭",
    "嚫",
    "榇",
    "櫬",
    "疢",
    "衬",
    "襯",
    "讖",
    "谶",
    "趁",
    "趂",
    "齓",
    "齔",
    "龀"
  ],
  téng: [
    "儯",
    "幐",
    "滕",
    "漛",
    "疼",
    "籐",
    "籘",
    "縢",
    "腾",
    "藤",
    "虅",
    "螣",
    "誊",
    "謄",
    "邆",
    "駦",
    "騰",
    "驣",
    "鰧",
    "䲢"
  ],
  "lǒng lóng lòng": ["儱"],
  "chán chàn": ["儳"],
  "ráng xiāng": ["儴", "勷"],
  "huì xié": ["儶"],
  luó: [
    "儸",
    "攞",
    "椤",
    "欏",
    "猡",
    "玀",
    "箩",
    "籮",
    "罗",
    "羅",
    "脶",
    "腡",
    "萝",
    "蘿",
    "螺",
    "覼",
    "逻",
    "邏",
    "鏍",
    "鑼",
    "锣",
    "镙",
    "饠",
    "騾",
    "驘",
    "骡",
    "鸁"
  ],
  léi: [
    "儽",
    "嫘",
    "檑",
    "欙",
    "瓃",
    "畾",
    "縲",
    "纍",
    "纝",
    "缧",
    "罍",
    "羸",
    "蔂",
    "蘲",
    "虆",
    "轠",
    "鐳",
    "鑘",
    "镭",
    "雷",
    "靁",
    "鱩",
    "鼺"
  ],
  "nàng nāng": ["儾"],
  "wù wū": ["兀"],
  yǔn: [
    "允",
    "喗",
    "夽",
    "抎",
    "殒",
    "殞",
    "狁",
    "磒",
    "荺",
    "賱",
    "鈗",
    "阭",
    "陨",
    "隕",
    "霣",
    "馻",
    "齫",
    "齳"
  ],
  zān: ["兂", "橵", "簪", "簮", "糌", "鐕", "鐟", "鵤"],
  yuán: [
    "元",
    "円",
    "原",
    "厡",
    "厵",
    "园",
    "圆",
    "圎",
    "園",
    "圓",
    "垣",
    "塬",
    "媴",
    "嫄",
    "援",
    "榞",
    "榬",
    "橼",
    "櫞",
    "沅",
    "湲",
    "源",
    "溒",
    "爰",
    "猨",
    "猿",
    "笎",
    "緣",
    "縁",
    "缘",
    "羱",
    "茒",
    "薗",
    "蝝",
    "蝯",
    "螈",
    "袁",
    "褤",
    "謜",
    "轅",
    "辕",
    "邍",
    "邧",
    "酛",
    "鈨",
    "鎱",
    "騵",
    "魭",
    "鶢",
    "鶰",
    "黿",
    "鼋",
    "𫘪"
  ],
  xiōng: [
    "兄",
    "兇",
    "凶",
    "匂",
    "匈",
    "哅",
    "忷",
    "恟",
    "汹",
    "洶",
    "胷",
    "胸",
    "芎",
    "訩",
    "詾",
    "讻"
  ],
  chōng: [
    "充",
    "嘃",
    "忡",
    "憃",
    "憧",
    "摏",
    "沖",
    "浺",
    "珫",
    "罿",
    "翀",
    "舂",
    "艟",
    "茺",
    "衝",
    "蹖",
    "㳘"
  ],
  zhào: [
    "兆",
    "垗",
    "旐",
    "曌",
    "枛",
    "櫂",
    "照",
    "燳",
    "狣",
    "瞾",
    "笊",
    "罀",
    "罩",
    "羄",
    "肁",
    "肇",
    "肈",
    "詔",
    "诏",
    "赵",
    "趙",
    "鮡",
    "𬶐"
  ],
  "duì ruì yuè": ["兊", "兌", "兑"],
  kè: [
    "克",
    "刻",
    "勀",
    "勊",
    "堁",
    "娔",
    "客",
    "恪",
    "愙",
    "氪",
    "溘",
    "碦",
    "緙",
    "缂",
    "艐",
    "衉",
    "課",
    "课",
    "錁",
    "锞",
    "騍",
    "骒"
  ],
  tù: ["兎", "兔", "堍", "迌", "鵵"],
  dǎng: ["党", "攩", "欓", "譡", "讜", "谠", "黨", "𣗋"],
  dōu: ["兜", "兠", "唗", "橷", "篼", "蔸"],
  huǎng: [
    "兤",
    "奛",
    "幌",
    "怳",
    "恍",
    "晄",
    "炾",
    "熀",
    "縨",
    "詤",
    "謊",
    "谎"
  ],
  rù: ["入", "嗕", "媷", "扖", "杁", "洳", "溽", "縟", "缛", "蓐", "褥", "鳰"],
  nèi: ["內", "氝", "氞", "錗"],
  "yú shù": ["兪"],
  "liù lù": ["六"],
  han: ["兯", "爳"],
  tiān: ["兲", "天", "婖", "添", "酟", "靔", "靝", "黇"],
  "xīng xìng": ["兴"],
  diǎn: [
    "典",
    "嚸",
    "奌",
    "婰",
    "敟",
    "椣",
    "点",
    "碘",
    "蒧",
    "蕇",
    "踮",
    "點"
  ],
  "zī cí": ["兹"],
  jiān: [
    "兼",
    "冿",
    "囏",
    "坚",
    "堅",
    "奸",
    "姦",
    "姧",
    "尖",
    "幵",
    "惤",
    "戋",
    "戔",
    "搛",
    "椾",
    "樫",
    "櫼",
    "歼",
    "殱",
    "殲",
    "湔",
    "瀐",
    "瀸",
    "煎",
    "熞",
    "熸",
    "牋",
    "瑊",
    "睷",
    "礛",
    "礷",
    "笺",
    "箋",
    "緘",
    "縑",
    "缄",
    "缣",
    "肩",
    "艰",
    "艱",
    "菅",
    "菺",
    "葌",
    "蒹",
    "蔪",
    "蕑",
    "蕳",
    "虃",
    "譼",
    "豜",
    "鑯",
    "雃",
    "鞯",
    "韀",
    "韉",
    "餰",
    "馢",
    "鰔",
    "鰜",
    "鰹",
    "鲣",
    "鳒",
    "鵑",
    "鵳",
    "鶼",
    "鹣",
    "麉"
  ],
  shòu: [
    "兽",
    "受",
    "售",
    "壽",
    "夀",
    "寿",
    "授",
    "狩",
    "獣",
    "獸",
    "痩",
    "瘦",
    "綬",
    "绶",
    "膄"
  ],
  jì: [
    "兾",
    "冀",
    "剂",
    "剤",
    "劑",
    "勣",
    "坖",
    "垍",
    "塈",
    "妓",
    "季",
    "寂",
    "寄",
    "廭",
    "彑",
    "徛",
    "忌",
    "悸",
    "惎",
    "懻",
    "技",
    "旡",
    "既",
    "旣",
    "暨",
    "暩",
    "曁",
    "梞",
    "檕",
    "檵",
    "洎",
    "漃",
    "漈",
    "瀱",
    "痵",
    "癠",
    "禝",
    "稩",
    "稷",
    "穄",
    "穊",
    "穧",
    "紀",
    "継",
    "績",
    "繋",
    "繼",
    "继",
    "绩",
    "罽",
    "臮",
    "芰",
    "茍",
    "茤",
    "葪",
    "蓟",
    "蔇",
    "薊",
    "蘎",
    "蘮",
    "蘻",
    "裚",
    "襀",
    "覬",
    "觊",
    "計",
    "記",
    "誋",
    "计",
    "记",
    "跡",
    "跽",
    "蹟",
    "迹",
    "际",
    "際",
    "霁",
    "霽",
    "驥",
    "骥",
    "髻",
    "鬾",
    "魝",
    "魥",
    "鯚",
    "鯽",
    "鰶",
    "鰿",
    "鱀",
    "鱭",
    "鲚",
    "鲫",
    "鵋",
    "鷑",
    "齌",
    "𪟝",
    "𬶨",
    "𬶭"
  ],
  jiōng: ["冂", "冋", "坰", "埛", "扃", "蘏", "蘔", "駉", "駫", "𬳶"],
  mào: [
    "冃",
    "冐",
    "媢",
    "帽",
    "愗",
    "懋",
    "暓",
    "柕",
    "楙",
    "毷",
    "瑁",
    "皃",
    "眊",
    "瞀",
    "耄",
    "茂",
    "萺",
    "蝐",
    "袤",
    "覒",
    "貌",
    "貿",
    "贸",
    "鄚",
    "鄮"
  ],
  rǎn: ["冄", "冉", "姌", "媣", "染", "珃", "苒", "蒅", "䎃"],
  "nèi nà": ["内"],
  gāng: [
    "冈",
    "冮",
    "刚",
    "剛",
    "堈",
    "堽",
    "岡",
    "掆",
    "摃",
    "棡",
    "牨",
    "犅",
    "疘",
    "綱",
    "纲",
    "缸",
    "罁",
    "罡",
    "肛",
    "釭",
    "鎠",
    "㭎"
  ],
  cè: [
    "冊",
    "册",
    "厕",
    "厠",
    "夨",
    "廁",
    "恻",
    "惻",
    "憡",
    "敇",
    "测",
    "測",
    "笧",
    "策",
    "筞",
    "筴",
    "箣",
    "荝",
    "萗",
    "萴",
    "蓛"
  ],
  guǎ: ["冎", "剐", "剮", "叧", "寡"],
  "mào mò": ["冒"],
  gòu: [
    "冓",
    "啂",
    "坸",
    "垢",
    "够",
    "夠",
    "媾",
    "彀",
    "搆",
    "撀",
    "构",
    "構",
    "煹",
    "覯",
    "觏",
    "訽",
    "詬",
    "诟",
    "購",
    "购",
    "遘",
    "雊"
  ],
  xǔ: ["冔", "喣", "暊", "栩", "珝", "盨", "糈", "詡", "諿", "诩", "鄦", "醑"],
  mì: [
    "冖",
    "冪",
    "嘧",
    "塓",
    "宻",
    "密",
    "峚",
    "幂",
    "幎",
    "幦",
    "怽",
    "榓",
    "樒",
    "櫁",
    "汨",
    "淧",
    "滵",
    "漞",
    "濗",
    "熐",
    "羃",
    "蔤",
    "蜜",
    "覓",
    "覔",
    "覛",
    "觅",
    "謐",
    "谧",
    "鼏"
  ],
  "yóu yín": ["冘"],
  xiě: ["写", "冩", "藛"],
  jūn: [
    "军",
    "君",
    "均",
    "桾",
    "汮",
    "皲",
    "皸",
    "皹",
    "碅",
    "莙",
    "蚐",
    "袀",
    "覠",
    "軍",
    "鈞",
    "銁",
    "銞",
    "鍕",
    "钧",
    "頵",
    "鮶",
    "鲪",
    "麏"
  ],
  mí: [
    "冞",
    "擟",
    "瀰",
    "爢",
    "猕",
    "獼",
    "祢",
    "禰",
    "縻",
    "蒾",
    "藌",
    "蘪",
    "蘼",
    "袮",
    "詸",
    "謎",
    "迷",
    "醚",
    "醾",
    "醿",
    "釄",
    "镾",
    "鸍",
    "麊",
    "麋",
    "麛"
  ],
  "guān guàn": ["冠", "覌", "観", "觀", "观"],
  měng: [
    "冡",
    "勐",
    "懵",
    "掹",
    "猛",
    "獴",
    "艋",
    "蜢",
    "蠓",
    "錳",
    "锰",
    "鯭",
    "鼆"
  ],
  zhǒng: ["冢", "塚", "尰", "歱", "煄", "瘇", "肿", "腫", "踵"],
  zuì: [
    "冣",
    "嶵",
    "晬",
    "最",
    "栬",
    "槜",
    "檇",
    "檌",
    "祽",
    "絊",
    "罪",
    "蕞",
    "辠",
    "酔",
    "酻",
    "醉",
    "錊"
  ],
  yuān: [
    "冤",
    "剈",
    "囦",
    "嬽",
    "寃",
    "棩",
    "淵",
    "渁",
    "渆",
    "渊",
    "渕",
    "灁",
    "眢",
    "肙",
    "葾",
    "蒬",
    "蜎",
    "蜵",
    "駌",
    "鳶",
    "鴛",
    "鵷",
    "鸢",
    "鸳",
    "鹓",
    "鼘",
    "鼝"
  ],
  míng: [
    "冥",
    "名",
    "明",
    "暝",
    "朙",
    "榠",
    "洺",
    "溟",
    "猽",
    "眀",
    "眳",
    "瞑",
    "茗",
    "螟",
    "覭",
    "詺",
    "鄍",
    "銘",
    "铭",
    "鳴",
    "鸣"
  ],
  kòu: [
    "冦",
    "叩",
    "宼",
    "寇",
    "扣",
    "敂",
    "滱",
    "窛",
    "筘",
    "簆",
    "蔲",
    "蔻",
    "釦",
    "鷇"
  ],
  tài: [
    "冭",
    "太",
    "夳",
    "忲",
    "态",
    "態",
    "汰",
    "汱",
    "泰",
    "溙",
    "肽",
    "舦",
    "酞",
    "鈦",
    "钛"
  ],
  "féng píng": ["冯", "馮"],
  "chōng chòng": ["冲"],
  kuàng: [
    "况",
    "圹",
    "壙",
    "岲",
    "懬",
    "旷",
    "昿",
    "曠",
    "框",
    "況",
    "爌",
    "眖",
    "眶",
    "矿",
    "砿",
    "礦",
    "穬",
    "絋",
    "絖",
    "纊",
    "纩",
    "貺",
    "贶",
    "軦",
    "邝",
    "鄺",
    "鉱",
    "鋛",
    "鑛",
    "黋"
  ],
  lěng: ["冷"],
  pàn: [
    "冸",
    "判",
    "叛",
    "沜",
    "泮",
    "溿",
    "炍",
    "牉",
    "畔",
    "盼",
    "聁",
    "袢",
    "襻",
    "詊",
    "鋬",
    "鑻",
    "頖",
    "鵥"
  ],
  fā: ["冹", "彂", "沷", "発", "發"],
  xiǎn: [
    "冼",
    "尟",
    "尠",
    "崄",
    "嶮",
    "幰",
    "攇",
    "显",
    "櫶",
    "毨",
    "灦",
    "烍",
    "燹",
    "狝",
    "猃",
    "獫",
    "獮",
    "玁",
    "禒",
    "筅",
    "箲",
    "藓",
    "蘚",
    "蚬",
    "蜆",
    "譣",
    "赻",
    "跣",
    "鍌",
    "险",
    "険",
    "險",
    "韅",
    "顕",
    "顯",
    "㬎"
  ],
  qià: ["冾", "圶", "帢", "恰", "殎", "洽", "硈", "胢", "髂"],
  "jìng chēng": ["净", "凈", "淨"],
  sōu: [
    "凁",
    "嗖",
    "廀",
    "廋",
    "捜",
    "搜",
    "摉",
    "溲",
    "獀",
    "艘",
    "蒐",
    "螋",
    "鄋",
    "醙",
    "鎪",
    "锼",
    "颼",
    "飕",
    "餿",
    "馊",
    "騪"
  ],
  měi: [
    "凂",
    "媄",
    "媺",
    "嬍",
    "嵄",
    "挴",
    "毎",
    "每",
    "浼",
    "渼",
    "燘",
    "美",
    "躾",
    "鎂",
    "镁",
    "黣"
  ],
  tú: [
    "凃",
    "図",
    "图",
    "圖",
    "圗",
    "塗",
    "屠",
    "峹",
    "嵞",
    "庩",
    "廜",
    "徒",
    "悇",
    "揬",
    "涂",
    "瘏",
    "筡",
    "腯",
    "荼",
    "蒤",
    "跿",
    "途",
    "酴",
    "鈯",
    "鍎",
    "馟",
    "駼",
    "鵌",
    "鶟",
    "鷋",
    "鷵",
    "𬳿"
  ],
  zhǔn: ["准", "凖", "埻", "準", "𬘯"],
  "liáng liàng": ["凉", "涼", "量"],
  diāo: [
    "凋",
    "刁",
    "刟",
    "叼",
    "奝",
    "弴",
    "彫",
    "汈",
    "琱",
    "碉",
    "簓",
    "虭",
    "蛁",
    "貂",
    "錭",
    "雕",
    "鮉",
    "鯛",
    "鲷",
    "鵰",
    "鼦"
  ],
  còu: ["凑", "湊", "腠", "輳", "辏"],
  ái: ["凒", "啀", "嘊", "捱", "溰", "癌", "皑", "皚"],
  duó: ["凙", "剫", "夺", "奪", "痥", "踱", "鈬", "鐸", "铎"],
  dú: [
    "凟",
    "匵",
    "嬻",
    "椟",
    "櫝",
    "殰",
    "涜",
    "牍",
    "牘",
    "犊",
    "犢",
    "独",
    "獨",
    "瓄",
    "皾",
    "裻",
    "読",
    "讀",
    "讟",
    "豄",
    "贕",
    "錖",
    "鑟",
    "韇",
    "韣",
    "韥",
    "騳",
    "髑",
    "黩",
    "黷"
  ],
  "jǐ jī": ["几"],
  fán: [
    "凡",
    "凢",
    "凣",
    "匥",
    "墦",
    "杋",
    "柉",
    "棥",
    "樊",
    "瀿",
    "烦",
    "煩",
    "燔",
    "璠",
    "矾",
    "礬",
    "笲",
    "籵",
    "緐",
    "羳",
    "舤",
    "舧",
    "薠",
    "蘩",
    "蠜",
    "襎",
    "蹯",
    "釩",
    "鐇",
    "鐢",
    "钒",
    "鷭",
    "𫔍",
    "𬸪"
  ],
  jū: [
    "凥",
    "匊",
    "娵",
    "婮",
    "居",
    "崌",
    "抅",
    "挶",
    "掬",
    "梮",
    "椐",
    "檋",
    "毩",
    "毱",
    "泃",
    "涺",
    "狙",
    "琚",
    "疽",
    "砠",
    "罝",
    "腒",
    "艍",
    "蜛",
    "裾",
    "諊",
    "跔",
    "踘",
    "躹",
    "陱",
    "雎",
    "鞠",
    "鞫",
    "駒",
    "驹",
    "鮈",
    "鴡",
    "鶋",
    "𬶋"
  ],
  "chù chǔ": ["処", "处"],
  zhǐ: [
    "凪",
    "劧",
    "咫",
    "址",
    "坧",
    "帋",
    "恉",
    "扺",
    "指",
    "旨",
    "枳",
    "止",
    "汦",
    "沚",
    "洔",
    "淽",
    "疻",
    "砋",
    "祉",
    "秖",
    "紙",
    "纸",
    "芷",
    "藢",
    "衹",
    "襧",
    "訨",
    "趾",
    "軹",
    "轵",
    "酯",
    "阯",
    "黹"
  ],
  píng: [
    "凭",
    "凴",
    "呯",
    "坪",
    "塀",
    "岼",
    "帡",
    "帲",
    "幈",
    "平",
    "慿",
    "憑",
    "枰",
    "洴",
    "焩",
    "玶",
    "瓶",
    "甁",
    "竮",
    "箳",
    "簈",
    "缾",
    "荓",
    "萍",
    "蓱",
    "蚲",
    "蛢",
    "評",
    "评",
    "軿",
    "輧",
    "郱",
    "鮃",
    "鲆"
  ],
  kǎi: [
    "凯",
    "凱",
    "剀",
    "剴",
    "垲",
    "塏",
    "恺",
    "愷",
    "慨",
    "暟",
    "蒈",
    "輆",
    "鍇",
    "鎧",
    "铠",
    "锴",
    "闓",
    "闿",
    "颽"
  ],
  gān: [
    "凲",
    "坩",
    "尲",
    "尴",
    "尶",
    "尷",
    "柑",
    "泔",
    "漧",
    "玕",
    "甘",
    "疳",
    "矸",
    "竿",
    "筸",
    "粓",
    "肝",
    "苷",
    "迀",
    "酐",
    "魐"
  ],
  "kǎn qiǎn": ["凵"],
  tū: [
    "凸",
    "堗",
    "嶀",
    "捸",
    "涋",
    "湥",
    "痜",
    "禿",
    "秃",
    "突",
    "葖",
    "鋵",
    "鵚",
    "鼵",
    "㻬"
  ],
  "āo wā": ["凹"],
  chū: ["出", "初", "岀", "摴", "榋", "樗", "貙", "齣", "䢺", "䝙"],
  dàng: [
    "凼",
    "圵",
    "垱",
    "壋",
    "档",
    "檔",
    "氹",
    "璗",
    "瓽",
    "盪",
    "瞊",
    "砀",
    "碭",
    "礑",
    "簜",
    "荡",
    "菪",
    "蕩",
    "蘯",
    "趤",
    "逿",
    "雼",
    "𬍡"
  ],
  hán: [
    "函",
    "凾",
    "含",
    "圅",
    "娢",
    "寒",
    "崡",
    "晗",
    "梒",
    "浛",
    "涵",
    "澏",
    "焓",
    "琀",
    "甝",
    "筨",
    "蜬",
    "邗",
    "邯",
    "鋡",
    "韓",
    "韩"
  ],
  záo: ["凿", "鑿"],
  dāo: ["刀", "刂", "忉", "氘", "舠", "螩", "釖", "魛", "鱽"],
  chuāng: ["刅", "摐", "牎", "牕", "疮", "瘡", "窓", "窗", "窻"],
  "fēn fèn": ["分"],
  "qiè qiē": ["切"],
  kān: ["刊", "勘", "堪", "戡", "栞", "龕", "龛"],
  cǔn: ["刌", "忖"],
  chú: [
    "刍",
    "厨",
    "幮",
    "廚",
    "橱",
    "櫉",
    "櫥",
    "滁",
    "犓",
    "篨",
    "耡",
    "芻",
    "蒢",
    "蒭",
    "蜍",
    "蟵",
    "豠",
    "趎",
    "蹰",
    "躇",
    "躕",
    "鉏",
    "鋤",
    "锄",
    "除",
    "雏",
    "雛",
    "鶵"
  ],
  "huà huá": ["划"],
  lí: [
    "刕",
    "剓",
    "剺",
    "劙",
    "厘",
    "喱",
    "嚟",
    "囄",
    "嫠",
    "孷",
    "廲",
    "悡",
    "梨",
    "梸",
    "棃",
    "漓",
    "灕",
    "犁",
    "犂",
    "狸",
    "琍",
    "璃",
    "瓈",
    "盠",
    "睝",
    "离",
    "穲",
    "竰",
    "筣",
    "篱",
    "籬",
    "糎",
    "縭",
    "缡",
    "罹",
    "艃",
    "荲",
    "菞",
    "蓠",
    "蔾",
    "藜",
    "蘺",
    "蜊",
    "蟍",
    "蟸",
    "蠫",
    "褵",
    "謧",
    "貍",
    "醨",
    "鋫",
    "錅",
    "鏫",
    "鑗",
    "離",
    "驪",
    "骊",
    "鯏",
    "鯬",
    "鱺",
    "鲡",
    "鵹",
    "鸝",
    "鹂",
    "黎",
    "黧",
    "㰀"
  ],
  yuè: [
    "刖",
    "嬳",
    "岄",
    "岳",
    "嶽",
    "恱",
    "悅",
    "悦",
    "戉",
    "抈",
    "捳",
    "月",
    "樾",
    "瀹",
    "爚",
    "玥",
    "礿",
    "禴",
    "篗",
    "籆",
    "籥",
    "籰",
    "粤",
    "粵",
    "蘥",
    "蚎",
    "蚏",
    "説",
    "越",
    "跀",
    "跃",
    "躍",
    "軏",
    "鈅",
    "鉞",
    "鑰",
    "钺",
    "閱",
    "閲",
    "阅",
    "鸑",
    "鸙",
    "黦",
    "龠",
    "𫐄",
    "𬸚"
  ],
  liú: [
    "刘",
    "劉",
    "嚠",
    "媹",
    "嵧",
    "旈",
    "旒",
    "榴",
    "橊",
    "流",
    "浏",
    "瀏",
    "琉",
    "瑠",
    "瑬",
    "璢",
    "畄",
    "留",
    "畱",
    "疁",
    "瘤",
    "癅",
    "硫",
    "蒥",
    "蓅",
    "蟉",
    "裗",
    "鎏",
    "鏐",
    "鐂",
    "镠",
    "飀",
    "飅",
    "飗",
    "駠",
    "駵",
    "騮",
    "驑",
    "骝",
    "鰡",
    "鶹",
    "鹠",
    "麍"
  ],
  zé: [
    "则",
    "則",
    "啧",
    "嘖",
    "嫧",
    "帻",
    "幘",
    "択",
    "樍",
    "歵",
    "沢",
    "泎",
    "溭",
    "皟",
    "瞔",
    "矠",
    "礋",
    "箦",
    "簀",
    "舴",
    "蔶",
    "蠌",
    "襗",
    "謮",
    "賾",
    "赜",
    "迮",
    "鸅",
    "齚",
    "齰"
  ],
  "chuàng chuāng": ["创", "創"],
  qù: ["刞", "厺", "去", "閴", "闃", "阒", "麮", "鼁"],
  "bié biè": ["別", "别"],
  "páo bào": ["刨"],
  "chǎn chàn": ["刬", "剗", "幝"],
  guā: [
    "刮",
    "劀",
    "桰",
    "歄",
    "煱",
    "瓜",
    "胍",
    "踻",
    "颪",
    "颳",
    "騧",
    "鴰",
    "鸹"
  ],
  gēng: [
    "刯",
    "庚",
    "椩",
    "浭",
    "焿",
    "畊",
    "絚",
    "羮",
    "羹",
    "耕",
    "菮",
    "賡",
    "赓",
    "鶊",
    "鹒"
  ],
  dào: [
    "到",
    "噵",
    "悼",
    "椡",
    "檤",
    "燾",
    "瓙",
    "盗",
    "盜",
    "稲",
    "稻",
    "纛",
    "翿",
    "艔",
    "菿",
    "衜",
    "衟",
    "軇",
    "道"
  ],
  chuàng: ["刱", "剏", "剙", "怆", "愴"],
  kū: ["刳", "哭", "圐", "堀", "枯", "桍", "矻", "窟", "跍", "郀", "骷", "鮬"],
  duò: [
    "刴",
    "剁",
    "墯",
    "尮",
    "惰",
    "憜",
    "挅",
    "桗",
    "舵",
    "跥",
    "跺",
    "陊",
    "陏",
    "飿",
    "饳",
    "鵽"
  ],
  "shuā shuà": ["刷"],
  "quàn xuàn": ["券"],
  "chà shā": ["刹", "剎"],
  "cì cī": ["刺"],
  guì: [
    "刽",
    "刿",
    "劊",
    "劌",
    "撌",
    "攰",
    "昋",
    "桂",
    "椢",
    "槶",
    "樻",
    "櫃",
    "猤",
    "禬",
    "筀",
    "蓕",
    "襘",
    "貴",
    "贵",
    "跪",
    "鐀",
    "鑎",
    "鞼",
    "鱖",
    "鱥"
  ],
  lóu: [
    "剅",
    "娄",
    "婁",
    "廔",
    "楼",
    "樓",
    "溇",
    "漊",
    "熡",
    "耧",
    "耬",
    "艛",
    "蒌",
    "蔞",
    "蝼",
    "螻",
    "謱",
    "軁",
    "遱",
    "鞻",
    "髅",
    "髏",
    "𪣻"
  ],
  cuò: [
    "剉",
    "剒",
    "厝",
    "夎",
    "挫",
    "措",
    "棤",
    "莝",
    "莡",
    "蓌",
    "逪",
    "銼",
    "錯",
    "锉",
    "错"
  ],
  "xiāo xuē": ["削"],
  "kēi kè": ["剋", "尅"],
  "là lá": ["剌"],
  tī: ["剔", "梯", "踢", "銻", "锑", "鷈", "鷉", "䏲", "䴘"],
  pōu: ["剖"],
  wān: ["剜", "塆", "壪", "帵", "弯", "彎", "湾", "潫", "灣", "睕", "蜿", "豌"],
  "bāo bō": ["剝", "剥"],
  duō: ["剟", "咄", "哆", "嚉", "多", "夛", "掇", "毲", "畓", "裰", "㙍"],
  qíng: [
    "剠",
    "勍",
    "夝",
    "情",
    "擎",
    "晴",
    "暒",
    "棾",
    "樈",
    "檠",
    "氰",
    "甠",
    "硘",
    "葝",
    "黥"
  ],
  "yǎn shàn": ["剡"],
  "dū zhuó": ["剢"],
  yān: [
    "剦",
    "嫣",
    "崦",
    "嶖",
    "恹",
    "懕",
    "懨",
    "樮",
    "淊",
    "淹",
    "漹",
    "烟",
    "焉",
    "焑",
    "煙",
    "珚",
    "篶",
    "胭",
    "臙",
    "菸",
    "鄢",
    "醃",
    "閹",
    "阉",
    "黫"
  ],
  huō: ["剨", "劐", "吙", "攉", "秴", "耠", "锪", "騞", "𬴃"],
  shèng: [
    "剩",
    "剰",
    "勝",
    "圣",
    "墭",
    "嵊",
    "晠",
    "榺",
    "橳",
    "琞",
    "聖",
    "蕂",
    "貹",
    "賸"
  ],
  "duān zhì": ["剬"],
  wū: [
    "剭",
    "呜",
    "嗚",
    "圬",
    "屋",
    "巫",
    "弙",
    "杇",
    "歍",
    "汙",
    "汚",
    "污",
    "洿",
    "烏",
    "窏",
    "箼",
    "螐",
    "誈",
    "誣",
    "诬",
    "邬",
    "鄔",
    "鎢",
    "钨",
    "鰞",
    "鴮"
  ],
  gē: [
    "割",
    "哥",
    "圪",
    "彁",
    "戈",
    "戓",
    "戨",
    "歌",
    "滒",
    "犵",
    "肐",
    "袼",
    "謌",
    "鎶",
    "鴚",
    "鴿",
    "鸽"
  ],
  "dá zhá": ["剳"],
  chuán: ["剶", "暷", "椽", "篅", "舡", "舩", "船", "輲", "遄"],
  "tuán zhuān": ["剸", "漙", "篿"],
  "lù jiū": ["剹"],
  pēng: ["剻", "匉", "嘭", "怦", "恲", "抨", "梈", "烹", "砰", "軯", "駍"],
  piāo: ["剽", "勡", "慓", "旚", "犥", "翲", "螵", "飃", "飄", "飘", "魒"],
  kōu: ["剾", "彄", "抠", "摳", "眍", "瞘", "芤", "𫸩"],
  "jiǎo chāo": ["剿", "劋", "勦", "摷"],
  qiāo: [
    "劁",
    "勪",
    "墝",
    "幧",
    "敲",
    "橇",
    "毃",
    "燆",
    "硗",
    "磽",
    "繑",
    "趬",
    "跷",
    "踍",
    "蹺",
    "蹻",
    "郻",
    "鄡",
    "鄥",
    "鍫",
    "鍬",
    "鐰",
    "锹",
    "頝"
  ],
  "huá huà": ["劃"],
  "zhā zhá": ["劄"],
  "pī pǐ": ["劈", "悂"],
  tāng: ["劏", "嘡", "羰", "薚", "蝪", "蹚", "鞺", "鼞"],
  chán: [
    "劖",
    "嚵",
    "壥",
    "婵",
    "嬋",
    "巉",
    "廛",
    "棎",
    "毚",
    "湹",
    "潹",
    "潺",
    "澶",
    "瀍",
    "瀺",
    "煘",
    "獑",
    "磛",
    "緾",
    "纏",
    "纒",
    "缠",
    "艬",
    "蝉",
    "蟐",
    "蟬",
    "蟾",
    "誗",
    "讒",
    "谗",
    "躔",
    "鄽",
    "酁",
    "鋋",
    "鑱",
    "镵",
    "饞",
    "馋"
  ],
  zuān: ["劗", "躜", "躦", "鉆", "鑚"],
  mó: [
    "劘",
    "嫫",
    "嬤",
    "嬷",
    "尛",
    "摹",
    "擵",
    "橅",
    "糢",
    "膜",
    "藦",
    "蘑",
    "謨",
    "謩",
    "谟",
    "饃",
    "饝",
    "馍",
    "髍",
    "魔",
    "魹"
  ],
  zhú: [
    "劚",
    "斸",
    "曯",
    "欘",
    "灟",
    "炢",
    "烛",
    "燭",
    "爥",
    "瘃",
    "竹",
    "笁",
    "笜",
    "舳",
    "茿",
    "蓫",
    "蠋",
    "蠾",
    "躅",
    "逐",
    "逫",
    "钃",
    "鱁"
  ],
  quàn: ["劝", "勧", "勸", "牶", "韏"],
  "jìn jìng": ["劤", "劲", "勁"],
  kēng: ["劥", "坑", "牼", "硁", "硜", "誙", "銵", "鍞", "鏗", "铿", "阬"],
  "xié liè": ["劦"],
  "zhù chú": ["助"],
  nǔ: ["努", "弩", "砮", "胬"],
  shào: ["劭", "卲", "哨", "潲", "紹", "綤", "绍", "袑", "邵"],
  miǎo: ["劰", "杪", "淼", "渺", "眇", "秒", "篎", "緲", "缈", "藐", "邈"],
  kǒu: ["劶", "口"],
  wā: [
    "劸",
    "娲",
    "媧",
    "屲",
    "挖",
    "攨",
    "洼",
    "溛",
    "漥",
    "瓾",
    "畖",
    "穵",
    "窊",
    "窪",
    "蛙",
    "韈",
    "鼃"
  ],
  kuāng: [
    "劻",
    "匡",
    "匩",
    "哐",
    "恇",
    "洭",
    "筐",
    "筺",
    "誆",
    "诓",
    "軭",
    "邼"
  ],
  hé: [
    "劾",
    "咊",
    "啝",
    "姀",
    "峆",
    "敆",
    "曷",
    "柇",
    "楁",
    "毼",
    "河",
    "涸",
    "渮",
    "澕",
    "熆",
    "皬",
    "盇",
    "盉",
    "盍",
    "盒",
    "禾",
    "篕",
    "籺",
    "粭",
    "翮",
    "菏",
    "萂",
    "覈",
    "訸",
    "詥",
    "郃",
    "釛",
    "鉌",
    "鑉",
    "閡",
    "闔",
    "阂",
    "阖",
    "鞨",
    "頜",
    "餄",
    "饸",
    "魺",
    "鹖",
    "麧",
    "齕",
    "龁",
    "龢",
    "𬌗"
  ],
  gào: [
    "勂",
    "吿",
    "告",
    "峼",
    "祮",
    "祰",
    "禞",
    "筶",
    "誥",
    "诰",
    "郜",
    "鋯",
    "锆"
  ],
  "bó bèi": ["勃"],
  láng: [
    "勆",
    "嫏",
    "廊",
    "斏",
    "桹",
    "榔",
    "樃",
    "欴",
    "狼",
    "琅",
    "瑯",
    "硠",
    "稂",
    "艆",
    "蓈",
    "蜋",
    "螂",
    "躴",
    "郒",
    "郞",
    "鋃",
    "鎯",
    "锒"
  ],
  xūn: [
    "勋",
    "勛",
    "勲",
    "勳",
    "嚑",
    "坃",
    "埙",
    "塤",
    "壎",
    "壦",
    "曛",
    "燻",
    "獯",
    "矄",
    "纁",
    "臐",
    "薫",
    "薰",
    "蘍",
    "醺",
    "𫄸"
  ],
  "juàn juān": ["勌", "瓹"],
  "lè lēi": ["勒"],
  kài: ["勓", "炌", "烗", "鎎"],
  "wěng yǎng": ["勜"],
  qín: [
    "勤",
    "嗪",
    "噙",
    "嶜",
    "庈",
    "懃",
    "懄",
    "捦",
    "擒",
    "斳",
    "檎",
    "澿",
    "珡",
    "琴",
    "琹",
    "瘽",
    "禽",
    "秦",
    "耹",
    "芩",
    "芹",
    "菦",
    "螓",
    "蠄",
    "鈙",
    "鈫",
    "雂",
    "靲",
    "鳹",
    "鵭"
  ],
  jiàng: [
    "勥",
    "匞",
    "匠",
    "嵹",
    "弜",
    "弶",
    "摾",
    "櫤",
    "洚",
    "滰",
    "犟",
    "糡",
    "糨",
    "絳",
    "绛",
    "謽",
    "酱",
    "醤",
    "醬"
  ],
  fān: [
    "勫",
    "嬏",
    "帆",
    "幡",
    "忛",
    "憣",
    "旙",
    "旛",
    "繙",
    "翻",
    "藩",
    "轓",
    "颿",
    "飜",
    "鱕"
  ],
  juān: ["勬", "姢", "娟", "捐", "涓", "蠲", "裐", "鎸", "鐫", "镌", "鹃"],
  "tóng dòng": ["勭", "烔", "燑", "狪"],
  lǜ: [
    "勴",
    "垏",
    "嵂",
    "律",
    "慮",
    "氯",
    "滤",
    "濾",
    "爈",
    "箻",
    "綠",
    "繂",
    "膟",
    "葎",
    "虑",
    "鑢"
  ],
  chè: [
    "勶",
    "坼",
    "彻",
    "徹",
    "掣",
    "撤",
    "澈",
    "烢",
    "爡",
    "瞮",
    "硩",
    "聅",
    "迠",
    "頙",
    "㬚"
  ],
  sháo: ["勺", "玿", "韶"],
  "gōu gòu": ["勾"],
  cōng: [
    "匆",
    "囪",
    "囱",
    "忩",
    "怱",
    "悤",
    "暰",
    "樬",
    "漗",
    "瑽",
    "璁",
    "瞛",
    "篵",
    "繱",
    "聡",
    "聦",
    "聪",
    "聰",
    "苁",
    "茐",
    "葱",
    "蓯",
    "蔥",
    "蟌",
    "鍯",
    "鏓",
    "鏦",
    "騘",
    "驄",
    "骢"
  ],
  "táo yáo": ["匋", "陶"],
  páo: ["匏", "咆", "垉", "庖", "爮", "狍", "袍", "褜", "軳", "鞄", "麅"],
  dá: [
    "匒",
    "妲",
    "怛",
    "炟",
    "燵",
    "畣",
    "笪",
    "羍",
    "荙",
    "薘",
    "蟽",
    "詚",
    "达",
    "迏",
    "迖",
    "迚",
    "逹",
    "達",
    "鐽",
    "靼",
    "鞑",
    "韃",
    "龖",
    "龘",
    "𫟼"
  ],
  "huà huā": ["化"],
  "běi bèi": ["北"],
  nǎo: ["匘", "垴", "堖", "嫐", "恼", "悩", "惱", "瑙", "碯", "脑", "脳", "腦"],
  "chí shi": ["匙"],
  fāng: ["匚", "堏", "方", "淓", "牥", "芳", "邡", "鈁", "錺", "钫", "鴋"],
  zā: ["匝", "咂", "帀", "沞", "臜", "臢", "迊", "鉔", "魳"],
  qiè: [
    "匧",
    "厒",
    "妾",
    "怯",
    "悏",
    "惬",
    "愜",
    "挈",
    "穕",
    "窃",
    "竊",
    "笡",
    "箧",
    "篋",
    "籡",
    "踥",
    "鍥",
    "锲",
    "鯜"
  ],
  "zāng cáng": ["匨"],
  fěi: ["匪", "奜", "悱", "棐", "榧", "篚", "翡", "蕜", "誹", "诽"],
  "kuì guì": ["匮", "匱"],
  suǎn: ["匴"],
  pǐ: ["匹", "噽", "嚭", "圮", "庀", "痞", "癖", "脴", "苉", "銢", "鴄"],
  "qū ōu": ["区", "區"],
  "kē qià": ["匼"],
  "yǎn yàn": ["匽", "棪"],
  biǎn: ["匾", "惼", "揙", "碥", "稨", "窆", "藊", "褊", "貶", "贬", "鴘"],
  nì: [
    "匿",
    "堄",
    "嫟",
    "嬺",
    "惄",
    "愵",
    "昵",
    "暱",
    "氼",
    "眤",
    "睨",
    "縌",
    "胒",
    "腻",
    "膩",
    "逆",
    "𨺙"
  ],
  niàn: ["卄", "唸", "埝", "廿", "念", "惗", "艌"],
  sà: ["卅", "櫒", "脎", "萨", "蕯", "薩", "鈒", "隡", "颯", "飒", "馺"],
  zú: ["卆", "哫", "崪", "族", "箤", "足", "踤", "镞"],
  shēng: [
    "升",
    "呏",
    "声",
    "斘",
    "昇",
    "曻",
    "枡",
    "殅",
    "泩",
    "湦",
    "焺",
    "牲",
    "珄",
    "生",
    "甥",
    "竔",
    "笙",
    "聲",
    "鉎",
    "鍟",
    "阩",
    "陞",
    "陹",
    "鵿",
    "鼪"
  ],
  wàn: [
    "卍",
    "卐",
    "忨",
    "杤",
    "瞣",
    "脕",
    "腕",
    "萬",
    "蟃",
    "贎",
    "輐",
    "錽",
    "𬇕"
  ],
  "huá huà huā": ["华", "華"],
  bēi: ["卑", "悲", "揹", "杯", "桮", "盃", "碑", "藣", "鵯", "鹎"],
  "zú cù": ["卒"],
  "dān shàn chán": ["单", "單"],
  "nán nā": ["南"],
  "shuài lǜ": ["卛"],
  "bǔ bo pú": ["卜"],
  "kuàng guàn": ["卝"],
  biàn: [
    "卞",
    "变",
    "変",
    "峅",
    "弁",
    "徧",
    "忭",
    "抃",
    "昪",
    "汳",
    "汴",
    "玣",
    "艑",
    "苄",
    "覍",
    "諚",
    "變",
    "辡",
    "辧",
    "辨",
    "辩",
    "辫",
    "辮",
    "辯",
    "遍",
    "釆",
    "𨚕"
  ],
  bǔ: ["卟", "哺", "捕", "补", "補", "鸔", "𬷕"],
  "zhàn zhān": ["占", "覱"],
  "kǎ qiǎ": ["卡"],
  lú: [
    "卢",
    "嚧",
    "垆",
    "壚",
    "庐",
    "廬",
    "曥",
    "枦",
    "栌",
    "櫨",
    "泸",
    "瀘",
    "炉",
    "爐",
    "獹",
    "玈",
    "瓐",
    "盧",
    "矑",
    "籚",
    "纑",
    "罏",
    "胪",
    "臚",
    "舮",
    "舻",
    "艫",
    "芦",
    "蘆",
    "蠦",
    "轤",
    "轳",
    "鈩",
    "鑪",
    "顱",
    "颅",
    "馿",
    "髗",
    "魲",
    "鱸",
    "鲈",
    "鸕",
    "鸬",
    "黸",
    "𬬻"
  ],
  lǔ: [
    "卤",
    "塷",
    "掳",
    "擄",
    "樐",
    "橹",
    "櫓",
    "氌",
    "滷",
    "澛",
    "瀂",
    "硵",
    "磠",
    "穞",
    "艣",
    "艪",
    "蓾",
    "虏",
    "虜",
    "鏀",
    "鐪",
    "鑥",
    "镥",
    "魯",
    "鲁",
    "鹵"
  ],
  guà: ["卦", "啩", "挂", "掛", "罣", "褂", "詿", "诖"],
  "áng yǎng": ["卬"],
  yìn: [
    "印",
    "垽",
    "堷",
    "廕",
    "慭",
    "憖",
    "憗",
    "懚",
    "洕",
    "湚",
    "猌",
    "癊",
    "胤",
    "茚",
    "酳",
    "鮣",
    "䲟"
  ],
  què: [
    "却",
    "卻",
    "塙",
    "崅",
    "悫",
    "愨",
    "慤",
    "搉",
    "榷",
    "燩",
    "琷",
    "皵",
    "确",
    "確",
    "礭",
    "闋",
    "阕",
    "鵲",
    "鹊",
    "𬒈"
  ],
  luǎn: ["卵"],
  "juàn juǎn": ["卷", "巻"],
  "chǎng ān hàn": ["厂"],
  "wěi yán": ["厃"],
  tīng: [
    "厅",
    "厛",
    "听",
    "庁",
    "廰",
    "廳",
    "汀",
    "烃",
    "烴",
    "綎",
    "耓",
    "聴",
    "聼",
    "聽",
    "鞓",
    "𬘩"
  ],
  "zhé zhái": ["厇"],
  "hàn àn": ["厈", "屽"],
  yǎ: ["厊", "唖", "庌", "痖", "瘂", "蕥"],
  shè: [
    "厍",
    "厙",
    "弽",
    "慑",
    "慴",
    "懾",
    "摂",
    "欇",
    "涉",
    "涻",
    "渉",
    "滠",
    "灄",
    "社",
    "舎",
    "蔎",
    "蠂",
    "設",
    "设",
    "赦",
    "騇",
    "麝"
  ],
  dǐ: [
    "厎",
    "呧",
    "坘",
    "弤",
    "抵",
    "拞",
    "掋",
    "牴",
    "砥",
    "菧",
    "觝",
    "詆",
    "诋",
    "軧",
    "邸",
    "阺",
    "骶",
    "鯳"
  ],
  "zhǎ zhǎi": ["厏"],
  páng: ["厐", "嫎", "庞", "徬", "舽", "螃", "逄", "鰟", "鳑", "龎", "龐"],
  "zhì shī": ["厔"],
  máng: [
    "厖",
    "吂",
    "哤",
    "娏",
    "忙",
    "恾",
    "杗",
    "杧",
    "汒",
    "浝",
    "牻",
    "痝",
    "盲",
    "硭",
    "笀",
    "芒",
    "茫",
    "蘉",
    "邙",
    "釯",
    "鋩",
    "铓",
    "駹"
  ],
  zuī: ["厜", "樶", "纗", "蟕"],
  "shà xià": ["厦", "廈"],
  áo: [
    "厫",
    "嗷",
    "嗸",
    "廒",
    "敖",
    "滶",
    "獒",
    "獓",
    "璈",
    "翱",
    "翶",
    "翺",
    "聱",
    "蔜",
    "螯",
    "謷",
    "謸",
    "遨",
    "鏖",
    "隞",
    "鰲",
    "鳌",
    "鷔",
    "鼇"
  ],
  "lán qiān": ["厱"],
  "sī mǒu": ["厶"],
  "gōng hóng": ["厷"],
  "lín miǎo": ["厸"],
  "qiú róu": ["厹"],
  dū: ["厾", "嘟", "督", "醏"],
  "xiàn xuán": ["县", "縣"],
  "cān shēn cēn sān": ["参", "參", "叄", "叅"],
  "ài yǐ": ["叆"],
  "chā chà chǎ chá": ["叉"],
  shuāng: [
    "双",
    "孀",
    "孇",
    "欆",
    "礵",
    "艭",
    "雙",
    "霜",
    "騻",
    "驦",
    "骦",
    "鷞",
    "鸘",
    "鹴"
  ],
  shōu: ["収", "收"],
  guái: ["叏"],
  bá: [
    "叐",
    "妭",
    "抜",
    "拔",
    "炦",
    "癹",
    "胈",
    "茇",
    "菝",
    "詙",
    "跋",
    "軷",
    "魃",
    "鼥"
  ],
  "fā fà": ["发"],
  "zhuó yǐ lì jué": ["叕"],
  qǔ: ["取", "娶", "竬", "蝺", "詓", "齲", "龋"],
  "jiǎ xiá": ["叚", "徦"],
  "wèi yù": ["叞", "尉", "蔚"],
  dié: [
    "叠",
    "垤",
    "堞",
    "峌",
    "幉",
    "恎",
    "惵",
    "戜",
    "曡",
    "殜",
    "氎",
    "牃",
    "牒",
    "瓞",
    "畳",
    "疂",
    "疉",
    "疊",
    "碟",
    "絰",
    "绖",
    "耊",
    "耋",
    "胅",
    "艓",
    "苵",
    "蜨",
    "蝶",
    "褋",
    "詄",
    "諜",
    "谍",
    "跮",
    "蹀",
    "迭",
    "镻",
    "鰈",
    "鲽",
    "鴩",
    "𫶇"
  ],
  ruì: ["叡", "枘", "汭", "瑞", "睿", "芮", "蚋", "蜹", "銳", "鋭", "锐"],
  "jù gōu": ["句"],
  lìng: ["另", "呤", "炩", "蘦"],
  "dāo dáo tāo": ["叨"],
  "zhī zhǐ": ["只"],
  jiào: [
    "叫",
    "呌",
    "嘂",
    "嘦",
    "噍",
    "嬓",
    "斍",
    "斠",
    "滘",
    "漖",
    "獥",
    "珓",
    "皭",
    "窖",
    "藠",
    "訆",
    "譥",
    "趭",
    "較",
    "轎",
    "轿",
    "较",
    "酵",
    "醮",
    "釂"
  ],
  "zhào shào": ["召"],
  "kě kè": ["可"],
  "tái tāi": ["台", "苔"],
  pǒ: ["叵", "尀", "笸", "箥", "鉕", "钷", "駊"],
  "yè xié": ["叶"],
  "hào háo": ["号"],
  tàn: ["叹", "嘆", "探", "歎", "湠", "炭", "碳", "舕"],
  "hōng hóng": ["叿"],
  miē: ["吀", "咩", "哶", "孭"],
  "xū yū yù": ["吁"],
  chī: [
    "吃",
    "哧",
    "喫",
    "嗤",
    "噄",
    "妛",
    "媸",
    "彨",
    "彲",
    "摛",
    "攡",
    "殦",
    "瓻",
    "痴",
    "癡",
    "眵",
    "瞝",
    "笞",
    "粚",
    "胵",
    "蚩",
    "螭",
    "訵",
    "魑",
    "鴟",
    "鵄",
    "鸱",
    "黐",
    "齝",
    "𫄨"
  ],
  "xuān sòng": ["吅"],
  yāo: [
    "吆",
    "喓",
    "夭",
    "妖",
    "幺",
    "楆",
    "殀",
    "祅",
    "腰",
    "葽",
    "訞",
    "邀",
    "鴁",
    "鴢",
    "㙘"
  ],
  zǐ: [
    "吇",
    "姉",
    "姊",
    "子",
    "杍",
    "梓",
    "榟",
    "橴",
    "滓",
    "矷",
    "秭",
    "笫",
    "籽",
    "紫",
    "耔",
    "虸",
    "訿",
    "釨"
  ],
  "hé gě": ["合", "鲄"],
  "cùn dòu": ["吋"],
  "tóng tòng": ["同"],
  "tǔ tù": ["吐", "唋"],
  "zhà zhā": ["吒", "奓"],
  "xià hè": ["吓"],
  "ā yā": ["吖"],
  "ma má mǎ": ["吗"],
  lìn: [
    "吝",
    "恡",
    "悋",
    "橉",
    "焛",
    "甐",
    "膦",
    "蔺",
    "藺",
    "賃",
    "赁",
    "蹸",
    "躏",
    "躙",
    "躪",
    "轥",
    "閵"
  ],
  tūn: ["吞", "暾", "朜", "焞"],
  "bǐ pǐ": ["吡"],
  qìn: ["吢", "吣", "唚", "抋", "揿", "搇", "撳", "沁", "瀙", "菣", "藽"],
  "jiè gè": ["吤"],
  "fǒu pǐ": ["否"],
  "ba bā": ["吧"],
  dūn: [
    "吨",
    "噸",
    "墩",
    "墪",
    "惇",
    "撉",
    "撴",
    "犜",
    "獤",
    "礅",
    "蜳",
    "蹾",
    "驐"
  ],
  fēn: [
    "吩",
    "帉",
    "昐",
    "朆",
    "梤",
    "棻",
    "氛",
    "竕",
    "紛",
    "纷",
    "翂",
    "芬",
    "衯",
    "訜",
    "躮",
    "酚",
    "鈖",
    "雰",
    "餴",
    "饙",
    "馚"
  ],
  "é huā": ["吪"],
  "kēng háng": ["吭", "妔"],
  shǔn: ["吮"],
  "zhī zī": ["吱"],
  "yǐn shěn": ["吲"],
  wú: [
    "吳",
    "吴",
    "呉",
    "墲",
    "峿",
    "梧",
    "橆",
    "毋",
    "洖",
    "浯",
    "無",
    "珸",
    "璑",
    "祦",
    "芜",
    "茣",
    "莁",
    "蕪",
    "蜈",
    "蟱",
    "譕",
    "郚",
    "鋙",
    "铻",
    "鯃",
    "鵐",
    "鷡",
    "鹀",
    "鼯"
  ],
  "chǎo chāo": ["吵"],
  "nà nè": ["吶"],
  "xuè chuò jué": ["吷"],
  chuī: ["吹", "炊", "龡"],
  "dōu rú": ["吺"],
  hǒu: ["吼", "犼"],
  "hōng hǒu ōu": ["吽"],
  "wú yù": ["吾"],
  "ya yā": ["呀"],
  "è e": ["呃"],
  dāi: ["呆", "懛", "獃"],
  "mèn qǐ": ["呇"],
  hōng: [
    "呍",
    "嚝",
    "揈",
    "灴",
    "烘",
    "焢",
    "硡",
    "薨",
    "訇",
    "谾",
    "軣",
    "輷",
    "轟",
    "轰",
    "鍧"
  ],
  nà: [
    "呐",
    "捺",
    "笝",
    "納",
    "纳",
    "肭",
    "蒳",
    "衲",
    "豽",
    "貀",
    "軜",
    "郍",
    "鈉",
    "钠",
    "靹",
    "魶"
  ],
  "tūn tiān": ["呑"],
  "fǔ ḿ": ["呒", "嘸"],
  "dāi tǎi": ["呔"],
  "ǒu ōu òu": ["呕"],
  "bài bei": ["呗"],
  "yuán yún yùn": ["员", "員"],
  guō: [
    "呙",
    "啯",
    "嘓",
    "埚",
    "堝",
    "墎",
    "崞",
    "彉",
    "彍",
    "懖",
    "猓",
    "瘑",
    "聒",
    "蝈",
    "蟈",
    "郭",
    "鈛",
    "鍋",
    "锅"
  ],
  "huá qì": ["呚"],
  "qiàng qiāng": ["呛", "跄"],
  shī: [
    "呞",
    "失",
    "尸",
    "屍",
    "师",
    "師",
    "施",
    "浉",
    "湤",
    "湿",
    "溮",
    "溼",
    "濕",
    "狮",
    "獅",
    "瑡",
    "絁",
    "葹",
    "蒒",
    "蓍",
    "虱",
    "蝨",
    "褷",
    "襹",
    "詩",
    "诗",
    "邿",
    "釃",
    "鉇",
    "鍦",
    "鯴",
    "鰤",
    "鲺",
    "鳲",
    "鳾",
    "鶳",
    "鸤",
    "䴓",
    "𫚕"
  ],
  juǎn: ["呟", "埍", "臇", "菤", "錈", "锩"],
  pěn: ["呠", "翸"],
  "wěn mǐn": ["呡"],
  "ne ní": ["呢"],
  "ḿ m̀ móu": ["呣"],
  rán: [
    "呥",
    "嘫",
    "然",
    "燃",
    "繎",
    "肰",
    "蚦",
    "蚺",
    "衻",
    "袇",
    "袡",
    "髥",
    "髯"
  ],
  "tiè chè": ["呫"],
  "qì zhī": ["呮"],
  "zǐ cī": ["呰"],
  "guā gū guǎ": ["呱"],
  "cī zī": ["呲"],
  "hǒu xǔ gòu": ["呴"],
  "hē ā á ǎ à a": ["呵"],
  náo: [
    "呶",
    "夒",
    "峱",
    "嶩",
    "巎",
    "挠",
    "撓",
    "猱",
    "硇",
    "蛲",
    "蟯",
    "詉",
    "譊",
    "鐃",
    "铙"
  ],
  "xiā gā": ["呷"],
  pēi: ["呸", "怌", "肧", "胚", "衃", "醅"],
  "háo xiāo": ["呺"],
  mìng: ["命", "掵"],
  "dá dàn": ["呾"],
  "zuǐ jǔ": ["咀"],
  "xián gān": ["咁"],
  pǒu: ["咅", "哣", "犃"],
  "yǎng yāng": ["咉"],
  "zǎ zé zhā": ["咋"],
  "hé hè huó huò hú": ["和"],
  hāi: ["咍"],
  dā: ["咑", "哒", "噠", "墶", "搭", "撘", "耷", "褡", "鎝", "𨱏"],
  "kǎ kā": ["咔"],
  gū: [
    "咕",
    "唂",
    "唃",
    "姑",
    "嫴",
    "孤",
    "巬",
    "巭",
    "柧",
    "橭",
    "沽",
    "泒",
    "稒",
    "笟",
    "箍",
    "箛",
    "篐",
    "罛",
    "苽",
    "菇",
    "菰",
    "蓇",
    "觚",
    "軱",
    "軲",
    "轱",
    "辜",
    "酤",
    "鈲",
    "鮕",
    "鴣",
    "鸪"
  ],
  "kā gā": ["咖"],
  zuo: ["咗"],
  lóng: [
    "咙",
    "嚨",
    "嶐",
    "巃",
    "巄",
    "昽",
    "曨",
    "朧",
    "栊",
    "槞",
    "櫳",
    "湰",
    "滝",
    "漋",
    "爖",
    "珑",
    "瓏",
    "癃",
    "眬",
    "矓",
    "砻",
    "礱",
    "礲",
    "窿",
    "竜",
    "聋",
    "聾",
    "胧",
    "茏",
    "蘢",
    "蠪",
    "蠬",
    "襱",
    "豅",
    "鏧",
    "鑨",
    "霳",
    "靇",
    "驡",
    "鸗",
    "龍",
    "龒",
    "龙"
  ],
  "xiàn xián": ["咞"],
  qì: [
    "咠",
    "唭",
    "噐",
    "器",
    "夡",
    "弃",
    "憇",
    "憩",
    "暣",
    "棄",
    "欫",
    "气",
    "気",
    "氣",
    "汔",
    "汽",
    "泣",
    "湆",
    "湇",
    "炁",
    "甈",
    "盵",
    "矵",
    "碛",
    "碶",
    "磜",
    "磧",
    "罊",
    "芞",
    "葺",
    "藒",
    "蟿",
    "訖",
    "讫",
    "迄",
    "鐑"
  ],
  "xì dié": ["咥"],
  "liē liě lié lie": ["咧"],
  zī: [
    "咨",
    "嗞",
    "姕",
    "姿",
    "孜",
    "孳",
    "孶",
    "崰",
    "嵫",
    "栥",
    "椔",
    "淄",
    "湽",
    "滋",
    "澬",
    "玆",
    "禌",
    "秶",
    "粢",
    "紎",
    "緇",
    "緕",
    "纃",
    "缁",
    "茊",
    "茲",
    "葘",
    "諮",
    "谘",
    "貲",
    "資",
    "赀",
    "资",
    "赼",
    "趑",
    "趦",
    "輜",
    "輺",
    "辎",
    "鄑",
    "鈭",
    "錙",
    "鍿",
    "鎡",
    "锱",
    "镃",
    "頾",
    "頿",
    "髭",
    "鯔",
    "鰦",
    "鲻",
    "鶅",
    "鼒",
    "齍",
    "齜",
    "龇"
  ],
  mī: ["咪"],
  "jī xī qià": ["咭"],
  "gē luò kǎ lo": ["咯"],
  "shù xún": ["咰"],
  "zán zá zǎ zan": ["咱"],
  "hāi ké": ["咳"],
  huī: [
    "咴",
    "噅",
    "噕",
    "婎",
    "媈",
    "幑",
    "徽",
    "恢",
    "拻",
    "挥",
    "揮",
    "晖",
    "暉",
    "楎",
    "洃",
    "瀈",
    "灰",
    "灳",
    "烣",
    "睳",
    "禈",
    "翚",
    "翬",
    "蘳",
    "袆",
    "褘",
    "詼",
    "诙",
    "豗",
    "輝",
    "辉",
    "鰴",
    "麾",
    "㧑"
  ],
  "huài shì": ["咶"],
  táo: [
    "咷",
    "啕",
    "桃",
    "檮",
    "洮",
    "淘",
    "祹",
    "綯",
    "绹",
    "萄",
    "蜪",
    "裪",
    "迯",
    "逃",
    "醄",
    "鋾",
    "鞀",
    "鞉",
    "饀",
    "駣",
    "騊",
    "鼗",
    "𫘦"
  ],
  xián: [
    "咸",
    "啣",
    "娴",
    "娹",
    "婱",
    "嫌",
    "嫺",
    "嫻",
    "弦",
    "挦",
    "撏",
    "涎",
    "湺",
    "澖",
    "甉",
    "痫",
    "癇",
    "癎",
    "絃",
    "胘",
    "舷",
    "藖",
    "蚿",
    "蛝",
    "衔",
    "衘",
    "誸",
    "諴",
    "賢",
    "贒",
    "贤",
    "輱",
    "醎",
    "銜",
    "鑦",
    "閑",
    "闲",
    "鷳",
    "鷴",
    "鷼",
    "鹇",
    "鹹",
    "麙",
    "𫍯"
  ],
  "è àn": ["咹"],
  "xuān xuǎn": ["咺", "烜"],
  "wāi hé wǒ guǎ guō": ["咼"],
  "yàn yè yān": ["咽"],
  āi: ["哀", "哎", "埃", "溾", "銰", "鎄", "锿"],
  pǐn: ["品", "榀"],
  shěn: [
    "哂",
    "婶",
    "嬸",
    "审",
    "宷",
    "審",
    "弞",
    "曋",
    "渖",
    "瀋",
    "瞫",
    "矤",
    "矧",
    "覾",
    "訠",
    "諗",
    "讅",
    "谂",
    "谉",
    "邥",
    "頣",
    "魫"
  ],
  "hǒng hōng hòng": ["哄"],
  "wā wa": ["哇"],
  "hā hǎ hà": ["哈"],
  zāi: ["哉", "栽", "渽", "溨", "災", "灾", "烖", "睵", "賳"],
  "dì diè": ["哋"],
  pài: ["哌", "沠", "派", "渒", "湃", "蒎", "鎃"],
  "gén hěn": ["哏"],
  "yǎ yā": ["哑", "雅"],
  "yuě huì": ["哕", "噦"],
  nián: ["哖", "年", "秊", "秥", "鮎", "鯰", "鲇", "鲶", "鵇", "黏"],
  "huá huā": ["哗", "嘩"],
  "jì jiē zhāi": ["哜", "嚌"],
  mōu: ["哞"],
  "yō yo": ["哟", "喲"],
  lòng: ["哢", "梇", "贚"],
  "ò ó é": ["哦"],
  "lī lǐ li": ["哩"],
  "nǎ na nǎi né něi": ["哪"],
  hè: [
    "哬",
    "垎",
    "壑",
    "寉",
    "惒",
    "焃",
    "煂",
    "燺",
    "爀",
    "癋",
    "碋",
    "翯",
    "褐",
    "謞",
    "賀",
    "贺",
    "赫",
    "靍",
    "靎",
    "靏",
    "鶴",
    "鸖",
    "鹤"
  ],
  "bō pò bā": ["哱"],
  zhé: [
    "哲",
    "啠",
    "喆",
    "嚞",
    "埑",
    "悊",
    "摺",
    "晢",
    "晣",
    "歽",
    "矺",
    "砓",
    "磔",
    "籷",
    "粍",
    "虴",
    "蛰",
    "蟄",
    "袩",
    "詟",
    "謫",
    "謺",
    "讁",
    "讋",
    "谪",
    "輒",
    "輙",
    "轍",
    "辄",
    "辙",
    "鮿"
  ],
  "liàng láng": ["哴"],
  "liè lǜ": ["哷"],
  hān: ["哻", "憨", "蚶", "谽", "酣", "頇", "顸", "馠", "魽", "鼾"],
  "hēng hng": ["哼"],
  gěng: [
    "哽",
    "埂",
    "峺",
    "挭",
    "梗",
    "綆",
    "绠",
    "耿",
    "莄",
    "郠",
    "骾",
    "鯁",
    "鲠",
    "𬒔"
  ],
  "chuò yuè": ["哾"],
  "gě jiā": ["哿"],
  "bei bài": ["唄"],
  "hán hàn": ["唅"],
  chún: [
    "唇",
    "浱",
    "湻",
    "滣",
    "漘",
    "犉",
    "純",
    "纯",
    "脣",
    "莼",
    "蒓",
    "蓴",
    "醇",
    "醕",
    "錞",
    "陙",
    "鯙",
    "鶉",
    "鹑",
    "𬭚"
  ],
  "ài āi": ["唉"],
  "jiá qiǎn": ["唊"],
  "yán dàn xián": ["唌"],
  chē: ["唓", "砗", "硨", "莗", "蛼"],
  "wú ńg ń": ["唔"],
  zào: [
    "唕",
    "唣",
    "噪",
    "慥",
    "梍",
    "灶",
    "煰",
    "燥",
    "皁",
    "皂",
    "竃",
    "竈",
    "簉",
    "艁",
    "譟",
    "趮",
    "躁",
    "造",
    "𥖨"
  ],
  dí: [
    "唙",
    "啇",
    "嘀",
    "嚁",
    "嫡",
    "廸",
    "敌",
    "敵",
    "梑",
    "涤",
    "滌",
    "狄",
    "笛",
    "籴",
    "糴",
    "苖",
    "荻",
    "蔋",
    "蔐",
    "藡",
    "覿",
    "觌",
    "豴",
    "迪",
    "靮",
    "頔",
    "馰",
    "髢",
    "鸐",
    "𬱖"
  ],
  "gòng hǒng gǒng": ["唝", "嗊"],
  dóu: ["唞"],
  "lào láo": ["唠", "嘮", "憦"],
  huàn: [
    "唤",
    "喚",
    "奂",
    "奐",
    "宦",
    "嵈",
    "幻",
    "患",
    "愌",
    "换",
    "換",
    "擐",
    "攌",
    "梙",
    "槵",
    "浣",
    "涣",
    "渙",
    "漶",
    "澣",
    "烉",
    "焕",
    "煥",
    "瑍",
    "痪",
    "瘓",
    "睆",
    "肒",
    "藧",
    "豢",
    "轘",
    "逭",
    "鯇",
    "鯶",
    "鰀",
    "鲩"
  ],
  léng: ["唥", "塄", "楞", "碐", "薐"],
  "wō wěi": ["唩"],
  fěng: ["唪", "覂", "諷", "讽"],
  "yín jìn": ["唫"],
  "hǔ xià": ["唬"],
  wéi: [
    "唯",
    "围",
    "圍",
    "壝",
    "峗",
    "峞",
    "嵬",
    "帏",
    "帷",
    "幃",
    "惟",
    "桅",
    "沩",
    "洈",
    "涠",
    "湋",
    "溈",
    "潍",
    "潙",
    "潿",
    "濰",
    "犩",
    "矀",
    "維",
    "维",
    "蓶",
    "覹",
    "违",
    "違",
    "鄬",
    "醀",
    "鍏",
    "闈",
    "闱",
    "韋",
    "韦",
    "鮠",
    "𣲗",
    "𬶏"
  ],
  shuā: ["唰"],
  chàng: ["唱", "怅", "悵", "暢", "焻", "畅", "畼", "誯", "韔", "鬯"],
  "ér wā": ["唲"],
  qiàng: ["唴", "炝", "熗", "羻"],
  yō: ["唷"],
  yū: ["唹", "淤", "瘀", "盓", "箊", "紆", "纡", "込", "迂", "迃", "陓"],
  lài: [
    "唻",
    "濑",
    "瀨",
    "瀬",
    "癞",
    "癩",
    "睐",
    "睞",
    "籁",
    "籟",
    "藾",
    "賚",
    "賴",
    "赉",
    "赖",
    "頼",
    "顂",
    "鵣"
  ],
  tuò: ["唾", "嶞", "柝", "毤", "毻", "箨", "籜", "萚", "蘀", "跅"],
  "zhōu zhāo tiào": ["啁"],
  kěn: ["啃", "垦", "墾", "恳", "懇", "肎", "肯", "肻", "豤", "錹"],
  "zhuó zhào": ["啅", "濯"],
  "hēng hèng": ["啈", "悙"],
  "lín lán": ["啉"],
  "a ā á ǎ à": ["啊"],
  qiāng: [
    "啌",
    "嗴",
    "嶈",
    "戕",
    "摤",
    "斨",
    "枪",
    "槍",
    "溬",
    "牄",
    "猐",
    "獇",
    "羌",
    "羗",
    "腔",
    "蜣",
    "謒",
    "鏘",
    "锖",
    "锵"
  ],
  "tūn zhūn xiāng duǐ": ["啍"],
  wèn: ["問", "妏", "揾", "搵", "璺", "问", "顐"],
  "cuì qi": ["啐"],
  "dié shà jié tì": ["啑"],
  "yuē wā": ["啘"],
  "zǐ cǐ": ["啙"],
  "bǐ tú": ["啚"],
  "chuò chuài": ["啜"],
  "yǎ yā è": ["啞"],
  fēi: [
    "啡",
    "婓",
    "婔",
    "扉",
    "暃",
    "渄",
    "猆",
    "緋",
    "绯",
    "裶",
    "霏",
    "非",
    "靟",
    "飛",
    "飝",
    "飞",
    "餥",
    "馡",
    "騑",
    "騛",
    "鯡",
    "鲱",
    "𬴂"
  ],
  pí: [
    "啤",
    "壀",
    "枇",
    "毗",
    "毘",
    "焷",
    "琵",
    "疲",
    "皮",
    "篺",
    "罴",
    "羆",
    "脾",
    "腗",
    "膍",
    "蚍",
    "蚽",
    "蜱",
    "螷",
    "蠯",
    "豼",
    "貔",
    "郫",
    "鈹",
    "阰",
    "陴",
    "隦",
    "魮",
    "鮍",
    "鲏",
    "鵧",
    "鼙"
  ],
  shá: ["啥"],
  "lā la": ["啦"],
  "yīng qíng": ["啨"],
  pā: ["啪", "妑", "舥", "葩", "趴"],
  "zhě shì": ["啫"],
  sè: [
    "啬",
    "嗇",
    "懎",
    "擌",
    "栜",
    "歮",
    "涩",
    "渋",
    "澀",
    "澁",
    "濇",
    "濏",
    "瀒",
    "瑟",
    "璱",
    "瘷",
    "穑",
    "穡",
    "穯",
    "繬",
    "譅",
    "轖",
    "銫",
    "鏼",
    "铯",
    "飋"
  ],
  niè: [
    "啮",
    "嗫",
    "噛",
    "嚙",
    "囁",
    "囓",
    "圼",
    "孼",
    "孽",
    "嵲",
    "嶭",
    "巕",
    "帇",
    "敜",
    "枿",
    "槷",
    "櫱",
    "涅",
    "湼",
    "痆",
    "篞",
    "籋",
    "糱",
    "糵",
    "聂",
    "聶",
    "臬",
    "臲",
    "蘖",
    "蠥",
    "讘",
    "踂",
    "踗",
    "踙",
    "蹑",
    "躡",
    "錜",
    "鎳",
    "鑈",
    "鑷",
    "钀",
    "镊",
    "镍",
    "闑",
    "陧",
    "隉",
    "顳",
    "颞",
    "齧",
    "𫔶"
  ],
  "luō luó luo": ["啰", "囉"],
  "tān chǎn tuō": ["啴"],
  bo: ["啵", "蔔"],
  dìng: [
    "啶",
    "定",
    "椗",
    "矴",
    "碇",
    "碠",
    "磸",
    "聢",
    "腚",
    "萣",
    "蝊",
    "訂",
    "订",
    "錠",
    "锭",
    "顁",
    "飣",
    "饤"
  ],
  lāng: ["啷"],
  "án ān": ["啽"],
  kā: ["喀", "擖"],
  "yóng yú": ["喁"],
  "lā lá lǎ": ["喇"],
  jiē: [
    "喈",
    "喼",
    "嗟",
    "堦",
    "媘",
    "接",
    "掲",
    "擑",
    "湝",
    "煯",
    "疖",
    "痎",
    "癤",
    "皆",
    "秸",
    "稭",
    "脻",
    "蝔",
    "街",
    "謯",
    "阶",
    "階",
    "鞂",
    "鶛"
  ],
  hóu: [
    "喉",
    "帿",
    "猴",
    "瘊",
    "睺",
    "篌",
    "糇",
    "翭",
    "葔",
    "鄇",
    "鍭",
    "餱",
    "骺",
    "鯸",
    "𬭤"
  ],
  "dié zhá": ["喋"],
  wāi: ["喎", "歪", "竵"],
  "nuò rě": ["喏"],
  "xù huò guó": ["喐"],
  zán: ["喒"],
  "wō ō": ["喔"],
  hú: [
    "喖",
    "嘝",
    "囫",
    "壶",
    "壷",
    "壺",
    "媩",
    "弧",
    "搰",
    "斛",
    "楜",
    "槲",
    "湖",
    "瀫",
    "焀",
    "煳",
    "狐",
    "猢",
    "瑚",
    "瓳",
    "箶",
    "絗",
    "縠",
    "胡",
    "葫",
    "蔛",
    "蝴",
    "螜",
    "衚",
    "觳",
    "醐",
    "鍸",
    "頶",
    "餬",
    "鬍",
    "魱",
    "鰗",
    "鵠",
    "鶘",
    "鶦",
    "鹕"
  ],
  "huàn yuán xuǎn hé": ["喛"],
  xǐ: [
    "喜",
    "囍",
    "壐",
    "屣",
    "徙",
    "憙",
    "枲",
    "橲",
    "歖",
    "漇",
    "玺",
    "璽",
    "矖",
    "禧",
    "縰",
    "葈",
    "葸",
    "蓰",
    "蟢",
    "謑",
    "蹝",
    "躧",
    "鈢",
    "鉨",
    "鉩",
    "鱚",
    "𬭳",
    "𬶮"
  ],
  "hē hè yè": ["喝"],
  kuì: [
    "喟",
    "嘳",
    "媿",
    "嬇",
    "愦",
    "愧",
    "憒",
    "篑",
    "簣",
    "籄",
    "聩",
    "聭",
    "聵",
    "膭",
    "蕢",
    "謉",
    "餽",
    "饋",
    "馈"
  ],
  "zhǒng chuáng": ["喠"],
  "wéi wèi": ["喡", "為", "爲"],
  "duó zhà": ["喥"],
  "sāng sàng": ["喪"],
  "qiáo jiāo": ["喬"],
  "pèn bēn": ["喯"],
  "cān sūn qī": ["喰"],
  "zhā chā": ["喳"],
  miāo: ["喵"],
  "pēn pèn": ["喷"],
  kuí: [
    "喹",
    "夔",
    "奎",
    "巙",
    "戣",
    "揆",
    "晆",
    "暌",
    "楏",
    "楑",
    "櫆",
    "犪",
    "睽",
    "葵",
    "藈",
    "蘷",
    "虁",
    "蝰",
    "躨",
    "逵",
    "鄈",
    "鍨",
    "鍷",
    "頯",
    "馗",
    "騤",
    "骙",
    "魁"
  ],
  "lou lóu": ["喽"],
  "zào qiāo": ["喿"],
  "hè xiāo xiào hù": ["嗃"],
  "á shà": ["嗄"],
  xiù: [
    "嗅",
    "岫",
    "峀",
    "溴",
    "珛",
    "琇",
    "璓",
    "秀",
    "綉",
    "繍",
    "繡",
    "绣",
    "螑",
    "袖",
    "褎",
    "褏",
    "銹",
    "鏥",
    "鏽",
    "锈",
    "齅"
  ],
  "qiāng qiàng": ["嗆", "戗", "戧", "蹌", "蹡"],
  "ài yì": ["嗌", "艾"],
  "má mǎ ma": ["嗎"],
  "kè kē": ["嗑"],
  "dā tà": ["嗒", "鎉"],
  sǎng: ["嗓", "搡", "磉", "褬", "鎟", "顙", "颡"],
  chēn: ["嗔", "抻", "琛", "瞋", "諃", "謓", "賝", "郴", "𬘭"],
  "wā gǔ": ["嗗"],
  "pǎng bēng": ["嗙"],
  "xián qiǎn qiān": ["嗛"],
  lào: ["嗠", "嫪", "橯", "涝", "澇", "耢", "耮", "躼", "軂", "酪"],
  wēng: ["嗡", "翁", "聬", "螉", "鎓", "鶲", "鹟", "𬭩"],
  wà: ["嗢", "腽", "膃", "袜", "襪", "韤"],
  "hēi hāi": ["嗨"],
  hē: ["嗬", "欱", "蠚", "訶", "诃"],
  zi: ["嗭"],
  sǎi: ["嗮"],
  "ǹg ńg ňg": ["嗯"],
  gě: ["嗰", "舸"],
  ná: ["嗱", "拏", "拿", "鎿", "镎"],
  diǎ: ["嗲"],
  "ài ǎi āi": ["嗳"],
  tōng: ["嗵", "樋", "炵", "蓪"],
  "zuī suī": ["嗺"],
  "zhē zhè zhù zhe": ["嗻"],
  mò: [
    "嗼",
    "圽",
    "塻",
    "墨",
    "妺",
    "嫼",
    "寞",
    "帞",
    "昩",
    "末",
    "枺",
    "歿",
    "殁",
    "沫",
    "漠",
    "爅",
    "獏",
    "瘼",
    "皌",
    "眽",
    "眿",
    "瞐",
    "瞙",
    "砞",
    "礳",
    "秣",
    "絈",
    "纆",
    "耱",
    "茉",
    "莈",
    "蓦",
    "蛨",
    "蟔",
    "貃",
    "貊",
    "貘",
    "銆",
    "鏌",
    "镆",
    "陌",
    "靺",
    "驀",
    "魩",
    "默",
    "黙",
    "𬙊"
  ],
  sòu: ["嗽", "瘶"],
  tǎn: [
    "嗿",
    "坦",
    "忐",
    "憳",
    "憻",
    "暺",
    "毯",
    "璮",
    "菼",
    "袒",
    "襢",
    "醓",
    "鉭",
    "钽"
  ],
  "jiào dǎo": ["嘄"],
  "kǎi gě": ["嘅"],
  "shān càn": ["嘇"],
  cáo: ["嘈", "嶆", "曹", "曺", "槽", "漕", "艚", "蓸", "螬", "褿", "鏪", "𥕢"],
  piào: ["嘌", "徱", "蔈", "驃"],
  "lóu lou": ["嘍"],
  gǎ: ["尕", "玍"],
  "gǔ jiǎ": ["嘏"],
  "jiāo xiāo": ["嘐"],
  "xū shī": ["嘘", "噓"],
  pó: ["嘙", "嚩", "婆", "櫇", "皤", "鄱"],
  "dē dēi": ["嘚"],
  "ma má": ["嘛"],
  "lē lei": ["嘞"],
  "gā gá gǎ": ["嘠"],
  sāi: ["嘥", "噻", "毢", "腮", "顋", "鰓"],
  "zuō chuài": ["嘬"],
  "cháo zhāo": ["嘲", "朝", "鼂"],
  zuǐ: ["嘴", "噿", "嶊", "璻"],
  "qiáo qiào": ["嘺", "翹", "谯"],
  "chù xù shòu": ["嘼"],
  "tān chǎn": ["嘽"],
  "dàn tán": ["嘾", "弾", "彈", "惔", "澹"],
  "hēi mò": ["嘿"],
  ě: ["噁", "砨", "頋", "騀", "鵈"],
  "fān bo": ["噃"],
  chuáng: ["噇", "床", "牀"],
  "cù zā hé": ["噈"],
  "tūn kuò": ["噋"],
  "cēng chēng": ["噌"],
  dēng: ["噔", "嬁", "灯", "燈", "璒", "登", "竳", "簦", "艠", "豋"],
  pū: ["噗", "扑", "撲", "攴", "攵", "潽", "炇", "陠"],
  juē: ["噘", "屩", "屫", "撧"],
  lū: ["噜", "嚕", "撸", "擼", "謢"],
  zhān: [
    "噡",
    "岾",
    "惉",
    "旃",
    "旜",
    "枬",
    "栴",
    "毡",
    "氈",
    "氊",
    "沾",
    "瞻",
    "薝",
    "蛅",
    "詀",
    "詹",
    "譫",
    "谵",
    "趈",
    "邅",
    "閚",
    "霑",
    "飦",
    "饘",
    "驙",
    "魙",
    "鱣",
    "鸇",
    "鹯",
    "𫗴"
  ],
  ō: ["噢"],
  "zhòu zhuó": ["噣"],
  "jiào qiào chī": ["噭"],
  yuàn: [
    "噮",
    "妴",
    "怨",
    "愿",
    "掾",
    "瑗",
    "禐",
    "苑",
    "衏",
    "裫",
    "褑",
    "院",
    "願"
  ],
  "ǎi ài āi": ["噯"],
  "yōng yǒng": ["噰", "澭"],
  "jué xué": ["噱"],
  "pēn pèn fèn": ["噴"],
  gá: ["噶", "尜", "釓", "錷", "钆"],
  "xīn hěn hèn": ["噷"],
  dāng: ["噹", "澢", "珰", "璫", "筜", "簹", "艡", "蟷", "裆", "襠"],
  làn: ["嚂", "滥", "濫", "烂", "燗", "爁", "爛", "爤", "瓓", "糷", "钄"],
  tà: [
    "嚃",
    "嚺",
    "崉",
    "挞",
    "搨",
    "撻",
    "榻",
    "橽",
    "毾",
    "涾",
    "澾",
    "濌",
    "禢",
    "粏",
    "誻",
    "譶",
    "蹋",
    "蹹",
    "躂",
    "躢",
    "遝",
    "錔",
    "闒",
    "闥",
    "闼",
    "阘",
    "鞜",
    "鞳"
  ],
  "huō huò ǒ": ["嚄"],
  hāo: ["嚆", "茠", "蒿", "薅"],
  "hè xià": ["嚇"],
  "xiù pì": ["嚊"],
  "zhōu chóu": ["嚋", "盩", "诪"],
  mē: ["嚒"],
  "chā cā": ["嚓"],
  "bó pào bào": ["嚗"],
  "me mèi mò": ["嚜"],
  "xié hái": ["嚡"],
  "áo xiāo": ["嚣"],
  mō: ["嚤", "摸"],
  pín: [
    "嚬",
    "娦",
    "嫔",
    "嬪",
    "玭",
    "矉",
    "薲",
    "蠙",
    "貧",
    "贫",
    "顰",
    "颦",
    "𬞟"
  ],
  mè: ["嚰", "濹"],
  "rǎng rāng": ["嚷"],
  lá: ["嚹", "旯"],
  "jiáo jué jiào": ["嚼"],
  chuò: [
    "嚽",
    "娖",
    "擉",
    "歠",
    "涰",
    "磭",
    "踀",
    "輟",
    "辍",
    "辵",
    "辶",
    "酫",
    "鑡",
    "餟",
    "齪",
    "龊"
  ],
  "huān huàn": ["嚾"],
  "zá cà": ["囃"],
  chài: ["囆", "虿", "蠆", "袃", "訍"],
  "náng nāng": ["囊"],
  "zá zàn cān": ["囋"],
  sū: ["囌", "櫯", "甦", "稣", "穌", "窣", "蘇", "蘓", "酥", "鯂"],
  zèng: ["囎", "熷", "甑", "贈", "赠", "鋥", "锃"],
  "zá niè yàn": ["囐"],
  nāng: ["囔"],
  "luó luō luo": ["囖"],
  "wéi guó": ["囗"],
  huí: [
    "囘",
    "回",
    "囬",
    "廻",
    "廽",
    "恛",
    "洄",
    "痐",
    "茴",
    "蚘",
    "蛔",
    "蛕",
    "蜖",
    "迴",
    "逥",
    "鮰"
  ],
  nín: ["囜", "您", "脌"],
  "jiǎn nān": ["囝"],
  nān: ["囡"],
  tuán: ["团", "団", "團", "慱", "抟", "摶", "檲", "糰", "鏄", "鷒", "鷻"],
  "tún dùn": ["囤", "坉"],
  guó: [
    "囯",
    "囶",
    "囻",
    "国",
    "圀",
    "國",
    "帼",
    "幗",
    "慖",
    "摑",
    "漍",
    "聝",
    "腘",
    "膕",
    "蔮",
    "虢",
    "馘",
    "𬇹"
  ],
  kùn: ["困", "涃", "睏"],
  "wéi tōng": ["囲"],
  qūn: ["囷", "夋", "逡"],
  rì: ["囸", "日", "衵", "鈤", "馹", "驲"],
  tāi: ["囼", "孡", "胎"],
  pǔ: [
    "圃",
    "圑",
    "擈",
    "普",
    "暜",
    "樸",
    "檏",
    "氆",
    "浦",
    "溥",
    "烳",
    "諩",
    "譜",
    "谱",
    "蹼",
    "鐠",
    "镨"
  ],
  "quān juàn juān": ["圈", "圏"],
  "chuí chuán": ["圌"],
  tuǎn: ["圕", "畽", "疃"],
  lüè: ["圙", "掠", "略", "畧", "稤", "鋝", "鋢", "锊", "䂮"],
  "huán yuán": ["圜"],
  luán: [
    "圝",
    "圞",
    "奱",
    "娈",
    "孌",
    "孪",
    "孿",
    "峦",
    "巒",
    "挛",
    "攣",
    "曫",
    "栾",
    "欒",
    "滦",
    "灤",
    "癴",
    "癵",
    "羉",
    "脔",
    "臠",
    "虊",
    "銮",
    "鑾",
    "鵉",
    "鸞",
    "鸾"
  ],
  tǔ: ["土", "圡", "釷", "钍"],
  "xū wéi": ["圩"],
  "dì de": ["地", "嶳"],
  "qiān sú": ["圱"],
  zhèn: [
    "圳",
    "塦",
    "挋",
    "振",
    "朕",
    "栚",
    "甽",
    "眹",
    "紖",
    "絼",
    "纼",
    "誫",
    "賑",
    "赈",
    "鋴",
    "鎭",
    "鎮",
    "镇",
    "阵",
    "陣",
    "震",
    "鴆",
    "鸩"
  ],
  "chǎng cháng": ["场", "場", "塲"],
  "qí yín": ["圻"],
  jiá: [
    "圿",
    "忦",
    "恝",
    "戞",
    "扴",
    "脥",
    "荚",
    "莢",
    "蛱",
    "蛺",
    "裌",
    "跲",
    "郏",
    "郟",
    "鋏",
    "铗",
    "頬",
    "頰",
    "颊",
    "鴶",
    "鵊"
  ],
  "zhǐ zhì": ["坁"],
  bǎn: [
    "坂",
    "岅",
    "昄",
    "板",
    "版",
    "瓪",
    "粄",
    "舨",
    "蝂",
    "鈑",
    "钣",
    "阪",
    "魬"
  ],
  qǐn: ["坅", "寑", "寝", "寢", "昑", "梫", "笉", "螼", "赾", "鋟", "锓"],
  "méi fén": ["坆"],
  "rǒng kēng": ["坈"],
  "fāng fáng": ["坊"],
  "fèn bèn": ["坋"],
  tān: ["坍", "怹", "摊", "擹", "攤", "滩", "灘", "瘫", "癱", "舑", "貪", "贪"],
  "huài pēi pī péi": ["坏"],
  "dì làn": ["坔"],
  tán: [
    "坛",
    "墰",
    "墵",
    "壇",
    "壜",
    "婒",
    "憛",
    "昙",
    "曇",
    "榃",
    "檀",
    "潭",
    "燂",
    "痰",
    "磹",
    "罈",
    "罎",
    "藫",
    "談",
    "譚",
    "譠",
    "谈",
    "谭",
    "貚",
    "郯",
    "醰",
    "錟",
    "顃"
  ],
  bà: ["坝", "垻", "壩", "弝", "欛", "灞", "爸", "矲", "覇", "霸", "鮁", "鲅"],
  fén: [
    "坟",
    "墳",
    "妢",
    "岎",
    "幩",
    "枌",
    "棼",
    "汾",
    "焚",
    "燌",
    "燓",
    "羒",
    "羵",
    "蒶",
    "蕡",
    "蚠",
    "蚡",
    "豮",
    "豶",
    "轒",
    "鐼",
    "隫",
    "馩",
    "魵",
    "黂",
    "鼖",
    "鼢",
    "𣸣"
  ],
  zhuì: [
    "坠",
    "墜",
    "惴",
    "甀",
    "畷",
    "礈",
    "綴",
    "縋",
    "缀",
    "缒",
    "腏",
    "膇",
    "諈",
    "贅",
    "赘",
    "醊",
    "錣",
    "鑆"
  ],
  pō: ["坡", "岥", "泼", "溌", "潑", "釙", "鏺", "钋", "頗", "颇", "䥽"],
  "pǎn bàn": ["坢"],
  kūn: [
    "坤",
    "堃",
    "堒",
    "崐",
    "崑",
    "昆",
    "晜",
    "潉",
    "焜",
    "熴",
    "猑",
    "琨",
    "瑻",
    "菎",
    "蜫",
    "裈",
    "裩",
    "褌",
    "醌",
    "錕",
    "锟",
    "騉",
    "髠",
    "髡",
    "髨",
    "鯤",
    "鲲",
    "鵾",
    "鶤",
    "鹍"
  ],
  diàn: [
    "坫",
    "垫",
    "墊",
    "壂",
    "奠",
    "婝",
    "店",
    "惦",
    "扂",
    "橂",
    "殿",
    "淀",
    "澱",
    "玷",
    "琔",
    "电",
    "癜",
    "簟",
    "蜔",
    "鈿",
    "電",
    "靛",
    "驔"
  ],
  "mù mǔ": ["坶"],
  "kē kě": ["坷", "軻"],
  xuè: ["坹", "岤", "桖", "瀥", "狘", "瞲", "謔", "谑", "趐"],
  "dǐ chí": ["坻", "柢"],
  lā: ["垃", "柆", "菈", "邋"],
  lǒng: ["垄", "垅", "壟", "壠", "拢", "攏", "竉", "陇", "隴", "𬕂"],
  mín: [
    "垊",
    "姄",
    "岷",
    "崏",
    "捪",
    "旻",
    "旼",
    "民",
    "珉",
    "琘",
    "琝",
    "瑉",
    "痻",
    "盿",
    "砇",
    "緍",
    "緡",
    "缗",
    "罠",
    "苠",
    "鈱",
    "錉",
    "鍲",
    "鴖"
  ],
  "dòng tóng": ["垌", "峒", "洞"],
  cí: [
    "垐",
    "嬨",
    "慈",
    "柌",
    "濨",
    "珁",
    "瓷",
    "甆",
    "磁",
    "礠",
    "祠",
    "糍",
    "茨",
    "詞",
    "词",
    "辝",
    "辞",
    "辤",
    "辭",
    "雌",
    "飺",
    "餈",
    "鴜",
    "鶿",
    "鷀",
    "鹚"
  ],
  duī: ["垖", "堆", "塠", "痽", "磓", "鐓", "鐜", "鴭"],
  "duò duǒ": ["垛"],
  "duǒ duò": ["垜", "挆"],
  chá: ["垞", "察", "嵖", "搽", "槎", "檫", "猹", "茬", "茶", "詧", "靫", "𥻗"],
  shǎng: ["垧", "晌", "樉", "賞", "贘", "赏", "鋿", "鏛", "鑜"],
  shǒu: ["垨", "守", "手", "扌", "艏", "首"],
  da: ["垯", "繨", "跶"],
  háng: [
    "垳",
    "斻",
    "杭",
    "筕",
    "絎",
    "绗",
    "航",
    "苀",
    "蚢",
    "裄",
    "貥",
    "迒",
    "頏",
    "颃",
    "魧"
  ],
  "ān ǎn": ["垵"],
  xīng: [
    "垶",
    "惺",
    "星",
    "曐",
    "煋",
    "猩",
    "瑆",
    "皨",
    "篂",
    "腥",
    "興",
    "觪",
    "觲",
    "謃",
    "騂",
    "骍",
    "鮏",
    "鯹"
  ],
  "yuàn huán": ["垸"],
  bāng: [
    "垹",
    "帮",
    "幇",
    "幚",
    "幫",
    "捠",
    "梆",
    "浜",
    "邦",
    "邫",
    "鞤",
    "𠳐"
  ],
  "póu fú": ["垺"],
  cén: ["埁", "岑", "涔"],
  "běng fēng": ["埄"],
  "dì fáng": ["埅"],
  "xiá jiā": ["埉"],
  "mái mán": ["埋"],
  làng: ["埌", "崀", "浪", "蒗", "閬", "㫰"],
  "shān yán": ["埏"],
  "qín jīn": ["埐"],
  "pǔ bù": ["埔"],
  huā: ["埖", "婲", "椛", "硴", "糀", "花", "蒊", "蘤", "誮", "錵"],
  "suì sù": ["埣"],
  "pí pì": ["埤"],
  "qīng zhēng": ["埥", "鲭"],
  "wǎn wān": ["埦"],
  lǔn: ["埨", "稐", "𫭢"],
  "zhēng chéng": ["埩"],
  kōng: ["埪", "崆", "箜", "躻", "錓", "鵼"],
  "cǎi cài": ["埰", "寀", "采"],
  "chù tòu": ["埱"],
  běng: ["埲", "琫", "菶", "鞛"],
  "kǎn xiàn": ["埳"],
  "yì shì": ["埶", "醳"],
  péi: ["培", "毰", "裴", "裵", "賠", "赔", "錇", "锫", "阫", "陪"],
  "sào sǎo": ["埽"],
  "jǐn qīn jìn": ["堇"],
  "péng bèng": ["堋"],
  "qiàn zàn jiàn": ["堑"],
  àn: [
    "堓",
    "屵",
    "岸",
    "按",
    "暗",
    "案",
    "胺",
    "荌",
    "豻",
    "貋",
    "錌",
    "闇",
    "隌",
    "黯"
  ],
  "duò huī": ["堕", "墮"],
  huán: [
    "堚",
    "寏",
    "寰",
    "峘",
    "桓",
    "洹",
    "澴",
    "獂",
    "环",
    "環",
    "糫",
    "繯",
    "缳",
    "羦",
    "荁",
    "萈",
    "萑",
    "豲",
    "鍰",
    "鐶",
    "锾",
    "镮",
    "闤",
    "阛",
    "雈",
    "鬟",
    "鹮",
    "𬘫",
    "𤩽"
  ],
  "bǎo bǔ pù": ["堡"],
  "máo móu wǔ": ["堥"],
  ruán: ["堧", "壖", "撋"],
  "ài è yè": ["堨"],
  gèng: ["堩", "暅"],
  méi: [
    "堳",
    "塺",
    "媒",
    "嵋",
    "徾",
    "攗",
    "枚",
    "栂",
    "梅",
    "楣",
    "楳",
    "槑",
    "湄",
    "湈",
    "煤",
    "猸",
    "玫",
    "珻",
    "瑂",
    "眉",
    "睂",
    "禖",
    "脄",
    "脢",
    "腜",
    "苺",
    "莓",
    "葿",
    "郿",
    "酶",
    "鎇",
    "镅",
    "霉",
    "鶥",
    "鹛",
    "黴"
  ],
  dǔ: ["堵", "琽", "睹", "笃", "篤", "覩", "賭", "赌"],
  féng: ["堸", "綘", "艂", "逢"],
  hèng: ["堼"],
  chūn: [
    "堾",
    "媋",
    "旾",
    "春",
    "暙",
    "杶",
    "椿",
    "槆",
    "橁",
    "櫄",
    "瑃",
    "箺",
    "萅",
    "蝽",
    "輴",
    "鰆",
    "鶞",
    "䲠"
  ],
  jiǎng: [
    "塂",
    "奖",
    "奨",
    "奬",
    "桨",
    "槳",
    "獎",
    "耩",
    "膙",
    "蒋",
    "蔣",
    "講",
    "讲",
    "顜"
  ],
  huāng: ["塃", "巟", "慌", "肓", "荒", "衁"],
  duàn: [
    "塅",
    "断",
    "斷",
    "椴",
    "段",
    "毈",
    "煅",
    "瑖",
    "碫",
    "簖",
    "籪",
    "緞",
    "缎",
    "腶",
    "葮",
    "躖",
    "鍛",
    "锻"
  ],
  tǎ: ["塔", "墖", "獭", "獺", "鮙", "鰨", "鳎"],
  wěng: ["塕", "奣", "嵡", "攚", "暡", "瞈", "蓊"],
  "sāi sài sè": ["塞"],
  zàng: ["塟", "弉", "臓", "臟", "葬", "蔵", "銺"],
  tián: [
    "塡",
    "屇",
    "恬",
    "沺",
    "湉",
    "璳",
    "甛",
    "甜",
    "田",
    "畋",
    "畑",
    "碵",
    "磌",
    "胋",
    "闐",
    "阗",
    "鴫",
    "鷆",
    "鷏"
  ],
  zhèng: [
    "塣",
    "幁",
    "政",
    "証",
    "諍",
    "證",
    "证",
    "诤",
    "郑",
    "鄭",
    "靕",
    "鴊"
  ],
  "tián zhèn": ["填"],
  wēn: [
    "塭",
    "昷",
    "榲",
    "殟",
    "温",
    "溫",
    "瑥",
    "瘟",
    "蕰",
    "豱",
    "輼",
    "轀",
    "辒",
    "鎾",
    "饂",
    "鰛",
    "鰮",
    "鳁"
  ],
  liù: ["塯", "廇", "磟", "翏", "雡", "霤", "餾", "鬸", "鷚", "鹨"],
  hǎi: ["塰", "海", "烸", "酼", "醢"],
  lǎng: ["塱", "朖", "朗", "朤", "烺", "蓢", "㮾"],
  bèng: ["塴", "揼", "泵", "甏", "綳", "蹦", "迸", "逬", "鏰", "镚"],
  chén: [
    "塵",
    "宸",
    "尘",
    "忱",
    "敐",
    "敶",
    "晨",
    "曟",
    "栕",
    "樄",
    "沉",
    "煁",
    "瘎",
    "臣",
    "茞",
    "莀",
    "莐",
    "蔯",
    "薼",
    "螴",
    "訦",
    "諶",
    "軙",
    "辰",
    "迧",
    "鈂",
    "陈",
    "陳",
    "霃",
    "鷐",
    "麎"
  ],
  "ōu qiū": ["塸"],
  "qiàn jiàn": ["塹"],
  "zhuān tuán": ["塼"],
  shuǎng: ["塽", "慡", "漺", "爽", "縔", "鏯"],
  shú: ["塾", "婌", "孰", "璹", "秫", "贖", "赎"],
  lǒu: ["塿", "嵝", "嶁", "甊", "篓", "簍"],
  chí: [
    "墀",
    "弛",
    "持",
    "池",
    "漦",
    "竾",
    "筂",
    "箎",
    "篪",
    "茌",
    "荎",
    "蚳",
    "謘",
    "貾",
    "赿",
    "踟",
    "迟",
    "迡",
    "遅",
    "遟",
    "遲",
    "鍉",
    "馳",
    "驰"
  ],
  shù: [
    "墅",
    "庶",
    "庻",
    "怷",
    "恕",
    "戍",
    "束",
    "树",
    "樹",
    "沭",
    "漱",
    "潄",
    "濖",
    "竖",
    "竪",
    "絉",
    "腧",
    "荗",
    "蒁",
    "虪",
    "術",
    "裋",
    "豎",
    "述",
    "鉥",
    "錰",
    "鏣",
    "霔",
    "鶐",
    "𬬸"
  ],
  "dì zhì": ["墆", "疐"],
  kàn: ["墈", "崁", "瞰", "矙", "磡", "衎", "鬫"],
  chěn: ["墋", "夦", "硶", "碜", "磣", "贂", "趻", "踸", "鍖"],
  "zhǐ zhuó": ["墌"],
  qiǎng: ["墏", "繈", "繦", "羥", "襁"],
  zēng: ["増", "增", "憎", "璔", "矰", "磳", "罾", "譄", "鄫", "鱛", "䎖"],
  qiáng: [
    "墙",
    "墻",
    "嫱",
    "嬙",
    "樯",
    "檣",
    "漒",
    "牆",
    "艢",
    "蔃",
    "蔷",
    "蘠"
  ],
  "kuài tuí": ["墤"],
  "tuǎn dǒng": ["墥"],
  "qiáo què": ["墧"],
  "zūn dūn": ["墫"],
  "qiāo áo": ["墽"],
  "yì tú": ["墿"],
  "xué bó jué": ["壆"],
  lǎn: [
    "壈",
    "嬾",
    "孄",
    "孏",
    "懒",
    "懶",
    "揽",
    "擥",
    "攬",
    "榄",
    "欖",
    "浨",
    "漤",
    "灠",
    "纜",
    "缆",
    "罱",
    "覧",
    "覽",
    "览",
    "醂",
    "顲"
  ],
  huài: ["壊", "壞", "蘾"],
  rǎng: ["壌", "壤", "攘", "爙"],
  "làn xiàn": ["壏"],
  dǎo: [
    "壔",
    "导",
    "導",
    "岛",
    "島",
    "嶋",
    "嶌",
    "嶹",
    "捣",
    "搗",
    "擣",
    "槝",
    "祷",
    "禂",
    "禱",
    "蹈",
    "陦",
    "隝",
    "隯"
  ],
  ruǐ: ["壡", "桵", "橤", "繠", "蕊", "蕋", "蘂", "蘃"],
  san: ["壭"],
  zhuàng: ["壮", "壯", "壵", "撞", "焋", "状", "狀"],
  "ké qiào": ["壳", "殼"],
  kǔn: [
    "壸",
    "壼",
    "悃",
    "捆",
    "梱",
    "硱",
    "祵",
    "稇",
    "稛",
    "綑",
    "裍",
    "閫",
    "閸",
    "阃"
  ],
  mǎng: ["壾", "漭", "茻", "莽", "莾", "蠎"],
  cún: ["壿", "存"],
  "zhǐ zhōng": ["夂"],
  "gǔ yíng": ["夃"],
  "jiàng xiáng": ["夅", "降"],
  "páng féng fēng": ["夆"],
  zhāi: ["夈", "捚", "摘", "斋", "斎", "榸", "粂", "齋"],
  "xuàn xiòng": ["夐"],
  wài: ["外", "顡"],
  "wǎn yuàn wān yuān": ["夗"],
  "mǎo wǎn": ["夘"],
  mèng: ["夢", "夣", "孟", "梦", "癦", "霥"],
  "dà dài": ["大"],
  "fū fú": ["夫", "姇", "枎", "粰"],
  guài: ["夬", "怪", "恠"],
  yāng: [
    "央",
    "姎",
    "抰",
    "殃",
    "泱",
    "秧",
    "胦",
    "鉠",
    "鍈",
    "雵",
    "鴦",
    "鸯"
  ],
  "hāng bèn": ["夯"],
  gǎo: [
    "夰",
    "搞",
    "杲",
    "槀",
    "槁",
    "檺",
    "稁",
    "稾",
    "稿",
    "縞",
    "缟",
    "菒",
    "藁",
    "藳"
  ],
  "tāo běn": ["夲"],
  "tóu tou": ["头"],
  "yǎn tāo": ["夵"],
  "kuā kuà": ["夸", "誇"],
  "jiá jiā gā xiá": ["夹"],
  huà: [
    "夻",
    "婳",
    "嫿",
    "嬅",
    "崋",
    "摦",
    "杹",
    "枠",
    "桦",
    "槬",
    "樺",
    "澅",
    "画",
    "畫",
    "畵",
    "繣",
    "舙",
    "話",
    "諙",
    "譮",
    "话",
    "黊"
  ],
  "jiā jiá gā xiá": ["夾"],
  ēn: ["奀", "恩", "蒽"],
  "dī tì": ["奃"],
  "yǎn yān": ["奄", "渰"],
  pào: ["奅", "疱", "皰", "砲", "礟", "礮", "靤", "麭"],
  nài: ["奈", "柰", "渿", "耐", "萘", "褦", "錼", "鼐"],
  "quān juàn": ["奍", "弮", "棬"],
  zòu: ["奏", "揍"],
  "qì qiè xiè": ["契"],
  kāi: ["奒", "开", "揩", "鐦", "锎", "開"],
  "bēn bèn": ["奔", "泍"],
  tào: ["套"],
  "zàng zhuǎng": ["奘"],
  běn: ["奙", "本", "楍", "畚", "翉", "苯"],
  "xùn zhuì": ["奞"],
  shē: ["奢", "檨", "猞", "畭", "畲", "賒", "賖", "赊", "輋", "𪨶"],
  "hǎ pò tǎi": ["奤"],
  "ào yù": ["奥", "奧", "澚"],
  yūn: ["奫", "氲", "氳", "蒀", "蒕", "蝹", "贇", "赟", "𫖳"],
  "duǒ chě": ["奲"],
  "nǚ rǔ": ["女"],
  nú: ["奴", "孥", "笯", "駑", "驽"],
  "dīng dǐng tiǎn": ["奵"],
  "tā jiě": ["她"],
  nuán: ["奻"],
  "hǎo hào": ["好"],
  fàn: [
    "奿",
    "嬎",
    "梵",
    "汎",
    "泛",
    "滼",
    "瀪",
    "犯",
    "畈",
    "盕",
    "笵",
    "範",
    "范",
    "訉",
    "販",
    "贩",
    "軬",
    "輽",
    "飯",
    "飰",
    "饭"
  ],
  shuò: ["妁", "搠", "朔", "槊", "烁", "爍", "矟", "蒴", "鎙", "鑠", "铄"],
  "fēi pèi": ["妃"],
  wàng: ["妄", "忘", "旺", "望", "朢"],
  zhuāng: [
    "妆",
    "妝",
    "娤",
    "庄",
    "庒",
    "桩",
    "梉",
    "樁",
    "粧",
    "糚",
    "荘",
    "莊",
    "装",
    "裝"
  ],
  mā: ["妈", "媽"],
  "fū yōu": ["妋"],
  "hài jiè": ["妎"],
  dù: [
    "妒",
    "妬",
    "杜",
    "殬",
    "渡",
    "秺",
    "芏",
    "荰",
    "螙",
    "蠧",
    "蠹",
    "鍍",
    "镀",
    "靯",
    "𬭊"
  ],
  miào: ["妙", "庙", "庿", "廟", "玅", "竗"],
  "fǒu pēi pī": ["妚"],
  "yuè jué": ["妜"],
  niū: ["妞"],
  "nà nàn": ["妠"],
  tuǒ: ["妥", "嫷", "庹", "椭", "楕", "橢", "鬌", "鰖", "鵎"],
  "wàn yuán": ["妧"],
  fáng: ["妨", "房", "肪", "防", "魴", "鲂"],
  nī: ["妮"],
  zhóu: ["妯", "碡"],
  zhāo: ["妱", "巶", "招", "昭", "釗", "鉊", "鍣", "钊", "駋", "𬬿"],
  "nǎi nǐ": ["妳"],
  tǒu: ["妵", "敨", "紏", "蘣", "黈"],
  "xián xuán xù": ["妶"],
  "zhí yì": ["妷", "秇"],
  ē: ["妸", "妿", "婀", "屙"],
  mèi: [
    "妹",
    "媚",
    "寐",
    "抺",
    "旀",
    "昧",
    "沬",
    "煝",
    "痗",
    "眛",
    "睸",
    "祙",
    "篃",
    "蝞",
    "袂",
    "跊",
    "鬽",
    "魅"
  ],
  "qī qì": ["妻"],
  "xū xǔ": ["姁", "稰"],
  "shān shàn": ["姍", "姗", "苫", "釤", "钐"],
  mán: ["姏", "慲", "樠", "蛮", "蠻", "謾", "饅", "馒", "鬗", "鬘", "鰻", "鳗"],
  jiě: ["姐", "媎", "檞", "毑", "飷"],
  "wěi wēi": ["委"],
  pīn: ["姘", "拼", "礗", "穦", "馪", "驞"],
  "huá huó": ["姡"],
  "jiāo xiáo": ["姣"],
  "gòu dù": ["姤"],
  "lǎo mǔ": ["姥"],
  "nián niàn": ["姩"],
  zhěn: [
    "姫",
    "屒",
    "弫",
    "抮",
    "昣",
    "枕",
    "畛",
    "疹",
    "眕",
    "稹",
    "縝",
    "縥",
    "缜",
    "聄",
    "萙",
    "袗",
    "裖",
    "覙",
    "診",
    "诊",
    "軫",
    "轸",
    "辴",
    "駗",
    "鬒"
  ],
  héng: [
    "姮",
    "恆",
    "恒",
    "烆",
    "珩",
    "胻",
    "蘅",
    "衡",
    "鑅",
    "鴴",
    "鵆",
    "鸻"
  ],
  "jūn xún": ["姰"],
  "kuā hù": ["姱"],
  "è yà": ["姶"],
  "xiān shēn": ["姺"],
  wá: ["娃"],
  "ráo rǎo": ["娆", "嬈"],
  "shào shāo": ["娋"],
  xiē: ["娎", "揳", "楔", "歇", "蝎", "蠍"],
  "wǔ méi mǔ": ["娒"],
  "chuò lài": ["娕"],
  niáng: ["娘", "嬢", "孃"],
  "nà nuó": ["娜", "𦰡"],
  "pōu bǐ": ["娝"],
  "něi suī": ["娞"],
  tuì: ["娧", "煺", "蛻", "蜕", "退", "駾"],
  mǎn: ["娨", "屘", "満", "满", "滿", "螨", "蟎", "襔", "鏋"],
  "wú wù yú": ["娪"],
  "xī āi": ["娭"],
  "zhuì shuì": ["娷"],
  "dōng dòng": ["娻"],
  "ǎi ái è": ["娾"],
  "ē ě": ["娿"],
  mián: [
    "婂",
    "嬵",
    "宀",
    "杣",
    "棉",
    "檰",
    "櫋",
    "眠",
    "矈",
    "矊",
    "矏",
    "綿",
    "緜",
    "绵",
    "芇",
    "蝒"
  ],
  "pǒu péi bù": ["婄"],
  biǎo: ["婊", "脿", "表", "裱", "褾", "諘", "錶"],
  "fù fàn": ["婏"],
  wǒ: ["婐", "婑", "我"],
  "ní nǐ": ["婗", "棿"],
  "quán juàn": ["婘", "惓"],
  hūn: [
    "婚",
    "昏",
    "昬",
    "棔",
    "涽",
    "睧",
    "睯",
    "碈",
    "荤",
    "葷",
    "蔒",
    "轋",
    "閽",
    "阍"
  ],
  "qiān jǐn": ["婜"],
  "wān wà": ["婠"],
  "lái lài": ["婡", "徕", "徠"],
  "zhōu chōu": ["婤"],
  "chuò nào": ["婥"],
  "nüè àn": ["婩"],
  "hùn kūn": ["婫"],
  "dàng yáng": ["婸"],
  nàn: ["婻"],
  "ruò chuò": ["婼"],
  jiǎ: ["婽", "岬", "斚", "斝", "榎", "槚", "檟", "玾", "甲", "胛", "鉀", "钾"],
  "tōu yú": ["婾", "媮"],
  "yù yú": ["媀"],
  "wéi wěi": ["媁"],
  "dì tí": ["媂", "珶", "苐"],
  róu: [
    "媃",
    "揉",
    "柔",
    "渘",
    "煣",
    "瑈",
    "瓇",
    "禸",
    "粈",
    "糅",
    "脜",
    "腬",
    "葇",
    "蝚",
    "蹂",
    "輮",
    "鍒",
    "鞣",
    "騥",
    "鰇",
    "鶔",
    "𫐓"
  ],
  "ruǎn nèn": ["媆"],
  miáo: ["媌", "嫹", "描", "瞄", "苗", "鶓", "鹋"],
  "yí pèi": ["媐"],
  "mián miǎn": ["媔"],
  "tí shì": ["媞", "惿"],
  "duò tuó": ["媠", "沲"],
  ǎo: ["媪", "媼", "艹", "芺", "袄", "襖", "镺"],
  "chú zòu": ["媰"],
  yìng: ["媵", "映", "暎", "硬", "膡", "鱦"],
  "qín shēn": ["嫀"],
  jià: ["嫁", "幏", "架", "榢", "稼", "駕", "驾"],
  sǎo: ["嫂"],
  "zhēn zhěn": ["嫃"],
  "jiē suǒ": ["嫅"],
  "míng mǐng": ["嫇"],
  niǎo: ["嫋", "嬝", "嬲", "茑", "蔦", "袅", "裊", "褭", "鸟"],
  tāo: [
    "嫍",
    "幍",
    "弢",
    "慆",
    "掏",
    "搯",
    "槄",
    "涛",
    "滔",
    "濤",
    "瑫",
    "絛",
    "縚",
    "縧",
    "绦",
    "詜",
    "謟",
    "轁",
    "鞱",
    "韜",
    "韬",
    "飸",
    "饕"
  ],
  biáo: ["嫑"],
  "piáo piāo": ["嫖", "薸"],
  xuán: [
    "嫙",
    "悬",
    "懸",
    "暶",
    "檈",
    "漩",
    "玄",
    "璇",
    "璿",
    "痃",
    "蜁",
    "𫠊"
  ],
  "màn mān": ["嫚"],
  kāng: [
    "嫝",
    "嵻",
    "康",
    "慷",
    "槺",
    "漮",
    "砊",
    "穅",
    "糠",
    "躿",
    "鏮",
    "鱇",
    "𡐓",
    "𩾌"
  ],
  "hān nǎn": ["嫨"],
  nèn: ["嫩", "嫰"],
  zhē: ["嫬", "遮"],
  "mā má": ["嫲"],
  piè: ["嫳"],
  zhǎn: [
    "嫸",
    "展",
    "搌",
    "斩",
    "斬",
    "琖",
    "盏",
    "盞",
    "輾",
    "醆",
    "颭",
    "飐"
  ],
  "xiān yǎn jìn": ["嬐"],
  liǎn: [
    "嬚",
    "敛",
    "斂",
    "琏",
    "璉",
    "羷",
    "脸",
    "臉",
    "蔹",
    "蘝",
    "蘞",
    "裣",
    "襝",
    "鄻"
  ],
  "qióng huán xuān": ["嬛"],
  dǒng: ["嬞", "懂", "箽", "董", "蕫", "諌"],
  cān: ["嬠", "湌", "爘", "飡", "餐", "驂", "骖"],
  tiǎo: ["嬥", "宨", "晀", "朓", "窱", "脁"],
  bí: ["嬶", "荸", "鼻"],
  liǔ: [
    "嬼",
    "柳",
    "栁",
    "桞",
    "桺",
    "橮",
    "熮",
    "珋",
    "綹",
    "绺",
    "罶",
    "羀",
    "鋶",
    "锍"
  ],
  "qiān xiān": ["孅", "欦"],
  "xié huī": ["孈"],
  "huān quán": ["孉"],
  "lí lì": ["孋", "麗"],
  "zhú chuò": ["孎"],
  kǒng: ["孔", "恐"],
  "mā zī": ["孖"],
  "sūn xùn": ["孙", "孫"],
  "bèi bó": ["孛", "誖"],
  "yòu niū": ["孧"],
  zhuǎn: ["孨", "竱", "轉"],
  hái: ["孩", "骸"],
  nāo: ["孬"],
  "chán càn": ["孱"],
  bò: ["孹", "檗", "蘗", "譒"],
  nái: ["孻", "腉"],
  "níng nìng": ["宁", "寍", "寗", "寜", "寧", "甯"],
  zhái: ["宅"],
  "tū jiā": ["宊"],
  sòng: ["宋", "訟", "誦", "讼", "诵", "送", "鎹", "頌", "颂", "餸"],
  ròu: ["宍", "肉", "譳"],
  zhūn: ["宒", "窀", "衠", "諄", "谆", "迍"],
  "mì fú": ["宓"],
  "dàng tàn": ["宕"],
  "wǎn yuān": ["宛"],
  chǒng: ["宠", "寵"],
  qún: ["宭", "峮", "帬", "羣", "群", "裙", "裠"],
  zǎi: ["宰", "崽"],
  "bǎo shí": ["宲"],
  "jiā jia jie": ["家"],
  "huāng huǎng": ["宺"],
  kuān: ["宽", "寛", "寬", "臗", "鑧", "髋", "髖"],
  "sù xiǔ xiù": ["宿"],
  "jié zǎn": ["寁"],
  "bìng bǐng": ["寎"],
  "jìn qǐn": ["寖"],
  "lóu jù": ["寠"],
  "xiě xiè": ["寫"],
  "qīn qìn": ["寴"],
  cùn: ["寸", "籿"],
  duì: [
    "对",
    "対",
    "對",
    "怼",
    "憝",
    "懟",
    "濧",
    "瀩",
    "碓",
    "祋",
    "綐",
    "薱",
    "譈",
    "譵",
    "轛",
    "队",
    "陮"
  ],
  "lüè luó": ["寽"],
  "shè yè yì": ["射"],
  "jiāng jiàng qiāng": ["将"],
  "jiāng jiàng": ["將", "浆", "漿", "畺"],
  zūn: ["尊", "嶟", "樽", "罇", "遵", "鐏", "鱒", "鳟", "鶎", "鷷", "𨱔"],
  "shù zhù": ["尌", "澍"],
  xiǎo: ["小", "晓", "暁", "曉", "皛", "皢", "筱", "筿", "篠", "謏", "𫍲"],
  "jié jí": ["尐", "诘", "鞊"],
  "shǎo shào": ["少"],
  ěr: [
    "尒",
    "尓",
    "尔",
    "栮",
    "毦",
    "洱",
    "爾",
    "珥",
    "耳",
    "薾",
    "衈",
    "趰",
    "迩",
    "邇",
    "鉺",
    "铒",
    "餌",
    "饵",
    "駬"
  ],
  "wāng yóu": ["尢"],
  wāng: ["尣", "尩", "尪", "尫", "汪"],
  liào: ["尥", "尦", "廖", "撂", "料", "炓", "窷", "鐐", "镣", "𪤗"],
  "méng máng lóng páng": ["尨"],
  gà: ["尬", "魀"],
  "kuì kuǐ": ["尯"],
  tuí: ["尵", "弚", "穨", "蘈", "蹪", "隤", "頹", "頺", "頽", "颓", "魋", "𬯎"],
  yǐn: [
    "尹",
    "嶾",
    "引",
    "朄",
    "檃",
    "檼",
    "櫽",
    "淾",
    "濥",
    "瘾",
    "癮",
    "粌",
    "蘟",
    "蚓",
    "螾",
    "讔",
    "赺",
    "趛",
    "輑",
    "鈏",
    "靷"
  ],
  "chǐ chě": ["尺"],
  kāo: ["尻", "髛"],
  "jìn jǐn": ["尽"],
  "wěi yǐ": ["尾"],
  "niào suī": ["尿"],
  céng: ["层", "層", "嶒", "驓"],
  diǎo: ["屌"],
  "píng bǐng bīng": ["屏"],
  lòu: ["屚", "漏", "瘘", "瘺", "瘻", "鏤", "镂", "陋"],
  "shǔ zhǔ": ["属", "屬"],
  "xiè tì": ["屟"],
  "chè cǎo": ["屮"],
  "tún zhūn": ["屯"],
  "nì jǐ": ["屰"],
  "hóng lóng": ["屸"],
  "qǐ kǎi": ["岂", "豈"],
  áng: ["岇", "昂", "昻"],
  "gǎng gāng": ["岗", "崗"],
  kě: ["岢", "敤", "渇", "渴", "炣"],
  gǒu: ["岣", "狗", "玽", "笱", "耇", "耈", "耉", "苟", "豿"],
  tiáo: [
    "岧",
    "岹",
    "樤",
    "祒",
    "笤",
    "芀",
    "萔",
    "蓚",
    "蓨",
    "蜩",
    "迢",
    "鋚",
    "鎥",
    "鞗",
    "髫",
    "鯈",
    "鰷",
    "鲦",
    "齠",
    "龆"
  ],
  "qū jū": ["岨"],
  lǐng: ["岭", "嶺", "領", "领"],
  pò: ["岶", "敀", "洦", "湐", "烞", "珀", "破", "砶", "粕", "蒪", "魄"],
  "bā kè": ["峇"],
  luò: [
    "峈",
    "摞",
    "洛",
    "洜",
    "犖",
    "珞",
    "笿",
    "纙",
    "荦",
    "詻",
    "雒",
    "駱",
    "骆",
    "鵅"
  ],
  "fù niè": ["峊"],
  ěn: ["峎"],
  "zhì shì": ["峙", "崻"],
  qiǎ: ["峠", "跒", "酠", "鞐"],
  "qiáo jiào": ["峤", "癄"],
  "xié yé": ["峫"],
  bū: ["峬", "庯", "晡", "誧", "逋", "鈽", "錻", "钸", "餔", "鵏"],
  chóng: ["崇", "崈", "爞", "虫", "蝩", "蟲", "褈", "隀"],
  "zú cuì": ["崒", "椊"],
  "líng léng": ["崚"],
  "dòng dōng": ["崠"],
  xiáo: ["崤", "洨", "淆", "訤", "誵"],
  "pí bǐ": ["崥", "芘"],
  "zhǎn chán": ["崭", "嶃", "嶄"],
  "wǎi wēi": ["崴"],
  "yáng dàng": ["崵"],
  "shì dié": ["崼"],
  yào: [
    "崾",
    "曜",
    "熎",
    "燿",
    "矅",
    "穾",
    "窔",
    "筄",
    "耀",
    "艞",
    "药",
    "葯",
    "薬",
    "藥",
    "袎",
    "覞",
    "詏",
    "讑",
    "靿",
    "鷂",
    "鹞",
    "鼼"
  ],
  "kān zhàn": ["嵁"],
  "hán dǎng": ["嵅"],
  "qiàn kàn": ["嵌"],
  "wù máo": ["嵍"],
  "kě jié": ["嵑", "嶱"],
  "wēi wěi": ["嵔"],
  kē: [
    "嵙",
    "柯",
    "棵",
    "榼",
    "樖",
    "牁",
    "牱",
    "犐",
    "珂",
    "疴",
    "瞌",
    "磕",
    "礚",
    "科",
    "稞",
    "窠",
    "萪",
    "薖",
    "蚵",
    "蝌",
    "趷",
    "轲",
    "醘",
    "鈳",
    "钶",
    "頦",
    "顆",
    "颗",
    "髁"
  ],
  "dàng táng": ["嵣"],
  "róng yíng": ["嵤", "爃"],
  "ái kǎi": ["嵦"],
  "kāo qiāo": ["嵪"],
  cuó: ["嵯", "嵳", "痤", "矬", "蒫", "蔖", "虘", "鹺", "鹾"],
  "qiǎn qīn": ["嵰"],
  "dì dié": ["嵽"],
  cēn: ["嵾"],
  dǐng: ["嵿", "艼", "薡", "鐤", "頂", "顶", "鼎", "鼑"],
  "áo ào": ["嶅"],
  "pǐ pèi": ["嶏"],
  "jiào qiáo": ["嶠", "潐"],
  "jué guì": ["嶡", "鳜"],
  "zhān shàn": ["嶦", "鳣"],
  "xiè jiè": ["嶰"],
  "guī xī juàn": ["嶲"],
  rū: ["嶿"],
  "lì liè": ["巁", "棙", "爄", "綟"],
  "xī guī juàn": ["巂"],
  "yíng hōng": ["巆"],
  yǐng: [
    "巊",
    "廮",
    "影",
    "摬",
    "梬",
    "潁",
    "瘿",
    "癭",
    "矨",
    "穎",
    "郢",
    "鐛",
    "頴",
    "颍",
    "颕",
    "颖"
  ],
  chǎo: ["巐", "炒", "煼", "眧", "麨"],
  cuán: ["巑", "櫕", "欑"],
  chuān: ["巛", "川", "氚", "瑏", "穿"],
  "jīng xíng": ["巠"],
  cháo: [
    "巢",
    "巣",
    "晁",
    "漅",
    "潮",
    "牊",
    "窲",
    "罺",
    "謿",
    "轈",
    "鄛",
    "鼌"
  ],
  qiǎo: ["巧", "愀", "髜"],
  gǒng: ["巩", "廾", "拱", "拲", "栱", "汞", "珙", "輁", "鞏"],
  "chà chā chāi cī": ["差"],
  "xiàng hàng": ["巷"],
  shuài: ["帅", "帥", "蟀"],
  pà: ["帊", "帕", "怕", "袙"],
  "tǎng nú": ["帑"],
  "mò wà": ["帓"],
  "tiē tiě tiè": ["帖"],
  zhǒu: ["帚", "晭", "疛", "睭", "箒", "肘", "菷", "鯞"],
  "juǎn juàn": ["帣"],
  shuì: ["帨", "涗", "涚", "睡", "稅", "税", "裞"],
  "chóu dào": ["帱", "幬"],
  "jiǎn jiān sàn": ["帴"],
  "shà qiè": ["帹"],
  "qí jì": ["帺", "荠"],
  "shān qiāo shēn": ["幓"],
  "zhuàng chuáng": ["幢"],
  "chān chàn": ["幨"],
  miè: [
    "幭",
    "懱",
    "搣",
    "滅",
    "灭",
    "烕",
    "礣",
    "篾",
    "蔑",
    "薎",
    "蠛",
    "衊",
    "鑖",
    "鱴",
    "鴓"
  ],
  "gān gàn": ["干"],
  "bìng bīng": ["并", "幷"],
  "jī jǐ": ["幾"],
  "guǎng ān": ["广"],
  guǎng: ["広", "廣", "犷", "獷"],
  me: ["庅"],
  "dùn tún": ["庉"],
  "bài tīng": ["庍"],
  "yìng yīng": ["应"],
  "dǐ de": ["底"],
  "dù duó": ["度"],
  "máng méng páng": ["庬"],
  "bìng píng": ["庰"],
  chěng: ["庱", "悜", "睈", "逞", "騁", "骋"],
  "jī cuò": ["庴"],
  qǐng: ["庼", "廎", "檾", "漀", "苘", "請", "謦", "请", "頃", "顷"],
  "guī wěi huì": ["廆"],
  "jǐn qín": ["廑"],
  kuò: [
    "廓",
    "扩",
    "拡",
    "擴",
    "濶",
    "筈",
    "萿",
    "葀",
    "蛞",
    "闊",
    "阔",
    "霩",
    "鞟",
    "鞹",
    "韕",
    "頢",
    "鬠"
  ],
  "qiáng sè": ["廧", "薔"],
  "yǐn yìn": ["廴", "隐", "隠", "隱", "飮", "飲", "饮"],
  "pò pǎi": ["廹", "迫"],
  "nòng lòng": ["弄"],
  "dì tì tuí": ["弟"],
  "jué zhāng": ["弡"],
  "mí mǐ": ["弥", "彌", "靡"],
  chāo: ["弨", "怊", "抄", "欩", "訬", "超", "鈔", "钞"],
  yi: ["弬"],
  shāo: [
    "弰",
    "旓",
    "烧",
    "焼",
    "燒",
    "筲",
    "艄",
    "萷",
    "蕱",
    "輎",
    "髾",
    "鮹"
  ],
  "xuān yuān": ["弲"],
  "qiáng qiǎng jiàng": ["強", "强"],
  "tán dàn": ["弹", "醈"],
  biè: ["彆"],
  "qiáng jiàng qiǎng": ["彊"],
  "jì xuě": ["彐"],
  tuàn: ["彖", "褖"],
  yuē: ["彟", "曰", "曱", "矱"],
  "shān xiǎn": ["彡"],
  wén: [
    "彣",
    "文",
    "炆",
    "珳",
    "瘒",
    "繧",
    "聞",
    "芠",
    "蚉",
    "蚊",
    "螡",
    "蟁",
    "閺",
    "閿",
    "闅",
    "闦",
    "闻",
    "阌",
    "雯",
    "馼",
    "駇",
    "魰",
    "鳼",
    "鴍",
    "鼤",
    "𫘜"
  ],
  "péng bāng": ["彭"],
  "piāo piào": ["彯"],
  "zhuó bó": ["彴"],
  "tuǒ yí": ["彵"],
  "páng fǎng": ["彷"],
  wǎng: [
    "彺",
    "往",
    "徃",
    "惘",
    "枉",
    "棢",
    "網",
    "网",
    "罒",
    "罓",
    "罔",
    "罖",
    "菵",
    "蛧",
    "蝄",
    "誷",
    "輞",
    "辋",
    "魍"
  ],
  cú: ["徂", "殂"],
  "dài dāi": ["待"],
  huái: ["徊", "怀", "懐", "懷", "槐", "淮", "耲", "蘹", "褢", "褱", "踝"],
  "wā wàng jiā": ["徍"],
  "chěng zhèng": ["徎"],
  "dé děi de": ["得"],
  "cóng zòng": ["從"],
  "shì tǐ": ["徥"],
  "tí chí": ["徲", "鶗", "鶙"],
  dé: ["徳", "德", "恴", "悳", "惪", "淂", "鍀", "锝"],
  "zhǐ zhēng": ["徴", "徵"],
  bié: ["徶", "癿", "莂", "蛂", "襒", "蹩"],
  "chōng zhǒng": ["徸"],
  "jiǎo jiào": ["徼", "笅", "筊"],
  "lòng lǒng": ["徿"],
  "qú jù": ["忂", "渠", "瞿", "螶"],
  "dìng tìng": ["忊"],
  gǎi: ["忋", "改"],
  rěn: ["忍", "栠", "栣", "秹", "稔", "綛", "荏", "荵", "躵"],
  chàn: ["忏", "懴", "懺", "硟", "羼", "韂", "顫"],
  tè: ["忑", "慝", "特", "蟘", "鋱", "铽"],
  "tè tēi tuī": ["忒"],
  "gān hàn": ["忓", "攼"],
  "yì qì": ["忔"],
  "tài shì": ["忕"],
  "xī liě": ["忚"],
  "yīng yìng": ["応", "應", "譍"],
  "mǐn wěn mín": ["忞", "忟"],
  "sōng zhōng": ["忪"],
  "yù shū": ["忬", "悆"],
  "qí shì": ["忯", "耆"],
  "tún zhūn dùn": ["忳"],
  "qián qín": ["忴", "扲"],
  hún: ["忶", "浑", "渾", "餛", "馄", "魂", "鼲"],
  niǔ: ["忸", "扭", "炄", "狃", "紐", "纽", "莥", "鈕", "钮", "靵"],
  "kuáng wǎng": ["忹"],
  "kāng hàng": ["忼"],
  "kài xì": ["忾", "愾"],
  òu: ["怄", "慪"],
  "bǎo bào": ["怉"],
  "mín mén": ["怋"],
  "zuò zhà": ["怍"],
  zěn: ["怎"],
  yàng: ["怏", "恙", "样", "様", "樣", "漾", "羕", "詇"],
  "kòu jù": ["怐"],
  "náo niú": ["怓"],
  "zhēng zhèng": ["怔", "掙", "钲", "铮"],
  "tiē zhān": ["怗"],
  "hù gù": ["怘"],
  "cū jù zū": ["怚"],
  "sī sāi": ["思"],
  "yóu chóu": ["怞"],
  "tū dié": ["怢"],
  "yōu yào": ["怮"],
  xuàn: [
    "怰",
    "昡",
    "楦",
    "泫",
    "渲",
    "炫",
    "琄",
    "眩",
    "碹",
    "絢",
    "縼",
    "繏",
    "绚",
    "蔙",
    "衒",
    "袨",
    "贙",
    "鉉",
    "鏇",
    "铉",
    "镟",
    "颴"
  ],
  "xù xuè": ["怴"],
  "bì pī": ["怶"],
  "xī shù": ["怸"],
  "nèn nín": ["恁"],
  "tiāo yáo": ["恌"],
  "xī qī xù": ["恓"],
  "xiào jiǎo": ["恔"],
  "hū kuā": ["恗"],
  nǜ: ["恧", "朒", "衂", "衄"],
  hèn: ["恨"],
  "dòng tōng": ["恫"],
  "quán zhuān": ["恮"],
  "è wù ě wū": ["恶", "惡"],
  tòng: ["恸", "慟", "憅", "痛", "衕"],
  "yuān juàn": ["悁"],
  "qiāo qiǎo": ["悄"],
  "jiè kè": ["悈"],
  "hào jiào": ["悎"],
  huǐ: ["悔", "檓", "毀", "毁", "毇", "燬", "譭"],
  "mán mèn": ["悗", "鞔"],
  "yī yì": ["悘", "衣"],
  quān: ["悛", "箞", "鐉", "𨟠"],
  "kuī lǐ": ["悝"],
  "yì niàn": ["悥"],
  "mèn mēn": ["悶"],
  guàn: [
    "悹",
    "悺",
    "惯",
    "慣",
    "掼",
    "摜",
    "樌",
    "欟",
    "泴",
    "涫",
    "潅",
    "灌",
    "爟",
    "瓘",
    "盥",
    "礶",
    "祼",
    "罆",
    "罐",
    "貫",
    "贯",
    "躀",
    "遦",
    "鏆",
    "鑵",
    "鱹",
    "鸛",
    "鹳"
  ],
  "kōng kǒng": ["悾"],
  "lǔn lùn": ["惀"],
  guǒ: [
    "惈",
    "果",
    "椁",
    "槨",
    "粿",
    "綶",
    "菓",
    "蜾",
    "裹",
    "褁",
    "輠",
    "餜",
    "馃"
  ],
  "yuān wǎn": ["惌", "箢"],
  "lán lín": ["惏"],
  "yù xù": ["惐", "淢"],
  "chuò chuì": ["惙"],
  "hūn mèn": ["惛"],
  "chǎng tǎng": ["惝"],
  "suǒ ruǐ": ["惢"],
  cǎn: ["惨", "慘", "憯", "黪", "黲", "䅟"],
  cán: ["惭", "慙", "慚", "残", "殘", "蚕", "蝅", "蠶", "蠺"],
  "dàn dá": ["惮", "憚"],
  rě: ["惹"],
  "yú tōu": ["愉"],
  "kài qì": ["愒"],
  "dàng táng shāng yáng": ["愓"],
  "chén xìn dān": ["愖"],
  "kè qià": ["愘"],
  nuò: [
    "愞",
    "懦",
    "懧",
    "掿",
    "搦",
    "榒",
    "稬",
    "穤",
    "糑",
    "糥",
    "糯",
    "諾",
    "诺",
    "蹃",
    "逽",
    "鍩",
    "锘"
  ],
  gǎn: [
    "感",
    "擀",
    "敢",
    "桿",
    "橄",
    "澉",
    "澸",
    "皯",
    "秆",
    "稈",
    "笴",
    "芉",
    "衦",
    "赶",
    "趕",
    "鱤",
    "鳡"
  ],
  "còng sōng": ["愡"],
  "sāi sī sǐ": ["愢"],
  "gōng gòng hǒng": ["愩", "慐"],
  "shuò sù": ["愬", "洬"],
  "yáo yào": ["愮"],
  huàng: ["愰", "曂", "榥", "滉", "皝", "皩", "鎤", "㿠"],
  zhěng: ["愸", "抍", "拯", "整", "晸"],
  cǎo: ["愺", "艸", "草", "騲"],
  "xì xié": ["慀"],
  "cǎo sāo": ["慅"],
  "xù chù": ["慉"],
  "qiè qiàn": ["慊"],
  "cáo cóng": ["慒"],
  "ào áo": ["慠"],
  "lián liǎn": ["慩", "梿", "槤", "櫣"],
  "jìn qín jǐn": ["慬"],
  "dì chì": ["慸"],
  "zhí zhé": ["慹"],
  "lóu lǚ": ["慺", "鷜"],
  còng: ["憁", "謥"],
  "zhī zhì": ["憄", "知", "織", "织"],
  chēng: [
    "憆",
    "摚",
    "撐",
    "撑",
    "晿",
    "柽",
    "棦",
    "橕",
    "檉",
    "泟",
    "浾",
    "琤",
    "瞠",
    "碀",
    "緽",
    "罉",
    "蛏",
    "蟶",
    "赪",
    "赬",
    "鏿",
    "鐣",
    "阷",
    "靗",
    "頳",
    "饓"
  ],
  biē: ["憋", "虌", "鱉", "鳖", "鼈", "龞"],
  "chéng dèng zhèng": ["憕"],
  "xǐ xī": ["憘"],
  "duì dùn tūn": ["憞"],
  "xiāo jiāo": ["憢"],
  "xián xiàn": ["憪"],
  "liáo liǎo": ["憭", "燎", "爎", "爒"],
  shéng: ["憴", "縄", "繉", "繩", "绳", "譝"],
  "náo nǎo náng": ["憹"],
  "jǐng jìng": ["憼"],
  "jǐ jiǎo": ["憿"],
  "xuān huān": ["懁"],
  "cǎo sāo sào": ["懆"],
  mèn: ["懑", "懣", "暪", "焖", "燜"],
  "mèng méng měng": ["懜"],
  "ài yì nǐ": ["懝"],
  "méng měng": ["懞", "瞢", "矒"],
  "qí jī jì": ["懠"],
  mǒ: ["懡"],
  "lán xiàn": ["懢"],
  "yōu yǒu": ["懮"],
  "liú liǔ": ["懰", "藰"],
  ràng: ["懹", "譲", "讓", "让"],
  huān: ["懽", "欢", "歓", "歡", "獾", "讙", "貛", "酄", "驩", "鴅", "鵍"],
  nǎn: ["戁", "揇", "湳", "煵", "腩", "蝻", "赧"],
  "mí mó": ["戂"],
  "gàng zhuàng": ["戅", "戆"],
  "zhuàng gàng": ["戇"],
  "xū qu": ["戌"],
  "xì hū": ["戏", "戯", "戲"],
  "jiá gā": ["戛"],
  zéi: ["戝", "蠈", "賊", "贼", "鰂", "鱡", "鲗"],
  děng: ["戥", "等"],
  "hū xì": ["戱"],
  chuō: ["戳", "踔", "逴"],
  "biǎn piān": ["扁"],
  "shǎng jiōng": ["扄"],
  "shàn shān": ["扇"],
  cái: ["才", "材", "纔", "裁", "財", "财"],
  "zhā zā zhá": ["扎"],
  "lè lì cái": ["扐"],
  "bā pá": ["扒"],
  "dǎ dá": ["打"],
  rēng: ["扔"],
  "fǎn fú": ["払"],
  "diǎo dí yuē lì": ["扚"],
  "káng gāng": ["扛"],
  "yū wū": ["扜"],
  "yū wū kū": ["扝"],
  "tuō chǐ yǐ": ["扡"],
  "gǔ jié xì gē": ["扢"],
  dèn: ["扥", "扽"],
  "sǎo sào": ["扫", "掃"],
  rǎo: ["扰", "擾", "隢"],
  "xī chā qì": ["扱"],
  "bān pān": ["扳"],
  "bā ào": ["扷"],
  "xī zhé": ["扸"],
  "zhì sǔn kǎn": ["扻"],
  zhǎo: ["找", "沼", "瑵"],
  "kuáng wǎng zài": ["抂"],
  "hú gǔ": ["抇", "鹄", "鹘"],
  "bǎ bà": ["把"],
  "dǎn shěn": ["抌"],
  "nè nì ruì nà": ["抐"],
  zhuā: ["抓", "檛", "簻", "膼", "髽"],
  póu: ["抔", "裒"],
  "zhé shé zhē": ["折"],
  "póu pōu fū": ["抙", "捊"],
  pāo: ["抛", "拋", "脬", "萢"],
  "ǎo ào niù": ["抝"],
  "lūn lún": ["抡", "掄"],
  "qiǎng qiāng chēng": ["抢"],
  "zhǐ zhǎi": ["抧"],
  "bù pū": ["抪", "柨"],
  "yǎo tāo": ["抭"],
  "hē hè qiā": ["抲"],
  "nǐ ní": ["抳"],
  "pī pēi": ["抷"],
  "mǒ mò mā": ["抹"],
  chōu: ["抽", "犨", "犫", "瘳", "篘"],
  "jiā yá": ["拁"],
  "fú bì": ["拂", "畐", "鶝"],
  zhǎ: ["拃", "眨", "砟", "鮺", "鲝"],
  "dān dàn dǎn": ["担"],
  "chāi cā": ["拆"],
  niān: ["拈", "蔫"],
  "lā lá lǎ là": ["拉"],
  "bàn pàn": ["拌"],
  pāi: ["拍"],
  līn: ["拎"],
  guǎi: ["拐", "枴", "柺"],
  "tuò tà zhí": ["拓"],
  "ào ǎo niù": ["拗"],
  "jū gōu": ["拘"],
  "pīn pàn fān": ["拚"],
  "bài bái": ["拜"],
  bài: ["拝", "敗", "稗", "粺", "薭", "贁", "败", "韛"],
  qiá: ["拤"],
  "nǐng níng nìng": ["拧"],
  "zé zhái": ["择", "擇"],
  hén: ["拫", "痕", "鞎"],
  "kuò guā": ["括"],
  "jié jiá": ["拮"],
  nǐn: ["拰"],
  shuān: ["拴", "栓", "閂", "闩"],
  "cún zùn": ["拵"],
  "zā zǎn": ["拶", "桚"],
  kǎo: ["拷", "攷", "栲", "烤", "考"],
  "yí chǐ hài": ["拸"],
  "cè sè chuò": ["拺"],
  "zhuài zhuāi yè": ["拽"],
  "shí shè": ["拾"],
  bāi: ["挀", "掰"],
  "kuò guāng": ["挄"],
  nòng: ["挊", "挵", "齈"],
  "jiào jiāo": ["挍", "敎", "教"],
  "kuà kū": ["挎"],
  "ná rú": ["挐"],
  "tiāo tiǎo": ["挑"],
  "dié shè": ["挕"],
  liě: ["挘", "毟"],
  "yà yǎ": ["挜", "掗"],
  "wō zhuā": ["挝"],
  "xié jiā": ["挟", "挾"],
  "dǎng dàng": ["挡", "擋"],
  "zhèng zhēng": ["挣", "正", "症"],
  "āi ái": ["挨"],
  "tuō shuì": ["挩", "捝"],
  "tǐ tì": ["挮"],
  "suō shā": ["挱"],
  "sā shā suō": ["挲"],
  "kēng qiān": ["挳", "摼"],
  "bàng péng": ["挷"],
  "ruó ruá": ["挼"],
  "jiǎo kù": ["捁"],
  "wǔ wú": ["捂"],
  tǒng: ["捅", "桶", "筒", "筩", "統", "綂", "统", "㛚"],
  "huò chì": ["捇"],
  "tú shū chá": ["捈"],
  "lǚ luō": ["捋"],
  "shāo shào": ["捎", "稍"],
  niē: ["捏", "揑"],
  "shù sǒng sōu": ["捒"],
  "yé yú": ["捓"],
  "jué zhuó": ["捔"],
  "bù pú zhì": ["捗"],
  zùn: ["捘", "銌"],
  lāo: ["捞", "撈", "粩"],
  sǔn: ["损", "損", "榫", "笋", "筍", "箰", "鎨", "隼"],
  "wàn wǎn wān yù": ["捥"],
  pěng: ["捧", "淎", "皏"],
  shě: ["捨"],
  "fǔ fù bǔ": ["捬"],
  dáo: ["捯"],
  "luò luǒ wǒ": ["捰"],
  "juǎn quán": ["捲"],
  "chēn tiǎn": ["捵"],
  "niǎn niē": ["捻"],
  "ruó wěi ré": ["捼"],
  zuó: ["捽", "昨", "秨", "稓", "筰", "莋", "鈼"],
  "wò xiá": ["捾"],
  "qìng qiàn": ["掅"],
  "póu pǒu": ["掊"],
  qiā: ["掐", "葜"],
  "pái pǎi": ["排"],
  "qiān wàn": ["掔"],
  "yè yē": ["掖"],
  "niè nǐ yì": ["掜"],
  "huò xù": ["掝"],
  "yàn shàn yǎn": ["掞"],
  "zhěng dìng": ["掟"],
  kòng: ["控", "鞚"],
  tuī: ["推", "蓷", "藬"],
  "zōu zhōu chōu": ["掫"],
  tiàn: ["掭", "舚"],
  kèn: ["掯", "裉", "褃"],
  pá: ["掱", "杷", "潖", "爬", "琶", "筢"],
  "guó guāi": ["掴"],
  "dǎn shàn": ["掸", "撣"],
  "chān xiān càn shǎn": ["掺"],
  sāo: ["掻", "搔", "溞", "繅", "缫", "螦", "騒", "騷", "鰠", "鱢", "鳋"],
  pèng: ["掽", "椪", "槰", "碰", "踫"],
  "zhēng kēng": ["揁"],
  "jiū yóu": ["揂"],
  "jiān jiǎn": ["揃", "籛"],
  "pì chè": ["揊"],
  "sāi zǒng cāi": ["揌"],
  "tí dī dǐ": ["提"],
  "zǒng sōng": ["揔"],
  "huáng yóng": ["揘"],
  "zǎn zuàn": ["揝"],
  "xū jū": ["揟"],
  "ké qiā": ["揢"],
  "chuāi chuǎi chuài tuán zhuī": ["揣"],
  "dì tì": ["揥"],
  "lá là": ["揦"],
  là: [
    "揧",
    "楋",
    "溂",
    "瓎",
    "瘌",
    "翋",
    "臘",
    "蝋",
    "蝲",
    "蠟",
    "辢",
    "辣",
    "鑞",
    "镴",
    "鬎",
    "鯻",
    "𬶟"
  ],
  "jiē qì": ["揭"],
  "chòng dǒng": ["揰"],
  "dié shé yè": ["揲"],
  "jiàn qián jiǎn": ["揵"],
  yé: ["揶", "爷", "爺", "瑘", "鋣", "鎁", "铘"],
  chān: ["搀", "摻", "攙", "裧", "襜", "覘", "觇", "辿", "鋓"],
  "gē gé": ["搁", "擱"],
  "lǒu lōu": ["搂", "摟"],
  "chōu zǒu": ["搊"],
  chuāi: ["搋"],
  sūn: ["搎", "槂", "狲", "猻", "荪", "蓀", "蕵", "薞", "飧", "飱"],
  "róng náng nǎng": ["搑"],
  "péng bàng": ["搒"],
  cuō: ["搓", "瑳", "磋", "蹉", "遳", "醝"],
  "kē è": ["搕"],
  "nù nuò nòu": ["搙"],
  "lā xié xiàn": ["搚"],
  qiǔ: ["搝", "糗"],
  "xiǎn xiān": ["搟"],
  "jié zhé": ["搩"],
  "pán bān pó": ["搫"],
  bān: [
    "搬",
    "攽",
    "斑",
    "斒",
    "班",
    "瘢",
    "癍",
    "肦",
    "螁",
    "螌",
    "褩",
    "辬",
    "頒",
    "颁",
    "𨭉"
  ],
  "zhì nái": ["搱"],
  "wā wǎ wà": ["搲"],
  huá: ["搳", "撶", "滑", "猾", "蕐", "螖", "譁", "鏵", "铧", "驊", "骅", "鷨"],
  "qiāng qiǎng chēng": ["搶"],
  "tián shēn": ["搷"],
  "ná nuò": ["搻"],
  èn: ["摁"],
  "shè niè": ["摄", "攝"],
  bìn: ["摈", "擯", "殡", "殯", "膑", "臏", "髌", "髕", "髩", "鬂", "鬓", "鬢"],
  "shā sà shǎi": ["摋"],
  "chǎn sùn": ["摌"],
  "jiū liú liáo jiǎo náo": ["摎"],
  "féng pěng": ["摓"],
  shuāi: ["摔"],
  "dì tú zhí": ["摕"],
  "qì jì chá": ["摖"],
  "sōu sǒng": ["摗"],
  "liǎn liàn": ["摙"],
  "gài xì": ["摡"],
  "hù chū": ["摢"],
  tàng: ["摥", "烫", "燙", "鐋"],
  "nái zhì": ["摨"],
  "mó mā": ["摩"],
  "jiāng qiàng": ["摪"],
  "áo qiáo": ["摮"],
  "niè chè": ["摰"],
  "mán màn": ["摱"],
  "chàn cán": ["摲"],
  "sè mí sù": ["摵"],
  "biāo biào": ["摽"],
  "juē jué": ["撅"],
  piē: ["撆", "暼", "氕", "瞥"],
  "piě piē": ["撇"],
  "zǎn zān zēn qián": ["撍"],
  "sā sǎ": ["撒"],
  hòng: ["撔", "訌", "讧", "闀", "鬨"],
  "héng guàng": ["撗"],
  niǎn: [
    "撚",
    "撵",
    "攆",
    "涊",
    "焾",
    "碾",
    "簐",
    "蹍",
    "蹨",
    "躎",
    "輦",
    "辇"
  ],
  "chéng zhěng": ["撜"],
  "huī wéi": ["撝"],
  cāo: ["撡", "操", "糙"],
  "xiāo sōu": ["撨"],
  "liáo liāo": ["撩"],
  "cuō zuǒ": ["撮"],
  "wěi tuǒ": ["撱"],
  cuān: ["撺", "攛", "汆", "蹿", "躥", "鑹", "镩"],
  "qiào yāo jī": ["撽"],
  "zhuā wō": ["撾"],
  "lèi léi": ["擂"],
  nǎng: ["擃", "攮", "曩", "灢"],
  "qíng jǐng": ["擏"],
  kuǎi: ["擓", "蒯", "㧟"],
  "pǐ bò": ["擗"],
  "bò bāi": ["擘"],
  "jù jǐ": ["據"],
  mēng: ["擝"],
  "sǒu sòu": ["擞"],
  xǐng: ["擤", "箵", "醒"],
  cā: ["擦"],
  "níng nǐng nìng": ["擰"],
  "zhì jié": ["擳"],
  "là liè": ["擸", "爉"],
  "sòu sǒu": ["擻"],
  "lì luò yuè": ["擽"],
  "tī zhāi zhì": ["擿"],
  pān: ["攀", "潘", "眅", "萠"],
  lèi: [
    "攂",
    "泪",
    "涙",
    "淚",
    "禷",
    "类",
    "纇",
    "蘱",
    "酹",
    "銇",
    "錑",
    "頛",
    "頪",
    "類",
    "颣"
  ],
  "cā sǎ": ["攃"],
  "jùn pèi": ["攈"],
  "lì luò": ["攊", "躒"],
  "là lài": ["攋", "櫴"],
  "lú luó": ["攎"],
  "zǎn cuán": ["攒"],
  "xiān jiān": ["攕"],
  "mí mǐ mó": ["攠"],
  "zǎn cuán zàn zuān": ["攢"],
  zuàn: ["攥"],
  "lì shài": ["攦"],
  "lì luǒ": ["攭"],
  "guǐ guì": ["攱"],
  "jī qī yǐ": ["攲"],
  fàng: ["放"],
  "wù móu": ["敄"],
  "chù shōu": ["敊"],
  "gé guó è": ["敋"],
  "duó duì": ["敓", "敚"],
  "duō què": ["敠", "敪"],
  "sàn sǎn": ["散"],
  "dūn duì": ["敦", "镦"],
  "qī yǐ jī": ["敧"],
  "xiào xué": ["敩"],
  "shù shǔ shuò": ["数", "數"],
  "ái zhú": ["敱", "敳"],
  "xiòng xuàn": ["敻"],
  "zhuó zhú": ["斀"],
  "yì dù": ["斁"],
  "lí tái": ["斄"],
  "fěi fēi": ["斐"],
  "yǔ zhōng": ["斔"],
  "dòu dǒu": ["斗"],
  "wò guǎn": ["斡"],
  "tǒu tiǎo": ["斢"],
  dòu: [
    "斣",
    "梪",
    "浢",
    "痘",
    "窦",
    "竇",
    "脰",
    "荳",
    "豆",
    "逗",
    "郖",
    "酘",
    "閗",
    "闘",
    "餖",
    "饾",
    "鬥",
    "鬦",
    "鬪",
    "鬬",
    "鬭"
  ],
  "yín zhì": ["斦"],
  "chǎn jiè": ["斺"],
  "wū yū yú": ["於"],
  "yóu liú": ["斿"],
  "páng bàng": ["旁"],
  "máo mào": ["旄"],
  "pī bì": ["旇"],
  "xuán xuàn": ["旋"],
  "wú mó": ["无"],
  zǎo: ["早", "枣", "栆", "棗", "澡", "璪", "薻", "藻", "蚤"],
  gā: ["旮"],
  "gàn hàn": ["旰"],
  "tái yīng": ["旲"],
  "xū xù": ["旴"],
  "tūn zhùn": ["旽"],
  "wù wǔ": ["旿"],
  "pò pèi": ["昢"],
  zòng: ["昮", "猔", "疭", "瘲", "粽", "糉", "糭", "縦"],
  ǎi: ["昹", "毐", "矮", "蔼", "藹", "譪", "躷", "霭", "靄"],
  "huàng huǎng": ["晃"],
  xuǎn: ["晅", "癣", "癬", "选", "選"],
  "xù kuā": ["晇"],
  hǒng: ["晎"],
  shài: ["晒", "曬"],
  "yūn yùn": ["晕", "煴"],
  "shèng chéng": ["晟", "椉", "盛"],
  "jǐng yǐng": ["景"],
  shǎn: ["晱", "熌", "睒", "覢", "閃", "闪", "陕", "陝"],
  "qǐ dù": ["晵"],
  "ǎn àn yǎn": ["晻"],
  "wǎng wàng": ["暀"],
  zàn: [
    "暂",
    "暫",
    "瓉",
    "瓒",
    "瓚",
    "禶",
    "襸",
    "讃",
    "讚",
    "賛",
    "贊",
    "赞",
    "蹔",
    "鄼",
    "錾",
    "鏨",
    "饡"
  ],
  "yùn yūn": ["暈"],
  "mín mǐn": ["暋"],
  "dǔ shǔ": ["暏"],
  shǔ: [
    "暑",
    "曙",
    "潻",
    "癙",
    "糬",
    "署",
    "薥",
    "薯",
    "藷",
    "蜀",
    "蠴",
    "襡",
    "襩",
    "鱪",
    "鱰",
    "黍",
    "鼠",
    "鼡"
  ],
  "jiǎn lán": ["暕"],
  nuǎn: ["暖", "煗", "餪"],
  "bào pù": ["暴"],
  "xī xǐ": ["暿"],
  "pù bào": ["曝", "瀑"],
  "qū qǔ": ["紶"],
  "qǔ qū": ["曲"],
  "gèng gēng": ["更"],
  "hū hù": ["曶", "雽"],
  "zēng céng": ["曽", "橧"],
  "céng zēng": ["曾", "竲"],
  "cǎn qián jiàn": ["朁"],
  "qiè hé": ["朅"],
  "bì pí": ["朇", "禆", "笓", "裨"],
  "yǒu yòu": ["有"],
  "bān fén": ["朌", "鳻"],
  "fú fù": ["服", "洑"],
  "fěi kū": ["朏", "胐"],
  "qú xù chǔn": ["朐"],
  "juān zuī": ["朘"],
  "huāng máng wáng": ["朚"],
  "qī jī": ["期"],
  "tóng chuáng": ["朣", "橦"],
  zhá: ["札", "牐", "箚", "蚻", "譗", "鍘", "铡", "閘", "闸"],
  "zhú shù shú": ["朮"],
  "shù shú zhú": ["术"],
  "zhū shú": ["朱"],
  "pǔ pò pō piáo": ["朴"],
  "dāo tiáo mù": ["朷"],
  "guǐ qiú": ["朹"],
  xiǔ: ["朽", "滫", "潃", "糔"],
  "chéng chēng": ["朾"],
  zá: ["杂", "沯", "砸", "襍", "雑", "雜", "雥", "韴"],
  "yú wū": ["杅"],
  "gān gǎn": ["杆"],
  "chā chà": ["杈"],
  "shān shā": ["杉"],
  cūn: ["村", "皴", "竴", "膥", "踆", "邨"],
  "rèn ér": ["杒", "梕"],
  "sháo biāo": ["杓"],
  "dì duò": ["杕", "枤"],
  "gū gài": ["杚"],
  "yí zhì lí duò": ["杝"],
  "gàng gāng": ["杠"],
  "tiáo tiāo": ["条", "條"],
  "mà mǎ": ["杩"],
  "sì zhǐ xǐ": ["杫"],
  "yuán wán": ["杬", "蚖"],
  "bèi fèi": ["杮"],
  "shū duì": ["杸"],
  "niǔ chǒu": ["杻"],
  "wò yuè": ["枂", "臒"],
  máo: [
    "枆",
    "毛",
    "氂",
    "渵",
    "牦",
    "矛",
    "罞",
    "茅",
    "茆",
    "蝥",
    "蟊",
    "軞",
    "酕",
    "鉾",
    "錨",
    "锚",
    "髦",
    "鶜"
  ],
  "pī mì": ["枈"],
  àng: ["枊", "盎", "醠"],
  "fāng bìng": ["枋"],
  "hù dǐ": ["枑"],
  xín: ["枔", "襑", "鐔", "鬵"],
  "yāo yǎo": ["枖"],
  "ě è": ["枙"],
  "zhī qí": ["枝"],
  "cōng zōng": ["枞", "樅"],
  "xiān zhēn": ["枮"],
  "tái sì": ["枱"],
  "gǒu jǔ gōu": ["枸"],
  "bāo fú": ["枹"],
  "yì xiè": ["枻", "栧"],
  "tuó duò": ["柁", "馱", "駄", "驮"],
  "yí duò lí": ["柂"],
  "nǐ chì": ["柅"],
  "pán bàn": ["柈", "跘"],
  "yǎng yàng yāng yīng": ["柍"],
  "fù fū fǔ": ["柎"],
  "bǎi bó bò": ["柏"],
  mǒu: ["某"],
  "sháo shào": ["柖"],
  zhè: ["柘", "樜", "浙", "淛", "蔗", "蟅", "這", "鷓", "鹧", "䗪"],
  "yòu yóu": ["柚", "櫾"],
  "guì jǔ": ["柜"],
  "zhà zuò": ["柞"],
  "dié zhì": ["柣", "眰"],
  "zhā zǔ zū": ["柤"],
  "chá zhā": ["查", "査"],
  "āo ào": ["柪", "軪"],
  "bā fú pèi bó biē": ["柭"],
  "duò zuó wù": ["柮"],
  "bì bié": ["柲"],
  "zhù chù": ["柷"],
  "bēi pēi": ["柸"],
  "shì fèi": ["柹"],
  "shān zhà shi cè": ["栅"],
  "lì yuè": ["栎", "櫟"],
  "qì qiè": ["栔", "砌"],
  "qī xī": ["栖", "蹊"],
  "guā kuò": ["栝"],
  "bīng bēn": ["栟"],
  "xiào jiào": ["校"],
  "jiàn zùn": ["栫", "袸"],
  "yǒu yù": ["栯"],
  "hé hú": ["核"],
  gēn: ["根", "跟"],
  "zhī yì": ["栺"],
  "gé gē": ["格"],
  "héng háng": ["桁"],
  "guàng guāng": ["桄"],
  "yí tí": ["桋", "荑"],
  sāng: ["桑", "桒", "槡"],
  "jú jié": ["桔"],
  "yú móu": ["桙"],
  "ráo náo": ["桡", "橈"],
  "guì huì": ["桧", "檜"],
  "chén zhèn": ["桭"],
  "tīng yíng": ["桯"],
  "bó po": ["桲"],
  "bèn fàn": ["桳"],
  "fēng fèng": ["桻", "葑"],
  "sù yìn": ["梀"],
  "tǐng tìng": ["梃"],
  "xuān juān xié": ["梋"],
  "tú chá": ["梌"],
  "āo yòu": ["梎"],
  kuǎn: ["梡", "欵", "款", "歀"],
  "shāo sào": ["梢"],
  "qín chén cén": ["梣"],
  "lí sì qǐ": ["梩"],
  "chān yán": ["梴"],
  "bīn bīng": ["梹", "槟", "檳"],
  "táo chóu dào": ["梼"],
  "cōng sōng": ["棇"],
  "gùn hùn": ["棍"],
  "dé zhé": ["棏"],
  "pái bèi pèi": ["棑"],
  "bàng pǒu bèi bēi": ["棓"],
  "dì dài tì": ["棣"],
  sēn: ["森", "椮", "槮", "襂"],
  "rěn shěn": ["棯"],
  "léng lēng líng": ["棱"],
  "fú sù": ["棴"],
  "zōu sǒu": ["棷"],
  zōu: [
    "棸",
    "箃",
    "緅",
    "諏",
    "诹",
    "邹",
    "郰",
    "鄒",
    "鄹",
    "陬",
    "騶",
    "驺",
    "鯫",
    "鲰",
    "黀",
    "齱",
    "齺"
  ],
  "zhào zhuō": ["棹"],
  "chēn shēn": ["棽"],
  "jiē qiè": ["椄"],
  "yǐ yī": ["椅"],
  "chóu zhòu diāo": ["椆"],
  "qiāng kōng": ["椌"],
  "zhuī chuí": ["椎"],
  "bēi pí": ["椑"],
  mēn: ["椚"],
  "quān juàn quán": ["椦"],
  "duǒ chuán": ["椯"],
  "wěi huī": ["椲"],
  "jiǎ jiā": ["椵"],
  "hán jiān": ["椷"],
  "shèn zhēn": ["椹"],
  "yàn yà": ["椻"],
  "zhā chá": ["楂"],
  "guō kuǎ": ["楇"],
  "jí zhì": ["楖"],
  "kǔ hù": ["楛"],
  "yóu yǒu": ["楢"],
  "sǒng cōng": ["楤"],
  "yuán xuàn": ["楥"],
  "yǎng yàng yīng": ["楧"],
  pián: ["楩", "胼", "腁", "賆", "蹁", "駢", "騈", "骈", "骿", "㛹"],
  "dié yè": ["楪"],
  "dùn shǔn": ["楯"],
  "còu zòu": ["楱"],
  "dì dǐ shì": ["楴"],
  "kǎi jiē": ["楷"],
  "róu ròu": ["楺"],
  "lè yuè": ["楽"],
  "wēn yùn": ["榅", "鞰"],
  lǘ: ["榈", "櫚", "氀", "膢", "藘", "閭", "闾", "驢", "驴"],
  shén: ["榊", "神", "鉮", "鰰", "𬬹"],
  "bī pi": ["榌"],
  "zhǎn niǎn zhèn": ["榐"],
  "fú fù bó": ["榑"],
  "jiàn jìn": ["榗"],
  "bǎng bàng": ["榜"],
  "shā xiè": ["榝", "樧"],
  nòu: ["槈", "耨", "鎒", "鐞"],
  "qiǎn lián xiàn": ["槏"],
  gàng: ["槓", "焵", "焹", "筻", "鿍"],
  gāo: [
    "槔",
    "槹",
    "橰",
    "櫜",
    "睾",
    "篙",
    "糕",
    "羔",
    "臯",
    "韟",
    "餻",
    "高",
    "髙",
    "鷎",
    "鷱",
    "鼛"
  ],
  "diān zhěn zhēn": ["槙"],
  "kǎn jiàn": ["槛"],
  "xí dié": ["槢"],
  "jī guī": ["槣"],
  "róng yōng": ["槦"],
  "tuán shuàn quán": ["槫"],
  "qì sè": ["槭"],
  "cuī zhǐ": ["槯"],
  "yǒu chǎo": ["槱"],
  "màn wàn": ["槾"],
  "lí chī": ["樆"],
  "léi lěi": ["樏", "櫑", "礌"],
  "cháo jiǎo chāo": ["樔"],
  "chēng táng": ["樘"],
  "jiū liáo": ["樛"],
  "mó mú": ["模"],
  "niǎo mù": ["樢"],
  "héng hèng": ["横", "橫"],
  xuě: ["樰", "膤", "艝", "轌", "雪", "鱈", "鳕"],
  "fá fèi": ["橃"],
  rùn: ["橍", "润", "潤", "膶", "閏", "閠", "闰"],
  "zhǎn jiǎn": ["橏"],
  shùn: ["橓", "瞚", "瞬", "舜", "蕣", "順", "顺", "鬊"],
  "tuí dūn": ["橔"],
  "táng chēng": ["橖"],
  "sù qiū": ["橚"],
  "tán diàn": ["橝"],
  "fén fèn fèi": ["橨"],
  "rǎn yān": ["橪"],
  "cū chu": ["橻"],
  "shū qiāo": ["橾"],
  "píng bò": ["檘"],
  "zhái shì tú": ["檡"],
  "biǎo biāo": ["檦"],
  "qiān lián": ["檶"],
  "nǐ mí": ["檷"],
  "jiàn kǎn": ["檻"],
  "nòu ruǎn rú": ["檽"],
  "jī jì": ["櫅", "禨"],
  "huǎng guǒ gǔ": ["櫎"],
  "lǜ chū": ["櫖"],
  "miè mèi": ["櫗"],
  ōu: [
    "櫙",
    "欧",
    "歐",
    "殴",
    "毆",
    "瓯",
    "甌",
    "膒",
    "藲",
    "謳",
    "讴",
    "鏂",
    "鴎",
    "鷗",
    "鸥"
  ],
  "zhù zhuó": ["櫡"],
  "jué jì": ["櫭"],
  "huái guī": ["櫰"],
  "chán zhàn": ["欃"],
  "wéi zuì": ["欈"],
  cáng: ["欌", "鑶"],
  "yù yì": ["欥"],
  "chù qù xì": ["欪"],
  "kài ài": ["欬"],
  "yì yīn": ["欭"],
  "xì kài": ["欯"],
  "shuò sòu": ["欶"],
  "ǎi ēi éi ěi èi ê̄ ế ê̌ ề": ["欸"],
  "qī yī": ["欹"],
  "chuā xū": ["欻"],
  "chǐ chuài": ["欼"],
  "kǎn qiàn": ["欿"],
  "kǎn kè": ["歁"],
  "chuǎn chuán": ["歂"],
  "yīn yān": ["歅"],
  "jìn qūn": ["歏"],
  pēn: ["歕"],
  "xū chuā": ["歘"],
  "xī shè": ["歙"],
  "liǎn hān": ["歛"],
  "zhì chí": ["歭"],
  "sè shà": ["歰"],
  sǐ: ["死"],
  "wěn mò": ["歾"],
  piǎo: ["殍", "皫", "瞟", "醥", "顠"],
  "qíng jìng": ["殑"],
  "fǒu bó": ["殕"],
  "zhí shi": ["殖"],
  "yè yān yàn": ["殗"],
  "hūn mèi": ["殙"],
  chòu: ["殠", "臰", "遚"],
  "kuì huì": ["殨", "溃", "潰"],
  cuàn: ["殩", "熶", "爨", "窜", "竄", "篡", "簒"],
  "yīn yān yǐn": ["殷"],
  "qìng kēng shēng": ["殸"],
  "yáo xiáo xiào": ["殽"],
  "gū gǔ": ["毂", "蛄"],
  "guàn wān": ["毌"],
  "dú dài": ["毒"],
  "xún xùn": ["毥"],
  mú: ["毪", "氁"],
  "dòu nuò": ["毭"],
  "sāi suī": ["毸"],
  lu: ["氇"],
  sào: ["氉", "瘙", "矂", "髞"],
  "shì zhī": ["氏"],
  "dī dǐ": ["氐"],
  "máng méng": ["氓"],
  "yáng rì": ["氜"],
  shuǐ: ["水", "氵", "氺", "閖"],
  "zhěng chéng zhèng": ["氶"],
  tǔn: ["氽"],
  "fán fàn": ["氾"],
  "guǐ jiǔ": ["氿"],
  "bīn pà pā": ["汃"],
  "zhuó què": ["汋"],
  "dà tài": ["汏"],
  pìn: ["汖", "牝", "聘"],
  "hàn hán": ["汗", "馯"],
  tu: ["汢"],
  "tāng shāng": ["汤", "湯"],
  "zhī jì": ["汥"],
  "gàn hán cén": ["汵"],
  "wèn mén": ["汶"],
  "fāng pāng": ["汸"],
  "hǔ huǎng": ["汻"],
  "niú yóu": ["汼"],
  hàng: ["沆"],
  "shěn chén": ["沈"],
  "dùn zhuàn": ["沌"],
  "nǜ niǔ": ["沑"],
  "méi mò": ["沒", "没"],
  "tà dá": ["沓"],
  "mì wù": ["沕"],
  "hóng pāng": ["沗"],
  "shā shà": ["沙"],
  "zhuǐ zǐ": ["沝"],
  "ōu òu": ["沤", "漚"],
  "jǔ jù": ["沮"],
  "tuō duó": ["沰"],
  "mǐ lì": ["沵"],
  "yí chí": ["沶"],
  "xiè yì": ["泄"],
  "bó pō": ["泊"],
  "mì bì": ["泌", "秘"],
  "chù shè": ["泏"],
  "yōu yòu āo": ["泑"],
  "pēng píng": ["泙", "硑"],
  "pào pāo": ["泡"],
  "ní nì": ["泥", "秜"],
  "yuè sà": ["泧"],
  "jué xuè": ["泬", "疦"],
  "lóng shuāng": ["泷", "瀧"],
  "luò pō": ["泺", "濼"],
  "zé shì": ["泽", "澤"],
  "sǎ xǐ": ["洒"],
  "sè qì zì": ["洓"],
  "xǐ xiǎn": ["洗"],
  "kǎo kào": ["洘"],
  "àn yàn è": ["洝"],
  "lěi lèi": ["洡"],
  "qiè jié": ["洯"],
  "qiǎn jiān": ["浅"],
  "jì jǐ": ["济", "済", "濟", "纪"],
  "hǔ xǔ": ["浒", "滸"],
  "jùn xùn": ["浚", "濬"],
  "yǐng chéng yíng": ["浧"],
  "liàn lì": ["浰"],
  "féng hóng": ["浲", "溄"],
  "jiǒng jiōng": ["浻"],
  "suī něi": ["浽"],
  "yǒng chōng": ["涌"],
  "tūn yūn": ["涒"],
  "wō guō": ["涡", "渦"],
  hēng: ["涥", "脝"],
  "zhǎng zhàng": ["涨", "漲"],
  "shòu tāo": ["涭"],
  shuàn: ["涮", "腨"],
  "kōng náng": ["涳"],
  "wò wǎn yuān": ["涴"],
  "tuō tuò": ["涶"],
  wō: ["涹", "猧", "窝", "窩", "莴", "萵", "蜗", "蝸", "踒"],
  "qiè jí": ["淁"],
  "guǒ guàn": ["淉"],
  "lín lìn": ["淋", "獜", "疄"],
  "tǎng chǎng": ["淌"],
  "nào chuò zhuō": ["淖"],
  "péng píng": ["淜"],
  féi: ["淝", "肥", "腓", "蜰"],
  "pì pèi": ["淠"],
  "niǎn shěn": ["淰"],
  "biāo hǔ": ["淲"],
  "chún zhūn": ["淳"],
  "hùn hún": ["混"],
  qiǎn: ["淺", "繾", "缱", "肷", "膁", "蜸", "譴", "谴", "遣", "鑓"],
  "wèn mín": ["渂"],
  "rè ruò luò": ["渃"],
  "dú dòu": ["渎", "瀆", "读"],
  "jiàn jiān": ["渐", "溅", "漸", "濺"],
  "miǎn shéng": ["渑", "澠"],
  "nuǎn nuán": ["渜"],
  "qiú wù": ["渞"],
  "tíng tīng": ["渟"],
  "dì tí dī": ["渧"],
  "gǎng jiǎng": ["港"],
  "hōng qìng": ["渹"],
  tuān: ["湍", "煓"],
  "huì mǐn xū": ["湏"],
  "xǔ xù": ["湑"],
  pén: ["湓", "瓫", "盆", "葐"],
  "mǐn hūn": ["湣"],
  "tuàn nuǎn": ["湪"],
  "qiū jiǎo": ["湫", "湬"],
  "yān yīn": ["湮"],
  "bàn pán": ["湴"],
  "zhuāng hún": ["湷"],
  "yàn guì": ["溎"],
  "lián liǎn nián xián xiàn": ["溓"],
  "dá tǎ": ["溚", "鿎"],
  "liū liù": ["溜", "澑", "蹓"],
  lùn: ["溣"],
  mǎ: [
    "溤",
    "犸",
    "獁",
    "玛",
    "瑪",
    "码",
    "碼",
    "遤",
    "鎷",
    "馬",
    "马",
    "鰢",
    "鷌"
  ],
  "zhēn qín": ["溱"],
  "nì niào": ["溺"],
  "chù xù": ["滀", "畜"],
  "wěng wēng": ["滃"],
  "hào xuè": ["滈"],
  "qì xì xiē": ["滊"],
  "xíng yíng": ["滎"],
  "zé hào": ["滜"],
  "piāo piào piǎo": ["漂"],
  "cóng sǒng": ["漎"],
  "féng péng": ["漨"],
  "luò tà": ["漯"],
  "pēng bēn": ["漰"],
  "chóng shuāng": ["漴"],
  "huǒ kuò huò": ["漷"],
  "liáo liú": ["漻"],
  "cuǐ cuī": ["漼"],
  "cóng zǒng": ["潀"],
  "cóng zōng": ["潈"],
  "pì piē": ["潎"],
  "dàng xiàng": ["潒"],
  "huáng guāng": ["潢"],
  "liáo lào lǎo": ["潦"],
  "cōng zòng": ["潨"],
  "zhí zhì": ["潪"],
  "tān shàn": ["潬"],
  "tú zhā": ["潳"],
  "sàn sǎ": ["潵"],
  hēi: ["潶", "黑", "黒", "𬭶"],
  "chéng dèng": ["澄", "瀓"],
  "cūn cún": ["澊"],
  "péng pēng": ["澎"],
  "hòng gǒng": ["澒", "銾"],
  "wàn màn": ["澫"],
  "kuài huì": ["澮"],
  "guō wō": ["濄"],
  "pēn fén": ["濆"],
  "jí shà": ["濈"],
  "huì huò": ["濊"],
  "dǐng tìng": ["濎"],
  "mǐ nǐ": ["濔"],
  "bì pì": ["濞"],
  "cuì zuǐ": ["濢"],
  "hù huò": ["濩"],
  "ǎi kài kè": ["濭"],
  "wěi duì": ["濻", "瀢"],
  "zàn cuán": ["濽", "灒"],
  "yǎng yàng": ["瀁"],
  "wǎng wāng": ["瀇"],
  "mò miè": ["瀎", "眜"],
  suǐ: ["瀡", "膸", "髓"],
  "huái wāi": ["瀤"],
  "zùn jiàn": ["瀳"],
  "yīng yǐng yìng": ["瀴"],
  "ráng ràng": ["瀼"],
  shuàng: ["灀"],
  "zhuó jiào zé": ["灂"],
  sǎ: ["灑", "訯", "靸"],
  "luán luàn": ["灓"],
  "dǎng tǎng": ["灙"],
  "xún quán quàn": ["灥"],
  "huǒ biāo": ["灬"],
  "zhà yù": ["灹"],
  "fén bèn": ["炃"],
  "jiǒng guì": ["炅"],
  "pàng fēng": ["炐"],
  quē: ["炔", "缺", "缼", "蒛"],
  biān: [
    "炞",
    "煸",
    "甂",
    "砭",
    "笾",
    "箯",
    "籩",
    "編",
    "编",
    "蝙",
    "邉",
    "邊",
    "鍽",
    "鞭",
    "鯾",
    "鯿",
    "鳊"
  ],
  "zhāo zhào": ["炤"],
  "zhuō chù": ["炪"],
  "pào páo bāo": ["炮"],
  "páo fǒu": ["炰"],
  "shǎn qián shān": ["炶"],
  "zhà zhá": ["炸"],
  "jiǎo yào": ["烄"],
  quǎn: ["烇", "犬", "犭", "畎", "綣", "绻", "虇"],
  "yàng yáng": ["烊"],
  "lào luò": ["烙"],
  "huí huǐ": ["烠"],
  rè: ["热", "熱"],
  "fú páo": ["烰"],
  "xiè chè": ["烲", "焎"],
  "yàn shān": ["烻"],
  "hūn xūn": ["焄"],
  kào: ["焅", "犒", "銬", "铐", "靠", "鮳", "鯌", "鲓", "㸆"],
  "juān yè": ["焆"],
  "jùn qū": ["焌"],
  "tāo dào": ["焘"],
  "chǎo jù": ["焣"],
  "wò ài": ["焥"],
  "zǒng cōng": ["焧"],
  "xī yì": ["焬"],
  "xìn xīn": ["焮"],
  "chāo zhuō": ["焯"],
  "xiǒng yīng": ["焸", "焽"],
  kuǐ: ["煃", "跬", "蹞", "頍", "𫠆"],
  "huī yùn xūn": ["煇"],
  "jiǎo qiāo": ["煍"],
  "qián shǎn shān": ["煔"],
  "xī yí": ["煕"],
  "shà shā": ["煞"],
  "yè zhá": ["煠"],
  "yáng yàng": ["煬"],
  "ēn yūn": ["煾"],
  "yūn yǔn": ["熅"],
  "hè xiāo": ["熇"],
  xióng: ["熊", "熋", "雄"],
  "xūn xùn": ["熏", "爋"],
  gòng: ["熕", "貢", "贡"],
  liū: ["熘"],
  "cōng zǒng": ["熜"],
  "lù āo": ["熝"],
  "shú shóu": ["熟"],
  "fēng péng": ["熢"],
  "cuǐ suī": ["熣"],
  tēng: ["熥", "膯", "鼟"],
  "yùn yù": ["熨"],
  "áo āo": ["熬"],
  "hàn rǎn": ["熯"],
  "ōu ǒu": ["熰"],
  "huáng huǎng": ["熿"],
  "chǎn dǎn chàn": ["燀"],
  "jiāo zhuó qiáo jué": ["燋"],
  "yàn yān": ["燕"],
  "tài liè": ["燤"],
  āo: ["爊"],
  "yàn xún": ["爓"],
  "jué jiào": ["爝", "覐", "覚", "覺", "觉"],
  "lǎn làn": ["爦"],
  "zhuǎ zhǎo": ["爪"],
  "zhǎo zhuǎ": ["爫"],
  "fù fǔ": ["父"],
  diē: ["爹", "褺", "跌"],
  zāng: ["牂", "羘", "臧", "賍", "賘", "贓", "贜", "赃", "髒"],
  "piàn piān": ["片"],
  "biān miàn": ["牑"],
  bǎng: ["牓", "綁", "绑"],
  "yǒu yōng": ["牗"],
  "chēng chèng": ["牚", "竀"],
  niú: ["牛", "牜"],
  "jiū lè": ["牞"],
  "mù móu": ["牟"],
  māng: ["牤"],
  "gē qiú": ["牫"],
  "yòu chōu": ["牰"],
  "tè zhí": ["犆"],
  bēn: ["犇", "錛", "锛"],
  "jiān qián": ["犍", "玪"],
  má: ["犘", "痲", "蔴", "蟇", "麻"],
  "máo lí": ["犛"],
  "bá quǎn": ["犮"],
  "zhuó bào": ["犳"],
  "àn hān": ["犴"],
  "kàng gǎng": ["犺"],
  "pèi fèi": ["犻"],
  "fān huān": ["犿"],
  kuáng: ["狂", "狅", "誑", "诳", "軖", "軠", "鵟", "𫛭"],
  "yí quán chí": ["狋"],
  "xīng shēng": ["狌"],
  "tuó yí": ["狏"],
  kǔ: ["狜", "苦"],
  "huán huān": ["狟"],
  "hé mò": ["狢"],
  "tà shì": ["狧"],
  "máng dòu": ["狵"],
  "xī shǐ": ["狶"],
  suān: ["狻", "痠", "酸"],
  "bài pí": ["猈"],
  "jiān yàn": ["猏", "豣"],
  "yī yǐ": ["猗"],
  "yá wèi": ["猚"],
  cāi: ["猜"],
  "māo máo": ["猫", "貓"],
  "chuàn chuān": ["猭"],
  "tuān tuàn": ["猯", "貒"],
  "yà jiá qiè": ["猰"],
  "hè xiē gé hài": ["猲"],
  "biān piàn": ["猵", "獱"],
  "bó pò": ["猼"],
  "háo gāo": ["獋"],
  "fén fèn": ["獖"],
  "yào xiāo": ["獟"],
  "shuò xī": ["獡"],
  "gé liè xiē": ["獦"],
  "nòu rú": ["獳"],
  "náo nǎo yōu": ["獶"],
  ráng: ["獽", "瓤", "禳", "穣", "穰", "蘘", "躟", "鬤"],
  "náo yōu": ["獿"],
  "lǜ shuài": ["率"],
  "wáng wàng": ["王"],
  "yáng chàng": ["玚"],
  "mín wén": ["玟"],
  "bīn fēn": ["玢"],
  "mén yǔn": ["玧"],
  "qiāng cāng": ["玱", "瑲", "篬"],
  "án gān": ["玵"],
  "xuán xián": ["玹"],
  "cī cǐ": ["玼", "跐"],
  "yí tāi": ["珆"],
  "zǔ jù": ["珇"],
  fà: ["珐", "琺", "蕟", "髪", "髮"],
  "yín kèn": ["珢"],
  "huī hún": ["珲"],
  "xuán qióng": ["琁"],
  "fú fū": ["琈"],
  "bǐng pín": ["琕"],
  "cuì sè": ["琗"],
  "yù wéi": ["琟"],
  "tiǎn tiàn": ["琠"],
  "zhuó zuó": ["琢"],
  "běng pěi": ["琣"],
  guǎn: ["琯", "璭", "痯", "筦", "管", "舘", "輨", "錧", "館", "馆", "鳤"],
  "hún huī": ["琿"],
  "xié jiē": ["瑎"],
  "chàng dàng yáng": ["瑒"],
  "tiàn zhèn": ["瑱"],
  "bīn pián": ["瑸", "璸"],
  "tú shū": ["瑹"],
  cuǐ: ["璀", "皠", "趡"],
  "zǎo suǒ": ["璅"],
  "jué qióng": ["璚"],
  "lú fū": ["璷"],
  "jì zī": ["璾"],
  suí: ["瓍", "綏", "绥", "遀", "随", "隨", "髄"],
  "mí xǐ": ["瓕"],
  "qióng wěi wèi": ["瓗"],
  "huán yè yà": ["瓛"],
  "bó páo": ["瓟"],
  "zhí hú": ["瓡"],
  piáo: ["瓢", "闝"],
  "wǎ wà": ["瓦"],
  "xiáng hóng": ["瓨"],
  wèng: ["瓮", "甕", "罋", "蕹", "齆"],
  "shèn shén": ["甚"],
  ruí: ["甤", "緌", "蕤"],
  yòng: ["用", "砽", "苚", "蒏", "醟", "㶲"],
  shuǎi: ["甩"],
  béng: ["甭", "甮"],
  "yóu zhá": ["甴"],
  "diàn tián shèng": ["甸"],
  "tǐng dīng": ["町", "甼"],
  "zāi zī": ["甾"],
  "bì qí": ["畁"],
  "dá fú": ["畗"],
  "cè jì": ["畟"],
  "zāi zī tián": ["畠"],
  "zhì chóu shì": ["畤"],
  "fān pān": ["畨", "番"],
  "shē yú": ["畬"],
  "dāng dàng dǎng": ["當"],
  "jiāng qiáng": ["疆"],
  "pǐ yǎ shū": ["疋"],
  "jié qiè": ["疌"],
  "yí nǐ": ["疑"],
  nè: ["疒", "眲", "訥", "讷"],
  "gē yì": ["疙"],
  "nüè yào": ["疟", "瘧"],
  "lì lài": ["疠", "癘"],
  "yǎ xiā": ["疨"],
  xuē: ["疶", "蒆", "薛", "辥", "辪", "靴", "鞾"],
  "dǎn da": ["疸"],
  "fá biǎn": ["疺"],
  "fèi féi": ["疿", "痱"],
  "shān diàn": ["痁"],
  "téng chóng": ["痋"],
  "tōng tóng": ["痌"],
  "wěi yòu yù": ["痏"],
  "tān shǐ": ["痑"],
  "pū pù": ["痡", "鋪"],
  "bēng péng": ["痭"],
  "má lìn": ["痳"],
  "tiǎn diàn": ["痶"],
  "ān yè è": ["痷"],
  "kē ē": ["痾"],
  "zhì chì": ["瘈"],
  "jiǎ xiá xiā": ["瘕"],
  "lěi huì": ["瘣"],
  "chài cuó": ["瘥"],
  "diān chēn": ["瘨"],
  "da dá": ["瘩"],
  "biě biē": ["瘪"],
  qué: ["瘸"],
  "dàn dān": ["癉"],
  "guì wēi": ["癐"],
  "nòng nóng": ["癑"],
  "biē biě": ["癟"],
  "bō bǒ": ["癷"],
  bái: ["白"],
  "jí bī": ["皀"],
  "de dì dí dī": ["的"],
  "pā bà": ["皅"],
  "gāo háo": ["皋"],
  "gāo yáo": ["皐"],
  "lì luò bō": ["皪"],
  "zhā cǔ": ["皻"],
  "zhāo zhǎn dǎn": ["皽"],
  "jiān jiàn": ["监", "監", "鋻", "间", "鞬"],
  "gài gě hé": ["盖"],
  "máng wàng": ["盳"],
  yuǎn: ["盶", "逺", "遠"],
  "tián xián": ["盷"],
  "xiāng xiàng": ["相"],
  dǔn: ["盹", "趸", "躉"],
  "xì pǎn": ["盻"],
  "shěng xǐng": ["省"],
  "yún hùn": ["眃"],
  "miǎn miàn": ["眄"],
  "kàn kān": ["看"],
  "yìng yāng yǎng": ["眏"],
  "yǎo āo ǎo": ["眑"],
  "jū xū kōu": ["眗"],
  "yí chì": ["眙"],
  "dié tì": ["眣"],
  "bǐng fǎng": ["眪"],
  "pàng pán": ["眫"],
  "mī mí": ["眯", "瞇"],
  "xuàn shùn xún": ["眴"],
  tiào: ["眺", "粜", "糶", "覜", "趒"],
  "zhe zhuó zháo zhāo": ["着"],
  "qiáo shào xiāo": ["睄"],
  "cuó zhuài": ["睉"],
  gùn: ["睔", "謴"],
  "suì zuì": ["睟"],
  "pì bì": ["睥", "稫", "辟"],
  "yì zé gāo": ["睪"],
  "xǐng xìng": ["睲"],
  "guì wèi kuì": ["瞆"],
  "kòu jì": ["瞉"],
  "qióng huán": ["瞏"],
  "mán mén": ["瞒", "瞞"],
  "diāo dōu": ["瞗"],
  "lou lóu lǘ": ["瞜"],
  "shùn rún": ["瞤"],
  "liào liǎo": ["瞭", "钌"],
  "jiàn xián": ["瞯"],
  "wǔ mí": ["瞴"],
  "guì kuì": ["瞶"],
  "nǐng chēng": ["矃"],
  "huò yuè": ["矆"],
  "mēng méng": ["矇"],
  "kuàng guō": ["矌"],
  "guàn quán": ["矔"],
  "mǎn mán": ["矕"],
  "jīn guān qín": ["矜"],
  "jīn qín guān": ["矝"],
  "yù xù jué": ["矞"],
  "jiǎo jiáo": ["矫", "矯"],
  duǎn: ["短"],
  "shí dàn": ["石"],
  "gāng qiāng kòng": ["矼"],
  "huā xū": ["砉"],
  "pīn bīn fēn": ["砏"],
  "yán yàn": ["研", "硏"],
  "luǒ kē": ["砢"],
  "fú fèi": ["砩", "笰"],
  "zhǔ zhù": ["砫"],
  "lá lì lā": ["砬"],
  "kuāng guāng": ["硄"],
  "gè luò": ["硌"],
  "shuò shí": ["硕", "碩"],
  "wèi wéi ái": ["硙"],
  "què kè kù": ["硞"],
  "mǎng bàng": ["硥"],
  "luò lòng": ["硦"],
  "yǒng tóng": ["硧"],
  nüè: ["硸", "虐"],
  "kēng kěng": ["硻"],
  "yān yǎn": ["硽"],
  "zhuì chuí duǒ": ["硾"],
  "kōng kòng": ["硿"],
  "zòng cóng": ["碂"],
  "jiān zhàn": ["碊"],
  "lù liù": ["碌", "陆"],
  "què xī": ["碏"],
  "lún lǔn lùn": ["碖"],
  "náo gāng": ["碙"],
  "jié yà": ["碣"],
  "wèi wěi": ["碨"],
  "tí dī": ["碮"],
  "chá chā": ["碴"],
  "qiāo què": ["碻"],
  "sù xiè": ["碿"],
  "liú liù": ["磂", "遛", "鎦", "馏"],
  "sī tí": ["磃"],
  "bàng páng": ["磅"],
  "huá kě gū": ["磆"],
  "wěi kuǐ": ["磈"],
  "xiá qià yà": ["磍"],
  "lián qiān": ["磏"],
  "wèi ái gài": ["磑"],
  "lá lā": ["磖"],
  "áo qiāo": ["磝"],
  "pēng pèng": ["磞", "閛"],
  "yīn yǐn": ["磤"],
  "lěi léi": ["磥"],
  "mó mò": ["磨"],
  "qì zhú": ["磩"],
  "láo luò": ["磱"],
  "pán bō": ["磻"],
  "jí shé": ["磼"],
  "hé qiāo qiào": ["礉"],
  "kè huò": ["礊"],
  "què hú": ["礐"],
  "è qì": ["礘"],
  cǎ: ["礤", "礸"],
  "xián xín": ["礥"],
  "léi lěi lèi": ["礧"],
  "yán yǎn": ["礹"],
  "qí zhǐ": ["祇", "蚔"],
  "bēng fāng": ["祊"],
  "bì mì": ["祕"],
  suàn: ["祘", "笇", "筭", "算", "蒜"],
  "piào piāo": ["票"],
  "jì zhài": ["祭"],
  "shuì lèi": ["祱"],
  "jìn jīn": ["禁"],
  "chán shàn": ["禅"],
  "yáng shāng": ["禓"],
  "zhī zhǐ tí": ["禔"],
  "shàn chán": ["禪"],
  "yú yù ǒu": ["禺"],
  "zǐ zì": ["秄"],
  "chá ná": ["秅"],
  "zhǒng zhòng chóng": ["种"],
  "hào mào": ["秏"],
  "kù kū": ["秙"],
  zū: ["租", "葅"],
  chèng: ["秤", "穪"],
  "huó kuò": ["秮", "秳"],
  "chēng chèn chèng": ["称", "稱"],
  "shì zhì": ["秲", "銴"],
  "fù pū": ["秿"],
  "xùn zè": ["稄"],
  "tú shǔ": ["稌"],
  "zhùn zhǔn": ["稕"],
  "jī qí": ["稘", "綨", "觭"],
  "léng líng": ["稜"],
  "zuì zú sū": ["稡"],
  "xì qiè": ["稧", "郄"],
  "zhǒng zhòng": ["種"],
  "zōng zǒng": ["稯"],
  "xián jiān liàn": ["稴"],
  "zī jiū": ["稵"],
  "jī qǐ": ["稽"],
  ròng: ["穃"],
  "shān cǎn cēn": ["穇"],
  "mén méi": ["穈"],
  "jǐ jì": ["穖"],
  "xiāo rào": ["穘"],
  "zhuō bó": ["穛"],
  "tóng zhǒng zhòng": ["穜"],
  zuō: ["穝"],
  "biāo pāo": ["穮", "藨"],
  "zhuō jué": ["穱"],
  "cuán zàn": ["穳"],
  "kōng kòng kǒng": ["空"],
  "yū yǔ": ["穻"],
  zhǎi: ["窄", "鉙"],
  báo: ["窇", "雹"],
  "kū zhú": ["窋"],
  "jiào liáo liù": ["窌"],
  "wā guī": ["窐"],
  "tiǎo yáo": ["窕"],
  "xūn yìn": ["窨"],
  "yà yē": ["窫"],
  "tián diān yǎn": ["窴"],
  "chāo kē": ["窼"],
  "kuǎn cuàn": ["窽", "窾"],
  "chù qì": ["竐"],
  "qǔ kǒu": ["竘"],
  "jìng zhěn": ["竧"],
  "kǎn kàn": ["竷"],
  "zhú dǔ": ["竺"],
  "lè jīn": ["竻"],
  "zhuì ruì": ["笍"],
  "háng hàng": ["笐"],
  "cén jìn hán": ["笒"],
  "dā xiá nà": ["笚"],
  "zé zuó": ["笮"],
  "lóng lǒng": ["笼", "篭", "籠", "躘", "龓"],
  "zhù zhú": ["筑", "築"],
  "dá dā": ["答", "荅"],
  shāi: ["筛", "篩", "簁", "籭"],
  "yún jūn": ["筠"],
  "láng làng": ["筤", "郎", "阆"],
  "zhì zhǐ": ["筫"],
  o: ["筽"],
  "póu bù fú pú": ["箁"],
  "pái bēi": ["箄"],
  gè: ["箇", "虼", "鉻", "铬"],
  "tái chí": ["箈"],
  "guǎi dài": ["箉"],
  "zhào dào": ["箌"],
  "jīng qìng": ["箐"],
  "lín lǐn": ["箖"],
  "jùn qūn": ["箘"],
  "shī yí": ["箷", "釶"],
  "yuē yào chuò": ["箹"],
  "xiāo shuò qiào": ["箾"],
  "gōng gǎn lǒng": ["篢"],
  "páng péng": ["篣"],
  "zhuó huò": ["篧"],
  "jiǎn jiān": ["篯"],
  "dí zhú": ["篴"],
  "zān cēn cǎn": ["篸"],
  "zhuàn suǎn zuàn": ["篹"],
  "piǎo biāo": ["篻"],
  "guó guì": ["簂"],
  "cè jí": ["簎"],
  "mì miè": ["簚"],
  "shāi sī": ["簛"],
  "sǔn zhuàn": ["簨"],
  "gàn gǎn": ["簳"],
  "bò bǒ": ["簸"],
  "bó bù": ["簿"],
  shi: ["籂"],
  "zhēn jiān": ["籈"],
  "zhuàn zuǎn": ["籑"],
  "fān pān biān": ["籓"],
  "sǒu shǔ": ["籔"],
  zuǎn: ["籫", "繤", "纂", "纉", "纘", "缵"],
  nǚ: ["籹", "釹", "钕"],
  "shā chǎo": ["粆"],
  "kāng jīng": ["粇"],
  fěn: ["粉", "黺"],
  cū: ["粗", "觕", "麁", "麄", "麤"],
  "nián zhān": ["粘"],
  "cè sè": ["粣"],
  "zhōu yù": ["粥"],
  "shēn sǎn": ["糁"],
  "biān biǎn": ["糄", "萹"],
  miàn: ["糆", "面", "靣", "麪", "麫", "麵", "麺"],
  "hú hū hù": ["糊"],
  "gǔ gòu": ["糓"],
  "mí méi": ["糜"],
  "sǎn shēn": ["糝", "糣"],
  zāo: ["糟", "蹧", "遭", "醩"],
  "mì sī": ["糸"],
  "jiū jiǔ": ["糺"],
  "xì jì": ["系", "繫"],
  "zhēng zhěng": ["糽"],
  "chà chǎ": ["紁", "衩"],
  "yuē yāo": ["約", "约"],
  "hóng gōng": ["紅", "红"],
  "hé gē": ["紇", "纥"],
  "wén wèn": ["紋", "纹"],
  fóu: ["紑"],
  "jì jié jiè": ["紒"],
  "pī pí bǐ": ["紕", "纰"],
  "jīn jìn": ["紟"],
  "zhā zā": ["紥", "紮"],
  hā: ["紦"],
  "fū fù": ["紨"],
  "chōu chóu": ["紬"],
  "lèi léi lěi": ["累"],
  "bō bì": ["紴"],
  "tiǎn zhěn": ["紾"],
  "jiōng jiǒng": ["絅"],
  "jié jiē": ["結", "结", "节"],
  "guà kuā": ["絓"],
  "bǎi mò": ["絔"],
  "gēng huán": ["絙"],
  "jié xié": ["絜"],
  "quán shuān": ["絟"],
  "gǎi ǎi": ["絠"],
  "luò lào": ["絡", "络"],
  "bīng bēng pēng": ["絣"],
  "gěi jǐ": ["給", "给"],
  "tóng tōng dòng": ["絧"],
  "tiào diào dào": ["絩"],
  "lěi lèi léi": ["絫"],
  "gāi hài": ["絯"],
  "chī zhǐ": ["絺"],
  "wèn miǎn mán wàn": ["絻"],
  "huán huàn wàn": ["綄"],
  "qīn xiān": ["綅"],
  "tì tí": ["綈"],
  "yán xiàn": ["綖"],
  "zōng zèng zòng": ["綜"],
  "chēn lín": ["綝"],
  "zhǔn zhùn": ["綧"],
  "qiàn qīng zhēng": ["綪"],
  "qìng qǐ": ["綮"],
  "lún guān": ["綸", "纶"],
  "chuò chāo": ["綽", "绰"],
  "tián tǎn chān": ["緂"],
  "lǜ lù": ["緑", "绿"],
  "ruǎn ruàn": ["緛"],
  "jí qī": ["緝"],
  "zhòng chóng": ["緟", "重"],
  "miáo máo": ["緢"],
  "xiè yè": ["緤"],
  huǎn: ["緩", "缓", "㬊"],
  "gēng gèng": ["緪", "縆"],
  "tōu xū shū": ["緰"],
  "zōng zòng": ["緵", "繌"],
  "yùn gǔn": ["緷"],
  "guā wō": ["緺"],
  "yùn yūn wēn": ["緼", "縕"],
  "bāng bàng": ["縍"],
  "gǔ hú": ["縎", "鶻"],
  "cī cuò suǒ": ["縒"],
  "cuī shuāi": ["縗"],
  "róng rǒng ròng": ["縙"],
  "zài zēng": ["縡"],
  cài: ["縩", "菜", "蔡"],
  "féng fèng": ["縫"],
  "suō sù": ["縮", "缩"],
  "yǎn yǐn": ["縯", "酓"],
  "zòng zǒng": ["縱", "纵"],
  "zhuàn juàn": ["縳"],
  "mò mù": ["縸", "莫"],
  "piǎo piāo": ["縹", "缥"],
  "fán pó": ["繁"],
  "bēng bèng": ["繃"],
  "móu miù miào liǎo": ["繆"],
  "yáo yóu zhòu": ["繇"],
  "zēng zèng": ["繒", "缯"],
  "jú jué": ["繘"],
  "chuō chuò": ["繛"],
  "zūn zǔn": ["繜"],
  rào: ["繞", "绕", "遶"],
  "chǎn chán": ["繟"],
  "huì huí": ["繢", "缋", "藱"],
  "qiāo sāo zǎo": ["繰"],
  "jiǎo zhuó": ["繳", "缴"],
  "dàn tán chán": ["繵"],
  nǒng: ["繷"],
  "pú fú": ["纀"],
  "yào lì": ["纅"],
  "rǎng xiāng": ["纕"],
  "lí sǎ xǐ lǐ": ["纚"],
  "xiān qiàn": ["纤"],
  "jīng jìng": ["经"],
  "tí tì": ["绨"],
  "bēng běng bèng": ["绷"],
  "zōng zèng": ["综"],
  "jī qī": ["缉"],
  "wēn yùn yūn": ["缊"],
  "fèng féng": ["缝"],
  "shuāi cuī suī": ["缞"],
  "miù móu liáo miào mù": ["缪"],
  "qiāo sāo": ["缲"],
  fǒu: ["缶", "缹", "缻", "雬", "鴀"],
  "bà ba pí": ["罢", "罷"],
  "guà guǎi": ["罫"],
  "yáng xiáng": ["羊", "羏"],
  "měi gāo": ["羙"],
  "yì xī": ["羛"],
  "qiǎng qiān": ["羟"],
  "qiāng kòng": ["羫"],
  "qián xián yán": ["羬"],
  nóu: ["羺"],
  "hóng gòng": ["羾"],
  "pī bì pō": ["翍"],
  "qú yù": ["翑"],
  ké: ["翗"],
  "qiào qiáo": ["翘"],
  "zhái dí": ["翟"],
  "dào zhōu": ["翢"],
  "hóu qú": ["翵"],
  shuǎ: ["耍"],
  "ruǎn nuò": ["耎"],
  "ér nài": ["耏"],
  "zhuān duān": ["耑"],
  "pá bà": ["耙"],
  "chí sì": ["耛"],
  "qù chú": ["耝"],
  "lún lǔn": ["耣"],
  "jí jiè": ["耤"],
  "tāng tǎng": ["耥"],
  pǎng: ["耪", "覫"],
  "zhá zé": ["耫"],
  "yē yé": ["耶"],
  "yún yíng": ["耺"],
  "wà tuǐ zhuó": ["聉"],
  "ér nǜ": ["聏"],
  "tiē zhé": ["聑"],
  "dǐ zhì": ["聜"],
  qié: ["聺"],
  "nǐ jiàn": ["聻"],
  "lèi lē": ["肋"],
  cào: ["肏", "襙", "鄵", "鼜"],
  "bó dí": ["肑"],
  "xiào xiāo": ["肖"],
  "dù dǔ": ["肚"],
  chāi: ["肞", "釵", "钗"],
  "hán qín hàn": ["肣"],
  "pàng pán pàn": ["肨", "胖"],
  "zhūn chún": ["肫"],
  āng: ["肮", "骯"],
  "yù yō": ["育"],
  "pí bǐ bì": ["肶"],
  "fèi bì": ["胇"],
  "bèi bēi": ["背"],
  "fèi zǐ": ["胏"],
  "píng pēng": ["胓", "苹"],
  "fū fú zhǒu": ["胕"],
  "shèng shēng": ["胜"],
  kuà: ["胯", "跨", "骻"],
  "gǎi hǎi": ["胲"],
  "gē gé gā": ["胳"],
  "néng nài": ["能"],
  "guī kuì": ["胿"],
  "mài mò": ["脉"],
  "zāng zàng": ["脏"],
  "jiǎo jué": ["脚", "角"],
  cuǒ: ["脞"],
  "de te": ["脦"],
  "zuī juān": ["脧"],
  něi: ["脮", "腇", "餒", "馁", "鮾", "鯘"],
  "pú fǔ": ["脯"],
  niào: ["脲"],
  shuí: ["脽"],
  guò: ["腂", "過", "鐹"],
  "là xī": ["腊"],
  "yān ā": ["腌"],
  "gāo gào": ["膏"],
  "lù biāo": ["膔"],
  chuái: ["膗"],
  "zhuān chuán chún zhuǎn": ["膞"],
  chuài: ["膪", "踹"],
  "fán pán": ["膰"],
  "wǔ hū": ["膴"],
  "shān dàn": ["膻"],
  tún: ["臀", "臋", "蛌", "豘", "豚", "軘", "霕", "飩", "饨", "魨", "鲀", "黗"],
  "bì bei": ["臂"],
  "là gé": ["臈"],
  "sào sāo": ["臊"],
  nào: ["臑", "閙", "闹", "鬧"],
  "ní luán": ["臡"],
  "qiān xián": ["臤"],
  "guàng jiǒng": ["臦"],
  "guǎng jiǒng": ["臩"],
  "chòu xiù": ["臭"],
  "mián biān": ["臱"],
  "dié zhí": ["臷"],
  "zhī jìn": ["臸"],
  "shè shě": ["舍"],
  pù: ["舖", "舗"],
  "bān bō pán": ["般"],
  kuā: ["舿"],
  "gèn gěn": ["艮"],
  "sè shǎi": ["色"],
  "fú bó": ["艴"],
  "jiāo qiú": ["艽"],
  "chāi chā": ["芆"],
  "sháo què": ["芍"],
  "hù xià": ["芐"],
  "zì zǐ": ["芓"],
  "huì hū": ["芔"],
  "tún chūn": ["芚"],
  "jiè gài": ["芥"],
  "xù zhù": ["芧"],
  "yuán yán": ["芫"],
  "xīn xìn": ["芯"],
  "lún huā": ["芲"],
  "wù hū": ["芴"],
  "gōu gǒu": ["芶"],
  "mào máo": ["芼"],
  "fèi fú": ["芾"],
  "chán yín": ["苂"],
  qiē: ["苆"],
  "sū sù": ["苏"],
  "tiáo sháo": ["苕"],
  "lì jī": ["苙"],
  "kē hē": ["苛"],
  "jù qǔ": ["苣"],
  "ruò rě": ["若"],
  "zhù níng": ["苧"],
  "pā bó": ["苩"],
  xiú: ["苬"],
  "zhǎ zuó": ["苲"],
  "jū chá": ["苴"],
  nié: ["苶"],
  "shēng ruí": ["苼"],
  "qié jiā": ["茄"],
  "zǐ cí": ["茈"],
  "qiàn xī": ["茜"],
  chǎi: ["茝"],
  "fá pèi": ["茷"],
  ráo: ["荛", "蕘", "襓", "饒", "饶"],
  "yíng xíng": ["荥"],
  "qián xún": ["荨", "蕁"],
  "yìn yīn": ["荫"],
  "hé hè": ["荷"],
  "shā suō": ["莎"],
  "péng fēng": ["莑"],
  "shēn xīn": ["莘"],
  "wǎn guān guǎn": ["莞"],
  "yóu sù": ["莤"],
  "shāo xiāo": ["莦", "蛸"],
  "làng liáng": ["莨"],
  "piǎo fú": ["莩"],
  "wèn wǎn miǎn": ["莬"],
  "shì shí": ["莳", "蒔"],
  "tù tú": ["莵"],
  "xiān liǎn": ["莶", "薟"],
  "wǎn yù": ["菀"],
  "zōu chù": ["菆"],
  "lù lǜ": ["菉"],
  "jūn jùn": ["菌"],
  "niè rěn": ["菍"],
  "zī zì zāi": ["菑"],
  "tú tù": ["菟"],
  "jiē shà": ["菨"],
  "qiáo zhǎo": ["菬"],
  "tái zhī chí": ["菭"],
  "fēi fěi": ["菲", "蜚"],
  "qín qīn jīn": ["菳"],
  "zū jù": ["菹", "蒩"],
  "lǐn má": ["菻"],
  "tián tiàn": ["菾"],
  tiē: ["萜", "貼", "贴"],
  "luò là lào luō": ["落"],
  "zhù zhuó zhe": ["著"],
  "shèn rèn": ["葚"],
  "gě gé": ["葛"],
  "jùn suǒ": ["葰"],
  "kuì kuài": ["蒉"],
  "rú ná": ["蒘"],
  "méng mēng měng": ["蒙"],
  "yuán huán": ["蒝"],
  "xú shú": ["蒣"],
  "xí xì": ["蒵"],
  "mì míng": ["蓂"],
  "sōu sǒu": ["蓃"],
  "gài gě hé hài": ["蓋"],
  "yǎo zhuó": ["蓔"],
  "diào tiáo dí": ["蓧"],
  "xū qiū fū": ["蓲"],
  "zí jú": ["蓻"],
  "liǎo lù": ["蓼"],
  xu: ["蓿"],
  "hàn hǎn": ["蔊"],
  "màn wàn mán": ["蔓"],
  "pó bò": ["蔢"],
  "fān fán bō": ["蕃"],
  "hóng hòng": ["蕻"],
  "yù ào": ["薁", "隩"],
  "xí xiào": ["薂"],
  "báo bó bò": ["薄"],
  "cí zī": ["薋"],
  "wàn luàn": ["薍"],
  "kǎo hāo": ["薧"],
  "yuǎn wěi": ["薳"],
  "zhòu chóu": ["薵"],
  "wō mái": ["薶"],
  "xiāo hào": ["藃"],
  "yù xù xū": ["藇"],
  "jiè jí": ["藉"],
  "diào zhuó": ["藋"],
  "cáng zàng": ["藏"],
  lǎ: ["藞"],
  "chú zhū": ["藸"],
  "pín píng": ["蘋"],
  "gān hán": ["虷"],
  "hóng jiàng": ["虹"],
  "huī huǐ": ["虺"],
  "xiā há": ["虾"],
  "mǎ mà mā": ["蚂"],
  "fāng bàng": ["蚄"],
  "bàng bèng": ["蚌"],
  "jué quē": ["蚗"],
  "qín qián": ["蚙"],
  "gōng zhōng": ["蚣"],
  "fǔ fù": ["蚥"],
  "dài dé": ["蚮"],
  "gǒu qú xù": ["蚼"],
  "bǒ pí": ["蚾"],
  "shé yí": ["蛇"],
  tiě: ["蛈", "鉄", "銕", "鐡", "鐵", "铁", "驖"],
  "gé luò": ["蛒"],
  "máng bàng": ["蛖"],
  "yì xǔ": ["蛡"],
  "há gé": ["蛤"],
  "qiè ní": ["蛪"],
  "é yǐ": ["蛾"],
  "zhē zhé": ["蜇"],
  "là zhà": ["蜡"],
  suò: ["蜶", "逤"],
  "yóu qiú": ["蝤"],
  "xiā hā": ["蝦"],
  "xī qī": ["螇"],
  "bī pí": ["螕"],
  "nài něng": ["螚"],
  "hé xiá": ["螛"],
  "guì huǐ": ["螝"],
  "mǎ mā mà": ["螞"],
  "shì zhē": ["螫"],
  "zhì dié": ["螲"],
  "jiàn chán": ["螹"],
  "ma má mò": ["蟆"],
  "mǎng měng": ["蟒"],
  "biē bié": ["蟞"],
  "bēn fèi": ["蟦"],
  "láo liáo": ["蟧"],
  "yín xún": ["蟫"],
  "lí lǐ": ["蠡"],
  "xuè xiě": ["血"],
  "xíng háng hàng héng": ["行"],
  "shuāi cuī": ["衰"],
  "tuó tuō": ["袉"],
  "lǐng líng": ["袊"],
  "bào páo pào": ["袌"],
  "jù jiē": ["袓"],
  "hè kè": ["袔"],
  "yí yì": ["袘", "貤"],
  "nà jué": ["袦"],
  "bèi pī": ["被"],
  "chǐ nuǒ": ["袲"],
  "chǐ qǐ duǒ nuǒ": ["袳"],
  "jiá qiā jié": ["袷"],
  "bó mò": ["袹"],
  "guī guà": ["袿"],
  "liè liě": ["裂"],
  "chéng chěng": ["裎"],
  "jiē gé": ["裓"],
  "dāo chóu": ["裯"],
  "shang cháng": ["裳"],
  "yuān gǔn": ["裷"],
  "yǎn ān": ["裺"],
  "tì xī": ["裼"],
  "fù fú": ["褔"],
  "chǔ zhǔ": ["褚"],
  "tuì tùn": ["褪"],
  lǎi: ["襰"],
  "yào yāo": ["要"],
  "qín tán": ["覃"],
  "jiàn xiàn": ["見", "见"],
  piǎn: ["覑", "諞", "谝", "貵", "𡎚"],
  "piē miè": ["覕"],
  "yíng yǐng": ["覮"],
  "qù qū": ["覰", "覷", "觑"],
  "jiàn biǎn": ["覵"],
  "luó luǎn": ["覶"],
  "zī zuǐ": ["觜"],
  "huà xiè": ["觟"],
  "jiě jiè xiè": ["解", "觧"],
  "xué hù": ["觷"],
  "lì lù": ["觻"],
  tǎo: ["討", "讨"],
  zhùn: ["訰"],
  "zī zǐ": ["訾"],
  "yí dài": ["詒", "诒"],
  xiòng: ["詗", "诇"],
  "diào tiǎo": ["誂"],
  "yí chǐ chì": ["誃"],
  "lǎng làng": ["誏"],
  "ēi éi ěi èi xī": ["誒", "诶"],
  shuà: ["誜"],
  "yǔ yù": ["語", "语", "雨"],
  "shuō shuì yuè": ["說", "说"],
  "shuí shéi": ["誰", "谁"],
  "qū juè": ["誳"],
  "chī lài": ["誺"],
  "nì ná": ["誽"],
  "diào tiáo": ["調"],
  "pǐ bēi": ["諀"],
  "jì jī": ["諅"],
  "zé zuò zhǎ cuò": ["諎"],
  "chù jí": ["諔"],
  "háo xià": ["諕"],
  "lùn lún": ["論", "论"],
  "shì dì": ["諟"],
  "huà guā": ["諣"],
  "xǐ shāi āi": ["諰"],
  "nán nàn": ["諵", "難"],
  miù: ["謬", "谬"],
  zèn: ["譖", "谮"],
  "shí zhì": ["識", "识"],
  "juàn xuān": ["讂"],
  "yí tuī": ["讉"],
  zhán: ["讝"],
  "xǔ hǔ": ["许"],
  "xiáng yáng": ["详"],
  "tiáo diào zhōu": ["调"],
  "chén shèn": ["谌"],
  "mí mèi": ["谜"],
  "màn mán": ["谩"],
  "gǔ yù": ["谷"],
  "huō huò huá": ["豁"],
  "zhì zhài": ["豸"],
  "huān huán": ["貆"],
  "kěn kūn": ["貇"],
  "mò hé": ["貈"],
  "mò hé háo": ["貉"],
  "jù lóu": ["貗"],
  "zé zhài": ["責", "责"],
  "dài tè": ["貸"],
  "bì bēn": ["賁"],
  "jiǎ gǔ jià": ["賈"],
  "xiōng mín": ["賯"],
  càng: ["賶"],
  "zhuàn zuàn": ["賺", "赚"],
  "wàn zhuàn": ["贃"],
  "gàn gòng zhuàng": ["贛"],
  "yuán yùn": ["贠"],
  "bēn bì": ["贲"],
  "jiǎ gǔ": ["贾"],
  zǒu: ["走", "赱", "鯐"],
  "dié tú": ["趃"],
  "jū qiè": ["趄"],
  "qū cù": ["趋", "趨"],
  "jí jié": ["趌"],
  "guā huó": ["趏"],
  "què qì jí": ["趞"],
  "tàng tāng": ["趟"],
  "chuō zhuó": ["趠"],
  "qù cù": ["趣"],
  "yuè tì": ["趯"],
  "bō bào": ["趵"],
  "kuà wù": ["趶"],
  "guì jué": ["趹"],
  "fāng fàng páng": ["趽"],
  "páo bà": ["跁"],
  "qí qǐ": ["跂"],
  "jiàn chén": ["跈"],
  "pǎo páo": ["跑"],
  "diǎn diē tiē": ["跕"],
  "jū jù qiè": ["跙"],
  bǒ: ["跛"],
  "luò lì": ["跞"],
  "dài duò duō chí": ["跢"],
  zhuǎi: ["跩"],
  "bèng pián": ["跰"],
  "tiào táo": ["跳"],
  "shū chōu": ["跾"],
  "liàng liáng": ["踉"],
  "tà tā": ["踏"],
  chǎ: ["蹅", "鑔", "镲"],
  "dí zhí": ["蹢"],
  "dēng dèng": ["蹬", "鐙", "镫"],
  cèng: ["蹭"],
  "dūn cún": ["蹲"],
  "juě jué": ["蹶"],
  liāo: ["蹽"],
  "xiè sǎ": ["躠"],
  tǐ: ["躰", "軆", "骵"],
  "yà zhá gá": ["轧", "軋"],
  "xìn xiàn": ["軐"],
  "fàn guǐ": ["軓"],
  "zhuàn zhuǎn": ["転"],
  "zhóu zhòu": ["軸", "轴"],
  bú: ["轐", "醭", "鳪"],
  "zhuǎn zhuàn zhuǎi": ["转"],
  "zǎi zài": ["载"],
  "niǎn zhǎn": ["辗"],
  "biān bian": ["边"],
  "dào biān": ["辺"],
  "yǐ yí": ["迆", "迤", "迱"],
  "guò guo guō": ["过"],
  "wàng kuāng": ["迋"],
  "hái huán": ["还"],
  "zhè zhèi": ["这"],
  "yuǎn yuàn": ["远"],
  "zhì lì": ["迣"],
  "zhù wǎng": ["迬"],
  "zhuī duī": ["追"],
  "shì kuò": ["适"],
  tòu: ["透"],
  "tōng tòng": ["通"],
  guàng: ["逛"],
  "dǎi dài": ["逮"],
  "suì suí": ["遂"],
  "tí dì": ["遆"],
  "yí wèi": ["遗"],
  "shì dí zhé": ["適"],
  cà: ["遪"],
  "huán hái": ["還"],
  "lí chí": ["邌"],
  "kàng háng": ["邟"],
  "nà nèi nā": ["那"],
  "xié yá yé yú xú": ["邪"],
  "gāi hái": ["郂"],
  "huán xún": ["郇"],
  "chī xī": ["郗"],
  hǎo: ["郝"],
  "lì zhí": ["郦"],
  "xiáo ǎo": ["郩"],
  "dōu dū": ["都"],
  liǎo: ["曢", "鄝", "镽"],
  "zàn cuán cuó": ["酂", "酇"],
  "dīng dǐng": ["酊"],
  "cù zuò": ["酢"],
  "fā pō": ["酦"],
  "shāi shī": ["酾"],
  niàng: ["酿", "醸"],
  "qiú chōu": ["醔"],
  "pō fā": ["醗", "醱"],
  "chǎn chěn": ["醦"],
  "yàn liǎn xiān": ["醶"],
  "niàng niáng": ["釀"],
  "lǐ li": ["里"],
  "lí xǐ xī": ["釐"],
  "liǎo liào": ["釕"],
  "dīng dìng": ["釘", "钉"],
  "qiǎo jiǎo": ["釥"],
  "yú huá": ["釪"],
  "huá wū": ["釫"],
  "rì rèn jiàn": ["釰", "釼"],
  "dì dài": ["釱"],
  "pī zhāo": ["釽"],
  "yá yé": ["釾"],
  "bǎ pá": ["鈀", "钯"],
  "tā tuó": ["鉈", "铊"],
  běi: ["鉳"],
  "bǐng píng": ["鉼"],
  "hā kē": ["鉿", "铪"],
  chòng: ["銃", "铳"],
  "xiǎng jiōng": ["銄"],
  "yù sì": ["銉"],
  "xù huì": ["銊"],
  "rén rěn": ["銋"],
  "shàn shuò": ["銏"],
  "chì lì": ["銐"],
  "xiǎn xǐ": ["銑", "铣"],
  "hóu xiàng": ["銗"],
  "diào tiáo yáo": ["銚"],
  "xiān kuò tiǎn guā": ["銛", "銽", "铦"],
  "zhé niè": ["銸"],
  "zhōng yōng": ["銿"],
  "tōu tù dòu": ["鋀"],
  "méi méng": ["鋂"],
  "wàn jiǎn": ["鋄", "鎫"],
  "tǐng dìng": ["鋌", "铤"],
  "juān jiān cuān": ["鋑"],
  "sī tuó": ["鋖"],
  "juān xuān juàn": ["鋗"],
  "wú huá wū": ["鋘"],
  "zhuó chuò": ["鋜"],
  "xíng xìng jīng": ["鋞"],
  "jū jú": ["鋦", "锔"],
  "zuì niè": ["鋷"],
  "yuān yuǎn wǎn wān": ["鋺"],
  "gāng gàng": ["鋼", "钢"],
  zhuī: ["錐", "锥", "騅", "骓", "鵻"],
  ā: ["錒", "锕"],
  "cuō chā": ["鎈"],
  "suǒ sè": ["鎍"],
  "yáo zú": ["鎐"],
  "yè tà gé": ["鎑"],
  "qiāng chēng": ["鎗"],
  "gé lì": ["鎘", "镉", "鬲"],
  "bī pī bì": ["鎞"],
  "gǎo hào": ["鎬"],
  "zú chuò": ["鏃"],
  "xiū xiù": ["鏅"],
  "shòu sōu": ["鏉"],
  "dí dī": ["鏑", "镝"],
  "qiāo sǎn càn": ["鏒"],
  "lù áo": ["鏕"],
  "tāng táng": ["鏜"],
  "jiàn zàn": ["鏩"],
  "huì suì ruì": ["鏸"],
  "qiǎng qiāng": ["鏹", "镪"],
  "sǎn xiàn sà": ["鏾"],
  "jiǎn jiàn": ["鐧", "锏"],
  "dāng chēng": ["鐺", "铛"],
  "zuān zuàn": ["鑽"],
  "sà xì": ["钑"],
  "yào yuè": ["钥"],
  "tǒu dǒu": ["钭"],
  "zuàn zuān": ["钻"],
  "qiān yán": ["铅"],
  "pí pī": ["铍"],
  "yáo diào tiáo": ["铫"],
  "tāng tàng": ["铴"],
  "pù pū": ["铺"],
  "tán xiān": ["锬"],
  "liù liú": ["镏"],
  "hào gǎo": ["镐"],
  "táng tāng": ["镗"],
  "tán chán xín": ["镡"],
  "huò shǎn": ["閄"],
  "hàn bì": ["閈", "闬"],
  "kāng kàng": ["閌", "闶"],
  "xián jiàn jiān jiǎn": ["閒"],
  "xiā xiǎ": ["閕"],
  "xiǎ kě": ["閜"],
  "biàn guān": ["閞"],
  "hé gé": ["閤", "颌"],
  "hòng xiàng": ["閧"],
  "sē xī": ["閪"],
  "tíng tǐng": ["閮"],
  "è yān": ["閼", "阏"],
  "hòng juǎn xiàng": ["闂"],
  "bǎn pàn": ["闆"],
  "dū shé": ["闍", "阇"],
  "què quē": ["闕"],
  "tāng táng chāng": ["闛"],
  "kàn hǎn": ["闞", "阚"],
  "xì sè tà": ["闟"],
  "mēn mèn": ["闷"],
  "quē què": ["阙"],
  "yán diàn": ["阽"],
  "ā ē": ["阿"],
  "bēi pō pí": ["陂"],
  "yàn yǎn": ["隁"],
  "yú yáo shù": ["隃"],
  "lóng lōng": ["隆"],
  "duì zhuì": ["隊"],
  "suí duò": ["隋"],
  "gāi qí ái": ["隑"],
  "huī duò": ["隓", "隳"],
  "wěi kuí": ["隗"],
  "lì dài": ["隸"],
  "zhuī cuī wéi": ["隹"],
  "hè hú": ["隺", "鶮"],
  "jùn juàn": ["隽", "雋"],
  "nán nàn nuó": ["难"],
  "què qiāo qiǎo": ["雀"],
  "guàn huán": ["雚"],
  "guī xī": ["雟"],
  "sè xí": ["雭"],
  án: ["雸"],
  "wù méng": ["雺"],
  tèng: ["霯"],
  "lù lòu": ["露"],
  mái: ["霾"],
  "jìng liàng": ["靚"],
  "gé jí": ["革"],
  bǎ: ["靶"],
  "yāng yàng": ["鞅"],
  "gé tà sǎ": ["鞈"],
  "biān yìng": ["鞕"],
  "qiào shāo": ["鞘"],
  "juān xuān": ["鞙"],
  "shàng zhǎng": ["鞝"],
  "pí bǐng bì bēi": ["鞞"],
  la: ["鞡"],
  "xiè dié": ["鞢"],
  ēng: ["鞥"],
  "móu mù": ["鞪"],
  "bì bǐng": ["鞸"],
  "mèi wà": ["韎"],
  rǒu: ["韖"],
  "shè xiè": ["韘"],
  "yùn wēn": ["韫"],
  "dùn dú": ["頓", "顿"],
  duǐ: ["頧"],
  luō: ["頱"],
  "bīn pín": ["頻"],
  yóng: ["顒", "颙", "鰫"],
  mān: ["顢", "颟"],
  "jǐng gěng": ["颈"],
  "jié xié jiá": ["颉"],
  "kē ké": ["颏"],
  "pín bīn": ["频"],
  "chàn zhàn": ["颤"],
  "fēng fěng": ["風", "风"],
  "biāo diū": ["颩"],
  "bá fú": ["颰"],
  "sāo sōu": ["颾"],
  "liù liáo": ["飂"],
  "shí sì yì": ["食"],
  "yǎng juàn": ["飬"],
  "zhù tǒu": ["飳"],
  "yí sì": ["飴"],
  "zuò zé zhā": ["飵"],
  tiè: ["飻", "餮"],
  "xiǎng náng": ["饟"],
  "táng xíng": ["饧"],
  "gē le": ["饹"],
  "chā zha": ["馇"],
  "náng nǎng": ["馕"],
  "yūn wò": ["馧"],
  "zhī shì": ["馶"],
  "xìn jìn": ["馸"],
  "kuài jué": ["駃"],
  zǎng: ["駔", "驵"],
  "tái dài": ["駘"],
  "xún xuān": ["駨"],
  "liáng láng": ["駺"],
  piàn: ["騗", "騙", "骗", "魸"],
  "dài tái": ["骀"],
  "sāo sǎo": ["骚"],
  "gǔ gū": ["骨"],
  "bèi mó": ["骳"],
  "xiāo qiāo": ["骹"],
  "bǎng pǎng": ["髈"],
  "bó jué": ["髉"],
  "bì pǒ": ["髲"],
  "máo méng": ["髳"],
  "kuò yuè": ["髺"],
  "bā bà": ["魞", "鲃"],
  "jì cǐ": ["鮆"],
  "bó bà": ["鮊"],
  "zhǎ zhà": ["鮓", "鲊"],
  "chóu dài": ["鮘"],
  "luò gé": ["鮥"],
  "guī xié wā kuí": ["鮭"],
  "xiān xiǎn": ["鮮", "鲜"],
  "pū bū": ["鯆"],
  "yì sī": ["鯣"],
  "bà bó": ["鲌"],
  "guī xié": ["鲑"],
  "sāi xǐ": ["鳃"],
  "niǎo diǎo": ["鳥"],
  "diāo zhāo": ["鳭"],
  "gān hàn yàn": ["鳱"],
  "fū guī": ["鳺"],
  "jiān qiān zhān": ["鳽"],
  "hé jiè": ["鶡"],
  "piān biǎn": ["鶣"],
  "chuàn zhì": ["鶨"],
  "cāng qiāng": ["鶬"],
  "sǔn xùn": ["鶽"],
  "biāo páo": ["麃"],
  "zhù cū": ["麆"],
  "jūn qún": ["麇", "麕"],
  chi: ["麶"],
  "mó me": ["麼"],
  "mó me ma": ["麽"],
  "mí mǒ": ["麿"],
  "dàn shèn": ["黮"],
  "zhěn yān": ["黰"],
  "dǎn zhǎn": ["黵"],
  "miǎn mǐn měng": ["黾"],
  hōu: ["齁"],
  nàng: ["齉"],
  "qí jì zī zhāi": ["齐"],
  "yín kěn yǎn": ["龂"],
  "yín kěn": ["龈"],
  "gōng wò": ["龏"],
  "guī jūn qiū": ["龜", "龟"],
  "kuí wā": ["䖯"],
  lōu: ["䁖"],
  "ōu qū": ["𫭟"],
  "lóu lǘ": ["𦝼"],
  "gǎ gā gá": ["嘎"],
  "wā guà": ["坬"],
  "zhǐ dǐ": ["茋"],
  "gǒng hóng": ["硔"],
  "yáo xiào": ["滧"]
};
const DICT1 = new FastDictFactory();
Object.keys(map).forEach((key) => {
  const chars = map[key];
  for (let char of chars) {
    DICT1.set(char, key);
  }
});
const InitialList = [
  "zh",
  "ch",
  "sh",
  "z",
  "c",
  "s",
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "g",
  "k",
  "h",
  "j",
  "q",
  "x",
  "r",
  "y",
  "w",
  ""
];
const SpecialInitialList = ["j", "q", "x"];
const SpecialFinalList = [
  "uān",
  "uán",
  "uǎn",
  "uàn",
  "uan",
  "uē",
  "ué",
  "uě",
  "uè",
  "ue",
  "ūn",
  "ún",
  "ǔn",
  "ùn",
  "un",
  "ū",
  "ú",
  "ǔ",
  "ù",
  "u"
];
const SpecialFinalMap = {
  uān: "üān",
  uán: "üán",
  uǎn: "üǎn",
  uàn: "üàn",
  uan: "üan",
  uē: "üē",
  ué: "üé",
  uě: "üě",
  uè: "üè",
  ue: "üe",
  ūn: "ǖn",
  ún: "ǘn",
  ǔn: "ǚn",
  ùn: "ǜn",
  un: "ün",
  ū: "ǖ",
  ú: "ǘ",
  ǔ: "ǚ",
  ù: "ǜ",
  u: "ü"
};
const doubleFinalList = [
  "ia",
  "ian",
  "iang",
  "iao",
  "ie",
  "iu",
  "iong",
  "ua",
  "uai",
  "uan",
  "uang",
  "ue",
  "ui",
  "uo",
  "üan",
  "üe",
  "van",
  "ve"
];
const Numbers = {
  一: "yì",
  二: "èr",
  三: "sān",
  四: "sì",
  五: "wǔ",
  六: "liù",
  七: "qī",
  八: "bā",
  九: "jiǔ",
  十: "shí",
  百: "bǎi",
  千: "qiān",
  万: "wàn",
  亿: "yì",
  单: "dān",
  两: "liǎng",
  双: "shuāng",
  多: "duō",
  几: "jǐ",
  十一: "shí yī",
  零一: "líng yī",
  第一: "dì yī",
  一十: "yī shí",
  一十一: "yī shí yī"
};
const NumberWordMap = {
  重: "chóng",
  行: "háng",
  斗: "dǒu",
  更: "gēng"
};
function genNumberDict() {
  const dict = {
    零一: "líng yī",
    "〇一": "líng yī",
    十一: "shí yī",
    一十: "yī shí",
    第一: "dì yī",
    一十一: "yī shí yī"
  };
  for (let number in Numbers) {
    for (let key in NumberWordMap) {
      const word = `${number}${key}`;
      const pinyin2 = `${Numbers[number]} ${NumberWordMap[key]}`;
      dict[word] = pinyin2;
    }
  }
  return dict;
}
const NumberDict = genNumberDict();
const PatternNumberDict = Object.keys(NumberDict).map((key) => ({
  zh: key,
  pinyin: NumberDict[key],
  probability: 1e-12,
  length: stringLength(key),
  priority: Priority.Normal,
  dict: Symbol("rule")
}));
const toneSandhiMap = {
  // 说不说，说一说，叠词之间发音为轻声
  不: {
    bú: [4]
    // "不" 后面跟 4 声时，变调为 2 声
  },
  一: {
    yí: [4],
    yì: [1, 2, 3]
  }
};
const toneSandhiIgnoreSuffix = {
  不: ["的", "而", "之", "后", "也", "还", "地"],
  一: ["的", "而", "之", "后", "也", "还", "是"]
};
const toneSandhiList = Object.keys(toneSandhiMap);
function processToneSandhi(cur, pre, next) {
  if (toneSandhiList.indexOf(cur) === -1) {
    return getSingleWordPinyin(cur);
  }
  if (pre === next && pre && getSingleWordPinyin(pre) !== pre) {
    return getPinyinWithoutTone(getSingleWordPinyin(cur));
  }
  if (next && !toneSandhiIgnoreSuffix[cur].includes(next)) {
    const nextPinyin = getSingleWordPinyin(next);
    if (nextPinyin !== next) {
      const nextTone = getNumOfTone(nextPinyin);
      const pinyinMap = toneSandhiMap[cur];
      for (let pinyin2 in pinyinMap) {
        const tones = pinyinMap[pinyin2];
        if (tones.indexOf(Number(nextTone)) !== -1) {
          return pinyin2;
        }
      }
    }
  }
}
function processToneSandhiLiao(cur, pre) {
  if (cur === "了" && (!pre || !DICT1.get(pre))) {
    return "liǎo";
  }
}
function processReduplicationChar(cur, pre) {
  if (cur === "々") {
    if (!pre || !DICT1.get(pre)) {
      return "tóng";
    } else {
      return DICT1.get(pre).split(" ")[0];
    }
  }
}
function processSepecialPinyin(cur, pre, next) {
  return processReduplicationChar(cur, pre) || processToneSandhiLiao(cur, pre) || processToneSandhi(cur, pre, next) || getSingleWordPinyin(cur);
}
const Surnames = {
  南宫: "nán gōng",
  第五: "dì wǔ",
  万俟: "mò qí",
  司马: "sī mǎ",
  上官: "shàng guān",
  欧阳: "ōu yáng",
  夏侯: "xià hóu",
  诸葛: "zhū gě",
  闻人: "wén rén",
  东方: "dōng fāng",
  赫连: "hè lián",
  皇甫: "huáng fǔ",
  尉迟: "yù chí",
  公羊: "gōng yáng",
  澹台: "tán tái",
  公冶: "gōng yě",
  宗政: "zōng zhèng",
  濮阳: "pú yáng",
  淳于: "chún yú",
  太叔: "tài shū",
  申屠: "shēn tú",
  公孙: "gōng sūn",
  仲孙: "zhòng sūn",
  轩辕: "xuān yuán",
  令狐: "líng hú",
  钟离: "zhōng lí",
  宇文: "yǔ wén",
  长孙: "zhǎng sūn",
  慕容: "mù róng",
  鲜于: "xiān yú",
  闾丘: "lǘ qiū",
  司徒: "sī tú",
  司空: "sī kōng",
  亓官: "qí guān",
  司寇: "sī kòu",
  仉督: "zhǎng dū",
  子车: "zǐ jū",
  颛孙: "zhuān sūn",
  端木: "duān mù",
  巫马: "wū mǎ",
  公西: "gōng xī",
  漆雕: "qī diāo",
  乐正: "yuè zhèng",
  壤驷: "rǎng sì",
  公良: "gōng liáng",
  拓跋: "tuò bá",
  夹谷: "jiá gǔ",
  宰父: "zǎi fǔ",
  榖梁: "gǔ liáng",
  段干: "duàn gān",
  百里: "bǎi lǐ",
  东郭: "dōng guō",
  南门: "nán mén",
  呼延: "hū yán",
  羊舌: "yáng shé",
  梁丘: "liáng qiū",
  左丘: "zuǒ qiū",
  东门: "dōng mén",
  西门: "xī mén",
  句龙: "gōu lóng",
  毌丘: "guàn qiū",
  赵: "zhào",
  钱: "qián",
  孙: "sūn",
  李: "lǐ",
  周: "zhōu",
  吴: "wú",
  郑: "zhèng",
  王: "wáng",
  冯: "féng",
  陈: "chén",
  褚: "chǔ",
  卫: "wèi",
  蒋: "jiǎng",
  沈: "shěn",
  韩: "hán",
  杨: "yáng",
  朱: "zhū",
  秦: "qín",
  尤: "yóu",
  许: "xǔ",
  何: "hé",
  吕: "lǚ",
  施: "shī",
  张: "zhāng",
  孔: "kǒng",
  曹: "cáo",
  严: "yán",
  华: "huà",
  金: "jīn",
  魏: "wèi",
  陶: "táo",
  姜: "jiāng",
  戚: "qī",
  谢: "xiè",
  邹: "zōu",
  喻: "yù",
  柏: "bǎi",
  水: "shuǐ",
  窦: "dòu",
  章: "zhāng",
  云: "yún",
  苏: "sū",
  潘: "pān",
  葛: "gě",
  奚: "xī",
  范: "fàn",
  彭: "péng",
  郎: "láng",
  鲁: "lǔ",
  韦: "wéi",
  昌: "chāng",
  马: "mǎ",
  苗: "miáo",
  凤: "fèng",
  花: "huā",
  方: "fāng",
  俞: "yú",
  任: "rén",
  袁: "yuán",
  柳: "liǔ",
  酆: "fēng",
  鲍: "bào",
  史: "shǐ",
  唐: "táng",
  费: "fèi",
  廉: "lián",
  岑: "cén",
  薛: "xuē",
  雷: "léi",
  贺: "hè",
  倪: "ní",
  汤: "tāng",
  滕: "téng",
  殷: "yīn",
  罗: "luó",
  毕: "bì",
  郝: "hǎo",
  邬: "wū",
  安: "ān",
  常: "cháng",
  乐: "yuè",
  于: "yú",
  时: "shí",
  傅: "fù",
  皮: "pí",
  卞: "biàn",
  齐: "qí",
  康: "kāng",
  伍: "wǔ",
  余: "yú",
  元: "yuán",
  卜: "bǔ",
  顾: "gù",
  孟: "mèng",
  平: "píng",
  黄: "huáng",
  和: "hé",
  穆: "mù",
  萧: "xiāo",
  尹: "yǐn",
  姚: "yáo",
  邵: "shào",
  湛: "zhàn",
  汪: "wāng",
  祁: "qí",
  毛: "máo",
  禹: "yǔ",
  狄: "dí",
  米: "mǐ",
  贝: "bèi",
  明: "míng",
  臧: "zāng",
  计: "jì",
  伏: "fú",
  成: "chéng",
  戴: "dài",
  谈: "tán",
  宋: "sòng",
  茅: "máo",
  庞: "páng",
  熊: "xióng",
  纪: "jǐ",
  舒: "shū",
  屈: "qū",
  项: "xiàng",
  祝: "zhù",
  董: "dǒng",
  梁: "liáng",
  杜: "dù",
  阮: "ruǎn",
  蓝: "lán",
  闵: "mǐn",
  席: "xí",
  季: "jì",
  麻: "má",
  强: "qiáng",
  贾: "jiǎ",
  路: "lù",
  娄: "lóu",
  危: "wēi",
  江: "jiāng",
  童: "tóng",
  颜: "yán",
  郭: "guō",
  梅: "méi",
  盛: "shèng",
  林: "lín",
  刁: "diāo",
  钟: "zhōng",
  徐: "xú",
  邱: "qiū",
  骆: "luò",
  高: "gāo",
  夏: "xià",
  蔡: "cài",
  田: "tián",
  樊: "fán",
  胡: "hú",
  凌: "líng",
  霍: "huò",
  虞: "yú",
  万: "wàn",
  支: "zhī",
  柯: "kē",
  昝: "zǎn",
  管: "guǎn",
  卢: "lú",
  莫: "mò",
  经: "jīng",
  房: "fáng",
  裘: "qiú",
  缪: "miào",
  干: "gān",
  解: "xiè",
  应: "yīng",
  宗: "zōng",
  丁: "dīng",
  宣: "xuān",
  贲: "bēn",
  邓: "dèng",
  郁: "yù",
  单: "shàn",
  杭: "háng",
  洪: "hóng",
  包: "bāo",
  诸: "zhū",
  左: "zuǒ",
  石: "shí",
  崔: "cuī",
  吉: "jí",
  钮: "niǔ",
  龚: "gōng",
  程: "chéng",
  嵇: "jī",
  邢: "xíng",
  滑: "huá",
  裴: "péi",
  陆: "lù",
  荣: "róng",
  翁: "wēng",
  荀: "xún",
  羊: "yáng",
  於: "yū",
  惠: "huì",
  甄: "zhēn",
  曲: "qū",
  家: "jiā",
  封: "fēng",
  芮: "ruì",
  羿: "yì",
  储: "chǔ",
  靳: "jìn",
  汲: "jí",
  邴: "bǐng",
  糜: "mí",
  松: "sōng",
  井: "jǐng",
  段: "duàn",
  富: "fù",
  巫: "wū",
  乌: "wū",
  焦: "jiāo",
  巴: "bā",
  弓: "gōng",
  牧: "mù",
  隗: "wěi",
  山: "shān",
  谷: "gǔ",
  车: "chē",
  侯: "hóu",
  宓: "mì",
  蓬: "péng",
  全: "quán",
  郗: "xī",
  班: "bān",
  仰: "yǎng",
  秋: "qiū",
  仲: "zhòng",
  伊: "yī",
  宫: "gōng",
  宁: "nìng",
  仇: "qiú",
  栾: "luán",
  暴: "bào",
  甘: "gān",
  钭: "tǒu",
  厉: "lì",
  戎: "róng",
  祖: "zǔ",
  武: "wǔ",
  符: "fú",
  刘: "liú",
  景: "jǐng",
  詹: "zhān",
  束: "shù",
  龙: "lóng",
  叶: "yè",
  幸: "xìng",
  司: "sī",
  韶: "sháo",
  郜: "gào",
  黎: "lí",
  蓟: "jì",
  薄: "bó",
  印: "yìn",
  宿: "sù",
  白: "bái",
  怀: "huái",
  蒲: "pú",
  邰: "tái",
  从: "cóng",
  鄂: "è",
  索: "suǒ",
  咸: "xián",
  籍: "jí",
  赖: "lài",
  卓: "zhuó",
  蔺: "lìn",
  屠: "tú",
  蒙: "méng",
  池: "chí",
  乔: "qiáo",
  阴: "yīn",
  鬱: "yù",
  胥: "xū",
  能: "nài",
  苍: "cāng",
  双: "shuāng",
  闻: "wén",
  莘: "shēn",
  党: "dǎng",
  翟: "zhái",
  谭: "tán",
  贡: "gòng",
  劳: "láo",
  逄: "páng",
  姬: "jī",
  申: "shēn",
  扶: "fú",
  堵: "dǔ",
  冉: "rǎn",
  宰: "zǎi",
  郦: "lì",
  雍: "yōng",
  郤: "xì",
  璩: "qú",
  桑: "sāng",
  桂: "guì",
  濮: "pú",
  牛: "niú",
  寿: "shòu",
  通: "tōng",
  边: "biān",
  扈: "hù",
  燕: "yān",
  冀: "jì",
  郏: "jiá",
  浦: "pǔ",
  尚: "shàng",
  农: "nóng",
  温: "wēn",
  别: "bié",
  庄: "zhuāng",
  晏: "yàn",
  柴: "chái",
  瞿: "qú",
  阎: "yán",
  充: "chōng",
  慕: "mù",
  连: "lián",
  茹: "rú",
  习: "xí",
  宦: "huàn",
  艾: "ài",
  鱼: "yú",
  容: "róng",
  向: "xiàng",
  古: "gǔ",
  易: "yì",
  慎: "shèn",
  戈: "gē",
  廖: "liào",
  庾: "yǔ",
  终: "zhōng",
  暨: "jì",
  居: "jū",
  衡: "héng",
  步: "bù",
  都: "dū",
  耿: "gěng",
  满: "mǎn",
  弘: "hóng",
  匡: "kuāng",
  国: "guó",
  文: "wén",
  寇: "kòu",
  广: "guǎng",
  禄: "lù",
  阙: "quē",
  东: "dōng",
  欧: "ōu",
  殳: "shū",
  沃: "wò",
  利: "lì",
  蔚: "wèi",
  越: "yuè",
  夔: "kuí",
  隆: "lóng",
  师: "shī",
  巩: "gǒng",
  厍: "shè",
  聂: "niè",
  晁: "cháo",
  勾: "gōu",
  敖: "áo",
  融: "róng",
  冷: "lěng",
  訾: "zī",
  辛: "xīn",
  阚: "kàn",
  那: "nā",
  简: "jiǎn",
  饶: "ráo",
  空: "kōng",
  曾: "zēng",
  母: "mǔ",
  沙: "shā",
  乜: "niè",
  养: "yǎng",
  鞠: "jū",
  须: "xū",
  丰: "fēng",
  巢: "cháo",
  关: "guān",
  蒯: "kuǎi",
  相: "xiàng",
  查: "zhā",
  后: "hòu",
  荆: "jīng",
  红: "hóng",
  游: "yóu",
  竺: "zhú",
  权: "quán",
  逯: "lù",
  盖: "gě",
  益: "yì",
  桓: "huán",
  公: "gōng",
  牟: "móu",
  哈: "hǎ",
  言: "yán",
  福: "fú",
  肖: "xiāo",
  区: "ōu",
  覃: "qín",
  朴: "piáo",
  繁: "pó",
  员: "yùn",
  句: "gōu",
  要: "yāo",
  过: "guō",
  钻: "zuān",
  谌: "chén",
  折: "shé",
  召: "shào",
  郄: "qiè",
  撒: "sǎ",
  甯: "nìng",
  六: "lù",
  啜: "chuài",
  行: "xíng"
};
const PatternSurname = Object.keys(Surnames).map((key) => ({
  zh: key,
  pinyin: Surnames[key],
  probability: 1 + stringLength(key),
  length: stringLength(key),
  priority: Priority.Surname,
  dict: Symbol("surname")
}));
const DICT2 = {
  这个: "zhè ge",
  成为: "chéng wéi",
  认为: "rèn wéi",
  作为: "zuò wéi",
  部分: "bù fen",
  要求: "yāo qiú",
  应该: "yīng gāi",
  增长: "zēng zhǎng",
  提供: "tí gōng",
  觉得: "jué de",
  任务: "rèn wu",
  那个: "nà ge",
  称为: "chēng wéi",
  为主: "wéi zhǔ",
  了解: "liǎo jiě",
  处理: "chǔ lǐ",
  皇上: "huáng shang",
  只要: "zhǐ yào",
  大量: "dà liàng",
  力量: "lì liàng",
  几乎: "jī hū",
  干部: "gàn bù",
  目的: "mù dì",
  行为: "xíng wéi",
  只见: "zhǐ jiàn",
  认识: "rèn shi",
  市长: "shì zhǎng",
  师父: "shī fu",
  调查: "diào chá",
  重新: "chóng xīn",
  分为: "fēn wéi",
  知识: "zhī shi",
  导弹: "dǎo dàn",
  质量: "zhì liàng",
  行款: "háng kuǎn",
  行列: "háng liè",
  行话: "háng huà",
  行业: "háng yè",
  隔行: "gé háng",
  在行: "zài háng",
  行家: "háng jia",
  内行: "nèi háng",
  外行: "wài háng",
  同行: "tóng háng",
  本行: "běn háng",
  行伍: "háng wǔ",
  洋行: "yáng háng",
  银行: "yín háng",
  商行: "shāng háng",
  支行: "zhī háng",
  总行: "zǒng háng",
  行情: "háng qíng",
  懂行: "dǒng háng",
  行规: "háng guī",
  行当: "háng dang",
  行货: "háng huò",
  太行: "tài háng",
  入行: "rù háng",
  中行: "zhōng háng",
  农行: "nóng háng",
  工行: "gōng háng",
  建行: "jiàn háng",
  各行: "gè háng",
  行号: "háng hào",
  行高: "háng gāo",
  行首: "háng shǒu",
  行尾: "háng wěi",
  行末: "háng mò",
  行长: "háng cháng",
  行距: "háng jù",
  换行: "huàn háng",
  行会: "háng huì",
  行辈: "háng bèi",
  行道: "háng dào",
  道行: "dào heng",
  参与: "cān yù",
  充分: "chōng fèn",
  尽管: "jǐn guǎn",
  生长: "shēng zhǎng",
  数量: "shù liàng",
  应当: "yīng dāng",
  院长: "yuàn zhǎng",
  强调: "qiáng diào",
  只能: "zhǐ néng",
  音乐: "yīn yuè",
  以为: "yǐ wéi",
  处于: "chǔ yú",
  部长: "bù zhǎng",
  蒙古: "měng gǔ",
  只有: "zhǐ yǒu",
  适当: "shì dàng",
  只好: "zhǐ hǎo",
  成长: "chéng zhǎng",
  高兴: "gāo xìng",
  不了: "bù liǎo",
  产量: "chǎn liàng",
  胖子: "pàng zi",
  显得: "xiǎn de",
  只是: "zhǐ shì",
  似的: "shì de",
  率领: "shuài lǐng",
  改为: "gǎi wéi",
  不禁: "bù jīn",
  成分: "chéng fèn",
  答应: "dā ying",
  少年: "shào nián",
  兴趣: "xìng qù",
  太监: "tài jian",
  休息: "xiū xi",
  校长: "xiào zhǎng",
  更新: "gēng xīn",
  合同: "hé tong",
  喝道: "hè dào",
  重庆: "chóng qìng",
  重建: "chóng jiàn",
  使得: "shǐ de",
  审查: "shěn chá",
  累计: "lěi jì",
  给予: "jǐ yǔ",
  极为: "jí wéi",
  冠军: "guàn jūn",
  仿佛: "fǎng fú",
  头发: "tóu fa",
  投降: "tóu xiáng",
  家长: "jiā zhǎng",
  仔细: "zǐ xì",
  要是: "yào shi",
  将领: "jiàng lǐng",
  含量: "hán liàng",
  更为: "gèng wéi",
  积累: "jī lěi",
  地处: "dì chǔ",
  县长: "xiàn zhǎng",
  少女: "shào nǚ",
  路上: "lù shang",
  只怕: "zhǐ pà",
  能量: "néng liàng",
  储量: "chǔ liàng",
  供应: "gōng yìng",
  挑战: "tiǎo zhàn",
  西藏: "xī zàng",
  记得: "jì de",
  总量: "zǒng liàng",
  当真: "dàng zhēn",
  将士: "jiàng shì",
  差别: "chā bié",
  较为: "jiào wéi",
  长老: "zhǎng lǎo",
  大夫: "dài fu",
  差异: "chā yì",
  懂得: "dǒng de",
  尽量: "jǐn liàng",
  模样: "mú yàng",
  的确: "dí què",
  为首: "wéi shǒu",
  便宜: "pián yi",
  更名: "gēng míng",
  石头: "shí tou",
  州长: "zhōu zhǎng",
  为止: "wéi zhǐ",
  漂亮: "piào liang",
  炮弹: "pào dàn",
  藏族: "zàng zú",
  角色: "jué sè",
  当作: "dàng zuò",
  尽快: "jǐn kuài",
  人为: "rén wéi",
  重复: "chóng fù",
  胡同: "hú tòng",
  差距: "chā jù",
  弟兄: "dì xiong",
  大将: "dà jiàng",
  睡觉: "shuì jiào",
  一觉: "yí jiào",
  团长: "tuán zhǎng",
  队长: "duì zhǎng",
  区长: "qū zhǎng",
  难得: "nán dé",
  丫头: "yā tou",
  会长: "huì zhǎng",
  弟弟: "dì di",
  王爷: "wáng ye",
  重量: "zhòng liàng",
  誉为: "yù wéi",
  家伙: "jiā huo",
  华山: "huà shān",
  椅子: "yǐ zi",
  流量: "liú liàng",
  长大: "zhǎng dà",
  勉强: "miǎn qiǎng",
  会计: "kuài jì",
  过分: "guò fèn",
  济南: "jǐ nán",
  调动: "diào dòng",
  燕京: "yān jīng",
  少将: "shào jiàng",
  中毒: "zhòng dú",
  晓得: "xiǎo de",
  变更: "biàn gēng",
  打更: "dǎ gēng",
  认得: "rèn de",
  苹果: "píng guǒ",
  念头: "niàn tou",
  挣扎: "zhēng zhá",
  三藏: "sān zàng",
  剥削: "bō xuē",
  丞相: "chéng xiàng",
  少量: "shǎo liàng",
  寻思: "xún si",
  夺得: "duó dé",
  干线: "gàn xiàn",
  呼吁: "hū yù",
  处罚: "chǔ fá",
  长官: "zhǎng guān",
  柏林: "bó lín",
  亲戚: "qīn qi",
  身分: "shēn fèn",
  胳膊: "gē bo",
  着手: "zhuó shǒu",
  炸弹: "zhà dàn",
  咳嗽: "ké sou",
  叶子: "yè zi",
  外长: "wài zhǎng",
  供给: "gōng jǐ",
  师长: "shī zhǎng",
  变量: "biàn liàng",
  应有: "yīng yǒu",
  下载: "xià zài",
  乐器: "yuè qì",
  间接: "jiàn jiē",
  底下: "dǐ xià",
  打扮: "dǎ bàn",
  子弹: "zǐ dàn",
  弹药: "dàn yào",
  热量: "rè liàng",
  削弱: "xuē ruò",
  骨干: "gǔ gàn",
  容量: "róng liàng",
  模糊: "mó hu",
  转动: "zhuàn dòng",
  称呼: "chēng hu",
  科长: "kē zhǎng",
  处置: "chǔ zhì",
  着重: "zhuó zhòng",
  着急: "zháo jí",
  强迫: "qiǎng pò",
  庭长: "tíng zhǎng",
  首相: "shǒu xiàng",
  喇嘛: "lǎ ma",
  镇长: "zhèn zhǎng",
  只管: "zhǐ guǎn",
  重重: "chóng chóng",
  免得: "miǎn de",
  着实: "zhuó shí",
  度假: "dù jià",
  真相: "zhēn xiàng",
  相貌: "xiàng mào",
  处分: "chǔ fèn",
  委屈: "wěi qu",
  为期: "wéi qī",
  伯伯: "bó bo",
  伯子: "bǎi zi",
  圈子: "quān zi",
  见识: "jiàn shi",
  笼罩: "lǒng zhào",
  与会: "yù huì",
  都督: "dū du",
  都市: "dū shì",
  成都: "chéng dū",
  首都: "shǒu dū",
  帝都: "dì dū",
  王都: "wáng dū",
  东都: "dōng dū",
  都护: "dū hù",
  都城: "dū chéng",
  建都: "jiàn dū",
  迁都: "qiān dū",
  故都: "gù dū",
  定都: "dìng dū",
  中都: "zhōng dū",
  六安: "lù ān",
  宰相: "zǎi xiàng",
  较量: "jiào liàng",
  对称: "duì chèn",
  总长: "zǒng zhǎng",
  相公: "xiàng gong",
  空白: "kòng bái",
  打量: "dǎ liang",
  水分: "shuǐ fèn",
  舌头: "shé tou",
  没收: "mò shōu",
  行李: "xíng li",
  判处: "pàn chǔ",
  散文: "sǎn wén",
  处境: "chǔ jìng",
  孙子: "sūn zi",
  拳头: "quán tou",
  打发: "dǎ fā",
  组长: "zǔ zhǎng",
  骨头: "gǔ tou",
  宁可: "nìng kě",
  更换: "gēng huàn",
  薄弱: "bó ruò",
  还原: "huán yuán",
  重修: "chóng xiū",
  重来: "chóng lái",
  只顾: "zhǐ gù",
  爱好: "ài hào",
  馒头: "mán tou",
  军长: "jūn zhǎng",
  首长: "shǒu zhǎng",
  厂长: "chǎng zhǎng",
  司长: "sī zhǎng",
  长子: "zhǎng zǐ",
  强劲: "qiáng jìng",
  恰当: "qià dàng",
  头儿: "tóu er",
  站长: "zhàn zhǎng",
  折腾: "zhē teng",
  相处: "xiāng chǔ",
  统率: "tǒng shuài",
  中将: "zhōng jiàng",
  命中: "mìng zhòng",
  名将: "míng jiàng",
  木头: "mù tou",
  动弹: "dòng tan",
  地壳: "dì qiào",
  干活: "gàn huó",
  少爷: "shào ye",
  水量: "shuǐ liàng",
  补给: "bǔ jǐ",
  尾巴: "wěi ba",
  来得: "lái de",
  好奇: "hào qí",
  钥匙: "yào shi",
  当做: "dàng zuò",
  沉着: "chén zhuó",
  哑巴: "yǎ ba",
  车子: "chē zi",
  上将: "shàng jiàng",
  恶心: "ě xīn",
  担子: "dàn zi",
  应届: "yīng jiè",
  主角: "zhǔ jué",
  运转: "yùn zhuǎn",
  兄长: "xiōng zhǎng",
  格式: "gé shì",
  正月: "zhēng yuè",
  营长: "yíng zhǎng",
  当成: "dàng chéng",
  女婿: "nǚ xu",
  咽喉: "yān hóu",
  重阳: "chóng yáng",
  化为: "huà wéi",
  吐蕃: "tǔ bō",
  钻进: "zuān jìn",
  乐队: "yuè duì",
  亮相: "liàng xiàng",
  被子: "bèi zi",
  舍得: "shě de",
  杉木: "shā mù",
  击中: "jī zhòng",
  排长: "pái zhǎng",
  假期: "jià qī",
  分量: "fèn liàng",
  数次: "shù cì",
  提防: "dī fáng",
  吆喝: "yāo he",
  查处: "chá chǔ",
  量子: "liàng zǐ",
  里头: "lǐ tou",
  调研: "diào yán",
  伺候: "cì hou",
  重申: "chóng shēn",
  枕头: "zhěn tou",
  拚命: "pīn mìng",
  社长: "shè zhǎng",
  归还: "guī huán",
  批量: "pī liàng",
  畜牧: "xù mù",
  点着: "diǎn zháo",
  甚为: "shèn wéi",
  小将: "xiǎo jiàng",
  着眼: "zhuó yǎn",
  处死: "chǔ sǐ",
  厌恶: "yàn wù",
  鼓乐: "gǔ yuè",
  树干: "shù gàn",
  秘鲁: "bì lǔ",
  大方: "dà fāng",
  外头: "wài tou",
  班长: "bān zhǎng",
  星宿: "xīng xiù",
  宁愿: "nìng yuàn",
  钦差: "qīn chāi",
  为数: "wéi shù",
  勾当: "gòu dàng",
  削减: "xuē jiǎn",
  间谍: "jiàn dié",
  埋怨: "mán yuàn",
  结实: "jiē shi",
  计量: "jì liáng",
  淹没: "yān mò",
  村长: "cūn zhǎng",
  连长: "lián zhǎng",
  自给: "zì jǐ",
  武将: "wǔ jiàng",
  温差: "wēn chā",
  直奔: "zhí bèn",
  供求: "gōng qiú",
  剂量: "jì liàng",
  道长: "dào zhǎng",
  泄露: "xiè lòu",
  王八: "wáng ba",
  切割: "qiē gē",
  间隔: "jiàn gé",
  一晃: "yì huǎng",
  长假: "cháng jià",
  令狐: "líng hú",
  为害: "wéi hài",
  句子: "jù zi",
  偿还: "cháng huán",
  疙瘩: "gē da",
  燕山: "yān shān",
  堵塞: "dǔ sè",
  夺冠: "duó guàn",
  扎实: "zhā shi",
  电荷: "diàn hè",
  看守: "kān shǒu",
  复辟: "fù bì",
  郁闷: "yù mèn",
  尽早: "jǐn zǎo",
  切断: "qiē duàn",
  指头: "zhǐ tou",
  为生: "wéi shēng",
  畜生: "chù sheng",
  切除: "qiē chú",
  着力: "zhuó lì",
  着想: "zhuó xiǎng",
  级差: "jí chā",
  投奔: "tóu bèn",
  棍子: "gùn zi",
  含糊: "hán hu",
  少妇: "shào fù",
  兴致: "xìng zhì",
  纳闷: "nà mèn",
  干流: "gàn liú",
  卷起: "juǎn qǐ",
  扇子: "shàn zi",
  更改: "gēng gǎi",
  笼络: "lǒng luò",
  喇叭: "lǎ ba",
  载荷: "zài hè",
  妥当: "tuǒ dàng",
  为难: "wéi nán",
  着陆: "zhuó lù",
  燕子: "yàn zi",
  干吗: "gàn má",
  白发: "bái fà",
  总得: "zǒng děi",
  夹击: "jiā jī",
  曝光: "bào guāng",
  曲调: "qǔ diào",
  相机: "xiàng jī",
  叫化: "jiào huà",
  角逐: "jué zhú",
  啊哟: "ā yō",
  载重: "zài zhòng",
  长辈: "zhǎng bèi",
  出差: "chū chāi",
  垛口: "duǒ kǒu",
  撇开: "piē kāi",
  厅长: "tīng zhǎng",
  组分: "zǔ fèn",
  误差: "wù chā",
  家当: "jiā dàng",
  传记: "zhuàn jì",
  个子: "gè zi",
  铺设: "pū shè",
  干事: "gàn shì",
  杆菌: "gǎn jūn",
  定量: "dìng liàng",
  运载: "yùn zài",
  会儿: "huì er",
  酋长: "qiú zhǎng",
  重返: "chóng fǎn",
  差额: "chā é",
  露面: "lòu miàn",
  钻研: "zuān yán",
  大城: "dài chéng",
  上当: "shàng dàng",
  销量: "xiāo liàng",
  作坊: "zuō fang",
  照相: "zhào xiàng",
  哎呀: "āi yā",
  调集: "diào jí",
  看中: "kàn zhòng",
  议长: "yì zhǎng",
  风筝: "fēng zheng",
  辟邪: "bì xié",
  空隙: "kòng xì",
  更迭: "gēng dié",
  偏差: "piān chā",
  声调: "shēng diào",
  适量: "shì liàng",
  屯子: "tún zi",
  无量: "wú liàng",
  空地: "kòng dì",
  调度: "diào dù",
  散射: "sǎn shè",
  创伤: "chuāng shāng",
  海参: "hǎi shēn",
  满载: "mǎn zài",
  重叠: "chóng dié",
  落差: "luò chā",
  单调: "dān diào",
  老将: "lǎo jiàng",
  人参: "rén shēn",
  间断: "jiàn duàn",
  重现: "chóng xiàn",
  夹杂: "jiā zá",
  调用: "diào yòng",
  萝卜: "luó bo",
  附着: "fù zhuó",
  应声: "yìng shēng",
  主将: "zhǔ jiàng",
  罪过: "zuì guo",
  咀嚼: "jǔ jué",
  为政: "wéi zhèng",
  过量: "guò liàng",
  乐曲: "yuè qǔ",
  负荷: "fù hè",
  枪弹: "qiāng dàn",
  悄然: "qiǎo rán",
  处方: "chǔ fāng",
  悄声: "qiǎo shēng",
  曲子: "qǔ zi",
  情调: "qíng diào",
  挑衅: "tiǎo xìn",
  代为: "dài wéi",
  了结: "liǎo jié",
  打中: "dǎ zhòng",
  酒吧: "jiǔ bā",
  懒得: "lǎn de",
  增量: "zēng liàng",
  衣着: "yī zhuó",
  部将: "bù jiàng",
  要塞: "yào sài",
  茶几: "chá jī",
  杠杆: "gàng gǎn",
  出没: "chū mò",
  鲜有: "xiǎn yǒu",
  间隙: "jiàn xì",
  重担: "zhòng dàn",
  重演: "chóng yǎn",
  重试: "chóng shì",
  应酬: "yìng chou",
  只当: "zhǐ dāng",
  毋宁: "wú nìng",
  包扎: "bāo zā",
  前头: "qián tou",
  卷烟: "juǎn yān",
  非得: "fēi děi",
  弹道: "dàn dào",
  杆子: "gān zi",
  门将: "mén jiàng",
  后头: "hòu tou",
  喝彩: "hè cǎi",
  暖和: "nuǎn huo",
  累积: "lěi jī",
  调遣: "diào qiǎn",
  倔强: "jué jiàng",
  宝藏: "bǎo zàng",
  丧事: "sāng shì",
  约莫: "yuē mo",
  纤夫: "qiàn fū",
  更替: "gēng tì",
  装载: "zhuāng zài",
  背包: "bēi bāo",
  帖子: "tiě zi",
  松散: "sōng sǎn",
  呼喝: "hū hè",
  可恶: "kě wù",
  自转: "zì zhuàn",
  供电: "gōng diàn",
  反省: "fǎn xǐng",
  坦率: "tǎn shuài",
  苏打: "sū dá",
  本分: "běn fèn",
  落得: "luò de",
  鄙薄: "bǐ bó",
  相间: "xiāng jiàn",
  单薄: "dān bó",
  混蛋: "hún dàn",
  贞观: "zhēn guān",
  附和: "fù hè",
  能耐: "néng nài",
  吓唬: "xià hu",
  未了: "wèi liǎo",
  引着: "yǐn zháo",
  抽调: "chōu diào",
  沙子: "shā zi",
  席卷: "xí juǎn",
  标的: "biāo dì",
  别扭: "biè niu",
  思量: "sī liang",
  喝采: "hè cǎi",
  论语: "lún yǔ",
  盖子: "gài zi",
  分外: "fèn wài",
  弄堂: "lòng táng",
  乐舞: "yuè wǔ",
  雨量: "yǔ liàng",
  毛发: "máo fà",
  差遣: "chāi qiǎn",
  背负: "bēi fù",
  转速: "zhuàn sù",
  声乐: "shēng yuè",
  夹攻: "jiā gōng",
  供水: "gōng shuǐ",
  主干: "zhǔ gàn",
  惩处: "chéng chǔ",
  长相: "zhǎng xiàng",
  公差: "gōng chāi",
  榴弹: "liú dàn",
  省得: "shěng de",
  条子: "tiáo zi",
  重围: "chóng wéi",
  阻塞: "zǔ sè",
  劲风: "jìng fēng",
  纠葛: "jiū gé",
  颠簸: "diān bǒ",
  点中: "diǎn zhòng",
  重创: "zhòng chuāng",
  姥姥: "lǎo lao",
  迷糊: "mí hu",
  公家: "gōng jia",
  几率: "jī lǜ",
  苦闷: "kǔ mèn",
  度量: "dù liàng",
  差错: "chā cuò",
  暑假: "shǔ jià",
  参差: "cēn cī",
  搭载: "dā zài",
  助长: "zhù zhǎng",
  相称: "xiāng chèn",
  红晕: "hóng yùn",
  舍命: "shě mìng",
  喜好: "xǐ hào",
  列传: "liè zhuàn",
  劲敌: "jìng dí",
  蛤蟆: "há ma",
  请假: "qǐng jià",
  钉子: "dīng zi",
  沉没: "chén mò",
  高丽: "gāo lí",
  休假: "xiū jià",
  无为: "wú wéi",
  巴结: "bā jie",
  了得: "liǎo dé",
  变相: "biàn xiàng",
  核弹: "hé dàn",
  亲家: "qìng jia",
  承载: "chéng zài",
  喝问: "hè wèn",
  还击: "huán jī",
  交还: "jiāo huán",
  将令: "jiàng lìng",
  单于: "chán yú",
  空缺: "kòng quē",
  绿林: "lù lín",
  胆量: "dǎn liàng",
  执着: "zhí zhuó",
  低调: "dī diào",
  闭塞: "bì sè",
  轻薄: "qīng bó",
  得当: "dé dàng",
  占卜: "zhān bǔ",
  扫帚: "sào zhou",
  龟兹: "qiū cí",
  年长: "nián zhǎng",
  外传: "wài zhuàn",
  头子: "tóu zi",
  裁缝: "cái feng",
  礼乐: "lǐ yuè",
  血泊: "xuè pō",
  散乱: "sǎn luàn",
  动量: "dòng liàng",
  倒腾: "dǎo teng",
  取舍: "qǔ shě",
  咱家: "zán jiā",
  长发: "cháng fà",
  爪哇: "zhǎo wā",
  弹壳: "dàn ké",
  省悟: "xǐng wù",
  嚷嚷: "rāng rang",
  连累: "lián lèi",
  应得: "yīng dé",
  族长: "zú zhǎng",
  柜子: "guì zi",
  擂鼓: "léi gǔ",
  眩晕: "xuàn yùn",
  调配: "tiáo pèi",
  躯干: "qū gàn",
  差役: "chāi yì",
  坎坷: "kǎn kě",
  少儿: "shào ér",
  乐团: "yuè tuán",
  养分: "yǎng fèn",
  退还: "tuì huán",
  格调: "gé diào",
  语调: "yǔ diào",
  音调: "yīn diào",
  乐府: "yuè fǔ",
  古朴: "gǔ pǔ",
  打点: "dǎ diǎn",
  差使: "chāi shǐ",
  匀称: "yún chèn",
  瘦削: "shòu xuē",
  膏药: "gāo yao",
  吞没: "tūn mò",
  调任: "diào rèn",
  散居: "sǎn jū",
  上头: "shàng tóu",
  风靡: "fēng mǐ",
  放假: "fàng jià",
  估量: "gū liang",
  失当: "shī dàng",
  中弹: "zhòng dàn",
  妄为: "wàng wéi",
  长者: "zhǎng zhě",
  起哄: "qǐ hòng",
  末了: "mò liǎo",
  相声: "xiàng sheng",
  校正: "jiào zhèng",
  劝降: "quàn xiáng",
  矢量: "shǐ liàng",
  沉闷: "chén mèn",
  给与: "jǐ yǔ",
  解法: "jiě fǎ",
  塞外: "sài wài",
  将校: "jiàng xiào",
  嗜好: "shì hào",
  没落: "mò luò",
  朴刀: "pō dāo",
  片子: "piān zi",
  切削: "qiē xiāo",
  弹丸: "dàn wán",
  稀薄: "xī bó",
  亏得: "kuī dé",
  间歇: "jiàn xiē",
  翘首: "qiáo shǒu",
  色调: "sè diào",
  处决: "chǔ jué",
  表率: "biǎo shuài",
  尺子: "chǐ zi",
  招降: "zhāo xiáng",
  称职: "chèn zhí",
  斗篷: "dǒu peng",
  铺子: "pù zi",
  底子: "dǐ zi",
  负载: "fù zài",
  干警: "gàn jǐng",
  倒数: "dào shǔ",
  将官: "jiàng guān",
  锄头: "chú tou",
  归降: "guī xiáng",
  疟疾: "nüè ji",
  唠叨: "láo dao",
  限量: "xiàn liàng",
  屏息: "bǐng xī",
  重逢: "chóng féng",
  器乐: "qì yuè",
  氢弹: "qīng dàn",
  脖颈: "bó gěng",
  妃子: "fēi zi",
  处事: "chǔ shì",
  参量: "cān liàng",
  轻率: "qīng shuài",
  缥缈: "piāo miǎo",
  中奖: "zhòng jiǎng",
  才干: "cái gàn",
  施舍: "shī shě",
  卷子: "juàn zi",
  游说: "yóu shuì",
  巷子: "xiàng zi",
  膀胱: "páng guāng",
  切勿: "qiè wù",
  看管: "kān guǎn",
  风头: "fēng tou",
  精干: "jīng gàn",
  高差: "gāo chā",
  恐吓: "kǒng hè",
  扁担: "biǎn dàn",
  给养: "jǐ yǎng",
  格子: "gé zi",
  供需: "gōng xū",
  反差: "fǎn chā",
  飞弹: "fēi dàn",
  微薄: "wēi bó",
  发型: "fà xíng",
  即兴: "jí xìng",
  攒动: "cuán dòng",
  间或: "jiàn huò",
  浅薄: "qiǎn bó",
  乐章: "yuè zhāng",
  顺差: "shùn chā",
  调子: "diào zi",
  相位: "xiàng wèi",
  转子: "zhuàn zǐ",
  劲旅: "jìng lǚ",
  咔嚓: "kā chā",
  了事: "liǎo shì",
  转悠: "zhuàn you",
  当铺: "dàng pù",
  爪子: "zhuǎ zi",
  单子: "dān zi",
  好战: "hào zhàn",
  燕麦: "yàn mài",
  只许: "zhǐ xǔ",
  干练: "gàn liàn",
  女将: "nǚ jiàng",
  酒量: "jiǔ liàng",
  划船: "huá chuán",
  伎俩: "jì liǎng",
  挑拨: "tiǎo bō",
  少校: "shào xiào",
  着落: "zhuó luò",
  憎恶: "zēng wù",
  刻薄: "kè bó",
  要挟: "yāo xié",
  用处: "yòng chu",
  还手: "huán shǒu",
  模具: "mú jù",
  执著: "zhí zhuó",
  喝令: "hè lìng",
  保长: "bǎo zhǎng",
  吸着: "xī zhe",
  症结: "zhēng jié",
  公转: "gōng zhuàn",
  校勘: "jiào kān",
  重提: "chóng tí",
  扫兴: "sǎo xìng",
  铺盖: "pū gài",
  长史: "zhǎng shǐ",
  差价: "chā jià",
  压根: "yà gēn",
  怔住: "zhèng zhù",
  应允: "yīng yǔn",
  切入: "qiē rù",
  战将: "zhàn jiàng",
  年少: "nián shào",
  舍身: "shě shēn",
  执拗: "zhí niù",
  处世: "chǔ shì",
  中风: "zhòng fēng",
  等量: "děng liàng",
  放量: "fàng liàng",
  腔调: "qiāng diào",
  老少: "lǎo shào",
  没入: "mò rù",
  瓜葛: "guā gé",
  将帅: "jiàng shuài",
  车载: "chē zài",
  窝囊: "wō nang",
  长进: "zhǎng jìn",
  可汗: "kè hán",
  并州: "bīng zhōu",
  供销: "gōng xiāo",
  切片: "qiē piàn",
  差事: "chāi shì",
  知会: "zhī hui",
  鹰爪: "yīng zhǎo",
  处女: "chǔ nǚ",
  切磋: "qiē cuō",
  日头: "rì tou",
  押解: "yā jiè",
  滋长: "zī zhǎng",
  道观: "dào guàn",
  脚色: "jué sè",
  当量: "dāng liàng",
  婆家: "pó jia",
  缘分: "yuán fèn",
  空闲: "kòng xián",
  好色: "hào sè",
  怒喝: "nù hè",
  笼统: "lǒng tǒng",
  边塞: "biān sài",
  何曾: "hé céng",
  重合: "chóng hé",
  零散: "líng sǎn",
  轰隆: "hōng lōng",
  化子: "huà zi",
  内蒙: "nèi měng",
  数落: "shǔ luò",
  逆差: "nì chā",
  牟利: "móu lì",
  栅栏: "zhà lan",
  中标: "zhòng biāo",
  调档: "diào dàng",
  佝偻: "gōu lóu",
  场子: "chǎng zi",
  甲壳: "jiǎ qiào",
  重温: "chóng wēn",
  炮制: "páo zhì",
  返还: "fǎn huán",
  自传: "zì zhuàn",
  高调: "gāo diào",
  殷红: "yān hóng",
  固着: "gù zhuó",
  强求: "qiǎng qiú",
  本相: "běn xiàng",
  骄横: "jiāo hèng",
  草率: "cǎo shuài",
  气闷: "qì mèn",
  着色: "zhuó sè",
  宁肯: "nìng kěn",
  兴头: "xìng tou",
  拘泥: "jū nì",
  夹角: "jiā jiǎo",
  发髻: "fà jì",
  猛将: "měng jiàng",
  约摸: "yuē mo",
  拖累: "tuō lěi",
  呢绒: "ní róng",
  钻探: "zuān tàn",
  夹层: "jiā céng",
  落魄: "luò pò",
  巷道: "hàng dào",
  运量: "yùn liàng",
  解闷: "jiě mèn",
  空儿: "kòng er",
  估摸: "gū mo",
  好客: "hào kè",
  钻孔: "zuān kǒng",
  糊弄: "hù nòng",
  荥阳: "xíng yáng",
  烦闷: "fán mèn",
  仓卒: "cāng cù",
  分叉: "fēn chà",
  厂子: "chǎng zi",
  小调: "xiǎo diào",
  少阳: "shào yáng",
  受降: "shòu xiáng",
  染坊: "rǎn fáng",
  胳臂: "gē bei",
  将门: "jiàng mén",
  模板: "mú bǎn",
  配给: "pèi jǐ",
  为伍: "wéi wǔ",
  跟头: "gēn tou",
  划算: "huá suàn",
  累赘: "léi zhui",
  哄笑: "hōng xiào",
  晕眩: "yūn xuàn",
  干掉: "gàn diào",
  缝制: "féng zhì",
  难处: "nán chù",
  着意: "zhuó yì",
  蛮横: "mán hèng",
  奇数: "jī shù",
  短发: "duǎn fà",
  生还: "shēng huán",
  还清: "huán qīng",
  看护: "kān hù",
  直率: "zhí shuài",
  奏乐: "zòu yuè",
  载客: "zài kè",
  专横: "zhuān hèng",
  湮没: "yān mò",
  空格: "kòng gé",
  铺垫: "pū diàn",
  良将: "liáng jiàng",
  哗啦: "huā lā",
  散漫: "sǎn màn",
  脱发: "tuō fà",
  送还: "sòng huán",
  埋没: "mái mò",
  累及: "lěi jí",
  薄雾: "bó wù",
  调离: "diào lí",
  舌苔: "shé tāi",
  机长: "jī zhǎng",
  栓塞: "shuān sè",
  配角: "pèi jué",
  切口: "qiē kǒu",
  创口: "chuāng kǒu",
  哈欠: "hā qian",
  实弹: "shí dàn",
  铺平: "pū píng",
  哈达: "hǎ dá",
  懒散: "lǎn sǎn",
  实干: "shí gàn",
  填空: "tián kòng",
  刁钻: "diāo zuān",
  乐师: "yuè shī",
  量变: "liàng biàn",
  诱降: "yòu xiáng",
  搪塞: "táng sè",
  征调: "zhēng diào",
  夹道: "jiā dào",
  干咳: "gān ké",
  止咳: "zhǐ ké",
  乐工: "yuè gōng",
  划过: "huá guò",
  着火: "zháo huǒ",
  更正: "gēng zhèng",
  给付: "jǐ fù",
  空子: "kòng zi",
  哪吒: "né zhā",
  正着: "zhèng zháo",
  刷子: "shuā zi",
  丧葬: "sāng zàng",
  夹带: "jiā dài",
  安分: "ān fèn",
  中意: "zhòng yì",
  长孙: "zhǎng sūn",
  校订: "jiào dìng",
  卷曲: "juǎn qū",
  载运: "zài yùn",
  投弹: "tóu dàn",
  柞蚕: "zuò cán",
  份量: "fèn liàng",
  调换: "diào huàn",
  了然: "liǎo rán",
  咧嘴: "liě zuǐ",
  典当: "diǎn dàng",
  寒假: "hán jià",
  长兄: "zhǎng xiōng",
  给水: "jǐ shuǐ",
  须发: "xū fà",
  枝干: "zhī gàn",
  属相: "shǔ xiàng",
  哄抢: "hōng qiǎng",
  刻划: "kè huà",
  塞子: "sāi zi",
  单干: "dān gàn",
  还乡: "huán xiāng",
  兆头: "zhào tou",
  寺观: "sì guàn",
  督率: "dū shuài",
  啊哈: "ā ha",
  割舍: "gē shě",
  抹布: "mā bù",
  好恶: "hào wù",
  下处: "xià chǔ",
  消长: "xiāo zhǎng",
  离间: "lí jiàn",
  准头: "zhǔn tou",
  校对: "jiào duì",
  什物: "shí wù",
  番禺: "pān yú",
  佛爷: "fó ye",
  吗啡: "mǎ fēi",
  盐分: "yán fèn",
  虎将: "hǔ jiàng",
  薄荷: "bò he",
  独处: "dú chǔ",
  空位: "kòng wèi",
  铺路: "pū lù",
  乌拉: "wū lā",
  调回: "diào huí",
  来头: "lái tou",
  闲散: "xián sǎn",
  胶卷: "jiāo juǎn",
  冒失: "mào shi",
  干劲: "gàn jìn",
  弦乐: "xián yuè",
  相国: "xiàng guó",
  丹参: "dān shēn",
  助兴: "zhù xìng",
  铺开: "pū kāi",
  次长: "cì zhǎng",
  发卡: "fà qiǎ",
  拮据: "jié jū",
  刹车: "shā chē",
  生发: "shēng fà",
  重播: "chóng bō",
  缝合: "féng hé",
  音量: "yīn liàng",
  少尉: "shào wèi",
  冲压: "chòng yā",
  苍劲: "cāng jìng",
  厚薄: "hòu báo",
  威吓: "wēi hè",
  外相: "wài xiàng",
  呼号: "hū háo",
  着迷: "zháo mí",
  挑担: "tiāo dàn",
  纹路: "wén lù",
  还俗: "huán sú",
  强横: "qiáng hèng",
  着数: "zhāo shù",
  降顺: "xiáng shùn",
  挑明: "tiǎo míng",
  眯缝: "mī feng",
  分内: "fèn nèi",
  更衣: "gēng yī",
  软和: "ruǎn huo",
  尽兴: "jìn xìng",
  号子: "hào zi",
  爪牙: "zhǎo yá",
  败将: "bài jiàng",
  猜中: "cāi zhòng",
  结扎: "jié zā",
  没空: "méi kòng",
  夹缝: "jiā fèng",
  拾掇: "shí duo",
  掺和: "chān huo",
  簸箕: "bò ji",
  电量: "diàn liàng",
  荷载: "hè zǎi",
  调式: "diào shì",
  处身: "chǔ shēn",
  打手: "dǎ shǒu",
  弹弓: "dàn gōng",
  横蛮: "hèng mán",
  能干: "néng gàn",
  校点: "jiào diǎn",
  加载: "jiā zài",
  干校: "gàn xiào",
  哄传: "hōng chuán",
  校注: "jiào zhù",
  淤塞: "yū sè",
  马扎: "mǎ zhá",
  月氏: "yuè zhī",
  高干: "gāo gàn",
  经传: "jīng zhuàn",
  曾孙: "zēng sūn",
  好斗: "hào dòu",
  关卡: "guān qiǎ",
  逃奔: "táo bèn",
  磨蹭: "mó ceng",
  牟取: "móu qǔ",
  颤栗: "zhàn lì",
  蚂蚱: "mà zha",
  撮合: "cuō he",
  趔趄: "liè qie",
  摔打: "shuāi dǎ",
  台子: "tái zi",
  分得: "fēn de",
  粘着: "nián zhuó",
  采邑: "cài yì",
  散装: "sǎn zhuāng",
  婀娜: "ē nuó",
  兴味: "xìng wèi",
  行头: "xíng tou",
  气量: "qì liàng",
  调运: "diào yùn",
  处治: "chǔ zhì",
  乐音: "yuè yīn",
  充塞: "chōng sè",
  恫吓: "dòng hè",
  论调: "lùn diào",
  相中: "xiāng zhòng",
  民乐: "mín yuè",
  炮仗: "pào zhang",
  丧服: "sāng fú",
  骁将: "xiāo jiàng",
  量刑: "liàng xíng",
  缝补: "féng bǔ",
  财会: "cái kuài",
  大干: "dà gàn",
  历数: "lì shǔ",
  校场: "jiào chǎng",
  塞北: "sài běi",
  识相: "shí xiàng",
  辱没: "rǔ mò",
  鲜亮: "xiān liàng",
  语塞: "yǔ sè",
  露脸: "lòu liǎn",
  凉快: "liáng kuai",
  腰杆: "yāo gǎn",
  溜达: "liū da",
  嘎嘎: "gā gā",
  公干: "gōng gàn",
  桔梗: "jié gěng",
  挑逗: "tiǎo dòu",
  看门: "kān mén",
  乐歌: "yuè gē",
  拓片: "tà piàn",
  挑动: "tiǎo dòng",
  准将: "zhǔn jiàng",
  遒劲: "qiú jìng",
  磨坊: "mò fáng",
  逶迤: "wēi yí",
  搅和: "jiǎo huo",
  摩挲: "mó suō",
  作弄: "zuò nòng",
  苗头: "miáo tou",
  打颤: "dǎ zhàn",
  大藏: "dà zàng",
  畜牲: "chù shēng",
  勾搭: "gōu da",
  树荫: "shù yīn",
  树杈: "shù chà",
  铁杆: "tiě gǎn",
  将相: "jiàng xiàng",
  份子: "fèn zi",
  视差: "shì chā",
  绿荫: "lǜ yīn",
  枪杆: "qiāng gǎn",
  缝纫: "féng rèn",
  愁闷: "chóu mèn",
  点将: "diǎn jiàng",
  华佗: "huà tuó",
  劲射: "jìng shè",
  箱笼: "xiāng lǒng",
  终了: "zhōng liǎo",
  鬓发: "bìn fà",
  结巴: "jiē ba",
  苦干: "kǔ gàn",
  看家: "kān jiā",
  正旦: "zhēng dàn",
  中肯: "zhòng kěn",
  厦门: "xià mén",
  东莞: "dōng guǎn",
  食量: "shí liàng",
  宫调: "gōng diào",
  间作: "jiàn zuò",
  弹片: "dàn piàn",
  差池: "chā chí",
  漂白: "piǎo bái",
  杠子: "gàng zi",
  调处: "tiáo chǔ",
  好动: "hào dòng",
  转炉: "zhuàn lú",
  屏气: "bǐng qì",
  夹板: "jiā bǎn",
  哀乐: "āi yuè",
  干道: "gàn dào",
  苦处: "kǔ chù",
  劈柴: "pǐ chái",
  长势: "zhǎng shì",
  天华: "tiān huá",
  共处: "gòng chǔ",
  校验: "jiào yàn",
  出塞: "chū sài",
  磨盘: "mò pán",
  萎靡: "wěi mǐ",
  奔丧: "bēn sāng",
  唱和: "chàng hè",
  大调: "dà diào",
  非分: "fēi fèn",
  钻营: "zuān yíng",
  夹子: "jiā zi",
  超载: "chāo zài",
  更始: "gēng shǐ",
  铃铛: "líng dang",
  披散: "pī sàn",
  发还: "fā huán",
  转轮: "zhuàn lún",
  横财: "hèng cái",
  泡桐: "pāo tóng",
  抛撒: "pāo sǎ",
  天呀: "tiān yā",
  糊糊: "hū hu",
  躯壳: "qū qiào",
  通量: "tōng liàng",
  奉还: "fèng huán",
  午觉: "wǔ jiào",
  闷棍: "mèn gùn",
  浪头: "làng tou",
  砚台: "yàn tái",
  油坊: "yóu fáng",
  学长: "xué zhǎng",
  过载: "guò zài",
  笔调: "bǐ diào",
  衣被: "yī bèi",
  畜产: "xù chǎn",
  调阅: "diào yuè",
  蛮干: "mán gàn",
  曾祖: "zēng zǔ",
  提干: "tí gàn",
  变调: "biàn diào",
  覆没: "fù mò",
  模子: "mú zi",
  乐律: "yuè lǜ",
  称心: "chèn xīn",
  木杆: "mù gān",
  重印: "chóng yìn",
  自省: "zì xǐng",
  提调: "tí diào",
  看相: "kàn xiàng",
  芋头: "yù tou",
  下切: "xià qiē",
  塞上: "sài shàng",
  铺张: "pū zhāng",
  藤蔓: "téng wàn",
  薄幸: "bó xìng",
  解数: "xiè shù",
  褪去: "tuì qù",
  霰弹: "xiàn dàn",
  柚木: "yóu mù",
  痕量: "hén liàng",
  雅乐: "yǎ yuè",
  号哭: "háo kū",
  诈降: "zhà xiáng",
  猪圈: "zhū juàn",
  咋舌: "zé shé",
  铣床: "xǐ chuáng",
  防弹: "fáng dàn",
  健将: "jiàn jiàng",
  丽水: "lí shuǐ",
  削发: "xuē fà",
  空当: "kòng dāng",
  多相: "duō xiàng",
  鲜见: "xiǎn jiàn",
  划桨: "huá jiǎng",
  载波: "zài bō",
  跳蚤: "tiào zao",
  俏皮: "qiào pí",
  吧嗒: "bā dā",
  结发: "jié fà",
  了断: "liǎo duàn",
  同调: "tóng diào",
  石磨: "shí mò",
  时差: "shí chā",
  鼻塞: "bí sè",
  挑子: "tiāo zi",
  推磨: "tuī mò",
  武侯: "wǔ hóu",
  抹煞: "mǒ shā",
  调转: "diào zhuǎn",
  籍没: "jí mò",
  还债: "huán zhài",
  调演: "diào yǎn",
  分划: "fēn huá",
  奇偶: "jī ǒu",
  断喝: "duàn hè",
  闷雷: "mèn léi",
  狼藉: "láng jí",
  饭量: "fàn liàng",
  还礼: "huán lǐ",
  转调: "zhuǎn diào",
  星相: "xīng xiàng",
  手相: "shǒu xiàng",
  配乐: "pèi yuè",
  盖头: "gài tou",
  连杆: "lián gǎn",
  簿记: "bù jì",
  刀把: "dāo bà",
  量词: "liàng cí",
  名角: "míng jué",
  步调: "bù diào",
  校本: "jiào běn",
  账簿: "zhàng bù",
  隽永: "juàn yǒng",
  稍为: "shāo wéi",
  易传: "yì zhuàn",
  乐谱: "yuè pǔ",
  牵累: "qiān lěi",
  答理: "dā li",
  喝斥: "hè chì",
  吟哦: "yín é",
  干渠: "gàn qú",
  海量: "hǎi liàng",
  精当: "jīng dàng",
  着床: "zhuó chuáng",
  月相: "yuè xiàng",
  庶几: "shù jī",
  宫观: "gōng guàn",
  论处: "lùn chǔ",
  征辟: "zhēng bì",
  厚朴: "hòu pò",
  介壳: "jiè qiào",
  吭哧: "kēng chī",
  咯血: "kǎ xiě",
  铺陈: "pū chén",
  重生: "chóng shēng",
  乐理: "yuè lǐ",
  哀号: "āi háo",
  藏历: "zàng lì",
  刚劲: "gāng jìng",
  削平: "xuē píng",
  浓荫: "nóng yīn",
  城垛: "chéng duǒ",
  当差: "dāng chāi",
  正传: "zhèng zhuàn",
  并处: "bìng chǔ",
  创面: "chuāng miàn",
  旦角: "dàn jué",
  薄礼: "bó lǐ",
  晃荡: "huàng dang",
  臊子: "sào zi",
  家什: "jiā shí",
  闷头: "mēn tóu",
  美发: "měi fà",
  度数: "dù shu",
  着凉: "zháo liáng",
  闯将: "chuǎng jiàng",
  几案: "jī àn",
  姘头: "pīn tou",
  差数: "chā shù",
  散碎: "sǎn suì",
  壅塞: "yōng sè",
  寒颤: "hán zhàn",
  牵强: "qiān qiǎng",
  无间: "wú jiàn",
  轮转: "lún zhuàn",
  号叫: "háo jiào",
  铺排: "pū pái",
  降伏: "xiáng fú",
  轧钢: "zhá gāng",
  东阿: "dōng ē",
  病假: "bìng jià",
  累加: "lěi jiā",
  梗塞: "gěng sè",
  弹夹: "dàn jiā",
  钻心: "zuān xīn",
  晃眼: "huǎng yǎn",
  魔爪: "mó zhǎo",
  标量: "biāo liàng",
  憋闷: "biē mèn",
  猜度: "cāi duó",
  处士: "chǔ shì",
  官差: "guān chāi",
  讨还: "tǎo huán",
  长门: "cháng mén",
  馏分: "liú fēn",
  里弄: "lǐ lòng",
  色相: "sè xiàng",
  雅兴: "yǎ xìng",
  角力: "jué lì",
  弹坑: "dàn kēng",
  枝杈: "zhī chà",
  夹具: "jiā jù",
  处刑: "chǔ xíng",
  悍将: "hàn jiàng",
  好学: "hào xué",
  好好: "hǎo hǎo",
  银发: "yín fà",
  扫把: "sào bǎ",
  法相: "fǎ xiàng",
  贵干: "guì gàn",
  供气: "gōng qì",
  空余: "kòng yú",
  捆扎: "kǔn zā",
  瘠薄: "jí bó",
  浆糊: "jiàng hu",
  嘎吱: "gā zhī",
  调令: "diào lìng",
  法帖: "fǎ tiè",
  淋病: "lìn bìng",
  调派: "diào pài",
  转盘: "zhuàn pán",
  供稿: "gōng gǎo",
  差官: "chāi guān",
  忧闷: "yōu mèn",
  教长: "jiào zhǎng",
  重唱: "chóng chàng",
  酒兴: "jiǔ xìng",
  乐坛: "yuè tán",
  花呢: "huā ní",
  叱喝: "chì hè",
  膀臂: "bǎng bì",
  得空: "dé kòng",
  转圈: "zhuàn quān",
  横暴: "hèng bào",
  哄抬: "hōng tái",
  引吭: "yǐn háng",
  载货: "zài huò",
  中计: "zhòng jì",
  官长: "guān zhǎng",
  相面: "xiàng miàn",
  看头: "kàn tou",
  盼头: "pàn tou",
  意兴: "yì xìng",
  军乐: "jūn yuè",
  累次: "lěi cì",
  骨嘟: "gǔ dū",
  燕赵: "yān zhào",
  报丧: "bào sāng",
  弥撒: "mí sa",
  挨斗: "ái dòu",
  扁舟: "piān zhōu",
  丑角: "chǒu jué",
  吊丧: "diào sāng",
  强将: "qiáng jiàng",
  重奏: "chóng zòu",
  发辫: "fà biàn",
  着魔: "zháo mó",
  着法: "zhāo fǎ",
  盛放: "shèng fàng",
  填塞: "tián sè",
  凶横: "xiōng hèng",
  稽首: "qǐ shǒu",
  碑帖: "bēi tiè",
  冲量: "chōng liàng",
  发菜: "fà cài",
  假发: "jiǎ fà",
  翻卷: "fān juǎn",
  小量: "xiǎo liàng",
  胶着: "jiāo zhuó",
  里子: "lǐ zi",
  调调: "diào diao",
  散兵: "sǎn bīng",
  高挑: "gāo tiǎo",
  播撒: "bō sǎ",
  夹心: "jiā xīn",
  扇动: "shān dòng",
  叨扰: "tāo rǎo",
  霓裳: "ní cháng",
  捻子: "niǎn zi",
  弥缝: "mí féng",
  撒布: "sǎ bù",
  场院: "cháng yuàn",
  省亲: "xǐng qīn",
  提拉: "tí lā",
  惯量: "guàn liàng",
  强逼: "qiáng bī",
  强征: "qiáng zhēng",
  晕车: "yùn chē",
  数道: "shù dào",
  带累: "dài lèi",
  拓本: "tà běn",
  嫌恶: "xián wù",
  宿将: "sù jiàng",
  龟裂: "jūn liè",
  缠夹: "chán jiā",
  发式: "fà shì",
  隔扇: "gé shàn",
  天分: "tiān fèn",
  癖好: "pǐ hào",
  四通: "sì tōng",
  白术: "bái zhú",
  划伤: "huá shāng",
  角斗: "jué dòu",
  听差: "tīng chāi",
  岁差: "suì chā",
  丧礼: "sāng lǐ",
  脉脉: "mò mò",
  削瘦: "xuē shòu",
  撒播: "sǎ bō",
  莎草: "suō cǎo",
  犍为: "qián wéi",
  调头: "diào tóu",
  龙卷: "lóng juǎn",
  外调: "wài diào",
  字帖: "zì tiè",
  卷发: "juǎn fà",
  揣度: "chuǎi duó",
  洋相: "yáng xiàng",
  散光: "sǎn guāng",
  骨碌: "gū lu",
  薄命: "bó mìng",
  笼头: "lóng tóu",
  咽炎: "yān yán",
  碌碡: "liù zhou",
  片儿: "piàn er",
  纤手: "qiàn shǒu",
  散体: "sǎn tǐ",
  内省: "nèi xǐng",
  强留: "qiáng liú",
  解送: "jiè sòng",
  反间: "fǎn jiàn",
  少壮: "shào zhuàng",
  留空: "liú kōng",
  告假: "gào jià",
  咳血: "ké xuè",
  薄暮: "bó mù",
  铺轨: "pū guǐ",
  磨削: "mó xuē",
  治丧: "zhì sāng",
  叉子: "chā zi",
  哄动: "hōng dòng",
  蛾子: "é zi",
  出落: "chū luò",
  股长: "gǔ zhǎng",
  贵处: "guì chù",
  还魂: "huán hún",
  例假: "lì jià",
  刹住: "shā zhù",
  身量: "shēn liàng",
  同好: "tóng hào",
  模量: "mó liàng",
  更生: "gēng shēng",
  服丧: "fú sāng",
  率直: "shuài zhí",
  字模: "zì mú",
  散架: "sǎn jià",
  答腔: "dā qiāng",
  交恶: "jiāo wù",
  薄情: "bó qíng",
  眼泡: "yǎn pāo",
  袅娜: "niǎo nuó",
  草垛: "cǎo duò",
  冲劲: "chòng jìn",
  呢喃: "ní nán",
  切中: "qiè zhòng",
  挑灯: "tiǎo dēng",
  还愿: "huán yuàn",
  激将: "jī jiàng",
  更鼓: "gēng gǔ",
  没药: "mò yào",
  败兴: "bài xìng",
  切面: "qiē miàn",
  散户: "sǎn hù",
  累进: "lěi jìn",
  背带: "bēi dài",
  秤杆: "chèng gǎn",
  碾坊: "niǎn fáng",
  簿子: "bù zi",
  扳手: "bān shǒu",
  铅山: "yán shān",
  儒将: "rú jiàng",
  重光: "chóng guāng",
  剪发: "jiǎn fà",
  长上: "zhǎng shàng",
  小传: "xiǎo zhuàn",
  压轴: "yā zhòu",
  弱冠: "ruò guàn",
  花卷: "huā juǎn",
  横祸: "hèng huò",
  夹克: "jiā kè",
  光晕: "guāng yùn",
  披靡: "pī mǐ",
  对调: "duì diào",
  夹持: "jiā chí",
  空额: "kòng é",
  平调: "píng diào",
  铺床: "pū chuáng",
  丧钟: "sāng zhōng",
  作乐: "zuò lè",
  少府: "shào fǔ",
  数数: "shuò shuò",
  奔头: "bèn tou",
  进给: "jìn jǐ",
  率性: "shuài xìng",
  乐子: "lè zi",
  绑扎: "bǎng zā",
  挑唆: "tiǎo suō",
  漂洗: "piǎo xǐ",
  夹墙: "jiā qiáng",
  咳喘: "ké chuǎn",
  乜斜: "miē xie",
  错处: "cuò chù",
  闷酒: "mèn jiǔ",
  时调: "shí diào",
  重孙: "chóng sūn",
  经幢: "jīng chuáng",
  圩场: "xū chǎng",
  调门: "diào mén",
  花头: "huā tóu",
  划拉: "huá la",
  套色: "tào shǎi",
  粗率: "cū shuài",
  相率: "xiāng shuài",
  款识: "kuǎn zhì",
  吁请: "yù qǐng",
  荫蔽: "yīn bì",
  文蛤: "wén gé",
  嘀嗒: "dī dā",
  调取: "diào qǔ",
  交差: "jiāo chāi",
  落子: "luò zǐ",
  相册: "xiàng cè",
  絮叨: "xù dao",
  落发: "luò fà",
  异相: "yì xiàng",
  浸没: "jìn mò",
  角抵: "jué dǐ",
  卸载: "xiè zài",
  春卷: "chūn juǎn",
  扎挣: "zhá zheng",
  畜养: "xù yǎng",
  吡咯: "bǐ luò",
  垛子: "duò zi",
  恶少: "è shào",
  发际: "fà jì",
  红苕: "hóng sháo",
  糨糊: "jiàng hu",
  哭丧: "kū sāng",
  稍息: "shào xī",
  晕船: "yùn chuán",
  校样: "jiào yàng",
  外差: "wài chā",
  脚爪: "jiǎo zhǎo",
  铺展: "pū zhǎn",
  芫荽: "yán sui",
  夹紧: "jiā jǐn",
  尿泡: "suī pào",
  丧乱: "sāng luàn",
  凶相: "xiōng xiàng",
  华发: "huá fà",
  打场: "dǎ cháng",
  云量: "yún liàng",
  正切: "zhèng qiē",
  划拳: "huá quán",
  划艇: "huá tǐng",
  评传: "píng zhuàn",
  拉纤: "lā qiàn",
  句读: "jù dòu",
  散剂: "sǎn jì",
  骨殖: "gǔ shi",
  塞音: "sè yīn",
  铺叙: "pū xù",
  阏氏: "yān zhī",
  冷颤: "lěng zhàn",
  煞住: "shā zhù",
  少男: "shào nán",
  管乐: "guǎn yuè",
  号啕: "háo táo",
  纳降: "nà xiáng",
  拥塞: "yōng sè",
  万乘: "wàn shèng",
  杆儿: "gǎn ér",
  葛藤: "gé téng",
  簿籍: "bù jí",
  皮夹: "pí jiā",
  校准: "jiào zhǔn",
  允当: "yǔn dàng",
  器量: "qì liàng",
  选调: "xuǎn diào",
  扮相: "bàn xiàng",
  干才: "gàn cái",
  基干: "jī gàn",
  割切: "gē qiē",
  国乐: "guó yuè",
  卡壳: "qiǎ ké",
  辟谷: "bì gǔ",
  磨房: "mò fáng",
  咿呀: "yī yā",
  芥末: "jiè mo",
  薄技: "bó jì",
  产假: "chǎn jià",
  诗兴: "shī xìng",
  重出: "chóng chū",
  转椅: "zhuàn yǐ",
  酌量: "zhuó liang",
  簿册: "bù cè",
  藏青: "zàng qīng",
  的士: "dī shì",
  调人: "diào rén",
  解元: "jiè yuán",
  茎干: "jīng gàn",
  巨量: "jù liàng",
  榔头: "láng tou",
  率真: "shuài zhēn",
  喷香: "pèn xiāng",
  锁钥: "suǒ yuè",
  虾蟆: "há má",
  相图: "xiàng tú",
  兴会: "xìng huì",
  灶头: "zào tóu",
  重婚: "chóng hūn",
  钻洞: "zuān dòng",
  忖度: "cǔn duó",
  党参: "dǎng shēn",
  调温: "diào wēn",
  杆塔: "gān tǎ",
  葛布: "gé bù",
  拱券: "gǒng xuàn",
  夹生: "jiā shēng",
  露馅: "lòu xiàn",
  恰切: "qià qiè",
  散见: "sǎn jiàn",
  哨卡: "shào qiǎ",
  烫发: "tàng fà",
  体量: "tǐ liàng",
  挺括: "tǐng kuò",
  系带: "jì dài",
  相士: "xiàng shì",
  羊圈: "yáng juàn",
  转矩: "zhuàn jǔ",
  吧台: "bā tái",
  苍术: "cāng zhú",
  菲薄: "fěi bó",
  蛤蚧: "gé jiè",
  蛤蜊: "gé lí",
  瓜蔓: "guā wàn",
  怪相: "guài xiàng",
  临帖: "lín tiè",
  女红: "nǚ gōng",
  刨床: "bào chuáng",
  翘楚: "qiáo chǔ",
  数九: "shǔ jiǔ",
  谈兴: "tán xìng",
  雄劲: "xióng jìng",
  扎染: "zā rǎn",
  遮荫: "zhē yīn",
  周正: "zhōu zhèng",
  赚头: "zhuàn tou",
  扒手: "pá shǒu",
  搀和: "chān huo",
  诚朴: "chéng pǔ",
  肚量: "dù liàng",
  干结: "gān jié",
  工尺: "gōng chě",
  家累: "jiā lěi",
  曲水: "qū shuǐ",
  沙参: "shā shēn",
  挑花: "tiǎo huā",
  阿门: "ā mén",
  背篓: "bēi lǒu",
  瘪三: "biē sān",
  裁处: "cái chǔ",
  创痛: "chuāng tòng",
  福相: "fú xiàng",
  更动: "gēng dòng",
  豪兴: "háo xìng",
  还阳: "huán yáng",
  还嘴: "huán zuǐ",
  借调: "jiè diào",
  卷云: "juǎn yún",
  流弹: "liú dàn",
  想头: "xiǎng tou",
  削价: "xuē jià",
  校阅: "jiào yuè",
  雅量: "yǎ liàng",
  别传: "bié zhuàn",
  薄酒: "bó jiǔ",
  春假: "chūn jià",
  发妻: "fà qī",
  哗哗: "huā huā",
  宽绰: "kuān chuo",
  了悟: "liǎo wù",
  切花: "qiē huā",
  审度: "shěn duó",
  应许: "yīng xǔ",
  转台: "zhuàn tái",
  仔猪: "zǐ zhū",
  裁量: "cái liáng",
  藏戏: "zàng xì",
  乘兴: "chéng xìng",
  绸缪: "chóu móu",
  摧折: "cuī zhé",
  调经: "tiáo jīng",
  调职: "diào zhí",
  缝缀: "féng zhuì",
  骨朵: "gū duǒ",
  核儿: "hú er",
  恒量: "héng liàng",
  还价: "huán jià",
  浑朴: "hún pǔ",
  苦差: "kǔ chāi",
  面糊: "miàn hù",
  煞车: "shā chē",
  省视: "xǐng shì",
  什锦: "shí jǐn",
  信差: "xìn chāi",
  余切: "yú qiē",
  攒眉: "cuán méi",
  炸糕: "zhá gāo",
  钻杆: "zuàn gǎn",
  扒灰: "pá huī",
  拌和: "bàn huò",
  长调: "cháng diào",
  大溜: "dà liù",
  抖搂: "dǒu lōu",
  飞转: "fēi zhuàn",
  干仗: "gàn zhàng",
  好胜: "hào shèng",
  画片: "huà piàn",
  搅混: "jiǎo hún",
  螺杆: "luó gǎn",
  木模: "mù mú",
  怒号: "nù háo",
  频数: "pín shù",
  无宁: "wú níng",
  遗少: "yí shào",
  邮差: "yóu chāi",
  占卦: "zhān guà",
  占星: "zhān xīng",
  重审: "chóng shěn",
  自量: "zì liàng",
  调防: "diào fáng",
  发廊: "fà láng",
  反调: "fǎn diào",
  缝子: "fèng zi",
  更夫: "gēng fū",
  骨子: "gǔ zi",
  光杆: "guāng gǎn",
  夹棍: "jiā gùn",
  居丧: "jū sāng",
  巨贾: "jù gǔ",
  看押: "kān yā",
  空转: "kōng zhuàn",
  量力: "liàng lì",
  炮烙: "páo luò",
  赔还: "péi huán",
  扑扇: "pū shān",
  散记: "sǎn jì",
  散件: "sǎn jiàn",
  删削: "shān xuē",
  射干: "shè gàn",
  条几: "tiáo jī",
  偷空: "tōu kòng",
  削壁: "xuē bì",
  校核: "jiào hé",
  阴干: "yīn gān",
  择菜: "zhái cài",
  重九: "chóng jiǔ",
  主调: "zhǔ diào",
  自禁: "zì jīn",
  吧唧: "bā jī",
  便溺: "biàn niào",
  词调: "cí diào",
  叨咕: "dáo gu",
  落枕: "lào zhěn",
  铺砌: "pū qì",
  刷白: "shuà bái",
  委靡: "wěi mǐ",
  系泊: "xì bó",
  相马: "xiàng mǎ",
  熨帖: "yù tiē",
  转筋: "zhuàn jīn",
  棒喝: "bàng hè",
  傧相: "bīn xiàng",
  镐头: "gǎo tóu",
  间苗: "jiàn miáo",
  乐池: "yuè chí",
  卖相: "mài xiàng",
  屏弃: "bǐng qì",
  铅弹: "qiān dàn",
  切变: "qiē biàn",
  请调: "qǐng diào",
  群氓: "qún méng",
  散板: "sǎn bǎn",
  省察: "xǐng chá",
  事假: "shì jià",
  纤绳: "qiàn shéng",
  重影: "chóng yǐng",
  耕种: "gēng zhòng",
  种地: "zhòng dì",
  种菜: "zhòng cài",
  栽种: "zāi zhòng",
  接种: "jiē zhòng",
  垦种: "kěn zhòng",
  种殖: "zhòng zhí",
  种瓜: "zhòng guā",
  种豆: "zhòng dòu",
  种树: "zhòng shù",
  睡着: "shuì zháo",
  笼子: "lóng zi",
  重启: "chóng qǐ",
  重整: "chóng zhěng",
  重弹: "chóng tán",
  重足: "chóng zú",
  重山: "chóng shān",
  重游: "chóng yóu",
  重峦: "chóng luán",
  爷爷: "yé ye",
  奶奶: "nǎi nai",
  姥爷: "lǎo ye",
  爸爸: "bà ba",
  妈妈: "mā ma",
  婶婶: "shěn shen",
  舅舅: "jiù jiu",
  姑姑: "gū gu",
  叔叔: "shū shu",
  姨夫: "yí fu",
  舅母: "jiù mu",
  姑父: "gū fu",
  姐夫: "jiě fu",
  婆婆: "pó po",
  公公: "gōng gong",
  舅子: "jiù zi",
  姐姐: "jiě jie",
  哥哥: "gē ge",
  妹妹: "mèi mei",
  妹夫: "mèi fu",
  姨子: "yí zi",
  宝宝: "bǎo bao",
  娃娃: "wá wa",
  孩子: "hái zi",
  日子: "rì zi",
  样子: "yàng zi",
  狮子: "shī zi",
  身子: "shēn zi",
  架子: "jià zi",
  嫂子: "sǎo zi",
  鼻子: "bí zi",
  亭子: "tíng zi",
  折子: "zhé zi",
  面子: "miàn zi",
  脖子: "bó zi",
  辈子: "bèi zi",
  帽子: "mào zi",
  拍子: "pāi zi",
  柱子: "zhù zi",
  辫子: "biàn zi",
  鸽子: "gē zi",
  房子: "fáng zi",
  丸子: "wán zi",
  摊子: "tān zi",
  牌子: "pái zi",
  胡子: "hú zi",
  鬼子: "guǐ zi",
  矮子: "ǎi zi",
  鸭子: "yā zi",
  小子: "xiǎo zi",
  影子: "yǐng zi",
  屋子: "wū zi",
  对子: "duì zi",
  点子: "diǎn zi",
  本子: "běn zi",
  种子: "zhǒng zi",
  儿子: "ér zi",
  兔子: "tù zi",
  骗子: "piàn zi",
  院子: "yuàn zi",
  猴子: "hóu zi",
  嗓子: "sǎng zi",
  侄子: "zhí zi",
  柿子: "shì zi",
  钳子: "qián zi",
  虱子: "shī zi",
  瓶子: "píng zi",
  豹子: "bào zi",
  筷子: "kuài zi",
  篮子: "lán zi",
  绳子: "shéng zi",
  嘴巴: "zuǐ ba",
  耳朵: "ěr duo",
  茄子: "qié zi",
  蚌埠: "bèng bù",
  崆峒: "kōng tóng",
  琵琶: "pí pa",
  蘑菇: "mó gu",
  葫芦: "hú lu",
  狐狸: "hú li",
  桔子: "jú zi",
  盒子: "hé zi",
  桌子: "zhuō zi",
  竹子: "zhú zi",
  师傅: "shī fu",
  衣服: "yī fu",
  袜子: "wà zi",
  杯子: "bēi zi",
  刺猬: "cì wei",
  麦子: "mài zi",
  队伍: "duì wu",
  知了: "zhī liǎo",
  鱼儿: "yú er",
  馄饨: "hún tun",
  灯笼: "dēng long",
  庄稼: "zhuāng jia",
  聪明: "cōng ming",
  镜子: "jìng zi",
  银子: "yín zi",
  盘子: "pán zi",
  了却: "liǎo què",
  力气: "lì qi",
  席子: "xí zi",
  林子: "lín zi",
  朝霞: "zhāo xiá",
  朝夕: "zhāo xī",
  朝气: "zhāo qì",
  翅膀: "chì bǎng",
  省长: "shěng zhǎng",
  臧否: "zāng pǐ",
  否泰: "pǐ tài",
  变得: "biàn de",
  丈夫: "zhàng fu",
  豆腐: "dòu fu",
  笔杆: "bǐ gǎn",
  枞阳: "zōng yáng",
  行人: "xíng rén",
  打着: "dǎ zhe",
  // 一字不变调的词语（需要增补更多）
  // 有歧义的词：一楼、一栋、一层、一排、一连
  // “一楼”这个词，上下文语意是“一整栋楼”时，需要变调成四声；我住一楼时，则是一声
  第一: "dì yī",
  万一: "wàn yī",
  之一: "zhī yī",
  得之: "dé zhī",
  统一: "tǒng yī",
  唯一: "wéi yī",
  专一: "zhuān yī",
  单一: "dān yī",
  如一: "rú yī",
  其一: "qí yī",
  合一: "hé yī",
  逐一: "zhú yī",
  周一: "zhōu yī",
  初一: "chū yī",
  研一: "yán yī",
  归一: "guī yī",
  假一: "jiǎ yī",
  闻一: "wén yī",
  了了: "liǎo liǎo",
  公了: "gōng liǎo",
  私了: "sī liǎo",
  // 一 发音
  一月: "yī yuè",
  一号: "yī hào",
  一级: "yī jí",
  一等: "yī děng",
  一哥: "yī gē",
  月一: "yuè yī",
  一一: "yī yī",
  二一: "èr yī",
  三一: "sān yī",
  四一: "sì yī",
  五一: "wǔ yī",
  六一: "liù yī",
  七一: "qī yī",
  八一: "bā yī",
  九一: "jiǔ yī",
  "一〇": "yī líng",
  一零: "yī líng",
  一二: "yī èr",
  一三: "yī sān",
  一四: "yī sì",
  一五: "yī wǔ",
  一六: "yī liù",
  一七: "yī qī",
  一八: "yī bā",
  一九: "yī jiǔ",
  一又: "yī yòu",
  一饼: "yī bǐng",
  一楼: "yī lóu",
  为例: "wéi lì",
  为准: "wéi zhǔn",
  沧海: "cāng hǎi",
  难为: "nán wéi",
  责难: "zé nàn",
  患难: "huàn nàn",
  磨难: "mó nàn",
  大难: "dà nàn",
  刁难: "diāo nàn",
  殉难: "xùn nàn",
  落难: "luò nàn",
  罹难: "lí nàn",
  灾难: "zāi nàn",
  难民: "nàn mín",
  苦难: "kǔ nàn",
  危难: "wēi nàn",
  发难: "fā nàn",
  逃难: "táo nàn",
  避难: "bì nàn",
  遇难: "yù nàn",
  阻难: "zǔ nàn",
  厄难: "è nàn",
  徇难: "xùn nàn",
  空难: "kōng nàn",
  喜欢: "xǐ huan",
  朝朝: "zhāo zhāo",
  不行: "bù xíng",
  轧轧: "yà yà",
  弯曲: "wān qū",
  扭曲: "niǔ qū",
  曲直: "qū zhí",
  委曲: "wěi qū",
  酒曲: "jiǔ qū",
  曲径: "qū jìng",
  曲解: "qū jiě",
  歪曲: "wāi qū",
  曲线: "qū xiàn",
  曲阜: "qū fù",
  九曲: "jiǔ qū",
  曲折: "qū zhé",
  曲肱: "qū gōng",
  曲意: "qū yì",
  仡佬: "gē lǎo"
};
const Pattern2 = Object.keys(DICT2).map((key) => ({
  zh: key,
  pinyin: DICT2[key],
  probability: 2e-8,
  length: 2,
  priority: Priority.Normal,
  dict: Symbol("dict2")
}));
const DICT3 = {
  为什么: "wèi shén me",
  实际上: "shí jì shang",
  检察长: "jiǎn chá zhǎng",
  干什么: "gàn shén me",
  这会儿: "zhè huì er",
  尽可能: "jǐn kě néng",
  董事长: "dǒng shì zhǎng",
  了不起: "liǎo bù qǐ",
  参谋长: "cān móu zhǎng",
  朝鲜族: "cháo xiǎn zú",
  海内外: "hǎi nèi wài",
  禁不住: "jīn bú zhù",
  柏拉图: "bó lā tú",
  不在乎: "bú zài hu",
  洛杉矶: "luò shān jī",
  有点儿: "yǒu diǎn er",
  迫击炮: "pǎi jī pào",
  不得了: "bù dé liǎo",
  马尾松: "mǎ wěi sōng",
  运输量: "yùn shū liàng",
  发脾气: "fā pí qi",
  士大夫: "shì dà fū",
  鸭绿江: "yā lù jiāng",
  压根儿: "yà gēn er",
  对得起: "duì de qǐ",
  那会儿: "nà huì er",
  自个儿: "zì gě er",
  物理量: "wù lǐ liàng",
  怎么着: "zěn me zhāo",
  明晃晃: "míng huǎng huǎng",
  节假日: "jié jià rì",
  心里话: "xīn lǐ huà",
  发行量: "fā xíng liàng",
  兴冲冲: "xìng chōng chōng",
  分子量: "fēn zǐ liàng",
  国子监: "guó zǐ jiàn",
  老大难: "lǎo dà nán",
  党内外: "dǎng nèi wài",
  这么着: "zhè me zhāo",
  少奶奶: "shào nǎi nai",
  暗地里: "àn dì lǐ",
  更年期: "gēng nián qī",
  工作量: "gōng zuò liàng",
  背地里: "bèi dì lǐ",
  山里红: "shān li hóng",
  好好儿: "hǎo hāo er",
  交响乐: "jiāo xiǎng yuè",
  好意思: "hǎo yì si",
  吐谷浑: "tǔ yù hún",
  没意思: "méi yì si",
  理发师: "lǐ fà shī",
  塔什干: "tǎ shí gān",
  充其量: "chōng qí liàng",
  靠得住: "kào de zhù",
  车行道: "chē xíng dào",
  人行道: "rén xíng dào",
  中郎将: "zhōng láng jiàng",
  照明弹: "zhào míng dàn",
  烟幕弹: "yān mù dàn",
  没奈何: "mò nài hé",
  乱哄哄: "luàn hōng hōng",
  惠更斯: "huì gēng sī",
  载重量: "zài zhòng liàng",
  瞧得起: "qiáo de qǐ",
  纪传体: "jì zhuàn tǐ",
  阿房宫: "ē páng gōng",
  卷心菜: "juǎn xīn cài",
  戏班子: "xì bān zi",
  过得去: "guò de qù",
  花岗石: "huā gāng shí",
  外甥女: "wài sheng nǚ",
  团团转: "tuán tuán zhuàn",
  大堡礁: "dà bǎo jiāo",
  燃烧弹: "rán shāo dàn",
  劳什子: "láo shí zi",
  摇滚乐: "yáo gǔn yuè",
  夹竹桃: "jiā zhú táo",
  闹哄哄: "nào hōng hōng",
  三连冠: "sān lián guàn",
  重头戏: "zhòng tóu xì",
  二人转: "èr rén zhuàn",
  节骨眼: "jiē gǔ yǎn",
  知识面: "zhī shi miàn",
  护士长: "hù shi zhǎng",
  信号弹: "xìn hào dàn",
  干电池: "gān diàn chí",
  枪杆子: "qiāng gǎn zi",
  哭丧棒: "kū sāng bàng",
  鼻咽癌: "bí yān ái",
  瓦岗军: "wǎ gāng jūn",
  买得起: "mǎi de qǐ",
  癞蛤蟆: "lài há ma",
  脊梁骨: "jǐ liang gǔ",
  子母弹: "zǐ mǔ dàn",
  开小差: "kāi xiǎo chāi",
  女强人: "nǚ qiáng rén",
  英雄传: "yīng xióng zhuàn",
  爵士乐: "jué shì yuè",
  说笑话: "shuō xiào hua",
  碰头会: "pèng tóu huì",
  玻璃钢: "bō li gāng",
  曳光弹: "yè guāng dàn",
  少林拳: "shào lín quán",
  咏叹调: "yǒng tàn diào",
  少先队: "shào xiān duì",
  灵长目: "líng zhǎng mù",
  对着干: "duì zhe gàn",
  蒙蒙亮: "méng méng liàng",
  软骨头: "ruǎn gǔ tou",
  铺盖卷: "pū gài juǎn",
  和稀泥: "huò xī ní",
  背黑锅: "bēi hēi guō",
  红彤彤: "hóng tōng tōng",
  武侯祠: "wǔ hóu cí",
  打哆嗦: "dǎ duō suo",
  户口簿: "hù kǒu bù",
  马尾藻: "mǎ wěi zǎo",
  夜猫子: "yè māo zi",
  打手势: "dǎ shǒu shì",
  龙王爷: "lóng wáng yé",
  气头上: "qì tóu shang",
  糊涂虫: "hú tu chóng",
  笔杆子: "bǐ gǎn zi",
  占便宜: "zhàn pián yi",
  打主意: "dǎ zhǔ yì",
  多弹头: "duō dàn tóu",
  露一手: "lòu yì shǒu",
  堰塞湖: "yàn sè hú",
  保得住: "bǎo de zhù",
  趵突泉: "bào tū quán",
  奥得河: "ào de hé",
  司务长: "sī wù zhǎng",
  禁不起: "jīn bù qǐ",
  什刹海: "shí chà hǎi",
  莲花落: "lián huā lào",
  见世面: "jiàn shì miàn",
  豁出去: "huō chū qù",
  电位差: "diàn wèi chā",
  挨个儿: "āi gè er",
  那阵儿: "nà zhèn er",
  肺活量: "fèi huó liàng",
  大师傅: "dà shī fu",
  掷弹筒: "zhì dàn tǒng",
  打呼噜: "dǎ hū lu",
  广渠门: "ān qú mén",
  未见得: "wèi jiàn dé",
  大婶儿: "dà shěn er",
  谈得来: "tán de lái",
  脚丫子: "jiǎo yā zi",
  空包弹: "kōng bāo dàn",
  窝里斗: "wō li dòu",
  弹着点: "dàn zhuó diǎn",
  个头儿: "gè tóu er",
  看得起: "kàn de qǐ",
  糊涂账: "hú tu zhàng",
  大猩猩: "dà xīng xing",
  禁得起: "jīn de qǐ",
  法相宗: "fǎ xiàng zōng",
  可怜相: "kě lián xiàng",
  吃得下: "chī de xià",
  汉堡包: "hàn bǎo bāo",
  闹嚷嚷: "nào rāng rāng",
  数来宝: "shǔ lái bǎo",
  合得来: "hé de lái",
  干性油: "gān xìng yóu",
  闷葫芦: "mèn hú lu",
  呱呱叫: "guā guā jiào",
  西洋参: "xī yáng shēn",
  林荫道: "lín yīn dào",
  拉家常: "lā jiā cháng",
  卷铺盖: "juǎn pū gài",
  过得硬: "guò de yìng",
  飞将军: "fēi jiāng jūn",
  挑大梁: "tiǎo dà liáng",
  哈巴狗: "hǎ ba gǒu",
  过家家: "guò jiā jiā",
  催泪弹: "cuī lèi dàn",
  雨夹雪: "yǔ jiā xuě",
  敲竹杠: "qiāo zhú gàng",
  列车长: "liè chē zhǎng",
  华达呢: "huá dá ní",
  犯得着: "fàn de zháo",
  土疙瘩: "tǔ gē da",
  煞风景: "shā fēng jǐng",
  轻量级: "qīng liàng jí",
  羞答答: "xiū dā dā",
  石子儿: "shí zǐ er",
  达姆弹: "dá mǔ dàn",
  科教片: "kē jiào piān",
  侃大山: "kǎn dà shān",
  丁点儿: "dīng diǎn er",
  吃得消: "chī de xiāo",
  捋虎须: "luō hǔ xū",
  高丽参: "gāo lí shēn",
  众生相: "zhòng shēng xiàng",
  咽峡炎: "yān xiá yán",
  禁得住: "jīn de zhù",
  吃得开: "chī de kāi",
  柞丝绸: "zuò sī chóu",
  应声虫: "yìng shēng chóng",
  数得着: "shǔ de zháo",
  傻劲儿: "shǎ jìn er",
  铅玻璃: "qiān bō li",
  可的松: "kě dì sōng",
  划得来: "huá de lái",
  晕乎乎: "yūn hū hū",
  屎壳郎: "shǐ ke làng",
  尥蹶子: "liào juě zi",
  藏红花: "zàng hóng huā",
  闷罐车: "mèn guàn chē",
  卡脖子: "qiǎ bó zi",
  红澄澄: "hóng deng deng",
  赶得及: "gǎn de jí",
  当间儿: "dāng jiàn er",
  露马脚: "lòu mǎ jiǎo",
  鸡内金: "jī nèi jīn",
  犯得上: "fàn de shàng",
  钉齿耙: "dīng chǐ bà",
  饱和点: "bǎo hé diǎn",
  龙爪槐: "lóng zhǎo huái",
  喝倒彩: "hè dào cǎi",
  定冠词: "dìng guàn cí",
  担担面: "dàn dan miàn",
  吃得住: "chī de zhù",
  爪尖儿: "zhuǎ jiān er",
  支着儿: "zhī zhāo er",
  折跟头: "zhē gēn tou",
  阴着儿: "yīn zhāo er",
  烟卷儿: "yān juǎn er",
  宣传弹: "xuān chuán dàn",
  信皮儿: "xìn pí er",
  弦切角: "xián qiē jiǎo",
  缩砂密: "sù shā mì",
  说得来: "shuō de lái",
  水漂儿: "shuǐ piāo er",
  耍笔杆: "shuǎ bǐ gǎn",
  数得上: "shǔ de shàng",
  数不着: "shǔ bù zháo",
  数不清: "shǔ bù qīng",
  什件儿: "shí jiàn er",
  生死簿: "shēng sǐ bù",
  扇风机: "shān fēng jī",
  撒呓挣: "sā yì zheng",
  日记簿: "rì jì bù",
  热得快: "rè de kuài",
  亲家公: "qìng jia gōng",
  奇函数: "jī hán shù",
  拍纸簿: "pāi zhǐ bù",
  努劲儿: "nǔ jìn er",
  泥娃娃: "ní wá wa",
  内切圆: "nèi qiē yuán",
  哪会儿: "nǎ huì er",
  闷头儿: "mēn tóu er",
  没谱儿: "méi pǔ er",
  铆劲儿: "mǎo jìn er",
  溜肩膀: "liū jiān bǎng",
  了望台: "liào wàng tái",
  老来少: "lǎo lái shào",
  坤角儿: "kūn jué er",
  考勤簿: "kǎo qín bù",
  卷笔刀: "juǎn bǐ dāo",
  进给量: "jìn jǐ liàng",
  划不来: "huá bù lái",
  汗褂儿: "hàn guà er",
  鼓囊囊: "gǔ nāng nāng",
  够劲儿: "gòu jìn er",
  公切线: "gōng qiē xiàn",
  搁得住: "gé de zhù",
  赶浪头: "gǎn làng tóu",
  赶得上: "gǎn de shàng",
  干酵母: "gān jiào mǔ",
  嘎渣儿: "gā zhā er",
  嘎嘣脆: "gā bēng cuì",
  对得住: "duì de zhù",
  逗闷子: "dòu mèn zi",
  顶呱呱: "dǐng guā guā",
  滴溜儿: "dī liù er",
  大轴子: "dà zhòu zi",
  打板子: "dǎ bǎn zi",
  寸劲儿: "cùn jìn er",
  醋劲儿: "cù jìn er",
  揣手儿: "chuāi shǒu er",
  冲劲儿: "chòng jìn er",
  吃得来: "chī de lái",
  不更事: "bù gēng shì",
  奔头儿: "bèn tou er",
  百夫长: "bǎi fū zhǎng",
  娃娃亲: "wá wa qīn",
  死劲儿: "sǐ jìn er",
  骨朵儿: "gū duǒ er",
  功劳簿: "gōng láo bù",
  都江堰: "dū jiāng yàn",
  一担水: "yí dàn shuǐ",
  否极泰: "pǐ jí tài",
  泰来否: "tài lái pǐ",
  咳特灵: "ké tè líng",
  开户行: "kāi hù háng",
  郦食其: "lì yì jī",
  花事了: "huā shì liǎo",
  // 一字变调的词语（与两个字的字典冲突，故需要重新定义）
  一更更: "yì gēng gēng",
  一重山: "yì chóng shān",
  风一更: "fēng yì gēng",
  雪一更: "xuě yì gēng",
  归一码: "guī yì mǎ",
  // 一字不变调的词语（需要增补更多）
  星期一: "xīng qī yī",
  礼拜一: "lǐ bài yī",
  一季度: "yī jì dù",
  一月一: "yī yuè yī",
  一字马: "yī zì mǎ",
  一是一: "yī shì yī",
  一次方: "yī cì fāng",
  一阳指: "yī yáng zhǐ",
  一字决: "yī zì jué",
  一年级: "yī nián jí",
  一不做: "yī bú zuò",
  屈戌儿: "qū qu ér",
  难为水: "nán wéi shuǐ",
  难为情: "nán wéi qíng",
  行一行: "xíng yì háng",
  别别的: "biè bié de",
  干哪行: "gàn nǎ háng",
  干一行: "gàn yì háng",
  曲别针: "qū bié zhēn"
};
const Pattern3 = Object.keys(DICT3).map((key) => ({
  zh: key,
  pinyin: DICT3[key],
  probability: 2e-8,
  length: 3,
  priority: Priority.Normal,
  dict: Symbol("dict3")
}));
const DICT4 = {
  成吉思汗: "chéng jí sī hán",
  四通八达: "sì tōng bā dá",
  一模一样: "yì mú yí yàng",
  青藏高原: "qīng zàng gāo yuán",
  阿弥陀佛: "ē mí tuó fó",
  解放思想: "jiè fàng sī xiǎng",
  所作所为: "suǒ zuò suǒ wéi",
  迷迷糊糊: "mí mí hu hū",
  荷枪实弹: "hè qiāng shí dàn",
  兴高采烈: "xìng gāo cǎi liè",
  无能为力: "wú néng wéi lì",
  布鲁塞尔: "bù lǔ sài ěr",
  为所欲为: "wéi suǒ yù wéi",
  克什米尔: "kè shí mǐ ěr",
  没完没了: "méi wán méi liǎo",
  不为人知: "bù wéi rén zhī",
  结结巴巴: "jiē jiē bā bā",
  前仆后继: "qián pū hòu jì",
  铺天盖地: "pū tiān gài dì",
  直截了当: "zhí jié liǎo dàng",
  供不应求: "gōng bú yìng qiú",
  御史大夫: "yù shǐ dà fū",
  不为瓦全: "bù wéi wǎ quán",
  不可收拾: "bù kě shōu shi",
  胡作非为: "hú zuò fēi wéi",
  分毫不差: "fēn háo bú chà",
  模模糊糊: "mó mó hu hū",
  不足为奇: "bù zú wéi qí",
  悄无声息: "qiǎo wú shēng xī",
  了如指掌: "liǎo rú zhǐ zhǎng",
  深恶痛绝: "shēn wù tòng jué",
  高高兴兴: "gāo gāo xìng xìng",
  唉声叹气: "āi shēng tàn qì",
  汉藏语系: "hàn zàng yǔ xì",
  处心积虑: "chǔ xīn jī lǜ",
  泣不成声: "qì bù chéng shēng",
  半夜三更: "bàn yè sān gēng",
  失魂落魄: "shī hún luò pò",
  二十八宿: "èr shí bā xiù",
  转来转去: "zhuàn lái zhuàn qù",
  数以万计: "shǔ yǐ wàn jì",
  相依为命: "xiāng yī wéi mìng",
  恋恋不舍: "liàn liàn bù shě",
  屈指可数: "qū zhǐ kě shǔ",
  神出鬼没: "shén chū guǐ mò",
  结结实实: "jiē jiē shí shí",
  有的放矢: "yǒu dì fàng shǐ",
  叽哩咕噜: "jī lǐ gū lū",
  调兵遣将: "diào bīng qiǎn jiàng",
  载歌载舞: "zài gē zài wǔ",
  转危为安: "zhuǎn wēi wéi ān",
  踏踏实实: "tā tā shi shí",
  桑给巴尔: "sāng jǐ bā ěr",
  装模作样: "zhuāng mú zuò yàng",
  见义勇为: "jiàn yì yǒng wéi",
  相差无几: "xiāng chā wú jǐ",
  叹为观止: "tàn wéi guān zhǐ",
  闷闷不乐: "mèn mèn bú lè",
  喜怒哀乐: "xǐ nù āi lè",
  鲜为人知: "xiǎn wéi rén zhī",
  张牙舞爪: "zhāng yá wǔ zhǎo",
  为非作歹: "wéi fēi zuò dǎi",
  含糊其辞: "hán hú qí cí",
  疲于奔命: "pí yú bēn mìng",
  勉为其难: "miǎn wéi qí nán",
  依依不舍: "yī yī bù shě",
  顶头上司: "dǐng tóu shàng si",
  不着边际: "bù zhuó biān jì",
  大模大样: "dà mú dà yàng",
  寻欢作乐: "xún huān zuò lè",
  一走了之: "yì zǒu liǎo zhī",
  字里行间: "zì lǐ háng jiān",
  含含糊糊: "hán hán hu hū",
  恰如其分: "qià rú qí fèn",
  破涕为笑: "pò tì wéi xiào",
  深更半夜: "shēn gēng bàn yè",
  千差万别: "qiān chā wàn bié",
  数不胜数: "shǔ bú shèng shǔ",
  据为己有: "jù wéi jǐ yǒu",
  天旋地转: "tiān xuán dì zhuàn",
  养尊处优: "yǎng zūn chǔ yōu",
  玻璃纤维: "bō li xiān wéi",
  吵吵闹闹: "chāo chao nào nào",
  晕头转向: "yūn tóu zhuàn xiàng",
  土生土长: "tǔ shēng tǔ zhǎng",
  宁死不屈: "nìng sǐ bù qū",
  不省人事: "bù xǐng rén shì",
  尽力而为: "jìn lì ér wéi",
  精明强干: "jīng míng qiáng gàn",
  唠唠叨叨: "láo lao dāo dāo",
  叽叽喳喳: "jī ji zhā zhā",
  功不可没: "gōng bù kě mò",
  锲而不舍: "qiè ér bù shě",
  排忧解难: "pái yōu jiě nàn",
  稀里糊涂: "xī li hú tú",
  各有所长: "gè yǒu suǒ cháng",
  的的确确: "dí dí què què",
  哄堂大笑: "hōng táng dà xiào",
  听而不闻: "tīng ér bù wén",
  刀耕火种: "dāo gēng huǒ zhòng",
  内分泌腺: "nèi fèn mì xiàn",
  化险为夷: "huà xiǎn wéi yí",
  百发百中: "bǎi fā bǎi zhòng",
  重见天日: "chóng jiàn tiān rì",
  反败为胜: "fǎn bài wéi shèng",
  一了百了: "yì liǎo bǎi liǎo",
  大大咧咧: "dà da liē liē",
  心急火燎: "xīn jí huǒ liǎo",
  粗心大意: "cū xīn dà yi",
  鸡皮疙瘩: "jī pí gē da",
  夷为平地: "yí wéi píng dì",
  日积月累: "rì jī yuè lěi",
  设身处地: "shè shēn chǔ dì",
  投其所好: "tóu qí suǒ hào",
  间不容发: "jiān bù róng fà",
  人满为患: "rén mǎn wéi huàn",
  穷追不舍: "qióng zhuī bù shě",
  为时已晚: "wéi shí yǐ wǎn",
  如数家珍: "rú shǔ jiā zhēn",
  心里有数: "xīn lǐ yǒu shù",
  以牙还牙: "yǐ yá huán yá",
  神不守舍: "shén bù shǒu shě",
  孟什维克: "mèng shí wéi kè",
  各自为战: "gè zì wéi zhàn",
  怨声载道: "yuàn shēng zài dào",
  救苦救难: "jiù kǔ jiù nàn",
  好好先生: "hǎo hǎo xiān sheng",
  怪模怪样: "guài mú guài yàng",
  抛头露面: "pāo tóu lù miàn",
  游手好闲: "yóu shǒu hào xián",
  无所不为: "wú suǒ bù wéi",
  调虎离山: "diào hǔ lí shān",
  步步为营: "bù bù wéi yíng",
  好大喜功: "hào dà xǐ gōng",
  众矢之的: "zhòng shǐ zhī dì",
  长生不死: "cháng shēng bù sǐ",
  蔚为壮观: "wèi wéi zhuàng guān",
  不可胜数: "bù kě shèng shǔ",
  鬼使神差: "guǐ shǐ shén chāi",
  洁身自好: "jié shēn zì hào",
  敢作敢为: "gǎn zuò gǎn wéi",
  茅塞顿开: "máo sè dùn kāi",
  走马换将: "zǒu mǎ huàn jiàng",
  为时过早: "wéi shí guò zǎo",
  为人师表: "wéi rén shī biǎo",
  阴差阳错: "yīn chā yáng cuò",
  油腔滑调: "yóu qiāng huá diào",
  重蹈覆辙: "chóng dǎo fù zhé",
  骂骂咧咧: "mà ma liē liē",
  絮絮叨叨: "xù xù dāo dāo",
  如履薄冰: "rú lǚ bó bīng",
  损兵折将: "sǔn bīng zhé jiàng",
  拐弯抹角: "guǎi wān mò jiǎo",
  像模像样: "xiàng mú xiàng yàng",
  供过于求: "gōng guò yú qiú",
  开花结果: "kāi huā jiē guǒ",
  仔仔细细: "zǐ zǐ xì xì",
  川藏公路: "chuān zàng gōng lù",
  河北梆子: "hé běi bāng zi",
  长年累月: "cháng nián lěi yuè",
  正儿八经: "zhèng er bā jīng",
  不识抬举: "bù shí tái ju",
  重振旗鼓: "chóng zhèn qí gǔ",
  气息奄奄: "qì xī yān yān",
  紧追不舍: "jǐn zhuī bù shě",
  服服帖帖: "fú fu tiē tiē",
  强词夺理: "qiǎng cí duó lǐ",
  噼里啪啦: "pī li pā lā",
  人才济济: "rén cái jǐ jǐ",
  发人深省: "fā rén shēn xǐng",
  不足为凭: "bù zú wéi píng",
  为富不仁: "wéi fù bù rén",
  连篇累牍: "lián piān lěi dú",
  呼天抢地: "hū tiān qiāng dì",
  落落大方: "luò luò dà fāng",
  自吹自擂: "zì chuī zì léi",
  乐善好施: "lè shàn hào shī",
  以攻为守: "yǐ gōng wéi shǒu",
  磨磨蹭蹭: "mó mó cèng cèng",
  削铁如泥: "xuē tiě rú ní",
  助纣为虐: "zhù zhòu wéi nüè",
  以退为进: "yǐ tuì wéi jìn",
  嘁嘁喳喳: "qī qī chā chā",
  枪林弹雨: "qiāng lín dàn yǔ",
  令人发指: "lìng rén fà zhǐ",
  转败为胜: "zhuǎn bài wéi shèng",
  转弯抹角: "zhuǎn wān mò jiǎo",
  在劫难逃: "zài jié nán táo",
  正当防卫: "zhèng dàng fáng wèi",
  不足为怪: "bù zú wéi guài",
  难兄难弟: "nàn xiōng nàn dì",
  咿咿呀呀: "yī yī yā yā",
  弹尽粮绝: "dàn jìn liáng jué",
  阿谀奉承: "ē yú fèng chéng",
  稀里哗啦: "xī li huā lā",
  返老还童: "fǎn lǎo huán tóng",
  好高骛远: "hào gāo wù yuǎn",
  鹿死谁手: "lù sǐ shéi shǒu",
  差强人意: "chā qiáng rén yì",
  大吹大擂: "dà chuī dà léi",
  成家立业: "chéng jiā lì yè",
  自怨自艾: "zì yuàn zì yì",
  负债累累: "fù zhài lěi lěi",
  古为今用: "gǔ wéi jīn yòng",
  入土为安: "rù tǔ wéi ān",
  下不为例: "xià bù wéi lì",
  一哄而上: "yì hōng ér shàng",
  没头苍蝇: "méi tóu cāng ying",
  天差地远: "tiān chā dì yuǎn",
  风卷残云: "fēng juǎn cán yún",
  多灾多难: "duō zāi duō nàn",
  乳臭未干: "rǔ xiù wèi gān",
  行家里手: "háng jiā lǐ shǒu",
  狼狈为奸: "láng bèi wéi jiān",
  处变不惊: "chǔ biàn bù jīng",
  一唱一和: "yí chàng yí hè",
  一念之差: "yí niàn zhī chā",
  金蝉脱壳: "jīn chán tuō qiào",
  滴滴答答: "dī dī dā dā",
  硕果累累: "shuò guǒ léi léi",
  好整以暇: "hào zhěng yǐ xiá",
  红得发紫: "hóng de fā zǐ",
  传为美谈: "chuán wéi měi tán",
  富商大贾: "fù shāng dà gǔ",
  四海为家: "sì hǎi wéi jiā",
  了若指掌: "liǎo ruò zhǐ zhǎng",
  大有可为: "dà yǒu kě wéi",
  出头露面: "chū tóu lù miàn",
  鼓鼓囊囊: "gǔ gu nāng nāng",
  窗明几净: "chuāng míng jī jìng",
  泰然处之: "tài rán chǔ zhī",
  怒发冲冠: "nù fà chōng guān",
  有机玻璃: "yǒu jī bō li",
  骨头架子: "gǔ tou jià zi",
  义薄云天: "yì bó yún tiān",
  一丁点儿: "yī dīng diǎn er",
  时来运转: "shí lái yùn zhuǎn",
  陈词滥调: "chén cí làn diào",
  化整为零: "huà zhěng wéi líng",
  火烧火燎: "huǒ shāo huǒ liǎo",
  干脆利索: "gàn cuì lì suǒ",
  吊儿郎当: "diào er láng dāng",
  广种薄收: "guǎng zhòng bó shōu",
  种瓜得瓜: "zhòng guā dé guā",
  种豆得豆: "zhòng dòu dé dòu",
  难舍难分: "nán shě nán fēn",
  歃血为盟: "shà xuè wéi méng",
  奋发有为: "fèn fā yǒu wéi",
  阴错阳差: "yīn cuò yáng chā",
  东躲西藏: "dōng duǒ xī cáng",
  烟熏火燎: "yān xūn huǒ liǎo",
  钻牛角尖: "zuān niú jiǎo jiān",
  乔装打扮: "qiáo zhuāng dǎ bàn",
  改弦更张: "gǎi xián gēng zhāng",
  河南梆子: "hé nán bāng zi",
  好吃懒做: "hào chī lǎn zuò",
  何乐不为: "hé lè bù wéi",
  大出风头: "dà chū fēng tóu",
  攻城掠地: "gōng chéng lüè dì",
  漂漂亮亮: "piào piào liang liang",
  折衷主义: "zhé zhōng zhǔ yì",
  大马哈鱼: "dà mǎ hǎ yú",
  绿树成荫: "lǜ shù chéng yīn",
  率先垂范: "shuài xiān chuí fàn",
  家长里短: "jiā cháng lǐ duǎn",
  宽大为怀: "kuān dà wéi huái",
  左膀右臂: "zuǒ bǎng yòu bì",
  一笑了之: "yí xiào liǎo zhī",
  天下为公: "tiān xià wéi gōng",
  还我河山: "huán wǒ hé shān",
  何足为奇: "hé zú wéi qí",
  好自为之: "hǎo zì wéi zhī",
  风姿绰约: "fēng zī chuò yuē",
  大雨滂沱: "dà yǔ pāng tuó",
  传为佳话: "chuán wéi jiā huà",
  吃里扒外: "chī lǐ pá wài",
  重操旧业: "chóng cāo jiù yè",
  小家子气: "xiǎo jiā zi qì",
  少不更事: "shào bù gēng shì",
  难分难舍: "nán fēn nán shě",
  添砖加瓦: "tiān zhuān jiā wǎ",
  是非分明: "shì fēi fēn míng",
  舍我其谁: "shě wǒ qí shuí",
  偏听偏信: "piān tīng piān xìn",
  量入为出: "liàng rù wéi chū",
  降龙伏虎: "xiáng lóng fú hǔ",
  钢化玻璃: "gāng huà bō li",
  正中下怀: "zhèng zhòng xià huái",
  以身许国: "yǐ shēn xǔ guó",
  一语中的: "yì yǔ zhòng dì",
  丧魂落魄: "sàng hún luò pò",
  三座大山: "sān zuò dà shān",
  济济一堂: "jǐ jǐ yì táng",
  好事之徒: "hào shì zhī tú",
  干净利索: "gàn jìng lì suǒ",
  出将入相: "chū jiàng rù xiàng",
  袅袅娜娜: "niǎo niǎo nuó nuó",
  狐狸尾巴: "hú li wěi ba",
  好逸恶劳: "hào yì wù láo",
  大而无当: "dà ér wú dàng",
  打马虎眼: "dǎ mǎ hu yǎn",
  板上钉钉: "bǎn shàng dìng dīng",
  吆五喝六: "yāo wǔ hè liù",
  虾兵蟹将: "xiā bīng xiè jiàng",
  水调歌头: "shuǐ diào gē tóu",
  数典忘祖: "shǔ diǎn wàng zǔ",
  人事不省: "rén shì bù xǐng",
  曲高和寡: "qǔ gāo hè guǎ",
  屡教不改: "lǚ jiào bù gǎi",
  互为因果: "hù wéi yīn guǒ",
  互为表里: "hù wéi biǎo lǐ",
  厚此薄彼: "hòu cǐ bó bǐ",
  过关斩将: "guò guān zhǎn jiàng",
  疙疙瘩瘩: "gē ge dā dā",
  大腹便便: "dà fù pián pián",
  走为上策: "zǒu wéi shàng cè",
  冤家对头: "yuān jia duì tóu",
  有隙可乘: "yǒu xì kě chèng",
  一鳞半爪: "yì lín bàn zhǎo",
  片言只语: "piàn yán zhǐ yǔ",
  开花结实: "kāi huā jié shí",
  经年累月: "jīng nián lěi yuè",
  含糊其词: "hán hú qí cí",
  寡廉鲜耻: "guǎ lián xiǎn chǐ",
  成年累月: "chéng nián lěi yuè",
  不徇私情: "bú xùn sī qíng",
  不当人子: "bù dāng rén zǐ",
  膀大腰圆: "bǎng dà yāo yuán",
  指腹为婚: "zhǐ fù wéi hūn",
  这么点儿: "zhè me diǎn er",
  意兴索然: "yì xīng suǒ rán",
  绣花枕头: "xiù huā zhěn tou",
  无的放矢: "wú dì fàng shǐ",
  望闻问切: "wàng wén wèn qiè",
  舍己为人: "shě jǐ wèi rén",
  穷年累月: "qióng nián lěi yuè",
  排难解纷: "pái nàn jiě fēn",
  处之泰然: "chǔ zhī tài rán",
  指鹿为马: "zhǐ lù wéi mǎ",
  危如累卵: "wēi rú lěi luǎn",
  天兵天将: "tiān bīng tiān jiàng",
  舍近求远: "shě jìn qiú yuǎn",
  南腔北调: "nán qiāng běi diào",
  苦中作乐: "kǔ zhōng zuò lè",
  厚积薄发: "hòu jī bó fā",
  臭味相投: "xiù wèi xiāng tóu",
  长幼有序: "zhǎng yòu yǒu xù",
  逼良为娼: "bī liáng wéi chāng",
  悲悲切切: "bēi bēi qiè qiē",
  败军之将: "bài jūn zhī jiàng",
  欺行霸市: "qī háng bà shì",
  削足适履: "xuē zú shì lǚ",
  先睹为快: "xiān dǔ wéi kuài",
  啼饥号寒: "tí jī háo hán",
  疏不间亲: "shū bú jiàn qīn",
  神差鬼使: "shén chāi guǐ shǐ",
  敲敲打打: "qiāo qiāo dǎ dǎ",
  平铺直叙: "píng pū zhí xù",
  没头没尾: "méi tóu mò wěi",
  寥寥可数: "liáo liáo kě shǔ",
  哼哈二将: "hēng hā èr jiàng",
  鹤发童颜: "hè fà tóng yán",
  各奔前程: "gè bèn qián chéng",
  弹无虚发: "dàn wú xū fā",
  大人先生: "dà rén xiān sheng",
  与民更始: "yǔ mín gēng shǐ",
  树碑立传: "shù bēi lì zhuàn",
  是非得失: "shì fēi dé shī",
  实逼处此: "shí bī chǔ cǐ",
  塞翁失马: "sài wēng shī mǎ",
  日薄西山: "rì bó xī shān",
  切身体会: "qiè shēn tǐ huì",
  片言只字: "piàn yán zhǐ zì",
  跑马卖解: "pǎo mǎ mài xiè",
  宁折不弯: "nìng zhé bù wān",
  零零散散: "líng líng sǎn sǎn",
  量体裁衣: "liàng tǐ cái yī",
  连中三元: "lián zhòng sān yuán",
  礼崩乐坏: "lǐ bēng yuè huài",
  不为已甚: "bù wéi yǐ shèn",
  转悲为喜: "zhuǎn bēi wéi xǐ",
  以眼还眼: "yǐ yǎn huán yǎn",
  蔚为大观: "wèi wéi dà guān",
  未为不可: "wèi wéi bù kě",
  童颜鹤发: "tóng yán hè fà",
  朋比为奸: "péng bǐ wéi jiān",
  莫此为甚: "mò cǐ wéi shèn",
  夹枪带棒: "jiā qiāng dài bàng",
  富商巨贾: "fù shāng jù jiǎ",
  淡然处之: "dàn rán chǔ zhī",
  箪食壶浆: "dān shí hú jiāng",
  创巨痛深: "chuāng jù tòng shēn",
  草长莺飞: "cǎo zhǎng yīng fēi",
  坐视不救: "zuò shī bú jiù",
  以己度人: "yǐ jǐ duó rén",
  随行就市: "suí háng jiù shì",
  文以载道: "wén yǐ zài dào",
  文不对题: "wén bú duì tí",
  铁板钉钉: "tiě bǎn dìng dīng",
  身体发肤: "shēn tǐ fà fū",
  缺吃少穿: "quē chī shǎo chuān",
  目无尊长: "mù wú zūn zhǎng",
  吉人天相: "jí rén tiān xiàng",
  毁家纾难: "huǐ jiā shū nàn",
  钢筋铁骨: "gāng jīn tiě gǔ",
  丢卒保车: "diū zú bǎo jū",
  丢三落四: "diū sān là sì",
  闭目塞听: "bì mù sè tīng",
  削尖脑袋: "xuē jiān nǎo dài",
  为非作恶: "wéi fēi zuò è",
  人才难得: "rén cái nán dé",
  情非得已: "qíng fēi dé yǐ",
  切中要害: "qiè zhòng yào hài",
  火急火燎: "huǒ jí huǒ liǎo",
  画地为牢: "huà dì wéi láo",
  好酒贪杯: "hào jiǔ tān bēi",
  长歌当哭: "cháng gē dàng kū",
  载沉载浮: "zài chén zài fú",
  遇难呈祥: "yù nàn chéng xiáng",
  榆木疙瘩: "yú mù gē da",
  以邻为壑: "yǐ lín wéi hè",
  洋为中用: "yáng wéi zhōng yòng",
  言为心声: "yán wéi xīn shēng",
  言必有中: "yán bì yǒu zhòng",
  图穷匕见: "tú qióng bǐ xiàn",
  滂沱大雨: "páng tuó dà yǔ",
  目不暇给: "mù bù xiá jǐ",
  量才录用: "liàng cái lù yòng",
  教学相长: "jiào xué xiāng zhǎng",
  悔不当初: "huǐ bù dāng chū",
  呼幺喝六: "hū yāo hè liù",
  不足为训: "bù zú wéi xùn",
  不拘形迹: "bù jū xíng jī",
  傍若无人: "páng ruò wú rén",
  罪责难逃: "zuì zé nán táo",
  自我吹嘘: "zì wǒ chuī xū",
  转祸为福: "zhuǎn huò wéi fú",
  勇冠三军: "yǒng guàn sān jūn",
  易地而处: "yì dì ér chǔ",
  卸磨杀驴: "xiè mò shā lǘ",
  玩儿不转: "wán ér bú zhuàn",
  天道好还: "tiān dào hǎo huán",
  身单力薄: "shēn dān lì bó",
  撒豆成兵: "sǎ dòu chéng bīng",
  片纸只字: "piàn zhǐ zhī zì",
  宁缺毋滥: "nìng quē wú làn",
  没没无闻: "mò mò wú wén",
  量力而为: "liàng lì ér wéi",
  历历可数: "lì lì kě shǔ",
  口碑载道: "kǒu bēi zài dào",
  君子好逑: "jūn zǐ hǎo qiú",
  好为人师: "hào wéi rén shī",
  豪商巨贾: "háo shāng jù jiǎ",
  各有所好: "gè yǒu suǒ hào",
  度德量力: "duó dé liàng lì",
  指天为誓: "zhǐ tiān wéi shì",
  逸兴遄飞: "yì xìng chuán fēi",
  心宽体胖: "xīn kuān tǐ pán",
  为德不卒: "wéi dé bù zú",
  天下为家: "tiān xià wéi jiā",
  视为畏途: "shì wéi wèi tú",
  三灾八难: "sān zāi bā nàn",
  沐猴而冠: "mù hóu ér guàn",
  哩哩啦啦: "lī li lā lā",
  见缝就钻: "jiàn fèng jiù zuān",
  夹层玻璃: "jiā céng bō li",
  急公好义: "jí gōng hào yì",
  积年累月: "jī nián lěi yuè",
  划地为牢: "huá dì wéi láo",
  更名改姓: "gēng míng gǎi xìng",
  奉为圭臬: "fèng wéi guī niè",
  多难兴邦: "duō nàn xīng bāng",
  不破不立: "bú pò bú lì",
  坐地自划: "zuò dì zì huá",
  坐不重席: "zuò bù chóng xí",
  坐不窥堂: "zuò bù kuī táng",
  作嫁衣裳: "zuò jià yī shang",
  左枝右梧: "zuǒ zhī yòu wú",
  左宜右有: "zuǒ yí yòu yǒu",
  钻头觅缝: "zuān tóu mì fèng",
  钻天打洞: "zuān tiān dǎ dòng",
  钻皮出羽: "zuān pí chū yǔ",
  钻火得冰: "zuān huǒ dé bīng",
  钻洞觅缝: "zuàn dòng mì féng",
  钻冰求火: "zuān bīng qiú huǒ",
  子为父隐: "zǐ wéi fù yǐn",
  擢发难数: "zhuó fà nán shǔ",
  着人先鞭: "zhuó rén xiān biān",
  斫雕为朴: "zhuó diāo wéi pǔ",
  锥处囊中: "zhuī chǔ náng zhōng",
  椎心饮泣: "chuí xīn yǐn qì",
  椎心泣血: "chuí xīn qì xuè",
  椎牛飨士: "chuí niú xiǎng shì",
  椎牛歃血: "chuí niú shà xuè",
  椎牛发冢: "chuí niú fà zhǒng",
  椎埋屠狗: "chuí mái tú gǒu",
  椎埋狗窃: "chuí mái gǒu qiè",
  壮发冲冠: "zhuàng fā chōng guàn",
  庄严宝相: "zhuāng yán bǎo xiàng",
  转愁为喜: "zhuǎn chóu wéi xǐ",
  转嗔为喜: "zhuǎn chēn wéi xǐ",
  拽巷啰街: "zhuài xiàng luó jiē",
  拽耙扶犁: "zhuāi pá fú lí",
  拽布拖麻: "zhuài bù tuō má",
  箸长碗短: "zhù cháng wǎn duǎn",
  铸剑为犁: "zhù jiàn wéi lí",
  杼柚其空: "zhù yòu qí kōng",
  杼柚空虚: "zhù yòu kōng xū",
  助天为虐: "zhù tiān wéi nüè",
  属垣有耳: "zhǔ yuán yǒu ěr",
  属毛离里: "zhǔ máo lí lǐ",
  属辞比事: "zhǔ cí bǐ shì",
  逐物不还: "zhú wù bù huán",
  铢量寸度: "zhū liáng cùn duó",
  铢两悉称: "zhū liǎng xī chèn",
  侏儒观戏: "zhū rú guān xì",
  朱轓皁盖: "zhū fān zào gài",
  昼度夜思: "zhòu duó yè sī",
  诪张为幻: "zhōu zhāng wéi huàn",
  重明继焰: "chóng míng jì yàn",
  众啄同音: "zhòng zhuó tóng yīn",
  众毛攒裘: "zhòng máo cuán qiú",
  众好众恶: "zhòng hào zhòng wù",
  擿埴索涂: "zhāi zhí suǒ tú",
  稚齿婑媠: "zhì chǐ wǒ tuó",
  至当不易: "zhì dàng bú yì",
  指皂为白: "zhǐ zào wéi bái",
  指雁为羹: "zhǐ yàn wéi gēng",
  指树为姓: "zhǐ shù wéi xìng",
  指山说磨: "zhǐ shān shuō mò",
  止戈为武: "zhǐ gē wéi wǔ",
  枝干相持: "zhī gàn xiāng chí",
  枝大于本: "zh dà yú běn",
  支吾其词: "zhī wú qí cí",
  正身率下: "zhèng shēn shuài xià",
  正冠李下: "zhèng guàn lǐ xià",
  整冠纳履: "zhěng guān nà lǚ",
  整躬率物: "zhěng gōng shuài wù",
  整顿干坤: "zhěng dùn gàn kūn",
  针头削铁: "zhēn tóu xuē tiě",
  贞松劲柏: "zhēn sōng jìng bǎi",
  赭衣塞路: "zhě yī sè lù",
  折箭为誓: "shé jiàn wéi shì",
  折而族之: "zhé ér zú zhī",
  昭德塞违: "zhāo dé sè wéi",
  章句小儒: "zhāng jù xiǎo rú",
  湛恩汪濊: "zhàn ēn wāng huì",
  占风望气: "zhān fēng wàng qì",
  斩将搴旗: "zhǎn jiàng qiān qí",
  曾母投杼: "zēng mǔ tóu zhù",
  曾参杀人: "zēng shēn shā rén",
  造谣中伤: "zào yáo zhòng shāng",
  早占勿药: "zǎo zhān wù yào",
  凿龟数策: "záo guī shǔ cè",
  攒三聚五: "cuán sān jù wǔ",
  攒眉蹙额: "cuán mei cù é",
  攒零合整: "cuán líng hé zhěng",
  攒锋聚镝: "cuán fēng jù dí",
  载笑载言: "zài xiào zài yán",
  载酒问字: "zài jiǔ wèn zì",
  殒身不恤: "yǔn shēn bú xù",
  云舒霞卷: "yún shū xiá juǎn",
  月中折桂: "yuè zhōng shé guì",
  月落参横: "yuè luò shēn héng",
  鬻驽窃价: "yù nú qiè jià",
  鬻鸡为凤: "yù jī wéi fèng",
  遇难成祥: "yù nàn chéng xiáng",
  郁郁累累: "yù yù lěi lěi",
  玉卮无当: "yù zhī wú dàng",
  语笑喧阗: "yǔ xiào xuān tián",
  与世沉浮: "yǔ shì chén fú",
  与时消息: "yǔ shí xiāo xi",
  逾墙钻隙: "yú qiáng zuān xì",
  渔夺侵牟: "yú duó qīn móu",
  杅穿皮蠹: "yú chuān pí dù",
  余勇可贾: "yú yǒng kě gǔ",
  予智予雄: "yú zhì yú xióng",
  予取予求: "yú qǔ yú qiú",
  于家为国: "yú jiā wéi guó",
  有借无还: "yǒu jiè wú huán",
  有加无已: "yǒu jiā wú yǐ",
  有国难投: "yǒu guó nán tóu",
  游必有方: "yóu bì yǒu fāng",
  油干灯尽: "yóu gàn dēng jìn",
  尤云殢雨: "yóu yún tì yǔ",
  庸中皦皦: "yōng zhōng jiǎo jiǎo",
  郢书燕说: "yǐng shū yān shuō",
  营蝇斐锦: "yíng yíng fēi jǐn",
  鹰心雁爪: "yīng xīn yàn zhǎo",
  莺吟燕儛: "yīng yín yàn wǔ",
  应天顺时: "yīng tiān shùn shí",
  印累绶若: "yìn léi shòu ruò",
  隐占身体: "yǐn zhàn shēn tǐ",
  饮犊上流: "yìn dú shàng liú",
  引绳切墨: "yǐn shéng qiē mò",
  龈齿弹舌: "yín chǐ dàn shé",
  因缘为市: "yīn yuán wéi shì",
  因树为屋: "yīn shù wéi wū",
  溢美溢恶: "yì měi yì wù",
  抑塞磊落: "yì sè lěi luò",
  倚闾望切: "yǐ lǘ wàng qiē",
  以意为之: "yǐ yì wéi zhī",
  以言为讳: "yǐ yán wéi huì",
  以疏间亲: "yǐ shū jiàn qīn",
  以水济水: "yǐ shuǐ jǐ shuǐ",
  以书为御: "yǐ shū wéi yù",
  以守为攻: "yǐ shǒu wéi gōng",
  以升量石: "yǐ shēng liáng dàn",
  以慎为键: "yǐ shèn wéi jiàn",
  以筌为鱼: "yǐ quán wéi yú",
  以利累形: "yǐ lì lěi xíng",
  以毁为罚: "yǐ huǐ wéi fá",
  以黑为白: "yǐ hēi wéi bái",
  以规为瑱: "yǐ guī wéi tiàn",
  以古为鉴: "yǐ gǔ wéi jiàn",
  以宫笑角: "yǐ gōng xiào jué",
  以法为教: "yǐ fǎ wéi jiào",
  以大恶细: "yǐ dà wù xì",
  遗世忘累: "yí shì wàng lěi",
  遗寝载怀: "yí qǐn zài huái",
  移的就箭: "yí dì jiù jiàn",
  依头缕当: "yī tóu lǚ dàng",
  衣租食税: "yì zū shí shuì",
  衣轻乘肥: "yì qīng chéng féi",
  衣裳之会: "yī shang zhī huì",
  衣单食薄: "yī dān shí bó",
  一还一报: "yì huán yí bào",
  叶公好龙: "yè gōng hào lóng",
  野调无腔: "yě diào wú qiāng",
  瑶池女使: "yáo chí nǚ shǐ",
  幺麽小丑: "yāo mó xiǎo chǒu",
  养精畜锐: "yǎng jīng xù ruì",
  卬首信眉: "áng shǒu shēn méi",
  洋洋纚纚: "yáng yáng sǎ sǎ",
  羊羔美酒: "yáng gāo měi jiǔ",
  扬风扢雅: "yáng fēng jié yǎ",
  燕昭市骏: "yān zhāo shì jùn",
  燕昭好马: "yān zhāo hǎo mǎ",
  燕石妄珍: "yān shí wàng zhēn",
  燕骏千金: "yān jùn qiān jīn",
  燕金募秀: "yān jīn mù xiù",
  燕驾越毂: "yān jià yuè gǔ",
  燕歌赵舞: "yān gē zhào wǔ",
  燕岱之石: "yān dài zhī shí",
  燕处危巢: "yàn chǔ wēi cháo",
  掞藻飞声: "shàn zǎo fēi shēng",
  偃革为轩: "yǎn gé wéi xuān",
  妍蚩好恶: "yán chī hǎo è",
  压良为贱: "yā liáng wéi jiàn",
  搀行夺市: "chān háng duó shì",
  泣数行下: "qì shù háng xià",
  当行出色: "dāng háng chū sè",
  秀出班行: "xiù chū bān háng",
  儿女成行: "ér nǚ chéng háng",
  大行大市: "dà háng dà shì",
  寻行数墨: "xún háng shǔ mò",
  埙篪相和: "xūn chí xiāng hè",
  血债累累: "xuè zhài lěi lěi",
  炫玉贾石: "xuàn yù gǔ shí",
  炫石为玉: "xuàn shí wéi yù",
  悬石程书: "xuán dàn chéng shū",
  悬狟素飡: "xuán huán sù cān",
  悬龟系鱼: "xuán guī xì yú",
  揎拳捋袖: "xuān quán luō xiù",
  轩鹤冠猴: "xuān hè guàn hóu",
  畜妻养子: "xù qī yǎng zǐ",
  羞人答答: "xiū rén dā dā",
  修鳞养爪: "xiū lín yǎng zhǎo",
  熊据虎跱: "xióng jù hǔ zhì",
  兄死弟及: "xiōng sǐ dì jí",
  腥闻在上: "xīng wén zài shàng",
  兴文匽武: "xīng wén yǎn wǔ",
  兴观群怨: "xìng guān qún yuàn",
  兴高彩烈: "xìng gāo cǎi liè",
  心手相应: "xīn shǒu xiāng yìng",
  心口相应: "xīn kǒu xiāng yīng",
  挟势弄权: "xié shì nòng quán",
  胁肩累足: "xié jiān lěi zú",
  校短量长: "jiào duǎn liáng cháng",
  小眼薄皮: "xiǎo yǎn bó pí",
  硝云弹雨: "xiāo yún dàn yǔ",
  鸮鸣鼠暴: "xiāo míng shǔ bào",
  削株掘根: "xuē zhū jué gēn",
  削铁无声: "xuē tiě wú shēng",
  削职为民: "xuē zhí wéi mín",
  削木为吏: "xuē mù wéi lì",
  想望风褱: "xiǎng wàng fēng huái",
  香培玉琢: "xiang pei yu zhuó",
  相鼠有皮: "xiàng shǔ yǒu pí",
  相时而动: "xiàng shí ér dòng",
  相切相磋: "xiāng qiē xiāng cuō",
  相女配夫: "xiàng nǚ pèi fū",
  相门有相: "xiàng mén yǒu xiàng",
  挦章撦句: "xián zhāng chě jù",
  先我着鞭: "xiān wǒ zhuó biān",
  习焉不察: "xí yān bù chá",
  歙漆阿胶: "shè qī ē jiāo",
  晰毛辨发: "xī máo biàn fà",
  悉索薄赋: "xī suǒ bó fù",
  雾鳞云爪: "wù lín yún zhǎo",
  物稀为贵: "wù xī wéi guì",
  碔砆混玉: "wǔ fū hùn yù",
  武断专横: "wǔ duàn zhuān héng",
  五石六鹢: "wǔ shí liù yì",
  五色相宣: "wǔ sè xiāng xuān",
  五侯七贵: "wǔ hóu qī guì",
  五侯蜡烛: "wǔ hòu là zhú",
  五羖大夫: "wǔ gǔ dà fū",
  吾自有处: "wú zì yǒu chǔ",
  无下箸处: "wú xià zhù chǔ",
  无伤无臭: "wú shāng wú xiù",
  无能为役: "wú néng wéi yì",
  无寇暴死: "wú kòu bào sǐ",
  无孔不钻: "wú kǒng bú zuàn",
  无间可乘: "wú jiān kě chéng",
  无间冬夏: "wú jiān dōng xià",
  无恶不为: "wú è bù wéi",
  无动为大: "wú dòng wéi dà",
  诬良为盗: "wū liáng wéi dào",
  握拳透爪: "wò quán tòu zhǎo",
  文武差事: "wén wǔ chāi shì",
  委委佗佗: "wēi wēi tuó tuó",
  惟日为岁: "wéi rì wéi suì",
  帷薄不修: "wéi bó bù xiū",
  为善最乐: "wéi shàn zuì lè",
  为山止篑: "wéi shān zhǐ kuì",
  为仁不富: "wéi rén bú fù",
  为裘为箕: "wéi qiú wéi jī",
  为民父母: "wéi mín fù mǔ",
  为虺弗摧: "wéi huǐ fú cuī",
  为好成歉: "wéi hǎo chéng qiàn",
  为鬼为蜮: "wéi guǐ wéi yù",
  望风响应: "wàng fēng xiǎng yīng",
  望尘僄声: "wàng chén piào shēng",
  往渚还汀: "wǎng zhǔ huán tīng",
  王贡弹冠: "wáng gòng dàn guàn",
  亡国大夫: "wáng guó dà fū",
  万贯家私: "wàn guàn jiā sī",
  晚食当肉: "wǎn shí dàng ròu",
  晚节不保: "wǎn jié bù bǎo",
  玩岁愒时: "wán suì kài shí",
  蛙蟆胜负: "wā má shèng fù",
  吞言咽理: "tūn yán yàn lǐ",
  颓垣断堑: "tuí yuán duàn qiàn",
  推干就湿: "tuī gàn jiù shī",
  剸繁决剧: "tuán fán jué jù",
  团头聚面: "tuán tóu jù miàn",
  兔丝燕麦: "tù sī yàn mài",
  兔头麞脑: "tù tóu zhāng nǎo",
  兔葵燕麦: "tù kuí yàn mài",
  吐哺握发: "tǔ bǔ wò fà",
  投传而去: "tóu zhuàn ér qù",
  头没杯案: "tóu mò bēi àn",
  头昏脑闷: "tóu hūn nǎo mèn",
  头会箕敛: "tóu kuài jī liǎn",
  头出头没: "tóu chū tóu mò",
  痛自创艾: "tòng zì chuāng yì",
  同恶相助: "tóng wù xiāng zhù",
  同恶相恤: "tóng wù xiāng xù",
  痌瘝在抱: "tōng guān zài bào",
  通文调武: "tōng wén diào wǔ",
  停留长智: "tíng liú zhǎng zhì",
  铁树开华: "tiě shù kāi huā",
  条贯部分: "tiáo guàn bù fēn",
  挑牙料唇: "tiǎo yá liào chún",
  挑么挑六: "tiāo yāo tiāo liù",
  挑唇料嘴: "tiǎo chún liào zuǐ",
  恬不为意: "tián bù wéi yì",
  恬不为怪: "tián bù wéi guài",
  天下为笼: "tiān xià wéi lóng",
  天台路迷: "tiān tái lù mí",
  天年不遂: "tiān nián bú suì",
  探囊胠箧: "tàn náng qū qiè",
  谭言微中: "tán yán wēi zhòng",
  谈言微中: "tán yán wēi zhòng",
  狧穅及米: "shì kāng jí mǐ",
  随物应机: "suí wù yīng jī",
  搜岩采干: "sōu yán cǎi gàn",
  宋斤鲁削: "sòng jīn lǔ xuē",
  松筠之节: "sōng yún zhī jié",
  四亭八当: "sì tíng bā dàng",
  四马攒蹄: "sì mǎ cuán tí",
  四不拗六: "sì bú niù liù",
  思所逐之: "sī suǒ zhú zhī",
  丝恩发怨: "sī ēn fà yuàn",
  硕望宿德: "shuò wàng xiǔ dé",
  铄古切今: "shuò gǔ qiē jīn",
  顺风而呼: "shùn fēng ér hū",
  顺风吹火: "shùn fēng chuī huǒ",
  水中著盐: "shuǐ zhōng zhuó yán",
  双柑斗酒: "shuāng gān dǒu jiǔ",
  数米而炊: "shǔ mǐ ér chuī",
  数米量柴: "shǔ mǐ liáng chái",
  数理逻辑: "shù lǐ luó ji",
  数黑论黄: "shǔ hēi lùn huáng",
  数白论黄: "shǔ bái lùn huáng",
  束缊还妇: "shù yūn huán fù",
  束蒲为脯: "shù pú wéi pú",
  束椽为柱: "shù chuán wéi zhù",
  书缺有间: "shū quē yǒu jiàn",
  手足重茧: "shǒu zú chóng jiǎn",
  手足异处: "shǒu zú yì chǔ",
  手脚干净: "shǒu jiǎo gàn jìng",
  手不应心: "shǒu bù yīng xīn",
  螫手解腕: "shì shǒu jiě wàn",
  释知遗形: "shì zhī yí xíng",
  适时应务: "shì shí yīng wù",
  适情率意: "shì qíng shuài yì",
  适当其冲: "shì dāng qí chōng",
  视为知己: "shì wéi zhī jǐ",
  使羊将狼: "shǐ yáng jiàng láng",
  食为民天: "shí wéi mín tiān",
  拾掇无遗: "shí duō wú yí",
  实与有力: "shí yù yǒu lì",
  石英玻璃: "shí yīng bō li",
  石室金匮: "shí shì jīn guì",
  什袭珍藏: "shí xí zhēn cáng",
  什伍东西: "shí wǔ dōng xī",
  什围伍攻: "shí wéi wǔ gōng",
  十魔九难: "shí mó jiǔ nàn",
  诗书发冢: "shī shū fà zhǒng",
  虱处裈中: "shī chǔ kūn zhōng",
  师直为壮: "shī zhí wéi zhuàng",
  尸居龙见: "shī jū lóng xiàn",
  圣经贤传: "shèng jīng xián zhuàn",
  圣君贤相: "shèng jūn xián xiàng",
  生拖死拽: "shēng tuō sǐ zhuài",
  审己度人: "shěn jǐ duó rén",
  神武挂冠: "shén wǔ guà guàn",
  神龙失埶: "shén lóng shī shì",
  深文曲折: "shēn wén qǔ shé",
  深厉浅揭: "shēn lì qiǎn qì",
  深谷为陵: "shēn gǔ wéi líng",
  深恶痛疾: "shēn wù tòng jí",
  深仇宿怨: "shēn chóu xiǔ yuàn",
  舍己为公: "shě jǐ wèi gōng",
  舍短取长: "shě duǎn qǔ cháng",
  舍策追羊: "shě cè zhuī yáng",
  蛇蝎为心: "shé xiē wéi xīn",
  少成若性: "shào chéng ruò xìng",
  上当学乖: "shàng dàng xué guāi",
  赏不当功: "shǎng bù dāng gōng",
  善自为谋: "shàn zì wéi móu",
  善为说辞: "shàn wéi shuō cí",
  善善恶恶: "shàn shàn wù è",
  善财难舍: "shàn cái nán shě",
  苫眼铺眉: "shān yǎn pū méi",
  讪牙闲嗑: "shàn yá xián kē",
  山阴乘兴: "shān yīn chéng xīng",
  山殽野湋: "shān yáo yě wéi",
  山溜穿石: "shān liù chuān shí",
  山节藻棁: "shān jié zǎo zhuō",
  杀鸡为黍: "shā jī wéi shǔ",
  色厉胆薄: "sè lì dǎn bó",
  桑荫未移: "sāng yīn wèi yí",
  桑荫不徙: "sāng yīn bù xǐ",
  桑土绸缪: "sāng tǔ chóu miù",
  桑户棬枢: "sāng hù juàn shū",
  三战三北: "sān zhàn sān běi",
  三瓦两舍: "sān wǎ liǎng shě",
  三人为众: "sān rén wèi zhòng",
  三差两错: "sān chā liǎng cuò",
  塞井焚舍: "sāi jǐng fén shě",
  洒心更始: "sǎ xīn gèng shǐ",
  洒扫应对: "sǎ sǎo yìng duì",
  软红香土: "ruǎn hóng xiāng tǔ",
  入吾彀中: "rù wú gòu zhōng",
  入铁主簿: "rù tiě zhǔ bù",
  入理切情: "rù lǐ qiē qíng",
  汝成人耶: "rǔ chéng rén yé",
  如水投石: "rú shuǐ tóu shí",
  如切如磋: "rú qiē rú cuō",
  如登春台: "rú dēng chūn tái",
  肉薄骨并: "ròu bó gǔ bìng",
  柔情绰态: "róu qíng chuò tài",
  戎马劻勷: "róng mǎ kuāng ráng",
  日中为市: "rì zhōng wéi shì",
  日月参辰: "rì yuè shēn chén",
  日省月修: "rì xǐng yuè xiū",
  日削月割: "rì xuē yuè gē",
  日省月试: "rì xǐng yuè shì",
  任达不拘: "rèn dá bù jū",
  人言藉藉: "rén yán jí jí",
  人模狗样: "rén mú gǒu yàng",
  人莫予毒: "rén mò yú dú",
  热熬翻饼: "rè áo fān bǐng",
  圈牢养物: "juàn láo yǎng wù",
  取予有节: "qǔ yǔ yǒu jié",
  诎要桡腘: "qū yāo ráo guó",
  穷形尽相: "qióng xíng jìn xiàng",
  情凄意切: "qíng qī yì qiè",
  情见势屈: "qíng xiàn shì qū",
  情见乎辞: "qíng xiàn hū cí",
  清都绛阙: "qīng dōu jiàng què",
  倾肠倒肚: "qīng cháng dào dǔ",
  青紫被体: "qīng zǐ pī tǐ",
  青林黑塞: "qīng lín hēi sài",
  螓首蛾眉: "qín shǒu é méi",
  琴瑟之好: "qín sè zhī hào",
  且住为佳: "qiě zhù wéi jiā",
  切树倒根: "qiē shù dǎo gēn",
  切理餍心: "qiē lǐ yàn xīn",
  切近的当: "qiē jìn de dāng",
  翘足引领: "qiáo zú yǐn lǐng",
  巧发奇中: "qiǎo fā qí zhòng",
  强嘴拗舌: "jiàng zuǐ niù shé",
  强直自遂: "qiáng zhí zì suí",
  强死强活: "qiǎng sǐ qiǎng huó",
  强食自爱: "qiǎng shí zì ài",
  强食靡角: "qiǎng shí mí jiǎo",
  强弓劲弩: "qiáng gōng jìng nǔ",
  强聒不舍: "qiǎng guō bù shě",
  强凫变鹤: "qiáng fú biàn hè",
  强而后可: "qiǎng ér hòu kě",
  强得易贫: "qiǎng dé yì pín",
  遣兴陶情: "qiǎn xìng táo qíng",
  牵羊担酒: "qiān yáng dān jiǔ",
  千了百当: "qiān liǎo bǎi dàng",
  泣下如雨: "qì xià rú yǔ",
  起偃为竖: "qǐ yǎn wéi shù",
  岂弟君子: "kǎi tì jūn zǐ",
  綦溪利跂: "qí xī lì qí",
  棋输先著: "qí shū xiān zhuó",
  齐王舍牛: "qí wáng shě niú",
  欺天诳地: "qī tiān kuáng dì",
  普天率土: "pǔ tiān shuài tǔ",
  铺胸纳地: "pū xiōng nà dì",
  铺锦列绣: "pū jǐn liè xiù",
  破家为国: "pò jiā wèi guó",
  破觚为圜: "pò gū wéi yuán",
  萍飘蓬转: "píng piāo péng zhuàn",
  帡天极地: "píng tiān jí dì",
  屏声息气: "bǐng shēng xī qì",
  凭几据杖: "píng jī jù zhàng",
  贫嘴薄舌: "pín zuǐ bó shé",
  片语只辞: "piàn yǔ zhī cí",
  披发文身: "pī fà wén shēn",
  烹龙炮凤: "pēng lóng páo fèng",
  炰鳖脍鲤: "fǒu biē kuài lǐ",
  庞眉皓发: "páng méi hào fà",
  攀花折柳: "pān huā zhé liǔ",
  攀蟾折桂: "pān chán shé guì",
  女大难留: "nǚ dà nán liú",
  弄玉吹箫: "nòng yù chuī xiāo",
  弄管调弦: "nòng guǎn tiáo xián",
  弄粉调朱: "nòng fěn diào zhū",
  浓抹淡妆: "nóng mò dàn zhuāng",
  捻土为香: "niǎn tǔ wéi xiāng",
  年谊世好: "nián yì shì hǎo",
  年华垂暮: "nián huá chuí mù",
  儗不于伦: "nǐ bù yú lún",
  泥而不滓: "ní ér bù zǐ",
  能者为师: "néng zhě wéi shī",
  能不称官: "néng bú chèn guān",
  挠直为曲: "náo zhí wéi qū",
  难进易退: "nán jìn yì tuì",
  难得糊涂: "nán dé hú tú",
  南蛮鴂舌: "nán mán jué shé",
  南贩北贾: "nán fàn běi gǔ",
  牧猪奴戏: "mù zhū nú xì",
  目眢心忳: "mù yuān xīn tún",
  目挑心招: "mù tiǎo xīn zhāo",
  目量意营: "mù liàng yì yíng",
  木头木脑: "mù tóu mù nǎo",
  木干鸟栖: "mù gàn niǎo qī",
  侔色揣称: "móu sè chuǎi chèn",
  莫予毒也: "mò yú dú yě",
  抹粉施脂: "mò fěn shī zhī",
  磨砻镌切: "mó lóng juān qiē",
  磨棱刓角: "mó léng wán jiǎo",
  摸门不着: "mō mén bù zháo",
  摸不着边: "mō bù zhuó biān",
  命中注定: "mìng zhōng zhù dìng",
  鸣鹤之应: "míng hè zhī yìng",
  明效大验: "míng xiào dà yàn",
  名我固当: "míng wǒ gù dāng",
  邈处欿视: "miǎo chǔ kǎn shì",
  黾穴鸲巢: "měng xué qú cháo",
  绵里薄材: "mián lǐ bó cái",
  靡有孑遗: "mǐ yǒu jié yí",
  靡衣偷食: "mǐ yī tōu shí",
  迷恋骸骨: "mí liàn hái gǔ",
  扪参历井: "mén shēn lì jǐng",
  门单户薄: "mén dān hù bó",
  昧旦晨兴: "mèi dàn chén xīng",
  冒名接脚: "mào míng jiē jiǎo",
  毛遂堕井: "máo suí duò jǐng",
  毛发倒竖: "máo fā dǎo shù",
  卖文为生: "mài wén wéi shēng",
  卖李钻核: "mài lǐ zuān hé",
  买椟还珠: "mǎi dú huán zhū",
  埋三怨四: "mán sān yuàn sì",
  马入华山: "mǎ rù huá shān",
  落魄江湖: "luò pò jiāng hú",
  落落难合: "luò luò nán hé",
  落草为寇: "luò cǎo wéi kòu",
  罗织构陷: "luó zhī gòu xiàn",
  鸾凤和鸣: "luán fèng hè míng",
  率由旧章: "shuài yóu jiù zhāng",
  率土同庆: "shuài tǔ tóng qìng",
  率兽食人: "shuài shòu shí rén",
  率土归心: "shuài tǔ guī xīn",
  率马以骥: "shuài mǎ yǐ jì",
  率尔成章: "shuài ěr chéng zhāng",
  鲁斤燕削: "lǔ jīn yàn xuē",
  漏尽更阑: "lòu jìn gēng lán",
  笼鸟槛猿: "lóng niǎo jiàn yuán",
  笼鸟池鱼: "lóng niǎo chí yú",
  龙游曲沼: "lóng yóu qū zhǎo",
  龙血玄黄: "lóng xuè xuán huáng",
  龙雕凤咀: "lóng diāo fèng jǔ",
  六尺之讬: "liù chǐ zhī tuō",
  令原之戚: "líng yuán zhī qī",
  令人捧腹: "lìng rén pěng fù",
  陵劲淬砺: "líng jìng cuì lì",
  临敌易将: "lín dí yì jiàng",
  裂裳衣疮: "liè shang yī chuāng",
  裂冠毁冕: "liè guàn huǐ miǎn",
  了无惧色: "liǎo wú jù sè",
  了身达命: "liǎo shēn dá mìng",
  了然无闻: "liǎo rán wú wén",
  了不可见: "liǎo bù kě jiàn",
  了不长进: "liǎo bù zhǎng jìn",
  燎发摧枯: "liǎo fà cuī kū",
  审时度势: "shěn shí duó shì",
  量小力微: "liàng xiǎo lì wēi",
  相时度力: "xiāng shí duó lì",
  量枘制凿: "liàng ruì zhì záo",
  量如江海: "liàng rú jiāng hǎi",
  量金买赋: "liàng jīn mǎi fù",
  量己审分: "liàng jǐ shěn fēn",
  敛骨吹魂: "liǎn gǔ chuī hún",
  詈夷为跖: "lì yí wéi zhí",
  利令志惛: "lì lìng zhì hūn",
  李广不侯: "lǐ guǎng bú hòu",
  礼为情貌: "lǐ wéi qíng mào",
  礼让为国: "lǐ ràng wéi guó",
  犁生骍角: "lí shēng xīng jiǎo",
  离本徼末: "lí běn jiǎo mò",
  楞眉横眼: "léng méi hèng yǎn",
  擂天倒地: "léi tiān dǎo dì",
  累足成步: "lěi zú chéng bù",
  累瓦结绳: "lěi wǎ jié shéng",
  累土至山: "lěi tǔ zhì shān",
  累土聚沙: "lěi tǔ jù shā",
  累卵之危: "lěi luǎn zhī wēi",
  累累如珠: "lěi lěi rú zhū",
  累块积苏: "lěi kuài jī sū",
  乐山乐水: "lè shān lè shuǐ",
  潦原浸天: "lǎo yuán jìn tiān",
  老师宿儒: "lǎo shī xiǔ rú",
  牢什古子: "láo shí gǔ zi",
  琅嬛福地: "láng huán fú dì",
  揆情度理: "kuí qíng duó lǐ",
  旷日累时: "kuàng rì lěi shí",
  匡救弥缝: "kuāng jiù mí fèng",
  枯树生华: "kū shù shēng huā",
  口轻舌薄: "kǒu qīng shé bó",
  口角生风: "kǒu jiǎo shēng fēng",
  口角春风: "kǒu jiǎo chūn fēng",
  口角风情: "kǒu jiǎo fēng qíng",
  口干舌焦: "kǒu gān shé jiāo",
  口腹之累: "kǒu fù zhī lěi",
  空腹便便: "kōng fù pián pián",
  嗑牙料嘴: "kē yá liào zuǐ",
  刻木为鹄: "kè mù wéi hú",
  咳珠唾玉: "ké zhū tuò yù",
  咳唾成珠: "ké tuò chéng zhū",
  抗颜为师: "kàng yán wéi shī",
  开华结果: "kāi huā jié guǒ",
  峻阪盐车: "jùn bǎn yán chē",
  嚼铁咀金: "jiáo tiě jǔ jīn",
  嚼墨喷纸: "jué mò pēn zhǐ",
  倔头强脑: "juè tóu jiàng nǎo",
  倔头倔脑: "juè tóu juè nǎo",
  倦鸟知还: "juàn niǎo zhī huán",
  卷席而葬: "juǎn xí ér zàng",
  卷甲倍道: "juǎn jiǎ bèi dào",
  聚米为山: "jù mǐ wéi shān",
  举手相庆: "jǔ shǒu xiāng qìng",
  举世混浊: "jǔ shì hún zhuó",
  鞠为茂草: "jū wéi mào cǎo",
  拘神遣将: "jū shén qiǎn jiàng",
  居下讪上: "jū xià shàn shàng",
  久要不忘: "jiǔ yāo bú wàng",
  九转功成: "jiǔ zhuǎn gōng chéng",
  九蒸三熯: "jiǔ zhēng sān hàn",
  敬业乐群: "jìng yè lè qún",
  井底虾蟆: "jǐng dǐ xiā má",
  旌旗卷舒: "jīng qí juǎn shū",
  荆棘载途: "jīng jí zài tú",
  禁舍开塞: "jìn shě kāi sāi",
  祲威盛容: "jìn wēi shèng róng",
  进退消长: "jìn tuì xiāo cháng",
  进退应矩: "jìn tuì yīng jǔ",
  进退触籓: "jìn tuì chù fān",
  进退跋疐: "jìn tuì bá zhì",
  尽多尽少: "jǐn duō jǐn shǎo",
  锦囊还矢: "jǐn náng huán shǐ",
  矜己自饰: "jīn jǐ zì shì",
  矜功负气: "jīn gōng fù qì",
  津关险塞: "jīn guān xiǎn sài",
  金吾不禁: "jīn wú bú jìn",
  金翅擘海: "jīn chì bāi hǎi",
  解衣衣人: "jiě yī yī rén",
  解人难得: "jiě rén nán dé",
  解铃系铃: "jiě líng xì líng",
  解发佯狂: "jiě fà yáng kuáng",
  诘屈磝碻: "jié qū áo qiāo",
  教猱升木: "jiāo náo shēng mù",
  较瘦量肥: "jiào shòu liàng féi",
  角立杰出: "jiǎo lì jié chū",
  焦沙烂石: "jiāo shā làn shí",
  骄儿騃女: "jiāo ér sì nǚ",
  浇风薄俗: "jiāo fēng bó sú",
  降妖捉怪: "xiáng yāo zhuō guài",
  将取固予: "jiāng qǔ gù yǔ",
  将门有将: "jiàng mén yǒu jiàng",
  将夺固与: "jiāng duó gù yǔ",
  槛花笼鹤: "jiàn huā lóng hè",
  鉴影度形: "jiàn yǐng duó xíng",
  渐不可长: "jiàn bù kě zhǎng",
  见素抱朴: "xiàn sù bào pǔ",
  见弃于人: "jiàn qì yú rén",
  简丝数米: "jiǎn sī shǔ mǐ",
  俭不中礼: "jiǎn bú zhòng lǐ",
  间见层出: "jiàn xiàn céng chū",
  尖嘴薄舌: "jiān zuǐ bó shé",
  甲冠天下: "jiǎ guàn tiān xià",
  葭莩之亲: "jiā fú zhī qīn",
  家累千金: "jiā lèi qiān jīn",
  家给人足: "jiā jǐ rén zú",
  家道从容: "jiā dào cóng róng",
  夹袋人物: "jiā dài rén wù",
  霁风朗月: "jì fēng lǎng yuè",
  寄兴寓情: "jì xìng yù qíng",
  计深虑远: "jì shēn lǜ yuǎn",
  计功量罪: "jì gōng liàng zuì",
  掎裳连襼: "jǐ shang lián yì",
  虮虱相吊: "jǐ shī xiāng diào",
  疾不可为: "jí bù kě wéi",
  极深研几: "jí shēn yán jī",
  及宾有鱼: "jí bīn yǒu yú",
  激薄停浇: "jī bó tíng jiāo",
  积素累旧: "jī sù lěi jiù",
  积时累日: "jī shí lěi rì",
  积露为波: "jī lù wéi bō",
  积德累功: "jī dé lěi gōng",
  积谗糜骨: "jī chán méi gǔ",
  击排冒没: "jī pái mào mò",
  祸为福先: "huò wéi fú xiān",
  祸福相依: "huò fú xiāng yī",
  获隽公车: "huò jùn gōng chē",
  混应滥应: "hùn yīng làn yīng",
  毁舟为杕: "huǐ zhōu wéi duò",
  毁钟为铎: "huǐ zhōng wéi duó",
  毁冠裂裳: "huǐ guān liè cháng",
  晦盲否塞: "huì máng pǐ sè",
  回船转舵: "huí chuán zhuàn duò",
  潢池盗弄: "huáng chí dào nòng",
  黄冠草履: "huáng guàn cǎo lǚ",
  黄发儿齿: "huáng fà ér chǐ",
  黄发垂髫: "huáng fà chuí tiáo",
  还珠返璧: "huán zhū fǎn bì",
  还年驻色: "huán nián zhù sè",
  还年却老: "huán nián què lǎo",
  坏裳为裤: "huài shang wéi kù",
  画荻和丸: "huà dí huò wán",
  化枭为鸠: "huà xiāo wéi jiū",
  化腐为奇: "huà fǔ wéi qí",
  化鸱为凤: "huà chī wéi fèng",
  花不棱登: "huā bu lēng dēng",
  户限为穿: "hù xiàn wéi chuān",
  呼卢喝雉: "hū lú hè zhì",
  呼来喝去: "hū lái hè qù",
  呼不给吸: "hū bù jǐ xī",
  厚味腊毒: "hòu wèi xī dú",
  厚德载物: "hòu dé zài wù",
  鸿渐于干: "hóng jiàn yú gàn",
  洪炉燎发: "hóng lú liáo fà",
  红绳系足: "hóng shéng jì zú",
  红不棱登: "hóng bu lēng dēng",
  横抢硬夺: "hèng qiǎng yìng duó",
  横恩滥赏: "hèng ēn làn shǎng",
  恨海难填: "hèn hǎi nán tián",
  鹤发鸡皮: "hè fà jī pí",
  涸思干虑: "hé sī gān lǜ",
  河涸海干: "hé hé hǎi gān",
  和颜说色: "hé yán yuè sè",
  合从连衡: "hé zòng lián héng",
  浩浩汤汤: "hào hào shāng shāng",
  好勇斗狠: "hào yǒng dòu hěn",
  好问则裕: "hào wèn zé yù",
  好为事端: "hào wéi shì duān",
  好问决疑: "hào wèn jué yí",
  好生之德: "hào shēng zhī dé",
  好奇尚异: "hǎo qí shàng yì",
  好恶不同: "hǎo è bù tóng",
  好丹非素: "hào dān fēi sù",
  豪干暴取: "háo gàn bào qǔ",
  毫发不爽: "háo fà bù shuǎng",
  寒酸落魄: "hán suān luò pò",
  含英咀华: "hán yīng jǔ huá",
  含糊不明: "hán hú bù míng",
  过为已甚: "guò wéi yǐ shèn",
  桂折兰摧: "guì shé lán cuī",
  规旋矩折: "guī xuán jǔ shé",
  广文先生: "guǎng wén xiān sheng",
  广陵散绝: "guǎng líng sǎn jué",
  冠山戴粒: "guàn shān dài lì",
  冠屦倒施: "guàn jù dǎo shī",
  挂席为门: "guà xí wéi mén",
  寡见鲜闻: "guǎ jiàn xiǎn wén",
  瓜葛相连: "guā gé xiāng lián",
  鼓吻奋爪: "gǔ wěn fèn zhǎo",
  古调单弹: "gǔ diào dān tán",
  古调不弹: "gǔ diào bù tán",
  姑射神人: "gū yè shén rén",
  苟合取容: "gǒu hé qǔ róng",
  狗续侯冠: "gǒu xù hòu guàn",
  钩爪锯牙: "gōu zhǎo jù yá",
  共枝别干: "gòng zhī bié gàn",
  共为唇齿: "gòng wéi chún chǐ",
  拱手而降: "gǒng shǒu ér xiáng",
  拱肩缩背: "gǒng jiān suō bèi",
  功薄蝉翼: "gōng bó chán yì",
  弓调马服: "gōng diào mǎ fú",
  更姓改物: "gēng xìng gǎi wù",
  更仆难数: "gēng pú nán shǔ",
  更令明号: "gēng lìng míng hào",
  更待干罢: "gèng dài gàn bà",
  更唱迭和: "gēng chàng dié hé",
  更长梦短: "gēng cháng mèng duǎn",
  各色名样: "gè sè míng yàng",
  格格不纳: "gé gé bú nà",
  格格不吐: "gé gé bù tǔ",
  告朔饩羊: "gù shuò xì yáng",
  膏车秣马: "gào chē mò mǎ",
  高义薄云: "gāo yì bó yún",
  岗头泽底: "gāng tóu zé dǐ",
  敢为敢做: "gǎn wéi gǎn zuò",
  甘分随时: "gān fèn suí shí",
  甘处下流: "gān chǔ xià liú",
  干啼湿哭: "gàn tí shī kū",
  干名犯义: "gàn míng fàn yì",
  干将莫邪: "gān jiāng mò yé",
  干城之将: "gān chéng zhī jiàng",
  腹载五车: "fù zài wǔ chē",
  父债子还: "fù zhài zǐ huán",
  父为子隐: "fù wéi zǐ yǐn",
  辅世长民: "fǔ shì zhǎng mín",
  福为祸始: "fú wéi huò shǐ",
  符号逻辑: "fú hào luó jí",
  浮收勒折: "fú shōu lè shé",
  肤受之愬: "fū shòu zhī sù",
  否终则泰: "pǐ zhōng zé tài",
  佛头著粪: "fó tóu zhuó fèn",
  奉为楷模: "fèng wéi kǎi mó",
  凤靡鸾吪: "fèng mǐ luán é",
  封豨修蛇: "fēng xī xiū shé",
  风影敷衍: "fēng yǐng fū yǎn",
  丰屋蔀家: "fēng wū bù jiā",
  粪土不如: "fèn tǔ bù rú",
  分风劈流: "fēn fēng pǐ liú",
  沸沸汤汤: "fèi fèi shāng shāng",
  菲食薄衣: "fěi shí bó yī",
  飞将数奇: "fēi jiàng shù qí",
  放辟邪侈: "fàng pì xié chǐ",
  方领圆冠: "fāng lǐng yuán guàn",
  犯而不校: "fàn ér bú jiào",
  返本还源: "fǎn běn huán yuán",
  反劳为逸: "fǎn láo wéi yì",
  法轮常转: "fǎ lún cháng zhuàn",
  罚不当罪: "fá bù dāng zuì",
  发引千钧: "fà yǐn qiān jūn",
  发奸擿伏: "fā jiān tī fú",
  发短心长: "fà duǎn xīn cháng",
  二竖为虐: "èr shù wéi nüè",
  儿女心肠: "ér nǚ xīn cháng",
  儿女亲家: "ér nǚ qìng jiā",
  遏恶扬善: "è wù yáng shàn",
  饿殍枕藉: "è piǎo zhěn jí",
  饿殍载道: "è piǎo zài dào",
  恶醉强酒: "wù zuì qiǎng jiǔ",
  恶意中伤: "è yì zhòng shāng",
  恶湿居下: "wù shī jū xià",
  恶居下流: "wù jū xià liú",
  恶不去善: "wù bú qù shàn",
  扼吭夺食: "è háng duó shí",
  扼襟控咽: "è jīn kòng yān",
  峨峨汤汤: "é é shāng shāng",
  屙金溺银: "ē jīn niào yín",
  朵颐大嚼: "duǒ yí dà jiáo",
  夺人所好: "duó rén suǒ hào",
  多言数穷: "duō yán shuò qióng",
  多文为富: "duō wén wéi fù",
  多端寡要: "duō duān guǎ yào",
  多财善贾: "duō cái shàn gǔ",
  遁世无闷: "dùn shì wú mèn",
  遁迹黄冠: "dùn jì huáng guàn",
  堆案盈几: "duī àn yíng jī",
  断还归宗: "duàn huán guī zōng",
  短见薄识: "duǎn jiàn bó shí",
  蠹居棊处: "dù jū qí chǔ",
  度己以绳: "duó jǐ yǐ shéng",
  杜默为诗: "dù mò wéi shī",
  杜鹃啼血: "dù juān tí xuè",
  笃近举远: "dǔ jìn jǔ yuǎn",
  独有千秋: "dú yǒu qiān qiū",
  读书得间: "dú shū dé jiàn",
  斗转参横: "dǒu zhuǎn shēn héng",
  兜肚连肠: "dōu dǔ lián cháng",
  洞见症结: "dòng jiàn zhèng jié",
  恫疑虚喝: "dòng yí xū hè",
  动中窾要: "dòng zhōng kuǎn yào",
  东鸣西应: "dōng míng xī yīng",
  东鳞西爪: "dōng lín xī zhǎo",
  东量西折: "dōng liàng xī shé",
  东家西舍: "dōng jiā xī shè",
  东扯西拽: "dōng chě xī zhuāi",
  鼎铛有耳: "dǐng chēng yǒu ěr",
  鼎铛玉石: "dǐng chēng yù shí",
  钉头磷磷: "dīng tóu lín lín",
  跌宕不羁: "diē dàng bù jī",
  跌弹斑鸠: "diē dàn bān jiū",
  雕心雁爪: "diāo xīn yàn zhǎo",
  颠倒衣裳: "diān dǎo yī cháng",
  德薄能鲜: "dé bó néng xiǎn",
  得马折足: "dé mǎ shé zú",
  蹈其覆辙: "dǎo qí fù zhé",
  捣虚撇抗: "dǎo xū piē kàng",
  倒载干戈: "dào zài gān gē",
  倒裳索领: "dào cháng suǒ lǐng",
  倒果为因: "dào guǒ wéi yīn",
  叨在知己: "tāo zài zhī jǐ",
  叨陪末座: "tāo péi mò zuò",
  党豺为虐: "dǎng chái wéi nüè",
  当轴处中: "dāng zhóu chǔ zhōng",
  当着不着: "dāng zhuó bù zhuó",
  当务始终: "dāng wù shǐ zhōng",
  淡汝浓抹: "dàn rǔ nóng mǒ",
  弹丸脱手: "tán wán tuō shǒu",
  弹铗无鱼: "dàn jiá wú yú",
  箪食瓢饮: "dān sì piáo yǐn",
  大璞不完: "dà pú bù wán",
  大明法度: "dà míng fǎ dù",
  大车以载: "dà chē yǐ zài",
  打闷葫芦: "dǎ mèn hú lu",
  沓来踵至: "tà lái zhǒng zhì",
  厝火燎原: "cuò huǒ liǎo yuán",
  撮科打哄: "cuō kē dǎ hòng",
  寸积铢累: "cùn jī zhū lěi",
  啛啛喳喳: "cuì cuì chā chā",
  摧折豪强: "cuī zhé háo qiáng",
  摧刚为柔: "cuī gāng wéi róu",
  从俗就简: "cóng sú jiù jiǎn",
  此发彼应: "cǐ fā bǐ yīng",
  此唱彼和: "cǐ chàng bǐ hè",
  慈悲为本: "cí bēi wéi běn",
  纯属骗局: "chún shǔ piàn jú",
  春笋怒发: "chūn sǔn nù fā",
  垂头搨翼: "chuí tóu tà yì",
  传为笑谈: "chuán wéi xiào tán",
  传风扇火: "chuán fēng shān huǒ",
  穿红着绿: "chuān hóng zhuó lǜ",
  触处机来: "chù chǔ jī lái",
  处尊居显: "chǔ zūn jū xiǎn",
  处堂燕雀: "chǔ táng yàn què",
  处实效功: "chǔ shí xiào gōng",
  处高临深: "chǔ gāo lín shēn",
  出入无间: "chū rù wú jiān",
  出门应辙: "chū mén yīng zhé",
  出处语默: "chū chǔ yǔ mò",
  出处殊途: "chū chǔ shū tú",
  出处进退: "chū chǔ jìn tuì",
  愁山闷海: "chóu shān mèn hǎi",
  冲冠眦裂: "chōng guàn zì liè",
  齿牙为祸: "chǐ yá wéi huò",
  尺二冤家: "chǐ èr yuān jia",
  尺短寸长: "chǐ duǎn cùn cháng",
  尺寸之功: "chǐ cùn zhī gōng",
  城北徐公: "chéng běi xú gōng",
  成败兴废: "chéng bài xīng fèi",
  趁水和泥: "chèn shuǐ huò ní",
  称雨道晴: "chēng yǔ dào qíng",
  称体载衣: "chēng tǐ zài yī",
  称体裁衣: "chèn tǐ cái yī",
  称家有无: "chèn jiā yǒu wú",
  称德度功: "chēng dé duó gōng",
  沉吟章句: "chén yín zhāng jù",
  沉吟不决: "chén yín bù jué",
  沉疴宿疾: "chén kē sù jí",
  扯纤拉烟: "chě qiàn lā yān",
  扯顺风旗: "chě shùn fēng qí",
  车载船装: "chē zǎi chuán zhuāng",
  朝升暮合: "zhāo shēng mù gě",
  朝攀暮折: "zhāo pān mù shé",
  超今冠古: "chāo jīn guàn gǔ",
  倡而不和: "chàng ér bú hè",
  畅所欲为: "chàng suǒ yù wéi",
  苌弘碧血: "cháng hóng bì xiě",
  长幼尊卑: "zhǎng yòu zūn bēi",
  长绳系日: "cháng shéng jì rì",
  长年三老: "zhǎng nián sān lǎo",
  长春不老: "cháng chūn bù lǎo",
  长傲饰非: "zhǎng ào shì fēi",
  昌亭旅食: "chāng tíng lǚ shí",
  禅絮沾泥: "chán xù zhān ní",
  差三错四: "chā sān cuò sì",
  层台累榭: "céng tái lěi xiè",
  层见迭出: "céng xiàn dié chū",
  藏踪蹑迹: "cáng zōng niè jì",
  苍蝇见血: "cāng yíng jiàn xiě",
  餐松啖柏: "cān sōng dàn bó",
  骖风驷霞: "cān fēng sì xiá",
  参伍错综: "cēn wǔ cuò zōng",
  参辰卯酉: "shēn chén mǎo yǒu",
  材优干济: "cái yōu gān jǐ",
  材薄质衰: "cái bó zhì shuāi",
  才大难用: "cái dà nán yòng",
  才薄智浅: "cái bó zhì qiǎn",
  不足为意: "bù zú wéi yì",
  不足为据: "bù zú wéi jù",
  不足为法: "bù zú wéi fǎ",
  不足齿数: "bù zú chǐ shǔ",
  不着疼热: "bù zhuó téng rè",
  不知薡蕫: "bù zhī dǐng dǒng",
  不越雷池: "bú yuè léi chí",
  不相为谋: "bù xiāng wéi móu",
  不贪为宝: "bù tān wéi bǎo",
  不了而了: "bù liǎo ér liǎo",
  不可揆度: "bù kě kuí duó",
  不遑启处: "bù huáng qǐ chǔ",
  不当不正: "bù dāng bú zhèng",
  不差什么: "bú chà shén me",
  不差累黍: "bù chā lěi shǔ",
  擘两分星: "bò liǎng fēn xīng",
  簸土扬沙: "bǒ tǔ yáng shā",
  薄物细故: "bó wù xì gù",
  薄寒中人: "bó hán zhòng rén",
  博文约礼: "bó wén yuē lǐ",
  播糠眯目: "bō kāng mí mù",
  剥皮抽筋: "bō pí chōu jīn",
  剥肤椎髓: "bō fū chuí suǐ",
  波属云委: "bō zhǔ yún wěi",
  波骇云属: "bō hài yún zhǔ",
  兵微将寡: "bīng wēi jiàng guǎ",
  兵强将勇: "bīng qiáng jiàng yǒng",
  兵多将广: "bīng duō jiàng guǎng",
  兵不由将: "bīng bù yóu jiàng",
  冰解的破: "bīng jiě dì pò",
  彬彬济济: "bīn bīn jǐ jǐ",
  摽梅之年: "biào méi zhī nián",
  表里为奸: "biǎo lǐ wéi jiān",
  飙发电举: "biāo fā diàn jǔ",
  变贪厉薄: "biàn tān lì bó",
  敝盖不弃: "bì gài bú qì",
  秕言谬说: "bǐ yán miù shuō",
  比物属事: "bǐ wù zhǔ shì",
  被山带河: "pī shān dài hé",
  被甲枕戈: "pī jiǎ zhěn gē",
  被甲据鞍: "pī jiǎ jù ān",
  被褐怀玉: "pī hè huái yù",
  被发缨冠: "pī fà yīng guàn",
  背曲腰躬: "bèi qǔ yāo gōng",
  北窗高卧: "běi chuāng gāo wò",
  北辰星拱: "běi chén xīng gǒng",
  北鄙之音: "běi bǐ zhī yīn",
  卑宫菲食: "bēi gōng fěi shí",
  暴衣露冠: "pù yī lù guàn",
  暴腮龙门: "pù sāi lóng mén",
  暴露文学: "bào lù wén xué",
  暴虎冯河: "bào hǔ píng hé",
  抱蔓摘瓜: "bào wàn zhāi guā",
  抱法处势: "bào fǎ chǔ shì",
  褒贬与夺: "bāo biǎn yǔ duó",
  帮闲钻懒: "bāng xián zuān lǎn",
  拜将封侯: "bài jiàng fēng hóu",
  百兽率舞: "bǎi shòu shuài wǔ",
  百孔千创: "bǎi kǒng qiān chuāng",
  白衣卿相: "bái yī qīng xiàng",
  白首为郎: "bái shǒu wéi láng",
  白首相知: "bái shǒu xiāng zhī",
  把玩无厌: "bǎ wán wú yàn",
  拔锅卷席: "bá guō juǎn xí",
  拔本塞源: "bá běn sè yuán",
  傲不可长: "ào bù kě zhǎng",
  熬更守夜: "áo gēng shǒu yè",
  安时处顺: "ān shí chǔ shùn",
  安身为乐: "ān shēn wéi lè",
  安老怀少: "ān lǎo huái shào",
  安步当车: "ān bù dàng chē",
  爱人好士: "ài rén hào shì",
  矮人观场: "ǎi rén guān chǎng",
  捱风缉缝: "ái fēng jī fèng",
  挨山塞海: "āi shān sè hǎi",
  阿家阿翁: "ā jiā ā wēng",
  阿党相为: "ē dǎng xiāng wéi",
  追亡逐北: "zhuī wáng zhú běi",
  竹篮打水: "zhú lán dá shuǐ",
  知疼着热: "zhī téng zháo rè",
  语不惊人: "yǔ bù jīng rén",
  于今为烈: "yú jīn wéi liè",
  一日三省: "yí rì sān xǐng",
  穴居野处: "xué jū yě chǔ",
  五脊六兽: "wǔ jǐ liù shòu",
  无声无臭: "wú shēng wú xiù",
  谓予不信: "wèi yú bú xìn",
  舍身为国: "shě shēn wéi guó",
  杀妻求将: "shā qī qiú jiàng",
  强作解人: "qiǎng zuò jiě rén",
  气冲斗牛: "qì chōng dǒu niú",
  临深履薄: "lín shēn lǚ bó",
  钧天广乐: "jūn tiān guǎng yuè",
  艰难竭蹶: "jiān nán jié jué",
  夹七夹八: "jiā qī jiā bā",
  混混噩噩: "hún hún è è",
  厚古薄今: "hòu gǔ bó jīn",
  鬼怕恶人: "guǐ pà è rén",
  伽马射线: "gā mǎ shè xiàn",
  佛头着粪: "fó tóu zhuó fèn",
  奉为至宝: "fèng wéi zhì bǎo",
  登坛拜将: "dēng tán bài jiàng",
  晨昏定省: "chén hūn dìng xǐng",
  察察为明: "chá chá wéi míng",
  博闻强识: "bó wén qiáng zhì",
  避难就易: "bì nán jiù yì",
  了无生机: "liǎo wú shēng jī",
  // 一字不变调的词语，如果词语仅有单个一且一字在结尾的无需添加（需要增补更多）
  有一说一: "yǒu yī shuō yī",
  独一无二: "dú yī wú èr",
  说一不二: "shuō yī bù èr",
  举一反三: "jǔ yī fǎn sān",
  数一数二: "shǔ yī shǔ èr",
  杀一儆百: "shā yī jǐng bǎi",
  丁一卯二: "dīng yī mǎo èr",
  丁一确二: "dīng yī què èr",
  不一而止: "bù yī ér zhǐ",
  无一幸免: "wú yī xìng miǎn",
  // 来源：https://m.gushici.com/cyxy_4e00_4
  表里不一: "biǎo lǐ bù yī",
  良莠不一: "liáng yǒu bù yī",
  心口不一: "xīn kǒu bù yī",
  言行不一: "yán xíng bù yī",
  政令不一: "zhèng lìng bù yī",
  参差不一: "cēn cī bù yī",
  纷纷不一: "fēn fēn bù yī",
  毁誉不一: "huǐ yù bù yī",
  不一而三: "bù yī ér sān",
  百不一遇: "bǎi bù yī yù",
  言行抱一: "yán xíng bào yī",
  瑜百瑕一: "yú bǎi xiá yī",
  背城借一: "bèi chéng jiè yī",
  凭城借一: "píng chéng jiè yī",
  劝百讽一: "quàn bǎi fěng yī",
  群居和一: "qún jū hé yī",
  百不获一: "bǎi bù huò yī",
  百不失一: "bǎi bù shī yī",
  百无失一: "bǎi wú shī yī",
  万不失一: "wàn bù shī yī",
  万无失一: "wàn wú shī yī",
  合而为一: "hé ér wéi yī",
  合两为一: "hé liǎng wéi yī",
  合二为一: "hé èr wéi yī",
  天下为一: "tiān xià wéi yī",
  相与为一: "xiāng yǔ wéi yī",
  较若画一: "jiào ruò huà yī",
  较如画一: "jiào rú huà yī",
  斠若画一: "jiào ruò huà yī",
  言行若一: "yán xíng ruò yī",
  始终若一: "shǐ zhōng ruò yī",
  终始若一: "zhōng shǐ ruò yī",
  惟精惟一: "wéi jīng wéi yī",
  众多非一: "zhòng duō fēi yī",
  不能赞一: "bù néng zàn yī",
  问一答十: "wèn yī dá shí",
  一不扭众: "yī bù niǔ zhòng",
  一以贯之: "yī yǐ guàn zhī",
  一以当百: "yī yǐ dāng bǎi",
  百不当一: "bǎi bù dāng yī",
  十不当一: "shí bù dāng yī",
  以一警百: "yǐ yī jǐng bǎi",
  以一奉百: "yǐ yī fèng bǎi",
  以一持万: "yǐ yī chí wàn",
  以一知万: "yǐ yī zhī wàn",
  百里挑一: "bǎi lǐ tiāo yī",
  整齐划一: "zhěng qí huà yī",
  一来二去: "yī lái èr qù",
  一路公交: "yī lù gōng jiāo",
  一路汽车: "yī lù qì chē",
  一路巴士: "yī lù bā shì",
  朝朝朝落: "zhāo cháo zhāo luò",
  曲意逢迎: "qū yì féng yíng",
  一行不行: "yì háng bù xíng",
  行行不行: "háng háng bù xíng"
};
const Pattern4 = Object.keys(DICT4).map((key) => ({
  zh: key,
  pinyin: DICT4[key],
  probability: 2e-8,
  length: 4,
  priority: Priority.Normal,
  dict: Symbol("dict4")
}));
const DICT5 = {
  巴尔干半岛: "bā ěr gàn bàn dǎo",
  巴尔喀什湖: "bā ěr kā shí hú",
  不幸而言中: "bú xìng ér yán zhòng",
  布尔什维克: "bù ěr shí wéi kè",
  何乐而不为: "hé lè ér bù wéi",
  苛政猛于虎: "kē zhèng měng yú hǔ",
  蒙得维的亚: "méng dé wéi dì yà",
  民以食为天: "mín yǐ shí wéi tiān",
  事后诸葛亮: "shì hòu zhū gě liàng",
  物以稀为贵: "wù yǐ xī wéi guì",
  先下手为强: "xiān xià shǒu wéi qiáng",
  行行出状元: "háng háng chū zhuàng yuan",
  亚得里亚海: "yà dé lǐ yà hǎi",
  眼不见为净: "yǎn bú jiàn wéi jìng",
  竹筒倒豆子: "zhú tǒng dào dòu zi"
};
const Pattern5 = Object.keys(DICT5).map((key) => ({
  zh: key,
  pinyin: DICT5[key],
  probability: 2e-8,
  length: 5,
  priority: Priority.Normal,
  dict: Symbol("dict5")
}));
function getMaxProbability(a2, b2) {
  if (!a2) {
    return b2;
  }
  if (a2.decimal < b2.decimal) {
    return a2;
  } else if (a2.decimal === b2.decimal) {
    return a2.probability > b2.probability ? a2 : b2;
  } else {
    return b2;
  }
}
function checkDecimal(prob) {
  if (prob.probability < 1e-300) {
    prob.probability *= 1e300;
    prob.decimal += 1;
  }
}
function getPatternDecimal(pattern) {
  if (pattern.priority === Priority.Custom) {
    return -(pattern.length * pattern.length * 100);
  }
  if (pattern.priority === Priority.Surname) {
    return -(pattern.length * pattern.length * 10);
  }
  return 0;
}
function maxProbability(patterns, length) {
  const dp = [];
  let patternIndex = patterns.length - 1;
  let pattern = patterns[patternIndex];
  for (let i2 = length - 1; i2 >= 0; i2--) {
    const suffixDP = i2 + 1 >= length ? { probability: 1, decimal: 0, patterns: [] } : dp[i2 + 1];
    while (pattern && pattern.index + pattern.length - 1 === i2) {
      const startIndex = pattern.index;
      const curDP = {
        probability: pattern.probability * suffixDP.probability,
        decimal: suffixDP.decimal + getPatternDecimal(pattern),
        patterns: suffixDP.patterns,
        concatPattern: pattern
      };
      checkDecimal(curDP);
      dp[startIndex] = getMaxProbability(dp[startIndex], curDP);
      pattern = patterns[--patternIndex];
    }
    const iDP = {
      probability: 1e-13 * suffixDP.probability,
      decimal: 0,
      patterns: suffixDP.patterns
    };
    checkDecimal(iDP);
    dp[i2] = getMaxProbability(dp[i2], iDP);
    if (dp[i2].concatPattern) {
      dp[i2].patterns = dp[i2].patterns.concat(dp[i2].concatPattern);
      dp[i2].concatPattern = void 0;
      delete dp[i2 + 1];
    }
  }
  return dp[0].patterns.reverse();
}
function getMinCount(a2, b2) {
  if (!a2) {
    return b2;
  }
  return a2.count <= b2.count ? a2 : b2;
}
function getPatternCount(pattern) {
  if (pattern.priority === Priority.Custom) {
    return -(pattern.length * pattern.length * 1e5);
  }
  if (pattern.priority === Priority.Surname) {
    return -(pattern.length * pattern.length * 100);
  }
  return 1;
}
function minTokenization(patterns, length) {
  const dp = [];
  let patternIndex = patterns.length - 1;
  let pattern = patterns[patternIndex];
  for (let i2 = length - 1; i2 >= 0; i2--) {
    const suffixDP = i2 + 1 >= length ? { count: 0, patterns: [] } : dp[i2 + 1];
    while (pattern && pattern.index + pattern.length - 1 === i2) {
      const startIndex = pattern.index;
      const curDP = {
        count: getPatternCount(pattern) + suffixDP.count,
        patterns: suffixDP.patterns,
        concatPattern: pattern
      };
      dp[startIndex] = getMinCount(dp[startIndex], curDP);
      pattern = patterns[--patternIndex];
    }
    const iDP = {
      count: 1 + suffixDP.count,
      patterns: suffixDP.patterns
    };
    dp[i2] = getMinCount(dp[i2], iDP);
    if (dp[i2].concatPattern) {
      dp[i2].patterns = dp[i2].patterns.concat(dp[i2].concatPattern);
      dp[i2].concatPattern = void 0;
      delete dp[i2 + 1];
    }
  }
  return dp[0].patterns.reverse();
}
function isIgnorablePattern(cur, pre) {
  if (pre.index + pre.length <= cur.index) {
    return false;
  }
  if (pre.priority > cur.priority) {
    return false;
  }
  if (pre.priority === cur.priority && pre.length > cur.length) {
    return false;
  }
  return true;
}
function reverseMaxMatch(patterns) {
  const filteredArr = [];
  for (let i2 = patterns.length - 1; i2 >= 0; ) {
    const { index: index2 } = patterns[i2];
    let j2 = i2 - 1;
    while (j2 >= 0 && isIgnorablePattern(patterns[i2], patterns[j2])) {
      j2--;
    }
    if (j2 < 0 || patterns[j2].index + patterns[j2].length <= index2) {
      filteredArr.push(patterns[i2]);
    }
    i2 = j2;
  }
  return filteredArr.reverse();
}
var TokenizationAlgorithm;
(function(TokenizationAlgorithm2) {
  TokenizationAlgorithm2[TokenizationAlgorithm2["ReverseMaxMatch"] = 1] = "ReverseMaxMatch";
  TokenizationAlgorithm2[TokenizationAlgorithm2["MaxProbability"] = 2] = "MaxProbability";
  TokenizationAlgorithm2[TokenizationAlgorithm2["MinTokenization"] = 3] = "MinTokenization";
})(TokenizationAlgorithm || (TokenizationAlgorithm = {}));
class TrieNode {
  constructor(parent, prefix = "", key = "") {
    this.children = /* @__PURE__ */ new Map();
    this.fail = null;
    this.patterns = [];
    this.parent = parent;
    this.prefix = prefix;
    this.key = key;
  }
}
class AC {
  constructor() {
    this.dictMap = /* @__PURE__ */ new Map();
    this.queues = [];
    this.root = new TrieNode(null);
  }
  build(patternList) {
    this.buildTrie(patternList);
    this.buildFailPointer();
  }
  // 构建 trie 树
  buildTrie(patternList) {
    for (let pattern of patternList) {
      const zhChars = splitString(pattern.zh);
      let cur = this.root;
      for (let i2 = 0; i2 < zhChars.length; i2++) {
        let c2 = zhChars[i2];
        if (!cur.children.has(c2)) {
          const trieNode = new TrieNode(cur, zhChars.slice(0, i2).join(""), c2);
          cur.children.set(c2, trieNode);
          this.addNodeToQueues(trieNode);
        }
        cur = cur.children.get(c2);
      }
      this.insertPattern(cur.patterns, pattern);
      pattern.node = cur;
      this.addPatternToDictMap(pattern);
    }
  }
  // 构建失败指针
  buildFailPointer() {
    let queue2 = [];
    let queueIndex = 0;
    this.queues.forEach((_queue) => {
      queue2 = queue2.concat(_queue);
    });
    this.queues = [];
    while (queue2.length > queueIndex) {
      let node = queue2[queueIndex++];
      let failNode = node.parent && node.parent.fail;
      let key = node.key;
      while (failNode && !failNode.children.has(key)) {
        failNode = failNode.fail;
      }
      if (!failNode) {
        node.fail = this.root;
      } else {
        node.fail = failNode.children.get(key);
      }
    }
  }
  // 将 pattern 添加到 dictMap 中
  addPatternToDictMap(pattern) {
    if (!this.dictMap.has(pattern.dict)) {
      this.dictMap.set(pattern.dict, /* @__PURE__ */ new Set());
    }
    this.dictMap.get(pattern.dict).add(pattern);
  }
  addNodeToQueues(trieNode) {
    if (!this.queues[stringLength(trieNode.prefix)]) {
      this.queues[stringLength(trieNode.prefix)] = [];
    }
    this.queues[stringLength(trieNode.prefix)].push(trieNode);
  }
  // 按照优先级插入 pattern
  insertPattern(patterns, pattern) {
    for (let i2 = patterns.length - 1; i2 >= 0; i2--) {
      const _pattern = patterns[i2];
      if (pattern.priority === _pattern.priority && pattern.probability >= _pattern.probability) {
        patterns[i2 + 1] = _pattern;
      } else if (pattern.priority > _pattern.priority) {
        patterns[i2 + 1] = _pattern;
      } else {
        patterns[i2 + 1] = pattern;
        return;
      }
    }
    patterns[0] = pattern;
  }
  removeDict(dictName) {
    if (this.dictMap.has(dictName)) {
      const set2 = this.dictMap.get(dictName);
      set2.forEach((pattern) => {
        pattern.node.patterns = pattern.node.patterns.filter((_pattern) => _pattern !== pattern);
      });
      this.dictMap.delete(dictName);
    }
  }
  // 搜索字符串返回匹配的模式串
  match(text, surname) {
    let cur = this.root;
    let result = [];
    const zhChars = splitString(text);
    for (let i2 = 0; i2 < zhChars.length; i2++) {
      let c2 = zhChars[i2];
      while (cur !== null && !cur.children.has(c2)) {
        cur = cur.fail;
      }
      if (cur === null) {
        cur = this.root;
      } else {
        cur = cur.children.get(c2);
        const pattern = cur.patterns.find((item) => {
          if (surname === "off") {
            return item.priority !== Priority.Surname;
          } else if (surname === "head") {
            return item.length - 1 - i2 === 0;
          } else {
            return true;
          }
        });
        if (pattern) {
          result.push(Object.assign(Object.assign({}, pattern), { index: i2 - pattern.length + 1 }));
        }
        let failNode = cur.fail;
        while (failNode !== null) {
          const pattern2 = failNode.patterns.find((item) => {
            if (surname === "off") {
              return item.priority !== Priority.Surname;
            } else if (surname === "head") {
              return item.length - 1 - i2 === 0;
            } else {
              return true;
            }
          });
          if (pattern2) {
            result.push(Object.assign(Object.assign({}, pattern2), { index: i2 - pattern2.length + 1 }));
          }
          failNode = failNode.fail;
        }
      }
    }
    return result;
  }
  search(text, surname, algorithm = 2) {
    const patterns = this.match(text, surname);
    if (algorithm === 1) {
      return reverseMaxMatch(patterns);
    } else if (algorithm === 3) {
      return minTokenization(patterns, stringLength(text));
    }
    return maxProbability(patterns, stringLength(text));
  }
}
const PatternsNormal = [
  ...Pattern5,
  ...Pattern4,
  ...Pattern3,
  ...Pattern2,
  ...PatternNumberDict,
  ...PatternSurname
];
const acTree = new AC();
acTree.build(PatternsNormal);
const customMultipleDict = new FastDictFactory();
const getCustomMultpileDict = () => {
  return customMultipleDict;
};
const getSingleWordPinyin = (char) => {
  const pinyin2 = DICT1.get(char);
  return pinyin2 ? pinyin2.split(" ")[0] : char;
};
const getPinyin = (word, list, surname, segmentit) => {
  const matches = acTree.search(word, surname, segmentit);
  let matchIndex = 0;
  const zhChars = splitString(word);
  for (let i2 = 0; i2 < zhChars.length; ) {
    const match = matches[matchIndex];
    if (match && i2 === match.index) {
      if (match.length === 1 && match.priority <= Priority.Normal) {
        const char = zhChars[i2];
        let pinyin2 = "";
        pinyin2 = processSepecialPinyin(char, zhChars[i2 - 1], zhChars[i2 + 1]);
        list[i2] = {
          origin: char,
          result: pinyin2,
          isZh: pinyin2 !== char,
          originPinyin: pinyin2
        };
        i2++;
        matchIndex++;
        continue;
      }
      const pinyins = match.pinyin.split(" ");
      let pinyinIndex = 0;
      for (let j2 = 0; j2 < match.length; j2++) {
        const zhChars2 = splitString(match.zh);
        list[i2 + j2] = {
          origin: zhChars2[j2],
          result: pinyins[pinyinIndex] || "",
          isZh: true,
          originPinyin: pinyins[pinyinIndex] || ""
        };
        pinyinIndex++;
      }
      i2 += match.length;
      matchIndex++;
    } else {
      const char = zhChars[i2];
      let pinyin2 = "";
      pinyin2 = processSepecialPinyin(char, zhChars[i2 - 1], zhChars[i2 + 1]);
      list[i2] = {
        origin: char,
        result: pinyin2,
        isZh: pinyin2 !== char,
        originPinyin: pinyin2
      };
      i2++;
    }
  }
  return { list, matches };
};
const getPinyinWithoutTone = (pinyin2) => {
  return pinyin2.replace(/(ā|á|ǎ|à)/g, "a").replace(/(ō|ó|ǒ|ò)/g, "o").replace(/(ē|é|ě|è)/g, "e").replace(/(ī|í|ǐ|ì)/g, "i").replace(/(ū|ú|ǔ|ù)/g, "u").replace(/(ǖ|ǘ|ǚ|ǜ)/g, "ü").replace(/(n̄|ń|ň|ǹ)/g, "n").replace(/(m̄|ḿ|m̌|m̀)/g, "m").replace(/(ê̄|ế|ê̌|ề)/g, "ê");
};
const getAllPinyin = (char, surname = "off") => {
  const customMultpileDict = getCustomMultpileDict();
  let pinyin2 = DICT1.get(char) ? DICT1.get(char).split(" ") : [];
  if (customMultpileDict.get(char)) {
    pinyin2 = customMultpileDict.get(char).split(" ");
  } else if (surname !== "off") {
    const surnamePinyin = Surnames[char];
    if (surnamePinyin) {
      pinyin2 = [surnamePinyin].concat(pinyin2.filter((py) => py !== surnamePinyin));
    }
  }
  return pinyin2;
};
const getMultiplePinyin = (word, surname = "off") => {
  let pinyin2 = getAllPinyin(word, surname);
  if (pinyin2.length > 0) {
    return pinyin2.map((value) => ({
      origin: word,
      result: value,
      isZh: true,
      originPinyin: value
    }));
  } else {
    return [
      {
        origin: word,
        result: word,
        isZh: false,
        originPinyin: word
      }
    ];
  }
};
const getInitialAndFinal = (pinyin2, initialPattern) => {
  const pinyin_arr = pinyin2.split(" ");
  const initial_arr = [];
  const final_arr = [];
  for (let _pinyin of pinyin_arr) {
    for (let _initial of InitialList) {
      if (_pinyin.startsWith(_initial)) {
        let _final = _pinyin.slice(_initial.length);
        if (SpecialInitialList.indexOf(_initial) !== -1 && SpecialFinalList.indexOf(_final) !== -1) {
          _final = SpecialFinalMap[_final];
        }
        initial_arr.push(_initial);
        final_arr.push(_final);
        break;
      }
    }
  }
  if (initialPattern === "standard") {
    initial_arr.forEach((initial, index2) => {
      if (initial === "y" || initial === "w") {
        initial_arr[index2] = "";
      }
    });
  }
  return {
    final: final_arr.join(" "),
    initial: initial_arr.join(" ")
    // 声母
  };
};
const getFinalParts = (pinyin2) => {
  const { final } = getInitialAndFinal(pinyin2);
  let head = "", body = "", tail = "";
  if (doubleFinalList.indexOf(getPinyinWithoutTone(final)) !== -1) {
    head = final[0];
    body = final[1];
    tail = final.slice(2);
  } else {
    body = final[0] || "";
    tail = final.slice(1) || "";
  }
  return { head, body, tail };
};
const getNumOfTone = (pinyin2) => {
  const reg_tone1 = /(ā|ō|ē|ī|ū|ǖ|n̄|m̄|ê̄)/;
  const reg_tone2 = /(á|ó|é|í|ú|ǘ|ń|ḿ|ế)/;
  const reg_tone3 = /(ǎ|ǒ|ě|ǐ|ǔ|ǚ|ň|m̌|ê̌)/;
  const reg_tone4 = /(à|ò|è|ì|ù|ǜ|ǹ|m̀|ề)/;
  const reg_tone0 = /(a|o|e|i|u|ü|ê)/;
  const special_tone = /(n|m)$/;
  const tone_num_arr = [];
  const pinyin_arr = pinyin2.split(" ");
  pinyin_arr.forEach((_pinyin) => {
    if (reg_tone1.test(_pinyin)) {
      tone_num_arr.push("1");
    } else if (reg_tone2.test(_pinyin)) {
      tone_num_arr.push("2");
    } else if (reg_tone3.test(_pinyin)) {
      tone_num_arr.push("3");
    } else if (reg_tone4.test(_pinyin)) {
      tone_num_arr.push("4");
    } else if (reg_tone0.test(_pinyin)) {
      tone_num_arr.push("0");
    } else if (special_tone.test(_pinyin)) {
      tone_num_arr.push("0");
    } else {
      tone_num_arr.push("");
    }
  });
  return tone_num_arr.join(" ");
};
const getPinyinWithNum = (pinyin2, originPinyin) => {
  const pinyin_arr = getPinyinWithoutTone(pinyin2).split(" ");
  const tone_num_arr = getNumOfTone(originPinyin).split(" ");
  const res_arr = [];
  pinyin_arr.forEach((item, index2) => {
    res_arr.push(`${item}${tone_num_arr[index2]}`);
  });
  return res_arr.join(" ");
};
const getFirstLetter = (pinyin2, isZh) => {
  const first_letter_arr = [];
  const pinyin_arr = pinyin2.split(" ");
  pinyin_arr.forEach((pinyin3) => {
    first_letter_arr.push(isZh ? pinyin3[0] : pinyin3);
  });
  return first_letter_arr.join(" ");
};
const validateType = (word) => {
  if (typeof word !== "string") {
    index.__f__("error", "at node_modules/pinyin-pro/dist/index.mjs:24208", "The first param of pinyin is error: " + word + ' is not assignable to type "string".');
    return false;
  } else {
    return true;
  }
};
function isNonZhScope(char, scope) {
  if (scope instanceof RegExp) {
    return scope.test(char);
  }
  return true;
}
const middleWareNonZh = (list, options) => {
  let nonZh = options.nonZh;
  if (nonZh === "removed") {
    return list.filter((item) => item.isZh || !isNonZhScope(item.origin, options.nonZhScope));
  } else if (nonZh === "consecutive") {
    for (let i2 = list.length - 2; i2 >= 0; i2--) {
      const cur = list[i2];
      const pre = list[i2 + 1];
      if (!cur.isZh && !pre.isZh && isNonZhScope(cur.origin, options.nonZhScope) && isNonZhScope(pre.origin, options.nonZhScope)) {
        cur.origin += pre.origin;
        cur.result += pre.result;
        pre.delete = true;
      }
    }
    return list.filter((item) => !item.delete);
  } else {
    return list;
  }
};
const middlewareMultiple = (word, options) => {
  if (stringLength(word) === 1 && options.multiple) {
    return getMultiplePinyin(word, options.surname);
  } else {
    return false;
  }
};
const middlewarePattern = (list, options) => {
  switch (options.pattern) {
    case "pinyin":
      break;
    case "num":
      list.forEach((item) => {
        item.result = item.isZh ? getNumOfTone(item.result) : "";
      });
      break;
    case "initial":
      list.forEach((item) => {
        item.result = item.isZh ? getInitialAndFinal(item.result, options.initialPattern).initial : "";
      });
      break;
    case "final":
      list.forEach((item) => {
        item.result = item.isZh ? getInitialAndFinal(item.result, options.initialPattern).final : "";
      });
      break;
    case "first":
      list.forEach((item) => {
        item.result = getFirstLetter(item.result, item.isZh);
      });
      break;
    case "finalHead":
      list.forEach((item) => {
        item.result = item.isZh ? getFinalParts(item.result).head : "";
      });
      break;
    case "finalBody":
      list.forEach((item) => {
        item.result = item.isZh ? getFinalParts(item.result).body : "";
      });
      break;
    case "finalTail":
      list.forEach((item) => {
        item.result = item.isZh ? getFinalParts(item.result).tail : "";
      });
      break;
  }
};
const middlewareToneType = (list, options) => {
  switch (options.toneType) {
    case "symbol":
      break;
    case "none":
      list.forEach((item) => {
        if (item.isZh) {
          item.result = getPinyinWithoutTone(item.result);
        }
      });
      break;
    case "num": {
      list.forEach((item) => {
        if (item.isZh) {
          item.result = getPinyinWithNum(item.result, item.originPinyin);
        }
      });
      break;
    }
  }
};
const middlewareV = (list, options) => {
  if (options.v) {
    list.forEach((item) => {
      if (item.isZh) {
        item.result = item.result.replace(/ü/g, typeof options.v === "string" ? options.v : "v");
      }
    });
  }
};
const middlewareType = (list, options, word) => {
  if (options.multiple && stringLength(word) === 1) {
    let last = "";
    list = list.filter((item) => {
      const res = item.result !== last;
      last = item.result;
      return res;
    });
  }
  if (options.type === "array") {
    return list.map((item) => item.result);
  }
  if (options.type === "all") {
    return list.map((item) => {
      const pinyin2 = item.isZh ? item.result : "";
      const { initial, final } = getInitialAndFinal(pinyin2, options.initialPattern);
      const { head, body, tail } = getFinalParts(pinyin2);
      let polyphonic = [];
      if (pinyin2 !== "") {
        polyphonic = [pinyin2].concat(getAllPinyin(item.origin, options.surname).filter((item2) => item2 !== pinyin2));
      }
      return {
        origin: item.origin,
        pinyin: pinyin2,
        initial,
        final,
        first: getFirstLetter(item.result, item.isZh),
        finalHead: head,
        finalBody: body,
        finalTail: tail,
        num: Number(getNumOfTone(item.originPinyin)),
        isZh: item.isZh,
        polyphonic,
        inZhRange: !!DICT1.get(item.origin),
        result: item.result
      };
    });
  }
  return list.map((item) => item.result).join(options.separator);
};
const middlewareToneSandhi = (list, toneSandhi) => {
  if (toneSandhi === false) {
    list.forEach((item) => {
      if (item.origin === "一") {
        item.result = item.originPinyin = "yī";
      } else if (item.origin === "不") {
        item.result = item.originPinyin = "bù";
      }
    });
  }
  return list;
};
const DEFAULT_OPTIONS$2 = {
  pattern: "pinyin",
  toneType: "symbol",
  type: "string",
  multiple: false,
  mode: "normal",
  removeNonZh: false,
  nonZh: "spaced",
  v: false,
  separator: " ",
  toneSandhi: true,
  segmentit: 2
};
function pinyin(word, options) {
  options = Object.assign(Object.assign({}, DEFAULT_OPTIONS$2), options || {});
  const legal = validateType(word);
  if (!legal) {
    return word;
  }
  if (word === "") {
    return options.type === "array" || options.type === "all" ? [] : "";
  }
  if (options.surname === void 0) {
    if (options.mode === "surname") {
      options.surname = "all";
    } else {
      options.surname = "off";
    }
  }
  if (options.type === "all") {
    options.pattern = "pinyin";
  }
  if (options.pattern === "num") {
    options.toneType = "none";
  }
  if (options.removeNonZh) {
    options.nonZh = "removed";
  }
  let _list = Array(stringLength(word));
  let { list } = getPinyin(word, _list, options.surname, options.segmentit);
  list = middlewareToneSandhi(list, options.toneSandhi);
  list = middleWareNonZh(list, options);
  if (middlewareMultiple(word, options)) {
    list = middlewareMultiple(word, options);
  }
  middlewarePattern(list, options);
  middlewareToneType(list, options);
  middlewareV(list, options);
  return middlewareType(list, options, word);
}
var OutputFormat;
(function(OutputFormat2) {
  OutputFormat2[OutputFormat2["AllSegment"] = 1] = "AllSegment";
  OutputFormat2[OutputFormat2["AllArray"] = 2] = "AllArray";
  OutputFormat2[OutputFormat2["AllString"] = 3] = "AllString";
  OutputFormat2[OutputFormat2["PinyinSegment"] = 4] = "PinyinSegment";
  OutputFormat2[OutputFormat2["PinyinArray"] = 5] = "PinyinArray";
  OutputFormat2[OutputFormat2["PinyinString"] = 6] = "PinyinString";
  OutputFormat2[OutputFormat2["ZhSegment"] = 7] = "ZhSegment";
  OutputFormat2[OutputFormat2["ZhArray"] = 8] = "ZhArray";
  OutputFormat2[OutputFormat2["ZhString"] = 9] = "ZhString";
})(OutputFormat || (OutputFormat = {}));
({
  toneType: "symbol",
  mode: "normal",
  nonZh: "spaced",
  v: false,
  separator: " ",
  toneSandhi: true,
  segmentit: 2,
  format: OutputFormat.AllSegment
});
exports._export_sfc = _export_sfc;
exports.createSSRApp = createSSRApp;
exports.createStore = createStore;
exports.e = e$1;
exports.f = f$1;
exports.index = index;
exports.mapMutations = mapMutations;
exports.n = n$1;
exports.o = o$1;
exports.p = p$1;
exports.pinyin = pinyin;
exports.r = r$1;
exports.resolveComponent = resolveComponent;
exports.s = s$1;
exports.sr = sr$1;
exports.t = t$1;
exports.wr = wr;
exports.wx$1 = wx$1;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/vendor.js.map
