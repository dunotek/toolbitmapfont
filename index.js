var localizeJSON = require('./localizeText.json');

//Get all text from JSON file and merge to one string
function getTextInJSON(localizeJSON) {
    let str = "";
    for (const value in localizeJSON) {
        if (typeof localizeJSON[value] == 'object') {
            str += getTextInJSON(localizeJSON[value]);
        } else {
            str += localizeJSON[value] + " ";
        }
    }
    return str;
}

var strLocalize = getTextInJSON(localizeJSON);

// Split string to array of letter
var arrChar = [];
const strReplacer = [];

let {PythonShell} = require('python-shell')
let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './',
    args: [strLocalize]
};

PythonShell.run('stringSplitter.py', options)
    .then(results => {
        var sortedStr = results[0].split(" ").sort().join(" ");
        let _set = sortedStr.split(' ');
        //remove duplicate characters
        _set = new Set(_set);
        arrChar = Array.from(_set);
        //Some characters have length = 3, cause error while generating font
        arrChar.sort((a, b) => b.length - a.length);
        let strOutput = arrChar.join("  ");
        //strOutput is for photoshop!
        console.log('String for photoshop:', strOutput);
    })
    .then(()=>{ //replace characters with length >= 2 to another character with length = 1 in ASCII code
        let exceptionalCharCode = [92,96];
        let rangeCharCode = [[65,90],[97,122],[225,Number.MAX_SAFE_INTEGER]];
        function inBetween(x, min, max) {
            return x >= min && x <= max;
        }
        let arrCharCode = Array.from(arrChar, (x) => x.charCodeAt(0));
        function conditionalCheck(charCode) {
            if(exceptionalCharCode.indexOf(charCode) >= 0) return false;
            if(arrCharCode.indexOf(charCode) >= 0) return false;
            //check if charCode not in any range of rangeCharCode
            for(let i = 0; i < rangeCharCode.length; ++i){
                let range = rangeCharCode[i];
                if(inBetween(charCode, range[0], range[1])) return true;
            }
            return false;
        }
        for (let i = 0; i < arrChar.length; ++i) {
            let str = arrChar[i];
            if (str.length <= 1) continue;
            //find alternative letter for Thai character that has length >= 2
            let charCode = 65 + strReplacer.length;
            while(!conditionalCheck(charCode)){
                charCode++;
            }
            let obj = {
                newChar: String.fromCharCode(charCode),
                value: str
            }
            arrCharCode.push(charCode);
            arrChar[i] = obj.newChar;
            strReplacer.push(obj);
        }
        console.log('bmFont string:', arrChar.join(""));
    })
    .then(()=>{ //Update localizeJSON with new characters
        var replaceText = function  (localizeJSON){
            let newObj = {};
            for (const value in localizeJSON) {
                let str = localizeJSON[value];
                if(typeof str == 'object'){
                    newObj[value] = replaceText(str);
                    continue;
                }
                for(let i = 0; i < strReplacer.length; ++i){
                    let content = strReplacer[i];
                    str = str.replaceAll(content.value, content.newChar);
                    newObj[value] = str;
                }
            }
            return newObj;
        }
        var output = replaceText(localizeJSON);
        const fs = require('fs');
        fs.writeFileSync("output.json", JSON.stringify(output));
    })
    .finally(()=>{
        console.log('Done generate Thai Font!')
    })






