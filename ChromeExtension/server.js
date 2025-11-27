let myLeads = []
let oldLeads=[]
const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
 const deleteBtn=document.getElementById("delete-btn")
const ulEl = document.getElementById("ul-el")

let data= JSON.parse(localStorage.getItem("myLeads"))
    if(data){
    myLeads=data;
    renderLeads();
}

inputBtn.addEventListener("click", function() {
    if(inputEl.value){
    myLeads.push(inputEl.value)
    inputEl.value = ""
    localStorage.setItem("myLeads",JSON.stringify(myLeads));
    renderLeads()}
})

deleteBtn.addEventListener("dblclick",()=>{
    myLeads = []
    localStorage.removeItem("myLeads")
    renderLeads()
})

function render(leads) {
    let listItems = ""
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a target='_blank' href='${leads[i]}'>
                    ${leads[i]}
                </a>
            </li>
        `
    }
    ulEl.innerHTML = listItems  
}
