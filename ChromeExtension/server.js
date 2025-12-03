let myLeads = []
const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const deleteBtn=document.getElementById("delete-btn")
const ulEl = document.getElementById("ul-el")
const tabBtn=document.getElementById("save-tab")

let data= JSON.parse(localStorage.getItem("myLeads"))
    if(data){
    myLeads=data;
    render(myLeads);
}

tabBtn.addEventListener("click", function(){
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
    myLeads.push(tabs[0].url)
    localStorage.setItem("myLeads", JSON.stringify(myLeads) )
    render(myLeads)
    })
})

inputBtn.addEventListener("click", function() {
    if(inputEl.value){
    myLeads.push(inputEl.value)
    inputEl.value = ""
    localStorage.setItem("myLeads",JSON.stringify(myLeads));
    render(myLeads)}
})

deleteBtn.addEventListener("dblclick",()=>{
    myLeads = []
    localStorage.removeItem("myLeads")
    render(myLeads)
})


function render(leads) {
    let listItems = ""
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a target='_blank' href='${leads[i]}'>
                    ${leads[i]}
                </a>
               <button class="del-btn" data-index="${i}">X</button>
            </li>
        `
    }
    ulEl.innerHTML = listItems  
    let deleteButtons = document.querySelectorAll(".del-btn")
    deleteButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        let index = this.getAttribute("data-index")
        myLeads.splice(index, 1)
        localStorage.setItem("myLeads", JSON.stringify(myLeads))
        render(myLeads)
    })
})
}
