// A labeled note for a lesson step, such as Quill's challenge or a quick check.
// Reusable across lessons: the label names the step and the children hold the instructions.
function LessonCallout({ label, children }) {
  return (
    <div className="lesson-callout">
      <p className="lesson-callout-label">{label}</p>
      <p className="lesson-callout-text">{children}</p>
    </div>
  )
}

export default LessonCallout
