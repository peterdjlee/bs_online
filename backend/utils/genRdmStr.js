class StrGen{
    constructor() {
        this.char_set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        this.char_set_len = this.char_set.length;
    }

    genCode(length = 4) {
        let code = '';
        for (let i = 0; i < length; i+=1) {
            code += this.char_set.charAt(Math.floor(Math.random() * this.char_set_len));
        }
        return `${code}`;
    }
}

const str_generator = new StrGen()
module.exports = str_generator;