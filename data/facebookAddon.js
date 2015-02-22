/* Get configurable variables from add-on script*/
var fleuron, cmdKeyCode, mathInline, trie;
var markdownParser = 0;
self.port.on("setValues", function (data) {
    fleuron = data.fleuron;
    cmdKeyCode = data.cmdKeyCode;
    mathInline = data.mathInline;
    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.shiftKey && event.keyCode == cmdKeyCode) {
            var t = document.activeElement;
            if (t.tagName == "TEXTAREA") {
                rewriteListener(t);
                var pos = t.selectionStart;
                t.value += "\n" + fleuron;
                t.setSelectionRange(pos, pos);
            }
        }
    });
    trie = makeDecisionTrie([
        ["$$", "$$", parseMathInline],
        ["\\[", "\\]", parseMath],
        ["\\(", "\\)", parseMathInline],
        ["&lt;eq&gt;", "&lt;/eq&gt;", parseMathDefault],
        ["```", "```", parseCode],
        ["&lt;code&gt;", "&lt;/code&gt;", parseCode]
        
    ]);
    checkPageLoop();
});
self.port.emit("startingAddonJS", null);

function rewriteListener(t) {
    if (t.className.indexOf("communicator") == -1) {
        t.className += " communicator";
        var f = t.onkeydown;
        t.onkeydown = null;
        t.addEventListener("keydown", function (event) {
            if (event.keyCode == 9) {
                var pos = t.selectionStart;
                t.value = t.value.substr(0, pos) + '\t' + t.value.substr(pos);
                t.setSelectionRange(pos + 1, pos + 1);
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        });
        t.addEventListener("keydown", f);
    }
}

function checkPageLoop() {
    if (document.documentElement.innerHTML.indexOf(fleuron) > 0) {
        findBlockLoop();
    } else {
        setTimeout(checkPageLoop, 1000);
        return false;
    }
}

function findBlockLoop() {
    findBlocks();
    setTimeout(findBlockLoop, 1000);
}

function findBlocks() {
    var chatWindows = document.getElementsByClassName("fbNubFlyoutBodyContent");
    for (var i = 0; i < chatWindows.length; i++) {
        var spans = chatWindows[i].getElementsByTagName("span");
        for (var j = 0; j < spans.length; j++) {
            if (spans[j].childElementCount === 0) {
                var s = spans[j].innerHTML;
                if (s[s.length - 1] == fleuron) {
                    process(spans[j]);
                }
            }
        }
    }
    var messageWindow = document.getElementById("webMessengerRecentMessages");
    if (messageWindow) {
        var messages = messageWindow.getElementsByTagName("p");
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].childElementCount === 0) {
                var s = messages[i].innerHTML;
                if (s[s.length - 1] == fleuron) {
                    process(messages[i]);
                }
            }
        }
    }
}

function addChildTo(parentNode, childType, childContent) {
    child = document.createElement(childType);
    child.appendChild(document.createTextNode(childContent));
    parentNode.appendChild(child);
    return child;
}

function sCompare(bigString, littleString, index) {
    for (var i = 0; i < littleString.length; i++) {
        if (bigString[index++] != littleString[i]) return false;
    }
    return true;
}

function process(elem) {
    //Initialize markdownParser if necessary
    if (markdownParser === 0) {
        markdownParser = new Markdown.Converter();
    }
    //get rid of fleuron and newline
    s = elem.innerHTML.substring(0, elem.innerHTML.length - 2);
    elem.innerHTML = "";
    
    //reads through s
    look(elem, s, trie, parseMarkdown);
}

function makeDecisionTrie(altFuncs) {
    var trie = {};
    for (i = 0; i < altFuncs.length; i++) {
        insertIntoDecisionTrie(trie, altFuncs[i]);
    }
    return trie;
}
//data is an array with values [trie key, ending key, trigger function]
function insertIntoDecisionTrie(trie, data) {
    var tag = data[0];
    if (tag[0] in trie) {
        var childTrie = trie[tag[0]];
        if ('control' in childTrie) {
            insertIntoDecisionTrie(childTrie, childTrie.control);
            delete childTrie.control;
        }
        insertIntoDecisionTrie(childTrie, [tag.substr(1), data[1], data[2]]);
    } else {
        trie[tag[0]] = {
            control: [tag.substr(1), data[1], data[2]]
        };
    }
}

function checkString(string, pos, smallString) {

    for (var i = 0; i < smallString.length; i++)
    if (string[pos + i] != smallString[i]) return false;

    return true;

}

function checkTrie(trie, string, pos, elem, defaultParser) {
    var trieIter = trie;
    while (string[pos] in trieIter) {
        trieIter = trieIter[string[pos]];
        pos++;
        if ('control' in trieIter) {
            var c = trieIter.control;
            var upper = 0;
            if (checkString(string, pos, c[0]) && (upper = string.substr(pos + c[0].length).indexOf(c[1])) >= 0) {
                return [upper + pos + c[0].length + c[1].length, c[2], string.substr(pos + c[0].length, upper)];
            }

        }
    }
    return [-1];
}


function look(elem, s, trie, defaultFunc) {
    var p = 0;
    for (var i = 0; i < s.length; i++) {
        var x = checkTrie(trie, s, i);
        if (x[0] != -1) {
            if (i - p > 0) defaultFunc(elem, s.substr(p, i));
            x[1](elem, x[2]);
            i = p = x[0];
            i--;
        }
    }
    if (s.length - p > 0) defaultFunc(elem, s.substr(p));
}

function parseMarkdown(elem, string) {
    addChildTo(elem, "span", "").innerHTML = markdownParser.makeHtml(string);
}

function parseCode(elem, string) {
    hljs.highlightBlock(addChildTo(elem, "code", string));
}

function parseMath(elem, string) {
    var eqElement = addChildTo(elem, "span", string);
    try {
        katex.render("\\displaystyle {" + string + "}", eqElement);
    } catch (err) {
        console.log(err);
        console.log("katex couldn't render " + string);
    }
}

function parseMathInline(elem, string) {
    var eqElement = addChildTo(elem, "span", string);
    try {
        katex.render(string, eqElement);
    } catch (err) {
        console.log(err);
        console.log("katex couldn't render " + string);
    }
}

function parseMathDefault(elem, string) {
    var eqElement = addChildTo(elem, "span", string);
    if (!mathInline) {
        string = "\\displaystyle {" + string + "}";
    }
    try {
        katex.render(string, eqElement);
    } catch (err) {
        console.log(err);
        console.log("katex couldn't render " + string);
    }
}