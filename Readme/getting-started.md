# Getting started

## Creating a cat project from template

In order to create a new project from a template use the init switch with catcli

```bash
catcli --init [<template name>] 
```

The template projects are located under `src/modules/project/init/projects` , if ommited the templated used will be cat.

## Creating your first project using cat template

1. In a terminal console navigate to folder test/init-example
2. Enter `catcli --init`
3. You will be prompt to enter the following data


	Enter the project name:  
	Enter your project application path:  
	Enter CAT server's host name:  (localhost)
	Enter CAT server's port:  (8089)
	Enter CAT server's protocol:  (http)


* In project name write *Foo*
* In application path write <cat root folder>/test/init-example/app

For the rest of the questions press enter, note that if ommited the default that will be used is mentioned between the parentesis.
A new folder cat-project should be created under init-example.

4. Navigate to folder /test/init-example/cat-project, and type 
```bash
catcli -isj```
in order to scan the scraps and convert them to tests.

5. Type
```bash
catcli --task server.start
```

in order to start the server.
6. Open a browser and navigate to http://localhost:8089, you should see the example page.
7. If you want to run the example in a mobile device use the catrunner with the following configuration (should be in the testRunConfig.json file)

```json

{
    "run": {
        "devices": [
            {
                "type": "android",
                "id": "all",
                "runner": {
                    "name": "apk",
                    "options": {"path" :"./lib/resources"}
                }
            }
        ]
    },
    "runningEnvironment": {
        "type": "local",
        "host": "",
        "authtoken": ""
    },
    "catproject": {
        "cathome": <the cat project root folder>,
        "projectPath": "<the cat project root folder>/test/init-example/cat-project"
    }
}

```
You can also add your browser to catrunner configuration if you want to run simultaneously the browser and your device, add the following to the devices section

```json

 {
	"type": "localpc",
	"id": "all",
	"runner": {
		"name": "Chrome",
		"options": {"path": "%LOCALAPPDATA%\\Google\\Chrome\\Application"}
	}
}
```

