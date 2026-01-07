const numbers=[1,2,3,4,5]
//array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
const sumOfNumbers=numbers.reduce((sum,numbers)=>sum+numbers)
    
    console.log(sumOfNumbers);