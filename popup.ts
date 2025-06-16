const getUrlBySheetName = (sheetName : string, range?: string) => {
    return `https://sheets.googleapis.com/v4/spreadsheets/${credentials.spreadsheetID}/values/${sheetName}${(range !== undefined)?range:'!A2:E3000'}?key=${credentials.apiKey}`;
}
const credentials = {
    "apiKey" : "AIzaSyCCL9z1lfY5EgfW_UJWm5VCSxbEGt9KFSA",
    "spreadsheetID" : "1Ikut1aP_cVV04Ui4WCnBsNg0cLJQOoDS60BUGrcUcw8"
}
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
const loadText = {
    loading: ' (Tng teh tha̍k...)',
    checkingUpdate: ' (Kiám cha ap tia̍t)',
    updating: ' (Tng teh ap tia̍t)',
    loaded: ' (Tha̍k hó sè ah)'
}

const $featureCheckBoxs = {
    updateWhenLoad: document.getElementById('UpdateWhenLoad') as HTMLInputElement,
}

const $checkBoxs = {
    mainList: document.getElementById('MainList') as HTMLInputElement,
    selectAll: document.getElementById('SelectAll') as HTMLInputElement,
    division: document.getElementById('Division') as HTMLInputElement,
    mountain: document.getElementById('Mountain') as HTMLInputElement,
    road: document.getElementById('Road') as HTMLInputElement,
    river: document.getElementById('River') as HTMLInputElement,
};

const $checkBoxsArr = [
    $checkBoxs.division,
    $checkBoxs.mountain,
    $checkBoxs.river,
    $checkBoxs.road, 
].filter(Boolean) as HTMLInputElement[];

const $buttons = {
    // Feature
    clearLocalData: document.getElementById('btn-clear') as HTMLButtonElement,
};

const $labels = {
    // Feature
    updateWhenLoad: document.getElementById('cb-save') as HTMLLabelElement,
    // Data
    mainList: document.getElementById('cbl1') as HTMLLabelElement,
    selectAll: document.getElementById('cbl2') as HTMLLabelElement,
    division: document.getElementById('cbl3') as HTMLLabelElement,
    mountain: document.getElementById('cbl4') as HTMLLabelElement,
    road: document.getElementById('cbl5') as HTMLLabelElement,
    river: document.getElementById('cbl6') as HTMLLabelElement,
};

const $debugContainer = document.getElementById('debugContainer') as HTMLTextAreaElement;

var Feature = {
    updateWhenLoad: false,
}

