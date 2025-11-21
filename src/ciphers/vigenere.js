// Vigenere Cipher Module - Enhanced
registerCipher({
    id: 'vigenere',
    name: '维吉尼亚密码',
    description: '多表替换密码，使用关键词来决定字母的位移量',
    type: '古典密码',
    color: '#7b2fff',
    keyPlaceholder: '请输入关键词 (如: KEY)',
    example: { text: 'ATTACKATDAWN', key: 'LEMON' },

    async encrypt(plaintext, key) {
        if (!key) {
            alert('维吉尼亚密码需要关键词');
            return;
        }

        const keyword = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!keyword) {
            alert('关键词必须包含字母');
            return;
        }

        let result = '';

        // Step 1: Show input with example
        await addStep(1, '输入分析', `
            明文: ${createLightPoint(plaintext)}
            <br>关键词: ${createLightPoint(keyword, 'highlight')}
            <br><br><span style="color: #666; font-size: 0.85rem;">示例: "ATTACK" + "LEMON" → "LXFOPV"</span>
        `);

        await addStepArrow();

        // Step 2: Show keyword expansion
        const cleanPlaintext = plaintext.replace(/[^a-zA-Z]/g, '');
        let expandedKey = '';
        for (let i = 0; i < cleanPlaintext.length; i++) {
            expandedKey += keyword[i % keyword.length];
        }

        await addStep(2, '关键词扩展', `
            <div style="margin-bottom: 15px;">
                明文: ${cleanPlaintext.split('').map(c => createLightPoint(c)).join('')}
            </div>
            <div class="arrow-down">↓ 重复关键词</div>
            <div style="margin-top: 15px;">
                密钥: ${expandedKey.split('').map(c => createLightPoint(c, 'highlight')).join('')}
            </div>
        `);

        await addStepArrow();

        // Step 3: Show Vigenere table concept
        await addStep(3, '维吉尼亚方阵原理', `
            <div style="margin-bottom: 10px;">加密公式: ${createLightPoint('C = (P + K) mod 26', 'highlight')}</div>
            <br>每个字母转换为数字 (A=0, B=1, ..., Z=25)
            <br>明文字母 + 密钥字母 = 密文字母
        `);

        await addStepArrow();

        // Step 4: Process each character with detailed calculation
        let stepContent = '<div style="display: grid; gap: 10px;">';
        let keyIndex = 0;

        for (let i = 0; i < plaintext.length; i++) {
            const char = plaintext[i];
            let encryptedChar = char;

            if (/[a-zA-Z]/.test(char)) {
                const isUpper = char === char.toUpperCase();
                const pChar = char.toUpperCase();
                const kChar = keyword[keyIndex % keyword.length];
                const pVal = pChar.charCodeAt(0) - 65;
                const kVal = kChar.charCodeAt(0) - 65;
                const cVal = (pVal + kVal) % 26;
                encryptedChar = String.fromCharCode(cVal + (isUpper ? 65 : 97));

                stepContent += `<div class="data-flow">
                    ${createLightPoint(char)} (${pVal})
                    <span class="arrow">+</span>
                    ${createLightPoint(kChar, 'highlight')} (${kVal})
                    <span class="arrow">=</span>
                    (${pVal}+${kVal}) mod 26 = ${cVal}
                    <span class="arrow">→</span>
                    ${createLightPoint(encryptedChar, 'result')}
                </div>`;
                keyIndex++;
            } else {
                stepContent += `<div class="data-flow">
                    ${createLightPoint(char)} <span style="color: #666;">→ 保持</span>
                </div>`;
            }

            result += encryptedChar;
        }
        stepContent += '</div>';

        await addStep(4, '逐字符加密过程', stepContent);

        await addStepArrow();

        // Step 5: Verify and final result
        // Decrypt to verify
        let verifyResult = '';
        let vKeyIndex = 0;
        for (let i = 0; i < result.length; i++) {
            const char = result[i];
            if (/[a-zA-Z]/.test(char)) {
                const isUpper = char === char.toUpperCase();
                const cVal = char.toUpperCase().charCodeAt(0) - 65;
                const kVal = keyword[vKeyIndex % keyword.length].charCodeAt(0) - 65;
                const pVal = (cVal - kVal + 26) % 26;
                verifyResult += String.fromCharCode(pVal + (isUpper ? 65 : 97));
                vKeyIndex++;
            } else {
                verifyResult += char;
            }
        }
        const verified = verifyResult === plaintext;

        await addStep(5, '加密完成 & 校验', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(plaintext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
            <br>
            <div style="margin-top: 15px; padding: 10px; border-radius: 4px; background: ${verified ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,0,0.1)'};">
                <span style="color: ${verified ? '#00ff88' : '#ff2f7b'};">
                    ${verified ? '✓ 校验通过: (C - K + 26) mod 26 = P' : '✗ 校验失败'}
                </span>
            </div>
        `);

        showResult(result);
    },

    async decrypt(ciphertext, key) {
        if (!key) {
            alert('维吉尼亚密码需要关键词');
            return;
        }

        const keyword = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!keyword) {
            alert('关键词必须包含字母');
            return;
        }

        let result = '';

        // Step 1: Show input
        await addStep(1, '输入分析', `
            密文: ${createLightPoint(ciphertext)}
            <br>关键词: ${createLightPoint(keyword, 'highlight')}
        `);

        await addStepArrow();

        // Step 2: Show keyword expansion
        const cleanCiphertext = ciphertext.replace(/[^a-zA-Z]/g, '');
        let expandedKey = '';
        for (let i = 0; i < cleanCiphertext.length; i++) {
            expandedKey += keyword[i % keyword.length];
        }

        await addStep(2, '关键词扩展', `
            <div style="margin-bottom: 15px;">
                密文: ${cleanCiphertext.split('').map(c => createLightPoint(c)).join('')}
            </div>
            <div class="arrow-down">↓</div>
            <div style="margin-top: 15px;">
                密钥: ${expandedKey.split('').map(c => createLightPoint(c, 'highlight')).join('')}
            </div>
        `);

        await addStepArrow();

        // Step 3: Show decryption formula
        await addStep(3, '解密公式', `
            ${createLightPoint('P = (C - K + 26) mod 26', 'highlight')}
        `);

        await addStepArrow();

        // Step 4: Process each character
        let stepContent = '<div style="display: grid; gap: 10px;">';
        let keyIndex = 0;

        for (let i = 0; i < ciphertext.length; i++) {
            const char = ciphertext[i];
            let decryptedChar = char;

            if (/[a-zA-Z]/.test(char)) {
                const isUpper = char === char.toUpperCase();
                const cChar = char.toUpperCase();
                const kChar = keyword[keyIndex % keyword.length];
                const cVal = cChar.charCodeAt(0) - 65;
                const kVal = kChar.charCodeAt(0) - 65;
                const pVal = (cVal - kVal + 26) % 26;
                decryptedChar = String.fromCharCode(pVal + (isUpper ? 65 : 97));

                stepContent += `<div class="data-flow">
                    ${createLightPoint(char, 'highlight')} (${cVal})
                    <span class="arrow">-</span>
                    ${createLightPoint(kChar, 'highlight')} (${kVal})
                    <span class="arrow">=</span>
                    (${cVal}-${kVal}+26) mod 26 = ${pVal}
                    <span class="arrow">→</span>
                    ${createLightPoint(decryptedChar, 'result')}
                </div>`;
                keyIndex++;
            } else {
                stepContent += `<div class="data-flow">
                    ${createLightPoint(char)} <span style="color: #666;">→ 保持</span>
                </div>`;
            }

            result += decryptedChar;
        }
        stepContent += '</div>';

        await addStep(4, '逐字符解密过程', stepContent);

        await addStepArrow();

        // Step 5: Final result
        await addStep(5, '解密完成', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(ciphertext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
        `);

        showResult(result);
    }
});
