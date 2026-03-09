document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const magicInput = document.getElementById('magic-input');
    const magicBtn = document.getElementById('magic-btn');
    const form = document.getElementById('kaizen-form');
    const stepper = document.getElementById('stepper');
    const dots = document.querySelectorAll('.step-dot');
    const outputView = document.getElementById('output-view');
    const repOut = document.getElementById('rep-out');
    const lScore = document.getElementById('l-score');
    const auditList = document.getElementById('audit-list');

    let currentStep = 1;

    // --- Template Engine ---
    const scenarios = [
        {
            keywords: ['遠い', '歩行', '距離', '備品', '遠方', '取りに行く'],
            m: '台車の導入と定位置変更',
            t: '歩行距離短縮と運搬効率化',
            bg: '頻用備品保管場所と作業エリアの乖離。旧レイアウト踏襲による動線交差の発生。',
            prob: '備品取得に伴う歩行ロス（3分/回）。1日10回の往復に伴う30分/日の工数損失。',
            whys: ['備品置き場が作業位置から遠い', '旧レイアウトのまま稼働を継続', '作業エリア変更時の動線見直しプロセス欠落', '定期的な動線効率監査体制の不全', 'レイアウト変更時における標準手順書の形骸化'],
            fourM: 'Method',
            cust: 'ワーカー',
            voice: '移動負荷低減。本来の作業への集中力維持および人的資本の損耗防止。',
            b: 180, a: 30, f: 10, unit: 'sec',
            denominator: 20
        },
        {
            keywords: ['テープ', '剥', '開梱', '詰める', '見つからない'],
            m: 'シリコンフラップ治具の設置',
            t: 'テープ剥離動作の円滑化',
            bg: '梱包用テープ端部のロール固着。開始位置探索によるリズム停滞の頻発。',
            prob: '1回あたり5秒の探索動作発生。心理的ストレス蓄積に伴う品質エラーリスク。',
            whys: ['テープがロールに密着', '剥離面が平滑で端部が不明瞭', '端部折り返し手順の定着不全', '物理的段差を生成する治具の未配置', '現場の使い勝手を考慮した備品調達プロセスの不備'],
            fourM: 'Material',
            cust: '開梱担当',
            voice: '探索動作の排除。スムーズな作業開始によるスルーブットの安定化。',
            b: 5.0, a: 0.5, f: 200, unit: 'sec',
            denominator: 50
        },
        {
            keywords: ['重い', '腰', 'スライダー', '積み替え', '持ち上げる', '負担'],
            m: '自作段ボールスライダー配備',
            t: '重量物積載のエルゴノミクス改善',
            bg: '10kg以上の重量物の持ち上げ。コンベア・パレット間の高低差による負荷。',
            prob: '不自然な姿勢（持ち上げ）による腰部負荷。疲労蓄積に伴う作業速度の逓減。',
            whys: ['垂直方向の持ち上げ動作が必要', 'コンベアとパレットに段差が存在', '滑走移動を可能にする設備の欠如', 'エルゴノミクスに基づく治具設計思想の不足', '安全姿勢管理基準と現場実態の乖離'],
            fourM: 'Machine',
            cust: 'パレタイズ担当',
            voice: '身体的負荷の劇的改善。腰痛リスクの排除による長期的な生産性維持。',
            b: 25.0, a: 3.0, f: 120, unit: 'sec',
            denominator: 10
        },
        {
            keywords: ['探す', 'どこ', '行方不明', '散乱'],
            m: '備品影置き（シャドウボード）化',
            t: '備品探索時間の削減と5S徹底',
            bg: '共有備品（カッター・ペン等）の定位置未決。作業開始時の「探す」動作の常態化。',
            prob: '1回あたり30秒の探索動作。1日20回の発生により、チーム全体で大きな機会損失。',
            whys: ['備品の定位置が定義されていない', '「使ったら戻す」物理的制約がない', '備品管理のオーナーシップが不明確', '5S活動の評価指標への未反映', '標準化（Standardization）プロセスの機能不全'],
            fourM: 'Method',
            cust: 'ワーカー',
            voice: '「探す」ストレスからの解放。リズムを崩さず作業に没頭できる環境。',
            b: 30.0, a: 2.0, f: 20, unit: 'sec',
            denominator: 100
        },
        {
            keywords: ['間違い', 'ミス', '誤出荷', '判定'],
            m: '重量検版システム（ポカヨケ）導入',
            t: '誤同梱防止による出荷品質向上',
            bg: '類似商品の目視判定による誤出荷リスク。人為的ミスに依存する検品体制。',
            prob: '1万件に1件の誤出荷発生。資材ロスおよび顧客満足度低下に伴う再送コストの増大。',
            whys: ['目視のみの判定基準', '外装の酷似による認知限界', 'ダブルチェックの形骸化', 'ヒューマンエラーを前提とした防護策の欠如', 'Fail-safe設計思想の未導入'],
            fourM: 'Machine',
            cust: 'パッキング担当',
            voice: '判定の機械化による精神的負担の軽減。絶対的な品質担保への信頼。',
            b: 15.0, a: 2.0, f: 1000, unit: 'sec',
            denominator: 5
        }
    ];

    window.runSmartDraft = () => {
        const input = magicInput.value.trim();
        if (!input) return alert('キーワードを入力してください。');

        const match = scenarios.find(s => s.keywords.some(k => input.includes(k))) || scenarios[0];

        document.getElementById('measure').value = match.m;
        document.getElementById('target').value = match.t;
        document.getElementById('prob-bg').value = match.bg;
        document.getElementById('prob-main').value = match.prob;
        document.getElementById('four-m').value = match.fourM;
        document.getElementById('wb-customer').value = match.cust;
        document.getElementById('wb-voice').value = match.voice;

        for (let i = 1; i <= 5; i++) {
            document.getElementById(`why${i}`).value = match.whys[i - 1] || '';
        }

        document.getElementById('b-val').value = match.b;
        document.getElementById('a-val').value = match.a;
        document.getElementById('f-val').value = match.f;
        document.getElementById('unit-type').value = match.unit;

        alert('✨ プロフェッショナル下書きを生成しました。内容を確認し、適宜修正してください。');
        nextStep(2);
    };

    window.nextStep = (s) => {
        document.querySelectorAll('.glass-card').forEach(c => c.classList.add('hidden'));
        document.getElementById(`step-${s}`).classList.remove('hidden');
        dots.forEach((d, i) => d.classList.toggle('active', i < s));
        currentStep = s;
        window.scrollTo(0, 0);
    };

    window.finish = () => {
        const d = {
            measure: document.getElementById('measure').value,
            target: document.getElementById('target').value,
            probBg: document.getElementById('prob-bg').value,
            probMain: document.getElementById('prob-main').value,
            sol: document.getElementById('sol').value,
            fourM: document.getElementById('four-m').value,
            whys: [
                document.getElementById('why1').value,
                document.getElementById('why2').value,
                document.getElementById('why3').value,
                document.getElementById('why4').value,
                document.getElementById('why5').value
            ].filter(w => w.trim() !== ''),
            wbCustomer: document.getElementById('wb-customer').value,
            wbVoice: document.getElementById('wb-voice').value,
            b: parseFloat(document.getElementById('b-val').value),
            a: parseFloat(document.getElementById('a-val').value),
            f: parseInt(document.getElementById('f-val').value),
            cost: parseFloat(document.getElementById('cost').value) || 0,
            unit: document.getElementById('unit-type').value,
            wk: parseInt(document.getElementById('wk').value),
            denominator: parseInt(document.getElementById('denominator').value) || 1,
            rate: 1500
        };

        const res = generateFinalReport(d);
        repOut.textContent = res.txt;
        lScore.textContent = res.score;
        auditList.innerHTML = res.audit.map(a => `
            <div class="audit-item">
                <div class="audit-cat">${a.cat}</div>
                <div>
                    <span style="font-weight: 800; color: ${a.pts < 0 ? 'var(--error)' : 'var(--success)'};">${a.pts > 0 ? '+' : ''}${a.pts}pts</span>
                    <p style="margin-top:2px; opacity: 0.8;">${a.msg}</p>
                </div>
            </div>
        `).join('') || '<p style="font-size:0.8rem; opacity:0.5;">✅ すべての監査基準を満たしています。</p>';

        stepper.classList.add('hidden');
        document.getElementById('step-3').classList.add('hidden');
        outputView.classList.remove('hidden');
        window.scrollTo(0, 0);
    };

    function generateFinalReport(d) {
        const audit = [];
        let score = 95;

        // ROI Calculations (Amazon Standard 4-Step)
        // 1. Calculate Reduction Time
        const unitLabel = d.unit === 'min' ? '分' : '秒';
        const reductionPerTime = d.b - d.a;

        // 2. Convert to Hours
        const divisor = d.unit === 'min' ? 60 : 3600;
        const hoursPerTime = reductionPerTime / divisor;

        // 3. Convert to Money (1500 yen/hour)
        const yenPerTime = hoursPerTime * d.rate;

        // 4. Annual Conversion
        const annualSavings = Math.round(yenPerTime * d.f * 365);

        // Current Year (C)
        const weeksRemaining = 53 - d.wk;
        const thisYearSavings = Math.round((annualSavings / 52) * weeksRemaining);
        const netThisYear = thisYearSavings - d.cost;

        // Audit Logic
        if (d.whys.length < 5) {
            audit.push({ cat: "分析力", pts: -10, msg: "なぜなぜ分析が5段階未満。再発防止の徹底度に疑義あり。" });
            score -= 10;
        }

        const clean = (s) => s.trim().replace(/です|ます|である|だ|改善し|しました|解消し|しました/g, "").replace(/。+$/, "") + "。";

        const whyChain = d.whys.map((w, i) => `${i + 1}. ${w}`).join('\nなぜ？\n') +
            (d.whys.length > 0 ? '\n真因：' + d.whys[d.whys.length - 1] : '');

        const txt = `１，タイトル：${d.measure}による${d.target}の実現
２，現状：
${clean(d.probBg)}
３．問題：
${clean(d.probMain)}
（${d.b}${unitLabel}/回 ｘ ${d.f}回/日 ＝ ${Math.round((d.unit === 'min' ? d.b : d.b / 60) * d.f)}分/日の工数損失）
４、問題の真因：
４Ｍカテゴリー：${d.fourM}
${whyChain}
５，ワーキングバックワーズ：
${d.wbCustomer}の声：
「${clean(d.wbVoice.replace(/[「」]/g, ''))}」
６，実施した対策：
${clean(d.sol || d.measure + "の実施による抜本的解決。")}
７、効果測定：
1. 削減時間の算出
   ${d.b}${unitLabel}/回（前） - ${d.a}${unitLabel}/回（後） = ${reductionPerTime.toFixed(2)}${unitLabel}/回
2. 時間への換算
   ${reductionPerTime.toFixed(2)}${unitLabel}/回 ÷ ${divisor} = ${hoursPerTime.toFixed(4)}時間/回
3. 人件費換算（一律 1,500円）
   ${hoursPerTime.toFixed(4)}時間/回 × 1,500円 = ${yenPerTime.toFixed(2)}円/回
4. 年間換算
   ${yenPerTime.toFixed(2)}円/回 × ${d.f}回 × 365日 = ${annualSavings.toLocaleString()}円/年

（以下、定性的効果）
安全性：リスク低減による作業の安全性向上
5S環境：定位置管理による職場環境の最適化
品質：手順標準化に伴うエラー発生率の抑制

（補足：当FC内の全${d.denominator}箇所へ水平展開することで、年間約${Math.round(annualSavings * d.denominator / 10000).toLocaleString()}万円の削減寄与が可能。）

８，1年間削減額 (A)：${annualSavings.toLocaleString()}円
９，効果開始 (B)：WK${d.wk}
10, 本年削減額 (C)：${thisYearSavings.toLocaleString()}円
11, カイゼン費用 (D)：${d.cost.toLocaleString()}円
12, 本年実削減額 (E)：${netThisYear.toLocaleString()}円`;

        return { txt, score, audit };
    }

    window.copyReport = () => {
        navigator.clipboard.writeText(repOut.textContent).then(() => {
            alert('レポートをコピーしました。');
        });
    };

    window.restart = () => {
        outputView.classList.add('hidden');
        stepper.classList.remove('hidden');
        nextStep(1);
    };
});
