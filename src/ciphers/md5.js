// MD5 Hash Module - Enhanced with round visualization
registerCipher({
    id: 'md5',
    name: 'MD5 哈希',
    description: '消息摘要算法，将任意长度数据转换为128位哈希值',
    type: '哈希函数',
    color: '#ffcc00',
    keyPlaceholder: 'MD5不需要密钥',
    example: { text: 'Hello', key: '' },

    async encrypt(plaintext, key) {
        // Step 1: Show input
        await addStep(1, '输入消息', `
            消息: ${createLightPoint(plaintext)}
            <br>长度: ${createLightPoint(plaintext.length + ' 字符')}
            <br>位数: ${createLightPoint(plaintext.length * 8 + ' bits')}
            <br><br><span style="color: #666; font-size: 0.85rem;">示例: "abc" → 900150983cd24fb0d6963f7d28e17f72</span>
        `);

        await addStepArrow();

        // Step 2: Convert to binary representation
        let hexBytes = '';
        for (let i = 0; i < Math.min(plaintext.length, 8); i++) {
            hexBytes += plaintext.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
        }
        if (plaintext.length > 8) hexBytes += '...';

        await addStep(2, '转换为字节', `
            消息字节 (十六进制):
            <br><div style="margin-top: 10px;">
                ${createLightPoint(hexBytes.trim())}
            </div>
        `);

        await addStepArrow();

        // Step 3: Padding
        const originalBits = plaintext.length * 8;
        const paddedLength = Math.ceil((plaintext.length + 9) / 64) * 64;

        await addStep(3, '消息填充 (Padding)', `
            <div class="round-container">
                <div class="round-header">填充规则</div>
                <div class="round-content">
                    <div>1. 附加位 ${createLightPoint('1', 'highlight')}</div>
                    <div>2. 附加 ${createLightPoint('0', '')} 直到长度 ≡ 448 (mod 512)</div>
                    <div>3. 附加原始长度 (64位小端序)</div>
                </div>
            </div>
            <br>原始: ${originalBits} bits
            <br>填充后: ${createLightPoint(paddedLength * 8 + ' bits', 'result')}
        `);

        await addStepArrow();

        // Step 4: Initialize buffers
        await addStep(4, '初始化链接变量', `
            四个32位寄存器 (小端序):
            <br><br>
            <div style="display: grid; gap: 8px;">
                <div class="data-flow">
                    A = ${createLightPoint('0x67452301', 'highlight')}
                </div>
                <div class="data-flow">
                    B = ${createLightPoint('0xEFCDAB89', 'highlight')}
                </div>
                <div class="data-flow">
                    C = ${createLightPoint('0x98BADCFE', 'highlight')}
                </div>
                <div class="data-flow">
                    D = ${createLightPoint('0x10325476', 'highlight')}
                </div>
            </div>
            <br><span style="color: #666; font-size: 0.85rem;">这些是标准MD5初始值</span>
        `);

        await addStepArrow();

        // Step 5: Process blocks
        const numBlocks = Math.ceil(paddedLength / 64);
        await addStep(5, '分块处理', `
            将消息分成 ${createLightPoint(numBlocks + ' 个512位块')}
            <br><br>每块包含 16 个 32位字 (M[0]...M[15])
        `);

        await addStepArrow();

        // Step 6: Show 4 rounds
        let roundContent = `
            <div class="round-container">
                <div class="round-header">第1轮 (Round 1): 步骤 0-15</div>
                <div class="round-content">
                    F(B,C,D) = ${createLightPoint('(B ∧ C) ∨ (¬B ∧ D)', 'highlight')}
                    <br>轮常量: K[0-15]
                    <br>消息索引: i
                    <br>移位量: [7, 12, 17, 22] 循环
                </div>
            </div>

            <div class="round-container" style="margin-top: 10px;">
                <div class="round-header">第2轮 (Round 2): 步骤 16-31</div>
                <div class="round-content">
                    G(B,C,D) = ${createLightPoint('(B ∧ D) ∨ (C ∧ ¬D)', 'highlight')}
                    <br>消息索引: (5i + 1) mod 16
                    <br>移位量: [5, 9, 14, 20] 循环
                </div>
            </div>

            <div class="round-container" style="margin-top: 10px;">
                <div class="round-header">第3轮 (Round 3): 步骤 32-47</div>
                <div class="round-content">
                    H(B,C,D) = ${createLightPoint('B ⊕ C ⊕ D', 'highlight')}
                    <br>消息索引: (3i + 5) mod 16
                    <br>移位量: [4, 11, 16, 23] 循环
                </div>
            </div>

            <div class="round-container" style="margin-top: 10px;">
                <div class="round-header">第4轮 (Round 4): 步骤 48-63</div>
                <div class="round-content">
                    I(B,C,D) = ${createLightPoint('C ⊕ (B ∨ ¬D)', 'highlight')}
                    <br>消息索引: (7i) mod 16
                    <br>移位量: [6, 10, 15, 21] 循环
                </div>
            </div>
        `;

        await addStep(6, '64轮操作 (4×16)', roundContent);

        await addStepArrow();

        // Step 7: Single round operation detail
        await addStep(7, '单步操作详解', `
            每一步执行:
            <br><br>
            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; font-size: 0.85rem;">
a = b + ((a + F(b,c,d) + M[k] + K[i]) <<< s)

其中:
• F/G/H/I = 当前轮函数
• M[k] = 消息字
• K[i] = 轮常量
• s = 左循环移位量
• <<< = 循环左移</pre>
        `);

        await addStepArrow();

        // Step 8: Constants
        await addStep(8, '轮常量 K[i]', `
            K[i] = floor(2³² × |sin(i+1)|)
            <br><br>示例:
            <div style="display: grid; gap: 5px; margin-top: 10px;">
                <div>K[0] = ${createLightPoint('0xD76AA478')}</div>
                <div>K[1] = ${createLightPoint('0xE8C7B756')}</div>
                <div>K[2] = ${createLightPoint('0x242070DB')}</div>
                <div>...</div>
                <div>K[63] = ${createLightPoint('0xEB86D391')}</div>
            </div>
        `);

        await addStepArrow();

        // Step 9: Final addition
        await addStep(9, '累加结果', `
            处理完所有块后:
            <br><br>
            <div style="display: grid; gap: 8px;">
                <div>A = A + AA</div>
                <div>B = B + BB</div>
                <div>C = C + CC</div>
                <div>D = D + DD</div>
            </div>
            <br>(AA, BB, CC, DD 是当前块处理前的值)
        `);

        await addStepArrow();

        // Calculate actual MD5
        const result = md5(plaintext);

        // Step 10: Final hash
        await addStep(10, '哈希完成', `
            输出 (小端序拼接 A|B|C|D):
            <br><br>
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(plaintext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
            <br><span style="color: #666; font-size: 0.85rem;">128位 = 32个十六进制字符</span>
        `);

        showResult(result);
    },

    async decrypt(ciphertext, key) {
        await addStep(1, '无法解密', `
            ${createLightPoint('MD5是单向哈希函数', 'highlight')}
            <br><br>
            <div class="round-container">
                <div class="round-header">哈希函数特性</div>
                <div class="round-content">
                    <div>• ${createLightPoint('单向性')} - 无法从哈希值还原原文</div>
                    <div>• ${createLightPoint('确定性')} - 相同输入产生相同输出</div>
                    <div>• ${createLightPoint('雪崩效应')} - 微小改变导致完全不同输出</div>
                    <div>• ${createLightPoint('抗碰撞')} - 难以找到相同哈希的不同输入</div>
                </div>
            </div>
        `);

        await addStepArrow();

        await addStep(2, '安全警告', `
            <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,0,0,0.3);">
                ${createLightPoint('MD5已被破解!', 'highlight')}
                <br><br>
                2004年王小云教授团队发现碰撞攻击
                <br>不应用于安全敏感场景
            </div>
            <br><br>推荐替代:
            <div style="margin-top: 10px;">
                • ${createLightPoint('SHA-256', 'result')}
                • ${createLightPoint('SHA-3', 'result')}
                • ${createLightPoint('BLAKE2', 'result')}
            </div>
        `);

        showResult('哈希函数无法解密');
    }
});

// MD5 implementation
function md5(string) {
    function rotateLeft(value, shift) {
        return (value << shift) | (value >>> (32 - shift));
    }

    function addUnsigned(x, y) {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return x ^ y ^ z; }
    function I(x, y, z) { return y ^ (x | (~z)); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
        const lWordCount = ((string.length + 8 - ((string.length + 8) % 64)) / 64 + 1) * 16;
        const lWordArray = Array(lWordCount - 1).fill(0);
        let lBytePosition = 0;
        let lByteCount = 0;

        while (lByteCount < string.length) {
            const lWordPosition = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordPosition] = (lWordArray[lWordPosition] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }

        const lWordPosition = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordPosition] = lWordArray[lWordPosition] | (0x80 << lBytePosition);
        lWordArray[lWordCount - 2] = string.length * 8;
        return lWordArray;
    }

    function wordToHex(lValue) {
        let wordToHexValue = '';
        for (let lCount = 0; lCount <= 3; lCount++) {
            const lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue += ('0' + lByte.toString(16)).slice(-2);
        }
        return wordToHexValue;
    }

    const x = convertToWordArray(string);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;

        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x04881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}
