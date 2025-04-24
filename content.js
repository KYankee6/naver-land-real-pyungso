(function() {
    console.log('네이버 부동산 실면적 정렬 확장 프로그램이 로드되었습니다.');

    // 디버깅용 로그 함수
    function log(message) {
        console.log(`[실면적정렬] ${message}`);
    }

    // 기존 네이버 UI에 "실면적순" 옵션 추가 함수
    function addRealAreaSortOption() {
        // 이미 추가되었는지 확인
        if (document.querySelector('.real-area-sort-option')) {
            return;
        }

        try {
            // 랭킹순, 최신순, 가격순, 면적순이 있는 상단 정렬 필터 찾기
            let sortingArea = document.querySelector('.sorting');

            if (!sortingArea) {
                log('정렬 영역을 찾을 수 없습니다.');
                return;
            }

            // "면적순" 버튼 찾기 - 현재 사이트에서는 <a> 태그로 구현됨
            const areaButtons = Array.from(sortingArea.querySelectorAll('a')).filter(
                link => link.textContent.includes('면적순')
            );

            if (areaButtons.length === 0) {
                log('"면적순" 버튼을 찾을 수 없습니다.');
                return;
            }

            const areaButton = areaButtons[0];
            log('"면적순" 버튼을 찾았습니다.');

            // "실면적순" 버튼 생성 - <a> 태그 사용
            const realAreaButton = document.createElement('a');
            realAreaButton.className = areaButton.className + ' real-area-sort-option';
            realAreaButton.textContent = '실면적순';
            realAreaButton.href = 'javascript:void(0);';
            realAreaButton.role = 'button';
            realAreaButton.style.marginLeft = '8px';

            // "면적순" 버튼 다음에 삽입
            areaButton.parentNode.insertBefore(realAreaButton, areaButton.nextSibling);

            // 클릭 이벤트 추가
            realAreaButton.addEventListener('click', function() {
                // 클릭 시 버튼 활성화 스타일 적용
                const buttons = sortingArea.querySelectorAll('a[role="button"]');
                buttons.forEach(btn => {
                    btn.classList.remove('is-active');
                    btn.setAttribute('aria-pressed', 'false');
                });

                realAreaButton.classList.add('is-active');
                realAreaButton.setAttribute('aria-pressed', 'true');

                // 실면적 서브 정렬 옵션(넓은순/좁은순) 표시
                showRealAreaSubOptions();

                // 기본적으로 넓은 면적순으로 정렬
                sortByActualArea('desc');
            });

            log('"실면적순" 버튼을 성공적으로 추가했습니다.');
        } catch (error) {
            log(`실면적순 옵션 추가 중 오류: ${error.message}`);
        }
    }

    // 실면적 서브 정렬 옵션(넓은순/좁은순) 표시 함수
    function showRealAreaSubOptions() {
        try {
            // 기존 서브 옵션 컨테이너 찾기 - 네이버 부동산에 맞게 수정
            const sortingArea = document.querySelector('.sorting');
            if (!sortingArea) return;

            // 이미 존재하는 서브 옵션 제거
            const existingSubOptions = document.querySelector('.real-area-sub-options');
            if (existingSubOptions) {
                existingSubOptions.remove();
            }

            // 서브 옵션 컨테이너 생성
            const subOptionsContainer = document.createElement('div');
            subOptionsContainer.className = 'real-area-sub-options';
            subOptionsContainer.style.marginTop = '10px';
            subOptionsContainer.style.display = 'flex';
            subOptionsContainer.style.alignItems = 'center';
            subOptionsContainer.style.padding = '5px 10px';
            subOptionsContainer.style.backgroundColor = '#f5f5f5';
            subOptionsContainer.style.borderRadius = '4px';

            // 넓은순 옵션
            const wideOption = document.createElement('a');
            wideOption.className = 'real-area-wide-option is-active';
            wideOption.textContent = '넓은면적순';
            wideOption.href = 'javascript:void(0);';
            wideOption.style.marginRight = '10px';
            wideOption.style.cursor = 'pointer';
            wideOption.style.color = '#03c75a';
            wideOption.style.fontWeight = 'bold';

            // 구분선
            const separator = document.createElement('span');
            separator.textContent = '|';
            separator.style.marginRight = '10px';
            separator.style.color = '#ccc';

            // 좁은순 옵션
            const narrowOption = document.createElement('a');
            narrowOption.className = 'real-area-narrow-option';
            narrowOption.textContent = '좁은면적순';
            narrowOption.href = 'javascript:void(0);';
            narrowOption.style.cursor = 'pointer';

            // 클릭 이벤트 추가
            wideOption.addEventListener('click', function() {
                wideOption.classList.add('is-active');
                wideOption.style.color = '#03c75a';
                wideOption.style.fontWeight = 'bold';

                narrowOption.classList.remove('is-active');
                narrowOption.style.color = '';
                narrowOption.style.fontWeight = '';

                sortByActualArea('desc');
            });

            narrowOption.addEventListener('click', function() {
                narrowOption.classList.add('is-active');
                narrowOption.style.color = '#03c75a';
                narrowOption.style.fontWeight = 'bold';

                wideOption.classList.remove('is-active');
                wideOption.style.color = '';
                wideOption.style.fontWeight = '';

                sortByActualArea('asc');
            });

            // 옵션들 추가
            subOptionsContainer.appendChild(wideOption);
            subOptionsContainer.appendChild(separator);
            subOptionsContainer.appendChild(narrowOption);

            // DOM에 추가 - 정렬 영역 아래에 삽입
            sortingArea.parentNode.insertBefore(subOptionsContainer, sortingArea.nextSibling);

            log('실면적 서브 정렬 옵션을 성공적으로 추가했습니다.');
        } catch (error) {
            log(`서브 옵션 추가 중 오류: ${error.message}`);
        }
    }

    // 실면적 기준 정렬 함수
    function sortByActualArea(order = 'desc') {
        try {
            log(`실면적 ${order === 'desc' ? '넓은' : '좁은'}순 정렬 시작...`);

            // 상태 표시기 생성
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'real-area-sort-status';
            statusIndicator.style.position = 'fixed';
            statusIndicator.style.top = '80px';
            statusIndicator.style.left = '50%';
            statusIndicator.style.transform = 'translateX(-50%)';
            statusIndicator.style.backgroundColor = '#03c75a';
            statusIndicator.style.color = 'white';
            statusIndicator.style.padding = '10px 20px';
            statusIndicator.style.borderRadius = '5px';
            statusIndicator.style.zIndex = '9999';
            statusIndicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            statusIndicator.style.fontWeight = 'bold';
            statusIndicator.textContent = '실면적 정렬 중...';
            document.body.appendChild(statusIndicator);

            // 네이버 부동산의 실제 매물 목록 컨테이너 찾기
            const listContainer = document.querySelector('.item_list, .articles');

            if (!listContainer) {
                statusIndicator.textContent = '매물 목록을 찾을 수 없습니다';
                setTimeout(() => statusIndicator.remove(), 3000);
                return;
            }

            // 매물 아이템 선택 - 네이버 부동산 구조에 맞게 수정
            const items = Array.from(listContainer.querySelectorAll('.item, .article'));

            if (items.length === 0) {
                statusIndicator.textContent = '매물을 찾을 수 없습니다';
                setTimeout(() => statusIndicator.remove(), 3000);
                return;
            }

            log(`총 ${items.length}개의 매물을 찾았습니다.`);

            // 실면적 추출 및 정렬 - .spec 클래스를 사용하도록 수정
            const itemsWithArea = items.map(item => {
                // 실제 페이지 구조에 맞게 수정: .spec 클래스에서 면적 추출
                const specElement = item.querySelector('.spec');
                let actualArea = 0;

                if (specElement) {
                    const specText = specElement.textContent;
                    log(`매물 spec 텍스트: ${specText}`);

                    // "/숫자m²" 패턴 찾기 (예: "/97m²")
                    const patternWithSlash = /\/(\d+(?:\.\d+)?)m²/;
                    let match = specText.match(patternWithSlash);

                    if (match && match[1]) {
                        actualArea = parseFloat(match[1]);
                        log(`슬래시 패턴으로 면적 추출: ${actualArea}`);
                    } else {
                        // 첫 번째 숫자 추출 시도 (예: "97")
                        const patternFirstNumber = /^(\d+(?:\.\d+)?)/;
                        match = specText.match(patternFirstNumber);

                        if (match && match[1]) {
                            actualArea = parseFloat(match[1]);
                            log(`첫 번째 숫자 패턴으로 면적 추출: ${actualArea}`);
                        } else {
                            // 일반 숫자 + m² 패턴 (예: "97m²")
                            const patternGeneralArea = /(\d+(?:\.\d+)?)m²/;
                            match = specText.match(patternGeneralArea);

                            if (match && match[1]) {
                                actualArea = parseFloat(match[1]);
                                log(`일반 면적 패턴으로 면적 추출: ${actualArea}`);
                            }
                        }
                    }
                }

                return {
                    element: item,
                    actualArea: actualArea
                };
            });

            // 실면적으로 정렬
            if (order === 'desc') {
                // 넓은순
                itemsWithArea.sort((a, b) => b.actualArea - a.actualArea);
            } else {
                // 좁은순
                itemsWithArea.sort((a, b) => a.actualArea - b.actualArea);
            }

            log('매물 정렬이 완료되었습니다.');

            // 매물 목록 컨테이너 비우기
            listContainer.innerHTML = '';

            // DOM에 정렬된 매물 추가
            itemsWithArea.forEach(item => {
                listContainer.appendChild(item.element);
            });

            // 실면적 강조 표시
            itemsWithArea.forEach(item => {
                if (item.actualArea > 0) {
                    // 면적 정보 요소 찾기
                    const specElement = item.element.querySelector('.spec');

                    if (specElement) {
                        // 기존 강조 표시 제거
                        const existingHighlight = item.element.querySelector('.real-area-highlight');
                        if (existingHighlight) {
                            existingHighlight.remove();
                        }

                        // 강조 표시 생성
                        const highlight = document.createElement('span');
                        highlight.className = 'real-area-highlight';
                        highlight.style.backgroundColor = '#03c75a';
                        highlight.style.color = 'white';
                        highlight.style.padding = '2px 4px';
                        highlight.style.borderRadius = '3px';
                        highlight.style.marginLeft = '5px';
                        highlight.style.fontSize = '12px';
                        highlight.textContent = `실면적: ${item.actualArea}㎡`;

                        // 상위 컨테이너에 추가 (spec 요소 바로 옆에 추가)
                        specElement.parentNode.insertBefore(highlight, specElement.nextSibling);
                    }
                }
            });

            // 최종 상태 업데이트 및 제거
            statusIndicator.textContent = `실면적 ${order === 'desc' ? '넓은' : '좁은'}순 정렬 완료 (${items.length}개)`;
            setTimeout(() => statusIndicator.remove(), 3000);

        } catch (error) {
            log(`정렬 프로세스 에러: ${error.message}`);
            // 에러 발생 시 상태 표시기 업데이트 및 제거
            const statusIndicator = document.querySelector('.real-area-sort-status');
            if (statusIndicator) {
                statusIndicator.textContent = '실면적 정렬 중 오류가 발생했습니다';
                setTimeout(() => statusIndicator.remove(), 3000);
            }
        }
    }

    // 초기화 및 이벤트 설정
    function initialize() {
        log('확장 프로그램 초기화 중...');

        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                addRealAreaSortOption();
            });
        } else {
            addRealAreaSortOption();
        }

        // URL 변경 감지 (네이버 부동산은 SPA 방식)
        let lastUrl = location.href;

        const observer = new MutationObserver(() => {
            if (lastUrl !== location.href) {
                lastUrl = location.href;
                log('URL 변경 감지: ' + lastUrl);

                // URL 변경 시 일정 시간 후 다시 버튼 추가 시도
                setTimeout(() => {
                    addRealAreaSortOption();
                }, 1500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 주기적으로 버튼 추가 시도 (동적 로딩 대응)
        setInterval(() => {
            if (document.querySelector('.sorting') && !document.querySelector('.real-area-sort-option')) {
                log('주기적 확인: 정렬 버튼이 없어 다시 추가합니다.');
                addRealAreaSortOption();
            }
        }, 3000);

        log('초기화가 완료되었습니다.');
    }

    // 실행
    initialize();
})();