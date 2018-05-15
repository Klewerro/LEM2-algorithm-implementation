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

var lowApprox = lowerApproximation(array, "Tak");

var upApprox = upperApproximation(array, "Tak");

function lowerApproximation(array, decision) {
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

function upperApproximation(array, decision) {
    var pUpArray = lowerApproximation(array, decision);

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


