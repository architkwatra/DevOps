function mutateString (mutator, val) {

    var mutatedLinesCount = 0;
    var mutatedCode;
    var codeLines = val.split('\n');
    var PROBABILITY = 0.30;

    // the limit of 10% code mutation
    var LIMIT = Math.trunc(codeLines.length/10);
    // cannot have zero changes. At least one line
    LIMIT = LIMIT == 0 ? 1 : LIMIT;

    let index = 0;
    if( mutator.random().bool(PROBABILITY) && mutatedLinesCount < LIMIT ) {
        // swap "==" with "!="
        do {
            mutatedCode = codeLines[index].replace('==', '!=');
            if (mutatedCode != codeLines[index]) {
                mutatedLinesCount++;
                codeLines.splice(index, 1, mutatedCode);
            }
            index++;
        } while (index < codeLines.length && mutatedLinesCount < LIMIT);
    }

    if( mutator.random().bool(PROBABILITY) && mutatedLinesCount < LIMIT ) {
        // swap 0 with 1
        index = 0;
        do {
            mutatedCode = codeLines[index].replace('0', '1');
            if (mutatedCode != codeLines[index]) {
                mutatedLinesCount++;
                codeLines.splice(index, 1, mutatedCode);
            }
            index++;
        } while (index < codeLines.length && mutatedLinesCount < LIMIT);
    }

    if ( mutator.random().bool(PROBABILITY) && mutatedLinesCount < LIMIT ) {
        // change content of "strings" in code 
        var regex1 = new RegExp('String.+=.+".+"');
        index = 0;
        do {
            if (regex1.test(codeLines[index])) {
                var randomString = mutator.random().string(10);
                mutatedCode = codeLines[index].replace(/".+"/gm, '"'+randomString+'"');
                codeLines.splice(index, 1, mutatedCode);
                mutatedLinesCount++;
            }
            index++;
        } while (index < codeLines.length && mutatedLinesCount < LIMIT);
    }

    if ( mutator.random().bool(PROBABILITY) && mutatedLinesCount < LIMIT ) {
        // swap "<" with ">". Be mindful of potential impact on generics
        index = 0;
        do {
            mutatedCode = codeLines[index].replace('<', '>');
            if (mutatedCode != codeLines[index]) {
                mutatedLinesCount++;
                codeLines.splice(index, 1, mutatedCode);
            }
            index++;
        } while(index < codeLines.length && mutatedLinesCount < LIMIT);
    }

    if ( mutator.random().bool(PROBABILITY) && mutatedLinesCount < LIMIT ) {
        // self defined mutation 1 - changing the path in annotations
        var regex1 = new RegExp('@.+=.+".+"');
        index = 0;
        do {
            if (regex1.test(codeLines[index])) {
                mutatedCode = codeLines[index].replace('/', '\\');
                if (mutatedCode != codeLines[index]) {
                    mutatedLinesCount++;
                    codeLines.splice(index, 1, mutatedCode);
                }
            }
            index++;
        } while(index < codeLines.length && mutatedLinesCount < LIMIT);
    }

    if ( mutator.random().bool(PROBABILITY) && mutatedLinesCount < LIMIT ) {
        // self defined mutation 2 - changing from Public to Private
        index = 0;
        do {
            mutatedCode = codeLines[index].replace('Public', 'Private');
            if (mutatedCode != codeLines[index]) {
                mutatedLinesCount++;
                codeLines.splice(index, 1, mutatedCode);
            }
            index++;
        } while (index < codeLines.length && mutatedLinesCount < LIMIT);
    }

    return codeLines.join('\n');
}

exports.mutateString = mutateString;
