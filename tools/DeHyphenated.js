const rData = { data: '', processed: false, continue: false, uppercaseMethod: '', hyphened: false };
const quatationMarkArray = [
    ',', '.', '!', '?', '@', '#', '$', '%', '^', '&', '*', '(', ')', '\'', '"',
    '/', '\\', '<', '>', '_', '~', '`', ':', ';'
];
class Prefix extends Object {
    constructor() {
        super();
        this.marks = "";
        this.lastIndex = -1;
    }
}
class Postfix extends Object {
    constructor() {
        super();
        this.marks = "";
        this.firstIndex = -1;
    }
}
const isUppercase = (str) => {
    return str[0] === str.toUpperCase()[0];
};
const splitMarks = (word) => {
    var prefix = new Prefix();
    var postfix = new Postfix();
    postfix.firstIndex = word.length;
    var flag = false;
    for (var i = 0; i <= word.length; i++) {
        if (!flag && quatationMarkArray.includes(word.charAt(i))) {
            prefix.marks = prefix.marks + word.charAt(i);
            prefix.lastIndex = i;
        }
        if (!(quatationMarkArray.includes(word.charAt(i)))) {
            flag = true;
        }
        if (flag && quatationMarkArray.includes(word.charAt(i))) {
            postfix.marks = postfix.marks + word.charAt(i);
            if (postfix.firstIndex === word.length)
                postfix.firstIndex = i;
        }
    }
    return { prefix: prefix, postfix: postfix };
};
const Dehyphenate = (data, word) => {
    if (data[2] !== '') {
        word = data[2];
        return { processed: true, continue: false, data: word, uppercaseMethod: 'A', hyphened: (data[2].includes('-')) };
    }
    else {
        if (data[3] === 'B')
            return { processed: false, continue: false, data: word, uppercaseMethod: 'B', hyphened: false };
        else if (data[3] === 'C')
            return { processed: false, continue: false, data: word, uppercaseMethod: 'C', hyphened: false };
        else if (data[3] === 'D')
            return { processed: false, continue: false, data: word, uppercaseMethod: 'D', hyphened: false };
        else
            throw Error('Data Error: No Default Uppercase Method.');
    }
    ;
};
const isFirstWordSame = (wordInDict, wordInput) => {
    return wordInDict.split(' ').at(0) === wordInput;
};
const processWord = (list, word, NoSeperationFlag) => {
    var returnData = rData;
    var obj = { prefix: new Prefix(), postfix: new Postfix() };
    var originalWord = word;
    if (NoSeperationFlag === undefined) {
        NoSeperationFlag = false;
    }
    obj = splitMarks(word);
    word = word.substring((obj.prefix.lastIndex === -1) ? 0 : obj.prefix.lastIndex + 1, obj.postfix.firstIndex);
    for (var i = 0; i < list.length; i++) {
        if (word === '') {
            break;
        }
        if (word === list[i][1]) {
            returnData = Dehyphenate(list[i], word);
            if (returnData.processed) {
                returnData.data = obj.prefix.marks + returnData.data + obj.postfix.marks;
                return returnData;
            }
            if (returnData.uppercaseMethod === 'B' || returnData.uppercaseMethod === 'C' || returnData.uppercaseMethod === 'D') {
                break;
            }
        }
        else if (list[i][1].includes(word) && list[i][1].split(' ').length > word.split(' ').length && isFirstWordSame(list[i][1][0], word) && isUppercase(word)) {
            returnData = { data: word, continue: true, processed: false, uppercaseMethod: '', hyphened: false };
            returnData.data = originalWord;
            return returnData;
        }
    }
    if (returnData.uppercaseMethod === 'B' || returnData.uppercaseMethod === 'C' || returnData.uppercaseMethod === 'D' || returnData.uppercaseMethod === '') {
        try {
            if (!NoSeperationFlag && returnData.uppercaseMethod === '') {
                returnData.data = originalWord;
            }
            else {
                originalWord = replaceSpaces(originalWord, 'tiam', 'langphang', false);
                if (returnData.uppercaseMethod === 'B' || returnData.uppercaseMethod === 'D') {
                    var wordArray = originalWord.split(' ');
                    wordArray.forEach(syllable => {
                        wordArray[wordArray.indexOf(syllable)] = syllable[0].toUpperCase() + syllable.slice(1, syllable.length);
                    });
                    if (returnData.uppercaseMethod === 'D')
                        wordArray[wordArray.length - 1] = wordArray[wordArray.length - 1].toLowerCase();
                    originalWord = wordArray.join(' ');
                }
                returnData.data = originalWord;
            }
        }
        catch (e) {
            throw e;
        }
    }
    return returnData;
};
const replaceProperNouns = (originalText, sheet, sheetsAfter) => {
    var textArray = originalText.split(' ');
    var ProperWordsCompoundFlag = { 'front': -1, 'end': -1 };
    var tempStr = "";
    var processedText = '';
    var returnData = rData;
    if (sheetsAfter === undefined) {
        sheetsAfter = false;
    }
    for (var i = 0; i < textArray.length; i++) {
        if (textArray[i] === '')
            continue;
        if (isUppercase(textArray[i])) { // Nā sī Tōa siá.
            if (ProperWordsCompoundFlag.front === -1) { // Khòaⁿ kam í keng ū tng teh phiau kì sû cho͘.
                ProperWordsCompoundFlag.front = i; // Nā bô tio̍h kā chit ê chò thâu.
                ProperWordsCompoundFlag.end = i;
            }
            else {
                ProperWordsCompoundFlag.end = i; // Nā ū tio̍h siat tēng chit ê chò bóe.
            }
        }
        if (ProperWordsCompoundFlag.front !== -1 && ProperWordsCompoundFlag.end !== -1 && ProperWordsCompoundFlag.front <= ProperWordsCompoundFlag.end) { // Nā sī í keng tn̄g tio̍h sió siá seng chhú lí thâu chêng ê sû cho͘.
            tempStr = '';
            for (var j = ProperWordsCompoundFlag.front; j <= ProperWordsCompoundFlag.end; j++) { // Kā sû cho͘ ê sû tàu chò chi̍t ê string.
                if (j !== ProperWordsCompoundFlag.front && ProperWordsCompoundFlag.front !== ProperWordsCompoundFlag.end)
                    tempStr = tempStr.toString() + ' '; // Thâu chi̍t ê mài thiⁿ làng phāng.
                tempStr = tempStr.toString() + textArray[j];
            }
            returnData = processWord(sheet.values, tempStr, sheetsAfter);
            if (returnData.continue) {
                continue;
            }
            ProperWordsCompoundFlag.front = -1;
            ProperWordsCompoundFlag.end = -1;
            if (i > 0)
                processedText = processedText.toString() + ' ';
            processedText = processedText + returnData.data;
        }
        else {
            if (i > 0)
                processedText = processedText.toString() + ' ';
            processedText = processedText.toString() + textArray[i];
        }
    }
    if (processedText.charAt(0) === ' ')
        processedText = processedText.substring(1, processedText.length);
    return processedText;
};
const replaceAllExceptUppercase = (str, target, content) => {
    var strArray = str.split(" ");
    var processedStr = "";
    var obj = { prefix: new Prefix(), postfix: new Postfix() };
    var tStr = "";
    for (var i = 0; i < strArray.length; i++) {
        if (i > 0)
            processedStr = processedStr + ' ';
        obj = splitMarks(strArray[i]);
        tStr = strArray[i].substring((obj.prefix.lastIndex === -1) ? 0 : obj.prefix.lastIndex + 1, obj.postfix.firstIndex);
        if (!isUppercase(tStr)) {
            processedStr = processedStr + strArray[i].replaceAll(target, content);
        }
        else {
            processedStr = processedStr + strArray[i];
        }
    }
    return processedStr;
};
const replaceSpaces = (originalText, natureToneMark, convertMethod, exceptUppercase) => {
    if (exceptUppercase === undefined) {
        exceptUppercase = false;
    }
    var _t = originalText;
    if (natureToneMark !== undefined || natureToneMark === "tiam") {
        _t = _t.replaceAll("--", "  ·");
    }
    else if (natureToneMark === "khoainn") { }
    else {
        return Error('Not a legal tone mark');
    }
    if (convertMethod !== undefined || convertMethod === "langphang") {
        if (exceptUppercase) {
            _t = replaceAllExceptUppercase(_t, "-", " ");
        }
        else {
            _t = _t.replaceAll('-', ' ');
        }
    }
    else if (convertMethod === "kapji") {
        if (exceptUppercase) {
            _t = replaceAllExceptUppercase(_t, "-", "");
        }
        else {
            _t = _t.replaceAll('-', '');
        }
    }
    else {
        return Error('Not a legal convert method');
    }
    return _t;
};
const DeHyphenated = (text, sheets, natureToneMark, convertMethod) => {
    var convertedText;
    try {
        convertedText = text;
        for (var i = 0; i < sheets.length; i++) {
            convertedText = replaceProperNouns(convertedText, sheets[i], (i === sheets.length - 1) ? true : false);
        }
        convertedText = replaceSpaces(convertedText, natureToneMark, convertMethod, true);
    }
    catch (e) {
        if (e instanceof Error) {
            return e;
        }
    }
    return convertedText;
};
export default DeHyphenated;
