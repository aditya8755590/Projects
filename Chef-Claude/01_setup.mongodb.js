use("claud-chef")
db.ingredints.find({ $or: [{ category: "Electronics" }, { stock: { $lt: 50 } }] })