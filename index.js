const util = require("util");
const handler = {
    get:(target,key) => {
        if (key != util.inspect.custom && 
            key != 'inspect' && 
            key != Symbol.toStringTag) {
            if(key in target) return target[key];
            else
            {
                let highest = [null,0];
                let parents = target.__parents__.filter(link => key in link[0]);
                for(let parent of parents)
                {
                    if(parent[1] > highest[1])
                    {
                        highest = parent;    
                    }
                    else if(parent[1] == highest[1]) throw new Error("Ambiguous: Two Parents with same Slot and same Priority");
                }
                if(highest[0] != null) return highest[0][key];
                else throw new Error("Missing: No Such Slot");
            }
        }
    },

    has:(target,key) => {
        if(key in target) return true;
        else
        {
            let parents = target.__parents__.filter(link => key in link[0]);
            if(parents.length > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        return false;
    }
}

function Reuse(obj,clone = false,...parents)
{
    const metadata = {};
    if(clone)
    {
        for(let parent of parents)
        {
            if(parent instanceof Array) parent = parent[0];
            if(parent instanceof Function)
            {
                const temp = new parent();
                for(let prop of Object.keys(temp))
                {
                    obj[prop] = temp[prop];
                }
            }
        }
    }
    for(let i in parents)
    {
        let parent = parents[i];
        if(parent instanceof Array) 
        {
            if(parent[0] instanceof Function) parents[i] = [parent[0].prototype,parent[1]];
            else continue;
        }
        else if(parent instanceof Function) parents[i] = [parent.prototype,1];
        else parents[i] = [parent,1];
    }
    metadata.target = this;
    metadata.__parents__ = parents;
    obj.__proto__ = new Proxy(metadata,handler);
    return this; 
}

Object.prototype.extends = function(...p) { Reuse(this,true,...p); };
Object.prototype.inherit = function(...p) { Reuse(this,false,...p); };
Object.prototype.instanceof = function(...p){  };

function m(...c)
{
    return function()
    {
        this.extends(...c);
    }
}


const obj = {
    x:10,
    y:20,
    l:80
}

const obj2 = {
    y:30
}

const obj3 = {
    z:40,
    k:50,
    v:60
}

obj3.inherit(obj,[obj2,2]);

class C1
{
    constructor()
    {
        this.a = 100;
        this.b = 200;
    }

    sing()
    {
        console.log("Stuck in the middle with you!");
    }
}

class M1
{
    constructor()
    {
        this.x = 1000;
        this.y = 2000;
    }

    sing()
    {
        console.log("Sundown you better be safe......");
    }

    dance()
    {
        console.log("I'm Bad I'm Bad!");
    }
}

M1.prototype.l = 90;

class C2 extends m([C1,3],[M1,2],[obj3,4])
{
    constructor()
    {
        super();
        this.i = 10;
        this.j = 20;
    }
}

let obj1 = new C2();

console.log(obj1.i);
console.log(obj1.j);
console.log(obj1.a);
console.log(obj1.b);
console.log(obj1.x);
console.log(obj1.y);
console.log(obj1.z);
console.log(obj1.k);
console.log(obj1.v);
console.log(obj1.l);
obj1.sing();
obj1.dance();
// console.log(obj1);
// console.log(obj1.__parents__);

// obj3.parents(obj1,[obj2,2]);
// obj3.inherit(obj1,[obj2,2]);

// console.log(obj3.x);
// console.log(obj3.y);
// console.log(obj3.z);
// console.log(obj3.a);
// console.log(obj3.b);
// console.log(obj3.__parents__);