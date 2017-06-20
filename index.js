'use strict'

module.exports = match

function isArguments (obj) {
  return Object.prototype.toString.call(obj) === '[object Arguments]'
}

function regexpSame (a, b) {
  return a.source === b.source &&
    a.global === b.global &&
    a.multiline === b.multiline &&
    a.lastIndex === b.lastIndex &&
    a.ignoreCase === b.ignoreCase
}

function arrayFrom (obj) {
  return Array.isArray(obj) ? obj
    : Array.from ? Array.from(obj)
    : Array.prototype.slice.call(obj)
}

function bufferSame (a, b) {
  var ret
  if (a.equals) {
    ret = a.equals(b)
  } else if (a.length !== b.length) {
    ret = false
  } else {
    ret = true
    for (var j = 0; j < a.length && ret; j++) {
      if (a[j] != b[j])
        ret = false
    }
  }
  return ret
}

function match (obj, pattern) {
  return match_(obj, pattern, [], [])
}

function match_ (obj, pattern, ca, cb) {
  return obj == pattern ? (
    obj === null || pattern === null ? true
    : typeof obj === 'object' && typeof pattern === 'object' ? true
    : typeof obj === 'object' && typeof pattern !== 'object' ? false
    : typeof obj !== 'object' && typeof pattern === 'object' ? false
    : true
  )
  : obj === null || pattern === null ? false
  : pattern instanceof RegExp ? (
    typeof obj === 'string' ? pattern.test(obj)
    : obj instanceof RegExp ? regexpSame(obj, pattern)
    : pattern.test('' + obj)
  )
  : typeof obj === 'string' && typeof pattern === 'string' && pattern ?
    obj.indexOf(pattern) !== -1
  : obj instanceof Date && pattern instanceof Date ?
    obj.getTime() === pattern.getTime()
  : obj instanceof Date && typeof pattern === 'string' ?
    obj.getTime() === new Date(pattern).getTime()
  : isArguments(obj) || isArguments(pattern) ?
    match_(arrayFrom(obj), arrayFrom(pattern), ca, cb)
  : pattern === Buffer ? Buffer.isBuffer(obj)
  : pattern === Function ? typeof obj === 'function'
  : pattern === Number ?
    typeof obj === 'number' && obj === obj && isFinite(obj)
  : pattern !== pattern ? obj !== obj
  : pattern === String ? typeof obj === 'string'
  : pattern === Boolean ? typeof obj === 'boolean'
  : pattern === Array ? Array.isArray(obj)
  : typeof pattern === 'function' && typeof obj === 'object' ?
    obj instanceof pattern
  : typeof obj !== 'object' || typeof pattern !== 'object' ? false
  : Buffer.isBuffer(obj) && Buffer.isBuffer(pattern) ?
    bufferSame(obj, pattern)
  : matchObj(obj, pattern, Object.keys(obj), Object.keys(pattern), ca, cb)
}

function matchObj (obj, pattern, kobj, kpat, ca, cb) {
  var ret = true

  // don't bother with stack acrobatics if there's nothing there
  if (kobj.length === 0 && kpat.length === 0)
    ret = true
  else {
    // if we've seen this exact pattern and object already, then
    // it means that pattern and obj have matching cyclicalness
    // however, non-cyclical patterns can match cyclical objects
    var cal = ca.length
    var go = true
    while (cal-- && go) {
      if (ca[cal] === obj && cb[cal] === pattern) {
        ret = true
        go = false
      }
    }

    if (go) {
      ca.push(obj)
      cb.push(pattern)

      var key
      for (var l = kpat.length - 1; l >= 0 && ret; l--) {
        key = kpat[l]
        if (!match_(obj[key], pattern[key], ca, cb))
          ret = false
      }

      if (ret) {
        ca.pop()
        cb.pop()
      }
    }
  }

  return ret
}
