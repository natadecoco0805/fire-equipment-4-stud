export type Question = {
  id: string
  category: '法令（共通）' | '法令（類別）' | '基礎的知識（電気）' | '構造・機能・工事・整備' | '規格' | '鑑別' | '製図'
  kind: '過去問参考' | 'オリジナル類題'
  type: 'choice' | 'numeric' | 'written'
  prompt: string
  choices?: string[]
  imageUrl?: string
  imageUrls?: string[]
  answer: number | string
  explanation: string
  source: string
  verified: boolean
  answerStatus?: 'verified' | 'unconfirmed' | 'needs_review'
}

export const questions: Question[] = [
  {id:'q001',category:'基礎的知識（電気）',kind:'オリジナル類題',type:'choice',prompt:'抵抗値が一定の抵抗器に加える電圧を2倍にしたとき、流れる電流はどうなるか。',choices:['半分になる','変わらない','2倍になる','4倍になる'],answer:2,explanation:'オームの法則 I=V/R より、抵抗値が一定なら電圧を2倍にすると電流も2倍になる。',source:'独自作成・基礎知識（オームの法則）',verified:true},
  {id:'q002',category:'基礎的知識（電気）',kind:'オリジナル類題',type:'choice',prompt:'抵抗10Ωに20Vを加えたときの電流として正しいものはどれか。',choices:['0.5A','2A','10A','200A'],answer:1,explanation:'I=V/R=20/10=2A。',source:'独自作成・計算問題',verified:true},
  {id:'q003',category:'基礎的知識（電気）',kind:'オリジナル類題',type:'choice',prompt:'交流回路における周波数の単位はどれか。',choices:['ボルト（V）','アンペア（A）','ヘルツ（Hz）','オーム（Ω）'],answer:2,explanation:'周波数の単位はヘルツ（Hz）。1Hzは1秒間に1周期を表す。',source:'独自作成・電気基礎',verified:true},
  {id:'q004',category:'構造・機能・工事・整備',kind:'オリジナル類題',type:'choice',prompt:'自動火災報知設備において、火災の発生を感知する機器はどれか。',choices:['受信機','感知器','発信機','音響装置'],answer:1,explanation:'感知器は火災による熱、煙などを感知する。受信機は信号を受信・表示する機器。',source:'独自作成・設備構成',verified:true},
  {id:'q005',category:'構造・機能・工事・整備',kind:'オリジナル類題',type:'choice',prompt:'自動火災報知設備で、火災信号などを受信し、火災区域等を表示する中心的な機器はどれか。',choices:['受信機','差動式スポット型感知器','地区音響装置','終端器'],answer:0,explanation:'受信機は感知器や発信機などからの信号を受信し、火災表示や警報などを行う。',source:'独自作成・設備構成',verified:true},
  {id:'q006',category:'構造・機能・工事・整備',kind:'オリジナル類題',type:'choice',prompt:'差動式スポット型熱感知器の基本的な作動原理に最も関係するものはどれか。',choices:['周囲温度が一定値を超えたことだけ','温度の上昇率','煙粒子による光の散乱だけ','炎の紫外線だけ'],answer:1,explanation:'差動式は温度の上昇率を利用する。一定温度で作動する方式とは区別する。',source:'独自作成・感知器の原理',verified:true},
  {id:'q007',category:'構造・機能・工事・整備',kind:'オリジナル類題',type:'choice',prompt:'定温式スポット型熱感知器の作動原理として最も適切なものはどれか。',choices:['温度上昇率が一定値に達する','周囲温度が所定の温度に達する','煙による光の減衰を検出する','手動操作のみで作動する'],answer:1,explanation:'定温式は周囲温度が所定の温度に達したときに作動する。',source:'独自作成・感知器の原理',verified:true},
  {id:'q008',category:'規格',kind:'オリジナル類題',type:'choice',prompt:'自動火災報知設備の機器を選定・設置する際の基本方針として適切なものはどれか。',choices:['価格だけで決める','設置場所の環境や適用される技術基準を確認する','すべて同じ型式でよい','メーカーの説明書は確認しない'],answer:1,explanation:'機器の選定・設置は、設置環境、用途、適用される法令・規格、認定・仕様等を確認して行う。',source:'独自作成・設置実務の基本',verified:true},
  {id:'q009',category:'法令（共通）',kind:'オリジナル類題',type:'choice',prompt:'消防用設備等の設置・維持について判断するとき、最も適切な対応はどれか。',choices:['古い参考書だけで判断する','建物の用途だけで常に結論を出す','適用される最新の法令・政令・省令・告示を確認する','インターネット掲示板だけを根拠にする'],answer:2,explanation:'法令は改正されるため、適用時点の公式な法令・基準を確認する必要がある。個別建物の判断は用途・規模・構造等の条件も関係する。',source:'独自作成・法令調査の基本',verified:true},
  {id:'q010',category:'法令（類別）',kind:'オリジナル類題',type:'choice',prompt:'甲種第4類の学習範囲として中心となる設備はどれか。',choices:['屋内消火栓設備','自動火災報知設備などの警報設備','避難器具','泡消火設備'],answer:1,explanation:'甲種第4類は自動火災報知設備、ガス漏れ火災警報設備、消防機関へ通報する火災報知設備などが中心となる。受験時には最新の試験案内で対象範囲を確認する。',source:'独自作成・試験範囲の概略',verified:true},
  {id:'q011',category:'鑑別',kind:'オリジナル類題',type:'choice',prompt:'機器の外観・端子表示・型式表示を確認する問題で、最初に行うべきこととして適切なものはどれか。',choices:['表示を無視して外観だけで決める','図記号や端子表示、仕様を照合する','すべて同じ端子配列と仮定する','電源を入れてから仕様を調べる'],answer:1,explanation:'鑑別では外観だけでなく、表示・端子・仕様などを照合する。実際の機器を扱う場合は安全手順とメーカー資料に従う。',source:'独自作成・鑑別の基礎',verified:true},
  {id:'q012',category:'製図',kind:'オリジナル類題',type:'choice',prompt:'自動火災報知設備の系統図・平面図を確認するとき、最も適切な考え方はどれか。',choices:['凡例を確認せず記号だけで推測する','凡例、機器記号、配線、区域の対応を順に確認する','図面の縮尺は常に無関係とする','機器配置だけ確認し配線を見ない'],answer:1,explanation:'製図では凡例と機器記号、配線、区域や受信機との対応を整理して読む。実際の設置要件は最新の基準に照らして判断する。',source:'独自作成・図面読解の基礎',verified:true}
]
