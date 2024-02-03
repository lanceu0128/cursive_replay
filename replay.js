class Replay {
    constructor(elementId, filePath, speed = 1, loop = false) {
        this.replayInProgress = false;
        this.outputElement = document.getElementById(elementId);
        this.speed = speed;
        this.loop = loop;

        this.loadJSON(filePath)
            .then(data => {
                this.logData = data;
                
                // support for Cursive Recorder extension files (and outdated Curisve file formats)
                // logData should be a list of dictionaries for this to work properly
                if ("data" in this.logData) { this.logData = this.logData['data'] };
                if ("payload" in this.logData) { this.logData = this.logData['payload'] };

                this.startReplay();
            })
            .catch(error => console.error('Error loading JSON file:', error));
    }

    loadJSON(filePath) {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch JSON file');
                }
                if (response.headers.get('content-length') === '0') {
                    throw new Error('Empty JSON response');
                }
                let response_json = response.json();
                return response_json
            });
    }

    startReplay() {
        if (this.replayInProgress) return; // prevent replay if already in progress
        this.replayInProgress = true;
        this.outputElement.innerHTML = '';
        this.replayLog();
    }

    replayLog() {
        let textOutput = "";
        let index = 0;
        let lastEventTimestamp = parseInt(this.logData[0].unixTimestamp)

        const processEvent = () => {
            if (index < this.logData.length) {
                let event = this.logData[index++];
                if (event.event.toLowerCase() === 'keydown') { // can sometimes be keydown or keyDown
                    textOutput = this.applyKey(event.key, textOutput);
                }
                this.outputElement.innerHTML = textOutput;

                const timestampDifference = parseInt(event.unixTimestamp) - lastEventTimestamp;
                lastEventTimestamp = parseInt(event.unixTimestamp);
                setTimeout(processEvent, timestampDifference / this.speed);
            } else {
                this.replayInProgress = false;
                if (this.loop) { this.startReplay(); };
            }
        }

        processEvent();
    }

    skipToEnd() {
        if (this.replayInProgress) return;
        let textOutput = "";
        logData.forEach(event => {
            if (event.event === 'keydown') {
                textOutput = this.applyKey(event.key, textOutput);
            }
        });
        this.outputElement.innerHTML = textOutput;
    }

    applyKey(key, textOutput) {
        textOutput = textOutput.slice(0, -1);

        switch (key) {
            case "Enter":
                return textOutput + "|\n";
            case "Backspace":
                return textOutput.slice(0, -1) + "|";
            case "ControlBackspace":
                let lastSpace = textOutput.lastIndexOf(' ');
                return textOutput.slice(0, lastSpace) + "|";
            default:
                return !["Shift", "Ctrl", "Alt", "ArrowDown", "ArrowUp", "Control", "ArrowRight", "ArrowLeft"].includes(key) ? textOutput + key + "|" : textOutput + "|";
        }
    }
}