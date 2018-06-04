var headersCsv;
var headerDecisionCsv;
var arrayCsv;
var decisionsCsv;


/**
 * Retrieving data from csv file, parsing and inserting into 
 * correct arrays.
 * 
 * @param {*} data - function for retrieving data.
 */
function main(data) {
    var ar = [];
    ar = data;

    headersCsv = getHeaders();
    headerDecisionCsv = getDecisionHeader();
    arrayCsv = getArrayData();
    decisionsCsv = getArrayDecisions();

    logArraysToConsole(true); 

    LEM2run();
    
    function getHeaders() {
        var result = [];

        for (var i=0; i<data[0].length-1; i++) {
            result.push(data[0][i]);
        }
        return result;
    }

    function getDecisionHeader() {
        return data[0][data[0].length-1];
    }

    function getArrayData() {
        var result = [],
        maxI = data.length-1,
        maxJ = data[0].length-1;

        for(var i=0; i<maxI; i++) {
            result[i] = []
            for(var j=0; j<maxJ; j++) {
                result[i][j] = data[i+1][j];
            }
        }
        return result;
    }

    function getArrayDecisions() {
        var result = [],
        nOfObjects = data.length,
        rowLen = data[0].length-1;
        singleDec="";

        for(var i=1; i<nOfObjects; i++) {
            singleDec = data[i][rowLen];
            result[i-1] = singleDec;
        }

        return result;
    }

    function logArraysToConsole(bool) {

        if (bool == true) {
            console.log(data);
            console.log(headersCsv);
            console.log(headerDecisionCsv);
            console.log(arrayCsv);
            console.log(decisionsCsv);
        }
    }

}

/**
 * Reading file from disc. using filePicker.
 * @param {*} callBack - this function will be called for read file.
 */
function readCsvFile(callBack) {
    var file = document.getElementById('files').files[0];

    Papa.parse(file, {
        complete: function(results) {
            callBack(results.data);
        }
    });
}



/**
 * function using for start algorithm from html site.
 */
function playLem2Algorithm() {
    readCsvFile(main);
}



var choosedDecision;
    var arrayCombined;
    var lowApprox;
    var upApprox;

//LEM2run();

/**
 * Running whole algorithm.
 */
function LEM2run() {

    //choosedDecision = "Tak";
    choosedDecision = document.getElementById('decision').value;
    arrayCombined = combineHeadersWithArray(headersCsv, arrayCsv);
    lowApprox = lowerApproximation(arrayCombined, decisionsCsv, choosedDecision);
    upApprox = upperApproximation(arrayCombined, decisionsCsv, choosedDecision);

    var b = getObjectForCreateRules(arrayCombined, lowApprox)
    var g = b;
    var R = null;
    var recognizedRules = stepIV(g);
    var recognizedRulesWithDec = stepV(recognizedRules, headerDecisionCsv, choosedDecision);

    document.getElementById("fileDisplayArea").innerHTML = printRules();
    return recognizedRulesWithDec;

    /**
     * Returning generated rules as string html.
     */
    function printRules() {
        var result = "";
        for(var i=0; i<recognizedRulesWithDec.length; i++) {
            result += recognizedRulesWithDec[i] + "<br>";
        }
        
        return result;
    }

}


/**
 * finding all rules in set (g) of objects, wile all objects
 * from lower approximation will be covered.
 * 
 * @param {string[]} g - objects for creating rules.
 */
function stepIV(g = []) {
    var t = null;
    var tG = getAllDescriptorsFromG(g);
    var allSystemDescriptors = getAllDescriptorsFromG(arrayCombined);
    var descriptorsMostValuable = [];   //T

    var rules = [];

    var n = 0;
    while (g.length != 0) {
        rules.push(p3(g));
        g = removeObjectsContainingRule(rules[n]);
        n++;
    }

    return rules;
    
    
    /**
     * Objects (from G set) containing rule descriptors
     * will be removed from G.
     * 
     * @param {string[]} rule -single rule in array.
     */
    function removeObjectsContainingRule(rule = []) {
        var counter = 0;
        var result = [];

        for (var i=0; i < g.length; i++) {
            for (var j=0; j < rule.length; j++) {
                if (contains(g[i], rule[j])) {
                    counter++;
                }
            }
            if (counter < rule.length) {
                result.push(g[i]);
            }
            counter = 0;
        }
        return result;
    }

}

//Rules conversion to conform notation
/**
 * Getting array of rules (single rule - one string) and returning it with decision
 * as array of strings.
 * 
 * @param {string[]} rules - generated rules.
 * @param {*} decisionHeader - title of decision.
 * @param {*} decision - decision value.
 */
function stepV(rules = [], decisionHeader, decision) {
    var result = [];

    for (var i=0; i<rules.length; i++) {
        result.push(combineRulesWithDecision(rules[i]))
    }

    return result;


    function combineRulesWithDecision(singleRule = []) {        
        var string = "";
        for (var j=0; j<singleRule.length; j++) {
            string += singleRule[j] + " /\\ ";
        }

        string += "-> " + decisionHeader + " = " + decision;

        var replacedString = string.replace(/\s.\\\s->/, " ->");
        
        return replacedString;
    } 
}





