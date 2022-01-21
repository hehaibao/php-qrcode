/**
 * qrcode-wx-miniprogram
 */
let QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
    },
    QRErrorCorrectLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
    },
    QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
    },
    QRUtil = {
        PATTERN_POSITION_TABLE: [
            [],
            [6, 18],
            [6, 22],
            [6, 26],
            [6, 30],
            [6, 34],
            [6, 22, 38],
            [6, 24, 42],
            [6, 26, 46],
            [6, 28, 50],
            [6, 30, 54],
            [6, 32, 58],
            [6, 34, 62],
            [6, 26, 46, 66],
            [6, 26, 48, 70],
            [6, 26, 50, 74],
            [6, 30, 54, 78],
            [6, 30, 56, 82],
            [6, 30, 58, 86],
            [6, 34, 62, 90],
            [6, 28, 50, 72, 94],
            [6, 26, 50, 74, 98],
            [6, 30, 54, 78, 102],
            [6, 28, 54, 80, 106],
            [6, 32, 58, 84, 110],
            [6, 30, 58, 86, 114],
            [6, 34, 62, 90, 118],
            [6, 26, 50, 74, 98, 122],
            [6, 30, 54, 78, 102, 126],
            [6, 26, 52, 78, 104, 130],
            [6, 30, 56, 82, 108, 134],
            [6, 34, 60, 86, 112, 138],
            [6, 30, 58, 86, 114, 142],
            [6, 34, 62, 90, 118, 146],
            [6, 30, 54, 78, 102, 126, 150],
            [6, 24, 50, 76, 102, 128, 154],
            [6, 28, 54, 80, 106, 132, 158],
            [6, 32, 58, 84, 110, 136, 162],
            [6, 26, 54, 82, 110, 138, 166],
            [6, 30, 58, 86, 114, 142, 170]
        ],
        G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
        G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
        G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
        getBCHTypeInfo: function(data) {
            var d = data << 10;
            while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
                d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
            }
            return ((data << 10) | d) ^ QRUtil.G15_MASK;
        },
        getBCHTypeNumber: function(data) {
            var d = data << 12;
            while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
                d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
            }
            return (data << 12) | d;
        },
        getBCHDigit: function(data) {
            var digit = 0;
            while (data != 0) {
                digit++;
                data >>>= 1;
            }
            return digit;
        },
        getPatternPosition: function(typeNumber) {
            return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
        },
        getMask: function(maskPattern, i, j) {
            switch (maskPattern) {
                case QRMaskPattern.PATTERN000:
                    return (i + j) % 2 == 0;
                case QRMaskPattern.PATTERN001:
                    return i % 2 == 0;
                case QRMaskPattern.PATTERN010:
                    return j % 3 == 0;
                case QRMaskPattern.PATTERN011:
                    return (i + j) % 3 == 0;
                case QRMaskPattern.PATTERN100:
                    return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
                case QRMaskPattern.PATTERN101:
                    return (i * j) % 2 + (i * j) % 3 == 0;
                case QRMaskPattern.PATTERN110:
                    return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
                case QRMaskPattern.PATTERN111:
                    return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
                default:
                    //throw new Error("bad maskPattern:" + maskPattern);
                    throwError("bad maskPattern:" + maskPattern);
            }
        },
        getErrorCorrectPolynomial: function(errorCorrectLength) {
            var a = new QRPolynomial([1], 0);
            for (var i = 0; i < errorCorrectLength; i++) {
                a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
            }
            return a;
        },
        getLengthInBits: function(mode, type) {
            if (1 <= type && type < 10) {
                switch (mode) {
                    case QRMode.MODE_NUMBER:
                        return 10;
                    case QRMode.MODE_ALPHA_NUM:
                        return 9;
                    case QRMode.MODE_8BIT_BYTE:
                        return 8;
                    case QRMode.MODE_KANJI:
                        return 8;
                    default:
                        //throw new Error("mode:" + mode);
                        throwError("mode:" + mode);
                }
            } else if (type < 27) {
                switch (mode) {
                    case QRMode.MODE_NUMBER:
                        return 12;
                    case QRMode.MODE_ALPHA_NUM:
                        return 11;
                    case QRMode.MODE_8BIT_BYTE:
                        return 16;
                    case QRMode.MODE_KANJI:
                        return 10;
                    default:
                        //throw new Error("mode:" + mode);
                        throwError("mode:" + mode);
                }
            } else if (type < 41) {
                switch (mode) {
                    case QRMode.MODE_NUMBER:
                        return 14;
                    case QRMode.MODE_ALPHA_NUM:
                        return 13;
                    case QRMode.MODE_8BIT_BYTE:
                        return 16;
                    case QRMode.MODE_KANJI:
                        return 12;
                    default:
                        //throw new Error("mode:" + mode);
                        throwError("mode:" + mode);
                }
            } else {
                //throw new Error("type:" + type);
                throwError("type:" + type);
            }
        },
        getLostPoint: function(qrCode) {
            var moduleCount = qrCode.getModuleCount();
            var lostPoint = 0;
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                    var sameCount = 0;
                    var dark = qrCode.isDark(row, col);
                    for (var r = -1; r <= 1; r++) {
                        if (row + r < 0 || moduleCount <= row + r) {
                            continue;
                        }
                        for (var c = -1; c <= 1; c++) {
                            if (col + c < 0 || moduleCount <= col + c) {
                                continue;
                            }
                            if (r == 0 && c == 0) {
                                continue;
                            }
                            if (dark == qrCode.isDark(row + r, col + c)) {
                                sameCount++;
                            }
                        }
                    }
                    if (sameCount > 5) {
                        lostPoint += (3 + sameCount - 5);
                    }
                }
            }
            for (var row = 0; row < moduleCount - 1; row++) {
                for (var col = 0; col < moduleCount - 1; col++) {
                    var count = 0;
                    if (qrCode.isDark(row, col)) count++;
                    if (qrCode.isDark(row + 1, col)) count++;
                    if (qrCode.isDark(row, col + 1)) count++;
                    if (qrCode.isDark(row + 1, col + 1)) count++;
                    if (count == 0 || count == 4) {
                        lostPoint += 3;
                    }
                }
            }
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount - 6; col++) {
                    if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) &&
                        qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col +
                        5) && qrCode.isDark(row, col + 6)) {
                        lostPoint += 40;
                    }
                }
            }
            for (var col = 0; col < moduleCount; col++) {
                for (var row = 0; row < moduleCount - 6; row++) {
                    if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) &&
                        qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5,
                        col) && qrCode.isDark(row + 6, col)) {
                        lostPoint += 40;
                    }
                }
            }
            var darkCount = 0;
            for (var col = 0; col < moduleCount; col++) {
                for (var row = 0; row < moduleCount; row++) {
                    if (qrCode.isDark(row, col)) {
                        darkCount++;
                    }
                }
            }
            var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
            lostPoint += ratio * 10;
            return lostPoint;
        }
    },
    QRMath = {
        glog: function(n) {
            if (n < 1) {
                //throw new Error("glog(" + n + ")");
                throwError("glog(" + n + ")");
            }
            return QRMath.LOG_TABLE[n];
        },
        gexp: function(n) {
            while (n < 0) {
                n += 255;
            }
            while (n >= 256) {
                n -= 255;
            }
            return QRMath.EXP_TABLE[n];
        },
        EXP_TABLE: new Array(256),
        LOG_TABLE: new Array(256)
    };

