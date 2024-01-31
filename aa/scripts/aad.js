export class Game{
    constructor(){
        this.guess = {};
    }
    save(storage){
        storage.setItem("gtrans",this.ddump());
        console.log("Saved",this.trcount(),"translation(s)");
    }
    load(storage){
        let data = storage.getItem("gtrans");
        if(data === null){
            console.log("Nothing to load!");
            return false;
        }else{
            this.dload(data);
            console.log("Loaded",this.trcount(),"translation(s)");
            return true;
        }
    }
    ddump(){
        return JSON.stringify(this.guess);
    }
    dload(d){
        this.guess = JSON.parse(d);
    }
    trcount(){
        return Object.keys(this.guess).length;
    }
    getguess(w){
        return this.guess[w] ?? "";
    }
    setguess(w,g){
        if(g.length === 0){
            delete this.guess[w];
        }else{
            this.guess[w] = g;
        }
    }
    getguessrich(w){
        w = this.getguess(w);
        if(w.length === 0){
            return "<span style='color:gray'>...</span>";
        }
        return w;
    }
}
