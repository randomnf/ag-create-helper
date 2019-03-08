'use strict';

const   gulp = require('gulp'),
        fs = require('fs'),
        fileinclude = require("gulp-file-include"),
        rename = require('gulp-rename'),
        browserSync = require('browser-sync').create();

const   slideCreateFile = "slidesCreate.json",
        slideInsertFile = "slidesInsert.json";

var presConfig = null,
    insertMode = false;

gulp.task("create", createSlides);
gulp.task("insert", insertSlides);

function createSlides()
{
    presConfig = getPresConfig(slideCreateFile);

    createSlidesFromTemplates(slideCreateFile);
}

function insertSlides()
{
    presConfig = getPresConfig(slideInsertFile);

    createSlidesFromTemplates(slideInsertFile);
}

function getPresConfig(jsonFile)
{
    var res = {},
        struct = JSON.parse( fs.readFileSync(jsonFile, "utf-8") ),
        config = struct.commonConfig,
        sections = struct.sections,

        slideNamePrefix = config.slideNamePrefix ? config.slideNamePrefix : "slide-",
        slideNamePostfix = config.slideNamePostfix ? config.slideNamePostfix : "",
        slideNumStart = config.slideNumStart ? config.slideNumStart : 5,
        slideNumStep = config.slideNumStep ? config.slideNumStep : 5,
        slideNumLen = config.slideNumLen ? config.slideNumLen : 3,

        generateMenu = (config.generateMenu && jsonFile === slideCreateFile) ? true : false;

    res.sections = sections;
    res.slideNamePrefix = slideNamePrefix;
    res.slideNamePostfix = slideNamePostfix;
    res.slideNumStart = slideNumStart;
    res.slideNumStep = slideNumStep;
    res.slideNumLen = slideNumLen;
    res.generateMenu = generateMenu;

    return res;
}

function createSlidesFromTemplates(jsonFile)
{
    insertMode = jsonFile === slideInsertFile;

    var sections = presConfig.sections,

        createdSlides = [],

        slideNamePrefix = presConfig.slideNamePrefix,
        slideNamePostfix = presConfig.slideNamePostfix,
        slideNumStart = presConfig.slideNumStart,
        slideNumStep = presConfig.slideNumStep,
        slideNumLen = presConfig.slideNumLen,

        generateMenu = (presConfig.generateMenu && !insertMode) ? true : false,
        menuAr = [],

        curSlideNum = slideNumStart,
        curSlideNumString;
    
    touchFolder("./build/slides");
    
    for(var section in sections)
    {
        var tmpSectionObj = {},
            slides = sections[section].slides,
            sectionTitle = sections[section].title,
            detailedCreation;
        
        tmpSectionObj.name = section;
        tmpSectionObj.title = sections[section].title;

        if(generateMenu)
        {
            var tmpObj = {};
            
            tmpObj.name = section;
            tmpObj.title = sectionTitle ? sectionTitle : "title placeholder";

            menuAr.push(tmpObj);
        }

        switch( typeof slides )
        {
            case "object":
                detailedCreation = true;
                break;
            case "number":
                detailedCreation = false;
                break;
            default:
                console.log("ERROR in slidesCreate.json: invalid type of slides in '" + section + "' section.");
                console.log("----- skipping to next section.");
                continue;
        }

        var iterationCount = detailedCreation ? slides.length : slides;

        for(var i = 0; i < iterationCount; i++)
        {
            var tmpSlideObj = {},
                useCustomID = false;

            if(detailedCreation)
            {
                tmpSlideObj = slides[i];

                useCustomID = tmpSlideObj["customID"] ? true : false;
            }

            tmpSlideObj.detailedCreation = detailedCreation;

            curSlideNumString = getSlideNum(curSlideNum, slideNumLen);

            if(useCustomID)
            {
                tmpSlideObj.id = slideNamePrefix + tmpSlideObj["customID"] + slideNamePostfix;
                tmpSlideObj.useCustomID = true;
            }
            else
            {
                tmpSlideObj.id = slideNamePrefix + curSlideNumString + slideNamePostfix;
                tmpSlideObj.useCustomID = false;
            }
            tmpSlideObj.num = curSlideNumString;

            if( createSlideFiles(tmpSlideObj, createdSlides) )
            {
                saveSlideData(tmpSlideObj, tmpSectionObj);
            }

            if(!useCustomID)
            {
                curSlideNum += slideNumStep;
            }
        }
    }

    if(menuAr.length)
    {
        gulpGenerateMenu(menuAr);
    }

    for(let i = 0; i < createdSlides.length; i++) {
        console.log(createdSlides[i] + " - Slide folders has been created.")
    }

    createPresentationJSON();
}

function touchFolder(folderToCheck)
{
    if( fs.existsSync(folderToCheck) )
    {
        return;
    }
    else
    {
        fs.mkdirSync(folderToCheck);

        console.log(`${folderToCheck} has been created.`)
    }
}

function getSlideNum(num, len)
{
    var result = "",
        tmp = num,
        numLen = 1;
    
    while( tmp = Math.floor(tmp / 10) )
    {
        numLen++;
    }

    if(numLen < len)
    {
        result = "0".repeat(len - numLen) + num;
    }
    else
    {
        result = num.toString();
    }

    return result;
}

