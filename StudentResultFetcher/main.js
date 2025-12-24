import { fetchStudentDataPromise } from "./api.js";
import { calculatePercentage, getGrade } from "./math.js";

async function showResult() {
  try {
    console.log("Fetching student data...");

    // ✅ wait for promise to resolve
    let student = await fetchStudentDataPromise();

    let percent = calculatePercentage(student.marks);
    let grade = getGrade(percent);

    console.log("Name:", student.name);
    console.log("Percentage:", percent);
    console.log("Grade:", grade);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    console.log("Process finished");
  }
}
// then and catch method 
// fetchStudentDataPromise()
//   .then(student => {
//     let percent = calculatePercentage(student.marks);
//     let grade = getGrade(percent);

//     console.log("Name:", student.name);
//     console.log("Percentage:", percent);
//     console.log("Grade:", grade);
//   })
//   .catch(error => {
//     console.error("Error:", error.message);
//   })
//   .finally(() => {
//     console.log("Process finished");
//   });
// showResult();
// intrect with website 
const resultDiv = document.getElementById("result");

fetchStudentDataPromise()
  .then(student => {
    let percent = calculatePercentage(student.marks);
    let grade = getGrade(percent);

    resultDiv.innerHTML = `
      <h3>${student.name}</h3>
      <p><strong>Marks:</strong> ${student.marks.join(", ")}</p>
      <p><strong>Percentage:</strong> ${percent}</p>
      <p><strong>Grade:</strong> ${grade}</p>
    `;
  })
  .catch(error => {
    resultDiv.innerHTML = `
      <p class="error">Error: ${error.message}</p>
    `;
  })
  .finally(() => {
    console.log("Process finished");
  });
