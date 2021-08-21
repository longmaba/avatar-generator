import { Sharp } from 'sharp';
export declare type AvatarPart = 'background' | 'face' | 'clothes' | 'head' | 'hair' | 'eye' | 'mouth';
export declare type AvatarGenearatorSettings = {
    parts: Array<AvatarPart>;
    imageExtension: string;
    partsLocation: string;
};
declare class AvatarGenerator {
    private _variants;
    private _parts;
    constructor(settings?: Partial<AvatarGenearatorSettings>);
    get variants(): string[];
    private static BuildVariantsMap;
    private getParts;
    generate(id: string, variant: string): Promise<Sharp>;
}
export default AvatarGenerator;
