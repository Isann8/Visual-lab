// =====================================
// VISUAL LAB - EXPOSURE SIMULATOR
// =====================================

const isoInput = document.getElementById("iso");
const apertureInput = document.getElementById("aperture");
const shutterInput = document.getElementById("shutter");

const isoValue = document.getElementById("isoValue");
const apertureValue = document.getElementById("apertureValue");
const shutterValue = document.getElementById("shutterValue");

const previewISO = document.getElementById("previewISO");
const previewAperture = document.getElementById("previewAperture");
const previewShutter = document.getElementById("previewShutter");

const previewImage = document.getElementById("previewImage");
const exposureValue = document.getElementById("exposureValue");
const photographyTip = document.getElementById("photographyTip");

const resetButton = document.getElementById("resetButton");

function updateSimulator() {
    const iso = Number(isoInput.value);
    const aperture = Number(apertureInput.value);
    const shutter = Number(shutterInput.value);

    isoValue.textContent = iso;

    apertureValue.textContent =
        `f/${aperture.toFixed(1)}`;

    shutterValue.textContent =
        shutter === 1 ? "1 s" : `1/${shutter} s`;

    previewISO.textContent = `ISO ${iso}`;

    previewAperture.textContent =
        `f/${aperture.toFixed(1)}`;

    previewShutter.textContent =
        shutter === 1 ? "1 s" : `1/${shutter} s`;

    // Exposure approximation relative to the default settings.
    const ev = Math.log2(
        (aperture * aperture * shutter * 100) /
        (iso * 2.8 * 2.8 * 250)
    );

    exposureValue.textContent =
        `${ev > 0 ? "+" : ""}${ev.toFixed(1)} EV`;

    const brightness = Math.max(
        0.2,
        Math.min(2.0, Math.pow(2, -ev))
    );

    const noise = Math.max(
        0,
        Math.min(0.3, (iso - 100) / 12000)
    );

    const blur = Math.max(
        0,
        Math.min(2, (aperture - 1.4) / 10)
    );

    previewImage.style.filter =
        `brightness(${brightness}) ` +
        `contrast(${1 - noise * 0.25}) ` +
        `blur(${blur}px)`;

    updateTip(iso, aperture, shutter);
}

function updateTip(iso, aperture, shutter) {
    let tip = "";

    if (iso >= 1600) {
        tip =
            "ISO tinggi membantu dalam kondisi gelap, " +
            "tetapi dapat meningkatkan noise pada foto.";
    } else if (aperture <= 2.0) {
        tip =
            "Aperture lebar (angka f kecil) memasukkan " +
            "lebih banyak cahaya dan dapat menghasilkan " +
            "background blur yang kuat.";
    } else if (shutter <= 30) {
        tip =
            "Shutter lambat memasukkan lebih banyak cahaya, " +
            "tetapi gerakan bisa tampak blur.";
    } else if (shutter >= 500) {
        tip =
            "Shutter cepat membantu membekukan gerakan, " +
            "tetapi membutuhkan cahaya yang cukup.";
    } else if (aperture >= 8) {
        tip =
            "Aperture sempit (angka f besar) mengurangi " +
            "cahaya dan umumnya memperluas depth of field.";
    } else {
        tip =
            "Coba ubah satu pengaturan pada satu waktu. " +
            "Perhatikan bagaimana perubahan exposure " +
            "memengaruhi gambar.";
    }

    photographyTip.textContent = tip;
}

[isoInput, apertureInput, shutterInput].forEach(input => {
    input.addEventListener("input", updateSimulator);
});

resetButton.addEventListener("click", () => {
    isoInput.value = 100;
    apertureInput.value = 2.8;
    shutterInput.value = 250;

    updateSimulator();
});

updateSimulator();


// =====================================
// VISUAL LAB - PHOTOGRAPHY QUIZ
// =====================================

const questions = [
    {
        question:
            "Which setting controls the camera sensor's sensitivity to light?",

        answers: [
            "Aperture",
            "ISO",
            "Shutter Speed"
        ],

        correct: 1,

        explanation:
            "Correct! ISO controls the sensor's sensitivity setting. " +
            "Higher ISO can help in low light but may introduce more noise."
    },

    {
        question:
            "What happens when you use a wider aperture, such as f/1.8?",

        answers: [
            "Less light enters the lens",
            "More light enters the lens",
            "The shutter automatically becomes slower"
        ],

        correct: 1,

        explanation:
            "Correct! A wider aperture lets in more light and can create " +
            "a shallower depth of field."
    },

    {
        question:
            "Which shutter speed is generally better for freezing fast motion?",

        answers: [
            "1 second",
            "1/30 second",
            "1/1000 second"
        ],

        correct: 2,

        explanation:
            "Correct! A fast shutter speed reduces motion blur, " +
            "provided there is enough light."
    }
];

const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const quizFeedback = document.getElementById("quizFeedback");
const nextQuestion = document.getElementById("nextQuestion");

let currentQuestion = 0;
let score = 0;
let answered = false;

function renderQuestion() {
    const question = questions[currentQuestion];

    answered = false;

    questionNumber.textContent =
        `QUESTION ${String(currentQuestion + 1).padStart(2, "0")} / 03`;

    questionText.textContent = question.question;

    quizFeedback.textContent = "";

    nextQuestion.hidden = true;

    answerOptions.replaceChildren();

    question.answers.forEach((answer, index) => {
        const button = document.createElement("button");

        button.type = "button";

        button.textContent =
            `${String.fromCharCode(65 + index)}. ${answer}`;

        button.addEventListener("click", () => {
            selectAnswer(index);
        });

        answerOptions.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    if (answered) return;

    answered = true;

    const question = questions[currentQuestion];

    const buttons =
        answerOptions.querySelectorAll("button");

    buttons.forEach((button, index) => {
        button.disabled = true;

        if (index === question.correct) {
            button.classList.add("correct");
        }

        if (
            index === selectedIndex &&
            selectedIndex !== question.correct
        ) {
            button.classList.add("incorrect");
        }
    });

    if (selectedIndex === question.correct) {
        score++;
        quizFeedback.textContent = question.explanation;
    } else {
        quizFeedback.textContent =
            `Not quite. ${question.explanation}`;
    }

    nextQuestion.hidden = false;

    nextQuestion.textContent =
        currentQuestion === questions.length - 1
            ? "See My Results →"
            : "Next Question →";
}

nextQuestion.addEventListener("click", () => {
    currentQuestion++;

    if (currentQuestion < questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    questionNumber.textContent = "QUIZ COMPLETED";

    questionText.textContent =
        `You scored ${score} out of ${questions.length}!`;

    answerOptions.replaceChildren();

    quizFeedback.textContent =
        score === questions.length
            ? "Excellent! You understand the basics of exposure."
            : "Keep practicing! Experiment with the simulator and try again.";

    nextQuestion.hidden = false;

    nextQuestion.textContent = "Try Again ↺";

    nextQuestion.onclick = () => {
        currentQuestion = 0;
        score = 0;

        nextQuestion.onclick = null;

        renderQuestion();
    };
}

renderQuestion();