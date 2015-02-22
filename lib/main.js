var pageMod     = require("sdk/page-mod");
var contextMenu = require("sdk/context-menu");
var ss          = require("sdk/simple-storage");
var self        = require("sdk/self");

var mainMenu    = require("menuitems");

if(!ss.storage.options){
    ss.storage.options={fleuron:'❧',
                        cmdKey:{name:'Ctrl+Shift+/',code:191},
                        defaultBrackets:{code:['<code>','</code>'], equation:['<eq>','</eq>']},
                        mathInline:false};
}

var fleuron='❧';
/* adds context menu items to style specific text */
contextMenu.Item( makeWrapContext('code','<code>','</code>') );
contextMenu.Item( makeWrapContext('equation','<eq>','</eq>') );
contextMenu.Item( makeWrapContext('italicize','*','*') );
contextMenu.Item( makeWrapContext('bold','**','**') );

function makeWrapContext(name, startBracket, endBracket){
    return {
        label: name,
        context: [contextMenu.SelectorContext("div._1rt, div._552h"), contextMenu.SelectionContext()],
        contentScript: 'self.on("click", function (node, data) {' +
            '  var elem=node.firstChild;'+
            '  var text=elem.value;' +
            '  text=text.substr(0, elem.selectionStart+1)+"'+startBracket+'"+'+
            '       text.substr(elem.selectionStart+1, elem.selectionEnd-elem.selectionStart-1)+'+
            '       "'+endBracket+'"+text.substr(elem.selectionEnd);'+
            '  elem.value=text;' +
            '});',
        accessKey: name[0]
    };
}

/* puts customized javscript on page. It's kind of a lot of java script, but it's good */
pageMod.PageMod({
    include: "*.facebook.com",
    contentScriptFile: [self.data.url("highlight.min.js"),
                        self.data.url("katex.min.js"),
                        self.data.url("markdown.min.js"),
                        self.data.url("facebookAddon.js")],
    contentStyleFile: [self.data.url("highlight.min.css"), self.data.url("katex.min.css")],
    onAttach: startListening
    
});

/*send some data to the contentScript facebookAddon.js*/
function startListening(worker){
    worker.port.on('startingAddonJS', function(v) {
        worker.port.emit('setValues',{fleuron    : ss.storage.options.fleuron,
                                      cmdKeyCode : ss.storage.options.cmdKey.code,
                                      mathInline : ss.storage.options.mathInline});
  });
}

/* Make Menu Item to change Options */
var menuitem = mainMenu.Menuitem({
    id: "clickme",
    menuid: "menu_ToolsPopup",
    label: "Communicator Settings",
    onCommand: function () {
        console.log("clicked");
    },
    insertbefore: "menu_pageInfo"
});