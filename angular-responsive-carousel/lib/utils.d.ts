import { Properties as CarouselProperties } from './interfaces';
export declare class Utils {
    private carouselProperties;
    get images(): any;
    get overflowCellsLimit(): number;
    get isImagesLessCellLimit(): boolean;
    get visibleCellsCount(): number;
    get fullCellWidth(): number;
    get visibleWidth(): number;
    constructor(carouselProperties: CarouselProperties);
    getStartX(event: any): any;
    getMoveX(event: any): number;
    getCarouselElementPosition(): DOMRect;
}
