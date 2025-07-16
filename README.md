# Cocktail Database de Laurà

## Features

- Add, edit, and delete cocktail recipes
- Upload images (JPEG, PNG, and HEIC/HEIF)
- HEIC/HEIF images are automatically converted to JPEG for web compatibility
- Modern UI with image preview and admin-ready structure

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd mongoLaura
```

### 2. Install dependencies

```bash
npm install
```

#### Additional dependencies for image conversion:

This app uses [`sharp`](https://www.npmjs.com/package/sharp) and [`heic-convert`](https://www.npmjs.com/package/heic-convert) to convert HEIC/HEIF images to JPEG. These are installed automatically with `npm install`, but if you need to install them manually:

```bash
npm install sharp heic-convert
```

### 3. Start the server

```bash
node server.js
```

The app will be available at [http://localhost:4000](http://localhost:4000)

## Image Upload Notes

- **Supported formats:** JPEG, PNG, HEIC, HEIF
- **Max file size:** 12MB (can be changed in `server.js`)
- **HEIC/HEIF images** are automatically converted to JPEG for browser compatibility

## Troubleshooting

- If you have issues with image uploads, check your Node.js version and ensure you have the required native dependencies for `sharp`.
- For HEIC/HEIF conversion, the server must have sufficient memory and CPU resources.

## License

MIT
