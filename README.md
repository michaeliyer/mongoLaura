# Cocktail Database Application

A modern web application for managing cocktail recipes with a MongoDB database backend and a beautiful, responsive frontend.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete cocktail recipes
- **Search Functionality**: Search cocktails by name, ingredients, recipe, or comments
- **Modern UI**: Beautiful, responsive design with smooth animations
- **MongoDB Database**: Persistent data storage with automatic initialization
- **RESTful API**: Clean API endpoints for all operations
- **Form Validation**: Client-side and server-side validation
- **Real-time Updates**: Instant UI updates after operations

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start MongoDB** (if not already running):

   ```bash
   mongod
   ```

   (or use MongoDB Atlas and set your `MONGO_URI` environment variable)

4. **Start the application**:

   ```bash
   npm start
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Database Schema (Mongoose)

The application uses a MongoDB collection `cocktails` with the following schema:

```js
{
  theCock:      { type: String, required: true },
  theIngredients: { type: String, required: true },
  theRecipe:    { type: String, required: true },
  theJpeg:      { type: String },
  theComment:   { type: String },
  created_at:   { type: Date, default: Date.now }
}
```

## API Endpoints

- `GET /api/cocktails` - Get all cocktails
- `GET /api/cocktails/:id` - Get a specific cocktail
- `POST /api/cocktails` - Create a new cocktail
- `PUT /api/cocktails/:id` - Update an existing cocktail
- `DELETE /api/cocktails/:id` - Delete a cocktail
- `POST /api/upload` - Upload an image (returns file path)

## Usage

### Adding a New Cocktail

1. Fill out the form on the left side of the application
2. Required fields: Cocktail Name, Ingredients, Recipe
3. Optional fields: Image URL, Comments
4. Click "Save Cocktail"

### Editing a Cocktail

1. Click the "Edit" button on any cocktail card
2. The form will be populated with the cocktail's data
3. Make your changes
4. Click "Save Cocktail" or "Cancel" to abort

### Deleting a Cocktail

1. Click the "Delete" button on any cocktail card
2. Confirm the deletion in the modal dialog

### Searching Cocktails

1. Use the search box in the top-right of the cocktails section
2. Search works across cocktail names, ingredients, recipes, and comments
3. Results update in real-time as you type

## File Structure

```
mongoLaura/
├── server.js              # Main server file with Express and MongoDB/Mongoose
├── package.json           # Node.js dependencies and scripts
├── allCocktails.js        # Original cocktail data (imported automatically)
├── public/                # Frontend files
│   ├── index.html         # Main HTML page
│   ├── style.css          # CSS styling
│   └── script.js          # Frontend JavaScript
└── README.md              # This file
```

## Initial Data

The application automatically imports the initial cocktails from `allCocktails.js` when the database is first created:

- **Hot Rüuski**: Vodka, Peat Moss, Pine Tar
- **Cold Soul**: Vodka, Ice, Herbs

## Development

### Adding New Features

1. **Backend**: Modify `server.js` to add new API endpoints
2. **Frontend**: Update `public/script.js` for new functionality
3. **Styling**: Modify `public/style.css` for UI changes

### Database Modifications

To modify the database schema:

1. Update the Mongoose schema in `server.js`
2. Remove or update existing documents as needed
3. Restart the application

## Troubleshooting

### Common Issues

1. **Port already in use**: Stop the process using port 3000 or change the port in `server.js`
2. **MongoDB connection errors**: Make sure MongoDB is running locally or update your `MONGO_URI` for Atlas/cloud
3. **CORS issues**: The server includes CORS middleware for cross-origin requests

### Logs

Check the console output for:

- Database connection status
- API request logs
- Error messages

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Enjoy managing your cocktail recipes! 🍸**