/* Load data and save it by Web Storage API  */
async function getSheetData(sheetName: string, labelObj: HTMLLabelElement){
    labelObj.textContent = labelObj.textContent + loadText.loading;
    var data = await fetch(getUrlBySheetName(sheetName)).then(res=>res.json()).then(data=>{return data;});
    if(data.values){
        labelObj.textContent = labelObj.textContent.replace(loadText.loading, loadText.loaded);
        await chrome.storage.local.set({[sheetName]: data});
    }else throw Error('Lia̍h bô chu liāu, chhiáⁿ kiám cha kám ū chiap tio̍h bāng lō͘.');
}
/* Check if data in storage by Web Storage API */
async function updateDataAmount(sheetName?: string, labelObj?: HTMLLabelElement){
    if(labelObj) labelObj.textContent = labelObj.textContent + loadText.checkingUpdate;
    const res = await chrome.storage.local.get(sheetNames.amount);
    const saveAmountObj = res[sheetNames.amount];
    var data = await fetch(getUrlBySheetName(sheetNames.amount, '!A2:B100')).then(res=>res.json()).then(data=>{return data;});
    var row = [];
    var num = 0;
    var obj : {[key:string]: number} = {};
    for(var i=0;i<data.values.length;i++){
        //type rowType = [string,string];
        row = data.values[i];// as rowType;
        obj[row[0]] = Number(row[1]);
    };

    if(saveAmountObj === undefined || saveAmountObj == null || Object.keys(saveAmountObj).length === 0){
        await chrome.storage.local.set({[sheetNames.amount]: data});
    }else{
        /* Compare the saved data amount of each sheet to find out is there has any difference */
        var savedKeys = Object.keys(saveAmountObj);
        if(sheetName === undefined){
            for(var i=0;i<savedKeys.length;i++){
                if(saveAmountObj[savedKeys[i]] !== obj[savedKeys[i]]){
                    saveAmountObj[savedKeys[i]] = obj[savedKeys[i]];
                }
            }
        }else{
            if(saveAmountObj[sheetName] !== obj[sheetName]){
                saveAmountObj[sheetName] = obj[sheetName];
                await updateSheetData(sheetName);
            }
        }
        await chrome.storage.local.set({[sheetNames.amount]: saveAmountObj});
    }
    
    if(labelObj) labelObj.textContent = labelObj.textContent!.replace(loadText.checkingUpdate, loadText.loaded);
}
async function updateSheetData(sheetName: string){
    var data = await fetch(getUrlBySheetName(sheetName)).then(res=>res.json()).then(data=>{return data;});
    await chrome.storage.local.set({[sheetName]: data});
}
/* Check if all the sheets loaded */
function updateSelectAllDisabled(){
    const allEnabled = $checkBoxsArr.every(checkbox => !checkbox.disabled);
    if($checkBoxs.selectAll){
        if(allEnabled){
            $checkBoxs.selectAll.disabled = false;
        }
    }
}
function updateSelectAllWhenCheckboxsChanged(){
    const allChecked = $checkBoxsArr.every(checkbox => checkbox.checked);
    const oneUnchecked = !allChecked;
    if($checkBoxs.selectAll){
        if(oneUnchecked){
            $checkBoxs.selectAll.checked = false;
        }
        if(allChecked){
            $checkBoxs.selectAll.checked = true;
        }
    }
}
const selectAllObserver = new MutationObserver(function(mutationsList,observer){
    var disabledMutationOccurredFlag = false;
    var checkedMutationOccurredFlag = false;
    for(const mutation of mutationsList){
        const target = mutation.target as HTMLInputElement;
        if(mutation.type === 'attributes'){
            if(mutation.attributeName === 'disabled'){
                disabledMutationOccurredFlag = true;
            }
        }
    }
    if(disabledMutationOccurredFlag){
        updateSelectAllDisabled();
    }
});
const selectAllObserverConfig = {
    attributes: true,
    attributeFilter: ['disabled'],
    attributeOldValue: true,
}

/* Event Listeners for every check box */
// Feature
$featureCheckBoxs.updateWhenLoad.addEventListener('input', async (e:Event) => {
    const target = e.target as HTMLInputElement;
    if(target.checked){
        await chrome.storage.local.set({updateWhenLoad: true});
        Feature.updateWhenLoad = true;
    }else{
        await chrome.storage.local.set({updateWhenLoad: false});
        Feature.updateWhenLoad = false;
    }
});
$buttons.clearLocalData.addEventListener('click', async (e: Event) => {
    e.preventDefault(); // Chó͘ tòng chhi̍h á ê default hêng ûi.
    const target = e.target as HTMLButtonElement;
    await chrome.storage.local.clear();
    $featureCheckBoxs.updateWhenLoad.checked = false;
})
// Data
$checkBoxs.mainList.addEventListener('input', async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if(target.checked){
        /* Check if there's data in storage */
        const res = await chrome.storage.local.get(sheetNames.mainList);
        const data = res[sheetNames.mainList];
        if(data === null || data === undefined){
            await getSheetData(sheetNames.mainList, $labels.mainList);
        }else{
            /* Check if the data is up-to-date, if not then it'll update sheet data */
            if(Feature.updateWhenLoad) await updateDataAmount(sheetNames.mainList, $labels.mainList);
            else $labels.mainList.textContent = $labels.mainList.textContent + loadText.loaded;
        }
    }
    await chrome.storage.local.set({mainList: true});
});
$checkBoxs.selectAll.addEventListener('input',async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const triggerEvent = new Event('input');
    if(target.checked){
        $checkBoxs.selectAll.disabled = true;
        $checkBoxs.division.checked = true;
        $checkBoxs.division.dispatchEvent(triggerEvent);
        $checkBoxs.mountain.checked = true;
        $checkBoxs.mountain.dispatchEvent(triggerEvent);
        $checkBoxs.river.checked = true;
        $checkBoxs.river.dispatchEvent(triggerEvent);
        $checkBoxs.road.checked = true;
        $checkBoxs.road.dispatchEvent(triggerEvent);
        await chrome.storage.local.set({selectAll: true});
    }else{
        $checkBoxs.division.checked = false;
        $checkBoxs.division.dispatchEvent(triggerEvent);
        $checkBoxs.mountain.checked = false;
        $checkBoxs.mountain.dispatchEvent(triggerEvent);
        $checkBoxs.river.checked = false;
        $checkBoxs.river.dispatchEvent(triggerEvent);
        $checkBoxs.road.checked = false;
        $checkBoxs.road.dispatchEvent(triggerEvent);
        await chrome.storage.local.set({selectAll: false});
    }
});

