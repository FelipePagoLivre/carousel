import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { Touches } from './touches';
import { Carousel } from './carousel';
import { Container } from './container';
import { Cells } from './cells';
import { Slide } from './slide';
import { Utils } from './utils';
export class CarouselComponent {
    constructor(elementRef, ref) {
        this.elementRef = elementRef;
        this.ref = ref;
        this.minTimeout = 30;
        this._cellWidth = 200;
        this._loop = false;
        this._lightDOM = false;
        this.events = new EventEmitter();
        this.height = 7;
        this.autoplay = false;
        this.autoplayInterval = 5000;
        this.pauseOnHover = true;
        this.dots = false;
        this.margin = 10;
        this.objectFit = 'cover';
        this.minSwipeDistance = 10;
        this.transitionDuration = 200;
        this.transitionTimingFunction = 'ease-out';
        this.counterSeparator = " / ";
        this.overflowCellsLimit = 3;
        this.listeners = 'mouse and touch';
        this.cellsToScroll = 1;
        this.freeScroll = false;
        this.arrows = true;
        this.arrowsTheme = 'light';
        this.hostClassCarousel = true;
        this.handleTouchstart = (event) => {
            //event.preventDefault();
            this.touches.addEventListeners("mousemove", "handleMousemove");
            this.carousel.handleTouchstart(event);
            this.isMoving = true;
        };
        this.handleHorizontalSwipe = (event) => {
            event.preventDefault();
            this.carousel.handleHorizontalSwipe(event);
        };
        this.handleTouchend = (event) => {
            const touches = event.touches;
            this.carousel.handleTouchend(event);
            this.touches.removeEventListeners("mousemove", "handleMousemove");
            this.isMoving = false;
        };
        this.handleTap = (event) => {
            let outboundEvent = {
                name: 'click'
            };
            let nodes = Array.prototype.slice.call(this.cellsElement.children);
            let cellElement = event.srcElement.closest(".carousel-cell");
            const i = nodes.indexOf(cellElement);
            const cellIndex = nodes.indexOf(cellElement);
            if (this.images) {
                //outboundEvent.fileIndex = this.carousel.getFileIndex(i);
                //outboundEvent.file = this.carousel.getFile(cellIndex);
            }
            else {
                outboundEvent.cellIndex = cellIndex;
            }
        };
    }
    get isContainerLocked() {
        return this.carousel.isContainerLocked;
    }
    get slideCounter() {
        return this.carousel.slideCounter;
    }
    get lapCounter() {
        return this.carousel.lapCounter;
    }
    get isLandscape() {
        return window.innerWidth > window.innerHeight;
    }
    get isSafari() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') !== -1) {
            return !(ua.indexOf('chrome') > -1);
        }
    }
    get counter() {
        let counter;
        if (this.loop) {
            counter = this.slideCounter % this.cellLength;
        }
        else {
            counter = this.slideCounter;
        }
        return counter + 1 + this.counterSeparator + this.cellLength;
    }
    get cellsElement() {
        return this.elementRef.nativeElement.querySelector('.carousel-cells');
    }
    get isArrows() {
        return this.arrows && !this.freeScroll;
    }
    get isCounter() {
        return this._isCounter && this.cellLength > 1;
    }
    get activeDotIndex() {
        return this.slideCounter % this.cellLength;
    }
    get cellLimit() {
        if (this.carousel) {
            return this.carousel.cellLimit;
        }
    }
    set images(images) {
        this._images = images;
    }
    get images() {
        return this._images;
    }
    set cellWidth(value) {
        if (value) {
            this._cellWidth = value;
        }
    }
    set isCounter(value) {
        if (value) {
            this._isCounter = value;
        }
    }
    set loop(value) {
        if (value) {
            this._loop = value;
        }
    }
    get loop() {
        if (this.images) {
            return this._loop;
        }
        else {
            return false;
        }
    }
    set lightDOM(value) {
        if (value) {
            this._lightDOM = value;
        }
    }
    get lightDOM() {
        if (this.images) {
            return this._lightDOM;
        }
        else {
            return false;
        }
    }
    onWindowResize(event) {
        this.landscapeMode = this.isLandscape;
        this.ref.detectChanges();
        this.initCarousel();
        this.carousel.lineUpCells();
    }
    onMousemove(event) {
        if (this.autoplay && this.pauseOnHover) {
            this.carousel.stopAutoplay();
        }
    }
    onMouseleave(event) {
        if (this.autoplay && this.pauseOnHover) {
            this.carousel.autoplay();
        }
    }
    ngOnInit() {
        this.isNgContent = this.cellsElement.children.length > 0;
        this.touches = new Touches({
            element: this.cellsElement,
            listeners: this.listeners,
            mouseListeners: {
                "mousedown": "handleMousedown",
                "mouseup": "handleMouseup"
            }
        });
        this.touches.on('touchstart', this.handleTouchstart);
        this.touches.on('horizontal-swipe', this.handleHorizontalSwipe);
        this.touches.on('touchend', this.handleTouchend);
        this.touches.on('mousedown', this.handleTouchstart);
        this.touches.on('mouseup', this.handleTouchend);
        this.touches.on('tap', this.handleTap);
        this.setDimensions();
    }
    ngAfterViewInit() {
        this.initCarousel();
        if (this.autoplay) {
            this.carousel.autoplay();
        }
        this.cellLength = this.getCellLength();
        this.dotsArr = Array(this.cellLength).fill(1);
        this.ref.detectChanges();
        this.carousel.lineUpCells();
        /* Start detecting changes in the DOM tree */
        this.detectDomChanges();
    }
    ngOnChanges(changes) {
        if (changes.width || changes.height || changes.images) {
            this.setDimensions();
            this.initCarousel();
            this.carousel.lineUpCells();
            this.ref.detectChanges();
        }
    }
    ngOnDestroy() {
        this.touches.destroy();
        //this.carousel.destroy();
    }
    initCarousel() {
        let carouselProperties = {
            id: this.id,
            cellsElement: this.elementRef.nativeElement.querySelector('.carousel-cells'),
            hostElement: this.elementRef.nativeElement,
            images: this.images,
            cellWidth: this.getCellWidth(),
            loop: this.loop,
            autoplayInterval: this.autoplayInterval,
            overflowCellsLimit: this.overflowCellsLimit,
            visibleWidth: this.width,
            margin: this.margin,
            minSwipeDistance: this.minSwipeDistance,
            transitionDuration: this.transitionDuration,
            transitionTimingFunction: this.transitionTimingFunction,
            videoProperties: this.videoProperties,
            eventHandler: this.events,
            freeScroll: this.freeScroll,
            lightDOM: this.lightDOM
        };
        this.utils = new Utils(carouselProperties);
        this.cells = new Cells(carouselProperties, this.utils);
        this.container = new Container(carouselProperties, this.utils, this.cells);
        this.slide = new Slide(carouselProperties, this.utils, this.cells, this.container);
        this.carousel = new Carousel(carouselProperties, this.utils, this.cells, this.container, this.slide);
    }
    detectDomChanges() {
        const observer = new MutationObserver((mutations) => {
            this.onDomChanges();
        });
        var config = {
            attributes: true,
            childList: true,
            characterData: true
        };
        observer.observe(this.elementRef.nativeElement, config);
    }
    onDomChanges() {
        this.cellLength = this.getCellLength();
        this.carousel.lineUpCells();
        this.ref.detectChanges();
    }
    setDimensions() {
        this.hostStyleHeight = this.height + 'vw';
        this.hostStyleWidth = this.width + 'px';
    }
    getImage(index) {
        return this.carousel.getImage(index);
    }
    handleTransitionendCellContainer(event) {
        this.carousel.handleTransitionend();
    }
    toggleVideo(video) {
        event.preventDefault();
        if (this.videoProperties.noPlay) {
            return;
        }
        if (video.paused) {
            video.play();
            this.isVideoPlaying = true;
        }
        else {
            video.pause();
            this.isVideoPlaying = false;
        }
        this.ref.detectChanges();
    }
    getCellWidth() {
        let elementWidth = this.elementRef.nativeElement.clientWidth;
        if (this.cellsToShow) {
            let margin = this.cellsToShow > 1 ? this.margin : 0;
            let totalMargin = margin * (this.cellsToShow - 1);
            return (elementWidth - totalMargin) / this.cellsToShow;
        }
        if (this._cellWidth === '100%') {
            return elementWidth;
        }
        else {
            return this._cellWidth;
        }
    }
    next() {
        this.carousel.next(this.cellsToScroll);
        this.carousel.stopAutoplay();
    }
    prev() {
        this.carousel.prev(this.cellsToScroll);
        this.carousel.stopAutoplay();
    }
    isNextArrowDisabled() {
        if (this.carousel) {
            return this.carousel.isNextArrowDisabled();
        }
    }
    isPrevArrowDisabled() {
        if (this.carousel) {
            return this.carousel.isPrevArrowDisabled();
        }
    }
    getCellLength() {
        if (this.images) {
            return this.images.length;
        }
        else {
            return this.cellsElement.children.length;
        }
    }
}
CarouselComponent.decorators = [
    { type: Component, args: [{
                selector: 'carousel, [carousel]',
                template: "<div class=\"carousel-counter\" *ngIf=\"isCounter\">{{counter}}</div>\n\n<div class=\"carousel-container\" [class.carousel-moving]=\"isMoving\">\n\t<div class=\"carousel-cells\" #cells (transitionend)=\"handleTransitionendCellContainer($event)\">\n\t\t<ng-content></ng-content>\n\n\t\t<ng-template ngFor let-image [ngForOf]=\"images\" let-i=\"index\">\n\t\t\t<div class=\"carousel-cell\" \n\t\t\t\t[style.width]=\"getCellWidth()+'px'\"\n\t\t\t\t[style.border-radius]=\"borderRadius+'px'\"\n\t\t\t\t*ngIf=\"i < cellLimit\">\n\t\t\t\t<!-- Image -->\n\t\t\t\t<img \n\t\t\t\t\t*ngIf=\"getImage(i) && getImage(i)['image']\" \n\t\t\t\t\t[src]=\"getImage(i)['image']['path']\"\n\t\t\t\t\t[style.object-fit]=\"objectFit\"\n\t\t\t\t\tdraggable=\"false\" />\n\n\t\t\t</div>\n\t\t</ng-template>\n\t</div>\n\n\t<div class=\"carousel-dots\" *ngIf=\"dots\">\n\t\t<div class=\"carousel-dot\" [class.carousel-dot-active]=\"i === activeDotIndex\" *ngFor=\"let dot of dotsArr; index as i\"></div>\n\t</div>\n</div>\n\n<div class=\"carousel-arrows\" \n\t[class.carousel-arrows-outside]=\"arrowsOutside\" \n\t[class.carousel-dark-arrows]=\"arrowsTheme === 'dark'\"\n\t*ngIf=\"isArrows\">\n\t\n\t<div id=\"x-arrow-prev\" class=\"carousel-arrow carousel-arrow-prev\" [class.carousel-arrow-disabled]=\"isPrevArrowDisabled()\" (click)=\"prev()\"></div>\n\t<div id=\"x-arrow-next\" class=\"carousel-arrow carousel-arrow-next\" [class.carousel-arrow-disabled]=\"isNextArrowDisabled()\" (click)=\"next()\"></div>\n</div>",
                styles: [":host{-moz-user-select:none;-webkit-user-select:none;box-sizing:border-box;display:block;height:7vw;left:0;position:relative;top:0;transform-origin:top left;user-select:none;width:100%;z-index:10000}:host .carousel-container{cursor:grab;height:7vw;overflow:hidden;width:100%}:host .carousel-container.carousel-moving{cursor:grabbing}:host .carousel-counter{background-color:rgba(23,37,68,.3);border-radius:13px;color:#fff;font-size:11px;line-height:normal;padding:5px 7px;position:absolute;right:24px;text-align:right;top:8px;transition:opacity .2s;z-index:30}:host ::ng-deep .carousel-cells{display:block;height:100%;transition:transform .2s;width:100%;will-change:transform}:host ::ng-deep .carousel-cells .carousel-cell.swiper-prev-image{transform:translate3d(-100%,0,0)}:host ::ng-deep .carousel-cells .carousel-cell.swiper-next-image{transform:translate3d(100%,0,0)}:host ::ng-deep .carousel-cells .carousel-cell{height:100%;overflow:hidden;position:absolute;width:100%}:host ::ng-deep .carousel-cells .carousel-cell img,:host ::ng-deep .carousel-cells .carousel-cell video{height:100%;object-fit:contain;position:relative;width:100%}:host ::ng-deep .carousel-cells .carousel-cell img.swiper-hide{display:none}:host ::ng-deep .carousel-cells .carousel-cell .carousel-play{bottom:0;left:0;position:absolute;right:0;top:0;z-index:1}:host .carousel-arrow{background-color:#fff;background-position:50%;background-repeat:no-repeat;background-size:31px;border-radius:100px;box-shadow:0 0 5px rgba(0,0,0,.15);cursor:pointer;height:40px;margin-top:-20px;position:absolute;top:50%;width:40px;z-index:10}:host .carousel-arrow-prev{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMTUuNDEgMTYuNTlMMTAuODMgMTJsNC41OC00LjU5TDE0IDZsLTYgNiA2IDYgMS40MS0xLjQxeiIvPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMFYweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==);left:10px}:host .carousel-arrow-next{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNOC41OSAxNi41OUwxMy4xNyAxMiA4LjU5IDcuNDEgMTAgNmw2IDYtNiA2LTEuNDEtMS40MXoiLz48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=);right:10px}:host .carousel-arrows-outside .carousel-arrow-prev{left:-60px}:host .carousel-arrows-outside .carousel-arrow-next{right:-60px}:host .carousel-dark-arrows .carousel-arrow{filter:invert(1)}:host .carousel-arrow-disabled{cursor:default;opacity:.5}:host .carousel-dots{bottom:0;left:0;position:absolute;right:0;text-align:center;z-index:10}:host .carousel-dots .carousel-dot{border:2px solid #fff;border-radius:100px;display:inline-block;height:8px;margin:4px;width:8px}:host .carousel-dots .carousel-dot-active{background-color:#fff}"]
            },] }
];
CarouselComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
CarouselComponent.propDecorators = {
    events: [{ type: Output }],
    id: [{ type: Input }],
    height: [{ type: Input }],
    width: [{ type: Input }],
    autoplay: [{ type: Input }],
    autoplayInterval: [{ type: Input }],
    pauseOnHover: [{ type: Input }],
    dots: [{ type: Input }],
    borderRadius: [{ type: Input }],
    margin: [{ type: Input }],
    objectFit: [{ type: Input }],
    minSwipeDistance: [{ type: Input }],
    transitionDuration: [{ type: Input }],
    transitionTimingFunction: [{ type: Input }],
    videoProperties: [{ type: Input }],
    counterSeparator: [{ type: Input }],
    overflowCellsLimit: [{ type: Input }],
    listeners: [{ type: Input }],
    cellsToShow: [{ type: Input }],
    cellsToScroll: [{ type: Input }],
    freeScroll: [{ type: Input }],
    arrows: [{ type: Input }],
    arrowsOutside: [{ type: Input }],
    arrowsTheme: [{ type: Input }],
    images: [{ type: Input }],
    cellWidth: [{ type: Input, args: ['cellWidth',] }],
    isCounter: [{ type: Input, args: ['counter',] }],
    loop: [{ type: Input, args: ['loop',] }],
    lightDOM: [{ type: Input, args: ['lightDOM',] }],
    hostClassCarousel: [{ type: HostBinding, args: ['class.carousel',] }],
    hostStyleHeight: [{ type: HostBinding, args: ['style.height',] }],
    hostStyleWidth: [{ type: HostBinding, args: ['style.width',] }],
    onWindowResize: [{ type: HostListener, args: ['window:resize', ['$event'],] }],
    onMousemove: [{ type: HostListener, args: ['mousemove', ['$event'],] }],
    onMouseleave: [{ type: HostListener, args: ['mouseleave', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1yZXNwb25zaXZlLWNhcm91c2VsL3NyYy9saWIvY2Fyb3VzZWwuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFhLFlBQVksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQTJCLE1BQU0sZUFBZSxDQUFDO0FBR3BLLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBUzlCLE1BQU0sT0FBTyxpQkFBaUI7SUFvTDFCLFlBQ1ksVUFBc0IsRUFDdEIsR0FBc0I7UUFEdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixRQUFHLEdBQUgsR0FBRyxDQUFtQjtRQTVLbEMsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUloQixlQUFVLEdBQW9CLEdBQUcsQ0FBQztRQUNsQyxVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUErRGpCLFdBQU0sR0FBeUIsSUFBSSxZQUFZLEVBQVcsQ0FBQztRQUc1RCxXQUFNLEdBQVcsR0FBRyxDQUFDO1FBRXJCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIscUJBQWdCLEdBQVcsSUFBSSxDQUFDO1FBQ2hDLGlCQUFZLEdBQVksSUFBSSxDQUFDO1FBQzdCLFNB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QkFFTCxLQUFLO3dCQVFMLEtBQUssU0FBQyxXQUFXO3dCQU1qQixLQUFLLFNBQUMsU0FBUzttQkFNZixLQUFLLFNBQUMsTUFBTTt1QkFjWixLQUFLLFNBQUMsVUFBVTtnQ0FjaEIsV0FBVyxTQUFDLGdCQUFnQjs4QkFDNUIsV0FBVyxTQUFDLGNBQWM7NkJBQzFCLFdBQVcsU0FBQyxhQUFhOzZCQUV6QixZQUFZLFNBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDOzBCQVN4QyxZQUFZLFNBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDOzJCQU9wQyxZQUFZLFNBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBWaWV3Q2hpbGQsIEV2ZW50RW1pdHRlciwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE91dHB1dCwgT25EZXN0cm95LCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJbWFnZXN9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1RvdWNoZXN9IGZyb20gJy4vdG91Y2hlcyc7XG5pbXBvcnQge0Nhcm91c2VsfSBmcm9tICcuL2Nhcm91c2VsJztcbmltcG9ydCB7Q29udGFpbmVyfSBmcm9tICcuL2NvbnRhaW5lcic7XG5pbXBvcnQge0NlbGxzfSBmcm9tICcuL2NlbGxzJztcbmltcG9ydCB7U2xpZGV9IGZyb20gJy4vc2xpZGUnO1xuaW1wb3J0IHtVdGlsc30gZnJvbSAnLi91dGlscyc7XG5cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdjYXJvdXNlbCwgW2Nhcm91c2VsXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2Nhcm91c2VsLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9jYXJvdXNlbC5jb21wb25lbnQuc2FzcyddXG59KVxuXG5leHBvcnQgY2xhc3MgQ2Fyb3VzZWxDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAgIGNhcm91c2VsO1xuICAgIGNvbnRhaW5lcjtcbiAgICB1dGlscztcbiAgICBjZWxscztcbiAgICBzbGlkZTtcbiAgICBfaWQ6IHN0cmluZztcbiAgICBfaW1hZ2VzOiBJbWFnZXM7XG4gICAgdG91Y2hlczogYW55O1xuICAgIGxhbmRzY2FwZU1vZGU6IGFueTtcbiAgICBtaW5UaW1lb3V0ID0gMzA7XG4gICAgaXNWaWRlb1BsYXlpbmc6IGJvb2xlYW47XG4gICAgX2lzQ291bnRlcjogYm9vbGVhbjtcbiAgICBfd2lkdGg6IG51bWJlcjtcbiAgICBfY2VsbFdpZHRoOiBudW1iZXIgfCAnMTAwJScgPSAyMDA7XG4gICAgX2xvb3A6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBfbGlnaHRET006IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBpc01vdmluZzogYm9vbGVhbjtcbiAgICBpc05nQ29udGVudDogYm9vbGVhbjtcbiAgICBjZWxsTGVuZ3RoOiBudW1iZXI7XG4gICAgZG90c0FycjogYW55O1xuXG4gICAgZ2V0IGlzQ29udGFpbmVyTG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbC5pc0NvbnRhaW5lckxvY2tlZDtcbiAgICB9XG5cbiAgICBnZXQgc2xpZGVDb3VudGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbC5zbGlkZUNvdW50ZXI7XG4gICAgfVxuXG4gICAgZ2V0IGxhcENvdW50ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsLmxhcENvdW50ZXI7XG4gICAgfVxuXG4gICAgZ2V0IGlzTGFuZHNjYXBlKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmlubmVyV2lkdGggPiB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0IGlzU2FmYXJpKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAodWEuaW5kZXhPZignc2FmYXJpJykgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gISh1YS5pbmRleE9mKCdjaHJvbWUnKSA+IC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBjb3VudGVyKCkge1xuICAgICAgICBsZXQgY291bnRlcjtcblxuICAgICAgICBpZiAodGhpcy5sb29wKSB7XG4gICAgICAgICAgICBjb3VudGVyID0gdGhpcy5zbGlkZUNvdW50ZXIgJSB0aGlzLmNlbGxMZW5ndGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudGVyID0gdGhpcy5zbGlkZUNvdW50ZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY291bnRlciArIDEgKyB0aGlzLmNvdW50ZXJTZXBhcmF0b3IgKyB0aGlzLmNlbGxMZW5ndGg7XG4gICAgfVxuXG4gICAgZ2V0IGNlbGxzRWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJvdXNlbC1jZWxscycpO1xuICAgIH1cblxuICAgIGdldCBpc0Fycm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyb3dzICYmICF0aGlzLmZyZWVTY3JvbGw7XG4gICAgfVxuXG4gICAgZ2V0IGlzQ291bnRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQ291bnRlciAmJiB0aGlzLmNlbGxMZW5ndGggPiAxO1xuICAgIH1cblxuICAgIGdldCBhY3RpdmVEb3RJbmRleCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2xpZGVDb3VudGVyICUgdGhpcy5jZWxsTGVuZ3RoO1xuICAgIH1cblxuICAgIGdldCBjZWxsTGltaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmNhcm91c2VsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbC5jZWxsTGltaXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXIgPCBhbnkgPiA9IG5ldyBFdmVudEVtaXR0ZXIgPCBhbnkgPiAoKTtcblxuICAgIEBJbnB1dCgpIGlkOiBudW1iZXI7XG4gICAgQElucHV0KCkgaGVpZ2h0OiBudW1iZXIgPSAyMDA7XG4gICAgQElucHV0KCkgd2lkdGg6IG51bWJlcjtcbiAgICBASW5wdXQoKSBhdXRvcGxheTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIGF1dG9wbGF5SW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XG4gICAgQElucHV0KCkgcGF1c2VPbkhvdmVyOiBib29sZWFuID0gdHJ1ZTtcbiAgICBASW5wdXQoKSBkb3RzOiBib29sZWFuID0gZmFsc2U7XG4gICAgQElucHV0KCkgYm9yZGVyUmFkaXVzOiBudW1iZXI7XG4gICAgQElucHV0KCkgbWFyZ2luOiBudW1iZXIgPSAxMDtcbiAgICBASW5wdXQoKSBvYmplY3RGaXQ6ICdjb250YWluJyB8ICdjb3ZlcicgfCAnbm9uZScgPSAnY292ZXInO1xuICAgIEBJbnB1dCgpIG1pblN3aXBlRGlzdGFuY2U6IG51bWJlciA9IDEwO1xuICAgIEBJbnB1dCgpIHRyYW5zaXRpb25EdXJhdGlvbjogbnVtYmVyID0gMjAwO1xuICAgIEBJbnB1dCgpIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogJ2Vhc2UnIHwgJ2Vhc2UtaW4nIHwgJ2Vhc2Utb3V0JyB8ICdlYXNlLWluLW91dCcgfCAnbGluZWFyJyA9ICdlYXNlLW91dCc7XG4gICAgQElucHV0KCkgdmlkZW9Qcm9wZXJ0aWVzOiBhbnk7XG4gICAgQElucHV0KCkgY291bnRlclNlcGFyYXRvcjogc3RyaW5nID0gXCIgLyBcIjtcbiAgICBASW5wdXQoKSBvdmVyZmxvd0NlbGxzTGltaXQ6IG51bWJlciA9IDM7XG4gICAgQElucHV0KCkgbGlzdGVuZXJzOiAnYXV0bycgfCAnbW91c2UgYW5kIHRvdWNoJyA9ICdtb3VzZSBhbmQgdG91Y2gnO1xuICAgIEBJbnB1dCgpIGNlbGxzVG9TaG93OiBudW1iZXI7XG4gICAgQElucHV0KCkgY2VsbHNUb1Njcm9sbDogbnVtYmVyID0gMTtcbiAgICBASW5wdXQoKSBmcmVlU2Nyb2xsOiBib29sZWFuID0gZmFsc2U7XG4gICAgQElucHV0KCkgYXJyb3dzOiBib29sZWFuID0gdHJ1ZTtcbiAgICBASW5wdXQoKSBhcnJvd3NPdXRzaWRlOiBib29sZWFuO1xuICAgIEBJbnB1dCgpIGFycm93c1RoZW1lOiAnbGlnaHQnIHwgJ2RhcmsnID0gJ2xpZ2h0JztcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGltYWdlcyhpbWFnZXM6IEltYWdlcyAmIGFueSkge1xuICAgICAgICB0aGlzLl9pbWFnZXMgPSBpbWFnZXM7XG4gICAgfVxuICAgIGdldCBpbWFnZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbWFnZXM7XG4gICAgfVxuXG4gICAgQElucHV0KCdjZWxsV2lkdGgnKSBzZXQgY2VsbFdpZHRoKHZhbHVlOiBudW1iZXIgfCAnMTAwJScpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9jZWxsV2lkdGggPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgnY291bnRlcicpIHNldCBpc0NvdW50ZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0NvdW50ZXIgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgnbG9vcCcpIHNldCBsb29wKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbG9vcCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGxvb3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoJ2xpZ2h0RE9NJykgc2V0IGxpZ2h0RE9NKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbGlnaHRET00gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBsaWdodERPTSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGlnaHRET007XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmNhcm91c2VsJykgaG9zdENsYXNzQ2Fyb3VzZWw6IGJvb2xlYW4gPSB0cnVlO1xuICAgIEBIb3N0QmluZGluZygnc3R5bGUuaGVpZ2h0JykgaG9zdFN0eWxlSGVpZ2h0OiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdzdHlsZS53aWR0aCcpIGhvc3RTdHlsZVdpZHRoOiBzdHJpbmc7XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJywgWyckZXZlbnQnXSlcbiAgICBvbldpbmRvd1Jlc2l6ZShldmVudDogYW55KSB7XG4gICAgICAgIHRoaXMubGFuZHNjYXBlTW9kZSA9IHRoaXMuaXNMYW5kc2NhcGU7XG4gICAgICAgIHRoaXMucmVmLmRldGVjdENoYW5nZXMoKTtcblxuICAgICAgICB0aGlzLmluaXRDYXJvdXNlbCgpO1xuICAgICAgICB0aGlzLmNhcm91c2VsLmxpbmVVcENlbGxzKCk7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignbW91c2Vtb3ZlJywgWyckZXZlbnQnXSlcbiAgICBvbk1vdXNlbW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5hdXRvcGxheSAmJiB0aGlzLnBhdXNlT25Ib3Zlcikge1xuICAgICAgICAgICAgdGhpcy5jYXJvdXNlbC5zdG9wQXV0b3BsYXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBbJyRldmVudCddKVxuICAgIG9uTW91c2VsZWF2ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5hdXRvcGxheSAmJiB0aGlzLnBhdXNlT25Ib3Zlcikge1xuICAgICAgICAgICAgdGhpcy5jYXJvdXNlbC5hdXRvcGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmKSB7XG5cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5pc05nQ29udGVudCA9IHRoaXMuY2VsbHNFbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgdGhpcy50b3VjaGVzID0gbmV3IFRvdWNoZXMoe1xuICAgICAgICAgICAgZWxlbWVudDogdGhpcy5jZWxsc0VsZW1lbnQsXG4gICAgICAgICAgICBsaXN0ZW5lcnM6IHRoaXMubGlzdGVuZXJzLFxuICAgICAgICAgICAgbW91c2VMaXN0ZW5lcnM6IHtcbiAgICAgICAgICAgICAgICBcIm1vdXNlZG93blwiOiBcImhhbmRsZU1vdXNlZG93blwiLFxuICAgICAgICAgICAgICAgIFwibW91c2V1cFwiOiBcImhhbmRsZU1vdXNldXBcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRvdWNoZXMub24oJ3RvdWNoc3RhcnQnLCB0aGlzLmhhbmRsZVRvdWNoc3RhcnQpO1xuICAgICAgICB0aGlzLnRvdWNoZXMub24oJ2hvcml6b250YWwtc3dpcGUnLCB0aGlzLmhhbmRsZUhvcml6b250YWxTd2lwZSk7XG4gICAgICAgIHRoaXMudG91Y2hlcy5vbigndG91Y2hlbmQnLCB0aGlzLmhhbmRsZVRvdWNoZW5kKTtcbiAgICAgICAgdGhpcy50b3VjaGVzLm9uKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZVRvdWNoc3RhcnQpO1xuICAgICAgICB0aGlzLnRvdWNoZXMub24oJ21vdXNldXAnLCB0aGlzLmhhbmRsZVRvdWNoZW5kKTtcbiAgICAgICAgdGhpcy50b3VjaGVzLm9uKCd0YXAnLCB0aGlzLmhhbmRsZVRhcCk7XG5cbiAgICAgICAgdGhpcy5zZXREaW1lbnNpb25zKCk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICB0aGlzLmluaXRDYXJvdXNlbCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmF1dG9wbGF5KSB7XG4gICAgICAgICAgICB0aGlzLmNhcm91c2VsLmF1dG9wbGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNlbGxMZW5ndGggPSB0aGlzLmdldENlbGxMZW5ndGgoKTtcbiAgICAgICAgdGhpcy5kb3RzQXJyID0gQXJyYXkodGhpcy5jZWxsTGVuZ3RoKS5maWxsKDEpO1xuICAgICAgICB0aGlzLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIHRoaXMuY2Fyb3VzZWwubGluZVVwQ2VsbHMoKTtcblxuICAgICAgICAvKiBTdGFydCBkZXRlY3RpbmcgY2hhbmdlcyBpbiB0aGUgRE9NIHRyZWUgKi9cbiAgICAgICAgdGhpcy5kZXRlY3REb21DaGFuZ2VzKCk7XG4gICAgfVxuXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlcy53aWR0aCB8fCBjaGFuZ2VzLmhlaWdodCB8fCBjaGFuZ2VzLmltYWdlcykge1xuICAgICAgICAgICAgdGhpcy5zZXREaW1lbnNpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmluaXRDYXJvdXNlbCgpO1xuICAgICAgICAgICAgdGhpcy5jYXJvdXNlbC5saW5lVXBDZWxscygpO1xuICAgICAgICAgICAgdGhpcy5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudG91Y2hlcy5kZXN0cm95KCk7XG4gICAgICAgIC8vdGhpcy5jYXJvdXNlbC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgaW5pdENhcm91c2VsKCkge1xuICAgICAgICBsZXQgY2Fyb3VzZWxQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBjZWxsc0VsZW1lbnQ6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJvdXNlbC1jZWxscycpLFxuICAgICAgICAgICAgaG9zdEVsZW1lbnQ6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgICAgICAgaW1hZ2VzOiB0aGlzLmltYWdlcyxcbiAgICAgICAgICAgIGNlbGxXaWR0aDogdGhpcy5nZXRDZWxsV2lkdGgoKSxcbiAgICAgICAgICAgIGxvb3A6IHRoaXMubG9vcCxcbiAgICAgICAgICAgIGF1dG9wbGF5SW50ZXJ2YWw6IHRoaXMuYXV0b3BsYXlJbnRlcnZhbCxcbiAgICAgICAgICAgIG92ZXJmbG93Q2VsbHNMaW1pdDogdGhpcy5vdmVyZmxvd0NlbGxzTGltaXQsXG4gICAgICAgICAgICB2aXNpYmxlV2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgICAgICBtYXJnaW46IHRoaXMubWFyZ2luLFxuICAgICAgICAgICAgbWluU3dpcGVEaXN0YW5jZTogdGhpcy5taW5Td2lwZURpc3RhbmNlLFxuICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiB0aGlzLnRyYW5zaXRpb25EdXJhdGlvbixcbiAgICAgICAgICAgIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogdGhpcy50cmFuc2l0aW9uVGltaW5nRnVuY3Rpb24sXG4gICAgICAgICAgICB2aWRlb1Byb3BlcnRpZXM6IHRoaXMudmlkZW9Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgZXZlbnRIYW5kbGVyOiB0aGlzLmV2ZW50cyxcbiAgICAgICAgICAgIGZyZWVTY3JvbGw6IHRoaXMuZnJlZVNjcm9sbCxcbiAgICAgICAgICAgIGxpZ2h0RE9NOiB0aGlzLmxpZ2h0RE9NXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51dGlscyA9IG5ldyBVdGlscyhjYXJvdXNlbFByb3BlcnRpZXMpO1xuICAgICAgICB0aGlzLmNlbGxzID0gbmV3IENlbGxzKGNhcm91c2VsUHJvcGVydGllcywgdGhpcy51dGlscyk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihjYXJvdXNlbFByb3BlcnRpZXMsIHRoaXMudXRpbHMsIHRoaXMuY2VsbHMpO1xuICAgICAgICB0aGlzLnNsaWRlID0gbmV3IFNsaWRlKGNhcm91c2VsUHJvcGVydGllcywgdGhpcy51dGlscywgdGhpcy5jZWxscywgdGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmNhcm91c2VsID0gbmV3IENhcm91c2VsKGNhcm91c2VsUHJvcGVydGllcywgdGhpcy51dGlscywgdGhpcy5jZWxscywgdGhpcy5jb250YWluZXIsIHRoaXMuc2xpZGUpO1xuICAgIH1cblxuICAgIGRldGVjdERvbUNoYW5nZXMoKSB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkRvbUNoYW5nZXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIGNvbmZpZyk7XG4gICAgfVxuXG4gICAgb25Eb21DaGFuZ2VzKCkge1xuICAgICAgICB0aGlzLmNlbGxMZW5ndGggPSB0aGlzLmdldENlbGxMZW5ndGgoKTtcbiAgICAgICAgdGhpcy5jYXJvdXNlbC5saW5lVXBDZWxscygpO1xuICAgICAgICB0aGlzLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfVxuXG4gICAgc2V0RGltZW5zaW9ucygpIHtcbiAgICAgICAgdGhpcy5ob3N0U3R5bGVIZWlnaHQgPSB0aGlzLmhlaWdodCArICdweCc7XG4gICAgICAgIHRoaXMuaG9zdFN0eWxlV2lkdGggPSB0aGlzLndpZHRoICsgJ3B4JztcbiAgICB9XG5cbiAgICBnZXRJbWFnZShpbmRleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbC5nZXRJbWFnZShpbmRleCk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hzdGFydCA9IChldmVudDogYW55KSA9PiB7XG4gICAgICAgIC8vZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50b3VjaGVzLmFkZEV2ZW50TGlzdGVuZXJzKFwibW91c2Vtb3ZlXCIsIFwiaGFuZGxlTW91c2Vtb3ZlXCIpO1xuICAgICAgICB0aGlzLmNhcm91c2VsLmhhbmRsZVRvdWNoc3RhcnQoZXZlbnQpO1xuICAgICAgICB0aGlzLmlzTW92aW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVIb3Jpem9udGFsU3dpcGUgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmNhcm91c2VsLmhhbmRsZUhvcml6b250YWxTd2lwZShldmVudCk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hlbmQgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB0b3VjaGVzID0gZXZlbnQudG91Y2hlcztcbiAgICAgICAgdGhpcy5jYXJvdXNlbC5oYW5kbGVUb3VjaGVuZChldmVudCk7XG4gICAgICAgIHRoaXMudG91Y2hlcy5yZW1vdmVFdmVudExpc3RlbmVycyhcIm1vdXNlbW92ZVwiLCBcImhhbmRsZU1vdXNlbW92ZVwiKTtcbiAgICAgICAgdGhpcy5pc01vdmluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGhhbmRsZVRhcCA9IChldmVudDogYW55KSA9PiB7XG4gICAgICAgIGxldCBvdXRib3VuZEV2ZW50OiBhbnkgPSB7XG4gICAgICAgICAgICBuYW1lOiAnY2xpY2snXG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5jZWxsc0VsZW1lbnQuY2hpbGRyZW4pO1xuICAgICAgICBsZXQgY2VsbEVsZW1lbnQgPSBldmVudC5zcmNFbGVtZW50LmNsb3Nlc3QoXCIuY2Fyb3VzZWwtY2VsbFwiKTtcbiAgICAgICAgY29uc3QgaSA9IG5vZGVzLmluZGV4T2YoY2VsbEVsZW1lbnQpO1xuICAgICAgICBjb25zdCBjZWxsSW5kZXggPSBub2Rlcy5pbmRleE9mKGNlbGxFbGVtZW50KTtcblxuICAgICAgICBpZiAodGhpcy5pbWFnZXMpIHtcbiAgICAgICAgICAgIC8vb3V0Ym91bmRFdmVudC5maWxlSW5kZXggPSB0aGlzLmNhcm91c2VsLmdldEZpbGVJbmRleChpKTtcbiAgICAgICAgICAgIC8vb3V0Ym91bmRFdmVudC5maWxlID0gdGhpcy5jYXJvdXNlbC5nZXRGaWxlKGNlbGxJbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRib3VuZEV2ZW50LmNlbGxJbmRleCA9IGNlbGxJbmRleDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZVRyYW5zaXRpb25lbmRDZWxsQ29udGFpbmVyKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuY2Fyb3VzZWwuaGFuZGxlVHJhbnNpdGlvbmVuZCgpO1xuICAgIH1cblxuICAgIHRvZ2dsZVZpZGVvKHZpZGVvKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnZpZGVvUHJvcGVydGllcy5ub1BsYXkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2aWRlby5wYXVzZWQpIHtcbiAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuaXNWaWRlb1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgICAgIHRoaXMuaXNWaWRlb1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG5cbiAgICBnZXRDZWxsV2lkdGgoKSB7XG4gICAgICAgIGxldCBlbGVtZW50V2lkdGggPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgICAgICBpZiAodGhpcy5jZWxsc1RvU2hvdykge1xuICAgICAgICAgICAgbGV0IG1hcmdpbiA9IHRoaXMuY2VsbHNUb1Nob3cgPiAxID8gdGhpcy5tYXJnaW4gOiAwO1xuICAgICAgICAgICAgbGV0IHRvdGFsTWFyZ2luID0gbWFyZ2luICogKHRoaXMuY2VsbHNUb1Nob3cgLSAxKTtcbiAgICAgICAgICAgIHJldHVybiAoZWxlbWVudFdpZHRoIC0gdG90YWxNYXJnaW4pIC8gdGhpcy5jZWxsc1RvU2hvdztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9jZWxsV2lkdGggPT09ICcxMDAlJykge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jZWxsV2lkdGg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZXh0KCkge1xuICAgICAgICB0aGlzLmNhcm91c2VsLm5leHQodGhpcy5jZWxsc1RvU2Nyb2xsKTtcbiAgICAgICAgdGhpcy5jYXJvdXNlbC5zdG9wQXV0b3BsYXkoKTtcbiAgICB9XG5cbiAgICBwcmV2KCkge1xuICAgICAgICB0aGlzLmNhcm91c2VsLnByZXYodGhpcy5jZWxsc1RvU2Nyb2xsKTtcbiAgICAgICAgdGhpcy5jYXJvdXNlbC5zdG9wQXV0b3BsYXkoKTtcbiAgICB9XG5cbiAgICBpc05leHRBcnJvd0Rpc2FibGVkKCkge1xuICAgICAgICBpZiAodGhpcy5jYXJvdXNlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2Fyb3VzZWwuaXNOZXh0QXJyb3dEaXNhYmxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNQcmV2QXJyb3dEaXNhYmxlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2Fyb3VzZWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsLmlzUHJldkFycm93RGlzYWJsZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldENlbGxMZW5ndGgoKSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1hZ2VzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNlbGxzRWxlbWVudC5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG59Il19