for (let i = 0; i < 8; i++) {
    QRMath.EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath
        .EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) {
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
}

/*
 * class QR8bitByte
 * */
class QR8bitByte {
    constructor(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
        this.parsedData = [];

        // Added to support UTF-8 Characters
        for (let i = 0, l = this.data.length; i < l; i++) {
            let byteArray = [],
                code = this.data.charCodeAt(i);

            if (code > 0x10000) {
                byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3F);
            } else if (code > 0x800) {
                byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3F);
            } else if (code > 0x80) {
                byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3F);
            } else {
                byteArray[0] = code;
            }

            this.parsedData.push(byteArray);
        }

        this.parsedData = Array.prototype.concat.apply([], this.parsedData);

        if (this.parsedData.length !== this.data.length) {
            this.parsedData.unshift(191);
            this.parsedData.unshift(187);
            this.parsedData.unshift(239);
        }
    }

    getLength(buffer) {
        return this.parsedData.length;
    }

    write(buffer) {
        for (let i = 0, l = this.parsedData.length; i < l; i++) {
            buffer.put(this.parsedData[i], 8);
        }
    }
}

/*
 * class QRCodeModel
 * */
class QRCodeModel {
    constructor(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }

    addData(data) {
        let newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = null;
    }

    isDark(row, col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            //throw new Error(row + ',' + col);
            throwError(row + ',' + col);
        }
        return this.modules[row][col];
    }

    getModuleCount() {
        return this.moduleCount;
    }

    make() {
        this.makeImpl(false, this.getBestMaskPattern());
    }

    makeImpl(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);

        for (let row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (let col = 0; col < this.moduleCount; col++) {
                this.modules[row][col] = null;
            }
        }

        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);

        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }

        if (this.dataCache == null) {
            this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    }

    setupPositionProbePattern(row, col) {
        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r) {
                continue;
            }
            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c) {
                    continue;
                }
                this.modules[row + r][col + c] = (0 <= r && r <= 6 && (c == 0 || c == 6)) ||
                    (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)
            }
        }
    }

    getBestMaskPattern() {
        let minLostPoint = 0,
            pattern = 0;

        for (let i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            let lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }

        return pattern;
    }

    setupTimingPattern() {
        for (let r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) {
                continue;
            }
            this.modules[r][6] = (r % 2 == 0);
        }
        for (let c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) {
                continue;
            }
            this.modules[6][c] = (c % 2 == 0);
        }
    }

    setupPositionAdjustPattern() {
        let pos = QRUtil.getPatternPosition(this.typeNumber);
        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos.length; j++) {
                let row = pos[i],
                    col = pos[j];

                if (this.modules[row][col] != null) {
                    continue;
                }
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        this.modules[row + r][col + c] = r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c ==
                            0);
                    }
                }
            }
        }
    }

    setupTypeNumber(test) {
        let bits = QRUtil.getBCHTypeNumber(this.typeNumber);

        for (let i = 0; i < 18; i++) {
            this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = (!test && ((bits >> i) & 1) == 1);
        }

        for (let i = 0; i < 18; i++) {
            this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = (!test && ((bits >> i) & 1) == 1);
        }
    }

    setupTypeInfo(test, maskPattern) {
        let data = (this.errorCorrectLevel << 3) | maskPattern,
            bits = QRUtil.getBCHTypeInfo(data);

        for (let i = 0; i < 15; i++) {
            let mod = (!test && ((bits >> i) & 1) == 1);

            if (i < 6) {
                this.modules[i][8] = mod;
            } else if (i < 8) {
                this.modules[i + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }

        for (let i = 0; i < 15; i++) {
            let mod = (!test && ((bits >> i) & 1) == 1);

            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.modules[8][15 - i - 1] = mod;
            }
        }

        this.modules[this.moduleCount - 8][8] = (!test);
    }

    mapData(data, maskPattern) {
        let inc = -1,
            row = this.moduleCount - 1,
            bitIndex = 7,
            byteIndex = 0;

        for (let col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col--;
            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        let dark = false;
                        if (byteIndex < data.length) {
                            dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                        }

                        let mask = QRUtil.getMask(maskPattern, row, col - c);
                        if (mask) {
                            dark = !dark;
                        }

                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }
}
QRCodeModel.PAD0 = 0xEC;
QRCodeModel.PAD1 = 0x11;
QRCodeModel.createData = (typeNumber, errorCorrectLevel, dataList) => {
    let rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel),
        buffer = new QRBitBuffer();

    for (let i = 0; i < dataList.length; i++) {
        let data = dataList[i];
        buffer.put(data.mode, 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
        data.write(buffer);
    }

    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
        totalDataCount += rsBlocks[i].dataCount;
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
        /*
        throw new Error("code length overflow. (" +
          buffer.getLengthInBits() +
          ">" +
          totalDataCount * 8 +
          ")");
          */
        throwError("code length overflow. (" +
            buffer.getLengthInBits() +
            ">" +
            totalDataCount * 8 +
            ")");
    }

    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
    }

    while (true) {
        if (buffer.getLengthInBits() >= totalDataCount * 8) {
            break;
        }
        buffer.put(QRCodeModel.PAD0, 8);
        if (buffer.getLengthInBits() >= totalDataCount * 8) {
            break;
        }
        buffer.put(QRCodeModel.PAD1, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
};
QRCodeModel.createBytes = (buffer, rsBlocks) => {
    let offset = 0,
        maxDcCount = 0,
        maxEcCount = 0,
        dcData = new Array(rsBlocks.length),
        ecData = new Array(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r++) {
        let dcCount = rsBlocks[r].dataCount,
            ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);
        dcData[r] = new Array(dcCount);

        for (let i = 0; i < dcData[r].length; i++) {
            dcData[r][i] = 0xff & buffer.buffer[i + offset];
        }

        offset += dcCount;
        let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount),
            rawPoly = new QRPolynomial(dcData[r], rsPoly.getLength() - 1),
            modPoly = rawPoly.mod(rsPoly);

        ecData[r] = new Array(rsPoly.getLength() - 1);

        for (let i = 0; i < ecData[r].length; i++) {
            let modIndex = i + modPoly.getLength() - ecData[r].length;
            ecData[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
        }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
        totalCodeCount += rsBlocks[i].totalCount;
    }

    let data = new Array(totalCodeCount),
        index = 0;

    for (let i = 0; i < maxDcCount; i++) {
        for (let r = 0; r < rsBlocks.length; r++) {
            if (i < dcData[r].length) {
                data[index++] = dcData[r][i];
            }
        }
    }

    for (let i = 0; i < maxEcCount; i++) {
        for (let r = 0; r < rsBlocks.length; r++) {
            if (i < ecData[r].length) {
                data[index++] = ecData[r][i];
            }
        }
    }
    return data;
};

