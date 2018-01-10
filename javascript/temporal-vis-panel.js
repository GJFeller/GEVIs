class TemporalVisPanel extends AbstractPanelBuilder {
    constructor(data, id) {
        super();
        this.id = id;
        this.data = data;
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<svg id=" + id + "-temporal width=\"100%\" height=\"100%\"></svg>");
        this.id = id;
        this.render();
    }

    render() {

    }

    resizePanel() {
        
    }
}