function find(arr, item, equals = (a, b) => a == b) {
    let i = 0;
    for (let value of arr) {
        if (equals(value, item)) {
            return i;
        }
        ++i;
    }
    return -1;
}
function unordered_delete(arr, index) {
    if (index === arr.length - 1) {
        arr.pop();
    }
    else {
        arr[index] = arr.pop();
    }
}
class Vec2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    scale_ip(mul) {
        this.x *= mul;
        this.y *= mul;
        return this;
    }
    distance2(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return dx * dx + dy * dy;
    }
    copy() {
        return new Vec2(this.x, this.y);
    }
}
;
class LinkedChar {
    sources;
    constructor(sources) {
        this.sources = sources;
    }
    merge(other) {
        if (this.sources !== other.sources) {
            for (let src of other.sources) {
                if (find(this.sources, src, LetterRef.eqv) === -1) {
                    this.sources.push(src);
                }
            }
            other.sources = this.sources;
        }
        return this;
    }
    agreement() {
        let agreement = undefined;
        let char;
        for (let src of this.sources) {
            char = src.wd.guess[src.idx];
            if (char === undefined) {
                continue;
            }
            if (agreement === undefined) {
                agreement = char;
            }
            else if (agreement !== char) {
                agreement = null;
            }
        }
        return agreement;
    }
}
;
class Word {
    position;
    _word = "";
    guess = "";
    spaces = [0];
    links = [];
    suggest = [];
    prev;
    next = null;
    constructor(pos, wd, last) {
        this.position = pos;
        this.prev = last;
        for (let ch of wd) {
            this.push(ch);
        }
    }
    pop() {
        if (this._word[this._word.length - 1] !== " ") {
            this.links.pop();
            this.suggest.pop();
        }
        this._word = this._word.slice(0, -1);
        this.spaces.pop();
    }
    word() {
        return this._word;
    }
    push(letter) {
        if (letter.length === 1) {
            if (letter === " ") {
                this.spaces.push(this.spaces[this.spaces.length - 1] + 1);
            }
            else {
                this.links.push([]);
                this.suggest.push(new LinkedChar([new LetterRef(this, this.suggest.length)]));
                this.spaces.push(this.spaces[this.spaces.length - 1]);
            }
            this._word += letter;
        }
        else {
            alert(`The game has a bug! Please tell the dev "word.push argument is not of length 1: ${letter}"`);
        }
    }
    index_to_charnum(idx) {
        return idx - this.spaces[idx];
    }
    charnum_to_idx(cn) {
        let dt = 0;
        while (this.spaces[cn + dt + 1] > dt) {
            dt = this.spaces[cn + dt + 1];
        }
        return cn + dt;
    }
    xoffset(padding, radius, idx) {
        return (padding + radius * 2) * idx;
    }
    cx(padding, radius, idx) {
        return this.position.x + this.xoffset(padding, radius, idx) + radius;
    }
    chx(padding, radius, cn) {
        return this.cx(padding, radius, this.charnum_to_idx(cn));
    }
    width(padding, radius) {
        return ((padding + radius * 2) * Math.max(1, this._word.length)) - padding;
    }
}
;
class LetterRef {
    wd;
    idx;
    constructor(wd, idx) {
        this.wd = wd;
        this.idx = idx;
    }
    static eqv(lhs, rhs) {
        return lhs.wd === rhs.wd && lhs.idx === rhs.idx;
    }
    spaceless() {
        return new LetterRef(this.wd, this.wd.index_to_charnum(this.idx));
    }
    static _dfs(place, seen, link) {
        place.wd.suggest[place.idx] = link;
        link.sources.push(place);
        for (let neighbor of place.wd.links[place.idx]) {
            if (find(seen, neighbor, LetterRef.eqv) !== -1) {
                continue;
            }
            seen.push(neighbor);
            this._dfs(neighbor, seen, link);
            seen.pop();
        }
    }
    relink_char() {
        let link = this.wd.suggest[this.idx];
        LetterRef._dfs(this, [this], link);
    }
}
;
class WordIterator {
    curr;
    constructor(w) {
        this.curr = w;
    }
    next() {
        if (this.curr === null) {
            return { done: true, value: null };
        }
        else {
            let old = this.curr;
            this.curr = old.next;
            return { value: old };
        }
    }
    [Symbol.iterator]() {
        return this;
    }
}
;
class LinkedWordList {
    front = null;
    back = null;
    push(pos, wd = "") {
        let old_back = this.back;
        this.back = new Word(pos, wd, old_back);
        if (old_back !== null) {
            old_back.next = this.back;
        }
        if (this.front === null) {
            this.front = this.back;
        }
        return this.back;
    }
    erase(val) {
        if (val === this.front) {
            this.front = this.front.next;
        }
        if (val === this.back) {
            this.back = this.back.prev;
        }
        if (val.prev !== null) {
            val.prev.next = val.next;
        }
        if (val.next !== null) {
            val.next.prev = val.prev;
        }
    }
    [Symbol.iterator]() {
        return new WordIterator(this.front);
    }
}
;
function ep2cp(element, epx, epy) {
    let bbox = element.getBoundingClientRect();
    return new Vec2((epx - bbox.x) / bbox.width * element.width, (epy - bbox.y) / bbox.height * element.height);
}
addEventListener("load", () => {
    let radius = 30;
    let padding = 10;
    let drag_slack = 10;
    let scale = 1.0;
    let words = new LinkedWordList();
    let mpos = new Vec2();
    let hover = null;
    let drag = null;
    let drag_started = false;
    let select = null;
    let linebegin = null;
    let playmode = false;
    let cluepanel = document.getElementById("cluepanel");
    let sldiag = document.getElementById("sldiag");
    function dump_puzzle() {
        let data = [scale];
        let i = 0;
        let wordids = new Map();
        for (let word of words) {
            wordids.set(word, i);
            data.push(word.position.x);
            data.push(word.position.y);
            data.push(word.word());
            ++i;
        }
        data.push(null);
        i = 0;
        for (let word of words) {
            let lkv = [];
            for (let links of word.links) {
                let letterlkv = [];
                for (let link of links) {
                    letterlkv.push(wordids.get(link.wd));
                    letterlkv.push(link.idx);
                }
                lkv.push(letterlkv);
            }
            data.push(lkv);
            ++i;
        }
        for (let clue of clues) {
            data.push(clue);
        }
        return btoa(JSON.stringify(data));
    }
    function load_puzzle(code) {
        playmode = true;
        modetoggle.textContent = "Play mode";
        select = drag = hover = null;
        drag_started = false;
        words = new LinkedWordList();
        clues = [];
        try {
            let data = JSON.parse(atob(code));
            scale = data[0];
            let i = 1;
            let wd;
            let x;
            let y;
            let wstr;
            let wordlist = [];
            while (data[i] !== null) {
                x = data[i];
                y = data[i + 1];
                wstr = data[i + 2];
                wd = words.push(new Vec2(x, y), wstr);
                wordlist.push(wd);
                i += 3;
            }
            ++i;
            let wi = 0;
            let linked;
            let lletter;
            for (let j = 0; j < wordlist.length; ++j) {
                for (let letter = 0; letter < wordlist[wi].links.length; ++letter) {
                    let datapoint = data[i][letter];
                    let k = 0;
                    while (k < datapoint.length) {
                        linked = wordlist[datapoint[k]];
                        lletter = datapoint[k + 1];
                        wordlist[wi].links[letter].push(new LetterRef(linked, lletter));
                        wordlist[wi].suggest[letter].merge(linked.suggest[lletter]);
                        k += 2;
                    }
                }
                ++wi;
                ++i;
            }
            while (i < data.length) {
                clues.push(data[i]);
                ++i;
            }
        }
        catch (e) {
            alert("Loading error!");
            throw e;
        }
        update_clues();
    }
    document.getElementById("slmenu").addEventListener("click", () => {
        sldiag.showModal();
    });
    let slcode = document.getElementById("code");
    document.getElementById("save").addEventListener("click", () => {
        slcode.value = dump_puzzle();
    });
    document.getElementById("load").addEventListener("click", () => {
        load_puzzle(slcode.value);
        sldiag.close();
    });
    document.getElementById("close").addEventListener("click", () => {
        sldiag.close();
    });
    let clues = [];
    function update_clues() {
        cluepanel.replaceChildren();
        for (let i = 0; i < clues.length; ++i) {
            if (playmode) {
                let p = document.createElement("p");
                p.textContent = `${i + 1}. ${clues[i]}`;
                cluepanel.append(p);
            }
            else {
                let combo = document.createElement("div");
                let label = document.createElement("p");
                label.textContent = `${i + 1}.`;
                let input = document.createElement("input");
                input.type = "text";
                input.value = clues[i];
                input.addEventListener("input", () => {
                    clues[i] = input.value;
                });
                combo.append(label, input);
                cluepanel.append(combo);
            }
        }
    }
    let modetoggle = document.getElementById("modetoggle");
    modetoggle.addEventListener("click", () => {
        modetoggle.blur();
        if (playmode) {
            modetoggle.textContent = "Edit mode";
            playmode = false;
        }
        else {
            modetoggle.textContent = "Play mode";
            playmode = true;
        }
        update_clues();
    });
    let scalehint = document.getElementById("scalehint");
    scalehint.textContent = Math.round(scale * 100) + "%";
    const cvs = document.getElementById("canvas");
    const ctx = cvs.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    window.addEventListener("mousedown", () => {
        select = null;
    });
    cvs.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
            if (hover === null) {
                if (select === null) {
                    if (!playmode) {
                        select = words.push(ep2cp(cvs, e.x, e.y).scale_ip(1 / scale));
                        clues.push("");
                        update_clues();
                    }
                }
                else {
                    select = null;
                }
            }
            else {
                select = (drag = hover).wd;
            }
            drag_started = false;
        }
        else if (e.button === 1) {
            if (!playmode && hover !== null) {
                if (select === hover.wd) {
                    select = null;
                }
                let index = find(words, hover.wd);
                clues.splice(index, 1);
                words.erase(hover.wd);
                for (let word of words) {
                    for (let letterlinks of word.links) {
                        for (let i = 0; i < letterlinks.length; ++i) {
                            if (letterlinks[i].wd === hover.wd) {
                                unordered_delete(letterlinks, i);
                                --i;
                            }
                        }
                    }
                }
                update_clues();
                hover = null;
            }
        }
        else if (e.button === 2) {
            if (hover !== null && !playmode) {
                linebegin = hover.spaceless();
            }
        }
        e.stopPropagation();
    });
    cvs.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
    cvs.addEventListener("mousemove", (e) => {
        mpos = ep2cp(cvs, e.x, e.y).scale_ip(1 / scale);
        if (drag !== null) {
            if (!drag_started && drag.wd.position.distance2(mpos) > drag_slack) {
                drag_started = true;
            }
            drag.wd.position.x = mpos.x - drag.wd.xoffset(padding, radius, drag.idx) - radius;
            drag.wd.position.y = mpos.y - radius;
        }
    });
    document.body.addEventListener("keydown", (e) => {
        if (e.key === "F1") {
            scale -= 0.15;
            scalehint.textContent = Math.round(scale * 100) + "%";
        }
        else if (e.key === "F2") {
            scale += 0.15;
            scalehint.textContent = Math.round(scale * 100) + "%";
        }
        else {
            if (!select)
                return;
            if (e.key === "Backspace") {
                if (select.word().length > 0) {
                    if (playmode) {
                        select.guess = select.guess.slice(0, -1);
                    }
                    else {
                        select.pop();
                    }
                }
            }
            else if (e.key.length === 1) {
                let key = e.key.toUpperCase();
                if ((key === " " && !playmode) || (key >= "A" && key <= "Z")) {
                    if (playmode) {
                        if (select.guess.length < select.word().length) {
                            select.guess += key;
                        }
                    }
                    else {
                        select.push(key);
                    }
                }
            }
        }
    });
    cvs.addEventListener("mouseup", () => {
        if (drag !== null) {
            if (drag_started) {
                select = null;
            }
            drag = null;
        }
        if (linebegin !== null) {
            if (hover && hover.wd !== linebegin.wd) {
                let dest = hover.spaceless();
                if (linebegin.idx < linebegin.wd.links.length && dest.idx < dest.wd.links.length) {
                    let index = find(linebegin.wd.links[linebegin.idx], dest, LetterRef.eqv);
                    if (index !== -1) {
                        unordered_delete(linebegin.wd.links[linebegin.idx], index);
                        let reverse_index = find(dest.wd.links[dest.idx], linebegin, LetterRef.eqv);
                        if (reverse_index === -1) {
                            alert(`The game has a bug! Please tell the dev "reverse link not found when unlinking"`);
                        }
                        unordered_delete(dest.wd.links[dest.idx], reverse_index);
                        linebegin.wd.suggest[linebegin.idx] = new LinkedChar([]);
                        dest.wd.suggest[dest.idx] = new LinkedChar([]);
                        linebegin.relink_char();
                        dest.relink_char();
                    }
                    else {
                        linebegin.wd.links[linebegin.idx].push(dest);
                        dest.wd.links[dest.idx].push(linebegin);
                        linebegin.wd.suggest[linebegin.idx].merge(dest.wd.suggest[dest.idx]);
                    }
                }
            }
            linebegin = null;
        }
    });
    function redraw() {
        let half_block = radius + padding / 2;
        ctx.lineWidth = 4 * scale;
        ctx.font = `${radius * scale * 1.1}px "Ink Free" , sans-serif`;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        hover = null;
        let seen = new Set();
        for (let word of words) {
            for (let i = 0; i < word.links.length; ++i) {
                for (let link of word.links[i]) {
                    if (!seen.has(link.wd)) {
                        if (word.suggest[i].agreement() === null) {
                            ctx.strokeStyle = "red";
                        }
                        else {
                            ctx.strokeStyle = "black";
                        }
                        ctx.beginPath();
                        ctx.moveTo(word.chx(padding, radius, i) * scale, (word.position.y + radius) * scale);
                        ctx.lineTo(link.wd.chx(padding, radius, link.idx) * scale, (link.wd.position.y + radius) * scale);
                        ctx.stroke();
                    }
                }
            }
            seen.add(word);
        }
        let i = 0;
        let pos;
        for (let word of words) {
            ++i;
            pos = word.position.copy();
            let wwidth = word.width(padding, radius);
            ctx.fillStyle = "black";
            ctx.fillText(`${i}.`, (pos.x - radius * 0.9) * scale, (pos.y + radius * 0.5) * scale);
            if (word === select) {
                ctx.fillStyle = "#00000060";
                ctx.fillRect((pos.x - padding) * scale, (pos.y - padding) * scale, (wwidth + padding * 2) * scale, (radius + padding) * 2 * scale);
            }
            ctx.strokeStyle = "black";
            pos.x += radius;
            pos.y += radius;
            let wd = word.word();
            if (wd.length === 0) {
                wd = "\x00";
            }
            if (playmode) {
                let newwd = "";
                let j = 0;
                for (let char of wd) {
                    if (char == " ") {
                        newwd += " ";
                    }
                    else {
                        newwd += word.guess[j++] ?? "\x00";
                    }
                }
                wd = newwd;
            }
            let char;
            for (let j = 0; j < wd.length; ++j) {
                char = wd[j];
                if (char !== " ") {
                    ctx.beginPath();
                    ctx.fillStyle = "white";
                    ctx.arc(pos.x * scale, pos.y * scale, radius * scale, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    if (char === "\x00") {
                        let charnum = word.index_to_charnum(j);
                        if (charnum < word.suggest.length && word.suggest[charnum] !== null) {
                            let agreement = word.suggest[charnum].agreement();
                            if (agreement !== undefined && agreement !== null) {
                                ctx.fillStyle = "#707070";
                                ctx.fillText(agreement, pos.x * scale, pos.y * scale);
                            }
                        }
                    }
                    else {
                        ctx.fillStyle = "black";
                        ctx.fillText(char, pos.x * scale, pos.y * scale);
                    }
                }
                if (mpos.x >= pos.x - half_block && mpos.x <= pos.x + half_block && mpos.y >= pos.y - half_block && mpos.y <= pos.y + half_block) {
                    hover = new LetterRef(word, j);
                }
                if (hover !== null && word === hover.wd && j === hover.idx) {
                    ctx.fillStyle = "#00000030";
                    ctx.fillRect((pos.x - half_block) * scale, (pos.y - half_block) * scale, (radius * 2 + padding) * scale, (radius * 2 + padding) * scale);
                }
                pos.x += radius * 2 + padding;
            }
        }
        if (linebegin !== null) {
            ctx.strokeStyle = "black";
            ctx.beginPath();
            let srcx = linebegin.wd.chx(padding, radius, linebegin.idx) * scale;
            let srcy = (linebegin.wd.position.y + radius) * scale;
            ctx.moveTo(srcx, srcy);
            ctx.lineTo(mpos.x * scale, mpos.y * scale);
            ctx.stroke();
        }
        window.requestAnimationFrame(redraw);
    }
    redraw();
});
