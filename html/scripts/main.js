import {Game} from "./aad.js";
let game = new Game();
let WORDSIZE = 70;
let PERSISTENT_SAVE = true;
let page = null;
let popup = {};
let drawer = {};
let WORDPAD = 0.1;
let interactive = false;
function defaultunit(x,un){
    if(typeof(x) === "number"){
        return x+un;
    }
    return x;
}
function emove(elem,x,y){
    elem.style.setProperty("left",defaultunit(x,"px"));
    elem.style.setProperty("top",defaultunit(y,"px"));
}
function eresize(elem,w,h){
    elem.style.setProperty("width",defaultunit(w,"px"));
    elem.style.setProperty("height",defaultunit(h,"px"));
}
function ehide(elem){
    elem.style.setProperty("display","none");
}
function eunhide(elem,d="block"){
    elem.style.setProperty("display",d);
}
class Placeable{
    place(par,x,y,size){
        let elem = this.make(size);
        emove(elem,x,y);
        par.appendChild(elem);
    }
}
class Glyph extends Placeable{
    constructor(g){
        super();
        this.g = g;
    }
    make(size){
        let img = document.createElement("img");
        img.classList.add("glyph");
        eresize(img,size,size);
        img.draggable = false;
        img.src = `/html/glyphs/${this.glyph('spc')}.svg`;
        return img;
    }
    glyph(orelse=""){
        return (this.g==='.'?orelse:this.g);
    }
}
class TextUnit extends Placeable{
    constructor(g){
        super();
        if(g instanceof Array){
            this.g = g;
        }else if(typeof(g)==="string"||g instanceof String){
            this.g = [];
            for(let i=0;i<g.length;++i){
                this.g.push(new Glyph(g[i]));
            }
        }else{
            this.g = null;
        }
        while(this.g.length<4){
            this.g.push(new Glyph('.'));
        }
    }
    word(){
        let s = "";
        for(let i=0;i<this.g.length;++i){
            s += this.g[i].glyph();
        }
        return s;
    }
    make(size){
        let div = document.createElement("div");
        div.classList.add("textunit");
        eresize(div,size,size);
        this.g[0].place(div,0,0,size/2);
        this.g[1].place(div,size/2,0,size/2);
        this.g[2].place(div,0,size/2,size/2);
        this.g[3].place(div,size/2,size/2,size/2);
        return div;
    }
}
class Word extends Placeable{
    constructor(g){
        super();
        this.parent = null;
        if(g instanceof TextUnit){
            this.g = [g];
        }else{
            this.g = g;
        }
    }
    addu(tu){
        this.g.push(tu);
    }
    word(){
        let s = "";
        for(let i=0;i<this.g.length;++i){
            s += this.g[i].word();
            if(i+1<this.g.length){
                s += '-';
            }
        }
        return s;
    }
    width(size){
        return size*(this.g.length*(1+WORDPAD)-WORDPAD);
    }
    trans(){
        return game.getguessrich(this.word());
    }
    make(size){
        let div = document.createElement("div");
        div.classList.add("word");
        eresize(div,this.width(size),size);
        let x = 0;
        for(let i=0;i<this.g.length;++i){
            this.g[i].place(div,x,0,size);
            x += size*(1+WORDPAD);
        }
        let __capthis = this;
        if(interactive){
            div.onmouseenter = function(){
                popup.box.style.setProperty("opacity",1);
                popup.resettrans();
                popup.stranssrc = __capthis.parent;
                popup.wtranssrc = __capthis;
                popup.trans();
            };
            div.onclick = function(){
                drawer.loadword(__capthis.word());
                drawer.show();
                drawer.guessbox.focus();
            }
            div.onmouseleave = function(){
                popup.hide();
            };
        }
        for(let i=1;i<this.g.length;++i){
            let img = document.createElement("img");
            img.classList.add("line");
            emove(img,size*(i*(1+WORDPAD)-WORDPAD),0);
            eresize(img,size*WORDPAD,size);
            img.src = `/html/glyphs/line.svg`;
            div.appendChild(img);
        }
        return div;
    }
}
class Sentence extends Placeable{
    constructor(g){
        super();
        if(g instanceof Array){
            g.forEach(this.pushg);
        }else if(typeof(g)==="string"||g instanceof String){
            this.g = [];
            let tkn = "";
            let p = 0;
            let wdg = null;
            for(let i=0;i<g.length;++i){
                if(g[i]==='\n'){
                    this.pushg(null);
                    continue;
                }
                if(g[i]==='-'){
                    if(tkn.length > 0){
                        while(tkn.length<4){
                            tkn += '.';
                        }
                        let tu = new TextUnit(tkn);
                        if(wdg === null){
                            wdg = new Word(tu);
                        }else{
                            wdg.addu(tu);
                        }
                        tkn = "";
                        p = 0;
                    }else{
                        wdg = this.popg();
                    }
                }else{
                    tkn += g[i];
                    ++p;
                    if(p>=4){
                        let tu = new TextUnit(tkn);
                        if(wdg === null){
                            this.pushg(new Word(tu));
                        }else{
                            wdg.addu(tu);
                            this.pushg(wdg);
                        }
                        tkn = "";
                        p = 0;
                    }
                }
            }
        }else{
            this.g = null;
        }
    }
    popg(){
        let g = this.g.pop();
        g.parent = null;
        return g;
    }
    pushg(g){
        if(g !== null)g.parent = this;
        this.g.push(g);
    }
    trans(){
        let s = "";
        for(let i=0;i<this.g.length;++i){
            if(this.g[i] === null){
                s += '\n';
            }else{
                s += this.g[i].trans();
            }
            if(i+1<this.g.length){
                s += ' ';
            }
        }
        return s;
    }
    dims(wsize){
        let padsize = WORDPAD*wsize;
        let x = -padsize;
        let y = wsize;
        let mx = 0;
        for(let i=0;i<this.g.length;++i){
            if(this.g[i] === null){
                x = 0;
                y += padsize+wsize;
            }else{
                x += this.g[i].width(wsize)+padsize;
                mx = Math.max(x-padsize,mx);
            }
        }
        return [x,y];
    }
    make(wsize){
        let div = document.createElement("div");
        div.classList.add("sentence");
        let x = 0;
        let y = 0;
        let mx = 0;
        let padsize = WORDPAD*wsize;
        for(let i=0;i<this.g.length;++i){
            if(this.g[i] === null){
                x = 0;
                y += padsize+wsize;
            }else{
                this.g[i].place(div,x,y,wsize);
                x += this.g[i].width(wsize)+padsize;
                mx = Math.max(x-padsize,mx);
            }
        }
        eresize(div,mx,y+wsize);
        return div;
    }
};
popup.hide = function(){
    this.box.style.setProperty("opacity",0);
}
popup.show = function(){
    this.box.style.setProperty("opacity",1);
}
popup.resettrans = function(){
    this.stranssrc = null;
    this.wtranssrc = null;
}
popup.trans = function(){
    if(this.stranssrc === null || this.stranssrc.g.length <= 1){
        ehide(this.strans);
    }else{
        eunhide(this.strans);
        this.strans.innerHTML = this.stranssrc.trans();
    }
    if(this.wtranssrc === null){
        ehide(this.wtrans);
    }else{
        eunhide(this.wtrans);
        this.wtrans.innerHTML = this.wtranssrc.trans();
    }
}
drawer.setword = function(word){
    this.word = word;
    if(this.wordelement instanceof Element){
        this.wordelement.remove();
    }
    this.wordelement = new Sentence(word).make(WORDSIZE);
    this.wordbox_inner.appendChild(this.wordelement);
}
drawer.loadword = function(word){
    this.setword(word);
    this.guessbox.value = game.getguess(word);
}
drawer.show = function(){
    this.box.style.setProperty("visibility","visible");
}
drawer.hide = function(){
    this.box.style.setProperty("visibility","hidden");
}
class SentenceElement extends HTMLElement{
    constructor(){
        super();
    }
    connectedCallback(){
        let div = document.createElement("div");
        if(this.hasAttribute("style")){
            div.setAttribute("style",this.getAttribute("style"));
        }
        let stc = new Sentence(this.getAttribute("s"));
        let dz = stc.dims(WORDSIZE);
        eresize(div,dz[0],dz[1]);
        stc.place(div,this.pageX,this.pageY,WORDSIZE);
        this.replaceWith(div);
    }
}
onload = function(){
    let _storeto = (PERSISTENT_SAVE?localStorage:sessionStorage);
    page = document.getElementById("page");
    interactive = !page.hasAttribute("noninteractive");
    console.log("Interactive: ",interactive);
    //Do not define earlier, otherwise we initialize before `interactive` is set
    customElements.define("w-sentence",SentenceElement);
    if(page.hasAttribute("size")){
        let size = Number(page.getAttribute("size"));
        if(!Number.isNaN(size)){
            WORDSIZE = size;
        }
        page.removeAttribute("size");
    }
    if(interactive){
        popup.box = document.createElement("div");
        popup.box.classList.add("popup-box");
        popup.box.style.setProperty("opacity",0);

        popup.strans = document.createElement("p");
        popup.strans.classList.add("popup-str");
        popup.box.appendChild(popup.strans);

        popup.wtrans = document.createElement("p");
        popup.wtrans.classList.add("popup-wtr");
        popup.box.appendChild(popup.wtrans);

        onmousemove = function(e){
            popup.box.style.setProperty("left",e.pageX+"px");
            popup.box.style.setProperty("top",e.pageY+"px");
        }
        document.body.appendChild(popup.box);


        drawer.boxbg = document.createElement("div");
        drawer.boxbg.classList.add("drawer");
        document.body.appendChild(drawer.boxbg);
    
        drawer.box = document.createElement("div");
        drawer.boxbg.appendChild(drawer.box);

        drawer.wordbox = document.createElement("div");
        drawer.wordbox.classList.add("word-bg-box");
        drawer.box.appendChild(drawer.wordbox);

        drawer.wordbox_inner = document.createElement("div");
        drawer.wordbox_inner.classList.add("word-bb-inner-container");
        drawer.wordbox_inner.classList.add("box");
        drawer.wordbox.appendChild(drawer.wordbox_inner);
        drawer.setword("....");
        drawer.guessbox = document.createElement("input");
        drawer.guessbox.type = "text";
        drawer.guessbox.size = 25;
        drawer.guessbox.name = "guessbox";
        drawer.guessbox.classList.add("guessbox");
        drawer.guessbox.placeholder = "...";
        drawer.guessbox.oninput = function(e){
            if(!e.altKey){
                game.setguess(drawer.word,drawer.guessbox.value);
                popup.trans();
            }
        }
        drawer.box.appendChild(drawer.guessbox);

        onkeyup = function(e){
            if(!e.altKey)return;
            let k = e.key.toLowerCase();
            if(k=='s'){
                game.save(_storeto);
            }else if(k=='l'){
                game.load(_storeto);
                popup.trans();
            }
        }
        onclick = function(e){
            if(e.target === page){
                drawer.hide();
            }
        }
    }else{
        page.removeAttribute("noninteractive");
    }
    
    var elements = document.getElementsByTagName("*");
    let e;
    let i = 0;
    while((e=elements[i++])!==undefined){
        let p = e.getAttribute("p");
        if(p !== null){
            let [x,y] = p.split(' ');
            e.style.setProperty("position","absolute");
            emove(e,x,y);
            e.removeAttribute("p");
        }
    }
    game.load(_storeto);
}