function createSlideFiles(slide, createdSlides)
{
    var srcGlob = {
            "html": "./slide-templates/html/slide-template.html",
            "css": "./slide-templates/css/slide-template.css",
            "js": "./slide-templates/js/slide-template.js"
        },
        slideID = slide.id,
        slideNum = slide.useCustomID ? slide.id : slide.num,
        folderName = "./build/slides/" + slideID,
        content = slide.content,

        popups = 0,
        tabs = 0;

    if(slide.detailedCreation)
    {
        if(content)
        {
            popups = (typeof content.popups === "number") ? content.popups : 0,
            tabs = (typeof content.tabs === "number") ? content.tabs : 0;
        }
    }

    if( !fs.existsSync(folderName) )
    {
        fs.mkdirSync(folderName);
        createdSlides.push(slideID);

        for(var template in srcGlob)
        {
            gulp.src(srcGlob[template])
                .pipe(fileinclude({
                    context: {
                        slidename: slideID,
                        slidenum: slideNum,
                        popups: popups,
                        tabs: tabs
                    }
                }))
                .pipe(rename({
                    basename: slideID
                }))
                .pipe( gulp.dest(folderName) );
        }

        return true;
    }
    
    return false;
}

var presJSONtmp = {
    slides: {},
    structures: {},
    storyboard: [],
    storyboards: {},
    modules: JSON.parse( fs.readFileSync("./slide-templates/json/modules.json", "utf-8") ),
};

function saveSlideData(slide, section)
{
    var slideObj = {};
    
    slideObj.id = slide.id;
    slideObj.name = slide.slideDesc ? slide.slideDesc : "";
    slideObj.files = getTemplatesObj(slide.id);
    slideObj.type = "slide";
    slideObj.shareable = {};

    presJSONtmp.slides[slideObj.id] = slideObj;
    
    if( presJSONtmp.storyboard.indexOf(section.name) === -1 )
    {
        presJSONtmp.storyboard.push(section.name);
    }
    
    if(section.name in presJSONtmp.structures)
    {
        var struct = presJSONtmp.structures[section.name],
            storys = presJSONtmp.storyboards[section.name],
            slideAr = struct.content;
        
        slideAr.push(slideObj.id);
        storys.content = slideAr;
    }
    else
    {
        var name = section.title ? section.title : "",
            content = [slideObj.id];
        
        presJSONtmp.structures[section.name] = {};

        presJSONtmp.structures[section.name].name = name;
        presJSONtmp.structures[section.name].content = content;
        presJSONtmp.structures[section.name].type = "slideshow";

        presJSONtmp.storyboards[section.name] = {};

        presJSONtmp.storyboards[section.name].name = name;
        presJSONtmp.storyboards[section.name].content = content;
        presJSONtmp.storyboards[section.name].linear = false;
    }
}

function createPresentationJSON()
{
    var outFile = "./build/presentation.json";
    
    if(insertMode)
    {
        touchFolder("./copy-paste-torture");

        outFile = "./copy-paste-torture/presentation.json";

        delete presJSONtmp.modules;
    }

    if( !insertMode && fs.existsSync(outFile) )
    {
        console.log(outFile + " already exists. Data will be written to " + (outFile = "./build/presentation_new.json"));
    }

    fs.writeFile(outFile, JSON.stringify(presJSONtmp, null, 4), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    console.log(outFile + " has been created.");
}

function getTemplatesObj(id)
{
    return {
        "templates": [
            "slides/" + id + "/" + id + ".html"
        ],
        "styles": [
            "slides/" + id + "/" + id + ".css"
        ],
        "scripts": [
            "slides/" + id + "/" + id + ".js"
        ]
    };
}

function gulpGenerateMenu(menu)
{
    var destFileName = "index.html";

    if( fs.existsSync("./build/index.html") )
    {
        touchFolder("./copy-paste-torture");

        destFileName = "./copy-paste-torture/generatedMenu.html";

        console.log("index.html already exists. Generated menu will be written to " + destFileName);
    }

    var menuHTML = "<ul class=\"menu menu-custom\">";

    for(var i = 0; i < menu.length; i++)
    {
        var name = menu[i].name,
            title = menu[i].title,
            slideID = getFirstSlideIDInBranch(name);
        
        menuHTML += `\n    <li class=\"menu-custom__btn menu-custom__btn_${name}\" data-goto=\"${name}/${slideID}\">${title}</li>`;
    }

    menuHTML += "\n</ul>";

    if(destFileName !== "index.html")
    {
        fs.writeFile(destFileName, menuHTML, function(err) {
            if(err) {
                return console.log(err);
            }
        });
    }
    else
    {
        gulp.src("slide-templates/html/index-template.html")
            .pipe(fileinclude({
                indent: true,
                context: {
                    menu: menuHTML
                }
            }))
            .pipe( rename( destFileName ) )
            .pipe( gulp.dest("./build/") );
    }

    console.log("Menu has been generated.")
}

function getFirstSlideIDInBranch(branchName)
{
    return presJSONtmp.structures[branchName].content[0];
}

gulp.task('browserSync', function () {
    browserSync.init({
        watch: true,
        server: {
            baseDir: "./build/",
            index: "index.html"
        }
    });
});

gulp.task("pptr-screens", function() {
    //...
});

gulp.task("thumbs-create", function() {
    var origFolder = "slide-screens-orig/",
        origImages = fs.readdirSync(origFolder);

    for (var i = 0; i < origImages.length; i++)
    {
        var slideID = origImages[i].split(".")[0],
            srcGlob = origFolder + origImages[i],
            dest = "./build/slides/" + slideID;

        gulp.src(srcGlob)
            // .pipe( imageMagickHere )
            .pipe( gulp.dest(dest) );
    }
});

gulp.task("default", ["browserSync"]);