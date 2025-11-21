// AES Cipher Module - Full round-by-round visualization
registerCipher({
    id: 'aes',
    name: 'AES 加密',
    description: '高级加密标准，展示完整10/12/14轮加密过程',
    type: '现代密码',
    color: '#ff2f7b',
    keyPlaceholder: '16字符(128位)/24字符(192位)/32字符(256位)',
    example: { text: 'Hello AES!', key: '0123456789abcdef' },

    async encrypt(plaintext, key) {
        if (!key || (key.length !== 16 && key.length !== 24 && key.length !== 32)) {
            alert('AES密钥必须是16字符(128位)、24字符(192位)或32字符(256位)');
            return;
        }

        const keyBits = key.length * 8;
        const rounds = key.length === 16 ? 10 : (key.length === 24 ? 12 : 14);

        // Step 1: Parameters
        await addStep(1, '加密参数', `
            明文: ${createLightPoint(plaintext)}
            <br>密钥: ${createLightPoint(key, 'highlight')}
            <br>算法: ${createLightPoint(`AES-${keyBits}`, 'result')}
            <br>轮数: ${createLightPoint(rounds + ' 轮')}
        `);

        await addStepArrow();

        // Convert to bytes
        const plainBytes = new Uint8Array(16);
        for (let i = 0; i < Math.min(plaintext.length, 16); i++) {
            plainBytes[i] = plaintext.charCodeAt(i);
        }
        // PKCS7 padding for first block
        const padLen = 16 - (plaintext.length % 16 || 16);
        if (plaintext.length < 16) {
            for (let i = plaintext.length; i < 16; i++) {
                plainBytes[i] = padLen;
            }
        }

        const keyBytes = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) {
            keyBytes[i] = key.charCodeAt(i);
        }

        // Step 2: Show state matrix
        await addStep(2, '初始状态矩阵', `
            明文字节转为4×4矩阵 (列优先):
            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px;">
${formatMatrix(plainBytes)}</pre>
        `);

        await addStepArrow();

        // Key expansion
        const expandedKey = aesKeyExpansion(keyBytes, rounds);

        await addStep(3, '密钥扩展', `
            生成 ${rounds + 1} 个轮密钥
            <br><br>轮密钥 0 (初始):
            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px;">
${formatMatrix(expandedKey.slice(0, 16))}</pre>
        `);

        await addStepArrow();

        // Initial AddRoundKey
        let state = new Uint8Array(plainBytes);
        const roundKey0 = expandedKey.slice(0, 16);

        let xorDetail = '';
        for (let i = 0; i < 4; i++) {
            xorDetail += `${state[i].toString(16).padStart(2, '0')} ⊕ ${roundKey0[i].toString(16).padStart(2, '0')} = ${(state[i] ^ roundKey0[i]).toString(16).padStart(2, '0')}  `;
        }

        state = xorBytes(state, roundKey0);

        await addStep(4, '初始轮密钥加 (AddRoundKey)', `
            状态 ⊕ 轮密钥[0]:
            <br><br>示例 (前4字节): ${xorDetail}
            <br><br>结果:
            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px;">
${formatMatrix(state)}</pre>
        `);

        await addStepArrow();

        // Main rounds
        for (let round = 1; round <= rounds; round++) {
            const isLastRound = round === rounds;
            const beforeState = new Uint8Array(state);

            // SubBytes
            const afterSubBytes = aesSubBytes(state);

            // ShiftRows
            const afterShiftRows = aesShiftRows(afterSubBytes);

            // MixColumns (not in last round)
            let afterMixColumns;
            if (!isLastRound) {
                afterMixColumns = aesMixColumns(afterShiftRows);
            } else {
                afterMixColumns = afterShiftRows;
            }

            // AddRoundKey
            const roundKey = expandedKey.slice(round * 16, (round + 1) * 16);
            state = xorBytes(afterMixColumns, roundKey);

            // Show detailed round operations with actual data
            let roundContent = `
                <div class="round-container">
                    <div class="round-header">第 ${round} 轮${isLastRound ? ' (最终轮)' : ''}</div>
                    <div class="round-content">
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #00d4ff;">1. SubBytes</strong> - S盒替换
                            <br><span style="color: #888; font-size: 0.8rem;">每个字节通过S盒查表替换</span>
                            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 5px;">
输入: ${formatMatrixInline(beforeState)}
输出: ${formatMatrixInline(afterSubBytes)}</pre>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #00d4ff;">2. ShiftRows</strong> - 行移位
                            <br><span style="color: #888; font-size: 0.8rem;">行0不移, 行1左移1, 行2左移2, 行3左移3</span>
                            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 5px;">
输入: ${formatMatrixInline(afterSubBytes)}
输出: ${formatMatrixInline(afterShiftRows)}</pre>
                        </div>
                        ${!isLastRound ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #00d4ff;">3. MixColumns</strong> - 列混淆
                            <br><span style="color: #888; font-size: 0.8rem;">GF(2⁸)有限域矩阵乘法</span>
                            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 5px;">
输入: ${formatMatrixInline(afterShiftRows)}
输出: ${formatMatrixInline(afterMixColumns)}</pre>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #00d4ff;">4. AddRoundKey</strong> - 轮密钥加
                            <br><span style="color: #888; font-size: 0.8rem;">状态 ⊕ 轮密钥[${round}]</span>
                            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 5px;">
状态: ${formatMatrixInline(afterMixColumns)}
密钥: ${formatMatrixInline(roundKey)}
输出: ${formatMatrixInline(state)}</pre>
                        </div>
                        ` : `
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #00d4ff;">3. AddRoundKey</strong> - 轮密钥加
                            <br><span style="color: #888; font-size: 0.8rem;">(最终轮无MixColumns)</span>
                            <pre style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 5px;">
状态: ${formatMatrixInline(afterShiftRows)}
密钥: ${formatMatrixInline(roundKey)}
输出: ${formatMatrixInline(state)}</pre>
                        </div>
                        `}
                    </div>
                </div>
            `;

            await addStep(4 + round, `第 ${round} 轮`, roundContent);

            if (round < rounds) {
                await addStepArrow();
            }
        }

        await addStepArrow();

        // Convert result to hex
        let resultHex = '';
        for (let i = 0; i < 16; i++) {
            resultHex += state[i].toString(16).padStart(2, '0');
        }

        // Verify by decrypting
        const decryptedState = aesDecryptBlock(state, expandedKey, rounds);
        let decryptedText = '';
        for (let i = 0; i < 16; i++) {
            if (decryptedState[i] > 0 && decryptedState[i] < 128) {
                decryptedText += String.fromCharCode(decryptedState[i]);
            }
        }
        // Remove padding
        const lastByte = decryptedState[15];
        if (lastByte > 0 && lastByte <= 16) {
            decryptedText = decryptedText.slice(0, -lastByte);
        }

        const verified = decryptedText === plaintext.slice(0, 16);

        await addStep(5 + rounds, '加密完成 & 校验', `
            密文 (十六进制):
            <br>${createLightPoint(resultHex, 'result')}
            <br><br>
            <div style="padding: 10px; border-radius: 4px; background: ${verified ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,0,0.1)'};">
                <span style="color: ${verified ? '#00ff88' : '#ff2f7b'};">
                    ${verified ? '✓ 校验通过: 解密还原成功' : '✗ 校验失败'}
                </span>
                ${verified ? `<br><span style="color: #888; font-size: 0.85rem;">解密结果: "${decryptedText}"</span>` : ''}
            </div>
        `);

        showResult(resultHex);
    },

    async decrypt(ciphertext, key) {
        if (!key || (key.length !== 16 && key.length !== 24 && key.length !== 32)) {
            alert('AES密钥必须是16字符(128位)、24字符(192位)或32字符(256位)');
            return;
        }

        // Parse hex input
        const cipherBytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            cipherBytes[i] = parseInt(ciphertext.substr(i * 2, 2), 16) || 0;
        }

        const keyBytes = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) {
            keyBytes[i] = key.charCodeAt(i);
        }

        const rounds = key.length === 16 ? 10 : (key.length === 24 ? 12 : 14);
        const expandedKey = aesKeyExpansion(keyBytes, rounds);

        await addStep(1, '解密参数', `
            密文: ${createLightPoint(ciphertext)}
            <br>密钥: ${createLightPoint(key, 'highlight')}
            <br>轮数: ${createLightPoint(rounds + ' 轮')}
        `);

        await addStepArrow();

        // Decrypt
        const state = aesDecryptBlock(cipherBytes, expandedKey, rounds);

        // Remove padding and convert to string
        let result = '';
        const lastByte = state[15];
        const textLen = lastByte > 0 && lastByte <= 16 ? 16 - lastByte : 16;
        for (let i = 0; i < textLen; i++) {
            if (state[i] >= 32 && state[i] < 127) {
                result += String.fromCharCode(state[i]);
            }
        }

        await addStep(2, '解密完成', `
            明文: ${createLightPoint(result, 'result')}
        `);

        showResult(result);
    }
});

// AES Helper functions
const SBOX = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

const INV_SBOX = [
    0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
    0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
    0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
    0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
    0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
    0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
    0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
    0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
    0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
    0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
    0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
    0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
    0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
    0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
    0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
    0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
];

const RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function formatMatrix(bytes) {
    let result = '';
    for (let row = 0; row < 4; row++) {
        result += '| ';
        for (let col = 0; col < 4; col++) {
            result += (bytes[col * 4 + row] || 0).toString(16).padStart(2, '0') + ' ';
        }
        result += '|\n';
    }
    return result;
}

function formatMatrixCompact(bytes) {
    let result = '';
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            result += (bytes[col * 4 + row] || 0).toString(16).padStart(2, '0') + ' ';
        }
        if (row < 3) result += '\n';
    }
    return result;
}

function formatMatrixInline(bytes) {
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += (bytes[i] || 0).toString(16).padStart(2, '0');
        if (i < 15) result += ' ';
    }
    return result;
}

function xorBytes(a, b) {
    const result = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

function aesSubBytes(state) {
    const result = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        result[i] = SBOX[state[i]];
    }
    return result;
}

function aesInvSubBytes(state) {
    const result = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        result[i] = INV_SBOX[state[i]];
    }
    return result;
}

function aesShiftRows(state) {
    const result = new Uint8Array(16);
    // Row 0: no shift
    result[0] = state[0]; result[4] = state[4]; result[8] = state[8]; result[12] = state[12];
    // Row 1: shift left 1
    result[1] = state[5]; result[5] = state[9]; result[9] = state[13]; result[13] = state[1];
    // Row 2: shift left 2
    result[2] = state[10]; result[6] = state[14]; result[10] = state[2]; result[14] = state[6];
    // Row 3: shift left 3
    result[3] = state[15]; result[7] = state[3]; result[11] = state[7]; result[15] = state[11];
    return result;
}

function aesInvShiftRows(state) {
    const result = new Uint8Array(16);
    // Row 0: no shift
    result[0] = state[0]; result[4] = state[4]; result[8] = state[8]; result[12] = state[12];
    // Row 1: shift right 1
    result[1] = state[13]; result[5] = state[1]; result[9] = state[5]; result[13] = state[9];
    // Row 2: shift right 2
    result[2] = state[10]; result[6] = state[14]; result[10] = state[2]; result[14] = state[6];
    // Row 3: shift right 3
    result[3] = state[7]; result[7] = state[11]; result[11] = state[15]; result[15] = state[3];
    return result;
}

function gmul(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        const hiBit = a & 0x80;
        a = (a << 1) & 0xff;
        if (hiBit) a ^= 0x1b;
        b >>= 1;
    }
    return p;
}

function aesMixColumns(state) {
    const result = new Uint8Array(16);
    for (let col = 0; col < 4; col++) {
        const i = col * 4;
        result[i] = gmul(2, state[i]) ^ gmul(3, state[i+1]) ^ state[i+2] ^ state[i+3];
        result[i+1] = state[i] ^ gmul(2, state[i+1]) ^ gmul(3, state[i+2]) ^ state[i+3];
        result[i+2] = state[i] ^ state[i+1] ^ gmul(2, state[i+2]) ^ gmul(3, state[i+3]);
        result[i+3] = gmul(3, state[i]) ^ state[i+1] ^ state[i+2] ^ gmul(2, state[i+3]);
    }
    return result;
}

function aesInvMixColumns(state) {
    const result = new Uint8Array(16);
    for (let col = 0; col < 4; col++) {
        const i = col * 4;
        result[i] = gmul(0x0e, state[i]) ^ gmul(0x0b, state[i+1]) ^ gmul(0x0d, state[i+2]) ^ gmul(0x09, state[i+3]);
        result[i+1] = gmul(0x09, state[i]) ^ gmul(0x0e, state[i+1]) ^ gmul(0x0b, state[i+2]) ^ gmul(0x0d, state[i+3]);
        result[i+2] = gmul(0x0d, state[i]) ^ gmul(0x09, state[i+1]) ^ gmul(0x0e, state[i+2]) ^ gmul(0x0b, state[i+3]);
        result[i+3] = gmul(0x0b, state[i]) ^ gmul(0x0d, state[i+1]) ^ gmul(0x09, state[i+2]) ^ gmul(0x0e, state[i+3]);
    }
    return result;
}

function aesKeyExpansion(key, rounds) {
    const keyLen = key.length;
    const nk = keyLen / 4;
    const nr = rounds;
    const expanded = new Uint8Array((nr + 1) * 16);

    // Copy original key
    for (let i = 0; i < keyLen; i++) {
        expanded[i] = key[i];
    }

    // Expand
    for (let i = nk; i < 4 * (nr + 1); i++) {
        let temp = expanded.slice((i - 1) * 4, i * 4);

        if (i % nk === 0) {
            // RotWord
            temp = new Uint8Array([temp[1], temp[2], temp[3], temp[0]]);
            // SubWord
            for (let j = 0; j < 4; j++) {
                temp[j] = SBOX[temp[j]];
            }
            // XOR with Rcon
            temp[0] ^= RCON[(i / nk) - 1];
        } else if (nk > 6 && i % nk === 4) {
            // SubWord for AES-256
            for (let j = 0; j < 4; j++) {
                temp[j] = SBOX[temp[j]];
            }
        }

        for (let j = 0; j < 4; j++) {
            expanded[i * 4 + j] = expanded[(i - nk) * 4 + j] ^ temp[j];
        }
    }

    return expanded;
}

function aesDecryptBlock(cipherBytes, expandedKey, rounds) {
    let state = new Uint8Array(cipherBytes);

    // Initial round key
    state = xorBytes(state, expandedKey.slice(rounds * 16, (rounds + 1) * 16));

    // Rounds in reverse
    for (let round = rounds - 1; round >= 0; round--) {
        state = aesInvShiftRows(state);
        state = aesInvSubBytes(state);
        state = xorBytes(state, expandedKey.slice(round * 16, (round + 1) * 16));
        if (round > 0) {
            state = aesInvMixColumns(state);
        }
    }

    return state;
}
