export const parseText = (text: string): React.ReactNode => {
  if (!text) return null;

  const replacements: { [key: string]: string } = {
    '\\\\div': '÷',
    '\\\\times': '×',
    '\\\\sqrt': '√',
    '\\\\pm': '±',
    '\\\\alpha': 'α',
    '\\\\implies': '⇒',
  };

  let processedText = text;
  for (const seq in replacements) {
    const regex = new RegExp(seq, 'g');
    processedText = processedText.replace(regex, replacements[seq]);
  }

  const regex = /(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(`[^`]+`)|(\$[^$]+\$)/g;
  const parts = processedText.split(regex).filter(Boolean);

  return parts.map((part, idx) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={idx}>{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('~') && part.endsWith('~')) {
      return <del key={idx}>{part.slice(1, -1)}</del>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          style={{
            backgroundColor: '#202225',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span
          key={idx}
          style={{
            fontFamily: 'monospace',
            color: '#84cc16',
            backgroundColor: '#202225',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px',
          }}
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};
