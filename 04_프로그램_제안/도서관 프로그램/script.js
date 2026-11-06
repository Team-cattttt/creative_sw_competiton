const apiKey = '1a23acb4b0e96482db1d20341c03bff1517402bfb1db5e0e1f083eb50a254783'; // 여기에 발급받은 API 키를 입력하세요
const stories = [];
const qas = [];

function fetchBookByTheme() {
    const theme = document.getElementById('story-theme').value.trim();
    if (!theme) return alert("주제를 선택하세요.");

    const url = `https://www.data4library.kr/api/srchDtlList?authKey=${apiKey}&keyword=${encodeURIComponent(theme)}&format=json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // 데이터가 없거나 예상치 못한 형식일 때 처리
            if (data.response && data.response.docs && data.response.docs.length > 0) {
                let foundBook = null;

                // 주제 단어가 책 제목이나 요약에 포함되어 있는지 확인
                for (const doc of data.response.docs) {
                    const title = doc.book.bookname || '';
                    const summary = doc.book.bookSummary || '';

                    // 일부만 일치해도 해당 도서로 간주하도록 변경
                    if (title.includes(theme) || summary.includes(theme)) {
                        foundBook = doc.book;
                        break;
                    }
                }

                if (foundBook) {
                    const coverUrl = foundBook.bookImageURL || '';
                    const summary = foundBook.bookSummary || '요약 정보가 없습니다.';

                    document.getElementById('book-cover').src = coverUrl;
                    document.getElementById('book-cover').style.display = coverUrl ? 'block' : 'none';
                    document.getElementById('book-summary').textContent = summary;
                } else {
                    alert("관련 도서를 찾을 수 없습니다.");
                    document.getElementById('book-cover').style.display = 'none';
                    document.getElementById('book-summary').textContent = '';
                }
            } else {
                alert("관련 도서를 찾을 수 없습니다.");
                document.getElementById('book-cover').style.display = 'none';
                document.getElementById('book-summary').textContent = '';
            }
        })
        .catch(error => console.error('Error fetching book data:', error));
}

// 이야기 로드 함수
function loadStories() {
    const storyList = document.getElementById('story-list');
    storyList.innerHTML = ''; // 기존 이야기들을 지웁니다
    stories.forEach(story => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.innerHTML = `
            <h3>${story.title} (${story.ageGroup})</h3>
            <p>${story.content}</p>
            <h4>추천 도서: ${story.bookTitle}</h4>
            <img src="${story.bookCover}" alt="책 표지">
            <p>${story.bookSummary}</p>
        `;
        storyList.appendChild(storyItem);
    });
}

// Q&A 로드 함수
function loadQAs() {
    const qaList = document.getElementById('qa-list');
    qaList.innerHTML = ''; // 기존 Q&A들을 지웁니다
    qas.forEach((qa, index) => {
        const qaItem = document.createElement('div');
        qaItem.className = 'qa-item';
        qaItem.innerHTML = `
            <h4>${qa.title}</h4>
            <p><strong>질문:</strong> ${qa.question}</p>
            <p><strong>${qa.ageGroup}에게:</strong> ${qa.ageGroup}</p>
            <textarea id="answer-${index}" placeholder="답변을 작성하세요..."></textarea>
            <button onclick="submitAnswer(${index})">답변하기</button>
            <div id="answers-${index}">
                ${qa.answers.map(answer => `<p>${answer}</p>`).join('')}
            </div>
        `;
        qaList.appendChild(qaItem);
    });
}

// Q&A 폼 제출 이벤트 리스너
document.getElementById('qa-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('qa-title').value;
    const question = document.getElementById('qa-question').value;
    const ageGroup = document.getElementById('qa-age-group').value;
    
    const newQA = {
        title,
        question,
        ageGroup,
        answers: [] // 초기에는 답변이 없음
    };
    
    qas.push(newQA);
    loadQAs();
    
    document.getElementById('qa-form').reset();
});

// 답변 제출 함수
function submitAnswer(index) {
    const answer = document.getElementById(`answer-${index}`).value;
    if (answer) {
        qas[index].answers.push(answer);
        loadQAs();
    } else {
        alert("답변을 입력하세요.");
    }
}

// 초기 Q&A 로드
window.onload = function() {
    loadQAs();
};
