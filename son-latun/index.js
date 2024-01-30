import { SFC32 } from "./mathrand.js";
const prng = new SFC32();
const WORDS = ["a", "akesi", "ala", "alasa", "ale", "anpa", "ante", "anu", "apeja", "awen", "e", "en", "epiku", "esun", "ijo", "ike", "ilo", "insa", "jaki", "jan", "jasima", "jelo", "jo", "kala", "kalama", "kama", "kasi", "ken", "kepeken", "kijetesantakalu", "kili", "kin", "kipisi", "kiwen", "ko", "kokosila", "kon", "ku", "kule", "kulupu", "kute", "la", "lanpan", "lape", "laso", "lawa", "leko", "len", "lete", "li", "lili", "linja", "lipu", "loje", "lon", "luka", "lukin", "lupa", "ma", "majuna", "mama", "mani", "meli", "meso", "mi", "mije", "misikeke", "moku", "moli", "monsi", "monsuta", "mu", "mun", "musi", "mute", "n", "namako", "nanpa", "nasa", "nasin", "nena", "ni", "nimi", "noka", "o", "oko", "olin", "ona", "open", "pakala", "pake", "pali", "palisa", "pan", "pana", "pi", "pilin", "pimeja", "pini", "pipi", "poka", "poki", "pona", "powe", "pu", "sama", "seli", "selo", "seme", "sewi", "sijelo", "sike", "sin", "sina", "sinpin", "sitelen", "soko", "sona", "soweli", "suli", "suno", "supa", "suwi", "tan", "taso", "tawa", "telo", "tenpo", "toki", "tomo", "tonsi", "tu", "unpa", "uta", "utala", "walo", "wan", "waso", "wawa", "weka", "wile"];
const WVOW = ["a", "e", "i"];
const IVOW = ["a", "e", "o", "u"];
const SAFEVOW = ["a", "e", "i", "o", "u"];
const SAFECONS = ["j", "k", "l", "p", "s", "t", "w"];
const CONS = ["j", "k", "l", "m", "n", "p", "s", "t", "w"];
const NASAL = ["m", "n"];
function generate_kalama(prng, cc) {
    let s = "";
    let c;
    let nasal = false;
    let VOWSET;
    do {
        if (s.length > 0 || prng.rand() < 0.5) {
            c = prng.choice(nasal ? SAFECONS : CONS);
            s += c;
            if (c === "w") {
                VOWSET = WVOW;
            }
            else if (c === "j" || c === "t") {
                VOWSET = IVOW;
            }
            else {
                VOWSET = SAFEVOW;
            }
        }
        else {
            VOWSET = SAFEVOW;
        }
        s += prng.choice(VOWSET);
        if (nasal = prng.rand() < 0.5) {
            s += "n";
        }
    } while (prng.rand() < cc);
    return s;
}
addEventListener("load", () => {
    const mappings = document.getElementById("mappings");
    const seedbox = document.getElementById("seedbox");
    const wcontp = document.getElementById("wcontp");
    const wcontpd = document.getElementById("wcontpd");
    const wexpl = document.getElementById("wexpl");
    const relexin = document.getElementById("relex-input");
    const relexout = document.getElementById("relex-output");
    let mapping = new Map();
    const reverse = new URLSearchParams(location.search).has("unoreversecard");
    function regenerate() {
        prng.seed(seedbox.value);
        const used = new Set();
        let kalama;
        let mpi;
        let children = [];
        mapping.clear();
        for (const word of WORDS) {
            do {
                kalama = generate_kalama(prng, wcontp.valueAsNumber / 100);
            } while (used.has(kalama));
            if (reverse) {
                mapping.set(kalama, word);
            }
            else {
                mapping.set(word, kalama);
            }
            used.add(kalama);
            mpi = document.createElement("p");
            mpi.textContent = `${word} -> ${kalama}`;
            children.push(mpi);
        }
        mappings.replaceChildren(...children);
    }
    function relex() {
        relexout.textContent = relexin.value.replaceAll(/\b[a-z]+\b/g, (match) => {
            console.log(match);
            return mapping.get(match) ?? match;
        });
    }
    function update() {
        regenerate();
        relex();
    }
    seedbox.addEventListener("input", update);
    relexin.addEventListener("input", update);
    wcontp.addEventListener("input", update);
    wcontp.addEventListener("input", () => {
        wcontpd.textContent = wcontp.value;
        const x = wcontp.valueAsNumber / 100;
        wexpl.textContent = (1 / (1 - x)).toFixed(2);
    });
    wcontpd.textContent = wcontp.value;
    {
        const x = wcontp.valueAsNumber / 100;
        wexpl.textContent = (1 / (1 - x)).toFixed(2);
    }
    update();
});
