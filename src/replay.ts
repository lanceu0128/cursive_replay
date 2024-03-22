import { text } from '@fortawesome/fontawesome-svg-core';
import * as $ from 'jquery';
export class Replay {
    outputElement: JQuery<HTMLElement>;
    buttonElement: JQuery<HTMLElement>;
    scrubberElement: JQuery<HTMLElement>;
    backButton: JQuery<HTMLElement>;
    playButton: JQuery<HTMLElement>;
    forwardButton: JQuery<HTMLElement>;
    
    replayInProgress: boolean;
    speed: number;
    loop: boolean;
    logData: Record<string, any>[];
    replayTimeout: any;
    ctrlPressed: boolean;

    constructor(elementId: string, filePath: string, speed = 1, loop = false, controllerId?: string) {
        this.replayInProgress = false;
        this.speed = speed;
        this.loop = loop;
        this.ctrlPressed = false;

        const element = $(`#${elementId}`);
        if (element.length) {
            this.outputElement = element;
        } else {
            throw new Error(`Element with id '${elementId}' not found`);
        }
        
        if (controllerId) {
            console.log("made it here")
            this.constructController(controllerId); 
        }
        
        this.loadJSON(filePath)
            .then((data: Record<string, any>[]) => {
                this.logData = data;
                if ("data" in this.logData) { this.logData = this.logData['data'] as Record<string, any>[] };
                if ("payload" in this.logData) { this.logData = this.logData['payload'] as Record<string, any>[] };
                
                this.startReplay();
            })
            .catch(error => {
                throw new Error('Error loading JSON file: ' + error.message);
            });

    }
        
    private constructController(controllerId:string) {
        const controller = $(`#${controllerId}`);
        if (controller.length) {
            this.backButton = $("<button>")
                .text("⏪")
                .click(() => {
                    this.skipToTime(0);
                });

            this.playButton = $("<button>")
                .text("▶️")
                .click(() => {
                    if (this.replayInProgress) {
                        this.skipToTime(Number(this.scrubberElement.val()));
                    } else {
                        this.startReplay();
                    }
                });

            this.forwardButton = $("<button>")
                .text("⏩")
                .click(() => {
                    this.skipToEnd();
                });

            this.scrubberElement = $("<input>")
                .attr({
                    type: 'range',
                    id: 'timelineScrubber',
                    min: '0',
                    max: '100'
                })
                .on('input', () => {
                    const scrubberValue = this.scrubberElement.val();
                    this.skipToTime(Number(scrubberValue));                
                });

            controller.append(this.backButton, this.playButton, this.forwardButton, this.scrubberElement);
        }
    }    

    private setScrubberVal(value) {
        if (this.scrubberElement) {
            this.scrubberElement.val(value);
        }
    }

    private loadJSON(filePath:string): Promise<Record<string, any>[]> {
        return new Promise((resolve, reject) => {
            $.getJSON(filePath, data => {
                resolve(data);
            }).fail((jqxhr, textStatus, error) => {
                reject(new Error(`Error loading JSON file: ${error}`));
            });
        });
    }

    public startReplay() {
        if (this.replayInProgress) {
            clearTimeout(this.replayTimeout);
        };
        this.replayInProgress = true;
        this.outputElement.empty();
        this.replayLog();
    }

    private replayLog() {
        let textOutput = "";
        let index = 0;

        const processEvent = () => {
            if (this.replayInProgress) {
                if (index < this.logData.length) {
                    let event = this.logData[index++];
                    textOutput = this.applyKey(event, textOutput);
                    console.log(textOutput)
                    this.outputElement.html(textOutput);
                    this.setScrubberVal(index / this.logData.length * 100)
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
            textOutput = this.applyKey(event, textOutput);
        });
        this.outputElement.html(textOutput.slice(0, -1));
        this.setScrubberVal(100);
    }

    public skipToTime(percentage:number) {
        if (this.replayInProgress) {
            this.replayInProgress = false;
        }
        
        let textOutput = "";
        const numElementsToProcess = Math.ceil(this.logData.length * percentage / 100);
        for (let i = 0; i < numElementsToProcess; i++) {
            const event = this.logData[i];
            textOutput = this.applyKey(event, textOutput);
        }
        
        this.outputElement.html(textOutput.slice(0, -1));
        this.setScrubberVal(percentage);
    }

    private applyKey(event:Record<string, any>, textOutput:string) {
        const key = event["key"]

        if (event.event.toLowerCase() === 'keydown') {
            if (key === "Control") {
                this.ctrlPressed = true; // needed for CTRL shortcuts
            } else if (key === "Enter") {
                textOutput += "<br>";
            } else if (key === "Backspace") {
                // If last action was Enter/paragraph break, ctrl status doesn't matter
                if (textOutput.slice(-4) === "<br>") {
                    textOutput = textOutput.slice(0, -4);
                // If CTRL was pressed: remove last word, else: remove last character
                } else if (this.ctrlPressed && textOutput.length > 0) {
                    textOutput = textOutput.trim();
                    const last_space = textOutput.lastIndexOf(' ');
                    textOutput = textOutput.substring(0, last_space !== -1 ? last_space + 1 : 0);
                } else if (textOutput.length > 0) {
                    textOutput = textOutput.slice(0, -1);
                }
            // shortcuts; unsure if these need to be any better. ctrl x and ctrl z could use changes to the rest of the text possibly
            } else if (key.toLowerCase() === "v" && this.ctrlPressed) {
                textOutput += "📋";
            } else if (key.toLowerCase() === "z" && this.ctrlPressed) {
                textOutput += "🔙";
            } else if (key.toLowerCase() === "x" && this.ctrlPressed) {
                textOutput += "✂️";
            } else if (key.length === 1) { 
                textOutput += key;
            }
        } else if (event.event === 'keyup' && key === "Control") {
            this.ctrlPressed = false;
        }

        return textOutput;
    }
}