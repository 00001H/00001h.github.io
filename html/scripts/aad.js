let guess = {};
export function savegdata(){
    return JSON.stringify(guess);
}
export function trcount(){
    return Object.keys(guess).length;
}
export function loadgdata(d){
    guess = JSON.parse(d);
}
export function getguess(w){
    return guess[w] ?? "";
}
export function setguess(w,g){
    if(g.length === 0){
        delete guess[w];
    }else{
        guess[w] = g;
    }
}
function __lookupword(w){
    if(w in guess){
        return guess[w];
    }
    return "";
}
export function aadlookup(w){
    w = __lookupword(w);
    if(w.length === 0){
        return "<span style='color:gray'>...</span>";
    }
    return w;
}
