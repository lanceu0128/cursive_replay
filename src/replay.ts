class Replay {
    replayInProgress: boolean;
    outputElement: HTMLElement;
    speed: number;
    loop: boolean;
    logData: Record<string, any>[];
    replayTimeout: any;

    constructor(elementId: string, filePath: string, speed = 1, loop = false) {
        this.replayInProgress = false;
        this.speed = speed;
        this.loop = loop;

        const element = document.getElementById(elementId);
        if (element) {
            this.outputElement = element;
        } else {
            throw new Error(`Element with id '${elementId}' not found`);
        }

        this.loadJSON(filePath)
            .then((data: Record<string, any>[]) => {
                this.logData = data;

                // support for Cursive Recorder extension files (and outdated Curisve file formats)
                // logData should be a list of dictionaries for this to work properly
                if ("data" in this.logData) { this.logData = this.logData['data'] as Record<string, any>[] };
                if ("payload" in this.logData) { this.logData = this.logData['payload'] as Record<string, any>[] };

                this.startReplay();
            })
            .catch(error => { throw new error('Error loading JSON file:', error) });
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
        // clear previous instances of timeout to prevent multiple running at once
        if (this.replayInProgress) {
            clearTimeout(this.replayTimeout);
        };
        this.replayInProgress = true;
        this.outputElement.innerHTML = '';
        this.replayLog();
    }

    replayLog() {
        let textOutput = "";
        let index = 0;

        const processEvent = () => {
            if (this.replayInProgress) {
                if (index < this.logData.length) {
                    let event = this.logData[index++];
                    if (event.event.toLowerCase() === 'keydown') { // can sometimes be keydown or keyDown
                        textOutput = this.applyKey(event.key, textOutput);
                    }
                    this.outputElement.innerHTML = textOutput;

                    // replayInProgress will be false here iff skipToEnd() is triggered
                    this.replayTimeout = r setTimeout(processEvent, 1 / this.speed * 100);
                } else {
                    this.replayInProgress = false;
                    if (this.loop) { this.startReplay(); };
                }
            }
        }

        processEvent();
    }

    skipToEnd() {
        if (this.replayInProgress) {
            this.replayInProgress = false;
        }
        let textOutput = "";
        this.logData.forEach(event => {
            if (event.event.toLowerCase() === 'keydown') {
                textOutput = this.applyKey(event.key, textOutput);
            }
        });
        this.outputElement.innerHTML = textOutput.slice(0, -1);
    }

    applyKey(key: string, textOutput: string) {
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