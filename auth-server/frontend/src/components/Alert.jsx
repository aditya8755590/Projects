// =========================================================
//  src/components/Alert.jsx
//  The two status boxes every page renders:
//    <div className="ok">  green success message
//    <div className="err"> red error message
//
//  Both were hand-written in Login, Register, Profile and Admin.
//  Alert renders either one from a single prop.
// =========================================================

export default function Alert({ type, children }) {
  if (!children) return null;
  return <div className={type === "err" ? "err" : "ok"}>{children}</div>;
}