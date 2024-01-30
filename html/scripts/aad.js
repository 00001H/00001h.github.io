let guess = {};
function orelse(v,a){
    if(v === undefined || v === null){
        return a;
    }
    return v;
}
export function getguess(w){
    return orelse(guess[w],"");
}
export function setguess(w,g){
    guess[w] = g;
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
