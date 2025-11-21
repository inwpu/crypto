// RSA Cipher Module - Enhanced with detailed visualization
registerCipher({
    id: 'rsa',
    name: 'RSA 加密',
    description: '非对称加密算法，使用公钥加密、私钥解密',
    type: '现代密码',
    color: '#00ff88',
    keyPlaceholder: '输入两个质数 (如: 61,53)',
    example: { text: 'Hi', key: '61,53' },

    async encrypt(plaintext, key) {
        // Parse primes or use defaults
        let p = 61, q = 53;
        if (key) {
            const parts = key.split(',').map(s => parseInt(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                p = parts[0];
                q = parts[1];
            }
        }

        // Step 1: Show input with example
        await addStep(1, '输入参数', `
            明文: ${createLightPoint(plaintext)}
            <br>质数 p: ${createLightPoint(p, 'highlight')}
            <br>质数 q: ${createLightPoint(q, 'highlight')}
            <br><br><span style="color: #666; font-size: 0.85rem;">RSA安全性基于大整数分解难题</span>
        `);

        await addStepArrow();

        // Step 2: Calculate n
        const n = p * q;
        await addStep(2, '计算模数 n = p × q', `
            <div class="data-flow">
                ${createLightPoint(p)}
                <span class="arrow">×</span>
                ${createLightPoint(q)}
                <span class="arrow">=</span>
                ${createLightPoint('n = ' + n, 'result')}
            </div>
            <br><span style="color: #666; font-size: 0.85rem;">n 的位数决定RSA的安全强度</span>
        `);

        await addStepArrow();

        // Step 3: Calculate Euler's totient
        const phi = (p - 1) * (q - 1);
        await addStep(3, '计算欧拉函数 φ(n)', `
            φ(n) = (p-1) × (q-1)
            <br><br>
            <div class="data-flow">
                (${p}-1) × (${q}-1)
                <span class="arrow">=</span>
                ${createLightPoint(p-1)} × ${createLightPoint(q-1)}
                <span class="arrow">=</span>
                ${createLightPoint('φ(n) = ' + phi, 'result')}
            </div>
            <br><span style="color: #666; font-size: 0.85rem;">φ(n) 表示小于n且与n互质的正整数个数</span>
        `);

        await addStepArrow();

        // Step 4: Choose e (public exponent)
        const e = 17;
        const gcdValue = gcd(e, phi);

        await addStep(4, '选择公钥指数 e', `
            要求:
            <br>• 1 < e < φ(n)
            <br>• gcd(e, φ(n)) = 1 (互质)
            <br><br>
            选择: ${createLightPoint('e = ' + e, 'highlight')}
            <br>验证: gcd(${e}, ${phi}) = ${createLightPoint(gcdValue, gcdValue === 1 ? 'xor-match' : 'highlight')}
            <br><br><span style="color: #666; font-size: 0.85rem;">常用值: 3, 17, 65537</span>
        `);

        await addStepArrow();

        // Step 5: Calculate d (private exponent)
        const d = modInverse(e, phi);
        await addStep(5, '计算私钥指数 d', `
            使用扩展欧几里得算法:
            <br><br>d × e ≡ 1 (mod φ(n))
            <br><br>
            <div class="data-flow">
                d × ${e} ≡ 1 (mod ${phi})
                <span class="arrow">→</span>
                ${createLightPoint('d = ' + d, 'result')}
            </div>
            <br>验证: ${d} × ${e} = ${d * e} = ${Math.floor(d * e / phi)} × ${phi} + ${(d * e) % phi}
        `);

        await addStepArrow();

        // Step 6: Show key pair
        await addStep(6, '生成密钥对', `
            <div class="round-container">
                <div class="round-header">公钥 (可公开)</div>
                <div class="round-content">
                    ${createLightPoint(`e = ${e}`, 'highlight')}
                    ${createLightPoint(`n = ${n}`, 'highlight')}
                </div>
            </div>
            <div class="round-container" style="margin-top: 10px;">
                <div class="round-header">私钥 (保密)</div>
                <div class="round-content">
                    ${createLightPoint(`d = ${d}`, 'result')}
                    ${createLightPoint(`n = ${n}`, 'result')}
                </div>
            </div>
        `);

        await addStepArrow();

        // Step 7: Convert message to numbers
        const messageNums = [];
        let convContent = '<div style="display: grid; gap: 8px;">';
        for (let i = 0; i < plaintext.length; i++) {
            const code = plaintext.charCodeAt(i);
            messageNums.push(code);
            convContent += `<div class="data-flow">
                ${createLightPoint(plaintext[i])}
                <span class="arrow">→</span>
                ASCII ${createLightPoint(code, 'highlight')}
            </div>`;
        }
        convContent += '</div>';

        await addStep(7, '转换为数字 (ASCII)', convContent);

        await addStepArrow();

        // Step 8: Encrypt each character with modular exponentiation
        const encrypted = [];
        let encryptContent = '<div style="display: grid; gap: 10px;">';

        for (let i = 0; i < messageNums.length; i++) {
            const m = messageNums[i];
            const c = modPow(m, e, n);
            encrypted.push(c);

            encryptContent += `<div class="data-flow">
                C = ${createLightPoint(m)}<sup>${e}</sup> mod ${n}
                <span class="arrow">=</span>
                ${createLightPoint(c, 'result')}
            </div>`;
        }
        encryptContent += '</div>';

        await addStep(8, '加密: C = M^e mod n', encryptContent);

        await addStepArrow();

        // Step 9: Show modular exponentiation detail
        const sampleM = messageNums[0] || 72;
        await addStep(9, '模幂运算详解', `
            使用快速幂算法 (平方-乘法):
            <br><br>计算 ${sampleM}<sup>${e}</sup> mod ${n}:
            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 0.85rem;">
${e} = ${e.toString(2)}₂
从右到左处理每一位:
位=1: 结果 × 底数 mod n
每步: 底数 = 底数² mod n</pre>
        `);

        await addStepArrow();

        // Step 10: Verify and final result
        const result = encrypted.join(',');

        // Verify by decrypting
        let verifyResult = '';
        for (let i = 0; i < encrypted.length; i++) {
            const m = modPow(encrypted[i], d, n);
            verifyResult += String.fromCharCode(m);
        }
        const verified = verifyResult === plaintext;

        await addStep(10, '加密完成 & 校验', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(plaintext)}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
            <br>
            <div style="margin-top: 15px; padding: 10px; border-radius: 4px; background: ${verified ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,0,0.1)'};">
                <span style="color: ${verified ? '#00ff88' : '#ff2f7b'};">
                    ${verified ? '✓ 校验通过: (M^e)^d mod n = M' : '✗ 校验失败'}
                </span>
                ${verified ? `<br><span style="color: #888; font-size: 0.85rem;">解密验证: "${verifyResult}"</span>` : ''}
            </div>
            <br>
            <div style="color: #888; font-size: 0.85rem;">
                公钥: (e=${e}, n=${n})
                <br>私钥: (d=${d}, n=${n})
            </div>
        `);

        showResult(result);
    },

    async decrypt(ciphertext, key) {
        // Parse primes or use defaults
        let p = 61, q = 53;
        if (key) {
            const parts = key.split(',').map(s => parseInt(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                p = parts[0];
                q = parts[1];
            }
        }

        // Parse ciphertext
        const encrypted = ciphertext.split(',').map(s => parseInt(s.trim()));
        if (encrypted.some(isNaN)) {
            alert('密文格式错误，应为逗号分隔的数字');
            return;
        }

        // Step 1: Show input
        await addStep(1, '输入参数', `
            密文: ${createLightPoint(ciphertext)}
            <br>质数 p: ${createLightPoint(p, 'highlight')}
            <br>质数 q: ${createLightPoint(q, 'highlight')}
        `);

        await addStepArrow();

        // Step 2: Recalculate keys
        const n = p * q;
        const phi = (p - 1) * (q - 1);
        const e = 17;
        const d = modInverse(e, phi);

        await addStep(2, '重建密钥', `
            <div style="display: grid; gap: 8px;">
                <div>n = p × q = ${createLightPoint(n)}</div>
                <div>φ(n) = (p-1)(q-1) = ${createLightPoint(phi)}</div>
                <div>私钥 d = ${createLightPoint(d, 'highlight')}</div>
            </div>
        `);

        await addStepArrow();

        // Step 3: Decrypt each number
        const decrypted = [];
        let decryptContent = '<div style="display: grid; gap: 10px;">';

        for (let i = 0; i < encrypted.length; i++) {
            const c = encrypted[i];
            const m = modPow(c, d, n);
            decrypted.push(m);

            decryptContent += `<div class="data-flow">
                M = ${createLightPoint(c)}<sup>${d}</sup> mod ${n}
                <span class="arrow">=</span>
                ${createLightPoint(m, 'result')}
            </div>`;
        }
        decryptContent += '</div>';

        await addStep(3, '解密: M = C^d mod n', decryptContent);

        await addStepArrow();

        // Step 4: Explain why this works
        await addStep(4, 'RSA原理验证', `
            由欧拉定理:
            <br><br>M<sup>ed</sup> ≡ M<sup>1 + k×φ(n)</sup> ≡ M (mod n)
            <br><br>因为 e × d ≡ 1 (mod φ(n))
            <br>所以 (M<sup>e</sup>)<sup>d</sup> ≡ M (mod n)
        `);

        await addStepArrow();

        // Step 5: Convert to characters
        let result = '';
        let charContent = '<div style="display: grid; gap: 8px;">';

        for (let i = 0; i < decrypted.length; i++) {
            const code = decrypted[i];
            const char = String.fromCharCode(code);
            result += char;

            charContent += `<div class="data-flow">
                ${createLightPoint(code)}
                <span class="arrow">→</span>
                ASCII ${createLightPoint(char, 'result')}
            </div>`;
        }
        charContent += '</div>';

        await addStep(5, '转换为字符', charContent);

        await addStepArrow();

        // Step 6: Final result
        await addStep(6, '解密完成', `
            <div class="data-flow" style="font-size: 1.1rem;">
                ${createLightPoint(ciphertext.substring(0, 20) + (ciphertext.length > 20 ? '...' : ''))}
                <span class="arrow">→</span>
                ${createLightPoint(result, 'result')}
            </div>
        `);

        showResult(result);
    }
});

// RSA Helper functions
function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function modInverse(e, phi) {
    let [old_r, r] = [phi, e];
    let [old_s, s] = [0, 1];

    while (r !== 0) {
        const quotient = Math.floor(old_r / r);
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
    }

    return old_s < 0 ? old_s + phi : old_s;
}

function modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }

    return result;
}
