const app = require("./app")
const port = process.env.PORT || 3001;
/*


  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });*/

  const PORT = process.env.PORT || 3030;

// your code

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});