import { EventEmitter, Component, ElementRef, ChangeDetectorRef, Output, Input, HostBinding, HostListener, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

class Touches {
    constructor(properties) {
        this.eventType = undefined;
        this.handlers = {};
        this.startX = 0;
        this.startY = 0;
        this.lastTap = 0;
        this.doubleTapMinTimeout = 300;
        this.tapMinTimeout = 200;
        this.touchstartTime = 0;
        this.i = 0;
        this.isMousedown = false;
        this._touchListeners = {
            "touchstart": "handleTouchstart",
            "touchmove": "handleTouchmove",
            "touchend": "handleTouchend"
        };
        this._mouseListeners = {
            "mousedown": "handleMousedown",
            "mousemove": "handleMousemove",
            "mouseup": "handleMouseup",
            "wheel": "handleWheel"
        };
        this._otherListeners = {
            "resize": "handleResize"
        };
        /*
         * Listeners
         */
        /* Touchstart */
        this.handleTouchstart = (event) => {
            this.elementPosition = this.getElementPosition();
            this.touchstartTime = new Date().getTime();
            if (this.eventType === undefined) {
                this.getTouchstartPosition(event);
            }
            this.runHandler("touchstart", event);
        };
        /* Touchmove */
        this.handleTouchmove = (event) => {
            const touches = event.touches;
            // Pan
            if (this.detectPan(touches)) {
                this.runHandler("pan", event);
            }
            // Pinch
            if (this.detectPinch(event)) {
                this.runHandler("pinch", event);
            }
            // Linear swipe
            switch (this.detectLinearSwipe(event)) {
                case "horizontal-swipe":
                    event.swipeType = "horizontal-swipe";
                    this.runHandler("horizontal-swipe", event);
                    break;
                case "vertical-swipe":
                    event.swipeType = "vertical-swipe";
                    this.runHandler("vertical-swipe", event);
                    break;
            }
            // Linear swipe
            if (this.detectLinearSwipe(event) ||
                this.eventType === 'horizontal-swipe' ||
                this.eventType === 'vertical-swipe') {
                this.handleLinearSwipe(event);
            }
        };
        /* Touchend */
        this.handleTouchend = (event) => {
            const touches = event.touches;
            // Double Tap
            if (this.detectDoubleTap()) {
                this.runHandler("double-tap", event);
            }
            // Tap
            this.detectTap();
            this.runHandler("touchend", event);
            this.eventType = 'touchend';
            if (touches && touches.length === 0) {
                this.eventType = undefined;
                this.i = 0;
            }
        };
        /* Mousedown */
        this.handleMousedown = (event) => {
            this.isMousedown = true;
            this.elementPosition = this.getElementPosition();
            this.touchstartTime = new Date().getTime();
            if (this.eventType === undefined) {
                this.getMousedownPosition(event);
            }
            this.runHandler("mousedown", event);
        };
        /* Mousemove */
        this.handleMousemove = (event) => {
            //event.preventDefault();
            if (!this.isMousedown) {
                return;
            }
            // Pan
            this.runHandler("pan", event);
            // Linear swipe
            switch (this.detectLinearSwipe(event)) {
                case "horizontal-swipe":
                    event.swipeType = "horizontal-swipe";
                    this.runHandler("horizontal-swipe", event);
                    break;
                case "vertical-swipe":
                    event.swipeType = "vertical-swipe";
                    this.runHandler("vertical-swipe", event);
                    break;
            }
            // Linear swipe
            if (this.detectLinearSwipe(event) ||
                this.eventType === 'horizontal-swipe' ||
                this.eventType === 'vertical-swipe') {
                this.handleLinearSwipe(event);
            }
        };
        /* Mouseup */
        this.handleMouseup = (event) => {
            // Tap
            this.detectTap();
            this.isMousedown = false;
            this.runHandler("mouseup", event);
            this.eventType = undefined;
            this.i = 0;
        };
        /* Wheel */
        this.handleWheel = (event) => {
            this.runHandler("wheel", event);
        };
        /* Resize */
        this.handleResize = (event) => {
            this.runHandler("resize", event);
        };
        this.properties = properties;
        this.element = this.properties.element;
        this.elementPosition = this.getElementPosition();
        this.toggleEventListeners('addEventListener');
    }
    get touchListeners() {
        return this.properties.touchListeners ? this.properties.touchListeners : this._touchListeners;
    }
    get mouseListeners() {
        return this.properties.mouseListeners ? this.properties.mouseListeners : this._mouseListeners;
    }
    get otherListeners() {
        return this.properties.otherListeners ? this.properties.otherListeners : this._otherListeners;
    }
    destroy() {
        this.toggleEventListeners('removeEventListener');
    }
    toggleEventListeners(action) {
        let listeners;
        if (this.properties.listeners === 'mouse and touch') {
            listeners = Object.assign(this.touchListeners, this.mouseListeners);
        }
        else {
            listeners = this.detectTouchScreen() ? this.touchListeners : this.mouseListeners;
        }
        if (this.properties.resize) {
            listeners = Object.assign(listeners, this.otherListeners);
        }
        for (var listener in listeners) {
            const handler = listeners[listener];
            // Window
            if (listener === "resize") {
                if (action === 'addEventListener') {
                    window.addEventListener(listener, this[handler], false);
                }
                if (action === 'removeEventListener') {
                    window.removeEventListener(listener, this[handler], false);
                }
                // Document
            }
            else if (listener === 'mouseup' || listener === "mousemove") {
                if (action === 'addEventListener') {
                    document.addEventListener(listener, this[handler], false);
                }
                if (action === 'removeEventListener') {
                    document.removeEventListener(listener, this[handler], false);
                }
                // Element
            }
            else {
                if (action === 'addEventListener') {
                    this.element.addEventListener(listener, this[handler], false);
                }
                if (action === 'removeEventListener') {
                    this.element.removeEventListener(listener, this[handler], false);
                }
            }
        }
    }
    addEventListeners(listener, handler) {
        window.addEventListener(listener, this[handler], false);
    }
    removeEventListeners(listener, handler) {
        window.removeEventListener(listener, this[handler], false);
    }
    handleLinearSwipe(event) {
        //event.preventDefault();
        this.i++;
        if (this.i > 3) {
            this.eventType = this.getLinearSwipeType(event);
        }
        if (this.eventType === 'horizontal-swipe') {
            this.runHandler('horizontal-swipe', event);
        }
        if (this.eventType === 'vertical-swipe') {
            this.runHandler('vertical-swipe', event);
        }
    }
    runHandler(eventName, response) {
        if (this.handlers[eventName]) {
            this.handlers[eventName](response);
        }
    }
    /*
     * Detection
     */
    detectPan(touches) {
        return touches.length === 1 && !this.eventType || this.eventType === 'pan';
    }
    detectDoubleTap() {
        if (this.eventType != undefined) {
            return;
        }
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;
        clearTimeout(this.doubleTapTimeout);
        if (tapLength < this.doubleTapMinTimeout && tapLength > 0) {
            return true;
        }
        else {
            this.doubleTapTimeout = setTimeout(() => {
                clearTimeout(this.doubleTapTimeout);
            }, this.doubleTapMinTimeout);
        }
        this.lastTap = currentTime;
    }
    detectTap() {
        if (this.eventType != undefined) {
            return;
        }
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.touchstartTime;
        if (tapLength > 0) {
            if (tapLength < this.tapMinTimeout) {
                this.runHandler("tap", event);
            }
            else {
                this.runHandler("longtap", event);
            }
        }
    }
    detectPinch(event) {
        const touches = event.touches;
        return (touches.length === 2 && this.eventType === undefined) || this.eventType === 'pinch';
    }
    detectLinearSwipe(event) {
        const touches = event.touches;
        if (touches) {
            if (touches.length === 1 && !this.eventType || this.eventType === 'horizontal-swipe' || this.eventType === 'vertical-swipe') {
                return this.getLinearSwipeType(event);
            }
        }
        else {
            if (!this.eventType || this.eventType === 'horizontal-swipe' || this.eventType === 'vertical-swipe') {
                return this.getLinearSwipeType(event);
            }
        }
    }
    getLinearSwipeType(event) {
        if (this.eventType !== 'horizontal-swipe' && this.eventType !== 'vertical-swipe') {
            const movementX = Math.abs(this.moveLeft(0, event) - this.startX);
            const movementY = Math.abs(this.moveTop(0, event) - this.startY);
            if ((movementY * 3) > movementX) {
                return 'vertical-swipe';
            }
            else {
                return 'horizontal-swipe';
            }
        }
        else {
            return this.eventType;
        }
    }
    getElementPosition() {
        return this.element.getBoundingClientRect();
    }
    getTouchstartPosition(event) {
        this.startX = event.touches[0].clientX - this.elementPosition.left;
        this.startY = event.touches[0].clientY - this.elementPosition.top;
    }
    getMousedownPosition(event) {
        this.startX = event.clientX - this.elementPosition.left;
        this.startY = event.clientY - this.elementPosition.top;
    }
    moveLeft(index, event) {
        const touches = event.touches;
        if (touches) {
            return touches[index].clientX - this.elementPosition.left;
        }
        else {
            return event.clientX - this.elementPosition.left;
        }
    }
    moveTop(index, event) {
        const touches = event.touches;
        if (touches) {
            return touches[index].clientY - this.elementPosition.top;
        }
        else {
            return event.clientY - this.elementPosition.top;
        }
    }
    detectTouchScreen() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function (query) {
            return window.matchMedia(query).matches;
        };
        if (('ontouchstart' in window)) {
            return true;
        }
        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }
    /* Public properties and methods */
    on(event, handler) {
        if (event) {
            this.handlers[event] = handler;
        }
    }
}

class Carousel {
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
        // this.autoplayId = setInterval(() => {
        //     this.next();
        // }, this.properties.autoplayInterval);
        let status = "next";
        this.autoplayId = setInterval(() => {
            if(status == "next"){
                this.next();
                status = "prev";
                console.log("next")
            }else{
                this.prev();
                status = "next";
                console.log("prev")
            }
        }, 5000);
    }
    stopAutoplay() {
        if (this.autoplayId) {
            clearInterval(this.autoplayId);
        }
    }
}

class Container {
    constructor(carouselProperties, utils, cells) {
        this.carouselProperties = carouselProperties;
        this.utils = utils;
        this.cells = cells;
        /* The index of the new position relative to
         * the active index, for example -1 or +1
         */
        this.newPositionIndex = 0;
        this.initialPositionX = 0;
        this.initialElementPositionX = 0;
        this.isLocked = true;
        this.pullLimit = 100;
        this.init();
    }
    get visibleWidth() {
        return this.utils.visibleWidth;
    }
    get overflowCellsLimit() {
        return this.utils.overflowCellsLimit;
    }
    get images() {
        return this.carouselProperties.images;
    }
    get element() {
        return this.carouselProperties.cellsElement;
    }
    get freeScroll() {
        return this.carouselProperties.freeScroll;
    }
    get fullCellWidth() {
        return this.carouselProperties.cellWidth + this.carouselProperties.margin;
    }
    get visibleCellsCount() {
        return Math.ceil(this.visibleWidth / this.fullCellWidth);
    }
    get transitionDuration() {
        return this.carouselProperties.transitionDuration;
    }
    get transitionTimingFunction() {
        return this.carouselProperties.transitionTimingFunction;
    }
    get cellLength() {
        if (this.images) {
            return this.images.length;
        }
        else {
            return this.cells.cellLength;
        }
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
    get tooFewCells() {
        return this.visibleCellsCount > this.cellLength;
    }
    get disabled() {
        return this.tooFewCells;
    }
    get margin() {
        return this.carouselProperties.margin;
    }
    get isLightDOM() {
        return this.carouselProperties.lightDOM || this.carouselProperties.loop;
    }
    init() {
        this.setWidth();
    }
    handleTouchstart() {
        this.startX = this.utils.getStartX(event);
        this.startTime = new Date().getTime();
        this.initialElementPositionX = this.getInitialElementPositionX();
    }
    handleHorizontalSwipe() {
        if (this.disabled) {
            return;
        }
        if (!this.isSwipeInProgress) {
            this.startX = this.utils.getStartX(event);
            this.startTime = new Date().getTime();
            this.initialElementPositionX = this.getInitialElementPositionX();
        }
        this.isSwipeInProgress = true;
        this.moveX = this.utils.getMoveX(event);
        this.move();
    }
    handleTouchend(simpleProcessing = false) {
        if (this.disabled) {
            return;
        }
        /* If touchend was passed to the Slide class */
        if (simpleProcessing) {
            this.isSwipeInProgress = false;
            return;
        }
        this.isSwipeInProgress = false;
        this.finishMoving();
        this.clearInitialValues();
    }
    move() {
        let positionX = this.getMovePositionX();
        const isPulled = this.detectPulled();
        const direction = this.getDirection();
        if (isPulled) {
            if (isPulled.edge === "left" && direction === "right" ||
                isPulled.edge === "right" && direction === "left") {
                positionX = this.slowdownOnPull(positionX);
            }
        }
        this.transformPositionX(positionX, 0);
        if (this.freeScroll) {
            this.initialPositionX = positionX;
        }
        if (isPulled) {
            if (isPulled.edge === 'left' && isPulled.overflowX > this.pullLimit) {
                this.initialPositionX = 0;
            }
            if (isPulled.edge === 'right' && isPulled.overflowX > this.pullLimit) {
                this.initialPositionX = positionX;
            }
        }
    }
    getMovePositionX() {
        const distance = this.getDistance();
        return this.initialElementPositionX - distance;
    }
    getDistance() {
        return this.startX - this.moveX;
    }
    /* If the container is pulled out of the left or right border */
    detectPulled() {
        const currentPositionX = this.getCurrentPositionX();
        if (currentPositionX > 0) {
            return {
                edge: 'left',
                positionX: currentPositionX,
                overflowX: Math.abs(currentPositionX)
            };
        }
        if (currentPositionX < this.getEndPosition()) {
            return {
                edge: 'right',
                positionX: currentPositionX,
                overflowX: Math.abs(currentPositionX - this.getEndPosition())
            };
        }
    }
    slowdownOnPull(_positionX) {
        let distance = Math.abs(this.getDistance());
        const endPosition = this.getEndPosition();
        const isPulled = this.detectPulled();
        const decelerationRatio = 3 + isPulled.overflowX / 50;
        let positionX;
        if (isPulled.edge === 'left') {
            if (this.initialElementPositionX < 0) {
                distance = distance - Math.abs(this.initialElementPositionX);
            }
            const rubberPositionX = distance / decelerationRatio;
            positionX = rubberPositionX;
            if (this.initialElementPositionX > 0) {
                positionX = this.initialElementPositionX + rubberPositionX;
            }
            if (positionX > this.pullLimit) {
                positionX = this.pullLimit;
            }
        }
        if (isPulled.edge === 'right') {
            const rubberPositionX = endPosition + (((this.initialElementPositionX - distance) - endPosition) / decelerationRatio);
            const containerWidth = this.getWidth();
            positionX = rubberPositionX;
            if (this.initialElementPositionX < -(containerWidth - this.visibleWidth)) {
                positionX = ((containerWidth - this.visibleWidth) + this.initialElementPositionX) + rubberPositionX;
            }
            if (positionX < endPosition - this.pullLimit) {
                positionX = endPosition - this.pullLimit;
            }
        }
        return positionX;
    }
    finishMoving() {
        const positionX = this.getMovePositionX();
        let newPositionX;
        if (this.freeScroll) {
            newPositionX = this.getInertia();
        }
        /* Align container while pulling */
        newPositionX = this.getAlignedPositionOnPull(newPositionX);
        this.transformPositionX(newPositionX);
        this.setInitialPosition(positionX);
    }
    /* Returns the new position of the container with inertia */
    getInertia() {
        const distance = this.getDistance();
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.startTime;
        let inertia = (distance / tapLength) * 100;
        return this.initialPositionX - inertia;
    }
    getAlignedPositionOnPull(newPositionX) {
        const direction = this.getDirection();
        if (direction === 'left') {
            let endPosition = this.getEndPosition();
            if (newPositionX < endPosition) {
                return endPosition;
            }
        }
        if (direction === 'right') {
            if (newPositionX > 0) {
                return 0;
            }
        }
        return newPositionX;
    }
    getCurrentPositionX() {
        const parentPosition = this.element.parentElement.getBoundingClientRect();
        const position = this.element.getBoundingClientRect();
        return position.left - parentPosition.left;
    }
    getEndPosition() {
        if (this.isLightDOM) {
            let imagesInContainer = this.cells.imageUtils.getImages();
            return -(imagesInContainer.length * this.fullCellWidth - this.visibleWidth - this.margin);
        }
        else {
            const width = this.getWidth();
            const visibleWidth = this.element.parentElement.clientWidth;
            return visibleWidth - width;
        }
    }
    transformPositionX(value, duration = this.transitionDuration) {
        if (value === undefined) {
            return;
        }
        this.element.style.transition = 'transform ' + duration + 'ms ' + this.transitionTimingFunction;
        this.element.style.transform = 'translateX(' + value + 'px)';
    }
    getWidth() {
        let width = this.cellLengthInLightDOMMode * this.fullCellWidth;
        let totalImageWidth = this.cellLength * this.fullCellWidth;
        if (totalImageWidth < width) {
            width = totalImageWidth;
        }
        return this.isLightDOM ? width : totalImageWidth;
    }
    setWidth() {
        const width = this.getWidth();
        this.element.style.width = width + "px";
    }
    setInitialPosition(position) {
        this.initialPositionX = position;
    }
    getElementPosition() {
        return this.element.getBoundingClientRect();
    }
    getInitialElementPositionX() {
        const carouselElementPosition = this.utils.getCarouselElementPosition()['left'];
        return this.getElementPosition()['left'] - carouselElementPosition;
    }
    clearInitialValues() {
        this.startX = this.moveX = undefined;
    }
    getDirection() {
        const direction = Math.sign(this.startX - this.moveX);
        if (direction === -1) {
            return 'right';
        }
        if (direction === 1) {
            return 'left';
        }
    }
}

class ImageUtils {
    constructor(element) {
        this.element = element;
    }
    getImages() {
        return this.cellStack.filter(this.filter);
    }
    comparePositions(a, b) {
        if (a.positionX < b.positionX) {
            return -1;
        }
        if (a.positionX > b.positionX) {
            return 1;
        }
        return 0;
    }
    filter(cell) {
        return cell.img !== undefined;
    }
}
class Cells {
    constructor(carouselProperties, utils) {
        this.carouselProperties = carouselProperties;
        this.utils = utils;
        this.counter = 0;
        this.imageUtils = new ImageUtils(this.element);
        this.init(carouselProperties);
    }
    get images() {
        return this.carouselProperties.images;
    }
    get cellLength() {
        return this.cells.length;
    }
    get fullCellWidth() {
        return this.carouselProperties.cellWidth + this.carouselProperties.margin;
    }
    get cellLengthInLightDOMMode() {
        if (this.images) {
            let cellLength = this.visibleCellsCount + this.utils.overflowCellsLimit * 2;
            if (cellLength > this.images.length) {
                cellLength = this.images.length;
            }
            return cellLength;
        }
        else {
            return this.cellLength;
        }
    }
    get visibleCellsCount() {
        return Math.ceil(this.visibleWidth / this.fullCellWidth);
    }
    get overflowCellsLimit() {
        return this.carouselProperties.overflowCellsLimit;
    }
    get isLightDOM() {
        return this.carouselProperties.lightDOM || this.carouselProperties.loop;
    }
    lineUp() {
        const cells = this.element.children;
        this.imageUtils.cellStack = [];
        for (var i = 0; i < cells.length; i++) {
            let cell = cells[i];
            let positionX = this.getCellPositionInContainer(i);
            cell.style.transform = 'translateX(' + positionX + 'px)';
            cell.style.width = this.carouselProperties.cellWidth + 'px';
            if (this.getImage(i)) {
                this.imageUtils.cellStack.push({
                    index: i,
                    positionX,
                    img: this.getImage(i)['image']
                });
            }
        }
        ;
    }
    ifSequenceOfCellsIsChanged() {
        const cells = this.element.children;
        return cells[0]['style'].transform !== 'translateX(0px)';
    }
    getCellPositionInContainer(cellIndexInDOMTree) {
        let positionIndex = this.getCellIndexInContainer(cellIndexInDOMTree);
        return positionIndex * this.fullCellWidth;
    }
    getCellIndexInContainer(cellIndexInDOMTree) {
        let positionIndex;
        if (!this.isLightDOM) {
            return cellIndexInDOMTree;
        }
        let cellLength = this.cellLengthInLightDOMMode;
        let counter = this.counter - this.carouselProperties.overflowCellsLimit;
        if (counter > cellLength) {
            counter = counter % cellLength;
        }
        if (counter < 0) {
            return cellIndexInDOMTree;
        }
        else {
            positionIndex = cellIndexInDOMTree - counter;
            if (positionIndex < 0) {
                positionIndex = cellLength + positionIndex;
            }
        }
        return positionIndex;
    }
    getImage(cellIndex) {
        if (!this.images) {
            return;
        }
        let imageIndex = this.getImageIndex(cellIndex);
        let file = this.images[imageIndex];
        if (file && !file.type) {
            file.type = 'image';
        }
        return {
            image: this.images[imageIndex],
            imageIndex
        };
    }
    getImageIndex(cellIndexInDOMTree) {
        const positionIndex = this.getCellIndexInContainer(cellIndexInDOMTree);
        let imageIndex;
        let overflowCellsLimit = this.carouselProperties.overflowCellsLimit;
        if (this.counter > overflowCellsLimit) {
            let cellLimitOverflow = this.counter - overflowCellsLimit;
            imageIndex = positionIndex + cellLimitOverflow;
            if (this.images && this.carouselProperties.loop) {
                imageIndex = imageIndex % this.images.length;
            }
        }
        else {
            imageIndex = cellIndexInDOMTree;
        }
        return imageIndex;
    }
    setCounter(value) {
        this.counter = value;
    }
    init(carouselProperties) {
        this.element = this.carouselProperties.cellsElement;
        this.cells = this.element.children;
        this.visibleWidth = this.carouselProperties.visibleWidth || this.element.parentElement.clientWidth;
    }
}

class Slide {
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

class Utils {
    constructor(carouselProperties) {
        this.carouselProperties = carouselProperties;
    }
    get images() {
        return this.carouselProperties.images;
    }
    get overflowCellsLimit() {
        if (this.images && this.isImagesLessCellLimit) {
            return Math.floor((this.images.length - this.visibleCellsCount) / 2);
        }
        else {
            return this.carouselProperties.overflowCellsLimit;
        }
    }
    get isImagesLessCellLimit() {
        return this.carouselProperties.overflowCellsLimit * 2 + this.visibleCellsCount > this.images.length;
    }
    get visibleCellsCount() {
        return Math.ceil(this.visibleWidth / this.fullCellWidth);
    }
    get fullCellWidth() {
        return this.carouselProperties.cellWidth + this.carouselProperties.margin;
    }
    get visibleWidth() {
        return this.carouselProperties.visibleWidth || this.carouselProperties.cellsElement.parentElement.clientWidth;
    }
    getStartX(event) {
        const touches = event.touches;
        const carouselElementPosition = this.getCarouselElementPosition()['left'];
        let startX;
        if (touches) {
            startX = touches[0].clientX - carouselElementPosition;
        }
        else {
            startX = event.clientX - carouselElementPosition;
        }
        return startX;
    }
    getMoveX(event) {
        const touches = event.touches;
        const carouselElementPositionX = this.getCarouselElementPosition()['left'];
        if (touches) {
            return touches[0].clientX - carouselElementPositionX;
        }
        else {
            return event.clientX - carouselElementPositionX;
        }
    }
    getCarouselElementPosition() {
        return this.carouselProperties.hostElement.getBoundingClientRect();
    }
}

class CarouselComponent {
    constructor(elementRef, ref) {
        this.elementRef = elementRef;
        this.ref = ref;
        this.minTimeout = 30;
        this._cellWidth = 200;
        this._loop = false;
        this._lightDOM = false;
        this.events = new EventEmitter();
        this.height = 200;
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
        this.hostStyleHeight = this.height + 'px';
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
                styles: [":host{-moz-user-select:none;-webkit-user-select:none;box-sizing:border-box;display:block;height:100%;left:0;position:relative;top:0;transform-origin:top left;user-select:none;width:100%;z-index:10000}:host .carousel-container{cursor:grab;height:100%;overflow:hidden;width:100%}:host .carousel-container.carousel-moving{cursor:grabbing}:host .carousel-counter{background-color:rgba(23,37,68,.3);border-radius:13px;color:#fff;font-size:11px;line-height:normal;padding:5px 7px;position:absolute;right:24px;text-align:right;top:8px;transition:opacity .2s;z-index:30}:host ::ng-deep .carousel-cells{display:block;height:100%;transition:transform .2s;width:100%;will-change:transform}:host ::ng-deep .carousel-cells .carousel-cell.swiper-prev-image{transform:translate3d(-100%,0,0)}:host ::ng-deep .carousel-cells .carousel-cell.swiper-next-image{transform:translate3d(100%,0,0)}:host ::ng-deep .carousel-cells .carousel-cell{height:100%;overflow:hidden;position:absolute;width:100%}:host ::ng-deep .carousel-cells .carousel-cell img,:host ::ng-deep .carousel-cells .carousel-cell video{height:100%;object-fit:contain;position:relative;width:100%}:host ::ng-deep .carousel-cells .carousel-cell img.swiper-hide{display:none}:host ::ng-deep .carousel-cells .carousel-cell .carousel-play{bottom:0;left:0;position:absolute;right:0;top:0;z-index:1}:host .carousel-arrow{background-color:none;background-position:50%;background-repeat:no-repeat;background-size:31px;border-radius:100px; opacity:.5;cursor:pointer;height:40px;margin-top:-20px;position:absolute;top:50%;width:40px;z-index:10}:host .carousel-arrow-prev{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMTUuNDEgMTYuNTlMMTAuODMgMTJsNC41OC00LjU5TDE0IDZsLTYgNiA2IDYgMS40MS0xLjQxeiIvPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMFYweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==);left:10px}:host .carousel-arrow-next{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNOC41OSAxNi41OUwxMy4xNyAxMiA4LjU5IDcuNDEgMTAgNmw2IDYtNiA2LTEuNDEtMS40MXoiLz48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=);right:10px}:host .carousel-arrows-outside .carousel-arrow-prev{left:-40px}:host .carousel-arrows-outside .carousel-arrow-next{right:-40px}:host .carousel-dark-arrows .carousel-arrow{filter:invert(1)}:host .carousel-arrow-disabled{cursor:default;opacity:.5}:host .carousel-dots{bottom:0;left:0;position:absolute;right:0;text-align:center;z-index:10}:host .carousel-dots .carousel-dot{border:2px solid #fff;border-radius:100px;display:inline-block;height:8px;margin:4px;width:8px}:host .carousel-dots .carousel-dot-active{background-color:#fff}"]
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

class IvyCarouselModule {
}
IvyCarouselModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    CarouselComponent
                ],
                imports: [
                    CommonModule
                ],
                exports: [
                    CarouselComponent
                ],
                providers: [],
                bootstrap: [],
                entryComponents: [
                    CarouselComponent
                ]
            },] }
];

/*
 * Public API Surface of angular-responsive-carousel
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CarouselComponent, IvyCarouselModule };
//# sourceMappingURL=angular-responsive-carousel.js.map
