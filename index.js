const util = require("util");

const handler = {
    get:(target,key,receiver) => {
        if(key != util.inspect.custom && key != 'inspect' && key != Symbol.toStringTag)
        {
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
}

function inherit(...parents)
{
    const metadata = {};
    for(let i in parents)
    {
        parent = parents[i];
        if(parent instanceof Array) continue;
        else if(parent instanceof Function) parent[i] = [parent.prototype,1];
        else parents[i] = [parent,1];
    }
    metadata.target = this;
    metadata.__parents__ = parents;
    this.__parents__ = parents;
    this.__proto__ = new Proxy(metadata,handler);
    return this;
}

Object.prototype.extends = inherit;

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

obj3.extends(obj1,[obj2,2]);

console.log(obj3.x);
console.log(obj3.y);
console.log(obj3.z);
console.log(obj3.__parents__);