/*
 * class QRPolynomial
 * */
class QRPolynomial {
    constructor(num, shift) {
        if (num.length == undefined) {
            //throw new Error(num.length + '/' + shift);
            throwError(num.length + '/' + shift);
        }

        let offset = 0;
        while (offset < num.length && num[offset] == 0) {
            offset++;
        }

        this.num = new Array(num.length - offset + shift);

        for (let i = 0; i < num.length - offset; i++) {
            this.num[i] = num[i + offset];
        }
    }
    get(index) {
        return this.num[index];
    }
    getLength() {
        return this.num.length;
    }
    multiply(e) {
        let num = new Array(this.getLength() + e.getLength() - 1);

        for (let i = 0; i < this.getLength(); i++) {
            for (let j = 0; j < e.getLength(); j++) {
                num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
            }
        }
        return new QRPolynomial(num, 0);
    }
    mod(e) {
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }

        let ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0)),
            num = new Array(this.getLength());

        for (let i = 0; i < this.getLength(); i++) {
            num[i] = this.get(i);
        }

        for (let i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
        }

        return new QRPolynomial(num, 0).mod(e);
    }
}

/*
 * class QRRSBlock
 * */
class QRRSBlock {
    constructor(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    }
}
QRRSBlock.RS_BLOCK_TABLE = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
    let rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);

    if (!rsBlock) {
        //throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        throwError("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
    }

    let length = rsBlock.length / 3,
        list = [];

    for (let i = 0; i < length; i++) {
        let count = rsBlock[i * 3],
            totalCount = rsBlock[i * 3 + 1],
            dataCount = rsBlock[i * 3 + 2];

        for (let j = 0; j < count; j++) {
            list.push(new QRRSBlock(totalCount, dataCount));
        }
    }
    return list;
};
QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
    switch (errorCorrectLevel) {
        case QRErrorCorrectLevel.L:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4];
        case QRErrorCorrectLevel.M:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
        case QRErrorCorrectLevel.Q:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
        case QRErrorCorrectLevel.H:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
        default:
            return undefined;
    }
};

