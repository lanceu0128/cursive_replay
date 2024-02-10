var Replay = /** @class */ (function () {
    function Replay(elementId, filePath, speed, loop) {
        if (speed === void 0) { speed = 1; }
        if (loop === void 0) { loop = false; }
        var _this = this;
        this.replayInProgress = false;
        this.speed = speed;
        this.loop = loop;
        var element = document.getElementById(elementId);
        if (element) {
            this.outputElement = element;
        }
        else {
            throw new Error("Element with id '".concat(elementId, "' not found"));
        }
        this.loadJSON(filePath)
            .then(function (data) {
            _this.logData = data;
            // support for Cursive Recorder extension files (and outdated Curisve file formats)
            // logData should be a list of dictionaries for this to work properly
            if ("data" in _this.logData) {
                _this.logData = _this.logData['data'];
            }
            ;
            if ("payload" in _this.logData) {
                _this.logData = _this.logData['payload'];
            }
            ;
            _this.startReplay();
        })
            .catch(function (error) { throw new error('Error loading JSON file:', error); });
    }
    Replay.prototype.loadJSON = function (filePath) {
        return fetch(filePath)
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to fetch JSON file');
            }
            if (response.headers.get('content-length') === '0') {
                throw new Error('Empty JSON response');
            }
            var response_json = response.json();
            return response_json;
        });
    };
    Replay.prototype.startReplay = function () {
        if (this.replayInProgress)
            return; // prevent replay if already in progress
        this.replayInProgress = true;
        this.outputElement.innerHTML = '';
        this.replayLog();
    };
    Replay.prototype.replayLog = function () {
        var _this = this;
        var textOutput = "";
        var index = 0;
        var processEvent = function () {
            if (index < _this.logData.length) {
                var event_1 = _this.logData[index++];
                if (event_1.event.toLowerCase() === 'keydown') { // can sometimes be keydown or keyDown
                    textOutput = _this.applyKey(event_1.key, textOutput);
                }
                _this.outputElement.innerHTML = textOutput;
                setTimeout(processEvent, 1 / _this.speed * 100);
            }
            else {
                _this.replayInProgress = false;
                if (_this.loop) {
                    _this.startReplay();
                }
                ;
            }
        };
        processEvent();
    };
    Replay.prototype.skipToEnd = function () {
        var _this = this;
        if (this.replayInProgress)
            return;
        var textOutput = "";
        this.logData.forEach(function (event) {
            if (event.event === 'keydown') {
                textOutput = _this.applyKey(event.key, textOutput);
            }
        });
        this.outputElement.innerHTML = textOutput;
    };
    Replay.prototype.applyKey = function (key, textOutput) {
        textOutput = textOutput.slice(0, -1);
        switch (key) {
            case "Enter":
                return textOutput + "|\n";
            case "Backspace":
                return textOutput.slice(0, -1) + "|";
            case "ControlBackspace":
                var lastSpace = textOutput.lastIndexOf(' ');
                return textOutput.slice(0, lastSpace) + "|";
            default:
                return !["Shift", "Ctrl", "Alt", "ArrowDown", "ArrowUp", "Control", "ArrowRight", "ArrowLeft"].includes(key) ? textOutput + key + "|" : textOutput + "|";
        }
    };
    return Replay;
}());
