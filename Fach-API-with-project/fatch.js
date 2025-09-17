// const URl="https://cat-fact.herokuapp.com/facts"
// if this link is not working use this link
const URl="https://catfact.ninja/fact"
//let promise=fetch(URl)
//console.log(promise)
const getData=async()=>{
    console.log("inside getData function")
    let response= await fetch(URl)
    console.log("getting data ......")
    // hum JSON data ko directly console me print nhi kar sakte
    //  isliye hume use json me convert karna padta hai
    let data=await response.json()
    console.log("data received")
    console.log(data)
    document.getElementsByClassName("factbox")[0].innerHTML=`<h1>${data.fact}</h1>`
    // ab hum json data ko use kar sakte hai
    
    //console.log(data[0].text)
    //console.log(data[0].type)
    //console.log(data[0].user.name.first)
    //console.log(data[0].user.name.last)
    //console.log(data[0].upvotes)
    //console.log(data[0].user.name.title)

    // or we can directly print json data without storing in variable
    // let data=await response.json()
    // console.log(data)
}


// we also make the function getdata by using .then function
// function getData(){
//     console.log("inside getData function")
//     fetch(URl).then((response)=>{
//         console.log("inside first then")
//         return response.json()
//     }).then((data)=>{
//         document.getElementsByClassName("factbox")[0].innerHTML=`<h1>${data.fact}</h1>`
//         console.log("inside second then")
//         console.log(data)

//     })
// }

// adding event listener to button
document.querySelector("button").addEventListener("click",getData)
//getData()