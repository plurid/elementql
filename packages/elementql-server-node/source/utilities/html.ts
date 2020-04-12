export const indexHTML = (message: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ElementQL</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            background: #1C1E22;
            color: white;
            display: grid;
            place-content: center;
            text-align: center;
            font-family: Ubuntu, sans-serif;
            font-size: 20px;
        }
        a {
            color: #ccc;
            text-decoration: none;
        }
        #message {
            padding: 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div>
        <a href="https://elementql.org" target="_blank" rel="noopener noreferrer">
            ElementQL
        </a>
    </div>

    ${message && `
        <div id="message">
            ${message}
        </div>
    `}
</body>
</html>
`;
