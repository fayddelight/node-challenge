// challenge.js

const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const request = require("request");
const app = express();

app.get("/search/:artistName", (req, res) => {
  

  const artistName = req.params.artistName;
  const apiKey = "7c419bb0f61afa1161d60bce82a764f0";

  const options = {
    url: `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json`,
  };

  request(
    options,
    (error, response, body) => {
      if (error) {
        return res.status(500).send({ message: "Error in fetching data" });
      }
      if (response.statusCode === 403) {
        return res.status(404).send({ message: "Access denied" });
      }

      const data = JSON.parse(body);
      const artists = data.results.artistmatches.artist;
      
      if (artists.length==0) {
        const artistsList = require("./artists.json");
        const randomIndex = Math.floor(Math.random() * artistsList.length);
        const randomArtist = artistsList[randomIndex];
        console.log(`No results found for ${artistName}, redirecting to ${randomArtist}`);
        return res.redirect(`/search/${randomArtist}`);
      }

      const csvData = [];
      artists.map((artist) => {
        csvData.push({
          name: artist.name,
          mbid: artist.mbid,
          url: artist.url,
          image_small: artist.image[0]["#text"],
          image: artist.image,
        });
      });

      const filename = `search-results-${artistName}.csv`;
      fs.writeFileSync(
        filename,
        JSON.stringify(csvData),
        "utf8",
        function (err) {
          if (err) {
            return res
              .status(500)
              .send({ message: "Error in writing to file" });
          }
            res.download(filename);
        }
      );
      res.send({
        message: `Created csv file for artist search ${artistName}`,
      });
      console.log(`Created csv file for artist search ${artistName}`);
    }
  );
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