/*
 * class QRBitBuffer
 * */
class QRBitBuffer {
    constructor() {
        this.buffer = [];
        this.length = 0;
    }
    get(index) {
        let bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
    }
    put(num, length) {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) == 1);
        }
    }
    getLengthInBits() {
        return this.length;
    }
    putBit(bit) {
        let bufIndex = Math.floor(this.length / 8);

        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }

        if (bit) {
            this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
        }
        this.length++;
    }
}

/*
 * Class Drawing
 * */
class Drawing {
    constructor(el, opts) {
        this._opts = opts;
        this._el = el;
        this._ctx = uni.createCanvasContext(el);
    }

    draw(QRCode) {
        let ctx = this._ctx,
            opts = this._opts;
        var ctxPosFix = opts.width / 20;
        //console.log(opts.width)
        let count = QRCode.getModuleCount(),
            width = (opts.width - 2 * ctxPosFix) / count,
            height = (opts.height - 2 * ctxPosFix) / count,
            roundedWidth = Math.round(width),
            roundedHeight = Math.round(height);
        this.clear();
        ctx.setFillStyle('#fff');
        ctx.fillRect(0, 0, this._opts.width + 4 * ctxPosFix, this._opts.width + 4 * ctxPosFix);
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                let isDark = QRCode.isDark(row, col),
                    left = col * width + ctxPosFix,
                    top = row * height + ctxPosFix;
                ctx.setStrokeStyle(isDark ? opts.colorDark : opts.colorLight);
                ctx.setLineWidth(1);
                ctx.setFillStyle(isDark ? opts.colorDark : opts.colorLight);
                ctx.fillRect(left, top, width, height);
                ctx.strokeRect(
                    Math.floor(left) + 0.5,
                    Math.floor(top) + 0.5,
                    roundedWidth,
                    roundedHeight
                );

                ctx.strokeRect(
                    Math.ceil(left) - 0.5,
                    Math.ceil(top) - 0.5,
                    roundedWidth,
                    roundedHeight
                );
            }
        }
        this._opts.logo && this.drawImg(this._opts.logo, this._opts.width, ctx);
        ctx.draw();
        this._bIsPainted = true;
        if (this._opts.successTips && drawingOptsSuccessTips) {
            uni.hideLoading();
            uni.showToast({
                title: '生成成功',
                icon: 'success',
                duration: 1000
            });
        }
        drawingOptsSuccessTips = true;
    }

    clear() {
        this._ctx.clearRect(0, 0, this._opts.width, this._opts.height);
    }

    /** anlib **/

    /**
     * 二维码上添加图片
     */
    drawImg(src, width, ctx) {
        // logo相对二维码的比例
        var scale = 5;
        // logo相对二维码的大小
        var imgSize = width / scale;
        // 偏移位置起始点
        var imgPos = width / scale * 2;
        // 二维码边框尺寸，这里设置为原宽度的80分之一
        var imgPosFix = width / 80;
        //console.log('width', width);
        //console.log('imgSize', imgSize);
        //console.log('imgPos', imgPos);
        //console.log('imgPosFix', imgPosFix);
        //console.log('src', src);
        ctx.setFillStyle('#fff');
        ctx.fillRect(imgPos - imgPosFix, imgPos - imgPosFix, imgSize + imgPosFix * 2, imgSize + imgPosFix * 2);
        ctx.beginPath();
        ctx.moveTo(imgPos - imgPosFix, imgPos - imgPosFix);
        ctx.stroke();
        ctx.closePath();
        ctx.drawImage(src, imgPos, imgPos, imgSize, imgSize);
        ctx.beginPath();
    }
}

