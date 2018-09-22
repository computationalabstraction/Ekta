class M1 extends Function
{
    constructor()
    {
        super("...args","return this.__call__(...args);");
        return this.bind(this);
    }

    __call__(...args)
    {
        console.log(args);
    }
}

let v = new M1();
v("Hello World!");
v.__call__("Hello Goodbye!");