import { useState } from 'react';
import { NoteEditor } from '../NoteEditor';

export default function NoteEditorExample() {
  const [content, setContent] = useState('<h1>サンプルノート</h1><p>ここにメモを入力できます。<strong>太字</strong>や<em>斜体</em>も使えます。</p>');

  return (
    <div className="h-screen w-full">
      <NoteEditor content={content} onChange={setContent} />
    </div>
  );
}
