// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("claud-chef");
db.ingredints.insertMany([
{
name: "Wireless Mouse",
price: 799,
category: "Electronics",
stock: 120,
ratings: 4.5,
tags: ["computer", "accessory", "wireless"],
createdAt: new Date()
},
{
name: "Mechanical Keyboard",
price: 2499,
category: "Electronics",
stock: 80,
ratings: 4.8,
tags: ["keyboard", "mechanical"],
createdAt: new Date()
},
{
name: "Gaming Laptop",
price: 85999,
category: "Computers",
stock: 30,
ratings: 4.6,
tags: ["gaming", "laptop"],
createdAt: new Date()
}
])
