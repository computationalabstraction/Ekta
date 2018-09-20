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
    if(clone)
    {
        for(let parent of parents)
        {
            if(parent instanceof Function || parent instanceof Array && parent[0] instanceof Function)
            {
                const temp = new parent();
                for(let prop in temp)
                {
                    obj[prop] = temp[prop];
                }
            }
        }
    }
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
    metadata.target = this;
    metadata.__parents__ = parents;
    obj.__proto__ = new Proxy(metadata,handler);
    return this; 
}

Object.prototype.extends = function(...p) { inherit(this,true,...p); };
Object.prototype.inherit = function(...p) { inherit(this,false,...p); };
Object.prototype.instanceof = function(...p){  };

function m(...c)
{
    return function()
    {
        this.extends(...c);
    }
}

// const obj1 = {
//     x:10,
//     y:20
// }

// const obj2 = {
//     y:30
// }

// const obj3 = {
//     z:40,
//     k:100,
//     v:200
// }

class C1
{
    constructor()
    {
        this.a = 100;
        this.b = 200;
    }
}


class M1
{
    constructor()
    {
        this.x = 1000;
        this.y = 2000;
    }
}

class C2 extends m(C1,M1)
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
console.log(obj1.__parents__);

// obj3.parents(obj1,[obj2,2]);
// obj3.inherit(obj1,[obj2,2]);

// console.log(obj3.x);
// console.log(obj3.y);
// console.log(obj3.z);
// console.log(obj3.a);
// console.log(obj3.b);
// console.log(obj3.__parents__);