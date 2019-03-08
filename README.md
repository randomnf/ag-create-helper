# Agnitio create presentation helper
The purpose of this mess of code is to make life of DIVelopers and creation of new presentation for Agnitio Rainmaker easier (at least particaly).
## Installation
```bash
git clone git://github.com/randomnf/ag-create-helper ag-create-helper
cd ag-create-helper
rm -rf .git
npm i
```
## Usage
Presentation structure is described in `json` file, then according to this description folders and slide templates, `presentation.json` file and simple single-level menu will be generated. Slide templates files are in `./slide-templates` folder. Data insertion into these templates is done via `gulp-file-include`.
### Creating presentaion from scratch
If presentation is creating from scratch, you should use `slidesCreate.json` file to describe presentation structure and perform `gulp create` task.
### Adding new slides into ixisting presentation
If presentation already contains some slides and you need to generate some new ones, you should use `slidesInsert.json` file to describe new presentation slides and and perorm `gulp insert` task.
### Structure of slidesCreate.json
You should use this file if you are creating new presentation from scratch.
Content example:
```json
{
    "commonConfig": {
        "slideNamePrefix": "slide-",
        "slideNamePostfix": "--productName",
        "slideNumStart": 5,
        "slideNumStep": 5,
        "slideNumLen": 3,

        "generateMenu": true
    },

    "sections": {
        "visit": {
            "title": "Section name",
            "slides": [
                {
                    "slideDesc": "Slide description for stats"
                },
                {
                    "customID": "email",
                    "content": {
                        "popups": 3
                    },
                    "slideDesc": "Slide description for stats"
                },
                {
                    "content": {
                        "tabs": 2
                    },
                    "slideDesc": "Slide description for stats"
                }
            ]
        }
    }
}
```
According to this structure next slides will be generated:
- slide-005--productName
- slide-010--productName (with 2 tabs)
- slide-email--productName (with 3 popups)

In `commonConfig` object some common presentation properties are described:
- `slideNamePrefix` - slide name prefix, by default is `"slide-"`
- `slideNamePostfix` - slide name postfix, by default is missing
- `slideNumStart` - slide starting number, by default is `5`
- `slideNumStep` - incrementing value in slide counting, by default is `5`
- `slideNumLen` - symbol count for slide number, will be led by zeroes to fit number length; for example, number `20` with `slideNumLen = 4` will be transformed into `"0020"`

In `sections` object all sections of the presentation are described:
```json
"sectionName": {
    "title": "Human readable section name",
    "slides": []
}
```
- `sectionName` - service name of section, will be in `presentation.json`
- `title` - human readable section name, which also be used in menu generation
- `slides` - array with slide objects

In `slides` object slides that nested in respective section are described:
```json
{
    "customID": "video",
    "content": {
        "popups": 2,
        "tabs": 3
    },
    "slideDesc": "Slide description for stats"
}
```
- `customID` - if used, this value will be inserted in slide name instead of ordered number
- `content` - if used, you should set `popups` and/or `tabs` count
- `slideDesc` - slide description for stats

Also you can set number of slides to be generated instead of detailed description of each slide:
```json
"sectionName": {
    "title": "Human readable section name",
    "slides": 3
}
```
In this case 3 slides will be generated. Slide description for stats in these slide will be empty in `presentation.json`.
### Structure of slidesInsert.json
You should use this file when you need to add some new slides to existing presentation.

Structure of this file is fully identical to `slidesCreate.json`, but there is one diference - `generateMenu` property in `commonConfig` object will be ignored.

After performing `gulp insert` task data for `presentation.json` for new slides will be in `./copy-paste-torture` folder. And yes, you will need to go there and painfully copy-paste all data manually =/