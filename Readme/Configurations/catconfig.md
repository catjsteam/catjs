The *cat.json* file defines additional configuration for cat project run.
Below is an explanation of the configuration properties


###type
The name of the project *will be changed to name*

###ip
The ip of the server where assertions are sent to

###port
The port of the server where assertions are sent to

###tests
An array with the details of the tests to be run in the following format:

```javascript
"tests": [{"name": "catSenchaText"}, {"name": "catSenchaBtn"}] 
```

You can also define testsets in the following way

```javascript
"units" : [{"name": "unit1", "tests": [{"name": "catSenchaText1"}, {"name": "catSenchaBtn1"}]},
    { "name": "unit2", "tests": [{"name": "catSenchaText2"}, {"name": "catSenchaBtn2"}]}]
```
and then

```javascript
"tests":  [{"name": "catSenchaText2"}, {"name": "unit1"}, {"name": "unit2"}]
```


###run-mode
* _all_ - run all tests (`tests` property is ignored)
* _test-manager_ - Run the tests according to `tests` property

###test-failure-timeout
The number of the timeout in seconds to wait for an assertion response, if the timeout occurs all the tests that did not run will be failed.
Set timeout to 0 to avoid the timeout.

example:

```javascript
{
    "type": "sencha-project",
    "ip": "10.0.0.1",
    "port": "8080",
    "tests": [{"name": "catSenchaText"}, {"name": "catSenchaBtn"}],
    "run-mode": "test-manager",
    "test-failure-timeout": 30
}

```
