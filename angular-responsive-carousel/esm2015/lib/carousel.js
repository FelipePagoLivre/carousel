export class Carousel {
    constructor(properties, utils, cells, container, slide) {
        this.properties = properties;
        this.utils = utils;
        this.cells = cells;
        this.container = container;
        this.slide = slide;
        this.isContentImages = true;
        this.isLazyLoad = true;
        this.isContainerLocked = true;
        this.alignCells = "left";
        this.initialContainerPosition = 0;
        this.containerPullLimit = 100;
        this.handleTouchstart = (event) => {
            this.container.handleTouchstart();
            this.slide.handleTouchstart(event);
        };
        this.handleHorizontalSwipe = (event) => {
            this.container.handleHorizontalSwipe();
        };
        this.handleTouchend = (event) => {
            if (this.properties.freeScroll) {
                this.container.handleTouchend();
            }
            else {
                this.container.handleTouchend(true);
                this.slide.handleTouchend(event);
            }
        };
        this.isNextArrowDisabled = () => {
            return this.slide.isNextArrowDisabled();
        };
        this.isPrevArrowDisabled = () => {
            return this.slide.isPrevArrowDisabled();
        };
        this.init();
    }
    get cellLength() {
        return this.cells.cellLength;
    }
    get cellLengthInLightDOMMode() {
        if (this.images) {
            let cellLength = this.visibleCellsCount + this.overflowCellsLimit * 2;
            if (cellLength > this.images.length) {
                cellLength = this.images.length;
            }
            return cellLength;
        }
        else {
            return this.cellLength;
        }
    }
    get lastCellIndex() {
        return this.images.length ? (this.images.length - 1) : (this.cells.cellLength - 1);
    }
    get overflowCellsLimit() {
        if (this.images && this.isImagesLessCellLimit) {
            return Math.floor((this.images.length - this.visibleCellsCount) / 2);
        }
        else {
            return this.properties.overflowCellsLimit;
        }
    }
    get isImagesLessCellLimit() {
        return this.properties.overflowCellsLimit * 2 + this.visibleCellsCount > this.images.length;
    }
    get cellLimit() {
        if (this.isLightDOM) {
            return this.visibleCellsCount + this.overflowCellsLimit * 2;
        }
        else {
            return this.properties.images.length;
        }
    }
    get isLightDOM() {
        return this.properties.lightDOM || this.properties.loop;
    }
    get images() {
        return this.properties.images;
    }
    get margin() {
        return this.properties.margin;
    }
    get minSwipeDistance() {
        return this.properties.minSwipeDistance;
    }
    get transitionDuration() {
        return this.properties.transitionDuration;
    }
    get transitionTimingFunction() {
        return this.properties.transitionTimingFunction;
    }
    get fullCellWidth() {
        return this.properties.cellWidth + this.margin;
    }
    get visibleCellsCount() {
        return Math.ceil(this.visibleWidth / this.fullCellWidth);
    }
    get lapCounter() {
        return Math.floor(this.slide.counter / this.cellLengthInLightDOMMode);
    }
    get slideCounter() {
        return this.slide.counter;
    }
    init() {
        this.cellsElement = this.properties.cellsElement;
        this.visibleWidth = this.properties.visibleWidth || this.cellsElement.parentElement.clientWidth;
    }
    lineUpCells() {
        this.cells.lineUp();
    }
    handleTransitionend() {
        this.slide.handleTransitionend();
    }
    getImage(index) {
        return this.cells.getImage(index);
    }
    next(length = 1) {
        if (!this.isNextArrowDisabled()) {
            this.slide.next(length);
        }
    }
    prev(length = 1) {
        this.slide.prev(length);
    }
    autoplay() {
        this.autoplayId = setInterval(() => {
            this.next();
        }, this.properties.autoplayInterval);
    }
    stopAutoplay() {
        if (this.autoplayId) {
            clearInterval(this.autoplayId);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLXJlc3BvbnNpdmUtY2Fyb3VzZWwvc3JjL2xpYi9jYXJvdXNlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQU8sUUFBUTtJQWdHakIsWUFDWSxVQUFzQixFQUN0QixLQUFLLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxLQUFLO1FBSkwsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixVQUFLLEdBQUwsS0FBSyxDQUFBO1FBQ0wsVUFBSyxHQUFMLEtBQUssQ0FBQTtRQUNMLGNBQVMsR0FBVCxTQUFTLENBQUE7UUFDVCxVQUFLLEdBQUwsS0FBSyxDQUFBO1FBL0ZqQixvQkFBZSxHQUFZLElBQUksQ0FBQztRQUVoQyxlQUFVLEdBQVksSUFBSSxDQUFDO1FBQzNCLHNCQUFpQixHQUFZLElBQUksQ0FBQztRQUNsQyxlQUFVLEdBQXNCLE1BQU0sQ0FBQztRQUN2Qyw2QkFBd0IsR0FBVyxDQUFDLENBQUM7UUFHckMsdUJBQWtCLEdBQUcsR0FBRyxDQUFDO1FBcUd6QixxQkFBZ0IsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQTtRQUVELDBCQUFxQixHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzNDLENBQUMsQ0FBQTtRQUVELG1CQUFjLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO2dCQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ25DO2lC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bkIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO1lBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQUVELElBQUksQ0FBQyxTQUFpQixDQUFDO1FBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFVRCxRQUFRO1FBQ0osSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQy9CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxZQUFZO1FBQ1IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEM7SUFDTCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb3BlcnRpZXN9IGZyb20gJy4vaW50ZXJmYWNlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2Fyb3VzZWwge1xyXG4gICAgY2VsbHNFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICAvKiBUaGUgc2xpZGUgbGVuZ3RoIGhhcyBiZWVuIGxpbWl0ZWQgYnkgdGhlIGxpbWl0U2xpZGVMZW5ndGgoKSBtZXRob2QgKi9cclxuICAgIGlzU2xpZGVMZW5ndGhMaW1pdGVkOiBib29sZWFuO1xyXG5cclxuICAgIGlzQ29udGVudEltYWdlczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICB2aXNpYmxlV2lkdGg6IG51bWJlcjtcclxuICAgIGlzTGF6eUxvYWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgaXNDb250YWluZXJMb2NrZWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgYWxpZ25DZWxsczogXCJsZWZ0XCIgfCBcImNlbnRlclwiID0gXCJsZWZ0XCI7XHJcbiAgICBpbml0aWFsQ29udGFpbmVyUG9zaXRpb246IG51bWJlciA9IDA7XHJcbiAgICBhdXRvcGxheUlkOiBhbnk7XHJcbiAgICBzdGFydFRpbWU7XHJcbiAgICBjb250YWluZXJQdWxsTGltaXQgPSAxMDA7XHJcblxyXG4gICAgZ2V0IGNlbGxMZW5ndGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuY2VsbExlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY2VsbExlbmd0aEluTGlnaHRET01Nb2RlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmltYWdlcykge1xyXG4gICAgICAgICAgICBsZXQgY2VsbExlbmd0aCA9IHRoaXMudmlzaWJsZUNlbGxzQ291bnQgKyB0aGlzLm92ZXJmbG93Q2VsbHNMaW1pdCAqIDI7XHJcbiAgICAgICAgICAgIGlmIChjZWxsTGVuZ3RoID4gdGhpcy5pbWFnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsTGVuZ3RoID0gdGhpcy5pbWFnZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsTGVuZ3RoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNlbGxMZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBsYXN0Q2VsbEluZGV4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlcy5sZW5ndGggPyAodGhpcy5pbWFnZXMubGVuZ3RoIC0gMSkgOiAodGhpcy5jZWxscy5jZWxsTGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG92ZXJmbG93Q2VsbHNMaW1pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbWFnZXMgJiYgdGhpcy5pc0ltYWdlc0xlc3NDZWxsTGltaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHRoaXMuaW1hZ2VzLmxlbmd0aCAtIHRoaXMudmlzaWJsZUNlbGxzQ291bnQpIC8gMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllcy5vdmVyZmxvd0NlbGxzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0ltYWdlc0xlc3NDZWxsTGltaXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllcy5vdmVyZmxvd0NlbGxzTGltaXQgKiAyICsgdGhpcy52aXNpYmxlQ2VsbHNDb3VudCA+IHRoaXMuaW1hZ2VzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY2VsbExpbWl0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTGlnaHRET00pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNlbGxzQ291bnQgKyB0aGlzLm92ZXJmbG93Q2VsbHNMaW1pdCAqIDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllcy5pbWFnZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNMaWdodERPTSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLmxpZ2h0RE9NIHx8IHRoaXMucHJvcGVydGllcy5sb29wO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpbWFnZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllcy5pbWFnZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1hcmdpbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLm1hcmdpbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWluU3dpcGVEaXN0YW5jZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLm1pblN3aXBlRGlzdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHRyYW5zaXRpb25EdXJhdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLnRyYW5zaXRpb25EdXJhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXMudHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBmdWxsQ2VsbFdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXMuY2VsbFdpZHRoICsgdGhpcy5tYXJnaW47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpc2libGVDZWxsc0NvdW50KCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy52aXNpYmxlV2lkdGggLyB0aGlzLmZ1bGxDZWxsV2lkdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsYXBDb3VudGVyKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMuc2xpZGUuY291bnRlciAvIHRoaXMuY2VsbExlbmd0aEluTGlnaHRET01Nb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2xpZGVDb3VudGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNsaWRlLmNvdW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBwcm9wZXJ0aWVzOiBQcm9wZXJ0aWVzLFxyXG4gICAgICAgIHByaXZhdGUgdXRpbHMsXHJcbiAgICAgICAgcHJpdmF0ZSBjZWxscyxcclxuICAgICAgICBwcml2YXRlIGNvbnRhaW5lcixcclxuICAgICAgICBwcml2YXRlIHNsaWRlKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5jZWxsc0VsZW1lbnQgPSB0aGlzLnByb3BlcnRpZXMuY2VsbHNFbGVtZW50O1xyXG4gICAgICAgIHRoaXMudmlzaWJsZVdpZHRoID0gdGhpcy5wcm9wZXJ0aWVzLnZpc2libGVXaWR0aCB8fCB0aGlzLmNlbGxzRWxlbWVudC5wYXJlbnRFbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmVVcENlbGxzKCkge1xyXG4gICAgICAgIHRoaXMuY2VsbHMubGluZVVwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVG91Y2hzdGFydCA9IChldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuaGFuZGxlVG91Y2hzdGFydCgpO1xyXG4gICAgICAgIHRoaXMuc2xpZGUuaGFuZGxlVG91Y2hzdGFydChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlSG9yaXpvbnRhbFN3aXBlID0gKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5oYW5kbGVIb3Jpem9udGFsU3dpcGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUb3VjaGVuZCA9IChldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcy5mcmVlU2Nyb2xsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmhhbmRsZVRvdWNoZW5kKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuaGFuZGxlVG91Y2hlbmQodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGUuaGFuZGxlVG91Y2hlbmQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUcmFuc2l0aW9uZW5kKCkge1xyXG4gICAgICAgIHRoaXMuc2xpZGUuaGFuZGxlVHJhbnNpdGlvbmVuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEltYWdlKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZ2V0SW1hZ2UoaW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHQobGVuZ3RoOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzTmV4dEFycm93RGlzYWJsZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlLm5leHQobGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJldihsZW5ndGg6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLnNsaWRlLnByZXYobGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc05leHRBcnJvd0Rpc2FibGVkID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNsaWRlLmlzTmV4dEFycm93RGlzYWJsZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1ByZXZBcnJvd0Rpc2FibGVkID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNsaWRlLmlzUHJldkFycm93RGlzYWJsZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdXRvcGxheSgpIHtcclxuICAgICAgICB0aGlzLmF1dG9wbGF5SWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xyXG4gICAgICAgIH0sIHRoaXMucHJvcGVydGllcy5hdXRvcGxheUludGVydmFsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9wQXV0b3BsYXkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b3BsYXlJZCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuYXV0b3BsYXlJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19