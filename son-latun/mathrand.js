const FAST_ZERO = 0 | 0;
const FAST_ONE = 1 | 0;
function iadd(p, q) {
    if (q === FAST_ZERO) {
        return p;
    }
    const xorl = p ^ q;
    const carry = (p & q) << FAST_ONE;
    return iadd(xorl, carry);
}
export class SFC32 {
    a = FAST_ZERO;
    b = FAST_ZERO;
    c = FAST_ZERO;
    d = FAST_ZERO;
    constructor() { }
    seed(s) {
        let FAST_COUNTER1 = 1779033703 | 0;
        let FAST_COUNTER2 = 3144134277 | 0;
        let FAST_COUNTER3 = 1013904242 | 0;
        let FAST_COUNTER4 = 2773480762 | 0;
        let c;
        for (let i = 0; i < s.length; ++i) {
            c = s.charCodeAt(i);
            FAST_COUNTER1 = FAST_COUNTER2 ^ Math.imul(FAST_COUNTER1 ^ c, 597399067);
            FAST_COUNTER2 = FAST_COUNTER3 ^ Math.imul(FAST_COUNTER2 ^ c, 2869860233);
            FAST_COUNTER3 = FAST_COUNTER4 ^ Math.imul(FAST_COUNTER3 ^ c, 951274213);
            FAST_COUNTER4 = FAST_COUNTER1 ^ Math.imul(FAST_COUNTER4 ^ c, 2716044179);
        }
        FAST_COUNTER1 = Math.imul(FAST_COUNTER3 ^ (FAST_COUNTER1 >>> 18), 597399067);
        FAST_COUNTER2 = Math.imul(FAST_COUNTER4 ^ (FAST_COUNTER2 >>> 22), 2869860233);
        FAST_COUNTER3 = Math.imul(FAST_COUNTER1 ^ (FAST_COUNTER3 >>> 17), 951274213);
        FAST_COUNTER4 = Math.imul(FAST_COUNTER2 ^ (FAST_COUNTER4 >>> 19), 2716044179);
        FAST_COUNTER1 ^= (FAST_COUNTER2 ^ FAST_COUNTER3 ^ FAST_COUNTER4), FAST_COUNTER2 ^= FAST_COUNTER1, FAST_COUNTER3 ^= FAST_COUNTER1, FAST_COUNTER4 ^= FAST_COUNTER1;
        this.a = FAST_COUNTER1 | 0;
        this.b = FAST_COUNTER2 | 0;
        this.c = FAST_COUNTER3 | 0;
        this.d = FAST_COUNTER4 | 0;
    }
    rand() {
        let t = iadd(iadd(this.a, this.b), this.c);
        this.d = iadd(this.d, FAST_ONE);
        this.a = this.b ^ (this.b >>> 9);
        this.b = iadd(this.c, this.c << 3);
        this.c = (this.c << 21 | this.c >>> 11);
        this.c = iadd(this.c, t);
        return (t >>> 0) / 4294967296;
    }
    choice(seq) {
        return seq[Math.floor(this.rand() * seq.length)];
    }
}
