const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gym Slot Booking server running at http://localhost:${PORT}`);
});
