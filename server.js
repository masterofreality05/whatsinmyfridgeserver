const app = require("../backend/app")
const port = process.env.PORT || 3001;
/*


  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });*/

  app.listen(3001,  () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });