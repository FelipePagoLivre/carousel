export class Utils {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLXJlc3BvbnNpdmUtY2Fyb3VzZWwvc3JjL2xpYi91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQU8sS0FBSztJQThCZCxZQUFvQixrQkFBc0M7UUFBdEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtJQUUxRCxDQUFDO0lBOUJELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztJQUMxQyxDQUFDO0lBRUQsSUFBSSxrQkFBa0I7UUFDbEIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN4RTthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7U0FDckQ7SUFDTCxDQUFDO0lBRUQsSUFBSSxxQkFBcUI7UUFDckIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUN4RyxDQUFDO0lBRUQsSUFBSSxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztJQUM5RSxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztJQUNsSCxDQUFDO0lBTUQsU0FBUyxDQUFDLEtBQVU7UUFDaEIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM5QixNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFFLElBQUksTUFBTSxDQUFDO1FBRVgsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQztTQUN6RDthQUFNO1lBQ0gsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUM7U0FDcEQ7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsUUFBUSxDQUFDLEtBQVU7UUFDZixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQzlCLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0UsSUFBSSxPQUFPLEVBQUU7WUFDVCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUM7U0FDeEQ7YUFBTTtZQUNILE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQztTQUNuRDtJQUNMLENBQUM7SUFFRCwwQkFBMEI7UUFDdEIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDdkUsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9wZXJ0aWVzIGFzIENhcm91c2VsUHJvcGVydGllc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBVdGlscyB7XHJcblxyXG4gICAgZ2V0IGltYWdlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbFByb3BlcnRpZXMuaW1hZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvdmVyZmxvd0NlbGxzTGltaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VzICYmIHRoaXMuaXNJbWFnZXNMZXNzQ2VsbExpbWl0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKCh0aGlzLmltYWdlcy5sZW5ndGggLSB0aGlzLnZpc2libGVDZWxsc0NvdW50KSAvIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5vdmVyZmxvd0NlbGxzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0ltYWdlc0xlc3NDZWxsTGltaXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2Fyb3VzZWxQcm9wZXJ0aWVzLm92ZXJmbG93Q2VsbHNMaW1pdCAqIDIgKyB0aGlzLnZpc2libGVDZWxsc0NvdW50ID4gdGhpcy5pbWFnZXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXNpYmxlQ2VsbHNDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudmlzaWJsZVdpZHRoIC8gdGhpcy5mdWxsQ2VsbFdpZHRoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZnVsbENlbGxXaWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbFByb3BlcnRpZXMuY2VsbFdpZHRoICsgdGhpcy5jYXJvdXNlbFByb3BlcnRpZXMubWFyZ2luO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXNpYmxlV2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2Fyb3VzZWxQcm9wZXJ0aWVzLnZpc2libGVXaWR0aCB8fCB0aGlzLmNhcm91c2VsUHJvcGVydGllcy5jZWxsc0VsZW1lbnQucGFyZW50RWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhcm91c2VsUHJvcGVydGllczogQ2Fyb3VzZWxQcm9wZXJ0aWVzKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXJ0WChldmVudDogYW55KSB7XHJcbiAgICAgICAgY29uc3QgdG91Y2hlcyA9IGV2ZW50LnRvdWNoZXM7XHJcbiAgICAgICAgY29uc3QgY2Fyb3VzZWxFbGVtZW50UG9zaXRpb24gPSB0aGlzLmdldENhcm91c2VsRWxlbWVudFBvc2l0aW9uKClbJ2xlZnQnXTtcclxuICAgICAgICBsZXQgc3RhcnRYO1xyXG5cclxuICAgICAgICBpZiAodG91Y2hlcykge1xyXG4gICAgICAgICAgICBzdGFydFggPSB0b3VjaGVzWzBdLmNsaWVudFggLSBjYXJvdXNlbEVsZW1lbnRQb3NpdGlvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydFggPSBldmVudC5jbGllbnRYIC0gY2Fyb3VzZWxFbGVtZW50UG9zaXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RhcnRYO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1vdmVYKGV2ZW50OiBhbnkpIHtcclxuICAgICAgICBjb25zdCB0b3VjaGVzID0gZXZlbnQudG91Y2hlcztcclxuICAgICAgICBjb25zdCBjYXJvdXNlbEVsZW1lbnRQb3NpdGlvblggPSB0aGlzLmdldENhcm91c2VsRWxlbWVudFBvc2l0aW9uKClbJ2xlZnQnXTtcclxuXHJcbiAgICAgICAgaWYgKHRvdWNoZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRvdWNoZXNbMF0uY2xpZW50WCAtIGNhcm91c2VsRWxlbWVudFBvc2l0aW9uWDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQuY2xpZW50WCAtIGNhcm91c2VsRWxlbWVudFBvc2l0aW9uWDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2Fyb3VzZWxFbGVtZW50UG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2Fyb3VzZWxQcm9wZXJ0aWVzLmhvc3RFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgfVxyXG59Il19