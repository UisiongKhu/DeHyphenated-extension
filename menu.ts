import DeHyphenated from "./tools/DeHyphenated.js";

const sheetNames = {
    mainList: 'Main List',
    division: 'Administration Division Name List (TK)',
    road: 'Road Name List (R)',
    //street: 'Street Name List(RK)',
    mountain: 'Mountain Name List (S)',
    river: 'River, Dam Name List (CK, CL)',
    //tourismSpot: 'Tourism Spot Name List (KK)',
    amount: 'Sheet Data Amount List'
}

var sheets : Array<Object> = [];
const dataSelectedFlags = {
    mainList: false,
    division: false,
    mountain: false,
    river: false,
    road: false,
}

async function getData(key: string): Promise<any | undefined>{
    try{
        const result = await chrome.storage.local.get(key);
        const value = result[key];
        if(value !== null && value !== undefined ){
            try {
                console.log(`DEBUG: getSheet('${key}'), value=${value}`);
                return value; // 返回解析後的物件
            } catch (parseError) {
                console.error(`ERROR: getSheet('${key}') JSON.parse failed for string value:`, value, parseError);
                return undefined; // 解析失敗回傳 undefined
            } 
        } else {
            // 值為 undefined (key 不存在)
            console.log(`DEBUG: getSheet('${key}'): Key not found or value is undefined.`);
            return undefined;
        }
        return result;
    }catch(e){
        // 確保錯誤被捕捉並印出，而不只是吞噬
        console.error(`ERROR: getSheet('${key}') caught an error:`, e);
        return undefined;
    }
}


async function init(){
    // Get selected options from local storage, if selected then load it.
    for(const key of Object.keys(dataSelectedFlags)){
        var option = (dataSelectedFlags as any)[key];
        var sheetname = (sheetNames as any)[key];
        console.log(`DEBUG: init(), key=${key}, option=${option}, sheetname=${sheetname}`);
        if((await getData(key).catch(e=>{console.log(e.message)}))){
            option = true;
            sheets.push(await getData(sheetname));
            console.log(`DEBUG: ${await getData(sheetname).catch(e=>{console.log(e.message)})}`);
        }
    }
    Object.keys(dataSelectedFlags).forEach(async key => {
        
    });
}

const replaceSelectedText = async (newText: string, copy?: boolean) => {
    const selection = window.getSelection();
    if(selection && selection.rangeCount> 0){
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(newText);
        range.insertNode(textNode);

        selection.removeAllRanges;
        //selection.addRange(range);
        await navigator.clipboard.writeText(newText).catch(e=>{console.log(e.message)});
    }
}

chrome.runtime.onInstalled.addListener(async ()=>{
    await init();
    chrome.contextMenus.create({
        id: "DeHyphenatedMenu",
        title: "DeHyphenated Khì Liân Oe̍h 棄連劃",
        contexts: ["selection","page"]
    });
    chrome.contextMenus.create({
        id: "ConvertBtn",
        parentId: "DeHyphenatedMenu",
        title: "Choán ōaⁿ só͘ kéng ê bûn jī",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "ConvertAndCopyBtn",
        parentId: "DeHyphenatedMenu",
        title: "Choán ōaⁿ kiam khá pih só͘ kéng ê bûn jī",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "GoWebAppBtn",
        parentId: "DeHyphenatedMenu",
        title: "Khì DeHyphenated ê bāng chām",
        contexts: ["selection","page"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    const selectedText = info.selectionText; // Get selection text
    const processedText = await DeHyphenated(selectedText!, sheets, 'tiam', 'langphang');
    //const processedText = DeHyphenated(selectedText!,sheets,'tiam','langphang');
    if(info.menuItemId === 'ConvertBtn'){
        try{
            if(selectedText && tab && tab.id){
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: replaceSelectedText,
                    args: [processedText]
                });
            }else{
                console.log('Lí bô kéng tio̍h jī');
            }
        }catch(e: any){
            console.log(e.message());
        }
    }else if(info.menuItemId === 'ConvertAndCopyBtn'){
        try{
            if(selectedText && tab && tab.id){
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: replaceSelectedText,
                    args: [processedText]
                });
            }else{
                alert('Lí bô kéng tio̍h jī');
            }
        }catch(e: any){
            alert(e.message());
        }
    }else if(info.menuItemId === 'GoWebAppBtn'){
        await chrome.tabs.create({url: 'https://uisiongkhu.github.io/DeHyphenated/'}).catch(e=>{console.log(e.message)});
    }
});


export {};