/*
 * Class QRCode
 * */
let QRCode = (() => {
    /**
     * Get the type by string length
     * @author anlib
     * @private
     * @param {String} text
     * @param {Number} correctLevel
     * @return {Number} type
     */
    function getTypeNumber(text, correctLevel) {
        let type = 1,
            length = getUTF8Length(text),
            QRCodeLimitLength = [
                [17, 14, 11, 7],
                [32, 26, 20, 14],
                [53, 42, 32, 24],
                [78, 62, 46, 34],
                [106, 84, 60, 44],
                [134, 106, 74, 58],
                [154, 122, 86, 64],
                [192, 152, 108, 84],
                [230, 180, 130, 98],
                [271, 213, 151, 119],
                [321, 251, 177, 137],
                [367, 287, 203, 155],
                [425, 331, 241, 177],
                [458, 362, 258, 194],
                [520, 412, 292, 220],
                [586, 450, 322, 250],
                [644, 504, 364, 280],
                [718, 560, 394, 310],
                [792, 624, 442, 338],
                [858, 666, 482, 382],
                [929, 711, 509, 403],
                [1003, 779, 565, 439],
                [1091, 857, 611, 461],
                [1171, 911, 661, 511],
                [1273, 997, 715, 535],
                [1367, 1059, 751, 593],
                [1465, 1125, 805, 625],
                [1528, 1190, 868, 658],
                [1628, 1264, 908, 698],
                [1732, 1370, 982, 742],
                [1840, 1452, 1030, 790],
                [1952, 1538, 1112, 842],
                [2068, 1628, 1168, 898],
                [2188, 1722, 1228, 958],
                [2303, 1809, 1283, 983],
                [2431, 1911, 1351, 1051],
                [2563, 1989, 1423, 1093],
                [2699, 2099, 1499, 1139],
                [2809, 2213, 1579, 1219],
                [2953, 2331, 1663, 1273]
            ];

        for (let i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
            let limit = 0;

            switch (correctLevel) {
                case QRErrorCorrectLevel.L:
                    limit = QRCodeLimitLength[i][0];
                    break;
                case QRErrorCorrectLevel.M:
                    limit = QRCodeLimitLength[i][1];
                    break;
                case QRErrorCorrectLevel.Q:
                    limit = QRCodeLimitLength[i][2];
                    break;
                case QRErrorCorrectLevel.H:
                    limit = QRCodeLimitLength[i][3];
                    break;
            }

            if (length <= limit) {
                break;
            } else {
                type++;
            }
        }

        if (type > QRCodeLimitLength.length) {
            //  throw new Error('Too long data'); //supfire
            throwError('Too long data');
        }
        return type;
    }

    function getUTF8Length(text) {
        let replacedText = encodeURI(text).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
        return replacedText.length + (replacedText.length != text ? 3 : 0);
    }

    class Fn {
        constructor(el, opts) {
            this._opts = {
                width: 300,
                height: 300,
                typeNumber: 4,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: Fn.correctLevel.H,
                logo: false,
                successTips: false,
            };

            if (typeof opts === 'string') {
                opts = {
                    text: opts
                };
            }

            // Overwrites options 简单拷贝
            if (opts) {
                for (let i in opts) {
                    if (opts.hasOwnProperty(i)) {
                        this._opts[i] = opts[i];
                    }

                }
            }

            this._el = el;
            this._QRCode = null;
            this._drawing = new Drawing(this._el, this._opts);

            if (this._opts.text) {
                this.makeCode(this._opts.text);
            }
        }

        makeCode(text) {
            this._QRCode = new QRCodeModel(getTypeNumber(text, this._opts.correctLevel), this._opts
                .correctLevel);
            this._QRCode.addData(text);
            this._QRCode.make();
            this._drawing.draw(this._QRCode);
        }

        clear() {
            this._drawing.clear();
        }
    }
    Fn.correctLevel = QRErrorCorrectLevel;

    return Fn;
})();

/** anlib **/
let drawingOptsSuccessTips = true;
/**
 * 抛出错误
 */
function throwError(str) {
    uni.hideLoading();
    uni.showToast({
        title: '有字符暂不支持',
        icon: 'none',
        duration: 2000
    });
    drawingOptsSuccessTips = false;
    //throw new Error(str);
}

export default QRCode;