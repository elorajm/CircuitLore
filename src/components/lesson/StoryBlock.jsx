const KIND_LABELS = {
  guide: 'Quill (fictional guide)',
  scene: 'Imagined scene',
  history: 'Historical fact',
  science: 'Science',
}

function StoryBlock({ block, index }) {
  return (
    <section
      className={`lesson-block lesson-block-${block.kind}`}
      style={{ '--block-delay': `${index * 0.15}s` }}
    >
      <p className="lesson-block-label">{KIND_LABELS[block.kind]}</p>
      <p className="lesson-block-text">{block.text}</p>
    </section>
  )
}

export default StoryBlock
