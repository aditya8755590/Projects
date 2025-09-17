async function getCurrencySymbol(code) {
    const countryCode = countryList[code];
   const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
  const data = await res.json();
  const currencies = data[0].currencies;
  const [currencyCode, currencyInfo] = Object.entries(currencies)[0];
  return currencyInfo.symbol || currencyCode;
}

async function setCurrency(fromCode, toCode) {
  const fromSymbol = await getCurrencySymbol(fromCode);
  const toSymbol = await getCurrencySymbol(toCode);

  const el1 = document.getElementById("currency1");
  const el2 = document.getElementById("currency2");

 el1.textContent = toSymbol;
 el2.textContent = fromSymbol;
}

const dropdowns=document.querySelectorAll(".dropdown select");
const btn=document.querySelector("form button")
const fromCurr=document.querySelector(".from select")
const toCurr=document.querySelector(".to select")

for(select of dropdowns){
    for(code in countryList){
    let newOption=document.createElement("option");
    newOption.innerText=code;
    newOption.value=code;
    if(select.name==='from'&&code==="USD"){
        newOption.selected="selected";
    }
    else if(select.name==='to'&&code==="INR"){
        newOption.selected="selected";
    }
    select.appendChild(newOption);
}
select.addEventListener("change",e=>{
    setFlag(e.target);
});}

const setFlag=(e)=>{
    let currCode =e.value;
    let countryCode=countryList[currCode];
    let newSrc=`https://flagsapi.com/${countryCode}/flat/64.png`;
    let img=e.parentElement.querySelector("img");
    img.src=newSrc;
};
btn.addEventListener("click",async(e)=>{
    e.preventDefault();
    let amount=document.querySelector(".amount input");
    amount_value=amount.value;
    if(amount_value===""||amount_value<1){
        amount_value=1;
        amount.value=1;
    }
     setCurrency(fromCurr.value,toCurr.value);
   getRate(fromCurr.value,toCurr.value).then(rate=>{
       document.querySelector(".msg").innerHTML=`${amount_value} ${fromCurr.value}-->${rate*amount_value} ${toCurr.value}`;
   });

   


})
// Fetch exchange rate from API
// if this is not working use this
async function getRate(fromCurr, toCurr) {
  const URL = `https://api.exchangerate-api.com/v4/latest/${fromCurr}`;
  let response = await fetch(URL);
  let data = await response.json();

  let rate = data.rates[toCurr];
  //console.log(`1 ${fromCurr} = ${rate} ${toCurr}`);
  return rate;
}
window.addEventListener("load",()=>{
    setCurrency(fromCurr.value,toCurr.value); 
    // hii
    getRate(fromCurr.value,toCurr.value).then(rate=>{
        document.querySelector(".msg").innerHTML=`1 ${fromCurr.value}-->${rate} ${toCurr.value}`;
    });
});




