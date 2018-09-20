const util = require("util");

const handler = {
    get:(target,key,receiver) => {
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
}

function inherit(obj,clone = false,...parents)
{
    const metadata = {};
    for(let i in parents)
    {
        parent = parents[i];
        if(parent instanceof Array) 
        {
            if(parent[0] instanceof Function) parents[i] = [parent.prototype,parent[1]];
            else continue;
        }
        else if(parent instanceof Function) parents[i] = [parent.prototype,1];
        else parents[i] = [parent,1];
    }
    if(clone)
    {
        for(let parent of parents)
        {
            if(Reflect.has(parent[0],"constructor"))
            {
                const temp = new parent[0].constructor();
                for(let prop in temp)
                {
                    obj[prop] = temp[prop];
                }
            }
        }
    }
    metadata.target = this;
    metadata.__parents__ = parents;
    obj.__parents__ = parents;
    obj.__proto__ = new Proxy(metadata,handler);
    return this; 
}

Object.prototype.extends = function(...p) { inherit(this,true,...p); };
Object.prototype.bases = function(...p) { inherit(this,false,...p); };

const obj1 = {
    x:10,
    y:20
}

const obj2 = {
    y:30
}

const obj3 = {
    z:40,
    k:100,
    v:200
}

class C1
{
    constructor()
    {
        this.a = 1000;
        this.b = 2000;
    }
}

// obj3.parents(obj1,[obj2,2]);
obj3.extends(obj1,[obj2,2],C1);

console.log(obj3.x);
console.log(obj3.y);
console.log(obj3.z);
console.log(obj3.a);
console.log(obj3.b);
console.log(typeof obj3);
console.log(obj3 instanceof C1);
console.log(obj3.__parents__);
