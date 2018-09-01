var tap = require('tap')
var test = tap.test
var match = require('../..').strict

test('strict edge cases', function (t) {
  t.ok(match(null, null))
  t.ok(match(undefined, undefined))
  t.notOk(match(null, undefined))
  t.notOk(match(undefined, null))
  t.notOk(match(1, '1'))
  t.notOk(match('1', 1))
  t.notOk(match([1], 1))
  t.notOk(match(1, [1]))
  t.notOk(match({a: 1}, {a: '1'}))
  t.notOk(match({a: '1'}, {a: 1}))
  t.notOk(match(0, false))
  t.notOk(match('', false))
  t.notOk(match('', 0))
  t.notOk(match([1, 2], '1,2'))

  t.end()
})
