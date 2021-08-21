"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const seedrandom_1 = __importDefault(require("seedrandom"));
const defaultSettings = {
    parts: ['background', 'face', 'clothes', 'head', 'hair', 'eye', 'mouth'],
    partsLocation: path_1.default.join(__dirname, '../img'),
    imageExtension: '.png',
};
class AvatarGenerator {
    constructor(settings = {}) {
        const cfg = Object.assign(Object.assign({}, defaultSettings), settings);
        this._variants = AvatarGenerator.BuildVariantsMap(cfg);
        this._parts = cfg.parts;
    }
    get variants() {
        return Object.keys(this._variants);
    }
    static BuildVariantsMap({ parts, partsLocation, imageExtension, }) {
        const fileRegex = new RegExp(`(${parts.join('|')})(\\d+)${imageExtension}`);
        const discriminators = fs_1.default
            .readdirSync(partsLocation)
            .filter((partsDir) => fs_1.default.statSync(path_1.default.join(partsLocation, partsDir)).isDirectory());
        return discriminators.reduce((variants, discriminator) => {
            const dir = path_1.default.join(partsLocation, discriminator);
            variants[discriminator] = fs_1.default
                .readdirSync(dir)
                .reduce((parts, fileName) => {
                const match = fileRegex.exec(fileName);
                if (match) {
                    const part = match[1];
                    if (!parts[part]) {
                        parts[part] = [];
                    }
                    parts[part][parseInt(match[2])] = path_1.default.join(dir, fileName);
                }
                return parts;
            }, {});
            return variants;
        }, {});
    }
    getParts(id, variant) {
        const variantParts = this._variants[variant];
        if (!variantParts) {
            throw new Error(`variant '${variant}' is not supported. Supported variants: ${Object.keys(this._variants)}`);
        }
        const rng = seedrandom_1.default(id);
        return this._parts
            .map((partName) => {
            const partVariants = variantParts[partName];
            return (partVariants &&
                partVariants[Math.max(1, Math.floor(rng() * partVariants.length))]);
        })
            .filter(Boolean);
    }
    async generate(id, variant) {
        const parts = this.getParts(id, variant);
        if (!parts.length) {
            throw new Error(`variant '${variant}'does not contain any parts`);
        }
        const { width, height } = await sharp_1.default(parts[0]).metadata();
        const options = {
            raw: {
                width: width,
                height: height,
                channels: 4,
            },
        };
        const overlays = parts.map((part) => sharp_1.default(part).raw().toBuffer());
        let composite = overlays.shift();
        for (const overlay of overlays) {
            const [compositeData, overlayData] = await Promise.all([
                composite,
                overlay,
            ]);
            composite = sharp_1.default(compositeData, {
                raw: {
                    width: width,
                    height: height,
                    channels: 4,
                },
            })
                .composite([
                {
                    input: overlayData,
                    raw: {
                        width: width,
                        height: height,
                        channels: 4,
                    },
                },
            ])
                .raw()
                .toBuffer();
        }
        return sharp_1.default(await composite, {
            raw: {
                width: width,
                height: height,
                channels: 4,
            },
        });
    }
}
exports.default = AvatarGenerator;
module.exports = AvatarGenerator;
//# sourceMappingURL=index.js.map