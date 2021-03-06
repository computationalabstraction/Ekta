// make this more efficient!
const handler = {
  get: (target, key) => {
    if (key in target) return target[key]
    else {
      let highest = [null, 0]
      const parents = target.__parents__.filter(link => key in link[0])
      for (const parent of parents) {
        if (parent[1] > highest[1]) {
          highest = parent
        } else if (parent[1] == highest[1]) throw new Error('Ambiguous: Two Parents with same Slot and same Priority')
      }
      if (highest[0] != null) return highest[0][key]
      else throw new Error('Missing: No Such Slot')
    }
  },

  has: (target, key) => {
    if (key in target) return true
    else {
      const parents = target.__parents__.filter(link => key in link[0])
      if (parents.length > 0) return true
      else return false
    }
    return false
  }
}

function Reuse (obj, clone = false, ...parents) {
  const metadata = {}
  if (clone) {
    for (let parent of parents) {
      if (parent instanceof Array) parent = parent[0]
      if (parent instanceof Function) {
        const temp = new parent()
        for (const prop of Object.keys(temp)) {
          obj[prop] = temp[prop]
        }
      }
    }
  }
  for (const i in parents) {
    const parent = parents[i]
    if (parent instanceof Array) {
      if (parent[0] instanceof Function) parents[i] = [parent[0].prototype, parent[1]]
      else continue
    } else if (parent instanceof Function) parents[i] = [parent.prototype, 1]
    else parents[i] = [parent, 1]
  }
  metadata.target = obj
  metadata.__parents__ = parents
  obj.__proto__ = new Proxy(metadata, handler)
  return this
}

function lookup (obj, p) {
  if (obj.prototype == p) return true
  if (obj.prototype != undefined) return lookup(obj.prototype, p)
  else return false
}

function iof (obj, p) {
  console.log('Called')
  if (p instanceof Function) p = p.prototype
  if (Reflect.has(obj, '__parents__')) {
    console.log(obj)
    for (const i of obj.__parents__) {
      console.log(i)
      return iof(i[0], p)
    }
  } else return lookup(obj, p)
  return false
}

Object.prototype.extends = function (...p) { Reuse(this, true, ...p) }
Object.prototype.inherit = function (...p) { Reuse(this, false, ...p) }
Object.prototype.instanceof = function (p) { iof(this, p) }

function m (...c) {
  return function () {
    this.extends(...c)
  }
}

const obj = {
  x: 10,
  y: 20,
  l: 80
}

const obj2 = {
  y: 30
}

const obj3 = {
  z: 40,
  k: 50,
  v: 60
}

obj3.inherit(obj, [obj2, 2])

class C1 {
  constructor () {
    this.a = 100
    this.b = 200
  }

  sing () {
    console.log('Stuck in the middle with you!')
  }
}

class M1 {
  constructor () {
    this.x = 1000
    this.y = 2000
  }

  sing () {
    console.log('Sundown you better be safe......')
  }

  dance () {
    console.log("I'm Bad I'm Bad!")
  }
}

M1.prototype.l = 90

class C2 extends m([C1, 3], [M1, 2], [obj3, 4]) {
  constructor () {
    super()
    this.i = 10
    this.j = 20
  }
}

const obj1 = new C2()

console.log(obj1.i)
console.log(obj1.j)
console.log(obj1.a)
console.log(obj1.b)
console.log(obj1.x)
console.log(obj1.y)
console.log(obj1.z)
console.log(obj1.k)
console.log(obj1.v)
console.log(obj1.l)
obj1.sing()
obj1.dance()

console.log(obj1.instanceof(C1))
console.log(obj1.instanceof(M1))
console.log(obj1.instanceof(obj3))
console.log(obj1.instanceof(obj2))
