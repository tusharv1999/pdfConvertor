const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const fs = require("fs");
app.get("/", async (req, res) => {
  let query = req.query.url;
  if (!query) {
    res.status(400).send({
      message: "Path is missing.",
    });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(query, { waitUntil: "networkidle2" });
  const websiteContent = await page.content();
  const modifiedwebsiteContent = websiteContent.replace(
    /class="pdf-vdo"|<video .*?>.+?<\Wvideo>|handover-web-link|<a href="#" class="exprt-pdf">.*?<\Wa>/gms,
    ""
  );

  await page.setContent(modifiedwebsiteContent);
  await page.emulateMediaType("screen");
  let pathName = `/tmp/converted-${Date.now()}.pdf`;
  await page
    .pdf({
      path: pathName,
      format: "A4",
      margin: { top: 50, bottom: 50 },
    })
    .then(function () {
      browser.close();
      console.log("done");
      // res.sendFile(pathName);
      res.sendFile(pathName, (err) => {
        if (!err) {
          fs.unlinkSync(pathName);
        }
      });
    });
});

const PORT = process.env.PORT || 8200;
app.listen(PORT, console.log(`connected to ${PORT}`));
