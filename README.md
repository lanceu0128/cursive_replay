# Cursive Replay
## Introduction
Cursive Replay allows users to replay typing logs, immortalizing one's work and verifying human authorship. It is a simple NPM package and CDN that works with file created using Cursive Recorder.   

## Example Usage
As outlined in `demo.html`, usage is as simple as calling the CDN in your HTML:

```
<script src="https://unpkg.com/cursive-replay"></script>
```

(OPTIONAL) To protect users from personal data leaks, you may want to use an SRI hash. This allows your browser to check if package code has not been tampered with. Learn more about SRI keys and generate one yourself through `https://www.srihash.org/`. Insert the generated key into your script as shown here:

```
<script src="https://unpkg.com/cursive-replay" integrity="sha256-key-here" crossorigin="anonymous"></script>
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

This CDN is designed to be used with Cursive Recorder, a chrome extension that securely tracks your typing activity across the web. Files recorded with Recorder can be replayed using Replay.
