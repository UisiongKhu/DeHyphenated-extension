const getUrlBySheetName = (sheetName, range) => {
    return `https://sheets.googleapis.com/v4/spreadsheets/${credentials.spreadsheetID}/values/${sheetName}${(range !== undefined) ? range : '!A2:E3000'}?key=${credentials.apiKey}`;
};
const credentials = {
    "apiKey": "AIzaSyCCL9z1lfY5EgfW_UJWm5VCSxbEGt9KFSA",
    "spreadsheetID": "1Ikut1aP_cVV04Ui4WCnBsNg0cLJQOoDS60BUGrcUcw8"
};
const sheetNames = {
    mainList: 'Main List',
    division: 'Administration Division Name List (TK)',
    road: 'Road Name List (R)',
    street: 'Street Name List (RK)',
    mountain: 'Mountain Name List (S)',
    river: 'River, Dam Name List (CK, CL)',
    //tourismSpot: 'Tourism Spot Name List (KK)',
    amount: 'Sheet Data Amount List'
};
const loadText = {
    loading: ' (Tng teh tha̍k...)',
    checkingUpdate: ' (Kiám cha ap tia̍t)',
    updating: ' (Tng teh ap tia̍t)',
    loaded: ' (Tha̍k hó sè ah)'
};
const labelText = {
    mainList: 'Default Chu liāu',
    division: 'Hêng chèng khu miâ',
    road: 'Lō͘ miâ',
    street: 'Ke miâ',
    mountain: 'Soaⁿ miâ',
    river: 'Khe, chúi lī siat si miâ',
};
const $featureCheckBoxs = {
    updateWhenLoad: document.getElementById('UpdateWhenLoad'),
};
const $checkBoxs = {
    mainList: document.getElementById('MainList'),
    selectAll: document.getElementById('SelectAll'),
    division: document.getElementById('Division'),
    mountain: document.getElementById('Mountain'),
    road: document.getElementById('Road'),
    street: document.getElementById('Street'),
    river: document.getElementById('River'),
};
const $checkBoxsArr = [
    $checkBoxs.division,
    $checkBoxs.mountain,
    $checkBoxs.river,
    $checkBoxs.road,
    $checkBoxs.street,
].filter(Boolean);
const $buttons = {
    // Feature
    clearLocalData: document.getElementById('btn-clear'),
};
const $labels = {
    // Feature
    updateWhenLoad: document.getElementById('cb-save'),
    // Data
    mainList: document.getElementById('cbl1'),
    selectAll: document.getElementById('cbl2'),
    division: document.getElementById('cbl3'),
    mountain: document.getElementById('cbl4'),
    road: document.getElementById('cbl5'),
    street: document.getElementById('cbl6'),
    river: document.getElementById('cbl7'),
};
const $debugContainer = document.getElementById('debugContainer');
var Feature = {
    updateWhenLoad: false,
};
/* Load data and save it by Web Storage API  */
async function getSheetData(sheetName, labelKey) {
    $labels[labelKey].textContent = labelText[labelKey] + loadText.loading;
    var data = await fetch(getUrlBySheetName(sheetName)).then(res => res.json()).then(data => { return data; });
    if (data.values) {
        $labels[labelKey].textContent = labelText[labelKey] + loadText.loaded;
        await chrome.storage.local.set({ [sheetName]: data });
    }
    else
        throw Error('Lia̍h bô chu liāu, chhiáⁿ kiám cha kám ū chiap tio̍h bāng lō͘.');
}
/* Check if data in storage by Web Storage API */
async function updateDataAmount(sheetName, labelKey) {
    if (labelKey)
        $labels[labelKey].textContent = labelText[labelKey] + loadText.checkingUpdate;
    const res = await chrome.storage.local.get(sheetNames.amount);
    const saveAmountObj = res[sheetNames.amount];
    var data = await fetch(getUrlBySheetName(sheetNames.amount, '!A2:B100')).then(res => res.json()).then(data => { return data; });
    var row = [];
    var num = 0;
    var obj = {};
    for (var i = 0; i < data.values.length; i++) {
        //type rowType = [string,string];
        row = data.values[i]; // as rowType;
        obj[row[0]] = Number(row[1]);
    }
    ;
    if (saveAmountObj === undefined || saveAmountObj == null || Object.keys(saveAmountObj).length === 0) {
        await chrome.storage.local.set({ [sheetNames.amount]: data });
    }
    else {
        /* Compare the saved data amount of each sheet to find out is there has any difference */
        var savedKeys = Object.keys(saveAmountObj);
        if (sheetName === undefined) {
            for (var i = 0; i < savedKeys.length; i++) {
                if (saveAmountObj[savedKeys[i]] !== obj[savedKeys[i]]) {
                    saveAmountObj[savedKeys[i]] = obj[savedKeys[i]];
                }
            }
        }
        else {
            if (saveAmountObj[sheetName] !== obj[sheetName]) {
                saveAmountObj[sheetName] = obj[sheetName];
                if (labelKey)
                    $labels[labelKey].textContent = labelText[labelKey] + loadText.updating;
                await updateSheetData(sheetName);
            }
        }
        await chrome.storage.local.set({ [sheetNames.amount]: saveAmountObj });
    }
    if (labelKey)
        $labels[labelKey].textContent = labelText[labelKey] + loadText.loaded;
}
async function updateSheetData(sheetName) {
    var data = await fetch(getUrlBySheetName(sheetName)).then(res => res.json()).then(data => { return data; });
    await chrome.storage.local.set({ [sheetName]: data });
}
/* Check if all the sheets loaded */
function updateSelectAllDisabled() {
    const allEnabled = $checkBoxsArr.every(checkbox => !checkbox.disabled);
    if ($checkBoxs.selectAll) {
        if (allEnabled) {
            $checkBoxs.selectAll.disabled = false;
        }
    }
}
function updateSelectAllWhenCheckboxsChanged() {
    const allChecked = $checkBoxsArr.every(checkbox => checkbox.checked);
    const oneUnchecked = !allChecked;
    if ($checkBoxs.selectAll) {
        if (oneUnchecked) {
            $checkBoxs.selectAll.checked = false;
        }
        if (allChecked) {
            $checkBoxs.selectAll.checked = true;
        }
    }
}
const selectAllObserver = new MutationObserver(function (mutationsList, observer) {
    var disabledMutationOccurredFlag = false;
    var checkedMutationOccurredFlag = false;
    for (const mutation of mutationsList) {
        const target = mutation.target;
        if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'disabled') {
                disabledMutationOccurredFlag = true;
            }
        }
    }
    if (disabledMutationOccurredFlag) {
        updateSelectAllDisabled();
    }
});
const selectAllObserverConfig = {
    attributes: true,
    attributeFilter: ['disabled'],
    attributeOldValue: true,
};
/* Event Listeners for every check box */
// Feature
$featureCheckBoxs.updateWhenLoad.addEventListener('input', async (e) => {
    const target = e.target;
    if (target.checked) {
        await chrome.storage.local.set({ updateWhenLoad: true });
        Feature.updateWhenLoad = true;
    }
    else {
        await chrome.storage.local.set({ updateWhenLoad: false });
        Feature.updateWhenLoad = false;
    }
});
$buttons.clearLocalData.addEventListener('click', async (e) => {
    e.preventDefault(); // Chó͘ tòng chhi̍h á ê default hêng ûi.
    const target = e.target;
    await chrome.storage.local.clear();
    $featureCheckBoxs.updateWhenLoad.checked = false;
});
// Data
$checkBoxs.mainList.addEventListener('input', async (e) => {
    const target = e.target;
    $labels.mainList.textContent = labelText.mainList;
    if (target.checked) {
        /* Check if there's data in storage */
        const res = await chrome.storage.local.get(sheetNames.mainList);
        const data = res[sheetNames.mainList];
        if (data === null || data === undefined) {
            await getSheetData(sheetNames.mainList, 'mainList');
        }
        else {
            /* Check if the data is up-to-date, if not then it'll update sheet data */
            if (Feature.updateWhenLoad)
                await updateDataAmount(sheetNames.mainList, 'mainList');
            else
                $labels.mainList.textContent = $labels.mainList.textContent + loadText.loaded;
        }
    }
    await chrome.storage.local.set({ mainList: true });
});
$checkBoxs.selectAll.addEventListener('input', async (e) => {
    const target = e.target;
    const triggerEvent = new Event('input');
    if (target.checked) {
        $checkBoxs.selectAll.disabled = true;
        $checkBoxs.division.checked = true;
        $checkBoxs.division.dispatchEvent(triggerEvent);
        $checkBoxs.mountain.checked = true;
        $checkBoxs.mountain.dispatchEvent(triggerEvent);
        $checkBoxs.river.checked = true;
        $checkBoxs.river.dispatchEvent(triggerEvent);
        $checkBoxs.road.checked = true;
        $checkBoxs.road.dispatchEvent(triggerEvent);
        $checkBoxs.street.checked = true;
        $checkBoxs.street.dispatchEvent(triggerEvent);
        await chrome.storage.local.set({ selectAll: true });
    }
    else {
        $checkBoxs.division.checked = false;
        $checkBoxs.division.dispatchEvent(triggerEvent);
        $checkBoxs.mountain.checked = false;
        $checkBoxs.mountain.dispatchEvent(triggerEvent);
        $checkBoxs.river.checked = false;
        $checkBoxs.river.dispatchEvent(triggerEvent);
        $checkBoxs.road.checked = false;
        $checkBoxs.road.dispatchEvent(triggerEvent);
        $checkBoxs.street.checked = false;
        $checkBoxs.street.dispatchEvent(triggerEvent);
        await chrome.storage.local.set({ selectAll: false });
    }
});
// Setting event listener for every checkbox
Object.keys($checkBoxs).forEach(key => {
    const checkbox = $checkBoxs[key];
    const label = $labels[key];
    const sheetname = sheetNames[key];
    if (key !== 'mainList' && key !== 'selectAll') {
        checkbox.addEventListener('input', async (e) => {
            const target = e.target;
            label.textContent = labelText[key];
            if (target.checked) {
                checkbox.disabled = true;
                const res = await chrome.storage.local.get(sheetname);
                const data = res[sheetname];
                /* Check if there's data in storage */
                if (data === null || data === undefined) {
                    await getSheetData(sheetname, key);
                }
                else {
                    /* Check if the data is up-to-date, if not then it'll update sheet data */
                    if (Feature.updateWhenLoad)
                        await updateDataAmount(sheetname, key);
                    else
                        label.textContent = labelText[key] + loadText.loaded;
                }
                checkbox.disabled = false;
                await chrome.storage.local.set({ [key]: true });
            }
            else {
                label.textContent = labelText[key];
                await chrome.storage.local.remove(key);
            }
            updateSelectAllWhenCheckboxsChanged();
        });
    }
});
const loadSavedData = async () => {
    // Load settings in the local storage
    const res = await chrome.storage.local.get('updateWhenLoad');
    const data = res['updateWhenLoad'];
    console.log(`DEBUG: ${res['updateWhenLoad']}`);
    Feature.updateWhenLoad = data;
    if (Feature.updateWhenLoad === true) {
        $featureCheckBoxs.updateWhenLoad.checked = true;
    }
    else {
        $featureCheckBoxs.updateWhenLoad.checked = false;
    }
    for (const key of Object.keys($checkBoxs)) {
        const checkbox = $checkBoxs[key];
        const defaultEvent = new Event('input');
        if (key !== 'mainList') {
            const res = await chrome.storage.local.get(key).catch(e => { console.log(e.message); });
            const data = res[key];
            checkbox.checked = data;
            checkbox.dispatchEvent(defaultEvent);
        }
    }
};
const init = async () => {
    $checkBoxs.mainList.disabled = true;
    $checkBoxs.mainList.checked = true;
    $labels.mainList.textContent = labelText.mainList;
    const defaultEvent = new Event('input');
    $checkBoxs.mainList.dispatchEvent(defaultEvent);
    Object.keys($checkBoxs).forEach(key => {
        selectAllObserver.observe($checkBoxs[key], selectAllObserverConfig);
    });
    await loadSavedData();
    await updateDataAmount();
};
init();
export {};
