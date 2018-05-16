var array = [["Wysoka", "Tak", "Nie"],
    ["Bardzo wyskoka", "Tak", "Tak"],
    ["Normalna", "Tak", "Nie"],
    ["Wysoka", "Nie", "Nie"],
    ["Wysoka", "Tak", "Tak"],
    ["Normalna", "Tak", "Nie"],
    ["Bardzo wysoka", "Nie", "Nie"],
    ["Wysoka", "Nie", "Nie"]
];

var decisions = ["Tak", "Tak", "Tak", "Tak", "Nie", "Nie", "Nie", "Nie"];


var array2 = [
    ["czerwone", "duze"],
    ["zolte", "srednie"],
    ["zielone", "male"],
    ["zielone", "duze"],
    ["zolte", "srednie"],
    ["czerwone", "srednie"],
    ["zolte", "duze"],
    ["czerwone", "srednie"],
    ["zolte", "male"],
    ["zolte", "male"],
    ["czerwone", "male"],
    ["zielone", "srednie"],
];

var decisions2 = ["tak", "tak", "nie", "tak", "nie", "tak", "tak", "tak", "nie", "tak", "tak", "nie"];





var lowApprox = lowerApproximation(array2, decisions2, "tak");

var upApprox = upperApproximation(array2, decisions2, "tak");

function lowerApproximation(array,decisions, decision) {
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

function upperApproximation(array, decisions, decision) {
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