/**
 * While rule recognizing objects behind of G, algorithm will adding next weighted descriptors.
 * If two descriptors will have save number of occurrences, then function will count his
 * occurrences in whole system.
 * 
 * @param {String[]} g - objects for generate rules.
 */
function p3(g = []) {
    var t = null;
    var tG = getAllDescriptorsFromG(g);
    var allSystemDescriptors = getAllDescriptorsFromG(arrayCombined);
    var descriptorsMostValuable = [];   //T

    while (ruleRecognizingObjectsBeyondB(descriptorsMostValuable, 
        getOutOfBRows(lowApprox, arrayCombined))) {
        t = findRarestDescriptor(tG, allSystemDescriptors);
        descriptorsMostValuable.push(t);
        tG = removeDescriptor(t, tG);
    }

    return descriptorsMostValuable;
}


//Checking if object occurs beyond lower approximation
//tG, arrayCombined

/**
 * Checking if descriptors from rule recognizing object outside of lower approximation
 * If two descriptors will have save number of occurrences, then function will count his
 * occurrences in whole system. 
 * @param {String[]} descriptors - array with descriptors from checking rule.
 * @param {String[][]} systemArray - array containing whole system.
 */
function ruleRecognizingObjectsBeyondB(descriptors = [], systemArray = [[]]) {   
    var currentSystemRow = [];
    var nOfDescriptors = descriptors.length;
    var counter = 0;

    if (descriptors.length == 0) {
        return true;
    }

    for (var i=0; i < systemArray.length; i++) {
        currentSystemRow = systemArray[i];
        for (var j=0; j < currentSystemRow.length; j++) {

            if (contains(descriptors, currentSystemRow[j])) {
                counter++
            }
        }
        if (counter == nOfDescriptors) {
            return true;
        }
        counter = 0;
    }

    return false;
}


/**
 * Checking if array containing object.
 * 
 * @param {String[]} a - array.
 * @param {String} obj - object.
 */
