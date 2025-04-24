
// popup.js
document.getElementById('sortByActualArea').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: sortByActualArea
    });
});

function sortByActualArea() {
// 메인 함수 실행
    console.log("네이버 부동산 실면적 정렬 시작...");
    sortPropertyByActualArea();
}

