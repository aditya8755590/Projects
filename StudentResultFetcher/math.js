// math.js
export function calculatePercentage(marks) {
  let total = marks.reduce((a, b) => a + b, 0);
  return total / marks.length;
}


export function getGrade(percent) {
  if (percent >= 90) return "A";
  if (percent >= 75) return "B";
  if (percent >= 60) return "C";
  return "Fail";
}