// Setting event listener for every checkbox
Object.keys($checkBoxs).forEach(key => {
    const checkbox = ($checkBoxs as any)[key];
    const label = ($labels as any)[key];
    const sheetname = (sheetNames as any)[key];
    if(key !== 'mainList' && key !== 'selectAll'){
        checkbox.addEventListener('input', async (e: Event) => {
            const target = e.target as HTMLInputElement;
            while(label.textContent?.includes(loadText.loaded)){
                label.textContent = label.textContent!.replace(loadText.loaded,'');
            }
            if(target.checked){
                checkbox.disabled = true;

                const res = await chrome.storage.local.get(sheetname);
                const data = res[sheetname];
                /* Check if there's data in storage */
                if(data === null || data === undefined){
                    await getSheetData(sheetname, label);
                }else{
                    /* Check if the data is up-to-date, if not then it'll update sheet data */
                    if(Feature.updateWhenLoad) await updateDataAmount(sheetname, label);
                    else label.textContent = label.textContent + loadText.loaded;
                }
                checkbox.disabled = false;
                await chrome.storage.local.set({[key]: true});
            }else{
                while(label.textContent?.includes(loadText.loaded)){
                    label.textContent = label.textContent!.replace(loadText.loaded,'');
                }
                label.textContent = label.textContent!.replace(loadText.loading,'');
                await chrome.storage.local.remove(key);
            }
            updateSelectAllWhenCheckboxsChanged();
        })
    }
})

const loadSavedData = async () => {
    // Load settings in the local storage
    const res = await chrome.storage.local.get('updateWhenLoad');
    const data = res['updateWhenLoad'];
    console.log(`DEBUG: ${res['updateWhenLoad']}`);
    Feature.updateWhenLoad = data;
    if(Feature.updateWhenLoad===true){
        $featureCheckBoxs.updateWhenLoad.checked = true;
    }else{
        await chrome.storage.local.set({updateWhenLoad: true});
        $featureCheckBoxs.updateWhenLoad.checked = true;
    }

    for(const key of Object.keys($checkBoxs) as Array<keyof typeof $checkBoxs>){
        const checkbox = ($checkBoxs as any)[key];
        const defaultEvent = new Event('input');
        if(key !=='mainList'){
            const res = await chrome.storage.local.get(key).catch(e=>{console.log(e.message)});
            const data = (res as any)[key];
            checkbox.checked = data;
        }
    }
}

const init = async () => {
    $checkBoxs.mainList.disabled = true;
    $checkBoxs.mainList.checked = true;
    const defaultEvent = new Event('input');
    $checkBoxs.mainList.dispatchEvent(defaultEvent);
    await loadSavedData();
    await updateDataAmount();
    Object.keys($checkBoxs).forEach(key => {
        selectAllObserver.observe(($checkBoxs as any)[key], selectAllObserverConfig);
    });
}

init();

export {}