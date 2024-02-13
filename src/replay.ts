class Replay {
    replayInProgress: boolean;
    outputElement: HTMLElement;
    // buttonElement: HTMLElement;
    // scrubberElement: HTMLInputElement;
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

        // this.constructController(controllerId); 

        this.loadJSON(filePath)
            .then((data: Record<string, any>[]) => {
                this.logData = data;

                // support for Cursive Recorder extension files (and outdated Curisve file formats)
                // logData should be a list of dictionaries for this to work properly
                if ("data" in this.logData) { this.logData = this.logData['data'] as Record<string, any>[] };
                if ("payload" in this.logData) { this.logData = this.logData['payload'] as Record<string, any>[] };

                this.startReplay();
            })
            .catch(error => { throw new Error('Error loading JSON file.'); });
        }

    // private constructController(controllerId) {
    //     const controller = document.getElementById(controllerId);
    //     if (controller) {
    //         this.buttonElement = document.createElement('button');
    //         this.buttonElement.id = 'playerButton';
    //         this.buttonElement.textContent = 'Play';

    //         this.scrubberElement = document.createElement('input');
    //         this.scrubberElement.type = 'range';
    //         this.scrubberElement.id = 'timelineScrubber';
    //         this.scrubberElement.min = '0';
    //         this.scrubberElement.max = '100';

    //         // Append the button and input element as children to the parent div
    //         controller.appendChild(this.buttonElement);
    //         controller.appendChild(this.scrubberElement);
    //     }
    // }

    private loadJSON(filePath) {
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

    // call this to make a "start" or "start over" function
    public startReplay() {
        // clear previous instances of timeout to prevent multiple running at once
        if (this.replayInProgress) {
            clearTimeout(this.replayTimeout);
        };
        this.replayInProgress = true;
        this.outputElement.innerHTML = '';
        this.replayLog();
    }

    // called by startReplay() to recursively call through keydown events
    private replayLog() {
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
                    this.replayTimeout = setTimeout(processEvent, 1 / this.speed * 100);
                } else {
                    this.replayInProgress = false;
                    if (this.loop) { this.startReplay(); };
                }
            }
        }

        processEvent();
    }

    public skipToEnd() {
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

    // used in various places to add a keydown, backspace, etc. to the output
    private applyKey(key: string, textOutput: string) {
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