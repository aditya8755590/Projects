const rawUsers = [
{ id: 1, name: "Rahul", password: "fb_password", role: "admin" },
{ id: 2, name: "Sanya", password: "123_password", role: "user" },
{ id: 3, name: "Amit", password: "secret_password", role: "user" }
];
const safeUsers=rawUsers.map(function(ele){
    const {password,...rest}=ele;
    return rest;

})
// 2. Use .filter() to create an array of 'admins' only.
const admin= rawUsers.filter(ele => ele.role === "admin")
// console.log(safeUsers);
// console.log(admin);

const cart = [
{ item: "Laptop", price: 50000, quantity: 1, inStock: true },
{ item: "Mouse", price: 1500, quantity: 2, inStock: true },
{ item: "Keyboard", price: 3000, quantity: 1, inStock: false }
];
// 1. Check if "every" item is inStock. Print "Ready to Ship" or "Wait".
// 2. Filter out the items that are NOT in stock.
// 3. Use .reduce() on the filtered list to find the final 'Total Bill'.
const status=cart.every(ele=>ele.inStock)


