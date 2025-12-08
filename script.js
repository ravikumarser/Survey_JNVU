// Configuration
// REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFLRNtzwEVmrTpoKmP1aKMcgCalRKHATKUD-ribBGeJLvz_F57NuUT0dyeuO5K1MLR/exec';

// Fallback config for initial load/demo if API fails or URL not set
const FALLBACK_CONFIG = [
    {
        id: 'S1',
        title: 'Greeting & Identification',
        text: "Hello, Friend! Ready for the upcoming event? Before we dive in, what's your full name?",
        type: 'text',
        required: true,
        next: 'S2'
    },
    {
        id: 'S2',
        title: 'The RSVP',
        text: "Awesome. Can we count you in for the big day?",
        type: 'choice',
        options: ['Yes', 'No'],
        next: {
            'Yes': 'S3',
            'No': 'S6'
        }
    },
    {
        id: 'S3',
        title: 'Details - Guests',
        text: "Fantastic! How many extra guests (if any) will you be bringing?",
        type: 'number',
        next: 'S4'
    },
    {
        id: 'S4',
        title: 'Details - Meal',
        text: "Got it. For your main meal, what's your preference?",
        type: 'choice',
        options: ['Chicken', 'Veg', 'Vegan'],
        next: 'S5'
    },
    {
        id: 'S5',
        title: 'Final Fun Question',
        text: "Last thing! Tell us one fun fact or a favorite memory about the host!",
        type: 'text',
        next: 'S6'
    },
    {
        id: 'S6',
        title: 'Thank You & Submit',
        text: "You're All Set! Thank you for the RSVP. We can't wait to see you!",
        type: 'end'
    }
];

// State
let questions = [];
let currentQuestionId = null;
let answers = {};
let isSubmitting = false;

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const inputArea = document.getElementById('input-area');

// Initialize
async function init() {
    showTypingIndicator();

    try {
        // Try to fetch config from backend
        // Note: This might fail due to CORS if not deployed correctly or if using 'exec' endpoint without proper setup
        // For this demo, we'll use fallback if fetch fails or if URL is placeholder
        if (APPS_SCRIPT_URL.includes('PLACEHOLDER')) {
            throw new Error('Using placeholder URL');
        }

        const response = await fetch(APPS_SCRIPT_URL);
        questions = await response.json();
    } catch (e) {
        console.log('Using fallback config:', e);
        questions = FALLBACK_CONFIG;
    }

    removeTypingIndicator();
    startConversation();
}

function startConversation() {
    // Find first question (usually S1)
    const firstQ = questions.find(q => q.id === 'S1') || questions[0];
    askQuestion(firstQ.id);
}

function askQuestion(id) {
    currentQuestionId = id;
    const question = questions.find(q => q.id === id);

    if (!question) return;

    // Add bot message
    addMessage(question.text, 'bot');

    // Render input based on type
    renderInput(question);

    // Scroll to bottom
    scrollToBottom();

    // If it's the end, submit data
    if (question.type === 'end') {
        submitData();
    }
}

function renderInput(question) {
    inputArea.innerHTML = '';

    if (question.type === 'end') return;

    if (question.type === 'choice') {
        const container = document.createElement('div');
        container.className = 'choice-container';

        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = option;
            btn.onclick = () => handleAnswer(option);
            container.appendChild(btn);
        });

        inputArea.appendChild(container);
    } else {
        const group = document.createElement('div');
        group.className = 'input-group';

        const input = document.createElement('input');
        input.type = question.type === 'number' ? 'number' : 'text';
        input.placeholder = 'Type your answer...';
        input.onkeypress = (e) => {
            if (e.key === 'Enter') handleAnswer(input.value);
        };

        const btn = document.createElement('button');
        btn.className = 'send-btn';
        btn.innerHTML = '<span>Submit</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>';
        btn.onclick = () => handleAnswer(input.value);

        group.appendChild(input);
        group.appendChild(btn);
        inputArea.appendChild(group);

        // Auto focus
        setTimeout(() => input.focus(), 100);
    }
}

function handleAnswer(value) {
    if (!value && value !== 0) return; // Basic validation

    const question = questions.find(q => q.id === currentQuestionId);

    // Save answer
    answers[currentQuestionId] = value;

    // Add user message
    addMessage(value, 'user');

    // Determine next question
    let nextId = question.next;
    if (typeof nextId === 'object') {
        nextId = nextId[value] || Object.values(nextId)[0]; // Fallback if exact match not found
    }

    // Clear input
    inputArea.innerHTML = '';

    // Delay slightly for natural feel
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        if (nextId) {
            askQuestion(nextId);
        }
    }, 600);
}

async function submitData() {
    if (isSubmitting) return;
    isSubmitting = true;

    // If using placeholder, just show success
    if (APPS_SCRIPT_URL.includes('PLACEHOLDER')) {
        console.log('Mock submission:', answers);
        return;
    }

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(answers)
        });
        // Since no-cors returns opaque response, we assume success if no error thrown
        console.log('Submitted successfully');
    } catch (e) {
        console.error('Submission error:', e);
        addMessage("There was a small issue saving your RSVP, but don't worry, we'll note it down manually!", 'bot');
    }
}

// UI Helpers
function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function showTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Start
init();
