// =========================================================
//  src/components/Field.jsx
//  The form building block that appears in every page:
//
//    <label>Email</label>
//    <input
//      type="email"
//      value={email}
//      onChange={(e) => setEmail(e.target.value)}
//      required
//    />
//
//  That label + input pair was copy-pasted everywhere. Field wraps
//  label + input + input props, and lets pages attach a readOnly and
//  minLength where the form needs it. Controlled value/onChange are
//  wired by the page through the spread — same as writing it by hand.
// =========================================================

export default function Field({ label, type = "text", readOnly, minLength, ...props }) {
  return (
    <>
      <label>{label}</label>
      <input
        type={type}
        readOnly={readOnly}
        minLength={minLength}
        {...props}
      />
    </>
  );
}