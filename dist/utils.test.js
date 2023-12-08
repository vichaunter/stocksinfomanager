"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const utils_1 = require("./utils");
describe("findMode Function", () => {
    it("findMode finds properly the most frequent in array", async () => {
        const mode = (0, utils_1.findMode)([
            1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 9, 9, 4, 5, 4, 3, 4, 6, 4, 7, 4,
        ]);
        const modeb = (0, utils_1.findMode)([1, 2, 1, 2, 1, 2, 1]);
        expect(mode).toEqual(4);
        expect(modeb).toEqual(1);
    });
    // Test case: Valid array with a single mode
    it("should return the correct mode for an array with a single mode", () => {
        const testArray1 = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
        expect((0, utils_1.findMode)(testArray1)).toBe(4);
    });
    // Test case: Valid array with multiple modes
    it("should return the correct mode for an array with multiple modes", () => {
        const testArray2 = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5];
        expect((0, utils_1.findMode)(testArray2)).toBe(4);
    });
    // Test case: Valid array with no mode (all elements occur once)
    it("should return 0 for an array with no mode", () => {
        const testArray3 = [1, 2, 3, 4, 5];
        expect((0, utils_1.findMode)(testArray3)).toBe(0);
    });
    // Test case: Empty array
    it("should return 0 for an empty array", () => {
        const testArray4 = [];
        expect((0, utils_1.findMode)(testArray4)).toBe(0);
        // Alternatively, you can expect(findMode(testArray4)).toBe(0);
    });
    // Test case: Array with negative numbers
    it("should return the correct mode for an array with negative numbers", () => {
        const testArray5 = [-2, -1, -1, 0, 1, 1, 1, 2, 2];
        expect((0, utils_1.findMode)(testArray5)).toBe(1);
    });
    // Test case: Array with decimal numbers
    it("should return the correct mode for an array with decimal numbers", () => {
        const testArray6 = [1.5, 2.5, 2.5, 3.5, 3.5, 3.5, 4.5, 4.5, 4.5, 4.5];
        expect((0, utils_1.findMode)(testArray6)).toBe(4.5);
    });
});
describe("getDividendFrequency", () => {
    it("counts the frequency with correct data", () => {
        const dates = [
            "10/19/2023",
            "07/20/2023",
            "04/20/2023",
            "01/19/2023",
            "10/20/2022",
            "07/21/2022",
            "04/21/2022",
            "01/20/2022",
            "10/21/2021",
            "07/22/2021",
            "04/22/2021",
            "01/21/2021",
            "10/22/2020",
            "07/23/2020",
            "04/23/2020",
            "01/23/2020",
            "10/17/2019",
            "07/18/2019",
            "04/17/2019",
            "01/17/2019",
            "10/18/2018",
            "07/19/2018",
            "04/19/2018",
            "01/18/2018",
            "10/19/2017",
            "07/19/2017",
            "04/19/2017",
            "01/18/2017",
            "10/19/2016",
            "07/20/2016",
            "04/14/2016",
            "01/20/2016",
            "10/21/2015",
            "07/22/2015",
            "04/23/2015",
            "01/21/2015",
            "10/22/2014",
            "07/16/2014",
            "04/23/2014",
            "01/22/2014",
            "10/16/2013",
            "07/17/2013",
            "04/24/2013",
            "01/16/2013",
            "10/17/2012",
            "07/18/2012",
            "01/18/2012",
            "10/19/2011",
            "07/20/2011",
            "04/27/2011",
            "01/19/2011",
            "10/20/2010",
            "07/21/2010",
            "04/28/2010",
            "01/20/2010",
            "10/21/2009",
            "07/22/2009",
            "04/22/2009",
            "01/21/2009",
            "10/22/2008",
            "07/16/2008",
            "04/16/2008",
            "01/16/2008",
            "10/17/2007",
            "07/18/2007",
            "04/25/2007",
            "01/17/2007",
            "10/18/2006",
            "07/19/2006",
            "04/19/2006",
            "10/19/2005",
            "07/20/2005",
            "04/20/2005",
            "01/19/2005",
            "10/20/2004",
            "07/21/2004",
            "04/21/2004",
            "01/21/2004",
            "10/22/2003",
            "07/16/2003",
            "04/15/2003",
            "01/22/2003",
            "10/16/2002",
            "07/17/2002",
            "04/17/2002",
            "01/16/2002",
            "10/17/2001",
            "07/18/2001",
            "04/18/2001",
            "01/17/2001",
            "10/18/2000",
            "07/19/2000",
            "04/18/2000",
            "01/19/2000",
            "10/20/1999",
            "07/21/1999",
            "04/21/1999",
            "01/20/1999",
            "10/21/1998",
            "07/22/1998",
            "04/22/1998",
            "01/21/1998",
            "10/22/1997",
            "07/16/1997",
            "04/16/1997",
            "01/22/1997",
            "10/16/1996",
            "07/17/1996",
            "04/17/1996",
            "01/17/1996",
            "10/18/1995",
            "07/19/1995",
            "04/17/1995",
            "01/13/1995",
            "10/17/1994",
            "07/18/1994",
            "04/18/1994",
            "01/14/1994",
            "10/18/1993",
            "07/19/1993",
            "04/19/1993",
            "01/15/1993",
            "10/19/1992",
            "07/20/1992",
            "04/20/1992",
            "01/17/1992",
            "10/11/1991",
            "07/15/1991",
            "04/15/1991",
            "01/14/1991",
            "10/15/1990",
            "07/16/1990",
            "04/16/1990",
            "01/12/1990",
            "10/16/1989",
            "07/17/1989",
            "04/17/1989",
            "01/13/1989",
            "10/17/1988",
            "07/18/1988",
            "04/18/1988",
            "01/15/1988",
            "10/19/1987",
            "07/20/1987",
            "04/20/1987",
        ].map((d) => new Date((0, utils_1.formatDate)(d)));
        const frequency = (0, utils_1.getDividendFrequency)(dates);
        expect(frequency).toEqual(4);
    });
    it("counts the frequency when some data has shifted months", () => {
        const dates = [
            "10/19/2023",
            "07/20/2023",
            "04/20/2023",
            "01/19/2023",
            "10/20/2022",
            "07/21/2022",
            "04/21/2022",
            "01/20/2022",
            "10/21/2021",
            "07/22/2021",
            "04/22/2021",
            "01/21/2021",
            "10/22/2020",
            "07/23/2020",
            "04/23/2020",
            "01/23/2020",
            "10/17/2019",
            "07/18/2019",
            "04/17/2019",
            "01/17/2019",
            "10/18/2018",
            "07/19/2018",
            "04/19/2018",
            "12/18/2017",
            "10/19/2017",
            "07/19/2017",
            "04/19/2017",
            "01/18/2017",
            "10/19/2016",
            "07/20/2016",
            "04/14/2016",
            "01/20/2016",
            "10/21/2015",
            "07/22/2015",
            "04/23/2015",
            "01/21/2015",
            "10/22/2014",
            "07/16/2014",
            "04/23/2014",
            "01/22/2014",
            "01/16/2014",
            "07/17/2013",
            "04/24/2013",
            "01/16/2013",
            "10/17/2012",
            "07/18/2012",
            "01/18/2012",
            "10/19/2011",
            "07/20/2011",
            "04/27/2011",
            "01/19/2011",
        ].map((d) => new Date((0, utils_1.formatDate)(d)));
        const frequency = (0, utils_1.getDividendFrequency)(dates);
        expect(frequency).toEqual(4);
    });
});