function contains(a = [], obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

/**
 * Getting rows outside of lower approximation (G objects).
 * 
 * @param {String[]} lowerApprox - lower approximation
 * @param {String[][]} systemArray - array containing whole system.
 */
function getOutOfBRows(lowerApprox = [], systemArray = [[]]) {
    var result = [[]];

    for (var i=0; i<lowerApprox.length; i++) {
        if (lowerApprox[i] == false) {
            result.push(systemArray[i])
        }
    }
    return result;
}


/**
 * Removing descriptor from array of descriptors.
 * 
 * @param {String} desctiptorString - descriptor.
 * @param {String[]} array - array of descriptors.
 */
function removeDescriptor(desctiptorString, array = []) {
    var result = []
    for(var i=0; i < array.length; i++) {
        if (array[i] != desctiptorString) {
            result.push(array[i]);
        }
    }
    return result;
}



/**
 * Returning objects, for which rules will be created .
 * 
 * @param {String[][]} array - array of objects existing in lower approximation.
 * @param {String[]} lowApprox - lower approximation of system.
 */
function getObjectForCreateRules(array = [], lowApprox = []) {
    var objects = []
    for (var i = 0; i < array.length; i++) {
        if (lowApprox[i] == true) {
            objects.push(array[i]);
        }
    }
    return objects;
}


/**
 * Getting list of descriptors on objects from G set.
 * 
 * @param {String[]} g - objects for which rules will be created.
 */
function getAllDescriptorsFromG(g = []) {
    var arrayOfSingleDescriptors = [];

    for (var i = 0; i < g.length; i++) {
        arrayOfSingleDescriptors = arrayOfSingleDescriptors.concat(g[i]);
    }

    return arrayOfSingleDescriptors;
}


/**
 * Finding rarest descriptor in system.
 * In first step search for most occuring in lower approx.
 * If will find 2 or more wich same value, will return rarest in whole system
 * from them.
 * 
 * @param {String[]} tG - list of descriptors.
 * @param {String[]} fullSystemDescriptors - all descriptors in system.
 */
function findRarestDescriptor(tG = [], fullSystemDescriptors= []) {
    var countedDescriptorsArray = countSameValuesOfDescriptorsForArray(tG)
    var countSameValuesOfDescriptorsForWholeSystem = countSameValuesOfDescriptorsForWholeSystem(tG, fullSystemDescriptors)
    var rarestDescriptor = null;
    

    var max = Math.max.apply(Math, countedDescriptorsArray);    //max number of same elements
    var descriptorsWithMaxValue = getDescriptorsWithEqualValue(countedDescriptorsArray, max)

    var descriptorsAreSame = descriptorsInArrayAreSame(descriptorsWithMaxValue);

    

    if (descriptorsAreSame) {
        rarestDescriptor = descriptorsWithMaxValue[0];
    } else {    

        var min = Math.min.apply(Math, countSameValuesOfDescriptorsForWholeSystem); //min number of same elements
        var descriptorsWithMinValue = getDescriptorsWithEqualValue(countSameValuesOfDescriptorsForWholeSystem, min)
        var minDescriptorsAreSame = descriptorsInArrayAreSame(descriptorsWithMinValue);

        if (minDescriptorsAreSame) {
            rarestDescriptor = descriptorsWithMinValue[0];
        } else {
            var randomIndex = Math.floor(Math.random() * descriptorsWithMinValue.length);
            rarestDescriptor = descriptorsWithMinValue[randomIndex];
        }

    }

    return rarestDescriptor;

    

    /**
     * Returning array of how many times each descriptor occurs in system in list of descriptors.
     * 
     * @param {String[]} descriptors - list of descriptors.
     */
    function countSameValuesOfDescriptorsForArray(descriptors = []) {
        var counter = 0;
        var countedDescriptorsArray = [];
        for (var i = 0; i < descriptors.length; i++) {
            for (var j = 0; j < descriptors.length; j++) {
                if (descriptors[i] == descriptors[j] ) {
                    counter++;
                }
            }
            countedDescriptorsArray[i] = counter;
            counter = 0;
        }

        return countedDescriptorsArray;
    }


    /**
     * Returning array of how many times each descriptor occurs in whole system,
     * including lower and higher approximation.
     * @param {*} descriptors - list of descriptors.
     * @param {*} wholeSystem - array containing whole system.
     */
    function countSameValuesOfDescriptorsForWholeSystem(descriptors = [], wholeSystem = []) {
        var counter = 0;
        var countedDescriptorsArray = [];
        for (var i = 0; i < descriptors.length; i++) {
            for (var j = 0; j < wholeSystem.length; j++) {
                if (descriptors[i] == wholeSystem[j] ) {
                    counter++;
                }
            }
            countedDescriptorsArray[i] = counter;
            counter = 0;
        }

        return countedDescriptorsArray;
    }

    /**
     * Getting from array of descriptors only descriptor with specified given.
     * 
     * @param {*} array - array of descriptors.
     * @param {*} value - expecting value.
     */
    function getDescriptorsWithEqualValue(array = [], value) {
        var result = [];
        for (var i =0; i < tG.length; i++) {
            if (array[i] == value) {
                result.push(tG[i]);
            }
        }
        return result;
    }


    /**
     * Checking if array of descriptors containing only single-type descriptor.
     * (All have same value)
     * 
     * @param {*} descriptors 
     */
    function descriptorsInArrayAreSame(descriptors = []) {
        for (var i = 0; i < descriptors.length-1; i++) {
            if (descriptors[i] != descriptors[i+1]) {
                return false;
            } 
        }

        return true;
    }

}




/**
 * Returning lower approximation of system array.
 * Objects for which there is no doubt there are recognizing rule.
 * 
 * @param {*} array - whole system array.
 * @param {*} decisions - decisions array.
 * @param {*} decision - decision value.
 */
function lowerApproximation(array,decisions=[], decision) {
    var pLowArray = [];
    var innerTrueFalseCounter= 0;

    for (var i=0; i < array.length; i++) {
        if (decision == decisions[i]) {
            for (var j=0; j < array.length; j++) {            
                if (compareTwoRows(array[i], array[j]) && decisions[i] != decisions[j] && i != j) {
                    break;
                } else {
                    innerTrueFalseCounter++;
                }
            }
            if (innerTrueFalseCounter == array.length) {
                pLowArray[i] = true;
            } else {
                pLowArray[i] = false;
            }
            innerTrueFalseCounter = 0;
        } else {
            pLowArray[i] = false;
        }
        
    }

    return pLowArray;
}

/**
 * Returning lower approximation of system array.
 * Objects for which there are maybe recognizing rule.
 * 
 * @param {*} array - whole system array.
 * @param {*} decisions - decisions array.
 * @param {*} decision - decision value.
 */
function upperApproximation(array, decisions=[], decision) {
    var pUpArray = lowerApproximation(array, decisions, decision);

    for (var i=0; i < array.length; i++) {  
        for (var j=0; j < array.length; j++) {
            if (compareTwoRows(array[i], array[j]) && decisions[i] != decisions[j] && i != j) {
                pUpArray[i] = true;
                pUpArray[j] = true;
                break;
            }
        }     
    }  
    return pUpArray; 
}


/**
 * Comparing two rows. Returning true if they are same.
 * 
 * @param {Strin[]} row1 
 * @param {Strin[]} row2 
 */
function compareTwoRows(row1 = [], row2 = []) {

    for(var k = 0; k < row1.length; k++) {
        if (row1[k] != row2[k]) {
            return false;
        }
    }

    return true;
}

/**
 * Combining header with value, eg: 
 * Header = headache, Value = true, will return: 
 * headache: true.
 * 
 * @param {String[]} headers - headers array.
 * @param {String[][]} array - whole system array.
 */
function combineHeadersWithArray(headers = [], array = [[]]) {
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
            array[i][j] = headers[j] + "=" +  array[i][j]
        }
    }

    return array;
}


