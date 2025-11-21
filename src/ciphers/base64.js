// Base64 Encoding Module - Enhanced
registerCipher({
    id: 'base64',
    name: 'Base64 编码',
    description: '将二进制数据转换为ASCII字符串的编码方式',
    type: '编码',
    color: '#ff9500',
    keyPlaceholder: 'Base64不需要密钥',
    example: { text: 'Hello', key: '' },

    async encrypt(plaintext, key) {
        // Step 1: Show input
        await addStep(1, '输入文本', `
            原文: ${createLightPoint(plaintext)}
            <br>长度: ${createLightPoint(plaintext.length + ' 字符')}
            <br><br><span style="color: #666; font-size: 0.85rem;">示例: "Man" → "TWFu"</span>
        `);

        await addStepArrow();

        // Step 2: Convert to binary with highlighting
        let binaryStr = '';
        const binaryArray = [];
        let binaryContent = '<div style="display: grid; gap: 8px;">';

        for (let i = 0; i < plaintext.length; i++) {
            const charCode = plaintext.charCodeAt(i);
            const binary = charCode.toString(2).padStart(8, '0');
            binaryArray.push(binary);
            binaryStr += binary;

            binaryContent += `<div class="data-flow">
                ${createLightPoint(plaintext[i])}
                <span class="arrow">→</span>
                ASCII ${createLightPoint(charCode)}
                <span class="arrow">→</span>
                ${createLightPoint(binary, 'highlight')}
            </div>`;
        }
        binaryContent += '</div>';

        await addStep(2, '转换为8位二进制 (ASCII)', binaryContent);

        await addStepArrow();

        // Step 3: Split into 6-bit groups
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        // Pad to make length divisible by 6
        const originalLen = binaryStr.length;
        while (binaryStr.length % 6 !== 0) {
            binaryStr += '0';
        }

        const groups = [];
        for (let i = 0; i < binaryStr.length; i += 6) {
            groups.push(binaryStr.substr(i, 6));
        }

        await addStep(3, '重组为6位组', `
            <div style="margin-bottom: 10px;">
                原始二进制 (${originalLen}位): ${binaryArray.map(b => createLightPoint(b)).join('')}
            </div>
            <div class="arrow-down">↓ 每6位一组</div>
            <div style="margin-top: 10px;">
                6位分组: ${groups.map(g => createLightPoint(g, 'highlight')).join(' ')}
            </div>
            ${binaryStr.length > originalLen ? `<br><span style="color: #666; font-size: 0.85rem;">补充了 ${binaryStr.length - originalLen} 个0</span>` : ''}
        `);

        await addStepArrow();

        // Step 4: Convert to Base64 characters
        let result = '';
        let mappingContent = '<div style="display: grid; gap: 8px;">';

        for (const group of groups) {
            const index = parseInt(group, 2);
            const char = base64Chars[index];
            result += char;

            mappingContent += `<div class="data-flow">
                ${createLightPoint(group)}
                <span class="arrow">→</span>
                索引 ${createLightPoint(index)}
                <span class="arrow">→</span>
                ${createLightPoint(char, 'result')}
            </div>`;
        }
        mappingContent += '</div>';

        await addStep(4, '映射到Base64字符表', mappingContent);

        await addStepArrow();

        // Step 5: Add padding
        const padding = (3 - (plaintext.length % 3)) % 3;
        const paddedResult = result + '='.repeat(padding);

        if (padding > 0) {
            await addStep(5, '添加填充字符', `
                原始长度: ${plaintext.length} 字节
                <br>需要填充: ${createLightPoint(padding + ' 个 "="', 'highlight')}
                <br><br><span style="color: #666; font-size: 0.85rem;">Base64要求输入长度为3的倍数</span>
            `);

            await addStepArrow();
        }

        // Final result
        await addStep(padding > 0 ? 6 : 5, '编码完成', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(plaintext)}
                <span class="arrow">→</span>
                ${createLightPoint(paddedResult, 'result')}
            </div>
        `);

        showResult(paddedResult);
    },

    async decrypt(ciphertext, key) {
        // Step 1: Show input
        await addStep(1, '输入Base64', `
            密文: ${createLightPoint(ciphertext)}
        `);

        await addStepArrow();

        // Remove padding and show
        const padding = (ciphertext.match(/=*$/) || [''])[0].length;
        const cleanInput = ciphertext.replace(/=/g, '');

        if (padding > 0) {
            await addStep(2, '识别填充', `
                填充字符: ${createLightPoint('='.repeat(padding), 'highlight')}
                <br>有效内容: ${createLightPoint(cleanInput)}
            `);
            await addStepArrow();
        }

        // Step 3: Convert to 6-bit binary
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let binaryStr = '';
        let charContent = '<div style="display: grid; gap: 8px;">';

        for (const char of cleanInput) {
            const index = base64Chars.indexOf(char);
            if (index === -1) {
                alert('无效的Base64字符: ' + char);
                return;
            }
            const binary = index.toString(2).padStart(6, '0');
            binaryStr += binary;

            charContent += `<div class="data-flow">
                ${createLightPoint(char)}
                <span class="arrow">→</span>
                索引 ${createLightPoint(index)}
                <span class="arrow">→</span>
                ${createLightPoint(binary, 'highlight')}
            </div>`;
        }
        charContent += '</div>';

        await addStep(padding > 0 ? 3 : 2, 'Base64字符转6位二进制', charContent);

        await addStepArrow();

        // Step 4: Group into 8-bit bytes
        // Remove padding bits
        binaryStr = binaryStr.slice(0, binaryStr.length - padding * 2);

        const bytes = [];
        for (let i = 0; i < binaryStr.length; i += 8) {
            if (i + 8 <= binaryStr.length) {
                bytes.push(binaryStr.substr(i, 8));
            }
        }

        await addStep(padding > 0 ? 4 : 3, '重组为8位字节', `
            <div style="margin-bottom: 10px;">
                二进制流: ${createLightPoint(binaryStr.match(/.{1,8}/g).join(' '))}
            </div>
            <div class="arrow-down">↓ 每8位一组</div>
            <div style="margin-top: 10px;">
                字节: ${bytes.map(b => createLightPoint(b, 'highlight')).join(' ')}
            </div>
        `);

        await addStepArrow();

        // Step 5: Convert to characters
        let result = '';
        let byteContent = '<div style="display: grid; gap: 8px;">';

        for (const byte of bytes) {
            const charCode = parseInt(byte, 2);
            const char = String.fromCharCode(charCode);
            result += char;

            byteContent += `<div class="data-flow">
                ${createLightPoint(byte)}
                <span class="arrow">→</span>
                ASCII ${createLightPoint(charCode)}
                <span class="arrow">→</span>
                ${createLightPoint(char, 'result')}
            </div>`;
        }
        byteContent += '</div>';

        await addStep(padding > 0 ? 5 : 4, '转换为ASCII字符', byteContent);

        await addStepArrow();

        // Final result
        await addStep(padding > 0 ? 6 : 5, '解码完成', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(ciphertext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
        `);

        showResult(result);
    }
});
