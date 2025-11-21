// Caesar Cipher Module - Enhanced
registerCipher({
    id: 'caesar',
    name: '凯撒密码',
    description: '古典替换密码，通过将字母表中的字母移动固定位数来加密',
    type: '古典密码',
    color: '#00d4ff',
    keyPlaceholder: '请输入位移数字 (如: 3)',
    example: { text: 'HELLO WORLD', key: '3' },

    async encrypt(plaintext, key) {
        const shift = parseInt(key) || 3;
        let result = '';

        // Step 1: Show input with example
        await addStep(1, '输入分析', `
            明文: ${createLightPoint(plaintext)}
            <br>位移量: ${createLightPoint(shift, 'highlight')}
            <br><br><span style="color: #666; font-size: 0.85rem;">示例: "HELLO" 位移3 → "KHOOR"</span>
        `);

        await addStepArrow();

        // Step 2: Show alphabet mapping
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const shiftedAlphabet = alphabet.slice(shift) + alphabet.slice(0, shift);

        await addStep(2, '字母表映射', `
            <div style="margin-bottom: 10px;">原始: ${alphabet.split('').map(c => createLightPoint(c)).join('')}</div>
            <div class="arrow-down">↓ 位移 ${shift} 位</div>
            <div>映射: ${shiftedAlphabet.split('').map(c => createLightPoint(c, 'highlight')).join('')}</div>
        `);

        await addStepArrow();

        // Step 3: Process each character with detailed animation
        let stepContent = '<div style="display: grid; gap: 12px;">';
        const chars = plaintext.split('');

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            let encryptedChar = char;

            if (/[a-zA-Z]/.test(char)) {
                const isUpper = char === char.toUpperCase();
                const base = isUpper ? 65 : 97;
                const charCode = char.charCodeAt(0);
                const originalPos = charCode - base;
                const newPos = (originalPos + shift) % 26;
                const newCode = newPos + base;
                encryptedChar = String.fromCharCode(newCode);

                stepContent += `<div class="data-flow">
                    ${createLightPoint(char)}
                    <span class="arrow">→</span>
                    位置 ${createLightPoint(originalPos)}
                    <span class="arrow">→</span>
                    (${originalPos}+${shift}) mod 26 = ${createLightPoint(newPos, 'highlight')}
                    <span class="arrow">→</span>
                    ${createLightPoint(encryptedChar, 'result')}
                </div>`;
            } else {
                stepContent += `<div class="data-flow">
                    ${createLightPoint(char)}
                    <span class="arrow">→</span>
                    <span style="color: #666;">保持不变</span>
                    <span class="arrow">→</span>
                    ${createLightPoint(char, 'result')}
                </div>`;
            }

            result += encryptedChar;
        }
        stepContent += '</div>';

        await addStep(3, '逐字符加密过程', stepContent);

        await addStepArrow();

        // Step 4: Verify encryption
        let verifyResult = '';
        for (let i = 0; i < result.length; i++) {
            const char = result[i];
            if (/[a-zA-Z]/.test(char)) {
                const isUpper = char === char.toUpperCase();
                const base = isUpper ? 65 : 97;
                const charCode = char.charCodeAt(0);
                const newCode = ((charCode - base - shift + 26) % 26) + base;
                verifyResult += String.fromCharCode(newCode);
            } else {
                verifyResult += char;
            }
        }
        const verified = verifyResult === plaintext;

        await addStep(4, '加密完成 & 校验', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(plaintext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
            <br>
            <div style="margin-top: 15px; padding: 10px; border-radius: 4px; background: ${verified ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,0,0.1)'};">
                <span style="color: ${verified ? '#00ff88' : '#ff2f7b'};">
                    ${verified ? '✓ 校验通过: 逆运算还原成功' : '✗ 校验失败'}
                </span>
            </div>
        `);

        showResult(result);
    },

    async decrypt(ciphertext, key) {
        const shift = parseInt(key) || 3;
        let result = '';

        // Step 1: Show input
        await addStep(1, '输入分析', `
            密文: ${createLightPoint(ciphertext)}
            <br>位移量: ${createLightPoint(shift, 'highlight')}
            <br><br><span style="color: #666; font-size: 0.85rem;">解密 = 加密的逆操作</span>
        `);

        await addStepArrow();

        // Step 2: Show reverse mapping
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const reverseShift = 26 - shift;

        await addStep(2, '反向映射', `
            解密位移: 26 - ${shift} = ${createLightPoint(reverseShift, 'highlight')}
            <br><br>或使用公式: (位置 - ${shift} + 26) mod 26
        `);

        await addStepArrow();

        // Step 3: Process each character
        let stepContent = '<div style="display: grid; gap: 12px;">';
        const chars = ciphertext.split('');

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            let decryptedChar = char;

            if (/[a-zA-Z]/.test(char)) {
                const isUpper = char === char.toUpperCase();
                const base = isUpper ? 65 : 97;
                const charCode = char.charCodeAt(0);
                const originalPos = charCode - base;
                const newPos = (originalPos - shift + 26) % 26;
                const newCode = newPos + base;
                decryptedChar = String.fromCharCode(newCode);

                stepContent += `<div class="data-flow">
                    ${createLightPoint(char, 'highlight')}
                    <span class="arrow">→</span>
                    (${originalPos}-${shift}+26) mod 26 = ${createLightPoint(newPos)}
                    <span class="arrow">→</span>
                    ${createLightPoint(decryptedChar, 'result')}
                </div>`;
            } else {
                stepContent += `<div class="data-flow">
                    ${createLightPoint(char)}
                    <span class="arrow">→</span>
                    ${createLightPoint(char, 'result')}
                </div>`;
            }

            result += decryptedChar;
        }
        stepContent += '</div>';

        await addStep(3, '逐字符解密过程', stepContent);

        await addStepArrow();

        // Step 4: Final result
        await addStep(4, '解密完成', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(ciphertext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
        `);

        showResult(result);
    }
});
