// #Project 2- Web automation on hackerrank in which we will add moderators in 
// every contest. Puppeteer is installed globally in my machine so no need to insatll it again, but it is a gud way to do installation locally
// not globally

// npm init -y
// npm install minimist

// node hacker_automate.js --config=config.json --url="https://www.hackerrank.com/"

let minimist= require("minimist");
let args= minimist(process.argv);
let puppeteer= require("puppeteer");
let fs= require("fs");

// console.log(args.config);
// console.log(args.url);

let configJSON= fs.readFileSync(args.config, "utf-8");
let configJSO= JSON.parse(configJSON);

async function run(){
    //start the browser
    let browser= await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });

    //get the tabs(there is only one tab):
    let pages= await browser.pages();
    let page= pages[0];

    //open the url
    await page.goto(args.url);

    //wait and then click on login on page1:
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    //wait and then click on login on page2:
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    await page.waitFor(2000);

    //type user id:
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", configJSO.userid, {delay: 30});

    //type user password:
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, {delay: 30});

    //press login and go to page 3:
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    //entered hackerrank, now goto contest:
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    await page.waitFor(2000);

    //in hackerrank go to manage contests:
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");


    //find pages
    await page.waitForSelector("a[data-attr1= 'Last']");
    let numPages= await page.$eval("a[data-attr1= 'Last']", function(atags){
        let NP= parseInt(atags.getAttribute("data-page"));
        return NP;
    })

    //Visit all pages while visiting pages go in contests of pages:

    for(let i= 0; i< numPages-1; i++){
        await page.waitForSelector("a.backbone.block-center");
        let ConatPages= await page.$$eval("a.backbone.block-center", function(acon){
            let urls= [];

            for(let i= 0; i < acon.length; i++){
                let url= acon[i].getAttribute('href');
                urls.push(url);
            }
            return urls;
        });
        // console.log(ConatPages);

        await page.waitFor(3000);

        //This code opens new tab by opening the first contest of page:
        for(let i= 0; i < ConatPages.length; i++){
            let npage= await browser.newPage();

            await SaveMod(args.url + ConatPages[i], npage, configJSO.moderators);

            await npage.close();
        }
        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");

    }
    
    // await browser.close();
    // console.log("Browser closed");
}


async function SaveMod(url, npage, moderator){

    await npage.bringToFront();
    await npage.goto(url);

    await npage.waitFor(2000);

    // // Go in moderators
    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");

    // //Add moderator config.moderator:
    await npage.waitForSelector("input#moderator");
    await npage.type("input#moderator", moderator, {delay: 30});

    await npage.keyboard.press("Enter");

}

run();

