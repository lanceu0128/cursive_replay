# Cursive Replay
## Introduction
Cursive Replay allows users to verify that writing was written by a human and replay authorship. It is a simple NPM package and CDN that works with file created using Cursive Recorder.   

## Example Usage
As outlined in `demo.html`, usage is as simple as calling the CDN in your HTML:

```
<script src="https://unpkg.com/cursive-replay"></script>
```

And calling the Replay class onto a specified element:

```
<body>
    <div id="output"></div>
    <script>
        var replay = new Replay(
            elementId='output', 
            filePath='revision-1.json',
            speed=25,
            loop=true
        )
    </script>
</body>
```

## About Cursive and Cursive Recorder
Cursive is a company dedicated to proving authorship in writing through biometric authentication and typing analytics. 

This CDN is designed to be used with Cursive Recorder, a chrome extension that securely tracks your typing activity across the web. Files created with Recorder are replaying using Replay.
