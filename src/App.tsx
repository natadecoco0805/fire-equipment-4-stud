import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowLeft, ArrowRight, Bookmark, BookOpen, CheckCircle2, Clock3, Download, FileUp, Home, ListChecks, RotateCcw, Target, Trophy } from 'lucide-react'
import { questions as seed, type Question } from './questions'
import { addAttempt, exportBackup, getAttempts, getBookmarks, getQuestions, importBackup, importQuestions, seedQuestions, toggleBookmark, type Attempt, type Bookmark as BookmarkType } from './db'

type Screen = 'home' | 'practice' | 'review' | 'mock' | 'stats' | 'data'
type Mode = 'one' | 'batch'
const categories = ['すべて', '法令（共通）', '法令（類別）', '基礎的知識（電気）', '構造・機能・工事・整備', '規格', '鑑別', '製図']

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [category, setCategory] = useState('すべて')
  const [mode, setMode] = useState<Mode>('one')
  const [queue, setQueue] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [sessionAnswers, setSessionAnswers] = useState<{q:Question; selected:number|string; correct:boolean}[]>([])
  const [batchSelected, setBatchSelected] = useState<Record<string, number>>({})
  const [batchSubmitted, setBatchSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [mockStarted, setMockStarted] = useState(false)

  async function refresh() {
    setAllQuestions(await getQuestions())
    setAttempts(await getAttempts())
    setBookmarks(await getBookmarks())
  }
  useEffect(() => { (async () => { await seedQuestions(seed); await refresh() })() }, [])

  const latestByQuestion = useMemo(() => {
    const map = new Map<string, Attempt>()
    for (const a of [...attempts].sort((x,y) => x.answeredAt.localeCompare(y.answeredAt))) map.set(a.questionId, a)
    return map
  }, [attempts])
  const wrongIds = useMemo(() => new Set(attempts.filter(a => !a.correct).map(a => a.questionId)), [attempts])
  const accuracy = attempts.length ? Math.round(attempts.filter(a => a.correct).length / attempts.length * 100) : 0
  const current = queue[index]
  const currentBookmarked = current ? bookmarks.some(b => b.questionId === current.id) : false

  function shuffle<T>(items: T[]) {
    const arr = [...items]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
  function startPractice(which: 'all' | 'wrong' | 'weak' | 'mock') {
    let qs = [...allQuestions]
    if (which === 'wrong') qs = qs.filter(q => wrongIds.has(q.id) && latestByQuestion.get(q.id)?.correct === false)
    if (which === 'weak') {
      const scores = new Map<string, {right:number; total:number}>()
      attempts.forEach(a => {
        const q = allQuestions.find(x => x.id === a.questionId)
        if (!q) return
        const s = scores.get(q.category) || {right:0,total:0}
        s.total++; if (a.correct) s.right++
        scores.set(q.category, s)
      })
      const weakest = [...scores.entries()].filter(([,s])=>s.total>0).sort((a,b)=>a[1].right/a[1].total-b[1].right/b[1].total)[0]?.[0]
      if (weakest) qs = qs.filter(q => q.category === weakest)
    }
    if (which === 'mock') {
      const blueprint = [
        ['法令（共通）', 6], ['法令（類別）', 9], ['基礎的知識（電気）', 10],
        ['構造・機能・工事・整備', 15], ['規格', 5], ['鑑別', 5], ['製図', 2]
      ] as [string, number][]
      const chosen: Question[] = []
      blueprint.forEach(([cat, n]) => chosen.push(...shuffle(qs.filter(q=>q.category===cat)).slice(0,n)))
      qs = chosen.length ? chosen : shuffle(qs).slice(0, Math.min(20, qs.length))
      setMode('batch'); setMockStarted(true)
    } else {
      if (category !== 'すべて') qs = qs.filter(q => q.category === category)
      setMockStarted(false)
    }
    if (!qs.length) { setNotice(which === 'wrong' ? '復習できる間違い問題がありません。まず通常演習を解いてください。' : '条件に一致する問題がありません。'); return }
    setQueue(which === 'mock' ? qs : shuffle(qs))
    setIndex(0); setSelected(null); setRevealed(false); setSessionAnswers([])
    setBatchSelected({}); setBatchSubmitted(false)
    setScreen(which === 'wrong' ? 'review' : which === 'mock' ? 'mock' : 'practice')
    setNotice('')
  }
  async function answerOne() {
    if (!current || selected === null) return
    const correct = selected === current.answer
    const a: Attempt = { id: crypto.randomUUID(), questionId: current.id, selected, correct, answeredAt: new Date().toISOString(), mode: screen === 'review' ? 'review' : screen === 'mock' ? 'mock' : 'practice' }
    await addAttempt(a)
    setSessionAnswers(old => [...old, {q:current, selected, correct}])
    setRevealed(true)
    await refresh()
  }
  function nextQuestion() {
    if (index + 1 >= queue.length) {
      setNotice('セッション終了。今回の回答結果は学習履歴に保存されています。')
      setScreen('home'); setQueue([]); setRevealed(false); setSelected(null); return
    }
    setIndex(index + 1); setSelected(null); setRevealed(false)
  }
  async function submitBatch() {
    const answers: {q:Question;selected:number|string;correct:boolean}[] = []
    for (const q of queue) {
      if (batchSelected[q.id] === undefined) continue
      const chosen = batchSelected[q.id]
      const correct = chosen === q.answer
      answers.push({q, selected:chosen, correct})
      await addAttempt({id:crypto.randomUUID(),questionId:q.id,selected:chosen,correct,answeredAt:new Date().toISOString(),mode:screen==='mock'?'mock':'practice'})
    }
    setSessionAnswers(answers); setBatchSubmitted(true); await refresh()
  }
  async function onBookmark() {
    if (!current) return
    await toggleBookmark(current.id); await refresh()
  }
  async function downloadBackup() {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`k4-study-backup-${new Date().toISOString().slice(0,10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  async function restoreBackup(file?: File) {
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      await importBackup(data); await refresh(); setNotice('バックアップを復元しました。')
    } catch (e) { setNotice(e instanceof Error ? e.message : '復元に失敗しました。') }
  }
  async function loadQuestionFile(file?: File) {
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const qs = Array.isArray(data) ? data : data.questions
      if (!Array.isArray(qs) || !qs.every(q => q.id && q.category && q.prompt && q.explanation && q.answer !== undefined)) throw new Error('問題データの形式が正しくありません。')
      await importQuestions(qs); await refresh(); setNotice(`${qs.length}問を取り込みました。`)
    } catch(e) { setNotice(e instanceof Error ? e.message : '問題の取り込みに失敗しました。') }
  }

  const countsByCategory = useMemo(() => categories.slice(1).map(cat => {
    const qs = allQuestions.filter(q => q.category === cat)
    const aa = attempts.filter(a => qs.some(q => q.id === a.questionId))
    return {cat, total:qs.length, answered:aa.length, accuracy:aa.length ? Math.round(aa.filter(a=>a.correct).length/aa.length*100) : null}
  }), [allQuestions, attempts])

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>setScreen('home')}><span className="brand-mark">甲4</span><span><strong>甲4 学習ノート</strong><small>消防設備士 甲種第4類</small></span></button>
      <div className="top-stats"><span><Target size={16}/>{accuracy}%</span><span><BookOpen size={16}/>{attempts.length}回答</span></div>
    </header>
    {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}>閉じる</button></div>}
    <main>
      {screen === 'home' && <section className="page">
        <div className="hero"><div className="eyebrow">YOUR STUDY SPACE</div><h1>少しずつ解いて、<br/>苦手をなくす。</h1><p>回答履歴をもとに、間違えた問題と苦手分野を見える化します。</p><div className="hero-metrics"><div><strong>{allQuestions.length}</strong><span>登録問題</span></div><div><strong>{attempts.length}</strong><span>累計回答</span></div><div><strong>{accuracy}%</strong><span>累計正答率</span></div></div></div>
        <div className="section-heading"><h2>学習メニュー</h2><span>いつでも中断・再開できます</span></div>
        <div className="menu-grid">
          <button className="menu-card primary" onClick={()=>startPractice('all')}><span className="menu-icon"><BookOpen/></span><strong>通常演習</strong><span>全問題からランダム出題</span><ArrowRight/></button>
          <button className="menu-card" onClick={()=>startPractice('wrong')}><span className="menu-icon"><RotateCcw/></span><strong>間違い復習</strong><span>{wrongIds.size}問が復習候補</span><ArrowRight/></button>
          <button className="menu-card" onClick={()=>startPractice('weak')}><span className="menu-icon"><Activity/></span><strong>苦手分野を解く</strong><span>履歴から弱点分野を選択</span><ArrowRight/></button>
          <button className="menu-card" onClick={()=>startPractice('mock')}><span className="menu-icon"><Clock3/></span><strong>模擬試験</strong><span>本番形式の構成で挑戦</span><ArrowRight/></button>
        </div>
        <div className="section-heading"><h2>分野別の進捗</h2><button className="text-button" onClick={()=>setScreen('stats')}>詳細を見る <ArrowRight size={14}/></button></div>
        <div className="category-list">{countsByCategory.map(c=><div className="category-row" key={c.cat}><div className="category-name"><strong>{c.cat}</strong><span>{c.total}問</span></div><div className="progress-track"><span style={{width:`${c.accuracy ?? 0}%`}}/></div><b>{c.accuracy === null ? '未回答' : `${c.accuracy}%`}</b></div>)}</div>
        <div className="quick-links"><button onClick={()=>setScreen('stats')}><Activity/>学習分析</button><button onClick={()=>setScreen('data')}><Download/>データ管理</button></div>
      </section>}

      {(screen === 'practice' || screen === 'review' || screen === 'mock') && queue.length > 0 && (
        <section className="page quiz-page">
          <div className="quiz-toolbar"><button className="back-button" onClick={()=>{setScreen('home');setQueue([])}}><ArrowLeft size={17}/> メニュー</button><span className="pill">{screen==='review'?'間違い復習':screen==='mock'?'模擬試験':'通常演習'}</span><button className={`icon-button ${currentBookmarked?'active':''}`} aria-label="ブックマーク" onClick={onBookmark}><Bookmark size={19} fill={currentBookmarked?'currentColor':'none'}/></button></div>
          {mode === 'one' && <><div className="question-progress"><span>QUESTION {index+1} / {queue.length}</span><div className="progress-track"><span style={{width:`${((index+1)/queue.length)*100}%`}}/></div></div>
            {current && <article className="question-card"><div className="question-meta"><span>{current.category}</span><span>{current.kind}</span></div><h1>{current.prompt}</h1>
              {current.choices && <div className="choice-list">{current.choices.map((choice,i)=><button key={choice} disabled={revealed} className={`choice ${selected===i?'selected':''} ${revealed && i===current.answer?'correct':''} ${revealed && selected===i && i!==current.answer?'incorrect':''}`} onClick={()=>setSelected(i)}><span className="choice-letter">{String.fromCharCode(65+i)}</span><span>{choice}</span>{revealed&&i===current.answer&&<CheckCircle2 size={18}/>}</button>)}</div>}
              {revealed && <div className={`explanation ${selected===current.answer?'right':'wrong'}`}><strong>{selected===current.answer?'正解です':'不正解です'}</strong><p>{current.explanation}</p><small>出典・根拠：{current.source}</small></div>}
              <div className="quiz-actions">{!revealed ? <button className="primary-button" disabled={selected===null} onClick={answerOne}>回答を確定する</button> : <button className="primary-button" onClick={nextQuestion}>{index+1===queue.length?'終了する':'次の問題へ'} <ArrowRight size={17}/></button>}</div>
            </article>}
          </>}
          {mode === 'batch' && !batchSubmitted && <><div className="question-progress"><span>{queue.length}問まとめて解答</span><div className="progress-track"><span style={{width:'100%'}}/></div></div>
            {queue.map((q,qi)=><article className="question-card batch-card" key={q.id}><div className="question-meta"><span>{qi+1}. {q.category}</span></div><h2>{q.prompt}</h2><div className="choice-list">{(q.choices||[]).map((c,i)=><button key={c} className={`choice ${batchSelected[q.id]===i?'selected':''}`} onClick={()=>setBatchSelected(s=>({...s,[q.id]:i}))}><span className="choice-letter">{String.fromCharCode(65+i)}</span><span>{c}</span></button>)}</div></article>)}
            <button className="primary-button full" onClick={submitBatch}>回答を採点する（{Object.keys(batchSelected).length}/{queue.length}）</button>
          </>}
          {mode === 'batch' && batchSubmitted && <div className="results-card"><div className="result-icon"><Trophy/></div><div className="eyebrow">RESULT</div><h1>{sessionAnswers.filter(a=>a.correct).length} / {sessionAnswers.length} 問正解</h1><p>正答率 {sessionAnswers.length?Math.round(sessionAnswers.filter(a=>a.correct).length/sessionAnswers.length*100):0}%</p>{sessionAnswers.map(a=><div className="result-row" key={a.q.id}><span className={a.correct?'result-correct':'result-wrong'}>{a.correct?'正解':'復習'}</span><div><strong>{a.q.prompt}</strong><p>{a.q.explanation}</p></div></div>)}<button className="primary-button full" onClick={()=>{setScreen('home');setQueue([]);setNotice('採点結果は学習履歴に保存されました。')}}>ホームへ戻る</button></div>}
        </section>
      )}

      {screen === 'stats' && <section className="page"><div className="page-title"><button className="back-button" onClick={()=>setScreen('home')}><ArrowLeft size={17}/> 戻る</button><h1>学習分析</h1><p>回答履歴から現在の理解度を確認します。</p></div><div className="stats-grid"><div className="stat-card"><span>累計回答数</span><strong>{attempts.length}</strong></div><div className="stat-card"><span>累計正答率</span><strong>{accuracy}%</strong></div><div className="stat-card"><span>復習候補</span><strong>{wrongIds.size}</strong></div></div><div className="category-list">{countsByCategory.map(c=><div className="category-row" key={c.cat}><div className="category-name"><strong>{c.cat}</strong><span>{c.answered}回答 / {c.total}問登録</span></div><div className="progress-track"><span style={{width:`${c.accuracy ?? 0}%`}}/></div><b>{c.accuracy===null?'—':`${c.accuracy}%`}</b></div>)}</div><h2 className="subhead">最近の回答</h2><div className="history-list">{[...attempts].reverse().slice(0,20).map(a=>{const q=allQuestions.find(x=>x.id===a.questionId);return <div className="history-row" key={a.id}><span className={a.correct?'result-correct':'result-wrong'}>{a.correct?'正解':'不正解'}</span><div><strong>{q?.prompt||a.questionId}</strong><small>{new Date(a.answeredAt).toLocaleString('ja-JP')}</small></div></div>})}{!attempts.length&&<p className="empty">まだ回答履歴がありません。</p>}</div></section>}

      {screen === 'data' && <section className="page"><div className="page-title"><button className="back-button" onClick={()=>setScreen('home')}><ArrowLeft size={17}/> 戻る</button><h1>データ管理</h1><p>学習履歴はこのブラウザ内に保存されます。定期的にバックアップしてください。</p></div><div className="data-card"><Download/><div><strong>学習データをバックアップ</strong><p>問題データ・回答履歴・ブックマークをJSONファイルに保存します。</p><button className="secondary-button" onClick={downloadBackup}>バックアップをダウンロード</button></div></div><div className="data-card"><FileUp/><div><strong>バックアップを復元</strong><p>以前に保存したJSONバックアップを読み込みます。既存データに追加・統合します。</p><label className="file-button">バックアップを選択<input type="file" accept="application/json,.json" onChange={e=>restoreBackup(e.target.files?.[0])}/></label></div></div><div className="data-card"><ListChecks/><div><strong>問題データを追加</strong><p>JSON形式の問題データを読み込みます。正答と解説、カテゴリを必ず確認してください。</p><label className="file-button">問題JSONを選択<input type="file" accept="application/json,.json" onChange={e=>loadQuestionFile(e.target.files?.[0])}/></label></div></div><div className="warning-note"><strong>注意</strong><p>この初期版の問題は動作確認用の独自作成サンプルです。公式過去問ではなく、試験範囲全体を網羅していません。法令・規格に関する実際の受験判断には、最新の公式資料で確認した問題データを使用してください。</p></div></section>}

      {screen === 'home' && <section className="page filters-section"><div className="section-heading"><h2>分野を指定して解く</h2></div><label className="select-label">出題分野<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><div className="segmented"><button className={mode==='one'?'on':''} onClick={()=>setMode('one')}>1問ずつ</button><button className={mode==='batch'?'on':''} onClick={()=>setMode('batch')}>まとめて解答</button></div><button className="primary-button full" onClick={()=>startPractice('all')}>この条件で演習を開始 <ArrowRight size={17}/></button></section>}
    </main>
    <nav className="bottom-nav"><button className={screen==='home'?'active':''} onClick={()=>setScreen('home')}><Home/><span>ホーム</span></button><button className={screen==='practice'?'active':''} onClick={()=>startPractice('all')}><BookOpen/><span>演習</span></button><button className={screen==='review'?'active':''} onClick={()=>startPractice('wrong')}><RotateCcw/><span>復習</span></button><button className={screen==='stats'?'active':''} onClick={()=>setScreen('stats')}><Activity/><span>分析</span></button><button className={screen==='data'?'active':''} onClick={()=>setScreen('data')}><Download/><span>データ</span></button></nav>
  </div>
}
