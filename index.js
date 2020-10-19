const express = require("express");
const app = express();
const puppeteer = require("puppeteer");

app.get("/", async (req, res) => {
  let query = req.query.url;
  console.log(query);
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
  const modifiedwebsiteContent = websiteContent.replace(`class="pdf-vdo"`, "");
  // console.log(modifiedwebsiteContent);
  await page.setContent(modifiedwebsiteContent);
  await page.emulateMediaType("screen");
  await page.pdf({ path: "/pdfs/demo.pdf", format: "A4" }).then(function () {
    browser.close();
    console.log("done");
    res.sendFile(__dirname + "/pdfs/demo.pdf");
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(`connected to ${PORT}`));
