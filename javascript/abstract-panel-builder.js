class AbstractPanelBuilder {
    constructor() {
        if(new.target === AbstractPanelBuilder) {
            throw new TypeError("Cannot construct AbstractPanelBuilder instances directly");
        }
        if(this.appendToPanel === undefined) {
            throw new TypeError("Must override appendToPanel(panel)");
        }
        if(this.render === undefined) {
            throw new TypeError("Must override render()");
        }
        if(this.resizePanel === undefined) {
            throw new TypeError("Must override resizePanel(width, height)");
        }
        if(this.setWindow === undefined) {
            throw new TypeError("Must override setWindow(window)");
        }
    }

    
}