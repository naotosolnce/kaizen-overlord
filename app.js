document.addEventListener('DOMContentLoaded', () => {
    // --- Manual Input Mode ---
    const stepper = document.getElementById('stepper');
    const dots = document.querySelectorAll('.step-dot');
    const outputView = document.getElementById('output-view');
    const repOut = document.getElementById('rep-out');
    const lScore = document.getElementById('l-score');
    const auditList = document.getElementById('audit-list');

    let currentStep = 1;

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
