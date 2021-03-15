const str_generator = require('../utils/genRdmStr')

test("Generate strings of length n < 15", () => {
    for (let i = 0; i < 15; i += 1) {
        const rand_string = str_generator.genCode(i);
        expect(rand_string).toHaveLength(i);
    }
});