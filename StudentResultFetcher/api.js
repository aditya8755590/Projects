export function fetchStudentDataCallback(callback) {
  setTimeout(() => {
    let success = Math.random() > 0.6;
    if (!success) {
      callback(new Error("Failed to fetch student data"));
    } 
    else {
      callback(null, {
        name: "Aditya",
        marks: [85, 78, 92, 88,67]
      });
    }
  }, 1000);
}

export function fetchStudentDataPromise() {
  return new Promise((resolve, reject) => {
    fetchStudentDataCallback((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}