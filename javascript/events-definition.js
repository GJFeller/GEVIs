// Event for window system
var windowClosed = new Event('window-closed');
windowClosed.initEvent('window-closed', true, true);

// Events of the specific application
var ensembleSelectionChanged = new Event('changed-ensemble-selection');
var varChangeEvent = new Event('changed-var-selection');
ensembleSelectionChanged.initEvent('changed-ensemble-selection', true, true);
varChangeEvent.initEvent('changed-var-selection', true, true);