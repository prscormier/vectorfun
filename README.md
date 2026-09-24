# Vector Fun

Vector Fun is a focused first prototype for interactively exploring vectors in two dimensions. It is designed to make the relationship between a vector's components, magnitude, direction, and sum immediately visible.

## Prototype features

- Two editable vectors drawn tip-to-tail on a labeled Cartesian grid
- Drag either vector's arrowhead to change it visually
- Edit x/y components or magnitude/direction numerically
- Live resultant vector for **A + B**
- Optional component guide lines
- Responsive layout for desktop and mobile
- Keyboard-accessible form controls and a canvas description

## Run locally

Requirements: Python 3 and a modern browser. Node.js is only needed to run the tests.

```bash
git clone https://github.com/prscormier/vectorfun.git
cd vectorfun
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). You can also run `npm start`, which starts the same Python server.

## Test

```bash
npm test
```

The project intentionally uses browser-native HTML, CSS, JavaScript, and Canvas with no runtime dependencies. This keeps the first prototype easy to run and leaves room to validate the interaction before choosing a larger framework or feature set.
