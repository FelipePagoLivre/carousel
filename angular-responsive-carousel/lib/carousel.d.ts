import { Properties } from './interfaces';
export declare class Carousel {
    private properties;
    private utils;
    private cells;
    private container;
    private slide;
    cellsElement: HTMLElement;
    isSlideLengthLimited: boolean;
    isContentImages: boolean;
    visibleWidth: number;
    isLazyLoad: boolean;
    isContainerLocked: boolean;
    alignCells: "left" | "center";
    initialContainerPosition: number;
    autoplayId: any;
    startTime: any;
    containerPullLimit: number;
    get cellLength(): any;
    get cellLengthInLightDOMMode(): any;
    get lastCellIndex(): number;
    get overflowCellsLimit(): number;
    get isImagesLessCellLimit(): boolean;
    get cellLimit(): any;
    get isLightDOM(): boolean;
    get images(): any;
    get margin(): number;
    get minSwipeDistance(): number;
    get transitionDuration(): number;
    get transitionTimingFunction(): "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
    get fullCellWidth(): number;
    get visibleCellsCount(): number;
    get lapCounter(): number;
    get slideCounter(): any;
    constructor(properties: Properties, utils: any, cells: any, container: any, slide: any);
    init(): void;
    lineUpCells(): void;
    handleTouchstart: (event: any) => void;
    handleHorizontalSwipe: (event: any) => void;
    handleTouchend: (event: any) => void;
    handleTransitionend(): void;
    getImage(index: any): any;
    next(length?: number): void;
    prev(length?: number): void;
    isNextArrowDisabled: () => any;
    isPrevArrowDisabled: () => any;
    autoplay(): void;
    stopAutoplay(): void;
}
