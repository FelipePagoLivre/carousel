export class Slide {
    constructor(carouselProperties, utils, cells, container) {
        this.carouselProperties = carouselProperties;
        this.utils = utils;
        this.cells = cells;
        this.container = container;
        this.counter = 0;
        this._counter = 0;
        this.initialPositionX = 0;
        this.currentPositionX = 0;
        this.init();
    }
    get fullCellWidth() {
        return this.carouselProperties.cellWidth + this.carouselProperties.margin;
    }
    get margin() {
        return this.carouselProperties.margin;
    }
    get minSwipeDistance() {
        return this.carouselProperties.minSwipeDistance;
    }
    get visibleCellsCount() {
        return Math.ceil(this.visibleWidth / this.fullCellWidth);
    }
    get visibleCellsOverflowContainer() {
        return (this.visibleCellsCount * this.fullCellWidth - this.margin) > this.visibleWidth;
    }
    /* The position to which the container returns after each slide
     * in the light DUM tree mode.
     */
    get fixedContainerPosition() {
        return -(this.overflowCellsLimit * this.fullCellWidth);
    }
    get overflowCellsLimit() {
        return this.carouselProperties.overflowCellsLimit;
    }
    get images() {
        return this.carouselProperties.images;
    }
    get cellLength() {
        if (this.isLightDOM) {
            return this.cells.cellLengthInLightDOMMode;
        }
        else {
            if (this.images) {
                return this.images.length;
            }
            else {
                return this.cells.cellLength;
            }
        }
    }
    get isLightDOM() {
        return this.carouselProperties.lightDOM || this.carouselProperties.loop;
    }
    init() {
        this.visibleWidth = this.carouselProperties.visibleWidth || this.carouselProperties.hostElement.clientWidth;
    }
    handleTouchstart(event) {
        /* Touchstart event is not called for arrow */
        this.isNotClickOnArrow = true;
        this.isSlideLengthLimited = undefined;
        if (!this.isSlideInProgress) {
            this.initialPositionX = this.container.getCurrentPositionX();
        }
    }
    handleTouchend(event) {
        if (!this.isNotClickOnArrow) {
            return;
        }
        this.currentPositionX = this.container.getCurrentPositionX();
        this.distanceAbs = Math.abs(this.initialPositionX - this.currentPositionX);
        this.distance = this.initialPositionX - this.currentPositionX;
        this.direction = this.getDirection();
        this.isNotClickOnArrow = undefined;
        this.handleSlide();
    }
    handleTransitionend() {
        this.setCounter();
        this.isSlideInProgress = false;
        if (this.isLightDOM) {
            this.alignContainerFast();
        }
    }
    detectClickOnArrow(event) {
        return event.target.classList.contains("carousel-arrow");
    }
    handleSlide(customSlideLength = undefined) {
        let isUsingButton = customSlideLength;
        let newPositionX;
        if (isUsingButton && this.isSlideInProgress || !this.direction) {
            return;
        }
        /* Custom slide length is used in arrows */
        if (customSlideLength) {
            this.slideLength = this.limitSlideLength(customSlideLength);
            if (!this.isSlideInProgress) {
                this.initialPositionX = this.container.getCurrentPositionX();
            }
        }
        else {
            this.slideLength = this.getSlideLength(this.distanceAbs);
        }
        /* Store intermediate counter value */
        this._counter = this.getPreliminaryCounter();
        if (this.direction === 'left') {
            if (!customSlideLength) {
                this.slideLength = this.limitSlideLength(this.getSlideLength(this.distanceAbs));
            }
            this._counter = this.getPreliminaryCounter();
            let isSlidesEnd = this.isSlidesEnd(this._counter);
            newPositionX = this.getPositionByIndex(this._counter);
            if (isSlidesEnd) {
                this._counter = this.counter;
                newPositionX = this.getPositionByIndex(this.counter);
                this.slideLength = 0;
            }
        }
        if (this.direction === 'right') {
            if (!customSlideLength) {
                this.slideLength = this.getSlideLength(this.distanceAbs);
            }
            if (this._counter < 0) {
                this._counter = this.counter;
                this.slideLength = this.counter;
            }
            newPositionX = this.getPositionByIndex(this.counter - this.slideLength);
        }
        if (this.container.getCurrentPositionX() !== newPositionX) {
            this.isSlideInProgress = true;
            this.container.transformPositionX(newPositionX);
        }
    }
    next(length = 1) {
        this.direction = 'left';
        this.handleSlide(length);
    }
    prev(length = 1) {
        this.direction = 'right';
        this.handleSlide(length);
    }
    select(index) {
        if (index > this.cellLength - 1) {
            return;
        }
        if (index > this.counter) {
            let length = index - this.counter;
            this.next(length);
        }
        if (index < this.counter) {
            let length = this.counter - index;
            this.prev(length);
        }
    }
    getPreliminaryCounter() {
        if (this.direction === 'left') {
            return this.counter + this.slideLength;
        }
        if (this.direction === 'right') {
            return this.counter - this.slideLength;
        }
    }
    /*
     * Limits the length of the slide during calls to the next() and prev()
     * methods if the specified position is outside the cell length
     */
    limitSlideLength(slideLength) {
        if (slideLength > 1) {
            for (var i = 0; i < slideLength; i++) {
                let newCounter = this.counter + (slideLength - i);
                if (!this.isSlidesEnd(newCounter)) {
                    slideLength = slideLength - i;
                    this.isSlideLengthLimited = i > 0;
                    break;
                }
            }
        }
        return slideLength;
    }
    /* Offset the container to show the last cell completely */
    getPositionCorrection(counter) {
        let correction = 0;
        let isLastSlide = this.isLastSlide(counter);
        if (this.carouselProperties.loop || this.direction === "right") {
            return 0;
        }
        if (this.isSlideLengthLimited || isLastSlide) {
            let cellsWidth = this.cells.cellLengthInLightDOMMode * this.fullCellWidth;
            if (this.visibleWidth < cellsWidth) {
                correction = -(this.visibleCellsCount * this.fullCellWidth - this.visibleWidth - this.margin);
            }
            if (correction >= -this.margin) {
                correction = 0;
            }
        }
        return correction;
    }
    getSlideLength(distanceAbs) {
        let isLastSlide = this.isLastSlide(this.counter);
        /* If the last cell does not fit entirely, then the
         * length of the swipe to the left, from the extreme
         * right position, may be shorter than usual.
         */
        if (isLastSlide && this.direction === "right") {
            distanceAbs = distanceAbs + this.visibleWidth % this.fullCellWidth;
        }
        let length = Math.floor(distanceAbs / this.fullCellWidth);
        if (distanceAbs % this.fullCellWidth >= this.minSwipeDistance) {
            length++;
        }
        return length;
    }
    getDistanceAbs() {
        return Math.abs(this.initialPositionX - this.currentPositionX);
    }
    getDirection() {
        const direction = Math.sign(this.initialPositionX - this.currentPositionX);
        if (direction === -1) {
            return 'right';
        }
        if (direction === 1) {
            return 'left';
        }
    }
    isSlidesEnd(counter) {
        let margin = this.visibleCellsOverflowContainer ? 1 : 0;
        let imageLength = this.images ? this.images.length : this.cells.cellLength;
        if (this.carouselProperties.loop) {
            return false;
        }
        else {
            return (imageLength - counter + margin) < this.visibleCellsCount;
        }
    }
    isLastSlide(counter) {
        return this.isSlidesEnd(counter + 1);
    }
    setCounter() {
        if (this.direction === 'left') {
            this.counter = this.counter + this.slideLength;
        }
        if (this.direction === 'right') {
            this.counter = this.counter - this.slideLength;
        }
    }
    getPositionByIndex(_counter) {
        let correction = this.getPositionCorrection(this.counter + this.slideLength);
        let position;
        if (correction !== 0) {
            correction = correction + this.fullCellWidth;
        }
        if (this.direction === 'right') {
            correction = 0;
        }
        if (this.isLightDOM && this.isLightDOMMode(_counter) ||
            this.isLightDOM && this.ifLeftDOMModeAtEnd(_counter)) {
            let initialPosition = this.getPositionWithoutCorrection(this.initialPositionX);
            let counterDifference = _counter - this.counter;
            position = initialPosition - ((counterDifference * this.fullCellWidth) - correction);
        }
        else {
            position = -((_counter * this.fullCellWidth) - correction);
        }
        position = this.provideSafePosition(position);
        return position;
    }
    provideSafePosition(position) {
        const endPosition = this.container.getEndPosition();
        if (this.direction === 'left') {
            if (position > 0) {
                position = 0;
            }
        }
        if (this.direction === 'right') {
            if (position < endPosition) {
                position = endPosition;
            }
        }
        return position;
    }
    getPositionWithoutCorrection(value) {
        let remainder = value % this.fullCellWidth;
        if (remainder !== 0) {
            return value - (this.fullCellWidth + remainder);
        }
        else {
            return value;
        }
    }
    isNextArrowDisabled() {
        return this.isLastSlide(this.counter);
    }
    isPrevArrowDisabled() {
        return this.counter === 0;
    }
    alignContainerFast() {
        if (this.isLightDOMMode(this.counter)) {
            let positionX = this.fixedContainerPosition;
            this.container.transformPositionX(positionX, 0);
            this.cells.setCounter(this.counter);
            this.cells.lineUp();
        }
        else if (this.ifLeftDOMModeToBeginning(this.counter)) {
            /* If we have already exited the light DOM mode but
             * the cells are still out of place
             */
            if (this.cells.ifSequenceOfCellsIsChanged()) {
                let positionX = -(this.counter * this.fullCellWidth);
                this.container.transformPositionX(positionX, 0);
                this.cells.setCounter(this.counter);
                this.cells.lineUp();
            }
        }
        else if (this.ifLeftDOMModeAtEnd(this.counter)) {
            let containerPositionX = this.container.getCurrentPositionX();
            let containerWidth = this.container.getWidth();
            this.visibleWidth;
            if (this.isLastSlide(this.counter) &&
                containerWidth + containerPositionX >= this.visibleWidth) {
                return;
            }
            let correction = this.getPositionCorrection(this.counter);
            if (correction !== 0) {
                correction = correction + this.fullCellWidth;
            }
            if (this.direction === 'right') {
                correction = 0;
            }
            let positionX = this.fixedContainerPosition + correction;
            this.container.transformPositionX(positionX, 0);
            this.cells.setCounter(this.counter);
            this.cells.lineUp();
        }
    }
    isLightDOMMode(counter) {
        let flag;
        let remainderOfCells = this.images.length - this.overflowCellsLimit - this.visibleCellsCount;
        if (!this.isLightDOM) {
            return false;
        }
        if (counter > this.overflowCellsLimit && this.direction === "left" &&
            counter <= remainderOfCells) {
            flag = true;
        }
        if (counter >= this.overflowCellsLimit && this.direction === "right" &&
            counter < remainderOfCells) {
            flag = true;
        }
        if (this.counter > this.overflowCellsLimit && this.direction === "left" &&
            this.counter <= remainderOfCells) {
            flag = true;
        }
        if (this.counter >= this.overflowCellsLimit && this.direction === "right" &&
            this.counter < remainderOfCells) {
            flag = true;
        }
        return flag;
    }
    ifLeftDOMModeAtEnd(counter) {
        let flag;
        let remainderOfCells = this.images.length - this.overflowCellsLimit - this.visibleCellsCount;
        if (counter >= remainderOfCells) {
            flag = true;
        }
        if (this.counter >= remainderOfCells) {
            flag = true;
        }
        return flag;
    }
    ifLeftDOMModeToBeginning(counter) {
        let flag;
        if (counter <= this.overflowCellsLimit) {
            flag = true;
        }
        if (this.counter <= this.overflowCellsLimit) {
            flag = true;
        }
        return flag;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLXJlc3BvbnNpdmUtY2Fyb3VzZWwvc3JjL2xpYi9zbGlkZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxNQUFNLE9BQU8sS0FBSztJQW1FZCxZQUFvQixrQkFBc0MsRUFDOUMsS0FBSyxFQUNMLEtBQUssRUFDTCxTQUFTO1FBSEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUM5QyxVQUFLLEdBQUwsS0FBSyxDQUFBO1FBQ0wsVUFBSyxHQUFMLEtBQUssQ0FBQTtRQUNMLGNBQVMsR0FBVCxTQUFTLENBQUE7UUFsRXJCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUtyQixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IscUJBQWdCLEdBQVcsQ0FBQyxDQUFDO1FBNkR6QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQXpERCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztJQUM5RSxDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNoQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztJQUNwRCxDQUFDO0lBRUQsSUFBSSxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLDZCQUE2QjtRQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcs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QixDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb3BlcnRpZXMgYXMgQ2Fyb3VzZWxQcm9wZXJ0aWVzfSBmcm9tICcuL2ludGVyZmFjZXMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0aWVzIHtcclxuICAgIGNhcm91c2VsUHJvcGVydGllczogQ2Fyb3VzZWxQcm9wZXJ0aWVzO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2xpZGUge1xyXG4gICAgc2xpZGVMZW5ndGg6IG51bWJlcjtcclxuICAgIGlzU2xpZGVJblByb2dyZXNzOiBib29sZWFuO1xyXG4gICAgZGlyZWN0aW9uOiAnbGVmdCcgfCAncmlnaHQnO1xyXG4gICAgY291bnRlcjogbnVtYmVyID0gMDtcclxuICAgIF9jb3VudGVyOiBudW1iZXIgPSAwO1xyXG4gICAgZGlzdGFuY2U7XHJcbiAgICBkaXN0YW5jZUFicztcclxuICAgIHZpc2libGVXaWR0aDogbnVtYmVyO1xyXG4gICAgaXNOb3RDbGlja09uQXJyb3c6IGJvb2xlYW47XHJcbiAgICBpbml0aWFsUG9zaXRpb25YOiBudW1iZXIgPSAwO1xyXG4gICAgY3VycmVudFBvc2l0aW9uWDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAvKiBUaGUgc2xpZGUgbGVuZ3RoIGhhcyBiZWVuIGxpbWl0ZWQgYnkgdGhlIGxpbWl0U2xpZGVMZW5ndGgoKSBtZXRob2QgKi9cclxuICAgIGlzU2xpZGVMZW5ndGhMaW1pdGVkOiBib29sZWFuO1xyXG5cclxuICAgIGdldCBmdWxsQ2VsbFdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5jZWxsV2lkdGggKyB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5tYXJnaW47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1hcmdpbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbFByb3BlcnRpZXMubWFyZ2luO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtaW5Td2lwZURpc3RhbmNlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5taW5Td2lwZURpc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXNpYmxlQ2VsbHNDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudmlzaWJsZVdpZHRoIC8gdGhpcy5mdWxsQ2VsbFdpZHRoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlzaWJsZUNlbGxzT3ZlcmZsb3dDb250YWluZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnZpc2libGVDZWxsc0NvdW50ICogdGhpcy5mdWxsQ2VsbFdpZHRoIC0gdGhpcy5tYXJnaW4pID4gdGhpcy52aXNpYmxlV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyogVGhlIHBvc2l0aW9uIHRvIHdoaWNoIHRoZSBjb250YWluZXIgcmV0dXJucyBhZnRlciBlYWNoIHNsaWRlIFxyXG4gICAgICogaW4gdGhlIGxpZ2h0IERVTSB0cmVlIG1vZGUuIFxyXG4gICAgICovXHJcbiAgICBnZXQgZml4ZWRDb250YWluZXJQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gLSh0aGlzLm92ZXJmbG93Q2VsbHNMaW1pdCAqIHRoaXMuZnVsbENlbGxXaWR0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG92ZXJmbG93Q2VsbHNMaW1pdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbFByb3BlcnRpZXMub3ZlcmZsb3dDZWxsc0xpbWl0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpbWFnZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2Fyb3VzZWxQcm9wZXJ0aWVzLmltYWdlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY2VsbExlbmd0aCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xpZ2h0RE9NKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNlbGxzLmNlbGxMZW5ndGhJbkxpZ2h0RE9NTW9kZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmltYWdlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jZWxscy5jZWxsTGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0xpZ2h0RE9NKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5saWdodERPTSB8fCB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5sb29wO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2Fyb3VzZWxQcm9wZXJ0aWVzOiBDYXJvdXNlbFByb3BlcnRpZXMsXHJcbiAgICAgICAgcHJpdmF0ZSB1dGlscyxcclxuICAgICAgICBwcml2YXRlIGNlbGxzLFxyXG4gICAgICAgIHByaXZhdGUgY29udGFpbmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlV2lkdGggPSB0aGlzLmNhcm91c2VsUHJvcGVydGllcy52aXNpYmxlV2lkdGggfHwgdGhpcy5jYXJvdXNlbFByb3BlcnRpZXMuaG9zdEVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVG91Y2hzdGFydChldmVudCkge1xyXG4gICAgICAgIC8qIFRvdWNoc3RhcnQgZXZlbnQgaXMgbm90IGNhbGxlZCBmb3IgYXJyb3cgKi9cclxuICAgICAgICB0aGlzLmlzTm90Q2xpY2tPbkFycm93ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzU2xpZGVMZW5ndGhMaW1pdGVkID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuaXNTbGlkZUluUHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0aWFsUG9zaXRpb25YID0gdGhpcy5jb250YWluZXIuZ2V0Q3VycmVudFBvc2l0aW9uWCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUb3VjaGVuZChldmVudCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc05vdENsaWNrT25BcnJvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBvc2l0aW9uWCA9IHRoaXMuY29udGFpbmVyLmdldEN1cnJlbnRQb3NpdGlvblgoKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlQWJzID0gTWF0aC5hYnModGhpcy5pbml0aWFsUG9zaXRpb25YIC0gdGhpcy5jdXJyZW50UG9zaXRpb25YKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlID0gdGhpcy5pbml0aWFsUG9zaXRpb25YIC0gdGhpcy5jdXJyZW50UG9zaXRpb25YO1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb24oKTtcclxuICAgICAgICB0aGlzLmlzTm90Q2xpY2tPbkFycm93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU2xpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUcmFuc2l0aW9uZW5kKCkge1xyXG4gICAgICAgIHRoaXMuc2V0Q291bnRlcigpO1xyXG4gICAgICAgIHRoaXMuaXNTbGlkZUluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNMaWdodERPTSkge1xyXG4gICAgICAgICAgICB0aGlzLmFsaWduQ29udGFpbmVyRmFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZXRlY3RDbGlja09uQXJyb3coZXZlbnQpIHtcclxuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImNhcm91c2VsLWFycm93XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZVNsaWRlKGN1c3RvbVNsaWRlTGVuZ3RoOiBudW1iZXIgPSB1bmRlZmluZWQpIHtcclxuICAgICAgICBsZXQgaXNVc2luZ0J1dHRvbiA9IGN1c3RvbVNsaWRlTGVuZ3RoO1xyXG4gICAgICAgIGxldCBuZXdQb3NpdGlvblg7XHJcblxyXG4gICAgICAgIGlmIChpc1VzaW5nQnV0dG9uICYmIHRoaXMuaXNTbGlkZUluUHJvZ3Jlc3MgfHwgIXRoaXMuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIEN1c3RvbSBzbGlkZSBsZW5ndGggaXMgdXNlZCBpbiBhcnJvd3MgKi9cclxuICAgICAgICBpZiAoY3VzdG9tU2xpZGVMZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZUxlbmd0aCA9IHRoaXMubGltaXRTbGlkZUxlbmd0aChjdXN0b21TbGlkZUxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNTbGlkZUluUHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uWCA9IHRoaXMuY29udGFpbmVyLmdldEN1cnJlbnRQb3NpdGlvblgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVMZW5ndGggPSB0aGlzLmdldFNsaWRlTGVuZ3RoKHRoaXMuZGlzdGFuY2VBYnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyogU3RvcmUgaW50ZXJtZWRpYXRlIGNvdW50ZXIgdmFsdWUgKi9cclxuICAgICAgICB0aGlzLl9jb3VudGVyID0gdGhpcy5nZXRQcmVsaW1pbmFyeUNvdW50ZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcclxuICAgICAgICAgICAgaWYgKCFjdXN0b21TbGlkZUxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZUxlbmd0aCA9IHRoaXMubGltaXRTbGlkZUxlbmd0aCh0aGlzLmdldFNsaWRlTGVuZ3RoKHRoaXMuZGlzdGFuY2VBYnMpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fY291bnRlciA9IHRoaXMuZ2V0UHJlbGltaW5hcnlDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIGxldCBpc1NsaWRlc0VuZCA9IHRoaXMuaXNTbGlkZXNFbmQodGhpcy5fY291bnRlcik7XHJcbiAgICAgICAgICAgIG5ld1Bvc2l0aW9uWCA9IHRoaXMuZ2V0UG9zaXRpb25CeUluZGV4KHRoaXMuX2NvdW50ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzU2xpZGVzRW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3VudGVyID0gdGhpcy5jb3VudGVyO1xyXG5cclxuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uWCA9IHRoaXMuZ2V0UG9zaXRpb25CeUluZGV4KHRoaXMuY291bnRlcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlTGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgICAgIGlmICghY3VzdG9tU2xpZGVMZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVMZW5ndGggPSB0aGlzLmdldFNsaWRlTGVuZ3RoKHRoaXMuZGlzdGFuY2VBYnMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fY291bnRlciA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvdW50ZXIgPSB0aGlzLmNvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlTGVuZ3RoID0gdGhpcy5jb3VudGVyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBuZXdQb3NpdGlvblggPSB0aGlzLmdldFBvc2l0aW9uQnlJbmRleCh0aGlzLmNvdW50ZXIgLSB0aGlzLnNsaWRlTGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lci5nZXRDdXJyZW50UG9zaXRpb25YKCkgIT09IG5ld1Bvc2l0aW9uWCkge1xyXG4gICAgICAgICAgICB0aGlzLmlzU2xpZGVJblByb2dyZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jb250YWluZXIudHJhbnNmb3JtUG9zaXRpb25YKG5ld1Bvc2l0aW9uWCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHQobGVuZ3RoOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTbGlkZShsZW5ndGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZXYobGVuZ3RoOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAncmlnaHQnO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU2xpZGUobGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3QoaW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChpbmRleCA+IHRoaXMuY2VsbExlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluZGV4ID4gdGhpcy5jb3VudGVyKSB7XHJcbiAgICAgICAgICAgIGxldCBsZW5ndGggPSBpbmRleCAtIHRoaXMuY291bnRlcjtcclxuICAgICAgICAgICAgdGhpcy5uZXh0KGxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5kZXggPCB0aGlzLmNvdW50ZXIpIHtcclxuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuY291bnRlciAtIGluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLnByZXYobGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UHJlbGltaW5hcnlDb3VudGVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvdW50ZXIgKyB0aGlzLnNsaWRlTGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvdW50ZXIgLSB0aGlzLnNsaWRlTGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiAgXHJcbiAgICAgKiBMaW1pdHMgdGhlIGxlbmd0aCBvZiB0aGUgc2xpZGUgZHVyaW5nIGNhbGxzIHRvIHRoZSBuZXh0KCkgYW5kIHByZXYoKSBcclxuICAgICAqIG1ldGhvZHMgaWYgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpcyBvdXRzaWRlIHRoZSBjZWxsIGxlbmd0aCBcclxuICAgICAqL1xyXG4gICAgbGltaXRTbGlkZUxlbmd0aChzbGlkZUxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHNsaWRlTGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlTGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdDb3VudGVyID0gdGhpcy5jb3VudGVyICsgKHNsaWRlTGVuZ3RoIC0gaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2xpZGVzRW5kKG5ld0NvdW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVMZW5ndGggPSBzbGlkZUxlbmd0aCAtIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NsaWRlTGVuZ3RoTGltaXRlZCA9IGkgPiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbGlkZUxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKiBPZmZzZXQgdGhlIGNvbnRhaW5lciB0byBzaG93IHRoZSBsYXN0IGNlbGwgY29tcGxldGVseSAqL1xyXG4gICAgZ2V0UG9zaXRpb25Db3JyZWN0aW9uKGNvdW50ZXIpIHtcclxuICAgICAgICBsZXQgY29ycmVjdGlvbiA9IDA7XHJcbiAgICAgICAgbGV0IGlzTGFzdFNsaWRlID0gdGhpcy5pc0xhc3RTbGlkZShjb3VudGVyKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2Fyb3VzZWxQcm9wZXJ0aWVzLmxvb3AgfHwgdGhpcy5kaXJlY3Rpb24gPT09IFwicmlnaHRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzU2xpZGVMZW5ndGhMaW1pdGVkIHx8IGlzTGFzdFNsaWRlKSB7XHJcbiAgICAgICAgICAgIGxldCBjZWxsc1dpZHRoID0gdGhpcy5jZWxscy5jZWxsTGVuZ3RoSW5MaWdodERPTU1vZGUgKiB0aGlzLmZ1bGxDZWxsV2lkdGg7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlV2lkdGggPCBjZWxsc1dpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9uID0gLSh0aGlzLnZpc2libGVDZWxsc0NvdW50ICogdGhpcy5mdWxsQ2VsbFdpZHRoIC0gdGhpcy52aXNpYmxlV2lkdGggLSB0aGlzLm1hcmdpbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb3JyZWN0aW9uID49IC10aGlzLm1hcmdpbikge1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb3JyZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFNsaWRlTGVuZ3RoKGRpc3RhbmNlQWJzKSB7XHJcbiAgICAgICAgbGV0IGlzTGFzdFNsaWRlID0gdGhpcy5pc0xhc3RTbGlkZSh0aGlzLmNvdW50ZXIpO1xyXG5cclxuICAgICAgICAvKiBJZiB0aGUgbGFzdCBjZWxsIGRvZXMgbm90IGZpdCBlbnRpcmVseSwgdGhlbiB0aGUgXHJcbiAgICAgICAgICogbGVuZ3RoIG9mIHRoZSBzd2lwZSB0byB0aGUgbGVmdCwgZnJvbSB0aGUgZXh0cmVtZSBcclxuICAgICAgICAgKiByaWdodCBwb3NpdGlvbiwgbWF5IGJlIHNob3J0ZXIgdGhhbiB1c3VhbC4gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKGlzTGFzdFNsaWRlICYmIHRoaXMuZGlyZWN0aW9uID09PSBcInJpZ2h0XCIpIHtcclxuICAgICAgICAgICAgZGlzdGFuY2VBYnMgPSBkaXN0YW5jZUFicyArIHRoaXMudmlzaWJsZVdpZHRoICUgdGhpcy5mdWxsQ2VsbFdpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IE1hdGguZmxvb3IoZGlzdGFuY2VBYnMgLyB0aGlzLmZ1bGxDZWxsV2lkdGgpO1xyXG5cclxuICAgICAgICBpZiAoZGlzdGFuY2VBYnMgJSB0aGlzLmZ1bGxDZWxsV2lkdGggPj0gdGhpcy5taW5Td2lwZURpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIGxlbmd0aCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBnZXREaXN0YW5jZUFicygpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy5pbml0aWFsUG9zaXRpb25YIC0gdGhpcy5jdXJyZW50UG9zaXRpb25YKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREaXJlY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5zaWduKHRoaXMuaW5pdGlhbFBvc2l0aW9uWCAtIHRoaXMuY3VycmVudFBvc2l0aW9uWCk7XHJcblxyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncmlnaHQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbGVmdCc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzU2xpZGVzRW5kKGNvdW50ZXI6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBtYXJnaW4gPSB0aGlzLnZpc2libGVDZWxsc092ZXJmbG93Q29udGFpbmVyID8gMSA6IDA7XHJcbiAgICAgICAgbGV0IGltYWdlTGVuZ3RoID0gdGhpcy5pbWFnZXMgPyB0aGlzLmltYWdlcy5sZW5ndGggOiB0aGlzLmNlbGxzLmNlbGxMZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNhcm91c2VsUHJvcGVydGllcy5sb29wKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gKGltYWdlTGVuZ3RoIC0gY291bnRlciArIG1hcmdpbikgPCB0aGlzLnZpc2libGVDZWxsc0NvdW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0xhc3RTbGlkZShjb3VudGVyOiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc1NsaWRlc0VuZChjb3VudGVyICsgMSlcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb3VudGVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY291bnRlciA9IHRoaXMuY291bnRlciArIHRoaXMuc2xpZGVMZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgdGhpcy5jb3VudGVyID0gdGhpcy5jb3VudGVyIC0gdGhpcy5zbGlkZUxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UG9zaXRpb25CeUluZGV4KF9jb3VudGVyKSB7XHJcbiAgICAgICAgbGV0IGNvcnJlY3Rpb24gPSB0aGlzLmdldFBvc2l0aW9uQ29ycmVjdGlvbih0aGlzLmNvdW50ZXIgKyB0aGlzLnNsaWRlTGVuZ3RoKTtcclxuICAgICAgICBsZXQgcG9zaXRpb247XHJcblxyXG4gICAgICAgIGlmIChjb3JyZWN0aW9uICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNvcnJlY3Rpb24gPSBjb3JyZWN0aW9uICsgdGhpcy5mdWxsQ2VsbFdpZHRoXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgY29ycmVjdGlvbiA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xpZ2h0RE9NICYmIHRoaXMuaXNMaWdodERPTU1vZGUoX2NvdW50ZXIpIHx8XHJcbiAgICAgICAgICAgIHRoaXMuaXNMaWdodERPTSAmJiB0aGlzLmlmTGVmdERPTU1vZGVBdEVuZChfY291bnRlcikpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbml0aWFsUG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uV2l0aG91dENvcnJlY3Rpb24odGhpcy5pbml0aWFsUG9zaXRpb25YKTtcclxuICAgICAgICAgICAgbGV0IGNvdW50ZXJEaWZmZXJlbmNlID0gX2NvdW50ZXIgLSB0aGlzLmNvdW50ZXI7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaW5pdGlhbFBvc2l0aW9uIC0gKChjb3VudGVyRGlmZmVyZW5jZSAqIHRoaXMuZnVsbENlbGxXaWR0aCkgLSBjb3JyZWN0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IC0oKF9jb3VudGVyICogdGhpcy5mdWxsQ2VsbFdpZHRoKSAtIGNvcnJlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLnByb3ZpZGVTYWZlUG9zaXRpb24ocG9zaXRpb24pO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdmlkZVNhZmVQb3NpdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gdGhpcy5jb250YWluZXIuZ2V0RW5kUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcclxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uIDwgZW5kUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gZW5kUG9zaXRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRQb3NpdGlvbldpdGhvdXRDb3JyZWN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IHJlbWFpbmRlciA9IHZhbHVlICUgdGhpcy5mdWxsQ2VsbFdpZHRoO1xyXG5cclxuICAgICAgICBpZiAocmVtYWluZGVyICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtICh0aGlzLmZ1bGxDZWxsV2lkdGggKyByZW1haW5kZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNOZXh0QXJyb3dEaXNhYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc0xhc3RTbGlkZSh0aGlzLmNvdW50ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUHJldkFycm93RGlzYWJsZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY291bnRlciA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBhbGlnbkNvbnRhaW5lckZhc3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMaWdodERPTU1vZGUodGhpcy5jb3VudGVyKSkge1xyXG4gICAgICAgICAgICBsZXQgcG9zaXRpb25YID0gdGhpcy5maXhlZENvbnRhaW5lclBvc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci50cmFuc2Zvcm1Qb3NpdGlvblgocG9zaXRpb25YLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2VsbHMuc2V0Q291bnRlcih0aGlzLmNvdW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmNlbGxzLmxpbmVVcCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pZkxlZnRET01Nb2RlVG9CZWdpbm5pbmcodGhpcy5jb3VudGVyKSkge1xyXG4gICAgICAgICAgICAvKiBJZiB3ZSBoYXZlIGFscmVhZHkgZXhpdGVkIHRoZSBsaWdodCBET00gbW9kZSBidXQgXHJcbiAgICAgICAgICAgICAqIHRoZSBjZWxscyBhcmUgc3RpbGwgb3V0IG9mIHBsYWNlIFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYgKHRoaXMuY2VsbHMuaWZTZXF1ZW5jZU9mQ2VsbHNJc0NoYW5nZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uWCA9IC0odGhpcy5jb3VudGVyICogdGhpcy5mdWxsQ2VsbFdpZHRoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnRyYW5zZm9ybVBvc2l0aW9uWChwb3NpdGlvblgsIDApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2VsbHMuc2V0Q291bnRlcih0aGlzLmNvdW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZWxscy5saW5lVXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pZkxlZnRET01Nb2RlQXRFbmQodGhpcy5jb3VudGVyKSkge1xyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyUG9zaXRpb25YID0gdGhpcy5jb250YWluZXIuZ2V0Q3VycmVudFBvc2l0aW9uWCgpO1xyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTGFzdFNsaWRlKHRoaXMuY291bnRlcikgJiZcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcldpZHRoICsgY29udGFpbmVyUG9zaXRpb25YID49IHRoaXMudmlzaWJsZVdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBjb3JyZWN0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkNvcnJlY3Rpb24odGhpcy5jb3VudGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb3JyZWN0aW9uICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9uID0gY29ycmVjdGlvbiArIHRoaXMuZnVsbENlbGxXaWR0aFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgICAgIGNvcnJlY3Rpb24gPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zaXRpb25YID0gdGhpcy5maXhlZENvbnRhaW5lclBvc2l0aW9uICsgY29ycmVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnRyYW5zZm9ybVBvc2l0aW9uWChwb3NpdGlvblgsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmNlbGxzLnNldENvdW50ZXIodGhpcy5jb3VudGVyKTtcclxuICAgICAgICAgICAgdGhpcy5jZWxscy5saW5lVXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNMaWdodERPTU1vZGUoY291bnRlcikge1xyXG4gICAgICAgIGxldCBmbGFnO1xyXG4gICAgICAgIGxldCByZW1haW5kZXJPZkNlbGxzID0gdGhpcy5pbWFnZXMubGVuZ3RoIC0gdGhpcy5vdmVyZmxvd0NlbGxzTGltaXQgLSB0aGlzLnZpc2libGVDZWxsc0NvdW50O1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuaXNMaWdodERPTSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY291bnRlciA+IHRoaXMub3ZlcmZsb3dDZWxsc0xpbWl0ICYmIHRoaXMuZGlyZWN0aW9uID09PSBcImxlZnRcIiAmJlxyXG4gICAgICAgICAgICBjb3VudGVyIDw9IHJlbWFpbmRlck9mQ2VsbHMpIHtcclxuICAgICAgICAgICAgZmxhZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY291bnRlciA+PSB0aGlzLm92ZXJmbG93Q2VsbHNMaW1pdCAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJyaWdodFwiICYmXHJcbiAgICAgICAgICAgIGNvdW50ZXIgPCByZW1haW5kZXJPZkNlbGxzKSB7XHJcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA+IHRoaXMub3ZlcmZsb3dDZWxsc0xpbWl0ICYmIHRoaXMuZGlyZWN0aW9uID09PSBcImxlZnRcIiAmJlxyXG4gICAgICAgICAgICB0aGlzLmNvdW50ZXIgPD0gcmVtYWluZGVyT2ZDZWxscykge1xyXG4gICAgICAgICAgICBmbGFnID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPj0gdGhpcy5vdmVyZmxvd0NlbGxzTGltaXQgJiYgdGhpcy5kaXJlY3Rpb24gPT09IFwicmlnaHRcIiAmJlxyXG4gICAgICAgICAgICB0aGlzLmNvdW50ZXIgPCByZW1haW5kZXJPZkNlbGxzKSB7XHJcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZsYWc7XHJcbiAgICB9XHJcblxyXG4gICAgaWZMZWZ0RE9NTW9kZUF0RW5kKGNvdW50ZXIpIHtcclxuICAgICAgICBsZXQgZmxhZztcclxuICAgICAgICBsZXQgcmVtYWluZGVyT2ZDZWxscyA9IHRoaXMuaW1hZ2VzLmxlbmd0aCAtIHRoaXMub3ZlcmZsb3dDZWxsc0xpbWl0IC0gdGhpcy52aXNpYmxlQ2VsbHNDb3VudDtcclxuXHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gcmVtYWluZGVyT2ZDZWxscykge1xyXG4gICAgICAgICAgICBmbGFnID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPj0gcmVtYWluZGVyT2ZDZWxscykge1xyXG4gICAgICAgICAgICBmbGFnID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmbGFnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmTGVmdERPTU1vZGVUb0JlZ2lubmluZyhjb3VudGVyKSB7XHJcbiAgICAgICAgbGV0IGZsYWc7XHJcblxyXG4gICAgICAgIGlmIChjb3VudGVyIDw9IHRoaXMub3ZlcmZsb3dDZWxsc0xpbWl0KSB7XHJcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA8PSB0aGlzLm92ZXJmbG93Q2VsbHNMaW1pdCkge1xyXG4gICAgICAgICAgICBmbGFnID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmbGFnO1xyXG4gICAgfVxyXG59Il19