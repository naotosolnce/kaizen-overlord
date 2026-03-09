document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kaizen-form');
    const advancedToggle = document.getElementById('toggle-advanced');
    const advancedFields = document.getElementById('advanced-fields');
    const outputSection = document.getElementById('output-section');
    const reportOutput = document.getElementById('report-output');
    const submitBtn = form.querySelector('button[type="submit"]');

    // UI State
    advancedToggle.addEventListener('click', () => {
        advancedFields.classList.toggle('hidden');
        advancedToggle.textContent = advancedFields.classList.contains('hidden') 
            ? '詳細設定を表示 (DEI, Sustainability, Scaling)' 
            : '詳細設定を隠す';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = '生成中...';
        submitBtn.querySelector('.loader-ring').classList.remove('hidden');

        // Simulate "Thinking" like an Overlord
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const data = {
                subject: document.getElementById('target-subject').value,
                problem: document.getElementById('problem-fragment').value,
                solution: document.getElementById('solution-fragment').value,
                before: document.getElementById('unknown-before').checked ? null : parseFloat(document.getElementById('before-val').value),
                after: document.getElementById('unknown-after').checked ? null : parseFloat(document.getElementById('after-val').value),
                frequency: document.getElementById('unknown-frequency').checked ? null : parseInt(document.getElementById('frequency').value),
                denominator: parseInt(document.getElementById('denominator').value),
                maintenance: parseInt(document.getElementById('maintenance-cost').value),
                wk: getWeekNumber(new Date())
            };

            const result = generateOverlordReport(data);
            reportOutput.textContent = result.report;
            
            // Handle missing info UI
            const missingSection = document.getElementById('missing-info-section');
            const missingList = document.getElementById('missing-info-list');
            
            if (result.missingItems.length > 0) {
                missingList.innerHTML = result.missingItems.map(item => `<li>${item}</li>`).join('');
                missingSection.classList.remove('hidden');
            } else {
                missingSection.classList.add('hidden');
            }

            outputSection.classList.remove('hidden');
            outputSection.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            console.error(err);
            alert('生成中にエラーが発生しました。入力内容を確認してください。');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = '報告書を自動生成する';
            submitBtn.querySelector('.loader-ring').classList.add('hidden');
        }
    });

    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    function generateOverlordReport(d) {
        const missingItems = [];
        const placeholder = '[数値入力待ち]';
        
        const overhead = 0.5; // Default IE overhead
        
        // Dynamic Value Calculation with optional nulls
        const b = d.before !== null ? d.before : null;
        const a = d.after !== null ? d.after : null;
        const f = d.frequency !== null ? d.frequency : null;

        let netReduction = placeholder;
        let a_savings = placeholder;
        let c_savings = placeholder;
        let e_savings = placeholder;

        if (b !== null && a !== null) {
            const net = Math.max(0.1, b - a - overhead);
            netReduction = net.toFixed(1);
            if (f !== null) {
                const total_a = Math.round((net / 3600) * 1500 * f * 365);
                a_savings = total_a.toLocaleString() + '円';
                const weeksLeft = 53 - d.wk;
                const total_c = Math.round((total_a / 52) * weeksLeft);
                c_savings = total_c.toLocaleString() + '円';
                e_savings = (total_c - d.maintenance).toLocaleString() + '円';
            }
        }

        if (b === null) missingItems.push('改善前の正確な作業サイクルタイム（秒/回）の計測');
        if (a === null) missingItems.push('改善後の期待される作業サイクルタイム（秒/回）の定義');
        if (f === null) missingItems.push('対象工程の1日あたりの平均発生頻度（回/日）の調査');

        // Clean up fragmented notes (Simulated Natural Language Hardening)
        const hardenedProblem = nominalize(d.problem);
        const hardenedSolution = nominalize(d.solution);

        const report = `１，タイトル：${d.subject}の最適化による作業サイクルタイムの短縮

２，現状：
${d.subject}に関連する工程において、${d.problem}に起因する非効率が発生している状態。

３．問題：
${hardenedProblem}。1回あたり${b !== null ? b : placeholder}秒の動作停滞を観測。
（${b !== null ? b : placeholder}秒/回 ｘ ${f !== null ? f : placeholder}回/日 ＝ ${b !== null && f !== null ? Math.round(b * f / 60) : placeholder}分/日の工数損失）
また、作業者の集中力阻害に伴う品質エラーおよび定着率低下のリスク内在。

４、問題の真因：
なぜ？：${d.problem}を許容する物理的構成の存在。
なぜ？：${d.subject}導入時の安全・効率基準における「動的最適化メカニズム」の欠落。
真因：4MのMethod（管理方法）における、特定条件下での稼働ロスを防止する標準プロセスの不全。

５，ワーキングバックワーズ：
未来のワーカーの声：
「${d.subject}の改善により、以前感じていた${d.problem}への心理的不安が消失しました。作業リズムの維持が容易となり、人的資本の損耗を防ぎつつ、プロフェッショナルとして業務に専念できる環境を高く評価しています。」

６，実施した対策：
${hardenedSolution}の実施。
（対策実施日：WK${d.wk}、実施者：Kaizen App User）
Before：${d.problem}に伴う動作停滞。
After：対策実施による動作の円滑化および物理的干渉の排除。
【Fail-safe】：予期せぬ停止時も、手動介入が即座に可能な二次安全手順の確保。

７、効果測定：
・総削減時間：${b !== null ? b : placeholder}秒 ➡ ${a !== null ? a : placeholder}秒
・オーバーヘッド（付随動作）：+${overhead}秒
・純減（Net Reduction）：${netReduction}秒/個（IE算定値）
・保守コスト：年間 ${d.maintenance.toLocaleString()}円（電力・点検工数含む）
${netReduction}秒/個 ÷ 3600 ｘ 1500円 ｘ ${f !== null ? f : placeholder}回 ｘ 365日 ＝ ${a_savings}
（補足：当FC内の全${d.denominator}箇所へ水平展開することで、年間約${a_savings !== placeholder ? Math.round(parseInt(a_savings.replace(/,/g, '')) * d.denominator / 10000).toLocaleString() : placeholder}万円の削減寄与が可能。）

８，1年間で削減できる金額 (A)：${a_savings}
９，カイゼンの効果開始週(B)：WK${d.wk}
10, 本年削減金額 (C)：${c_savings}
１１，カイゼン費用 (D)：${d.maintenance.toLocaleString()}円
１２，本年度実削減金額 (E)：${e_savings}`;

        return { report, missingItems };
    }

    function nominalize(str) {
        // Simple mock of Amazon-style nominalization (ends with noun)
        let processed = str.replace(/です|ます|だ|である/g, '');
        if (!processed.endsWith('。')) processed += '。';
        return processed + 'それに伴う作業遅延、および安全上の懸念の解決。';
    }

    // Copy to clipboard
    document.getElementById('copy-btn').addEventListener('click', () => {
        const text = reportOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('クリップボードにコピーしました。');
        });
    });
});
