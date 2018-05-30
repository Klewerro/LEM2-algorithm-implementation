var headersCsv;
var headerDecisionCsv;
var arrayCsv;
var decisionsCsv;



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


function readCsvFile(callBack) {
    var file = document.getElementById('files').files[0];

    Papa.parse(file, {
        complete: function(results) {
            callBack(results.data);
        }
    });
}




function playLem2Algorithm() {
    readCsvFile(main);
}



var choosedDecision;
    var arrayCombined;
    var lowApprox;
    var upApprox;

//LEM2run();

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

    function printRules() {
        var result = "";
        for(var i=0; i<recognizedRulesWithDec.length; i++) {
            result += recognizedRulesWithDec[i] + "<br>";
        }
        
        return result;
    }

}

//finding all rules in set (g) of objects
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


function contains(a = [], obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function getOutOfBRows(lowerApprox = [], systemArray = [[]]) {
    var result = [[]];

    for (var i=0; i<lowerApprox.length; i++) {
        if (lowerApprox[i] == false) {
            result.push(systemArray[i])
        }
    }
    return result;
}


function removeDescriptor(desctiptorString, array = []) {
    var result = []
    for(var i=0; i < array.length; i++) {
        if (array[i] != desctiptorString) {
            result.push(array[i]);
        }
    }
    return result;
}



//Returning objects, which for which rules will be created 
function getObjectForCreateRules(array = [], lowApprox = []) {
    var objects = []
    for (var i = 0; i < array.length; i++) {
        if (lowApprox[i] == true) {
            objects.push(array[i]);
        }
    }
    return objects;
}

//Returning separated descriptors from specified list of objects
function getAllDescriptorsFromG(g = []) {
    var arrayOfSingleDescriptors = [];

    for (var i = 0; i < g.length; i++) {
        arrayOfSingleDescriptors = arrayOfSingleDescriptors.concat(g[i]);
    }

    return arrayOfSingleDescriptors;
}


//Finding rarest descriptor in system.
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

    

    //Returning array of how many times each descriptor occurs in system in lower approximation set. 
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

    //Returning array of how many times each descriptor occurs in system in whole system,
    //including lower and higher approximation.
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

    //Getting from array of descriptors only descriptor with given value.
    function getDescriptorsWithEqualValue(array = [], value) {
        var result = [];
        for (var i =0; i < tG.length; i++) {
            if (array[i] == value) {
                result.push(tG[i]);
            }
        }
        return result;
    }

    //Checking if array of descriptors containing only single-type descriptor.
    function descriptorsInArrayAreSame(descriptors = []) {
        for (var i = 0; i < descriptors.length-1; i++) {
            if (descriptors[i] != descriptors[i+1]) {
                return false;
            } 
        }

        return true;
    }

}





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


function compareTwoRows(row1 = [], row2 = []) {

    for(var k = 0; k < row1.length; k++) {
        if (row1[k] != row2[k]) {
            return false;
        }
    }

    return true;
}

function combineHeadersWithArray(headers = [], array = [[]]) {
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
            array[i][j] = headers[j] + "=" +  array[i][j]
        }
    }

    return array;
}


